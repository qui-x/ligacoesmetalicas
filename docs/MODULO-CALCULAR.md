# Módulo Calcular (0.10.x)

O módulo **Calcular** liga a estrutura científica às grandezas que dela derivam. Ele não é uma calculadora genérica: todo cálculo parte de um metal investigado, de uma estrutura cristalina organizada e de uma fórmula do catálogo central.

```text
estrutura científica (metal + CCC, CFC ou HC)
        ↓
dados tabelados · medidas do modelo · valores informados · resultados anteriores
        ↓
relação matemática do catálogo (docs/FORMULAS-CRISTALOGRAFICAS.md)
        ↓
resultado interpretável, com unidade, intermediários e proveniência
```

## Quatro origens que nunca se confundem (§3)

| Origem | Etiqueta na interface | Exemplo |
|---|---|---|
| `TABULATED` | **Dado tabelado** | `a = 3,6150 Å` do cobre (NBS Circular 539); massa molar 63,546 g/mol (CIAAW 2024) |
| `MODEL_MEASUREMENT` | **Medida do modelo** | `a` medido em Ver → Medir sobre uma aresta da célula (0.9.x) |
| `USER` | **Valor informado** | um raio digitado pelo estudante, em Å |
| `CALCULATED` | **Calculado pelo SILM** | `n = 4`, ou o volume que alimenta a densidade |

Há ainda as **constantes definidas** (`CONSTANT`): a constante de Avogadro e a conversão Å³ → cm³. Elas entram no registro com o valor e a fonte do serviço central (ver [`CONSTANTES-CIENTIFICAS.md`](CONSTANTES-CIENTIFICAS.md)).

O SILM **nunca troca** uma medida do modelo por um dado tabelado sem mostrar. Quando há medida e referência para a mesma entrada, a escolha aparece como opções explícitas, cada uma com sua etiqueta, e a origem escolhida fica gravada.

## Pré-condições

Os cálculos usam as mesmas pré-condições das medidas: precisam de escala física.

| Situação | Mensagem |
|---|---|
| Fora do módulo Calcular | "Os cálculos funcionam no módulo Calcular." (com o botão Ativar o módulo Calcular) |
| Sem estrutura | "Monte e organize uma estrutura para calcular." |
| Montagem livre | "A montagem livre não tem escala física: organize a estrutura cristalina para calcular." |
| Experiência de deformação aplicada | "Restaure a experiência de deformação: os cálculos usam a estrutura de referência." |

## Interface (§16–§18)

1. Ative o módulo Calcular (Montagem → Módulo).
2. Abra **Ver → Calcular**. Só aparecem os cálculos compatíveis com a estrutura atual. Não há lista longa de itens desabilitados:
   - CCC e CFC: Número efetivo, Volume da célula, Raio (a → r), Parâmetro (r → a), Fator de empacotamento, Densidade teórica;
   - HC: Número efetivo, Volume da célula, Raio (a, c → r), Fator de empacotamento, Densidade teórica, Razão c/a.
3. Escolha um cálculo. Há **uma operação ativa por vez**. A fórmula aparece em notação matemática (`V = a³`, nunca `Math.pow(a,3)`) e tem um equivalente falado para leitores de tela ("V é igual a a ao cubo.").
4. Para cada entrada, escolha a origem. No **modo assistido**, o SILM já oferece o que conhece (dado tabelado, número efetivo, resultados anteriores e medidas atuais do modelo), sempre com a origem à vista. "Valor informado" abre um campo numérico com a unidade no rótulo e `inputmode="decimal"` (teclado numérico no celular). A vírgula decimal é aceita.
5. Use **Calcular**. O resultado é anunciado ("Densidade teórica: ρ = 8,935 gramas por centímetro cúbico. Calculado pelo SILM.") e mostra fórmula, entradas com origem, intermediários, conversões, modelo, nota e fontes.

A estrutura continua visível o tempo todo e a cena destaca a geometria do cálculo escolhido:

