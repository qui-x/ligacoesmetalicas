# Montagem da estrutura metálica (série 0.4.x)

## 1. Conceito

O SILM representa **uma estrutura metálica extensa em construção**. O objeto central é a **montagem metálica**: um conjunto de unidades do mesmo metal que formam juntas uma única estrutura.

A ligação metálica não é representada por pares isolados (`Cu—Cu`, `Fe—Fe`). Não existem linhas entre unidades nem grafo de ligações: a estrutura é a lista `units[]`. Relações espaciais (vizinhança, coordenação) pertencem à série 0.5.x.

```text
Cu   Cu
   Cu          ← uma montagem coletiva, e não "Cu—Cu"
Cu   Cu
```

Regras da série:

- **1 investigação = 1 metal.** Toda unidade pertence a `scientificState.metal`.
- **Sem ligas:** não há segundo metal, mistura, porcentagem nem composição.
- **Sem prateleira de elementos:** a investigação já define o metal; **Adicionar unidade** sempre adiciona uma unidade desse metal.

## 2. Unidade metálica

Na interface ela se chama "unidade metálica" ou "unidade de cobre", nunca "cátion": o modelo eletrônico pertence à 0.6.x. É desenhada como um disco de latão/bronze com o símbolo do elemento, sem elétrons e sem traços de ligação.

```json
{ "id": "unit-…", "position": { "x": 0.5, "y": 0.5 }, "createdAt": "ISO-8601", "placement": "assisted" }
```

| Campo | Significado |
|---|---|
| `id` | identificador estável (`unit-` + UUID). Nunca é o índice do array. |
| `position` | coordenadas normalizadas da cena, de 0,06 a 0,94 nos dois eixos. |
| `createdAt` | momento da adição. |
| `placement` | origem da posição: `manual` (destino escolhido e aceito) ou `assisted` (posição escolhida ou ajustada pela assistência). |

A unidade **não** guarda elemento. A identidade química vem sempre do metal da investigação.

## 3. Estrutura

