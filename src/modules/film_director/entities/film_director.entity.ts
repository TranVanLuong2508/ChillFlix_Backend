import { Director } from 'src/modules/directors/entities/director.entity';
import { Film } from 'src/modules/films/entities/film.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'film_directors' })
export class FilmDirector {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'is_main' })
  isMain: boolean;

  @ManyToOne(() => Film, (film) => film.filmDirectors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'film_id', referencedColumnName: 'filmId' })
  film: Film;

  @ManyToOne(() => Director, (director) => director.filmDirectors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'director_id', referencedColumnName: 'directorId' })
  director: Director;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
