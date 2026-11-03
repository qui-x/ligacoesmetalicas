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

## Segunda rodada (03/11/2026, pedido do autor: "ainda temos algumas falhas em comparação com o siab")

| SIAB ("Sua bancada") | SILM antes | SILM agora |
|---|---|---|
| Título e ações na mesma faixa | Título, e os controles numa fila separada | "Estruturas recentes" à esquerda; Elétrons, Movimento e Ver em lista/grade à direita. A comparação por propriedade (Propriedade, Intensidade, Restaurar) fica na linha de baixo |
| "Visão geral 2": contador na aba | Sem contador | "Visão geral 2" |
| Cartões grandes, numerados, com "Em foco", desenho à esquerda e informações à direita | Cartões estreitos, desenho em cima e quase sem informação | Cartões em largura útil (2 por linha em 1366 px, 1 no celular), numerados, com "Em foco" na estrutura atual. O desenho fica à esquerda; à direita, metal, estrutura de referência, parâmetro de rede do banco, estado da propriedade e "Fonte e limites" |
| Tocar num tubo leva ao "Tubo em foco" | Tocar num cartão não fazia nada | Tocar num cartão (ou numa ficha) abre a estrutura no Foco. Se for outro metal, o SILM pede a mesma confirmação de "Iniciar investigação" e organiza segundo a referência; se for o atual, só volta ao Foco |
| "Ver em grade" | — | "Ver em lista" / "Ver em grade", guardado no navegador |
| Excluir um item da bancada | Sem como remover | ✕ em cada estrutura fora de foco: tira da lista (a investigação não muda; a estrutura em foco não sai) |
| Barra de baixo: BANCADA, fichas dos tubos e "+ Novo tubo" | Desfazer, unidades e Mais (ações do Foco) | ESTRUTURAS, uma ficha por estrutura (número, metal e rótulo da estrutura, "em foco" marcada) e "+ Nova estrutura" (abre Montagem → Preparo) |

Continuam N/A: "Selecionar recipientes" (não há misturas nem vínculos entre estruturas) e "Ordenar por pH" (ordenar por um valor sugeriria uma classificação que o plano proíbe).
