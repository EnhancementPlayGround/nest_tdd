import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from '@/entities/order.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockOrderRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('OrdersService', () => {
  let service: OrdersService;
  let order: Order;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        OrdersService,
        {
          provide: 'ORDER_REPOSITORY',
          useValue: mockOrderRepository,
        },
      ],
    }).compile();

    order = new Order();
    service = module.get<OrdersService>(OrdersService);
  });

  describe('create Order', () => {
    it('should create/save new order in repository', async () => {
      const createOrderDto = {
        seat: '33',
        date: '2023-12-22',
        userId: '',
        reservationId: 0,
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
        userId: '',
        reservationId: 0,
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

      const result = await service.findOrderById(orderId);

      expect(result).toEqual(order);
    });

    it('should return null for non-existing order', async () => {
      const orderId = 'nonExistentOrderId';
      jest.spyOn(service, 'findOrderById').mockResolvedValue(null);

      const result = await service.findOrderById(orderId);

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
      jest.spyOn(service, 'findOrderById').mockResolvedValue(null);

      await expect(
        service.updateOrder(orderId, updateOrderDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove Order', () => {
    it('should delete an existing order', async () => {
      const orderId = 'exampleOrderId';
      jest.spyOn(service, 'findOrderById').mockResolvedValue(order);
      mockOrderRepository.remove.mockResolvedValue({ affected: 1 });

      await service.deleteOrder(orderId);

      expect(service.findOrderById).toHaveBeenCalledWith(orderId);
      expect(mockOrderRepository.remove).toHaveBeenCalledWith(order);
    });

    it('should throw an exception for non-existing order', async () => {
      const orderId = 'nonExistentOrderId';

      jest.spyOn(service, 'findOrderById').mockResolvedValue(null);

      await expect(service.deleteOrder(orderId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
