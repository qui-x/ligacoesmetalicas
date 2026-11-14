# SILM — Etapa 69: expansão científica para 92 metais e estruturas pendentes

Data da auditoria: 2026-11-14. Base: `main` de `qui-x/ligacoesmetalicas`.  
**Escopo:** auditoria documental; **não** altera a elegibilidade de metais, as fases ativas nem os motores de visualização.

## Contagem conferida no banco publicado

| Categoria | Quantidade |
|---|---:|
| Elementos na tabela SILM | 118 |
| Classificados como metais no catálogo | 92 |
| Metais já habilitados para investigação | 79 |
| Metais ainda indisponíveis por estrutura / restrição superpesada | 13 |
| Elementos presentes na matriz mecânica da etapa 65 | 65 |
| Terras-raras do catálogo da etapa 66, incluindo Pm | 17 |
| Metais distintos cobertos pela união dessas pesquisas | 66 |
| Metais habilitados mas ainda fora da matriz e do catálogo de terras-raras | 13 |

### Metais habilitados ausentes da matriz histórica de propriedades

- **Convencionais:** Ga e In.
- **Alcalino:** Fr (estrutura computacional).
- **Actinídeos:** U, Cm, Bk, Cf, Es, Fm, Md, No, Lr.
- **Transactinídeo:** Rf.

Estes 13 já são investigáveis na `main` e **não devem ter suas estruturas substituídas**. Necessitam fichas condicionais elétricas, térmicas, mecânicas e ópticas nas etapas seguintes. O Pm não integrava a matriz de 65, mas já consta no catálogo específico das 17 terras-raras.

## Auditoria das 13 lacunas estruturais

| Elemento | Situação | Evidência admissível | Próxima exigência |
|---|---|---|---|
| Hg | Fase α romboédrica experimental abaixo de aproximadamente 234 K, mas líquido a 273,15 K | a primitivo ≈ 3,005 Å, ângulos romboédricos ≈ 70,53° | Permitir *apenas* estudo de fase criogênica explicitamente, nunca estrutura sólida de CNTP |
| Db, Sg, Bh, Hs, Mt, Ds, Rg | Simulações DFT de estados condensados de elementos 6d publicadas | Atta-Fynn e Ray (2015) estudam Lr–Cn | Conferir tabela original da fase de menor energia, volume, parâmetros de rede e metodologia por elemento |
| Cn | **Previsões contraditórias** | HC em Atta-Fynn e Ray (2015); CCC em Gyanchandani e colaboradores (2018), dependente de spin–órbita e tratamento dos elétrons 6p | Recuperar tabelas e comparar energias de fase antes de selecionar modelo |
| Nh, Fl, Mc, Lv | Sem estrutura cristalina macroscópica elementar verificada nesta auditoria | Estimativas em tabelas periódicas não trazem célula completa auditável | Localizar cálculos *do sólido elementar*, não apenas átomo, composto ou análogo |

### Evidência de Hg

O Hg líquido à temperatura ambiente se solidifica em torno de **234 K**, adotando estrutura romboédrica α. Um estudo de 2014 menciona, para a fase experimental, `a = 3,005 Å` e ângulo primitivo `70,53°`. É um resultado **condicional criogênico**, não uma homologação em **CNTP brasileira (273,15 K e 101325 Pa)**. A β-Hg é outra estrutura de baixa temperatura, não intercambiável com α-Hg.

### Limites críticos

- O estudo de 2026 sobre **Sg(CO)₆** mede propriedades de um *complexo molecular*, não a célula cristalina do seabórgio metálico.
- Propriedades do átomo isolado, como configuração eletrônica ou potencial de ionização, não definem por si só a fase sólida.
- Nenhum elemento indisponível deve herdar a célula ou os parâmetros do metal vizinho na tabela periódica.
- Dados computacionais podem ser aceitos se o método, o sólido elementar, a fase prevista, os parâmetros geométricos e a condição estiverem documentados; a legenda **“previsto computacionalmente”** deve persistir.
- Não existe homologação automática de propriedades numéricas na CNTP pelo simples fato de um metal ter uma estrutura.
- **Não usar o valor experimental a ≈3,005 Å de Hg como estrutura da fase líquida.**

## Próximos lotes

1. **Lote A — 13 habilitados sem propriedades:** Ga, In, Fr, U, Cm, Bk, Cf, Es, Fm, Md, No, Lr, Rf. Auditoria de compilações elétricas e térmicas, sempre com temperatura, pressão, fase e método. Não transferir valores de outros elementos.
2. **Lote B — 8 com literatura DFT de sólido:** Db, Sg, Bh, Hs, Mt, Ds, Rg, Cn. Recuperar as tabelas completas de 2015 e 2018. Isolar os possíveis conflitos de fase.
3. **Lote C — 4 do bloco p superpesado:** Nh, Fl, Mc, Lv. Levantamento de estudos computacionais de sólido e de limites de validade.
4. **Fase distinta de Hg:** futura exploração criogênica com mudança real de fase no modelo, sem habilitar uma célula sólida na condição de referência atual.

## Fontes científicas

- Mishra, V.; Gyanchandani, J.; Chaturvedi, S.; Sikka, S. K. (2014). *Effect of spin–orbit coupling on the ground state structure of mercury*, Solid State Communications 186, 38–41. DOI: https://doi.org/10.1016/j.ssc.2014.01.025.
- Gaston, N. e colaboradores (2006). *Lattice structure of mercury: Influence of electronic correlation*, Phys. Rev. B 74, 094102. DOI: https://doi.org/10.1103/PhysRevB.74.094102.
- Atta-Fynn, R.; Ray, A. K. (2015). *Density functional theory studies of condensed phases of 6d super heavy elements*, Solid State Communications 201, 88–94. DOI: https://doi.org/10.1016/j.ssc.2014.10.025.
- Gyanchandani, J.; Mishra, V.; Dey, G. K.; Sikka, S. K. (2018). *Super heavy element Copernicium: Cohesive and electronic properties revisited*, Solid State Communications 269, 16–22. DOI: https://doi.org/10.1016/j.ssc.2017.10.009.
- Nature (2026), *Observation of relativistic bond weakening in seaborgium hexacarbonyl*, doi: https://doi.org/10.1038/s41586-026-11105-2. **Controle negativo**: composto gasoso ≠ Sg metálico.
- Royal Society of Chemistry, [Dubnium](https://periodic-table.rsc.org/element/105/dubnium), limitações de propriedades experimentais.
- [WebElements: Flerovium — crystallography](https://www.webelements.com/flerovium/crystal_structure.html), sem parâmetros medidos estabelecidos.

## Critérios para uso no SILM

A ficha experimental ou computacional deve registrar **estrutura, grupo espacial, parâmetros geométricos (a,b,c, α,β,γ), sítios ou gerador de simetria, fase, T, P, fonte e incerteza/limitações**. Até esse conjunto estar completo, a página de pesquisa pode mostrar a hipótese, mas **não** habilita o motor de construção cristalográfica. Perfis de propriedades condicionais só poderão regular os motores após validação independente.

**Estado:** 79/92 metais habilitados na `main`; 13/92 permanecem indisponíveis; 0 novas estruturas homologadas nesta etapa.
