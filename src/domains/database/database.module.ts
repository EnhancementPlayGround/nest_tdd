import { Module } from '@nestjs/common';
import { databaseProviders } from './database.repository';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
