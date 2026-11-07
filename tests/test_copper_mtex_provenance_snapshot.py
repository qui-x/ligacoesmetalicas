#!/usr/bin/env python3
"""Fail when the externally verified published sources drift from reviewed snapshot.

Never reads EBSD maps or image data. License in the *record* is a declaration,
not permission inferred for every embedded third-party work.
"""
from __future__ import annotations

import argparse
import json
import pathlib


def check(snapshot, live):
    if snapshot["zenodoPublishedScript"]["sha256Calculated"] != live["zenodo"]["sha256"]:
        raise AssertionError("The published Zenodo MATLAB source changed")
    if snapshot["zenodoPublishedScript"]["md5PublishedAndCalculated"] != live["zenodo"]["md5"]:
        raise AssertionError("Zenodo script MD5 does not match audited source")
    if snapshot["pinnedGitHubScript"]["sha256Calculated"] != live["github"]["sha256"]:
        raise AssertionError("Pinned GitHub MATLAB script changed")
    if snapshot["pinnedGitHubScript"]["refCommit"] != live["githubPinnedCommit"]:
        raise AssertionError("Script repository commit no longer pinned")
    if snapshot["sourceVersionsByteIdentical"] != live["sameScriptBytes"]:
        raise AssertionError("Previous code-version comparison no longer agrees")
    if snapshot["zenodoLicenseEvidence"]["value"] != live["rights"]["declaredLicenseId"]:
        raise AssertionError("Record license metadata differs from reviewed evidence")
    if live["experimentApprovedForSILM"] or live["rawArraysOrImagesRedistributed"]:
        raise AssertionError("Experimental publication/approval is prohibited")
    if live["rights"]["derivativeRightsApproved"] or live["rights"]["fileRightsAudited"]:
        raise AssertionError("File-scope and derivative rights review was not performed")
    if live["correctedExperimentalMapLoaded"]:
        raise AssertionError("No corrected EBSD map can be inferred from a script audit")
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--snapshot", type=pathlib.Path,
                    default=pathlib.Path("research/microstructure/copper-mtex-source-verified.json"))
    ap.add_argument("--live", type=pathlib.Path, required=True)
    args = ap.parse_args()
    snap = json.loads(args.snapshot.read_text(encoding="utf-8"))
    live = json.loads(args.live.read_text(encoding="utf-8"))
    assert check(snap, live)
    print("OK: source scripts and CC BY 4.0 metadata match reviewed snapshot; rights still pending")


if __name__ == "__main__":
    main()
