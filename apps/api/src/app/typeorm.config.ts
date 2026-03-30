import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { environment } from '../envs/environment';
import { User } from './entities/user.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: environment.database.host,
  port: environment.database.port,
  username: environment.database.username,
  password: environment.database.password,
  database: environment.database.database,
  entities: [User],
  synchronize: environment.database.synchronize,
};
