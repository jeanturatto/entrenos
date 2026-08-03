# Plano Mestre de Desenvolvimento — EntreNós

## 1. Resumo executivo

O EntreNós será um aplicativo para duas pessoas organizarem a vida individual e compartilhada sem perder privacidade. O diferencial não é apenas reunir calendário, tarefas e finanças: é tratar qualquer ação conjunta como um fluxo explícito de consentimento, com proposta, resposta, contraproposta, histórico e regras de visibilidade.

O escopo original tem 40 seções, 53 telas obrigatórias e vários domínios de alta complexidade. Ele é uma excelente visão de produto e um bom backlog, mas não é seguro transformá-lo em uma única geração de código. O desenvolvimento será feito em fatias verticais: cada entrega terá interface, banco, regras, segurança, testes e documentação funcionando de ponta a ponta.

É possível entregar todo o código-fonte, migrations, regras de acesso, funções de servidor, testes, comandos, automações, documentação e configuração de implantação. A publicação definitiva também depende de itens externos pertencentes ao responsável pelo produto: contas Apple/Google, domínio, projeto de nuvem, credenciais, meios de pagamento, textos jurídicos revisados e aprovações das lojas.

“Sem falhas” não existe em software real. A meta profissional é reduzir muito a ocorrência e o impacto delas por meio de escopo progressivo, ambientes separados, revisão, testes automatizados, telemetria, backups e rollback.

## 2. Personas iniciais

### Persona A — casal com rotina compartilhada

Duas pessoas que moram juntas, dividem compras, tarefas, contas e compromissos. Precisam enxergar responsabilidades e saldo sem transformar o aplicativo em uma ferramenta de cobrança.

### Persona B — casal com agendas diferentes

Duas pessoas com rotinas profissionais incompatíveis. Precisam descobrir horários livres, propor encontros e visualizar bloqueios privados sem invadir detalhes pessoais.

### Persona C — casal à distância

Duas pessoas em fusos ou cidades diferentes. Precisam organizar chamadas, viagens, datas importantes e decisões de forma assíncrona.

O MVP será validado primeiro com A e B. A terceira persona influencia desde já o armazenamento em UTC e o suporte a fusos, mas não justifica antecipar localização ou integrações complexas.

## 3. Problemas resolvidos

- Compromissos conjuntos assumidos sem concordância explícita.
- Choques de agenda e eventos esquecidos.
- Falta de clareza na divisão de tarefas e despesas.
- Listas de compras duplicadas ou espalhadas.
- Decisões importantes perdidas em conversas.
- Exposição excessiva de compromissos pessoais.
- Ausência de histórico sobre mudanças relevantes.

## 4. Diferenciais do produto

- Consentimento como regra de domínio, não como texto decorativo.
- Privacidade em níveis: privado, somente ocupado, título visível ou detalhes compartilhados.
- Contraproposta versionada, sem alteração silenciosa do evento original.
- Mesmos direitos básicos para os dois membros.
- Histórico auditável para mudanças críticas e finanças.
- Jornada contínua: proposta → compromisso → tarefas/gastos → memória, sem exigir todos esses módulos na primeira versão.

## 5. O que o MVP realmente será

O primeiro produto publicável terá:

1. Cadastro e autenticação por e-mail, Google e Apple quando aplicável.
2. Criação do espaço e convite seguro do parceiro.
3. Vínculo aceito explicitamente e limitado inicialmente a duas pessoas.
4. Dashboard objetivo.
5. Calendário em lista, dia, semana e mês.
6. Eventos pessoais, privados e compartilhados.
7. Aceitar, recusar, talvez e criar contraproposta.
8. Detecção básica de choque de horário sem revelar dados privados.
9. Tarefas e lista de compras.
10. Gastos, divisão exata e saldo entre o casal.
11. Mensagens básicas e conversas ligadas a itens.
12. Datas importantes.
13. Notificações no aplicativo, push e e-mail para eventos críticos.
14. Exportação, exclusão de conta e desvinculação segura.
15. Cache local e fila de alterações para conexão instável nos fluxos essenciais.
16. Versões Android, iOS e web responsiva do mesmo produto.

### Fora do primeiro lançamento

- Sincronização bidirecional com Google, Apple e Outlook.
- Planejamento de refeições e receitas.
- Memórias, galeria e documentos.
- Localização em tempo real e alertas de chegada.
- Assistente de IA e leitura de imagens/comprovantes.
- Assinatura premium.
- Famílias, convidados e grupos com mais de duas pessoas.

Esses itens continuam no backlog. Retirá-los do MVP evita misturar riscos de calendário externo, localização, IA, pagamentos e conteúdo sensível antes de o fluxo central estar validado.

## 6. Arquitetura da informação

### Navegação principal

