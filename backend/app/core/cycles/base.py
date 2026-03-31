"""
base.py — Clase abstracta BaseCycle (Patrón Strategy)
Define el contrato que todos los ciclos de lavado deben cumplir.
"""

from abc import ABC, abstractmethod


class BaseCycle(ABC):
    """
    Clase base abstracta para todos los ciclos de lavado.

    Recibe el output del motor difuso (engine_output) y encapsula
    la lógica de ajuste específica de cada ciclo.

    Parámetros
    ----------
    engine_output : dict
        Diccionario con los valores calculados por el motor difuso.
        Claves esperadas:
            - water_level   : float  — nivel de agua (0–100)
            - temperature   : float  — temperatura en °C
            - wash_time     : float  — tiempo de lavado en minutos
            - spin_speed    : float  — velocidad de centrifugado en RPM
            - detergent     : float  — cantidad de detergente (0–100)
    """

    def __init__(self, engine_output: dict):
        self.engine_output = engine_output
        self._validate_engine_output()

    # ------------------------------------------------------------------
    # Validación
    # ------------------------------------------------------------------

    def _validate_engine_output(self):
        """Verifica que el engine_output contenga las claves mínimas requeridas."""
        required_keys = {"water_level", "temperature", "wash_time", "spin_speed", "detergent"}
        missing = required_keys - self.engine_output.keys()
        if missing:
            raise ValueError(
                f"engine_output le faltan las siguientes claves: {missing}"
            )

    # ------------------------------------------------------------------
    # Métodos abstractos — cada ciclo DEBE implementarlos
    # ------------------------------------------------------------------

    @abstractmethod
    def execute(self) -> dict:
        """
        Ejecuta la lógica del ciclo aplicando los ajustes correspondientes
        sobre engine_output.

        Retorna
        -------
        dict
            Parámetros finales ajustados listos para enviar al controlador
            de hardware. Mismas claves que engine_output más cualquier
            campo adicional que el ciclo necesite.
        """
        pass

    @abstractmethod
    def get_params(self) -> dict:
        """
        Retorna los parámetros de configuración propios del ciclo
        (multiplicadores, límites, offsets, etc.) sin aplicarlos.

        Útil para inspección, logging y pruebas unitarias.

        Retorna
        -------
        dict
            Parámetros estáticos de configuración del ciclo.
        """
        pass

    # ------------------------------------------------------------------
    # Helpers compartidos (opcionales, disponibles para subclases)
    # ------------------------------------------------------------------

    def _clamp(self, value: float, min_val: float, max_val: float) -> float:
        """Limita un valor al rango [min_val, max_val]."""
        return max(min_val, min(max_val, value))

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(engine_output={self.engine_output})"
