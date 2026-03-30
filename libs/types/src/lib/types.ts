export interface IBackendConfig {
  production: boolean;
  port: number;
  url: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    xsrfSecret: string;
    accessExpiry: string;
    refreshExpiry: string;
    longAccessExpiry: string;
    longRefreshExpiry: string;
  };
  email?: {
    apiKey: string;
    from: string;
  };
  cors: {
    origins: string[];
  };
}

export interface IFrontendConfig {
  production: boolean;
  apiUrl: string;
  appName: string;
  url: string;
}
