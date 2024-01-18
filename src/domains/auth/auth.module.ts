import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/domains/database/database.module';
import { SeatsModule } from '@/domains/seats/seats.module';
import { JWTAuthModule } from '@/utils/jwt-auth/jwt-auth.module';

import { AuthService } from './auth.service';
import { authProviders } from './auth.repository';
import { AuthController } from './auth.controller';
import { QueueTokenManager } from '../../utils/queue-token/queue-token.manger';

@Module({
  imports: [DatabaseModule, SeatsModule, JWTAuthModule],
  providers: [...authProviders, AuthService, QueueTokenManager],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
