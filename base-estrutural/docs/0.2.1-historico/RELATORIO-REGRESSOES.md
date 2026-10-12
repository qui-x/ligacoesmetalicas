# Base Estrutural 0.2.1 — Relatório de regressões

## Preservações verificadas

- A Base Estrutural 0.2.0 continua intacta em `references/BASE-ESTRUTURAL-0.2.0/`; a comparação de bytes e o ZIP de entrada estão registrados em `docs/evidence/ORIGENS-PRESERVADAS.json`.
- O SIAB 4 foi usado apenas como referência comportamental; sua extração permanece em `references/SIAB-4/`.
- O SILM 0.1.0 e seu SHA-512 externo permanecem inalterados.
- A infraestrutura original de domínio, viewport, Manual, modal, notificações, storage, tema, acessibilidade, reset e Service Worker foi preservada e estendida sem catálogo científico no core.

## Correções/alterações desta rodada

- Roteador genérico com telas registráveis, histórico, aliases, foco, activation/deactivation e limpeza por visita.
- Composição de Início, Laboratório, Roteiros, Missões, Professor, Sobre, Manual e Relatórios a partir do registro do domínio.
- Módulos com um ativo por vez, cartões recolhíveis, disponibilidade, tooltip, selo e controles de escopo local.
- Atividades com navegação livre/restrita, guardas de recurso, confirmação, sessão, Retomar, Reiniciar, saída segura e restauração da investigação livre.
- Professor com configuração JSON validada, revisão, importação, download e abertura como aluno.
- Relatório com metadados, contribuições do domínio, campos editáveis, snapshots seriais e impressão equivalente.
- Painéis neutros em contêineres que alternam entre região e diálogo; safe areas e cores forçadas alinhadas ao sistema.
- Service Worker versionado em `0.2.1`, atualização, isolamento por escopo e preparação offline.

## Matriz de verificação

Chromium e Firefox passaram os 29 grupos da suíte. A execução inclui 20 ciclos de load/reset/destroy por motor sem scopes, recursos, hosts, overlays ou folhas residuais. As telas customizadas e um domínio legado também foram montados e desmontados. Os detalhes e tempos estão no JSON e em `RELATORIO-TESTES.md`.

Nenhuma regressão é declarada para WebKit/Safari/iOS ou dispositivos físicos, pois esses ambientes não estavam disponíveis para homologação.
