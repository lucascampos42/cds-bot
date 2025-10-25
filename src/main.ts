import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('🚀 CDS-BOT - WhatsApp API')
    .setDescription(`
    **API robusta para integração com WhatsApp Business**
    
    Esta API permite que você:
    - 📱 Crie e gerencie múltiplas sessões WhatsApp
    - 🔄 Monitore conexões em tempo real via Server-Sent Events
    - 💬 Envie mensagens de texto para qualquer número
    - 🔐 Autentique via QR code de forma segura
    
    ## 🚀 Como começar
    
    1. **Crie uma sessão**: Use \`POST /whatsapp/sessions\`
    2. **Conecte ao stream**: Acesse \`GET /whatsapp/sessions/{sessionId}/stream\`
    3. **Escaneie o QR**: Use o código QR recebido no stream
    4. **Envie mensagens**: Use \`POST /whatsapp/send\` após conectar
    
    ## 📋 Requisitos
    
    - Número WhatsApp válido para autenticação
    - Conexão estável com a internet
    - Cliente que suporte Server-Sent Events para monitoramento
    
    ## 🔧 Tecnologias
    
    - **Framework**: NestJS com TypeScript
    - **WhatsApp**: Baileys (API Multi-dispositivo oficial)
    - **Documentação**: OpenAPI 3.0 + Scalar
    `,
    )
    .setVersion('1.0.0')
    .setContact(
      'Suporte Técnico',
      'https://github.com/seu-usuario/cds-bot',
      'suporte@seudominio.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag('WhatsApp', 'Operações relacionadas ao WhatsApp')
    .addTag('Health', 'Verificação de saúde do serviço')
    .addServer('http://localhost:3099', 'Servidor de Desenvolvimento')
    .addServer('https://api.seudominio.com', 'Servidor de Produção')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  // Configuração do Scalar com tema personalizado
  app.use(
    '/docs',
    apiReference({
      theme: 'kepler',
      layout: 'modern',
      metaData: {
        title: '🚀 CDS-BOT - Documentação da API WhatsApp',
        description:
          'Documentação interativa da API para integração com WhatsApp Business',
        ogDescription:
          'API robusta para envio de mensagens WhatsApp com autenticação QR code',
        ogTitle: 'CDS-BOT WhatsApp API',
        twitterCard: 'summary_large_image',
      },
      customCss: `
        .scalar-app {
          --scalar-color-1: #121212;
          --scalar-color-2: #1e1e1e;
          --scalar-color-3: #2d2d2d;
          --scalar-color-accent: #00d4aa;
          --scalar-color-green: #00d4aa;
          --scalar-color-blue: #0ea5e9;
          --scalar-color-purple: #8b5cf6;
          --scalar-color-orange: #f59e0b;
          --scalar-color-red: #ef4444;
          --scalar-border-radius: 8px;
          --scalar-font-size: 14px;
        }
        
        .scalar-api-reference__header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .scalar-api-reference__sidebar {
          border-right: 1px solid var(--scalar-color-3);
        }
        
        .scalar-button {
          border-radius: var(--scalar-border-radius);
          transition: all 0.2s ease;
        }
        
        .scalar-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `,
      searchHotKey: 'k',
      showSidebar: true,
      hideModels: false,
      hideDownloadButton: false,
      darkMode: true,
      forceDarkModeState: 'dark',
      hideTestRequestButton: false,
      servers: [
        {
          url: 'http://localhost:3099',
          description: '🔧 Desenvolvimento Local',
        },
        {
          url: 'https://api.seudominio.com',
          description: '🚀 Produção',
        },
      ],
    }),
  );

  const port = process.env.PORT || 3099;
  await app.listen(port);

  console.log(`Aplicação rodando na porta ${port}`);
  console.log(
    `Documentação (Scalar) disponível em: http://localhost:${port}/docs`,
  );
  console.log(
    `Documentação (Swagger UI) disponível em: http://localhost:${port}/api`,
  );
  console.log(
    `Especificação OpenAPI JSON em: http://localhost:${port}/api-json`,
  );
}

bootstrap().catch((err) => {
  console.error('Erro ao iniciar a aplicação:', err);
  process.exit(1);
});
