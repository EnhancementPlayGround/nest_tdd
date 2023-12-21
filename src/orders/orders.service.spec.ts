import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

const mockOrderRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('OrdersService', () => {
  let service: OrdersService;

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

    service = module.get<OrdersService>(OrdersService);
  });

  describe('create Order', () => {
    it('should create a new order', async () => {
      const createOrderDto = {
        // CreateOrderDto
      };

      // mockOrderRepository.save() => 생성한 Order를 반환하도록 작성

      // orderSerive의 createOrder 호출
      // test 👉 생성된 Order를 반환하는지 검증
    });
  });

  describe('findAll Orders', () => {
    it('should return all orders', async () => {
      // mockOrderRepository.find() => Orders 배열 반환
      // orderService의 findAllOrders 메서드를 호출
      // test 👉 반환된 Orders 배열의 길이를 검증
    });
  });

  describe('findOne Order by id', () => {
    it('should return an order by ID', async () => {
      const orderId = 'exampleOrderId';

      // mockOrderRepository.findOne() => Order를 반환

      // orderSerive의의 findOneById 메서드를 호출
      // test 👉 반환된 Order가 예상 orderId와 일치하는지 검증
    });

    it('should return null for non-existing order', async () => {
      const orderId = 'nonExistingOrderId';

      // mockOrderRepository.findOne() => null 반환

      // orderSerive의의 findOneById 메서드를 호출
      // test 👉 반환된 값이 null인지 검증
      // null 반환
    });
  });

  describe('update Order', () => {
    it('should update an existing order', async () => {
      const orderId = 'exampleOrderId';
      const updateOrderDto = {
        // UpdateOrderDto
      };

      // mockOrderRepository.findOne() => Order 반환
      // mockOrderRepository.save()를 사용하여 Order 업데이트

      // orderSerive의의 updateOrder 메서드를 호출
      // test 👉 반환된 업데이트된 Order가 예상된 값과 일치하는지 검증
    });

    it('should throw an exception for non-existing order', async () => {
      // mockOrderRepository.findOne() => null 반환
      // orderSerive의의 updateOrder 메서드를 호출
      // test 👉 예외 검증
    });
  });

  describe('remove Order', () => {
    it('should delete an existing order', async () => {
      const orderId = 'exampleOrderId';

      // mockOrderRepository.findOne() => Order 반환
      // mockOrderRepository.delete() => Order 삭제

      // 서비스의 deleteOrder 메서드를 호출
      // test 👉 호출여부 검증 (toHaveBeenCalledWith? 삭제 검증 더 찾아보기)
    });

    it('should throw an exception for non-existing order', async () => {
      // mockOrderRepository.findOne() => null 반환
      // orderSerive의의 deleteOrder 메서드를 호출
      // test 👉 예외 검증
    });
  });
});