- **Início:** resumo do dia, pendências de decisão, próximos eventos, tarefas e saldo.
- **Calendário:** agenda, dia, semana, mês, propostas e disponibilidade.
- **Adicionar:** evento, proposta, tarefa, compra, gasto ou mensagem.
- **Organização:** tarefas, compras, finanças, decisões e datas importantes.
- **Nós:** conversa, perfil do casal, membros, privacidade, integrações e configurações.

### Áreas fora da barra principal

- Autenticação e recuperação.
- Onboarding e convite.
- Central de notificações.
- Busca.
- Exportação e encerramento.
- Ajuda e informações legais.

## 7. Mapa de telas do MVP

### Acesso e vínculo

Splash, boas-vindas, cadastro, login, recuperação, criação do espaço, envio do convite, aceite do convite, preferências e permissões.

### Núcleo

Dashboard, calendários, criação e detalhe de evento, resposta, contraproposta, conflitos e central de decisões.

### Organização

Listas, tarefas, compras, finanças, novo gasto, detalhe do gasto, saldo e datas importantes.

### Comunicação e conta

Conversas, notificações, perfil, privacidade, dispositivos, exportação, exclusão, desvinculação e ajuda.

Telas distintas no documento original poderão ser implementadas como estados ou etapas do mesmo fluxo quando isso reduzir complexidade sem prejudicar a usabilidade.

## 8. Stack recomendada

### Cliente universal

- Expo + React Native + Expo Router + TypeScript.
- Android, iOS e web a partir da mesma base de rotas e componentes.
- React Hook Form e Zod para formulários e validação compartilhada.
- TanStack Query para estado do servidor, cache e revalidação.
- Zustand apenas para estado transitório de interface quando necessário.
- Expo SQLite para cache local e fila de alterações offline.
- Internacionalização desde o início, inicialmente `pt-BR`.

### Backend do MVP

- Supabase gerenciado.
- PostgreSQL como fonte de verdade.
- Supabase Auth para identidade e sessões.
- Row Level Security (RLS) em todas as tabelas expostas.
- Realtime para atualizações do casal.
- Storage com políticas e URLs temporárias.
- Edge Functions/RPCs para operações críticas e transacionais.
- Jobs e tabela de outbox para recorrência, e-mail e notificações.

### Qualidade e operação

- ESLint, Prettier e TypeScript estrito.
- Testes unitários e de integração no domínio.
- Testes do banco e das políticas RLS.
- Playwright para os fluxos web.
- Testes E2E em builds móveis para os fluxos críticos.
- CI com lint, tipos, testes, migrations e build de validação.
- Monitoramento de erros, logs estruturados e alertas antes do beta público.

### Por que não começar com NestJS, Redis e vários serviços

Essa arquitetura seria válida em outra escala, mas criaria mais implantação, observabilidade, segredos e pontos de falha antes de haver usuários. O contrato de domínio será isolado para permitir extrair um backend dedicado ou workers quando volume, integrações ou requisitos de latência justificarem a mudança.

## 9. Estrutura inicial do projeto

```text
entrenos/
├── apps/
│   └── client/                 # Expo: Android, iOS e web
├── packages/
│   ├── domain/                 # tipos, regras e casos de uso puros
│   ├── ui/                     # design system compartilhado
│   ├── validation/             # esquemas Zod e contratos
│   └── config/                 # lint, TypeScript e ambiente
├── supabase/
│   ├── migrations/             # banco versionado
│   ├── functions/              # funções de servidor
│   ├── seed.sql                # dados locais não sensíveis
│   └── tests/                  # SQL, RLS e invariantes
├── tests/
│   └── e2e/                    # jornadas completas
├── docs/
│   ├── decisions/              # ADRs: decisões técnicas
│   ├── product/                # escopo e fluxos
│   └── runbooks/               # operação, backup e incidentes
├── .env.example                # nomes das variáveis, nunca segredos
├── package.json
└── pnpm-workspace.yaml
```

Não será adicionado um painel administrativo genérico no início. Operações administrativas serão definidas por caso, com MFA, autorização específica e auditoria; um “painel que acessa tudo” seria um risco desnecessário.

## 10. Modelo de dados inicial

### Identidade e espaço

- `profiles`
- `spaces`
- `space_members`
- `space_invitations`
- `user_devices`
- `consents`

### Calendário e decisões

- `events`
- `event_participants`
- `event_versions`
- `event_responses`
- `counterproposals`
- `decision_items`

### Organização

- `task_lists`
- `tasks`
- `task_assignees`
- `shopping_items`
- `important_dates`

### Finanças

- `transactions`
- `transaction_splits`
- `settlements`
- `financial_attachments`

Valores serão armazenados como unidades mínimas inteiras (`amount_minor`, por exemplo centavos) e acompanhados pelo código ISO da moeda. Nunca serão usados números de ponto flutuante para dinheiro.

