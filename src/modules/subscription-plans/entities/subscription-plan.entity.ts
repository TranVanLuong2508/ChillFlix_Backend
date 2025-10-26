import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'subscriptionPlans' })
export class SubscriptionPlan {
  @PrimaryGeneratedColumn()
  planId: number;

  @Column()
  planName: string;

  @Column()
  planDuration: string;

  @Column({ default: true })
  isActive: boolean;

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
}
