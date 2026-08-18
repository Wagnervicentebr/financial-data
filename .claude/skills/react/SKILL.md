---
name: react
description: >-
  Applies React and Next.js UI patterns (shadcn/ui, Tailwind, Server/Client Components, hooks). Use when building or reviewing components, pages, hooks, or state in src/app or src/features.
---

# React + Next.js

## Componentes Funcionais

Use somente componentes funcionais.
Não use classes React.

**Exemplo:**

```tsx
import { Button } from '@/components/ui/button';

// ❌ Evite
class UserProfile extends React.Component {
  render() {
    return <span>{this.props.name}</span>;
  }
}

// ✅ Prefira
const UserProfile = ({ name }: { name: string }) => {
  return <span>{name}</span>;
};
```

## Server vs Client Components

Server Components são o padrão. Adicione `'use client'` apenas quando necessário.

```tsx
// ✅ Server Component (padrão) — busca dados no servidor
// src/app/(dashboard)/candidates/page.tsx
import { getCandidates } from '@/features/candidates/queries';
import { CandidateList } from './_components/CandidateList';

export default async function CandidatesPage() {
  const candidates = await getCandidates();
  return <CandidateList candidates={candidates} />;
}

// ✅ Client Component — interatividade
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const CandidateFilters = () => {
  const [isOpen, setIsOpen] = useState(false);
  return <Button onClick={() => setIsOpen(true)}>Filter</Button>;
};
```

**Quando usar `'use client'`:**
- `useState`, `useEffect`, `useReducer`
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`window`, `localStorage`)
- Hooks de bibliotecas client-only (React Query, react-hook-form)

## TypeScript

Utilize TypeScript e a extensão `.tsx` para os componentes.

```tsx
// CandidateCard.tsx
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

interface CandidateCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
}

export const CandidateCard = ({ name, email, avatarUrl }: CandidateCardProps) => {
  return (
    <Card>
      <CardHeader>
        {avatarUrl && <img src={avatarUrl} alt={name} className="h-10 w-10 rounded-full" />}
        <CardTitle>{name}</CardTitle>
        <p className="text-sm text-muted-foreground">{email}</p>
      </CardHeader>
    </Card>
  );
};
```

## Modais (Dialog / Sheet / AlertDialog)

Modais de filtro, formulário e confirmação usam shadcn:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CandidateFilterForm } from './CandidateFilterForm';

export const CandidateFilterSheet = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Filter</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter candidates</SheetTitle>
        </SheetHeader>
        <CandidateFilterForm onApply={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};
```

Largura/direção responsiva → `@responsive-ui`.

## Estado Local

Mantenha o estado do componente o mais próximo possível de onde ele será usado.

```tsx
// ❌ Evite — estado no pai quando só é usado no filho
const ParentComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <UserProfile />
      <Settings isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

// ✅ Prefira — estado no componente que realmente usa
const Settings = () => {
  const [isOpen, setIsOpen] = useState(false);
  // usa o estado aqui
};
```

## Passagem de Props

Passe propriedades de forma explícita entre componentes. Evite spread operator como `<ComponentName {...props} />`.

## Tamanho dos Componentes

Evite componentes muito grandes, acima de 300 linhas.

```tsx
// ✅ Prefira — dividir em componentes menores
export default function CandidatesPage() {
  return (
    <div className="flex flex-col gap-4">
      <CandidateHeader />
      <CandidateFilters />
      <CandidateList />
    </div>
  );
}
```

## Context API

Use **React Query** ou **Server Components** para dados de servidor.
Use **Context API** apenas para estado compartilhado dentro de uma feature ou árvore específica (wizard, filtros locais).

```tsx
// ✅ Exemplo válido de Context — wizard dentro de uma feature
interface WizardContextType {
  step: number;
  nextStep: () => void;
  prevStep: () => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);
```

## Estilização

Utilize **Tailwind CSS** para estilizar componentes. Use `cn()` para merge condicional.

```tsx
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ✅ Prefira
export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        status === 'active' && 'bg-green-100 text-green-800',
        status === 'inactive' && 'bg-gray-100 text-gray-800',
        className
      )}
    >
      {status}
    </span>
  );
};

// ❌ Evite
const Card = ({ title }: { title: string }) => (
  <div style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 8 }}>
    <span style={{ fontSize: 14, color: '#333' }}>{title}</span>
  </div>
);
```

## Granularidade de Componentes

Evite o excesso de componentes pequenos.

## Performance com useMemo

Utilize `useMemo` para evitar cálculos desnecessários entre renderizações.

```tsx
'use client';

const CandidateList = ({ candidates, filter }: CandidateListProps) => {
  const filteredCandidates = useMemo(
    () =>
      candidates.filter((c) => c.name.toLowerCase().includes(filter.toLowerCase())),
    [candidates, filter]
  );

  return (
    <ul>
      {filteredCandidates.map((candidate) => (
        <li key={candidate.id}>{candidate.name}</li>
      ))}
    </ul>
  );
};
```

## Nomenclatura de Hooks

Nomeie hooks customizados com o prefixo "use": `useJobOpenings`, `useCandidateFilters`.

```tsx
// ✅ Padrão — hook de domínio com React Query
export const useJobOpenings = () => {
  return useQuery({
    queryKey: ['job-openings'],
    queryFn: fetchJobOpenings,
  });
};
```

## Bibliotecas de Componentes

Antes de criar um componente novo, verifique se já existe em `src/components/ui/` ou `src/components/`.

```
// Ordem de preferência:
// 1. src/components/ui/ (shadcn — Button, Dialog, Sheet, etc.)
// 2. src/components/ (widgets compartilhados)
// 3. Composição com Tailwind + Radix via shadcn CLI
//
// Formulários: react-hook-form + @hookform/resolvers/zod + shadcn Form
// Dados assíncronos (client): TanStack React Query
// Dados assíncronos (server): async Server Components + queries.ts
```

## TEXTOS PARA LABELS, BOTÕES E COMPONENTES COM TEXTOS VISUAIS

Evite criar constants para textos em labels, botões, títulos ou qualquer outro lugar que vá textos visuais ao usuário.

```tsx
// ❌ Evite
const LABEL_TITLE = 'Detalhes do candidato';
const BUTTON_TEXT = 'Confirmar';

// ✅ Prefira
<CardTitle>Detalhes do candidato</CardTitle>
<Button>Confirmar</Button>
```
