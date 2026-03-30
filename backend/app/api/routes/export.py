"""
routes/export.py — Exportación del sistema difuso en formato .fis (MATLAB).
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import tempfile
from app.core.fis.generator import generate_fis

router = APIRouter()


@router.get(
    "/export/fis",
    summary="Exportar sistema difuso como .fis",
    description="""
Genera y descarga el archivo `.fis` compatible con MATLAB/Simulink que
describe el sistema difuso completo: variables de entrada, variables de
salida, funciones de membresía y las 27 reglas IF-THEN.

El archivo generado se llama `U4_LD.fis`.
""",
)
def export_fis() -> FileResponse:

    try:
        fis_content = generate_fis()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al generar el archivo .fis: {str(e)}"
        )

    try:
        tmp = tempfile.NamedTemporaryFile(
            mode="w", suffix=".fis", delete=False, encoding="utf-8"
        )
        tmp.write(fis_content)
        tmp.close()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al escribir el archivo temporal: {str(e)}"
        )

    return FileResponse(
        path=tmp.name,
        filename="U4_LD.fis",
        media_type="text/plain",
        background=None,
    )
