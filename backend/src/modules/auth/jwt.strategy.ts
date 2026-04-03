import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../employees/employee.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', 'fallback_secret'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const employee = await this.employeeRepo.findOne({
      where: { id: payload.sub },
    });
    if (!employee) throw new UnauthorizedException();
    return { id: employee.id, email: employee.email, role: employee.role, name: employee.name };
  }
}
