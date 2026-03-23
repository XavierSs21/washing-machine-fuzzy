from fastapi import APIRouter, HTTPException
from app.models.simulation import SimulationRequest, SimulationResponse, CycleResult
from app.core.fuzzy.engine import FuzzyEngine

router = APIRouter()
engine = FuzzyEngine()


@router.post("/simulate", response_model=SimulationResponse)
def simulate(req: SimulationRequest):
    try:
        results = engine.run(
            tipo_ropa=req.tipo_ropa,
            nivel_suciedad=req.nivel_suciedad,
            masa_ropa=req.masa_ropa,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en motor difuso: {str(e)}")

    def make_cycle(nombre: str) -> CycleResult:
        r = results[nombre]
        return CycleResult(
            nombre=nombre,
            tiempo_ciclo=r["tiempo_ciclo"],
            temperatura_agua=r["temperatura_agua"],
            cantidad_detergente=r["cantidad_detergente"],
            velocidad_agitacion=r["velocidad_agitacion"],
            duracion_animacion=r["duracion_animacion"],
        )

    tiempo_total = sum(
        results[c]["tiempo_ciclo"]
        for c in ["prelavado", "lavado", "enjuague", "centrifugado"]
    )

    return SimulationResponse(
        prelavado=make_cycle("prelavado"),
        lavado=make_cycle("lavado"),
        enjuague=make_cycle("enjuague"),
        centrifugado=make_cycle("centrifugado"),
        tiempo_total=round(tiempo_total, 2),
    )


@router.get("/membership")
def get_membership():
    """Retorna funciones de membresía para los charts del frontend."""
    return engine.get_membership_data()
