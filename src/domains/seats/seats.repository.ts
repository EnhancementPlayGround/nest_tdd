import { DataSource } from 'typeorm';
import { Seats } from '@entities/seats.entity';

export const seatsProviders = [
  {
    provide: 'SEATS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Seats),
    inject: ['DATA_SOURCE'],
  },
];
