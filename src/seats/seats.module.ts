import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';

import { authProviders } from '@/auth/auth.providers';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { seatsProviders } from './seats.providers';
import { AuthModule } from '@/auth/auth.module';
import { AuthService } from '@/auth/auth.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SeatsController],
  providers: [...seatsProviders, ...authProviders, SeatsService, AuthService],
  exports: [],
})
export class SeatsModule {}
