import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DomainsService } from './domains.service';
import { CreateDomainDto } from './dto/create-domain.dto';

@ApiTags('Domains')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create domain' })
  create(@Body() dto: CreateDomainDto) {
    return this.domainsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all domains with partner counts' })
  findAll() {
    return this.domainsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get domain details' })
  findOne(@Param('id') id: string) {
    return this.domainsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update domain' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateDomainDto>) {
    return this.domainsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete domain' })
  remove(@Param('id') id: string) {
    return this.domainsService.remove(id);
  }
}
