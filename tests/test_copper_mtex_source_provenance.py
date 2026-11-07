#!/usr/bin/env python3
"""Offline tests of source-hash, scripts, rights and explicit no-publication gates."""
import hashlib
import importlib.util
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
source = ROOT / "research/microstructure/audit_copper_mtex_sources.py"
spec = importlib.util.spec_from_file_location("audit_copper_mtex_sources", source)
assert spec and spec.loader
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def must_fail(callback, keyword):
    try:
        callback()
    except ValueError as err:
        assert keyword.lower() in str(err).lower(), str(err)
    else:
        raise AssertionError("Expected rejection: " + keyword)


def run():
    a = b"calcGrains(ebsd); % A test marker\n% voids\n"
    b = b"pixelSizeMatch(job,0); % DIFFERENT FIXTURE VERSION"
    saved = mod.EXPECTED_SCRIPT_MD5
    try:
        mod.EXPECTED_SCRIPT_MD5 = hashlib.md5(a).hexdigest()
        report = mod.analyze(a, b, {"metadata": {"rights": [], "license": None},
                                     "access": {"record": "public"}})
        assert report["sameScriptBytes"] is False
        assert report["zenodo"]["proceduralMarkersPresence"]["calcGrains"]
        assert not report["github"]["proceduralMarkersPresence"]["calcGrains"]
        assert report["github"]["proceduralMarkersPresence"]["pixelSizeMatch"]
        assert report["mtexTutorialEquivalentToPublishedScript"] == "NOT_ESTABLISHED"
        assert not report["correctedExperimentalMapLoaded"]
        assert not report["rawArraysOrImagesRedistributed"]
        assert report["rights"]["rightsAsReported"] == []
        assert report["rights"]["declaredLicenseId"] is None
        assert "PENDING" in report["rights"]["rightsDecision"]
        licensed = mod.analyze(a, b, {"metadata": {"rights": [], "license": {"id": "cc-by-4.0"}}})
        assert licensed["rights"]["declaredLicenseId"] == "cc-by-4.0"
        assert licensed["rights"]["declaredLicenseReference"] == (
            "https://creativecommons.org/licenses/by/4.0/"
        )
        assert licensed["rights"]["fileRightsAudited"] is False
        assert licensed["rights"]["derivativeRightsApproved"] is False
        assert "PENDING" in licensed["rights"]["rightsDecision"]
        must_fail(lambda: mod.analyze(b, a, None), "md5")
        assert mod.marker_summary(b"calcGrainsextended")["calcGrains"] is False
        assert mod.marker_summary(b"calcGrains")["calcGrains"] is True
        tiny = mod.analyze(a, a)
        assert tiny["sameScriptBytes"] is True
        assert tiny["rights"]["rightsAsReported"] is None
    finally:
        mod.EXPECTED_SCRIPT_MD5 = saved
    print("OK: no-network provenance, source mismatch, MD5 and rights gates")


if __name__ == "__main__":
    run()
