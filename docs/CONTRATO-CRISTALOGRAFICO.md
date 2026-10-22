# Contrato cristalográfico (schema 4, modelo da estrutura 2)

## Estrutura no modo cristalino

```js
structure: {
  modelVersion: 2, type: 'metallic-assembly', metalAtomicNumber: 29,
  mode: 'crystalline',                       // 'free' | 'crystalline'
  status: 'assembling' | 'assembled',        // nunca 'empty' no modo cristalino
  units: [ { id, createdAt, placement: 'manual'|'assisted'|'crystallographic', site: { cell: [i, j, k], basis: b } } ],
  assistance: { enabled, mode: 'placement' },
  referenceStructureId: 'cu-reference',      // id do registro no banco; null no modo livre
  crystallography: {
    structureType: 'BCC' | 'FCC' | 'HCP',    // enum interno; interface em português: CCC, CFC, HC
    sourceId,                                // fonte do registro de referência
    coordination: 8 | 12,                    // do modelo; validado contra o tipo
    representation: { view: 'cell'|'lattice', unitCell, neighbors, labels, selectedUnitId },
    freeUnits: [ ...unidades livres antes de organizar... ],
    organizedAt
  },
  createdAt, updatedAt
}
```

- **Sítio:** índice da célula (inteiros de −3 a 3) e índice da base do modelo. A posição 2D é derivada pela projeção e nunca é armazenada.
- **Autoria:** unidades `manual` ou `assisted` precisam existir em `freeUnits` com a mesma origem e o mesmo `createdAt`. Unidades `crystallographic` não podem existir lá.
- **Completude:** todos os sítios da célula desenhada estão ocupados, e `units.length = max(freeUnits.length, sítios da célula)`.
- **Representação:** vista, camadas e seleção são estado de representação, persistido para a retomada. Alterá-las não muda `units`, `referenceStructureId` nem `updatedAt`.

## Validação (bloqueante)

| Regra | Código |
|---|---|
| chaves exatas da estrutura (sem `crystalState`, `lattice` etc.) | `STRUCTURE_INVALID`, `CRYSTALLOGRAPHY_INVALID` |
| `mode` livre ⇔ `crystallography = null` e `referenceStructureId = null` | `MODE_INCONSISTENT` |
| metal com cristalografia disponível | `CRYSTALLOGRAPHY_UNAVAILABLE` |
| `structureType` no enum (sem texto livre) | `CRYSTAL_TYPE_INVALID` |
| tipo, referência e fonte iguais aos do banco para o metal ativo | `CRYSTAL_REFERENCE_MISMATCH` |
| coordenação correta para o tipo | `COORDINATION_INVALID` |
| sítio válido e sem duplicação | `SITE_INVALID`, `SITE_DUPLICATED` |
| autoria preservada | `AUTHORSHIP_INVALID` |
| célula completa | `CELL_INCOMPLETE` |
| vista, camadas e seleção válidas | `REPRESENTATION_INVALID` |
| `electrons === null` | `FUTURE_DATA_UNSUPPORTED` |

A elegibilidade e a geometria são recalculadas do banco a cada validação. Um estado salvo não consegue impor uma estrutura diferente da registrada.

## Elegibilidades distintas

| | Investigação | Cristalografia |
|---|---|---|
| Fonte | `silmEligibility` (banco, 0.2.x) | `SILM.crystal.eligibility(e)` (0.5.x) |
| Indisponível | o metal não pode ser investigado | o metal é investigado e montado livremente, sem organização cristalográfica |
| Motivos | `NOT_METALLIC`, `INSUFFICIENT_VALIDATED_DATA`, `SUPERHEAVY_LIMITATION`, `STRUCTURE_NOT_HOMOLOGATED`, `DATA_CONFLICT` | `REFERENCE_STRUCTURE_MISSING`, `CRYSTAL_STRUCTURE_UNSUPPORTED`, `REFERENCE_CONDITION_UNSUPPORTED`, `DATA_CONFLICT` |

## Testes geométricos (build)

`scripts/validate-scientific-state.cjs` confere, para os 48 metais suportados:
- sítios expandidos do banco = base do modelo;
- papéis dos sítios da célula: CCC 8 + 1, CFC 8 + 6, HC 12 + 2 + 3;
- ausência de sítios duplicados;
- N vizinhos com a camada seguinte pelo menos 10% mais distante;
- distâncias a√3/2 (CCC), a/√2 (CFC), a e √(a²/3 + c²/4) (HC);
- c/a igual ao do banco.

Entradas adulteradas (grupo espacial, sítios, c, fase, tipo) produzem o motivo correto e não geram estrutura.
