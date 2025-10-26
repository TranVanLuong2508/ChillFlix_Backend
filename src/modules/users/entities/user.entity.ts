import { Exclude } from 'class-transformer';
import { AllCode } from 'src/modules/all-codes/entities/all-code.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  email: string;

  @Column()
  fullName: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true, name: 'gender_code', type: 'varchar' })
  genderCode: string;

  @Column({ nullable: true })
  age: number;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  isVip: boolean;

  @Column({ nullable: true, name: 'status_code' })
  statusCode: string;

  @Column({ nullable: true })
  vipExpireDate: Date;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true, default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt: Date;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  updatedBy: number;

  @Column({ nullable: true })
  deletedBy: number;

  @ManyToOne(() => AllCode, (allcode) => allcode.userGender)
  @JoinColumn({ name: 'gender_code', referencedColumnName: 'keyMap' })
  gender: AllCode;

  @ManyToOne(() => AllCode, (allcode) => allcode.userStatus)
  @JoinColumn({ name: 'status_code', referencedColumnName: 'keyMap' })
  status: AllCode;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id', referencedColumnName: 'roleId' })
  role: Role;
}
