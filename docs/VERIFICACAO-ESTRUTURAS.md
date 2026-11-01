# Verificação da construção das estruturas e da interação com o modelo

**Data:** 31/10/2026, atualizado em 01/11/2026 com o modelo cristalográfico geral (ver `docs/REVISAO-CIENTIFICA-FONTES.md`) · **Versão:** SILM 0.15.5 · **Testes permanentes:** `tests/structure-audit.cjs` (em `npm run test:scientific`) e `tests/model-interaction.cjs` (em `npm run test:comparison`).

## 1. O que foi verificado

**No motor científico (sem a interface).** Para cada metal com estrutura de referência visualizável, a estrutura que o SILM gera foi conferida contra a cristalografia, sítio por sítio:

- **vizinhança de todos os sítios da célula**, com valores analíticos:
  - CCC: 8 vizinhos a √3·a/2; a camada seguinte fica a a;
  - CFC: 12 vizinhos a a/√2; a camada seguinte fica a a;
  - HC: 6 vizinhos a a e 6 a √(a²/3 + c²/4).
- **número efetivo de átomos** calculado pela posição de cada sítio desenhado: vértice 1/8, face 1/2, corpo 1; no HC, vértice da base 1/6, centro da base 1/2, interior 1.
- **instrumentos do Medir:** parâmetro de rede a (e c no HC), coordenação e distância entre vizinhos.
- **fórmulas do Calcular**, comparadas com um cálculo independente: volume, raio, empacotamento e densidade teórica.
- **proveniência:** fonte da estrutura existente, todos os parâmetros com a mesma fonte, temperatura de referência registrada.

**No modelo geral (estruturas fora de CCC/CFC/HC).** Não há fórmula analítica única para comparar; a conferência usa o próprio CIF guardado no repositório:

- **átomos por célula:** os gerados pela simetria precisam ser o Z declarado no CIF (`_cell_formula_units_Z`), e a contagem das posições desenhadas (vértice 1/8, aresta 1/4, face 1/2, interior 1) precisa dar o mesmo Z;
- **volume:** a fórmula do Calcular é comparada com o produto misto dos vetores de rede e com o `_cell_volume` do CIF;
- **vizinhança de todos os sítios:** a primeira camada e a menor distância são recalculadas por busca exaustiva (todas as imagens até duas células de distância);
- **Medir:** as arestas ao longo de cada eixo dão a, b e c tabelados; a coordenação é a primeira camada;
- **Calcular:** só número efetivo, volume e densidade teórica; raio e empacotamento de esferas rígidas não são oferecidos.

**Na interface (navegador).** Cada um dos 65 metais disponíveis foi escolhido, iniciado e organizado como o estudante faria. Depois, a estrutura foi vista em 2D e em 3D, e foram registrados os erros de página.

## 2. Resultado

- **53 estruturas visualizáveis** (15 CCC, 16 CFC, 22 HC; 48 da verificação inicial e 5 metais homologados na revisão científica: K, Ra, Th, Ac, Tc): **nenhuma divergência**. As distâncias, a coordenação, os átomos efetivos, as medidas e os cálculos coincidem com os valores analíticos dentro da precisão numérica. Na interface, todas foram montadas com o tipo e o número de sítios corretos, em 2D e em 3D, sem erros.
- **9 estruturas no modelo geral** (α-Mn, β-Sn, Sm, Bi, Np, α-Pu e os novos Am, Po e Pa): **nenhuma divergência** contra o CIF (Z e volume) e contra a busca exaustiva de vizinhos. Na interface, todas foram montadas e desenhadas em 2D e em 3D, sem erros.
- **3 fichas incompletas** (dupla hexagonal de La, Pr e Nd, com 2 átomos por célula em vez de 4) continuam bloqueadas para a organização cristalina, com o motivo. A montagem livre continua disponível para elas.

A tabela abaixo foi gerada pela auditoria. A densidade e o empacotamento são **calculados pelo SILM** a partir dos dados tabelados. Não são medidas.

