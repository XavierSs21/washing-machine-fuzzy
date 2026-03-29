from fastapi import APIRouter, HTTPException
from app.models.simulation import SimulationRequest, SimulationResponse, CycleResult
from app.core.fuzzy.engine import FuzzyEngine

router = APIRouter()

try:
    engine = FuzzyEngine()
except Exception as e:
    raise RuntimeError(f"No se pudo inicializar FuzzyEngine: {e}")


@router.post(
    "/simulate",
    response_model=SimulationResponse,
    summary="Simular ciclo de lavado",
    description="""
Ejecuta el motor difuso con los parámetros de la ropa y devuelve los
tiempos recomendados para cada ciclo del proceso de lavado.

**Rangos válidos de entrada:**
- `tipo_ropa`: 0–100 (0 = delicada, 100 = resistente)
- `nivel_suciedad`: 0–100 (0 = limpia, 100 = muy sucia)
- `masa_ropa`: 0–10 kg

**Ejemplos de prueba:**
- Ropa delicada:   `{"tipo_ropa": 10, "nivel_suciedad": 10, "masa_ropa": 1}`
- Ropa normal:     `{"tipo_ropa": 50, "nivel_suciedad": 50, "masa_ropa": 5}`
- Ropa resistente: `{"tipo_ropa": 90, "nivel_suciedad": 90, "masa_ropa": 9}`
""",
)
def simulate(request: SimulationRequest) -> SimulationResponse:
   
    # Pydantic ya valida ge/le, pero dejamos esto para mensajes en español
    if not (0 <= request.tipo_ropa <= 100):
        raise HTTPException(status_code=422, detail="tipo_ropa debe estar entre 0 y 100.")
    if not (0 <= request.nivel_suciedad <= 100):
        raise HTTPException(status_code=422, detail="nivel_suciedad debe estar entre 0 y 100.")
    if not (0 <= request.masa_ropa <= 10):
        raise HTTPException(status_code=422, detail="masa_ropa debe estar entre 0 y 10 kg.")

    try:
        cycles = engine.run(
            tipo_ropa=request.tipo_ropa,
            nivel_suciedad=request.nivel_suciedad,
            masa_ropa=request.masa_ropa,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el motor difuso: {str(e)}")

    try:
        def to_cycle(nombre: str) -> CycleResult:
            c = cycles[nombre]
            return CycleResult(
                nombre=nombre,
                tiempo_ciclo=c["tiempo_ciclo"],
                temperatura_agua=c["temperatura_agua"],
                cantidad_detergente=c["cantidad_detergente"],
                velocidad_agitacion=c["velocidad_agitacion"],
                duracion_animacion=c["duracion_animacion"],
            )

        prelavado    = to_cycle("prelavado")
        lavado       = to_cycle("lavado")
        enjuague     = to_cycle("enjuague")
        centrifugado = to_cycle("centrifugado")

        tiempo_total = round(
            prelavado.tiempo_ciclo + lavado.tiempo_ciclo +
            enjuague.tiempo_ciclo + centrifugado.tiempo_ciclo,
            2
        )

        return SimulationResponse(
            prelavado=prelavado,
            lavado=lavado,
            enjuague=enjuague,
            centrifugado=centrifugado,
            tiempo_total=tiempo_total,
        )

    except KeyError as e:
        raise HTTPException(
            status_code=500,
            detail=f"El motor no retornó el campo esperado: {str(e)}"
        )
        #
        