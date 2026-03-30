from abc import ABC, abstractmethod


class BaseCycle(ABC):
    def __init__(self, engine_output: dict):
        self.engine_output = engine_output
        self.result = {}

    @abstractmethod
    def execute(self) -> dict:
        """Ejecuta la lógica del ciclo"""
        pass

    @abstractmethod
    def get_params(self) -> dict:
        """Devuelve los parámetros finales del ciclo"""
        pass
