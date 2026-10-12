# Contrato da exploração (0.8.x)

> O módulo Explorar é uma **perspectiva** sobre o `scientificState` único. Este contrato descreve o que a exploração guarda **fora** do estado científico, e por que o schema científico continua 6.

## 1. O que é ciência e o que é representação

| Objeto | Onde fica | Exemplo |
|---|---|---|
| investigação, metal, estrutura, cristalografia, elétrons, propriedades | `scientificState` (schema 6) | estrutura CFC; modelo eletrônico ativo; compressão 2/3 |
| vista, célula, vizinhos, rótulos, seleção da estrutura cristalina | `structure.crystallography.representation` (desde 0.5.x) | rede extensa; vizinhos da unidade 5 |
| visibilidade e movimento dos elétrons | `electrons.representation` (desde 0.6.x) | elétrons ocultos |
| **foco do painel, camadas de apresentação, último modo de comparação** | **`exploration.view`** (armazenamento do domínio, fora do estado científico) | foco "Célula"; centros esmaecidos; comparar célula × rede |

A 0.8.x não criou estado científico novo (`exploreScientificState`, `exploreStructure`…): reorganizar a interface **não** incrementa o schema científico (§18).

## 2. `exploration.view`

```js
{
  focus: null | 'synthesis' | 'unit' | 'structure' | 'electrons' | 'property',
  layers: { centers: true, propertyHints: true },
  compare: null | 'free-crystal' | 'cell-lattice' | 'electrons' | 'property'
}
```

- Chave `exploration.view` no namespace do domínio (`simcore_domain_silm_v1_`). É apagada ao encerrar a investigação.
- **Saneamento:** um valor inválido volta ao padrão campo a campo, sem impedir a investigação de abrir (item 0.8-11b).
- **Não se persiste:** hover, dica, quadro de animação, ponteiro temporário, nem a comparação aberta. Só o último modo escolhido é guardado.
- O foco **segue o último objeto** com que o estudante interagiu: organizar → Célula; selecionar unidade → Centro; mostrar elétrons → Elétrons; iniciar propriedade → Propriedade. Escolher um foco no painel prevalece enquanto ele estiver disponível; caso contrário, o SILM usa o objeto mais relevante do estado atual.

## 3. Camadas

| Camada | Estado reutilizado | Observação |
|---|---|---|
| Centros metálicos | `exploration.view.layers.centers` | em destaque ou esmaecidos; as unidades continuam operáveis |
| Célula unitária | `crystallography.representation.unitCell` | 0.5.x |
| Rede extensa | `crystallography.representation.view` | 0.5.x |
| Vizinhos | `crystallography.representation.neighbors` | 0.5.x (seleciona a unidade central se nenhuma estiver selecionada) |
| Elétrons | `electrons.representation.visible` | 0.6.x; nenhum estado duplicado |
| Rótulos das posições | `crystallography.representation.labels` | 0.5.x |
| Indicações da propriedade | `exploration.view.layers.propertyHints` | oculta setas, fonte de calor e feixe; o estado textual continua |

Só aparecem as camadas aplicáveis ao estado atual (montagem livre: centros, elétrons e indicações).

## 4. Comparação qualitativa

| Modo | A | B | Disponível quando |
|---|---|---|---|
| `free-crystal` | montagem livre (a guardada em `crystallography.freeUnits`) | estrutura cristalina | modo cristalino |
| `cell-lattice` | célula unitária | rede extensa | modo cristalino |
| `electrons` | elétrons ocultos | elétrons visíveis | modelo eletrônico ativo |
| `property` | antes (estado-base da experiência) | depois (parâmetros atuais) | experiência ativa fora do estado-base |

- As variantes são **cópias somente leitura** do snapshot (`SILM.exploration.variants`), nunca gravadas.
- O desenho usa um renderizador **derivado** (`SILM.renderSnapshot`). Ele reaproveita geometria, projeção, transformações de propriedade e a camada eletrônica, esta **sempre estática**: nenhum laço de animação a mais. Não usa ids, não recebe foco e é descrito por texto (`role="img"`, "A: …" / "B: …").
- Desktop: lado a lado. Celular: alternância A/B, uma cena por vez.
- Não é comparação entre metais (continua 1 investigação = 1 metal).

## 5. Eventos e Histórico

Ações científicas continuam no Histórico (organizar, elétrons, experiências). Camadas, foco e abertura de comparação são apresentação e **não** são registrados a cada clique (§24).
