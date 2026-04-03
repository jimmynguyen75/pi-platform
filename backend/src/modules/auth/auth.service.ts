import { Injectable, UnauthorizedException } from '@nestjs/common';
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
}
