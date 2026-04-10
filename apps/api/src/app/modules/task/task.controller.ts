import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ICreateTaskRequest, IUpdateTaskRequest } from '@app/interfaces';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('daily')
  async getDailyTasks(
    @CurrentUser('id') userId: number,
    @Query('date') date: string,
  ) {
    const taskDate = date || new Date().toISOString().split('T')[0];
    return this.taskService.findScheduledForDate(userId, taskDate);
  }

  @Get('backlog')
  async getBacklog(@CurrentUser('id') userId: number) {
    const today = new Date().toISOString().split('T')[0];
    return this.taskService.findBacklog(userId, today);
  }

  @Get('search')
  async searchTasks(
    @CurrentUser('id') userId: number,
    @Query('q') query: string,
    @Query('excludeId') excludeId?: string,
  ) {
    return this.taskService.searchForPrerequisites(
      userId,
      query || '',
      excludeId ? parseInt(excludeId, 10) : undefined,
    );
  }

  @Get('focus')
  async getFocusTask(
    @CurrentUser('id') userId: number,
    @Query('date') date: string,
  ) {
    const taskDate = date || new Date().toISOString().split('T')[0];
    return this.taskService.getNextTodo(userId, taskDate);
  }

  @Post()
  async createTask(
    @CurrentUser('id') userId: number,
    @Body() body: ICreateTaskRequest,
  ) {
    return this.taskService.create(userId, body);
  }

  @Patch(':id/schedule')
  async scheduleTask(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { date: string },
  ) {
    return this.taskService.scheduleForDate(id, userId, body.date);
  }

  @Patch(':id/unschedule')
  async unscheduleTask(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.taskService.unschedule(id, userId);
  }

  @Patch('reorder')
  async reorderTasks(
    @CurrentUser('id') userId: number,
    @Query('date') date: string,
    @Body() body: { taskIds: number[] },
  ) {
    const taskDate = date || new Date().toISOString().split('T')[0];
    return this.taskService.reorder(userId, taskDate, body.taskIds);
  }

  @Patch(':id')
  async updateTask(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: IUpdateTaskRequest,
  ) {
    return this.taskService.update(id, userId, body);
  }

  @Delete(':id')
  async deleteTask(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.taskService.delete(id, userId);
    return { success: true };
  }
}
