# Evidências — Etapa 5.5, Oficina → Visão geral (LAB-OVERVIEW)

**Referência:** SIAB 1.0.0 (`acidosebases1.0.0@73848f0`): área `overview-view` ("Sua bancada").
**Alvo:** SILM 0.15.5: `#workspace-overview` ("Estruturas recentes", `integracao/structure-comparison.js`).

## Capturas

Esta pasta tem as capturas em 1366×768 e 390×844: no SIAB com dois tubos, no SILM com cobre (CFC) e ferro (CCC) organizados.

## O defeito encontrado

O contêiner dos cartões (`#silm-comparison-items`) também recebia a classe `si-overview-grid` da Base, uma grade de colunas de 160 px. Por isso a barra de controles, o aviso, os limites e a grade de cartões ficavam lado a lado, em colunas estreitas:

- **no computador:** controles espremidos à esquerda e cartões pequenos;
- **no celular:** botões cortados ("Restau", "Elétro") e o seletor cortado ("Referên").

Agora o contêiner tem uma coluna só, como "Sua bancada" no SIAB.

## Elementos comparados

| SIAB | SILM antes | SILM agora |
|---|---|---|
| Título e ações em uma faixa ("Selecionar recipientes", "Ordenar por pH", "Ver em grade") | Controles numa coluna estreita | Título e, logo abaixo, a barra em largura total: Propriedade, Intensidade, Restaurar, Elétrons, Movimento |
| Dica curta abaixo das ações | Dica numa coluna de 160 px | "Até seis estruturas recentes. Cada uma usa sua referência; não há escala comum.", com "Limites da comparação" recolhido |
| Grade de cartões grandes, um por recipiente, com o destacado marcado | Cartões estreitos | Grade de cartões com no mínimo 300 px (um por linha no celular); cada cartão tem o metal, o rótulo curto da estrutura (CFC/CCC/HC) e "Fonte e limites" recolhido |

## Itens do plano

- **LAB-OVERVIEW-01 a 03:** rodada do autor (cabeçalho curto, controles resumidos, sem rolagem interna), conferida e mantida.
- **LAB-OVERVIEW-04:** grade com 1, 2 e 6 estruturas. TEST-WORKSPACE confere 2 cartões com largura útil; `structure-comparison` confere 6 referências.
- **LAB-OVERVIEW-05:** aplicar propriedade, intensidade, elétrons, movimento e Restaurar. TEST-WORKSPACE confere propriedade, intensidade e Restaurar; `structure-comparison` confere elétrons, movimento e movimento reduzido.
- **LAB-OVERVIEW-06:** rótulo curto, fonte por cartão e limites recolhidos, sem esconder o essencial. Cada cartão mostra o estado qualitativo ou o motivo da indisponibilidade.
- **LAB-OVERVIEW-07:** referência sem geometria ou fora de CCC/CFC/HC e propriedade indisponível. Coberto por `structure-comparison` ("referência inconsistente bloqueada", "cinco geometrias").
- **LAB-OVERVIEW-08:** computador, celular e paisagem sem cartões cortados nem segunda rolagem (TEST-WORKSPACE em 1366×768, 390×844 e 844×390).
- **LAB-OVERVIEW-09:** `tests/structure-comparison.cjs` e `tests/electrons-3d.cjs` aprovados; evidência desta pasta.

## Diferenças de domínio (N/A)

- **N/A — "Selecionar recipientes", "Ordenar por pH" e o destaque "Em foco".** As estruturas recentes não são recipientes de uma bancada: cada uma é uma investigação independente, com a sua referência. A comparação é qualitativa e não tem escala comum, então ordenar por um valor sugeriria uma classificação que o plano proíbe (LAB-VIEW-08).
