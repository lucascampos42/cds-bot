# Tenant Management

Sistema responsável pela criação e gestão de novos clientes (schemas) no ambiente multi-tenant.

## Funcionalidades

- **Criação de Tenants**: Provisiona novos schemas para clientes
- **Validação**: Verifica disponibilidade e valida dados do cliente
- **Registro Central**: Mantém controle de todos os tenants ativos
- **Bootstrap**: Aplica migrations e configurações iniciais

## Estrutura

```
tenant-management/
├── dto/                    # Data Transfer Objects
├── services/              # Lógica de negócio
├── tenant.controller.ts   # Endpoints REST
├── tenant.module.ts       # Módulo NestJS
└── README.md             # Documentação
```

## Endpoints

- `POST /tenant` - Criar novo tenant
- `GET /tenant/:id` - Consultar tenant
- `PUT /tenant/:id/status` - Atualizar status
- `DELETE /tenant/:id` - Remover tenant

## Fluxo de Criação

1. Validação dos dados do cliente
2. Verificação de disponibilidade do ID
3. Criação do schema no PostgreSQL
4. Aplicação das migrations
5. Registro no controle central
6. Ativação do tenant