# SILM 0.15.0 — Ampliação da cobertura de metais

## Resultado

A investigação passa de 43 para **57 metais homologados**. A representação cristalográfica passa de 34 para **48 metais** nos modelos existentes: CCC (13), CFC (14) e HC (21).

## Elementos incorporados

| Elemento | Estrutura de referência | Parâmetros principais (Å) | Referência |
|---|---|---|---|
| Titânio (Ti) | HC | a = 2,9508; c = 4,6855 | WebElements; Pawar e Deshpande (1968) |
| Cromo (Cr) | CCC | a = 2,8839 | COD 5000220; NBS Circular 539 (1955) |
| Cobalto (Co) | HC | a = 2,5071; c = 4,0695 | WebElements; Vincent e Figlarz (1967) |
| Rubídio (Rb) | CCC | a = 5,585 | WebElements; Barrett (1956) |
| Zircônio (Zr) | HC | a = 3,232; c = 5,147 | WebElements; Olinger e Jamieson (1973) |
| Nióbio (Nb) | CCC | a = 3,3004 | WebElements; Straumanis e Zyszczynski (1970) |
| Rutênio (Ru) | HC | a = 2,7059; c = 4,2815 | WebElements; Finkel, Palatnik e Kovtun (1971) |
| Ródio (Rh) | CFC | a = 3,8034 | WebElements; Singh (1968) |
| Cádmio (Cd) | HC | a = 2,97887; c = 5,61765 | COD 9008490; Wyckoff (1963) |
| Césio (Cs) | CCC | a = 6,141 | WebElements; Weir, Piermarini e Block (1971) |
| Háfnio (Hf) | HC | a = 3,1964; c = 5,0511 | WebElements; Russell (1953) |
| Rênio (Re) | HC | a = 2,761; c = 4,456 | WebElements; Liu, Takahashi e Bassett (1970) |
| Ósmio (Os) | HC | a = 2,7344; c = 4,3173 | WebElements; Finkel, Palatnik e Kovtun (1971) |
| Irídio (Ir) | CFC | a = 3,839 | WebElements; Singh (1968) |

## Regras de homologação

- Foram ativados apenas registros com estrutura experimental e parâmetros compatíveis com um modelo já implementado.
- A base fracionária e as operações de simetria foram adaptadas a uma origem cristalograficamente equivalente do modelo SILM e continuam sujeitas ao validador geométrico.
- Quando uma fonte não informa temperatura numérica, a condição é descrita como “ambiente; temperatura numérica não reportada” (qualitativa), não como temperatura medida.
- Os registros recusados anteriormente foram preservados no histórico de candidatos; a nova decisão aceita e sua referência ficam registrados.
- O schema científico permanece em 8: a rodada amplia dados, sem criar um estado científico paralelo.

## Lacunas preservadas

A cobertura não é artificialmente declarada completa. Permanecem sem investigação homologada os metais cuja documentação não fecha condições e parâmetros de referência, e os elementos superpesados da política de limitação. Nove metais investigáveis ainda usam tipos cristalográficos fora de CCC/CFC/HC (Mn, Sn, La, Pr, Nd, Sm, Bi, Np e Pu); eles exigem modelos próprios de célula, coordenação, vizinhança, medição e cálculo, não uma substituição por tipo cúbico ou hexagonal.

Potássio (K) continua bloqueado enquanto os parâmetros e a condição de referência forem conciliados. Mercúrio (Hg) permanece sem estrutura sólida homologada para a condição ambiente adotada. Sistemas complexos e referências em condições especiais serão tratados em suas próprias etapas.
