# SILM — Rf por DFT relativística; auditoria de Lr, Db e Sg

**Data:** 13/11/2026 · **Critério:** mesmos controles e visualização para estruturas experimentais e computacionais, com proveniência explícita; nenhuma propriedade não homologada.

## Rf (Z=104) — documentação estrutural suficiente para homologação computacional

**Referência primária:** Jyoti Gyanchandani e S. K. Sikka, *Structural properties of rutherfordium: an ab-initio study*, *Physics Letters A* 376 (2012), 620–625; DOI [10.1016/j.physleta.2011.11.053](https://doi.org/10.1016/j.physleta.2011.11.053). [Texto aberto do autor, arXiv:1106.3146](https://arxiv.org/pdf/1106.3146), Tabela 1 na **página 7 do PDF**.

- Método escolhido: **DFT FP-LAPW** (*full-potential linearized augmented plane wave*) em WIEN2k, funcional **GGA-PBE**, relatividade escalar **mais spin–órbita** (coluna **Theory SR+SO**). Simulação por energia total de cristal a **0 K**, sem determinação experimental de estrutura de Rf.
- Fase selecionada: **hexagonal compacta, HC**, grupo espacial **P6₃/mmc, nº 194**. A referência afirma ser o mínimo de energia em volume de equilíbrio; a fase CCC é prevista em pressão elevada.
- Valores da coluna **Rf / hcp / Theory SR+SO**: `a=3,269 Å`, `c/a=1,590`, distância entre vizinhos `d0=3,212 Å`, módulo volumétrico calculado `K0=100 GPa` (este último é contexto da fonte, **não** uma propriedade autorizada no SILM).
- **Cálculo reprodutível:** `c=a×(c/a)=3,269×1,590=5,19771 Å` → **c = 5,198 Å** exibido. `a=b=3,269 Å`; `α=β=90°, γ=120°`. Não misturar a coluna sem spin–órbita, que apresenta `a=3,302 Å`, `c/a=1,575`.
- **Base:** representação convencional de dois sítios HC do protótipo P6₃/mmc: (0,0,0), (1/3,2/3,1/2). As posições são de **simetria cristalográfica ideal**, não uma medição por difração em Rf.
- **Transição computacional:** sob pressão da ordem de **50 GPa**, HC→CCC com spin–órbita. A estrutura selecionada é a de menor energia no volume normal calculado, não uma previsão experimental em CNTP.
- **Configuração eletrônica do átomo neutro:** `[Rn] 5f14 6d2 7s2`, [NIST Atomic Spectra Database, Rf 104](https://physics.nist.gov/cgi-bin/Elements/elInfo.pl?context=noframes&element=104). É informação do átomo isolado, não a configuração do mar eletrônico no cristal.
- **Status no SILM:** `scope='structure-only'`; `evidenceType='computed'`, método `relativistic-dft-fplapw-pbe-srso`; as propriedades elétricas, térmicas, ópticas e mecânicas específicas permanecem bloqueadas.

**Contexto secundário:** Atta-Fynn e Ray, *Density functional theory studies of condensed phases of 6d super heavy elements*, *Solid State Communications* 201 (2015) 88–94, DOI [10.1016/j.ssc.2014.10.025](https://doi.org/10.1016/j.ssc.2014.10.025), revisa a série Lr–Cn e indica diferenças eletrônicas para Cn. Não usar como fonte dos números de 2012 de Rf.

## Lr (Z=103), Db (105), Sg (106) — revisão em curso, sem liberação automática

- As duas publicações anteriores, além de Gyanchandani e Sikka, *Physical properties of the 6d-series elements from density functional theory*, *Phys. Rev. B* **83, 172101** (2011), DOI [10.1103/PhysRevB.83.172101](https://doi.org/10.1103/PhysRevB.83.172101), discutem fase mais estável e propriedades volumétricas calculadas desses transactinídeos. **A consulta aos resumos não fornece valores completos por elemento** para uma ficha estrutural inequívoca.
- Andreas Östlin, [*Electronic Structure Studies and Method Development for Complex Materials*, KTH (2015)](https://www.diva-portal.org/smash/get/diva2%3A813035/FULLTEXT01.pdf), Tabela 6.2, traz **razões c/a de cálculos HC candidatos**: Lr=1,58; Rf=1,61; Db=1,71; Sg=1,74. **Atenção:** o texto explica que Db e Sg **não têm HC como estrutura estável prevista naquele estudo**. Essas razões não são evidência para habilitar a fase HC dos dois.
- A mesma tese apresenta figura de **raio Wigner–Seitz previsto em função do grupo**, porém o gráfico não oferece precisão numérica suficiente para preencher a célula sem registrar digitalização e margens de incerteza. Não transformar estimativa visual em parâmetro de 3 casas sem o conjunto de dados.
- **Lr:** literatura anterior menciona hipóteses CCC e HC; sem um conjunto completo e coerente de fase estável, parâmetros e método, não escolhemos a fase por analogia com Lu ou pelo raio isolado.
- **Db e Sg:** não utilizar automaticamente as estruturas de Ta e W. É necessário confirmar por elemento a fase energeticamente selecionada, seu volume de equilíbrio ou parâmetros de rede e contexto relativístico.
- **Cn (Z=112):** Atta-Fynn e Ray (2015) predizem um **cristal HC isolante**, diferente do comportamento metálico genérico esperado por analogia com Hg. Requer avaliar inclusive a classificação no motor antes de habilitar propriedades de condução.

### Critérios para o lote seguinte

1. Recuperar as tabelas numéricas completas de Atta-Fynn e Ray (2015), Gyanchandani e Sikka (2011) ou outro trabalho primário para Lr, Db e Sg; confrontar escolha da estrutura **sob o mesmo nível de teoria**.
2. Associar parâmetros ao método e fase exatos: separar DFT escalar-relativística de DFT+SO, bem como pressão e temperatura dos cálculos.
3. Registrar bases cristalográficas completas (CCC/CFC/HC) e grupo espacial; se usar volume calculado para obter `a`, registrar a equação e as unidades.
4. Manter `SUPERHEAVY_LIMITATION` por elemento até aprovação de sua ficha. **Rf é uma exceção homologada individualmente**, não uma liberação em massa.
5. Executar testes científicos, navegador, acessibilidade e cache offline antes da integração à `main`.

A autorização de uso científico é funcional, mas a interface e o relatório devem distinguir **previsão computacional** de **determinação experimental**, mesmo quando ambas estão disponíveis para investigação.

## Segunda auditoria — seleção de fase e lacunas quantitativas (13/11/2026)

A análise da fonte primária **Östlin e Vitos (2011)**, [DOI 10.1103/PhysRevB.84.113104](https://doi.org/10.1103/PhysRevB.84.113104), e da síntese do próprio autor no [doutorado KTH (2015), seção 6.2, Figura 6.3 e Tabela 6.2](https://www.diva-portal.org/smash/get/diva2%3A813035/FULLTEXT01.pdf) separa a **estrutura energeticamente preferida** dos cálculos de uma *estrutura testada*. O artigo possui [errata de dezembro de 2011, DOI 10.1103/PhysRevB.84.239905](https://doi.org/10.1103/PhysRevB.84.239905), que deve ser conferida na íntegra antes da homologação definitiva.

| Metal | Fase candidata na síntese de Östlin (EMTO/LDA escalar-relativístico) | Número de grupo espacial do protótipo | Dado numérico realmente acessível | Impedimento |
|---|---|---:|---|---|
| Laurêncio (Lr, 103) | HC (hexagonal compacta) | 194 (P6₃/mmc) | c/a calculado **1,58** para a estrutura HC | Falta o valor numérico do **a** ou volume atômico **do mesmo cálculo HC** |
| Dúbnio (Db, 105) | CCC (cúbica de corpo centrado) | 229 (Im-3m) | c/a=**1,71**, mas **somente para uma estrutura HC alternativa** | Falta o **a** ou volume atômico da **CCC de equilíbrio**, não HC |
| Seabórgio (Sg, 106) | CCC (cúbica de corpo centrado) | 229 (Im-3m) | c/a=**1,74**, também **somente para uma estrutura HC alternativa** | Falta o **a** ou volume atômico da **CCC de equilíbrio** |

**Nenhuma das razões c/a de Db e Sg deve ser usada para construir a fase de equilíbrio.** O texto que acompanha a Tabela 6.2 afirma expressamente que esses dois elementos não estabilizam a fase HC nesse estudo. Os raios de Wigner–Seitz aparecem na Figura 6.2, porém a tabela numérica subjacente não foi recuperada. Extrair valores de uma figura sem escala digitalizada, margem de erro e identificação da curva não permite atribuir coordenadas a três casas decimais. O acesso à imagem integral esteve indisponível nesta revisão.

O artigo de **Atta-Fynn e Ray (2015)**, [DOI 10.1016/j.ssc.2014.10.025](https://doi.org/10.1016/j.ssc.2014.10.025), compara quatro níveis de teoria (DFT, DFT+spin–órbita, troca exata e combinação). Suas tabelas de constantes de rede devem ser recuperadas e confrontadas **sem misturar uma simetria obtida por um método com o parâmetro calculado por outro**. Também consultar **Gyanchandani e Sikka (2011)**, [DOI 10.1103/PhysRevB.83.172101](https://doi.org/10.1103/PhysRevB.83.172101).

### Dados mínimos para concluir cada ficha

1. **Lr HC:** parâmetro a ou volume de equilíbrio atômico V do modelo EMTO; usar a razão c/a=1,58 **somente** se o a/V vier do mesmo método e da mesma fase. Quando houver volume por átomo, reconstruir a e c usando `V = (√3/4) a²c` para a célula primitiva de dois átomos HC, ou `V_atom = (√3/4) a²c`, portanto `a = [4V_atom/(√3(c/a))]^(1/3)`, `c=(c/a)a`.
2. **Db e Sg CCC:** valor numérico de a ou V por átomo correspondente ao mínimo CCC; se V for por átomo, `a=(2V_atom)^(1/3)` e dois sítios convencionais nas coordenadas (0,0,0) e (1/2,1/2,1/2).
3. Registrar método, funcional, relatividade, unidade, condição de cálculo e DOI; não classificar a previsão como medida experimental, não extrapolar a CNTP e não liberar propriedades elétricas, ópticas, térmicas ou mecânicas por analogia.
4. Só atualizar `silmEligibility` quando a fonte quantitativa estiver verificada, o motor `SILM.crystal` aceitar a geometria e os três navegadores passarem.

**Resultado:** revisão científica anexada ao banco com `reviewedCandidates.decision='needs-quantitative-lattice'`. Os três continuam **indisponíveis**, e a cobertura permanece **78/92 (84,8%)**. As referências ainda em auditoria não são listadas indevidamente como fontes usadas em relatórios do SILM.

