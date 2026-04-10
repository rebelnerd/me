import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from '../../entities/task.entity';
import {
  TaskStatus,
  TaskPriority,
  ICreateTaskRequest,
  IUpdateTaskRequest,
} from '@app/interfaces';
import { calculateFirstDueDate } from './recurrence.utils';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  /**
   * Compute isBlocked for a set of tasks by checking whether any
   * prerequisite task is still not done.
   */
  private async hydrateBlocked(tasks: Task[]): Promise<Task[]> {
    // Collect all prerequisite IDs across all tasks
    const allPrereqIds = new Set<number>();
    for (const t of tasks) {
      if (t.prerequisiteIds?.length) {
        for (const pid of t.prerequisiteIds) {
          allPrereqIds.add(pid);
        }
      }
    }

    if (allPrereqIds.size === 0) {
      for (const t of tasks) {
        t.prerequisiteIds = t.prerequisiteIds || [];
        t.isBlocked = false;
      }
      return tasks;
    }

    // Load the statuses of all prerequisite tasks in one query
    const prereqTasks = await this.taskRepository.find({
      where: { id: In([...allPrereqIds]) },
      select: ['id', 'status'],
    });
    const doneSet = new Set(
      prereqTasks.filter((p) => p.status === TaskStatus.Done).map((p) => p.id),
    );

    for (const t of tasks) {
      t.prerequisiteIds = t.prerequisiteIds || [];
      if (t.prerequisiteIds.length === 0) {
        t.isBlocked = false;
      } else {
        t.isBlocked = t.prerequisiteIds.some((pid) => !doneSet.has(pid));
      }
    }

    return tasks;
  }

  /**
   * Compute isBlocked for a single task.
   */
  private async hydrateSingleBlocked(task: Task): Promise<Task> {
    const [result] = await this.hydrateBlocked([task]);
    return result;
  }

  /**
   * Get tasks scheduled for a specific date + any unscheduled tasks
   * whose dueDate matches (auto-focus).
   */
  async findScheduledForDate(userId: number, date: string): Promise<Task[]> {
    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .andWhere(
        '(task.scheduledDate = :date OR (task.scheduledDate IS NULL AND task.dueDate = :date))',
        { date },
      )
      .orderBy('task.position', 'ASC')
      .getMany();

    return this.hydrateBlocked(tasks);
  }

  /**
   * Get backlog tasks: no scheduledDate, not done, and dueDate is not today
   * (those with today's dueDate show in the daily view instead).
   */
  async findBacklog(userId: number, today: string): Promise<Task[]> {
    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .andWhere('task.scheduledDate IS NULL')
      .andWhere('task.status = :status', { status: TaskStatus.Todo })
      .andWhere('(task.dueDate IS NULL OR task.dueDate != :today)', { today })
      .orderBy('task.createdAt', 'DESC')
      .getMany();

    return this.hydrateBlocked(tasks);
  }

  async findById(id: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, userId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  /**
   * Get next uncompleted, unblocked task for the focus view.
   * Scheduled for date OR due today (auto-focused).
   * Skips tasks whose prerequisites are not yet done.
   */
  async getNextTodo(userId: number, date: string): Promise<Task | null> {
    const candidates = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .andWhere('task.status = :status', { status: TaskStatus.Todo })
      .andWhere(
        '(task.scheduledDate = :date OR (task.scheduledDate IS NULL AND task.dueDate = :date))',
        { date },
      )
      .orderBy('task.position', 'ASC')
      .getMany();

    await this.hydrateBlocked(candidates);

    return candidates.find((t) => !t.isBlocked) ?? null;
  }

  async create(userId: number, data: ICreateTaskRequest): Promise<Task> {
    const scheduledDate = data.scheduledDate || null;

    // Calculate position within the scheduled date (or globally for backlog)
    let maxPosition: { max: number | null };
    if (scheduledDate) {
      maxPosition = await this.taskRepository
        .createQueryBuilder('task')
        .select('MAX(task.position)', 'max')
        .where('task.userId = :userId AND task.scheduledDate = :scheduledDate', {
          userId,
          scheduledDate,
        })
        .getRawOne();
    } else {
      maxPosition = await this.taskRepository
        .createQueryBuilder('task')
        .select('MAX(task.position)', 'max')
        .where('task.userId = :userId AND task.scheduledDate IS NULL', { userId })
        .getRawOne();
    }

    const position = (maxPosition?.max ?? -1) + 1;

    const recurrenceRule = data.recurrenceRule || null;

    // Auto-calculate dueDate for recurring tasks if not explicitly set
    let dueDate = data.dueDate || null;
    if (recurrenceRule && !dueDate) {
      const today = new Date().toISOString().split('T')[0];
      dueDate = calculateFirstDueDate(recurrenceRule, today);
    }

    const task = this.taskRepository.create({
      title: data.title,
      description: data.description || null,
      notes: data.notes || null,
      status: TaskStatus.Todo,
      priority: data.priority || TaskPriority.None,
      dueDate,
      tags: data.tags || [],
      scheduledDate,
      prerequisiteIds: [],
      recurrenceRule,
      position,
      userId,
    });

    const saved = await this.taskRepository.save(task);
    saved.isBlocked = false;
    return saved;
  }

  /**
   * Schedule a backlog task for a specific date.
   */
  async scheduleForDate(
    id: number,
    userId: number,
    date: string,
  ): Promise<Task> {
    const task = await this.findById(id, userId);
    task.scheduledDate = date;
    const saved = await this.taskRepository.save(task);
    return this.hydrateSingleBlocked(saved);
  }

  /**
   * Unschedule a task back to the backlog.
   */
  async unschedule(id: number, userId: number): Promise<Task> {
    const task = await this.findById(id, userId);
    task.scheduledDate = null;
    const saved = await this.taskRepository.save(task);
    return this.hydrateSingleBlocked(saved);
  }

  async update(
    id: number,
    userId: number,
    data: IUpdateTaskRequest,
  ): Promise<Task> {
    const task = await this.findById(id, userId);
    Object.assign(task, data);
    const saved = await this.taskRepository.save(task);
    return this.hydrateSingleBlocked(saved);
  }

  async delete(id: number, userId: number): Promise<void> {
    const task = await this.findById(id, userId);
    await this.taskRepository.remove(task);
  }

  async reorder(
    userId: number,
    date: string,
    taskIds: number[],
  ): Promise<Task[]> {
    const updates = taskIds.map((id, index) =>
      this.taskRepository.update({ id, userId }, { position: index }),
    );
    await Promise.all(updates);
    return this.findScheduledForDate(userId, date);
  }

  /**
   * Search user's tasks by title (for prerequisite linking UI).
   * Excludes the given task ID (can't be its own prerequisite).
   */
  async searchForPrerequisites(
    userId: number,
    query: string,
    excludeId?: number,
  ): Promise<Task[]> {
    const qb = this.taskRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .andWhere('task.title LIKE :query', { query: `%${query}%` })
      .orderBy('task.updatedAt', 'DESC')
      .limit(10);

    if (excludeId) {
      qb.andWhere('task.id != :excludeId', { excludeId });
    }

    return qb.getMany();
  }
}
