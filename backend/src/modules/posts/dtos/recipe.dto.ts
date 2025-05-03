import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class ReponseRecipeDto {
  @ApiProperty({ description: 'Tên món ăn', example: 'Bún bò Huế' })
  name: string;

  @ApiProperty({ description: 'Mô tả', example: 'Món ăn ngon' })
  description: string;
  
  @ApiProperty({ description: 'Hướng dẫn', example: ['Nấu bún', 'xào bò'] })
  instructions: string[];

}
export class CreateRecipeDto {
    @ApiProperty({ description: 'Tên món ăn', example: 'Bún bò Huế' })
    name?: string;
    
    @ApiProperty({ description: 'Ghi chú', example: 'Món bún bò Huế của Việt Nam, phải nấu thật mặn, không có tiết.' })
    note?: string;
    
    
    @ApiProperty({ description: 'Thời gian nấu', example: '30 phút' })
    cookTime?: string;
    
    @ApiProperty({ description: 'Phần ăn', example: '2 người' })
    portion?: string;
    
    @ApiProperty({ description: 'Loại món ăn', example: ['starter', 'main dish', 'dessert'] })
    type?: string;
}
