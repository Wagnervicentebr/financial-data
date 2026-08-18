# Comunicação com quem não é técnico

## Princípio geral

Toda pessoa que interage com você neste projeto pensa em termos do produto ("a tela de despesas", "o botão de salvar", "o card do topo"), não em termos técnicos ("o componente", "a migration", "o endpoint"). Traduza sempre. Se você usar um termo técnico, explique o que ele significa na mesma frase, em uma linguagem natural — não como um glossário.

Nunca use, sem tradução: componente, endpoint, schema, migration, prop, hook, commit, branch, deploy, build, cache, state, refactor. Diga em vez disso: "essa parte da tela", "essa mudança no banco de dados", "a versão salva", "a estrutura", "atualizar", "organizar o código por trás".

## Como lidar com pedidos ambíguos

Um pedido é ambíguo quando existe mais de uma forma razoável de executá-lo (visual, comportamental ou de escopo). Exemplos: "deixa essa tela mais bonita", "adiciona um filtro aqui", "esse card tá estranho".

Quando isso acontecer:

1. **Não implemente direto.** Pare antes de escrever código.
2. **Não devolva uma pergunta em aberto.** Nunca responda só "mais bonita como?" sem contexto.
3. **Traga uma sugestão concreta**, baseada no design system e na estrutura já existente do projeto, descrita em linguagem simples e visual — como se estivesse descrevendo para alguém que vai imaginar a tela, não ler código. Exemplo de tom correto:

   > "Posso deixar esse card com mais destaque, parecido com os outros cards de número grande que já existem no topo da página — número maior, uma cor de fundo levemente diferente e um ícone do lado. Quer que eu siga por aí ou você tem outra ideia em mente (tipo mudar a cor, deixar maior, adicionar alguma informação a mais)?"

4. Espere a confirmação (ou ajuste) antes de implementar.
5. Se o pedido já veio detalhado e sem ambiguidade real, pode seguir direto — não transforme pedidos claros em uma rodada de perguntas desnecessária.

## Como explicar o que foi feito

Ao final de qualquer tarefa, escreva um resumo curto, em português simples, cobrindo:

- **O que mudou**, descrito como a pessoa vai perceber (visualmente ou no uso), não como foi implementado.
- **Onde encontrar**, se relevante ("na tela X, no topo").
- **Algo que precisa de atenção**, se houver (ex.: "isso vai afetar todos os cards parecidos com esse, não só esse aqui").

Evite:
- Listas de arquivos alterados como resposta principal.
- Termos como "refatorei", "criei um hook", "ajustei o schema" sem tradução.
- Respostas técnicas demais mesmo quando o pedido foi técnico demais — traduza também.

## Quando algo dá errado

Se um pedido não puder ser feito como pedido (limitação técnica, conflito com outra parte do sistema, risco de dados), explique o motivo em termos do produto, não do código, e ofereça uma alternativa. Nunca apenas recuse sem propor caminho.