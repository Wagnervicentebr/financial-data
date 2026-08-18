# Tech Spec — Autenticação (Login, Cadastro e Recuperação de Senha)

## Resumo Executivo

A autenticação será implementada com **Auth.js v5** (antigo NextAuth) usando o **Prisma Adapter** sobre o mesmo PostgreSQL já usado pelo projeto (hoje hospedado no Supabase, mas acessado só via Prisma com uma conexão privilegiada — não via SDK do Supabase). Essa escolha mantém a stack fixa do projeto (Prisma + Server Actions + RSC) sem introduzir um segundo sistema de autenticação. Login por credenciais (e-mail/senha) usa o `CredentialsProvider` com hash de senha via `bcryptjs`; login/cadastro com Google usa o `GoogleProvider` com vinculação automática por e-mail. A sessão usa estratégia JWT (obrigatória quando há Credentials provider), com uma claim customizada para diferenciar sessão padrão (1 dia) de sessão "lembrar-me" (30 dias). Redefinição de senha usa um token opaco de uso único, armazenado com hash, validado por Server Action, e enviado por e-mail via **Resend**. As telas (login, cadastro, esqueci a senha, redefinir senha) ficam num novo grupo de rotas `app/(auth)/` com layout próprio, fora do `AppShell` (sidebar/topbar) atual — que precisa ser deslocado do layout raiz para um novo grupo `app/(app)/`.

## Arquitetura do Sistema

### Visão Geral dos Componentes

- **`auth.ts`** (raiz do projeto): configuração central do Auth.js — providers (Credentials, Google), estratégia de sessão, callbacks `jwt`/`session`. Exporta `handlers`, `auth`, `signIn`, `signOut`.
- **`app/api/auth/[...nextauth]/route.ts`**: reexporta `handlers` do Auth.js (callback OAuth do Google, endpoints internos de sessão).
- **`middleware.ts`**: protege todas as rotas fora de `(auth)`, `/api/auth` e assets estáticos; redireciona para `/login` quando não autenticado; também aplica o corte de sessão "não lembrar-me" via claim customizada.
- **`server/actions/auth.ts`**: Server Actions `registerUser`, `loginWithCredentials`, `requestPasswordReset`, `resetPassword` — validam com Zod, falam com Prisma e com o Auth.js `signIn`.
- **`lib/auth/password.ts`**: `hashPassword`/`verifyPassword` (bcryptjs) e `generateResetToken`/`hashResetToken`.
- **`lib/validations/auth.ts`**: schemas Zod (`signUpSchema`, `loginSchema`, `forgotPasswordSchema`, `resetPasswordSchema`), compartilhados entre formulário e Server Action.
- **`lib/mail/resend.ts`**: cliente Resend + função `sendPasswordResetEmail`.
- **`app/(auth)/layout.tsx`**: layout centralizado, sem sidebar/topbar, para as 4 telas de autenticação.
- **`app/(auth)/login/page.tsx`**, **`cadastro/page.tsx`**, **`esqueci-senha/page.tsx`**, **`redefinir-senha/page.tsx`**.
- **`app/(app)/layout.tsx`** (novo): recebe o `AppShell` atualmente fixo em `app/layout.tsx`; `app/page.tsx` migra para `app/(app)/page.tsx`.

Fluxo de dados: formulário (React Hook Form + Zod) → Server Action → validação Zod (mesma regra do cliente) → Prisma (User/Account/PasswordResetToken) → Auth.js `signIn` grava cookie de sessão (JWT) → `middleware.ts` lê o cookie em cada requisição subsequente.

## Design de Implementação

### Interfaces Principais

```typescript
// server/actions/auth.ts
type ActionResult = { ok: true } | { ok: false; message: string };

export async function registerUser(input: unknown): Promise<ActionResult>;
export async function loginWithCredentials(input: unknown): Promise<ActionResult>;
export async function requestPasswordReset(input: unknown): Promise<{ ok: true }>;
export async function resetPassword(input: unknown): Promise<ActionResult>;
```

