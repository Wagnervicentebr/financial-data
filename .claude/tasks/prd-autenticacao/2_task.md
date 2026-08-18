# Tarefa 2.0: Motor de autenticação + validações/helpers

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Configurar o Auth.js v5 com os dois métodos de entrada (e-mail/senha e Google), a estratégia de sessão (JWT com claim de "lembrar-me") e a proteção de rotas via middleware. Junto disso, criar os schemas de validação (Zod) e os helpers de senha/token que serão reaproveitados pelas Server Actions da Tarefa 3.0. Esta tarefa permite validar login/cadastro via Google isoladamente (por API/console), antes de qualquer tela existir.

<skills>
### Conformidade com skills

- `@system-rules`
- `@code-standards`
</skills>

<requirements>
- `auth.ts` na raiz: `PrismaAdapter`, `CredentialsProvider` (com `authorize` verificando hash de senha), `GoogleProvider` com `allowDangerousEmailAccountLinking: true` (requisito 15 do PRD — vincular Google a conta existente pelo mesmo e-mail).
- Sessão com estratégia `jwt` (obrigatória por causa do Credentials provider), `maxAge` teto de 30 dias, com claim customizada `expiresAt` calculada no login: 1 dia sem "lembrar-me", 30 dias com "lembrar-me" marcado.
- `app/api/auth/[...nextauth]/route.ts` reexportando os `handlers` do Auth.js.
- `middleware.ts` protegendo todas as rotas fora de `(auth)`, `/api/auth` e assets estáticos; redireciona para `/login` quando não autenticado; invalida a sessão quando a claim `expiresAt` for ultrapassada, mesmo com cookie ainda válido.
- Mitigação de defesa em profundidade (risco CVE-2025-29927 citado na techspec): cada Server Action/Server Component sensível deve poder confirmar a sessão via `auth()` diretamente, não confiando apenas no middleware — deixar essa função pronta para uso nas próximas tarefas.
- `lib/validations/auth.ts`: `signUpSchema`, `loginSchema`, `forgotPasswordSchema`, `resetPasswordSchema`, com critérios mínimos de segurança de senha (comprimento e composição) e validação de confirmação de senha.
- `lib/auth/password.ts`: `hashPassword`/`verifyPassword` (bcryptjs) e `generateResetToken`/`hashResetToken`.
- Novas variáveis de ambiente documentadas em `.env.example`: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.
</requirements>

## Subtarefas

- [x] 2.1 Instalar dependências: `next-auth` (v5), `@auth/prisma-adapter`, `bcryptjs`, `@types/bcryptjs`.
- [x] 2.2 Criar `auth.ts` com `PrismaAdapter`, `CredentialsProvider`, `GoogleProvider` e callbacks `jwt`/`session`.
- [x] 2.3 Criar `app/api/auth/[...nextauth]/route.ts`.
- [x] 2.4 Criar proteção de rotas com checagem da claim `expiresAt` (ver nota sobre `proxy.ts` vs `middleware.ts` abaixo).
- [x] 2.5 Criar `lib/validations/auth.ts` com os 4 schemas Zod.
- [x] 2.6 Criar `lib/auth/password.ts` com hash/verify de senha e geração/hash de token de redefinição.
- [x] 2.7 Adicionar `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` em `.env.example` (documentando que as credenciais reais do Google são um bloqueante externo).
- [x] 2.8 Testes unitários (Vitest) para `lib/validations/auth.ts`: senha fraca, e-mail inválido, confirmação de senha divergente.
- [x] 2.9 Testes unitários (Vitest) para `lib/auth/password.ts`: hash/verify de senha e geração/validação de expiração do token de redefinição.

> **Nota de implementação — `middleware.ts` → `proxy.ts`:** este projeto roda em uma versão do Next.js (16) onde a convenção `middleware.ts` está depreciada e foi renomeada para `proxy.ts` (mesma função; `npm run build` emite aviso de depreciação se usar o nome antigo). Implementado como `proxy.ts` por exigência do framework instalado. Também foi criado `auth.config.ts` (config de sessão/callbacks sem Prisma Adapter/bcrypt) para que o Proxy faça apenas a checagem "otimista" via JWT recomendada pela doc do Next 16 (sem bater no banco a cada rota); `auth.ts` continua sendo a instância completa (com Prisma) usada por Server Actions/Server Components.

## Detalhes de Implementação

Ver `techspec.md`, seções "Interfaces Principais" (bloco `auth.ts`), "Decisões Principais" (justificativa do `allowDangerousEmailAccountLinking`, sessão "lembrar-me" via claim customizada, `bcryptjs` em vez de `argon2`) e "Riscos Conhecidos" (CVE-2025-29927).

## Critérios de Sucesso

- Login/cadastro via Google testável isoladamente (mesmo sem telas), confirmando criação automática de conta e vinculação por e-mail.
- Middleware bloqueia acesso a rotas protegidas sem sessão válida e redireciona para `/login`.
- Sessão "lembrar-me" mantém a claim de 30 dias; sem "lembrar-me", a claim expira em 1 dia mesmo com cookie de 30 dias ainda válido.
- Testes unitários de validação e de senha passando.

## Testes da tarefa

- [x] Testes unitários Vitest (schemas Zod e password/token helpers) — ver subtarefas 2.8 e 2.9. 23/23 passando (`npx vitest run`).
- [x] Testes E2E Playwright: não aplicável nesta tarefa (sem telas ainda) — cobertura de login/cadastro fica na Tarefa 5.0.

### Evidência de verificação

- `npx tsc --noEmit`, `npx eslint` (arquivos alterados) e `npm run build` (Turbopack) sem erros nem avisos.
- `npm run dev` + navegação real: `GET /api/auth/providers` retorna 200 com `credentials` e `google` configurados; `GET /` (rota protegida, sem sessão) redireciona para `/login` (404 esperado — a página só existe na Tarefa 4.0), confirmando que o Proxy bloqueia acesso não autenticado.
- Login/cadastro via Google em si depende de credenciais reais do Google Cloud Console (bloqueante externo, documentado em `.env.example`) — não testável de ponta a ponta nesta tarefa, mas o provider está corretamente registrado e vinculado por e-mail (`allowDangerousEmailAccountLinking: true`).

## Arquivos relevantes

- `auth.ts` (novo, raiz)
- `auth.config.ts` (novo, raiz — config compartilhada entre `auth.ts` e `proxy.ts`, sem Prisma Adapter/bcrypt)
- `proxy.ts` (novo, raiz — substitui `middleware.ts`, depreciado nesta versão do Next.js)
- `types/next-auth.d.ts` (novo — augmentation de `Session`/`User`/`JWT` para a claim `expiresAt`/`rememberMe`)
- `app/api/auth/[...nextauth]/route.ts` (novo)
- `lib/validations/auth.ts` (novo)
- `lib/auth/password.ts` (novo)
- `tests/unit/auth-schema.test.ts`, `tests/unit/password.test.ts` (novos)
- `.env` / `.env.example`
