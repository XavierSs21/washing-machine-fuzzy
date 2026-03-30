from .base import BaseCycle


class SpinCycle(BaseCycle):

    def execute(self) -> dict:
        # Centrifugado: sin agua, alta velocidad
        self.result = {
            "water_level": 0,
            "time": self.engine_output.get("time", 0) * 0.6,
            "spin_speed": self.engine_output.get("agitation", 0) * 1.5,
        }
        return self.result

    def get_params(self) -> dict:
        return self.result
