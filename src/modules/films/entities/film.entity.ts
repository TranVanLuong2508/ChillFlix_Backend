import { Exclude } from 'class-transformer';
import { AllCode } from 'src/modules/all-codes/entities/all-code.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FilmGenre } from './film_genre.entity';
import { Part } from 'src/modules/parts/entities/part.entity';
import { FilmDirector } from 'src/modules/film_director/entities/film_director.entity';
import { FilmActor } from 'src/modules/film_actor/entities/film_actor.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { Rating } from 'src/modules/rating/entities/rating.entity';

@Entity({ name: 'films' })
export class Film {
  @PrimaryGeneratedColumn('uuid')
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
  @Exclude({ toPlainOnly: true })
  ageCode: string;

  @ManyToOne(() => AllCode, (allcode) => allcode.filmAge)
  @JoinColumn({ name: 'ageCode', referencedColumnName: 'keyMap' })
  age: AllCode;

  @Column({ nullable: false })
  @Exclude({ toPlainOnly: true })
  typeCode: string;

  @ManyToOne(() => AllCode, (allcode) => allcode.filmType)
  @JoinColumn({ name: 'typeCode', referencedColumnName: 'keyMap' })
  type: AllCode;

  @OneToMany(() => FilmGenre, (filmgenre) => filmgenre.film, { cascade: true })
  filmGenres: FilmGenre[];

  @Column({ nullable: false })
  @Exclude({ toPlainOnly: true })
  countryCode: string;

  @ManyToOne(() => AllCode, (allcode) => allcode.filmCountry)
  @JoinColumn({ name: 'countryCode', referencedColumnName: 'keyMap' })
  country: AllCode;

  @Column({ nullable: false })
  @Exclude({ toPlainOnly: true })
  langCode: string;

  @ManyToOne(() => AllCode, (allcode) => allcode.filmLanguage)
  @JoinColumn({ name: 'langCode', referencedColumnName: 'keyMap' })
  language: AllCode;

  @Column({ nullable: false })
  @Exclude({ toPlainOnly: true })
  publicStatusCode: string;

  @ManyToOne(() => AllCode, (allcode) => allcode.filmPublicStatus)
  @JoinColumn({ name: 'publicStatusCode', referencedColumnName: 'keyMap' })
  publicStatus: AllCode;

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

  @OneToMany(() => Part, (part) => part.film, { cascade: true })
  parts: Part[];

  @OneToMany(() => FilmDirector, (filmDirector) => filmDirector.film)
  filmDirectors: FilmDirector[];

  @OneToMany(() => FilmActor, (filmActor) => filmActor.film)
  filmActors: FilmActor[];

  @OneToMany(() => Comment, (comment) => comment.film)
  comments: Comment[];
  @OneToMany(() => Rating, (rating) => rating.film)
  ratings: Rating[];
}
