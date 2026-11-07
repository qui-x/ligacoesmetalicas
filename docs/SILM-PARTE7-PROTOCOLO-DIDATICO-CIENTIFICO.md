# SILM — Parte 7 | Protocolo didático-científico das microestruturas (v1)

**Decisão de projeto: 07/11/2026.** Objetivo: assegurar **fidelidade conceitual rastreável à finalidade educacional**, sem exigir reproduzir o tratamento instrumental completo de cada estudo EBSD/TrueEBSD. Não confundir essa finalidade com equivalência numérica a um experimento.

## 1. Distinção operacional obrigatória entre escalas

| Escala | Objeto legítimo de investigação | Advertência obrigatória |
|---|---|---|
| **Objeto** | Uma aplicação tecnológica **ilustrada** dos materiais associados ao elemento | Liga, composto, revestimento ou estado operacional não equivalem automaticamente a um exemplar de metal puro |
| **Grãos** | **Esquema conceitual** de um sólido policristalino; seleção, contornos, variação geométrica reprodutível | O Voronoi não deriva de uma micrografia; morfologia, quantidade, cor e dimensão **não** são propriedades medidas do elemento/produto |
| **Rede** | Estrutura cristalina **de referência experimental registrada**, com fase, fonte e condição quando conhecidos | Um composto/uma liga da aplicação não herda automaticamente a rede do elemento; a fase depende de condições e transformação |
| **Centro metálico** | Modelo atômico-eletrônico didático compatível com a estrutura de referência | Escala atômica não é micrografia; movimento do mar de elétrons e outros efeitos são modelos de explicação, não observação direta |

**Importante:** nem todo objeto retratado é sólido policristalino sob suas condições de funcionamento. A escala Grãos ilustra um **possível contexto de sólido policristalino**, não comprova grãos no objeto cotidiano (ex.: vapor de sódio em lâmpada, materiais cerâmicos, superfícies revestidas).

## 2. Classes e permissões de evidência (sem pontuação inventada)

**D0 — Esquemática conceitual:** comprovada a identidade do elemento e cadastrada uma estrutura cristalográfica de referência; o mapa de grãos é **geometria genérica**, não morfologia específica validada. A bibliografia candidata permite orientar a pesquisa, mas não parametrizar a tesselação. Pode: explorar contornos, selecionar regiões, comparar formações hipotéticas. Não pode: tamanho real, orientação EBSD, porcentagem de fase/composição, distribuição de grãos, alegar reprodução de estudo ou da peça ilustrada.

**D1 — Experimental documentada:** micrografia ou mapa real identificável com material, composição/condição (se conhecidos), técnica, publicação, tratamento, atribuição e direito de apresentação verificados. Pode: observar e discutir **aquela amostra** com legenda clara. Sem calibração/segmentação validada, não habilitar medidas físicas ou resultados generalizados.

**D2 — Experimental quantitativa validada:** D1 + escala e métodos verificáveis + segmentação/medições reproduzidas ou revisadas + política de borda/amostragem e incerteza, quando pertinente. Pode: **apenas** as grandezas efetivamente validadas **para aquela amostra**. ECD individual não equivale automaticamente à média ASTM; fração de área, fração volumétrica e concentração elementar são grandezas diferentes.

**Transição exige revisão de evidências por amostra e grandeza**, não pelo fato de haver URL ou pelo número de estudos sobre o símbolo químico. O banco dos 65 é atualmente **65/65 em D0 para a geometria dos grãos**; 0/65 homologado em D1 ou D2 para visualização experimental integrada. As 20 ilustrações temáticas existentes continuam D0.

## 3. Fonte, hipótese didática e inferência proibida

Para cada elemento, manter:
- Z/símbolo, identificação da fase/rede de referência e URL da fonte cristalográfica, incluindo temperatura quando há;
- aplicação ilustrada, **categoria do material** e ressalva de diferença entre a aplicação e o elemento puro;
- imagem específica opcional e gerador esquemático genérico, sempre D0 enquanto não houver amostra avaliada;
- lista de **estudos candidatos** independente do mapa exibido: não declarar como evidência experimental do gerador;
- campos nulos/ausentes para composição por grão, frações de fase, calibração e tamanhos não medidos;
- trilha de validação por conteúdo: referência documental, fase, amostra, instrumento, direitos, método, limites e versão.

