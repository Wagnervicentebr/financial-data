# Tarefa 4.0: Reestruturação de rotas + Telas de autenticação

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Separar o painel atual (com `AppShell`) das novas telas de autenticação (sem sidebar/topbar), e então construir as 4 telas — login, cadastro, esqueci-senha, redefinir-senha — consumindo as Server Actions da Tarefa 3.0. A reestruturação de rotas precisa vir antes das telas, para que elas não herdem a navegação do painel existente.

<skills>
### Conformidade com skills

- `@react`
- `@responsive-ui`
- `@code-standards`
- `@system-rules`
</skills>

<requirements>
- `app/(app)/layout.tsx` novo, recebendo o `AppShell` hoje fixo em `app/layout.tsx`; `app/page.tsx` migra para `app/(app)/page.tsx`.
- `app/layout.tsx` mantém apenas fontes/tema, perde o `AppShell` direto.
- `app/(auth)/layout.tsx` novo: layout centralizado, sem sidebar/topbar.
- 4 telas em `app/(auth)/`: `login/page.tsx`, `cadastro/page.tsx`, `esqueci-senha/page.tsx`, `redefinir-senha/page.tsx`.
- Login: campos e-mail/senha, opção "lembrar de mim", botão "Entrar com Google", link para cadastro, link para "Esqueci minha senha".
- Cadastro: campos nome/e-mail/senha/confirmação, botão "Cadastrar-se com Google", mensagens de erro específicas por campo.
- Esqueci-senha: campo de e-mail, mensagem de confirmação neutra após envio (não revela se o e-mail existe).
- Redefinir-senha: campos nova senha/confirmação, mensagem de sucesso e redirecionamento para login; trata token expirado/inválido com mensagem clara.
- Todas as telas: estado de carregamento visível durante envio, erros em linguagem simples (sem termos técnicos/códigos crus), rótulos associados aos campos, navegação completa por teclado, contraste adequado nos dois temas, mensagens de erro acessíveis para leitores de tela.
- Responsivas em celular, tablet e desktop.
- Seguem integralmente `docs/design-system.md` — nenhum componente shadcn sem customização.
- Novo `components/ui/checkbox.tsx` (via shadcn, customizado ao design system) para "lembrar de mim".
- Checagem visual da tela inicial (`app/(app)/page.tsx`) após a migração, para confirmar que a vitrine do design system continua idêntica (risco identificado na techspec).
</requirements>

## Subtarefas

- [x] 4.1 Criar `app/(app)/layout.tsx` com o `AppShell` e mover `app/page.tsx` para `app/(app)/page.tsx`.
- [x] 4.2 Ajustar `app/layout.tsx` para manter apenas fontes/tema/providers globais.
- [x] 4.3 Criar `app/(auth)/layout.tsx` (layout centralizado, sem sidebar/topbar).
- [x] 4.4 Adicionar `components/ui/checkbox.tsx` via shadcn, customizado ao design system.
- [x] 4.5 Construir `app/(auth)/login/page.tsx` (e-mail/senha, lembrar-me, Google, links).
- [x] 4.6 Construir `app/(auth)/cadastro/page.tsx` (nome/e-mail/senha/confirmação, Google, validação por campo).
- [x] 4.7 Construir `app/(auth)/esqueci-senha/page.tsx` (e-mail, mensagem neutra de confirmação).
- [x] 4.8 Construir `app/(auth)/redefinir-senha/page.tsx` (nova senha/confirmação, sucesso + redirecionamento, tratamento de token inválido/expirado).
- [x] 4.9 Checagem visual manual da tela inicial migrada (`app/(app)/page.tsx`) nos temas claro e escuro.
- [x] 4.10 Checagem de responsividade (celular/tablet/desktop) e acessibilidade (teclado, leitor de tela, contraste) nas 4 telas.

## Detalhes de Implementação

Ver `techspec.md`, seções "Visão Geral dos Componentes" (bloco `app/(auth)/` e `app/(app)/`) e "Riscos Conhecidos" (reestruturação do layout raiz).

## Critérios de Sucesso

- As 4 telas funcionam de ponta a ponta com as Server Actions da Tarefa 3.0 (cadastro, login, esqueci-senha, redefinir-senha).
- Tela inicial existente continua visualmente idêntica após a migração de layout.
- Nenhuma tela de autenticação exibe sidebar/topbar do painel.
- Todas as telas passam na checagem de responsividade e acessibilidade.

## Testes da tarefa

- [ ] Testes E2E Playwright (se aplicável) — implementar e executar em `tests/e2e/` (`npm run test:e2e`), conforme ajuste de caminho já documentado na techspec (não `e2e/specs/<feature>/`). A implementação e execução completa dos specs fica consolidada na Tarefa 5.0, mas os fluxos aqui construídos são o pré-requisito direto para eles.

