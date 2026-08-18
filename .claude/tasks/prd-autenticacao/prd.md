# PRD — Autenticação (Login, Cadastro e Recuperação de Senha)

## Visão Geral

O sistema financeiro ainda não possui nenhuma forma de as pessoas acessarem a plataforma de forma identificada e segura. Esta funcionalidade cria a porta de entrada do produto: uma pessoa precisa conseguir criar uma conta, entrar nela (com e-mail/senha ou com sua conta Google) e recuperar o acesso caso esqueça a senha.

Como se trata de um sistema financeiro, a confiança no acesso é a base de tudo o que vem depois — sem um login confiável, nenhuma outra tela (dados financeiros, dashboards, relatórios) pode ser considerada segura. Esta primeira etapa entrega **apenas** as telas e regras de autenticação; nenhuma outra parte do sistema (dashboard, telas de dados financeiros, etc.) faz parte deste documento.

## Objetivos

- Permitir que uma nova pessoa crie uma conta e comece a usar o sistema em poucos passos, sem fricção desnecessária.
- Garantir que apenas quem tem as credenciais corretas (ou está autenticado via Google) consiga acessar uma conta.
- Reduzir abandono no cadastro: liberar acesso imediato após o cadastro, sem etapa de confirmação de e-mail bloqueando a entrada.
- Garantir que ninguém fique "trancado para fora" da própria conta: fluxo de recuperação de senha simples e funcional.
- Como é sucesso: uma pessoa nova consegue se cadastrar, sair, entrar de novo, e recuperar a senha sem precisar de suporte manual.

## Histórias de Usuário

- Como uma pessoa nova no sistema, eu quero criar uma conta com nome, e-mail e senha, para começar a usar a plataforma imediatamente.
- Como uma pessoa nova no sistema, eu quero poder me cadastrar/entrar usando minha conta Google, para não precisar criar e lembrar de mais uma senha.
- Como uma pessoa que já tem conta, eu quero entrar com meu e-mail e senha (ou com Google), para acessar meus dados financeiros.
- Como uma pessoa que já tem conta, eu quero marcar "lembrar de mim" ao entrar, para não precisar digitar login e senha toda vez que abro o sistema no mesmo computador.
- Como uma pessoa que esqueceu a senha, eu quero solicitar um link de redefinição por e-mail, para criar uma nova senha e voltar a acessar minha conta.
- Como uma pessoa que se cadastrou com e-mail/senha, eu quero também poder entrar com Google usando o mesmo e-mail, para que o sistema reconheça que é a mesma conta, sem duplicar meu cadastro.

## Funcionalidades Principais

### 1. Cadastro (criação de conta)

Permite que uma nova pessoa crie uma conta individual informando nome, e-mail e senha. O acesso é liberado imediatamente após o cadastro, sem etapa de confirmação de e-mail.

Requisitos funcionais:
1. O cadastro deve solicitar nome, e-mail e senha (com confirmação de senha).
2. O sistema deve impedir cadastro com um e-mail que já possui conta, informando isso de forma clara para a pessoa.
3. A senha deve atender critérios mínimos de segurança (comprimento e composição), comunicados claramente à pessoa durante o preenchimento.
4. Após o cadastro bem-sucedido, a pessoa deve ser levada diretamente para dentro do sistema, já autenticada — sem etapa intermediária de confirmação de e-mail.
5. O cadastro deve oferecer também a opção "Cadastrar-se com Google" como alternativa ao formulário de nome/e-mail/senha.
6. O formulário deve exibir mensagens de erro claras e específicas para cada campo inválido (ex.: e-mail em formato inválido, senha fraca, senhas não conferem).

### 2. Login (entrada na conta)

Permite que uma pessoa já cadastrada acesse sua conta com e-mail/senha ou com sua conta Google.

Requisitos funcionais:
7. A tela de login deve solicitar e-mail e senha.
8. A tela de login deve oferecer a opção "Entrar com Google" como alternativa ao e-mail/senha.
9. Deve existir a opção "lembrar de mim" no login por e-mail/senha, mantendo a pessoa autenticada por um período estendido no mesmo dispositivo quando marcada; quando não marcada, a sessão segue a duração padrão do sistema.
10. Se a pessoa informar e-mail ou senha incorretos, o sistema deve exibir uma mensagem de erro genérica (sem indicar se o problema foi o e-mail ou a senha), para não facilitar tentativas de descoberta de contas existentes.
11. A tela de login deve conter um link visível para a tela de recuperação de senha ("Esqueci minha senha").
12. A tela de login deve conter um link visível para a tela de cadastro, para quem ainda não tem conta.
13. Não há bloqueio por número de tentativas incorretas nesta primeira versão.

### 3. Login com Google

Permite entrar ou se cadastrar usando a conta Google da pessoa, como alternativa ao fluxo de e-mail/senha.

Requisitos funcionais:
14. Ao autenticar com Google pela primeira vez, se o e-mail da conta Google não corresponder a nenhuma conta existente, uma nova conta deve ser criada automaticamente com os dados básicos vindos do Google (nome e e-mail).
15. Ao autenticar com Google, se o e-mail da conta Google já corresponder a uma conta existente (criada originalmente por e-mail/senha), o sistema deve reconhecer e vincular automaticamente essa autenticação à conta existente, sem criar uma conta duplicada e sem exigir senha.
16. A pessoa deve poder usar Google tanto na tela de login quanto na tela de cadastro — ambas levam ao mesmo resultado (entrar ou criar conta conforme o caso).

