# SILM — Política para estruturas e propriedades previstas computacionalmente

Data de adoção: 13/11/2026.

## Decisão de produto

Resultados de cálculo científico publicados, rastreáveis e suficientemente completos **têm a mesma validade funcional** que dados experimentais na investigação do SILM. A permissão é definida pela qualidade e completude da **ficha**, não por uma proibição geral da categoria de evidência.

A proveniência é **obrigatória e visível**: `experimental`, `evaluated`, `computed` ou `convention` (vocabulário já previsto no banco científico). **Mesmo acesso didático não significa igual confirmação experimental**. Nunca usar a expressão “medido” para um valor previsto, nem apresentar uma fase prevista como observada.

## Contrato mínimo da ficha estrutural

1. Identificação do metal e da fase candidata, distinguindo elemento puro, liga e composto.
2. Fonte identificável (DOI/URL, autores, ano), tipo de evidência `computed` e origem da estrutura; resultado publicado/arquivado com acesso aos parâmetros.
3. Método e premissas do modelo, quando reportados: DFT/funcional, relatividade e acoplamento spin–órbita, magnetismo, correções de correlação, pseudopotencial, ferramenta, versão e condições geométricas.
4. Grupo espacial, seis parâmetros de rede (a, b, c, α, β, γ) com unidades; base fracionária ou sítios com operações de simetria; quantidade Z da célula.
5. Temperatura e pressão **do cálculo** ou declaração explícita de que não foram reportadas; por exemplo, resultados DFT de estado fundamental a 0 K não podem ser registrados como estrutura medida em CNTP.
6. Quando houver mais de uma fase prevista competitiva, preservar as alternativas e critérios de comparação (energia relativa, efeitos de entropia ou condições). Não selecionar uma arbitrariamente como estrutura ambiente.
7. Aprovação das checagens de consistência: célula não degenerada, simetria compatível, base completa, Z, distâncias interatômicas, vizinhanças, navegação em rede e centro metálico.

Dados que não forem encontrados ficam `null`/não reportados — **jamais** preenchidos por extrapolação silenciosa. A condição qualitativa precisa ser explicitamente distinta de uma medição.

## Consequências de elegibilidade

- Uma estrutura `computed` homologada pode ter `silmEligibility.status='available'` e `scope='structure-only'`, mesmo sem determinação experimental.
- O motor de cristais usa a mesma geometria e os mesmos testes aplicados a entradas experimentais. O campo `evidenceType` altera a **explicação e proveniência**, não a mecânica.
- Propriedades elétricas, térmicas, ópticas e mecânicas exigem validação **individual** e referência adequada à propriedade. A estrutura computacional isolada não autoriza automaticamente valores ou efeitos específicos.
- Estruturas superpesadas e elementos anteriormente bloqueados podem ser reavaliados por essa regra, mas o bloqueio existente só é alterado **por elemento**, após homologação completa. Não habilitar em massa por analogia com outros elementos.
- Roteiros/missões/temas que dependam de propriedades não homologadas permanecem bloqueados para `structure-only`.
- Cenas, relatórios e Manual devem exibir “**Estrutura prevista computacionalmente**” e a fonte. Informar a condição de cálculo e possíveis fases concorrentes.

## Ordem de aplicação

1. Concluir conferência experimental de Ga, In e U e homologação estrutural de Cm, Bk, Cf e Es.
2. Revisar o artigo de Robles-Navarro e Schwerdtfeger, *Phys. Chem. Chem. Phys.* 28 (2026), 6703–6710, DOI [10.1039/D5CP04548G](https://doi.org/10.1039/D5CP04548G), para Fr: prevê estruturas compactas HC/CFC (e empilhamentos próximos), com CCC um pouco menos estável em baixas temperaturas. **Não registrar CCC como única fase sem justificativa termodinâmica.**
3. Buscar fichas completas para Fm, Md, No, Lr e superpesados. Não converter tendências periódicas, suposições ou tabelas sem coordenadas em células unitárias prontas.

## Fundamento metodológico

- [Materials Project — Calculation Details](https://docs.materialsproject.org/methodology/materials-methodology/calculation-details): condições de referência e métodos DFT.
- [Materials Project — Glossary](https://docs.materialsproject.org/frequently-asked-questions/glossary-of-terms): estabilidade termodinâmica prevista e limitações da energia acima do convex hull.
- [AFLOW](https://aflow.org/): banco de estruturas e propriedades calculadas e registros de proveniência.

Esta política não altera retroativamente o status do catálogo. A habilitação depende da ficha do elemento e da aprovação dos testes.
