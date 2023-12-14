import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';

import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { reservationsProviders } from './reservations.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ReservationsController],
  providers: [...reservationsProviders, ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