### 4. Recuperação de senha

Permite que uma pessoa que esqueceu a senha recupere o acesso à própria conta, por meio de um link enviado por e-mail.

Requisitos funcionais:
17. Deve existir uma tela onde a pessoa informa o e-mail da conta para solicitar a redefinição de senha.
18. Após informar o e-mail, o sistema deve exibir uma mensagem de confirmação de envio (ex.: "se este e-mail existir em nossa base, você receberá um link"), sem revelar se aquele e-mail está ou não cadastrado — evitando expor quais e-mails têm conta no sistema.
19. A pessoa deve receber um e-mail com um link para uma tela de redefinição de senha.
20. O link de redefinição deve ter um tempo de validade limitado, após o qual deixa de funcionar e a pessoa precisa solicitar um novo link.
21. Na tela de redefinição, a pessoa deve informar a nova senha (com confirmação), respeitando os mesmos critérios mínimos de segurança do cadastro.
22. Após redefinir a senha com sucesso, a pessoa deve ser informada claramente de que a senha foi alterada e direcionada para a tela de login.
23. Contas criadas exclusivamente via Google (sem senha própria) não se aplicam a este fluxo — a recuperação de senha é específica para contas com login por e-mail/senha.

## Experiência do Usuário

- **Personas**: usuário final individual do sistema financeiro, que já está familiarizado com fluxos comuns de login/cadastro de outros produtos (padrão de mercado esperado).
- **Fluxos principais**: cadastro → acesso imediato ao sistema; login → acesso ao sistema; esqueci senha → e-mail com link → nova senha → login.
- **Consistência visual**: as três telas (login, cadastro, recuperação de senha) devem seguir integralmente o design system já definido para o projeto (tema escuro por padrão com alternativa clara, tipografia, cores, espaçamento e componentes documentados em `docs/design-system.md`), sem introduzir estilos ou componentes fora desse padrão.
- **Feedback ao usuário**: todo envio de formulário deve ter estado de carregamento visível, e todo erro (de validação ou de servidor) deve ser comunicado em linguagem simples, sem termos técnicos ou códigos de erro crus.
- **Acessibilidade**: campos com rótulos associados corretamente, navegação completa por teclado, contraste de texto adequado nos dois temas, e mensagens de erro anunciadas de forma acessível para leitores de tela.
- **Responsividade**: as três telas devem funcionar corretamente em celular, tablet e desktop.

## Restrições Técnicas de Alto Nível

- Autenticação via Google exige integração com o provedor OAuth do Google (Google Identity/Google Cloud), incluindo o cadastro do aplicativo junto ao Google para obtenção de credenciais.
- Senhas de contas criadas por e-mail/senha nunca podem ser armazenadas em texto puro — armazenamento deve seguir práticas de segurança adequadas para dados de autenticação de um sistema financeiro.
- O envio do e-mail de recuperação de senha depende de um serviço de envio de e-mail transacional configurado para o projeto.
- Os dados de conta (pessoa usuária) são dados sensíveis e devem ser tratados com o mesmo cuidado descrito para o banco de dados do projeto (PostgreSQL via Prisma) — qualquer alteração de schema que possa afetar dados de contas já existentes segue a mesma exigência de confirmação explícita já definida para o projeto.
- Este é o primeiro conjunto de telas do sistema; ainda não existe estrutura de contas de usuário no banco de dados — sua criação faz parte do trabalho técnico decorrente deste PRD (detalhado posteriormente na especificação técnica, não aqui).

## Fora de Escopo

- Qualquer tela além de login, cadastro e recuperação de senha (dashboard, telas de dados financeiros, perfil de usuário, configurações de conta) — ficam para etapas futuras.
- Contas empresariais/organizacionais com múltiplos usuários por conta, convites de equipe ou papéis/permissões — este momento cobre apenas conta individual.
- Login social com outros provedores além do Google (ex.: Microsoft, Apple, Facebook).
- Confirmação obrigatória de e-mail antes do primeiro acesso — decidido que o acesso é liberado imediatamente após o cadastro.
- Bloqueio de conta por tentativas de senha incorretas ou qualquer outro mecanismo de rate limiting de login — não faz parte desta primeira versão.
- Autenticação em duas etapas (2FA/verificação por SMS ou aplicativo autenticador).
- Edição de dados de perfil (troca de nome, e-mail, senha, foto) após o cadastro — pertence a uma futura tela de "conta"/"perfil".
- Exclusão de conta ou desativação de conta.

## Questões em Aberto

- O cadastro deve incluir aceite obrigatório de Termos de Uso e Política de Privacidade (checkbox)? Este PRD assume que sim, como prática padrão para sistemas que lidam com dados financeiros, mas os textos desses documentos ainda não existem e precisam ser criados/aprovados antes da entrega final.
- Qual deve ser a duração exata da sessão padrão e da sessão estendida por "lembrar de mim"? Ficará definido na especificação técnica, mas vale confirmar expectativa (ex.: sessão padrão de algumas horas/dias, estendida de 30 dias) antes da implementação.
- Existe necessidade de um e-mail de boas-vindas após o cadastro, separado do fluxo de recuperação de senha? Não foi solicitado, mas é uma prática comum.
- Não há, por enquanto, um link/protótipo de Figma fornecido para estas telas — a implementação deve seguir o design system documentado (`docs/design-system.md`) em vez de um layout específico. Caso um link do Figma seja fornecido antes da implementação, ele deve ser seguido como referência visual exata, via Figma MCP.
