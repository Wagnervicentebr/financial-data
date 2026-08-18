---
name: responsive-ui
description: >-
  Guides mobile, tablet, and desktop UI for the Next.js recruitment system:
  Tailwind breakpoints, responsive grids/tables, Sheet vs Dialog/Drawer by viewport.
  Use when implementing or reviewing responsive layouts in src/app or src/components.
  Do not use for backend-only tasks, server-only changes, or features with no viewport-specific UI.
---

# Responsividade — Next.js + Tailwind

One codebase serves **mobile**, **tablet**, and **desktop**. Follow existing patterns in the target feature before adding new ones.

## Step 1: Classify the change

| Change size | Strategy | Action |
| ----------- | -------- | ------ |
| Minor (padding, hide/show, icon vs button) | **A — Inline** | Single file + Tailwind responsive classes (`hidden md:block`) |
| Different layout, same data | **B — Switch JSX** | Parent component + conditional render or `md:`/`lg:` variants |
| Very different UI per device | **C — Split components** | `<FeatureMobile />` / `<FeatureDesktop />` wired in parent |
| Data table with column/card variants | **D — Responsive table** | Desktop `Table`; mobile card list |

Read `references/patterns-and-examples.md` for concrete examples before coding.

## Step 2: Pick the API

| Need | Tool | Use |
| ---- | ---- | --- |
| Responsive spacing/sizing | Tailwind breakpoints | `sm:`, `md:`, `lg:`, `xl:`, `2xl:` |
| Show/hide by viewport | Tailwind display | `hidden md:flex`, `block lg:hidden` |
| Responsive grid | Tailwind grid | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| JS breakpoint check (rare) | `useMediaQuery` hook | Only when CSS alone is insufficient |

Read `references/breakpoints.md` for default Tailwind breakpoints.

## Step 3: Implement

1. Locate the closest existing feature with similar responsive needs.
2. Mirror its breakpoint usage — stay consistent within a feature.
3. Keep **data fetching** in Server Components or parent; responsive variants stay presentational.
4. For tables: desktop uses shadcn `Table`; mobile uses card layout.
5. For **filter modals**: use `Sheet` (side panel) on desktop/tablet, `Drawer` on mobile when UX differs.
6. Use Tailwind spacing scale (`p-4`, `gap-6`, `space-y-4`); avoid magic pixel values.

## Step 4: Verify

- Resize behavior: mobile (`< md`), tablet (`md`–`lg`), desktop (`≥ lg`).
- Shared props reach all variants; no duplicated data fetching in each variant.
- Run scoped ESLint on the responsive files you changed:

  ```bash
  npx eslint --ext .ts,.tsx src/app/(dashboard)/<feature>/
  ```

## Quick recipes

```tsx
// Show/hide by viewport
<Button className="md:hidden">Menu</Button>
<nav className="hidden md:flex">...</nav>

// Responsive grid
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {items.map((item) => <Card key={item.id} {...item} />)}
</div>

// Sheet on desktop, Drawer on mobile
const isMobile = useMediaQuery('(max-width: 768px)');
return isMobile ? <FilterDrawer {...props} /> : <FilterSheet {...props} />;
```

## Error handling

- **Mixed breakpoint keys:** Stay consistent within a feature; prefer Tailwind classes over JS checks.
- **Unclear desktop threshold:** Grep the feature folder for `md:` / `lg:` usage and copy that mapping.
- **Modal too wide on mobile:** Use `Sheet` with `w-full sm:max-w-md` or switch to `Drawer`.

## Related

- Folder layout: `docs/rules`
- Components & hooks: `@react`
- Stack & lint: `@system-rules`
