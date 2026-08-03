# Playbook para construir futuros aplicativos

Este roteiro serve para qualquer app e evita o erro comum de começar por dezenas de telas antes de validar dados, regras e operação.

## Passo 1 — Escreva o problema, não apenas a ideia

Responda em uma página:

- Para quem é o produto?
- Qual problema frequente ele resolve?
- Como as pessoas resolvem isso hoje?
- Qual ação representa o principal valor?
- Qual resultado mostrará que funcionou?

**Saída:** visão curta, personas e hipótese de valor.

## Passo 2 — Transforme desejos em jornadas

Para cada funcionalidade importante, escreva começo, decisões, final e erros possíveis. Exemplo genérico: usuário cria → sistema valida → outra pessoa responde → sistema confirma → ambos visualizam.

**Saída:** jornadas com critérios observáveis, não apenas nomes de telas.

## Passo 3 — Escolha um MVP pequeno e completo

O MVP deve terminar uma jornada real. “Ter login, dashboard e 30 telas vazias” não é MVP. Prefira uma única jornada com interface, banco, regra, segurança e teste.

Classifique o backlog:

- **Agora:** necessário para entregar o valor central.
- **Depois:** melhora o valor, mas não bloqueia validação.
- **Talvez:** hipótese ainda sem evidência.
- **Não faremos:** fora da estratégia atual.

**Saída:** fronteira explícita do primeiro lançamento.

## Passo 4 — Identifique risco antes da tecnologia

Liste riscos de:

- privacidade e dados sensíveis;
- dinheiro ou cálculos irreversíveis;
- permissões entre usuários;
- integrações externas;
- offline e concorrência;
- escala/custo;
- leis e políticas de loja;
- fraude, abuso e suporte.

Quanto maior o risco, mais cedo deve existir um protótipo técnico e teste automatizado.

**Saída:** registro de riscos com mitigação e responsável.

## Passo 5 — Desenhe dados e estados

Defina entidades, relações, propriedade e ciclo de vida. Para cada objeto, responda:

- Quem cria?
- Quem pode ler?
- Quem pode alterar ou excluir?
- Quais estados existem?
- Que transições são permitidas?
- O que precisa de histórico?
- O que ocorre ao encerrar uma conta?

**Saída:** diagrama ER, matriz de acesso e máquinas de estado.

## Passo 6 — Escolha a stack pelo contexto

Avalie experiência da equipe, plataformas, offline, integrações, custo e operação. Prefira tecnologia estável, documentada e com menos serviços no início. Não adote microserviços, filas ou bancos extras sem uma necessidade mensurável.

Registre cada decisão relevante em um ADR curto:

1. contexto;
2. opções;
3. decisão;
4. consequências;
5. condição para reconsiderar.

**Saída:** arquitetura e decisões justificadas.

## Passo 7 — Prepare ambientes reproduzíveis

Crie local, desenvolvimento, homologação e produção separados. Versione migrations e um `.env.example`, mas nunca segredos. Use dados fictícios fora de produção.

Todo iniciante deve conseguir seguir o README e executar:

```text
instalar dependências
subir serviços locais
aplicar migrations
carregar dados de exemplo
iniciar o app
rodar os testes
```

Os comandos exatos dependem da stack e devem ser copiados e testados em uma máquina limpa.

**Saída:** repositório que nasce executável.

## Passo 8 — Crie um design system mínimo

Antes das telas, defina cor, tipografia, espaçamento, ícones, botões, campos e feedbacks. Inclua desde o início:

- carregamento;
- conteúdo vazio;
- erro e tentativa novamente;
- sucesso;
- falta de permissão;
- offline;
- acessibilidade;
- telas pequenas e grandes.

**Saída:** biblioteca pequena de componentes testados.

## Passo 9 — Implemente em fatias verticais

Cada fatia atravessa todas as camadas:

```text
tela → validação → caso de uso → banco → autorização → teste → telemetria
```

Uma boa primeira fatia costuma ser cadastro + criação do objeto central + leitura segura. Evite criar todo o frontend primeiro e “ligar o backend depois”.

**Saída:** incremento demonstrável ao fim de cada etapa.

## Passo 10 — Automatize qualidade cedo

No mínimo, a integração contínua deve verificar:

- formatação;
- lint;
- tipos;
- testes unitários;
- testes de integração;
- migrations;
- build.

Permissões, dinheiro e exclusão exigem testes adicionais. Testes E2E cobrem poucas jornadas críticas; não precisam repetir todas as combinações já cobertas em níveis menores.

**Saída:** mudança insegura não chega silenciosamente à branch principal.

## Passo 11 — Projete operação e incidentes

Antes do lançamento, responda:

- Como detectar erros?
- Quem recebe o alerta?
- Como voltar uma versão?
- Como restaurar um backup?
- Como revogar uma chave?
- Como atender exportação/exclusão?
- Como avisar usuários em um incidente?

**Saída:** monitoramento, backup testado e runbooks simples.

## Passo 12 — Faça beta controlado

Use poucos usuários reais, ambiente de produção protegido, métricas mínimas e canal de suporte. Observe conclusão da jornada principal, erros, abandono e dúvidas. Não aumente o escopo antes de corrigir os problemas do núcleo.

**Saída:** evidência para decidir o próximo investimento.

## Passo 13 — Publique com checklist e rollback

Verifique lojas, domínio, políticas, acessibilidade, segurança, custos, alertas, backups e versão anterior recuperável. Publique gradualmente quando a plataforma permitir.

**Saída:** release rastreável e reversível.

## Passo 14 — Evolua por evidência

Depois do lançamento, priorize usando impacto, frequência, risco e esforço. Novos recursos voltam ao Passo 2; eles não entram direto no código só porque parecem interessantes.

## Modelo de pedido para trabalhar com Codex

Em vez de pedir “faça o app inteiro”, use entregas verificáveis:

```text
Contexto: [visão e usuário]
Entrega atual: [uma fatia vertical]
Dentro do escopo: [itens]
Fora do escopo: [itens]
Regras obrigatórias: [negócio, privacidade, segurança]
Critérios de aceite: [resultados observáveis]
Ambiente: [stack e comandos existentes]
Verificação: [testes e plataformas]
Documentação: registre setup, migrations e decisões.
```

Ao final de cada entrega, peça sempre:

- resumo do que funciona;
- arquivos alterados;
- comandos realmente executados;
- testes e resultados;
- riscos ou limitações restantes;
- próxima menor entrega recomendada.
