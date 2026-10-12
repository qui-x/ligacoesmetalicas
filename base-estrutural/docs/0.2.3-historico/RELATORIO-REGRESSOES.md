# Regressões e preservações — Base 0.2.3

A regressão herdada passou em 16 grupos, além dos testes específicos da operação. Não foram reescritos atividade, módulo, Professor, Manual, relatório, storage, workspace ou acessibilidade. Os campos extras de ajuda/permissão são metadados da definição preservados pelo motor existente; o shell consulta status e navigationMode sem alterar o schema de sessão.

| Arquivo fora do patch | Comparação de bytes |
|---|---|
| a11y.js | Idêntico à 0.2.2 |
| js/core/domain.js | Idêntico à 0.2.2 |
| js/core/identity.js | Idêntico à 0.2.2 |
| js/responsive/layout.js | Idêntico à 0.2.2 |
| js/workspace/workspace.js | Idêntico à 0.2.2 |
| js/experience/activity.js | Idêntico à 0.2.2 |
| js/experience/modules.js | Idêntico à 0.2.2 |
| js/experience/learning.js | Idêntico à 0.2.2 |
| js/experience/notebook.js | Idêntico à 0.2.2 |
| js/experience/teacher.js | Idêntico à 0.2.2 |
| js/experience/reports.js | Idêntico à 0.2.2 |
| js/experience/references.js | Idêntico à 0.2.2 |
| js/manual/manual.js | Idêntico à 0.2.2 |
| js/manual/registry.js | Idêntico à 0.2.2 |
| js/storage/storage.js | Idêntico à 0.2.2 |
| js/storage/migration.js | Idêntico à 0.2.2 |
| js/components/modal.js | Idêntico à 0.2.2 |

A adaptação do guard está na experiência existente. O roteador recebeu somente um texto de aviso coerente com Ajuda da atividade; sua fila, histórico, hash e lifecycle permanecem intactos. CSS e renderização do shell implementam os estados gerais/restritos. A modal herdada e os controles A11Y compartilham a mesma função de apresentação e limpeza.

Três ensaios de lifecycle: dois de 20 ciclos e um de 10 ciclos com concluir/refazer/encerrar. Escopos/recursos terminam em zero; listeners acrescentados às raízes instrumentadas terminam em zero. Não é medição de heap.

Toda a pasta 0.2.2 foi comparada com o snapshot inicial; 238 arquivos foram comparados ao ZIP congelado, com SHA-512 preservado. Base 0.2.0, Base 0.2.1, referência histórica disponível e SILM também permaneceram intactos. SIAB(4).zip e SIAB(3).zip foram confirmados idênticos e usados na conferência da referência fornecida, sem reatribuição de hash. Esta revisão documental conserva o runtime testado da 0.2.3.
