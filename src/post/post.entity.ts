import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CommonEntity } from 'src/common/common.entity';
import { User } from 'src/users/entities/user.etity';
import { Comment } from 'src/comment/comment.entity';
import { Reaction } from 'src/reaction/reaction.entity';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('posts')
export class Post extends CommonEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  excerpt?: string;

  @Column({ nullable: true })
  featuredImage?: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

@Column("text", { array: true, nullable: true, default: [] })
tags?: string[];

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  dislikeCount: number;


  // DÜZƏLİŞ: null dəstəyini tip səviyyəsində əlavə etdik
  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date | null;

  // Relations
  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
  // ✅ Reactions relation (əgər yoxdursa əlavə edin)
  // @OneToMany(() => Reaction, (reaction) => reaction.post)
  // reactions?: Reaction[];
}