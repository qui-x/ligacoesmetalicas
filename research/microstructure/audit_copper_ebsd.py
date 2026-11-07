#!/usr/bin/env python3
"""SILM: auditar cobre policristalino em Oxford HDF5/EBSD.
O arquivo original nunca é publicado. Não segmentar grãos sem validar
orientações, simetria, método, licença e condições da amostra.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import math
import pathlib
import time
import urllib.request
import h5py
import numpy as np

DOI = "10.5281/zenodo.16902083"
NAME = "copper29.h5oina"
MD5 = "ffe617d5cb3d2e4ed1a5e3b7d27d6e11"
SIZE_LIMIT = 230_000_000
MAX_ITEMS = 1200

def download(url: str, target: pathlib.Path) -> dict:
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.is_file():
        digest = hashlib.md5()
        with target.open("rb") as f:
            for block in iter(lambda: f.read(1024 * 1024), b""):
                digest.update(block)
        if digest.hexdigest() == MD5:
            return {"bytes": target.stat().st_size, "md5": digest.hexdigest(), "fromCache": True}
        target.unlink()
    error = None
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": "SILM-copper-EBSD-metadata-audit/1.0",
                "Accept": "application/octet-stream,*/*",
            })
            digest = hashlib.md5()
            length = 0
            with urllib.request.urlopen(req, timeout=150) as response, target.open("wb") as output:
                while True:
                    block = response.read(1024 * 1024)
                    if not block:
                        break
                    length += len(block)
                    if length > SIZE_LIMIT:
                        raise ValueError("Limite de download de 230 MB excedido")
                    digest.update(block)
                    output.write(block)
            actual = digest.hexdigest()
            if actual != MD5:
                raise ValueError("MD5 incorreto: " + actual + " != " + MD5)
            return {"bytes": length, "md5": actual, "fromCache": False}
        except (OSError, TimeoutError, ValueError) as exc:
            error = exc
            target.unlink(missing_ok=True)
            if attempt < 2:
                time.sleep((attempt + 1) * 3)
    raise RuntimeError("Não foi possível verificar o arquivo original: " + str(error))

def clean(obj):
    """Only small HDF5 headers are serialized; never export bulk scan arrays."""
    if isinstance(obj, bytes):
        return obj.decode("utf-8", "replace")[:400]
    if isinstance(obj, (str, np.str_)):
        return str(obj)[:400]
    if isinstance(obj, (np.integer, int)):
        return int(obj)
    if isinstance(obj, (np.floating, float)):
        return float(obj) if math.isfinite(float(obj)) else None
    if isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    if isinstance(obj, (list, tuple)):
        return [clean(x) for x in obj[:15]]
    if isinstance(obj, np.ndarray):
        if obj.size > 15:
            return {"omitted": True, "shape": list(obj.shape)}
        return clean(obj.tolist())
    return str(type(obj).__name__)[:120]

def header_value(ds):
    if ds.size > 40 or ds.size * max(ds.dtype.itemsize, 1) > 3000:
        return None
    try:
        return clean(ds[()])
    except Exception:
        return None

def number(v):
    if isinstance(v, list) and len(v) == 1:
        return number(v[0])
    if isinstance(v, (float, int)) and math.isfinite(float(v)):
        return float(v)
    return None

def inspect(file: pathlib.Path, ref: dict) -> dict:
    inventory = []
    ebsd_headers = {}
    indexed = []
    with h5py.File(file, "r") as store:
        def visitor(path, node):
            if len(inventory) >= MAX_ITEMS:
                return
            item = {"path": "/" + path, "kind": "dataset" if isinstance(node, h5py.Dataset) else "group"}
            if isinstance(node, h5py.Dataset):
                item.update({"shape": list(node.shape), "dtype": str(node.dtype),
                             "compression": node.compression})
                # Header numbers and phase definitions are safe to inspect.
                if "/Header/" in path or path.endswith("/Header") or "/Phases/" in path:
                    val = header_value(node)
                    if val is not None:
                        item["headerValue"] = val
                        if "/EBSD/Header/" in path:
                            ebsd_headers[path.split("/")[-1]] = val
                if path.endswith("/EBSD/Data/Phase") or path.endswith("/Data Processing/Data/Phase"):
                    indexed.append(path)
            inventory.append(item)
        store.visititems(visitor)
        for p in indexed[:2]:
            ds = store[p]
            if ds.size > 2_000_000 or ds.ndim > 2:
                continue
            counts = np.unique(ds[()], return_counts=True)
            matching = {str(int(phase)): int(count)
                        for phase, count in zip(*counts)}
            ref.setdefault("pixelPhaseCount", {})["/" + p] = matching
        values = {k.lower().replace(" ", ""): v for k, v in ebsd_headers.items()}
        xcells, ycells = number(values.get("xcells")), number(values.get("ycells"))
        xstep, ystep = number(values.get("xstep")), number(values.get("ystep"))
        if not all(x is not None and x > 0 for x in (xcells, ycells, xstep, ystep)):
            raise ValueError("Metadados incompletos: X/Y Cells e X/Y Step positivos obrigatórios.")
        n = int(xcells * ycells)
        phase_paths = [p for p in indexed if p.endswith("/EBSD/Data/Phase")]
        if not phase_paths:
            raise ValueError("Canal de fase EBSD não encontrado: nenhuma estatística confiável.")
        ph = store[phase_paths[0]]
        if ph.size != n:
            raise ValueError("Número de pixels da fase EBSD diverge de X Cells × Y Cells.")
        ref["scan"] = {
            "xCells": int(xcells), "yCells": int(ycells),
            "xStepMicrometers": xstep, "yStepMicrometers": ystep,
            "xSpanMicrometersApprox": round((xcells - 1) * xstep, 6),
            "ySpanMicrometersApprox": round((ycells - 1) * ystep, 6),
            "pixelCount": n,
            "calibrationSource": "HDF5 Oxford /1/EBSD/Header/X Step, Y Step, X Cells, Y Cells",
            "pixelCountMatchesPhaseDataset": True,
        }
    ref["inventory"] = inventory
    ref["inventoryTruncated"] = len(inventory) >= MAX_ITEMS
    ref["techniques"] = sorted(set(
        item["path"].split("/")[2] for item in inventory
        if len(item["path"].split("/")) > 2
    ))
    return ref

def metadata_rights():
    req = urllib.request.Request("https://zenodo.org/api/records/16902083",
                                 headers={"User-Agent": "SILM-copper-EBSD-audit/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            payload = json.loads(response.read(3_000_000))
        meta = payload.get("metadata", {})
        return {"apiAvailable": True, "rightsAsReported": clean(meta.get("rights", [])),
                "accessAsReported": clean(meta.get("access", {})),
                "licenseDecision": "PENDING: confirm permitted reuse for images and derivatives"}
    except (OSError, ValueError, TimeoutError) as exc:
        return {"apiAvailable": False, "issue": str(exc)[:160],
                "licenseDecision": "PENDING: source rights not confirmed"}

def self_test():
    assert number([0.1]) == 0.1
    assert number([547]) == 547
    assert number([-1]) == -1
    assert clean(np.array([1, 2])) == [1, 2]
    assert clean(b"Copper") == "Copper"
    print("OK: leitor seguro de metadados HDF5, sem arrays pesados")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="/tmp/silm-cu-audit")
    parser.add_argument("--cache", default="/tmp/silm-cu-raw")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    self_test()
    if args.self_test:
        return
    out = pathlib.Path(args.out); out.mkdir(parents=True, exist_ok=True)
    cache = pathlib.Path(args.cache); cache.mkdir(parents=True, exist_ok=True)
    status = {
        "schema": "silm.experimental-copper-ebsd-metadata-audit.v1",
        "source": "https://doi.org/" + DOI,
        "file": NAME,
        "generatedUTC": dt.datetime.now(dt.timezone.utc).isoformat(),
        "stage": "file-integrity-and-metadata-verified; grain-segmentation-not-validated",
        "sourceKind": "pure-copper-polycrystal",
        "sampleMatchingWithEverydayApplication": False,
        "experimentalMicrostructureIntegrated": False,
        "grainBoundariesValidated": False,
        "limitations": [
            "Counts of indexed phase pixels are not percentages of the element Cu or grain fractions.",
            "The EBSD grid samples only a 2D plane of this specimen, not a 3D grain reconstruction.",
            "No grain boundaries are claimed without a validated crystal-symmetry-aware orientation segmentation.",
            "Do not publish raw HDF5 or derived micrographs before rights/attribution review."
        ]
    }
    status["licenseReview"] = metadata_rights()
    filename = cache / NAME
    status["downloadIntegrity"] = download(
        "https://zenodo.org/records/16902083/files/" + NAME + "?download=1", filename)
    inspect(filename, status)
    result = out / "copper-h5oina-audit.json"
    result.write_text(json.dumps(status, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    report = [
        "# SILM — Pré-auditoria do cobre policristalino EBSD",
        "",
        "**Fonte:** https://doi.org/" + DOI,
        "**Status:** MD5 e cabeçalho HDF5 conferidos; segmentação e licenças ainda pendentes.",
        "",
        "Arquivo: " + NAME + ", MD5 = " + status["downloadIntegrity"]["md5"],
        "Dados de grade: " + json.dumps(status["scan"], ensure_ascii=False),
        "Pixels por fase (não equivalem a teor químico): " + json.dumps(status.get("pixelPhaseCount", {})),
        "Licença: " + json.dumps(status["licenseReview"], ensure_ascii=False),
        "",
        "O arquivo não foi incluído no repositório. Esta etapa não declara grãos segmentados,",
        "tamanho ASTM, composição local nem correspondência com cabos comerciais.",
        "Para contornos quantitativos será necessário verificar orientação, simetria cúbica,",
        "critério de desorientação, pixels não indexados, bordas e referência espacial.",
    ]
    (out / "copper-h5oina-audit.md").write_text("\n".join(report) + "\n", encoding="utf-8")
    print(json.dumps({
        "integrity": status["downloadIntegrity"],
        "scan": status["scan"],
        "pixelPhaseCount": status.get("pixelPhaseCount", {}),
        "inventorySize": len(status["inventory"]),
        "licenseReview": status["licenseReview"]
    }, ensure_ascii=False))

if __name__ == "__main__":
    main()
