#!/usr/bin/env python3
"""SILM: exploratory cubic-symmetry-aware orientation segmentation of a Cu EBSD crop.

The results ARE NOT equivalent to the TrueEBSD+MTEX processed reconstruction.
No raw orientations, image pixels, masks, or contours are redistributed.
"""
from __future__ import annotations
import argparse
import json
import math
import pathlib
import h5py
import numpy as np
from scipy.spatial.transform import Rotation
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components

PROVENANCE = "https://doi.org/10.5281/zenodo.16902083"
SOURCE = "/1/EBSD/Data"
HEADER = "/1/EBSD/Header"
CUBIC = Rotation.create_group("O").as_quat()  # 24 proper rotational symmetries

def misorientation_deg(q_left, q_right):
    """Minimum equivalent orientation rotation angle for cubic crystal symmetry."""
    a = Rotation.from_quat(q_left)
    b = Rotation.from_quat(q_right)
    delta = (a.inv() * b).as_quat()  # relative crystal orientation
    # For R_i^-1 R_j, minimize angle against 24 proper cubic rotations.
    scalars = delta[:, 3:4] * CUBIC[None, :, 3] - delta[:, :3] @ CUBIC[:, :3].T
    best = np.clip(np.max(np.abs(scalars), axis=1), -1.0, 1.0)
    return 2.0 * np.degrees(np.arccos(best))

def quantile_summary(values):
    arr = np.sort(np.asarray(values, dtype=float))
    if arr.size == 0:
        return None
    return {name: round(float(v), 6) for name, v in {
        "n": arr.size, "median": np.quantile(arr, .5), "p25": np.quantile(arr, .25),
        "p75": np.quantile(arr, .75), "mean": arr.mean(), "min": arr[0],
        "max": arr[-1],
    }.items()}

def self_test():
    base = Rotation.from_euler("ZXZ", [[0.2, 1.1, 2.8]], degrees=False)
    b = (base * Rotation.from_quat(CUBIC[7])).as_quat()
    assert float(misorientation_deg(base.as_quat(), b)[0]) < .0001
    assert float(misorientation_deg(base.as_quat(), base.as_quat())[0]) < .0001
    assert np.abs(float(misorientation_deg(base.as_quat(), Rotation.from_euler(
        "ZXZ", [[.21, 1.1, 2.8]]).as_quat())[0])) < 10
    print("OK: quaternion/intrinsic ZXZ e 24 simetrias cúbicas verificadas.")

