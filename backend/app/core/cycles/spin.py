"""
spin.py — Ciclo de Centrifugado
Último ciclo del proceso. Extrae el agua residual de la ropa
mediante alta velocidad de rotación. Sin agua ni detergente.
"""

from .base import BaseCycle


class SpinCycle(BaseCycle):
    """
    Ciclo de Centrifugado Final.

    Ajustes aplicados sobre engine_output:
    - Sin temperatura (ambiente, motor frío)
    - Tiempo muy corto (20 % del tiempo base)
    - Sin agua
    - Sin detergente
    - Velocidad de centrifugado al 100 % del valor del motor difuso,
      ajustada al rango permitido [400, 1600] RPM

    La velocidad final de centrifugado se clasifica en tres modos:
        suave  : spin_speed ≤ 600  RPM  → ropa delicada
        normal : spin_speed ≤ 1000 RPM  → uso general
        fuerte : spin_speed >  1000 RPM → cargas pesadas
    """

    _TEMP             = 0.0   # sin calentamiento
    _TIME_FACTOR      = 0.20  # ciclo muy corto
    _WATER_LEVEL      = 0.0   # sin agua
    _DETERGENT        = 0.0   # sin detergente
    _SPIN_MIN         = 400   # RPM mínimo seguro
    _SPIN_MAX         = 1600  # RPM máximo permitido

    def _classify_spin(self, speed: float) -> str:
        if speed <= 600:
            return "suave"
        elif speed <= 1000:
            return "normal"
        return "fuerte"

    def get_params(self) -> dict:
        return {
            "cycle": "spin",
            "temperature": self._TEMP,
            "time_factor": self._TIME_FACTOR,
            "water_level": self._WATER_LEVEL,
            "detergent": self._DETERGENT,
            "spin_min_rpm": self._SPIN_MIN,
            "spin_max_rpm": self._SPIN_MAX,
        }

    def execute(self) -> dict:
        e = self.engine_output

        spin_speed = self._clamp(e["spin_speed"], self._SPIN_MIN, self._SPIN_MAX)
        wash_time  = round(e["wash_time"] * self._TIME_FACTOR, 2)

        return {
            "cycle": "spin",
            "temperature": self._TEMP,
            "wash_time": wash_time,
            "water_level": self._WATER_LEVEL,
            "detergent": self._DETERGENT,
            "spin_speed": round(spin_speed, 2),
            "spin_mode": self._classify_spin(spin_speed),
        }
