# Relatório de build e testes — SILM 0.14.3

## Estado da validação

**Implementação e cobertura de testes atualizadas; execução automatizada desta rodada ainda não confirmada.** A revisão foi feita diretamente nos arquivos do repositório GitHub. Não houve execução local de Node.js/Playwright nesta sessão. A conclusão de um build de Pages, isoladamente, não prova que a suíte funcional passou.

## Comandos para homologação no checkout

1. npm run build:integration — verifica o lock SHA-256 da Base SI 0.9.17 e regenera a entrada principal a partir de integracao/index.html.
2. npm run audit — confere versão única, recursos estáticos, núcleo preservado e documentação obrigatória.
3. npm test — executa os testes científicos, de roteiros/aprendizagem e de integração do navegador.

## Cobertura acrescentada

- Formulário de anotação com título separado e recolhimento após registro.
- Conclusão de missão adicionada automaticamente ao Caderno e ação para reabrir a missão.
- Registro de relatório no Caderno com snapshot persistente e reabertura do relatório em modo somente leitura.
- Contagem do card na Home, filtro, CSV/JSON, importação e exclusão preservados.

## Homologação manual pendente

Confirmar no navegador testes automatizados, foco e teclado virtual, impressão/PDF, importação de backup e uso em Safari/iOS e Android em retrato/paisagem. Nenhuma dessas verificações físicas é declarada concluída sem evidência do teste.
