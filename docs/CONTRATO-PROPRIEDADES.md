# Contrato das propriedades metálicas (schema 6)

## 1. Estado da experiência — `scientificState.properties`

```js
properties: {
  modelVersion: 1,
  active: null | 'electrical' | 'thermal' | 'malleability' | 'ductility' | 'luster',
  startedAt: null | '…',
  electrical:   { field: false },
  thermal:      { heating: false, stage: 0 },   // 0–4
  malleability: { compression: 0 },             // 0–3
  ductility:    { elongation: 0 },              // 0–3
  luster:       { light: false }
}
```

- Existe sempre (estado-base quando não há experiência). Há um único `scientificState`: nada de estados paralelos por propriedade (§19).
- Só a propriedade **ativa** pode estar fora do estado-base.
- Os parâmetros são estado da experiência: **não** alteram `structure`, `crystallography` nem `electrons`.
- Não se salvam quadros de animação nem posições deformadas (§107). A geometria deformada é recalculada a partir dos parâmetros.

## 2. Validação (`SILM.validateProperties`)

| Regra | Código de recusa |
|---|---|
| chaves exatas; `modelVersion` 1 | `PROPERTIES_INVALID` |
| parâmetros com chaves, tipos e faixas exatos | `PROPERTY_PARAMS_INVALID` |
| `active` registrado ou `null` | `PROPERTY_UNKNOWN` |
| propriedades não ativas no estado-base | `PROPERTY_STATE_RESIDUAL` |
| `active = null` ⇔ `startedAt = null`; data válida | `PROPERTIES_INVALID` |
| ativa exige investigação, metal e estrutura | `PROPERTY_CONTEXT_INVALID` |
| ativa exige elegibilidade ≠ `unavailable` para o metal | `PROPERTY_UNAVAILABLE` |
| rede (térmica, maleabilidade, ductilidade, brilho) exige `structure.mode = crystalline` | `PROPERTY_CONTEXT_INVALID` |
| elétrica exige 2 ou mais unidades e modelo eletrônico | `PROPERTY_CONTEXT_INVALID` |

## 3. Serviço

| Método | Efeito | Evento |
|---|---|---|
| `propertyAvailability(id)` | contexto e elegibilidade: `NO_STRUCTURE`, `NEEDS_CRYSTALLINE`, `TOO_FEW_UNITS` ou o motivo do banco | — |
| `startProperty(id)` | ativa a experiência; a anterior volta ao estado-base; a elétrica ativa e mostra o modelo eletrônico | `properties:started` |
| `setPropertyParams(patch)` | só para a ativa, dentro das faixas | `properties:changed` |
| `restoreProperty()` | volta ao estado-base da experiência; investigação e metal intactos | `properties:restored` |
| `endProperty()` | `active = null`, tudo no estado-base | `properties:ended` |

Ciclo de vida: Limpar estrutura, Resetar, Encerrar e trocar de metal levam `properties` ao estado-base. Voltar à montagem livre encerra experiência de rede. Desfazer abaixo de duas unidades remove os elétrons e encerra a experiência elétrica. Organizar mantém a experiência elétrica. Trocar de módulo não apaga a experiência; ela é operada em Explorar, e Medir/Calcular só a acompanham.

## 4. Dados de propriedades no banco (`elements[].properties`)

O validador do banco (`scripts/validate-scientific-data.cjs`) exige, para cada entrada, `unit`, `conditions` e `sourceId` existente. O SILM só usa valores com **valor finito, unidade, condições e fonte**:

```js
properties: {
  electricalConductivity: { value, unit: 'MS/m', conditions: { temperature: {...} }, sourceId, purity?, anisotropy? },
  electricalResistivity:  { value, unit: 'nΩ·m', conditions: {...}, sourceId },   // σ = 1/ρ → Calculado pelo SILM
  thermalConductivity:    { value, unit: 'W/(m·K)', conditions: {...}, sourceId }
}
```

- Sem dado homologado → `PROPERTY_DATA_MISSING`, sem valor típico.
- Dado sem condição ou sem fonte → ignorado (testado no validador do estado).
- Anisotropia relevante → registrar a dependência direcional em vez de um escalar universal (§90). Pureza → registrar a condição quando a fonte informar (§89).

## 5. Fase de referência

`SILM.properties.phase(elemento)` usa a fase da estrutura de referência (`conditions.phase.value`) ou, sem estrutura, o dado `phaseAtReference` (valor, condições e fonte), quando homologado. Sem nenhum dos dois, a fase é "não registrada", e as experiências de sólido ficam indisponíveis (`REFERENCE_PHASE_UNSUPPORTED`).
