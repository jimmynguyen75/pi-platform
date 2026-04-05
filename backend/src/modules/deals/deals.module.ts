import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal } from './deal.entity';
import { Partner } from '../partners/partner.entity';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Deal, Partner])],
  providers: [DealsService],
  controllers: [DealsController],
  exports: [DealsService],
})
export class DealsModule {}
