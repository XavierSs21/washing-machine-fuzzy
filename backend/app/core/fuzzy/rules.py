from skfuzzy import control as ctrl


def build_rules(inputs: dict, outputs: dict) -> list:
    """
    Define las 27+ reglas IF-THEN del sistema difuso.
    Cubre las combinaciones de los 3 inputs (3x3x3 = 27 base).

    Cada regla sigue el patrón:
        IF tipo_ropa IS x AND nivel_suciedad IS y AND masa_ropa IS z
        THEN tiempo_ciclo IS t AND temperatura_agua IS T
             AND cantidad_detergente IS d AND velocidad_agitacion IS v
    """
    tr = inputs["tipo_ropa"]
    ns = inputs["nivel_suciedad"]
    mr = inputs["masa_ropa"]

    tc = outputs["tiempo_ciclo"]
    ta = outputs["temperatura_agua"]
    cd = outputs["cantidad_detergente"]
    va = outputs["velocidad_agitacion"]

    rules = [
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

    return rules  # 27 reglas exactas, una por combinación
