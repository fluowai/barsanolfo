# Script de inicialização do Woojuris
# Execute com: Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser; .\iniciar.ps1

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 INICIANDO WOOJURIS" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = $PSScriptRoot
Set-Location $projectPath

# Verificar se backend foi compilado
if (!(Test-Path "backend\dist\server.js")) {
    Write-Host "❌ ERRO: Backend não foi compilado!" -ForegroundColor Red
    Write-Host "Execute: npm run build" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit
}

Write-Host "✅ Backend encontrado em: backend\dist\server.js" -ForegroundColor Green
Write-Host ""

# Iniciar Backend
Write-Host "🔧 Iniciando Backend na porta 5032..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "backend\dist\server.js" -WindowStyle Normal -PassThru

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Backend iniciado!" -ForegroundColor Green
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "📊 URLs Disponíveis:" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 API:         http://localhost:5032" -ForegroundColor Cyan
Write-Host "📊 Painel:      http://localhost:5032/painel" -ForegroundColor Cyan
Write-Host "🔍 Health:      http://localhost:5032/api/health" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Enter para continuar..." -ForegroundColor Gray
Read-Host ""
