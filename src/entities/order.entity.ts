import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  seat: string;

  @Column()
  date: string;

  @Column({ default: 'created' })
  status: 'created' | 'pending' | 'done';

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column({ name: 'reservation_id' })
  reservationId: number;

  @Column({ name: 'payment_type' })
  paymentType: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
