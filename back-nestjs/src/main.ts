import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    '/docs',
    apiReference({
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
  console.log(`Documentação disponível em: http://localhost:${port}/docs`);
}

bootstrap();
