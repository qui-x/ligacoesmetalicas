| Item (§156) | Situação | Evidência |
|---|---|---|
| schema atualizado | ✅ | `SILM.scientificSchemaVersion = 5`; validador |
| migração segura | ✅ | validador (4 → 5, 3 → 5, 2 → 5, 1 → 5), item 0.6-109 |
| electrons formal | ✅ | validador (contrato e 18 estados inválidos), item 0.6-110 |
| modelo coletivo | ✅ | itens 0.6-114 a 0.6-117 (cobertura dos centros, nenhum centro concentra a nuvem) |
| nenhuma ligação M—M | ✅ | itens 0.6-115 a 0.6-117 (só arestas da célula), auditoria |
| nenhuma dupla representação de elétrons | ✅ | transição átomo → estrutura (item 0.6-TRANS); unidades sem elétrons próprios |
| valenceModel respeitado | ✅ | `electrons.source` = fontes do banco; validador (Na, Al, Fe, Cu, Au), item 0.6-VER |
| pontos declarados qualitativos | ✅ | `representationType: 'qualitative'`, legenda, Ver, Manual, relatório |
| movimento não direcionado | ✅ | item 0.6-112 (deriva média < 0,25; vários centros visitados) |
| sem corrente elétrica; sem campo aplicado; sem temperatura dinâmica | ✅ | item 0.6-MOD, auditoria (camada eletrônica sem setas nem corrente) |
| mostrar/ocultar | ✅ | itens 0.6-110 e 0.6-111 |
| movimento ligado/desligado | ✅ | itens 0.6-111, 0.6-121 e 0.6-131 |
| reduced motion; representação estática equivalente | ✅ | item 0.6-120 (sistema e preferência interna) |
| montagem livre compatível | ✅ | itens 0.6-110, 0.6-114 e 0.6-TRANS |
| CCC, CFC e HC compatíveis | ✅ | itens 0.6-115, 0.6-116 e 0.6-117 |
| célula unitária compatível | ✅ | item 0.6-118 (marcadores além do contorno) |
| rede extensa compatível | ✅ | item 0.6-119 |
| persistência; reload | ✅ | itens 0.6-110 (storage) e 0.6-121 |
| mobile | ✅ | itens 0.6-126 (320, 360, 390, paisagem e tablet) |
| acessibilidade | ✅ | itens 0.6-128 a 0.6-131 e 0.6-A11Y (axe-core) |
| performance | ✅ | item 0.6-127 (48 unidades, custo por quadro e quadros por segundo) |
| documentação de limitações | ✅ | `LIMITACOES-MODELO-ELETRONICO.md`, Ver, Manual |
| build passa; console limpo | ✅ | `npm run build`; item CONSOLE |
