import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { CommonEntity } from 'src/common/common.entity';
import { User } from 'src/users/entities/user.etity';
import { Post } from 'src/post/post.entity';
import { Comment } from 'src/comment/comment.entity';

export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

export enum ReactionTargetType {
  POST = 'post',
  COMMENT = 'comment',
}

@Entity('reactions')
@Unique(['userId', 'targetType', 'targetId']) // ✅ Bir istifadəçi bir post/comment-ə yalnız 1 reaction
export class Reaction extends CommonEntity {
  @Column({
    type: 'enum',
    enum: ReactionType,
  })
  type: ReactionType;

  @Column({
    type: 'enum',
    enum: ReactionTargetType,
  })
  targetType: ReactionTargetType;

  @Column()
  targetId: string; // Post ID və ya Comment ID

  // Relations
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  // Optional relations
  @ManyToOne(() => Post, { nullable: true ,onDelete: 'CASCADE'})
  @JoinColumn({ name: 'postId' })
  post?: Post;

  @Column({ nullable: true })
  postId?: string;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment?: Comment;

  @Column({ nullable: true })
  commentId?: string;
}