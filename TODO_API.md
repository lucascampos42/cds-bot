# API - Funcionalidades Pendentes

Este arquivo rastreia as funcionalidades e rotas da API que foram planejadas para melhor integração com sistemas de automação (como n8n) e que ainda precisam ser implementadas.

## Gerenciamento de Sessão

- [ ] **`DELETE /sessions/{sessionId}`**
  - **Descrição**: Implementar uma rota para encerrar e desconectar uma sessão específica do WhatsApp. Isso é crucial para gerenciamento remoto e para reiniciar bots de forma controlada.
  - **Verbo HTTP**: `DELETE`
  - **Endpoint Sugerido**: `/whatsapp/sessions/{sessionId}`

## Envio de Mensagens

- [ ] **`POST /sessions/{sessionId}/messages/send-media`**
  - **Descrição**: Criar uma rota para enviar mensagens de mídia, como imagens, vídeos e documentos. A rota deve aceitar uma URL para o arquivo de mídia.
  - **Verbo HTTP**: `POST`
  - **Endpoint Sugerido**: `/whatsapp/sessions/{sessionId}/messages/send-media`
  - **Corpo da Requisição (Exemplo)**:
    ```json
    {
      "to": "5511999998888",
      "mediaUrl": "https://path.to/your/image.jpg",
      "caption": "Legenda da imagem!"
    }
    ```

## Webhooks para Integração (Alternativa ao WebSocket/SSE)

- [ ] **Implementar Sistema de Webhooks Configurável**
  - **Descrição**: Embora a API já use WebSocket/SSE, para sistemas como o n8n, um sistema de webhooks pode ser mais simples de configurar. A ideia é permitir que o usuário, ao criar uma sessão, forneça uma `webhookUrl`.
  - **Modificação Sugerida**: Adicionar um campo opcional `webhookUrl` no DTO `CreateSessionDto`.
  - **Eventos a serem enviados**:
    - `message.received`: Notifica a URL configurada sobre novas mensagens.
    - `session.status`: Notifica sobre mudanças de status (CONNECTED, DISCONNECTED, SCAN_QR_CODE).

## Melhorias e Refatoração

- [ ] **Padronizar Rotas de Mensagens**
  - **Descrição**: Considerar mover a rota de envio de mensagem para ficar aninhada dentro do recurso de sessão, para uma API mais RESTful.
  - **Rota Atual**: `POST /whatsapp/send`
  - **Sugestão**: `POST /whatsapp/sessions/{sessionId}/messages/send`
