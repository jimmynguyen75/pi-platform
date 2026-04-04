import { IsString, IsEnum, IsOptional, IsUUID, IsNumber, MaxLength, Min, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateFundDto {
  @ApiProperty()
  @IsUUID()
  partnerId: string;

  @ApiProperty({ example: 'Microsoft' })
  @IsString()
  @MaxLength(150)
  partnerName: string;

  @ApiProperty({ enum: ['Rebate', 'Program Fund', 'Marketing Fund'] })
  @IsEnum(['Rebate', 'Program Fund', 'Marketing Fund'])
  fundType: 'Rebate' | 'Program Fund' | 'Marketing Fund';

  @ApiProperty({ example: 2025 })
  @IsInt()
  @Type(() => Number)
  fiscalYear: number;

  @ApiPropertyOptional({ example: 100000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  totalAmount?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  receivedAmount?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  spentAmount?: number;

  @ApiPropertyOptional({ enum: ['Pending', 'Submitted', 'Approved', 'Rejected', 'Paid'] })
  @IsEnum(['Pending', 'Submitted', 'Approved', 'Rejected', 'Paid'])
  @IsOptional()
  claimStatus?: 'Pending' | 'Submitted' | 'Approved' | 'Rejected' | 'Paid';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
