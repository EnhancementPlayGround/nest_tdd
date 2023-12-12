import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DATABASE_HOST,
        port: 3306,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_TODOS_DB,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        // synchronize: false,
        synchronize: true,
        timezone: 'local',
      });

      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
];
