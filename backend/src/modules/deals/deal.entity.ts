import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Partner } from '../partners/partner.entity';
import { Employee } from '../employees/employee.entity';

export type DealStatus = 'In Progress' | 'Won' | 'Lost' | 'Pending';
export type BusinessUnit = 'HSI' | 'HSC' | 'HAS' | 'HSE' | 'HSV';

@Entity('deals')
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'partner_id' })
  partnerId: string;

  @Column({ name: 'partner_name', length: 150 })
  partnerName: string;

  @Column({ name: 'customer_name', length: 200 })
  customerName: string;

  @Column({ name: 'deal_value', type: 'decimal', precision: 15, scale: 2, default: 0 })
  dealValue: number;

  @Column({ name: 'expected_close_date', type: 'date', nullable: true })
  expectedCloseDate: Date;

  @Column({
    type: 'enum',
    enum: ['In Progress', 'Won', 'Lost', 'Pending'],
    default: 'Pending',
  })
  status: DealStatus;

  @Column({
    name: 'business_unit',
    type: 'enum',
    enum: ['HSI', 'HSC', 'HAS', 'HSE', 'HSV'],
    nullable: true,
  })
  businessUnit: BusinessUnit;

  @Column({ name: 'assigned_manager_id', nullable: true })
  assignedManagerId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Partner, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_manager_id' })
  assignedManager: Employee;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
