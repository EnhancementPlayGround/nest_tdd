import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { Order } from '@/entities/order.entity';
import { OrdersService } from '@/orders/orders.service';
import { orderFixture } from '@test/orders/orders.fixture';

describe('OrdersController (E2E)', () => {
  let service: OrdersService;
  let order: Order;
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    order = new Order();

    moduleFixture = await orderFixture();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    service = moduleFixture.get<OrdersService>(OrdersService);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('/orders (POST)', async () => {
    const createOrderDto = {
      seat: '33',
      date: '2023-12-22',
      userId: '84a9e237-4722-4302-8fc3-6e24f2a3ba53',
      reservationId: 'fe060e9e-3aef-4cfe-bac6-254274830138',
      paymentType: 'point',
    };
    const orderCreated: Order = {
      ...createOrderDto,
      id: 'ca8144de-4bf6-47a2-bd2a-706cfbca7df0',
      createdAt: new Date(),
      status: 'created',
    };

    jest.spyOn(service, 'createOrder').mockResolvedValue(orderCreated);

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(createOrderDto)
      .expect(201);
    const createdOrder: Order = await response.body;

    expect(createdOrder).toHaveProperty('date', createOrderDto.date);
  });

  it('/orders (GET)', async () => {
    const testData: Order[] = [order];
    jest.spyOn(service, 'findAll').mockResolvedValue(testData);

    const response = await request(app.getHttpServer())
      .get('/orders')
      .expect(200);
    const orders: Order[] = response.body;

    expect(orders).toHaveLength(testData.length);
  });

  it('/orders/:id (GET)', async () => {
    const testOrderId = 'exampleOrderId';
    const orderResponse: Order = {
      id: testOrderId,
      createdAt: new Date(),
      status: 'created',
      seat: '33',
      date: '2023-12-22',
      userId: '84a9e237-4722-4302-8fc3-6e24f2a3ba53',
      reservationId: 'fe060e9e-3aef-4cfe-bac6-254274830138',
      paymentType: 'point',
    };
    jest.spyOn(service, 'findOrderById').mockResolvedValue(orderResponse);

    const response = await request(app.getHttpServer())
      .get(`/orders/${testOrderId}`)
      .expect(200);

    const retrievedOrder: Order = response.body;

    expect(retrievedOrder).toHaveProperty('id', testOrderId);
  });

  it('/orders/:id (PATCH) (status to pending)', async () => {
    const testOrderId = 'exampleOrderId';
    const orderResponse: Order = {
      id: testOrderId,
      createdAt: new Date(),
      status: 'created',
      seat: '33',
      date: '2023-12-22',
      userId: '84a9e237-4722-4302-8fc3-6e24f2a3ba53',
      reservationId: 'fe060e9e-3aef-4cfe-bac6-254274830138',
      paymentType: 'point',
    };
    const updateOrderDto = { status: 'pending' };
    jest.spyOn(service, 'updateOrder').mockResolvedValue(orderResponse);

    const response = await request(app.getHttpServer())
      .patch(`/orders/${testOrderId}`)
      .send(updateOrderDto)
      .expect(200);

    const updatedOrder: Order = response.body;

    expect(updatedOrder).toHaveProperty('id', testOrderId);
  });

  it('/orders/:id (PATCH) (status to done)', async () => {
    const testOrderId = 'exampleOrderId';
    const updateOrderDto = { status: 'done' };
    const orderResponse: Order = {
      id: testOrderId,
      createdAt: new Date(),
      status: 'created',
      seat: '33',
      date: '2023-12-22',
      userId: '84a9e237-4722-4302-8fc3-6e24f2a3ba53',
      reservationId: 'fe060e9e-3aef-4cfe-bac6-254274830138',
      paymentType: 'point',
    };

    Object.assign(orderResponse, updateOrderDto);

    jest.spyOn(service, 'updateOrder').mockResolvedValue(orderResponse);

    const response = await request(app.getHttpServer())
      .patch(`/orders/${testOrderId}`)
      .send(updateOrderDto)
      .expect(200);

    const updatedOrder: Order = response.body;

    expect(updatedOrder).toHaveProperty('id', testOrderId);
  });

  it('/orders/:id (DELETE)', async () => {
    const testOrderId = 'exampleOrderId';
    jest.spyOn(service, 'deleteOrder').mockResolvedValue();

    await request(app.getHttpServer())
      .delete(`/orders/${testOrderId}`)
      .expect(200);
  });
});
