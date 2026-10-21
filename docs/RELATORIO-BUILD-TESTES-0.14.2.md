# Relatório de build e testes — SILM 0.14.2

## Estado da validação

**Implementação e testes atualizados; execução automatizada ainda não confirmada.** A conexão GitHub permite editar os arquivos, mas este fluxo não dispõe de um checkout local com Node.js e Playwright para executar os comandos. O estado anterior da CI não apresentou checks reportados.

## Comandos a executar no checkout

1. `npm run build:integration` — verifica o lock SHA-256 da Base SI 0.9.17 e regenera `integracao/base-core.js` e o HTML raiz.
2. `npm run audit` — verifica versão, integridade SHA-512, recursos estáticos, preservação do núcleo e documentação.
3. `npm test` — executa testes científicos, roteiros, aprendizagem e integração de navegador.

## Cobertura atualizada

- Home → Caderno, criação de hipótese, filtro, contador da Home e download CSV/JSON.
- Larguras 320, 360 e 390 px passam a incluir a página do Caderno.
- Mantidos os testes de montagem, undo, cristalografia, projeções 2D/3D, elétrons, persistência, importação/exportação e painéis.

## Homologação manual pendente

Confirmar em dispositivos reais teclado virtual, foco, impressão em PDF, seletor de arquivos, restauração de backup e montagem no Safari/iOS e Android em retrato e paisagem. Não se declara aprovação física sem essa verificação.