```typescript
// auth.ts (raiz)
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 }, // teto: 30 dias
  providers: [
    Credentials({ credentials: { email: {}, password: {} }, authorize }),
    Google({ allowDangerousEmailAccountLinking: true }),
  ],
  callbacks: { jwt: attachRememberClaim, session: exposeExpiry },
});
```

Justificativa do `allowDangerousEmailAccountLinking: true` no Google: é o mecanismo padrão do Auth.js para o requisito 15 (vincular Google a conta já existente pelo mesmo e-mail, sem senha). É seguro aqui porque o Google só emite login OAuth para e-mails que ele mesmo já verificou — diferente de provedores sem verificação de e-mail, onde essa opção seria arriscada.

### Modelos de Dados

Novas tabelas no `schema.prisma` (schema padrão do Auth.js Prisma Adapter + uma tabela própria para redefinição de senha):

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String?  // null para contas 100% Google
  image        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  accounts     Account[]
  sessions     Session[]
  resetTokens  PasswordResetToken[]
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  id_token          String? @db.Text
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
  @@map("verification_tokens")
}

model PasswordResetToken {
  id        String    @id @default(cuid())
  tokenHash String    @unique
  userId    String
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("password_reset_tokens")
}
```

`Session` fica no schema por compatibilidade com o Prisma Adapter, mas não é a fonte de verdade da sessão (estratégia é `jwt`, obrigatória por causa do Credentials provider) — o cookie assinado é quem carrega o estado de login.

### Endpoints de API

- `GET|POST /api/auth/[...nextauth]` — gerenciado inteiramente pelo Auth.js (callback do Google, endpoint interno de sessão/sign-out). É a única rota de API desta funcionalidade; cadastro, login por credenciais e redefinição de senha usam Server Actions, seguindo o padrão já estabelecido no projeto (`server/actions/demo-item.ts`).

## Pontos de Integração

- **Google OAuth (Google Identity/Cloud)**: requer registrar o aplicativo no Google Cloud Console e configurar `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`. URL de callback: `{URL_DO_SITE}/api/auth/callback/google`. Ação depende da pessoa responsável (criação das credenciais no Google) — não pode ser feita por aqui.
- **Resend (e-mail transacional)**: requer `RESEND_API_KEY`. Em desenvolvimento pode usar o remetente de teste do próprio Resend; em produção precisa de domínio verificado. Falha de envio deve ser tratada como erro genérico para a pessoa usuária (sem expor detalhe técnico), mas logada no servidor.
- **`AUTH_SECRET`**: chave usada para assinar o JWT de sessão — novo segredo obrigatório no `.env`.

## Abordagem de testes

### Testes Unitários (Vitest)

- Schemas Zod (`lib/validations/auth.ts`): senha fraca, e-mails inválidos, confirmação de senha divergente.
- `lib/auth/password.ts`: hash/verify e geração/validação de expiração do token de redefinição.

### Testes E2E

- Specs Playwright em `tests/e2e/` (convenção real deste repositório — `playwright.config.ts` aponta `testDir: "./tests/e2e"`, diferente do padrão genérico `e2e/specs/<feature>/` sugerido pela skill `e2e-qa`; seguimos o `testDir` real do projeto).
- Arquivos: `tests/e2e/cadastro.spec.ts`, `tests/e2e/login.spec.ts`, `tests/e2e/recuperacao-senha.spec.ts`.
- Cobertura: cadastro com sucesso e acesso imediato; cadastro com e-mail duplicado; login com credenciais corretas; login com credenciais erradas (mensagem genérica); "lembrar-me" mantendo cookie de sessão longa; fluxo completo de esqueci-senha → mensagem de confirmação neutra → redefinição com token válido → redirecionamento ao login; token de redefinição expirado sendo rejeitado.
- Login com Google fica fora do E2E automatizado (depende do provedor externo real) — validação manual documentada como risco conhecido.
- App sob teste: `npm run dev` (baseURL `http://localhost:3000`). Regressivo: `npm run test:e2e`. Anexar `@e2e-qa`.

## Sequenciamento de Desenvolvimento

### Ordem de Construção

