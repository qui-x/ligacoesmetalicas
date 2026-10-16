# Constantes científicas e conversões (0.10.x)

O SILM centraliza constantes e fatores de conversão num único serviço (`SILM.constants` e `SILM.calculation.convert`, em `domain/silm/calculations.js`). Nenhum outro arquivo do domínio repete esses números. A auditoria verifica isso na regra "Calcular: constantes centralizadas, sem números mágicos fora do serviço".

## Constantes (§14)

Cada constante registra valor, unidade e fonte (ou a definição que a torna exata).

| Chave | Símbolo | Valor | Unidade | Exata | Fonte |
|---|---|---|---|---|---|
| `avogadro` | N_A | 6,02214076 × 10²³ | mol⁻¹ | sim | `src-bipm-si-2019`: SI Brochure, 9.ª edição (BIPM, 2019). É uma das sete constantes definidoras do SI |
| `angstrom3ToCm3` | 1 Å³ | 10⁻²⁴ | cm³ | sim | definição: 1 Å = 10⁻¹⁰ m = 10⁻⁸ cm |
| `idealHcpRatio` | (c/a)ideal | √(8/3) ≈ 1,633 | 1 | sim | geometria do empilhamento ideal de esferas rígidas. O valor vem do modelo cristalográfico (`SILM.crystal.models.HCP.idealRatio`), sem segunda definição |

Nota de proveniência: o valor de N_A foi conferido no verbete A00543 do IUPAC Gold Book, que cita a SI Brochure. O PDF da BIPM não pôde ser aberto neste ambiente porque a rede bloqueou o acesso. O registro `src-bipm-si-2019` em `domain/silm/data/sources.json` descreve isso.

Quando uma constante entra num cálculo, ela é gravada como entrada `origin: 'CONSTANT'` com o mesmo valor e unidade do serviço. O validador recusa qualquer divergência (`CALCULATION_CONSTANT_INVALID`).

## Unidades e conversões (§15)

O comprimento reutiliza o sistema da 0.9.x (`SILM.units`). Volume e densidade usam a tabela do Calcular. O valor canônico gravado é sempre o da fórmula: Å, Å³, g/cm³ ou adimensional.

| Grandeza | Canônica | Apresentação | Fator |
|---|---|---|---|
| comprimento | Å | pm, nm | 1 Å = 100 pm = 0,1 nm |
| volume | Å³ | nm³, cm³, m³ | 1 Å³ = 10⁻³ nm³ = 10⁻²⁴ cm³ = 10⁻³⁰ m³ |
| massa molar | g/mol | — | dado tabelado (CIAAW) |
| massa da célula | g | — | intermediário `n·M/N_A` |
| densidade | g/cm³ | kg/m³ | 1 g/cm³ = 1000 kg/m³ |
| fator de empacotamento | 1 | % | multiplicado por 100 só na apresentação |

`SILM.calculation.convert(kind, value, unit)` recusa unidade desconhecida (lança erro). O validador do estado testa cada fator.

## Formatação

- 4 algarismos significativos na apresentação (`SILM.calculation.sig`). Os números pequenos ou grandes usam notação científica com sobrescritos (`4,724 × 10⁻²³ cm³`).
- Vírgula decimal e espaço antes da unidade, como no restante do SILM.
- Dados tabelados e valores informados aparecem como foram gravados, sem arredondar. Resultados calculados aparecem com 4 algarismos. Constantes aparecem pela sua definição.
