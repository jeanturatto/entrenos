# Desenvolvimento — guia para iniciante

## 1. O que precisa estar instalado

- Git.
- Node.js 24.
- pnpm 11.9.0, gerenciado pelo Corepack ou instalado no sistema.
- Docker Desktop somente se houver necessidade de executar o Supabase local.

Confirme as ferramentas no PowerShell:

```powershell
pnpm env:check
```

O comando pode exibir um aviso sobre Docker. No fluxo recomendado com Supabase Cloud, esse aviso não impede o desenvolvimento.

## 2. Instalar as dependências

Abra o PowerShell na raiz do repositório e execute:

```powershell
pnpm install --frozen-lockfile
```

O `pnpm-lock.yaml` registra as versões exatas. Não o apague para “resolver” uma incompatibilidade.

## 3. Configurar o Supabase Cloud — recomendado

O proprietário cria um projeto de desenvolvimento no Supabase e mantém sob seu controle a conta, a senha do banco e a recuperação de acesso.

Crie o arquivo local:

```powershell
Copy-Item -LiteralPath 'apps/client/.env.example' -Destination 'apps/client/.env.local'
```

Preencha o arquivo com a Project URL e a chave `publishable`/`anon` do projeto de desenvolvimento. Nunca use uma chave `service_role` em variáveis `EXPO_PUBLIC_*`.

O arquivo `.env.local` é ignorado pelo Git e não deve ser compartilhado.

Para administrar migrations, autentique o CLI diretamente no serviço:

```powershell
pnpm exec supabase login
pnpm exec supabase link --project-ref SEU_PROJECT_REF
pnpm exec supabase db push --dry-run
```

O `dry-run` deve ser revisado antes de qualquer aplicação no banco remoto. Nunca execute reset contra um projeto em nuvem.

## 4. Banco local com Docker — opcional

Quando for necessário testar o PostgreSQL e as políticas RLS de forma totalmente isolada, instale e abra o Docker Desktop:

```powershell
pnpm db:start
pnpm db:status
pnpm db:test
```

Para recriar somente o banco local:

```powershell
pnpm db:reset
```

O reset é destrutivo para os dados locais do projeto. Ele não deve ser adaptado ou apontado para ambientes em nuvem.

## 5. Abrir no navegador

```powershell
pnpm web
```

O terminal mostrará o endereço local. A rota inicial e a página de princípios devem abrir e navegar entre si.

## 6. Abrir no celular

```powershell
pnpm dev
```

Builds de desenvolvimento Expo/EAS serão usados em aparelhos reais. Para um emulador Android configurado:

```powershell
pnpm android
```

O comando `pnpm ios` exige macOS para simulador local. Builds iOS em nuvem dependem das contas Expo e Apple do proprietário.

## 7. Verificações antes de enviar uma mudança

```powershell
pnpm check
pnpm doctor
pnpm build:web
pnpm build:mobile
```

Com o banco local ligado:

```powershell
pnpm db:lint
pnpm db:test
```

## 8. Encerrar o ambiente

Interrompa o Expo com `Ctrl+C`. Se o Supabase local estiver ligado, encerre os containers preservando os dados:

```powershell
pnpm db:stop
```

## Problemas comuns

### “Docker não foi encontrado”

Esse é apenas um aviso no fluxo em nuvem. Instale o Docker Desktop somente para executar o Supabase local e seus testes isolados.

### Porta já utilizada

Feche processos antigos do Expo ou outra instância local do Supabase. Não troque portas aleatoriamente, pois elas também aparecem no arquivo de ambiente.

### Variáveis do Supabase inválidas

Confirme que o arquivo se chama `.env.local`, está dentro de `apps/client` e contém os valores públicos do projeto correto. Reinicie o Expo após mudar variáveis.

### Dependência incompatível

Não use `--force`. Execute `pnpm doctor`, registre a mensagem completa e corrija a versão no `package.json`.
