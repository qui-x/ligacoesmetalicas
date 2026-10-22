# Relatório de build e testes — SILM 0.14.7

## Escopo

Corrigir o empilhamento da interface no modo expandido que fazia a região cristalina cobrir o cabeçalho e os menus contextuais.

## Alterações

- A tela inteira passa a ser aplicada ao contêiner `#si-workspace`, com z-index acima da barra global da plataforma.
- A barra global e o aviso de armazenamento não encobrem a área de trabalho expandida.
- `#si-stage` deixa de ser uma camada fixa sobre seus irmãos e volta ao fluxo flexível da oficina.
- Foco/Visão geral, Montagem, Ver, Dados, actionbar e painéis contextuais permanecem na hierarquia interativa da oficina.
- Reforçados testes de integração para o viewport completo, ordem vertical da barra contextual e área de cena, e controles acessíveis em dispositivos móveis.

## Limite da validação

As alterações de código e asserções foram verificadas estaticamente nesta sessão. Os testes de navegador não foram executados localmente. Executar `npm run build:integration`, `npm run audit` e `npm test` para homologação.
