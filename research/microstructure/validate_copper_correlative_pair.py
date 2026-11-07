#!/usr/bin/env python3
"""SILM Cu: compare two already co-registered labelled maps.

Quality-control gate, NOT a TrueEBSD implementation, licence check,
scientific homologation, or grain-size estimator. No pixel data are exported.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import re
import numpy as np
from scipy.ndimage import distance_transform_edt

RAW_MD5 = "ffe617d5cb3d2e4ed1a5e3b7d27d6e11"
SCHEMA = "silm.copper-correlative-pair.v1"
SOURCE_REFERENCE_MANIFEST = pathlib.Path(__file__).with_name("copper-mtex-source-verified.json")


def allowed_script_shas():
    documented = json.loads(SOURCE_REFERENCE_MANIFEST.read_text(encoding="utf-8"))
    return {
        "zenodo-published": documented["zenodoPublishedScript"]["sha256Calculated"],
        "github-pinned": documented["pinnedGitHubScript"]["sha256Calculated"],
    }


def fail(message):
    raise ValueError(message)


def validate_heldout_landmarks(registration, grid, size):
    """Check declared held-out paired landmarks in the common micron frame.

    Detects gross inconsistencies, not measurement authenticity.
    """
    landmarks = registration.get("heldOutLandmarks", [])
    if not isinstance(landmarks, list) or len(landmarks) < 4:
        fail("At least 4 declared held-out registration landmarks are required")
    stepy, stepx = grid["pixelSizeMicrometersYX"]
    originy, originx = grid["originMicrometersYX"]
    upperx = originx + (size[1] - 1) * stepx
    uppery = originy + (size[0] - 1) * stepy
    seen = set()
    residuals = []
    xs, ys = [], []
    for landmark in landmarks:
        key = landmark.get("id") if isinstance(landmark, dict) else None
        if not isinstance(key, str) or not key.strip() or key in seen:
            fail("Held-out landmarks require unique identifiers")
        seen.add(key)
        if landmark.get("usedForFitting") is not False:
            fail("Registration landmarks used for fitting cannot validate alignment")
        pair = []
        for field in ("rawRegisteredXYMicrometers", "correctedRegisteredXYMicrometers"):
            value = landmark.get(field)
            if (not isinstance(value, list) or len(value) != 2 or
                    any(type(v) not in (int, float) or not np.isfinite(v) for v in value)):
                fail("Held-out landmark coordinates must be finite XY micrometers")
            if not originx <= value[0] <= upperx or not originy <= value[1] <= uppery:
                fail("Landmarks must lie within the same common physical grid")
            pair.append(value)
        raw, corrected = pair
        xs.append(raw[0])
        ys.append(raw[1])
        residuals.append(float(np.hypot((raw[0] - corrected[0]) / stepx,
                                        (raw[1] - corrected[1]) / stepy)))
    if (max(xs) - min(xs) < 0.5 * (upperx - originx) or
            max(ys) - min(ys) < 0.5 * (uppery - originy)):
        fail("Held-out landmarks do not span the common physical field")
    rms = float(np.sqrt(np.mean(np.square(residuals))))
    maximum = max(residuals)
    if rms > 1.5 or maximum > 2.0:
        fail("Registered held-out landmark residuals exceed pixel-based tolerances")
    return {"declaredHeldOutLandmarkCount": len(landmarks),
            "rmsResidualPixels": round(rms, 6),
            "maximumResidualPixels": round(maximum, 6),
            "rmsLimitPixels": 1.5, "maximumLimitPixels": 2.0,
            "caveat": "Declared landmark coordinates are not independently authenticated."}


def validate_meta(meta):
    if meta.get("schema") != SCHEMA or meta.get("specimen") != "P1700":
        fail("Required schema / specimen P1700 missing")
    if meta.get("rawSourceMD5") != RAW_MD5:
        fail("Original copper acquisition hash is not verified")
    if meta.get("rawStage") != "raw-EBSD-reprojected" or meta.get("correctedStage") != "MTEX-TrueEBSD-corrected":
        fail("Both processing stages must be explicit and distinct")
    if meta.get("sourceDOI") != "10.5281/zenodo.16902083":
        fail("Original source DOI mismatch")
    grid = meta.get("commonGrid", {})
    size = grid.get("shapeYX")
    step = grid.get("pixelSizeMicrometersYX")
    origin = grid.get("originMicrometersYX")
    if (not isinstance(size, list) or len(size) != 2 or
            any(type(v) is not int or v < 8 for v in size)):
        fail("Explicit common YX grid (at least 8x8) required")
    for field, val in (("pixelSize", step), ("origin", origin)):
        if not isinstance(val, list) or len(val) != 2 or any(
                type(v) not in (float, int) or not np.isfinite(v) for v in val):
            fail(f"Physical common-grid {field} is missing or invalid")
    if min(step) <= 0:
        fail("Physical grid pixel size must be positive")
    registration = meta.get("registration", {})
    if (registration.get("samePhysicalFrame") is not True or
            registration.get("appliedExternally") is not True):
        fail("No independently declared registration into same physical frame")
    if not registration.get("method") or not registration.get("referenceFrame"):
        fail("Registration method and reference frame are mandatory")
    if registration.get("method") == "identity-assumed":
        fail("Identity alignment without evidence is forbidden")
    if not re.fullmatch(r"[a-fA-F0-9]{64}", str(registration.get("evidenceSHA256", ""))):
        fail("SHA256 of retained transformation/registration evidence required")
    if not meta.get("correctedExportProvenance") or not meta.get("trueEbsdVersion"):
        fail("Corrected export and TrueEBSD version required")
    reference = meta.get("referenceScript", {})
    allowed = allowed_script_shas()
    kind = reference.get("kind")
    if kind not in allowed or reference.get("sha256") != allowed[kind]:
        fail("Corrected map must name an audited MATLAB script and its exact SHA256")
    for field in ("mtexVersion", "matlabVersion"):
        if not isinstance(meta.get(field), str) or not meta[field].strip():
            fail("MTEX and MATLAB versions must be declared")
    mask = meta.get("voidMask", {})
    if mask.get("method") != "registered-BSE-threshold" or not mask.get("source"):
        fail("Independent registered BSE mask provenance required")
    if not isinstance(mask.get("threshold"), (int, float)) or isinstance(mask.get("threshold"), bool) or not 0 <= mask["threshold"] <= 1:
        fail("Normalized BSE threshold is invalid")
    segmentation = meta.get("segmentation", {})
    for key in ("rawAlgorithm", "correctedAlgorithm", "borderPolicy"):
        if not isinstance(segmentation.get(key), str) or not segmentation[key].strip():
            fail("Segmentation algorithms and border policy must be documented")
    for key in ("rawThresholdDegrees", "correctedThresholdDegrees"):
        value = segmentation.get(key)
        if type(value) not in (int, float) or not np.isfinite(value) or not 0 < value <= 60:
            fail("Valid misorientation thresholds for both maps are required")
    return tuple(size), validate_heldout_landmarks(registration, grid, size)


def load_map(path, require_bse=False):
    with np.load(path, allow_pickle=False) as npz:
        required = {"grain_id", "indexed_cu", "coverage"}
        if require_bse:
            required.add("bse_void")
        if not required.issubset(npz.files):
            fail(f"Missing masks or grain labels in {path.name}")
        labels = npz["grain_id"]
        if labels.ndim != 2 or labels.dtype.kind not in "iu":
            fail("Grain IDs must be a 2D integer array")
        if np.any(labels < 0):
            fail("Grain labels may not be negative")
        data = {"grain_id": labels}
        for name in required - {"grain_id"}:
            arr = npz[name]
            if arr.shape != labels.shape or arr.dtype.kind != "b":
                fail(f"{name} must be a same-shape boolean mask")
            data[name] = arr
    return data


def edges(labels, valid):
    out = np.zeros(labels.shape, dtype=bool)
    right = valid[:, :-1] & valid[:, 1:] & (labels[:, :-1] != labels[:, 1:])
    below = valid[:-1, :] & valid[1:, :] & (labels[:-1, :] != labels[1:, :])
    out[:, :-1] |= right
    out[:-1, :] |= below
    return out


def correspondence(a, b, radius_px=1):
    count_a, count_b = int(np.count_nonzero(a)), int(np.count_nonzero(b))
    if not count_a or not count_b:
        return {"comparisonStatus": "unavailable-no-boundaries", "rawEdgeCount": count_a,
                "correctedEdgeCount": count_b, "precision": None, "recall": None,
                "f1": None}
    dist_to_b = distance_transform_edt(~b)
    dist_to_a = distance_transform_edt(~a)
    precision = float(np.mean(dist_to_b[a] <= radius_px))
    recall = float(np.mean(dist_to_a[b] <= radius_px))
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {"comparisonStatus": "descriptive-boundary-proximity-only",
            "rawEdgeCount": count_a, "correctedEdgeCount": count_b,
            "precision": round(precision, 6), "recall": round(recall, 6),
            "f1": round(f1, 6)}


def analyze(meta, raw, corrected):
    shape, residual = validate_meta(meta)
    for label, arr in (("raw", raw["grain_id"]), ("corrected", corrected["grain_id"])):
        if arr.shape != shape:
            fail(f"{label} array does not match common physical grid")
    if np.any(raw["indexed_cu"] & (raw["grain_id"] == 0)):
        fail("Raw Cu indexed points must have positive labels")
    if np.any(corrected["indexed_cu"] & (corrected["grain_id"] == 0)):
        fail("Corrected Cu indexed points must have positive labels")
    for data in (raw, corrected):
        if np.any(data["indexed_cu"] & ~data["coverage"]):
            fail("Cu indexed points outside acquisition coverage")
    if np.any(corrected["bse_void"] & ~corrected["coverage"]):
        fail("BSE voids cannot be assigned outside mapped coverage")
    eligible = (raw["indexed_cu"] & corrected["indexed_cu"] &
                raw["coverage"] & corrected["coverage"] &
                ~corrected["bse_void"])
    if np.count_nonzero(eligible) < 4:
        fail("Too little jointly indexed, nonvoid overlap to compare")
    measured = correspondence(edges(raw["grain_id"], eligible),
                              edges(corrected["grain_id"], eligible))
    return {"schema": "silm.copper-correlative-descriptive-output.v1",
            "sourceDOI": meta["sourceDOI"], "specimen": meta["specimen"],
            "commonGridShapeYX": list(shape),
            "commonPixelSizeMicrometersYX": meta["commonGrid"]["pixelSizeMicrometersYX"],
            "eligiblePixelsAfterMasks": int(eligible.sum()),
            "bseVoidPixelsWithinCorrectedCoverage": int(np.count_nonzero(
                corrected["bse_void"] & corrected["coverage"])),
            "edgeComparisonAtOneCommonPixel": measured,
            "experimentalValidation": "not-homologated",
            "registrationAssessment": "metadata-declared; not independently verified",
            "heldOutLandmarkQuality": residual,
            "segmentationMethods": meta["segmentation"],
            "referenceScript": meta["referenceScript"],
            "matlabVersion": meta["matlabVersion"],
            "mtexVersion": meta["mtexVersion"],
            "causalAttribution": "not-possible: distortion correction and segmentation methods may differ",
            "cannotInfer": ["chemical concentration", "voids from unindexed EBSD",
                            "ASTM grain size", "volume fraction", "licence to reuse",
                            "TrueEBSD correction validity"],
            "rawPixelOrImageDataExported": False,
            "approvedForMain": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--metadata", required=True, type=pathlib.Path)
    parser.add_argument("--raw-npz", required=True, type=pathlib.Path)
    parser.add_argument("--corrected-npz", required=True, type=pathlib.Path)
    parser.add_argument("--out", required=True, type=pathlib.Path)
    args = parser.parse_args()
    meta = json.loads(args.metadata.read_text(encoding="utf-8"))
    result = analyze(meta, load_map(args.raw_npz), load_map(args.corrected_npz, True))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, indent=2, ensure_ascii=False)+"\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
