from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    tipo_ropa: float = Field(
        ..., ge=0, le=100, description="0=delicada, 50=normal, 100=resistente"
    )
    nivel_suciedad: float = Field(
        ..., ge=0, le=100, description="0=baja, 50=media, 100=alta"
    )
    masa_ropa: float = Field(..., ge=0, le=10, description="kg de ropa")

    class Config:
        json_schema_extra = {
            "example": {
                "tipo_ropa": 50,
                "nivel_suciedad": 60,
                "masa_ropa": 4.5,
            }
        }


class CycleResult(BaseModel):
    nombre: str
    tiempo_ciclo: float  # minutos
    temperatura_agua: float  # °C
    cantidad_detergente: float  # ml
    velocidad_agitacion: float  # rpm
    duracion_animacion: float  # segundos (comprimido)


class SimulationResponse(BaseModel):
    prelavado: CycleResult
    lavado: CycleResult
    enjuague: CycleResult
    centrifugado: CycleResult
    tiempo_total: float  # suma de los 4 ciclos en minutos
