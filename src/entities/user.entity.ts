import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  AfterInsert,
  AfterUpdate,
  AfterRemove,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 255 })
  username: string;

  @Column('datetime')
  created_at: Date;

  @Column({ nullable: true })
  refreshToken: string;

  @AfterInsert()
  logInsert() {
    console.log(`Inserted User, id: ${this.id}`);
  }
  @AfterUpdate()
  logUpdate() {
    console.log(`Updated User, id: ${this.id}`);
  }
  @AfterRemove()
  logRemove() {
    console.log(`Removed User, id: ${this.id}`);
  }
}
