from .base import BaseCycle

class RinseCycle(BaseCycle):

    def execute(self) -> dict:
        # Enjuague: menos tiempo, misma agua
        self.result = {
            "water_level": self.engine_output.get("water_level", 0),
            "time": self.engine_output.get("time", 0) * 0.7,
            "agitation": self.engine_output.get("agitation", 0) * 0.5,
        }
        return self.result

    def get_params(self) -> dict:
        return self.result