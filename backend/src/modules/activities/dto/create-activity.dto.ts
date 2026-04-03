import { IsUUID, IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty()
  @IsUUID()
  partnerId: string;

  @ApiProperty()
  @IsUUID()
  managerId: string;

  @ApiProperty({ enum: ['meeting', 'deal', 'email', 'call', 'review'] })
  @IsEnum(['meeting', 'deal', 'email', 'call', 'review'])
  type: 'meeting' | 'deal' | 'email' | 'call' | 'review';

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Quarterly business review' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;
}
