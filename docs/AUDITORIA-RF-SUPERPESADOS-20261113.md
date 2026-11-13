# SILM — Homologação computacional do Rutherfórdio e auditoria de superpesados

**Revisão:** 13/11/2026. **Base conciliada:** integração de Fm, Md e No no PR #127.

## Rutherfórdio (Rf, Z=104)

**Fonte primária:** Gyanchandani, J.; Sikka, S. K., *Structural properties of rutherfordium: An ab-initio study*, *Physics Letters A* **376**, 620–625 (2012). DOI [10.1016/j.physleta.2011.11.053](https://doi.org/10.1016/j.physleta.2011.11.053); [pré-print arXiv:1106.3146](https://arxiv.org/pdf/1106.3146), Tabela 1 (p. 7).

**Dados escolhidos:** cristal hexagonal compacto HC/HCP, P6₃/mmc (194), DFT FP-LAPW/PBE no programa WIEN2k, opção **SR+SO** (correções escalar-relativísticas e acoplamento spin–órbita). `a=b=3,269 Å`, `c/a=1,590`, `c=3,269×1,590=5,19771 Å ≈5,198 Å`, α=β=90°, γ=120°. Célula convencional de dois sítios de geometria HC por simetria. A publicação reporta distância de primeiros vizinhos de 3,212 Å para essa configuração.

**Limites:** resultado de minimização da energia do cristal teórico em estado fundamental/0 K, **não difração experimental**. Não atribuir valor numérico de pressão experimental nem estabilidade universal à CNTP. Não misturar a coluna SR (a=3,302 Å; c/a=1,575) com SR+SO. As fases CCC de maior pressão são alternativas teóricas, não a condição da ficha HC.

**Átomo neutro:** [Rn] 5f14 6d2 7s2 calculado, informação também descrita no estudo. A ficha inclui `electronConfiguration` e `valenceModel` com proveniência, porque o painel não admite os campos nulos. A configuração do átomo isolado não determina número de elétrons livres da banda cristalina.

**Elegibilidade:** `status=available`, `scope=structure-only`, `evidenceType=computed`. Permite a Rede/Célula/Centro; bloqueia propriedades físicas específicas e não cria objetos cotidianos fictícios.

## Situação de outros elementos

- **Fm, Md e No:** já incorporados à `main` pelo PR #127 com estruturas CFC de estimativa geométrica empírica claramente identificadas; **não classificar como determinação DFT nem medição cristalográfica**.
- **Lr (Z=103):** continua indisponível; verificar literatura DFT para estrutura de sólido puro com parâmetros completos.
- **Db–Rg (Z=105–111):** a revisão sobre estado sólido relativístico de Atta-Fynn e Ray, DOI [10.1016/j.ssc.2014.10.025](https://doi.org/10.1016/j.ssc.2014.10.025), é candidata à recuperação de parâmetros completos. Não habilitar só por fórmula teórica e classificação periódica.
- **Cn (Z=112):** previsão controversa, com tratamentos DFT que favorecem fases diferentes, e estudo de Mewes e colaboradores, DOI [10.1002/anie.201906966](https://doi.org/10.1002/anie.201906966), sobre comportamento de líquido volátil, baixo ponto de fusão e sólido de ligação por dispersão. Não inferir um metal condutor à temperatura ambiente.
- **Nh–Lv (113–116):** exigir fonte numérica completa e procedimento de validação em vez de replicar célula de outro elemento.
- **Hg:** líquido ambiente; modelos de sólido a baixa temperatura exigem condição de fase específica.

O bloqueio de cada elemento é individual: Rf é o primeiro superpesado liberado pelo contrato do SILM, enquanto Z105–116 permanecem indisponíveis.

## Testes de homologação

`tests/rutherfordium-computed-structure.test.mjs` e `tests/run-rutherfordium-computed.mjs`, mais a matriz Chromium/Firefox/WebKit para mobile e desktop. Respeitar as convenções de `docs/POLITICA-EVIDENCIAS-COMPUTACIONAIS.md`.
