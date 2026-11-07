#!/usr/bin/env python3
"""SILM: experimental Mg EBSD audit. No extra Python dependencies.
This script generates a REVIEW artifact; it never certifies a sample.
"""
import argparse
import collections
import datetime
import hashlib
import json
import math
import pathlib
import re
import statistics
import time
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

M = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
SOURCES = (
 ("AZ31", "AZ31_ML.xlsx", "1e67111dc62f6ff47a8d8e535a70e5cd", 2640),
 ("Mg-1Al", "Mg1Al_ML.xlsx", "8e4bb43f636939ef4f39a74fb163bb51", 1496),
)
DOI = "10.5281/zenodo.10225600"


def download(url, dest=None):
    last = None
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "SILM-data-audit/1.0", "Accept": "*/*"})
            with urllib.request.urlopen(request, timeout=90) as response:
                if dest is None:
                    return response.read(2000000)
                size = 0
                with dest.open("wb") as out:
                    while True:
                        block = response.read(65536)
                        if not block:
                            break
                        size += len(block)
                        if size > 10000000:
                            raise ValueError("Download exceeds 10 MB safeguard")
                        out.write(block)
                return b""
        except Exception as err:
            last = err
            if dest:
                dest.unlink(missing_ok=True)
            if attempt < 2:
                time.sleep(2 * (attempt + 1))
    raise RuntimeError("Download failed: " + url + " " + str(last))


def key(s):
    return re.sub("[^a-z0-9]", "", str(s or "").lower())


def excel_column(addr):
    value = 0
    for c in re.match("[A-Z]+", addr).group(0):
        value = value * 26 + ord(c) - 64
    return value - 1


def read_sheets(file):
    with zipfile.ZipFile(file) as archive:
        if sum(entry.file_size for entry in archive.infolist()) > 160000000:
            raise ValueError("Expanded workbook size exceeds safeguard")
        shared = []
        if "xl/sharedStrings.xml" in archive.namelist():
            tree = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared = ["".join(n.text or "" for n in item.iter(M + "t")) for item in tree.findall(M + "si")]
        worksheets = sorted(name for name in archive.namelist()
                            if re.fullmatch(r"xl/worksheets/sheet[0-9]+\.xml", name))
        if not worksheets:
            raise ValueError("No standard worksheet XML found")
        for filename in worksheets:
            xml = ET.fromstring(archive.read(filename))
            rows = []
            for row in xml.findall(M + "sheetData/" + M + "row"):
                cells = {}
                for cell in row.findall(M + "c"):
                    addr = cell.get("r", "")
                    if not re.match("[A-Z]+", addr):
                        continue
                    v = cell.find(M + "v")
                    typ = cell.get("t")
                    if typ == "inlineStr":
                        inline = cell.find(M + "is")
                        value = "".join(n.text or "" for n in inline.iter(M + "t")) if inline is not None else ""
                    elif v is None or v.text is None:
                        continue
                    elif typ == "s":
                        value = shared[int(v.text)]
                    elif typ == "b":
                        value = int(v.text)
                    elif typ in ("str", "e"):
                        value = v.text
                    else:
                        try:
                            value = float(v.text)
                        except ValueError:
                            value = v.text
                    cells[excel_column(addr)] = value
                if cells:
                    rows.append(cells)
            yield filename, rows


def quantile(values, p):
    x = (len(values) - 1) * p
    i = math.floor(x)
    return values[i] + (values[min(i + 1, len(values) - 1)] - values[i]) * (x - i)


def descriptive(values):
    values = sorted(values)
    if not values:
        return None
    return {name: round(number, 6) for name, number in {
        "min": values[0], "p05": quantile(values, 0.05),
        "p25": quantile(values, 0.25), "median": quantile(values, 0.5),
        "mean": statistics.fmean(values), "p75": quantile(values, 0.75),
        "p95": quantile(values, 0.95), "max": values[-1]}.items()} | {
        "n": len(values),
        "sampleSD": round(statistics.stdev(values), 6) if len(values) > 1 else None
    }


