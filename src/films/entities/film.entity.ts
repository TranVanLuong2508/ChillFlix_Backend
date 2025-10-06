import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'films' })
export class Film {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  filmId: string;

  @Column({ nullable: false })
  originalTitle: string;

  @Column({ nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'date', nullable: false })
  releaseDate: Date;

  @Column({ nullable: false })
  year: string;

  @Column({ nullable: false })
  thumbUrl: string;

  @Column({ nullable: false })
  posterUrl: string;

  @Column({ unique: true, nullable: false })
  slug: string;

  @Column({ type: 'int', default: 0 })
  view: number;

  @Column({ nullable: false })
  ageCode: string;

  @Column({ nullable: false })
  typeCode: string;

  @Column({ type: 'text', default: [], array: true })
  genreCodes: string[];

  @Column({ nullable: false })
  countryCode: string;

  @Column({ nullable: false })
  langCode: string;

  @Column({ nullable: false })
  publicStatusCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  deletedBy: string;
}
