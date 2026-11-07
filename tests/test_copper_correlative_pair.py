#!/usr/bin/env python3
"""Synthetic-only regression: physical frame, BSE, masks and safe output."""
from __future__ import annotations
import copy
import hashlib
import importlib.util
import pathlib
import tempfile
import numpy as np

SRC = pathlib.Path(__file__).resolve().parents[1] / "research/microstructure/validate_copper_correlative_pair.py"
spec = importlib.util.spec_from_file_location("silm_corr", SRC)
assert spec and spec.loader
corr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(corr)


def metadata():
    return {"schema": "silm.copper-correlative-pair.v1", "specimen": "P1700",
            "sourceDOI": "10.5281/zenodo.16902083",
            "rawSourceMD5": corr.RAW_MD5,
            "rawStage": "raw-EBSD-reprojected",
            "correctedStage": "MTEX-TrueEBSD-corrected",
            "commonGrid": {"shapeYX": [24, 24], "pixelSizeMicrometersYX": [0.05, 0.05],
                           "originMicrometersYX": [-10.0, -10.0]},
            "registration": {"samePhysicalFrame": True, "appliedExternally": True,
                             "method": "synthetic-only-affine-fixture",
                             "referenceFrame": "artificial-fixed-frame",
                             "evidenceSHA256": hashlib.sha256(b"SYNTHETIC TEST ONLY").hexdigest()},
            "correctedExportProvenance": "SYNTHETIC ONLY",
            "trueEbsdVersion": "SYNTHETIC-FIXTURE-NOT-TRUEEBSD",
            "voidMask": {"method": "registered-BSE-threshold", "source": "artificial-BSE",
                         "threshold": 0.8},
            "segmentation": {"rawAlgorithm": "SYNTHETIC connected graph",
                             "correctedAlgorithm": "SYNTHETIC connected graph",
                             "rawThresholdDegrees": 10, "correctedThresholdDegrees": 10,
                             "borderPolicy": "SYNTHETIC all test pixels"}}


def maps():
    n = 24
    raw = np.ones((n, n), dtype=np.int32)
    raw[:, 12:] = 2
    corrected = raw.copy()
    corrected[:, 13:] = 2
    valid = np.ones((n, n), dtype=bool)
    cover = valid.copy()
    valid[5, 5] = False
    raw[5, 5] = 0
    bse = np.zeros((n, n), dtype=bool)
    bse[3, 3] = True
    return ({"grain_id": raw, "indexed_cu": valid, "coverage": cover},
            {"grain_id": corrected, "indexed_cu": valid.copy(),
             "coverage": cover.copy(), "bse_void": bse})


def must_fail(fn, phrase):
    try:
        fn()
    except ValueError as exc:
        assert phrase.lower() in str(exc).lower(), str(exc)
    else:
        raise AssertionError("Expected rejection: " + phrase)


def run_test():
    m = metadata()
    a, b = maps()
    result = corr.analyze(m, a, b)
    assert result["experimentalValidation"] == "not-homologated"
    assert result["approvedForMain"] is False
    assert result["rawPixelOrImageDataExported"] is False
    assert result["bseVoidPixelsWithinCorrectedCoverage"] == 1
    assert result["eligiblePixelsAfterMasks"] == 24 * 24 - 2
    score = result["edgeComparisonAtOneCommonPixel"]
    assert score["comparisonStatus"] == "descriptive-boundary-proximity-only"
    assert score["precision"] == score["recall"] == 1
    assert score["rawEdgeCount"] > 0 and score["correctedEdgeCount"] > 0
    assert "grain_id" not in result and "bse_void" not in result

    altered = copy.deepcopy(m)
    altered["registration"]["samePhysicalFrame"] = False
    must_fail(lambda: corr.analyze(altered, a, b), "registration")
    altered = copy.deepcopy(m)
    altered["registration"]["method"] = "identity-assumed"
    must_fail(lambda: corr.analyze(altered, a, b), "identity")
    altered = copy.deepcopy(m)
    altered["registration"]["evidenceSHA256"] = "no evidence"
    must_fail(lambda: corr.analyze(altered, a, b), "sha256")
    altered = copy.deepcopy(m)
    altered["commonGrid"]["shapeYX"] = [23, 24]
    must_fail(lambda: corr.analyze(altered, a, b), "common physical grid")
    altered = copy.deepcopy(m)
    altered["voidMask"] = {}
    must_fail(lambda: corr.analyze(altered, a, b), "BSE")
    altered = copy.deepcopy(m)
    altered["segmentation"] = {}
    must_fail(lambda: corr.analyze(altered, a, b), "segmentation")
    altered = copy.deepcopy(m)
    altered["segmentation"]["correctedThresholdDegrees"] = "10"
    must_fail(lambda: corr.analyze(altered, a, b), "threshold")
    altered = copy.deepcopy(m)
    altered["rawSourceMD5"] = "fake"
    must_fail(lambda: corr.analyze(altered, a, b), "hash")
    altered_a = {k: v.copy() for k, v in a.items()}
    altered_a["grain_id"][0, 0] = 0
    must_fail(lambda: corr.analyze(m, altered_a, b), "positive")
    altered_b = {k: v.copy() for k, v in b.items()}
    altered_b["bse_void"][0, 0] = True
    altered_b["coverage"][0, 0] = False
    altered_b["indexed_cu"][0, 0] = False
    must_fail(lambda: corr.analyze(m, a, altered_b), "outside mapped coverage")

    with tempfile.TemporaryDirectory() as temp:
        p = pathlib.Path(temp)
        np.savez_compressed(p / "raw.npz", **a)
        np.savez_compressed(p / "corrected.npz", **b)
        reread = corr.analyze(m, corr.load_map(p / "raw.npz"),
                             corr.load_map(p / "corrected.npz", True))
        assert reread == result
        np.savez_compressed(p / "bad.npz", grain_id=a["grain_id"],
                            indexed_cu=a["indexed_cu"].astype(np.uint8), coverage=a["coverage"])
        must_fail(lambda: corr.load_map(p / "bad.npz"), "boolean")
    print("OK: gate comparativo Cu, apenas sintético - frames, BSE, máscaras e saída segura")


if __name__ == "__main__":
    run_test()
