# Modelo eletrônico do SILM — elétrons deslocalizados

> Série 0.6.x. Implementação: `domain/silm/state.js` (contrato e validação), `domain/silm/electron-view.js` (representação), `domain/silm/bootstrap.js` (controles, painéis, Histórico e relatório).

## 1. Modelo adotado

O SILM representa o sólido metálico como:

> **centros metálicos positivos envolvidos por elétrons de valência deslocalizados.**

- Cada **centro metálico** é o núcleo com os elétrons internos. Ele é desenhado pela própria unidade da montagem (esfera dourada).
- Os **elétrons de valência** formam uma **distribuição coletiva** associada à **estrutura inteira**, e não a um átomo nem a um par de átomos.
- A coesão vem da interação desse conjunto deslocalizado com todos os centros. Por isso não há linhas `M—M` nem pares eletrônicos `M : M` localizados.

A expressão "cátions mergulhados em um mar de elétrons" é tratada como **simplificação didática** desse modelo. Ela aparece só no Manual, contextualizada, e nunca como explicação principal isolada.

## 2. Origem conceitual: valência

O modelo eletrônico registra, em `electrons.source`:

| Campo | Valor | Origem |
|---|---|---|
| `model` | `valence-electron-contribution` | cada centro contribui com seus elétrons de valência para o conjunto |
| `valenceSourceId` | `valenceModel.sourceId` do metal | convenção de valência do banco (IUPAC) |
| `configurationSourceId` | `electronConfiguration.sourceId` do metal | configuração do átomo neutro (NIST ASD) |

A convenção `valenceModel` do banco é **qualitativa** (`kind: QUALITATIVE`). Ela diz explicitamente que não existe contagem universal de elétrons livres e que, nos blocos d e f, orbitais s, d ou f podem participar conforme o modelo químico. O SILM, portanto:

- **não** usa "grupo = número de elétrons livres";
- **não** transforma a convenção em contagem visual (`N unidades × N elétrons`);
- mostra a configuração do átomo neutro como **dado tabelado** e a convenção de valência como **convenção do banco**, ambas com fonte, em Ver → Observar → Modelo eletrônico.

## 3. Transição átomo isolado → estrutura

```text
átomo metálico isolado (elétrons de valência associados ao átomo)
        ↓  incorporação à estrutura
centro metálico + contribuição eletrônica ao conjunto deslocalizado
```

- Ver → Observar mostra um **esquema conceitual estático** da transição.
- Na montagem livre com elétrons visíveis, ao adicionar uma unidade surgem quatro marcadores junto dela por 0,25 s, o "átomo isolado". Em seguida eles se dispersam no conjunto. Depois disso a unidade é apenas centro metálico: os elétrons de valência não aparecem ao mesmo tempo no átomo e no espaço deslocalizado.
- Com movimento reduzido, não há transição: a distribuição estática já inclui a nova unidade.
- A transição **não** é a ionização de um átomo isolado em fase gasosa (`M → M⁺ + e⁻`). É o modelo coletivo do estado metálico. Nenhuma unidade recebe rótulo de carga (`Cu⁺`, `Fe³⁺`). O caráter positivo dos centros é indicado só por um anel interno discreto, explicado na legenda.

## 4. Deslocalização e representação

| Aspecto | Decisão |
|---|---|
| Objeto | distribuição eletrônica coletiva da estrutura inteira (`electrons.type = delocalized-electron-model`) |
| Marcadores | pontos ciano com contorno de contraste, num **único canvas** decorativo (`aria-hidden`), fora da ordem de tabulação |
| Quantidade | `clamp(6 × centros, 24, 150)`; até 80 em cenas menores que 360 px. **Não** é o número de elétrons |
| Região | união de discos em torno dos centros desenhados (raio de 0,75 × distância entre vizinhos na tela). Na montagem livre, há pontes ao longo da árvore de menor distância, para a distribuição ser uma só |
| Célula unitária | o contorno não é parede: a região ultrapassa as arestas da célula |
| Rede extensa | os centros da rede entram na região, e a distribuição cobre toda a cena |
| CCC, CFC, HC | mesma regra para as três: a geometria muda, o modelo eletrônico não. Não há comportamento eletrônico inventado por estrutura |
| Montagem livre | "representação didática preliminar da ligação metálica coletiva" (legenda) |
| Estado | `representation.visible`, `representation.motion`, `densityMode: 'qualitative'`, `representationType: 'qualitative'` |
| Não é estado | posições, trajetórias e quantidade de marcadores. Não são salvas e não precisam se repetir após recarregar |

