import { IsString, IsEnum, IsOptional, IsUUID, IsNumber, MaxLength, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDealDto {
  @ApiProperty({ example: 'uuid-of-partner' })
  @IsUUID()
  partnerId: string;

  @ApiProperty({ example: 'Microsoft' })
  @IsString()
  @MaxLength(150)
  partnerName: string;

  @ApiProperty({ example: 'Viettel Group' })
  @IsString()
  @MaxLength(200)
  customerName: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  dealValue?: number;

  @ApiPropertyOptional({ example: '2025-06-30' })
  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;

  @ApiPropertyOptional({ enum: ['In Progress', 'Won', 'Lost', 'Pending'], default: 'Pending' })
  @IsEnum(['In Progress', 'Won', 'Lost', 'Pending'])
  @IsOptional()
  status?: 'In Progress' | 'Won' | 'Lost' | 'Pending';

  @ApiPropertyOptional({ enum: ['HSI', 'HSC', 'HAS', 'HSE', 'HSV'] })
  @IsEnum(['HSI', 'HSC', 'HAS', 'HSE', 'HSV'])
  @IsOptional()
  businessUnit?: 'HSI' | 'HSC' | 'HAS' | 'HSE' | 'HSV';

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  assignedManagerId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
