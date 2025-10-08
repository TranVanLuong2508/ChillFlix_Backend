<<<<<<< HEAD
import { Director } from 'src/modules/directors/director.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class AllCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
=======
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AllCode {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ nullable: false })
>>>>>>> dev-Quan
  keyMap: string;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: true })
  valueEn: string;

  @Column({ nullable: false })
  valueVi: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
<<<<<<< HEAD

  @OneToMany(() => User, (user) => user.gender)
  userGender: User[];

  @OneToMany(() => User, (user) => user.role)
  userRole: User[];

  // @OneToMany(() => Director, (director) => director.gender)
  // directorGender: Director[];
  // @OneToMany(() => Director, (director) => director.nationality)
  // directorNationality: Director[];
=======
>>>>>>> dev-Quan
}
