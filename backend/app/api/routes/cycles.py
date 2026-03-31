
import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.models.simulation import SimulationResponse
from app.core.fuzzy.engine import FuzzyEngine

router = APIRouter()

CYCLES_METADATA = [
    {
        "id": "prelavado", "nombre": "Prelavado", "color": "#378ADD",
        "descripcion": "Remojo inicial para aflojar suciedad."
    },
    {
        "id": "lavado", "nombre": "Lavado", "color": "#1D9E75",
        "descripcion": "Ciclo principal con detergente."
    },
    {
        "id": "enjuague", "nombre": "Enjuague", "color": "#7F77DD",
        "descripcion": "Elimina restos de jabón."
    },
    {
        "id": "centrifugado", "nombre": "Centrifugado", "color": "#D85A30",
        "descripcion": "Extrae el agua de la ropa."
    },
]


@router.get(
    "/cycles",
    summary="Obtener metadata de ciclos",
    description="""
Retorna la lista de los 4 ciclos del proceso de lavado con su nombre,
color (hex) para el frontend y descripción breve. No requiere parámetros.
""",
)
def get_cycles() -> list[dict]:

    return CYCLES_METADATA

_engine = FuzzyEngine()

@router.get(
    "/membership",
    summary="Obtener funciones de membresía",
    description="Retorna los universos y funciones de membresía de todas las variables.",
)
def get_membership() -> dict:
    return _engine.get_membership_data()
    
    
@router.websocket("/ws/simulation")
async def websocket_simulation(websocket: WebSocket):

    await websocket.accept()

    try:
        raw = await websocket.receive_text()

        try:
            data = SimulationResponse(**json.loads(raw))
        except (json.JSONDecodeError, ValueError) as e:
            await websocket.send_text(json.dumps({"error": f"JSON inválido: {str(e)}"}))
            await websocket.close(code=1003)
            return

        # Cada ciclo es un CycleResult — accedemos a .tiempo_ciclo (minutos)
        # y lo convertimos a segundos para la animación
        ciclos = [
            ("prelavado",    data.prelavado.tiempo_ciclo    * 60),
            ("lavado",       data.lavado.tiempo_ciclo       * 60),
            ("enjuague",     data.enjuague.tiempo_ciclo     * 60),
            ("centrifugado", data.centrifugado.tiempo_ciclo * 60),
        ]

        tick = 0.5  # segundos entre cada emisión

        for nombre_ciclo, duracion_seg in ciclos:
            if duracion_seg <= 0:
                continue

            elapsed = 0.0
            while elapsed < duracion_seg:
                progreso = min(elapsed / duracion_seg, 1.0)
                restante = max(int(duracion_seg - elapsed), 0)

                await websocket.send_text(json.dumps({
                    "ciclo":               nombre_ciclo,
                    "progreso":            round(progreso, 3),
                    "tiempo_restante_seg": restante,
                    "completado":          False,
                }))

                await asyncio.sleep(tick)
                elapsed += tick

        await websocket.send_text(json.dumps({
            "ciclo":               "centrifugado",
            "progreso":            1.0,
            "tiempo_restante_seg": 0,
            "completado":          True,
        }))

    except WebSocketDisconnect:
        pass  # Cliente desconectado — comportamiento normal
    except Exception as e:
        try:
            await websocket.send_text(json.dumps({"error": f"Error interno: {str(e)}"}))
        except Exception:
            pass  # Si no se pudo notificar, simplemente cerramos
