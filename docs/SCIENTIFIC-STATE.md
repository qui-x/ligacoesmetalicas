# Estado científico do SILM — schema 4

> Documento reconstruído na 0.4.0 e atualizado na 0.5.0. O arquivo original da 0.3.0 não constava do pacote recebido. O conteúdo descreve o código vigente (`domain/silm/state.js`) e o histórico dos schemas.

O SILM possui **uma única fonte de verdade** para a ciência: o `scientificState`. Laboratório Livre, Explorar, Medir, Calcular e os futuros Roteiros e Missões observam e modificam o mesmo estado. Não existem estados paralelos (`routeScientificState`, `missionStructure` etc.).

```text
Banco científico (somente leitura)
        ↓
metal selecionado → INVESTIGAÇÃO → scientificState → Explorar / Medir / Calcular
                                                   → Laboratório / Roteiros / Missões
```

## 1. Versões

| `schemaVersion` | SILM | Conteúdo |
|---|---|---|
| 1 | 0.2.1 | seleção provisória de metal |
| 2 | 0.3.0 | investigação formal; `structure` sempre `null` |
| 3 | 0.4.0 | `structure` passa a aceitar a montagem metálica formal |
| **4** | **0.5.0** | `structure.mode` livre/cristalino e `structure.crystallography` (CCC, CFC, HC) |

`schemaVersion` é a versão do contrato do estado, não a versão do produto.

## 2. Estrutura do schema 4

```js
{
  schemaVersion: 4,
  investigation: null | { id: 'inv-…', status: 'new'|'active'|'paused', type: 'free'|'route'|'mission'|'teacher', createdAt, updatedAt },
  metal: null | { atomicNumber: 29, symbol: 'Cu', sourceId: '…' },
  module: { active: 'explorar'|'medir'|'calcular' },
  structure: null | MetallicAssembly,      // novo no schema 3
  electrons: null,                         // reservado para a 0.6.x
  conditions: { temperature: null, pressure: null },
  observations: [],                        // textos, até 12 000 caracteres cada
  measurements: [],                        // vazio até a 0.9.x
  calculations: [],                        // vazio até a 0.10.x
  representation: { dimension: null, layers: [] },
  metadata: {}
}
```

O estado guarda apenas a identidade do metal. Os dados tabelados (estrutura de referência, massa atômica etc.) são resolvidos pelo banco e nunca copiados nem alterados.

### 2.1 `structure` (montagem metálica, `modelVersion` 2)

```js
{
  modelVersion: 2,
  type: 'metallic-assembly',
  metalAtomicNumber: 29,                   // conferência; a fonte é scientificState.metal
  mode: 'free'|'crystalline',
  status: 'empty'|'assembling'|'assembled',
  units: [ { id: 'unit-…', position: { x, y }, createdAt, placement: 'manual'|'assisted' } ],   // modo livre
       // modo cristalino: { id, createdAt, placement: 'manual'|'assisted'|'crystallographic', site: { cell: [i,j,k], basis } }
  assistance: { enabled: true, mode: 'placement' },
  referenceStructureId: null | 'cu-reference',   // registro do banco no modo cristalino
  crystallography: null | { structureType: 'BCC'|'FCC'|'HCP', sourceId, coordination, representation, freeUnits, organizedAt },
  createdAt, updatedAt
}
```

Detalhes conceituais: [`MONTAGEM-ESTRUTURA-METALICA.md`](MONTAGEM-ESTRUTURA-METALICA.md) (modo livre) e [`CONTRATO-CRISTALOGRAFICO.md`](CONTRATO-CRISTALOGRAFICO.md) (modo cristalino, regras e códigos de validação).

## 3. Validação (`SILM.validateScientificState`)

Bloqueante no build (`scripts/validate-scientific-state.cjs`) e aplicada a todo estado restaurado.

| Regra | Código de recusa |
|---|---|
| `schemaVersion === 4` | `SCHEMA_INCOMPATIBLE` |
| modo cristalino: tipo, referência, fonte, coordenação, sítios, autoria, célula completa, representação | ver `CONTRATO-CRISTALOGRAFICO.md` |
| módulo registrado | `MODULE_INVALID` |
| `electrons === null` | `FUTURE_DATA_UNSUPPORTED` |
| `measurements` e `calculations` vazios | `DATA_INVALID` |
| condições e representação ainda nulas | `CONDITIONS_INVALID` |
| sem investigação → sem metal e sem estrutura | `ORPHAN_METAL` |
| investigação com ID, status, tipo e datas válidos | `INVESTIGATION_INVALID`, `TIMESTAMP_INVALID` |
| metal existente, disponível e coerente com o banco | `METAL_INVALID`, `METAL_UNAVAILABLE` |
| `structure`: `modelVersion`, `type`, `status`, `units` | `STRUCTURE_INVALID` |
| `structure.metalAtomicNumber === metal.atomicNumber` | `STRUCTURE_METAL_MISMATCH` |
| nenhuma unidade com elemento próprio | `STRUCTURE_MIXED_ELEMENTS` |
| unidade com exatamente `id`, `position`, `createdAt`, `placement`; ID único | `UNIT_INVALID` |
| posição `{x, y}` finita, sem NaN/Infinity, dentro da área segura | `POSITION_INVALID` |
| nenhum par de unidades a menos de 0,10 | `UNITS_OVERLAP` |
| no máximo 48 unidades | `UNITS_LIMIT` |
| `empty` ⇔ 0 unidades; `assembled` exige 2 ou mais | `STATUS_INCONSISTENT` |
| assistência `{enabled: boolean, mode: 'placement'}` | `ASSISTANCE_INVALID` |
| modo livre: `referenceStructureId === null` e `crystallography === null` | `FUTURE_DATA_UNSUPPORTED` |
| modo cristalino: adicionar, mover e desfazer são recusados | `CRYSTALLINE_MODE` |

