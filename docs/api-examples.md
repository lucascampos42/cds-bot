# 🚀 CDS-BOT - Exemplos de Uso da API WhatsApp

## 📋 Índice

1. [Configuração Inicial](#configuração-inicial)
2. [Criando uma Sessão](#criando-uma-sessão)
3. [Monitorando Conexão](#monitorando-conexão)
4. [Enviando Mensagens](#enviando-mensagens)
5. [Exemplos Completos](#exemplos-completos)

## 🔧 Configuração Inicial

### Base URL
```
Desenvolvimento: http://localhost:3099
Produção: https://api.seudominio.com
```

### Headers Necessários
```http
Content-Type: application/json
Accept: application/json
```

## 📱 Criando uma Sessão

### Endpoint
```http
POST /whatsapp/sessions
```

### Exemplo de Request
```bash
curl -X POST http://localhost:3099/whatsapp/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "minha-sessao-001"
  }'
```

### Exemplo de Response (Sucesso)
```json
{
  "success": true,
  "message": "Sessão criada com sucesso. Conecte-se ao stream para obter o QR code.",
  "data": {
    "sessionId": "minha-sessao-001",
    "status": "starting",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Exemplo de Response (Erro)
```json
{
  "success": false,
  "message": "Sessão já existe",
  "error": "DUPLICATE_SESSION",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔄 Monitorando Conexão

### Endpoint
```http
GET /whatsapp/sessions/{sessionId}/stream
```

### Exemplo com JavaScript (Browser)
```javascript
const sessionId = 'minha-sessao-001';
const eventSource = new EventSource(`http://localhost:3099/whatsapp/sessions/${sessionId}/stream`);

// Receber QR Code
eventSource.addEventListener('qr', (event) => {
  const data = JSON.parse(event.data);
  console.log('QR Code recebido:', data.qr);
  
  // Exibir QR code na tela
  displayQRCode(data.qr);
});

// Monitorar status da conexão
eventSource.addEventListener('status', (event) => {
  const data = JSON.parse(event.data);
  console.log('Status atualizado:', data.status);
  
  if (data.status === 'open') {
    console.log('✅ WhatsApp conectado com sucesso!');
    eventSource.close();
  }
});

// Tratar erros
eventSource.addEventListener('error', (event) => {
  console.error('❌ Erro na conexão:', event);
});
```

### Exemplo com Node.js
```javascript
const EventSource = require('eventsource');

const sessionId = 'minha-sessao-001';
const eventSource = new EventSource(`http://localhost:3099/whatsapp/sessions/${sessionId}/stream`);

eventSource.addEventListener('qr', (event) => {
  const data = JSON.parse(event.data);
  console.log('📱 Escaneie este QR code no WhatsApp:');
  console.log(data.qr);
});

eventSource.addEventListener('status', (event) => {
  const data = JSON.parse(event.data);
  console.log(`🔄 Status: ${data.status}`);
  
  if (data.status === 'open') {
    console.log('✅ Pronto para enviar mensagens!');
    eventSource.close();
  }
});
```

## 💬 Enviando Mensagens

### Endpoint
```http
POST /whatsapp/send
```

### Exemplo de Request
```bash
curl -X POST http://localhost:3099/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "minha-sessao-001",
    "number": "5511999999999",
    "message": "Olá! Esta é uma mensagem de teste do CDS-BOT 🤖"
  }'
```

### Exemplo de Response (Sucesso)
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso",
  "data": {
    "messageId": "msg_123456789",
    "sessionId": "minha-sessao-001",
    "number": "5511999999999",
    "sentAt": "2024-01-15T10:35:00.000Z"
  }
}
```

### Exemplo de Response (Erro)
```json
{
  "success": false,
  "message": "Sessão não encontrada ou não conectada",
  "error": "SESSION_NOT_CONNECTED",
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

## 📋 Listando Sessões Ativas

### Endpoint
```http
GET /whatsapp/sessions
```

### Exemplo de Request
```bash
curl -X GET http://localhost:3099/whatsapp/sessions
```

### Exemplo de Response
```json
{
  "success": true,
  "message": "Sessões listadas com sucesso",
  "data": {
    "sessions": [
      {
        "sessionId": "minha-sessao-001",
        "status": "open",
        "connectedAt": "2024-01-15T10:32:00.000Z"
      },
      {
        "sessionId": "sessao-cliente-002",
        "status": "connecting",
        "createdAt": "2024-01-15T10:40:00.000Z"
      }
    ],
    "total": 2
  }
}
```

## 🏥 Verificação de Saúde

### Endpoint
```http
GET /health
```

### Exemplo de Request
```bash
curl -X GET http://localhost:3099/health
```

### Exemplo de Response
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "WhatsApp Microservice",
  "version": "1.0.0"
}
```

## 🔄 Exemplos Completos

### Fluxo Completo em JavaScript
```javascript
class WhatsAppBot {
  constructor(baseUrl = 'http://localhost:3099') {
    this.baseUrl = baseUrl;
  }

  async createSession(sessionId) {
    const response = await fetch(`${this.baseUrl}/whatsapp/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    return response.json();
  }

  async connectToStream(sessionId) {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`${this.baseUrl}/whatsapp/sessions/${sessionId}/stream`);
      
      eventSource.addEventListener('qr', (event) => {
        const data = JSON.parse(event.data);
        console.log('📱 QR Code:', data.qr);
      });

      eventSource.addEventListener('status', (event) => {
        const data = JSON.parse(event.data);
        console.log('🔄 Status:', data.status);
        
        if (data.status === 'open') {
          eventSource.close();
          resolve(true);
        }
      });

      eventSource.addEventListener('error', () => {
        eventSource.close();
        reject(new Error('Erro na conexão'));
      });
    });
  }

  async sendMessage(sessionId, number, message) {
    const response = await fetch(`${this.baseUrl}/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, number, message })
    });
    return response.json();
  }

  async getSessions() {
    const response = await fetch(`${this.baseUrl}/whatsapp/sessions`);
    return response.json();
  }
}

// Uso da classe
async function main() {
  const bot = new WhatsAppBot();
  
  try {
    // 1. Criar sessão
    console.log('🚀 Criando sessão...');
    await bot.createSession('bot-exemplo');
    
    // 2. Conectar e aguardar QR
    console.log('📱 Conectando ao WhatsApp...');
    await bot.connectToStream('bot-exemplo');
    
    // 3. Enviar mensagem
    console.log('💬 Enviando mensagem...');
    const result = await bot.sendMessage(
      'bot-exemplo',
      '5511999999999',
      'Olá! Bot conectado com sucesso! 🤖'
    );
    
    console.log('✅ Resultado:', result);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

main();
```

### Fluxo Completo em Python
```python
import requests
import json
from sseclient import SSEClient

class WhatsAppBot:
    def __init__(self, base_url='http://localhost:3099'):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def create_session(self, session_id):
        response = self.session.post(
            f'{self.base_url}/whatsapp/sessions',
            json={'sessionId': session_id}
        )
        return response.json()

    def connect_to_stream(self, session_id):
        url = f'{self.base_url}/whatsapp/sessions/{session_id}/stream'
        
        for event in SSEClient(url):
            if event.event == 'qr':
                data = json.loads(event.data)
                print(f'📱 QR Code: {data["qr"]}')
                
            elif event.event == 'status':
                data = json.loads(event.data)
                print(f'🔄 Status: {data["status"]}')
                
                if data['status'] == 'open':
                    print('✅ WhatsApp conectado!')
                    break

    def send_message(self, session_id, number, message):
        response = self.session.post(
            f'{self.base_url}/whatsapp/send',
            json={
                'sessionId': session_id,
                'number': number,
                'message': message
            }
        )
        return response.json()

    def get_sessions(self):
        response = self.session.get(f'{self.base_url}/whatsapp/sessions')
        return response.json()

# Uso da classe
if __name__ == '__main__':
    bot = WhatsAppBot()
    
    try:
        # 1. Criar sessão
        print('🚀 Criando sessão...')
        bot.create_session('bot-python')
        
        # 2. Conectar e aguardar QR
        print('📱 Conectando ao WhatsApp...')
        bot.connect_to_stream('bot-python')
        
        # 3. Enviar mensagem
        print('💬 Enviando mensagem...')
        result = bot.send_message(
            'bot-python',
            '5511999999999',
            'Olá do Python! 🐍'
        )
        
        print('✅ Resultado:', result)
        
    except Exception as error:
        print(f'❌ Erro: {error}')
```

## 🚨 Códigos de Erro Comuns

| Código | Descrição | Solução |
|--------|-----------|---------|
| `DUPLICATE_SESSION` | Sessão já existe | Use um sessionId diferente |
| `SESSION_NOT_FOUND` | Sessão não encontrada | Verifique se a sessão foi criada |
| `SESSION_NOT_CONNECTED` | Sessão não conectada | Aguarde a conexão via QR code |
| `INVALID_NUMBER` | Número inválido | Use formato internacional (5511999999999) |
| `MESSAGE_FAILED` | Falha no envio | Verifique conexão e tente novamente |

## 📞 Suporte

- **Documentação**: http://localhost:3099/docs
- **OpenAPI Spec**: http://localhost:3099/api
- **Health Check**: http://localhost:3099/health