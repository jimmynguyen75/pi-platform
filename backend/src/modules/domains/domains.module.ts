import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Domain } from './domain.entity';
import { DomainsService } from './domains.service';
import { DomainsController } from './domains.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Domain])],
  providers: [DomainsService],
  controllers: [DomainsController],
  exports: [DomainsService],
})
export class DomainsModule {}
