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

  SwaggerModule.setup('api', app, document);

  app.use(
    '/reference',
    apiReference({
      theme: 'purple',
      favicon: '/public/logo.png',
      title: 'VenomBot API Reference',
    }),
  );

  const port = process.env.PORT || 3099;
  await app.listen(port);

  console.log(`Aplicação rodando na porta ${port}`);
  console.log(
    `Documentação (Scalar) disponível em: http://localhost:${port}/reference`,
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
