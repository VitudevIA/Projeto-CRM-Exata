@echo off
echo ========================================
echo TESTE RAPIDO - CLICK-TO-CALL
echo Telefone: 85997185855
echo Ramal: 1501
echo ========================================
echo.

echo [1/3] Verificando backend...
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERRO: Backend nao esta rodando!
    echo.
    echo Execute primeiro em outro terminal:
    echo   cd backend
    echo   npm run dev
    echo.
    pause
    exit /b 1
)
echo OK: Backend esta rodando!
echo.

echo [2/3] Fazendo login...
echo Digite seu email:
set /p EMAIL=
echo Digite sua senha:
set /p PASSWORD=
echo.

echo Fazendo login...
for /f "tokens=*" %%a in ('curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\"}"') do set LOGIN_RESPONSE=%%a

echo Resposta: %LOGIN_RESPONSE%
echo.
echo ========================================
echo IMPORTANTE: Copie o "access_token" da resposta acima
echo ========================================
echo.
echo Cole o access_token aqui (sem aspas):
set /p TOKEN=
echo.

echo [3/3] Testando click-to-call...
echo Telefone: 85997185855
echo Ramal: 1501
echo.

curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"phone_number\":\"85997185855\",\"ramal\":\"1501\"}"

echo.
echo ========================================
echo Teste concluido!
echo.
echo Se apareceu "success": true, funcionou!
echo.
pause


