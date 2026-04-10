import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { TaskStatus, TaskPriority } from '@app/interfaces';
import { calculateNextDueDate } from './recurrence.utils';

@Injectable()
export class RecurringTaskService {
  private readonly logger = new Logger(RecurringTaskService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  /**
   * Runs daily at 00:05. Spawns new task instances from completed recurring tasks
   * whose next occurrence date has arrived.
   *
   * Incomplete recurring tasks are left alone — they keep their overdue due date
   * and block new instances from being spawned.
   */
  @Cron('0 5 0 * * *')
  async processRecurringTasks(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    this.logger.log(`Processing recurring tasks for ${today}`);

    const spawned = await this.spawnFromCompletedTasks(today);
    this.logger.log(`Spawned ${spawned} recurring task instances`);
  }

  private async spawnFromCompletedTasks(today: string): Promise<number> {
    // Find all completed recurring tasks
    const completedRecurring = await this.taskRepository.find({
      where: {
        status: TaskStatus.Done,
        recurrenceRule: Not(IsNull()),
      },
    });

    let spawnCount = 0;

    for (const task of completedRecurring) {
      if (!task.recurrenceRule || !task.dueDate) continue;

      const nextDate = calculateNextDueDate(task.recurrenceRule, task.dueDate);

      // Only spawn if the next date is today or in the past
      if (nextDate > today) continue;

      // Check for existing incomplete instance with same title + user + recurrence
      const existing = await this.taskRepository
        .createQueryBuilder('task')
        .where('task.userId = :userId', { userId: task.userId })
        .andWhere('task.title = :title', { title: task.title })
        .andWhere('task.status = :status', { status: TaskStatus.Todo })
        .andWhere('task.recurrenceRule IS NOT NULL')
        .getOne();

      if (existing) continue;

      // Spawn new instance
      const newTask = this.taskRepository.create({
        title: task.title,
        description: task.description,
        notes: task.notes,
        status: TaskStatus.Todo,
        priority: task.priority || TaskPriority.None,
        dueDate: nextDate,
        tags: task.tags || [],
        scheduledDate: null,
        prerequisiteIds: [],
        recurrenceRule: task.recurrenceRule,
        position: 0,
        userId: task.userId,
      });

      await this.taskRepository.save(newTask);
      spawnCount++;
    }

    return spawnCount;
  }
}
