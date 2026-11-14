# SILM — Etapa 73: oito evidências de compressão em sete metais

**Data:** 14/11/2026. **Escopo:** ampliar as referências condicionais de maleabilidade após a matriz científica da Etapa 72 (92 metais) e o PR #144. Os 72 metais citados pelo usuário ainda requerem uma lista nominal. Nenhum novo registro é homologado para o motor a 273,15 K e 101325 Pa.

## Por que investigar compressão?

A matriz anterior continha bons dados elétricos, térmicos e ópticos, além de numerosos perfis de ductilidade. A fração mais incompleta era a **deformação plástica sob compressão e outros processos de conformação**. Não é correto usar módulo de Young, dureza, alongamento à ruptura ou redução durante laminação como medida escalar de maleabilidade.

A nova pesquisa acrescenta **8 fichas de 7 metais**. Seis metais (Ti, Ni, Cu, Fe, Hf, Zr) têm evidência direta de compressão apresentada; U tem um ajuste constitutivo baseado em dados de compressão, não um novo limite de deformabilidade. Há dois estudos independentes de Hf.

## Evidências da fonte

| Metal e amostra | Evidência numérica | Significado correto |
|---|---|---|
| Ti-α HC de pureza 99,99% | ε=0,4 a 23 °C (296,15 K), taxas 0,001, 0,01 e 1 s⁻¹ | Deformação aplicada no ensaio e observação de maclação; não deformação máxima antes de falhar |
| Ni maciço 99,7% | Deformação verdadeira analisada até 0,2, com m≤0,009 | Análise da sensibilidade à taxa, não limite de maleabilidade. Não usar resultados de espuma Ni |
| Cu comercial OFHC | εverdadeira=0,1 com taxas 10⁴–10⁵ s⁻¹, T na faixa 300–600 K | Ponto de análise em compressão dinâmica; não resultado para oficina a 0 °C |
| Fe recozido, ~80 ppm C e ~300 ppm Mn | εverdadeira≈0,7, com curvas originais a 295 K | Deformação alcançada no ensaio, aproximadamente metade da altura inicial; não limite universal |
| Hf 99,99%, HC por DRX | Escoamento ~500 MPa a taxa 300 s⁻¹ | Tensão de escoamento sob compressão rápida e amostra específica; T inicial não quantificada |
| Hf policristalino | ε≈0,25 | Transição aproximada no encruamento relatada no artigo de 1998, não falha nem limite |
| Zr702 comercialmente puro | 10% de compressão | Deformação aplicada para investigar maclação nas direções RD, TD e ND; tipo de porcentagem não esclarecido no resumo |
| α-U policristalino | σs≈2900 MPa | ASSÍNTOTA de tensão de escoamento ajustada em modelo; não tensão inicial de escoamento ou percentual de maleabilidade |

**Fonte científica por linha:**

1. Pedgaonkar, Nascimento, Beyerlein e Bronkhorst (2025), Thermo-mechanical experiments for deformation twinning in high-purity titanium, Mechanics of Materials 211, 105479. https://doi.org/10.1016/j.mechmat.2025.105479. Metodologia e seções da publicação consultadas.
2. Tateyama e Yamada (2021), Nonuniform Deformation of Cell Structures Owing to Plastic Stress Wave Propagation, Applied Mechanics 2, 911–931. https://doi.org/10.3390/applmech2040053. **Texto integral aberto inspecionado**, especialmente seção sobre Ni maciço.
3. Lea e Jardine (2018), Characterisation of high rate plasticity in the uniaxial deformation of high purity copper at elevated temperatures, International Journal of Plasticity 102, 41–52. https://doi.org/10.1016/j.ijplas.2017.11.006. Resumo e metadados no repositório https://www.repository.cam.ac.uk/items/d7ad9db6-225e-45d8-bf90-9e9067a66469.
4. Hockett e Zukas (1974), The Response of Iron to Dynamic Compression, relatório Los Alamos LA-UR-74-279. https://www.osti.gov/servlets/purl/4307114. Texto do relatório, condições e descrições de figuras consultados.
5. Yu, Luo, Ni e Song (2020), Deformation mechanism of pure hafnium under high speed compression, Materials Characterization 169, 110639. https://doi.org/10.1016/j.matchar.2020.110639. Resumo e trecho metodológico.
6. Subhash e colaboradores (1998), The mechanical behavior of polycrystalline hafnium: strain-rate and temperature dependence, Materials Science and Engineering A 246, 265–281. https://doi.org/10.1016/S0921-5093(97)00746-6. Resumo publicado.
7. Chen e colaboradores (2025), Importance of basal slip on the plastic deformation behavior of zirconium alloy Zr702, Journal of Nuclear Materials 606, 155655. https://doi.org/10.1016/j.jnucmat.2025.155655. Resumo publicado.
8. Hockett e Sherby (1975), Large strain deformation of polycrystalline metals at low homologous temperatures, Journal of the Mechanics and Physics of Solids 23, 87–98. https://doi.org/10.1016/0022-5096(75)90018-6. Resumo científico e parâmetro assintótico relatado.

## Portões de interpretação

- Nenhuma deformação aplicada em um ensaio é declarada capacidade máxima do metal. Deformação verdadeira é logarítmica; não tratar automaticamente como redução geométrica.
- Co e Ta já possuíam ensaios de compressão documentados na pesquisa anterior. Os novos metais com compressão expandem o conjunto de fontes, mas **não homologam as cinco propriedades juntas em CNTP**.
- O Zr702 é um grau comercial com composição e textura; deve ser identificado como tal e não como zircônio ideal.
- O valor de U é um **parâmetro de ajuste**, não observação de início de escoamento. O α-U tem estrutura ortorrômbica e não pode herdar os sistemas de deslizamento HC de Ti/Zr/Hf.
- A pressão, quando não especificada, permanece nula. Não transformar room temperature em 273,15 K.
- Somente a fonte aberta de Ni e o texto do relatório de Fe foram inspecionados mais amplamente; para as demais, foi usado o resumo original e trechos metodológicos disponíveis. Isso continua sendo evidência condicionada.

## Integração na experiência existente

- Catálogo somente-leitura: domain/silm/data/research-compression-stage73.js. Cada registro inclui amostra, método, grandeza, proveniência e condições.
- Interface: domain/silm/research-evidence-panel.js, no próprio **Explorar → Maleabilidade**.
- Rótulos novos diferenciam **deformação estudada**, **tensão de escoamento sob compressão**, **marco de encruamento** e **tensão assintótica ajustada**. Não aparece em Ductilidade.
- Cache offline atualizado; sem alteração de motor de deformação, efeitos térmicos, óptica ou efeito Joule.
- Nenhum parâmetro numérico ingressa no motor: referenceOnly=true, CNTPhomologated=false, engineRelease=false para os oito registros.

## Testes

- tests/stage73-compression-research.test.mjs — fontes, amostras, grandezas, limites e integridade.
- tests/run-stage73-compression.mjs — experiência real de maleabilidade e seleção de estudos nos três navegadores, desktop e mobile.
- CI existente garante regressão dos painéis anteriores, roteiros, microestrutura, cache offline e navegação.

**Próximo lote:** obter e inspecionar curvas completas tensão verdadeira × deformação verdadeira por amostra, com geometria, textura, pureza, taxa, pressão e temperatura; transformar os dados em modelos condicionais apenas após verificar o domínio de validade.
