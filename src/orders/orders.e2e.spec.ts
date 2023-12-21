import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';

import { OrdersService } from './orders.service';

describe('OrdersController (E2E)', () => {
  let app;
  let ordersService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    ordersService = moduleFixture.get<OrdersService>(OrdersService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/orders (POST)', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .send({
        /* CreateOrderDto */
      })
      .expect(201)
      .expect(({ body }) => {
        // 👉 생성된 Order에 대한 검증
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('date');
      });
  });

  it('/orders (GET)', () => {
    return request(app.getHttpServer())
      .get('/orders')
      .expect(200)
      .expect(({ body }) => {
        // 👉 검색된 Orders에 대한 검증
        expect(Array.isArray(body)).toBe(true);
      });
  });

  it('/orders/:id (GET)', async () => {
    const createdOrder = await ordersService.createOrder({
      /* CreateOrderDto */
    });

    return request(app.getHttpServer())
      .get(`/orders/${createdOrder.id}`)
      .expect(200)
      .expect(({ body }) => {
        // 👉 검색된 Order에 대한 검증
        expect(body).toHaveProperty('id', createdOrder.id);
      });
  });

  it('/orders/:id (PATCH)', async () => {
    const createdOrder = await ordersService.createOrder({
      /* CreateOrderDto */
    });

    const updateOrderDto = {
      /* UpdateOrderDto */
    };

    const response = await request(app.getHttpServer())
      .patch(`/orders/${createdOrder.id}`)
      .send(updateOrderDto)
      .expect(200);

    // 👉 업데이트된 Order에 대한 검증
    const updatedOrder = response.body;
    expect(updatedOrder).toHaveProperty('id', createdOrder.id);
  });

  it('/orders/:id (DELETE)', async () => {
    const createdOrder = await ordersService.createOrder({
      /* CreateOrderDto */
    });

    const response = await request(app.getHttpServer())
      .delete(`/orders/${createdOrder.id}`)
      .expect(200); // 예상되는 HTTP 상태 코드

    // 👉 삭제 결과에 대한 검증
    const result = response.body;
    expect(result).toHaveProperty('message', 'Order deleted successfully');
  });
});
