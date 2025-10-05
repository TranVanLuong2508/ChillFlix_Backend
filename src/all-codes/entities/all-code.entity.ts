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
}
