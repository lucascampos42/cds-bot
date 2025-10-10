# CDS-BOT

> Status do Projeto: Em planejamento (sem integração WhatsApp implementada ainda)

CDS-BOT é uma plataforma SaaS pensada para automação de conversas via WhatsApp e para ser consumida por outros sistemas. A proposta é oferecer:
- um backend com autenticação/autorização robustas;
- um frontend para configuração e gestão;
- um motor de automação (n8n) para orquestrar fluxos;
- um gateway de provedores oficiais do WhatsApp para envio e recebimento de mensagens.

Importante: neste momento o repositório ainda não contém integração ativa com a API do WhatsApp. O foco atual está na base (auth, usuários, auditoria, saúde/monitoramento) e na infraestrutura. As seções abaixo refletem o estado real do monorepo.

---

### Sumário
1. [Visão Geral e Objetivos](#1-visão-geral-e-objetivos)
2. [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3. [Tecnologias Propostas (Tech Stack)](#3-tecnologias-propostas-tech-stack)
4. [Estrutura do Monorepo](#4-estrutura-do-monorepo)
5. [Modelo de Autenticação e Autorização (RBAC)](#5-modelo-de-autenticação-e-autorização-rbac)
6. [Como Iniciar o Projeto Localmente](#6-como-iniciar-o-projeto-localmente)

---

### 1. Visão Geral e Objetivos

O CDS-BOT é pensado para ser um serviço autônomo e desacoplado, consumido via API por qualquer cliente (incluindo, futuramente, integrações com sistemas como o ERP CDS-Gestor).

Objetivos principais:
- Facilidade de uso: construção de fluxos visuais e gestão simplificada;
- Flexibilidade: motor de automação (n8n) para integrações e lógicas complexas;
- Escalabilidade: arquitetura preparada para alto volume e multi-tenancy;
- Segurança: autenticação JWT, RBAC e boas práticas de proteção.

Mensagens planejadas para WhatsApp:
- texto;
- imagens/arquivos de mídia;
- mensagens de marketing (templates oficiais, campanhas com opt-in).

---

### 2. Estado atual do projeto

Com base nos diretórios e arquivos presentes:
- API (NestJS): implementa autenticação JWT, RBAC, auditoria de ações, filtros globais de exceção, documentação via Swagger/Scalar, health/monitoring e envio de e-mails (templates prontos). Porta padrão: 3099 (definida em `.env.example`).
- Frontend (Angular): projeto inicial (boilerplate do Angular CLI) sem telas específicas do bot ainda. É servido via Nginx no Docker.
- n8n: serviço declarado no `docker-compose.yml` raiz, sem fluxos configurados neste repositório.
- Banco: PostgreSQL via Docker.
- Integração WhatsApp: NÃO implementada no código neste momento (não há bibliotecas de Twilio/360dialog/Gupshup, etc.).

Esta seção é atualizada para refletir a verdade do repositório atual.

### 3. Arquitetura do Sistema

A plataforma é baseada em uma **Arquitetura de Microserviços** orquestrada por contêineres Docker. Cada componente principal do sistema rodará em seu próprio contêiner, comunicando-se com os outros através de uma rede interna gerenciada pelo Docker Compose.

**Diagrama de Fluxo de Dados:**

```mermaid
flowchart TD
    %% Agrupamento por domínios
    subgraph Plataforma
        B[Frontend (Angular)]
        C[API (NestJS)]
        D[(PostgreSQL)]
        E[Motor de Automação (n8n)]
    end

    A[Usuário Admin] -->|HTTP| B
    B -->|HTTP| C
    C <-->|SQL| D
    C -->|Webhook/API| E

    subgraph WhatsApp
        F[Provedor Oficial WhatsApp Business]
        G[Cliente Final]
    end

    %% Integrações planejadas
    E -->|API| F
    C -->|Envio de mensagens| F
    F -->|Webhooks| C
    F -->|Entrega/Recepção| G
```

Legenda:
- HTTP: comunicação navegador → frontend → API
- SQL: persistência de dados na base PostgreSQL
- Webhook/API: orquestração de fluxos entre API e n8n
- Provedor WhatsApp: envio/recebimento via provedores oficiais (planejado)

---

### 4. Tecnologias

* **Backend:**
    * **Framework:** NestJS (com TypeScript)
    * **Banco de Dados:** PostgreSQL
    * **ORM:** Prisma
    * **Autenticação:** Passport.js (`@nestjs/passport`), JWT (`@nestjs/jwt`)
    * **Autorização:** NestJS Guards (para implementação do RBAC)

* **Frontend:**
    * **Framework:** Angular (com TypeScript)
    * **UI Components:** PrimeNG ou Angular Material
    * **Estilização:** SCSS

* **Motor de Automação:**
    * **Plataforma:** n8n (versão self-hosted via Docker)

* **Infraestrutura e DevOps:**
    * **Containerização:** Docker e Docker Compose
    * **Controle de Versão:** Git

* **Gateway de Comunicação (planejado):**
    * **WhatsApp:** API oficial do WhatsApp Business, integrando via provedores (ex.: 360dialog, Twilio, Gupshup). Não implementado ainda.


---

### 5. Estrutura do Monorepo

O projeto está organizado em um monorepo. A estrutura de pastas foi ajustada para refletir o template utilizado na API.

```
/cds-bot/
├── api-nestjs/              # Projeto da API em NestJS com autenticação
│   ├── prisma/              # Schema e migrações do banco de dados (Prisma)
│   ├── src/
│   │   ├── application/     # Módulos de aplicação (controllers, services)
│   │   │   ├── auth/        # Módulo de autenticação e RBAC
│   │   │   ├── user/        # Módulo de gerenciamento de usuários
│   │   │   └── ...
│   │   ├── core/            # Lógica de negócio, entidades, guards, etc.
│   │   │   ├── guards/      # <-- Guards de autenticação e autorização
│   │   │   ├── entities/    # <-- Entidades do sistema
│   │   │   └── ...
│   │   └── main.ts
│   ├── test/                # Testes e2e
│   ├── Dockerfile
│   ├── nest-cli.json
│   └── package.json
│
├── front-angular/           # Projeto do Frontend em Angular
│   ├── src/                 # Código fonte do Angular
│   ├── angular.json         # Configuração do Angular CLI
│   └── package.json         # Dependências do projeto
├── n8n-data/                # volume do n8n (gerado ao subir pelo Docker)
│
├── docker-compose.yml       # Orquestrador principal dos serviços
├── .env.example             # Exemplo de variáveis de ambiente
└── README.md                # Este arquivo
```

---

### 6. Modelo de Autenticação e Autorização (RBAC)

**1. Autenticação (Quem é você?)**
- O usuário envia `identification` e `senha` para o endpoint `POST /auth/login`.
- O NestJS (usando `Passport.js`) valida as credenciais.
- Se válidas, um **JSON Web Token (JWT)** é gerado e retornado, contendo `userId` e `roles`.
- O Frontend Angular armazena este JWT e o envia no cabeçalho `Authorization` de todas as requisições futuras.

**2. Autorização (O que você pode fazer?) - RBAC**
- **Funções (Roles):** `SuperAdmin`, `Admin`, `Editor`, `Viewer`.
- **Implementação com Guards:** O NestJS usará um `RolesGuard` para verificar se a `role` do usuário (extraída do JWT) tem permissão para acessar um endpoint protegido por um Decorator `@Roles()`.

**Exemplo de Controller:**
```typescript
import { Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('workflows')
export class WorkflowsController {

  @Post()
  @Roles('Admin', 'Editor') // Apenas Admin e Editor podem acessar
  @UseGuards(JwtAuthGuard, RolesGuard) // Aplica os guards de Autenticação e Autorização
  createWorkflow() {
    // Lógica para criar um workflow
  }
}
```

---

### 7. Como iniciar o projeto localmente

**Pré-requisitos:**

  - Git
  - Docker
  - Docker Compose

Você pode usar o Docker Compose da raiz ou executar os projetos separadamente.

Opção A — Docker Compose (raiz do monorepo):
1) Clonar o repositório

1.  **Clonar o repositório:**

    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd cds-bot
    ```
 
2) Configurar variáveis de ambiente

    ```bash
    cp .env.example .env
    ```

    > **Importante:** Abra o arquivo `.env` e preencha com suas senhas de banco de dados, chaves de API, etc.

3) Construir e iniciar os contêineres

    ```bash
    docker-compose up --build -d
    ```

Por padrão no `docker-compose.yml` da raiz:
- API (service api-nestjs) mapeada para `http://localhost:3000`.
- Frontend servido em `http://localhost:4200` (via Nginx).
- n8n em `http://localhost:5678`.

Observação sobre portas da API:
- Se você usar o `docker-compose.yml` dentro de `api-nestjs/`, a API sobe em `http://localhost:3099`.
- Se você usar o `docker-compose.yml` na raiz, o Nginx do frontend está configurado para proxy em `http://api-nestjs:3000` (ver `front-angular/nginx.conf`). Para manter tudo consistente, defina `PORT=3000` no arquivo `.env` de `api-nestjs` quando usar o compose raiz.

Opção B — Executar separadamente (desenvolvimento local):
1) API
    ```bash
    cd api-nestjs
    npm install
    cp .env.example .env
    npm run start:dev
    # API em http://localhost:3099 (PORT no .env)
    ```
2) Frontend
    ```bash
    cd front-angular
    npm install
    ng serve
    # Front em http://localhost:4200
    ```

Serviços e URLs úteis:

  - Frontend (Angular): `http://localhost:4200`
  - Backend API (NestJS): `http://localhost:3000` (compose raiz) ou `http://localhost:3099` (compose em `api-nestjs/`)
  - Documentação da API (Scalar): `http://localhost:<PORT>/docs`
  - OpenAPI JSON: `http://localhost:<PORT>/docs-json` (somente desenvolvimento)
  - Painel n8n: `http://localhost:5678`

### 8. Roadmap (WhatsApp e automação)

Integrações planejadas (não implementadas ainda):
- Gateway WhatsApp com provedores oficiais (360dialog, Twilio, Gupshup) e abstração de envio/recebimento;
- Tipos de mensagens: texto, imagem/arquivo, áudio/vídeo, templates de marketing (HSM), botões interativos;
- Campanhas de marketing: agendamento, segmentação, throttling, respeito a opt-in e políticas do WhatsApp Business;
- Webhooks de entrada: recebimento de mensagens/entregas/status e atualização de contexto do cliente;
- n8n: nós (nodes) customizados para acionar envios, reagir a webhooks e enriquecer dados;
- Multi-tenancy: isolamento por cliente, quotas e chaves de provedores por tenant;
- Observabilidade: métricas de entrega, falha, leitura, conversão.

### 9. Contribuição

Contribuições são bem-vindas! Antes de abrir PRs relacionados ao WhatsApp, considere:
- O uso de provedores oficiais e conformidade com políticas do WhatsApp Business;
- Definição de contratos de API estáveis para consumo por sistemas terceiros;
- Estrutura de testes e ambientes (.env) para não expor segredos.

### 10. Avisos e Limitações

- Não há, até o momento, bibliotecas de integração com WhatsApp no código (busca por Twilio/360dialog/Meta/Graph não retorna dependências).
- O frontend é um boilerplate inicial sem telas de fluxo/bot ainda.
- O n8n está disponível via Docker, porém sem fluxos inclusos neste repositório.

Este README foi ajustado para refletir fielmente o estado atual do monorepo e orientar os próximos passos com segurança e clareza.

<!-- end list -->