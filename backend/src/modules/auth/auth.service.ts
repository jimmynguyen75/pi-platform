import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from '../employees/employee.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const employee = await this.employeeRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'name', 'email', 'password', 'role', 'title'],
    });

    if (!employee) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(dto.password, employee.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: employee.id, email: employee.email, role: employee.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        title: employee.title,
      },
    };
  }

  async getProfile(userId: string) {
    return this.employeeRepo.findOne({ where: { id: userId } });
  }

  async updateProfile(userId: string, dto: { name?: string; title?: string; avatarUrl?: string }) {
    if (dto.name !== undefined && dto.name.trim().length === 0) {
      throw new BadRequestException('Name cannot be empty');
    }
    await this.employeeRepo.update(userId, dto);
    return this.employeeRepo.findOne({ where: { id: userId } });
  }

  async changePassword(userId: string, dto: { currentPassword: string; newPassword: string }) {
    const employee = await this.employeeRepo.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });
    if (!employee) throw new UnauthorizedException();
    const isValid = await bcrypt.compare(dto.currentPassword, employee.password);
    if (!isValid) throw new BadRequestException('Current password is incorrect');
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.employeeRepo.update(userId, { password: hashed });
    return { success: true };
  }
}
