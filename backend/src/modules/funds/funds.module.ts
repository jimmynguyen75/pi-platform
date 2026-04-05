import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fund } from './fund.entity';
import { Partner } from '../partners/partner.entity';
import { FundsService } from './funds.service';
import { FundsController } from './funds.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Fund, Partner])],
  providers: [FundsService],
  controllers: [FundsController],
  exports: [FundsService],
})
export class FundsModule {}
