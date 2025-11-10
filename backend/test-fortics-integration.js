/**
 * Script de Teste - Integração Fortics BPX
 * 
 * Como usar:
 * 1. Configure as variáveis no arquivo .env
 * 2. Execute: node test-fortics-integration.js
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

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

async function testFortics() {
  log.section('TESTE DE INTEGRAÇÃO FORTICS BPX');

  // Verificar variáveis de ambiente
  log.section('1. Verificando Variáveis de Ambiente');
  
  const apiUrl = process.env.DISCADOR_API_URL;
  const apiKey = process.env.DISCADOR_API_KEY;
  const webhookSecret = process.env.DISCADOR_WEBHOOK_SECRET;

  if (!apiUrl || apiUrl === 'https://api.discador.com') {
    log.warning('DISCADOR_API_URL não configurado ou usando valor padrão');
    log.info('Configure com a URL real fornecida pela Fortics');
  } else {
    log.success(`DISCADOR_API_URL: ${apiUrl}`);
  }

  if (!apiKey || apiKey === 'sua_chave_api_discador') {
    log.warning('DISCADOR_API_KEY não configurado ou usando valor padrão');
    log.info('Configure com a chave real fornecida pela Fortics');
  } else {
    log.success(`DISCADOR_API_KEY: ${apiKey.substring(0, 10)}...`);
  }

  if (!webhookSecret || webhookSecret === 'seu_webhook_secret_aqui') {
    log.warning('DISCADOR_WEBHOOK_SECRET não configurado ou usando valor padrão');
    log.info('Configure com o secret real fornecido pela Fortics');
  } else {
    log.success(`DISCADOR_WEBHOOK_SECRET: ${webhookSecret.substring(0, 10)}...`);
  }

  // Se as variáveis não estiverem configuradas, parar aqui
  if (!apiUrl || !apiKey || apiUrl === 'https://api.discador.com' || apiKey === 'sua_chave_api_discador') {
    log.error('\n❌ Configure as variáveis de ambiente antes de continuar!');
    log.info('\nEdite o arquivo backend/.env com os valores corretos:');
    log.info('DISCADOR_API_URL=http://...');
    log.info('DISCADOR_API_KEY=...');
    log.info('DISCADOR_WEBHOOK_SECRET=...');
    process.exit(1);
  }

  // Teste 1: Verificar conectividade com a API
  log.section('2. Testando Conectividade com API');
  
  try {
    log.info(`Tentando conectar em: ${apiUrl}`);
    
    // Tentar diferentes endpoints comuns
    const endpoints = [
      '/api/status',
      '/api/health',
      '/status',
      '/health',
      '/api/v1/status',
      '/',
    ];

    let connected = false;
    for (const endpoint of endpoints) {
      try {
        const url = `${apiUrl}${endpoint}`;
        log.info(`Testando: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'X-API-Key': apiKey,
          },
          timeout: 5000,
        });

        log.success(`✓ Resposta recebida! Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.text();
          log.success(`Conteúdo: ${data.substring(0, 200)}...`);
          connected = true;
          break;
        }
      } catch (err) {
        // Continuar tentando outros endpoints
      }
    }

    if (!connected) {
      log.warning('Não foi possível conectar em nenhum endpoint padrão');
      log.info('Isso pode ser normal - consulte a documentação para o endpoint correto');
    }
  } catch (error) {
    log.error(`Erro ao conectar: ${error.message}`);
    log.info('Verifique se a URL está correta e se o servidor está acessível');
  }

  // Teste 2: Testar Click-to-Call (formato comum)
  log.section('3. Testando Click-to-Call (Simulação)');
  
  try {
    const clickToCallEndpoint = `${apiUrl}/api/call/initiate`;
    log.info(`Endpoint: ${clickToCallEndpoint}`);
    log.info('Payload: { phone_number: "11999999999", extension: "8001" }');

    const response = await fetch(clickToCallEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        phone_number: '11999999999',
        extension: '8001',
        caller_id: '1140001000',
      }),
      timeout: 5000,
    });

    log.info(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      log.success('✓ Click-to-call funcionou!');
      log.success(`Resposta: ${JSON.stringify(data, null, 2)}`);
    } else {
      const errorText = await response.text();
      log.warning(`Resposta (${response.status}): ${errorText}`);
      log.info('Ajuste o endpoint ou formato do payload conforme documentação');
    }
  } catch (error) {
    log.error(`Erro: ${error.message}`);
    log.info('Verifique o endpoint correto na documentação da Fortics');
  }

  // Teste 3: Simular Webhook
  log.section('4. Testando Recepção de Webhook (Local)');
  
  try {
    const webhookUrl = 'http://localhost:3000/api/calls/webhook';
    log.info(`URL: ${webhookUrl}`);
    log.info(`Secret: ${webhookSecret.substring(0, 10)}...`);

    const payload = {
      event: 'call_started',
      timestamp: new Date().toISOString(),
      data: {
        call_id: 'test-' + Date.now(),
        phone_number: '11999999999',
        direction: 'outbound',
        operator_id: 'test-operator',
        tenant_id: 'test-tenant',
      },
    };

    log.info(`Payload: ${JSON.stringify(payload, null, 2)}`);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': webhookSecret,
      },
      body: JSON.stringify(payload),
      timeout: 5000,
    });

    log.info(`Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      log.success('✓ Webhook recebido com sucesso!');
      log.success(`Resposta: ${JSON.stringify(data, null, 2)}`);
    } else {
      const errorText = await response.text();
      log.error(`Erro: ${errorText}`);
      log.info('Certifique-se de que o backend está rodando: npm run dev');
    }
  } catch (error) {
    log.error(`Erro: ${error.message}`);
    log.info('Certifique-se de que o backend está rodando: cd backend && npm run dev');
  }

  // Resumo
  log.section('RESUMO');
  log.info('Próximos passos:');
  log.info('1. Consulte a documentação da Fortics para os endpoints corretos');
  log.info('2. Ajuste o código em backend/src/routes/calls.ts se necessário');
  log.info('3. Configure o webhook no painel da Fortics com a URL:');
  log.info('   https://projetocrmexata.vercel.app/api/calls/webhook');
  log.info('4. Teste uma chamada real pelo painel da Fortics');
}

// Executar testes
testFortics().catch(error => {
  log.error(`Erro fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});

