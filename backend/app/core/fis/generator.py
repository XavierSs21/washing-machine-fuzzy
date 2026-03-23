"""
generator.py — Genera archivo .fis compatible con MATLAB Fuzzy Logic Toolbox.

El formato .fis es texto plano con secciones:
  [System], [Input1..N], [Output1..M], [Rules]
"""


def _trimf_params(pts: list[float]) -> str:
    return f"[{pts[0]} {pts[1]} {pts[2]}]"


def generate_fis() -> str:
    lines = []

    # ── [System] ──────────────────────────────────────────────────────────
    lines += [
        "[System]",
        "Name='WashingMachineFuzzy'",
        "Type='mamdani'",
        "Version=2.0",
        "NumInputs=3",
        "NumOutputs=4",
        "NumRules=27",
        "AndMethod='min'",
        "OrMethod='max'",
        "ImpMethod='min'",
        "AggMethod='max'",
        "DefuzzMethod='centroid'",
        "",
    ]

    # ── [Input1] tipo_ropa ────────────────────────────────────────────────
    lines += [
        "[Input1]",
        "Name='tipo_ropa'",
        "Range=[0 100]",
        "NumMFs=3",
        "MF1='delicada':'trimf',[0 0 50]",
        "MF2='normal':'trimf',[0 50 100]",
        "MF3='resistente':'trimf',[50 100 100]",
        "",
    ]

    # ── [Input2] nivel_suciedad ───────────────────────────────────────────
    lines += [
        "[Input2]",
        "Name='nivel_suciedad'",
        "Range=[0 100]",
        "NumMFs=3",
        "MF1='baja':'trimf',[0 0 50]",
        "MF2='media':'trimf',[0 50 100]",
        "MF3='alta':'trimf',[50 100 100]",
        "",
    ]

    # ── [Input3] masa_ropa ────────────────────────────────────────────────
    lines += [
        "[Input3]",
        "Name='masa_ropa'",
        "Range=[0 10]",
        "NumMFs=3",
        "MF1='ligera':'trimf',[0 0 5]",
        "MF2='media':'trimf',[0 5 10]",
        "MF3='pesada':'trimf',[5 10 10]",
        "",
    ]

    # ── [Output1] tiempo_ciclo ────────────────────────────────────────────
    lines += [
        "[Output1]",
        "Name='tiempo_ciclo'",
        "Range=[0 60]",
        "NumMFs=5",
        "MF1='muy_corto':'trimf',[0 0 15]",
        "MF2='corto':'trimf',[0 15 30]",
        "MF3='medio':'trimf',[15 30 45]",
        "MF4='largo':'trimf',[30 45 60]",
        "MF5='muy_largo':'trimf',[45 60 60]",
        "",
    ]

    # ── [Output2] temperatura_agua ────────────────────────────────────────
    lines += [
        "[Output2]",
        "Name='temperatura_agua'",
        "Range=[20 90]",
        "NumMFs=4",
        "MF1='fria':'trimf',[20 20 40]",
        "MF2='tibia':'trimf',[20 40 60]",
        "MF3='caliente':'trimf',[40 60 80]",
        "MF4='muy_caliente':'trimf',[60 90 90]",
        "",
    ]

    # ── [Output3] cantidad_detergente ─────────────────────────────────────
    lines += [
        "[Output3]",
        "Name='cantidad_detergente'",
        "Range=[0 200]",
        "NumMFs=3",
        "MF1='poca':'trimf',[0 0 100]",
        "MF2='media':'trimf',[0 100 200]",
        "MF3='mucha':'trimf',[100 200 200]",
        "",
    ]

    # ── [Output4] velocidad_agitacion ─────────────────────────────────────
    lines += [
        "[Output4]",
        "Name='velocidad_agitacion'",
        "Range=[0 1200]",
        "NumMFs=4",
        "MF1='baja':'trimf',[0 0 400]",
        "MF2='media':'trimf',[0 400 800]",
        "MF3='alta':'trimf',[400 800 1200]",
        "MF4='muy_alta':'trimf',[800 1200 1200]",
        "",
    ]

    # ── [Rules] ───────────────────────────────────────────────────────────
    # Formato MATLAB: in1 in2 in3, out1 out2 out3 out4 (weight) : operator
    # inputs: tipo_ropa(1=del,2=nor,3=res) nivel_suciedad(1=baj,2=med,3=alt) masa_ropa(1=lig,2=med,3=pes)
    # outputs: tiempo_ciclo(1-5) temperatura_agua(1-4) cantidad_detergente(1-3) velocidad_agitacion(1-4)
    rules_data = [
        # delicada
        "1 1 1, 1 1 1 1 (1) : 1",  # del baja lig → muy_corto fria poca baja
        "1 2 1, 2 2 1 1 (1) : 1",  # del media lig → corto tibia poca baja
        "1 3 2, 3 2 2 1 (1) : 1",  # del alta med → medio tibia media baja
        "1 1 2, 2 1 1 1 (1) : 1",  # del baja med → corto fria poca baja
        "1 2 2, 3 2 2 1 (1) : 1",  # del media med → medio tibia media baja
        "1 1 3, 3 1 2 1 (1) : 1",  # del baja pes → medio fria media baja
        "1 2 3, 3 2 2 1 (1) : 1",  # del media pes → medio tibia media baja
        "1 3 3, 4 1 3 1 (1) : 1",  # del alta pes → largo fria mucha baja
        "1 3 1, 2 2 2 1 (1) : 1",  # del alta lig → corto tibia media baja
        # normal
        "2 1 2, 3 2 1 2 (1) : 1",  # nor baja med → medio tibia poca media
        "2 2 2, 3 3 2 2 (1) : 1",  # nor media med → medio caliente media media
        "2 3 3, 4 3 3 3 (1) : 1",  # nor alta pes → largo caliente mucha alta
        "2 3 1, 3 3 2 2 (1) : 1",  # nor alta lig → medio caliente media media
        "2 1 1, 2 2 1 1 (1) : 1",  # nor baja lig → corto tibia poca baja
        "2 2 1, 3 3 2 2 (1) : 1",  # nor media lig → medio caliente media media
        "2 1 3, 3 2 2 2 (1) : 1",  # nor baja pes → medio tibia media media
        "2 2 3, 4 3 2 3 (1) : 1",  # nor media pes → largo caliente media alta
        "2 3 2, 4 3 3 3 (1) : 1",  # nor alta med → largo caliente mucha alta
        # resistente
        "3 1 3, 3 3 2 3 (1) : 1",  # res baja pes → medio caliente media alta
        "3 2 3, 4 4 3 3 (1) : 1",  # res media pes → largo muy_cal mucha alta
        "3 3 3, 5 4 3 4 (1) : 1",  # res alta pes → muy_largo muy_cal mucha muy_alta
        "3 1 1, 2 2 1 2 (1) : 1",  # res baja lig → corto tibia poca media
        "3 2 2, 4 3 2 3 (1) : 1",  # res media med → largo caliente media alta
        "3 3 1, 4 4 2 3 (1) : 1",  # res alta lig → largo muy_cal media alta
        "3 1 2, 3 3 1 3 (1) : 1",  # res baja med → medio caliente poca alta
        "3 2 1, 3 3 2 3 (1) : 1",  # res media lig → medio caliente media alta
        "3 3 2, 5 4 3 4 (1) : 1",  # res alta med → muy_largo muy_cal mucha muy_alta
    ]

    lines.append("[Rules]")
    lines.extend(rules_data)

    return "\n".join(lines)
