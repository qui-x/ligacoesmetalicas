# SILM — Auditoria de estruturas computacionais: Rf–Lv e Fm–Lr
Data: 13/11/2026.

## Rutherfórdio (Rf, 104): primeira ficha de superpesado estrutural

**Fonte primária conferida visualmente:** J. Gyanchandani e S. K. Sikka, *Structural properties of rutherfordium: An ab-initio study*, *Physics Letters A* **376**, 620–625 (2012), DOI [10.1016/j.physleta.2011.11.053](https://doi.org/10.1016/j.physleta.2011.11.053). Pré-print público [arXiv:1106.3146](https://arxiv.org/pdf/1106.3146), **Tabela 1 na página 7**.

- Método: DFT com **FP-LAPW/WIEN2k**, funcional PBE-GGA; são comparados cálculos escalar-relativísticos (SR) e **SR + spin–órbita (SR+SO)**; estado fundamental a 0 K, otimização de energia versus volume.
- A fase de menor energia é **HC (hcp, P6₃/mmc, nº 194)**. SR+SO: **a=b=3,269 Å**, **c/a=1,590** e distância mínima **3,212 Å**. **c = a×(c/a) = 5,19771 Å**, exibido como **5,198 Å**. α=β=90°, γ=120° e dois sítios no grupo espacial canônico (base convencional equivalente à escolha de origem).
- **Não confundir a coluna SR:** a=3,302 Å, c/a=1,575. **Não confundir os 72 GPa SR ou aproximadamente 50 GPa SR+SO da transição HC→CCC** com condições da estrutura HC de referência.
- Dados estruturais são `CALCULATED` com `evidenceType=computed`. Posições geométricas vêm da simetria do protótipo HC, não de difração experimental.
- A fonte também calcula bandas eletrônicas com caráter metálico do cristal Rf; isso **não autoriza** condutividade ou propriedades mecânicas quantitativas em qualquer temperatura.
- A configuração prevista do **átomo neutro** Rf é [Rn] 5f14 6d2 7s2, também descrita na fonte (introdução). A interface requer explicitamente os campos `electronConfiguration` e `valenceModel` ao habilitar um metal. Eles devem ter fonte e classificação computacional e **não** podem ser deixados nulos, como eram nas fichas bloqueadas de superpesados.
- `scope=structure-only` habilita exploração de Rede e Centro sem objetos cotidianos atribuídos ao metal. Simulações específicas de calor, óptica, mecânica e eletricidade continuam bloqueadas.

## Outros transactinídeos e Lr: panorama bibliográfico sem habilitação automática

- **Lr–Rg e Cn (Z=103–112):** Atta-Fynn e Ray, *Solid State Communications* **201**, 88–94 (2015), DOI [10.1016/j.ssc.2014.10.025](https://doi.org/10.1016/j.ssc.2014.10.025), investigam teoricamente as fases metálicas, volumes atômicos, constantes de rede e estrutura eletrônica com DFT relativística. A versão-resumo acessível nesta rodada **não oferece os parâmetros completos por elemento e método**, necessários à importação para o motor. A fonte é prioridade de obtenção integral para Lr, Db, Sg, Bh, Hs, Mt, Ds e Rg.
- **Rf:** Gyanchandani e Sikka (2012) tem dados completos e fundamenta a liberação individual acima.
- **Cn:** exige tratamento **separado** por causa da natureza potencialmente não metálica. Gyanchandani, Mishra, Dey e Sikka, *Solid State Communications* **269**, 16–22 (2018), DOI [10.1016/j.ssc.2017.10.009](https://doi.org/10.1016/j.ssc.2017.10.009), encontram CCC em um modelo relativístico com elétrons 6p na valência, com V₀=165,71 bohr³/átomo (a=³√(2V₀)×0,529177 Å ≈3,662 Å). **Mas** outros modelos predizem HC ou semicondutor; e Mewes e colaboradores, *Angewandte Chemie* (2019), DOI [10.1002/anie.201906966](https://doi.org/10.1002/anie.201906966), estimam ponto de fusão de **283±11 K**, natureza de líquido volátil em temperaturas ambientes, comportamento de sólido ligado por dispersão e grande gap eletrônico no modelo. Esse mesmo trabalho fornece para a fase HC calculada por PBEsol **R_nn=3,478 Å, c/a=1,635**. As estruturas calculadas **não bastam**, isoladamente, para representar Cn como metal condutor no SILM. Cn continua bloqueado até definir um modo de comparação para **fases e classificação eletrônica controversas**, com restrições explícitas.
- **Fm, Md e No:** trabalhos atômicos, de ionização, espectroscopia, radioquímica ou compostos não devem ser utilizados como substitutos de ficha cristalográfica do metal elementar. É necessário localizar uma fonte de sólido puro e parâmetros completos. A fonte sobre espectroscopia de Lr publicada em 2026 também trata de níveis **atômicos**, não da estrutura metálica periódica.
- **Nh, Fl, Mc e Lv (113–116):** verificar estudos DFT relativísticos que forneçam simultaneamente geometria, volumes, estrutura eletrônica, método e estabilidade de fase; resultados para **átomos ou moléculas** não bastam.
- **Hg:** o elemento é líquido na condição ambiente adotada. Uma estrutura sólida a baixa temperatura só pode ser apresentada num módulo de condições de fase, sem substituir silenciosamente sua apresentação macroscópica.

## Portão do SILM

A inclusão de mais um superpesado ocorre por **homologação individual**, não por desativação global do bloqueio. Para cada ficha: origem e método; sistema e grupo espacial; seis parâmetros; posições fracionárias completas; condição de cálculo; fase alternativa/instabilidade; checagem geométrica; testes da entrada pela Tabela, escalas 3/4, WebKit/Firefox/Chromium. A elegibilidade **funcional** é igual para evidências completas experimentais e computacionais, mas a **origem** precisa ser distinguível no Manual e na interface. Propriedades físicas específicas só podem ser liberadas após validação independente.

Referências de base: `docs/POLITICA-EVIDENCIAS-COMPUTACIONAIS.md` e `docs/AUDITORIA-FR-FM-MD-NO-LR-20261113.md`.