### Comunicação e sistema

- `conversations`
- `conversation_members`
- `messages`
- `notifications`
- `notification_deliveries`
- `attachments`
- `audit_logs`
- `idempotency_keys`
- `outbox_events`
- `data_export_requests`
- `account_deletion_requests`

Quase toda entidade compartilhada conterá `space_id`. O acesso não será decidido apenas por esse campo: as políticas também verificarão membro ativo, propriedade, papel e visibilidade do conteúdo.

## 11. Regras técnicas que não podem ser negociadas

1. Nenhuma tabela exposta fica sem RLS e testes de isolamento.
2. IDs recebidos do cliente nunca bastam para autorizar uma operação.
3. Eventos privados retornam somente os campos permitidos para cada pessoa.
4. Respostas e contrapropostas são versionadas e transacionais.
5. Alterações importantes em evento confirmado reabrem a aprovação.
6. Operações financeiras usam idempotência, transação e log imutável.
7. Exclusão lógica e histórico serão usados onde auditoria for necessária.
8. Datas persistidas usam UTC mais o fuso relevante do evento/usuário.
9. Notificações são consequência de eventos persistidos; não definem a verdade do sistema.
10. Segredos ficam no servidor ou em armazenamento seguro, nunca no repositório ou bundle cliente.
11. Ambientes de desenvolvimento, homologação e produção usam bancos e credenciais diferentes.
12. Dados reais de usuários não são copiados para desenvolvimento.

## 12. Roadmap em entregas executáveis

Cada entrega termina com demonstração, testes e instruções reproduzíveis. Uma etapa só avança quando seu critério de pronto for atendido.

### Entrega 0 — Produto e decisões

**Objetivo:** converter a visão em especificação implementável.

**Produzir:** escopo do MVP, jornadas, mapa de estados, matriz de privacidade, modelo ER, riscos, critérios de aceitação e registro das decisões técnicas.

**Pronto quando:** não houver ambiguidade nos fluxos de convite, evento privado, proposta, contraproposta, dinheiro, exportação e desvinculação.

### Entrega 1 — Fundação executável

**Objetivo:** abrir o mesmo projeto no navegador, Android e iOS com uma base verificável.

**Produzir:** monorepo, Expo, Supabase local, ambientes, tema, navegação, scripts, CI, `.env.example`, primeira migration e página inicial de desenvolvimento.

**Pronto quando:** uma instalação limpa consegue executar lint, tipos, testes e o cliente web; builds de desenvolvimento móvel são gerados.

### Entrega 2 — Design system e protótipo funcional

**Objetivo:** fixar linguagem visual e comportamento antes de multiplicar telas.

**Produzir:** tokens, tipografia, cores acessíveis, espaçamentos, botões, campos, cartões, modal, estados vazios/erro/carregamento, tema claro/escuro e fluxos navegáveis principais.

**Pronto quando:** componentes passam por revisão responsiva, teclado, leitor de tela, contraste e tamanhos de toque.

### Entrega 3 — Identidade, autenticação e vínculo

**Objetivo:** duas contas reais formarem um espaço com segurança.

**Produzir:** cadastro, login, recuperação, perfil, criação do espaço, link/código de convite, aceite, expiração, cancelamento e auditoria.

**Pronto quando:** dois usuários de teste entram no mesmo espaço e um terceiro não consegue ler ou alterar nenhum dado dele.

### Entrega 4 — Fluxo central de calendário

**Objetivo:** completar a principal promessa do produto.

**Produzir:** evento pessoal/privado/compartilhado, visualizações essenciais, convite, aceitar/recusar/talvez, contraproposta comparada, reaprovação e conflito básico.

**Pronto quando:** os fluxos obrigatórios de jantar, compromisso pessoal e evento privado passam de ponta a ponta em dois dispositivos.

### Entrega 5 — Tarefas e compras

**Objetivo:** permitir organização cotidiana compartilhada.

**Produzir:** listas, tarefas, responsáveis, prazo, recorrência inicial, compras em tempo real e histórico essencial.

**Pronto quando:** alterações simultâneas não apagam silenciosamente o trabalho do parceiro e o modo offline sincroniza ao reconectar.

### Entrega 6 — Finanças compartilhadas

**Objetivo:** registrar despesas sem erro de arredondamento ou saldo.

**Produzir:** gasto, pagador, divisão igual/personalizada, comprovante, saldo, estorno/correção e auditoria.

**Pronto quando:** testes cobrem arredondamentos, moedas, duplicidade, edição, exclusão auditada e o fluxo de supermercado.

O módulo será um organizador de despesas, não uma conta bancária nem intermediador de pagamentos no MVP.

### Entrega 7 — Comunicação e notificações

