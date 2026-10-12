# Instrumentos e unidades (0.9.x)

## Instrumentos virtuais

| Instrumento (`instrument`) | Tipo | Pontos | Unidade canônica | Resolução |
|---|---|---|---|---|
| Régua (`ruler`) | `distance` | 2 | Å | 0,001 Å |
| Goniômetro (`goniometer`) | `angle` | 3 (B é o vértice) | ° | 0,1° |
| Medidor de célula (`cell-gauge`) | `latticeParameter` | 2 (aresta da célula) | Å | 0,001 Å |
| Contador de vizinhos (`neighbor-counter`) | `coordination` | 1 | contagem | 1 |

**Resolução não é incerteza.** A resolução é o passo de leitura do instrumento virtual. O SILM não exibe `±`, porque não existe modelo de incerteza experimental: o valor é exato para o modelo, arredondado pela resolução.

A resolução de 0,001 Å acompanha a precisão dos parâmetros de rede tabelados (três a quatro algarismos significativos). Mais casas seriam falsa precisão.

## Unidades de comprimento

O valor persistido é **sempre** o número canônico em Å. A conversão é exata e centralizada (`SILM.units`):

```text
1 Å = 100 pm
1 Å = 0,1 nm
```

| Unidade | Fator a partir de Å | Casas exibidas | Nome falado |
|---|---|---|---|
| Å | 1 | 3 | ångström(s) |
| pm | 100 | 1 | picômetro(s) |
| nm | 0,1 | 4 | nanômetro(s) |

As casas exibidas mantêm a mesma resolução física (0,001 Å = 0,1 pm = 0,0001 nm). A apresentação usa vírgula decimal ("2,556 Å").

A escolha da unidade (Ver → Medir → Unidade) muda só a apresentação. Ela é guardada como preferência de representação e não toca no registro.

## Exemplos com dados do banco

| Metal (estrutura) | Medida | Valor do modelo |
|---|---|---|
| Cobre (CFC, a = 3,6150 Å) | distância entre vizinhos imediatos | 2,556 Å (= a/√2) |
| Cobre (CFC) | coordenação | 12 |
| Ferro α (CCC, a = 2,8654 Å) | distância entre vizinhos imediatos | 2,482 Å (= a√3/2) |
| Ferro α (CCC) | coordenação | 8 |
| Magnésio (HC, a = 3,2093 Å, c = 5,2103 Å) | parâmetros `a` e `c` (arestas da célula) | 3,209 Å e 5,210 Å |

Os testes 0.9-DIST, 0.9-CCC e 0.9-HC verificam esses valores a partir da cena, e não da tabela.

## Teclado e leitores de tela

- Os centros metálicos são botões, alcançáveis por Tab; Enter ou Espaço escolhem o ponto.
- O estado de cada passo é anunciado por região viva, por exemplo "Ponto A selecionado. Selecione o ponto B.".
- O resultado é falado por extenso: "Distância medida: 2,556 ångströms. Medida do modelo.".
- Os marcadores têm as letras A, B e C, e a cota tem rótulo de texto: nada depende só de cor.
