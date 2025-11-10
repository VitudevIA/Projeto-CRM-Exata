/**
 * Script de Teste Local - Integração Fortics BPX
 * 
 * Como usar:
 * 1. Configure backend/.env com DISCADOR_API_URL e DISCADOR_API_KEY
 * 2. Execute: node test-fortics-local.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '.env') });

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

async function testForticsLocal() {
  log.section('TESTE LOCAL - INTEGRAÇÃO FORTICS BPX');

  // Verificar variáveis de ambiente
  log.section('1. Verificando Variáveis de Ambiente');
  
  const apiUrl = process.env.DISCADOR_API_URL;
  const apiKey = process.env.DISCADOR_API_KEY;

  if (!apiUrl) {
    log.error('DISCADOR_API_URL não configurado!');
    log.info('Configure no arquivo backend/.env:');
    log.info('DISCADOR_API_URL=http://192.168.1.10');
    process.exit(1);
  }

  if (!apiKey) {
    log.error('DISCADOR_API_KEY não configurado!');
    log.info('Configure no arquivo backend/.env:');
    log.info('DISCADOR_API_KEY=lispbx@123');
    process.exit(1);
  }

  log.success(`DISCADOR_API_URL: ${apiUrl}`);
  log.success(`DISCADOR_API_KEY: ${apiKey.substring(0, 10)}...`);

  // Teste 1: Conectividade
  log.section('2. Testando Conectividade com Fortics');

  try {
    const testUrl = `${apiUrl}/lispbx/lisintegra.php?gacao=discar&gkey=${apiKey}&gsrc=TESTE&gdst=TESTE&gresponse=json`;
    log.info(`Testando URL: ${apiUrl}/lispbx/lisintegra.php`);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    log.info(`Status HTTP: ${response.status}`);
    
    if (response.ok) {
      const data = await response.text();
      log.success('✓ Conectividade OK!');
      log.info(`Resposta: ${data.substring(0, 200)}...`);
    } else {
      log.warning(`Resposta HTTP ${response.status}`);
      const text = await response.text();
      log.info(`Resposta: ${text.substring(0, 200)}`);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      log.error('Timeout: Servidor não respondeu em 5 segundos');
      log.info('Verifique se o servidor Fortics está acessível');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      log.error(`Erro de conexão: ${error.message}`);
      log.info('Verifique:');
      log.info('1. Se o servidor Fortics está ligado');
      log.info('2. Se você está na mesma rede (192.168.1.x)');
      log.info('3. Se a URL está correta');
    } else {
      log.error(`Erro: ${error.message}`);
    }
  }

  // Teste 2: Click-to-Call (simulação)
  log.section('3. Testando Click-to-Call (Simulação)');

  log.warning('⚠️  Este teste requer um ramal autenticado no Fortics');
  log.info('Para testar completamente, use um ramal real e número válido');
  log.info('Exemplo de comando curl:');
  log.info(`curl "${apiUrl}/lispbx/lisintegra.php?gacao=discar&gkey=${apiKey}&gsrc=1000&gdst=11999999999&gresponse=json"`);

  // Teste 3: Verificar ForticsService
  log.section('4. Verificando ForticsService');

  try {
    // Importar o serviço
    const { ForticsService } = await import('./src/services/fortics.js');
    const service = new ForticsService();

    if (service.isConfigured()) {
      log.success('✓ ForticsService configurado corretamente');
    } else {
      log.error('✗ ForticsService não está configurado');
    }
  } catch (error) {
    log.error(`Erro ao importar ForticsService: ${error.message}`);
    log.info('Certifique-se de que o arquivo existe: backend/src/services/fortics.ts');
  }

  // Resumo
  log.section('RESUMO');
  log.info('Próximos passos:');
  log.info('1. Inicie o backend: cd backend && npm run dev');
  log.info('2. Teste click-to-call via API ou interface');
  log.info('3. Verifique os logs do backend');
  log.info('4. Se funcionar localmente, configure na Vercel');
}

// Executar testes
testForticsLocal().catch(error => {
  log.error(`Erro fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});


