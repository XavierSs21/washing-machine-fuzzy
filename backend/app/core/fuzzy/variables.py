import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl


def build_variables():
    """
    Define todas las variables de entrada y salida del sistema difuso.
    Retorna un dict con los Antecedents y Consequents de skfuzzy.
    """

    # ── ENTRADAS ──────────────────────────────────────────────────────────
    u_tipo = np.arange(0, 101, 1, dtype=float)
    u_suciedad = np.arange(0, 101, 1, dtype=float)
    u_masa = np.arange(0, 10.1, 0.1)

    inputs = {
        "tipo_ropa": {
            "universe": u_tipo,
            "terms": {
                "delicada": trimf(u_tipo, [0, 0, 50]),
                "normal": trimf(u_tipo, [0, 50, 100]),
                "resistente": trimf(u_tipo, [50, 100, 100]),
            },
        },
        "nivel_suciedad": {
            "universe": u_suciedad,
            "terms": {
                "baja": trimf(u_suciedad, [0, 0, 50]),
                "media": trimf(u_suciedad, [0, 50, 100]),
                "alta": trimf(u_suciedad, [50, 100, 100]),
            },
        },
        "masa_ropa": {
            "universe": u_masa,
            "terms": {
                "ligera": trimf(u_masa, [0, 0, 5]),
                "media": trimf(u_masa, [0, 5, 10]),
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
                "corto": trimf(u_tiempo, [0, 15, 30]),
                "medio": trimf(u_tiempo, [15, 30, 45]),
                "largo": trimf(u_tiempo, [30, 45, 60]),
                "muy_largo": trimf(u_tiempo, [45, 60, 60]),
            },
        },
        "temperatura_agua": {
            "universe": u_temp,
            "terms": {
                "fria": trimf(u_temp, [20, 20, 40]),
                "tibia": trimf(u_temp, [20, 40, 60]),
                "caliente": trimf(u_temp, [40, 60, 80]),
                "muy_caliente": trimf(u_temp, [60, 90, 90]),
            },
        },
        "cantidad_detergente": {
            "universe": u_detergente,
            "terms": {
                "poca": trimf(u_detergente, [0, 0, 100]),
                "media": trimf(u_detergente, [0, 100, 200]),
                "mucha": trimf(u_detergente, [100, 200, 200]),
            },
        },
        "velocidad_agitacion": {
            "universe": u_agitacion,
            "terms": {
                "baja": trimf(u_agitacion, [0, 0, 400]),
                "media": trimf(u_agitacion, [0, 400, 800]),
                "alta": trimf(u_agitacion, [400, 800, 1200]),
                "muy_alta": trimf(u_agitacion, [800, 1200, 1200]),
            },
        },
    }

    return {"inputs": inputs, "outputs": outputs}
