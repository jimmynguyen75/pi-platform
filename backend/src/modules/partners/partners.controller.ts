import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  Optional,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@ApiTags('Partners')
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  /* ── Public endpoints (no auth required) ──────────────────────────────── */

  @Get('public')
  @ApiOperation({ summary: 'Public partner list — no auth required' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'domain', required: false })
  @ApiQuery({ name: 'priority', required: false })
  publicList(
    @Query('search') search?: string,
    @Query('domain') domain?: string,
    @Query('priority') priority?: string,
  ) {
    return this.partnersService.findAll({ search, domain, priority });
  }

  @Get('public/:id')
  @ApiOperation({ summary: 'Public partner detail — no auth required' })
  publicDetail(@Param('id') id: string) {
    return this.partnersService.findOne(id);
  }

  /* ── Protected endpoints ───────────────────────────────────────────────── */

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create a new partner' })
  create(@Body() dto: CreatePartnerDto, @Request() req) {
    return this.partnersService.create(dto, req.user?.id, req.user?.name);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all partners with optional filters' })
  @ApiQuery({ name: 'domain', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'managerId', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('domain') domain?: string,
    @Query('priority') priority?: string,
    @Query('status') status?: string,
    @Query('managerId') managerId?: string,
    @Query('search') search?: string,
  ) {
    return this.partnersService.findAll({ domain, priority, status, managerId, search });
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get partner detail with activities and manager' })
  findOne(@Param('id') id: string) {
    return this.partnersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update partner' })
  update(@Param('id') id: string, @Body() dto: UpdatePartnerDto, @Request() req) {
    return this.partnersService.update(id, dto, req.user?.id, req.user?.name);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete partner (admin only)' })
  remove(@Param('id') id: string) {
    return this.partnersService.remove(id);
  }

  @Get(':id/history')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get audit history for a partner' })
  getHistory(@Param('id') id: string) {
    return this.partnersService.getPartnerHistory(id);
  }

  @Post('recalculate')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Bulk recalculate health scores (admin only)' })
  bulkRecalculate() {
    return this.partnersService.bulkRecalculate();
  }

  @Get(':id/ai/summary')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'AI-generated partner summary and insights' })
  generateSummary(@Param('id') id: string) {
    return this.partnersService.generateSummary(id);
  }

  @Post('ai/parse-activity')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Parse raw text into structured activity (AI-assisted)' })
  parseActivity(@Body() body: { text: string }) {
    return this.partnersService.parseActivityFromText(body.text ?? '');
  }
}
