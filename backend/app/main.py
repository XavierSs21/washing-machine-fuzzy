from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import simulation, cycles, export

app = FastAPI(
    title="Washing Machine Fuzzy Controller",
    description="Sistema de control difuso para lavadora con 4 ciclos",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulation.router, prefix="/api", tags=["simulation"])
app.include_router(cycles.router, prefix="/api", tags=["cycles"])
app.include_router(export.router, prefix="/api", tags=["export"])


@app.get("/health")
def health():
    return {"status": "ok"}
