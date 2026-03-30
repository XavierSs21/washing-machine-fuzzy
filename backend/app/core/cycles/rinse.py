"""
rinse.py — Ciclo de Enjuague
Elimina los residuos de detergente con agua fría y sin detergente.
Puede repetirse varias veces según la carga detectada.
"""

from .base import BaseCycle


class RinseCycle(BaseCycle):
    """
    Ciclo de Enjuague.

    Ajustes aplicados sobre engine_output:
    - Temperatura baja (agua fría, máximo 20 °C)
    - Tiempo corto-medio (50 % del tiempo base)
    - Nivel de agua alto (110 % del base, para asegurar enjuague completo,
      limitado a 100)
    - Sin detergente
    - Centrifugado suave al final (400 RPM) para escurrir el agua de enjuague

    Parámetros adicionales
    ----------------------
    repeat : int
        Número de repeticiones del ciclo (1–3). Por defecto 1.
        Se incrementa automáticamente si detergent del engine_output > 60.
    """

    _TEMP_MAX         = 20.0   # °C máximo en enjuague
    _TIME_FACTOR      = 0.50   # fracción del wash_time base
    _WATER_FACTOR     = 1.10   # nivel de agua elevado para mejor enjuague
    _DETERGENT        = 0.0    # sin detergente
    _SPIN_SPEED_FINAL = 400    # RPM suaves al terminar el enjuague
    _HIGH_DETERGENT_THRESHOLD = 60  # si detergent base supera esto, repetir

    def __init__(self, engine_output: dict, repeat: int = 1):
        super().__init__(engine_output)
        self.repeat = self._calculate_repeats(repeat)

    def _calculate_repeats(self, base_repeat: int) -> int:
        """Incrementa las repeticiones si el nivel de detergente es alto."""
        if self.engine_output["detergent"] > self._HIGH_DETERGENT_THRESHOLD:
            return min(base_repeat + 1, 3)
        return max(1, min(base_repeat, 3))

    def get_params(self) -> dict:
        return {
            "cycle": "rinse",
            "temp_max_celsius": self._TEMP_MAX,
            "time_factor": self._TIME_FACTOR,
            "water_factor": self._WATER_FACTOR,
            "detergent": self._DETERGENT,
            "spin_speed_final_rpm": self._SPIN_SPEED_FINAL,
            "repeat": self.repeat,
            "high_detergent_threshold": self._HIGH_DETERGENT_THRESHOLD,
        }

    def execute(self) -> dict:
        e = self.engine_output

        temperature = self._clamp(e["temperature"] * 0.2, 0.0, self._TEMP_MAX)
        wash_time   = round(e["wash_time"] * self._TIME_FACTOR * self.repeat, 2)
        water_level = self._clamp(e["water_level"] * self._WATER_FACTOR, 0.0, 100.0)

        return {
            "cycle": "rinse",
            "temperature": round(temperature, 2),
            "wash_time": wash_time,
            "water_level": round(water_level, 2),
            "detergent": self._DETERGENT,
            "spin_speed": self._SPIN_SPEED_FINAL,
            "repeat": self.repeat,
        }
