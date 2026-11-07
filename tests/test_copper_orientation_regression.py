#!/usr/bin/env python3
"""Regressão sintética do grafo orientacional de Cu: não usa dados experimentais.

Valida simetria cúbica, sensibilidade a limiares de desorientação, pixels
não indexados e exclusão de regiões conectadas à borda do recorte.
NÃO valida MTEX TrueEBSD nem qualquer distribuição experimental.
"""
from __future__ import annotations

import importlib.util
import math
import pathlib
import tempfile

import h5py
import numpy as np
from scipy.spatial.transform import Rotation


ROOT = pathlib.Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "research" / "microstructure" / "preview_copper_grains.py"
spec = importlib.util.spec_from_file_location("silm_copper_preview", SCRIPT)
assert spec is not None and spec.loader is not None
preview = importlib.util.module_from_spec(spec)
spec.loader.exec_module(preview)


def make_synthetic_h5(target: pathlib.Path) -> None:
    """Grade falsa 20x20, passo fictício 0,1 µm, ilha 5x5 rotacionada em 8°."""
    n = 20
    phase = np.ones((n, n), dtype=np.int32)
    phase[9, 9] = 0  # ausência de indexação não equivale a segunda fase química
    euler = np.zeros((n, n, 3), dtype=np.float32)
    euler[7:12, 7:12, 0] = np.deg2rad(8.0)
    x = np.tile(np.arange(n, dtype=np.float32) * 0.1, (n, 1))
    y = np.tile((np.arange(n, dtype=np.float32) * 0.1)[:, None], (1, n))
    with h5py.File(target, "w") as f:
        header = f.create_group("1/EBSD/Header")
        for name, value in (("X Cells", n), ("Y Cells", n),
                            ("X Step", 0.1), ("Y Step", 0.1)):
            header.create_dataset(name, data=np.array([value]))
        data = f.create_group("1/EBSD/Data")
        data.create_dataset("X", data=x.reshape(-1))
        data.create_dataset("Y", data=y.reshape(-1))
        data.create_dataset("Phase", data=phase.reshape(-1))
        data.create_dataset("Euler", data=euler.reshape(-1, 3))


def check_symmetry_and_threshold() -> None:
    eulers = Rotation.from_euler(
        "ZXZ", [[0.0, 0.0, 0.0], [math.radians(8), 0.0, 0.0]]
    ).as_quat()
    angle = float(preview.misorientation_deg(eulers[:1], eulers[1:2])[0])
    assert abs(angle - 8.0) < 0.0001, f"8° virou {angle}°"
    quarter_turn = Rotation.from_euler("z", [90.0], degrees=True).as_quat()
    same_cubic = float(preview.misorientation_deg(eulers[:1], quarter_turn)[0])
    assert same_cubic < 0.0001, f"Simetria cúbica não preservada: {same_cubic}°"


def check_synthetic_map() -> None:
    with tempfile.TemporaryDirectory(prefix="silm-cu-synthetic-") as directory:
        path = pathlib.Path(directory) / "only-synthetic-data.h5"
        make_synthetic_h5(path)
        result = preview.run(path, width=20, height=20)
    by_degree = {item["thresholdDegrees"]: item for item in result["results"]}
    assert set(by_degree) == {5, 10, 15}
    assert all(item["indexedPixels"] == 399 for item in by_degree.values())
    assert by_degree[5]["candidateRegionsAtLeastFivePixelsNotTouchingCropBorder"] == 1, (
        "A ilha sintética deve ter contorno em 5°."
    )
    assert by_degree[10]["candidateRegionsAtLeastFivePixelsNotTouchingCropBorder"] == 0, (
        "A ilha sintética deve se unir à matriz em 10°; região total toca a borda."
    )
    assert by_degree[15]["candidateRegionsAtLeastFivePixelsNotTouchingCropBorder"] == 0
    assert by_degree[5]["allConnectedCuRegionsIncludingTinyAndBorder"] == 2
    assert by_degree[10]["allConnectedCuRegionsIncludingTinyAndBorder"] == 1
    summary = by_degree[5]["candidateEquivalentCircleDiameterMicrometers"]
    expected_ecd = 2.0 * math.sqrt(24 * 0.1 * 0.1 / math.pi)
    assert summary and abs(summary["median"] - expected_ecd) < 0.00001, (
        "Área da ilha sintética deve excluir o pixel sem indexação."
    )
    assert result["status"] == "RAW-EBSD-ORIENTATION-EXPLORATION-ONLY"
    assert any("not" in note.lower() for note in result["warnings"])


if __name__ == "__main__":
    check_symmetry_and_threshold()
    check_synthetic_map()
    print("OK: testes sintéticos Cu (simetria, 5/10/15°, bordas e não indexados).")
    print("AVISO: nenhum contorno experimental foi homologado.")
