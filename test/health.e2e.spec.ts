import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { HealthModule } from '@/health/health.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health/ping (GET)', async () => {
    await request(app.getHttpServer())
      .get('/health/ping')
      .expect(200)
      .expect('health');
  });

  it('/health (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      info: { 'nestjs-docs': { status: 'down' } },
      error: {},
      details: { 'nestjs-docs': { status: 'down' } },
    });
  });

  afterEach(async () => await app.close());
});
