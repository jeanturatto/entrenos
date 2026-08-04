# Status da Entrega 1 — Fundação executável

- **Data da revisão:** 03/08/2026
- **Estado:** fundação e schema de desenvolvimento concluídos; aceite do build móvel ainda pendente

## Concluído e validado

| Item                   | Evidência                                                                  |
| ---------------------- | -------------------------------------------------------------------------- |
| Monorepo pnpm          | Instalação com lockfile congelado concluída                                |
| Cliente universal Expo | `expo-doctor`: 20/20 verificações                                          |
| Qualidade estática     | Prettier, ESLint e TypeScript sem erros                                    |
| Domínio                | 4/4 testes de privacidade aprovados                                        |
| Web                    | Export estático com `/`, `/principles`, sitemap e fallback                 |
| Android                | Bundle Hermes exportado com sucesso                                        |
| iOS                    | Bundle Hermes exportado com sucesso                                        |
| Navegação web          | Ida aos princípios e retorno testados no navegador                         |
| Responsividade         | 390×844 sem overflow horizontal; cartões com 342 px úteis                  |
| Console web            | Nenhum erro ou aviso durante a jornada testada                             |
| Marca provisória       | Ícone, splash, adaptive icon e favicon originais e reproduzíveis           |
| Segredos               | Busca por padrões de credenciais sem ocorrências                           |
| GitHub                 | Repositório conectado e branch `main` sincronizada                         |
| CI                     | Jobs de aplicação e banco executados com sucesso                           |
| Supabase público       | URL, chave publicável e migrations validadas no projeto de desenvolvimento |
| Expo/EAS               | Conta, projeto, pacote Android e bundle iOS confirmados                    |

## Banco preparado

- Supabase CLI e configuração local.
- PostgreSQL 17 definido no ambiente local.
- Migration inicial transacional.
- Perfis, espaços, membros, convites, consentimentos e auditoria.
- RLS habilitado em todas as tabelas expostas.
- Criação transacional do espaço do casal.
- Testes pgTAP de existência, RLS, funções, políticas e privilégios.

## Supabase Cloud — concluído pelo conector

O projeto de desenvolvimento foi criado pelo proprietário. As migrations `initial_foundation` e `harden_denied_tables_and_foreign_keys` foram aplicadas e auditadas no projeto remoto em 03/08/2026. As seis tabelas públicas estão com RLS habilitado, sem leitura anônima de perfis, e o trigger de criação de perfil está ativo.

O vínculo do CLI local continua útil para operações manuais futuras, mas não bloqueia mais a validação do schema:

```powershell
pnpm exec supabase login
pnpm exec supabase link --project-ref SEU_PROJECT_REF
pnpm exec supabase db push --dry-run
```

Docker permanece opcional para testes locais isolados. A CI executará os testes do banco em um runner Linux com Docker.

Os testes do banco e da aplicação foram aprovados na [primeira execução completa da CI](https://github.com/jeanturatto/entrenos/actions/runs/30852379773).

## Pendência 2 — Builds móveis assinadas

Os bundles JavaScript/Hermes para Android e iOS foram gerados. A conta foi autenticada e o Project ID, o proprietário Expo/EAS, o pacote Android e o bundle iOS foram confirmados.

O `eas.json` já possui perfis de desenvolvimento, preview e produção. Não foram usados cadastros ou credenciais de terceiros.

O primeiro build interno Android foi solicitado e permanece na fila do EAS. Seu andamento pode ser consultado na [página oficial do build](https://expo.dev/accounts/entrenos2/projects/entrenos/builds/28a5394e-6c3a-4a60-8527-146c66e02a6b). Um build de produção não será consumido antes da validação do artefato interno. O build iOS dependerá do fluxo de assinatura Apple do proprietário.

## Risco conhecido

A auditoria registra uma vulnerabilidade moderada transitiva em `uuid@7.0.3`, usada pela ferramenta `xcode` dentro do Expo. O aceite e a estratégia de atualização estão em [`docs/security/DEPENDENCY_RISKS.md`](../security/DEPENDENCY_RISKS.md). A CI bloqueia severidades altas e críticas.

## Gate para declarar a entrega totalmente aceita

- [ ] Autenticar e vincular o Supabase CLI ao projeto de desenvolvimento para operações manuais futuras.
- [x] Aplicar e validar as migrations no banco de desenvolvimento.
- [x] Autenticar o Expo/EAS CLI no projeto configurado.
- [ ] Concluir e instalar o build interno Android; preparar o iOS quando aplicável.
- [x] Enviar o código ao GitHub e validar a primeira execução da CI.