### Evidência de verificação

- `npx tsc --noEmit`, `npx eslint app components lib` e `npx vitest run` (39/39, suíte completa das Tarefas 1.0–3.0 intacta) sem erros.
- `npm run build` (Turbopack): rotas `/`, `/login`, `/cadastro`, `/esqueci-senha`, `/redefinir-senha` geradas como estáticas, `/api/auth/[...nextauth]` dinâmica, Proxy ativo — sem erros nem avisos.
- Verificação ponta a ponta no navegador (`npm run dev`), com dados reais no Postgres (usuário de teste criado e removido ao final):
  - Cadastro com e-mail/senha válidos → sessão criada e redirecionamento imediato para `/` (painel com `AppShell`), confirmando requisito 4 do PRD.
  - Login com credenciais erradas → mensagem genérica única ("E-mail ou senha inválidos."), sem indicar qual campo errou (requisito 10).
  - Esqueci minha senha → resposta neutra idêntica para e-mail existente e inexistente (requisito 18), com token gerado e hash salvo no banco.
  - Redefinir senha com token real gerado via script (hash-only no banco, conforme Tarefa 3.0) → sucesso, mensagem de confirmação e redirecionamento automático para `/login` (requisito 22); acesso à tela sem token na URL → estado "link inválido" com CTA para solicitar novo link.
  - Login com a nova senha após redefinição → sucesso, confirma que a troca de senha realmente persistiu.
  - Tema claro/escuro (via `ThemeToggle` no header de auth) e viewports mobile (375px) / tablet (768px) / desktop (1280px) — card centralizado, sem overflow horizontal, sidebar/topbar do painel ausentes nas 4 telas de auth.
  - Nenhum erro no console do navegador em nenhum dos fluxos acima.
- Tela inicial migrada (`app/(app)/page.tsx`): conteúdo idêntico ao `app/page.tsx` original (métricas, seção de itens de demonstração), agora dentro de `app/(app)/layout.tsx` com `AppShell` — vitrine do design system preservada.
- **Correção fora do escopo original desta tarefa, necessária para o critério de sucesso "as 4 telas funcionam de ponta a ponta"**: `lib/mail/resend.ts` (Tarefa 3.0) instanciava o cliente Resend no escopo do módulo (`new Resend(process.env.RESEND_API_KEY)`), o que lança exceção síncrona quando a chave não está configurada — e, por ser import de topo em `server/actions/auth.ts`, derrubava o módulo inteiro (`registerUser` e `loginWithCredentials` incluídos, mesmo sem dependerem do Resend). Corrigido para construir o cliente sob demanda dentro de `sendPasswordResetEmail`, mantendo intacto o try/catch já existente em `requestPasswordReset` (resposta neutra preservada). Sem impacto nos testes da Tarefa 3.0 (`tests/unit/auth-actions.test.ts` mocka o módulo inteiro).
- **Revisão independente (agente `general-purpose`, no papel de `@task-reviewer`)**: apontou um problema real, corrigido antes de finalizar a tarefa — o estado "link inválido/expirado" em `redefinir-senha` não tinha `role="alert"`, quebrando o requisito de mensagens de erro acessíveis a leitores de tela quando esse estado substitui o formulário dinamicamente. Também sinalizou pontos de menor severidade, todos corrigidos por segurança: estados de sucesso/confirmação (esqueci-senha, redefinir-senha) sem `role="status"`; botão "Entrar/Cadastrar-se com Google" sem tratamento de falha de rede (ficava com spinner preso indefinidamente). Um ponto de duplicação de baixo risco (marca/logo repetida entre `app/(auth)/layout.tsx` e `components/design-system/sidebar.tsx`) foi identificado e conscientemente não corrigido nesta entrega — refatorar exigiria reestruturar o componente `Brand` existente e o ganho é puramente estético, sem valor funcional que justifique o risco de regressão visual sem verificação pixel a pixel.

## Arquivos relevantes

- `app/(app)/layout.tsx` (novo)
- `app/(app)/page.tsx` (movido de `app/page.tsx`)
- `app/layout.tsx` (modificado)
- `app/(auth)/layout.tsx`, `login/page.tsx`, `cadastro/page.tsx`, `esqueci-senha/page.tsx`, `redefinir-senha/page.tsx` (novos)
- `components/design-system/login-form.tsx`, `signup-form.tsx`, `forgot-password-form.tsx`, `reset-password-form.tsx`, `form-field.tsx`, `google-auth-button.tsx` (novos)
- `components/ui/checkbox.tsx` (novo)
- `lib/mail/resend.ts` (modificado — correção da instanciação eager do cliente Resend, ver "Evidência de verificação")
- `docs/design-system.md` (modificado — referência stale a `app/page.tsx` atualizada para `app/(app)/page.tsx`)
