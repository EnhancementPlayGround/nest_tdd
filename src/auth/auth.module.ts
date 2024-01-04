import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '@/constatns/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { authProviders } from './auth.providers';
import { UsersModule } from '@/users/users.module';
import { SeatsModule } from '@/seats/seats.module';
import { usersProviders } from '@/users/users.providers';
import { UsersService } from '@/users/users.service';
import { JwtStrategy } from '@/utils/jwt/jwt-auth.strategy';
import { QueueTokenManager } from './queue-token/queue-token.manger';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    SeatsModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    ...usersProviders,
    ...authProviders,
    AuthService,
    JwtStrategy,
    UsersService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
