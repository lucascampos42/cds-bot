# Guia de Testes - CDS Bot

## Visão Geral

Este documento descreve como executar e criar testes para a nova arquitetura do CDS Bot, que separa as responsabilidades entre os módulos WhatsApp (conexões) e Helpdesk (mensageria).

## Estrutura de Testes

### Testes E2E (End-to-End)

Os testes E2E estão localizados em `/test/app.e2e-spec.ts` e cobrem:

#### WhatsApp Module - Conexões e Sessões
- ✅ Listagem de sessões ativas
- ✅ Validação de criação de sessão
- ✅ Eventos de WebSocket

#### Helpdesk Module - Mensageria e Atendimento
- ✅ Listagem de sessões disponíveis
- ✅ Envio de mensagem individual
- ✅ Envio de mensagens em lote
- ✅ Listagem de conversas ativas

### Executando os Testes

```bash
# Testes E2E
npm run test:e2e

# Testes unitários (quando implementados)
npm run test

# Testes com coverage
npm run test:cov
```

## Configuração do Jest

### Problema com Módulos ES

O projeto utiliza a biblioteca `@whiskeysockets/baileys` que usa módulos ES. A configuração do Jest foi ajustada para lidar com isso:

```json
{
  "transformIgnorePatterns": [
    "node_modules/(?!(@whiskeysockets/baileys|@adiwajshing/keyed-db|libphonenumber-js)/)"
  ],
  "preset": "ts-jest/presets/default-esm",
  "extensionsToTreatAsEsm": [".ts"]
}
```

## Testes com Bruno (API Testing)

### Arquivos de Teste Disponíveis

1. **criar-sessao.bru** - Criação de sessão WhatsApp
2. **listar-sessoes.bru** - Listagem de sessões ativas
3. **enviar-mensagem.bru** - Envio via Helpdesk (atualizado)
4. **enviar-mensagem-lote.bru** - Envio em lote via Helpdesk (novo)
5. **listar-sessoes-disponiveis.bru** - Sessões disponíveis via Helpdesk (novo)
6. **stream-eventos.bru** - Stream de eventos WebSocket

### Variáveis de Ambiente

Configure as seguintes variáveis no Bruno:

```json
{
  "host": "http://localhost:3000",
  "sessionId": "sua-sessao-id"
}
```

## Cenários de Teste

### 1. Fluxo Completo de Mensageria

1. Criar sessão WhatsApp (`POST /whatsapp/session`)
2. Verificar sessões disponíveis (`GET /helpdesk/sessions/available`)
3. Enviar mensagem individual (`POST /helpdesk/messages/send`)
4. Enviar mensagens em lote (`POST /helpdesk/messages/bulk`)

### 2. Validação de Dados

- Campos obrigatórios em DTOs
- Formatos de número de telefone
- Tipos de mensagem válidos
- IDs de sessão existentes

### 3. Tratamento de Erros

- Sessão inexistente
- Número inválido
- Falha na conexão WhatsApp
- Timeout de envio

## Melhores Práticas

### Para Testes E2E

1. **Isolamento**: Cada teste deve ser independente
2. **Cleanup**: Limpar dados após cada teste
3. **Mocking**: Mockar serviços externos quando necessário
4. **Timeout**: Configurar timeouts adequados para operações assíncronas

### Para Testes Unitários

1. **Cobertura**: Focar em lógica de negócio complexa
2. **Mocking**: Mockar dependências externas
3. **Casos Edge**: Testar cenários de erro e edge cases
4. **Performance**: Testes rápidos e eficientes

## Próximos Passos

1. ✅ Configurar Jest para módulos ES
2. ⏳ Implementar testes unitários para serviços
3. ⏳ Adicionar testes de integração para WebSocket
4. ⏳ Configurar CI/CD com testes automatizados
5. ⏳ Implementar testes de performance

## Troubleshooting

### Erro de Módulos ES

Se encontrar erros relacionados a `import statement outside a module`:

1. Verifique a configuração do Jest
2. Adicione bibliotrarias problemáticas ao `transformIgnorePatterns`
3. Configure `extensionsToTreatAsEsm` se necessário

### Timeout em Testes

Para operações que envolvem WhatsApp:

1. Aumente o timeout do Jest
2. Implemente retry logic
3. Use mocks para operações lentas