## 5. Movimento

- **Passeio aleatório isotrópico:** cada marcador tem uma direção que se difunde (difusão angular de 0,6 rad²/s, persistência de cerca de 1,7 s). A velocidade visual é de cerca de 2,2 raios da região por segundo.
- **Sem direção macroscópica:** as direções iniciais são uniformes e o confinamento é simétrico. O teste 0.6-112 mede deriva média abaixo de 0,25.
- **Sem órbitas e sem trajetórias fechadas:** cada marcador percorre vários centros. No teste 0.6-112 são em média 2,3 ou mais em 4 s, em CCC. Fora da região, o marcador vira suavemente de volta, sem reflexão em parede e sem girar em torno de um centro.
- **Não é corrente, campo aplicado, temperatura nem velocidade física.** Não há setas.
- O laço de animação existe só com elétrons visíveis, movimento ligado, sem movimento reduzido e com a aba visível. Ele é cancelado ao destruir a vista.
- **Movimento reduzido** (do sistema ou da Acessibilidade do SILM) prevalece: mostra a mesma distribuição, estática. Ela é determinística para a mesma estrutura.

## 6. Contrato no estado científico (schema 5)

```js
electrons: null | {
  modelVersion: 1,
  type: 'delocalized-electron-model',
  status: 'active',
  metalAtomicNumber: 29,
  source: { model: 'valence-electron-contribution', valenceSourceId: 'src-iupac-valence', configurationSourceId: 'src-nist-asd-2024' },
  representation: { visible: true, motion: true, densityMode: 'qualitative', representationType: 'qualitative' },
  createdAt: '…'
}
```

| Regra | Código de recusa |
|---|---|
| chaves exatas; `modelVersion` 1; tipo registrado; `status` `active`; data válida; sem `particles` nem `electronCountReal` | `ELECTRONS_INVALID` |
| `metalAtomicNumber` = metal da investigação | `ELECTRONS_METAL_MISMATCH` |
| estrutura existente com 2 ou mais unidades | `ELECTRONS_WITHOUT_STRUCTURE` |
| `source.model` registrado; chaves exatas | `ELECTRON_SOURCE_INVALID` |
| fontes iguais às do banco para o metal | `ELECTRON_SOURCE_MISMATCH` |
| `visible`/`motion` booleanos; `densityMode` e `representationType` qualitativos; chaves exatas | `ELECTRON_REPRESENTATION_INVALID` |
| sem investigação → `electrons = null` | `ORPHAN_METAL` |

Ciclo de vida:

| Ação | Efeito em `electrons` |
|---|---|
| Mostrar elétrons, primeira vez, em Explorar, com 2 ou mais unidades | cria o modelo (`electrons:activated`) |
| Ocultar / Mostrar / Movimento | só `representation` (`electrons:representation`); `updatedAt` não muda |
| Organizar estrutura | preservado |
| Voltar à montagem livre ou Desfazer até ficar com menos de 2 unidades | removido, com aviso |
| Limpar estrutura, Resetar, Encerrar, trocar de metal | removido |
| Medir e Calcular | mostram e ocultam; não ativam, não medem e não calculam elétrons |

## 7. Interface

- Barra **Modelo eletrônico**, abaixo da cena ou na coluna lateral em telas largas: **Mostrar/Ocultar elétrons**, **Movimento eletrônico** (alternância com `aria-pressed`), estado legível ("Elétrons visíveis · movimento visual ativo" ou "representação estática") e "?" para o Manual.
- **Montagem → Estrutura:** os mesmos controles, que só aparecem quando há estrutura.
- **Ver → Observar → Modelo eletrônico:** princípio, origem conceitual com fonte, configuração do átomo neutro, estado, esquema da transição, limites e link para o Manual.
- **Manual:** tópico "Elétrons deslocalizados", com Ideia principal, Observe no simulador, O que significa e Limites da representação.
- **Histórico:** ativação, ocultar, mostrar e movimento. **Relatório:** estado do modelo e as ressalvas.

## 8. Limitações

Ver [`LIMITACOES-MODELO-ELETRONICO.md`](LIMITACOES-MODELO-ELETRONICO.md).
