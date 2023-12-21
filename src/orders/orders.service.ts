import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { serialize } from '@/interceptors/serialize.interceptor';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

import { Order } from '@/entities/order.entity';
import { OrderDto } from './dto/order.dto';

@Injectable()
@serialize(OrderDto)
export class OrdersService {
  constructor(
    @Inject('ORDER_REPOSITORY')
    private ordersRepository: Repository<Order>,
  ) {}

  create(createOrderDto: CreateOrderDto) {
    console.log(createOrderDto);
  }

  async findAll(): Promise<Order[]> {
    return [];
  }

  async findOneById(id: string): Promise<Order | null> {
    // order가 없을 때 null 반환
    return null;

    // return order
  }

  updateOrder(id: string, updateOrderDto: UpdateOrderDto) {
    console.log(updateOrderDto);
    // order가 없을 때, exception 반환
  }

  deleteOrder(id: string) {
    // order가 없을 때, exception 반환
  }
}
