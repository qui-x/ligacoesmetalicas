# Base Estrutural 0.2.4 — Fechamento Final antes do SILM

- Separada a conclusão do encerramento: completed mantém o contexto, módulo, identificação e navegação restrita.
- Relatório aberto após concluir; retomada de sessão concluída atualiza o relatório sem liberar navegação.
- Encerrar arquiva a sessão com closedAt e restaura a investigação livre. O resultado completed e o marcador de missão permanecem salvos; encerramento sem conclusão usa closed.
- Roteiros com validação formal reutilizam o mesmo fluxo. Roteiros sem validação conservam o comportamento existente.
- Recuperada a modal Como deseja iniciar?, compartilhada por Home e Menu, usando o componente e a chave de preferência existentes. Cancelamentos preservam a escolha anterior; opções removidas ou indisponíveis usam fallback.
- Marca operável por teclado retorna à atividade restrita ou ao relatório da atividade concluída; fora desse contexto, conserva o destino normal.
- Padronizada a referência atual para SIAB(9).zip, mantendo o SHA-512 informado e verificado.
- Identificada semanticamente a notificação de conclusão para a auditoria de acessibilidade do novo fluxo, sem mudança visual nem duplicação do anúncio existente.

A origem executável é a Base 0.2.3, pacote consolidado Correções. Histórico anterior em docs/0.2.3-historico e tests/origem-0.2.3. Arquitetura, CSS, módulos, paleta e layout geral preservados. Nenhum desenvolvimento do SILM ou da Base 0.2.5 nesta entrega.
