import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Domain } from './domain.entity';
import { CreateDomainDto } from './dto/create-domain.dto';

@Injectable()
export class DomainsService {
  constructor(
    @InjectRepository(Domain)
    private domainRepo: Repository<Domain>,
  ) {}

  async create(dto: CreateDomainDto) {
    const existing = await this.domainRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Domain name already exists');
    const domain = this.domainRepo.create(dto);
    return this.domainRepo.save(domain);
  }

  async findAll() {
    return this.domainRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.partners', 'partners')
      .orderBy('d.name', 'ASC')
      .getMany();
  }

  async findOne(id: string) {
    const domain = await this.domainRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.partners', 'partners')
      .leftJoinAndSelect('partners.assignments', 'assignments')
      .leftJoinAndSelect('assignments.employee', 'employee')
      .where('d.id = :id', { id })
      .getOne();

    if (!domain) throw new NotFoundException(`Domain ${id} not found`);
    return domain;
  }

  async update(id: string, dto: Partial<CreateDomainDto>) {
    const domain = await this.domainRepo.findOne({ where: { id } });
    if (!domain) throw new NotFoundException(`Domain ${id} not found`);
    Object.assign(domain, dto);
    return this.domainRepo.save(domain);
  }

  async remove(id: string) {
    const domain = await this.domainRepo.findOne({ where: { id } });
    if (!domain) throw new NotFoundException(`Domain ${id} not found`);
    await this.domainRepo.remove(domain);
    return { message: 'Domain deleted' };
  }
}
