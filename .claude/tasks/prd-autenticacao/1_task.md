# Tarefa 1.0: Schema do banco de dados (Prisma + migrations + RLS)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Criar a estrutura de dados que sustenta toda a autenticação: tabelas de usuário, contas OAuth vinculadas, sessões e tokens de redefinição de senha. É a base de tudo o que vem depois — nenhuma outra tarefa pode começar sem o schema aplicado. Nenhuma tabela ou dado existente é removido ou alterado, apenas adicionado.

<skills>
### Conformidade com skills

- `@system-rules`
- `@code-standards`
</skills>

<requirements>
- Modelos `User`, `Account`, `Session`, `VerificationToken`, `PasswordResetToken` exatamente como definidos em `techspec.md` (seção "Modelos de Dados").
- `User.passwordHash` deve ser opcional (`String?`) para suportar contas 100% Google.
- Migration deve apenas adicionar tabelas novas — não pode alterar ou remover nada de `demo_items` ou qualquer tabela existente.
- Row Level Security (RLS) habilitada em `users`, `accounts`, `sessions`, `password_reset_tokens`, sem políticas públicas — mesmo padrão já aplicado em `demo_items`.
- Qualquer dúvida sobre impacto em dados existentes exige confirmação explícita antes de aplicar a migration, conforme regra do projeto para alterações de banco.
</requirements>

## Subtarefas

- [x] 1.1 Adicionar os modelos `User`, `Account`, `Session`, `VerificationToken`, `PasswordResetToken` ao `prisma/schema.prisma`.
- [x] 1.2 Gerar a migration Prisma correspondente em `prisma/migrations/`.
- [x] 1.3 Aplicar a migration no banco (Supabase/Postgres) e confirmar que nenhuma tabela existente foi alterada.
- [x] 1.4 Habilitar RLS nas 4 novas tabelas, sem políticas públicas.
- [x] 1.5 Verificar via MCP do Supabase (`list_tables`, `get_advisors`) que as tabelas foram criadas corretamente e que RLS está ativo sem alertas de segurança.
- [x] 1.6 Rodar `npx prisma generate` e validar que o client tipado reflete os novos modelos sem erros de tipo no restante do projeto.

## Detalhes de Implementação

Ver `techspec.md`, seções "Modelos de Dados" e "Riscos Conhecidos" (item "Exposição das novas tabelas via Supabase").

## Critérios de Sucesso

- Migration aplicada sem erros e sem afetar dados/tabelas pré-existentes.
- `get_advisors` do MCP Supabase não reporta alertas de segurança relacionados às novas tabelas.
- `npx prisma generate` e o build do projeto continuam funcionando normalmente.

## Testes da tarefa

- [x] Não aplicável a Playwright E2E (tarefa é apenas de infraestrutura de dados, sem interface).
- [x] Verificação manual via MCP do Supabase (`list_tables`, `get_advisors`) documentada como evidência de que RLS está correto.

### Evidência de verificação (MCP Supabase)

- `list_tables`: `users`, `accounts`, `sessions`, `verification_tokens`, `password_reset_tokens` criadas em `public`, todas com `rls_enabled: true`. `demo_items` permanece inalterada.
- `get_advisors` (security): apenas alertas `INFO` de "RLS habilitada sem policy" nas 5 tabelas novas (esperado, mesmo padrão de `demo_items` — nenhuma policy pública). O único alerta `ERROR` restante é em `_prisma_migrations`, tabela interna do Prisma pré-existente, fora do escopo desta tarefa.

## Arquivos relevantes

- `prisma/schema.prisma`
- `prisma/migrations/` (nova migration)
