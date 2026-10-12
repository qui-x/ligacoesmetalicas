# Módulo Medir (0.9.x)

O módulo **Medir** produz **medidas do modelo**: valores obtidos a partir das coordenadas científicas da estrutura que o estudante montou e organizou. Não repete valores do banco e não simula a medição de uma amostra real.

## Três categorias que nunca se confundem

| Categoria | O que é | Onde aparece |
|---|---|---|
| **Dado tabelado** | Valor do banco científico, com fonte e condição de referência (ex.: parâmetro de rede do cobre) | Dados → Tabela; "Referência · Dado tabelado" no resultado do parâmetro de rede |
| **Medida do modelo** | Resultado de uma ação de medição sobre sítios do modelo cristalográfico | Ver → Medir; Dados → Medições |
| **Calculado pelo SILM** | Derivação feita pelo SILM a partir de dados tabelados (ex.: distância ao vizinho no foco Centro, desde a 0.8.0) | Ver → Observar |

Cada medição é registrada com `source.kind = 'MODEL_MEASUREMENT'` e etiquetada "Medida do modelo" em todos os lugares.

## Pré-condições

Os instrumentos só são habilitados quando há escala física:

| Situação | Mensagem |
|---|---|
| Fora do módulo Medir | "Os instrumentos funcionam no módulo Medir." (com o botão Ativar o módulo Medir) |
| Sem estrutura | "Monte e organize uma estrutura para medir." |
| Montagem livre | "A montagem livre não tem escala física: organize a estrutura cristalina para medir." |
| Experiência de deformação aplicada | "Restaure a experiência de deformação: as medidas usam a estrutura de referência." |

Os botões ficam com `aria-disabled="true"`, continuam focáveis e mostram o motivo. Nenhuma coordenada normalizada nem pixel é convertido em Å, pm ou nm.

## Instrumentos

Conjunto enxuto, só com instrumentos que têm modelo quantitativo. Detalhes em [`INSTRUMENTOS-E-UNIDADES.md`](INSTRUMENTOS-E-UNIDADES.md).

| Instrumento | Fluxo | Resultado |
|---|---|---|
| **Distância** | A → B | Distância entre centros metálicos, em Å (pm ou nm na apresentação) |
| **Ângulo** | A → vértice B → C | Ângulo ABC das coordenadas científicas, nunca da projeção na tela |
| **Parâmetro de rede** | dois vértices ao longo de uma aresta da célula | `a` (CCC e CFC); `a` ou `c` (HC). Comparação com o dado tabelado |
| **Vizinhança e coordenação** | um centro | Número de vizinhos imediatos definido pelo modelo cristalográfico; a cena destaca os mesmos vizinhos que a contagem |

Não existem termômetro, amperímetro, multímetro nem outro instrumento elétrico ou térmico, porque não há modelo científico que os sustente nesta série.

## Operação

1. Ative o módulo Medir (Montagem → Módulo).
2. Em **Ver → Medir**, escolha o instrumento e feche o painel, se quiser.
3. Selecione os centros na estrutura com clique, toque ou teclado (Tab até a unidade e Enter).

Os anúncios seguem a gramática do SIAB:

```text
Distância: Selecione o ponto A.
Ponto A selecionado. Selecione o ponto B.
Distância medida: 2,556 ångströms. Medida do modelo.
```

A linha de medição é uma **cota**: tracejada, com terminais perpendiculares e rótulo. Não é uma ligação M—M.

Os marcadores trazem as letras A, B e C, para não depender só de cor. Escolher de novo o mesmo instrumento reinicia os pontos. **Desligar instrumento** devolve a seleção comum de unidades.

## Registro

- **Dados → Medições** lista os registros, com horário, valor, pontos (unidade e sítio) e a etiqueta "Medida do modelo".
- Cada registro pode ser **revisto**, que redesenha a cota sobre a estrutura, ou **removido**.
- **Limpar medições** pede confirmação e não limpa a estrutura.
- Medições feitas antes de uma mudança da estrutura (reorganizar, voltar à montagem livre) ficam marcadas como "Medição realizada em estado anterior da estrutura." Elas não são recalculadas e não são redesenhadas sobre a estrutura nova.
- Nova investigação não herda medições. A troca de módulo preserva as medições.
- Recarregar a página preserva as medições concluídas. Uma medição incompleta (instrumento e pontos em escolha) é cancelada, para não deixar estado ambíguo.

## Mobile

No celular, Ver → Medir abre na folha inferior. A cena continua como prioridade e o painel pode ser fechado durante a escolha dos pontos. Cada ponto é um centro metálico inteiro: tocar qualquer parte da esfera escolhe o sítio. É um encaixe (snap) por construção, e não é preciso precisão de pixel. Os testes 0.9-MOB verificam 320, 360 e 390 px, paisagem e tablet.

## Limitações obrigatórias (§22)

> As medições são realizadas sobre o modelo científico representado pelo SILM e não constituem uma medição experimental de uma amostra física real.

> O zoom e o tamanho visual da estrutura não alteram suas dimensões científicas internas.

> Valores de referência provenientes do banco científico são dados tabelados e não resultados medidos pelo estudante.

> A montagem livre não deve ser interpretada automaticamente como uma estrutura em escala física.

O painel Ver → Medir reproduz esses quatro textos em "Limitações das medições".
