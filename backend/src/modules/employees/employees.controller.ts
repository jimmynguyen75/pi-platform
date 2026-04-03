import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@ApiTags('Managers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new manager (admin only)' })
  create(@Body() dto: CreateEmployeeDto, @Request() req) {
    return this.employeesService.create(dto, req.user?.id, req.user?.name);
  }

  @Get()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get all managers' })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query('search') search?: string) {
    return this.employeesService.findAll(search);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get manager by ID' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update manager (admin only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @Request() req,
  ) {
    return this.employeesService.update(id, dto, req.user?.id, req.user?.name);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete manager (admin only)' })
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
