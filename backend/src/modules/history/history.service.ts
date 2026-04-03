import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './history.entity';

interface LogChangeOptions {
  entityType: string;
  entityId: string;
  fieldChanged: string;
  oldValue: any;
  newValue: any;
  updatedBy?: string;
  updatedByName?: string;
}

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private historyRepo: Repository<History>,
  ) {}

  async logChange(opts: LogChangeOptions): Promise<void> {
    const entry = this.historyRepo.create({
      entityType: opts.entityType,
      entityId: opts.entityId,
      fieldChanged: opts.fieldChanged,
      oldValue: opts.oldValue != null ? String(opts.oldValue) : null,
      newValue: opts.newValue != null ? String(opts.newValue) : null,
      updatedBy: opts.updatedBy,
      updatedByName: opts.updatedByName,
    });
    await this.historyRepo.save(entry);
  }

  async logMultipleChanges(
    entityType: string,
    entityId: string,
    oldObj: Record<string, any>,
    newObj: Record<string, any>,
    updatedBy?: string,
    updatedByName?: string,
  ) {
    const entries: History[] = [];
    for (const key of Object.keys(newObj)) {
      if (oldObj[key] !== newObj[key]) {
        entries.push(
          this.historyRepo.create({
            entityType,
            entityId,
            fieldChanged: key,
            oldValue: oldObj[key] != null ? String(oldObj[key]) : null,
            newValue: newObj[key] != null ? String(newObj[key]) : null,
            updatedBy,
            updatedByName,
          }),
        );
      }
    }
    if (entries.length > 0) {
      await this.historyRepo.save(entries);
    }
  }

  async getHistory(entityType: string, entityId: string) {
    return this.historyRepo.find({
      where: { entityType, entityId },
      order: { timestamp: 'DESC' },
      take: 100,
    });
  }

  async getAllHistory(limit = 50) {
    return this.historyRepo.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
