import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Activity } from '../activities/activity.entity';

export type ManagerRole = 'admin' | 'manager';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'manager'],
    default: 'manager',
  })
  role: ManagerRole;

  @Column({ name: 'title', length: 100, nullable: true })
  title: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string;

  @OneToMany(() => Activity, (a) => a.manager)
  activities: Activity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
