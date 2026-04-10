import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { RecurringTaskService } from './recurring-task.service';
import { Task } from '../../entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TaskController],
  providers: [TaskService, RecurringTaskService],
  exports: [TaskService],
})
export class TaskModule {}
