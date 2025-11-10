/**
 * Script de Teste - Click-to-Call
 * 
 * Como usar:
 * 1. Inicie o backend: npm run dev
 * 2. Execute: node test-click-to-call.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '.env') });

const API_URL = 'http://localhost:3000';
const TEST_PHONE = '85997185855';
const TEST_RAMAL = '1501';

// Você precisa obter um token válido fazendo login primeiro
// Substitua este valor pelo token real
let AUTH_TOKEN = 'SEU_TOKEN_AQUI';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.blue}═══ ${msg} ═══${colors.reset}\n`),
};

async function testClickToCall() {
  log.section('TESTE CLICK-TO-CALL');

  // Verificar se backend está rodando
  log.section('1. Verificando se Backend está Rodando');
  
  try {
    const healthResponse = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    
    if (healthResponse.ok) {
      log.success('Backend está rodando!');
    } else {
      log.error('Backend respondeu com erro');
      process.exit(1);
    }
  } catch (error) {
    log.error('Backend não está rodando!');
    log.info('Solução: Inicie o backend primeiro:');
    log.info('  cd backend');
    log.info('  npm run dev');
    process.exit(1);
  }

  // Verificar token
  log.section('2. Verificando Token');
  
  if (AUTH_TOKEN === 'SEU_TOKEN_AQUI') {
    log.warning('Token não configurado!');
    log.info('Para obter um token:');
    log.info('1. Faça login no CRM ou');
    log.info('2. Execute: curl -X POST http://localhost:3000/api/auth/login \\');
    log.info('     -H "Content-Type: application/json" \\');
    log.info('     -d \'{"email":"seu_email","password":"sua_senha"}\'');
    log.info('');
    log.info('Depois edite este arquivo e substitua SEU_TOKEN_AQUI pelo token obtido');
    process.exit(1);
  }

  log.success('Token configurado');

  // Testar click-to-call
  log.section('3. Testando Click-to-Call');
  
  log.info(`Telefone: ${TEST_PHONE}`);
  log.info(`Ramal: ${TEST_RAMAL}`);

  try {
    const response = await fetch(`${API_URL}/api/calls/click-to-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        phone_number: TEST_PHONE,
        ramal: TEST_RAMAL,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();

    log.info(`Status HTTP: ${response.status}`);

    if (response.ok && data.success) {
      log.success('✓ Click-to-call funcionou!');
      log.success(`Call ID: ${data.call_id}`);
      log.success(`Account Code: ${data.account_code}`);
      log.success(`Mensagem: ${data.message}`);
      console.log('\nResposta completa:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      log.error('✗ Erro no click-to-call');
      log.error(`Erro: ${data.error || 'Erro desconhecido'}`);
      console.log('\nResposta completa:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    log.error(`Erro: ${error.message}`);
    if (error.name === 'AbortError') {
      log.info('Timeout: A requisição demorou mais de 10 segundos');
    }
  }

  log.section('RESUMO');
  log.info('Se apareceu "✓ Click-to-call funcionou!", a integração está OK!');
  log.info('Verifique no painel Fortics se a chamada foi iniciada');
}

// Executar teste
testClickToCall().catch(error => {
  log.error(`Erro fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});

