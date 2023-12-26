import { OrdersController } from '@/orders/orders.controller';
import { OrdersService } from '@/orders/orders.service';
import { Test, TestingModule } from '@nestjs/testing';

export const mockOrderRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

export async function orderFixture() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    controllers: [OrdersController],
    providers: [
      OrdersService,
      {
        provide: 'ORDER_REPOSITORY',
        useValue: mockOrderRepository,
      },
    ],
  }).compile();

  return moduleFixture;
}
