# SILM — Auditoria de 30 arquivos YAML ópticos originais

Data: 14/11/2026. Escopo: primeiro lote de auditoria de fonte, após PR #142.

## Síntese

O SILM possuía 59 fichas R550 de pesquisa em 58 metais, além do Tc experimental anterior. Nesta etapa foram abertos os **30 YAML citados na matriz**, diretamente no repositório público refractiveindex.info-database, ramo main. Para cada arquivo: origem, comentário, DOI, SHA do blob, tipo de dado, domínio de comprimento de onda e os dois pontos vizinhos de **0,550 µm**.

| Categoria original dos arquivos | Metais |
|---|---|
| Constantes n,k tabuladas | 26 |
| Ajuste Lorentz–Drude | Be, W, Pt (3) |
| Constantes obtidas a partir de REELS | Ta (1) |
| Total diretamente conferido | 30 |

**30/30 correspondências numéricas exatas dentro da tolerância**: interpolação linear de n e k em 0,550 µm e cálculo de Fresnel normal foram comparados às fichas da pesquisa anterior. **26/30** registros incluem DOI. Zn, Mo, Os e Ir não apresentam DOI em seus YAML; não inventar.

O que foi validado: o conteúdo do YAML existente, a faixa espectral, o valor numérico calculável e o identificador SHA. O que NÃO foi validado: a reprodução independente de medições em laboratório, o artigo original completo de cada estudo, pureza/pressão certificada ou equivalência à CNTP. Também não houve liberação de motor numérico.

## Os 30 metais

Li, Be, Na, Mg, Al, K, Ca, Ti, V, Cr, Mn, Fe, Co, Ni, Cu, Zn, Rb, Zr, Nb, Mo, Rh, Pd, Ag, Ta, W, Os, Ir, Pt, Au e Pb.

O inventário original inclui outros **29 candidatos de R550** sem rechecagem neste lote: Weaver, AIP, estimações de gráfico, Hf, Sn, patentes, terras raras e actinídeos. O Tc continua com seu perfil primário independente; Pu–Ga NÃO equivale a Pu elementar.

## Condições específicas recuperadas

- **Li, Ca e Pb:** Mathewson descreve explicitamente **298 K**, não 273,15 K.
- **Mg:** Palm descreve filme de **25 nm**, evaporado por feixe de elétrons e recozido em vácuo por duas horas a 350 °C.
- **Zr:** Palm descreve filme de **200 nm**, com o mesmo procedimento térmico. A temperatura de tratamento NÃO é a temperatura da medição óptica, identificada como room temperature sem número exato.
- **Al:** McPeak descreve filme de Al evaporado termicamente e separado de wafer de Si (template stripping).
- **Be, W, Pt:** Rakić contém ajuste de modelo Lorentz–Drude aos dados experimentais de várias fontes, DOI https://doi.org/10.1364/AO.37.005271. Não classificar como experimento único.
- **Ta:** Werner usa constantes reconstruídas por espectroscopia de perda de energia de elétrons refletidos (REELS), DOI https://doi.org/10.1063/1.3243762.
- **Os:** Nemoshkalenko-e representa **raio extraordinário**, não resposta média ou sem polarização.
- **Ir:** Roberts informa metal policristalino recozido medido por elipsometria, em temperatura ambiente não quantificada.
- **Johnson/Christy:** vários metais têm descrição room temperature, sem temperatura numérica certificada de 273,15 K.

Fonte do catálogo: https://github.com/polyanskiy/refractiveindex.info-database. Descrição científica: Polyanskiy, Scientific Data 11, 94 (2024), DOI https://doi.org/10.1038/s41597-023-02898-2. O YAML deve citar também a publicação original (guardada individualmente quando possui DOI).

## Fórmulas e limites

Interpolate apenas entre dois pontos vizinhos de comprimento de onda do YAML: n(0,550 µm) = n1 + (n2−n1)·(0,550−λ1)/(λ2−λ1), analogamente k.

Em incidência normal, interface ideal com ar: R = ((n−1)²+k²)/((n+1)²+k²). A verificação matemática não substitui validação de fase, rugosidade, óxido, preparação, direção de polarização ou temperatura. Tampouco permite prever cor ou brilho por um único comprimento de onda.

## Aplicação no programa

- Quatro catálogos imutáveis: domain/silm/data/optical-source-audit-part1.js até part4.js. Guardam o SHA do conteúdo YAML, DOI, condição, fonte, faixa e dois pontos espectrais que reproduzem R550.
- Registro de validação: domain/silm/data/optical-source-audit-registry.js. A inicialização rejeita divergência entre resultado do YAML e os 30 valores anteriormente publicados.
- Em **Explorar → Brilho metálico**, o mesmo painel de pesquisa do PR #142 exibe a distinção explícita **ARQUIVO YAML CONFERIDO / ARTIGO COMPLETO AINDA NÃO AUDITADO**, classe experimental/modelo, condições e DOI. As demais 29 fichas permanecem sinalizadas como fonte não confrontada nesta etapa.
- Cache offline versionado. Sem novas rotas, janelas ou motores independentes.
- Todos os dados continuam com referência somente-leitura, pressão/temperatura CNTP não comprovadas e engineRelease=false. Nenhum parâmetro novo é aplicado à luz, à cena, a material-engine.js, a optical-observation.js ou ao cálculo de outras propriedades.

## Gates

Tests: tests/optical-original-yaml-audit-30.test.mjs (contagem, fontes e reprodução de Fresnel) e tests/run-optical-original-yaml-audit-30.mjs (painel nos três navegadores, desktop/mobile e não interferência com Tc/Cu/Fe). Regressões gerais, microestrutura, roteiros e offline mantidos.

**Próximo lote:** consultar diretamente as fontes não YAML: atlas Weaver, AIP e gráficos históricos de terras raras, Hf, Sn e patentes. Uma fonte documentada não deve ser promovida ao solver óptico sem validação do tipo de observação e da amostra.
