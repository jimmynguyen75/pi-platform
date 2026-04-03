import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import OpenAI from 'openai';
import { Partner } from './partner.entity';
import { Activity } from '../activities/activity.entity';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { HistoryService } from '../history/history.service';

@Injectable()
export class PartnersService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(Partner)
    private partnerRepo: Repository<Partner>,
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
    private historyService: HistoryService,
  ) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async create(dto: CreatePartnerDto, actorId?: string, actorName?: string) {
    const partner = this.partnerRepo.create({
      ...dto,
      officialLinks: dto.officialLinks ?? [],
      contactInfo: dto.contactInfo ?? {},
      healthScore: 0,
      status: dto.status || 'Active',
    });
    const saved = await this.partnerRepo.save(partner);

    await this.historyService.logChange({
      entityType: 'Partner',
      entityId: saved.id,
      fieldChanged: 'created',
      oldValue: null,
      newValue: saved.name,
      updatedBy: actorId,
      updatedByName: actorName,
    });

    return this.findOne(saved.id);
  }

  async findAll(filters?: {
    domain?: string;
    priority?: string;
    status?: string;
    managerId?: string;
    search?: string;
  }) {
    const qb = this.partnerRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.domain', 'domain')
      .leftJoinAndSelect('p.manager', 'manager')
      .leftJoinAndSelect('p.activities', 'activities')
      .orderBy('p.name', 'ASC');

    if (filters?.domain) {
      qb.andWhere('domain.id = :domainId', { domainId: filters.domain });
    }
    if (filters?.priority) {
      qb.andWhere('p.priorityLevel = :priority', { priority: filters.priority });
    }
    if (filters?.status) {
      qb.andWhere('p.status = :status', { status: filters.status });
    }
    if (filters?.managerId) {
      qb.andWhere('p.manager_id = :managerId', { managerId: filters.managerId });
    }
    if (filters?.search) {
      qb.andWhere('p.name ILIKE :s', { s: `%${filters.search}%` });
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const partner = await this.partnerRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.domain', 'domain')
      .leftJoinAndSelect('p.manager', 'manager')
      .leftJoinAndSelect('p.activities', 'activities')
      .leftJoinAndSelect('activities.manager', 'actManager')
      .where('p.id = :id', { id })
      .orderBy('activities.date', 'DESC')
      .getOne();

    if (!partner) throw new NotFoundException(`Partner ${id} not found`);
    return partner;
  }

  async update(
    id: string,
    dto: UpdatePartnerDto,
    actorId?: string,
    actorName?: string,
  ) {
    const partner = await this.partnerRepo.findOne({ where: { id } });
    if (!partner) throw new NotFoundException(`Partner ${id} not found`);

    const oldSnapshot = { ...partner };
    Object.assign(partner, dto);
    const saved = await this.partnerRepo.save(partner);

    await this.historyService.logMultipleChanges(
      'Partner',
      id,
      oldSnapshot,
      dto as any,
      actorId,
      actorName,
    );

    return this.findOne(saved.id);
  }

  async remove(id: string) {
    const partner = await this.partnerRepo.findOne({ where: { id } });
    if (!partner) throw new NotFoundException(`Partner ${id} not found`);
    await this.partnerRepo.remove(partner);
    return { message: 'Partner deleted' };
  }

  async recalculateHealthScore(partnerId: string): Promise<void> {
    const partner = await this.partnerRepo.findOne({ where: { id: partnerId } });
    if (!partner) return;

    const activities = await this.activityRepo.find({
      where: { partnerId },
      order: { date: 'DESC' },
    });

    const score = this.computeHealthScore(activities, partner.priorityLevel);
    const status = this.computeStatus(score, activities);

    await this.partnerRepo.update(partnerId, { healthScore: score, status });
  }

  private computeHealthScore(activities: Activity[], _priority: string): number {
    if (activities.length === 0) return 0;

    const now = dayjs();
    const lastActivity = dayjs(activities[0].date);
    const daysSinceLast = now.diff(lastActivity, 'day');

    let recency: number;
    if (daysSinceLast <= 7) recency = 50;
    else if (daysSinceLast <= 14) recency = 40;
    else if (daysSinceLast <= 30) recency = 30;
    else if (daysSinceLast <= 60) recency = 15;
    else recency = 0;

    const cutoff90 = now.subtract(90, 'day');
    const count90 = activities.filter((a) => dayjs(a.date).isAfter(cutoff90)).length;
    let volume: number;
    if (count90 >= 10) volume = 30;
    else if (count90 >= 6) volume = 25;
    else if (count90 >= 3) volume = 20;
    else if (count90 >= 1) volume = 10;
    else volume = 0;

    const cutoff30 = now.subtract(30, 'day');
    const count30 = activities.filter((a) => dayjs(a.date).isAfter(cutoff30)).length;
    let engagement: number;
    if (count30 >= 3) engagement = 20;
    else if (count30 >= 2) engagement = 15;
    else if (count30 >= 1) engagement = 10;
    else engagement = 0;

    return Math.min(100, Math.max(0, recency + volume + engagement));
  }

  private computeStatus(
    score: number,
    activities: Activity[],
  ): 'Active' | 'Risk' | 'Inactive' {
    if (activities.length === 0) return 'Inactive';

    const now = dayjs();
    const daysSinceLast = now.diff(dayjs(activities[0].date), 'day');

    if (daysSinceLast > 90 && score < 10) return 'Inactive';
    if (daysSinceLast >= 30 || score < 40) return 'Risk';
    return 'Active';
  }

  async getPartnerHistory(partnerId: string) {
    return this.historyService.getHistory('Partner', partnerId);
  }

  async bulkRecalculate() {
    const partners = await this.partnerRepo.find();
    for (const p of partners) {
      await this.recalculateHealthScore(p.id);
    }
    return { recalculated: partners.length };
  }

  /**
   * Generate a GPT-powered partner summary and actionable insights.
   */
  async generateSummary(id: string): Promise<{ summary: string; insights: string[] }> {
    const partner = await this.findOne(id);
    const activities = partner.activities ?? [];

    const actCounts: Record<string, number> = {};
    for (const a of activities) actCounts[a.type] = (actCounts[a.type] ?? 0) + 1;

    const days = activities.length > 0
      ? dayjs().diff(dayjs(activities[0].date), 'day')
      : null;

    const context = {
      name: partner.name,
      domain: partner.domain?.name ?? 'unknown',
      priority: partner.priorityLevel,
      status: partner.status,
      healthScore: partner.healthScore,
      manager: partner.manager?.name ?? 'unassigned',
      description: partner.description ?? '',
      totalActivities: activities.length,
      activityBreakdown: actCounts,
      daysSinceLastActivity: days,
      recentActivities: activities.slice(0, 5).map((a) => ({
        type: a.type,
        title: a.title,
        date: a.date,
        note: a.note,
      })),
      officialLinksCount: partner.officialLinks?.length ?? 0,
      hasContactInfo: !!(partner.contactInfo?.email || partner.contactInfo?.phone),
    };

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: `You are a partnership intelligence analyst. Given partner data, generate a concise professional summary and 3-5 actionable insights.
Respond ONLY with valid JSON in this exact format:
{
  "summary": "2-3 sentence executive summary of the partnership",
  "insights": ["insight 1", "insight 2", "insight 3"]
}
Use emojis sparingly. Be direct and data-driven.`,
        },
        {
          role: 'user',
          content: `Analyze this partnership:\n${JSON.stringify(context, null, 2)}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    try {
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      return {
        summary: parsed.summary ?? '',
        insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      };
    } catch {
      return { summary: raw, insights: [] };
    }
  }

  /**
   * Parse raw text (meeting notes, email) into a structured activity using GPT.
   */
  async parseActivityFromText(rawText: string): Promise<{
    type: string;
    title: string;
    note: string;
    date: string;
  }> {
    const today = dayjs().format('YYYY-MM-DD');

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: `You are an assistant that extracts structured activity data from raw text (meeting notes, emails, call logs).
Respond ONLY with valid JSON in this exact format:
{
  "type": "meeting|call|email|deal|review",
  "title": "short title (max 80 chars)",
  "note": "cleaned up summary of the activity",
  "date": "YYYY-MM-DD (today if not specified)"
}
Today's date is ${today}.`,
        },
        {
          role: 'user',
          content: rawText,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    try {
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      return {
        type: parsed.type ?? 'meeting',
        title: (parsed.title ?? 'Activity').substring(0, 100),
        note: parsed.note ?? rawText.trim(),
        date: parsed.date ?? today,
      };
    } catch {
      return { type: 'meeting', title: 'Activity', note: rawText.trim(), date: today };
    }
  }
}