| Cálculo | Destaque na cena |
|---|---|
| Número efetivo | fração de cada centro que pertence à célula (`1/8`, `1/2`, `1/6`, `1`) |
| Raio, parâmetro e fator de empacotamento | par de vizinhos em contato, com a cota da distância |
| Volume, densidade e c/a | arestas da célula |

## Erros e validação de entrada (§21)

| Situação | Retorno |
|---|---|
| campo vazio, texto, `NaN`, `Infinity`, zero ou negativo | "Informe um número positivo e finito, em Å." (associado ao campo por `aria-describedby`) |
| entrada sem valor disponível | "Sem valor disponível: escolha Valor informado ou calcule esta grandeza antes." |
| esferas maiores que a célula (FE > 1) | "Valores fisicamente impossíveis: as esferas ocupariam mais que o volume da célula." |
| resultado não finito | "O resultado não é um número finito e positivo." |

A apresentação usa **4 algarismos significativos**, de forma coerente, sem uma regra sofisticada de significativos (que exigiria homologação). Os valores canônicos são guardados sem arredondamento.

## Registro e histórico (§19–§20)

- **Dados → Cálculos** lista os registros. Cada um pode ser reaberto com fórmula, entradas, origens e resultado, ou removido. **Limpar cálculos** pede confirmação e não toca na estrutura nem nas medições.
- Um cálculo pode alimentar outro (por exemplo, o volume entra na densidade). O registro guarda a referência ao cálculo de origem (`provenance.dependsOn`). Não há planilha reativa: mudar uma entrada gera um **novo** registro e nunca sobrescreve o anterior.
- Registros antigos **não são recalculados** em silêncio. Se a estrutura mudar (reorganizar, voltar à montagem livre), o registro fica marcado "Cálculo realizado em estado anterior da estrutura." e deixa de ser oferecido como entrada.
- Recarregar a página preserva os cálculos concluídos e a proveniência. A escolha em andamento (cálculo ativo, origens marcadas, texto digitado) é transitória e não é persistida.
- Nova investigação não herda cálculos. A troca de módulo os preserva.

## Comparação com referência (§12)

Quando existe dado tabelado válido para a grandeza calculada, ele aparece ao lado. Hoje isso vale para o parâmetro `a` calculado a partir do raio. A diferença **não** é chamada de erro experimental. O texto explica que ela vem do modelo de esferas rígidas, do arredondamento e das condições de referência. O banco não traz densidade experimental com fonte, e por isso a densidade teórica não é comparada com nenhum valor.

## Mobile e acessibilidade (§23)

- No celular, Ver → Calcular abre na folha inferior e a cena continua visível. Os testes 0.10-MOB cobrem 360 px, 390 px e paisagem, sem rolagem horizontal.
- Os campos têm rótulo real. O erro fica associado ao campo e o resultado é anunciado.
- O fluxo completo funciona só com o teclado (0.10-KBD) e passa no axe-core (0.10-A11Y).
- Alto contraste, visão de cores e movimento reduzido seguem a Base. O destaque não depende só de cor, porque cada fração e cada cota têm texto.

## Limitações obrigatórias

O painel reproduz em "Limitações dos cálculos":

> Os cálculos usam o modelo científico representado pelo SILM (célula ideal, sem defeitos, na condição de referência dos parâmetros); não são medidas de uma amostra real.

> O fator de empacotamento usa esferas rígidas: não é a fração do volume ocupada pela densidade eletrônica real.

> Dados tabelados, medidas do modelo, valores informados e resultados calculados são identificados separadamente; o SILM nunca troca uma medida por um valor tabelado sem mostrar.

> A diferença entre um valor calculado e uma referência não é chamada de erro experimental: decorre do modelo, do arredondamento e das condições.

## Documentos relacionados

[Contrato dos cálculos](CONTRATO-CALCULOS.md) · [Fórmulas cristalográficas](FORMULAS-CRISTALOGRAFICAS.md) · [Constantes científicas](CONSTANTES-CIENTIFICAS.md) · [Estado científico](SCIENTIFIC-STATE.md) · [Módulo Medir](MODULO-MEDIR.md)
