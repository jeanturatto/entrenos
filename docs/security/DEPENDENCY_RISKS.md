# Registro de riscos de dependências

## DR-001 — `uuid@7.0.3` transitivo do Expo

- **Data:** 03/08/2026
- **Severidade publicada:** moderada
- **Advisory:** GHSA-w5hq-g745-h8pq
- **Origem:** `expo` → `@expo/config-plugins` → `xcode` → `uuid`
- **Status:** aceito temporariamente e monitorado

### Exposição

O pacote vulnerável é usado pela cadeia de configuração nativa do Expo. O código do EntreNós não importa `xcode` nem `uuid`, e os bundles web, Android e iOS não usam diretamente a API vulnerável de geração v3/v5/v6 com buffer fornecido pelo chamador.

### Decisão

Não aplicar override forçado para `uuid@11`, porque `xcode@3.0.1` declara e testa outra versão principal. Um override não suportado poderia quebrar prebuilds ou assinaturas nativas.

A integração contínua bloqueia vulnerabilidades altas e críticas. Esta vulnerabilidade moderada continuará visível em auditorias locais.

### Saída do risco

Atualizar o Expo assim que uma versão compatível remover `uuid@7.0.3`, executar `pnpm doctor`, os exports das três plataformas e retirar este aceite quando `pnpm audit --prod` não apresentar o advisory.
