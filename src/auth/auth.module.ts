import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { SeatsModule } from '@/seats/seats.module';

import { jwtConstants } from '@/constatns/jwt';
import { AuthService } from './auth.service';
import { authProviders } from './auth.providers';
import { JwtStrategy } from './jwt/jwt-auth.strategy';
import { AuthController } from './auth.controller';
import { QueueTokenManager } from './queue-token/queue-token.manger';

@Module({
  imports: [
    DatabaseModule,
    SeatsModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [...authProviders, AuthService, JwtStrategy, QueueTokenManager],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
