@echo off
setlocal enabledelayedexpansion

echo.
echo =========================================
echo 🚀 INICIANDO BARSA ADVOCACIA
echo =========================================
echo.

:: Verificar se está no diretório correto
cd /d "C:\Users\paulo\OneDrive\Área de Trabalho\NÃO APAGAR\site barsa"

if not exist "backend\dist\server.js" (
    echo ❌ ERRO: Backend não foi compilado!
    echo Compile com: npm run build
    pause
    exit /b 1
)

echo.
echo [✓] Backend encontrado em: backend\dist\server.js
echo.
echo Iniciando servidores...
echo.

:: Abrir Backend em nova janela
start "Backend - Porta 5032" cmd /k "cd /d backend && node dist/server.js"

echo.
echo ✅ Backend iniciando em uma nova janela...
echo 📊 Acesse: http://localhost:5032
echo 🔍 Health Check: http://localhost:5032/api/health
echo.
echo ========================================
echo Pressione qualquer tecla...
pause
