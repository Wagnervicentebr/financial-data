# Tarefa 5.0: Testes finais e validação de qualidade

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Fechar a funcionalidade com a suíte completa de testes end-to-end dos fluxos críticos de autenticação, garantir que os testes unitários das tarefas anteriores continuam passando juntos, e validar que o projeto não fica em estado quebrado (lint + build), antes de reportar a entrega como concluída.

<skills>
### Conformidade com skills

- `@e2e-qa`
- `@code-standards`
</skills>

<requirements>
- Specs Playwright em `tests/e2e/` (caminho real do projeto, conforme `playwright.config.ts` — não `e2e/specs/<feature>/`): `cadastro.spec.ts`, `login.spec.ts`, `recuperacao-senha.spec.ts`.
- Cobertura mínima exigida pela techspec: cadastro com sucesso e acesso imediato; cadastro com e-mail duplicado; login com credenciais corretas; login com credenciais erradas (mensagem genérica); "lembrar-me" mantendo cookie de sessão longa; fluxo completo de esqueci-senha → mensagem de confirmação neutra → redefinição com token válido → redirecionamento ao login; token de redefinição expirado sendo rejeitado.
- Login com Google fica fora do E2E automatizado (depende do provedor externo) — validar manualmente e documentar como risco conhecido.
- App sob teste via `npm run dev` (baseURL `http://localhost:3000`); execução regressiva via `npm run test:e2e`.
- Suíte Vitest completa (validações + password/token helpers das Tarefas 2.0 e 3.0) rodando sem falhas junto com os novos specs.
- Lint e build finais do projeto sem erros, conforme regra do projeto de nunca reportar conclusão com o projeto quebrado.
</requirements>

## Subtarefas

- [x] 5.1 Escrever `tests/e2e/cadastro.spec.ts` (sucesso + e-mail duplicado).
- [x] 5.2 Escrever `tests/e2e/login.spec.ts` (sucesso, credenciais erradas com mensagem genérica, "lembrar-me").
- [x] 5.3 Escrever `tests/e2e/recuperacao-senha.spec.ts` (fluxo completo + token expirado).
- [x] 5.4 Rodar `npm run test:e2e` e corrigir qualquer falha encontrada nas telas/Server Actions das tarefas anteriores.
- [x] 5.5 Rodar a suíte Vitest completa e confirmar que os testes das Tarefas 2.0 e 3.0 continuam passando.
- [x] 5.6 Validar manualmente o login com Google (cadastro automático de conta nova + vinculação a conta existente pelo mesmo e-mail) e documentar o resultado.
- [x] 5.7 Rodar lint e build finais do projeto e corrigir qualquer erro antes de reportar conclusão.

## Detalhes de Implementação

Ver `techspec.md`, seção "Abordagem de testes" (Testes Unitários e Testes E2E) e "Riscos Conhecidos" (login com Google não coberto por E2E automatizado).

## Critérios de Sucesso

- `npm run test:e2e` passa 100% para os 3 specs de autenticação.
- Suíte Vitest completa passa sem falhas.
- Lint e build do projeto concluem sem erros.
- Validação manual do login com Google documentada (sucesso ou problemas encontrados).

## Testes da tarefa

- [x] Testes E2E Playwright — implementar e executar em `tests/e2e/` (`npm run test:e2e`), cobrindo cadastro, login e recuperação de senha conforme especificado acima.

### Evidência de verificação

