import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';

import { authProviders } from '@/auth/auth.providers';
import { AuthService } from '@/auth/auth.service';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { reservationsProviders } from './reservations.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ReservationsController],
  providers: [
    ...reservationsProviders,
    ReservationsService,
    ...authProviders,
    AuthService,
  ],
  exports: [ReservationsService],
})
export class ReservationsModule {}
