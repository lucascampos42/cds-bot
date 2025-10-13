# Módulo WhatsApp

Este documento detalha a arquitetura e o uso do módulo WhatsApp, que permite a conexão com múltiplas contas do WhatsApp Business usando a biblioteca Baileys.

## Arquitetura

O módulo é projetado para gerenciar múltiplas instâncias de conexão do WhatsApp de forma isolada. Cada instância representa uma conta de WhatsApp diferente e possui sua própria sessão de autenticação, que é armazenada no diretório `baileys_auth/<instanceId>`.

### Componentes Principais

-   **`WhatsAppController`**: O controlador NestJS que expõe os endpoints da API para gerenciar as instâncias do WhatsApp.
-   **`WhatsAppInstanceManager`**: Um serviço responsável por criar, gerenciar e destruir instâncias de conexão do WhatsApp. Ele mantém um mapa de todas as instâncias ativas.
-   **`WhatsAppInstance`**: Uma classe que representa uma única conexão com o WhatsApp. Ela encapsula a lógica de inicialização, tratamento de eventos (como QR code e status de conexão) e envio de mensagens.

## Endpoints da API

Todas as rotas do WhatsApp são prefixadas com `/api/v1/whatsapp`.

### Gerenciamento de Instâncias

#### `POST /instances/:instanceId`

Cria e inicializa uma nova instância do WhatsApp.

-   **Parâmetros:**
    -   `instanceId` (string): Um identificador único para a nova instância (ex: `minha-loja-1`, `suporte-vendas`).
-   **Resposta de Sucesso (201):**
    -   Retorna o status inicial da instância.

```json
{
  "instanceId": "minha-loja-1",
  "connected": false,
  "hasQr": true,
  "isInitializing": false
}
```

---

#### `GET /instances`

Lista o status de todas as instâncias ativas.

-   **Resposta de Sucesso (200):**
    -   Retorna um array com o status de cada instância.

```json
[
  {
    "instanceId": "minha-loja-1",
    "connected": false,
    "hasQr": true,
    "isInitializing": false
  },
  {
    "instanceId": "suporte-vendas",
    "connected": true,
    "hasQr": false,
    "isInitializing": false
  }
]
```

---

#### `GET /instances/:instanceId/status`

Obtém o status de uma instância específica.

-   **Parâmetros:**
    -   `instanceId` (string): O ID da instância.
-   **Resposta de Sucesso (200):**
    -   Retorna o status da instância.

---

#### `DELETE /instances/:instanceId`

Encerra a conexão e remove uma instância do WhatsApp.

-   **Parâmetros:**
    -   `instanceId` (string): O ID da instância.
-   **Resposta de Sucesso (200):**

```json
{
  "message": "Instance minha-loja-1 closed."
}
```

### Conexão e QR Code

#### `GET /instances/:instanceId/qr`

Obtém o QR code para conectar uma nova instância. O QR code é retornado como uma string.

-   **Parâmetros:**
    -   `instanceId` (string): O ID da instância.
-   **Resposta de Sucesso (200):**

```json
{
  "qr": "2@t1Z...=="
}
```

---

#### `GET /instances/:instanceId/reconnect`

Força a reconexão de uma instância. Útil se a conexão cair ou se um novo QR code for necessário após um timeout.

-   **Parâmetros:**
    -   `instanceId` (string): O ID da instância.
-   **Resposta de Sucesso (200):**

```json
{
  "message": "Reconnection initiated. Monitor status and QR code."
}
```

### Envio de Mensagens

#### `POST /instances/:instanceId/send-text`

Envia uma mensagem de texto de uma instância específica.

-   **Parâmetros:**
    -   `instanceId` (string): O ID da instância.
-   **Corpo da Requisição:**

```json
{
  "jid": "5511999999999@s.whatsapp.net",
  "text": "Olá, mundo!"
}
```

-   **Resposta de Sucesso (201):**

```json
{
  "messageId": "3EB0...",
  "to": "5511999999999@s.whatsapp.net"
}
```
