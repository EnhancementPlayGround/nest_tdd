import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { AuthModule } from '@/auth/auth.module';

import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { seatsProviders } from './seats.providers';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  providers: [...seatsProviders, SeatsService],
  controllers: [SeatsController],
  exports: [SeatsService],
})
export class SeatsModule {}
