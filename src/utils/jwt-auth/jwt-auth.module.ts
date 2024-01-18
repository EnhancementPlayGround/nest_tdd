import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtStrategy } from './jwt-auth.strategy';
import { JwtAuthGuard } from './jwt-auth.guards';
import configuration from '@config/configuration';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: configuration().secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [JwtStrategy, JwtAuthGuard],
})
export class JWTAuthModule {}
