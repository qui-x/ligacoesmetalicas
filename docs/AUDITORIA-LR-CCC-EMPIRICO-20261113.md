# SILM — Laurêncio (Lr): modelo CCC geométrico e alternativa HC em investigação

**Data:** 13/11/2026. **Escopo:** investigação estrutural ilustrativa, não homologação de fase de equilíbrio experimental ou DFT otimizada.

## Por que uma célula CCC pode ser explorada sem afirmar ser estável?

A **Tabela IV, Actinide Elements** de S. Hübener, *Encyclopedia of Physical Science and Technology* (3ª ed., Elsevier), registra para Lr (Z=103) uma **previsão de empacotamento CCC (bcc)** e um **raio metálico estimado** de **1,66 Å**. A mesma fonte forneceu as hipóteses CFC com raios estimados já empregadas nos modelos didáticos de Fm, Md e No.

Para um protótipo CCC ideal, os átomos tocam-se na diagonal do corpo. Assim:
```
(√3) a = 4 r
r = 1,66 Å (estimativa da tabela de Hübener)
a = 4×1,66/√3 = 3,833605787... Å
a = b = c ≈ 3,834 Å; α=β=γ=90°
Grupo espacial de protótipo: Im-3m (nº 229)
Sítios convencionais: (0,0,0), (1/2,1/2,1/2)
```
O valor de **3,834 Å não tem precisão experimental de 0,001 Å**. As três casas decimais expressam somente o arredondamento da transformação geométrica de uma estimativa de raio. O volume do sólido não foi obtido por minimização da energia DFT, e a célula não foi observada por difração.

Fonte original do raio e do protótipo: <https://www.sciencedirect.com/topics/physics-and-astronomy/actinide-series> (Tabela IV, Lr bcc, raio 1,66 Å).

## Evidência concorrente que não foi misturada

Östlin e Vitos, [*First-principles calculation of the structural stability of 6d transition metals*](https://doi.org/10.1103/PhysRevB.84.113104), *Physical Review B* 84, 113104 (2011), e a [tese KTH de Östlin (2015)](https://www.diva-portal.org/smash/get/diva2%3A813035/FULLTEXT01.pdf) analisam a estabilidade de Lr e preveem **HC** como fase energeticamente favorável no modelo **EMTO/LDA escalar-relativístico**. A Tabela 6.2 informa **c/a≈1,58** para HC; a publicação pública consultada não forneceu o parâmetro a nem o volume de equilíbrio numérico da fase HC. Portanto:

- **Não** usar `c/a=1,58` da fase HC com `r=1,66 Å` da hipótese CCC — seriam modelos incompatíveis.
- **Não** tratar a previsão CCC de Hübener como resultado DFT ou como fase fundamental comprovada. Seu uso atual é somente para visualização geométrica da **hipótese CCC**.
- **Não** atribuir temperatura de 0 K, CNTP, pressão medida, pureza, condutividade, brilho metálico ou propriedades mecânicas à hipótese CCC.
- Quando for verificado um conjunto completo do modelo HC/EMTO (a e c, ou V por átomo e c/a), criar a ficha de fase HC independente, compará-la à hipótese CCC e revisar a estrutura de referência preferida, preservando o histórico científico.

### Errata verificada

A [errata de Östlin e Vitos (7/12/2011)](https://doi.org/10.1103/PhysRevB.84.239905) foi lida integralmente: **a única correção foi reconhecer o trabalho de Gyanchandani e Sikka**, *Physical Review B* 83, 172101 (2011). Não houve mudança de resultados numéricos, curvas, simetrias ou estrutura. O arquivo da errata possui uma página.

### Registro e testes

- `scope='structure-only'`, `evidenceType='computed'`, `predictionMethod='empirical-geometric'` e `derivation.method='hard-sphere-bcc'`.
- A ficha exibe *hipótese geométrica* e os avisos sobre estrutura de equilíbrio não confirmada; o Manual informa o tipo de evidência.
- A configuração eletrônica avaliada do átomo neutro, quando exibida, é distinta do comportamento do sólido.
- Testes unitários validam equação, grupo espacial, célula e propriedades bloqueadas; testes E2E verificam Tabela Periódica, Rede e Centro Metálico em Chromium, Firefox, WebKit, mobile e desktop.
- **Db (105), Sg (106) e os demais superpesados ainda não homologados continuam bloqueados.**
- Esta é uma **habilitação funcional de um modelo geométrico ilustrativo**, e não um resultado físico preditivo de volume de equilíbrio.

**Resultado esperado após CI e merge:** 79/92 metais disponíveis para alguma investigação no SILM; 14 apenas estruturais. A cobertura numérica de propriedades físicas específicas **não** aumentou por causa deste modelo.
