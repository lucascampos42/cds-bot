# 📱 CDS-BOT - API do WhatsApp

O **CDS-BOT** é uma API de serviço para enviar mensagens via WhatsApp, projetada para ser integrada a outros sistemas que precisam enviar avisos, notificações e campanhas promocionais.

## ✨ Sobre o Projeto

Este serviço fornece uma API simples e robusta para enviar mensagens do WhatsApp, oferecendo:

- **API RESTful**: Endpoints simples para integração com qualquer sistema.
- **Conexão em Tempo Real**: Autenticação via QR code em tempo real.
- **Reconexão Automática**: Mantém a sessão ativa e reconecta automaticamente.

## 🚀 Tecnologias

- **Framework**: NestJS 11 com TypeScript
- **WhatsApp API**: Baileys (API Multi-dispositivo)
- **Documentação da API**: OpenAPI (compatível com Scalar, Bruno e Swagger UI)

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

### Documentação Interativa
- **Scalar**: [http://localhost:3099/docs](http://localhost:3099/docs)
- **Swagger UI**: [http://localhost:3099/api](http://localhost:3099/api)
- **Especificação OpenAPI**: [http://localhost:3099/api-json](http://localhost:3099/api-json)

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