| Z | Metal | Estrutura | a (Å) | c (Å) | c/a | Vizinho mais próximo (Å) | Coordenação | Empacotamento | Densidade teórica (g/cm³) | Temperatura | Fonte |
|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| 3 | Lítio (Li) | CCC | 3,5093 |  |  | 3,0391 | 8 | 0,6802 | 0,535 | 293.0 K | cod-9008542 |
| 4 | Berílio (Be) | HC | 2,2858 | 3,5843 | 1,568 | 2,2256 | 12 | 0,7118 | 1,845 | 298.15 K | cod-9012008 |
| 11 | Sódio (Na) | CCC | 4,2906 |  |  | 3,7158 | 8 | 0,6802 | 0,967 | 293.0 K | cod-9008545 |
| 12 | Magnésio (Mg) | HC | 3,2093 | 5,2103 | 1,624 | 3,1969 | 12 | 0,7362 | 1,737 | 298.15 K | cod-9012001 |
| 13 | Alumínio (Al) | CFC | 4,0496 |  |  | 2,8635 | 12 | 0,7405 | 2,699 | 298.15 K | cod-9012002 |
| 19 | Potássio (K) | CCC | 5,3280 |  |  | 4,6142 | 8 | 0,6802 | 0,859 | Ambiente | cod-9011970 |
| 20 | Cálcio (Ca) | CFC | 5,6010 |  |  | 3,9605 | 12 | 0,7405 | 1,515 | 298.15 K | cod-9012731 |
| 21 | Escândio (Sc) | HC | 3,3090 | 5,2733 | 1,594 | 3,2560 | 12 | 0,7229 | 2,986 | Ambiente | cod-9010985 |
| 22 | Titânio (Ti) | HC | 2,9500 | 4,6860 | 1,588 | 2,8966 | 12 | 0,7207 | 4,501 | Ambiente | cod-9008517 |
| 23 | Vanádio (V) | CCC | 3,0241 |  |  | 2,6189 | 8 | 0,6802 | 6,117 | 298.15 K | cod-9012770 |
| 24 | Cromo (Cr) | CCC | 2,8839 |  |  | 2,4975 | 8 | 0,6802 | 7,200 | Ambiente | cod-5000220 |
| 26 | Ferro (Fe) | CCC | 2,8654 |  |  | 2,4815 | 8 | 0,6802 | 7,883 | 298.0 K | cod-9006587 |
| 27 | Cobalto (Co) | HC | 2,5071 | 4,0695 | 1,623 | 2,4971 | 12 | 0,7361 | 8,835 | Ambiente | webelements-co |
| 28 | Níquel (Ni) | CFC | 3,5240 |  |  | 2,4918 | 12 | 0,7405 | 8,908 | 293.0 K | cod-9013024 |
| 29 | Cobre (Cu) | CFC | 3,6150 |  |  | 2,5562 | 12 | 0,7405 | 8,935 | 25 °C (298,15 K) | nbs-539-v1 |
| 30 | Zinco (Zn) | HC | 2,6650 | 4,9470 | 1,856 | 2,6650 | 12 | 0,6514 | 7,136 | 25 °C (298,15 K) | nbs-539-v1 |
| 37 | Rubídio (Rb) | CCC | 5,6970 |  |  | 4,9337 | 8 | 0,6802 | 1,535 | 297 K | cod-9012879 |
| 38 | Estrôncio (Sr) | CFC | 6,0760 |  |  | 4,2964 | 12 | 0,7405 | 2,595 | 298.15 K | cod-9012726 |
| 39 | Ítrio (Y) | HC | 3,6474 | 5,7306 | 1,571 | 3,5559 | 12 | 0,7132 | 4,472 | Ambiente | cod-9010984 |
| 40 | Zircônio (Zr) | HC | 3,2320 | 5,1470 | 1,593 | 3,1788 | 12 | 0,7224 | 6,507 | Ambiente | webelements-zr |
| 41 | Nióbio (Nb) | CCC | 3,3004 |  |  | 2,8582 | 8 | 0,6802 | 8,583 | Ambiente | cod-9008546 |
| 42 | Molibdênio (Mo) | CCC | 3,1472 |  |  | 2,7256 | 8 | 0,6802 | 10,222 | 25 °C (298,15 K) | nbs-539-v1 |
| 43 | Tecnécio (Tc) | HC | 2,7400 | 4,3980 | 1,605 | 2,7089 | 12 | 0,7280 | — (sem peso atômico padrão) | Ambiente | cod-1541062 |
| 44 | Rutênio (Ru) | HC | 2,7039 | 4,2817 | 1,584 | 2,6496 | 12 | 0,7185 | 12,382 | Ambiente | cod-9008513 |
| 45 | Ródio (Rh) | CFC | 3,8031 |  |  | 2,6892 | 12 | 0,7405 | 12,426 | Ambiente | cod-9008482 |
| 46 | Paládio (Pd) | CFC | 3,8898 |  |  | 2,7505 | 12 | 0,7405 | 12,010 | 25 °C (298,15 K) | nbs-539-v1 |
| 47 | Prata (Ag) | CFC | 4,0862 |  |  | 2,8894 | 12 | 0,7405 | 10,501 | 25 °C (298,15 K) | nbs-539-v1 |
| 48 | Cádmio (Cd) | HC | 2,9789 | 5,6177 | 1,886 | 2,9789 | 12 | 0,6412 | 8,648 | Ambiente | cod-9008490 |
| 55 | Césio (Cs) | CCC | 6,1410 |  |  | 5,3183 | 8 | 0,6802 | 1,906 | Ambiente | webelements-cs |
| 56 | Bário (Ba) | CCC | 5,0130 |  |  | 4,3414 | 8 | 0,6802 | 3,620 | 298.15 K | cod-9012729 |
| 58 | Cério (Ce) | CFC | 5,1612 |  |  | 3,6495 | 12 | 0,7405 | 6,769 | Ambiente | cod-9010987 |
| 63 | Európio (Eu) | CCC | 4,6060 |  |  | 3,9889 | 8 | 0,6802 | 5,165 | Ambiente | cod-9010990 |
| 64 | Gadolínio (Gd) | HC | 3,6360 | 5,7826 | 1,590 | 3,5730 | 12 | 0,7215 | 7,888 | Ambiente | cod-9010991 |
| 65 | Térbio (Tb) | HC | 3,6010 | 5,6936 | 1,581 | 3,5251 | 12 | 0,7175 | 8,255 | Ambiente | cod-9010992 |
| 66 | Disprósio (Dy) | HC | 3,5903 | 5,6475 | 1,573 | 3,5029 | 12 | 0,7139 | 8,560 | Ambiente | cod-9010993 |
| 67 | Hólmio (Ho) | HC | 3,5773 | 5,6158 | 1,570 | 3,4857 | 12 | 0,7126 | 8,801 | Ambiente | cod-9010994 |
| 68 | Érbio (Er) | HC | 3,5588 | 5,5874 | 1,570 | 3,4679 | 12 | 0,7127 | 9,064 | Ambiente | cod-9010995 |
| 69 | Túlio (Tm) | HC | 3,5375 | 5,5546 | 1,570 | 3,4474 | 12 | 0,7127 | 9,320 | Ambiente | cod-9010996 |
| 70 | Itérbio (Yb) | CFC | 5,4862 |  |  | 3,8793 | 12 | 0,7405 | 6,961 | Ambiente | cod-9010997 |
| 71 | Lutécio (Lu) | HC | 3,5031 | 5,5509 | 1,585 | 3,4342 | 12 | 0,7190 | 9,850 | Ambiente | cod-9010998 |
| 72 | Háfnio (Hf) | HC | 3,1964 | 5,0511 | 1,580 | 3,1279 | 12 | 0,7171 | 13,263 | Ambiente | cod-1539076 |
| 73 | Tântalo (Ta) | CCC | 3,3058 |  |  | 2,8629 | 8 | 0,6802 | 16,634 | 25 °C (298,15 K) | nbs-539-v1 |
| 74 | Tungstênio (W) | CCC | 3,1648 |  |  | 2,7408 | 8 | 0,6802 | 19,261 | 298.0 K | cod-9006486 |
| 75 | Rênio (Re) | HC | 2,7608 | 4,4582 | 1,615 | 2,7404 | 12 | 0,7323 | 21,014 | Ambiente | cod-9008512 |
| 76 | Ósmio (Os) | HC | 2,7352 | 4,3190 | 1,579 | 2,6753 | 12 | 0,7166 | 22,577 | Ambiente | cod-9008510 |
| 77 | Irídio (Ir) | CFC | 3,8394 |  |  | 2,7149 | 12 | 0,7405 | 22,559 | Ambiente | cod-9008470 |
| 78 | Platina (Pt) | CFC | 3,9231 |  |  | 2,7741 | 12 | 0,7405 | 21,461 | 25 °C (298,15 K) | nbs-539-v1 |
| 79 | Ouro (Au) | CFC | 4,0786 |  |  | 2,8840 | 12 | 0,7405 | 19,283 | 25 °C (298,15 K) | nbs-539-v1 |
| 81 | Tálio (Tl) | HC | 3,4560 | 5,5250 | 1,599 | 3,4077 | 12 | 0,7251 | 11,877 | 297.0 K | cod-9008519 |
| 82 | Chumbo (Pb) | CFC | 4,9500 |  |  | 3,5002 | 12 | 0,7405 | 11,338 | 298.15 K | cod-9012004 |
| 88 | Rádio (Ra) | CCC | 5,1480 |  |  | 4,4583 | 8 | 0,6802 | — (sem peso atômico padrão) | Ambiente | cod-1509139 |
| 89 | Actínio (Ac) | CFC | 5,3110 |  |  | 3,7554 | 12 | 0,7405 | — (sem peso atômico padrão) | Ambiente | cod-9008458 |
| 90 | Tório (Th) | CFC | 5,0843 |  |  | 3,5951 | 12 | 0,7405 | 11,727 | Ambiente | cod-9008485 |


