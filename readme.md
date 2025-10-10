# CDS-BOT

> **Status do Projeto:** Em Planejamento

Plataforma de software como serviço (SaaS) projetada para oferecer automação de conversas no WhatsApp através de uma interface de construção de fluxos visuais.

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

O **CDS-BOT** é uma plataforma SaaS desenvolvida para ser um serviço autônomo e desacoplado, permitindo que seja utilizado por qualquer cliente, mas com a capacidade de ser integrado a outros sistemas (como o ERP CDS-Gestor) através de APIs no futuro.

**Objetivos Principais:**
- **Facilidade de Uso:** Permitir que usuários com pouco conhecimento técnico possam criar e gerenciar chatbots.
- **Flexibilidade:** Oferecer um motor de automação (n8n) que permita a criação de lógicas complexas e integrações com serviços de terceiros.
- **Escalabilidade:** Construir uma arquitetura que suporte um grande volume de mensagens e múltiplos clientes (multi-tenancy).
- **Segurança:** Implementar um sistema de autenticação e autorização robusto (RBAC) para proteger os dados e as funcionalidades da plataforma.

---

### 2. Arquitetura do Sistema

A plataforma é baseada em uma **Arquitetura de Microserviços** orquestrada por contêineres Docker. Cada componente principal do sistema rodará em seu próprio contêiner, comunicando-se com os outros através de uma rede interna gerenciada pelo Docker Compose.

**Diagrama de Fluxo de Dados:**

```mermaid
graph TD
    A[Usuário Admin] --> B{Browser (ANGULAR)};
    B <--> C{API Gateway (NESTJS)};
    C <--> D[Banco de Dados (PostgreSQL)];
    C --> E[Motor de Automação (N8N)];
    B --> E;
    subgraph WhatsApp
        F[Provedor Oficial WhatsApp API] <--> G[Cliente Final];
    end
    E --> F;
```

---

### 3. Tecnologias Propostas (Tech Stack)

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

* **Gateway de Comunicação:**
    * **WhatsApp:** API Oficial do WhatsApp Business (via provedores como 360dialog, Twilio, etc.)


---

### 4. Estrutura do Monorepo

O projeto está organizado em um monorepo. A estrutura de pastas foi ajustada para refletir o template utilizado na API.

```
/cds-bot/
├── api-nestjs/              # Projeto da API em NestJS com autenticação
│   ├── prisma/              # Schema e migrações do banco de dados (Prisma)
│   ├── src/
│   │   ├── application/     # Módulos de aplicação (controllers, services)
│   │   │   ├── auth/        # <-- Módulo de Autenticação e RBAC
│   │   │   ├── user/        # <-- Módulo de gerenciamento de usuários
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
├── frontend-angular/        # Projeto do Frontend em Angular
│   ├── src/                 # Código fonte do Angular
│   ├── angular.json         # Configuração do Angular CLI
│   └── package.json         # Dependências do projeto
├── n8n-data/                # (A ser criado)
│
├── docker-compose.yml       # Orquestrador principal dos serviços
├── .env.example             # Exemplo de variáveis de ambiente
└── README.md                # Este arquivo
```

---

### 5. Modelo de Autenticação e Autorização (RBAC)

**1. Autenticação (Quem é você?)**
- O usuário envia `email` e `senha` para o endpoint `POST /auth/login`.
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

### 6. Como Iniciar o Projeto Localmente

**Pré-requisitos:**

  - Git
  - Docker
  - Docker Compose

**Passos para Instalação:**

1.  **Clonar o repositório:**

    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd cds-bot
    ```

2.  **Configurar variáveis de ambiente:**

    ```bash
    cp .env.example .env
    ```

    > **Importante:** Abra o arquivo `.env` e preencha com suas senhas de banco de dados, chaves de API, etc.

3.  **Construir e iniciar os contêineres:**

    ```bash
    docker-compose up --build -d
    ```

**Acessando os Serviços:**

  - **Frontend (Angular):** `http://localhost:4200`
  - **Backend API (NestJS):** `http://localhost:3000`
  - **Painel n8n:** `http://localhost:5678`

<!-- end list -->