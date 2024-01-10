import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Seats } from './seats.entity';

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

  @ManyToOne(() => User)
  @Column('uuid', { name: 'user_id' })
  userId: string;

  @OneToOne(() => Seats)
  @Column({ name: 'reservation_id' })
  reservationId: string;

  @Column({ name: 'payment_type' })
  paymentType: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
