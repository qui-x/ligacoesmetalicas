# SILM — Resistividade elétrica avaliada no ponto de gelo

Data: 13/11/2026. Natureza: pesquisa científica integrada como referência documental do módulo Explorar; sem parametrizar o motor Joule.

## Fontes e evidências recuperadas

Foram reunidos **29 valores de resistividade total para 24 metais** a **273,15 K**: 20 da NBS TN 1053, quatro de Matula (1979), cinco de Chi (1979). Esses números representam compilações institucionais ou valores avaliados, **não 29 novas medições experimentais diretas**. A pressão experimental/metrológica individual em Pa não foi confirmada, de modo que **nenhum registro é homologado integralmente em 273,15 K e 101325 Pa**.

Fontes científicas:
1. F. R. Fickett, *Electrical Properties of Materials and Their Measurement at Low Temperatures*, NBS Technical Note 1053 (1982), **Tabela 1.1, página impressa 4**: https://nvlpubs.nist.gov/nistpubs/Legacy/TN/nbstechnicalnote1053.pdf
2. R. A. Matula, *Electrical Resistivity of Copper, Gold, Palladium, and Silver*, J. Phys. Chem. Ref. Data 8, 1979, Tabelas 2 (p.1161), 5 (p.1209), 8 (p.1239), 11 (p.1260): https://srd.nist.gov/JPCRD/jpcrd155.pdf
3. T. C. Chi, *Electrical Resistivity of Alkaline Earth Elements*, J. Phys. Chem. Ref. Data 8, 1979, **Tabela 19, p.493**: https://srd.nist.gov/JPCRD/jpcrd139.pdf

## Valores totais transcritos

Em todos os casos a unidade original exibida aqui é **µΩ·cm**, com a equivalência exata 1 µΩ·cm = 10^-8 Ω·m.

| Fonte | Metal: ρ (µΩ·cm) |
|---|---|
| Matula | Cu 1,543; Au 2,051; Pd 9,78; Ag 1,467 |
| Chi | Be 3,02; Mg 4,05; Ca 3,11; Sr 12,3; Ba 30,2 |
| Fickett / NBS | Al 2,428; Be 2,70; Co 5,24; Cu 1,553; Cr 12,155; Au 2,058; In 8,00; Fe 9,07; Pb 19,2; Mg 4,12; Mn(α) 143,5; Mo 5,00; Ni 6,23; Nb 13,96; Pt 9,60; Na 4,337; Ag 1,48; Ti 39,4; W 4,94; Zn 5,45 |

A NBS distingue material puro, comercialmente puro e ligas. Apenas valores da seção **Pure metals** foram trazidos para o catálogo. Para Be, Mg, Cu, Au e Ag, as duas referências permanecem selecionáveis e **não se faz média automática**.

Matula descreve valores totais recomendados de materiais metálicos maciços recozidos: Cu/Au/Ag pureza pelo menos 99,999%; Pd pelo menos 99,99%. Chi utiliza resultados de avaliação bibliográfica; o caso Be tem caráter provisório, e Sr/Ba merecem atenção pela variação entre compiladores. A fonte NBS marca Au, Fe e Ni como valores interpolados.

## Exceções e bloqueios

- **Sn**: excluído do lote. A tabela NBS contém 10,1 µΩ·cm no ponto de gelo, mas a estabilidade α/β do estanho em 0 °C exige identidade da fase e história do espécime antes de habilitar o dado.
- **Mn**: usar exclusivamente a fase alfa, 143,5 µΩ·cm; não copiar a fase beta (91,0) nem a gama (22,7) para a estrutura de α-Mn.
- **Ra**: Chi apresenta resistividade **intrínseca provisória**, não uma resistividade total de amostra. Não derivar condutividade macroscópica de Ra a partir dessa entrada.
- Aços, bronzes, ligas Cu–Ni, Al 1100 e Cu CDA 102 não são tratados como metais elementares.
- Resistividade de referência de metal puro não quantifica automaticamente o comportamento de amostra rugosa, deformada, microestruturada ou ligada.

## Conversão de unidades e aplicação integrada

- Resistividade ρ em Ω·m = ρ em µΩ·cm multiplicada por 10^-8.
- Condutividade σ = 1/ρ [S/m].
- Como ρ é dada em µΩ·cm, **σ em MS/m = 100 / ρ**. Exemplo: Cu Matula, ρ=1,543 → σ aproximadamente 64,809 MS/m.
- A σ é **calculada matematicamente**, não foi medida independentemente pela fonte em uma segunda campanha.

O catálogo imutável domain/silm/data/research-electrical-icepoint.js armazena número atômico, fonte, tabela, natureza e amostra, ρ, σ derivada, temperatura e pressão. O painel domain/silm/research-electrical-panel.js fica **dentro da experiência Elétrica do módulo Explorar**, com escolha de fonte, condições e link da publicação. Nenhuma rota paralela, nenhum motor paralelo e nenhum ganho fictício de calibração.

Todos os registros têm sourceTemperatureVerified=true, pressurePa=null, CNTPhomologated=false, engineRelease=false, referenceOnly=true. Assim, **electrothermal.js, thermal.js e material-engine.js continuam sem consumir esses dados**. O controle mostra referências científicas, não resistência equivalente, corrente real ou potência Joule calibrada.

## Relação com a pesquisa anterior

A matriz silm_65_pesquisa_v19.json, auditada na Etapa 30, reúne 64 candidatos elétricos de vários metais, em geral 293 K ou sem condição amostral suficiente. Não é correto promover todos à CNTP. Este lote consolida novamente 29 valores verificáveis em documentos NBS/JPCRD, preservando as entradas do programa e evitando reutilizar valores de metais diferentes.

**Próximo lote:** recuperar curvas de resistividade e amostras individualmente caracterizadas para outros metais; só homologar uma equação de ρ(T), a condução elétrica quantitativa ou Joule quando a pressão, fase, pureza, geometria e condições do modelo forem compatíveis.

## Testes

- tests/electrical-icepoint-evidence.test.mjs: 29 valores/24 metais, fatores de unidade, σ derivada, fontes, exclusões e proibição de acoplamento ao solver.
- tests/run-electrical-icepoint.mjs: painel nativo com Cu, Be, Ca, Pd, Fe, Mn, ausência de Sn/Ra, comparação de fontes, desktop/mobile Chromium/Firefox/WebKit.
- Workflows existentes: responsividade, contratos científicos, microestrutura, roteiros, offline.
