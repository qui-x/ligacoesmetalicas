# Revisão científica das fontes e metais faltantes

**Data:** 31/10/2026 (seções 1 e 2) e 01/11/2026 (seção 3) · **Versão:** SILM 0.15.5 · **Critérios:** `docs/AUDITORIA-ESTRUTURAS-METAIS-0.15.1.md` (elemento puro; fase e condição de temperatura e pressão confirmadas; fonte rastreável com CIF; grupo espacial, parâmetros, sítios e simetria conferidos; visualização só com modelo implementado e validado).

**Evidência usada:** só os CIFs do COD já guardados no repositório (`domain/silm/data/evidence/cif/`, com SHA-256 em `sources.json`). Este ambiente não acessa www.crystallography.net, então nenhuma ficha nova foi baixada. Os itens que dependem de uma ficha que não está no repositório ficaram registrados como pendentes.

**Ferramenta:** `scripts/structure-from-cif.py` monta o registro da estrutura a partir do CIF:

- copia, como publicados, parâmetros, grupo espacial, operações de simetria e sítios;
- usa temperatura numérica só quando o CIF a informa;
- marca pressão diferente da ambiente como não homologável;
- preserva as notas e a pureza da ficha;
- guarda o Z declarado na ficha, que o modelo geral exige.

## 1. Fontes secundárias (WebElements) substituídas pela ficha primária

| Metal | Antes (WebElements) | Agora (COD, CIF local) | Δa | Condição registrada |
|---|---|---|---:|---|
| Rubídio (Rb) | a = 5,585 Å | **COD 9012879**, Kelly e Pearson (1955), *Can. J. Phys.* 33, 17: a = 5,697 Å | +2,0 % | 297 K; a ficha informa que o parâmetro do espécime IV é estimado para essa temperatura |
| Titânio (Ti) | a = 2,9508; c = 4,6855 Å | COD 9008517 (Wyckoff, 1963): a = 2,950; c = 4,686 Å | −0,03 % | ambiente; temperatura não reportada no CIF |
| Nióbio (Nb) | a = 3,3004 Å | COD 9008546 (Wyckoff, 1963): a = 3,3004 Å | 0 | idem |
| Ródio (Rh) | a = 3,8034 Å | COD 9008482 (Wyckoff, 1963): a = 3,8031 Å | −0,01 % | idem |
| Rutênio (Ru) | a = 2,7059; c = 4,2815 Å | COD 9008513 (Wyckoff, 1963): a = 2,70389; c = 4,28168 Å | −0,07 % | idem |
| Háfnio (Hf) | a = 3,1964; c = 5,0511 Å | COD 1539076, Russell (1953), *J. Appl. Phys.* 24, 232: mesmos valores | 0 | idem |
| Rênio (Re) | a = 2,7610; c = 4,4560 Å | COD 9008512 (Wyckoff, 1963): a = 2,7608; c = 4,4582 Å | −0,01 % | idem |
| Ósmio (Os) | a = 2,7344; c = 4,3173 Å | COD 9008510 (Wyckoff, 1963): a = 2,7352; c = 4,3190 Å | +0,03 % | idem |
| Irídio (Ir) | a = 3,8390 Å | COD 9008470 (Wyckoff, 1963): a = 3,8394 Å | +0,01 % | idem |

O rubídio era o único caso com diferença significativa. O valor anterior corresponde a uma medida de baixa temperatura, e a densidade teórica caiu de 1,629 para 1,535 g/cm³, igual à densidade informada pela própria ficha. Nos demais metais, a mudança é de rastreabilidade (ficha primária guardada no repositório), sem alteração científica relevante.

### Mantidos, com motivo registrado

| Metal | Ficha local avaliada | Por que não foi adotada |
|---|---|---|
| Cobalto (Co) | COD 9011615, Marick (1936), temperatura ambiente: a = 2,519; c = 4,091 Å | Fica cerca de 0,5 % acima da referência adotada (a = 2,5071 Å); trocar seria perder precisão. Pendente: conferir uma ficha primária moderna |
| Césio (Cs) | COD 9008532 (Wyckoff): a = 6,045 Å | Medida a 5 K: não representa a condição ambiente |
| Zircônio (Zr) | — | Não há ficha local. Pendente: conferir uma ficha COD online |

A decisão de cada candidato está em `reviewedCandidates` no banco: `accepted`, `superseded` (fonte anterior, com os valores antigos) ou `not-homologated` (com o motivo).

## 2. Metais faltantes homologados (modelos já existentes)

