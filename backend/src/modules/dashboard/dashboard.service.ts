import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { Partner } from '../partners/partner.entity';
import { Employee } from '../employees/employee.entity';
import { Activity } from '../activities/activity.entity';
import { Domain } from '../domains/domain.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Partner)
    private partnerRepo: Repository<Partner>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
    @InjectRepository(Domain)
    private domainRepo: Repository<Domain>,
  ) {}

  async getStats() {
    const [
      totalPartners,
      strategicCount,
      keyCount,
      normalCount,
      activeCount,
      riskCount,
      inactiveCount,
      totalManagers,
      totalActivities,
    ] = await Promise.all([
      this.partnerRepo.count(),
      this.partnerRepo.count({ where: { priorityLevel: 'Strategic' } }),
      this.partnerRepo.count({ where: { priorityLevel: 'Key' } }),
      this.partnerRepo.count({ where: { priorityLevel: 'Normal' } }),
      this.partnerRepo.count({ where: { status: 'Active' } }),
      this.partnerRepo.count({ where: { status: 'Risk' } }),
      this.partnerRepo.count({ where: { status: 'Inactive' } }),
      this.employeeRepo.count({ where: { role: 'manager' } }),
      this.activityRepo.count(),
    ]);

    const thirtyDaysAgo = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
    const recentActivities = await this.activityRepo
      .createQueryBuilder('a')
      .where('a.date >= :date', { date: thirtyDaysAgo })
      .getCount();

    const avgResult = await this.partnerRepo
      .createQueryBuilder('p')
      .select('AVG(p.health_score)', 'avg')
      .getRawOne();
    const avgHealthScore = Math.round(parseFloat(avgResult?.avg || '0'));

    return {
      totalPartners,
      byPriority: { strategic: strategicCount, key: keyCount, normal: normalCount },
      byStatus: { active: activeCount, risk: riskCount, inactive: inactiveCount },
      totalManagers,
      totalActivities,
      recentActivities,
      avgHealthScore,
    };
  }

  /**
   * Per-manager partner load breakdown.
   */
  async getManagerLoad() {
    const managers = await this.employeeRepo
      .createQueryBuilder('e')
      .where("e.role = 'manager'")
      .getMany();

    const result = await Promise.all(
      managers.map(async (mgr) => {
        const partners = await this.partnerRepo
          .createQueryBuilder('p')
          .where('p.manager_id = :id', { id: mgr.id })
          .getMany();

        const weights = { Strategic: 3, Key: 2, Normal: 1 };
        const workload = partners.reduce(
          (s, p) => s + (weights[p.priorityLevel] ?? 1),
          0,
        );

        return {
          id: mgr.id,
          name: mgr.name,
          title: mgr.title,
          partnerCount: partners.length,
          workloadScore: workload,
          strategicCount: partners.filter((p) => p.priorityLevel === 'Strategic').length,
          keyCount: partners.filter((p) => p.priorityLevel === 'Key').length,
          normalCount: partners.filter((p) => p.priorityLevel === 'Normal').length,
        };
      }),
    );

    return result;
  }

  async getDomainBreakdown() {
    const domains = await this.domainRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.partners', 'partners')
      .getMany();

    return domains.map((d) => ({
      id: d.id,
      name: d.name,
      colorHex: d.colorHex,
      totalPartners: d.partners.length,
      activePartners: d.partners.filter((p) => p.status === 'Active').length,
      riskPartners: d.partners.filter((p) => p.status === 'Risk').length,
      inactivePartners: d.partners.filter((p) => p.status === 'Inactive').length,
      strategicPartners: d.partners.filter((p) => p.priorityLevel === 'Strategic').length,
      avgHealthScore: d.partners.length
        ? Math.round(
            d.partners.reduce((s, p) => s + p.healthScore, 0) / d.partners.length,
          )
        : 0,
    }));
  }

  async getActivityTrend(days = 30) {
    const result = await this.activityRepo
      .createQueryBuilder('a')
      .select("TO_CHAR(a.date, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('a.date >= :start', {
        start: dayjs().subtract(days, 'day').format('YYYY-MM-DD'),
      })
      .groupBy("TO_CHAR(a.date, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(a.date, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    return result.map((r) => ({ date: r.date, count: parseInt(r.count) }));
  }

  async getRiskPartners() {
    return this.partnerRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.domain', 'domain')
      .leftJoinAndSelect('p.manager', 'manager')
      .where('p.status IN (:...statuses)', { statuses: ['Risk', 'Inactive'] })
      .orderBy('p.health_score', 'ASC')
      .take(20)
      .getMany();
  }

  async getTopPartners() {
    return this.partnerRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.domain', 'domain')
      .leftJoinAndSelect('p.manager', 'manager')
      .where("p.priority_level = 'Strategic'")
      .orderBy('p.health_score', 'DESC')
      .take(10)
      .getMany();
  }

  async getRecentActivities(limit = 10) {
    return this.activityRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.partner', 'partner')
      .leftJoinAndSelect('a.manager', 'manager')
      .orderBy('a.date', 'DESC')
      .take(limit)
      .getMany();
  }
}