## 4. Serviço e lifecycle

Somente `SILM.createScientificState()` escreve no estado. Consumidores recebem cópias (`state`, `snapshot()`).

| Método | Efeito |
|---|---|
| `begin(z, type)` | nova investigação com metal disponível; `structure = null` |
| `setModule(id)` | troca a perspectiva; nunca apaga a montagem |
| `setStatus(s)` | `new`, `active` ou `paused` |
| `resetInvestigation()` | mantém metal e identidade; limpa estrutura, elétrons, medidas, cálculos e observações |
| `close()` | remove investigação, metal e estrutura |
| `beginAssembly()` | cria a estrutura vazia |
| `addUnit(pos?)` | adiciona uma unidade do metal ativo (posição assistida ou destino resolvido) |
| `moveUnit(id, pos, {gesture})` | move, aplicando a assistência ou recusando a sobreposição |
| `undo()` | desfaz a última adição ou movimento |
| `clearStructure()` | `structure → null` |
| `organize()` | organiza segundo a estrutura de referência do banco; completa a célula |
| `restoreFree()` | volta exatamente à montagem livre anterior |
| `setCrystalRepresentation(patch)` | vista, célula, vizinhos, rótulos e seleção (representação) |
| `setAssistance(bool)` / `setAssemblyStatus(s)` | assistência; marcação `assembled`/`assembling` |
| `restore(value)` / `load()` | valida, migra e restaura; em falha, recupera para o estado vazio |

Na interface, o domínio respeita `init`, `mount`, `activate`, `resize`, `reset`, `deactivate` e `destroy` da Base. A área de montagem libera captura de ponteiro, observers, quadros de animação e listeners ao ser destruída. Não há laço contínuo.

## 5. Eventos

Cada escrita persiste o estado e emite o evento específico seguido de `investigation:updated` (prefixo `domain:silm:` no barramento da Base):

`investigation:created`, `investigation:reset`, `investigation:closed`, `investigation:status`, `investigation:restored`, `metal:changed`, `scientific:module-changed`, `structure:created`, `structure:unit-added`, `structure:unit-moved`, `structure:undone`, `structure:cleared`, `structure:assistance`, `structure:status`, `structure:organized`, `structure:free`, `structure:representation`.

## 6. Persistência

- Chave `scientific.state` no namespace do domínio SILM (`simcore_domain_silm_v1_`), sempre pela API de storage da Base.
- O histórico de desfazer fica só em memória (até 30 ações) e não é restaurado após recarregar. O estado científico final, sim.
- Estado inválido ou corrompido não quebra o aplicativo: o SILM informa "A investigação anterior não pôde ser restaurada." e volta à seleção, gravando um estado vazio válido.
- Correção de origem 0.3.x: no Laboratório Livre, a investigação é retomada diretamente, sem o diálogo "Retomar sessão?".

## 7. Migrações

| De → para | Regra |
|---|---|
| 1 → 4 | seleção provisória vira investigação `free` com o metal, se ele estiver disponível |
| 2 → 4 | mesmo conteúdo, com `schemaVersion: 4`. Só é aceita se `structure` e `electrons` forem `null`. Nenhuma montagem é criada automaticamente. |
| **3 → 4** | a montagem livre da 0.4.x é preservada: `modelVersion: 2`, `mode: 'free'`, `crystallography: null`; unidades, posições e status inalterados. |

Exemplo da migração 3 → 4:

```text
schema 3: metal = Cu, structure = { modelVersion: 1, units: 5 }, module = explorar
schema 4: metal = Cu, structure = { modelVersion: 2, mode: 'free', units: 5, crystallography: null }, module = explorar
```

A migração roda na restauração (`restore`) e o resultado é gravado logo em seguida no schema 4. O evento `investigation:restored` informa `migrated: true` e `from` (1, 2 ou 3).

## 8. Preparação para a 0.6.x

A 0.6.x tornará `electrons` um objeto formal (modelo eletrônico qualitativo) com representação própria (`electrons.representation`), no mesmo padrão de `crystallography.representation`. Na 0.5.x `electrons` continua `null`.