```json
{
  "modelVersion": 1,
  "type": "metallic-assembly",
  "metalAtomicNumber": 29,
  "status": "assembling",
  "units": [],
  "assistance": { "enabled": true, "mode": "placement" },
  "referenceStructureId": null,
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

- `metalAtomicNumber` serve apenas para conferência. A fonte do metal continua sendo `scientificState.metal`.
- `status`: `empty` (sem unidades), `assembling` (em construção) e `assembled` (marcada como concluída pelo usuário, com 2 ou mais unidades). Nenhum desses estados é cristalográfico.
- `referenceStructureId` permanece `null`: a estrutura de referência do banco (por exemplo, Cu → CFC) não é usada como geometria nesta série.

## 4. Cena e coordenadas

| Constante (`SILM.assembly.contract`) | Valor | Papel |
|---|---|---|
| `unitRadius` | 0,042 | raio visual da unidade |
| `minDistance` | 0,10 | espaçamento visual mínimo entre centros |
| `margin` | 0,06 | área segura nas bordas da cena |
| `maxUnits` | 48 | limite didático de legibilidade |
| `historyLimit` | 30 | ações desfazíveis em memória |
| `keyboardStep` / `fineStep` | 0,02 / 0,005 | passos do teclado |

A cena é quadrada e se ajusta ao maior quadrado que cabe na área central. Ao redimensionar a janela, girar o celular ou abrir o teclado virtual, só a escala visual muda: as posições relativas permanecem. Nenhuma posição é guardada em pixels e nenhuma é convertida em ångström.

A área de toque de cada unidade tem o tamanho do espaçamento mínimo (10% da cena), maior que o disco visível. Isso melhora o toque sem alterar o desenho da unidade.

## 5. Adicionar

1. Com uma investigação ativa, em Explorar, use **Iniciar montagem**. A estrutura nasce vazia (`status: empty`).
2. Use **+ Adicionar unidade**. Iniciar montagem e adicionar unidade são ações distintas.
3. A nova unidade aparece perto do conjunto, já selecionada, e o anúncio orienta o posicionamento.

A posição inicial segue uma espiral de ângulo áureo a partir do centro do conjunto, escolhendo o primeiro ponto livre. Essa espiral não é periódica: não forma rede, hexágono ou cubo.

## 6. Selecionar e mover

| Entrada | Como |
|---|---|
| Mouse | clique seleciona; arraste move (Pointer Events); clique em área livre move a unidade selecionada |
| Toque | toque seleciona; toque no destino move. O arrasto também funciona, mas nunca é obrigatório. |
| Teclado | Tab entra no grupo de unidades. Sem seleção, as setas percorrem as unidades; Enter ou Espaço seleciona. Com uma unidade selecionada, as setas a movem (Shift + seta move em passo fino). Esc solta a unidade. |

As setas só agem quando o foco está numa unidade: nada é interceptado globalmente. A seleção é única e é marcada por contorno espesso e anel tracejado, não só por cor. Durante o arrasto ou a repetição de setas, só a interface muda; o estado é gravado ao soltar.

## 7. Assistência de posicionamento e sobreposição

A assistência é um **mecanismo didático de interface**. Ela não representa força química, energia potencial, atração entre átomos, campo, dinâmica molecular ou cristalização.

- **Com assistência:** um destino ocupado é ajustado discretamente para o ponto livre mais próximo, sem passar de 1,6 vez o espaçamento mínimo. A interface informa: "Posição ajustada para evitar sobreposição."
- **Sem assistência:** o destino ocupado é recusado, a unidade permanece onde estava e aparece "Destino ocupado."
- Em ambos os casos, nenhum estado persistido contém unidades a menos de 0,10 de distância. O validador do build garante isso.

Não há motor de física nem laço de animação contínuo; as transições curtas respeitam a redução de movimento.

## 8. Formação coletiva

Todas as unidades pertencem à mesma montagem. Um destaque sutil em bronze, a união de discos atrás das unidades, indica a região da estrutura em construção, sem nenhuma linha individual.

## 9. Desfazer, limpar, reset e encerrar

| Ação | Efeito |
|---|---|
| **↶ Desfazer** | reverte a última adição ou movimento. A dica mostra "Desfazer: …" e o anúncio, "Desfeito: …". |
| **Limpar estrutura** | `structure → null`. Investigação, metal e módulo permanecem, e o viewport volta para "A estrutura metálica ainda não foi montada." Pede confirmação quando há unidades. Não volta à Tabela. |
| **Resetar investigação** | limpa estrutura, elétrons, medidas, cálculos e observações; mantém o metal e a identidade. |
| **Encerrar investigação** | remove estrutura, investigação e metal e volta à seleção. |
| **Selecionar outro metal** | pede confirmação. A nova investigação começa com `structure = null`; as unidades não são convertidas. |

Acessibilidade, tema e preferências globais nunca são afetados.

## 10. Persistência

O estado científico é gravado no namespace do domínio SILM pela storage da Base, no mesmo serviço único da 0.3.0. Ficam salvos: a existência da estrutura, as unidades, os IDs, as posições, o status, a assistência e os timestamps.

A montagem reaparece ao recarregar, ao voltar do Manual, do Professor ou de Aprender, ao trocar de módulo e sem conexão (PWA preparada). O histórico de desfazer é operacional e começa vazio após recarregar.

## 11. Módulos, Roteiros e Missões

- **Explorar:** adicionar, selecionar, mover e organizar.
- **Medir:** mostra a montagem com a mensagem "As ferramentas de medição serão habilitadas quando a estrutura cristalina estiver definida."
- **Calcular:** mesma filosofia; não há cálculos artificiais.

Roteiros e Missões futuros controlarão a montagem pelo mesmo `scientificState`. Não existem `routeStructure` ou `missionStructure`.

## 12. Limitações do modelo

> A montagem livre da série 0.4.x é uma representação didática de construção coletiva e não representa ainda a geometria cristalográfica real do metal.

> As distâncias visuais não correspondem ainda a distâncias interatômicas reais.

> A assistência de posicionamento é um mecanismo de interface e não uma simulação de forças interatômicas.
