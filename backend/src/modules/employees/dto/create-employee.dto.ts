import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'jane.smith@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ enum: ['admin', 'manager'], default: 'manager' })
  @IsEnum(['admin', 'manager'])
  @IsOptional()
  role?: 'admin' | 'manager';

  @ApiPropertyOptional({ example: 'Partnership Manager' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;
}
