import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CommonEntity } from 'src/common/common.entity';
import { User } from 'src/users/entities/user.etity';

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  OTHER = 'other',
}

@Entity('uploads')
export class Upload extends CommonEntity {
  @Column()
  filename: string; // Sistemdə saxlanılan ad

  @Column()
  originalName: string; // Orijinal ad

  @Column()
  mimetype: string; // image/jpeg, application/pdf

  @Column()
  size: number; // byte

  @Column()
  path: string; // Fayl yolu

  @Column()
  url: string; // Public URL

  @Column({
    type: 'enum',
    enum: FileType,
    default: FileType.OTHER,
  })
  type: FileType;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploadedBy' })
  uploadedBy?: User;

  @Column({ nullable: true })
  uploadedById?: string;
}