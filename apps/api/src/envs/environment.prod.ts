import { IBackendConfig } from '@app/types';

export const environment: IBackendConfig = {
  production: true,
  port: parseInt(process.env.PORT, 10) || 3000,
  url: process.env.APP_URL || 'https://yourapp.com',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'me_prod',
    synchronize: false,
  },
  jwt: {
    secret: process.env.JWT_SECRET || undefined,
    refreshSecret: process.env.JWT_REFRESH_SECRET || undefined,
    xsrfSecret: process.env.JWT_XSRF_SECRET || undefined,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '1d',
    longAccessExpiry: process.env.JWT_LONG_ACCESS_EXPIRY || '30d',
    longRefreshExpiry: process.env.JWT_LONG_REFRESH_EXPIRY || '90d',
  },
  cors: {
    origins: (process.env.CORS_ORIGINS || 'https://yourapp.com').split(','),
  },
};
