import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get overall platform statistics' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('manager-load')
  @ApiOperation({ summary: 'Get per-manager partner load distribution' })
  getManagerLoad() {
    return this.dashboardService.getManagerLoad();
  }

  @Get('domain-breakdown')
  @ApiOperation({ summary: 'Get partner breakdown by domain' })
  getDomainBreakdown() {
    return this.dashboardService.getDomainBreakdown();
  }

  @Get('activity-trend')
  @ApiOperation({ summary: 'Get activity trend over time' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days (default: 30)' })
  getActivityTrend(@Query('days') days?: number) {
    return this.dashboardService.getActivityTrend(days || 30);
  }

  @Get('risk-partners')
  @ApiOperation({ summary: 'Get partners at risk or inactive' })
  getRiskPartners() {
    return this.dashboardService.getRiskPartners();
  }

  @Get('top-partners')
  @ApiOperation({ summary: 'Get top strategic partners' })
  getTopPartners() {
    return this.dashboardService.getTopPartners();
  }

  @Get('recent-activities')
  @ApiOperation({ summary: 'Get most recent activities' })
  @ApiQuery({ name: 'limit', required: false })
  getRecentActivities(@Query('limit') limit?: number) {
    return this.dashboardService.getRecentActivities(limit || 10);
  }
}
