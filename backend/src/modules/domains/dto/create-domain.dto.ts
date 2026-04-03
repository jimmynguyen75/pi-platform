import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDomainDto {
  @ApiProperty({ example: 'Software' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Software solutions and SaaS partnerships' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '#1890ff' })
  @IsString()
  @IsOptional()
  colorHex?: string;
}
