import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesModule } from './modules/employees/employees.module';
import { DomainsModule } from './modules/domains/domains.module';
import { PartnersModule } from './modules/partners/partners.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { HistoryModule } from './modules/history/history.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuthModule } from './modules/auth/auth.module';
import { DealsModule } from './modules/deals/deals.module';
import { FundsModule } from './modules/funds/funds.module';
import { Employee } from './modules/employees/employee.entity';
import { Domain } from './modules/domains/domain.entity';
import { Partner } from './modules/partners/partner.entity';
import { Activity } from './modules/activities/activity.entity';
import { History } from './modules/history/history.entity';
import { Deal } from './modules/deals/deal.entity';
import { Fund } from './modules/funds/fund.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        database: config.get('DATABASE_NAME', 'pi_platform'),
        username: config.get('DATABASE_USER', 'pi_user'),
        password: config.get('DATABASE_PASSWORD', 'pi_password'),
        entities: [Employee, Domain, Partner, Activity, History, Deal, Fund],
        synchronize: true,
        ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        logging: config.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    EmployeesModule,
    DomainsModule,
    PartnersModule,
    ActivitiesModule,
    HistoryModule,
    DashboardModule,
    DealsModule,
    FundsModule,
  ],
})
export class AppModule {}
