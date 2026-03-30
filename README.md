# 🫧 Washing Machine Fuzzy Controller

Sistema de control difuso para lavadora con 4 ciclos de lavado, animación en tiempo real y generador de archivo `.fis` compatible con MATLAB.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + Framer Motion + Recharts + TailwindCSS |
| Backend | FastAPI (Python 3.11+) |
| Lógica difusa | scikit-fuzzy + numpy |
| Export | Generador `.fis` nativo (sin MATLAB) |
| DevOps | Docker + Docker Compose + GitHub Actions |

---

## Inicio rápido (WSL2 / Debian / Ubuntu)

### Prerrequisitos

```bash
# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Git
sudo apt install git -y
```

### Levantar el proyecto

```bash
git clone https://github.com/TU_USUARIO/washing-machine-fuzzy.git
cd washing-machine-fuzzy
bash setup.sh
```

Listo. Accede a:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Swagger Docs:** http://localhost:8000/docs

### Comandos útiles

```bash
# Ver logs en tiempo real
docker compose -f docker/docker-compose.yml logs -f

# Detener todo
docker compose -f docker/docker-compose.yml down

# Reconstruir después de cambios en requirements.txt o package.json
docker compose -f docker/docker-compose.yml up --build

# Correr tests del backend
docker compose -f docker/docker-compose.yml exec backend pytest app/tests -v
```

---

## Inicio en Windows (sin WSL2)

1. Instalar [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Abrir PowerShell en la raíz del repo:

```powershell
docker compose -f docker/docker-compose.yml up --build
```

---

## Convención de ramas

```
main          → producción (solo Xavier mergea aquí)
dev           → base de desarrollo (requiere PR + 1 review)
nombre/feature → ramas de trabajo
```

**Crear tu rama:**

```bash
git checkout dev
git pull origin dev
git checkout -b tuNombre/descripcion-feature
```

**Subir tu PR:**

```bash
git push origin tuNombre/descripcion-feature
# Luego abre el PR en GitHub hacia dev
```

---

## Estructura del proyecto

```
washing-machine-fuzzy/
├── .github/workflows/     # CI (ci.yml) + Deploy (deploy.yml)
├── docker/                # Dockerfiles + docker-compose.yml
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py                  # Entry point FastAPI
│       ├── api/routes/              # simulate, cycles, export
│       ├── core/
│       │   ├── fuzzy/               # engine, variables, rules (Xavier)
│       │   ├── cycles/              # base + 4 ciclos (Yess)
│       │   └── fis/                 # generador .fis (Aaly)
│       ├── models/                  # Pydantic schemas
│       └── tests/                   # Unit + integration + black box
└── frontend/
    └── src/
        ├── components/              # WashingMachine, ControlPanel, Charts
        ├── hooks/                   # useSimulation, useWebSocket, useCycles
        ├── services/                # Axios client
        ├── store/                   # Zustand slices
        └── pages/                   # Home.jsx
```

---

## API Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/simulate` | Ejecuta el sistema difuso |
| `GET` | `/api/cycles` | Metadata de los 4 ciclos |
| `GET` | `/api/membership` | Funciones de membresía (para charts) |
| `WS` | `/api/ws/simulation` | Streaming del estado en tiempo real |
| `GET` | `/api/export/fis` | Descarga `U4_LD.fis` para MATLAB |

### Ejemplo de request

```json
POST /api/simulate
{
  "tipo_ropa": 50,
  "nivel_suciedad": 60,
  "masa_ropa": 4.5
}
```

---

## Variables del sistema difuso

| Variable | Rango | Sets |
|---|---|---|
| `tipo_ropa` | [0, 100] | delicada / normal / resistente |
| `nivel_suciedad` | [0, 100] | baja / media / alta |
| `masa_ropa` | [0, 10] kg | ligera / media / pesada |
| `tiempo_ciclo` | [0, 60] min | muy_corto / corto / medio / largo / muy_largo |
| `temperatura_agua` | [20, 90] °C | fria / tibia / caliente / muy_caliente |
| `cantidad_detergente` | [0, 200] ml | poca / media / mucha |
| `velocidad_agitacion` | [0, 1200] rpm | baja / media / alta / muy_alta |

---

## División del equipo

| Miembro | Área |
|---|---|
| **Xavier** | DevOps + Motor difuso (engine, variables, rules) |
| **Yess** | UI/UX + SVG lavadora + Panel de control + Ciclos |
| **Guevara** | Backend + API + WebSocket + defuzz.py |
| **Aaly** | Generador .fis + Charts + Tests unitarios |
| **Jesús** | Estado Zustand + Hooks + Integración API |
| **Pedro** | Testing caja negra + Documentación |

---

## GitHub Actions

- **`ci.yml`** — Corre en cada PR hacia `dev`: lint Python, lint JS, pytest, vitest, build Docker
- **`deploy.yml`** — Corre en merge a `main`: build + push a Docker Hub

Para `deploy.yml` configura los secrets en GitHub:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
