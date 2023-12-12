import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Reservations {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column()
  availableSeats: string;

  @Column('datetime')
  created_at: Date;

  @Column('datetime', { nullable: true })
  updated_at: Date | null;
}