1. **Schema Prisma + migrations** (`User`, `Account`, `Session`, `VerificationToken`, `PasswordResetToken`) e migration de RLS (mesma prática já usada em `demo_items`) — base para tudo o resto; nenhuma tabela remove ou altera dado existente, só adiciona.
2. **Motor de autenticação** (`auth.ts`, `middleware.ts`, `app/api/auth/[...nextauth]/route.ts`) com os dois providers — permite validar login/cadastro via Google isoladamente antes de plugar a interface.
3. **Validação e helpers** (`lib/validations/auth.ts`, `lib/auth/password.ts`) — reaproveitados por todas as Server Actions.
4. **Server Actions** (`server/actions/auth.ts`) — `registerUser`, `loginWithCredentials`, `requestPasswordReset`, `resetPassword`.
5. **Reestruturação de rotas**: extrair o `AppShell` de `app/layout.tsx` para um novo `app/(app)/layout.tsx`; mover `app/page.tsx` para `app/(app)/page.tsx`; criar `app/(auth)/layout.tsx` sem sidebar/topbar. Necessário antes de construir as telas, para que elas não herdem a navegação do painel.
6. **Telas** (login, cadastro, esqueci-senha, redefinir-senha) + novo primitivo `components/ui/checkbox.tsx` (via shadcn, customizado ao design system) para "lembrar-me".
7. **Integração Resend** (`lib/mail/resend.ts`) plugada em `requestPasswordReset`.
8. **Testes** (Vitest + Playwright) e validação final de lint/build.

### Dependências Técnicas

- Novas dependências de código: `next-auth` (v5), `@auth/prisma-adapter`, `bcryptjs` (+ `@types/bcryptjs`), `resend`. Nenhuma substitui algo da stack fixa — todas são complementares (autenticação e e-mail não tinham solução prévia no projeto).
- Bloqueantes externos (fora do nosso controle): credenciais OAuth do Google e chave de API do Resend, ambas a serem fornecidas pela pessoa responsável antes dos testes ponta a ponta desses dois pontos especificamente. O cadastro/login por e-mail e senha funciona independentemente disso.

## Considerações Técnicas

### Decisões Principais

- **Auth.js em vez de Supabase Auth**: o banco já está no Supabase, mas o projeto inteiro fala com ele via Prisma (conexão privilegiada), não via SDK do Supabase/RLS por usuário. Adotar o Supabase Auth exigiria um segundo padrão de acesso a dados (cliente Supabase + RLS por `auth.uid()`) só para autenticação, contrariando a stack fixa do projeto. Auth.js com Prisma Adapter resolve tudo dentro do padrão já existente (Server Actions + Prisma).
- **`bcryptjs` em vez de `argon2`**: Argon2id é o recomendado atual pela OWASP, mas o pacote `argon2` depende de compilação nativa, o que é um ponto de atrito em ambiente Windows e em builds serverless. `bcryptjs` é puro JavaScript, sem esse risco, e continua sendo uma opção aceita pela OWASP para hashing de senha — troca pragmática sem perda relevante de segurança para este contexto.
- **Sessão "lembrar-me" via claim customizada**: o Auth.js não suporta nativamente um tempo de expiração diferente por login dentro da mesma configuração. A solução é manter o teto do cookie em 30 dias, mas gravar no JWT um campo `expiresAt` calculado no login (1 dia se "lembrar-me" não foi marcado, 30 dias se foi) e fazer o `middleware.ts` invalidar a sessão quando esse campo é ultrapassado, mesmo que o cookie em si ainda seja válido.
- **Token de redefinição de senha com hash**: o token enviado por e-mail nunca é salvo em texto puro no banco — salvamos o hash dele (mesma lógica de senha), então mesmo um acesso de leitura ao banco não permite gerar links de redefinição válidos.
- **Sem confirmação de e-mail e sem 2FA**: conforme decidido no PRD, o acesso é liberado imediatamente após o cadastro.
- Decisões confirmadas com a pessoa responsável antes desta especificação: sem caixinha de Termos de Uso nesta entrega; sessão padrão de 1 dia e "lembrar-me" de 30 dias; sem e-mail de boas-vindas; envio do e-mail de redefinição via Resend.

