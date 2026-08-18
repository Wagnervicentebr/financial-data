---
name: code-standards
description: >-
  Enforces coding standards for the recruitment system (English code, naming, TypeScript, Next.js structure, lint). Use when writing or reviewing code, refactoring, or validating PR checklist items.
---

# Coding Standards - Recruitment System Frontend

## Purpose

This document defines the coding standards for the recruitment system (Next.js + React + Tailwind + shadcn/ui).
The rules below are mandatory for new code and relevant refactors.

## Repository Scope

- Next.js application with App Router
- Source in `src/app/`, `src/features/`, `src/components/`, `src/lib/`
- E2E tests in `e2e/specs/` (Playwright — attach `@e2e-qa`)

## Language

All source code must be written in English, including variable names, functions, classes, types, tests, and comments.
User-facing error messages may be in Portuguese when required by the product.

**Example:**

```typescript
// ❌ Avoid
const nomeCandidato = 'Maria';
function buscarVagas() {}

// ✅ Prefer
const candidateName = 'Maria';
function fetchJobOpenings() {}
```

## Naming Conventions

### camelCase

Use for variables, functions, and properties.

```typescript
const selectedCandidateId = '123';
const isFilterVisible = true;
const fetchJobOpenings = async () => {};
```

### PascalCase

Use for React components, types, interfaces, enums, and classes.

```typescript
interface JobOpening {}
type CandidateStatus = 'active' | 'inactive';
function CandidateCard() {}
```

### Files and folders

Follow the existing pattern in each module and maintain local consistency:

- React components: `PascalCase` for component files/folders
- Routes: `kebab-case` in `src/app/`
- Feature folders: `camelCase` in `src/features/`
- Avoid introducing a new pattern within the same folder

## TypeScript

- All new code must be in TypeScript (`.ts` or `.tsx`)
- Avoid `any`; prefer explicit types and `unknown` when necessary
- Model data contracts with `type`/`interface` close to usage
- Use `zod` for payload validation when applicable

## React and Next.js

- Use functional components only
- Prefer arrow functions (aligned with ESLint `func-style`)
- Server Components by default; `'use client'` only when needed
- Keep state as close as possible to where it is consumed
- Extract hooks for reusable logic
- Avoid components above 300 lines; extract UI/logic blocks

**Example:**

```tsx
// ✅ Prefer — Server Component
import { getCandidates } from '@/features/candidates/queries';
import { CandidateTable } from './_components/CandidateTable';

export default async function CandidatesPage() {
  const candidates = await getCandidates();
  return <CandidateTable candidates={candidates} />;
}
```

## Domain Structure

- Organize by domain/feature in `src/features/<feature>/`, not by global technical type
- Follow the existing convention in `app`, `features`, `hooks`, and `components`
- Centralize public exports in `index.ts` for each reusable module
- Do not create new abstractions without real reuse need

## Functions and Methods

- Name always with a verb: `get`, `fetch`, `build`, `validate`, `map`, `normalize`
- Each function must have a clear, single responsibility
- Avoid more than 3 positional parameters; prefer an object for multiple parameters
- Prefer early return to reduce nesting

## State and Side Effects

- Server data: fetch in Server Components or via React Query on client
- Server Actions for mutations; revalidate cache after writes
- Effects (`useEffect`) must have complete dependencies (`react-hooks/exhaustive-deps`)

## Services and Data Layer

- API calls centralized in `src/lib/api/` or `src/features/<feature>/queries.ts`
- Wrappers/normalizers live in feature layers (`src/features/<feature>/`)
- Every external integration must handle errors and null returns explicitly

## Formatting and Lint

Official repository standard:

- Prettier: `printWidth: 100`, `tabWidth: 2`, `singleQuote: true`, `trailingComma: es5`
- ESLint with Next.js config (`eslint-config-next`)

Before finishing changes:

- Run **scoped ESLint** on the paths you edited — **never** global lint/format at root:

  ```bash
  npx eslint --ext .ts,.tsx src/features/<feature>/
  npx eslint --ext .ts,.tsx src/app/(dashboard)/<route>/
  ```

  List every directory/file changed in the task.

- **Playwright E2E:** run in `e2e/` (`npm run test:e2e`)

## Imports and Dependencies

- Prefer named and explicit imports
- Use path alias `@/` for `src/` imports
- Remove unused imports
- Avoid new libraries without proven need
- Reuse existing utilities in `src/lib/` before duplicating logic
- Prefer `date-fns` helpers for date operations

## Styling in UI

- Use Tailwind CSS utility classes for all styling
- Use `cn()` from `@/lib/utils` for conditional class merging
- Follow shadcn theming via CSS variables — do not hardcode colors
- Extend shadcn components via `className`, do not duplicate primitives

## Constants and Magic Numbers

- Extract fixed values into named constants
- Centralize domain constants in `constants.ts` when reused
- **Exported constants use camelCase** — same rule as variables and functions
- **PascalCase** is reserved for React components, types, and interfaces
- Prefer descriptive camelCase names: `jobStatusLabels`, `defaultPageSize`, `screenName`

```typescript
// ✅ Prefer
export const jobStatusLabels = { open: 'Aberta', closed: 'Fechada' };
export const defaultPageSize = 20;

// ❌ Avoid
export const JOB_STATUS_LABELS = { open: 'Aberta', closed: 'Fechada' };
```

## Comments

- Prefer self-explanatory code
- Comments should explain business context, decisions, or non-obvious technical constraints
- Do not use comments to describe what the line already makes clear

## Security and Sensitive Data

- Never commit secrets or tokens
- Do not log sensitive data in production
- Use environment variables for secrets (`NEXT_PUBLIC_*` only for client-safe values)

## Pull Request Checklist

- Code in English and typed
- Followed local pattern of the changed module
- Server/Client Component boundaries respected
- Modals use shadcn Dialog/Sheet/AlertDialog appropriately
- No new warnings/lint errors
- E2E updated when applicable
- No manual changes to auto-generated shadcn files without reason
