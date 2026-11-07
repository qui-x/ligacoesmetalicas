#!/usr/bin/env python3
"""Exploratory *spatial* sensitivity of raw Copper EBSD segmentation.

Five fixed, mutually non-overlapping 160x160 raw-map windows are examined.
Outputs only statistical aggregates, never pixels, masks, Euler angles or images.
This is NOT MTEX/TrueEBSD reconstruction nor scientific grain-size validation.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import pathlib
import statistics

import h5py
import numpy as np

SOURCE = "https://doi.org/10.5281/zenodo.16902083"
EXPECTED_MD5 = "ffe617d5cb3d2e4ed1a5e3b7d27d6e11"
ROOT = pathlib.Path(__file__).resolve().parents[2]
PREVIEW_PATH = ROOT / "research/microstructure/preview_copper_grains.py"
REFERENCE_PATH = ROOT / "research/microstructure/copper-ebsd-orientation-preview.json"


def load_preview():
    spec = importlib.util.spec_from_file_location("silm_cu_orientation", PREVIEW_PATH)
    if not spec or not spec.loader:
        raise RuntimeError("Unable to load reviewed orientation preview code")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def window_positions(grid_width: int, grid_height: int,
                     width: int = 160, height: int = 160):
    """Deterministic, separated windows for sensitivity *only* (not random sampling)."""
    if min(grid_width, grid_height, width, height) <= 0:
        raise ValueError("Grid and crop dimensions must be positive")
    if grid_width < 2 * width or grid_height < 2 * height:
        raise ValueError("Cannot select five disjoint windows on this grid")
    x_right, y_bottom = grid_width - width, grid_height - height
    return {
        "upper_left": (0, 0),
        "upper_right": (x_right, 0),
        "center": ((grid_width - width) // 2, (grid_height - height) // 2),
        "lower_left": (0, y_bottom),
        "lower_right": (x_right, y_bottom),
    }


def file_md5(path: pathlib.Path):
    digest = hashlib.md5()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(4 * 1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def summarize_window(results, x0, y0):
    out = []
    for item in results:
        ecd = item["candidateEquivalentCircleDiameterMicrometers"]
        out.append({
            "thresholdDegrees": item["thresholdDegrees"],
            "connectedRegionsAllSizesAndEdges":
                item["allConnectedCuRegionsIncludingTinyAndBorder"],
            "candidateRegionsNotOnCropBorder":
                item["candidateRegionsAtLeastFivePixelsNotTouchingCropBorder"],
            "candidateECDMedianMicrometers": ecd["median"] if ecd else None,
            "eligibleCopperNeighborPairs": item["eligibleNeighborPairs"],
            "withinThresholdNeighborPairs": item["sameRegionNeighborPairs"],
        })
    indexed = int(results[0]["indexedPixels"])
    return {
        "x0Pixel": x0,
        "y0Pixel": y0,
        "indexedCuPoints": indexed,
        "notIndexedPoints": 160 * 160 - indexed,
        "results": out,
    }


def range_summary(entries, threshold):
    rows = [next(row for row in item["results"]
                 if row["thresholdDegrees"] == threshold)
            for item in entries.values()]
    counts = [row["candidateRegionsNotOnCropBorder"] for row in rows]
    medians = [row["candidateECDMedianMicrometers"] for row in rows
               if row["candidateECDMedianMicrometers"] is not None]
    return {
        "thresholdDegrees": threshold,
        "minCandidateRegionCountAcrossWindows": min(counts),
        "maxCandidateRegionCountAcrossWindows": max(counts),
        "minWindowMedianECDMicrometers": min(medians) if medians else None,
        "maxWindowMedianECDMicrometers": max(medians) if medians else None,
        "windowsWithEligibleECD": len(medians),
        "warning": "Ranges among deliberately selected windows, not confidence intervals, "
                   "population statistics, or comparison to MTEX corrected grains.",
    }


def validate_center(rows, reference_path):
    baseline = json.loads(reference_path.read_text(encoding="utf-8"))
    center = rows["center"]
    assert center["x0Pixel"] == baseline["sample"]["x0Pixel"]
    assert center["y0Pixel"] == baseline["sample"]["y0Pixel"]
    assert center["indexedCuPoints"] == baseline["sample"]["indexedCuPixels"]
    for result in center["results"]:
        original = next(v for v in baseline["results"]
                        if v["thresholdDegrees"] == result["thresholdDegrees"])
        assert original["candidateRegions"] == result["candidateRegionsNotOnCropBorder"], (
            "Center-count regression against previously reviewed source data")
        assert abs(original["medianEquivalentCircleDiameterMicrometers"]
                   - result["candidateECDMedianMicrometers"]) < 1e-5, (
            "Center ECD regression against previously reviewed source data")


def run(source_file: pathlib.Path, width=160, height=160,
        reference_path: pathlib.Path = REFERENCE_PATH):
    if width != 160 or height != 160:
        raise ValueError("Audited report schema currently supports only 160x160 crops")
    measured = file_md5(source_file)
    if measured != EXPECTED_MD5:
        raise ValueError("Original Copper EBSD checksum mismatch: abort analysis")
    with h5py.File(source_file, "r") as f:
        head = f["/1/EBSD/Header"]
        nx = int(np.ravel(head["X Cells"][()])[0])
        ny = int(np.ravel(head["Y Cells"][()])[0])
    coords = window_positions(nx, ny, width, height)
    orientation = load_preview()
    windows = {}
    for label, (x0, y0) in coords.items():
        result = orientation.run(source_file, width=width, height=height,
                                 x0_pixel=x0, y0_pixel=y0)
        if (result["crop"]["x0Pixel"], result["crop"]["y0Pixel"]) != (x0, y0):
            raise AssertionError("Explicit crop location was not honored")
        windows[label] = summarize_window(result["results"], x0, y0)
    validate_center(windows, reference_path)
    return {
        "schema": "silm.experimental-copper-spatial-sensitivity.v1",
        "source": SOURCE,
        "specimen": "P1700",
        "sourceStage": "raw EBSD, not TrueEBSD/MTEX corrected and not BSE masked",
        "md5Verified": measured,
        "scanGridPixels": [nx, ny],
        "cropPixels": [width, height],
        "samplingDesign": "Five deterministic disjoint windows (four corners and center). "
                          "Not probabilistic or statistically representative.",
        "cropLocations": windows,
        "descriptiveAcrossWindowRanges": [
            range_summary(windows, threshold) for threshold in [5, 10, 15]
        ],
        "limitations": [
            "Cubic-orientation 4-neighbor connectivity on raw indexed Copper points only.",
            "Unindexed points are excluded; they are NOT classified as voids, secondary "
            "phases or elemental composition measurements.",
            "No EBSD-to-FSD/BSE alignment, geometric correction, TrueEBSD resampling, "
            "void masks, minPixel/alpha reconstruction or ASTM mean-grain estimation.",
            "Only the five specified windows were sampled. Range of window medians "
            "is NOT a confidence interval or an error bar for the specimen.",
            "No raw acquisition data, pixel arrays, segment masks, polygons or "
            "experimental image derivatives may be redistributed.",
        ],
        "readyToPublishMap": False,
        "quantitativeMicrostructureApproved": False,
        "rightsApprovedForImageRedistribution": False,
    }


def self_test():
    expected = {
        "upper_left": (0, 0),
        "upper_right": (340, 0),
        "center": (170, 120),
        "lower_left": (0, 240),
        "lower_right": (340, 240),
    }
    assert window_positions(500, 400) == expected
    try:
        window_positions(300, 200)
    except ValueError:
        pass
    else:
        raise AssertionError("Disjoint sampling was incorrectly allowed")
    demo = {
        "a": {"results": [{"thresholdDegrees": 10,
                           "candidateRegionsNotOnCropBorder": 2,
                           "candidateECDMedianMicrometers": 0.4}]},
        "b": {"results": [{"thresholdDegrees": 10,
                           "candidateRegionsNotOnCropBorder": 3,
                           "candidateECDMedianMicrometers": 0.7}]}
    }
    s = range_summary(demo, 10)
    assert s["maxCandidateRegionCountAcrossWindows"] == 3
    assert s["minWindowMedianECDMicrometers"] == 0.4
    assert s["maxWindowMedianECDMicrometers"] == 0.7
    print("OK: deterministic disjoint windows and descriptive-only aggregation")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=pathlib.Path)
    parser.add_argument("--output", type=pathlib.Path,
                        default=pathlib.Path("/tmp/silm-cu-audit/copper-spatial-sensitivity.json"))
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    self_test()
    if args.self_test:
        return
    if not args.input:
        parser.error("--input is required; only use original HDF5 verified from source")
    result = run(args.input)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n",
                           encoding="utf-8")
    print(json.dumps({
        "stage": result["sourceStage"],
        "windows": len(result["cropLocations"]),
        "ranges": result["descriptiveAcrossWindowRanges"],
        "dataReleased": False,
        "readyToPublishMap": False
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
