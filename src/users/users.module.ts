import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usersProviders } from './users.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [...usersProviders, UsersService],
  exports: [UsersService, ...usersProviders],
})
export class UsersModule {}
