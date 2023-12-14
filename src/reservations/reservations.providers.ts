import { DataSource } from 'typeorm';
import { Reservations } from '@/entities/reservations.entity';

export const reservationsProviders = [
  {
    provide: 'RESERVATIONS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Reservations),
    inject: ['DATA_SOURCE'],
  },
];
