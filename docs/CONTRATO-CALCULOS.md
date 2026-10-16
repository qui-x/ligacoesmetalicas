# Contrato dos cálculos — `scientificState.calculations[]` (schema 8)

Os cálculos pertencem ao **mesmo** `scientificState`. Não existem `calculateScientificState`, `calculationStructure` nem `calculationMetal`. As fórmulas vivem num **catálogo único** (`SILM.formulas`, em `domain/silm/calculations.js`). Componentes de interface não contêm fórmulas.

## Registro (§4)

```js
{
  id: 'calc-…',                          // único na investigação
  type: 'effectiveAtoms'|'cellVolume'|'radius'|'latticeParameter'|'packingFactor'|'density'|'caRatio',   // = formula.quantity
  formulaId: 'theoretical-density',      // fórmula do catálogo
  structureType: 'BCC'|'FCC'|'HCP',      // estrutura em que foi aplicada
  inputs: [ {
    key: 'M', symbol: 'M', name: 'massa molar',
    value: 63.546,                       // número canônico; [mín, máx] só para peso atômico em intervalo
    unit: 'g/mol',
    origin: 'TABULATED'|'MODEL_MEASUREMENT'|'USER'|'CALCULATED'|'CONSTANT',
    ref: { sourceId } | { measurementId } | { calculationId } | { formulaId } | null
  }, … ],
  result: { value: 8.9345…, interval: null },   // ou { value: null, interval: [a, b] }
  unit: 'g/cm³',                         // = formula.outputUnit
  provenance: { kind: 'CALCULATED', model: 'célula ideal sem defeitos…', references: ['src-nbs-539-v1','src-ciaaw-2024','src-bipm-si-2019'], dependsOn: ['calc-…'] },
  structureContext: { mode: 'crystalline', structureType, referenceStructureId, sourceId, signature },
  metalAtomicNumber: 29,
  createdAt: '2026-…Z'
}
```

| Campo | Regra |
|---|---|
| `inputs[].ref` | `TABULATED` → fonte do banco; `MODEL_MEASUREMENT` → ID da medição; `CALCULATED` → ID do cálculo de origem (ou a fórmula de contagem, para `n`); `USER` → `null`; `CONSTANT` → fonte da constante ou `null` quando é uma definição |
| `provenance.references` | fontes de todas as entradas mais as referências da própria fórmula, sem repetição |
| `provenance.dependsOn` | cálculos e medições de que este resultado depende. É uma referência, não uma ligação reativa |
| `structureContext` | o mesmo contexto das medições (`SILM.measurement.context`): assinatura do momento da organização |

O cálculo é atual quando o contexto coincide com o da estrutura presente (`SILM.calculation.current`). Caso contrário, é de estado anterior: o registro continua no histórico, inalterado, e não é oferecido como entrada de novos cálculos.

## Catálogo central (§5)

Cada fórmula declara:

```text
id · name · quantity · expression · spoken · applicability · requiredInputs · constants · outputUnit · outputSymbol · model · references · notes · compute
```

- `expression` é notação matemática legível (`V = a³`) e `spoken` é o equivalente textual para leitores de tela.
- `requiredInputs[].origins` lista as origens permitidas para cada entrada. O número efetivo `n`, por exemplo, só aceita `CALCULATED`, e a massa molar aceita `TABULATED` ou `USER`.
- `applicability` diz em quais estruturas a fórmula vale. Aplicá-la a outra estrutura é recusado no serviço (`addCalculation`) e no validador (`FORMULA_NOT_APPLICABLE`).
- `references` traz as fontes da própria fórmula. A densidade usa N_A exato (`src-bipm-si-2019`). As demais são derivações geométricas da célula adotada, documentadas em [`FORMULAS-CRISTALOGRAFICAS.md`](FORMULAS-CRISTALOGRAFICAS.md) e conferidas pelos testes.

## Cálculo (`SILM.calculation.compute`)

1. Confere se a fórmula existe e se cada entrada exigida está presente e é um número finito e positivo. `NaN`, `Infinity` e `-Infinity` são recusados (`INPUT_INVALID`).
2. Aplica `compute` do catálogo. Um intervalo de peso atômico produz um intervalo de densidade.
3. Recusa resultado não finito ou não positivo (`RESULT_INVALID`).
4. Aplica a verificação física da fórmula: FE > 1 é `PHYSICALLY_INVALID`.

Não há divisão por zero possível: todos os denominadores são entradas positivas ou constantes.

## Validação (bloqueante, no validador do estado)

O validador **recalcula** cada registro com a mesma fórmula e as mesmas entradas. Um registro adulterado é recusado.

| Regra | Código |
|---|---|
| lista com até 200 registros | `CALCULATIONS_INVALID` |
| com cálculos, há investigação e metal | `CALCULATION_CONTEXT_INVALID` |
| o metal tem geometria cristalina | `CALCULATION_WITHOUT_STRUCTURE` |
| chaves exatas; ID `calc-…` único; data válida | `CALCULATION_INVALID` |
| fórmula do catálogo e `type` igual à grandeza da fórmula | `FORMULA_UNKNOWN` |
| fórmula aplicável à estrutura do registro e à do metal | `FORMULA_NOT_APPLICABLE` |
| unidade de saída da fórmula | `CALCULATION_UNIT_INVALID` |
| metal do cálculo = metal da investigação | `CALCULATION_METAL_MISMATCH` |
| contexto cristalino com tipo e fonte coerentes com o banco | `CALCULATION_CONTEXT_INVALID` |
| exatamente as entradas e as constantes da fórmula | `CALCULATION_INPUTS_INVALID` |
| constante com valor e unidade do serviço central | `CALCULATION_CONSTANT_INVALID` |
| origem permitida para a entrada, unidade da entrada e referência do tipo certo | `CALCULATION_ORIGIN_INVALID` |
| valor finito e positivo; `n` igual à contagem geométrica | `CALCULATION_VALUE_INVALID` |
| dado tabelado idêntico ao do banco, com a mesma fonte | `CALCULATION_TABULATED_MISMATCH` |
| resultado igual ao recalculado (tolerância relativa de 10⁻⁹) | `CALCULATION_RESULT_INVALID` |
| proveniência `CALCULATED` com `model`, `references` e `dependsOn` | `CALCULATION_PROVENANCE_INVALID` |

## Serviço

| Método | Efeito |
|---|---|
| `calculationAvailability()` | `{ok}` ou `{ok:false, reason: 'NO_STRUCTURE'|'NO_SCALE'|'DEFORMED'}` |
| `addCalculation(formulaId, inputs)` | acrescenta as constantes da fórmula, recalcula, grava proveniência e contexto; limite de 200 (`CALCULATIONS_LIMIT`) |
| `removeCalculation(id)` | remove um registro |
| `clearCalculations()` | remove todos os registros; estrutura e medições continuam |

`resetInvestigation()` e o início de nova investigação esvaziam a lista. `setModule()` não toca nela.

Eventos (prefixo `domain:silm:`): `calculations:added`, `calculations:removed`, `calculations:cleared`.

## Representação (fora do estado científico)

- O cálculo escolhido, as origens marcadas e o texto digitado são estado transitório da interface e não são persistidos (§22).
- O destaque geométrico na cena (`data-calc` = `fractions`, `contact` ou `edges`) é representação.
- A apresentação com 4 algarismos significativos não altera o valor canônico gravado.
