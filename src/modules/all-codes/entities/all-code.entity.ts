import { User } from 'src/modules/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class AllCode {
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

  @OneToMany(() => User, (user) => user.gender)
  userGender: User[];

  @OneToMany(() => User, (user) => user.role)
  userRole: User[];
}
