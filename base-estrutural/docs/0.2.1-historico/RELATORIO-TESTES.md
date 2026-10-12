# Base Estrutural 0.2.1 — Relatório de testes

Estado: **29 grupos aprovados** e **15 varreduras axe sem violações**. Execução completa, sem filtro, em 2026-10-04T21:56:42.597Z.

## Ambiente efetivamente executado

| Motor | Versão | Resultado |
|---|---|---|
| Chromium | 153.0.8010.0 | AVAILABLE |
| Firefox | 153.0 | AVAILABLE |
| Webkit | — | UNAVAILABLE |

Node: `v24.19.0`. O Firefox utilizou a configuração de contêiner registrada no JSON; isso não altera o aplicativo entregue. O WebKit não foi homologado porque o ambiente não possui bibliotecas nativas suficientes; Safari/iOS permanece pendente.

## Grupos executados

| Verificação | Resultado | Duração |
|---|---|---:|
| chromium · 1–3 navegação, início, foco e histórico | PASS | 419 ms |
| chromium · 4 módulos, seleção única e preservação do workspace | PASS | 617 ms |
| chromium · 5 e 7 roteiro, cancelamento, módulo e retorno à investigação livre | PASS | 531 ms |
| chromium · 6 e 8 missão, restrições, conclusão e nova tentativa | PASS | 590 ms |
| chromium · 9 sessão, reload e restauração pelo domínio | PASS | 601 ms |
| chromium · 10 Professor, serialização, importação e permissões | PASS | 545 ms |
| chromium · 11 Sobre, referências, Manual e retorno de foco | PASS | 789 ms |
| chromium · 12 relatório, edição, histórico e impressão equivalente | PASS | 726 ms |
| chromium · acessibilidade, temas, fonte 150%, contraste e modais | PASS | 2112 ms |
| chromium · mobile portrait/landscape e todas as telas a 150% | PASS | 2046 ms |
| chromium · regressão de lifecycle, 20 ciclos e ausência de resíduos | PASS | 3472 ms |
| chromium · reset confirmado, preferências e unload com retomada pendente | PASS | 533 ms |
| chromium · contratos de derivação, tela customizada e falhas recuperáveis | PASS | 221 ms |
| firefox · 1–3 navegação, início, foco e histórico | PASS | 1521 ms |
| firefox · 4 módulos, seleção única e preservação do workspace | PASS | 933 ms |
| firefox · 5 e 7 roteiro, cancelamento, módulo e retorno à investigação livre | PASS | 957 ms |
| firefox · 6 e 8 missão, restrições, conclusão e nova tentativa | PASS | 1062 ms |
| firefox · 9 sessão, reload e restauração pelo domínio | PASS | 1037 ms |
| firefox · 10 Professor, serialização, importação e permissões | PASS | 887 ms |
| firefox · 11 Sobre, referências, Manual e retorno de foco | PASS | 1351 ms |
| firefox · 12 relatório, edição, histórico e impressão equivalente | PASS | 1277 ms |
| firefox · acessibilidade, temas, fonte 150%, contraste e modais | PASS | 3755 ms |
| firefox · mobile portrait/landscape e todas as telas a 150% | PASS | 4450 ms |
| firefox · regressão de lifecycle, 20 ciclos e ausência de resíduos | PASS | 5460 ms |
| firefox · reset confirmado, preferências e unload com retomada pendente | PASS | 869 ms |
| firefox · contratos de derivação, tela customizada e falhas recuperáveis | PASS | 475 ms |
| PWA · atualização, isolamento de caches e retomada offline | PASS | 1866 ms |
| Armazenamento bloqueado e sessão em memória | PASS | 178 ms |
| Cores forçadas e redução de movimento | PASS | 520 ms |

Os cenários cobrem navegação, início e histórico; foco e Manual; módulos; roteiro; missão, restrições, conclusão e refazer; sessão, reload e restauração do estado do domínio; Professor, JSON, importação, permissões e download; Sobre, referências; relatório, edição, histórico e impressão; temas, alto contraste, fonte 150%, cores forçadas e redução de movimento; matriz mobile/desktop de 320 a 1920 px; 20 ciclos de lifecycle por motor; telas customizadas e falhas recuperáveis; atualização, isolamento de cache e offline do PWA; storage bloqueado.

## Acessibilidade e neutralidade

As 15 saídas `*-axe.json` em `docs/evidence/` têm listas de violações vazias. A auditoria de runtime registrou `47 arquivos de runtime`, `42 referências HTML` e `0 dependências científicas`.

## Evidências e reprodução

Os JSONs, PNGs e auditorias desta execução estão em `docs/evidence/`. Para reproduzir em um ambiente com as bibliotecas dos navegadores:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run build
npm test
npm run audit
```

`TEST_ENGINES` e `TEST_FILTER` servem para diagnóstico. A evidência acima foi produzida sem filtro. Uma nova execução grava resultados temporários em `tests/results/`.

## Limitações

1. WebKit não iniciou por ausência de dependências nativas; Safari/iOS não homologado.
2. Viewport, toque, orientação, fonte e cores forçadas foram emulados; não houve validação em aparelho físico, leitor de tela físico, teclado virtual real ou PWA instalada pelo sistema operacional.
3. A impressão foi verificada pela preparação do documento e pela equivalência do texto; a janela nativa e impressoras específicas não foram homologadas.
4. Zero violações axe nos estados amostrados não equivale a certificação geral. Os contadores de lifecycle avaliam recursos geridos e resíduos DOM, não todo heap do navegador.
5. Offline exige preparação online anterior, HTTPS/localhost e armazenamento disponível; o navegador pode remover caches por política própria.
6. A Base não contém mecânicas científicas definitivas, catálogos ou validações de domínio. A Demo é neutra e existe somente para exercitar os contratos.

O arquivo `TESTES-BASE-0.2.1.json` é a fonte estruturada desta narrativa. A rodada termina na Base 0.2.1; nenhuma versão posterior foi iniciada.
