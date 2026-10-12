# Limitações conhecidas — Base 0.2.4

- Os testes de navegador executados usam Chromium headless e emulação de viewport/toque. Firefox e WebKit não têm executáveis disponíveis no ambiente desta rodada; não há homologação nova desses motores.
- Não foram usados iPhone/iPad ou aparelhos Android físicos, leitores de tela reais nem instalação física de PWA. O fluxo de Service Worker, atualização de cache e reload offline foi testado no Chromium.
- As medidas de lifecycle verificam escopos, recursos, listeners, diálogos e resíduos após ciclos; não representam medição de heap nem campanha prolongada de carga.
- A auditoria automática de acessibilidade cobre as superfícies e configurações registradas nas evidências; não substitui validação humana assistiva.
- A referência SIAB(9).zip foi conferida por integridade e leitura das fontes. A execução automatizada desta entrega é da Base 0.2.4.
- A execução usa os módulos locais de teste indicados no relatório, via variáveis de ambiente. As dependências declaradas no projeto permanecem herdadas da origem; suas versões exatas estão no package-lock.json.
- Roteiros sem validate continuam sem conclusão formal. Relatório e Caderno permanecem opcionais, conforme os contratos.

Nenhum impedimento estrutural conhecido foi identificado nos fluxos testados. A entrega para na 0.2.4; o SILM e as versões anteriores permanecem preservados.
