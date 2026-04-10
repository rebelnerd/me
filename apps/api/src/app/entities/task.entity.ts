import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TaskStatus, TaskPriority, IRecurrenceRule } from '@app/interfaces';
import { User } from './user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.Todo })
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.None })
  priority: TaskPriority;

  @Column({ type: 'date', nullable: true })
  dueDate: string | null;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'date', nullable: true })
  scheduledDate: string | null;

  @Column({ default: 0 })
  position: number;

  @Column({ type: 'simple-json', nullable: true })
  prerequisiteIds: number[];

  @Column({ type: 'simple-json', nullable: true })
  recurrenceRule: IRecurrenceRule | null;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed at query time, not stored
  isBlocked?: boolean;
}
