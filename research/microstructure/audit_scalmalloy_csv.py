#!/usr/bin/env python3
"""Inspect verified original Scalmalloy grain-size CSV files without guessing units.
This audit does not approve a microstructure for publication in the SILM PWA.
"""
import csv
import hashlib
import io
import json
import pathlib
import urllib.parse
import urllib.request

RECORD = "https://zenodo.org/records/17085695"
FILES = {
    "57.1 J/mm3": ("EBSD - 57.1Jmm-3 Grain Sizes.csv", "64a02187e39d8ed1b765a3d599a7c5b9"),
    "116.7 J/mm3": ("EBSD - 116.7Jmm-3 Grain Sizes.csv", "108dd6cb7d4089d6500e86e76a0d7089"),
    "160 J/mm3": ("EBSD - 160Jmm-3 Grain Sizes.csv", "2f15e952a6efc71e450cff3c36fed185")
}


def download(url, file):
    req = urllib.request.Request(url, headers={"User-Agent": "SILM-EBSD-audit/1.0"})
    with urllib.request.urlopen(req, timeout=120) as response:
        total = 0
        with file.open("wb") as out:
            while True:
                part = response.read(65536)
                if not part:
                    break
                total += len(part)
                if total > 12000000:
                    raise ValueError("CSV exceeds 12 MB safety limit")
                out.write(part)


def inspect(file):
    raw = file.read_bytes()
    try:
        text = raw.decode("utf-8-sig")
        encoding = "utf-8-sig"
    except UnicodeDecodeError:
        text = raw.decode("cp1252")
        encoding = "cp1252"
    sample = text[:16000]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
        delimiter = dialect.delimiter
    except csv.Error:
        delimiter = ","
    reader = csv.reader(io.StringIO(text, newline=""), delimiter=delimiter)
    first = []
    widths = {}
    count = 0
    for row in reader:
        count += 1
        widths[str(len(row))] = widths.get(str(len(row)), 0) + 1
        if len(first) < 12:
            # Avoid unbounded strings or accidental spreadsheet formulas in output
            first.append([str(v)[:150] for v in row[:20]])
        if count > 1000000:
            raise ValueError("CSV has more than one million records")
    if not first:
        raise ValueError("Empty CSV")
    return {
        "encoding": encoding, "delimiter": repr(delimiter),
        "lineCount": count, "columnCountFrequency": widths,
        "firstRowsForSchemaReview": first,
        "quantitativeResultsComputed": False,
        "reason": "Columns and units must be confirmed from acquisition method and original paper"
    }


def main():
    out = pathlib.Path("/tmp/silm-al-ebsd-review")
    cache = pathlib.Path("/tmp/silm-al-files")
    out.mkdir(parents=True, exist_ok=True)
    cache.mkdir(parents=True, exist_ok=True)
    audit = {
        "schema": "silm.experimental-csv-schema-audit.v1",
        "source": RECORD,
        "title": "Effects of Volumetric Energy Density on the Microstructure of Additively Manufactured Scalmalloy",
        "method": "EBSD exported grain-size tables",
        "material": "Scalmalloy (Al-based alloy; composition requires source confirmation)",
        "status": "files-integrity-verified-format-under-review-not-homologated",
        "license": "not verified for individual files",
        "files": []
    }
    for condition, (filename, expected_md5) in FILES.items():
        target = cache / filename
        url = RECORD + "/files/" + urllib.parse.quote(filename) + "?download=1"
        download(url, target)
        md5 = hashlib.md5(target.read_bytes()).hexdigest()
        if md5 != expected_md5:
            raise ValueError("Incorrect checksum for " + filename)
        data = inspect(target)
        data.update({
            "processingEnergyCondition": condition,
            "file": filename,
            "sizeBytes": target.stat().st_size,
            "verifiedMD5": md5,
            "sourceFile": url
        })
        audit["files"].append(data)
    (out / "scalmalloy-csv-schema-audit.json").write_text(json.dumps(audit,ensure_ascii=False,indent=2)+"\n", encoding="utf8")
    print(json.dumps({"status": audit["status"], "files": [
        {"condition": f["processingEnergyCondition"],"md5":f["verifiedMD5"],
         "rows":f["lineCount"],"firstRows":f["firstRowsForSchemaReview"][:4]}
        for f in audit["files"]]},ensure_ascii=False))
    print("WARNING: only schema/integrity audited; no unverified measurements promoted.")


if __name__ == "__main__":
    main()
