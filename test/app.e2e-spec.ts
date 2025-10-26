import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('CDS Bot API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('App Controller', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('WhatsApp Module - Conexões e Sessões', () => {
    it('/whatsapp/sessions (GET) - deve listar sessões', () => {
      return request(app.getHttpServer())
        .get('/whatsapp/sessions')
        .expect(200);
    });

    it('/whatsapp/session (POST) - deve validar dados obrigatórios', () => {
      return request(app.getHttpServer())
        .post('/whatsapp/session')
        .send({})
        .expect(400);
    });
  });

  describe('Helpdesk Module - Mensageria e Atendimento', () => {
    it('/helpdesk/sessions/available (GET) - deve listar sessões disponíveis', () => {
      return request(app.getHttpServer())
        .get('/helpdesk/sessions/available')
        .expect(200);
    });

    it('/helpdesk/messages/send (POST) - deve validar dados obrigatórios', () => {
      return request(app.getHttpServer())
        .post('/helpdesk/messages/send')
        .send({})
        .expect(400);
    });

    it('/helpdesk/messages/bulk (POST) - deve validar array de mensagens', () => {
      return request(app.getHttpServer())
        .post('/helpdesk/messages/bulk')
        .send({ messages: [] })
        .expect(400);
    });

    it('/helpdesk/conversations (GET) - deve listar conversas ativas', () => {
      return request(app.getHttpServer())
        .get('/helpdesk/conversations')
        .expect(200);
    });
  });
});
