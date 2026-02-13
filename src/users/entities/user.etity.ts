import { Entity, Column, OneToMany } from 'typeorm';
import { CommonEntity } from 'src/common/common.entity';
import { Post } from 'src/post/post.entity';
import { Comment } from 'src/comment/comment.entity';

// Role Enumunu təyin edək (məsələn: user.entity.ts faylında və ya ayrıca)
export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User extends CommonEntity {
  @Column()
  username: string; // DTO-da username olduğu üçün bura da username olsun

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Təhlükəsizlik üçün: API sorğularında parolu gizlədir
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    array: true, // Əgər istifadəçinin bir neçə rolu ola bilərsə (DTO-da massiv demisən)
    default: [Role.USER],
  })
  role: Role[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}