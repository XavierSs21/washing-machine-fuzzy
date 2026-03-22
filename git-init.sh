#!/usr/bin/env bash
# git-init.sh — Inicializa el repo local y configura las ramas
# Ejecutar UNA SOLA VEZ después de crear el repo en GitHub
# Uso: bash git-init.sh <URL_DEL_REPO>
# Ejemplo: bash git-init.sh https://github.com/tu-usuario/washing-machine-fuzzy.git

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

REMOTE_URL=$1

if [ -z "$REMOTE_URL" ]; then
    echo "Uso: bash git-init.sh <URL_DEL_REPO>"
    echo "Ejemplo: bash git-init.sh https://github.com/tu-usuario/washing-machine-fuzzy.git"
    exit 1
fi

echo -e "${YELLOW}Inicializando repositorio...${NC}"

git init
git add .
git commit -m "feat: initial project scaffold

- Docker setup (Dockerfile.backend, Dockerfile.frontend, docker-compose.yml)
- GitHub Actions (ci.yml, deploy.yml)
- Backend: FastAPI + scikit-fuzzy engine, variables, 27 rules
- Backend: Pydantic models, API routes (simulate, cycles, export)
- Backend: .fis generator for MATLAB
- Backend: Unit tests (15 black-box cases)
- Frontend: Vite + React scaffold with all dependencies
- Docs: README with setup instructions"

git branch -M main
git remote add origin $REMOTE_URL
git push -u origin main

# Crear y pushear dev
git checkout -b dev
git push -u origin dev

echo -e "${GREEN}✅ Repo inicializado correctamente${NC}"
echo -e ""
echo -e "  main → ${REMOTE_URL}"
echo -e "  dev  → listo para ramas del equipo"
echo -e ""
echo -e "${YELLOW}Siguiente paso — proteger dev en GitHub:${NC}"
echo -e "  Settings → Branches → Add rule"
echo -e "  Branch name: dev"
echo -e "  ✅ Require a pull request before merging"
echo -e "  ✅ Require approvals: 1"
echo -e "  ✅ Require status checks to pass (ci)"
echo -e ""
echo -e "${YELLOW}Crea tu rama de trabajo:${NC}"
echo -e "  git checkout -b xavier/fuzzy-engine"
