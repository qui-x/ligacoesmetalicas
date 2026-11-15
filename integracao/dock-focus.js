'use strict';
/* Paridade de docas SILM, 15/11/2026.
   A Base SI agora alterna Montagem, Ver e Dados em uma única transição
   (reduceWorkspace). Não simular cliques no Fechar na fase de captura:
   eles provocavam duas mudanças de largura e podiam devolver o foco ao
   painel anterior durante a abertura do próximo.
   Mantido por compatibilidade com a lista de scripts da distribuição. */
