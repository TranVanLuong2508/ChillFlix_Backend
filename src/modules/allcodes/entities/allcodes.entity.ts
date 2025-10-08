import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Director } from 'src/modules/directors/director.entity';

@Entity({ name: 'allcodes' })
export class AllCodes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
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

  @OneToMany(() => Director, (director) => director.gender)
  directorGender: Director[];
  @OneToMany(() => Director, (director) => director.nationality)
  directorNationality: Director[];
}
