# Nx Fullstack Template

An opinionated Nx monorepo starter with Angular, NestJS, NgRx, and a design system - ready to build on.

## What's Included

### Apps

| App | Tech | Port | Description |
|-----|------|------|-------------|
| **frontend** | Angular 21 | 4200 | Standalone components, signals, NgRx, Tailwind CSS |
| **api** | NestJS 11 | 3000 | JWT auth, TypeORM, MySQL, role-based access |

### Libraries

| Library | Import | Description |
|---------|--------|-------------|
| **design-system** | `@app/design-system` | 13 reusable `ds-*` UI components + design tokens |
| **interfaces** | `@app/interfaces` | Shared data contracts (IUser, IAuthTokens, etc.) |
| **types** | `@app/types` | Config interfaces (IBackendConfig, IFrontendConfig) |

### Auth System (fully wired)

- JWT access tokens (Bearer header) + refresh tokens (httpOnly cookies) + XSRF protection
- `@Public()`, `@Roles()`, `@CurrentUser()` decorators
- Global `JwtAuthGuard` + `RolesGuard`
- Frontend NgRx auth store with login/signup/logout/refresh flows
- Token interceptor with automatic 401 retry
- Route guards (`authGuard`, `guestGuard`, `roleGuard`)

### Design System Components

`ds-button` | `ds-icon-button` | `ds-text-input` | `ds-select` | `ds-toggle` | `ds-checkbox` | `ds-badge` | `ds-modal` | `ds-avatar` | `ds-tabs` | `ds-skeleton` | `ds-alert` | `ds-toast-container` + `ToastService`

All components use Angular signals, standalone architecture, external HTML/SCSS files, and the `ds-` prefix.

## Quick Start

### Prerequisites

- Node.js 20+
- MySQL 8+

### Setup

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env
# Edit .env with your database credentials and JWT secrets

# Create the database
mysql -u root -e "CREATE DATABASE app_dev;"

# Start the API (port 3000)
npm run start:api

# Start the frontend (port 4200, proxied to API)
npm run start:frontend
```

### Available Scripts

```bash
npm run start:api          # Dev server for NestJS API
npm run start:frontend     # Dev server for Angular frontend
npm run build:api          # Production build for API
npm run build:frontend     # Production build for frontend
npm run test:api           # Run API tests
npm run test:frontend      # Run frontend tests
npm run lint               # Lint all projects
```

## Project Structure

```
apps/
  api/
    src/
      app/
        entities/              # TypeORM entities (User)
        modules/
          auth/                # Auth module
            guards/            #   JwtAuthGuard, RolesGuard, XsrfGuard
            strategies/        #   JWT + refresh token Passport strategies
            decorators/        #   @Public, @Roles, @CurrentUser
            auth.controller.ts #   Login, signup, refresh, logout, me
            auth.service.ts    #   Token creation, password hashing
          user/                # User CRUD module
        typeorm.config.ts      # Database configuration
      envs/                    # Environment configs (process.env pattern)
      main.ts                  # Bootstrap with Helmet, CORS, cookies
  frontend/
    src/
      app/
        auth/                  # Login & signup pages
        home/                  # Authenticated dashboard
        shared/
          guards/              # authGuard, guestGuard, roleGuard
          interceptors/        # Token interceptor (Bearer + XSRF + 401 refresh)
        store/
          auth/                # NgRx auth store (actions, reducer, effects, selectors)
      envs/                    # Frontend environment configs
    proxy.conf.json            # /api -> localhost:3000

libs/
  design-system/
    src/lib/
      components/              # 13 ds-* components
      tokens/                  # CSS custom properties (colors, typography, spacing)
  interfaces/                  # Shared data interfaces
  types/                       # Config type definitions
```

## Conventions

- **Angular**: Standalone components, signals (`input()`, `output()`, `signal()`), new control flow (`@if`, `@for`), external HTML templates, SCSS stylesheets
- **State**: NgRx for shared/API state, signals for local UI state
- **API**: `process.env.VAR || default` for all config values, shared interfaces for API contracts
- **Design System**: Always check for existing `ds-*` components before writing custom UI

See [CLAUDE.md](CLAUDE.md) for detailed development guidelines.

## Customizing for Your Project

1. **Rename the app prefix**: Update `@app/` in `tsconfig.base.json` paths and imports
2. **Add new entities**: Create in `apps/api/src/app/entities/`, register in `typeorm.config.ts`
3. **Add new API modules**: Use `npx nx g @nx/nest:module <name> --directory=apps/api/src/app/modules/<name>`
4. **Add new NgRx stores**: Follow the pattern in `apps/frontend/src/app/store/auth/`
5. **Add new DS components**: Create in `libs/design-system/src/lib/components/`, export from `index.ts`
6. **Add new pages**: Lazy-load in `apps/frontend/src/app/app.routes.ts`
