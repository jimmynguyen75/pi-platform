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

export type FundType = 'Rebate' | 'Program Fund' | 'Marketing Fund';
export type ClaimStatus = 'Pending' | 'Submitted' | 'Approved' | 'Rejected' | 'Paid';

@Entity('funds')
export class Fund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'partner_id' })
  partnerId: string;

  @Column({ name: 'partner_name', length: 150 })
  partnerName: string;

  @Column({
    name: 'fund_type',
    type: 'enum',
    enum: ['Rebate', 'Program Fund', 'Marketing Fund'],
  })
  fundType: FundType;

  @Column({ name: 'fiscal_year', type: 'int' })
  fiscalYear: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ name: 'received_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  receivedAmount: number;

  @Column({ name: 'spent_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  spentAmount: number;

  @Column({
    name: 'claim_status',
    type: 'enum',
    enum: ['Pending', 'Submitted', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending',
  })
  claimStatus: ClaimStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Partner, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
