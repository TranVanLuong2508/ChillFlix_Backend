import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AllCodes } from 'src/modules/allcodes/entities/allcodes.entity';

@Entity({ name: 'directors' })
export class Director {
  @PrimaryGeneratedColumn({ name: 'director_id' })
  directorId: number;
  @Column({ name: 'director_name', type: 'varchar', length: 100 })
  directorName?: string;
  @Column({ name: 'gender_code', type: 'varchar', length: 10 })
  genderId: string;
  @Column({ name: 'story', type: 'text', nullable: true })
  story?: string;
  @Column({ name: 'avatarUrl', type: 'text', nullable: true })
  avatarUrl?: string;
  @Column({ name: 'nationality_code', type: 'varchar', nullable: true })
  nationalityCode?: string;
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

  @ManyToOne(() => AllCodes, (allcode) => allcode.directorGender, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'gender_code', referencedColumnName: 'keyMap' })
  gender: AllCodes;
  @ManyToOne(() => AllCodes, (allcode) => allcode.directorNationality, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'nationality_code', referencedColumnName: 'keyMap' })
  nationality: AllCodes;
}
