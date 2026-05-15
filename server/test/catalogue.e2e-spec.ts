import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('EWA API (e2e)', () => {
  let app: import('@nestjs/common').INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication({ rawBody: true });
    app.setGlobalPrefix('api');
    app.use(helmet());
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /api/v1/health', async () => {
    await request(app.getHttpServer()).get('/api/v1/health').expect(200);
  });

  it('GET /api/v1/catalogue/products returns seeded catalogue', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/catalogue/products')
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('title');
    expect(res.body.data[0]).toHaveProperty('price');
    expect(res.body.data[0]).toHaveProperty('priceKobo');
    expect(typeof res.body.data[0].priceKobo).toBe('number');
  });

  it('GET /api/v1/catalogue/products/key/:catalogueKey resolves legacy id', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/catalogue/products/key/04')
      .expect(200);
    expect(res.body.catalogueKey).toBe('04');
    expect(res.body.title).toBeTruthy();
  });

  it('GET /api/v1/catalogue/products/featured returns array', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/catalogue/products/featured')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/v1/catalogue/categories lists categories', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/catalogue/categories')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/auth/register creates a customer', async () => {
    const email = `e2e-${Date.now()}@ewa.local`;
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'E2e-long-passw0rd!',
      })
      .expect((r) => {
        expect([200, 201]).toContain(r.status);
      });
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });
});
