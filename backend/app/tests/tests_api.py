from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# Health check
def test_health():
    """El servidor responde y está vivo."""
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


# POST /api/simulate — casos válidos

def test_simulate_ropa_delicada():
    """Ropa delicada: valores bajos generan tiempos cortos."""
    r = client.post("/api/simulate", json={
        "tipo_ropa": 10,
        "nivel_suciedad": 10,
        "masa_ropa": 1
    })
    assert r.status_code == 200
    data = r.json()

    for ciclo in ("prelavado", "lavado", "enjuague", "centrifugado"):
        assert ciclo in data

    for ciclo in ("prelavado", "lavado", "enjuague", "centrifugado"):
        assert "tiempo_ciclo" in data[ciclo]
        assert "temperatura_agua" in data[ciclo]
        assert "cantidad_detergente" in data[ciclo]
        assert "velocidad_agitacion" in data[ciclo]
        assert "duracion_animacion" in data[ciclo]

    assert "tiempo_total" in data
    assert data["tiempo_total"] > 0


def test_simulate_ropa_normal():
    """Ropa normal: valores medios generan respuesta válida."""
    r = client.post("/api/simulate", json={
        "tipo_ropa": 50,
        "nivel_suciedad": 50,
        "masa_ropa": 5
    })
    assert r.status_code == 200
    data = r.json()

    assert data["lavado"]["tiempo_ciclo"] > 0
    assert data["tiempo_total"] > 0


def test_simulate_ropa_resistente():
    """Ropa resistente: valores altos generan tiempos mayores que ropa delicada."""
    r_delicada = client.post("/api/simulate", json={
        "tipo_ropa": 10, "nivel_suciedad": 10, "masa_ropa": 1
    })
    r_resistente = client.post("/api/simulate", json={
        "tipo_ropa": 90, "nivel_suciedad": 90, "masa_ropa": 9
    })

    assert r_delicada.status_code == 200
    assert r_resistente.status_code == 200
    assert r_resistente.json()["tiempo_total"] > r_delicada.json()["tiempo_total"]


def test_simulate_tiempo_total_es_suma_de_ciclos():
    """tiempo_total debe ser igual a la suma de los 4 tiempo_ciclo."""
    r = client.post("/api/simulate", json={
        "tipo_ropa": 50,
        "nivel_suciedad": 50,
        "masa_ropa": 5
    })
    assert r.status_code == 200
    data = r.json()

    tiempos = [
        data["prelavado"]["tiempo_ciclo"],
        data["lavado"]["tiempo_ciclo"],
        data["enjuague"]["tiempo_ciclo"],
        data["centrifugado"]["tiempo_ciclo"],
    ]
    suma = round(sum(tiempos), 2)
    assert data["tiempo_total"] == suma


# POST /api/simulate — casos inválidos

def test_simulate_tipo_ropa_fuera_de_rango():
    """tipo_ropa > 100 debe retornar 422."""
    r = client.post("/api/simulate", json={
        "tipo_ropa": 200,
        "nivel_suciedad": 50,
        "masa_ropa": 5
    })
    assert r.status_code == 422


def test_simulate_nivel_suciedad_negativo():
    """nivel_suciedad negativo debe retornar 422."""
    r = client.post("/api/simulate", json={
        "tipo_ropa": 50,
        "nivel_suciedad": -10,
        "masa_ropa": 5
    })
    assert r.status_code == 422


def test_simulate_masa_fuera_de_rango():
    """masa_ropa > 10 debe retornar 422."""
    r = client.post("/api/simulate", json={
        "tipo_ropa": 50,
        "nivel_suciedad": 50,
        "masa_ropa": 99
    })
    assert r.status_code == 422


def test_simulate_campos_faltantes():
    """JSON sin campos requeridos debe retornar 422."""
    r = client.post("/api/simulate", json={
        "tipo_ropa": 50
    })
    assert r.status_code == 422


def test_simulate_body_vacio():
    """Body vacío debe retornar 422."""
    r = client.post("/api/simulate", json={})
    assert r.status_code == 422


# GET /api/cycles

def test_get_cycles_retorna_lista():
    """Debe retornar una lista con exactamente 4 ciclos."""
    r = client.get("/api/cycles")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 4


def test_get_cycles_estructura():
    """Cada ciclo debe tener id, nombre, color y descripcion."""
    r = client.get("/api/cycles")
    assert r.status_code == 200
    for ciclo in r.json():
        assert "id" in ciclo
        assert "nombre" in ciclo
        assert "color" in ciclo
        assert "descripcion" in ciclo


def test_get_cycles_ids_correctos():
    """Los ids deben ser exactamente los 4 ciclos esperados."""
    r = client.get("/api/cycles")
    ids = [c["id"] for c in r.json()]
    assert ids == ["prelavado", "lavado", "enjuague", "centrifugado"]


# WS /api/ws/simulation

def test_websocket_emite_ticks():
    """El WebSocket debe emitir al menos un tick con la estructura correcta."""
    sim = client.post("/api/simulate", json={
        "tipo_ropa": 50,
        "nivel_suciedad": 50,
        "masa_ropa": 5
    })
    assert sim.status_code == 200

    with client.websocket_connect("/api/ws/simulation") as ws:
        ws.send_text(sim.text)
        tick = ws.receive_json()

        assert "ciclo" in tick
        assert "progreso" in tick
        assert "tiempo_restante_seg" in tick
        assert "completado" in tick
        assert tick["ciclo"] in ("prelavado", "lavado", "enjuague", "centrifugado")
        assert 0.0 <= tick["progreso"] <= 1.0


def test_websocket_json_invalido():
    """JSON malformado debe retornar un mensaje de error."""
    with client.websocket_connect("/api/ws/simulation") as ws:
        ws.send_text("esto no es json {{{")
        response = ws.receive_json()
    assert "error" in response

