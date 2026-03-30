"""
wash.py — Ciclo de Lavado Principal
Ciclo central del proceso. Aplica los valores del motor difuso
casi sin modificar, es el ciclo de mayor duración e intensidad.
"""

from .base import BaseCycle


class WashCycle(BaseCycle):
    """
    Ciclo de Lavado Principal.

    Ajustes aplicados sobre engine_output:
    - Temperatura completa según el motor difuso (hasta 90 °C)
    - Tiempo completo (100 % del valor base)
    - Nivel de agua completo
    - Detergente completo (100 % del valor base)
    - Centrifugado intermedio suave al finalizar (300 RPM fijos) para
      preparar el enjuague
    """

    # Parámetros del ciclo
    _TEMP_MAX          = 90.0   # °C máximo permitido
    _TIME_FACTOR       = 1.00   # usa el tiempo completo
    _WATER_FACTOR      = 1.00   # usa el nivel completo
    _DETERGENT_FACTOR  = 1.00   # detergente completo
    _SPIN_SPEED_FINAL  = 300    # RPM suaves al final del lavado

    def get_params(self) -> dict:
        return {
            "cycle": "wash",
            "temp_max_celsius": self._TEMP_MAX,
            "time_factor": self._TIME_FACTOR,
            "water_factor": self._WATER_FACTOR,
            "detergent_factor": self._DETERGENT_FACTOR,
            "spin_speed_final_rpm": self._SPIN_SPEED_FINAL,
        }

    def execute(self) -> dict:
        e = self.engine_output

        temperature = self._clamp(e["temperature"], 0.0, self._TEMP_MAX)
        wash_time   = round(e["wash_time"] * self._TIME_FACTOR, 2)
        water_level = self._clamp(e["water_level"] * self._WATER_FACTOR, 0.0, 100.0)
        detergent   = self._clamp(e["detergent"] * self._DETERGENT_FACTOR, 0.0, 100.0)

        return {
            "cycle": "wash",
            "temperature": round(temperature, 2),
            "wash_time": wash_time,
            "water_level": round(water_level, 2),
            "detergent": round(detergent, 2),
            "spin_speed": self._SPIN_SPEED_FINAL,
        }
