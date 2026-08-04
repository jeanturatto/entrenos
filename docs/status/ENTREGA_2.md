# Entrega 2 — Design system e protótipo funcional

- **Status:** concluída
- **Data:** 03/08/2026
- **Escopo:** cliente universal Expo para iOS, Android e web

## Objetivo

Fixar a linguagem visual e os comportamentos básicos antes de multiplicar as telas de produto. A entrega estabelece componentes reutilizáveis, temas acessíveis e um protótipo navegável que não simula persistência inexistente.

## O que foi entregue

- tokens semânticos de cor, espaço, raio, tipografia, layout e movimento;
- temas automático, claro e escuro aplicados a todo o aplicativo;
- botões primário, secundário, discreto e destrutivo, incluindo estados desabilitado e carregando;
- campos com rótulo persistente, ajuda, foco visível, erro e estado desabilitado;
- cartões padrão, suave e de destaque;
- avisos de erro, sucesso, atenção e informação;
- estados vazio, carregando, erro, sucesso e informação;
- contêiner de tela responsivo com tratamento de área segura;
- modal de ação compatível com Expo SDK 54;
- catálogo interativo do sistema visual;
- protótipo navegável das áreas Início, Calendário, Organização e Nós;
- integração dos novos temas e componentes com autenticação, recuperação de senha, página pública, princípios e painel protegido.

## Rotas de validação

- `/design-system`: catálogo visual e estados dos componentes;
- `/prototype`: navegação entre os principais espaços do produto;
- `/prototype-action`: modal reutilizável para propostas, compromissos, tarefas, listas, gastos e convites.

As ações do protótipo validam formulário, erro e sucesso apenas no dispositivo. A interface informa explicitamente que nenhum dado de demonstração é enviado ao banco.

## Acessibilidade e responsividade

- alvos interativos com altura mínima de 48 px;
- campos com altura mínima de 52 px;
- rótulos e mensagens expostos à árvore de acessibilidade;
- grupos de tema e navegação com papéis semânticos;
- contraste automatizado mínimo de 4,5:1 para textos e ações;
- títulos responsivos e grades que reorganizam o conteúdo sem largura fixa;
- revisão visual em 390 × 844 px e 1440 × 900 px sem rolagem horizontal;
- fluxo modal validado por navegação, erro, preenchimento e sucesso.

## Verificações executadas

- Expo Doctor: 18/18 verificações aprovadas;
- lint: aprovado sem avisos;
- TypeScript: aprovado em todos os pacotes;
- testes: 24 aprovados, sendo 20 de contraste e 4 de domínio;
- exportação web estática: aprovada, com 17 rotas;
- exportação Android: aprovada;
- exportação iOS: aprovada;
- navegador: nenhum erro de aplicação no console durante os fluxos revisados.

## Banco de dados

Esta entrega não exigiu alteração de schema. O projeto remoto continua com as duas migrations já versionadas:

1. `20260803222315_initial_foundation`;
2. `20260803223616_harden_denied_tables_and_foreign_keys`.

Não foi criada migration vazia. A próxima alteração de banco deverá nascer em arquivo de migration, ser aplicada ao Supabase, validada e publicada no mesmo commit da funcionalidade correspondente.

## Próxima etapa

A Entrega 3 implementará identidade e vínculo do casal: cadastro completo, convite, aceite, recusa, expiração e encerramento seguro do vínculo, usando o design system desta entrega e persistência real protegida por RLS.
