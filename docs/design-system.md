# Design System — Casca Premium

Este documento registra as decisões de design tomadas **antes** do código. Todo componente novo deve seguir estes tokens — nenhuma tela deve introduzir cor, fonte, raio ou espaçamento fora do que está aqui.

## 1. Paleta de cores

Tema **escuro por padrão** (toggle para claro disponível via `ThemeToggle`). Dashboards e ferramentas densas em dados ganham em contraste e foco no escuro; o claro é uma alternativa totalmente especificada, não um afterthought.

Neutros vivem em um matiz azul-carvão (`258°` em OKLCH) em vez de cinza puro — isso evita o "preto genérico" e dá à interface uma temperatura consistente. Os únicos matizes saturados usados para ênfase de marca são dourado (`accent`) e violeta (`accent-secondary`); cores de estado são estritamente semânticas.

| Token | Papel | Dark | Light |
|---|---|---|---|
| `background` | Fundo da aplicação | `oklch(0.155 0.017 258)` | `oklch(0.985 0.004 258)` |
| `surface` (`--card`) | Superfície de cards/painéis | `oklch(0.19 0.017 258)` | `oklch(1 0 0)` |
| `surface-elevated` | Popovers, dropdowns, hover de elevação | `oklch(0.235 0.019 258)` | `oklch(0.97 0.006 258)` |
| `border` | Bordas de baixo contraste | `oklch(1 0 0 / 9%)` | `oklch(0.9 0.008 258)` |
| `foreground` | Texto primário | `oklch(0.94 0.008 258)` | `oklch(0.2 0.016 258)` |
| `muted` / `muted-foreground` | Fundos e texto secundário | — | — |
| `accent` (`--primary`) | Ênfase primária, CTAs | `oklch(0.8 0.14 82)` — dourado | `oklch(0.62 0.14 74)` |
| `accent-secondary` | Ênfase secundária, séries de gráfico | `oklch(0.72 0.17 296)` — violeta | `oklch(0.53 0.18 296)` |
| `success` / `warning` / `error` (`destructive`) / `info` | Estados semânticos | hues 152 / 68 / 25 / 235 | idem, ajustado para contraste |

Evitamos deliberadamente os "defaults reconhecíveis de IA": nem bege+terracota, nem preto puro com um único verde-ácido. `chart-1..5` reaproveitam os mesmos tokens (dourado, violeta, verde, azul, neutro) para que os gráficos (Recharts/Tremor) fiquem no mesmo sistema.

Todos os tokens estão em `app/globals.css` (`:root`, `.dark`, `.light`) e expostos ao Tailwind via `@theme inline`.

## 2. Tipografia

Duas famílias com papéis distintos, carregadas via `next/font/google` em `app/layout.tsx`:

- **Display** (`--font-display`, utilitário `font-display`/`font-heading`): **Bricolage Grotesque** — títulos, KPIs, números em destaque. Tem mais personalidade que a fonte de corpo.
- **Body** (`--font-body`, utilitário `font-sans`, padrão do `<html>`): **IBM Plex Sans** — texto corrido, labels, dados de tabela. Alta legibilidade em densidade.
- **Mono** (`--font-mono`): **IBM Plex Mono** — disponível para trechos de código; números tabulares em geral usam `.tabular-nums` sobre a fonte de corpo/display.

| Uso | Classe | Peso |
|---|---|---|
| Título de página | `font-display text-2xl sm:text-3xl font-semibold tracking-tight` | 600 |
| Título de card | `font-heading text-base font-medium` (padrão do `CardTitle`) | 500 |
| Número de KPI | `font-display text-[2rem] leading-none font-semibold tabular-nums` | 600 |
| Corpo | `font-sans text-sm` (padrão) | 400 |
| Label / caption | `text-xs text-muted-foreground` | 500 |

## 3. Espaçamento, grid e densidade

