# Geometria Macroscópica da Amostra Multifísica do SILM

**Etapa:** A1 — geometria de referência da amostra  
**Status:** especificação técnica; não integrada ao runtime  
**Versão do schema geométrico:** 1.0.0  
**Branch:** \`study/silm-coupled-properties-transport-20261104\`

## 1. Objetivo

Definir a geometria física macroscópica que será compartilhada pelos domínios elétrico (E), térmico (T), mecânico (M) e óptico (O). A geometria de referência será uma entidade independente da representação cristalina e das coordenadas normalizadas da montagem livre.

O contrato é implementado estruturalmente em [multiphysics-geometry.schema.json](schemas/multiphysics-geometry.schema.json). Ele descreve o sólido de referência, o sistema local de coordenadas, a orientação cristalográfica opcional e as regiões topológicas que podem receber condições físicas.

A1 não cria malha numérica, não resolve deformação e não escolhe solver. A malha de cada domínio será construída em etapa posterior a partir da mesma geometria e das mesmas regiões identificadas.

## 2. Auditoria e separação de escalas

O SILM atual possui três noções que não podem ser fundidas:

| Representação | Convenção observada | Uso correto | Não deve ser usada como |
|---|---|---|---|
| Montagem livre (\`domain/silm/assembly.js\`) | coordenadas normalizadas 0–1 em uma cena 2D | posicionamento didático das unidades | metros, geometria de corpo de prova ou malha de solver |
| Rede cristalina (\`domain/silm/crystal.js\`) | parâmetros de rede e sítios atômicos fracionários, com simetria cristalográfica | célula, rede, vizinhança e orientação cristalina | contorno macroscópico, terminais, apoios ou geometria de ensaio |
| Amostra multifísica (A1) | coordenadas cartesianas SI, dimensões em metros e regiões geométricas nomeadas | domínio espacial comum de E/T/M/O | animação atômica ou uma malha numérica específica |

A geometria A1 é um modelo macroscópico da amostra. A cristalografia pode informar estrutura, fase, parâmetros de rede e orientação do cristal; ela não determina, sem dados adicionais, comprimento, largura, espessura, terminais, apoios ou acabamento superficial do corpo de prova.

## 3. Decisão da versão 1.0.0

A primeira geometria de referência homologável será um **prisma retangular maciço parametrizado**, representando um corpo de prova simples.

Campos geométricos:

- comprimento \(L > 0\);
- largura \(W > 0\);
- espessura \(H > 0\).

O sólido é centrado na origem do sistema local e ocupa:

\[
-\frac{L}{2}\leq x\leq\frac{L}{2},\quad
-\frac{W}{2}\leq y\leq\frac{W}{2},\quad
-\frac{H}{2}\leq z\leq\frac{H}{2}.
\]

Não existe relação obrigatória entre L, W e H no schema. A adequação de proporções para determinado ensaio será validada pelo modelo físico e pelo gerador de malha, não por uma regra visual arbitrária.

A geometria parametrizada é suficiente para o primeiro contrato e permite construir regiões de face determinísticas. Cilindros, fios, chapas de geometria livre, entalhes, furos, filmes multicamadas e CAD importado ficam fora da versão 1.0.0 e poderão ser adicionados em uma versão compatível posterior.

## 4. Sistema de coordenadas

### 4.1 Referencial local da amostra

O sistema local é cartesiano, destro e usa metros:

- **x:** eixo longitudinal;
- **y:** eixo transversal;
- **z:** eixo da espessura e normal nominal das faces superior/inferior.

A regra de orientação é:

\[
\hat{x}\times\hat{y}=\hat{z}.
\]

A origem local coincide com o centro geométrico do prisma e é representada por \((0,0,0)\). Todas as regiões e seletores geométricos são definidos nesse referencial. Não armazenar coordenadas de vértice em pixels, unidades normalizadas ou ångströms.

### 4.2 Orientação cristalográfica

A orientação do cristal em relação à amostra é opcional no contrato base:

- para modelos isotrópicos, a orientação pode permanecer desconhecida;
- para modelos anisotrópicos, o solver deve exigir orientação válida;
- não inferir orientação a partir da aparência da rede ou do ângulo da câmera.

Quando conhecida, a matriz \`crystalToSampleMatrixRowMajor\` é uma rotação 3×3 em ordem de linhas. Ela transforma componentes vetoriais no referencial cristalino para o referencial local da amostra:

\[
\mathbf{v}_{sample}=R_{crystal\rightarrow sample}\mathbf{v}_{crystal}.
\]

A validação semântica deve verificar \(R^T R=I\) e \(\det(R)=+1\), dentro da tolerância numérica declarada. A matriz não pode conter escala, cisalhamento ou reflexão. A evidência da orientação (medida, calculada ou assumida) e sua fonte devem ser registradas. Uma orientação assumida não pode ser apresentada como medida experimental.

### 4.3 Referencial global

Na versão 1.0.0, a amostra é o referencial espacial da experiência. Posicionamento de várias amostras em uma montagem global fica para uma etapa futura. Isso evita introduzir transformações de corpo rígido sem uma necessidade atual.

## 5. Geometria, superfície e malha são objetos diferentes

A geometria de referência é uma descrição topológica/paramétrica, não uma malha.

- **Geometria:** sólido, dimensões, faces, regiões e IDs persistentes.
- **Superfície:** faces e normais geométricas; o \`surfaceModelId\` identifica a representação geométrica da superfície, não os índices ópticos \(n\), \(\kappa\), refletância ou rugosidade medida.
- **Malha:** nós, elementos e conectividade numérica, gerados por cada domínio em etapa própria.
- **Campo:** valores resolvidos sobre uma malha e associados à revisão de geometria consumida.

O mesmo sólido pode gerar malhas distintas para E, T, M e O. Cada malha deve preservar a identidade das regiões geométricas e manter uma referência à geometria e à revisão que lhe deram origem.

## 6. Catálogo de regiões geométricas

As condições de contorno não devem ser ligadas a “face 1” de uma malha. Elas devem referenciar IDs persistentes de regiões geométricas. O gerador de malha converte essas regiões em conjuntos de faces, arestas, nós ou elementos para o domínio correspondente.

Cada região possui:

- \`regionId\`: identificador estável;
- \`topology\`: \`volume\` ou \`surface\`;
- \`selector\`: regra geométrica determinística;
- \`roles\`: papéis físicos que a região pode receber;
- \`label\`: nome legível opcional.

### 6.1 Seletores suportados

| Seletor | Topologia | Definição |
|---|---|---|
| \`whole-volume\` | volume | todo o sólido |
| \`box-all-faces\` | superfície | união das seis faces externas |
| \`box-face\` | superfície | face completa por eixo e lado |
| \`box-face-patch\` | superfície | trecho retangular de uma face, com intervalos normalizados |

Para \`box-face-patch\`, \`uRange\` e \`vRange\` usam frações de 0 a 1 ao longo dos dois eixos que compõem a face:

| Eixo normal | u | v |
|---|---|---|
| x | y | z |
| y | x | z |
| z | x | y |

Os intervalos devem ser crescentes, não vazios e contidos em [0,1]. A ordenação de u/v não muda com o lado min/max. A normal orientada é derivada do eixo e do lado; não deve ser digitada de novo por cada solver.

### 6.2 Papéis permitidos

| Papel | Topologia esperada | Uso |
|---|---|---|
| \`sample-bulk\` | volume | domínio interno da amostra |
| \`electrical-terminal\` | superfície | aplicação de potencial ou corrente |
| \`thermal-boundary\` | superfície | temperatura, fluxo, convecção ou radiação |
| \`mechanical-support\` | superfície | apoio, fixação ou restrição |
| \`mechanical-load\` | superfície | aplicação de tração/pressão superficial |
| \`optical-surface\` | superfície | incidência, reflexão e leitura óptica |
| \`contact-interface\` | superfície | interface com outra região/corpo |
| \`symmetry-plane\` | superfície | plano de simetria quando o solver suportar |

Uma região pode receber mais de um papel. Por exemplo, uma extremidade pode ser terminal elétrico e também região de aplicação de carga mecânica. Isso não significa que as condições são equivalentes; cada domínio mantém seu próprio modelo e sua própria validação.

Regiões diferentes podem coincidir geometricamente quando representam papéis distintos. A validação semântica deve impedir sobreposição ambígua de condições incompatíveis dentro do mesmo domínio, sem proibir sobreposição física deliberada entre domínios.

### 6.3 Regras mínimas do catálogo

- Deve existir exatamente uma região de volume com papel \`sample-bulk\`.
- Região de volume usa \`whole-volume\`.
- Região de superfície usa apenas seletores de face/superfície.
- IDs de região são únicos dentro da revisão da geometria.
- Seletores devem resolver para entidades existentes no sólido.
- Região referenciada por fronteira, contato ou operador deve existir na revisão da geometria da definição.
- Uma região não pode mudar de significado entre revisões mantendo o mesmo ID sem uma migração explícita.

## 7. Aplicação dos domínios à geometria

### 7.1 Elétrico (E)

A primeira configuração de corpo de prova deverá identificar dois terminais distintos, cada um referenciando uma região com papel \`electrical-terminal\`.

- Os terminais devem ser não coincidentes e topologicamente válidos.
- O caminho elétrico deve ligar as regiões terminais através do volume da amostra.
- A lei de contato elétrico pertence ao modelo de contato/condição, não à geometria.
- A geometria não define tensão, corrente nem condutividade.
- Se a área de terminal variar por deformação, o domínio elétrico deverá consumir a geometria corrente aceita.

A1 não assume que as faces terminais são necessariamente as faces x-min e x-max; essa é apenas a configuração padrão do prisma de referência.

### 7.2 Térmico (T)

O domínio térmico poderá atribuir condições a qualquer região com papel \`thermal-boundary\`:

- temperatura imposta;
- fluxo térmico;
- convecção;
- radiação, quando o modelo e dados necessários existirem.

Fontes volumétricas (Joule, absorção ou dissipação) pertencem ao volume/elementos e não são condições de superfície. A geometria apenas define onde a fronteira ou fonte pode atuar.

### 7.3 Mecânico (M)

O domínio mecânico deverá identificar regiões de apoio e de carga:

- \`mechanical-support\`: restrições de deslocamento ou apoio;
- \`mechanical-load\`: tração, pressão ou aplicação equivalente;
- as duas referências devem ser compatíveis com a direção e o tipo de ensaio;
- a definição de apoios deve remover modos rígidos sem restringir artificialmente a expansão livre usada em validações térmicas.

A1 apenas nomeia as regiões; a formulação mecânica define o tipo de restrição, distribuição de carga, contato e lei constitutiva.

### 7.4 Óptico (O)

Uma região com papel \`optical-surface\` identifica a superfície de incidência/leitura.

- A direção incidente é definida no referencial da amostra ou por vetor de onda, e o ângulo de incidência é medido em relação à normal local.
- A normal muda com a geometria deformada aceita; a câmera não participa desse cálculo.
- A região óptica pode coincidir com uma região térmica.
- Rugosidade, revestimento, n(λ), κ(λ), refletância e absorção são dados/modelos de superfície, não dimensões geométricas.
- Uma superfície inclinada por deformação altera a reflexão geométrica; não implica automaticamente mudança da refletância intrínseca.

## 8. Contatos e materiais heterogêneos

O escopo base A1 representa uma amostra homogênea, com um \`materialId\` e um \`phaseId\`. A geometria poderá nomear regiões de interface, mas não habilita automaticamente uma liga, multicamada, revestimento ou material composto.

Para corpos heterogêneos será necessário um contrato adicional de atribuição material por volume, interface entre corpos, continuidade/descontinuidade de campos e leis de contato. Não repartir a amostra em “materiais” apenas pela criação de regiões geométricas.

Na versão base, uma interface de contato é descrita por dois IDs de regiões existentes e por um modelo de contato separado. Contato elétrico, térmico e mecânico podem compartilhar a região geométrica, mas têm leis e parâmetros independentes.

## 9. Revisões geométricas

### 9.1 Geometria de referência

A geometria de referência é imutável depois de usada por uma definição aplicada. Alterar dimensões, seletor, região, orientação ou superfície cria nova revisão da geometria e nova revisão da definição da experiência.

O par \`geometryId + revision\` identifica exatamente o ativo utilizado. O hash do conteúdo pode ser adicionado para integridade, mas não substitui a identidade e a revisão.

### 9.2 Geometria corrente durante uma execução

A deformação calculada não sobrescreve a geometria de referência. O runtime mantém uma revisão corrente derivada do deslocamento aceito:

1. solver mecânico produz o campo de deslocamento;
2. atualizador geométrico cria coordenadas correntes a partir da referência;
3. regiões persistem por IDs e por mapeamento topológico;
4. solvers dependentes recebem a mesma revisão corrente;
5. malhas são atualizadas ou reconstruídas conforme a qualidade e a topologia.

A revisão de geometria corrente pertence ao estado de execução; ela não muda a definição que originou a execução. O runtime conserva `referenceRevision` para o ativo inicial e `revision` para a geometria corrente aceita. No instante de preparação, ambas podem ter o mesmo valor.

### 9.3 Topologia e identidade das regiões

Uma deformação que mantém a topologia preserva os IDs das regiões e atualiza coordenadas/normais. Uma mudança topológica (trinca, separação, contato novo, remoção de material) exige uma nova topologia, mapeamento explícito das regiões e revisão específica de geometria. Se não houver suporte para isso, o passo deve ser rejeitado ou o domínio deve ser suspenso; nunca tentar deduzir correspondência de região por proximidade visual.

## 10. Malhas e integração por domínio

A1 exige que qualquer malha futura declare:

- \`meshId\` e versão;
- \`domain\`;
- \`geometryId\` e revisão de referência;
- revisão corrente de geometria consumida;
- unidade de coordenadas em metros;
- elemento/dimensão topológica;
- mapeamento de cada \`regionId\` para entidades da malha;
- método e versão de geração;
- indicador de qualidade e validação.

A malha não pode inventar uma região ausente da geometria. Regiões sem entidades de malha devem bloquear as condições que dependem delas.

Operadores de transferência entre malhas devem preservar quantidades pertinentes: energia/potência para fontes, fluxo para condições conservativas e orientação para vetores/tensores. A1 não fixa algoritmo de malha nem interpolador.

## 11. Validação geométrica

### 11.1 Estrutural

- Dimensões L, W e H são finitas e estritamente positivas.
- A origem local é o centro geométrico.
- O referencial é destro e ortonormal.
- O sólido está dentro da definição de prisma retangular.
- Seletores de face usam eixo e lado válidos.
- Intervalos de patches satisfazem \(0\leq u_0<u_1\leq1\) e \(0\leq v_0<v_1\leq1\).
- IDs são únicos e todas as referências resolvem.

### 11.2 Semântica de regiões e fronteiras

- Há exatamente um volume \`sample-bulk\`.
- Terminais elétricos são pelo menos dois, distintos e não coincidentes.
- Apoios e cargas mecânicas têm papéis válidos e não criam uma condição sem referência.
- Fronteiras térmicas e superfícies ópticas apontam para superfícies existentes.
- Contatos ligam duas regiões válidas.
- Se uma condição de contorno referencia uma região, o papel da região deve permitir aquele domínio.
- Uma região compartilhada entre domínios não combina parâmetros de um domínio com o outro.

### 11.3 Orientação e adequação numérica

- Matriz cristalográfica conhecida é uma rotação válida.
- Dados anisotrópicos exigem orientação conhecida e compatível.
- Proporções geométricas, tamanho mínimo de elemento, distorção e qualidade de malha são verificações do gerador/solver, não do schema paramétrico.
- Geometria com escala ou dimensões sem fonte/unidade não será usada em modo quantitativo.

## 12. Modelo JSON de referência

O exemplo apresenta uma amostra de forma de prisma retangular com regiões para volume, terminais, troca térmica, apoio mecânico e leitura óptica. Os IDs e dimensões são ilustrativos, não constituem recomendação experimental nem parâmetros homologados.

~~~json
{
  "schemaId": "silm.multiphysics.geometry",
  "schemaVersion": "1.0.0",
  "geometryId": "geo-prism-demo-001",
  "revision": 1,
  "createdAt": "2026-11-04T12:00:00Z",
  "coordinateFrame": {
    "unit": "m",
    "handedness": "right",
    "originM": [0, 0, 0],
    "axes": {
      "x": "longitudinal",
      "y": "transverse",
      "z": "thickness"
    }
  },
  "shape": {
    "kind": "rectangular-prism",
    "dimensionsM": {
      "lengthM": 0.02,
      "widthM": 0.004,
      "thicknessM": 0.001
    }
  },
  "surfaceModelId": "surface-flat-parametric-v1",
  "regions": [
    {
      "regionId": "reg-bulk",
      "topology": "volume",
      "selector": {"kind": "whole-volume"},
      "roles": ["sample-bulk"],
      "label": "Volume da amostra"
    },
    {
      "regionId": "reg-terminal-a",
      "topology": "surface",
      "selector": {"kind": "box-face", "axis": "x", "side": "min"},
      "roles": ["electrical-terminal", "mechanical-support"],
      "label": "Terminal A e apoio"
    },
    {
      "regionId": "reg-terminal-b",
      "topology": "surface",
      "selector": {"kind": "box-face", "axis": "x", "side": "max"},
      "roles": ["electrical-terminal", "mechanical-load"],
      "label": "Terminal B e carga"
    },
    {
      "regionId": "reg-thermal",
      "topology": "surface",
      "selector": {"kind": "box-all-faces"},
      "roles": ["thermal-boundary"],
      "label": "Superfície térmica externa"
    },
    {
      "regionId": "reg-optical",
      "topology": "surface",
      "selector": {"kind": "box-face", "axis": "z", "side": "max"},
      "roles": ["optical-surface"],
      "label": "Face óptica"
    }
  ]
}
~~~

A definição da experiência referencia este ativo por \`geometryId\` e \`geometryRevision\`. As condições de contorno E/T/M/O referenciam os \`regionId\` adequados; não copiam os seletores geométricos.

## 13. Critérios de aceite A1

- [ ] Geometria macroscópica possui schema próprio e versão 1.0.0.
- [ ] A geometria é independente da montagem 2D e da célula cristalina.
- [ ] A referência inicial suporta prisma retangular com dimensões SI.
- [ ] O referencial local possui origem, eixos e orientação destros explícitos.
- [ ] Orientação cristalográfica é opcional para materiais isotrópicos e validada quando informada.
- [ ] Volume e superfícies têm IDs persistentes e seletores determinísticos.
- [ ] Região de volume bulk é única.
- [ ] Regiões podem receber papéis em mais de um domínio sem compartilhar leis físicas.
- [ ] Condições de contorno apontam para regionIds, não índices de malha.
- [ ] Runtime distingue revisão de geometria de referência e geometria corrente.
- [ ] Superfície geométrica é distinta de propriedades ópticas e rugosidade.
- [ ] Malhas são derivadas por domínio e preservam regionIds.
- [ ] Deformação não sobrescreve a referência geométrica.
- [ ] Mudança de topologia exige mapeamento/revisão explícita.
- [ ] A geometria de amostra não altera projetos clássicos nem os motores didáticos atuais.

## 14. Decisões congeladas em A1

1. O prisma retangular maciço será a primeira geometria de referência da amostra.
2. A origem local será o centro geométrico; x longitudinal, y transversal e z espessura.
3. A unidade de coordenadas é metro e o referencial é cartesiano destro.
4. A rede cristalina permanece microestrutura/orientação, não forma macroscópica da amostra.
5. Regiões são identificadas por IDs persistentes e seletores geométricos, nunca por índices de malha.
6. O mesmo regionId pode ser usado por mais de um domínio quando a sobreposição for física e explícita.
7. O campo \`surfaceModelId\` descreve superfície geométrica/normais; não substitui n, κ, refletância, absorção ou rugosidade.
8. A geometria de referência é imutável depois de aplicada; deformação gera geometria corrente derivada no runtime.
9. A amostra inicial é homogênea; materiais compostos e CAD importado exigem extensão futura do contrato.
10. A1 não cria malhas nem implementa solver.

## 15. Integração com A0 e próxima etapa

O contrato de definição A0 passa a identificar a revisão exata da geometria por \`geometryId + geometryRevision + geometrySchemaVersion\`. Cada condição de contorno referencia um ou mais \`regionIds\`; contatos referenciam duas regiões da mesma revisão geométrica.

A especificação A1 deverá ser ligada aos três documentos A0 e à arquitetura operacional. Depois da geometria de referência e de suas regiões, a próxima etapa é **A2 — orquestrador, ciclo transacional e estado de execução**: preparação, validação de referências, início, commit, rollback, cancelamento e retomada, ainda sem solver físico completo.
