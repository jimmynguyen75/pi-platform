import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from './deal.entity';
import { CreateDealDto } from './dto/create-deal.dto';
import { Partner } from '../partners/partner.entity';

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal)
    private readonly dealsRepo: Repository<Deal>,
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
  ) {}

  async create(dto: CreateDealDto): Promise<Deal> {
    const deal = this.dealsRepo.create(dto);
    return this.dealsRepo.save(deal);
  }

  async findAll(filters: {
    partnerId?: string;
    status?: string;
    businessUnit?: string;
    from?: string;
    to?: string;
    search?: string;
  }): Promise<Deal[]> {
    const qb = this.dealsRepo
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.partner', 'partner')
      .leftJoinAndSelect('deal.assignedManager', 'manager')
      .orderBy('deal.createdAt', 'DESC');

    if (filters.partnerId) qb.andWhere('deal.partnerId = :pid', { pid: filters.partnerId });
    if (filters.status) qb.andWhere('deal.status = :status', { status: filters.status });
    if (filters.businessUnit) qb.andWhere('deal.businessUnit = :bu', { bu: filters.businessUnit });
    if (filters.from) qb.andWhere('deal.expectedCloseDate >= :from', { from: filters.from });
    if (filters.to) qb.andWhere('deal.expectedCloseDate <= :to', { to: filters.to });
    if (filters.search) {
      qb.andWhere(
        '(LOWER(deal.partnerName) LIKE :q OR LOWER(deal.customerName) LIKE :q)',
        { q: `%${filters.search.toLowerCase()}%` },
      );
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Deal> {
    const deal = await this.dealsRepo.findOne({
      where: { id },
      relations: ['partner', 'assignedManager'],
    });
    if (!deal) throw new NotFoundException(`Deal ${id} not found`);
    return deal;
  }

  async update(id: string, dto: Partial<CreateDealDto>): Promise<Deal> {
    await this.dealsRepo.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.dealsRepo.delete(id);
  }

  async getStats(): Promise<{
    total: number;
    won: number;
    lost: number;
    inProgress: number;
    pending: number;
    successRate: number;
    totalPipelineValue: number;
    wonValue: number;
    byBU: Record<string, number>;
  }> {
    const deals = await this.dealsRepo.find();
    const total = deals.length;
    const won = deals.filter((d) => d.status === 'Won').length;
    const lost = deals.filter((d) => d.status === 'Lost').length;
    const inProgress = deals.filter((d) => d.status === 'In Progress').length;
    const pending = deals.filter((d) => d.status === 'Pending').length;
    const closed = won + lost;
    const successRate = closed > 0 ? Math.round((won / closed) * 100) : 0;
    const totalPipelineValue = deals
      .filter((d) => d.status !== 'Lost')
      .reduce((sum, d) => sum + Number(d.dealValue), 0);
    const wonValue = deals
      .filter((d) => d.status === 'Won')
      .reduce((sum, d) => sum + Number(d.dealValue), 0);

    const byBU: Record<string, number> = {};
    for (const deal of deals) {
      if (deal.businessUnit) {
        byBU[deal.businessUnit] = (byBU[deal.businessUnit] || 0) + 1;
      }
    }

    return { total, won, lost, inProgress, pending, successRate, totalPipelineValue, wonValue, byBU };
  }

  async seedSampleData(): Promise<{ created: number }> {
    const partners = await this.partnerRepo.find({ take: 20 });
    if (partners.length === 0) return { created: 0 };

    const existing = await this.dealsRepo.count();
    if (existing > 0) return { created: 0 };

    const BUS: Array<'HSI' | 'HSC' | 'HAS' | 'HSE' | 'HSV'> = ['HSI', 'HSC', 'HAS', 'HSE', 'HSV'];
    const STATUSES: Array<'In Progress' | 'Won' | 'Lost' | 'Pending'> = ['In Progress', 'Won', 'Lost', 'Pending'];
    const CUSTOMERS = ['Viettel Group', 'VPBank', 'VNPT', 'Techcombank', 'VinGroup', 'FPT Software',
      'Vietnam Airlines', 'Petrovietnam', 'Masan Group', 'MoIT', 'EVN', 'Grab Vietnam'];

    const futureDate = (n: number) => {
      const d = new Date();
      d.setDate(d.getDate() + n);
      return d.toISOString().split('T')[0];
    };

    const deals: Partial<Deal>[] = [];
    partners.forEach((p, i) => {
      const customer = CUSTOMERS[i % CUSTOMERS.length];
      const status = STATUSES[i % STATUSES.length];
      deals.push({
        partnerId: p.id,
        partnerName: p.name,
        customerName: customer,
        dealValue: (Math.floor(Math.random() * 450) + 50) * 1000,
        expectedCloseDate: new Date(futureDate(Math.floor(Math.random() * 90) - 15)),
        status,
        businessUnit: BUS[i % BUS.length],
        description: `${p.name} solution deployment for ${customer}`,
      });
    });

    for (const d of deals) {
      await this.dealsRepo.save(this.dealsRepo.create(d as any));
    }
    return { created: deals.length };
  }
}
