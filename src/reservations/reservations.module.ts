import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';

import { authProviders } from '@/auth/auth.providers';
import { AuthService } from '@/auth/auth.service';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { reservationsProviders } from './reservations.providers';
import { usersProviders } from '@/users/users.providers';
import { UsersService } from '@/users/users.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ReservationsController],
  providers: [
    ...reservationsProviders,
    ReservationsService,
    ...authProviders,
    AuthService,
    ...usersProviders,
    UsersService,
  ],
  exports: [ReservationsService],
})
export class ReservationsModule {}
