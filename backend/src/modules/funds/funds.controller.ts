import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FundsService } from './funds.service';
import { CreateFundDto } from './dto/create-fund.dto';

@ApiTags('Funds')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('funds')
export class FundsController {
  constructor(private readonly fundsService: FundsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a fund entry' })
  create(@Body() dto: CreateFundDto) {
    return this.fundsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List fund entries with optional filters' })
  @ApiQuery({ name: 'partnerId', required: false })
  @ApiQuery({ name: 'fundType', required: false })
  @ApiQuery({ name: 'fiscalYear', required: false })
  @ApiQuery({ name: 'claimStatus', required: false })
  findAll(
    @Query('partnerId') partnerId?: string,
    @Query('fundType') fundType?: string,
    @Query('fiscalYear') fiscalYear?: string,
    @Query('claimStatus') claimStatus?: string,
  ) {
    return this.fundsService.findAll({
      partnerId,
      fundType,
      fiscalYear: fiscalYear ? parseInt(fiscalYear) : undefined,
      claimStatus,
    });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get fund summary totals by type' })
  getSummary() {
    return this.fundsService.getSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fundsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a fund entry' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateFundDto>) {
    return this.fundsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a fund entry' })
  remove(@Param('id') id: string) {
    return this.fundsService.remove(id);
  }
}
