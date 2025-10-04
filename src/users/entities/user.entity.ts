import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  fullName: string;

  @Column({ nullable: false })
  isActive: boolean;
}