Uma nova formação pseudorrandômica pode variar semente ou perfil **somente como exercício geométrico explicitamente hipotético**. `equiaxial` e `elongated` não podem virar morfologia *real* de elemento específico sem evidência ligada à condição da amostra. **Uma rede CCC/CFC/HC tampouco determina por si só a forma macroscópica dos grãos.**

## 4. Critérios de aceite da dimensão didática

1. O estudante entende a separação entre **objeto, representação de grãos, rede cristalina e centro metálico**.
2. Na escala Grãos há aviso curto e acessível de modelo esquemático **em todas as seleções**. No diálogo Dados há fundamentação da cristalografia do elemento e ressalva da aplicação, com links de fonte quando disponíveis. Não aumentar o texto na área de desenho.
3. Escolher grão, regenerar Voronoi, modificar tema ou zoom **não** altera propriedades físicas, estado científico do simulador ou valores mensuráveis.
4. O mapa esquemático não pode produzir qualquer composição, área/tamanho físico, média ASTM, porcentagem de fase nem afirmar morfologia experimental. Nem a cor indica enriquecimento de algum elemento.
5. Importação de contornos externos permanece **não homologada**, ainda que haja escala declarada. D1/D2 requerem revisão externa, não podem surgir por simples importação.
6. Testes asseguram 65 entradas (Z/símbolo) vinculadas às 65 referências de estrutura e às 65 aplicações ilustradas, diferenciando 20 microestruturas temáticas também esquemáticas.
7. Acessibilidade e responsividade: informações no modal devem funcionar sem cor, com foco por teclado e leitores de tela. Não criar controles redundantes nem comprometer ≥80% da área central dedicada à visualização.
8. O conjunto experimental avançado de Cu/Mg/Al segue em `research/`, separado do programa educativo; preservado para futura D1/D2 quando houver revisão adequada.

## 5. Checklist para homologação D1/D2, sem exigir reconstruir todo TrueEBSD

**D1:** DOI/URL exata; identificação e condição da amostra; modalidade e legenda originais; concordância entre espécie/material e representação; permissão e atribuição; descrição explícita de tratamentos e limitações. **D2:** tudo de D1 **mais** escala rastreável, amostragem, definição de grão/região, método de medida, incertezas/viés reconhecidos, comparação na mesma condição e revisão técnico-científica.

Um modelo ilustrativo é aceito pedagogicamente se as **afirmações** estiverem limitadas às fontes adequadas; é reprovado se apresentar como dado físico uma propriedade escolhida para tornar o desenho plausível.

## 6. Referências metodológicas

- [MTEX — Grain Reconstruction](https://mtex-toolbox.github.io/GrainReconstruction.html): mostra que limiar de desorientação, tratamento de `notIndexed`, `minPixel` e alisamento afetam contagens e contornos. Essas regras justificam **não** chamar o Voronoi de EBSD ou grão quantificado.
- [MTEX — Advanced Grain Reconstruction](https://mtex-toolbox.github.io/GrainReconstructionAdvanced.html): separa células, conectividade e regiões; sustenta a distinção entre métodos de segmentação.
- [ASTM E112](https://www.astm.org/e0112-25e01.html) e [ASTM E1382](https://www.astm.org/e1382-97r23.html): métodos normativos de determinação de tamanho de grão; consultar sempre a edição efetiva no procedimento aprovado, sem atribuir um número ASTM ao esquema.
- Matriz interna de 65 elementos: [`coverage-65.json`](../research/microstructure/coverage-65.json) e a matriz documental dos 65; os 67 estudos são **candidatos** e podem incluir ligas, compostos ou técnicas que não medem grãos do metal puro.
- Protocolo de prevenção de métricas falsas: [`SILM-MICROESTRUTURA-DADOS-QUANTITATIVOS.md`](SILM-MICROESTRUTURA-DADOS-QUANTITATIVOS.md).

**Garantia de projeto:** rastreabilidade das fontes, informação correta sobre o nível de evidência e restrições pedagógicas testadas. **Não é garantia de equivalência de formas, valores ou contornos a todas as pesquisas metalográficas.**
