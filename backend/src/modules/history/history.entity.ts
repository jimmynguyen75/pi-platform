import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('history')
export class History {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entity_type', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', length: 36 })
  entityId: string;

  @Column({ name: 'field_changed', length: 100 })
  fieldChanged: string;

  @Column({ name: 'old_value', type: 'text', nullable: true })
  oldValue: string;

  @Column({ name: 'new_value', type: 'text', nullable: true })
  newValue: string;

  @Column({ name: 'updated_by', length: 36, nullable: true })
  updatedBy: string;

  @Column({ name: 'updated_by_name', length: 100, nullable: true })
  updatedByName: string;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;
}
