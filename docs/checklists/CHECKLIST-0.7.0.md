| Item (§193) | Situação | Evidência |
|---|---|---|
| schema atualizado; migração segura | ✅ | `SILM.scientificSchemaVersion = 6`; validador (5 → 6 … 1 → 6), item 0.7-MIG |
| propriedades no scientificState | ✅ | `properties` no estado único; validador (15 estados inválidos) |
| eligibility por propriedade | ✅ | `SILM.properties.eligibility`, `COBERTURA-METAIS.md`, itens 0.7-ELIG e 0.7-155 |
| condutividade elétrica; campo elétrico | ✅ | itens 0.7-140 a 0.7-143 |
| movimento orientado apenas sob campo | ✅ | itens 0.7-140 e 0.7-142 (deriva < 0,25 sem campo), 0.7-141 (média oposta ao campo, não uniforme) |
| sem velocidade física falsa | ✅ | limitação declarada; nenhuma unidade física na animação |
| condutividade térmica qualitativa | ✅ | itens 0.7-145 a 0.7-147 |
| sem simplificação "calor = elétrons rápidos" | ✅ | elétrons inalterados no aquecimento; interpretação "rede e elétrons" |
| maleabilidade; ductilidade distinta | ✅ | itens 0.7-148 a 0.7-152 (lâmina × fio, setas de compressão × tração) |
| brilho metálico | ✅ | itens 0.7-153 e 0.7-154 |
| estrutura preservada; elétrons preservados | ✅ | item 0.7-144; item 0.7-149 (elétrons acompanham os centros deformados) |
| dados tabelados com fonte; condições registradas | ✅ | contrato e validador; lacuna declarada (`PROPERTY_DATA_MISSING`), item 0.7-VER |
| Hg tratado por fase | ✅ | item 0.7-156 (`REFERENCE_PHASE_UNSUPPORTED`; regra de líquido testada) |
| sem magnetismo, dureza, corrosão, ligas, resistividade × temperatura | ✅ | auditoria; item 0.7-MOD |
| reset individual; reset geral | ✅ | itens 0.7-146, 0.7-150, 0.7-152 (Restaurar); 0.7-157 a 0.7-161 |
| persistência; offline | ✅ | itens 0.7-162 e 0.7-163 |
| mobile | ✅ | itens 0.7-164 (320, 360, 390, paisagem e tablet) |
| acessibilidade; reduced motion; alto contraste; visão de cores | ✅ | itens 0.7-143, 0.7-154, 0.7-165 e 0.7-A11Y (axe-core) |
| performance | ✅ | item 0.7-166 (rede + elétrons + campo) |
| documentação; build passa; console limpo | ✅ | documentos listados em `SILM-0.7.0.md`; `npm run build`; item CONSOLE |
