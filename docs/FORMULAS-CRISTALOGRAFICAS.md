# Fórmulas cristalográficas do SILM (0.10.x; modelo geral na 0.16.x)

Este documento registra cada relação do catálogo central (`SILM.formulas`, `domain/silm/calculations.js`), a geometria de onde ela vem e o domínio em que vale. Todas usam o **modelo de esferas rígidas**, em que cada centro metálico é uma esfera de raio `r` e vizinhos mais próximos se tocam, ou a geometria da célula unitária, que não depende desse modelo.

Notação: `a` e `c` são parâmetros de rede, `r` é o raio metálico de esfera rígida, `n` é o número efetivo de átomos por célula, `V` é o volume da célula, `M` é a massa molar e `N_A` é a constante de Avogadro.

## 1. Células adotadas (§7, §8, §13)

| Estrutura | Célula adotada | Conteúdo |
|---|---|---|
| CCC (BCC) | cúbica convencional, aresta `a` | 8 vértices + 1 centro do corpo |
| CFC (FCC) | cúbica convencional, aresta `a` | 8 vértices + 6 centros de face |
| HC (HCP) | **prisma hexagonal convencional**, base com aresta `a` e altura `c` | 12 vértices + 2 centros das bases + 3 internos |

No HC, o SILM usa a célula **convencional** (prisma hexagonal), que equivale a três células primitivas. A célula primitiva (losango de 120° na base) teria `V/3` e 2 átomos. As duas definições nunca se misturam: `n = 6` sempre acompanha `V = (3√3/2)·a²·c`.

## 2. Número efetivo de átomos por célula

Cada centro na fronteira é compartilhado com as células vizinhas, e só a fração interna conta:

| Posição | Fração na célula |
|---|---|
| vértice do cubo | 1/8 (compartilhado por 8 cubos) |
| centro de face | 1/2 (2 cubos) |
| centro do corpo | 1 |
| vértice do prisma hexagonal | 1/6 (6 prismas) |
| centro da base hexagonal | 1/2 (2 prismas) |
| interno ao prisma | 1 |

| Estrutura | Expressão | `n` |
|---|---|---|
| CCC | `n = 8 × 1/8 + 1 × 1` | 2 |
| CFC | `n = 8 × 1/8 + 6 × 1/2` | 4 |
| HC | `n = 12 × 1/6 + 2 × 1/2 + 3 × 1` | 6 |

A interface mostra a decomposição e marca na cena a fração de cada centro.

## 3. Volume da célula

| Estrutura | Expressão | Origem |
|---|---|---|
| CCC, CFC | `V = a³` | cubo de aresta `a` |
| HC | `V = (3√3/2) · a² · c` | área do hexágono regular de lado `a`, que são 6 triângulos equiláteros de área (√3/4)·a², vezes a altura `c` |

## 4. Raio ↔ parâmetro (§9)

| Estrutura | Direção de contato | Relação | Fórmulas |
|---|---|---|---|
| CCC | diagonal do cubo, de comprimento √3·a, com 4 raios | `4r = √3 · a` | `r = √3 · a / 4` · `a = 4r / √3` |
| CFC | diagonal da face, de comprimento √2·a, com 4 raios | `4r = √2 · a` | `r = √2 · a / 4` · `a = 2√2 · r` |
| HC | vizinho mais próximo, no plano basal ou na camada adjacente | `2r = d`, com `d = mín(a; √(a²/3 + c²/4))` | `r = d / 2` |

- A fórmula cúbica **nunca** é aplicada ao HC. O validador recusa (`FORMULA_NOT_APPLICABLE`).
- No HC, a distância entre centros de camadas adjacentes é √(a²/3 + c²/4). A projeção no plano basal fica a a/√3 do vértice e a diferença de altura é c/2. Quando `c/a < √(8/3)`, essa distância é menor que `a` e os vizinhos mais próximos estão nas camadas adjacentes. Quando `c/a > √(8/3)`, eles estão no próprio plano basal.
- A relação inversa `r → a` no HC exigiria fixar `c/a` e por isso **não** é oferecida.

## 5. Fator de empacotamento (§10)

```text
FE = n · (4/3)πr³ / V
```

É a fração do volume da célula ocupada pelas esferas rígidas. O resultado é **calculado** e não é a fração ocupada pela densidade eletrônica real. A interface mostra os intermediários: `n`, o volume de uma esfera `(4/3)πr³` e `V`.

| Estrutura | FE com o raio de contato | Valor |
|---|---|---|
| CCC | π√3/8 | 0,6802 |
| CFC | π/(3√2) | 0,7405 |
| HC com c/a ideal | π/(3√2) | 0,7405 |

Se as entradas informadas derem FE > 1, o cálculo é recusado como fisicamente impossível (`PHYSICALLY_INVALID`).

## 6. Densidade teórica (§11)

```text
massa da célula = n × M / N_A
ρ = massa da célula / volume da célula = n · M / (N_A · V)
```

- `M` é dado tabelado: massa molar numericamente igual ao peso atômico padrão (CIAAW). Quando o peso atômico padrão é um **intervalo** (variação isotópica natural, como no magnésio), a densidade também é um intervalo.
- `V` é calculado em Å³ e convertido para cm³ (1 Å³ = 10⁻²⁴ cm³).
- `N_A` vem do serviço de constantes (valor exato do SI).

