# E2E Repository Layout

```
e2e/
├── fixtures/
│   └── setup.ts              ← shared test setup, auth helpers
├── helpers/
│   └── navigation.ts         ← reusable navigation helpers
├── constants.ts              ← base URLs, test accounts
└── specs/
    └── <feature>/
        └── <feature>.spec.ts ← feature E2E specs
```

## Commands

```bash
# Start dev server (separate terminal)
npm run dev

# Run all E2E tests
npm run test:e2e

# Run single feature
npx playwright test e2e/specs/candidates/

# Run with UI mode (debug)
npx playwright test --ui
```

## Environment

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `PLAYWRIGHT_BASE_URL` | `http://localhost:3000` | App URL under test |
| `PLAYWRIGHT_EMAIL` | — | Test user email (if auth required) |
| `PLAYWRIGHT_PASSWORD` | — | Test user password (if auth required) |

Store secrets in `.env.local` — never commit credentials.

## Spec template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Candidates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/candidates');
  });

  test('should display candidate list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Candidates' })).toBeVisible();
  });
});
```

## Boundaries

- **Product code:** `src/` only
- **E2E specs:** `e2e/` only
- Do not add E2E hooks to production code (`window.__*E2E*`) unless explicitly required
