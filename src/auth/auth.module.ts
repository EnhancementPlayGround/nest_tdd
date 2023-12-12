import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { authProviders } from './auth.providers';
import { UsersModule } from 'src/users/users.module';
import { jwtConstants } from 'src/constatns/jwt';
import { JwtStrategy } from './jwt-auth.strategy';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
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