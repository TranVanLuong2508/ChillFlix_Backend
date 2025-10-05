import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  email: string;

  @Column()
  fullName: string;

  @Column({ select: false })
  password: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column()
  genderCode: string;

  @Column()
  roleCode: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column()
  isVip: boolean;

  @Column()
  statusCode: string;

  @Column({ nullable: true })
  vipExpireDate: Date;

  @Column({ nullable: true })
  refreshToken: string;

  @Column()
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  deletedBy: string;
}
