# Relatório de testes — Base Estrutural 0.2.2

Resultado desta rodada: **32 grupos aprovados**, 16 de shell/contratos e 16 de regressão. As duas suites completas foram executadas sem `TEST_FILTER`. Houve **23 análises axe, com zero violações detectadas**. Build e auditoria de neutralidade passaram. Esta entrega é candidata à homologação.

Execução shell: `2026-10-07T21:18:15.264Z`. Execução regressão: `2026-10-07T21:18:15.258Z`. Ambiente: Node `v24.19.0`, Playwright e Chromium headless. Emulação de tamanho e toque, sem dispositivos físicos.

## Motores desta rodada

| Motor | Versão | Resultado |
|---|---|---|
| chromium | 153.0.8010.0 | Executado |
| firefox | — | Indisponível: executável ausente |
| webkit | — | Indisponível: executável ausente |

Firefox/Gecko e WebKit foram tentados, mas não puderam iniciar. Seus motivos completos estão nos JSON. Os testes históricos da 0.2.1 não foram reutilizados como validação da 0.2.2.

## Matriz verificada

- Desktop: 901, 1280, 1440 e 1920 px; navegação, histórico e retorno de foco.
- Mobile/tablet: 320×568, 360×740, 390×844, 600×800, 768×1024, 844×390, 900×700 e transição 901×700.
- Dez telas com fonte 150%: Início, Aprender, Tema, Caderno, Laboratório, Roteiros, Missões, Professor, Manual e Relatórios.
- Atividade restrita em cinco tamanhos móveis/tablet/paisagem a 150%: banner, viewport com altura positiva, launchers, bottom nav, menu e saída segura.
- Menu por clique/toque, Enter, Espaço, Tab, Shift+Tab, Escape, clique externo, foco/trap, retorno ao hambúrguer e rolagem interna.
- Temas claros/escuros, contraste, spacing, reduced motion, cores forçadas, labels/roles/estados e axe nas novas superfícies.
- Preferência de início persistida, rota removida, link direto, Projetor na gaveta e no Professor.
- Temas como hubs, relacionados, marcador Revisado, Caderno opcional/rota customizada, recursos, visibilidade e hook de tour.
- Dois ensaios de 20 ciclos: montar/navegar/desmontar e limpeza de escopos, DOM, overlays, estilos e listeners acrescentados a raízes persistentes.
- Motores herdados: módulos, Roteiros, Missões, Professor JSON, sessão/retomada, reset, Manual, Sobre, relatório, impressão, PWA/cache/offline e armazenamento bloqueado.

Nos **31 contextos monitorados**, os coletores de `pageerror`, erros de console e respostas HTTP 4xx/5xx ficaram vazios. O ensaio de armazenamento bloqueado verifica aviso e fallback em memória. A limpeza de lifecycle verifica recursos geridos e estado observado, sem alegação de medição universal de heap.

## Grupos executados

| Suite | Grupo | Resultado |
|---|---|---|
| Shell | chromium · shell desktop e hierarquia de início | PASS |
| Shell | chromium · gaveta, foco, contexto e preferências estruturais | PASS |
| Shell | chromium · Aprender, temas, relacionados e marcador simples | PASS |
| Shell | chromium · atividade e shell restrito | PASS |
| Shell | chromium · mobile bottom nav, safe area e drawer | PASS |
| Shell | chromium · acessibilidade e ciclo de vida | PASS |
| Shell | chromium · percurso completo por links, histórico e Tema como hub | PASS |
| Shell | chromium · teclado, clique externo, scroll e gaveta a 150% | PASS |
| Shell | chromium · startup removido, links diretos e Projetor no Professor | PASS |
| Shell | chromium · API de recursos, visibilidade, tour e domínio destruído | PASS |
| Shell | chromium · Caderno opcional, rota configurável e registro do domínio | PASS |
| Shell | chromium · drawer da missão, estados bloqueados, ajuda, relatório e finalização | PASS |
| Shell | chromium · matriz mobile de 320 a tablet, fonte 150% e sheets | PASS |
| Shell | chromium · atividade mobile, banner, viewport e saída segura | PASS |
| Shell | chromium · novas superfícies, contraste, spacing e movimento reduzido | PASS |
| Shell | contrato · domínio legado sem experiência continua carregável | PASS |
| Regressão | chromium · 1–3 navegação, início, foco e histórico | PASS |
| Regressão | chromium · 4 módulos, seleção única e preservação do workspace | PASS |
| Regressão | chromium · 5 e 7 roteiro, cancelamento, módulo e retorno à investigação livre | PASS |
| Regressão | chromium · 6 e 8 missão, restrições, conclusão e nova tentativa | PASS |
| Regressão | chromium · 9 sessão, reload e restauração pelo domínio | PASS |
| Regressão | chromium · 10 Professor, serialização, importação e permissões | PASS |
| Regressão | chromium · 11 Sobre, referências, Manual e retorno de foco | PASS |
| Regressão | chromium · 12 relatório, edição, histórico e impressão equivalente | PASS |
| Regressão | chromium · acessibilidade, temas, fonte 150%, contraste e modais | PASS |
| Regressão | chromium · mobile portrait/landscape e todas as telas a 150% | PASS |
| Regressão | chromium · regressão de lifecycle, 20 ciclos e ausência de resíduos | PASS |
| Regressão | chromium · reset confirmado, preferências e unload com retomada pendente | PASS |
| Regressão | chromium · contratos de derivação, tela customizada e falhas recuperáveis | PASS |
| Regressão | PWA · atualização, isolamento de caches e retomada offline | PASS |
| Regressão | Armazenamento bloqueado e sessão em memória | PASS |
| Regressão | Cores forçadas e redução de movimento | PASS |

## Evidências e reprodução

Resultados estruturados: `evidence/shell/TESTES-BASE-0.2.2.json` e `evidence/regression/REGRESSOES-BASE-0.2.2.json`. Os arquivos `*-axe.json` contêm listas vazias de violações. Capturas desktop/mobile estão nas mesmas pastas; imagens mobile representam o viewport, sem esticar a barra fixa por uma captura de página inteira.

Execute `npm ci`, prepare os navegadores Playwright, então `npm run build`, `npm test` e `npm run audit`. O harness permite executáveis locais e destinos separados por `TEST_OUTPUT`; os motivos de indisponibilidade são relatados. `npm run test:compat` executa a regressão herdada. Não considerar uma execução filtrada como homologação completa.

Auditoria: **51 arquivos de runtime**, **46 referências HTML locais** verificadas, **zero dependência científica**. O termo Base é nome técnico; a única migração SIAB preservada lê preferências de interface.

Limites da evidência: `LIMITACOES-CONHECIDAS.md`. Integridade das origens: `evidence/INTEGRIDADE-ORIGENS.json`. Regra de parada: aguardar homologação da Base 0.2.2.