### Modelo geral

A coordenação aparece como primeira camada (até 3 % além da menor distância): nessas estruturas, o número depende da distância considerada. O volume e a densidade são **calculados pelo SILM**.

| Z | Metal | Estrutura | a / b / c (Å) | α / β / γ (°) | Átomos por célula | Primeira camada | Volume (Å³) | Densidade teórica (g/cm³) | Temperatura | Fonte |
|---:|---|---|---|---|---:|---|---:|---:|---|---|
| 25 | Manganês (Mn) | Cúbica complexa (α-Mn) · I -4 3 m | 8,9125 / 8,9125 / 8,9125 | 90 / 90 / 90 | 58 | 12 a 2,752 Å | 707,94 | 7,474 | 298.0 K | cod-9011068 |
| 50 | Estanho (Sn) | Tetragonal · I 41/a m d :1 | 5,8315 / 5,8315 / 3,1813 | 90 / 90 / 90 | 4 | 4 a 3,022 Å | 108,18 | 7,289 | 298.15 K | cod-9012005 |
| 62 | Samário (Sm) | Romboédrica · R -3 m :R | 8,9960 / 8,9960 / 8,9960 | 23,22 / 23,22 / 23,22 | 3 | 12 a 3,588–3,621 Å | 99,35 | 7,540 | Ambiente | cod-9014498 |
| 83 | Bismuto (Bi) | Romboédrica · R -3 m :H | 4,5460 / 4,5460 / 11,8620 | 90 / 90 / 120 | 6 | 3 a 3,071 Å | 212,30 | 9,808 | 298.0 K | cod-9009658 |
| 84 | Polônio (Po) | Cúbica simples (α-Po) · P m -3 m | 3,3450 / 3,3450 / 3,3450 | 90 / 90 / 90 | 1 | 6 a 3,345 Å | 37,43 | — (sem peso atômico padrão) | 283 K | cod-1509138 |
| 91 | Protactínio (Pa) | Tetragonal de corpo centrado · I 4/m m m | 3,9250 / 3,9250 / 3,2380 | 90 / 90 / 90 | 2 | 10 a 3,213–3,238 Å | 49,88 | 15,382 | Ambiente | cod-2310022 |
| 93 | Netúnio (Np) | Ortorrômbica · P m c n | 4,7230 / 4,8870 / 6,6630 | 90 / 90 / 90 | 8 | 4 a 2,599–2,634 Å | 153,79 | — (sem peso atômico padrão) | Ambiente | cod-9008585 |
| 94 | Plutônio (Pu) | Monoclínica · P 1 21/m 1 | 6,1835 / 4,8244 / 10,9730 | 90 / 101,8 / 90 | 16 | 2 a 2,519–2,547 Å | 320,43 | — (sem peso atômico padrão) | Ambiente | cod-9008587 |
| 95 | Amerício (Am) | Dupla hexagonal compacta (α-Am) · P 63/m m c | 3,4740 / 3,4740 / 11,2500 | 90 / 90 / 120 | 4 | 12 a 3,454–3,474 Å | 117,58 | — (sem peso atômico padrão) | Ambiente | cod-9008524 |

