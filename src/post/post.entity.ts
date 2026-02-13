import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { CommonEntity } from 'src/common/common.entity';
import { User } from 'src/users/entities/user.etity';
import { Comment } from 'src/comment/comment.entity';

@Entity('posts')
export class Post extends CommonEntity {
  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'CASCADE',
  })
  author: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
