import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AllCodes } from './allcodes.entity';

@Entity({ name: 'directors' })
export class Director {
  @PrimaryGeneratedColumn({ name: 'director_id' })
  directorId: number;
  @Column({ name: 'director_name', type: 'varchar', length: 100 })
  directorName: string;
  @Column({ name: 'gender_id', type: 'varchar' })
  genderId: string;
  @Column({ name: 'story', type: 'text', nullable: true })
  story?: string;
  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => AllCodes, (allcode) => allcode.directors, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'gender_id', referencedColumnName: 'id' })
  gender: AllCodes;
}
