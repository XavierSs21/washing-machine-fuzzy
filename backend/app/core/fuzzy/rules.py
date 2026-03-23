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
        # CB01: delicada, baja, ligera
        ctrl.Rule(tr["delicada"] & ns["baja"] & mr["ligera"],
                  (tc["muy_corto"], ta["fria"], cd["poca"], va["baja"])),

        # CB02: delicada, media, ligera
        ctrl.Rule(tr["delicada"] & ns["media"] & mr["ligera"],
                  (tc["corto"], ta["tibia"], cd["poca"], va["baja"])),

        # CB03: delicada, alta, media
        ctrl.Rule(tr["delicada"] & ns["alta"] & mr["media"],
                  (tc["medio"], ta["tibia"], cd["media"], va["baja"])),

        # delicada, baja, media
        ctrl.Rule(tr["delicada"] & ns["baja"] & mr["media"],
                  (tc["corto"], ta["fria"], cd["poca"], va["baja"])),

        # delicada, media, media
        ctrl.Rule(tr["delicada"] & ns["media"] & mr["media"],
                  (tc["medio"], ta["tibia"], cd["media"], va["baja"])),

        # CB10: delicada, baja, pesada
        ctrl.Rule(tr["delicada"] & ns["baja"] & mr["pesada"],
                  (tc["medio"], ta["fria"], cd["media"], va["baja"])),

        # delicada, media, pesada
        ctrl.Rule(tr["delicada"] & ns["media"] & mr["pesada"],
                  (tc["medio"], ta["tibia"], cd["media"], va["baja"])),

        # CB13: delicada, alta, pesada
        ctrl.Rule(tr["delicada"] & ns["alta"] & mr["pesada"],
                  (tc["largo"], ta["fria"], cd["mucha"], va["baja"])),

        # delicada, alta, ligera
        ctrl.Rule(tr["delicada"] & ns["alta"] & mr["ligera"],
                  (tc["corto"], ta["tibia"], cd["media"], va["baja"])),

        # ── NORMAL ───────────────────────────────────────────────────────
        # CB04: normal, baja, media
        ctrl.Rule(tr["normal"] & ns["baja"] & mr["media"],
                  (tc["medio"], ta["tibia"], cd["poca"], va["media"])),

        # CB05: normal, media, media
        ctrl.Rule(tr["normal"] & ns["media"] & mr["media"],
                  (tc["medio"], ta["caliente"], cd["media"], va["media"])),

        # CB06: normal, alta, pesada
        ctrl.Rule(tr["normal"] & ns["alta"] & mr["pesada"],
                  (tc["largo"], ta["caliente"], cd["mucha"], va["alta"])),

        # CB11: normal, alta, ligera
        ctrl.Rule(tr["normal"] & ns["alta"] & mr["ligera"],
                  (tc["medio"], ta["caliente"], cd["media"], va["media"])),

        # CB14: normal, baja, ligera
        ctrl.Rule(tr["normal"] & ns["baja"] & mr["ligera"],
                  (tc["corto"], ta["tibia"], cd["poca"], va["baja"])),

        # normal, media, ligera
        ctrl.Rule(tr["normal"] & ns["media"] & mr["ligera"],
                  (tc["medio"], ta["caliente"], cd["media"], va["media"])),

        # normal, baja, pesada
        ctrl.Rule(tr["normal"] & ns["baja"] & mr["pesada"],
                  (tc["medio"], ta["tibia"], cd["media"], va["media"])),

        # normal, media, pesada
        ctrl.Rule(tr["normal"] & ns["media"] & mr["pesada"],
                  (tc["largo"], ta["caliente"], cd["media"], va["alta"])),

        # normal, alta, media
        ctrl.Rule(tr["normal"] & ns["alta"] & mr["media"],
                  (tc["largo"], ta["caliente"], cd["mucha"], va["alta"])),

        # ── RESISTENTE ───────────────────────────────────────────────────
        # CB07: resistente, baja, pesada
        ctrl.Rule(tr["resistente"] & ns["baja"] & mr["pesada"],
                  (tc["medio"], ta["caliente"], cd["media"], va["alta"])),

        # CB08: resistente, media, pesada
        ctrl.Rule(tr["resistente"] & ns["media"] & mr["pesada"],
                  (tc["largo"], ta["muy_caliente"], cd["mucha"], va["alta"])),

        # CB09: resistente, alta, pesada
        ctrl.Rule(tr["resistente"] & ns["alta"] & mr["pesada"],
                  (tc["muy_largo"], ta["muy_caliente"], cd["mucha"], va["muy_alta"])),

        # CB12: resistente, baja, ligera
        ctrl.Rule(tr["resistente"] & ns["baja"] & mr["ligera"],
                  (tc["corto"], ta["tibia"], cd["poca"], va["media"])),

        # CB15: resistente, media, media
        ctrl.Rule(tr["resistente"] & ns["media"] & mr["media"],
                  (tc["largo"], ta["caliente"], cd["media"], va["alta"])),

        # resistente, alta, ligera
        ctrl.Rule(tr["resistente"] & ns["alta"] & mr["ligera"],
                  (tc["largo"], ta["muy_caliente"], cd["media"], va["alta"])),

        # resistente, baja, media
        ctrl.Rule(tr["resistente"] & ns["baja"] & mr["media"],
                  (tc["medio"], ta["caliente"], cd["poca"], va["alta"])),

        # resistente, media, ligera
        ctrl.Rule(tr["resistente"] & ns["media"] & mr["ligera"],
                  (tc["medio"], ta["caliente"], cd["media"], va["alta"])),

        # resistente, alta, media
        ctrl.Rule(tr["resistente"] & ns["alta"] & mr["media"],
                  (tc["muy_largo"], ta["muy_caliente"], cd["mucha"], va["muy_alta"])),
    ]

    return rules  # 27 reglas exactas, una por combinación
