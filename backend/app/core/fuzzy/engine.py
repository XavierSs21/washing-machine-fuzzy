"""
engine.py — Motor principal del sistema difuso (Mamdani).

Flujo:
  1. build_variables()  → universos + MFs precalculadas
  2. build_rules()      → 27 reglas como dicts
  3. FuzzyEngine.run()  → fuzzifica, infiere, defuzzifica
  4. Retorna dict con los 4 outputs numéricos por ciclo
"""

import numpy as np
from app.core.fuzzy.variables import build_variables
from app.core.fuzzy.rules import build_rules
from app.core.fuzzy.defuzz import centroid

# Factor de compresión por ciclo (para la animación)
COMPRESSION = {
    "prelavado": 6,
    "lavado": 4,
    "enjuague": 5,
    "centrifugado": 8,
}


class FuzzyEngine:
    def __init__(self):
        vars_ = build_variables()
        self._inputs = vars_["inputs"]
        self._outputs = vars_["outputs"]
        self._rules = build_rules()

    def _fuzzify_inputs(self, values: dict) -> dict:
        """
        Calcula el grado de membresía de cada término para cada entrada.

        Args:
            values: {"tipo_ropa": float, "nivel_suciedad": float, "masa_ropa": float}

        Returns:
            {"tipo_ropa": {"delicada": float, "normal": float, ...}, ...}
        """
        result = {}
        for var_name, value in values.items():
            var = self._inputs[var_name]
            result[var_name] = {}
            for term_name, mf_array in var["terms"].items():
                result[var_name][term_name] = float(
                    np.interp(value, var["universe"], mf_array)
                )
        return result

    def run(self, tipo_ropa: float, nivel_suciedad: float, masa_ropa: float) -> dict:
        """
        Ejecuta el sistema difuso con las entradas del usuario.
        Retorna un dict con los resultados para los 4 ciclos.
        """
        # 1. FUZZIFICACIÓN
        memberships = self._fuzzify_inputs(
            {
                "tipo_ropa": tipo_ropa,
                "nivel_suciedad": nivel_suciedad,
                "masa_ropa": masa_ropa,
            }
        )

        # Preparar arrays agregados para cada salida (inicializados en 0)
        aggregated = {}
        for out_name, out_var in self._outputs.items():
            aggregated[out_name] = np.zeros_like(out_var["universe"], dtype=float)

        # 2-4. EVALUACIÓN DE REGLAS + IMPLICACIÓN + AGREGACIÓN
        for rule in self._rules:
            ant = rule["antecedents"]
            con = rule["consequents"]

            # Firing strength = min de los grados de membresía de los antecedentes
            firing = min(
                memberships["tipo_ropa"][ant["tipo_ropa"]],
                memberships["nivel_suciedad"][ant["nivel_suciedad"]],
                memberships["masa_ropa"][ant["masa_ropa"]],
            )

            if firing == 0:
                continue

            # Implicación (min) y agregación (max) para cada salida
            for out_name, term_name in con.items():
                mf = self._outputs[out_name]["terms"][term_name]
                clipped = np.minimum(firing, mf)
                aggregated[out_name] = np.maximum(aggregated[out_name], clipped)

        # 5. DEFUZZIFICACIÓN (centroide)
        base = {}
        for out_name, out_var in self._outputs.items():
            universe = out_var["universe"]
            agg = aggregated[out_name]
            if np.sum(agg) == 0:
                base[out_name] = float(universe[len(universe) // 2])
            else:
                base[out_name] = centroid(universe, agg)

        base_tc = base["tiempo_ciclo"]
        base_ta = base["temperatura_agua"]
        base_cd = base["cantidad_detergente"]
        base_va = base["velocidad_agitacion"]

        # Cada ciclo ajusta los outputs base según su naturaleza
        cycles = {
            "prelavado": {
                "tiempo_ciclo": round(base_tc * 0.5, 2),
                "temperatura_agua": round(base_ta * 0.7, 2),
                "cantidad_detergente": round(base_cd * 0.3, 2),
                "velocidad_agitacion": round(base_va * 0.6, 2),
            },
            "lavado": {
                "tiempo_ciclo": round(base_tc, 2),
                "temperatura_agua": round(base_ta, 2),
                "cantidad_detergente": round(base_cd, 2),
                "velocidad_agitacion": round(base_va, 2),
            },
            "enjuague": {
                "tiempo_ciclo": round(base_tc * 0.7, 2),
                "temperatura_agua": round(base_ta * 0.5, 2),
                "cantidad_detergente": 0.0,
                "velocidad_agitacion": round(base_va * 0.7, 2),
            },
            "centrifugado": {
                "tiempo_ciclo": round(base_tc * 0.3, 2),
                "temperatura_agua": 20.0,
                "cantidad_detergente": 0.0,
                "velocidad_agitacion": round(min(base_va * 1.5, 1200), 2),
            },
        }

        # Añadir duración de animación comprimida
        for nombre, factor in COMPRESSION.items():
            tc = cycles[nombre]["tiempo_ciclo"]
            cycles[nombre]["duracion_animacion"] = round(tc / factor, 2)

        return cycles

    def get_membership_data(self) -> dict:
        """Exporta los universos y funciones de membresía para los charts."""
        data = {}
        for name, var in {**self._inputs, **self._outputs}.items():
            data[name] = {
                "universe": var["universe"].tolist(),
                "terms": {term: mf.tolist() for term, mf in var["terms"].items()},
            }
        return data
