# ADR 0001 — Cliente universal Expo e backend Supabase

- **Status:** aceito
- **Data:** 03/08/2026

## Contexto

O EntreNós precisa funcionar em Android, iOS e navegador, sincronizar duas pessoas em tempo real e aplicar isolamento rigoroso entre espaços. A fundação também precisa ser compreensível para um proprietário não técnico e operar com poucos serviços durante o MVP.

## Opções consideradas

1. Aplicativos separados em React Native e Next.js, com backend NestJS.
2. Flutter universal com backend dedicado.
3. Expo/React Native universal com PostgreSQL/Supabase.

## Decisão

Usar Expo SDK 57, React Native, Expo Router e TypeScript em um cliente universal. Usar Supabase como plataforma inicial para PostgreSQL, autenticação, realtime, storage e funções de servidor.

Regras simples de leitura poderão usar a API de dados protegida por RLS. Fluxos críticos usarão funções transacionais no servidor. O domínio permanece em pacote independente para não ficar preso à interface ou ao fornecedor do backend.

## Consequências positivas

- Uma base de interface e navegação para três plataformas.
- Menos infraestrutura e segredos no MVP.
- Banco relacional, migrations e políticas versionadas.
- Caminho claro para tempo real e arquivos.
- Possibilidade de extrair API/workers depois.

## Custos e limites

- Alguns comportamentos precisarão de adaptação específica por plataforma.
- O offline exige uma camada explícita de cache e sincronização.
- Operações longas ou integrações em volume poderão exigir workers externos.
- A dependência do fornecedor deve ser monitorada por custo, limites e portabilidade.

## Quando reconsiderar

- Jobs excederem o perfil de funções curtas.
- Integrações exigirem processamento contínuo.
- Volume, latência ou conformidade exigirem infraestrutura dedicada.
- A interface web precisar divergir substancialmente da experiência móvel.
