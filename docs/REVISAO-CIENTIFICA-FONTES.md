# Revisão científica das fontes e metais faltantes

**Data:** 31/10/2026 · **Versão:** SILM 0.15.5 · **Critérios:** `docs/AUDITORIA-ESTRUTURAS-METAIS-0.15.1.md` (elemento puro; fase e condição de temperatura e pressão confirmadas; fonte rastreável com CIF; grupo espacial, parâmetros, sítios e simetria conferidos; visualização só com modelo implementado e validado).

**Evidência usada:** só os CIFs do COD já guardados no repositório (`domain/silm/data/evidence/cif/`, com SHA-256 em `sources.json`). Este ambiente não acessa www.crystallography.net, então nenhuma ficha nova foi baixada. Os itens que dependem de uma ficha que não está no repositório ficaram registrados como pendentes.

**Ferramenta:** `scripts/structure-from-cif.py` monta o registro da estrutura a partir do CIF:

- copia, como publicados, parâmetros, grupo espacial, operações de simetria e sítios;
- usa temperatura numérica só quando o CIF a informa;
- marca pressão diferente da ambiente como não homologável;
- preserva as notas e a pureza da ficha.

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

## 3. Ainda pendentes

- **Novos modelos cristalográficos (em andamento):** as estruturas já registradas e bloqueadas (Mn, Sn, La, Pr, Nd, Sm, Bi, Np, Pu) e os metais cuja ficha local exige esses modelos (Po cúbica simples; In e Pa tetragonais; Am dupla hexagonal; U ortorrômbica).
- **Precisam de ficha nova, com acesso ao COD:**
  - zircônio, césio e cobalto (referência atual mantida);
  - gálio: a única ficha local (COD 9012484) é da fase de alta pressão, a 2,6 GPa;
  - urânio: a ficha local (COD 1527120) trata de baixas temperaturas e não informa a temperatura.
- **Sem dados homologáveis:**
  - frâncio e promécio;
  - cúrio e os elementos seguintes;
  - mercúrio, que é líquido na condição ambiente: não há fase sólida de referência.
