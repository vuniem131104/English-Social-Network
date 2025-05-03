// src/modules/posts/entities/post.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
    RelationCount,
    Index,
  } from 'typeorm';
  import { User } from '../../auth/entities/user.entity';
  import { Comment } from './comment.entity';
  
  @Entity()
  export class Post {
    @Index()
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;
  
    @Column('text')
    description: string;
  
  
    @Column({default: 0})
    totalLike: number;

    @Column({default: 0})
    totalComment: number;

    @Column({default: 0})
    @Index()
    totalView: number;

    @Column({default: 0})
    baseScore: number;

    @Column('simple-json', { nullable: true })
    steps: string[];
  
    @Column({ nullable: true })
    mainImage: string;
  
    @ManyToOne(() => User, (user) => user.posts, { eager: true })
    author: User;
    
    @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
    comments: Comment[];
  
    @ManyToMany(() => User)
    @JoinTable()
    likes: User[];

    @Index()
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date

  }
  