# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Nx monorepo template with:
- **frontend**: Angular v21 application (standalone components, signals, NgRx)
- **api**: NestJS backend with JWT auth, TypeORM, MySQL
- **design-system**: Shared UI components (`ds-*` prefix)
- **types**: Shared TypeScript configuration types
- **interfaces**: Shared data interfaces

## Development Commands

```bash
# Run API (port 3000)
npm run start:api

# Run frontend (port 4200, proxied to API)
npm run start:frontend

# Build for production
npm run build:api
npm run build:frontend

# Test
npm run test:api
npm run test:frontend

# Lint all
npm run lint
```

## Architecture

### Monorepo Structure

```
apps/
  api/                    - NestJS backend
    src/app/
      entities/           - TypeORM entities
      modules/
        auth/             - JWT auth (guards, strategies, decorators)
        user/             - User CRUD
      typeorm.config.ts   - Database configuration
    src/envs/             - Environment configs (process.env pattern)
  frontend/               - Angular application
    src/app/
      auth/               - Login/signup pages
      home/               - Authenticated home page
      shared/
        guards/           - Route guards (auth, role)
        interceptors/     - Token interceptor
      store/
        auth/             - NgRx auth store (actions, reducer, effects, selectors)

libs/
  design-system/          - ds-* UI components + design tokens
  types/                  - IBackendConfig, IFrontendConfig
  interfaces/             - IUser, IAuthTokens, ILoginRequest, etc.
```

### Path Aliases (tsconfig.base.json)

```typescript
"@app/types": ["libs/types/src/index.ts"]
"@app/interfaces": ["libs/interfaces/src/index.ts"]
"@app/design-system": ["libs/design-system/src/index.ts"]
```

## Angular v21 Development Guidelines

### Component Structure

All components MUST follow this structure:
- **Standalone components** only (no NgModules)
- **External HTML templates** - use `templateUrl`, NEVER inline `template` strings
- **External SCSS stylesheets** - use `styleUrl`, NEVER inline `styles` arrays
- **Signal-based APIs**: Use `input()`, `output()`, `signal()`, `computed()`, `effect()`
- **Dependency injection**: Prefer `inject()` over constructor injection
- **New control flow**: Use `@if`, `@for`, `@switch` (NEVER `*ngIf`, `*ngFor`, `*ngSwitch`)

```typescript
import { Component, input, output, signal, computed, inject } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [...],
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',
})
export class ExampleComponent {
  // Dependency injection via inject()
  private store = inject(Store);

  // Signal inputs/outputs
  title = input<string>('');
  disabled = input<boolean>(false);
  clicked = output<void>();

  // Reactive state
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);
}
```

### Template Syntax

```html
<!-- New control flow syntax -->
@if (condition()) {
  <div>Show this</div>
} @else {
  <div>Show that</div>
}

@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

@switch (status()) {
  @case ('pending') { <span>Pending</span> }
  @case ('complete') { <span>Complete</span> }
  @default { <span>Unknown</span> }
}

<!-- Signal inputs called with parentheses -->
<div>{{ title() }}</div>
```

### Best Practices

- Always use standalone components
- Use signals for reactive state
- Prefer OnPush change detection strategy
- Use external HTML templates (NEVER inline template strings)
- Use external SCSS stylesheets (NEVER inline styles arrays)
- Import from `@angular/core` for signals
- Use meaningful component and variable names

## NgRx State Management Guidelines

**IMPORTANT:** Use NgRx for any state that:
- Is shared between components
- Needs to persist across route changes
- Involves API data that multiple components consume
- Represents application-wide state (user, auth, etc.)

### NgRx File Structure

Each feature store follows this pattern:
```
apps/frontend/src/app/store/<feature>/
├── <feature>.actions.ts    # createActionGroup
├── <feature>.effects.ts    # createEffect
├── <feature>.reducer.ts    # createReducer
├── <feature>.selectors.ts  # createFeatureSelector + createSelector
├── <feature>.service.ts    # HTTP service for API calls
├── <feature>.state.ts      # State interface and initial state
└── index.ts                # Barrel export
```

### Component Usage

```typescript
// Use inject() + toSignal for reactive state from store
private store = inject(Store);
applications = toSignal(this.store.select(selectApplications), { initialValue: [] });

// Dispatch actions to trigger state changes
this.store.dispatch(Actions.load({ id: this.id }));
```

### When NOT to Use NgRx

- Purely local UI state (form validation, modal open/closed, selected tab)
- Component-specific state that no other component needs

## Frontend/API Separation of Concerns

