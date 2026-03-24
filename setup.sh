#!/usr/bin/env bash
# setup.sh — Script de inicialización del proyecto para WSL2/Debian
# Uso: bash setup.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}  Washing Machine Fuzzy — Setup Script    ${NC}"
echo -e "${GREEN}══════════════════════════════════════════${NC}"

# ── 1. Verificar dependencias ─────────────────────────────────────────────────
echo -e "\n${YELLOW}[1/5] Verificando dependencias...${NC}"

command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker no instalado. Ver: https://docs.docker.com/engine/install/debian/${NC}"; exit 1; }
command -v git >/dev/null 2>&1 || { echo -e "${RED}❌ Git no instalado. sudo apt install git${NC}"; exit 1; }

echo -e "  ✅ Docker: $(docker --version)"
echo -e "  ✅ Git: $(git --version)"

# ── 2. Configurar git (si no está configurado) ────────────────────────────────
echo -e "\n${YELLOW}[2/5] Verificando configuración de Git...${NC}"
if [ -z "$(git config --global user.email)" ]; then
    echo -e "${YELLOW}  Git no configurado. Ingresa tus datos:${NC}"
    read -p "  Email: " git_email
    read -p "  Nombre: " git_name
    git config --global user.email "$git_email"
    git config --global user.name "$git_name"
fi
echo -e "  ✅ Git configurado como: $(git config --global user.name)"

# ── 3. Levantar servicios con Docker Compose ──────────────────────────────────
echo -e "\n${YELLOW}[3/5] Construyendo imágenes Docker (primera vez tarda ~3 min)...${NC}"
docker compose -f docker/docker-compose.yml --project-directory . build

echo -e "\n${YELLOW}[4/5] Levantando servicios...${NC}"
docker compose -f docker/docker-compose.yml --project-directory . up -d

# ── 4. Health check ───────────────────────────────────────────────────────────
echo -e "\n${YELLOW}[5/5] Esperando que los servicios estén listos...${NC}"
sleep 5

MAX_TRIES=12
COUNT=0
until curl -sf http://localhost:8000/health > /dev/null; do
    COUNT=$((COUNT+1))
    if [ $COUNT -ge $MAX_TRIES ]; then
        echo -e "${RED}❌ Backend no respondió después de 60 segundos.${NC}"
        echo -e "  Revisa logs: docker compose -f docker/docker-compose.yml logs backend"
        exit 1
    fi
    echo -e "  Esperando backend... ($COUNT/$MAX_TRIES)"
    sleep 5
done

echo -e "\n${GREEN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Todo listo!                           ${NC}"
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo -e ""
echo -e "  🌐 Frontend:  http://localhost:5173"
echo -e "  📡 Backend:   http://localhost:8000"
echo -e "  📚 API Docs:  http://localhost:8000/docs"
echo -e ""
echo -e "  Detener:  docker compose -f docker/docker-compose.yml down"
echo -e "  Logs:     docker compose -f docker/docker-compose.yml logs -f"
echo -e ""
