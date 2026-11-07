#!/usr/bin/env python3
"""SILM Cu: audit *small published script* and pinned repository source.

No experimental EBSD, BSE/SEM images, MATLAB .mat files or source scripts are
published. Output holds hashes, flags, and provenance only. Licence never auto-
approved. Public source script is <= 64 KiB; large files are never requested.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import pathlib
import re
import urllib.error
import urllib.request

DOI = "10.5281/zenodo.16902083"
ZENODO_PUBLISHED_URL = "https://zenodo.org/records/16902083/files/example_copper.m?download=1"
ZENODO_RECORD_API = "https://zenodo.org/api/records/16902083"
EXPECTED_SCRIPT_MD5 = "d6ddfa176463c989ee9721ea1f2ec8b4"
PINNED_GITHUB_COMMIT = "c831df4843336c94983b1e897ccd409ea78634c5"
GITHUB_PINNED_URL = (
    "https://raw.githubusercontent.com/vtvivian/mtex-trueEbsd/"
    + PINNED_GITHUB_COMMIT + "/examples/example_copper.m"
)
MAX_SCRIPT_BYTES = 65536
MAX_METADATA_BYTES = 200000

PROCEDURAL_MARKERS = (
    "pixelSizeMatch", "calcShifts", "undistort", "FindLargestRectangles",
    "phasesBse", "calcGrains", "boundaryContours", "smooth", "fitError",
    "trueEbsd2", "bse1b", "grainId", "voids"
)


def bounded_fetch(url: str, maximum: int):
    request = urllib.request.Request(
        url, headers={"User-Agent": "SILM-scientific-source-audit/1.0"})
    with urllib.request.urlopen(request, timeout=35) as response:
        if response.status != 200:
            raise RuntimeError(f"Unexpected HTTP response: {response.status}")
        announced = response.headers.get("Content-Length")
        if announced and int(announced) > maximum:
            raise ValueError(f"Unacceptable source size declared: {announced}")
        data = response.read(maximum + 1)
    if len(data) > maximum:
        raise ValueError(f"Remote source exceeds {maximum} bytes")
    return data


def marker_summary(source: bytes):
    text = source.decode("utf-8-sig")
    return {marker: bool(re.search(r"(?<![A-Za-z0-9_])" + re.escape(marker)
                                  + r"(?![A-Za-z0-9_])", text))
            for marker in PROCEDURAL_MARKERS}


def script_info(source: bytes):
    return {
        "byteLength": len(source),
        "sha256": hashlib.sha256(source).hexdigest(),
        "md5": hashlib.md5(source).hexdigest(),
        "proceduralMarkersPresence": marker_summary(source)
    }


def rights_view(obj):
    metadata = obj.get("metadata", {}) if isinstance(obj, dict) else {}
    return {
        "rightsAsReported": metadata.get("rights"),
        "legacyLicenseAsReported": metadata.get("license"),
        "accessAsReported": obj.get("access"),
        "rightsDecision": "PENDING human review, never auto-approve image/data derivatives"
    }


def analyze(published: bytes, pinned: bytes, metadata=None):
    pub = script_info(published)
    if pub["md5"] != EXPECTED_SCRIPT_MD5:
        raise ValueError("Zenodo published example_copper.m differs from published MD5")
    repo = script_info(pinned)
    return {
        "schema": "silm.copper-mtex-script-provenance.v1",
        "sourceDOI": DOI,
        "specimen": "P1700",
        "publishedFile": "example_copper.m",
        "zenodoPublishedURL": ZENODO_PUBLISHED_URL,
        "zenodo": pub,
        "sourceRepo": "vtvivian/mtex-trueEbsd",
        "githubPinnedCommit": PINNED_GITHUB_COMMIT,
        "githubPinnedURL": GITHUB_PINNED_URL,
        "github": repo,
        "sameScriptBytes": published == pinned,
        "sourceStage": "published-MATLAB-script-vs-pinned-GitHub-repository-script",
        "mtexTutorial": "https://mtex-toolbox.github.io/example_copper_2.html",
        "mtexTutorialEquivalentToPublishedScript": "NOT_ESTABLISHED",
        "originalDatasetCompared": False,
        "correctedExperimentalMapLoaded": False,
        "rights": rights_view(metadata),
        "scriptsRedistributed": False,
        "rawArraysOrImagesRedistributed": False,
        "experimentApprovedForSILM": False,
        "warning": (
            "Code markers indicate mention, not execution. This audit does not "
            "run MATLAB, TrueEBSD, segmentation or any physical measurement."
        )
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=pathlib.Path,
                        default=pathlib.Path("/tmp/silm-cu-audit/mtex-source-provenance.json"))
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        assert marker_summary(b"calcGrains(ebsd); % voids")["calcGrains"]
        assert not marker_summary(b"calcGrainsextended")["calcGrains"]
        assert not marker_summary(b"none")["trueEbsd2"]
        print("OK: source-marker and bounded-source utilities")
        return
    original = bounded_fetch(ZENODO_PUBLISHED_URL, MAX_SCRIPT_BYTES)
    versioned = bounded_fetch(GITHUB_PINNED_URL, MAX_SCRIPT_BYTES)
    try:
        record = json.loads(bounded_fetch(ZENODO_RECORD_API, MAX_METADATA_BYTES))
        metadata_error = None
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        record = None
        metadata_error = str(exc)[:240]
    result = analyze(original, versioned, record)
    result["checkedUTC"] = dt.datetime.now(dt.timezone.utc).isoformat()
    result["metadataAvailable"] = record is not None
    if metadata_error:
        result["metadataRetrievalIssue"] = metadata_error
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n",
                        encoding="utf-8")
    print(json.dumps({
        "publishedScriptMD5Verified": True,
        "samePublishedAndGitHubSource": result["sameScriptBytes"],
        "publishedScriptBytes": result["zenodo"]["byteLength"],
        "pinnedScriptBytes": result["github"]["byteLength"],
        "metadataAvailable": result["metadataAvailable"],
        "rightsDecision": result["rights"]["rightsDecision"],
        "mapOrImageDownloaded": False
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
