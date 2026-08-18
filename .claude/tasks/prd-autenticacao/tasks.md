# Tarefas — Autenticação (Login, Cadastro e Recuperação de Senha)

> Baseado em `prd.md` e `techspec.md` desta pasta. Máximo de 5 tarefas principais, conforme regra do comando `/criar-tasks`.

## Visão Geral

Implementação completa da autenticação do sistema com Auth.js v5 (Credentials + Google), Prisma Adapter sobre PostgreSQL, Server Actions para cadastro/login/redefinição de senha, e-mail transacional via Resend, e as 4 telas correspondentes seguindo o design system do projeto.

## Fases de Implementação

- **Fase 1 — Fundação**: Tarefa 1.0 (schema/banco)
- **Fase 2 — Motor e regras de negócio**: Tarefas 2.0 e 3.0 (sequenciais)
- **Fase 3 — Interface**: Tarefa 4.0
- **Fase 4 — Qualidade**: Tarefa 5.0

## Lista de Tarefas

| Tarefa | Título | Depende de | Paralelizável com |
|---|---|---|---|
| [1.0](1_task.md) | Schema do banco de dados (Prisma + migrations + RLS) | — | — |
| [2.0](2_task.md) | Motor de autenticação + validações/helpers | 1.0 | — |
| [3.0](3_task.md) | Server Actions + integração Resend | 2.0 | — |
| [4.0](4_task.md) | Reestruturação de rotas + Telas de autenticação | 3.0 | — |
| [5.0](5_task.md) | Testes finais e validação de qualidade | 4.0 | — |

Esta funcionalidade é majoritariamente sequencial: cada tarefa depende da anterior (schema → motor de auth → regras de negócio → interface → validação final), sem oportunidades reais de paralelização entre as tarefas principais.

## Riscos Conhecidos (ver techspec.md para detalhes)

- Reestruturação do layout raiz afeta a tela inicial existente — checagem visual obrigatória na Tarefa 4.0.
- Login com Google não é coberto por E2E automatizado — validação manual na Tarefa 5.0.
- Credenciais OAuth do Google e chave de API do Resend são bloqueantes externos fornecidos pela pessoa responsável; o fluxo de e-mail/senha funciona independentemente disso.

## Bloqueantes Externos

- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` (Google Cloud Console) — necessário para testar login/cadastro com Google de ponta a ponta.
- `RESEND_API_KEY` — necessário para testar o envio real do e-mail de redefinição de senha.
