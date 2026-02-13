import { Entity, Column, ManyToOne } from 'typeorm';
import { CommonEntity } from 'src/common/common.entity';
import { User } from 'src/users/entities/user.etity';
import { Post } from 'src/post/post.entity';

@Entity('comments')
export class Comment extends CommonEntity {
  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  post: Post;
}
