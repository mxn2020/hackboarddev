# ESLint Configuration

This project uses ESLint for code quality and consistency, similar to Next.js projects.

## Features

- **Real-time linting** during development with Vite
- **TypeScript support** with strict type checking
- **React Hooks** rules for proper hook usage
- **Auto-fixing** for many common issues
- **Pre-commit hooks** to prevent bad code from being committed
- **VS Code integration** with automatic fixes on save

## Scripts

- `npm run lint` - Run ESLint with strict settings (no warnings allowed)
- `npm run lint:check` - Check for lint errors without fixing
- `npm run lint:fix` - Automatically fix fixable lint issues
- `npm run type-check` - Run TypeScript type checking without emitting files

## Rules Configured

### TypeScript Rules
- Unused variables detection
- `any` type warnings
- Non-null assertion warnings

### React Rules
- React Hooks rules enforcement
- Fast refresh component export warnings
- Proper dependency arrays for useEffect

### Code Quality Rules
- Console statement restrictions (only `console.warn` and `console.error` allowed)
- No debugger statements
- Prefer const over let
- No duplicate imports

## IDE Integration

### VS Code
The project includes VS Code settings that:
- Auto-fix ESLint issues on save
- Show lint errors in real-time
- Provide proper TypeScript support

### Recommended Extensions
- ESLint
- TypeScript
- Prettier (if using)
- Tailwind CSS IntelliSense

## Pre-commit Hooks

The project uses Husky and lint-staged to:
- Run ESLint on staged files before commit
- Automatically fix fixable issues
- Prevent commits with lint errors

## During Development

ESLint runs automatically when you start the dev server:
```bash
npm run dev:vite
```

You'll see lint errors and warnings in:
- Terminal output
- VS Code Problems panel
- Browser developer tools (as warnings)

## Build Process

The build will fail if there are any ESLint errors in production mode:
```bash
npm run build
```

This ensures code quality in production deployments.
