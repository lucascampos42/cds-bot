# 🤖 CDS-BOT

**CDS-BOT** é uma plataforma completa para automação de WhatsApp com interface web moderna, construída com tecnologias de ponta para oferecer uma solução robusta, escalável e fácil de usar.

## 💡 Ideia do Projeto

O CDS-BOT foi desenvolvido para simplificar e automatizar a comunicação via WhatsApp, oferecendo:

- **Gestão Multi-Instância**: Controle múltiplas contas do WhatsApp simultaneamente
- **Interface Web Intuitiva**: Dashboard moderno para gerenciar bots e conversas
- **Automação Avançada**: Integração com N8N para workflows complexos
- **API Robusta**: Endpoints RESTful para integração com sistemas externos
- **Segurança Empresarial**: Autenticação JWT, controle de acesso e auditoria completa

## 🏗️ Arquitetura

O projeto segue uma arquitetura de microserviços containerizada:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Automação     │
│   Angular 20    │◄──►│   NestJS 11     │◄──►│   N8N           │
│   Port: 4200    │    │   Port: 3000    │    │   Port: 5678    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   Port: 5432    │
                    └─────────────────┘
```

## 🚀 Tecnologias

### Backend (API NestJS)
- **Framework**: NestJS 11 com TypeScript
- **ORM**: Prisma 6 com PostgreSQL
- **Autenticação**: JWT + Passport
- **WhatsApp**: Baileys (Multi-device API)
- **Documentação**: OpenAPI/Swagger + Scalar
- **Segurança**: Helmet, Rate Limiting, CORS
- **Monitoramento**: Logs estruturados e métricas
- **Testes**: Jest (unitários e e2e)

### Frontend (Angular)
- **Framework**: Angular 20
- **UI Library**: PrimeNG + PrimeIcons
- **QR Code**: AngularX QRCode
- **Styling**: SCSS + PrimeUIX Themes
- **Build**: Angular CLI

### Automação
- **N8N**: Plataforma de automação visual
- **Workflows**: Integração com WhatsApp e sistemas externos

### Infraestrutura
- **Containerização**: Docker + Docker Compose
- **Banco de Dados**: PostgreSQL 13
- **Proxy Reverso**: Nginx (produção)

## ✨ Funcionalidades

### 🔐 Sistema de Autenticação
- Registro e login com JWT
- Controle de acesso baseado em roles (USER → CLIENT → ADMIN)
- Refresh tokens automáticos
- Notificações de segurança por email
- Bloqueio automático por tentativas inválidas

### 📱 Gestão de WhatsApp
- **Multi-instância**: Gerencie múltiplas contas simultaneamente
- **QR Code**: Autenticação visual via interface web
- **Envio de Mensagens**: API para envio de textos
- **Status em Tempo Real**: Monitoramento de conexões
- **Reconexão Automática**: Recuperação de falhas de conexão

### 🎛️ Interface Administrativa
- Dashboard com métricas em tempo real
- Gestão completa de usuários
- Logs de auditoria detalhados
- Monitoramento de performance
- Configurações de sistema

### 🔧 Automação (N8N)
- Workflows visuais drag-and-drop
- Integração com WhatsApp via API
- Conectores para sistemas externos
- Agendamento de tarefas
- Processamento de webhooks

## 🚀 Como Executar

### Pré-requisitos
- Docker e Docker Compose
- Node.js 20+ (para desenvolvimento local)
- PostgreSQL (se não usar Docker)

### Execução com Docker (Recomendado)

1. **Clone o repositório**:
   ```bash
   git clone <url-do-repositorio>
   cd cds-bot
   ```

2. **Configure as variáveis de ambiente**:
   ```bash
   cp api-nestjs/.env.example api-nestjs/.env.docker
   # Edite as variáveis conforme necessário
   ```

3. **Execute com Docker Compose**:
   ```bash
   docker-compose up -d
   ```

4. **Acesse as aplicações**:
   - **Frontend**: http://localhost:4200
   - **API**: http://localhost:3000
   - **Documentação**: http://localhost:3000/docs
   - **N8N**: http://localhost:5678

### Desenvolvimento Local

#### Backend (API)
```bash
cd api-nestjs
npm install
cp .env.example .env
# Configure DATABASE_URL no .env
npx prisma migrate dev
npm run seed
npm run start:dev
```

#### Frontend
```bash
cd front-angular
npm install
ng serve
```

## 📚 Documentação

### API Documentation
- **Swagger UI**: http://localhost:3000/docs
- **OpenAPI JSON**: http://localhost:3000/docs-json
- **Postman/Bruno**: Coleções disponíveis em `api-nestjs/bruno/`

### Guias Específicos
- [Configuração Docker](api-nestjs/docs/DOCKER.md)
- [Sistema de Segurança](api-nestjs/docs/SECURITY.md)
- [WhatsApp Integration](api-nestjs/docs/WHATSAPP.md)
- [Exception Filters](api-nestjs/docs/EXCEPTION_FILTERS.md)
- [Response Helper](api-nestjs/docs/RESPONSE_HELPER.md)

## 🔧 Configuração

### Variáveis de Ambiente Principais

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cds-bot"

# JWT
JWT_SECRET="your-super-secret-key"
JWT_ACCESS_TTL="1h"
JWT_REFRESH_TTL="7d"

# Email (opcional)
MAIL_HOST="smtp.gmail.com"
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"

# WhatsApp
WHATSAPP_SESSION_PATH="./baileys_auth"
```

## 🛡️ Segurança

- **Rate Limiting**: Proteção contra ataques de força bruta
- **Helmet**: Headers de segurança HTTP
- **CORS**: Configuração restritiva de origens
- **Validação**: Sanitização automática de entrada
- **Auditoria**: Log completo de ações do usuário
- **Criptografia**: Senhas com bcrypt + salt

## 📊 Monitoramento

- **Health Checks**: Endpoints de saúde da aplicação
- **Métricas**: Performance e uso de recursos
- **Logs Estruturados**: Rastreamento detalhado de eventos
- **Audit Trail**: Histórico completo de ações

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Lucas Campos** - [GitHub](https://github.com/lucascampos42)

---

## 🆘 Suporte

Para suporte e dúvidas:
- 📧 Email: dev@empresa.com
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/cds-bot/issues)
- 📖 Documentação: [Wiki do Projeto](https://github.com/seu-usuario/cds-bot/wiki)

---

<div align="center">
  <strong>🚀 Desenvolvido com ❤️ para automatizar o futuro da comunicação</strong>
</div>