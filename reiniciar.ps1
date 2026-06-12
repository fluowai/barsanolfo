# Script para reiniciar o servidor Woojuris
Write-Host "🔄 Reiniciando o servidor..." -ForegroundColor Yellow

# Matar processos node antigos
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Start-Sleep -Seconds 1

# Iniciar novamente usando o script principal
.\iniciar.ps1
