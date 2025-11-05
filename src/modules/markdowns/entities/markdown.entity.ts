import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Markdown {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  planId: number;

  @Column({ type: 'text' })
  HTMLContent: string;

  @Column({ type: 'text' })
  MarkdownContent: string;

  @Column({ type: 'text' })
  description: string;
}
