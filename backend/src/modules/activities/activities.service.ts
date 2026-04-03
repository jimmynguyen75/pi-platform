import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { PartnersService } from '../partners/partners.service';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
    private partnersService: PartnersService,
  ) {}

  async create(dto: CreateActivityDto) {
    const activity = this.activityRepo.create(dto);
    const saved = await this.activityRepo.save(activity);

    await this.partnersService.recalculateHealthScore(dto.partnerId);

    return this.findOne(saved.id);
  }

  async findAll(filters?: {
    partnerId?: string;
    managerId?: string;
    type?: string;
    from?: string;
    to?: string;
  }) {
    const qb = this.activityRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.partner', 'partner')
      .leftJoinAndSelect('a.manager', 'manager')
      .orderBy('a.date', 'DESC');

    if (filters?.partnerId) {
      qb.andWhere('a.partner_id = :pId', { pId: filters.partnerId });
    }
    if (filters?.managerId) {
      qb.andWhere('a.manager_id = :mId', { mId: filters.managerId });
    }
    if (filters?.type) {
      qb.andWhere('a.type = :type', { type: filters.type });
    }
    if (filters?.from) {
      qb.andWhere('a.date >= :from', { from: filters.from });
    }
    if (filters?.to) {
      qb.andWhere('a.date <= :to', { to: filters.to });
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const activity = await this.activityRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.partner', 'partner')
      .leftJoinAndSelect('a.manager', 'manager')
      .where('a.id = :id', { id })
      .getOne();

    if (!activity) throw new NotFoundException(`Activity ${id} not found`);
    return activity;
  }

  async update(id: string, dto: Partial<CreateActivityDto>) {
    const activity = await this.activityRepo.findOne({ where: { id } });
    if (!activity) throw new NotFoundException(`Activity ${id} not found`);

    const partnerId = activity.partnerId;
    Object.assign(activity, dto);
    const saved = await this.activityRepo.save(activity);

    await this.partnersService.recalculateHealthScore(partnerId);

    return this.findOne(saved.id);
  }

  async remove(id: string) {
    const activity = await this.activityRepo.findOne({ where: { id } });
    if (!activity) throw new NotFoundException(`Activity ${id} not found`);

    const partnerId = activity.partnerId;
    await this.activityRepo.remove(activity);

    await this.partnersService.recalculateHealthScore(partnerId);

    return { message: 'Activity deleted' };
  }

  async getRecentForPartner(partnerId: string, limit = 20) {
    return this.activityRepo.find({
      where: { partnerId },
      relations: ['manager'],
      order: { date: 'DESC' },
      take: limit,
    });
  }
}