def analyze(file, material, expected):
    found = []
    sheet_info = []
    for name, rows in read_sheets(file):
        header = None
        index = None
        for i, row in enumerate(rows[:30]):
            h = {key(v): col for col, v in row.items() if isinstance(v, str)}
            if "grainsize" in h and "nearedge" in h:
                index, header = i, h
                break
        if header is None:
            sheet_info.append({"sheet": name, "recognized": False, "rows": len(rows)})
            continue
        column_names = ("grainsize", "nearedge", "neighborgrainn", "orientation", "strainlevel")
        columns = {k: header.get(k) for k in column_names}
        count = 0
        for row in rows[index + 1:]:
            if columns["grainsize"] not in row:
                continue
            count += 1
            found.append({name: row.get(col) if col is not None else None for name, col in columns.items()})
        sheet_info.append({"sheet": name, "recognized": True,
                           "headerRowIndex": index + 1, "dataRows": count, "columns": columns})
    if not found:
        raise ValueError("Grain_size and Near_edge header not found for " + material)
    selected = []
    edge_excluded = 0
    invalid = 0
    for row in found:
        try:
            edge = float(row["nearedge"])
            size = float(row["grainsize"])
            if edge == 1:
                edge_excluded += 1
            elif edge != 0 or not math.isfinite(size) or size <= 0:
                invalid += 1
            else:
                row["grainsize"] = size
                selected.append(row)
        except (ValueError, TypeError):
            invalid += 1
    neighbors = []
    for row in selected:
        try:
            n = float(row["neighborgrainn"])
            if math.isfinite(n) and n >= 0 and n.is_integer():
                neighbors.append(n)
        except (ValueError, TypeError):
            pass
    by_group = collections.defaultdict(list)
    for row in selected:
        grp = (str(row["orientation"]), str(row["strainlevel"]))
        by_group[grp].append(row["grainsize"])
    group_stats = [
        {"orientation": k[0], "strain": k[1], "ECDmicrometers": descriptive(v)}
        for k, v in sorted(by_group.items())
    ]
    return {
        "material": material, "rawCount": len(found), "expectedCount": expected,
        "expectedCountMatched": len(found) == expected,
        "excludedNearEdge": edge_excluded, "excludedInvalid": invalid,
        "retained": len(selected),
        "ECDmicrometers": descriptive([row["grainsize"] for row in selected]),
        "neighborCount": descriptive(neighbors),
        "sheets": sheet_info, "conditionGroupCount": len(by_group),
        "conditionGroups": group_stats if len(group_stats) <= 30 else None
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="/tmp/mg-scientific-audit")
    parser.add_argument("--cache", default="/tmp/mg-raw-files")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    assert key("Grain_size") == "grainsize"
    assert excel_column("AA3") == 26
    assert descriptive([2, 4, 8])["p25"] == 3
    if args.self_test:
        print("Self-test: OK")
        return
    out = pathlib.Path(args.out); out.mkdir(parents=True, exist_ok=True)
    cache = pathlib.Path(args.cache); cache.mkdir(parents=True, exist_ok=True)
    metadata = None
    try:
        metadata = json.loads(download("https://zenodo.org/api/records/10225600"))
    except Exception as err:
        print("Metadata fetch unavailable:", err)
    rights = (metadata or {}).get("metadata", {}).get("rights", [])
    if isinstance(rights, dict):
        rights = [rights]
    result = {
        "schema": "silm.experimental-microstructure-audit.v1",
        "dateUTC": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "record": "https://zenodo.org/records/10225600", "sourceDOI": DOI,
        "recordRights": rights, "metadataAPIRetrieved": metadata is not None,
        "status": "scientific-review-required-not-homologated",
        "measurement": "2D EBSD grain equivalent circle diameter before deformation, micrometers",
        "filter": "Near_edge == 0; invalid or missing ECD excluded",
        "limitations": ["No grain polygons or real micrograph in this workbook",
                        "No elemental composition or phase percentages inferred",
                        "ECD of a 2D section is not automatically ASTM E112 average grain size"],
        "datasets": [],
    }
    for material, filename, expected_hash, expected_count in SOURCES:
        file = cache / filename
        if not file.exists():
            download("https://zenodo.org/records/10225600/files/" + filename + "?download=1", file)
        calculated_hash = hashlib.md5(file.read_bytes()).hexdigest()
        if calculated_hash != expected_hash:
            raise ValueError(filename + " MD5 mismatch: " + calculated_hash)
        a = analyze(file, material, expected_count)
        a.update({"file": filename, "verifiedMD5": calculated_hash,
                  "fileSizeBytes": file.stat().st_size,
                  "downloadURL": "https://zenodo.org/records/10225600/files/" + filename})
        result["datasets"].append(a)
    (out / "magnesium-audit.json").write_text(
        json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    report = [
        "# SILM — auditoria preliminar dos dados de Mg–1Al e AZ31",
        "Fonte: https://doi.org/" + DOI, "",
        "Arquivos originais baixados com hashes verificados. Estes números exigem revisão científica;",
        "não homologam microestruturas para todo magnésio, nem definem grãos de produtos cotidianos.",
        "Licença no registro (API): " + json.dumps(rights, ensure_ascii=False), ""
    ]
    for d in result["datasets"]:
        ecd = d["ECDmicrometers"]
        report.extend([
            "## " + d["material"], "",
            "MD5 verificado: " + d["verifiedMD5"],
            "Linhas: " + str(d["rawCount"]) + "; esperado " + str(d["expectedCount"]),
            "Excluídas por borda: " + str(d["excludedNearEdge"]) + "; inválidas: " + str(d["excludedInvalid"]),
            "Retidas: " + str(d["retained"]),
            ("ECD (micrômetros): mediana " + str(ecd["median"]) + ", P25 " + str(ecd["p25"]) +
             ", P75 " + str(ecd["p75"]) + ", média " + str(ecd["mean"]) + "."),
            "Grupos orientação/deformação: " + str(d["conditionGroupCount"]), ""
        ])
    report.extend(["Limites: ECD da seção 2D não é automaticamente média ASTM E112;",
                   "o arquivo não fornece geometria espacial ou composição de cada grão."])
    (out / "magnesium-audit.md").write_text("\n".join(report) + "\n", encoding="utf-8")
    print(json.dumps({"datasets": [{k: x[k] for k in ("material","rawCount","excludedNearEdge","excludedInvalid","retained","expectedCountMatched")} for x in result["datasets"]],
                      "rights": rights}, ensure_ascii=False))
    if any(not x["expectedCountMatched"] for x in result["datasets"]):
        raise SystemExit("Row counts diverge from publication: review artifact, do not promote.")


if __name__ == "__main__":
    main()
