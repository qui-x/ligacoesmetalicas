# Relatório de build e testes — SILM 0.14.4

## Escopo

A rodada renomeia “Ambiente” para “Oficina dos Metais” na navegação e na documentação, preservando o ID de rota `ambiente` e o endereço `#/ambiente`.

## Verificações realizadas

- Conferência dos pontos de entrada na página inicial, navegação global, menu móvel e cabeçalho acessível.
- Atualização das instruções do Manual e dos rótulos de retorno de missões/roteiros.
- Alinhamento dos textos Sobre, README, changelog, número da versão, manifesto PWA e versão do cache.
- Atualização do manifesto SHA-512 para os arquivos alterados.

## Limite da validação

Os testes funcionais de navegador, `npm run build:integration`, `npm run audit` e `npm test` não foram executados nesta sessão. O build e o deploy do GitHub Pages indicam que a publicação está disponível, mas não substituem os testes do simulador. A validação responsiva em dispositivos físicos também continua pendente.
