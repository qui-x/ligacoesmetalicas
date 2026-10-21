# SILM 0.14.2 — Base SI 0.9.17 e Caderno didático

Atualização de manutenção da linha 0.14.x. A versão anterior é SILM 0.14.1 (commit e70159ed3dce78d33a8fffce34e0230247230e05). A Base SI incorporada é a 0.9.17, commit `68ed86cb416ea31489be481fc52d86aeedce2892`.

## Mudanças

- Snapshot local sincronizado com a Base SI 0.9.17, incluindo interface, contratos e módulos de registros/armazenamento.
- Caderno funcional na Home, com observação, hipótese e conclusão, filtro, exclusão, backup JSON validado, CSV e impressão.
- Registros podem identificar o metal ativo; limpeza e restauração ficam bloqueadas durante atividades orientadas.
- Contador do Caderno na Home, proteção para preservar o estado enquanto se navega, e regras CSS para telas estreitas.
- Versão, package, package-lock, PWA, cache e documentação alinhados a 0.14.2.

## Preservação científica

O motor científico, dados com fontes, medições, cálculos, representações e schema 8 permanecem preservados e separados do shell da Base SI. A atualização não deve migrar nem apagar automaticamente investigações existentes.

## Pendências

A associação de registros a relatórios por tentativa, a expansão da Área do Professor e a revisão final de Manual/relatórios continuam pendentes. A sincronização não equivale a homologação em todos os navegadores e dispositivos.