| Metal | Ficha | Estrutura | Parâmetro | Observação |
|---|---|---|---|---|
| Potássio (K) | COD 9011970 (*J. Phys. Chem. Solids*, 1986) | CCC | a = 5,328 Å | Estudo de compressão; parâmetro a P = 0 GPa; temperatura não reportada |
| Rádio (Ra) | COD 1509139, Weigel e Trinkl (1968), *Radiochim. Acta* | CCC | a = 5,148 Å | — |
| Tório (Th) | COD 9008485 (Wyckoff, 1963) | CFC | a = 5,0843 Å | — |
| Actínio (Ac) | COD 9008458 (Wyckoff, 1963) | CFC | a = 5,311 Å | — |
| Tecnécio (Tc) | COD 1541062 (*J. Less-Common Met.*, 1964) | HC | a = 2,74; c = 4,398 Å | Tecnécio metálico medido num estudo de nitretos e boretos. O outro candidato (COD 1534910) é um cálculo teórico e continua rejeitado |

Todos passam pela auditoria sítio a sítio (`tests/structure-audit.cjs`) e pela construção na interface (`tests/model-interaction.cjs`).

Rádio, actínio e tecnécio não têm peso atômico padrão: o banco registra só o número de massa, por convenção da IUPAC. Por isso, a densidade teórica fica indisponível para eles; o SILM não usa o número de massa como se fosse massa molar.

**Total de metais investigáveis: 62** (antes, 57). São 53 estruturas visualizáveis: 15 CCC, 16 CFC e 22 HC.

## 3. Estruturas fora de CCC/CFC/HC: modelo cristalográfico geral

Antes, as estruturas registradas fora de CCC, CFC e HC ficavam bloqueadas, porque o SILM só tinha modelos para essas três. Agora há um **modelo geral**, construído só com os dados da ficha:

- **Célula:** os vetores de rede vêm de a, b, c, α, β e γ. É o paralelepípedo da ficha, o mesmo que a cena desenha.
- **Átomos:** gerados pelas operações de simetria registradas a partir dos sítios publicados.
- **Contagem:** cada posição desenhada conta pela fração que fica dentro da célula (vértice 1/8, aresta 1/4, face 1/2, interior 1). A soma precisa dar o número de átomos da célula.
- **Vizinhança:** descrita por camadas de distância. Nessas estruturas, o número de coordenação depende da distância considerada. O SILM destaca a primeira camada (até 3 % além da menor distância) e informa as camadas seguintes.
  - Exemplo: no α-Mn, o sítio do vértice tem 12 vizinhos a 2,75 Å e mais 4 a 2,84 Å. Se a distância considerada incluir esses 4, a contagem passa a 16. Por isso a tabela mostra as camadas, e não um número único.

### Critérios de homologação no modelo geral

A visualização só é liberada quando a ficha passa em todas as conferências abaixo. Se uma falha, a estrutura fica bloqueada com o motivo.

| Conferência | O que exige | Motivo do bloqueio |
|---|---|---|
| Tipo × grupo espacial | O tipo registrado combina com o grupo (faixas das Tabelas Internacionais por sistema cristalino) | `DATA_CONFLICT` |
| Métrica da célula | Os parâmetros obedecem ao sistema: por exemplo, a = b na tetragonal e γ = 120° nos eixos hexagonais | `DATA_CONFLICT` |
| Átomos gerados × Z da ficha | A simetria gera exatamente o Z declarado no CIF (`_cell_formula_units_Z`, guardado no banco com a fonte) | menos átomos: `STRUCTURE_DATA_INCOMPLETE`; mais: `DATA_CONFLICT` |
| Distância mínima | Nenhum par de átomos a menos de 1,8 Å | `DATA_CONFLICT` |
| Volume por átomo | Volume por átomo ÷ (menor distância)³ ≤ 1,3; a dupla hexagonal precisa de 4 átomos por célula | `STRUCTURE_DATA_INCOMPLETE` |

O teste mostrou por que a conferência do Z é necessária. Tirando um sítio do α-Mn, a conferência de volume por átomo às vezes não percebia a falta. Com o Z da ficha, qualquer sítio faltante bloqueia a estrutura.

### Resultado

| Metal | Ficha | Estrutura | Z | Volume (Å³): SILM × CIF | Densidade teórica (g/cm³) | Primeira camada |
|---|---|---|---:|---|---:|---|
| Manganês (Mn) | COD 9011068, 298 K | cúbica complexa (α-Mn), I -4 3 m | 58 | 707,94 × 707,944 | 7,47 | 12 a 2,75 Å, depois 4 a 2,84 Å (sítio do vértice) |
| Estanho (Sn) | COD 9012005, 298,15 K | tetragonal (β-Sn), I 41/a m d | 4 | 108,18 × 108,183 | 7,29 | 4 a 3,02 Å, depois 2 a 3,18 Å |
| Samário (Sm) | COD 9014498 | romboédrica, R -3 m (eixos romboédricos) | 3 | 99,35 × 99,346 | 7,54 | 12 entre 3,59 e 3,62 Å |
| Bismuto (Bi) | COD 9009658, 298 K | romboédrica, R -3 m (eixos hexagonais) | 6 | 212,30 × 212,299 | 9,81 | 3 a 3,07 Å, depois 3 a 3,53 Å |
| Netúnio (Np) | COD 9008585 | ortorrômbica, P m c n | 8 | 153,79 × 153,791 | — | 4 entre 2,60 e 2,63 Å, depois 1 a 3,05 Å |
| Plutônio (Pu) | COD 9008587 | monoclínica (α-Pu), P 1 21/m 1 | 16 | 320,43 × 320,425 | — | 2 (2,52 e 2,55 Å), depois 1 a 2,70 Å e 2 a 2,78 Å |
| **Amerício (Am)**, novo | COD 9008524 (Wyckoff, 1963) | dupla hexagonal compacta (α-Am), P 63/m m c | 4 | 117,58 × 117,583 | — | 12 entre 3,45 e 3,47 Å |
| **Polônio (Po)**, novo | COD 1509138, Beamer e Maxwell (1949), 283 K | cúbica simples (α-Po), P m -3 m | 1 | 37,43 × 37,427 | — | 6 a 3,35 Å |
| **Protactínio (Pa)**, novo | COD 2310022, Zachariasen (1952) | tetragonal de corpo centrado, I 4/m m m | 2 | 49,88 × 49,883 | 15,38 | 10 (8 a 3,21 Å e 2 a 3,24 Å), depois 4 a 3,92 Å |

