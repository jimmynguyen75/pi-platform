import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from '../partners/partner.entity';
import { Employee } from '../employees/employee.entity';
import { Activity } from '../activities/activity.entity';
import { Domain } from '../domains/domain.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partner, Employee, Activity, Domain]),
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
