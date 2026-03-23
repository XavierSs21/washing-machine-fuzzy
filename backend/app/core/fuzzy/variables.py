import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl


def build_variables():
    """
    Define todas las variables de entrada y salida del sistema difuso.
    Retorna un dict con los Antecedents y Consequents de skfuzzy.
    """

    # ── ENTRADAS ──────────────────────────────────────────────────────────
    tipo_ropa = ctrl.Antecedent(np.arange(0, 101, 1), "tipo_ropa")
    nivel_suciedad = ctrl.Antecedent(np.arange(0, 101, 1), "nivel_suciedad")
    masa_ropa = ctrl.Antecedent(np.arange(0, 10.1, 0.1), "masa_ropa")

    # tipo_ropa: 0=delicada, 50=normal, 100=resistente
    tipo_ropa["delicada"]   = fuzz.trimf(tipo_ropa.universe,   [0,   0,  50])
    tipo_ropa["normal"]     = fuzz.trimf(tipo_ropa.universe,   [0,  50, 100])
    tipo_ropa["resistente"] = fuzz.trimf(tipo_ropa.universe,   [50, 100, 100])

    # nivel_suciedad
    nivel_suciedad["baja"]  = fuzz.trimf(nivel_suciedad.universe, [0,   0,  50])
    nivel_suciedad["media"] = fuzz.trimf(nivel_suciedad.universe, [0,  50, 100])
    nivel_suciedad["alta"]  = fuzz.trimf(nivel_suciedad.universe, [50, 100, 100])

    # masa_ropa
    masa_ropa["ligera"] = fuzz.trimf(masa_ropa.universe, [0,   0,   5])
    masa_ropa["media"]  = fuzz.trimf(masa_ropa.universe, [0,   5,  10])
    masa_ropa["pesada"] = fuzz.trimf(masa_ropa.universe, [5,  10,  10])

    # ── SALIDAS ───────────────────────────────────────────────────────────
    tiempo_ciclo = ctrl.Consequent(np.arange(0, 61, 1), "tiempo_ciclo", defuzzify_method="centroid")
    temperatura_agua = ctrl.Consequent(np.arange(20, 91, 1), "temperatura_agua", defuzzify_method="centroid")
    cantidad_detergente = ctrl.Consequent(np.arange(0, 201, 1), "cantidad_detergente", defuzzify_method="centroid")
    velocidad_agitacion = ctrl.Consequent(np.arange(0, 1201, 1), "velocidad_agitacion", defuzzify_method="centroid")

    # tiempo_ciclo
    tiempo_ciclo["muy_corto"] = fuzz.trimf(tiempo_ciclo.universe, [0,   0,  15])
    tiempo_ciclo["corto"]     = fuzz.trimf(tiempo_ciclo.universe, [0,  15,  30])
    tiempo_ciclo["medio"]     = fuzz.trimf(tiempo_ciclo.universe, [15, 30,  45])
    tiempo_ciclo["largo"]     = fuzz.trimf(tiempo_ciclo.universe, [30, 45,  60])
    tiempo_ciclo["muy_largo"] = fuzz.trimf(tiempo_ciclo.universe, [45, 60,  60])

    # temperatura_agua
    temperatura_agua["fria"]        = fuzz.trimf(temperatura_agua.universe, [20, 20, 40])
    temperatura_agua["tibia"]       = fuzz.trimf(temperatura_agua.universe, [20, 40, 60])
    temperatura_agua["caliente"]    = fuzz.trimf(temperatura_agua.universe, [40, 60, 80])
    temperatura_agua["muy_caliente"]= fuzz.trimf(temperatura_agua.universe, [60, 90, 90])

    # cantidad_detergente
    cantidad_detergente["poca"]  = fuzz.trimf(cantidad_detergente.universe, [0,    0,  100])
    cantidad_detergente["media"] = fuzz.trimf(cantidad_detergente.universe, [0,  100,  200])
    cantidad_detergente["mucha"] = fuzz.trimf(cantidad_detergente.universe, [100, 200, 200])

    # velocidad_agitacion
    velocidad_agitacion["baja"]     = fuzz.trimf(velocidad_agitacion.universe, [0,    0,   400])
    velocidad_agitacion["media"]    = fuzz.trimf(velocidad_agitacion.universe, [0,   400,  800])
    velocidad_agitacion["alta"]     = fuzz.trimf(velocidad_agitacion.universe, [400, 800, 1200])
    velocidad_agitacion["muy_alta"] = fuzz.trimf(velocidad_agitacion.universe, [800, 1200, 1200])

    return {
        "inputs": {
            "tipo_ropa": tipo_ropa,
            "nivel_suciedad": nivel_suciedad,
            "masa_ropa": masa_ropa,
        },
        "outputs": {
            "tiempo_ciclo": tiempo_ciclo,
            "temperatura_agua": temperatura_agua,
            "cantidad_detergente": cantidad_detergente,
            "velocidad_agitacion": velocidad_agitacion,
        },
    }
