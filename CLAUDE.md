@AGENTS.md
# CLAUDE.md — Guia de Trabalho deste Projeto

> Este arquivo é lido automaticamente pelo Claude Code no início de cada sessão neste repositório. Ele define como você deve se comportar: como interpretar pedidos, quais padrões técnicos e visuais seguir, e como se comunicar com quem está pedindo as mudanças. Estas regras têm prioridade sobre qualquer atalho ou suposição que pareça mais rápida no momento.

## Quem vai trabalhar com você aqui

As pessoas que vão pedir alterações e novas funcionalidades neste projeto **não são desenvolvedoras**. Elas descrevem o que querem em linguagem do dia a dia — "quero uma tela pra ver os gastos do mês", "esse botão tá feio, deixa mais chamativo", "adiciona um campo de telefone aqui", "isso quebrou, conserta". Você é quem traduz esses pedidos em decisões técnicas e de design consistentes com o que já existe. Nunca espere que a pessoa fale a sua língua técnica, e nunca responda com termos técnicos sem traduzir.

## Regras detalhadas (leia antes de começar qualquer tarefa)

- @docs/rules/comunicacao.md — como conversar com quem não é técnico, como esclarecer pedidos ambíguos
- @docs/rules/design-system.md — padrões visuais obrigatórios do projeto
- @docs/rules/stack-tecnica.md — padrões técnicos, estrutura de código e banco de dados
- @docs/rules/processo-de-trabalho.md — fluxo de trabalho, versionamento, testes, segurança dos dados

## As regras inegociáveis

1. **Pedido ambíguo nunca vira código direto.** Sempre que um pedido puder ser interpretado de mais de um jeito, pare e confirme antes de mexer — mas nunca devolva a pergunta em aberto. Traga junto uma sugestão concreta, em linguagem simples, baseada no que já existe no projeto, para a pessoa só confirmar ou ajustar.
2. **O padrão visual do projeto não é opcional.** Todo componente novo segue o design system documentado em `docs/rules/design-system.md`. Não é permitido usar componentes shadcn/ui sem customização na interface final — isso é considerado um erro de execução, não um detalhe de estilo.
3. **O projeto nunca fica em estado quebrado.** Antes de avisar que um pedido foi concluído, rode lint, build e testes. Se algo quebrar, conserte antes de reportar. Quem vai usar o projeto não tem como diagnosticar um erro técnico sozinho.
4. **Dados reais merecem cuidado extra.** O banco é PostgreSQL real via Prisma — qualquer alteração que possa apagar ou modificar dados existentes (migration destrutiva, exclusão em massa, reset de tabela) precisa de confirmação explícita, explicada em linguagem simples sobre o que será perdido.
5. **Todo pedido termina com um resumo em português simples** do que foi feito, sem jargão técnico, como se estivesse explicando para alguém que nunca programou.