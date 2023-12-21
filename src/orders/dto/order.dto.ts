import { Expose } from 'class-transformer';

export class OrderDto {
  @Expose()
  id: string;

  @Expose()
  seat: string;

  @Expose()
  date: string;

  @Expose()
  createdAt: Date;
}
