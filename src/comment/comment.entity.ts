import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CommonEntity } from 'src/common/common.entity';
import { User } from 'src/users/entities/user.etity';
import { Post } from 'src/post/post.entity';

@Entity('comments')
export class Comment extends CommonEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  dislikeCount: number;

  // Relations
  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  postId: string;

  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  // ✅ Self-referencing relation - parent silinəndə child-lar da silinsin
  @ManyToOne(() => Comment, (comment) => comment.replies, { 
    nullable: true,
    onDelete: 'CASCADE' // ✅ Parent silinəndə replies də silinir
  })
  @JoinColumn({ name: 'parentId' })
  parent?: Comment;

  @Column({ nullable: true })
  parentId?: string;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies?: Comment[];
}