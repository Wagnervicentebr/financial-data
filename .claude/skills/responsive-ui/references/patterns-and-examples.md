# Responsive Patterns and Examples

## Strategy A — Inline Tailwind

Use for minor responsive tweaks in a single component.

```tsx
export const PageHeader = ({ title }: { title: string }) => (
  <header className="flex flex-col gap-2 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6">
    <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
    <div className="flex gap-2">
      <Button size="sm" className="md:size-default">Action</Button>
    </div>
  </header>
);
```

## Strategy B — Conditional JSX

Use when layout structure differs but data is the same.

```tsx
'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { CandidateTableDesktop } from './CandidateTableDesktop';
import { CandidateListMobile } from './CandidateListMobile';

export const CandidateList = ({ candidates }: CandidateListProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return <CandidateListMobile candidates={candidates} />;
  }

  return <CandidateTableDesktop candidates={candidates} />;
};
```

## Strategy D — Responsive table

Desktop: shadcn `Table`. Mobile: card list.

```tsx
// Desktop
<Table>
  <TableHeader>...</TableHeader>
  <TableBody>
    {rows.map((row) => (
      <TableRow key={row.id}>...</TableRow>
    ))}
  </TableBody>
</Table>

// Mobile
<div className="space-y-3 md:hidden">
  {rows.map((row) => (
    <Card key={row.id}>
      <CardContent className="p-4">...</CardContent>
    </Card>
  ))}
</div>
```

## Filter Sheet pattern

```tsx
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export const JobFilterSheet = () => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" size="sm" className="md:size-default">
        Filter
      </Button>
    </SheetTrigger>
    <SheetContent className="w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Filter jobs</SheetTitle>
      </SheetHeader>
      <JobFilterForm />
    </SheetContent>
  </Sheet>
);
```

## File naming

| Scope | Convention | Example |
| ----- | ---------- | ------- |
| Route components | PascalCase | `CandidateTableDesktop.tsx`, `CandidateListMobile.tsx` |
| Shared components | PascalCase folder | `components/DataTable/` |

New code in a folder should **match siblings** in that folder.
