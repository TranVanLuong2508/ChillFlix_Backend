import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  roleId: number;

  @Column()
  roleName: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  isActive: boolean;
}
