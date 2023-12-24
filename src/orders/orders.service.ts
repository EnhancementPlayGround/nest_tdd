import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const result = this.ordersRepository.create({
      ...createOrderDto,
    });
    this.ordersRepository.save(result);

    return result;
  }

  async findAll(): Promise<Order[]> {
    return await this.ordersRepository.find();
  }

  async findOrderById(id: string): Promise<Order | null> {
    return this.ordersRepository.findOneBy({ id });
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOrderById(id);
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    Object.assign(order, updateOrderDto);

    return this.ordersRepository.save(order);
  }

  async deleteOrder(id: string) {
    const order = await this.findOrderById(id);
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    this.ordersRepository.remove(order);
  }
}