**Objetivo:** avisar e contextualizar decisões sem depender de outro aplicativo.

**Produzir:** mensagens básicas, conversas por contexto, central de notificações, preferências, push/e-mail, tentativas e deduplicação.

**Pronto quando:** convite, resposta, mudança importante e tarefa crítica geram apenas os avisos autorizados e podem ser rastreados.

### Entrega 8 — Privacidade, LGPD e encerramento

**Objetivo:** tornar direitos e consentimentos recursos reais do produto.

**Produzir:** central de privacidade, dispositivos/sessões, revogação, exportação, exclusão, desvinculação, retenção e runbooks.

**Pronto quando:** exportação é legível, exclusão respeita retenções justificadas, localização inexistente no MVP não é coletada e a desvinculação revoga acessos.

Uma revisão jurídica independente ainda será necessária antes da operação pública.

### Entrega 9 — Resiliência e segurança

**Objetivo:** validar comportamento fora do “caminho feliz”.

**Produzir:** fila offline, idempotência, resolução de conflitos, limites de requisição, validação de arquivos, backups, restauração testada, telemetria e revisão de ameaças.

**Pronto quando:** queda de rede, repetição de requisição, sessão revogada, arquivo malformado e acesso cruzado têm testes e resposta segura.

### Entrega 10 — Beta e publicação

**Objetivo:** disponibilizar uma versão controlada e reversível.

**Produzir:** homologação, dados de demonstração, builds assinadas, política/termos, ficha das lojas, grupo beta, métricas, suporte e plano de rollback.

**Pronto quando:** checklist de lançamento passa, incidentes têm responsáveis e uma versão anterior pode ser restaurada.

## 13. Plano de testes

### Em cada alteração

- Formatação, lint e TypeScript estrito.
- Unitários das regras alteradas.
- Integração do caso de uso com banco local.
- Teste da política RLS para usuário correto, parceiro, terceiro e sessão anônima.

### Em cada entrega

- Fluxo feliz e fluxos de erro.
- Duas sessões simultâneas.
- Web responsiva e build móvel.
- Tema claro/escuro e acessibilidade.
- Rede lenta, offline e repetição de ações.
- Migração aplicada em banco vazio e em banco com versão anterior.

### Antes de produção

- Sete fluxos do prompt original automatizados quando seus módulos existirem.
- Testes de isolamento entre espaços.
- Modelo de ameaças e checklist OWASP.
- Restauração de backup ensaiada.
- Exportação/exclusão ensaiadas.
- Teste beta com usuários que não participaram do desenvolvimento.

## 14. Ambientes e contas externas

### Local

Executa no computador com banco local e dados fictícios. É o ambiente de desenvolvimento e testes rápidos.

### Desenvolvimento compartilhado

Usado por builds internas. Pode ser recriado e nunca recebe dados reais importantes.

### Homologação

Espelho funcional de produção para testes de release, com suas próprias chaves e banco.

### Produção

Somente usuários reais. Acesso restrito, backups, alertas, auditoria e mudanças por migration/CI.

Serão necessárias, no momento adequado: conta Supabase, conta Expo, Apple Developer, Google Play Console, domínio/DNS, provedor de e-mail e monitoramento. Nenhuma senha será solicitada em chat ou gravada no código; o usuário fará login nos provedores e os segredos irão para cofres próprios.

## 15. Estratégia de branches e releases

- `main` sempre executável e protegida.
- Branch pequena por entrega/correção.
- Pull request com testes e resumo de risco.
- Migration revisada junto com a mudança de código.
- Versões de preview para validação.
- Release promovida de homologação para produção.
- Feature flags para recursos incompletos ou de risco.

## 16. Critério global de pronto

Uma funcionalidade só está pronta quando:

- possui regra de negócio implementada no lugar correto;
- tem autorização e privacidade testadas;
- funciona em web e nos alvos móveis definidos;
- mostra carregamento, vazio, erro, sucesso e falta de conexão;
- é acessível nos requisitos aplicáveis;
- possui testes proporcionais ao risco;
- registra ações críticas;
- não expõe segredos nem dados de outro espaço;
- tem migration, documentação e comando reproduzível;
- foi validada contra critérios de aceitação observáveis.

## 17. Evolução após o MVP

### Fase 2

Calendários externos, disponibilidade avançada, encontros, orçamentos, contas recorrentes, refeições, receitas, memórias, documentos, widgets e offline ampliado.

### Fase 3

IA com permissões, leitura de comprovantes, importação por imagem, localização temporária, retrospectivas, grupos maiores e integrações externas.

Cada módulo futuro passa novamente por descoberta, ameaça, privacidade, protótipo, implementação, testes e lançamento controlado. O prompt original permanece como visão; este plano determina a ordem segura de execução.
