import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Seats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column({ name: 'available_seats' })
  availableSeats: string;

  @Column({ default: 'created' })
  status: 'created' | 'completed';

  @Column({ type: 'json', nullable: true, name: 'temporary_holds' })
  temporaryHolds: {
    [seatNumber: number]: {
      userId: string;
      releaseTime: Date;
    };
  };

  @Column('datetime', { name: 'created_at' })
  createdAt: Date;

  @Column('datetime', { nullable: true, name: 'updated_at' })
  updatedAt: Date | null;
}
