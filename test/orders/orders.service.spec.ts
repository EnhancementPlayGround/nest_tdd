import { TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';

import { Order } from '@/entities/order.entity';
import { mockOrderRepository, orderFixture } from '@test/orders/orders.fixture';
import { OrdersService } from '@/orders/orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let order: Order;
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeEach(async () => {
    order = new Order();

    moduleFixture = await orderFixture();
    app = moduleFixture.createNestApplication();
    service = moduleFixture.get<OrdersService>(OrdersService);

    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('create Order', () => {
    it('should create/save new order in repository', async () => {
      const createOrderDto = {
        seat: '33',
        date: '2023-12-22',
        userId: '',
        reservationId: '',
        paymentType: 'point',
      };

      const createdOrder = new Order();
      mockOrderRepository.create.mockReturnValue(createdOrder);
      mockOrderRepository.save.mockResolvedValue(createdOrder);

      const result = await service.createOrder(createOrderDto);

      expect(mockOrderRepository.create).toHaveBeenCalledWith(createOrderDto);
      expect(mockOrderRepository.save).toHaveBeenCalledWith(createdOrder);
      expect(result).toEqual(createdOrder);
    });

    it('should create and return a new order', async () => {
      const createOrderDto = {
        seat: '33',
        date: '2023-12-22',
        userId: '84a9e237-4722-4302-8fc3-6e24f2a3ba53',
        reservationId: '65fa3134-9f33-4b80-b036-a7f56a899ab2',
        paymentType: 'point',
      };

      jest.spyOn(service, 'createOrder').mockResolvedValue(order);
      const result = await service.createOrder(createOrderDto);

      expect(result).toBe(order);
    });
  });

  describe('findAll Orders', () => {
    it('should find all orders in repository', async () => {
      const n = 5;
      const orders = Array.from({ length: n }, () => new Order());
      mockOrderRepository.find.mockReturnValue(orders);

      const result = await service.findAll();

      expect(result).toStrictEqual(orders);
    });

    it('should return all orders', async () => {
      const n = 5;
      const orders = Array.from({ length: n }, () => new Order());
      jest.spyOn(service, 'findAll').mockResolvedValue(orders);

      const result = await service.findAll();

      expect(result).toStrictEqual(orders);
    });
  });

  describe('findOne Order by id', () => {
    it('should return an order by ID', async () => {
      const orderId = 'exampleOrderId';
      mockOrderRepository.findOneBy.mockResolvedValue(order);

      const result = await service.findOneOrderOrFail(orderId);

      expect(result).toEqual(order);
    });

    it('should return null for non-existing order', async () => {
      const orderId = 'nonExistentOrderId';
      jest.spyOn(service, 'findOneOrderOrFail').mockResolvedValue(null);

      const result = await service.findOneOrderOrFail(orderId);

      expect(result).toBeNull();
    });
  });

  describe('update Order', () => {
    it('should update an existing order', async () => {
      const orderId = 'exampleOrderId';
      const updateOrderDtoPending = {
        status: 'pending',
      };
      mockOrderRepository.save.mockResolvedValue(order);

      const resultPending = await service.updateOrder(
        orderId,
        updateOrderDtoPending,
      );

      expect(resultPending).toEqual(order);

      const updateOrderDtoDone = {
        status: 'done',
      };

      const resultDone = await service.updateOrder(orderId, updateOrderDtoDone);

      expect(resultDone).toEqual(order);
    });

    it('should throw an exception for non-existing order', async () => {
      const orderId = 'nonExistentOrderId';
      const updateOrderDto = {
        status: 'pending',
      };
      jest.spyOn(service, 'findOneOrderOrFail').mockResolvedValue(null);

      await expect(
        service.updateOrder(orderId, updateOrderDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove Order', () => {
    it('should delete an existing order', async () => {
      const orderId = 'exampleOrderId';
      jest.spyOn(service, 'findOneOrderOrFail').mockResolvedValue(order);
      mockOrderRepository.remove.mockResolvedValue({ affected: 1 });

      await service.deleteOrder(orderId);

      expect(service.findOneOrderOrFail).toHaveBeenCalledWith(orderId);
      expect(mockOrderRepository.remove).toHaveBeenCalledWith(order);
    });

    it('should throw an exception for non-existing order', async () => {
      const orderId = 'nonExistentOrderId';

      jest.spyOn(service, 'findOneOrderOrFail').mockResolvedValue(null);

      await expect(service.deleteOrder(orderId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
