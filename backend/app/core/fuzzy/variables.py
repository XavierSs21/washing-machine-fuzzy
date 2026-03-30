"""
variables.py — Define las variables de entrada/salida y funciones de membresía.

Implementación manual con numpy (sin scikit-fuzzy).
Cada variable tiene un universo de discurso (array) y términos lingüísticos
con funciones de membresía triangulares precalculadas.
"""

import numpy as np


def trimf(x: np.ndarray, params: list) -> np.ndarray:
    """
    Función de membresía triangular vectorizada.

    Args:
        x:      Array del universo de discurso.
        params: [a, b, c] donde a <= b <= c son los vértices del triángulo.

    Returns:
        Array de grados de membresía (0–1).
    """
    a, b, c = params
    mf = np.zeros_like(x, dtype=float)

    # Rampa ascendente: a < x <= b
    if b != a:
        mask_up = (x > a) & (x <= b)
        mf[mask_up] = (x[mask_up] - a) / (b - a)

    # Rampa descendente: b < x < c
    if c != b:
        mask_down = (x > b) & (x < c)
        mf[mask_down] = (c - x[mask_down]) / (c - b)

    # Pico: x == b siempre es 1 (cubre caso a == b o b == c)
    mf[x == b] = 1.0

    return mf


def build_variables() -> dict:
    """
    Construye todas las variables difusas con sus universos y MFs precalculadas.

    Returns:
        dict con claves "inputs" y "outputs", cada una conteniendo un dict
        de variables. Cada variable es un dict con "universe" (np.ndarray)
        y "terms" (dict de nombre → np.ndarray de membresía).
    """

    # ── ENTRADAS ──────────────────────────────────────────────────────────
    u_tipo = np.arange(0, 101, 1, dtype=float)
    u_suciedad = np.arange(0, 101, 1, dtype=float)
    u_masa = np.arange(0, 10.1, 0.1)

    inputs = {
        "tipo_ropa": {
            "universe": u_tipo,
            "terms": {
                "delicada":   trimf(u_tipo, [0, 0, 50]),
                "normal":     trimf(u_tipo, [0, 50, 100]),
                "resistente": trimf(u_tipo, [50, 100, 100]),
            },
        },
        "nivel_suciedad": {
            "universe": u_suciedad,
            "terms": {
                "baja":  trimf(u_suciedad, [0, 0, 50]),
                "media": trimf(u_suciedad, [0, 50, 100]),
                "alta":  trimf(u_suciedad, [50, 100, 100]),
            },
        },
        "masa_ropa": {
            "universe": u_masa,
            "terms": {
                "ligera": trimf(u_masa, [0, 0, 5]),
                "media":  trimf(u_masa, [0, 5, 10]),
                "pesada": trimf(u_masa, [5, 10, 10]),
            },
        },
    }

    # ── SALIDAS ───────────────────────────────────────────────────────────
    u_tiempo = np.arange(0, 61, 1, dtype=float)
    u_temp = np.arange(20, 91, 1, dtype=float)
    u_detergente = np.arange(0, 201, 1, dtype=float)
    u_agitacion = np.arange(0, 1201, 1, dtype=float)

    outputs = {
        "tiempo_ciclo": {
            "universe": u_tiempo,
            "terms": {
                "muy_corto": trimf(u_tiempo, [0, 0, 15]),
                "corto":     trimf(u_tiempo, [0, 15, 30]),
                "medio":     trimf(u_tiempo, [15, 30, 45]),
                "largo":     trimf(u_tiempo, [30, 45, 60]),
                "muy_largo": trimf(u_tiempo, [45, 60, 60]),
            },
        },
        "temperatura_agua": {
            "universe": u_temp,
            "terms": {
                "fria":          trimf(u_temp, [20, 20, 40]),
                "tibia":         trimf(u_temp, [20, 40, 60]),
                "caliente":      trimf(u_temp, [40, 60, 80]),
                "muy_caliente":  trimf(u_temp, [60, 90, 90]),
            },
        },
        "cantidad_detergente": {
            "universe": u_detergente,
            "terms": {
                "poca":  trimf(u_detergente, [0, 0, 100]),
                "media": trimf(u_detergente, [0, 100, 200]),
                "mucha": trimf(u_detergente, [100, 200, 200]),
            },
        },
        "velocidad_agitacion": {
            "universe": u_agitacion,
            "terms": {
                "baja":     trimf(u_agitacion, [0, 0, 400]),
                "media":    trimf(u_agitacion, [0, 400, 800]),
                "alta":     trimf(u_agitacion, [400, 800, 1200]),
                "muy_alta": trimf(u_agitacion, [800, 1200, 1200]),
            },
        },
    }

    return {"inputs": inputs, "outputs": outputs}
