import { Actor } from 'src/modules/actor/entities/actor.entity';
import { Film } from 'src/modules/films/entities/film.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('film_actors')
export class FilmActor {
  @PrimaryGeneratedColumn({ name: 'film_actor_id' })
  id: number;

  @ManyToOne(() => Film, (film) => film.filmActors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'film_id', referencedColumnName: 'filmId' })
  film: Film;
  @ManyToOne(() => Actor, (actor) => actor.filmActors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_id', referencedColumnName: 'actorId' })
  actor: Actor;
  @Column({ name: 'character_name' })
  characterName: string;

  @CreateDateColumn()
  createdAt: Date;
  @CreateDateColumn()
  updatedAt: Date;
}