- Escala de espaçamento padrão do Tailwind (base 4px), aplicada com rigor — sem valores mágicos soltos em componentes.
- Layout: **sidebar fixa (240px, oculta em mobile) + conteúdo com largura máxima** (`max-w-6xl`), com topbar sticky para navegação mobile (`Sheet`) e ações globais (tema, avatar). Ver `components/design-system/app-shell.tsx`.
- Densidade: cards de métrica combinam número principal + badge de variação + contexto em uma única linha vertical compacta (`MetricCard`); tabelas usam header com `text-muted-foreground`, linhas com hover sutil e ações alinhadas à direita.

## 4. Elevação, bordas e radius

- Elevação combina **no máximo duas técnicas**: anel de baixo contraste (`ring-1 ring-foreground/10`, usado no `Card` base) + sombra sutil (`--shadow-elevation-1/2/3`, usada em hover e em superfícies flutuantes como diálogos/dropdowns).
- Radius: base `--radius: 0.5rem` (8px) — leve, mas propositalmente mais contido que o default do shadcn, refletindo um produto de dados/enterprise em vez de consumer arredondado. Escala derivada (`sm/md/lg/xl/2xl/3xl`) mantém proporção consistente em todos os componentes.

## 5. Estados de interface

- **Loading**: skeletons que replicam o layout final (`MetricCardSkeleton`), nunca um spinner isolado genérico. Ver `app/(app)/page.tsx`, que envolve os cards de métrica em `<Suspense>` com esse fallback.
- **Vazio**: `EmptyState` — ícone em círculo `muted`, título + descrição curta, ação opcional. Usado quando a tabela de itens de demonstração está vazia.
- **Erro**: mensagens inline junto ao campo (`text-xs text-destructive`) nos formulários; erros de servidor exibidos no rodapé do diálogo antes das ações.
- **Hover / focus / active**: todos os componentes interativos usam os tokens `ring`/`accent` para foco visível por teclado (`focus-visible:ring-3 focus-visible:ring-ring/50`), consistente entre `Button`, `Input`, links de navegação.

## 6. Motion

Implementado com Framer Motion, sempre respeitando `prefers-reduced-motion` (bloco global em `app/globals.css` zera durações de animação/transição para quem pede movimento reduzido).

- **Entrada de seção**: fade + leve translate em Y (`opacity 0→1`, `y 8→0`, ease `[0.16,1,0.3,1]`) — usado em `MetricCard` e `EmptyState`.
- **Hover de item ativo na navegação**: `layoutId` compartilhado (`motion.span`) desliza o indicador de item ativo na sidebar com spring.
- **Elevação em hover**: variante `elevated` do `Button` sobe 1px e aumenta a sombra na transição de estado.

## 7. Componentização sobre shadcn/ui (Radix)

shadcn/ui foi inicializado com **Radix** como base (`components.json`, `-b radix`) e é tratado como matéria-prima, nunca como resultado final:

- Todos os componentes (`Button`, `Badge`, `Card`, `Input`, `Table`, `Dialog`, `Sheet`, `Tooltip`, `Avatar`, `Dropdown`) foram religados aos tokens customizados — nenhum ficou com a paleta cinza padrão.
- Variantes customizadas via `cva` em `Button`: `elevated` (superfície elevada + sombra), `ghost-accent` (texto/hover na cor de acento), `danger-subtle` (ação destrutiva discreta, usada nas linhas da tabela).
- Variantes customizadas em `Badge`: `success`, `warning`, `info`, além das padrão.
- Composições de mais alto nível vivem em `components/design-system/`: `PageHeader`, `AppShell`, `Sidebar`/`Topbar`, `MetricCard` (+ skeleton), `EmptyState`, `ThemeToggle`, e o padrão de dados (`DemoItemsSection` + `DemoItemFormDialog`) que demonstra tabela + formulário + Server Actions juntos.

## 8. O que esta base **não** é

Nenhuma tela de negócio foi implementada. `DemoItem`/`demo_items` é uma entidade puramente demonstrativa (Prisma + Zod + Server Actions + Vitest + Playwright) para provar que o padrão de CRUD funciona ponta a ponta — substitua por entidades reais assim que o domínio do produto for definido.
