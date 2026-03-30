from .base import BaseCycle


class PreWashCycle(BaseCycle):

    def execute(self) -> dict:
        # Ajustes típicos de prelavado
        self.result = {
            "water_level": self.engine_output.get("water_level", 0) * 0.8,
            "time": self.engine_output.get("time", 0) * 0.5,
            "agitation": self.engine_output.get("agitation", 0) * 0.6,
        }
        return self.result

    def get_params(self) -> dict:
        return self.result
