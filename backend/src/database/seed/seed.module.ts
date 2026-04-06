import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Employee } from '../../modules/employees/employee.entity';
import { Domain } from '../../modules/domains/domain.entity';
import { Partner } from '../../modules/partners/partner.entity';
import { Activity } from '../../modules/activities/activity.entity';
import { Deal } from '../../modules/deals/deal.entity';
import { Fund } from '../../modules/funds/fund.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Domain, Partner, Activity, Deal, Fund])],
  providers: [SeedService],
})
export class SeedModule {}
