import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '@/constatns/jwt';
import { JwtStrategy } from './jwt-auth.strategy';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { authProviders } from './auth.providers';
import { UsersModule } from '@/users/users.module';
import { ReservationsModule } from '@/reservations/reservations.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    ReservationsModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [...authProviders, AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
