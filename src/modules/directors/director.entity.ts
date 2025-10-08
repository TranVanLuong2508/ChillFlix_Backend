import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AllCode } from 'src/modules/all-codes/entities/all-code.entity';

@Entity({ name: 'directors' })
export class Director {
  @PrimaryGeneratedColumn({ name: 'director_id' })
  directorId: number;
  @Column({ name: 'director_name', type: 'varchar', length: 100 })
  directorName?: string;
  @Column({ name: 'gender_code', type: 'varchar', length: 10 })
  genderCode: string;
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
}
//   @ManyToOne(() => AllCode, (allcode) => allcode.directorGender, {
//     onDelete: 'RESTRICT',
//     onUpdate: 'CASCADE',
//   })
//   @JoinColumn({ name: 'gender_code', referencedColumnName: 'keyMap' })
//   gender: AllCode;
//   @ManyToOne(() => AllCode, (allcode) => allcode.directorNationality, {
//     onDelete: 'RESTRICT',
//     onUpdate: 'CASCADE',
//   })
//   @JoinColumn({ name: 'nationality_code', referencedColumnName: 'keyMap' })
//   nationality: AllCode;
// }
