# Contrato das medições — `scientificState.measurements[]` (schema 7)

As medições pertencem ao **mesmo** `scientificState`. Não existem `measureScientificState`, `measurementStructure` nem `measurementMetal`.

## Registro

```js
{
  id: 'meas-…',                         // único na investigação
  type: 'distance'|'angle'|'latticeParameter'|'coordination',
  instrument: 'ruler'|'goniometer'|'cell-gauge'|'neighbor-counter',   // fixo por tipo
  value: 2.556,                          // número canônico (Å, graus ou contagem); nunca texto localizado
  unit: 'Å'|'°'|'1',                     // fixo por tipo
  resolution: 0.001|0.1|1,               // resolução do instrumento virtual (fixa por tipo)
  points: [ { unitId: 'unit-…', site: { cell: [i,j,k], basis: n } }, … ],   // 2, 3 ou 1 pontos
  parameter: null|'a'|'c',               // só em latticeParameter
  structureContext: { mode: 'crystalline', structureType, referenceStructureId, sourceId, signature },
  source: { kind: 'MODEL_MEASUREMENT', latticeSourceId },
  metalAtomicNumber: 29,
  createdAt: '2026-…Z'
}
```

| Campo | Regra |
|---|---|
| `points[].site` | Sítio científico (célula + base), não coordenada de mouse. O `unitId` serve para localizar o centro na cena atual |
| `structureContext.signature` | Momento da organização + número de unidades. Identifica o estado da estrutura quando a medição foi feita |
| `source.latticeSourceId` | Fonte dos parâmetros de rede usada pela geometria |

A medição é atual quando o contexto (assinatura e tipo) coincide com o da estrutura presente (`SILM.measurement.current`). Caso contrário, é de estado anterior: o registro continua no histórico, inalterado.

## Cálculo (`SILM.measurement.compute`)

1. Os sítios viram coordenadas cartesianas em Å: vetores de rede montados a partir dos parâmetros tabelados, mais as posições da base.
2. O valor é calculado nessas coordenadas e arredondado pela resolução. O arredondamento é a meia unidade mais próxima do passo: `round(v/res)·res`.

O zoom, o redimensionamento e a projeção não participam do cálculo.

| Tipo | Valor |
|---|---|
| `distance` | norma de B − A; o mesmo ponto é recusado (`SAME_POINT`) |
| `angle` | arco-cosseno de (A−B)·(C−B)/(‖A−B‖‖C−B‖), em graus |
| `latticeParameter` | B − A deve ser uma translação de rede (coordenadas fracionárias inteiras, mesma posição da base; senão `NOT_LATTICE_VECTOR`) e uma aresta da célula: no plano basal, comprimento igual a ‖a₁‖ (`a`); no eixo vertical, uma translação unitária (`c` no HC, `a` nos cúbicos); caso contrário, `NOT_CELL_EDGE` |
| `coordination` | número de vizinhos imediatos do sítio pela regra do contrato cristalográfico (sem corte arbitrário) |

## Validação (bloqueante, no validador do estado)

| Regra | Código |
|---|---|
| lista com até 200 registros | `MEASUREMENTS_INVALID` |
| com medições, há investigação e metal | `MEASUREMENT_CONTEXT_INVALID` |
| chaves exatas; ID `meas-…` único; data válida | `MEASUREMENT_INVALID` |
| tipo registrado e instrumento do tipo | `MEASUREMENT_TYPE_INVALID` |
| unidade e resolução do tipo | `MEASUREMENT_UNIT_INVALID` |
| valor numérico finito (sem NaN/Infinity) | `MEASUREMENT_VALUE_INVALID` |
| metal da medição = metal da investigação | `MEASUREMENT_METAL_MISMATCH` |
| contexto cristalino com geometria válida (sem medida absoluta sem escala) | `MEASUREMENT_WITHOUT_SCALE` |
| estrutura de referência e fonte coerentes com o banco | `MEASUREMENT_CONTEXT_INVALID` |
| fonte `MODEL_MEASUREMENT` com a fonte de rede do banco | `MEASUREMENT_SOURCE_INVALID` |
| número de pontos do tipo; sítio com célula inteira em −3…3 e base válida | `MEASUREMENT_POINTS_INVALID` |
| o valor gravado é o que o modelo dá para esses sítios, até meia resolução; `parameter` coerente | `MEASUREMENT_VALUE_INVALID` |

O último item impede que um registro adulterado seja aceito: o validador **recalcula** cada medição.

## Serviço

| Método | Efeito |
|---|---|
| `measurementAvailability()` | `{ok}` ou `{ok:false, reason: 'NO_STRUCTURE'|'NO_SCALE'|'DEFORMED'}` |
| `addMeasurement(type, unitIds)` | registra uma medição concluída (pontos como IDs de unidade; grava os sítios); limite de 200 (`MEASUREMENTS_LIMIT`) |
| `removeMeasurement(id)` | remove um registro |
| `clearMeasurements()` | remove todos os registros; a estrutura continua |

`resetInvestigation()` e o início de nova investigação esvaziam a lista. `setModule()` não toca nela.

Eventos (prefixo `domain:silm:`): `measurements:added`, `measurements:removed`, `measurements:cleared`.

## Representação (fora do estado científico)

- O instrumento escolhido e os pontos em escolha são estado transitório da interface, não persistido.
- A unidade de apresentação (Å, pm ou nm) é preferência de representação (`measure.view`), independente do valor canônico.
