---
name: e2e-qa
description: >-
  Guides Playwright E2E testing for the Next.js recruitment system. Use when planning or implementing E2E tasks, tech specs, regressions, execute-task, execute-qa, or task review involving Playwright. Do not use for unit tests or exploratory browser QA via Playwright MCP only.
---

# E2E Playwright — sistema-recrutamento

## Purpose

Automated Playwright E2E tests live in this repository under `e2e/`.

## Procedures

**Step 1: Classify the work**

1. If the task is **product code** (pages, features, components), restrict changes to `src/`.
2. If the task is **Playwright E2E** (regression, new feature coverage, CRUD/list/filter flows), implement in `e2e/specs/<feature>/`.
3. If the work is **exploratory QA** via `/execute_qa`, allow Playwright MCP in the browser; persist automated specs in `e2e/`.

**Step 2: Apply repository boundaries**

1. Read `references/repo-layout.md` for folder layout and commands.
2. Specs go under `e2e/specs/<feature>/<feature>.spec.ts`.
3. Reuse `e2e/fixtures/`, `e2e/helpers/`, and `e2e/constants.ts` when applicable.
4. Avoid `data-testid` added solely for E2E unless the test genuinely needs it — prefer accessible selectors (role, label, text).

**Step 3: Implement or run E2E**

1. Start the app: `npm run dev` (default `http://localhost:3000`).
2. Configure `PLAYWRIGHT_BASE_URL` in `.env` or `.env.local` if needed.
3. Run tests: `npm run test:e2e` or `npx playwright test e2e/specs/<feature>/`.
4. Run headed (visible browser) by default unless user explicitly asks for headless.

**Step 4: Document in tech spec and tasks**

1. Under **Abordagem de testes → E2E**, reference `e2e/specs/<feature>/`.
2. List spec paths and the npm command to run the suite.
3. On task completion, confirm E2E specs cover the critical flows from the PRD.

## Error Handling

- If a task template references an external QA repo, rewrite paths to `e2e/` per `references/repo-layout.md`.
- If specs need mock reset between tests, use `page.reload()` in `beforeEach` or reset API mocks in fixtures.
- Prefer role-based selectors (`getByRole`, `getByLabel`) over brittle CSS selectors.
