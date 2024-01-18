import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '@/domains/auth/auth.module';
import { DatabaseModule } from '../database/database.module';

import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { seatsProviders } from './seats.repository';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  providers: [...seatsProviders, SeatsService],
  controllers: [SeatsController],
  exports: [SeatsService],
})
export class SeatsModule {}
