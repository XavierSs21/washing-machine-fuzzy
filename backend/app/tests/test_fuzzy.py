"""
test_fuzzy.py — Unit tests del motor difuso.
Cubre los 15 casos de caja negra del mega prompt.
"""
import pytest
from app.core.fuzzy.engine import FuzzyEngine

engine = FuzzyEngine()


def run(tipo, suciedad, masa):
    return engine.run(tipo_ropa=tipo, nivel_suciedad=suciedad, masa_ropa=masa)


# ── Helpers ───────────────────────────────────────────────────────────────────
def assert_range(value, low, high, name):
    assert low <= value <= high, f"{name}={value} fuera de [{low}, {high}]"


# ── CB01: delicada, baja, ligera ──────────────────────────────────────────────
def test_CB01():
    r = run(10, 10, 1)
    assert_range(r["lavado"]["tiempo_ciclo"], 0, 20, "tiempo_ciclo")
    assert_range(r["lavado"]["temperatura_agua"], 20, 45, "temperatura_agua")
    assert_range(r["lavado"]["cantidad_detergente"], 0, 60, "cantidad_detergente")
    assert_range(r["lavado"]["velocidad_agitacion"], 0, 450, "velocidad_agitacion")


# ── CB02: delicada, media, ligera ─────────────────────────────────────────────
def test_CB02():
    r = run(10, 50, 1)
    assert_range(r["lavado"]["tiempo_ciclo"], 0, 25, "tiempo_ciclo")
    assert_range(r["lavado"]["temperatura_agua"], 20, 55, "temperatura_agua")


# ── CB03: delicada, alta, media ───────────────────────────────────────────────
def test_CB03():
    r = run(10, 90, 5)
    assert_range(r["lavado"]["tiempo_ciclo"], 10, 40, "tiempo_ciclo")
    assert r["lavado"]["velocidad_agitacion"] < 500


# ── CB04: normal, baja, media ─────────────────────────────────────────────────
def test_CB04():
    r = run(50, 10, 5)
    assert_range(r["lavado"]["tiempo_ciclo"], 10, 40, "tiempo_ciclo")
    assert_range(r["lavado"]["velocidad_agitacion"], 200, 700, "velocidad_agitacion")


# ── CB05: normal, media, media ────────────────────────────────────────────────
def test_CB05():
    r = run(50, 50, 5)
    assert r["lavado"]["temperatura_agua"] >= 45


# ── CB06: normal, alta, pesada ────────────────────────────────────────────────
def test_CB06():
    r = run(50, 90, 9)
    assert r["lavado"]["tiempo_ciclo"] >= 30
    assert r["lavado"]["temperatura_agua"] >= 50
    assert r["lavado"]["cantidad_detergente"] >= 100


# ── CB07: resistente, baja, pesada ───────────────────────────────────────────
def test_CB07():
    r = run(90, 10, 9)
    assert r["lavado"]["temperatura_agua"] >= 45
    assert r["lavado"]["velocidad_agitacion"] >= 500


# ── CB08: resistente, media, pesada ──────────────────────────────────────────
def test_CB08():
    r = run(90, 50, 9)
    assert r["lavado"]["tiempo_ciclo"] >= 30
    assert r["lavado"]["temperatura_agua"] >= 65


# ── CB09: resistente, alta, pesada ───────────────────────────────────────────
def test_CB09():
    r = run(90, 90, 9)
    assert r["lavado"]["tiempo_ciclo"] >= 40
    assert r["lavado"]["temperatura_agua"] >= 70
    assert r["lavado"]["velocidad_agitacion"] >= 800


# ── CB10: delicada, baja, pesada ──────────────────────────────────────────────
def test_CB10():
    r = run(10, 10, 9)
    assert r["lavado"]["temperatura_agua"] < 50
    assert r["lavado"]["velocidad_agitacion"] < 500


# ── CB11: normal, alta, ligera ────────────────────────────────────────────────
def test_CB11():
    r = run(50, 90, 1)
    assert r["lavado"]["temperatura_agua"] >= 45


# ── CB12: resistente, baja, ligera ───────────────────────────────────────────
def test_CB12():
    r = run(90, 10, 1)
    assert_range(r["lavado"]["tiempo_ciclo"], 5, 35, "tiempo_ciclo")


# ── CB13: delicada, alta, pesada ──────────────────────────────────────────────
def test_CB13():
    r = run(10, 90, 9)
    assert r["lavado"]["velocidad_agitacion"] < 500
    assert r["lavado"]["tiempo_ciclo"] >= 20


# ── CB14: normal, baja, ligera ────────────────────────────────────────────────
def test_CB14():
    r = run(50, 10, 1)
    assert_range(r["lavado"]["tiempo_ciclo"], 0, 30, "tiempo_ciclo")


# ── CB15: resistente, media, media ───────────────────────────────────────────
def test_CB15():
    r = run(90, 50, 5)
    assert r["lavado"]["tiempo_ciclo"] >= 25
    assert r["lavado"]["temperatura_agua"] >= 50
    assert r["lavado"]["velocidad_agitacion"] >= 500


# ── Estructura de salida ──────────────────────────────────────────────────────
def test_output_structure():
    r = run(50, 50, 5)
    for cycle in ["prelavado", "lavado", "enjuague", "centrifugado"]:
        assert cycle in r
        for key in ["tiempo_ciclo", "temperatura_agua", "cantidad_detergente",
                    "velocidad_agitacion", "duracion_animacion"]:
            assert key in r[cycle], f"Falta '{key}' en {cycle}"


def test_enjuague_no_detergente():
    r = run(50, 50, 5)
    assert r["enjuague"]["cantidad_detergente"] == 0.0


def test_centrifugado_no_calor():
    r = run(50, 50, 5)
    assert r["centrifugado"]["temperatura_agua"] == 20.0
    assert r["centrifugado"]["cantidad_detergente"] == 0.0
