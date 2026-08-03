# Status da Entrega 1 — Fundação executável

- **Data da revisão:** 03/08/2026
- **Estado:** código concluído; aceite operacional pendente de autenticação nos serviços de nuvem

## Concluído e validado

| Item                   | Evidência                                                        |
| ---------------------- | ---------------------------------------------------------------- |
| Monorepo pnpm          | Instalação com lockfile congelado concluída                      |
| Cliente universal Expo | `expo-doctor`: 20/20 verificações                                |
| Qualidade estática     | Prettier, ESLint e TypeScript sem erros                          |
| Domínio                | 4/4 testes de privacidade aprovados                              |
| Web                    | Export estático com `/`, `/principles`, sitemap e fallback       |
| Android                | Bundle Hermes exportado com sucesso                              |
| iOS                    | Bundle Hermes exportado com sucesso                              |
| Navegação web          | Ida aos princípios e retorno testados no navegador               |
| Responsividade         | 390×844 sem overflow horizontal; cartões com 342 px úteis        |
| Console web            | Nenhum erro ou aviso durante a jornada testada                   |
| Marca provisória       | Ícone, splash, adaptive icon e favicon originais e reproduzíveis |
| Segredos               | Busca por padrões de credenciais sem ocorrências                 |
| CI                     | Jobs de aplicação e banco configurados                           |

## Banco preparado

- Supabase CLI e configuração local.
- PostgreSQL 17 definido no ambiente local.
- Migration inicial transacional.
- Perfis, espaços, membros, convites, consentimentos e auditoria.
- RLS habilitado em todas as tabelas expostas.
- Criação transacional do espaço do casal.
- Testes pgTAP de existência, RLS, funções, políticas e privilégios.

## Pendência 1 — Supabase Cloud

O projeto de desenvolvimento foi criado pelo proprietário e sua referência pública já foi identificada. Ainda é necessário autenticar o Supabase CLI, vincular o repositório local e validar a migration com:

```powershell
pnpm exec supabase login
pnpm exec supabase link --project-ref SEU_PROJECT_REF
pnpm exec supabase db push --dry-run
```

Docker permanece opcional para testes locais isolados. A CI executará os testes do banco em um runner Linux com Docker.

## Pendência 2 — Builds móveis assinadas

Os bundles JavaScript/Hermes para Android e iOS foram gerados. O Project ID e o proprietário Expo/EAS já estão configurados localmente. APK/AAB e IPA assinados ainda exigem autenticar o CLI e, para publicação, vincular as contas Google e Apple do proprietário.

O `eas.json` já possui perfis de desenvolvimento, preview e produção. Não foram usados cadastros ou credenciais de terceiros.

## Risco conhecido

A auditoria registra uma vulnerabilidade moderada transitiva em `uuid@7.0.3`, usada pela ferramenta `xcode` dentro do Expo. O aceite e a estratégia de atualização estão em [`docs/security/DEPENDENCY_RISKS.md`](../security/DEPENDENCY_RISKS.md). A CI bloqueia severidades altas e críticas.

## Gate para declarar a entrega totalmente aceita

1. Autenticar e vincular o Supabase CLI ao projeto de desenvolvimento.
2. Revisar o `db push --dry-run` e validar a migration no banco de desenvolvimento.
3. Autenticar o Expo/EAS CLI no projeto já configurado.
4. Gerar ao menos um build interno Android e um build interno iOS.
5. Enviar o código ao GitHub e validar a primeira execução da CI.
