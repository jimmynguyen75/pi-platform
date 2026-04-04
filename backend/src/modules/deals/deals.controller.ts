import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';

@ApiTags('Deals')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new deal' })
  create(@Body() dto: CreateDealDto) {
    return this.dealsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List deals with optional filters' })
  @ApiQuery({ name: 'partnerId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'businessUnit', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('partnerId') partnerId?: string,
    @Query('status') status?: string,
    @Query('businessUnit') businessUnit?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('search') search?: string,
  ) {
    return this.dealsService.findAll({ partnerId, status, businessUnit, from, to, search });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get deal statistics summary' })
  getStats() {
    return this.dealsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dealsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update deal status or fields' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateDealDto>) {
    return this.dealsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a deal' })
  remove(@Param('id') id: string) {
    return this.dealsService.remove(id);
  }
}