def run(input_file, width=160, height=160):
    with h5py.File(input_file, "r") as f:
        x_cells = int(np.ravel(f[HEADER + "/X Cells"][()])[0])
        y_cells = int(np.ravel(f[HEADER + "/Y Cells"][()])[0])
        x_step = float(np.ravel(f[HEADER + "/X Step"][()])[0])
        y_step = float(np.ravel(f[HEADER + "/Y Step"][()])[0])
        if width > x_cells or height > y_cells or width < 20 or height < 20:
            raise ValueError("Cropping exceeds EBSD map bounds or has too few pixels")
        x = f[SOURCE + "/X"][:x_cells + 1].reshape(-1)
        y = f[SOURCE + "/Y"][:x_cells + 1].reshape(-1)
        # Confirm row-major scanning before reshaping the arrays.
        if not (np.isclose(abs(x[1] - x[0]), x_step, atol=.015)
                and np.isclose(y[1], y[0], atol=.015)
                and np.isclose(x[x_cells], x[0], atol=.015)
                and np.isclose(abs(y[x_cells] - y[0]), y_step, atol=.015)):
            raise ValueError("X/Y scan ordering not compatible with simple row-major grid.")
        x0, y0 = (x_cells - width)//2, (y_cells - height)//2
        phase = f[SOURCE + "/Phase"][:].reshape(y_cells, x_cells)
        angle = f[SOURCE + "/Euler"][:].reshape(y_cells, x_cells, 3)
    sub_phase = phase[y0:y0 + height, x0:x0 + width].reshape(-1)
    sub_euler = angle[y0:y0 + height, x0:x0 + width, :].reshape(-1, 3)
    if not np.isfinite(sub_euler[sub_phase == 1]).all():
        raise ValueError("Invalid Euler measurements in indexed Cu points.")
    all_q = Rotation.from_euler("ZXZ", sub_euler, degrees=False).as_quat()
    positions = np.arange(width * height).reshape(height, width)
    u = np.concatenate([positions[:, :-1].reshape(-1), positions[:-1, :].reshape(-1)])
    v = np.concatenate([positions[:, 1:].reshape(-1), positions[1:, :].reshape(-1)])
    valid_pair = (sub_phase[u] == 1) & (sub_phase[v] == 1)
    connected_a, connected_b = u[valid_pair], v[valid_pair]
    angles = misorientation_deg(all_q[connected_a], all_q[connected_b])
    indexable = np.flatnonzero(sub_phase == 1)
    results = []
    for threshold in (5, 10, 15):
        allow = angles <= threshold
        p, q = connected_a[allow], connected_b[allow]
        adjacency = coo_matrix((np.ones(p.size, dtype=np.uint8), (p, q)),
                               shape=(width * height, width * height)).tocsr()
        n_components, raw_labels = connected_components(adjacency, directed=False)
        indexed_labels = raw_labels[indexable]
        size_by_label = np.bincount(indexed_labels, minlength=n_components)
        border = np.unique(np.concatenate([
            raw_labels[positions[0, :]], raw_labels[positions[-1, :]],
            raw_labels[positions[:, 0]], raw_labels[positions[:, -1]],
        ]))
        unique_labels = np.unique(indexed_labels)
        # Segment size in the pixel plane; ignore crop-edge regions and small islands.
        valid_grains = [(label, size_by_label[label]) for label in unique_labels
                        if size_by_label[label] >= 5 and label not in border]
        sizes = np.array([size for _, size in valid_grains], dtype=float)
        ecd = 2 * np.sqrt(sizes * x_step * y_step / math.pi)
        results.append({
            "thresholdDegrees": threshold,
            "indexedPixels": int(indexable.size),
            "eligibleNeighborPairs": int(valid_pair.sum()),
            "sameRegionNeighborPairs": int(allow.sum()),
            "allConnectedCuRegionsIncludingTinyAndBorder": int(len(unique_labels)),
            "candidateRegionsAtLeastFivePixelsNotTouchingCropBorder": len(valid_grains),
            "candidatePixelAreaSummary": quantile_summary(sizes),
            "candidateEquivalentCircleDiameterMicrometers": quantile_summary(ecd),
            "notAstM": "Not an ASTM E112 estimate. Cropped raw-EBSD connected regions only."
        })
    return {
        "schema": "silm.experimental-copper-ebsd-orientation-preview.v1",
        "source": PROVENANCE,
        "status": "RAW-EBSD-ORIENTATION-EXPLORATION-ONLY",
        "specimen": "P1700 (polycrystalline copper in power semiconductor metallization)",
        "sourceStage": "original /1/EBSD/Data Euler+Phase, NOT TrueEBSD corrected output",
        "symmetry": "24 proper cubic rotations, m-3m, space group 225",
        "eulerConvention": "intrinsic Bunge ZXZ; radians; sample frame needs separate verification",
        "neighborRule": "4-connected pixel adjacency; only phase 1 Copper",
        "thresholdsDegrees": [5, 10, 15],
        "crop": {"x0Pixel": x0, "y0Pixel": y0, "widthPx": width, "heightPx": height,
                 "xStepMicrometers": x_step, "yStepMicrometers": y_step},
        "results": results,
        "warnings": [
            "Preliminary region boundaries differ from original MTEX TrueEBSD correction and void-mask handling.",
            "Erosion/cleanup, resampling, and EBSD confidence exclusions have not been reproduced.",
            "No true boundary polygons or experimental micrographs are published.",
            "This crop is not a representative random sample of all copper microstructures.",
            "Do not integrate its ECD distribution as a validated property of the pure element or products.",
            "Rights to reuse or redistribute original images and derivatives are not confirmed."
        ]
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input")
    parser.add_argument("--output", default="/tmp/silm-cu-audit/copper-orientation-preview.json")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    self_test()
    if args.self_test:
        return
    if not args.input:
        parser.error("Original verified HDF5 required with --input")
    result = run(pathlib.Path(args.input))
    target = pathlib.Path(args.output)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    print(json.dumps({
        "status": result["status"], "crop": result["crop"],
        "previewThresholds": [
            {"degrees": v["thresholdDegrees"],
             "candidateRegions": v["candidateRegionsAtLeastFivePixelsNotTouchingCropBorder"],
             "medianECDmicrometers": (v["candidateEquivalentCircleDiameterMicrometers"] or {}).get("median")}
            for v in result["results"]]}, ensure_ascii=False))

if __name__ == "__main__":
    main()
