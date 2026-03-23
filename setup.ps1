# setup.ps1 — Script de inicializacion del proyecto para Windows
# Uso: .\setup.ps1

$GREEN = "Green"
$YELLOW = "Yellow"
$RED = "Red"

Write-Host "==========================================" -ForegroundColor $GREEN
Write-Host "  Washing Machine Fuzzy — Setup Script   " -ForegroundColor $GREEN
Write-Host "==========================================" -ForegroundColor $GREEN

# ── 1. Verificar dependencias ─────────────────────────────────────────────────
Write-Host "`n[1/5] Verificando dependencias..." -ForegroundColor $YELLOW

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker no instalado. Ver: https://www.docker.com/products/docker-desktop" -ForegroundColor $RED
    exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git no instalado. Ver: https://git-scm.com/download/win" -ForegroundColor $RED
    exit 1
}

# Verificar que Docker Desktop esta corriendo
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker Desktop no esta corriendo. Abrelo y espera a que diga 'Engine running'." -ForegroundColor $RED
    exit 1
}

Write-Host "  ✅ Docker: $(docker --version)" -ForegroundColor $GREEN
Write-Host "  ✅ Git: $(git --version)" -ForegroundColor $GREEN

# ── 2. Verificar que estamos en la raiz del proyecto ──────────────────────────
Write-Host "`n[2/5] Verificando estructura del proyecto..." -ForegroundColor $YELLOW

if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ No se encontraron las carpetas backend/ o frontend/" -ForegroundColor $RED
    Write-Host "   Asegurate de estar en la raiz del proyecto y de tener la rama dev:" -ForegroundColor $YELLOW
    Write-Host "   git fetch origin" -ForegroundColor $YELLOW
    Write-Host "   git checkout dev" -ForegroundColor $YELLOW
    Write-Host "   git pull origin dev" -ForegroundColor $YELLOW
    exit 1
}

Write-Host "  ✅ Estructura del proyecto correcta" -ForegroundColor $GREEN

# ── 3. Levantar servicios con Docker Compose ──────────────────────────────────
Write-Host "`n[3/5] Construyendo imagenes Docker (primera vez tarda ~5 min)..." -ForegroundColor $YELLOW
docker compose -f docker/docker-compose.yml --project-directory . build

Write-Host "`n[4/5] Levantando servicios..." -ForegroundColor $YELLOW
docker compose -f docker/docker-compose.yml --project-directory . up -d

# ── 4. Health check ───────────────────────────────────────────────────────────
Write-Host "`n[5/5] Esperando que los servicios esten listos..." -ForegroundColor $YELLOW
Start-Sleep -Seconds 5

$maxTries = 12
$count = 0
$ready = $false

while ($count -lt $maxTries -and -not $ready) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 3
        if ($response.StatusCode -eq 200) {
            $ready = $true
        }
    } catch {
        $count++
        Write-Host "  Esperando backend... ($count/$maxTries)" -ForegroundColor $YELLOW
        Start-Sleep -Seconds 5
    }
}

if (-not $ready) {
    Write-Host "❌ Backend no respondio despues de 60 segundos." -ForegroundColor $RED
    Write-Host "   Revisa logs: docker compose -f docker/docker-compose.yml --project-directory . logs backend" -ForegroundColor $YELLOW
    exit 1
}

Write-Host "`n==========================================" -ForegroundColor $GREEN
Write-Host "  ✅ Todo listo!                          " -ForegroundColor $GREEN
Write-Host "==========================================" -ForegroundColor $GREEN
Write-Host ""
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor $GREEN
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor $GREEN
Write-Host "  API Docs:  http://localhost:8000/docs" -ForegroundColor $GREEN
Write-Host ""
Write-Host "  Detener:  docker compose -f docker/docker-compose.yml --project-directory . down"
Write-Host "  Logs:     docker compose -f docker/docker-compose.yml --project-directory . logs -f"
Write-Host ""
