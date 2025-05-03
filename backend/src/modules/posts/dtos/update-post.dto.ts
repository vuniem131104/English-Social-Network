// src/modules/posts/dtos/update-post.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsUrl } from 'class-validator';

export class UpdatePostDto{
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
