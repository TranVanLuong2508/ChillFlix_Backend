import { Episode } from 'src/modules/episodes/entities/episode.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'rooms_co_watching' })
export class RoomCoWatching {
  @PrimaryGeneratedColumn('uuid')
  roomId: string;

  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ nullable: false })
  hostId: number;

  @Column({ type: 'uuid', nullable: false })
  episodeId: string;

  @ManyToOne(() => Episode, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'episodeId' })
  episode: Episode;

  @Column({ nullable: false })
  thumbUrl: string;

  @Column({ type: 'boolean', default: true })
  isLive: boolean;

  @Column({ type: 'boolean', default: false })
  isPrivate: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ type: 'int', default: 0 })
  duration?: number;
}
