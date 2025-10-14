import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SubscriptionPlan {
  @PrimaryGeneratedColumn()
  planId: number;

  @Column()
  planName: string;

  @Column()
  planDuration: string;

  @Column()
  planStatus: boolean;
}
