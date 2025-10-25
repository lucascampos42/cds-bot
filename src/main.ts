import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('WhatsApp Microservice API')
    .setDescription(
      'API para gerenciar sessões do WhatsApp e enviar mensagens.',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Endpoint da UI do Swagger e do JSON
  SwaggerModule.setup('api', app, document);

  // Endpoint da UI do Scalar
  app.use(
    '/docs',
    apiReference({
      spec: {
        content: document,
      },
      title: 'WhatsApp Microservice API',
      theme: 'purple',
      customCss: `
        .scalar-app {
          --scalar-color-1: #121212;
          --scalar-color-2: #5f5d5dff;
          --scalar-color-3: #8b5cf6;
          --scalar-color-accent: #a855f7;
        }
      `,
    }),
  );

  const port = process.env.PORT || 3099;
  await app.listen(port);
  console.log(`Aplicação rodando na porta ${port}`);
  console.log(`Documentação (Scalar) disponível em: http://localhost:${port}/docs`);
  console.log(`Documentação (Swagger UI) disponível em: http://localhost:${port}/api`);
  console.log(`Especificação OpenAPI JSON em: http://localhost:${port}/api-json`);
}

bootstrap();
