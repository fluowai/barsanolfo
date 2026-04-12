# Barsa Advocacia - Servidor Backend
# Clique com botão direito > Executar com PowerShell
# Ou: powershell -ExecutionPolicy Bypass -File iniciar-servidor.ps1

$BackendPath = "C:\Users\paulo\OneDrive\Área de Trabalho\NÃO APAGAR\site barsa\backend"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Barsa Advocacia - Iniciando Servidor" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location $BackendPath
npm run dev