### Bloqueados

| Metal | Estrutura registrada | Motivo |
|---|---|---|
| Lantânio (La) | Dupla hexagonal compacta | Ficha incompleta: COD 9010986 registra um só sítio (Z = 2; a dupla hexagonal tem 4 átomos por célula). A montagem livre continua disponível |
| Praseodímio (Pr) | Dupla hexagonal compacta | Ficha incompleta: COD 9010988, mesmo caso |
| Neodímio (Nd) | Dupla hexagonal compacta | Ficha incompleta: COD 9010989, mesmo caso |

## 3. Achados de dados e o que a revisão científica resolveu

Os achados desta verificação foram tratados na revisão científica (`docs/REVISAO-CIENTIFICA-FONTES.md`):

1. **Rubídio (Rb): corrigido.** O parâmetro a = 5,585 Å (WebElements) dava densidade teórica de 1,629 g/cm³, cerca de 6 % acima do valor normalmente citado à temperatura ambiente. A referência passou a ser a ficha primária COD 9012879 (Kelly e Pearson, 1955): a = 5,697 Å a 297 K, densidade teórica 1,535 g/cm³. A nota da ficha de que o parâmetro é estimado para essa temperatura foi preservada.
2. **Fonte secundária (WebElements):**
   - **9 de 12 metais passaram para a ficha primária local do COD**, com diferença máxima de 0,07 % no parâmetro: titânio, nióbio, ródio, rutênio, háfnio, rênio, ósmio, irídio e rubídio.
   - **Cobalto, césio e zircônio mantêm a referência atual, com motivo registrado:** a ficha local do cobalto (1936) diverge 0,5 % dos valores modernos; a do césio foi medida a 5 K; não há ficha local do zircônio.