- **Densidade:** Np, Pu, Am e Po não têm peso atômico padrão; o banco guarda só o número de massa (convenção da IUPAC), e por isso a densidade teórica fica indisponível para eles. As densidades calculadas para Mn, Sn, Sm e Bi coincidem com o campo `_exptl_crystal_density_diffrn` das fichas, com uma exceção.
  - O CIF do estanho traz 4,000 g/cm³ nesse campo. É um resíduo do registro original (que tinha o grupo espacial errado, F m 3 m) e é incompatível com o Z e o volume da própria ficha corrigida, que dão 7,29 g/cm³. O SILM calcula a densidade a partir de Z, M e V; não usa esse campo.
- **Calcular no modelo geral:** só as relações exatas da célula.
  - Número efetivo pela contagem das posições.
  - Volume da célula com os seis parâmetros: V = a · b · c · √(1 − cos²α − cos²β − cos²γ + 2 cos α cos β cos γ).
  - Densidade teórica.
  - **Não há raio nem empacotamento de esferas rígidas:** nessas estruturas há distâncias de contato diferentes, e uma esfera de raio único não descreve o sólido.
- **Medir no modelo geral:** o parâmetro de rede é medido ao longo de cada eixo da célula (a, b ou c). A coordenação informa a primeira camada e as camadas seguintes.
- **Propriedades no modelo geral:** condução térmica e brilho continuam como experiências qualitativas.
  - Maleabilidade e ductilidade ficam indisponíveis: a representação de deformação (deslizamento coletivo de planos) foi construída para CCC, CFC e HC e não foi homologada para estruturas complexas.
  - Vários desses metais (α-Mn, Bi, α-Pu) são frágeis à temperatura ambiente.
  - Pelo mesmo motivo, o roteiro "Quando o Metal se Deforma" e a missão "Quanto Espaço Está Ocupado?" listam só metais de modelo canônico.

### Continuam bloqueados

- **Lantânio, praseodímio e neodímio** (dupla hexagonal). As fichas COD 9010986, 9010988 e 9010989 registram um só sítio e declaram Z = 2, quando a dupla hexagonal tem 4 átomos por célula. A estrutura fica bloqueada (`STRUCTURE_DATA_INCOMPLETE`) até haver ficha completa; o sítio que falta não é completado por conta própria.
- **Índio:** a única ficha local (COD 9017521) vem de um estudo de dilatação térmica (Smith e Schneider, 1964), com medidas em várias temperaturas. O CIF não informa a que temperatura corresponde a célula registrada, então ela não pode ser tratada como condição ambiente. Fica pendente até a conferência do artigo original.
  - A diferença entre as células "de face centrada" (F 4/m m m, a ≈ 4,60 Å) e "de corpo centrado" (I 4/m m m, a = 3,253 Å) é só de convenção: as duas descrevem a mesma rede. Esse ponto não impede a homologação.

**Total de metais investigáveis: 65** (antes, 62). São 62 estruturas visualizáveis: 15 CCC, 16 CFC, 22 HC e 9 no modelo geral. Três fichas incompletas continuam bloqueadas.

## 4. Ainda pendentes

- **Precisam de ficha nova, com acesso ao COD:**
  - zircônio, césio e cobalto (referência atual mantida);
  - gálio: a única ficha local (COD 9012484) é da fase de alta pressão, a 2,6 GPa;
  - urânio: a ficha local (COD 1527120) trata de baixas temperaturas e não informa a temperatura;
  - índio: conferir a temperatura da célula no artigo original ou obter outra ficha;
  - lantânio, praseodímio e neodímio: ficha da dupla hexagonal com os dois sítios.
- **Sem dados homologáveis:**
  - frâncio e promécio;
  - cúrio e os elementos seguintes;
  - mercúrio, que é líquido na condição ambiente: não há fase sólida de referência.
