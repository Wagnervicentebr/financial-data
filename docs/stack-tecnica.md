# Stack técnica e estrutura de código

## Stack fixa do projeto

| Camada | Tecnologia |
|---|---|
| Framework | Next.js (App Router), React, TypeScript (modo estrito) |
| Estilo | Tailwind CSS + tokens customizados do projeto |
| Componentes base | shadcn/ui, sempre customizado (ver `design-system.md`) |
| Animações | Framer Motion |
| Ícones | lucide-react |
| Gráficos | Recharts ou Tremor, quando a tela envolver dados/números |
| Formulários | react-hook-form + @hookform/resolvers |
| Validação | Zod (schemas compartilhados entre tela e servidor) |
| Banco de dados | PostgreSQL via Prisma ORM |
| Migrations | Prisma Migrate |
| Leitura/escrita de dados | Server Actions + React Server Components — evitar API Routes, exceto quando estritamente necessário (webhook externo, integração de terceiros) |
| Datas | date-fns, locale pt-BR |
| Testes | Vitest (unitário) + Playwright (fluxos ponta a ponta) |
| Lint/format | ESLint (config Next) + Prettier |

Não troque uma tecnologia dessa lista por outra sem confirmação explícita da pessoa responsável pelo projeto, mesmo que outra abordagem pareça mais simples para uma tarefa específica.

## Banco de dados (PostgreSQL + Prisma) — cuidados obrigatórios

O banco é real, não é mais um mock em memória. Isso muda o nível de cuidado:

- Antes de qualquer alteração no `schema.prisma` que **remova** uma tabela, coluna ou relacionamento, ou que **altere o tipo** de um campo existente, confirme com a pessoa responsável, explicando em linguagem simples o que pode ser perdido ("isso vai apagar as informações de X que já estão salvas, pode confirmar que tudo bem?"). Nunca gere e aplique essa migration sem essa confirmação.
- Alterações que **adicionam** algo novo (tabela, coluna opcional) podem seguir sem confirmação prévia, desde que documentadas no resumo final.
- Sempre rode `prisma migrate dev` (ambiente de desenvolvimento) e nunca `prisma migrate reset` ou comandos destrutivos sem confirmação explícita.
- Dados de exemplo/seed devem ficar isolados em `prisma/seed.ts`, nunca misturados com lógica de aplicação.

## Estrutura de pastas

- `app/` — rotas e páginas (App Router).
- `components/ui/` — primitivos shadcn customizados.
- `components/patterns/` — composições reutilizáveis de mais alto nível (ex.: card de métrica, cabeçalho de página, estado vazio).
- `lib/` — lógica de domínio, utilitários, tokens de design.
- `server/` ou `app/**/actions.ts` — Server Actions, separadas da interface.
- `prisma/` — schema, migrations, seed.
- Nomeação de arquivos e pastas em inglês, consistente, descritiva.

## Qualidade de código

- TypeScript estrito, sem uso de `any`.
- Componentes pequenos, tipados, reutilizáveis.
- Schemas Zod compartilhados entre validação de formulário e validação no servidor — não duplicar regras de validação.
- Todo pedido que envolva lógica nova relevante deve considerar um teste (unitário ou E2E), mesmo que simples.