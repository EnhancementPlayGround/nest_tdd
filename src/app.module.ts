import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ScheduleModule } from '@nestjs/schedule';

import configuration from './config/configuration';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './domains/auth/auth.module';
import { HealthModule } from './domains/health/health.module';
import { SeatsModule } from './domains/seats/seats.module';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    SeatsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number(),
      }),
      load: [configuration],
      envFilePath: `src/config/env/.${process.env.NODE_ENV}.env`,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
