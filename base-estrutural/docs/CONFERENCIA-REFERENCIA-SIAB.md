# Referência comportamental — SIAB(9).zip

A referência atual da Base 0.2.4 é **SIAB(9).zip**, versão interna **1.0.0**. O nome canônico e sua identidade por conteúdo foram confirmados expressamente pelo usuário no prompt desta versão. Os bytes disponíveis foram conferidos contra o SHA-512 solicitado, sem modificar a referência.

SHA-512:

```
ff81556ce175bbc6e527eb922a193599b31d127ee07a0cb43a80639e45570c20a75e5660a876f29fbdb435dc636b0556e527d8d1b394739a3cf9fe1b583983b3
```

Tamanho: 433200 bytes. Conteúdo: 102 arquivos. CRC e conteúdo extraído conferidos. Fontes utilizadas incluem namespace.js, index.html, activity-ui.js, gaveta.js, atividades.js, activity-context.js, integracao.js, preferencias.js, manual.js e CSS da gaveta/workspace.

A conclusão em atividades.js consolida resultados, mantém a atividade e abre o relatório; encerrar remove o contexto. A marca de activity-ui.js usa a rota contextual. integracao.js conecta os acessos de inicialização ao mesmo diálogo. A Base preserva seus próprios motores e registros para reproduzir esses comportamentos.

A auditoria scripts/audit-reference.py verifica BUILD-INFO.json, o hash e as ocorrências em todos os arquivos de texto do projeto. Documentos, evidências e scripts atuais usam SIAB(9).zip. Ocorrências de nomes de importação anteriores ficam apenas nos históricos, com sua proveniência preservada. Não há necessidade de novo envio.
