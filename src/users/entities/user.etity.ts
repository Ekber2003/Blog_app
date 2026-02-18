import { Entity, Column, OneToMany } from 'typeorm';
import { CommonEntity } from 'src/common/common.entity';
import { Post } from 'src/post/post.entity';
import { Comment } from 'src/comment/comment.entity';

export enum Role {
  USER = 'user',
  AUTHOR = 'author',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

@Entity('users')
export class User extends CommonEntity {
  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    array: true,
    default: [Role.USER],
  })
  role: Role[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}