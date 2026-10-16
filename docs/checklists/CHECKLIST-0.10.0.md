| Teste obrigatório (§24 do prompt 0.10.x) | Situação | Evidência |
|---|---|---|
| CCC | ✅ | item 0.10-CCC (Fe: n = 2, r = √3·a/4, FE = π√3/8; r → a recupera a) |
| CFC | ✅ | item 0.10-CFC (Cu: n = 4, V = 47,24 Å³, r = 1,278 Å, FE = 0,7405, ρ = 8,935 g/cm³) |
| HC | ✅ | item 0.10-HC (Mg: prisma hexagonal n = 6, V = (3√3/2)a²c, c/a = 1,624 ≠ ideal, sem fórmula cúbica nem r → a) |
| número efetivo | ✅ | itens 0.10-CFC, 0.10-CCC e 0.10-HC (decomposição e frações marcadas na cena) |
| volume | ✅ | itens 0.10-CFC e 0.10-HC; conversões nm³, cm³ e m³ |
| raio/parâmetro | ✅ | itens 0.10-CFC e 0.10-CCC (a → r e r → a); HC pela menor distância entre vizinhos |
| empacotamento | ✅ | itens 0.10-CFC e 0.10-CCC (intermediários; esferas rígidas); FE > 1 recusado (`validate-scientific-state.cjs`) |
| densidade | ✅ | itens 0.10-CFC (N_A constante, M tabelado, V calculado) e 0.10-HC (peso em intervalo → densidade em intervalo) |
| origem medida × referência | ✅ | item 0.10-ORIGIN (escolha explícita, sem substituição silenciosa) |
| conversões | ✅ | `validate-scientific-state.cjs` (Å³ → cm³/m³/nm³, g/cm³ → kg/m³, Å → pm); itens 0.10-CFC |
| análise dimensional | ✅ | `docs/FORMULAS-CRISTALOGRAFICAS.md` §6; ρ conferido com a expressão analítica (0.10-CFC) |
| histórico | ✅ | item 0.10-HIST (reabrir com fórmula, entradas e origens; remover; limpar sem tocar na estrutura e nas medições) |
| reload | ✅ | item 0.10-RELOAD (cálculos persistem; estado anterior identificado, não recalculado) |
| mobile | ✅ | itens 0.10-MOB-360, 0.10-MOB-390 e 0.10-MOB-landscape (folha inferior, teclado numérico, sem rolagem horizontal) |
| acessibilidade | ✅ | itens 0.10-A11Y (fórmulas com equivalente textual, campos rotulados, axe-core) e 0.10-KBD (fluxo só com teclado e resultado anunciado) |
| entrada matemática | ✅ | item 0.10-INPUT (vírgula aceita; NaN, texto e negativo recusados com erro no campo) |
| troca de módulo / nova investigação | ✅ | item 0.10-METAL |
| montagem livre sem escala | ✅ | item 0.10-FREE |
| validação do registro | ✅ | `validate-scientific-state.cjs` (adulteração de resultado, de dado tabelado, de constante e de origem recusada) |
| migração 0.9.x → 0.10.x (schema 7 → 8) | ✅ | item 0.10-MIG |
| regressões 0.2.x a 0.9.x | ✅ | suítes s040 a s096 completas |
| build PASS; console sem erros críticos | ✅ | `npm run build`; item CONSOLE |
| catálogo único, constantes centralizadas, cálculos só no estado único | ✅ | auditoria (verificações "Calcular") |
