# 📱 CDS-BOT - API Multi-Tenant do WhatsApp

O **CDS-BOT** é uma API de serviço multi-tenant para enviar mensagens via WhatsApp, projetada para ser integrada a outros sistemas que precisam enviar avisos, notificações e campanhas promocionais. Cada cliente possui seu próprio schema isolado no banco de dados.

## ✨ Sobre o Projeto

Este serviço fornece uma API robusta e escalável para envio de mensagens do WhatsApp, oferecendo:

- **API RESTful**: Endpoints simples para integração com qualquer sistema
- **Multi-Tenant**: Isolamento completo de dados por cliente via schemas PostgreSQL
- **Conexão em Tempo Real**: Autenticação via QR code em tempo real
- **Reconexão Automática**: Mantém a sessão ativa e reconecta automaticamente
- **Gestão de Tenants**: Sistema completo para criação e gerenciamento de clientes
- **Health Check**: Monitoramento automático da saúde das conexões

## 🚀 Tecnologias

- **Framework**: NestJS 11 com TypeScript
- **Banco de Dados**: PostgreSQL com Prisma ORM (Multi-Schema)
- **WhatsApp API**: Baileys (API Multi-dispositivo)
- **Documentação da API**: OpenAPI (compatível com Scalar, Bruno e Swagger UI)
- **Agendamento**: @nestjs/schedule para tarefas automáticas

## 📁 Estrutura do Projeto

### 🗂️ Pastas Principais

```
cds-bot/
├── 📁 src/                    # Código fonte da aplicação
│   ├── 📁 whatsapp/          # Módulo principal do WhatsApp
│   ├── 📁 tenant-management/ # Gestão de clientes/tenants
│   ├── 📁 helpdesk/         # Módulo de atendimento
│   ├── 📁 marketing/        # Módulo de marketing (futuro)
│   └── 📁 shared/           # Recursos compartilhados
├── 📁 prisma/               # Schema e migrações do banco
├── 📁 bruno/                # Coleção de testes da API
├── 📁 docs/                 # Documentação adicional
├── 📁 sql/                  # Scripts SQL para setup
└── 📁 test/                 # Testes automatizados
```

### 📋 Detalhamento das Pastas

#### 🔧 `/src/whatsapp/`
**Módulo principal para integração com WhatsApp**
- `config/` - Configurações de conexão e ambiente
- `database/` - Gerenciador de conexões multi-schema e health check
- `dto/` - Data Transfer Objects para validação
- `services/` - Lógica de negócio do WhatsApp
- `swagger/` - Configurações da documentação API
- Schema do banco de dados está em `/prisma/schema.prisma`

#### 🏢 `/src/tenant-management/`
**Sistema de gestão de clientes/tenants**
- `dto/` - DTOs para criação e gestão de tenants
- `services/` - Lógica para criação de schemas e validação
- `tenant.controller.ts` - Endpoints REST para onboarding
- `tenant.module.ts` - Módulo NestJS para tenants

#### 🎧 `/src/helpdesk/`
**Módulo de atendimento ao cliente**
- Sistema de tickets e suporte
- Integração com WhatsApp para atendimento

#### 📢 `/src/marketing/`
**Módulo de campanhas de marketing**
- Envio de campanhas em massa
- Segmentação de contatos
- Relatórios de engajamento

#### 🔗 `/src/shared/`
**Recursos compartilhados entre módulos**
- `interfaces/` - Interfaces TypeScript globais
- `shared.module.ts` - Módulo com serviços compartilhados

#### 🗄️ `/prisma/`
**Schema e migrações do banco de dados**
- `schema.prisma` - Definição do schema multi-tenant
- `migrations/` - Histórico de migrações do banco

#### 🧪 `/bruno/`
**Coleção de testes da API**
- `criar-sessao.bru` - Teste de criação de sessão
- `enviar-mensagem.bru` - Teste de envio de mensagem
- `listar-sessoes.bru` - Teste de listagem de sessões
- `stream-eventos.bru` - Teste de eventos em tempo real
- `environments/` - Configurações de ambiente para testes

#### 📚 `/docs/`
**Documentação adicional**
- `api-examples.md` - Exemplos práticos de uso da API
- `websocket-example.html` - Exemplo de WebSocket

#### 🗄️ `/sql/`
**Scripts SQL para configuração**
- `create-tenants-table.sql` - Script para criar tabela de controle de tenants

#### ✅ `/test/`
**Testes automatizados**
- Testes end-to-end e unitários

## 🚀 Como Executar

### Pré-requisitos
- Node.js 20+
- Um cliente de API como o [Bruno](https://www.usebruno.com/) ou `curl`.

### Executando o Serviço

1. **Clone o repositório**:
   ```bash
   git clone <url-do-repositorio>
   cd cds-bot
   ```

2. **Instale as dependências e inicie**:
   ```bash
   cd back-nestjs
   npm install
   npm run start:dev
   ```

3. **Acompanhe a saída do console**:
   O servidor será iniciado na porta 3099. Os links para a documentação da API serão exibidos no console.

## 📚 Documentação e Testes da API

### 🎨 Documentação Interativa Melhorada
- **🚀 Scalar (Recomendado)**: [http://localhost:3099/docs](http://localhost:3099/docs) - Interface moderna com tema personalizado
- **📋 Swagger UI**: [http://localhost:3099/api](http://localhost:3099/api) - Interface clássica do Swagger
- **📄 Especificação OpenAPI**: [http://localhost:3099/api-json](http://localhost:3099/api-json) - Especificação JSON completa
- **📖 Exemplos Práticos**: [docs/api-examples.md](docs/api-examples.md) - Guia completo com exemplos de código

### 🎯 Novidades da Documentação
- ✨ **Interface moderna** com tema Kepler personalizado
- 🎨 **CSS customizado** com gradientes e animações
- 📱 **Exemplos práticos** em JavaScript e Python
- 🔍 **Busca rápida** com atalho `Ctrl+K`
- 🌙 **Modo escuro** por padrão
- 📊 **Schemas detalhados** com validações
- 🚀 **Múltiplos servidores** (desenvolvimento e produção)

### Testando com o Bruno

A maneira mais fácil de testar a API é com o [Bruno](https://www.usebruno.com/).

1. **Abra o Bruno** e clique em "Open Collection".
2. **Selecione o diretório `bruno/`** na raiz deste projeto.
3. A coleção "CDS-BOT" será importada com todas as requisições prontas para uso.

**Fluxo de Teste:**

1. **Execute a requisição `Criar Sessão`**: Isso iniciará o processo de conexão no backend.
2. **Execute a requisição `Stream de Eventos`**: O Bruno não suporta SSE diretamente no cliente de GUI. No entanto, você pode copiar a URL da requisição (`http://localhost:3099/whatsapp/sessions/meu-bot/stream`) e abri-la no seu navegador ou usar `curl` para ver os eventos:
   ```bash
   curl -N http://localhost:3099/whatsapp/sessions/meu-bot/stream
   ```
3. **Escaneie o QR Code**: Um evento `qr` será enviado pelo stream. Use um conversor de texto para QR code para exibi-lo e escaneá-lo com o seu WhatsApp.
4. **Envie uma Mensagem**: Depois que o stream mostrar um evento de status `connected`, você pode usar a requisição `Enviar Mensagem` para enviar uma mensagem de teste.

## 📄 Licença

Este projeto está sob a licença MIT.
