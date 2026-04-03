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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Log a new activity for a partner' })
  create(@Body() dto: CreateActivityDto) {
    return this.activitiesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get activities with optional filters' })
  @ApiQuery({ name: 'partnerId', required: false })
  @ApiQuery({ name: 'managerId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  findAll(
    @Query('partnerId') partnerId?: string,
    @Query('managerId') managerId?: string,
    @Query('type') type?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.activitiesService.findAll({ partnerId, managerId, type, from, to });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update activity' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateActivityDto>) {
    return this.activitiesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete activity' })
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}
