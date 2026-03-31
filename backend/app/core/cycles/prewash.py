"""
prewash.py — Ciclo de Prelavado
Primer ciclo del proceso. Usa agua fría y menos detergente
para aflojar la suciedad antes del lavado principal.
"""

from .base import BaseCycle


class PrewashCycle(BaseCycle):
    """
    Ciclo de Prelavado.

    Ajustes aplicados sobre engine_output:
    - Temperatura reducida (agua fría/tibia) — nunca supera 30 °C
    - Tiempo corto (40 % del tiempo base)
    - Nivel de agua al 60 % del valor base
    - Detergente reducido al 30 % del valor base
    - Sin centrifugado (spin_speed = 0)
    """

    # Parámetros de ajuste del ciclo
    _TEMP_MAX        = 30.0   # °C máximo permitido en prelavado
    _TIME_FACTOR     = 0.40   # fracción del wash_time base
    _WATER_FACTOR    = 0.60   # fracción del water_level base
    _DETERGENT_FACTOR = 0.30  # fracción del detergent base
    _SPIN_SPEED      = 0      # sin centrifugado en prelavado

    def get_params(self) -> dict:
        return {
            "cycle": "prewash",
            "temp_max_celsius": self._TEMP_MAX,
            "time_factor": self._TIME_FACTOR,
            "water_factor": self._WATER_FACTOR,
            "detergent_factor": self._DETERGENT_FACTOR,
            "spin_speed_rpm": self._SPIN_SPEED,
        }

    def execute(self) -> dict:
        e = self.engine_output

        temperature = self._clamp(
            e["temperature"] * 0.5,   # reducción agresiva de temperatura
            0.0,
            self._TEMP_MAX,
        )
        wash_time   = round(e["wash_time"] * self._TIME_FACTOR, 2)
        water_level = self._clamp(e["water_level"] * self._WATER_FACTOR, 0.0, 100.0)
        detergent   = self._clamp(e["detergent"] * self._DETERGENT_FACTOR, 0.0, 100.0)
        spin_speed  = self._SPIN_SPEED

        return {
            "cycle": "prewash",
            "temperature": round(temperature, 2),
            "wash_time": wash_time,
            "water_level": round(water_level, 2),
            "detergent": round(detergent, 2),
            "spin_speed": spin_speed,
        }