### Riscos Conhecidos

- **Reestruturação do layout raiz**: mover o `AppShell` para fora de `app/layout.tsx` toca a tela inicial existente (`app/page.tsx`) — precisa de checagem visual pós-mudança para garantir que a vitrine do design system continua idêntica.
- **Bypass de middleware por header (CVE-2025-29927)**: uma falha conhecida do Next.js permitiu, em versões antigas, contornar proteção feita só no `middleware.ts`. Mitigação: além do middleware, cada Server Action/Server Component sensível confirma a sessão via `auth()` diretamente (defesa em profundidade), não confiando só no redirecionamento do middleware.
- **Vinculação automática de conta Google por e-mail**: é o comportamento pedido no PRD (requisito 15) e é seguro porque depende do Google já ter verificado aquele e-mail — mas é uma decisão de segurança que vale reconfirmar se o produto um dia aceitar outros provedores OAuth menos rigorosos.
- **Exposição das novas tabelas via Supabase**: como o banco vive no Supabase, `users`, `accounts`, `sessions` e `password_reset_tokens` também precisam de Row Level Security habilitada sem políticas públicas (mesmo padrão já aplicado em `demo_items`), para não ficarem acessíveis por engano via chave pública do Supabase.
- **Login com Google não é coberto por E2E automatizado** (depende do provedor externo) — validado manualmente antes de cada entrega que tocar esse fluxo.

### Conformidade com Padrões

- `docs/rules/stack-tecnica.md`: Server Actions + Prisma + Zod compartilhado + Vitest/Playwright — seguido integralmente; nenhuma tecnologia da lista fixa foi trocada.
- `docs/rules/design-system.md`: as 4 telas novas e o novo `Checkbox` seguem os tokens de cor/tipografia/espaçamento já documentados; nenhum componente shadcn é usado sem customização.
- `.claude/skills/responsive-ui`: as 4 telas precisam funcionar em celular, tablet e desktop (requisito explícito do PRD).
- `.claude/skills/e2e-qa`: specs Playwright cobrindo os fluxos críticos — com o ajuste de caminho já explicado (`tests/e2e/`, e não `e2e/specs/<feature>/`, para bater com o `playwright.config.ts` real do projeto).
- `.claude/skills/code-standards` / `system-rules`: nomes de arquivo em inglês, TypeScript estrito, Server Actions separadas da interface — mesmo padrão do `server/actions/demo-item.ts` existente.

### MCP server

- MCP do Supabase (projeto `financial-dashboard`, id `hpproquuxyqprhuipspy`) pode ser usado durante a implementação para conferir, após aplicar as migrations, que RLS ficou habilitada nas novas tabelas (`get_advisors`, `list_tables`) — mesma checagem de segurança já feita para `demo_items`.
- Não há link de Figma no PRD; as telas seguem `docs/design-system.md`, então o MCP do Figma não se aplica aqui.

### Arquivos relevantes

- `prisma/schema.prisma` (novos models) + nova migration em `prisma/migrations/`
- `auth.ts` (novo, raiz)
- `middleware.ts` (novo, raiz)
- `app/api/auth/[...nextauth]/route.ts` (novo)
- `lib/validations/auth.ts` (novo)
- `lib/auth/password.ts` (novo)
- `lib/mail/resend.ts` (novo)
- `server/actions/auth.ts` (novo)
- `app/(auth)/layout.tsx`, `login/page.tsx`, `cadastro/page.tsx`, `esqueci-senha/page.tsx`, `redefinir-senha/page.tsx` (novos)
- `app/(app)/layout.tsx` (novo) — recebe o `AppShell`
- `app/layout.tsx` (modificado) — perde o `AppShell` direto, mantém fontes/tema
- `app/page.tsx` → `app/(app)/page.tsx` (movido)
- `components/ui/checkbox.tsx` (novo, via shadcn + customização)
- `.env` / `.env.example` (novas variáveis: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `RESEND_API_KEY`)
- `tests/e2e/cadastro.spec.ts`, `login.spec.ts`, `recuperacao-senha.spec.ts` (novos)
