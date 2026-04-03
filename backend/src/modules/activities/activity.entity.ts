import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../employees/employee.entity';
import { Partner } from '../partners/partner.entity';

export type ActivityType = 'meeting' | 'deal' | 'email' | 'call' | 'review';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'partner_id' })
  partnerId: string;

  @Column({ name: 'manager_id' })
  managerId: string;

  @Column({
    type: 'enum',
    enum: ['meeting', 'deal', 'email', 'call', 'review'],
  })
  type: ActivityType;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ length: 200, nullable: true })
  title: string;

  @ManyToOne(() => Partner, (p) => p.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @ManyToOne(() => Employee, (e) => e.activities, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: Employee;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