Análise dimensional:

```text
[n] · [M] / ([N_A] · [V]) = 1 · (g/mol) / (mol⁻¹ · cm³) = g/cm³
```

Conversão de apresentação: 1 g/cm³ = 1000 kg/m³.

A densidade teórica supõe célula ideal, sem defeitos, na condição de referência dos parâmetros de rede. Ela é calculada e não medida.

## 7. Razão c/a no HC (§13)

```text
c/a  (dos parâmetros tabelados ou medidos do metal)
(c/a)ideal = √(8/3) ≈ 1,633  (geometria do empilhamento ideal de esferas rígidas)
```

O valor ideal vem de quatro esferas em contato, que formam um tetraedro regular de aresta `a` com altura a·√(2/3). Assim, c = 2·a·√(2/3) e c/a = √(8/3). Ele é uma **referência geométrica**, não dado do metal. A diferença entre o c/a do metal e o ideal não é erro experimental.

## 7a. Estruturas fora de CCC, CFC e HC (modelo geral, 0.16.x)

Nas estruturas registradas fora de CCC, CFC e HC (α-Mn, β-Sn, Sm, Bi, Np, α-Pu, Am, Po e Pa), a célula é o **paralelepípedo da ficha cristalográfica**: a, b, c, α, β e γ como publicados, com os átomos gerados pelas operações de simetria registradas. O catálogo oferece só as relações exatas dessa célula.

| Fórmula | Expressão | Origem |
|---|---|---|
| `effective-atoms-general` | `n = Σ (centros em cada posição × fração dentro da célula)`: vértice 1/8, aresta 1/4, face 1/2, interior 1 | Cada posição na fronteira é compartilhada com as células vizinhas. O total é o Z da ficha, conferido pelo modelo |
| `cell-volume-general` | `V = a · b · c · √(1 − cos²α − cos²β − cos²γ + 2 · cos α · cos β · cos γ)` | Volume do paralelepípedo (produto misto dos vetores de rede). Com os três ângulos retos, reduz-se a `a · b · c`; nos eixos hexagonais (γ = 120°), a `(√3/2) · a² · c` |
| `theoretical-density` | `ρ = n · M / (N_A · V)` | A mesma da seção 6, com o `n` e o `V` acima |

**Raio e empacotamento de esferas rígidas não são oferecidos.** Nessas estruturas, as distâncias até os vizinhos variam (por exemplo, no bismuto há 3 vizinhos a 3,07 Å e mais 3 a 3,53 Å). Uma esfera de raio único não descreve o sólido, e as fórmulas das seções 4 e 5 não se aplicam.

**Conferência nos testes** (`tests/structure-audit.cjs`): o volume calculado é comparado com o produto misto dos vetores de rede e com o `_cell_volume` do CIF; `n` é comparado com o `_cell_formula_units_Z` do CIF. Exemplos (volume SILM × CIF, em Å³): α-Mn 707,94 × 707,944; Bi 212,30 × 212,299; α-Pu 320,43 × 320,425; Sm, em eixos romboédricos com α = 23,22°, 99,35 × 99,346.

## 8. Exemplos verificados pelos testes

Valores do banco científico do SILM, com 4 algarismos significativos na apresentação. Os testes 0.10-CFC, 0.10-CCC e 0.10-HC conferem cada número com a expressão analítica.

### Cobre (CFC)

`a = 3,6150 Å` (NBS Circular 539, vol. 1) · `M = 63,546(3) g/mol` (CIAAW 2024)

| Grandeza | Resultado |
|---|---|
| n | 4 |
| V = a³ | 47,24 Å³ = 0,04724 nm³ = 4,724 × 10⁻²³ cm³ |
| r = √2·a/4 | 1,278 Å |
| FE | 0,7405 (74,0 %) |
| ρ = 4 × 63,546 / (6,02214076 × 10²³ × 4,724 × 10⁻²³) | 8,935 g/cm³ |

### Ferro (CCC)

`a = 2,8654 Å` (COD 9006587) · `M = 55,845(2) g/mol` (CIAAW 2024)

| Grandeza | Resultado |
|---|---|
| n | 2 |
| V | 23,53 Å³ |
| r = √3·a/4 | 1,241 Å |
| FE | 0,6802 (68,0 %) |
| ρ | 7,883 g/cm³ |

### Magnésio (HC)

`a = 3,2093 Å`, `c = 5,2103 Å` (COD 9012001) · `M = [24,304; 24,307] g/mol` (CIAAW 2024, intervalo)

| Grandeza | Resultado |
|---|---|
| n | 6 (prisma hexagonal convencional) |
| V = (3√3/2)·a²·c | 139,4 Å³ |
| c/a | 1,624 (ideal 1,633) |
| d entre camadas = √(a²/3 + c²/4) | 3,197 Å (< a = 3,209 Å, então os vizinhos mais próximos estão nas camadas adjacentes) |
| r = d/2 | 1,598 Å |
| FE | 0,7362 |
| ρ | de 1,7368 a 1,7370 g/cm³ (apresentado como 1,737 g/cm³) |

O FE do magnésio fica abaixo de 0,7405 porque o c/a real difere do ideal: as esferas de raio de contato não preenchem a célula tão bem quanto no empilhamento ideal.
