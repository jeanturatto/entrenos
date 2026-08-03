# Ambientes e segredos

## Ambientes

| Ambiente        | Finalidade                     | Dados reais | Pode ser apagado?              |
| --------------- | ------------------------------ | ----------- | ------------------------------ |
| Local           | Desenvolvimento individual     | Nunca       | Sim                            |
| Desenvolvimento | Builds internas compartilhadas | Nunca       | Sim                            |
| Homologação     | Validar uma futura versão      | Não         | Sim, com procedimento          |
| Produção        | Usuários reais                 | Sim         | Não sem processo e autorização |

Cada ambiente terá projeto Supabase, chaves, URLs, storage e credenciais próprios.

## Regras de segredos

- Segredos não entram no Git, documentação, prints ou mensagens.
- O cliente recebe somente chaves explicitamente publicáveis.
- `service_role`, SMTP, webhooks e chaves administrativas ficam no cofre do backend.
- Desenvolvimento nunca reutiliza credenciais de produção.
- Toda chave deve ter proprietário, finalidade, data e procedimento de rotação.
- Em suspeita de vazamento, a chave é revogada antes da investigação completa.

## Arquivos locais

- `.env.example`: nomes e exemplos sem segredo; pode ser versionado.
- `.env.local`: valores do computador; nunca versionado.
- Cofre do provedor/CI: valores necessários a builds e servidores.

## Responsabilidade do proprietário

As contas externas devem pertencer ao proprietário do produto ou à empresa. Autenticação em dois fatores, dados fiscais, contratos e recuperação de conta não devem ficar sob controle exclusivo de um prestador técnico.
