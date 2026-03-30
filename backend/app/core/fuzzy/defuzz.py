"""
defuzz.py — Métodos de defuzzificación para el motor difuso de la lavadora.

Estos métodos toman un universo de discurso (array de valores x) y una función
de membresía (array de valores μ entre 0 y 1) y retornan un valor escalar.

Estas funciones son para documentación, pruebas y comparación entre métodos.
"""

import numpy as np


def centroid(universe: np.ndarray, membership: np.ndarray) -> float:
    """
    Método del Centroide (Center of Gravity).

    Calcula el "centro de masa" del área bajo la curva de membresía.
    Es el método más utilizado en sistemas difusos por su suavidad y estabilidad.

    Fórmula:
        z* = Σ(x · μ(x)) / Σ(μ(x))

    Args:
        universe:   Array con los valores del universo de discurso (eje x).
        membership: Array con los grados de membresía correspondientes (eje y, 0–1).

    Returns:
        Valor escalar defuzzificado. Retorna 0.0 si la membresía es toda cero.

    Example:
        >>> import numpy as np
        >>> u = np.linspace(0, 10, 100)
        >>> m = np.where((u >= 3) & (u <= 7), 1.0, 0.0)  # función rectangular
        >>> centroid(u, m)
        5.0
    """
    den = np.sum(membership)
    if den == 0:
        return 0.0
    return float(np.sum(universe * membership) / den)


def bisector(universe: np.ndarray, membership: np.ndarray) -> float:
    """
    Método del Bisector.

    Encuentra el punto que divide el área bajo la curva de membresía en dos
    mitades iguales. Generalmente cercano al centroide pero más robusto ante
    distribuciones asimétricas con picos extremos.

    Algoritmo:
        - Calcula el área total acumulada (integral discreta).
        - Busca el punto donde el área acumulada supera la mitad del total.

    Args:
        universe:   Array con los valores del universo de discurso (eje x).
        membership: Array con los grados de membresía correspondientes (eje y, 0–1).

    Returns:
        Valor escalar defuzzificado. Retorna el punto medio del universo si la
        membresía es toda cero.

    Example:
        >>> import numpy as np
        >>> u = np.linspace(0, 10, 100)
        >>> m = np.where((u >= 3) & (u <= 7), 1.0, 0.0)
        >>> bisector(u, m)  # ~5.0 para distribución simétrica
        5.0
    """
    total_area = np.sum(membership)
    if total_area == 0:
        return float(universe[len(universe) // 2])

    cumulative = np.cumsum(membership)
    half = total_area / 2.0

    # Índice del primer punto donde el área acumulada >= mitad del total
    idx = np.searchsorted(cumulative, half)
    idx = min(idx, len(universe) - 1)
    return float(universe[idx])


def mom(universe: np.ndarray, membership: np.ndarray) -> float:
    """
    Método MOM — Mean of Maximum (Media de los Máximos).

    Encuentra todos los puntos donde la membresía es máxima y retorna
    su promedio. Es útil cuando se quiere el valor más "típico" de la
    región de mayor activación, ignorando las colas.

    Algoritmo:
        - Encuentra el valor máximo de membresía.
        - Selecciona todos los puntos x donde μ(x) == máximo.
        - Retorna el promedio de esos puntos.

    Args:
        universe:   Array con los valores del universo de discurso (eje x).
        membership: Array con los grados de membresía correspondientes (eje y, 0–1).

    Returns:
        Valor escalar defuzzificado. Retorna el punto medio del universo si la
        membresía es toda cero.

    Example:
        >>> import numpy as np
        >>> u = np.linspace(0, 10, 100)
        >>> m = np.where((u >= 4) & (u <= 6), 1.0, 0.0)
        >>> mom(u, m)  # promedio del plateau [4, 6] ≈ 5.0
        5.0
    """
    max_val = np.max(membership)
    if max_val == 0:
        return float(universe[len(universe) // 2])

    # Máscara de todos los puntos que alcanzan el máximo
    max_indices = np.where(membership == max_val)[0]
    return float(np.mean(universe[max_indices]))


def compare_methods(universe: np.ndarray, membership: np.ndarray) -> dict:
    """
    Ejecuta los tres métodos de defuzzificación y retorna sus resultados
    para comparación y análisis.

    Útil para debugging, documentación o para mostrar diferencias entre
    métodos en el frontend.

    Args:
        universe:   Array con los valores del universo de discurso (eje x).
        membership: Array con los grados de membresía correspondientes (eje y, 0–1).

    Returns:
        Diccionario con las claves 'centroid', 'bisector' y 'mom', cada una
        con el valor escalar calculado por el método correspondiente.

    Example:
        >>> import numpy as np
        >>> u = np.linspace(0, 100, 1000)
        >>> m = np.clip(1 - np.abs(u - 50) / 20, 0, 1)  # triángulo en 50
        >>> compare_methods(u, m)
        {'centroid': 50.0, 'bisector': 50.0, 'mom': 50.0}
    """
    return {
        "centroid": centroid(universe, membership),
        "bisector": bisector(universe, membership),
        "mom": mom(universe, membership),
    }