3. **Temperatura de referência.** Lítio, sódio e níquel têm parâmetros a 293 K; os demais, a 298 K ou com a convenção "ambiente". A diferença está registrada e é exibida, mas não é corrigida.

## 4. Refinamentos da interação com o modelo (feitos nesta rodada)

| Antes | Agora |
|---|---|
| Num metal com estrutura bloqueada, "Organizar estrutura" ficava cinza; o motivo aparecia em letra pequena embaixo da cena | O motivo fica junto do botão, na cena e em Montagem → Preparo: "Organizar indisponível para manganês: … (Cúbica complexa (α-Mn)). A montagem livre continua disponível.", com o link "Por que uma opção não aparece" |
| Uma seleção inválida no Medir mostrava um código interno: "Seleção inválida para este instrumento: NOT_LATTICE_VECTOR" | A mensagem explica o que escolher: "Esses centros não ocupam posições equivalentes da rede (por exemplo, um vértice e um centro). Para o parâmetro de rede, escolha dois centros equivalentes ligados por uma aresta da célula" (no HC, também como medir a e c) |
| Falhas no Calcular mostravam códigos ("Não foi possível calcular: RESULT_INVALID") | Mensagens explicam o problema e o que conferir |
| Na densidade teórica (ou no empacotamento), o volume V só podia ser digitado, sem dizer que ele é calculado antes | "Ainda não há volume da célula calculado nesta investigação. Calcule antes “Volume da célula unitária” ou informe o valor", com o botão "Ir para “Volume da célula unitária”". Depois do volume, ele aparece como "Calculado pelo SILM" e a dica some |
| "1 unidades", "Selecione 2 ponto(s)" | "1 unidade", "Selecione 2 pontos" |

## 5. Próximos passos sugeridos

- Fichas novas, com acesso ao COD: dupla hexagonal completa de La, Pr e Nd; índio com temperatura da célula; gálio e urânio na condição ambiente; fichas primárias modernas de zircônio, césio e cobalto.
- A coordenação no modelo geral usa um critério de distância declarado (primeira camada até 3 % além da menor distância). Se o autor preferir outro critério didático (por exemplo, poliedros de Voronoi), isso pede uma decisão de conteúdo antes de ser implementado.
