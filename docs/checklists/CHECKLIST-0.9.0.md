| Teste obrigatório (§20 do prompt 0.9.x) | Situação | Evidência |
|---|---|---|
| distância | ✅ | item 0.9-DIST (Cu, vizinhos imediatos = 2,556 Å; cota, não ligação) |
| zoom e resize | ✅ | item 0.9-ZOOM (mesma medida antes e depois do zoom e do redimensionamento) |
| mobile | ✅ | itens 0.9-MOB (320, 360, 390, paisagem e tablet: toque, folha de instrumentos, sem rolagem horizontal) |
| CCC | ✅ | item 0.9-CCC (Fe: 2,482 Å e coordenação 8) |
| CFC | ✅ | itens 0.9-DIST e 0.9-COORD (Cu) |
| HC | ✅ | item 0.9-HC (Mg: `a` e `c` como ação de medição; aresta inválida recusada) |
| ângulo | ✅ | item 0.9-ANGLE (coordenadas científicas, não a projeção) |
| vizinhança | ✅ | item 0.9-COORD (contagem visual = número de coordenação) |
| histórico | ✅ | item 0.9-HIST (rever, remover, limpar sem limpar a estrutura) |
| contexto histórico | ✅ | item 0.9-CONTEXT ("Medição realizada em estado anterior da estrutura.") |
| reload | ✅ | item 0.9-RELOAD (medições persistem; medição incompleta cancelada) |
| troca de módulo / troca de metal | ✅ | item 0.9-MODULE |
| teclado | ✅ | item 0.9-KBD (fluxo completo com anúncios) |
| acessibilidade | ✅ | item 0.9-A11Y (letras A/B/C, resultado legível, axe-core) |
| validação | ✅ | item 0.9-VALID (registro adulterado recusado); `validate-scientific-state.cjs` |
| montagem livre sem escala | ✅ | item 0.9-FREE |
| deformação aguarda a estrutura de referência | ✅ | item 0.9-DEFORM |
| migração 0.8.x → 0.9.x (schema 6 → 7) | ✅ | item 0.9-MIG |
| regressões 0.2.x a 0.8.x | ✅ | suítes s040 a s080 completas |
| build PASS; console sem erros críticos | ✅ | `npm run build`; item CONSOLE |
| sem ±, sem instrumentos sem modelo, sem estado paralelo | ✅ | auditoria (verificações "Medir") |
| identidade oficial (logo e abertura) | ✅ | itens 0.9-ID1 a 0.9-ID4; auditoria (hashes do pacote) |
| correção de origem 0.1.x: rota inicial direta sem aviso falso | ✅ | item 0.9-ID5; integração declarada na auditoria |
