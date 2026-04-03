import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from './employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { HistoryService } from '../history/history.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    private historyService: HistoryService,
  ) {}

  async create(dto: CreateEmployeeDto, actorId?: string, actorName?: string) {
    const existing = await this.employeeRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const employee = this.employeeRepo.create({ ...dto, password: hashed });
    const saved = await this.employeeRepo.save(employee);

    await this.historyService.logChange({
      entityType: 'Manager',
      entityId: saved.id,
      fieldChanged: 'created',
      oldValue: null,
      newValue: saved.name,
      updatedBy: actorId,
      updatedByName: actorName,
    });

    return this.findOne(saved.id);
  }

  async findAll(search?: string) {
    const qb = this.employeeRepo
      .createQueryBuilder('e')
      .orderBy('e.name', 'ASC');

    if (search) {
      qb.andWhere('(e.name ILIKE :s OR e.email ILIKE :s OR e.title ILIKE :s)', {
        s: `%${search}%`,
      });
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const emp = await this.employeeRepo.findOne({ where: { id } });
    if (!emp) throw new NotFoundException(`Manager ${id} not found`);
    return emp;
  }

  async update(
    id: string,
    dto: UpdateEmployeeDto,
    actorId?: string,
    actorName?: string,
  ) {
    const emp = await this.employeeRepo.findOne({ where: { id } });
    if (!emp) throw new NotFoundException(`Manager ${id} not found`);

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    const oldSnapshot = { ...emp };
    Object.assign(emp, dto);
    const saved = await this.employeeRepo.save(emp);

    await this.historyService.logMultipleChanges(
      'Manager',
      id,
      oldSnapshot,
      dto as any,
      actorId,
      actorName,
    );

    return this.findOne(saved.id);
  }

  async remove(id: string) {
    const emp = await this.employeeRepo.findOne({ where: { id } });
    if (!emp) throw new NotFoundException(`Manager ${id} not found`);
    await this.employeeRepo.remove(emp);
    return { message: 'Manager deleted' };
  }
}
