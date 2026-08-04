# ADR 0002 — SDK compatível com o Expo Go durante a validação

- **Status:** aceito
- **Data:** 03/08/2026

## Contexto

O cliente universal havia sido iniciado com uma versão do Expo SDK mais recente que a disponível no Expo Go para o iPhone usado na validação. Isso impedia o teste gratuito no aparelho e conduzia o fluxo para a criação de um cliente nativo, que no iOS depende do programa pago da Apple.

## Decisão

Adotar temporariamente o Expo SDK 54 e suas dependências compatíveis. O fluxo padrão de validação física será o Expo Go, inclusive por túnel quando o computador e o celular não estiverem na mesma rede.

O `expo-dev-client` fica fora desta etapa. Ele poderá ser reintroduzido quando uma biblioteca exigir código nativo não incluído no Expo Go ou quando o projeto entrar na preparação das lojas.

## Consequências

- O aplicativo pode ser validado gratuitamente em iOS e Android pelo Expo Go.
- A versão web continua sendo gerada pela mesma base.
- Recursos exclusivos de SDKs mais novos não serão usados enquanto esta decisão estiver vigente.
- A atualização do SDK será tratada como uma entrega técnica própria, com testes nas três plataformas.

## Quando reconsiderar

- O Expo Go deixar de oferecer suporte ao SDK 54.
- Uma funcionalidade aprovada depender de módulo nativo ausente no Expo Go.
- Começar a preparação de builds para TestFlight, App Store ou Google Play.
