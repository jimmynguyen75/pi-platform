import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Domain } from '../domains/domain.entity';
import { Employee } from '../employees/employee.entity';
import { Activity } from '../activities/activity.entity';

export type PriorityLevel = 'Strategic' | 'Key' | 'Normal';
export type PartnerStatus = 'Active' | 'Risk' | 'Inactive';
export type PartnerTier = 'Titanium' | 'Platinum' | 'Gold' | 'Silver' | 'Registered' | 'Strategic Partner';

export interface Certification {
  name: string;
  issuedDate?: string;
  expiryDate?: string;
  level?: string;
}

export interface OfficialLink {
  label: string;
  url: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  contactName?: string;
  address?: string;
  [key: string]: string | undefined;
}

@Entity('partners')
export class Partner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ name: 'domain_id' })
  domainId: string;

  @Column({ name: 'manager_id', nullable: true })
  managerId: string;

  @Column({
    name: 'priority_level',
    type: 'enum',
    enum: ['Strategic', 'Key', 'Normal'],
    default: 'Normal',
  })
  priorityLevel: PriorityLevel;

  @Column({
    type: 'enum',
    enum: ['Active', 'Risk', 'Inactive'],
    default: 'Active',
  })
  status: PartnerStatus;

  @Column({
    name: 'health_score',
    type: 'int',
    default: 0,
  })
  healthScore: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ type: 'jsonb', name: 'official_links', default: [] })
  officialLinks: OfficialLink[];

  @Column({ type: 'jsonb', name: 'contact_info', default: {} })
  contactInfo: ContactInfo;

  @Column({
    name: 'partner_tier',
    type: 'enum',
    enum: ['Titanium', 'Platinum', 'Gold', 'Silver', 'Registered', 'Strategic Partner'],
    nullable: true,
  })
  partnerTier: PartnerTier;

  @Column({ type: 'jsonb', name: 'certifications', default: [] })
  certifications: Certification[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Domain, (d) => d.partners, { eager: false })
  @JoinColumn({ name: 'domain_id' })
  domain: Domain;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'manager_id' })
  manager: Employee;

  @OneToMany(() => Activity, (a) => a.partner)
  activities: Activity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
