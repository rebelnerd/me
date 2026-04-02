import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { Task } from '../../entities/task.entity';
import {
  TaskStatus,
  TaskPriority,
  ICreateTaskRequest,
  IUpdateTaskRequest,
} from '@app/interfaces';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  /**
   * Get tasks scheduled for a specific date + any unscheduled tasks
   * whose dueDate matches (auto-focus).
   */
  async findScheduledForDate(userId: number, date: string): Promise<Task[]> {
    return this.taskRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .andWhere(
        '(task.scheduledDate = :date OR (task.scheduledDate IS NULL AND task.dueDate = :date))',
        { date },
      )
      .orderBy('task.position', 'ASC')
      .getMany();
  }

  /**
   * Get backlog tasks: no scheduledDate, not done, and dueDate is not today
   * (those with today's dueDate show in the daily view instead).
   */
  async findBacklog(userId: number, today: string): Promise<Task[]> {
    return this.taskRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .andWhere('task.scheduledDate IS NULL')
      .andWhere('task.status = :status', { status: TaskStatus.Todo })
      .andWhere('(task.dueDate IS NULL OR task.dueDate != :today)', { today })
      .orderBy('task.createdAt', 'DESC')
      .getMany();
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
   * Get next uncompleted task for the focus view.
   * Scheduled for date OR due today (auto-focused).
   */
  async getNextTodo(userId: number, date: string): Promise<Task | null> {
    return this.taskRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId })
      .andWhere('task.status = :status', { status: TaskStatus.Todo })
      .andWhere(
        '(task.scheduledDate = :date OR (task.scheduledDate IS NULL AND task.dueDate = :date))',
        { date },
      )
      .orderBy('task.position', 'ASC')
      .getOne();
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

    const task = this.taskRepository.create({
      title: data.title,
      description: data.description || null,
      notes: data.notes || null,
      status: TaskStatus.Todo,
      priority: data.priority || TaskPriority.None,
      dueDate: data.dueDate || null,
      tags: data.tags || [],
      scheduledDate,
      position,
      userId,
    });

    return this.taskRepository.save(task);
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
    return this.taskRepository.save(task);
  }

  /**
   * Unschedule a task back to the backlog.
   */
  async unschedule(id: number, userId: number): Promise<Task> {
    const task = await this.findById(id, userId);
    task.scheduledDate = null;
    return this.taskRepository.save(task);
  }

  async update(
    id: number,
    userId: number,
    data: IUpdateTaskRequest,
  ): Promise<Task> {
    const task = await this.findById(id, userId);
    Object.assign(task, data);
    return this.taskRepository.save(task);
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
}
