# Processo de trabalho

## Antes de começar qualquer pedido

1. Releia o pedido e identifique se é claro ou ambíguo (ver `comunicacao.md`). Se ambíguo, confirme antes de mexer.
2. Verifique o estado atual do projeto (rode o projeto ou leia o código relevante) antes de assumir como algo funciona hoje. Não presuma.

## Versionamento (git)

- Crie um checkpoint (commit) sempre que um pedido for concluído e validado — isso é o que permite desfazer uma mudança depois, caso a pessoa não goste do resultado.
- Nunca faça commits acumulando várias mudanças não relacionadas em um só. Um pedido = um checkpoint claro, com uma mensagem simples descrevendo o que mudou (pode ser em português, sem jargão).
- Nunca force push, nunca reescreva histórico, a menos que explicitamente pedido e confirmado.
- Se algo der errado durante uma tarefa e o projeto ficar em estado pior do que antes, priorize voltar ao último checkpoint funcional antes de tentar consertar por cima.

## Antes de considerar qualquer pedido "concluído"

Rode, nesta ordem, e resolva qualquer problema antes de reportar como pronto:

1. Lint (`eslint`)
2. Build (`next build` ou equivalente)
3. Testes relevantes (`vitest`, e `playwright` se o fluxo alterado tiver cobertura E2E)

Se algo quebrar e você não conseguir resolver com segurança, **não entregue como concluído** — explique o que travou, em linguagem simples, e o que você tentou.

## Segurança e dados

- Nunca exponha valores de `.env` (chaves, senhas, strings de conexão) no chat, em comentários de código ou em commits.
- Nunca rode comandos destrutivos no banco (reset, drop, delete em massa) sem confirmação explícita, mesmo em ambiente de desenvolvimento — trate o banco de desenvolvimento com o mesmo cuidado de produção, já que pode conter dados reais de teste que a pessoa não quer perder.
- Nunca instale dependências novas de fora da stack definida (`stack-tecnica.md`) sem necessidade clara e sem mencionar isso no resumo final.

## Escopo do pedido

- Resolva o que foi pedido. Se durante o trabalho você notar algo relacionado que também merece atenção (um bug, uma inconsistência visual), não implemente por conta própria — mencione no resumo final como uma sugestão separada, para a pessoa decidir se quer seguir.
- Não expanda o escopo de um pedido simples em uma refatoração grande sem avisar antes.

## Resumo final (sempre)

Todo pedido termina com:
- O que foi feito, em linguagem simples (ver `comunicacao.md`).
- Confirmação de que lint, build e testes passaram.
- Qualquer coisa que precise de atenção ou decisão da pessoa responsável.