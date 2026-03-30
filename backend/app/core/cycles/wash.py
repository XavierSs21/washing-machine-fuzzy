from .base import BaseCycle


class WashCycle(BaseCycle):

    def execute(self) -> dict:
        # Lavado principal (valores completos)
        self.result = {
            "water_level": self.engine_output.get("water_level", 0),
            "time": self.engine_output.get("time", 0),
            "agitation": self.engine_output.get("agitation", 0),
        }
        return self.result

    def get_params(self) -> dict:
        return self.result
