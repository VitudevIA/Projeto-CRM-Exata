#!/bin/bash

echo "========================================"
echo "TESTE RAPIDO - CLICK-TO-CALL"
echo "Telefone: 85997185855"
echo "Ramal: 1501"
echo "========================================"
echo ""

echo "[1/3] Verificando backend..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "OK: Backend está rodando!"
else
    echo ""
    echo "ERRO: Backend não está rodando!"
    echo ""
    echo "Execute primeiro em outro terminal:"
    echo "  cd backend"
    echo "  npm run dev"
    echo ""
    exit 1
fi
echo ""

echo "[2/3] Fazendo login..."
read -p "Digite seu email: " EMAIL
read -p "Digite sua senha: " PASSWORD
echo ""

echo "Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Resposta: $LOGIN_RESPONSE"
echo ""
echo "========================================"
echo "IMPORTANTE: Copie o 'access_token' da resposta acima"
echo "========================================"
echo ""
read -p "Cole o access_token aqui: " TOKEN
echo ""

echo "[3/3] Testando click-to-call..."
echo "Telefone: 85997185855"
echo "Ramal: 1501"
echo ""

curl -X POST http://localhost:3000/api/calls/click-to-call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"phone_number\":\"85997185855\",\"ramal\":\"1501\"}"

echo ""
echo "========================================"
echo "Teste concluído!"
echo ""
echo "Se apareceu 'success': true, funcionou!"
echo ""


