import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { environment } from '../envs/environment';
import { User } from './entities/user.entity';
import { Task } from './entities/task.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: environment.database.host,
  port: environment.database.port,
  username: environment.database.username,
  password: environment.database.password,
  database: environment.database.database,
  entities: [User, Task],
  synchronize: environment.database.synchronize,
};
