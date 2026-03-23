import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


@router.get("/cycles")
def get_cycles():
    """Retorna metadata de los 4 ciclos."""
    return {
        "cycles": [
            {"id": "prelavado",    "label": "Prelavado",    "color": "#60a5fa", "order": 1},
            {"id": "lavado",       "label": "Lavado",       "color": "#34d399", "order": 2},
            {"id": "enjuague",     "label": "Enjuague",     "color": "#a78bfa", "order": 3},
            {"id": "centrifugado", "label": "Centrifugado", "color": "#f472b6", "order": 4},
        ]
    }


@router.websocket("/ws/simulation")
async def simulation_ws(websocket: WebSocket):
    """
    WebSocket para streaming del estado de la simulación.
    El frontend envía el JSON de SimulationResponse y este
    endpoint emite ticks cada 500ms con el progreso de cada ciclo.
    """
    await websocket.accept()
    try:
        raw = await websocket.receive_text()
        simulation_data = json.loads(raw)

        cycle_order = ["prelavado", "lavado", "enjuague", "centrifugado"]

        for cycle_name in cycle_order:
            cycle = simulation_data.get(cycle_name, {})
            duration = cycle.get("duracion_animacion", 5)
            ticks = max(int(duration / 0.5), 1)

            for tick in range(ticks + 1):
                progress = round((tick / ticks) * 100, 1)
                await websocket.send_json({
                    "cycle":    cycle_name,
                    "progress": progress,
                    "metrics": {
                        "temperatura_agua":    cycle.get("temperatura_agua"),
                        "velocidad_agitacion": cycle.get("velocidad_agitacion"),
                        "cantidad_detergente": cycle.get("cantidad_detergente"),
                    },
                    "done": progress >= 100,
                })
                await asyncio.sleep(0.5)

        await websocket.send_json({"cycle": "finished", "progress": 100, "done": True})

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({"error": str(e)})
