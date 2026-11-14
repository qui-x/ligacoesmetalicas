# SILM — Etapa 73: auditoria independente de proveniência térmica e elétrica

Data de referência: 14/11/2026. Material documental de pesquisa; **não altera dados homologados na `main`, eligibility nem motores**.

## Cobertura
- Matriz preservada: **92 metais, 230 perfis mecânicos, 317 observações da Etapa 72**.
- Recuperados **19 valores de condutividade térmica** tabulados por Ho, Powell e Liley (1972), geralmente a **273,2 K**. A classe na fonte (recommended, provisional, estimated ou interpolated) foi preservada.
- Recuperadas **16 estimativas históricas** a **300 K**, de precisão declaradamente muito baixa (**cerca de ±50%**): Ac, Am, Bk, Cf, Cm, Es, Fm, Fr, Lr, Md, No, Pa, Po, Rf, Db, Sg.
- **29 registros elétricos** de NBS, Matula e Chi foram confrontados com a antiga planilha de triagem V08, cobrindo **24 metais** (alguns com fontes independentes múltiplas). Os 29 registros já pertenciam à Etapa 72, **não são novos**.
- Resultado quantitativo do confronto elétrico (29 comparações): **3** com diferença até 5%, **24** com diferença de 5–20%, **1** com ≥20%, **1** sem candidato V08. Essa diferença não prova erro, pois V08 não identifica temperatura e amostra para cada número.

## Seleção térmica de referência (W/(m·K), 273,2 K)
| Símbolo | Valor | Avaliação da fonte | Página impressa |
|---|---:|---|---:|
| Al | 236 | Recomendado | 305 |
| Ag | 429 | Recomendado | 395 |
| Au | 319 | Recomendado | 340 |
| Ba | 18,5 | Estimado, aprox. ±20% | 310 |
| Co | 105 | Recomendado | 331 |
| Cr | 96,5 | Recomendado | 330 |
| Cu | 403 | Recomendado | 332 |
| Dy | 10,5 | Provisório, policristalino | 333 |
| Eu | 14,0 | Estimado, aprox. ±20% | 335 |
| Fe | 83,5 | Recomendado | 354 |
| K | 103,6 | Interpolado | 381 |
| Li | 85,9 | Recomendado | 360 |
| Lu | 17,0 | Provisório, policristalino | 361 |
| Mn | 7,68 | Provisório, interpolado | 363 |
| Mo | 139 | Recomendado | 365 |
| Na | 142 | Recomendado | 396 |
| Ni | 94,1 | Recomendado | 370 |
| Rb | 58,3 | Interpolado | 388 |
| W | 177 | Recomendado | 408 |

**Atenção:** os números da fonte são em W/(cm·K), multiplicados por **100** para W/(m·K). A temperatura declarada **273,2 K não é exatamente a CNTP do SILM (273,15 K e 101325 Pa)**; além disso, a pressão e a preparação da amostra não são globalmente certificadas.

### Estimativas históricas para elementos 104–106
A tabela original (p. 418) lista os elementos de Z=104, 105 e 106 com estimativas de 23, 58 e 190 W/(m·K), respectivamente. São estimativas *muito grosseiras* de 1972 e não constituem propriedades reais medidas de Rf, Db ou Sg; não servem como confirmação de fase nem para a calibração das experiências. Os bloqueios modernos permanecem válidos.

### Conferência elétrica
A Tabela 1.1 de Fickett (NBS TN 1053, p. 4) documenta resistividades a 273 K (ponto de gelo) de metais puros. **α-Mn: 143,5 µΩ·cm; β-Mn: 91,0 µΩ·cm; γ-Mn: 22,7 µΩ·cm**: manter fases separadas. Não confundir ρ em µΩ·cm com Ω·m (fator 10⁻⁸), nem sigma derivada de ρ com medição independente.

## Referências auditadas
1. Ho, C. Y.; Powell, R. W.; Liley, P. E., *Thermal Conductivity of the Elements*, J. Phys. Chem. Ref. Data **1** (1972), 279–421, DOI https://doi.org/10.1063/1.3253100; [PDF NIST](https://srd.nist.gov/jpcrdreprint/1.3253100.pdf). Tabelas por elemento e p. 418, inspeção visual dos quadros.
2. Fickett, F. R., *Electrical Properties of Materials and Their Measurement at Low Temperatures*, NBS Technical Note 1053 (1982), [PDF](https://nvlpubs.nist.gov/nistpubs/Legacy/TN/nbstechnicalnote1053.pdf), Tabela 1.1 p. 4.
3. Matula, R. A. (1979), *Electrical resistivity of copper, gold, palladium and silver*, DOI https://doi.org/10.1063/1.555614.
4. Chi, T. C. (1979), *Electrical resistivity of alkaline earth elements*, JPCRD 8, Tabela 19, [PDF](https://srd.nist.gov/JPCRD/jpcrd139.pdf).

## Política de integração
O pacote científico da Etapa 73 no chat contém matriz JSON completa e tabelas CSV/XLSX. Os novos registros são **referências independentes**, e **não** se atribui Ho (1972) aos números de V08 apenas por semelhança. **0 novas homologações CNTP, 0 calibrações de motor, 0 habilitações estruturais.**

Próximo lote: examinar as fontes remanescentes de triagem, condicionais elétricas e térmicas, e manter explicitamente as 16 lacunas históricas de alongamento à ruptura e as seis lacunas de R550 do metal puro.