**Business logic belongs in the API, not the frontend.**

### What Belongs in the API

- Financial calculations, permission checks, eligibility logic
- Status derivations, data aggregations, workflow state

### What Belongs in the Frontend

- Pure presentation (number formatting, date display)
- UI state (modal open/closed, selected tab)
- Form validation UX (but API must re-validate)

## NestJS API Guidelines

- **Auth**: JWT access + refresh (httpOnly cookie) + XSRF tokens
- **Guards**: JwtAuthGuard (global), RolesGuard (global), XsrfGuard (opt-in)
- **Decorators**: `@Public()`, `@Roles(...)`, `@CurrentUser()`
- **Environments**: Always use `process.env.VAR || default` pattern

### API Environment Variables Pattern (IMPORTANT)

**All configurable values in API environment files MUST use `process.env` with fallback defaults:**

```typescript
// CORRECT
trackingLinkDomain: process.env.TRACKING_LINK_DOMAIN || 'https://example.com',

// INCORRECT - hardcoded without env var support
trackingLinkDomain: 'https://example.com',
```

### Database

- TypeORM with MySQL
- Entity synchronize enabled in dev (disabled in prod)
- Config: `apps/api/src/app/typeorm.config.ts`

## Shared Interfaces (IMPORTANT)

**When data structures are used by BOTH the API and frontend, define them in `@app/interfaces` or `@app/types`.**

Do NOT duplicate interfaces - if you find yourself copying an interface from backend to frontend, move it to the shared library.

## Design System Components

**CRITICAL:** Before creating ANY custom UI element, ALWAYS check if a design system component exists first. Never write custom HTML/CSS for patterns the design system provides.

### Design System First Rule

| Need | Use | Don't Write Custom |
|------|-----|-------------------|
| Buttons | `ds-button` | Custom `.btn-*` classes |
| Icon buttons | `ds-icon-button` | Custom icon button CSS |
| Modals | `ds-modal` | Custom `.modal-*` styles |
| Status indicators | `ds-badge` | Custom `.status-pill` classes |
| Form inputs | `ds-text-input`, `ds-select` | Custom input styling |
| Checkboxes/toggles | `ds-checkbox`, `ds-toggle` | Custom checkbox CSS |
| Avatars | `ds-avatar` | Custom avatar styles |
| Tabs | `ds-tabs` | Custom tab implementations |

### Icon Button Rule (CRITICAL)

**NEVER** create a button with a lucide-icon inside manually. ALWAYS use `ds-icon-button`.

```html
<!-- BAD -->
<button class="icon-btn" (click)="onClick()">
  <lucide-icon [img]="uploadIcon" [size]="18"></lucide-icon>
</button>

<!-- GOOD -->
<ds-icon-button variant="outline" shape="square" size="sm" [icon]="uploadIcon" ariaLabel="Upload" (clicked)="onClick()" />
```

### Available Components

| Component | Selector | Features |
|-----------|----------|----------|
| Button | `ds-button` | primary, secondary, ghost, error variants; sm/md/lg |
| Icon Button | `ds-icon-button` | primary, outline, ghost, error; circle/square |
| Text Input | `ds-text-input` | ControlValueAccessor, label, error, hint |
| Select | `ds-select` | ControlValueAccessor, options, placeholder |
| Toggle | `ds-toggle` | ControlValueAccessor |
| Checkbox | `ds-checkbox` | ControlValueAccessor |
| Badge | `ds-badge` | default, primary, success, warning, error |
| Modal | `ds-modal` | open/close, title, sizes, overlay click |
| Avatar | `ds-avatar` | Image or initials fallback |
| Tabs | `ds-tabs` | Tab list with active state |
| Skeleton | `ds-skeleton` | Loading placeholder with shimmer |
| Alert | `ds-alert` | info, success, warning, error; dismissible |
| Toast | `ToastService` | success/error/warning/info notifications |

## Code Quality Guidelines

### File Size Limits

- **TypeScript files**: Aim for under **1,000 lines** per component
- **HTML templates**: Aim for under **500 lines** per template
- **CSS files**: Aim for under **1,000 lines** per stylesheet

### CSS Anti-Patterns to Avoid

1. Repeated font-family declarations - Use typography utility classes or CSS variables
2. Custom modal/dialog styling - Use `ds-modal`
3. Custom button variants - Use `ds-button` with variant prop
4. Inline icon button styles - Use `ds-icon-button`
5. Per-component status pill colors - Use `ds-badge`

## Environment Setup

1. Copy `.env.example` to `.env`
2. Set up MySQL database
3. Update JWT secrets for production
