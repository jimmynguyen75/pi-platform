import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  MaxLength,
  IsArray,
  ValidateNested,
  IsObject,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OfficialLinkDto {
  @IsString()
  label: string;

  @IsString()
  url: string;
}

export class CreatePartnerDto {
  @ApiProperty({ example: 'Microsoft' })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty()
  @IsUUID()
  domainId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  managerId?: string;

  @ApiPropertyOptional({ enum: ['Strategic', 'Key', 'Normal'], default: 'Normal' })
  @IsEnum(['Strategic', 'Key', 'Normal'])
  @IsOptional()
  priorityLevel?: 'Strategic' | 'Key' | 'Normal';

  @ApiPropertyOptional({ enum: ['Active', 'Risk', 'Inactive'], default: 'Active' })
  @IsEnum(['Active', 'Risk', 'Inactive'])
  @IsOptional()
  status?: 'Active' | 'Risk' | 'Inactive';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ type: [OfficialLinkDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfficialLinkDto)
  @IsOptional()
  officialLinks?: OfficialLinkDto[];

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  contactInfo?: Record<string, string>;

  @ApiPropertyOptional({ enum: ['Titanium', 'Platinum', 'Gold', 'Silver', 'Registered', 'Strategic Partner'] })
  @IsEnum(['Titanium', 'Platinum', 'Gold', 'Silver', 'Registered', 'Strategic Partner'])
  @IsOptional()
  partnerTier?: 'Titanium' | 'Platinum' | 'Gold' | 'Silver' | 'Registered' | 'Strategic Partner';

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  certifications?: Array<{ name: string; issuedDate?: string; expiryDate?: string; level?: string }>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
