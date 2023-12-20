import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('auth')
export class Auth {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ nullable: true, name: 'queue_token' })
  queueToken: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
