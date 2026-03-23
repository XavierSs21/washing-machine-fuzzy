# git-init.ps1 — Inicializa el repo local y configura las ramas (Windows)
# Uso: .\git-init.ps1 <URL_DEL_REPO>
# Ejemplo: .\git-init.ps1 https://github.com/tu-usuario/washing-machine-fuzzy.git

param(
    [Parameter(Mandatory=$true)]
    [string]$RemoteUrl
)

$GREEN = "Green"
$YELLOW = "Yellow"
$RED = "Red"

Write-Host "Inicializando repositorio..." -ForegroundColor $YELLOW

git init
git add .
git commit -m "feat: initial project scaffold"

git branch -M main
git remote add origin $RemoteUrl
git push -u origin main

# Crear y pushear dev
git checkout -b dev
git push -u origin dev

Write-Host "✅ Repo inicializado correctamente" -ForegroundColor $GREEN
Write-Host ""
Write-Host "  main -> $RemoteUrl" -ForegroundColor $GREEN
Write-Host "  dev  -> listo para ramas del equipo" -ForegroundColor $GREEN
Write-Host ""
Write-Host "Siguiente paso — proteger dev en GitHub:" -ForegroundColor $YELLOW
Write-Host "  Settings -> Branches -> Add rule"
Write-Host "  Branch name: dev"
Write-Host "  Require a pull request before merging"
Write-Host "  Require approvals: 1"
Write-Host "  Require status checks to pass (ci)"
Write-Host ""
Write-Host "Crea tu rama de trabajo:" -ForegroundColor $YELLOW
Write-Host "  git checkout -b tuNombre/nombre-feature"
