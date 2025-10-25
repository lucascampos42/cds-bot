import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const config = new DocumentBuilder()
    .setTitle('🚀 CDS-BOT - WhatsApp API')
    .setDescription(
      `
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

  app.use(
    '/docs',
    apiReference({
      content: document,
      theme: 'kepler',
      metaData: {
        title: 'CDS-BOT - API WhatsApp',
        description: 'Documentação da API para integração com WhatsApp',
      },
      darkMode: true,
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
