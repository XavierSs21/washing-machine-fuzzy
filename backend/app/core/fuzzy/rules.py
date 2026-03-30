"""
rules.py — Define las 27 reglas IF-THEN del sistema difuso.

Cada regla es un dict con "antecedents" y "consequents" que mapean
nombres de variables a nombres de términos lingüísticos.
"""


def build_rules() -> list:
    """
    Retorna las 27 reglas como lista de dicts.

    Cada regla:
        {
            "antecedents": {
                "tipo_ropa": str,
                "nivel_suciedad": str,
                "masa_ropa": str,
            },
            "consequents": {
                "tiempo_ciclo": str,
                "temperatura_agua": str,
                "cantidad_detergente": str,
                "velocidad_agitacion": str,
            },
        }
    """

    def rule(tr, ns, mr, tc, ta, cd, va):
        return {
            "antecedents": {
                "tipo_ropa": tr,
                "nivel_suciedad": ns,
                "masa_ropa": mr,
            },
            "consequents": {
                "tiempo_ciclo": tc,
                "temperatura_agua": ta,
                "cantidad_detergente": cd,
                "velocidad_agitacion": va,
            },
        }

    return [
        # ── DELICADA ──────────────────────────────────────────────────────
        rule("delicada", "baja", "ligera", "muy_corto", "fria", "poca", "baja"),
        rule("delicada", "media", "ligera", "corto", "tibia", "poca", "baja"),
        rule("delicada", "alta", "media", "medio", "tibia", "media", "baja"),
        rule("delicada", "baja", "media", "corto", "fria", "poca", "baja"),
        rule("delicada", "media", "media", "medio", "tibia", "media", "baja"),
        rule("delicada", "baja", "pesada", "medio", "fria", "media", "baja"),
        rule("delicada", "media", "pesada", "medio", "tibia", "media", "baja"),
        rule("delicada", "alta", "pesada", "largo", "fria", "mucha", "baja"),
        rule("delicada", "alta", "ligera", "corto", "tibia", "media", "baja"),
        # ── NORMAL ────────────────────────────────────────────────────────
        rule("normal", "baja", "media", "medio", "tibia", "poca", "media"),
        rule("normal", "media", "media", "medio", "caliente", "media", "media"),
        rule("normal", "alta", "pesada", "largo", "caliente", "mucha", "alta"),
        rule("normal", "alta", "ligera", "medio", "caliente", "media", "media"),
        rule("normal", "baja", "ligera", "corto", "tibia", "poca", "baja"),
        rule("normal", "media", "ligera", "medio", "caliente", "media", "media"),
        rule("normal", "baja", "pesada", "medio", "tibia", "media", "media"),
        rule("normal", "media", "pesada", "largo", "caliente", "media", "alta"),
        rule("normal", "alta", "media", "largo", "caliente", "mucha", "alta"),
        # ── RESISTENTE ────────────────────────────────────────────────────
        rule("resistente", "baja", "pesada", "medio", "caliente", "media", "alta"),
        rule("resistente", "media", "pesada", "largo", "muy_caliente", "mucha", "alta"),
        rule(
            "resistente",
            "alta",
            "pesada",
            "muy_largo",
            "muy_caliente",
            "mucha",
            "muy_alta",
        ),
        rule("resistente", "baja", "ligera", "corto", "tibia", "poca", "media"),
        rule("resistente", "media", "media", "largo", "caliente", "media", "alta"),
        rule("resistente", "alta", "ligera", "largo", "muy_caliente", "media", "alta"),
        rule("resistente", "baja", "media", "medio", "caliente", "poca", "alta"),
        rule("resistente", "media", "ligera", "medio", "caliente", "media", "alta"),
        rule(
            "resistente",
            "alta",
            "media",
            "muy_largo",
            "muy_caliente",
            "mucha",
            "muy_alta",
        ),
    ]
