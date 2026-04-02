import { IBackendConfig } from '@app/types';

export const environment: IBackendConfig = {
  production: false,
  port: parseInt(process.env.PORT, 10) || 3000,
  url: process.env.APP_URL || 'http://localhost:4200',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'redengine',
    database: process.env.DB_DATABASE || 'me_dev',
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || true,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    xsrfSecret: process.env.JWT_XSRF_SECRET || 'dev-xsrf-secret-change-me',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '1d',
    longAccessExpiry: process.env.JWT_LONG_ACCESS_EXPIRY || '30d',
    longRefreshExpiry: process.env.JWT_LONG_REFRESH_EXPIRY || '90d',
  },
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:4200').split(','),
  },
};
