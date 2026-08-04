# Entrega 2 — Modo cliente para publicação

- **Status:** concluído
- **Versão:** 0.2.0
- **Data:** 04/08/2026
- **Destino:** web de produção no Expo, com a mesma base para iOS e Android

## Objetivo

Transformar o catálogo e o protótipo da Entrega 2 em uma experiência que possa ser apresentada diretamente a clientes. A publicação não deve exibir termos internos, dados simulados ou atalhos de desenvolvimento.

## Comportamento de publicação

O aplicativo agora usa `client` como modo padrão, mesmo quando nenhuma variável é configurada. Nesse modo:

- a página inicial apresenta a proposta real do EntreNós;
- cadastro, entrada, recuperação de senha e área protegida continuam funcionais;
- o catálogo visual e o protótipo interno não aparecem na navegação;
- acessos diretos a `/design-system`, `/prototype` e `/prototype-action` retornam à página inicial;
- a área protegida não oferece links para simuladores;
- os textos deixam claro quais recursos já existem e quais dependem das próximas entregas.

O laboratório pode ser liberado somente em desenvolvimento com:

```env
EXPO_PUBLIC_APP_MODE=studio
```

## Página pública

A página de cliente inclui:

- cabeçalho responsivo com entrada e cadastro;
- apresentação da proposta do produto;
- explicação de privacidade, consentimento e igualdade;
- início transparente em três etapas;
- chamada final para cadastro;
- seletor de tema automático, claro e escuro;
- título, descrição e metadados sociais para a versão web.

## Segurança e banco

Nenhuma mudança de schema foi necessária. O Supabase permanece saudável e com as migrations `initial_foundation` e `harden_denied_tables_and_foreign_keys` já versionadas.

A publicação usa somente a URL do projeto e a chave pública do cliente. Chaves secretas ou `service_role` não fazem parte do bundle.

## Publicação repetível

O comando abaixo exporta a web e cria uma implantação de produção no EAS Hosting:

```bash
pnpm deploy:web:production
```

O fluxo deve ser executado somente depois de lint, TypeScript, testes, Expo Doctor e exportações web/mobile aprovarem a mesma revisão.