- **Seeding de E2E via processo `tsx` separado, não via import direto do Prisma**: os specs de auth precisam de dados reais (usuário com senha hasheada, token de redefinição só-hash) no Postgres do Supabase. Importar `@/lib/prisma` diretamente num arquivo `tests/e2e/**` quebra o carregamento de specs do Playwright (`ReferenceError: exports is not defined in ES module scope` — o client gerado do Prisma 7 usa `import.meta.url` e só roda como ESM real, o que conflita com o carregador esbuild do Playwright). Resolvido criando `scripts/e2e-seed.ts`, executado como subprocesso via `npx tsx` (que suporta ESM corretamente), recebendo o comando por `argv` e os dados por `stdin`, devolvendo JSON por `stdout`. `tests/e2e/helpers/auth.ts` chama esse script para `create-user`, `delete-user` e `create-reset-token` (válido ou expirado); nunca importa Prisma diretamente. Script nunca é importado pelo app.
- `playwright.config.ts` agora chama `process.loadEnvFile()` no topo (Node 20.6+), replicando as mesmas variáveis de `.env` (`DATABASE_URL`, `AUTH_SECRET` etc.) que `npm run dev` já carrega sozinho — necessário porque os specs/helpers rodam num processo Node separado do servidor Next.js.
- `tests/e2e/login.spec.ts` — teste de "lembrar de mim" decodifica o cookie de sessão (`authjs.session-token`) com `decode` de `next-auth/jwt` (mesmo `secret`/`salt` que o Auth.js usa internamente) e confirma que a claim customizada `expiresAt` fica em ~1 dia sem "lembrar-me" e ~30 dias com "lembrar-me" marcado — cobertura direta do requisito 9 do PRD e da decisão técnica "Sessão 'lembrar-me' via claim customizada".
- `tests/e2e/recuperacao-senha.spec.ts` — como o token de redefinição só existe em texto puro no e-mail (nunca no banco, só o hash), o teste gera um token válido/expirado diretamente via `scripts/e2e-seed.ts` (mesma lógica de `generateResetToken`) para simular o link recebido por e-mail, sem depender do envio real pelo Resend.
- `npx playwright test`: **7/7 passando** nos 3 specs de autenticação (cadastro: sucesso + e-mail duplicado; login: sucesso, mensagem genérica idêntica para senha errada e e-mail inexistente, "lembrar-me" com claim de sessão maior; recuperação de senha: fluxo completo até login com a nova senha, e rejeição de token expirado).
- `npx vitest run`: **39/39 passando** (schemas Zod, password/token helpers e Server Actions das Tarefas 2.0/3.0 seguem intactos).
- `npx eslint .` (projeto inteiro) e `npx tsc --noEmit`: sem erros.
- `npm run build` (Turbopack): rotas `/`, `/login`, `/cadastro`, `/esqueci-senha`, `/redefinir-senha` estáticas, `/api/auth/[...nextauth]` dinâmica, Proxy ativo — sem erros nem avisos.
- **Login com Google (subtarefa 5.6) — atualização pós-entrega (2026-07-27)**: a pessoa responsável criou o projeto no Google Cloud Console e forneceu `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` reais, já preenchidos em `.env` (redirect URI cadastrado: `http://localhost:3000/api/auth/callback/google`). Validado com `npm run dev` real: `GET /api/auth/providers` responde 200 com o provider `google` configurado; clicar em "Entrar com Google" na tela de login redireciona corretamente para `accounts.google.com`, exibindo a tela oficial do Google com o nome do app ("Prosseguir para Financial dashboard") — confirma que `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` e o redirect URI estão certos. O passo final (escolher a conta Google e conceder acesso) não foi executado por esta sessão, já que digitar credenciais de login é uma ação exclusiva da pessoa usuária; a tela de consentimento do Google ainda está em modo "Testando", então só e-mails cadastrados como "usuário de teste" na Tela de consentimento OAuth do Google Cloud Console conseguem concluir o login até o app ser publicado/verificado. **Risco conhecido reduzido, não mais bloqueado por credencial ausente** — falta apenas a pessoa responsável concluir o login uma vez com uma conta de teste para confirmar a criação/vinculação de conta ponta a ponta (requisitos 14 e 15 do PRD).
- **Achado fora do escopo desta tarefa, sinalizado separadamente**: durante a correção de `tests/e2e/demo-items.spec.ts` (teste pré-existente, anterior à funcionalidade de autenticação) foi necessário adicionar um passo de login, já que `proxy.ts` (Tarefa 2.0) agora protege a rota `/` e o teste antes assumia acesso anônimo — regressão real, corrigida aqui. Ao corrigir isso, foi descoberto um segundo problema, este sim pré-existente e sem relação com autenticação: ao editar um item de demonstração, a Server Action `updateDemoItem` salva corretamente no banco (confirmado via reload da página), mas a linha da tabela na tela não atualiza sozinha mesmo com `router.refresh()`/`revalidatePath("/")` — só reflete a mudança após uma nova navegação. Investigado com instrumentação de rede/console (sem erros, respostas 200) sem causa raiz conclusiva dentro do escopo desta tarefa; encaminhado como tarefa separada de acompanhamento (fora do PRD/techspec de autenticação), sem bloquear esta entrega.

## Arquivos relevantes

- `tests/e2e/cadastro.spec.ts` (novo)
- `tests/e2e/login.spec.ts` (novo)
- `tests/e2e/recuperacao-senha.spec.ts` (novo)
- `tests/e2e/helpers/auth.ts` (novo — seeding/login/decodificação de sessão para os specs de auth)
- `tests/e2e/demo-items.spec.ts` (modificado — adicionado login prévio, já que `/` passou a exigir sessão)
- `scripts/e2e-seed.ts` (novo — seeding de banco para E2E via processo `tsx` separado, nunca importado pelo app)
- `playwright.config.ts` (modificado — carrega `.env` no processo de teste via `process.loadEnvFile()`)
