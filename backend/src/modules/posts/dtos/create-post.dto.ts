// src/modules/recipes/dtos/create-recipe.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, IsUrl, ArrayMinSize, IsDate, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import exp from 'constants';
import { Post } from '../entities/post.entity';
import { User } from 'src/modules/auth/entities/user.entity';
import { Comment } from '../entities/comment.entity';

export class ReponseUserDto{
  constructor(user?: User) {
    if (user) {
        this.id = user.id;
        this.username = user.username;
        this.name = user.name;
        this.avatar = user.avatar;
    }
  }
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  avatar?: string;
}
export class ReponseUserProfileDto{
  constructor(user?: User, totalFollowing?: number, totalFollowers?: number) {
    if (user) {
        this.id = user.id;
        this.username = user.username;
        this.name = user.name;
        this.avatar = user.avatar;
        this.totalFollowing = totalFollowing;
        this.totalFollowers = totalFollowers;
    }
  }
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  avatar?: string;

  @IsNumber()
  @IsNotEmpty()
  totalFollowing?: number;

  @IsNumber()
  @IsNotEmpty()
  totalFollowers?: number;
}
export class LiteReponsePostDto{
  constructor(post?: Post) {
    if (post) {
      this.id = post.id;
      this.author = new ReponseUserDto(post.author);
      this.title = post.title;
      this.description = post.description;
      this.mainImage = post.mainImage;
      this.totalView = post.totalView;
      this.totalComment = post.totalComment;
      this.totalLike = post.totalLike;
      this.createdAt = post.createdAt;
      this.updatedAt = post.updatedAt;
    }
  }
  @IsNotEmpty()
  id: number;

  @Type(() => ReponseUserDto)
  author: ReponseUserDto;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsUrl()
  mainImage?: string;

  totalView?: number;
  totalFavorite?: number;
  totalComment?: number;
  totalLike?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export class FullReponsePostDto{
  constructor(post?: Post) {
    if (post) {
      this.id = post.id;
      this.author = new ReponseUserDto(post.author);
      this.title = post.title;
      this.description = post.description;
      this.mainImage = post.mainImage;
      this.totalView = post.totalView;
      this.totalComment = post.totalComment;
      this.totalLike = post.totalLike;
      this.steps = post.steps;
      this.createdAt = post.createdAt;
      this.updatedAt = post.updatedAt;
    }
  }
  @IsNotEmpty()
  id: number;
  @Type(() => ReponseUserDto)
  author: ReponseUserDto;
  
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsArray()
  steps?: string[];

  @IsOptional()
  @IsUrl()
  mainImage?: string;

  totalView?: number;
  totalFavorite?: number;
  totalComment?: number;
  totalLike?: number;

  createdAt?: Date;
  updatedAt?: Date;
}
export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Tiêu đề bài viết', example: 'Biết tin gì chưaaaa' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Mô tả bài viết', example: 'Cấu trúc So, such, too' })
  description: string;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ description: 'Công thức', example: ['such + (a/an) + adj + noun + that + S + V ', 'S + to be + too + adj + (for sb) + to + V', 'S + V + too + adv + (for sb) + to + V'] })
  steps?: string[];

  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional({ description: 'Hình ảnh', example: 'https://file.hstatic.net/200000610729/file/suon-3_022e54b9753f433ea8d5e2b7466b3484.jpg' })
  mainImage?: string;
}



export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @ApiProperty({ description: 'Nội dung bình luận' })
  content: string;
}

export class DeleteCommentDto {
  @IsNumber()
  @ApiProperty({ description: 'ID của bình luận cần xóa' })
  commentId: number;
}

export class FullReponseCommentDto{
  constructor(comment?: Comment) {
    if (comment) {
      this.id = comment.id;
      this.content = comment.content;
      this.user = new ReponseUserDto(comment.user);
      this.createdAt = comment.createdAt;
      this.totalLike = comment.totalLike;
      this.isLiked = comment.isLiked;
    }
  }
  nextPage: boolean;
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @Type(() => ReponseUserDto)
  user: ReponseUserDto;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date

  @IsOptional()
  totalLike?: number;

  @IsOptional()
  isLiked?: boolean;
}
