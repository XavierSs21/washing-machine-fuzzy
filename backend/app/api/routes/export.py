from fastapi import APIRouter
from fastapi.responses import FileResponse
import tempfile
from app.core.fis.generator import generate_fis

router = APIRouter()


@router.get("/export/fis")
def export_fis():
    """Genera y descarga el archivo .fis compatible con MATLAB."""
    fis_content = generate_fis()

    tmp = tempfile.NamedTemporaryFile(
        mode="w", suffix=".fis", delete=False, encoding="utf-8"
    )
    tmp.write(fis_content)
    tmp.close()

    return FileResponse(
        path=tmp.name,
        filename="U4_LD.fis",
        media_type="text/plain",
        background=None,
    )
