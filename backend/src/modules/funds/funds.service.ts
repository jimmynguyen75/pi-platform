import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fund } from './fund.entity';
import { CreateFundDto } from './dto/create-fund.dto';
import { Partner } from '../partners/partner.entity';

@Injectable()
export class FundsService {
  constructor(
    @InjectRepository(Fund)
    private readonly fundsRepo: Repository<Fund>,
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
  ) {}

  async create(dto: CreateFundDto): Promise<Fund> {
    const fund = this.fundsRepo.create(dto);
    return this.fundsRepo.save(fund);
  }

  async findAll(filters: {
    partnerId?: string;
    fundType?: string;
    fiscalYear?: number;
    claimStatus?: string;
  }): Promise<Fund[]> {
    const qb = this.fundsRepo
      .createQueryBuilder('fund')
      .leftJoinAndSelect('fund.partner', 'partner')
      .orderBy('fund.fiscalYear', 'DESC')
      .addOrderBy('fund.createdAt', 'DESC');

    if (filters.partnerId) qb.andWhere('fund.partnerId = :pid', { pid: filters.partnerId });
    if (filters.fundType) qb.andWhere('fund.fundType = :ft', { ft: filters.fundType });
    if (filters.fiscalYear) qb.andWhere('fund.fiscalYear = :fy', { fy: filters.fiscalYear });
    if (filters.claimStatus) qb.andWhere('fund.claimStatus = :cs', { cs: filters.claimStatus });

    return qb.getMany();
  }

  async findOne(id: string): Promise<Fund> {
    const fund = await this.fundsRepo.findOne({ where: { id }, relations: ['partner'] });
    if (!fund) throw new NotFoundException(`Fund ${id} not found`);
    return fund;
  }

  async update(id: string, dto: Partial<CreateFundDto>): Promise<Fund> {
    await this.fundsRepo.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.fundsRepo.delete(id);
  }

  async getSummary(): Promise<{
    totalByType: Record<string, { total: number; received: number; spent: number; remaining: number }>;
    grandTotal: number;
    grandReceived: number;
    utilizationRate: number;
    pendingClaims: number;
  }> {
    const funds = await this.fundsRepo.find();

    const totalByType: Record<string, { total: number; received: number; spent: number; remaining: number }> = {};
    let grandTotal = 0;
    let grandReceived = 0;
    let grandSpent = 0;
    let pendingClaims = 0;

    for (const fund of funds) {
      const type = fund.fundType;
      if (!totalByType[type]) totalByType[type] = { total: 0, received: 0, spent: 0, remaining: 0 };
      const total = Number(fund.totalAmount);
      const received = Number(fund.receivedAmount);
      const spent = Number(fund.spentAmount);
      totalByType[type].total += total;
      totalByType[type].received += received;
      totalByType[type].spent += spent;
      totalByType[type].remaining += received - spent;
      grandTotal += total;
      grandReceived += received;
      grandSpent += spent;
      if (fund.claimStatus === 'Pending' || fund.claimStatus === 'Submitted') pendingClaims++;
    }

    const utilizationRate = grandReceived > 0 ? Math.round((grandSpent / grandReceived) * 100) : 0;

    return { totalByType, grandTotal, grandReceived, utilizationRate, pendingClaims };
  }

  async seedSampleData(): Promise<{ created: number }> {
    const existing = await this.fundsRepo.count();
    if (existing > 0) return { created: 0 };

    const partners = await this.partnerRepo.find({ take: 15 });
    if (partners.length === 0) return { created: 0 };

    const TYPES: Array<'Rebate' | 'Program Fund' | 'Marketing Fund'> = ['Rebate', 'Program Fund', 'Marketing Fund'];
    const CLAIM_STATUSES: Array<'Pending' | 'Submitted' | 'Approved' | 'Paid'> = ['Pending', 'Submitted', 'Approved', 'Paid'];

    const funds: Partial<Fund>[] = [];
    partners.forEach((p, i) => {
      const total = (Math.floor(Math.random() * 180) + 20) * 1000;
      const received = Math.floor(total * (0.4 + Math.random() * 0.5));
      const spent = Math.floor(received * (0.3 + Math.random() * 0.6));
      funds.push({
        partnerId: p.id,
        partnerName: p.name,
        fundType: TYPES[i % TYPES.length],
        fiscalYear: 2025,
        totalAmount: total,
        receivedAmount: received,
        spentAmount: spent,
        claimStatus: CLAIM_STATUSES[i % CLAIM_STATUSES.length],
        notes: `FY2025 ${TYPES[i % TYPES.length]} for ${p.name}`,
      });
    });

    for (const f of funds) {
      await this.fundsRepo.save(this.fundsRepo.create(f as any));
    }
    return { created: funds.length };
  }
}
