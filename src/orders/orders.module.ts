import { Module } from '@nestjs/common';
import { DatabaseModule } from '@domains/database/database.module';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ordersProviders } from './orders.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [OrdersController],
  providers: [...ordersProviders, OrdersService],
})
export class OrdersModule {}
