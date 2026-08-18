# Tarefa 3.0: Server Actions + integração Resend

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementar as regras de negócio de cadastro, login por credenciais e recuperação de senha como Server Actions, seguindo o mesmo padrão já usado em `server/actions/demo-item.ts`. Inclui a integração com o Resend para o envio real do e-mail de redefinição de senha, já que `requestPasswordReset` depende diretamente desse serviço.

<skills>
### Conformidade com skills

- `@system-rules`
- `@code-standards`
</skills>

<requirements>
- Assinaturas exatas conforme `techspec.md`: `registerUser`, `loginWithCredentials`, `requestPasswordReset`, `resetPassword`, todas retornando `ActionResult` (`{ ok: true }` ou `{ ok: false; message: string }`), exceto `requestPasswordReset` que sempre retorna `{ ok: true }`.
- `registerUser`: valida com `signUpSchema`, impede cadastro com e-mail já existente (mensagem clara), grava senha com hash (nunca texto puro), e autentica a pessoa imediatamente após o cadastro (sem confirmação de e-mail).
- `loginWithCredentials`: valida com `loginSchema`, retorna mensagem de erro genérica quando e-mail ou senha estiverem incorretos (sem indicar qual campo errou), aplica a claim "lembrar-me" quando marcado.
- `requestPasswordReset`: sempre responde com sucesso neutro (não revela se o e-mail existe ou não na base), gera token opaco, salva apenas o hash do token no banco com validade limitada, e dispara o e-mail via Resend.
- `resetPassword`: valida token (existe, não expirado, não usado), aplica os mesmos critérios mínimos de senha do cadastro, marca o token como usado após sucesso.
- Contas 100% Google (sem `passwordHash`) não devem conseguir passar por `requestPasswordReset`/`resetPassword` como se tivessem senha própria (requisito 23 do PRD).
- `lib/mail/resend.ts`: cliente Resend + `sendPasswordResetEmail`; falha de envio deve virar erro genérico para a pessoa usuária, mas logada no servidor (sem detalhe técnico exposto).
- Toda Server Action sensível confirma a sessão via `auth()` quando aplicável (defesa em profundidade, conforme Tarefa 2.0).
</requirements>

## Subtarefas

- [x] 3.1 Criar `server/actions/auth.ts` com a assinatura de `ActionResult` e a função `registerUser`.
- [x] 3.2 Implementar `loginWithCredentials`, incluindo a lógica de "lembrar-me" via `signIn` do Auth.js.
- [x] 3.3 Criar `lib/mail/resend.ts` com o cliente Resend e `sendPasswordResetEmail`.
- [x] 3.4 Implementar `requestPasswordReset`: geração/hash do token, gravação no `PasswordResetToken`, envio do e-mail, resposta neutra.
- [x] 3.5 Implementar `resetPassword`: validação do token (existência, expiração, uso único), atualização da senha com hash.
- [x] 3.6 Adicionar `RESEND_API_KEY` em `.env.example`, documentando o bloqueante externo (chave real fornecida pela pessoa responsável).
- [x] 3.7 Testes unitários (Vitest) cobrindo os caminhos de erro de cada Server Action (e-mail duplicado, credenciais inválidas, token expirado/usado, conta só-Google tentando redefinir senha).

## Detalhes de Implementação

Ver `techspec.md`, seções "Interfaces Principais" (bloco `server/actions/auth.ts`), "Pontos de Integração" (Resend) e "Decisões Principais" (token de redefinição com hash).

## Critérios de Sucesso

- Cadastro com e-mail já existente é bloqueado com mensagem clara; cadastro novo autentica a pessoa imediatamente.
- Login com credenciais erradas sempre retorna a mesma mensagem genérica, independentemente de o problema ser e-mail ou senha.
- Solicitar redefinição de senha para e-mail existente ou inexistente produz sempre a mesma resposta neutra ao usuário.
- Token de redefinição expirado ou já usado é rejeitado por `resetPassword`.
- Falha no envio do Resend não expõe detalhe técnico à pessoa usuária, mas fica registrada em log no servidor.

## Testes da tarefa

- [x] Testes unitários Vitest cobrindo os caminhos de erro/sucesso das 4 Server Actions (ver subtarefa 3.7).
- [ ] Testes E2E Playwright: fluxos completos ficam cobertos na Tarefa 5.0, já que dependem das telas da Tarefa 4.0.

### Evidência de verificação

- `npx vitest run tests/unit/auth-actions.test.ts`: 16/16 passando, cobrindo `registerUser` (input inválido, e-mail duplicado, sucesso com senha hasheada e sign-in imediato, e-mail duplicado detectado só na hora de gravar por corrida entre requisições simultâneas, falha genérica no sign-in pós-cadastro), `loginWithCredentials` (credenciais erradas com mensagem genérica, sucesso com `rememberMe` propagado ao `signIn`), `requestPasswordReset` (e-mail inexistente, conta só-Google sem `passwordHash`, sucesso gerando token e enviando e-mail, falha silenciosa do Resend sem expor detalhe ao usuário, e falha do Resend que lança exceção em vez de retornar erro — resposta continua neutra) e `resetPassword` (token inexistente, expirado, já usado, e sucesso atualizando senha + marcando o token como usado via `$transaction`).
- `npx vitest run` (suíte completa): 39/39 passando (23 já existentes das Tarefas 1.0/2.0 + 16 novos).
- `npx eslint server/actions/auth.ts lib/mail/resend.ts tests/unit/auth-actions.test.ts`: sem erros.
- `npx tsc --noEmit`: sem erros.
- `npm run build` (Turbopack): sem erros nem avisos relacionados a esta tarefa.
- Pacote `resend` adicionado como nova dependência (`resend@6.18.0`), conforme previsto na techspec (seção "Dependências Técnicas").
- Nota técnica: a classe `AuthError` (usada para diferenciar erro de sign-in de outros erros inesperados) é importada de `"next-auth"`, o caminho documentado oficialmente — no teste unitário ela é mockada porque o pacote `next-auth` real depende de `next/server`, indisponível no ambiente do Vitest fora de uma app Next.js real.
- **Revisão independente (agente `general-purpose`, no papel de `@task-reviewer`)**: apontou dois problemas reais, ambos corrigidos antes de finalizar a tarefa:
  1. `requestPasswordReset` não protegia contra exceções (ex.: Resend indisponível) — se acontecesse só no caminho "conta existe com senha", a própria exceção vazava essa informação (quebrando o requisito 18). Corrigido: todo o bloco de geração de token/envio agora está em `try/catch`, sempre retornando `{ ok: true }` e apenas logando o erro no servidor.
  2. `registerUser` não tratava a corrida entre duas tentativas simultâneas de cadastro com o mesmo e-mail — a segunda `prisma.user.create` lançaria um erro genérico de banco (`P2002`) em vez da mensagem amigável de e-mail duplicado. Corrigido: `P2002` agora é capturado e tratado como duplicidade.
  - Um terceiro ponto (diferença de tempo de resposta entre o caminho "conta existe" e os demais, por causa da chamada de rede ao Resend) foi identificado como risco de baixa severidade e não exige correção nesta entrega — ataques de timing remoto contra essa diferença são de exploração difícil e adicionar atraso artificial seria complexidade desnecessária para o escopo desta tarefa.

## Arquivos relevantes

- `server/actions/auth.ts` (novo)
- `lib/mail/resend.ts` (novo)
- `tests/unit/auth-actions.test.ts` (novo)
- `.env` / `.env.example`
