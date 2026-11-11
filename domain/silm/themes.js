'use strict';
(()=>{
 const S=SILM,make=(id,title,subtitle,description,idea,observe,interpret,limits,missions,routes,metals=[29,26,12])=>({id,version:1,title,subtitle,description,concepts:[{title:'Ideia principal',text:idea},{title:'Observe no SILM',text:observe},{title:'Como interpretar',text:interpret},{title:'Limites do modelo',text:limits}],resources:['laboratorio'],relatedMissions:missions,relatedRoutes:routes,relatedMetals:metals,sources:['src-silm-conventions',...new Set(metals.flatMap(z=>S.data.sourceIds(S.data.get(z))))]});
 /* Sequências de estudo conectadas às interações realmente disponíveis. */
 const INVESTIGATIONS={
  "ligacao-metalica": {
    "problem": "Por que uma peça metálica apresenta propriedades coletivas que não seriam explicadas por pares de átomos isolados?",
    "prediction": "Antes de abrir a representação, descreva como você imagina os centros e os elétrons de valência no material.",
    "actions": [
      "Comece por uma aplicação macroscópica e identifique o componente metálico investigado.",
      "Na escala da rede, observe os centros e a camada de elétrons deslocalizados.",
      "Escolha a missão Elétrons em Movimento e compare a representação visível e os controles de movimento."
    ],
    "evidence": "Aponte uma característica que depende do conjunto de centros e uma limitação dos pontos que representam elétrons.",
    "reflection": "Qual é a diferença entre deslocalização e elétrons em órbitas definidas ao redor de cada centro?"
  },
  "estrutura-metais": {
    "problem": "Como podemos investigar o entorno de um centro sem confundir uma vizinhança local com a rede inteira?",
    "prediction": "Preveja se o número de vizinhos depende apenas do metal escolhido ou também da estrutura cristalina.",
    "actions": [
      "Na Oficina, percorra Objeto e Grãos como representações introdutórias, sem supor ampliação calibrada.",
      "Abra Rede e Centro e destaque a vizinhança do centro escolhido.",
      "Use a missão Quem São os Vizinhos? para verificar a seleção e o destaque dos vizinhos."
    ],
    "evidence": "Registre a estrutura de referência e a forma como seus vizinhos foram identificados.",
    "reflection": "Por que a presença de vizinhos não significa que exista uma molécula metálica isolada?"
  },
  "estruturas-cristalinas": {
    "problem": "Um mesmo desenho de célula unitária serve para explicar todas as estruturas metálicas?",
    "prediction": "Compare o que você espera observar em referências CCC, CFC e HC.",
    "actions": [
      "Investigue um metal disponível com estrutura cristalina documentada.",
      "Alterne célula unitária e rede, observando a repetição sem mudar de material.",
      "Utilize a missão Da Montagem à Ordem ou o roteiro A Ordem por Trás do Metal."
    ],
    "evidence": "Identifique o modelo de estrutura, seus limites e a referência dos parâmetros utilizados.",
    "reflection": "Por que uma célula desenhada não equivale a um grão medido de um objeto?"
  },
  "eletrons-deslocalizados": {
    "problem": "Como uma animação pode ajudar a explicar condução sem funcionar como uma medição de elétrons?",
    "prediction": "Preveja o que mudaria entre exibir os marcadores eletrônicos e aplicar campo elétrico ao modelo.",
    "actions": [
      "Mostre os elétrons na representação da rede e observe a relação com os centros metálicos.",
      "Na missão Metal sob Campo, compare a situação com e sem campo aplicado.",
      "Revise a função de redução de movimento e os limites da animação."
    ],
    "evidence": "Distinga o indicador de campo e a representação qualitativa de um valor numérico de condutividade.",
    "reflection": "O que seria necessário medir para afirmar que um metal conduz melhor do que outro?"
  },
  "propriedades-metalicas": {
    "problem": "Por que diferentes aplicações valorizam condutividade, conformabilidade ou resposta óptica de modo diferente?",
    "prediction": "Escolha um objeto metálico e indique qual propriedade parece relevante para sua função, antes de consultar o modelo.",
    "actions": [
      "Na escala Objeto, identifique uma aplicação e não confunda material e produto inteiro.",
      "Na Oficina, selecione uma propriedade disponível e observe a resposta sem assumir que todos os metais têm a mesma intensidade.",
      "Relacione a visualização às referências dos dados e à missão Metal sob Campo quando o assunto for condução elétrica."
    ],
    "evidence": "Registre qual comportamento foi representado, qual grandeza está documentada e qual informação continua ausente.",
    "reflection": "Um ímã de liga Nd–Fe–B não é equivalente a um pedaço de neodímio puro; por que composição e processamento importam? O magnetismo ainda não deve ser tratado como fenômeno calculado pelo SILM."
  },
  "medindo-estruturas": {
    "problem": "Se ampliarmos a célula cristalina, a distância real entre centros também aumenta?",
    "prediction": "Anote qual unidade científica espera encontrar no resultado da medição.",
    "actions": [
      "Organize uma rede cristalina válida e ative o módulo Medir.",
      "Use o instrumento Parâmetro de rede para obter a leitura a.",
      "Altere apenas a vista ou o zoom, mantendo o metal e a estrutura."
    ],
    "evidence": "Compare o registro de distância antes e depois da mudança de câmera, com unidade e fonte.",
    "reflection": "O que distingue o tamanho em pixels da grandeza medida no modelo?"
  },
  "estrutura-calculo": {
    "problem": "Como um modelo de células e esferas rígidas pode fornecer relações geométricas sem representar a densidade eletrônica real?",
    "prediction": "Preveja quais valores são necessários para calcular volume e fator de empacotamento.",
    "actions": [
      "Organize uma das estruturas canônicas habilitadas e ative Calcular.",
      "Confira as entradas e calcule volume, raio do modelo e fator de empacotamento quando disponíveis.",
      "Revise as unidades, a origem dos parâmetros e o significado da fração geométrica obtida."
    ],
    "evidence": "Relacione uma fórmula, seus dados de entrada e seu resultado registrado em Dados.",
    "reflection": "Por que o fator de empacotamento do modelo de esferas rígidas não equivale à densidade de um metal comercial?"
  }
};
 INVESTIGATIONS['cobre-neodimio']={"problem":"Por que o cobre de um enrolamento e um ímã permanente Nd–Fe–B exigem explicações diferentes, embora ambos envolvam materiais metálicos?","prediction":"Antes de investigar, diferencie o metal puro (Cu ou Nd), a peça do objeto e o material de liga. Preveja quais modelos cristalográficos o SILM pode mostrar.","actions":["Explore um exemplo de cobre no Objeto e atravesse as escalas até a rede e o centro; registre a estrutura cristalina de referência e a função do componente.","Conclua ou encerre essa investigação antes de preparar o neodímio. Na segunda tentativa, compare Objeto, Grãos, Rede e Centro, lembrando que a imagem do ímã representa uma liga Nd–Fe–B.","Compare os registros, indicando explicitamente quais ações estavam habilitadas em Cu e quais não estavam em Nd, e por que a liga Nd–Fe–B não é o metal puro."],"evidence":"Apresente dois registros separados, identificando o elemento (Cu ou Nd), o objeto de origem, a estrutura de referência e uma limitação científica em cada caso.","reflection":"Por que a elevada condutividade do cobre não basta para explicar a função de um ímã Nd–Fe–B? Quais dados e técnicas seriam necessários para discutir o magnetismo da liga?"};
 const list=[
 make('ligacao-metalica','Ligação Metálica','Uma organização coletiva','Conecte estrutura, elétrons e propriedades.','O modelo representa centros metálicos positivos envolvidos por elétrons de valência deslocalizados.','Mostre os centros e a distribuição eletrônica no laboratório.','A interação é coletiva: o sólido não é descrito como um conjunto de moléculas metálicas isoladas.','Esferas e pontos são representações didáticas, não imagens de partículas individuais.',['eletrons-movimento','campo-metal'],['eletrons-metal']),
 make('estrutura-metais','Estrutura dos Metais','Ordem e vizinhança','Investigue relações entre centros e organização espacial.','A vizinhança descreve centros próximos no modelo estrutural adotado.','Selecione um centro e destaque os vizinhos.','Diferencie a vizinhança local da repetição de toda a rede.','A montagem livre não tem escala física nem determina sozinha a estrutura real.',['vizinhos-metal','montagem-ordem'],['ordem-metal']),
 make('estruturas-cristalinas','Estruturas Cristalinas','Célula e rede','Compare modelos CCC, CFC e HC.','A célula unitária descreve a repetição de uma estrutura cristalina.','Alterne Célula e Rede; compare metais com referências distintas.','O sólido continua além dos limites desenhados. A célula adotada importa para contagens e volumes.','O SILM mostra apenas estruturas e condições homologadas; não prevê transições de fase.',['montagem-ordem'],['ordem-metal','volume-celula']),
 make('eletrons-deslocalizados','Elétrons Deslocalizados','Distribuição e mobilidade','Explore a representação coletiva.','Os elétrons de valência deslocalizados participam do modelo de ligação metálica.','Alterne visibilidade e movimento; sob campo, observe o comportamento coletivo.','Os marcadores visuais não fornecem a contagem real de elétrons livres do metal.','A animação não mede velocidade de deriva nem resolve estados quânticos.',['eletrons-movimento','campo-metal'],['eletrons-metal']),
 make('propriedades-metalicas','Propriedades Metálicas','Da estrutura ao comportamento','Relacione observações qualitativas e dados de referência.','Condutividade, maleabilidade, ductilidade e brilho podem ser investigados por modelos com limites distintos.','Aplique campo, calor, compressão, alongamento ou luz quando disponíveis.','Separe experiência qualitativa, dado tabelado e valor calculado.','A elegibilidade e a ausência de valores numéricos são explícitas; uma animação não é um ensaio de uma amostra.',['campo-metal'],['deformacao-metal']),
 make('medindo-estruturas','Medindo Estruturas','Escala e origem da medida','Diferencie modelo, tela e dado tabelado.','Uma medida do modelo usa coordenadas cristalográficas, não o tamanho em pixels.','Meça a e altere zoom ou projeção.','A unidade de apresentação muda sem alterar o comprimento canônico registrado.','Uma medida do modelo não é uma medição experimental de uma amostra.',['medida-rede'],['medindo-ordem']),
 make('estrutura-calculo','Da Estrutura ao Cálculo','Relações geométricas','Use entradas identificadas e resultados rastreáveis.','Fórmulas relacionam parâmetros, contagens e grandezas derivadas do modelo adotado.','Calcule volume, raio e fator de empacotamento usando o catálogo central.','Confira a origem das entradas e a célula adotada antes de interpretar o resultado.','O empacotamento de esferas rígidas não é a fração ocupada pela densidade eletrônica real.',['espaco-ocupado'],['volume-celula'])
 ];

 const comparison=make(
  'cobre-neodimio','Cobre e Neodímio','Condutor metálico × aplicação de liga com terras raras',
  'Compare os metais puros e os materiais usados em um motor ou alto-falante, sem confundir a liga Nd–Fe–B com neodímio elementar.',
  'O cobre metálico costuma ser empregado em condutores elétricos, enquanto ímãs Nd–Fe–B dependem da composição e do processamento de uma fase intermetálica.',
  'Percorra as quatro escalas com Cu e depois com Nd, em investigações separadas.',
  'Associe as propriedades e os dados de referência a cada elemento. O magnetismo da liga não é simulado pelo SILM.',
  'O objeto representado não é amostra calibrada; as propriedades de Nd puro não são as do ímã Nd–Fe–B.',
  ['objeto-ao-centro'],['ordem-metal'],[29,60]
 );
 comparison.comparison={
  metals:[29,60],
  caveat:'A aplicação Nd–Fe–B é uma liga baseada em Nd, Fe e B. O SILM apresenta o elemento Nd e sua estrutura de referência, não calcula o magnetismo da liga. Conclua ou encerre uma investigação antes de iniciar a outra.'
 };
 list.push(comparison);

 /* Temas ampliados com suporte dos 65 metais habilitados e seus limites;
    somente redes homologadas são oferecidas nas tarefas de cristalografia. */
 const EXPANDED_THEMES=[
  {
    "id": "familia-alcalinos",
    "title": "Metais alcalinos e a rede CCC",
    "sub": "Li, Na, K, Rb e Cs",
    "description": "Compare os metais alcalinos por sua organização cristalográfica, evitando confundir geometria e reatividade.",
    "idea": "A referência adotada para os cinco alcalinos investigáveis é CCC, mas cada metal tem parâmetros próprios e comportamento químico distinto.",
    "observe": "Observe célula, rede e vizinhança imediata no SILM.",
    "interpret": "A repetição estrutural não determina sozinha reatividade, resistência ou segurança de uma amostra.",
    "limits": "Não há reação química com água nem manuseio real destes metais.",
    "missions": [
      "alcalinos-rede"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "category:alkali",
    "track": "familias",
    "problem": "Em que uma família periódica pode ser semelhante e em que a geometria cristalina ainda precisa ser analisada por metal?",
    "prediction": "Preveja a distribuição dos centros de uma rede CCC e os limites dessa representação.",
    "actions": [
      "Selecione um metal alcalino disponível para investigação virtual.",
      "Observe Célula e Rede e destaque os vizinhos na missão Alcalinos: organização CCC.",
      "Anote metal, estrutura e a origem do parâmetro de referência; repita com outro elemento se desejar comparar."
    ],
    "evidence": "Identifique uma propriedade geométrica comum e um parâmetro que deve ser consultado separadamente.",
    "reflection": "Por que CCC não permite concluir como um metal alcalino reagiria em água?"
  },
  {
    "id": "familia-alcalinoterrosos",
    "title": "Alcalinoterrosos: diferentes cristais",
    "sub": "De Be e Mg a Ba e Ra",
    "description": "Uma família química pode apresentar diferentes organizações cristalográficas.",
    "idea": "Be e Mg usam referência HC, Ca e Sr CFC, Ba e Ra CCC na seleção científica do SILM.",
    "observe": "Compare a célula unitária com a rede e identifique o tipo estrutural.",
    "interpret": "A classificação periódica é distinta da classificação cristalográfica.",
    "limits": "A atividade é virtual; Ra é radioativo, e não se propõe sua manipulação.",
    "missions": [
      "alcalinoterrosos-celulas"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "category:alkaline-earth",
    "track": "familias",
    "problem": "Por que metais do mesmo grupo não devem ser mostrados com a mesma célula unitária?",
    "prediction": "Preveja o que muda da estrutura HC de Mg para a CFC de Ca.",
    "actions": [
      "Escolha um alcalinoterroso e consulte sua estrutura no banco científico.",
      "Abra a missão Alcalinoterrosos não são iguais e examine célula e rede.",
      "Faça outra investigação com metal de estrutura diferente e compare os registros."
    ],
    "evidence": "Duas fichas de metais distintos com seus tipos estruturais e condições reportadas.",
    "reflection": "Sem um diagrama de fases, podemos concluir que a estrutura será igual em todas as temperaturas?"
  },
  {
    "id": "diversidade-bloco-d",
    "title": "Metais do bloco d: estruturas e usos",
    "sub": "28 elementos investigáveis",
    "description": "Explore desde ferro e cobre até metais refratários e nobres sem atribuir uma geometria única ao bloco d.",
    "idea": "A química do bloco d reúne estruturas CCC, CFC, HC e gerais, com comportamentos tecnológicos variados.",
    "observe": "Navegue pela geometria real de referência e separe objeto, composição e célula.",
    "interpret": "Estrutura, fonte e condições pertencem ao elemento, não ao nome da família como um todo.",
    "limits": "Não se calcula magnetismo do ferro, corrosão, temperatura de fusão ou dureza industrial pela cena.",
    "missions": [
      "bloco-d-diversidade"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "category:d-metal",
    "track": "familias",
    "problem": "Que diferenças de estrutura podem existir entre Fe, Cu, Ti e Mn?",
    "prediction": "Escolha dois metais do bloco d e antecipe diferenças de célula e coordenação.",
    "actions": [
      "Consulte o metal escolhido e registre o tipo de estrutura.",
      "Explore a missão Bloco d: diversidade estrutural.",
      "Compare com outro metal selecionado em nova investigação, observando as fontes."
    ],
    "evidence": "Dois registros com célula, tipo estrutural e ressalvas de interpretação.",
    "reflection": "Por que ferro metálico e aço não devem ser tratados como o mesmo material?"
  },
  {
    "id": "metais-bloco-p",
    "title": "Metais do bloco p: variedade cristalina",
    "sub": "Al, Sn, Tl, Pb, Bi e Po",
    "description": "Interprete estruturas CFC e gerais, incluindo fase de referência e alotropia.",
    "idea": "Metais do bloco p não compartilham obrigatoriamente um único tipo de rede cristalina.",
    "observe": "Investigue o metal de referência sem forçar o uso de uma célula cúbica para todos.",
    "interpret": "Condições da fonte definem a fase de referência; mudanças de fase não são simuladas.",
    "limits": "Amostras de polônio não devem ser manuseadas; o estudo é integralmente digital.",
    "missions": [
      "bloco-p-surpresas"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "category:p-metal",
    "track": "familias",
    "problem": "Por que o estanho e o bismuto exigem modelos diferentes do alumínio?",
    "prediction": "Antecipe quais informações além de a, b, c podem ser necessárias para descrever a célula.",
    "actions": [
      "Selecione um metal do bloco p e consulte sua ficha cristalográfica.",
      "Abra a missão Bloco p: metais e geometrias e observe a célula e a rede.",
      "Compare as condições e os modelos de outros dois metais em novas tentativas."
    ],
    "evidence": "Identificação fundamentada de ao menos duas geometrias presentes no bloco p.",
    "reflection": "Uma célula de referência de Sn prova qual fase está presente em uma peça real?"
  },
  {
    "id": "lantanideos-modelos",
    "title": "Lantanídeos e os limites da modelagem",
    "sub": "14 metais habilitados",
    "description": "Entenda dados documentais, elétrons coletivos e a diferença entre Nd puro e a liga Nd–Fe–B.",
    "idea": "Metais lantanídeos têm referências próprias. La, Pr e Nd ainda não têm rede liberada no SILM; seus elétrons podem ser representados qualitativamente em montagem livre.",
    "observe": "Examine a camada eletrônica e, quando habilitada, a estrutura do elemento selecionado.",
    "interpret": "O estado da rede e a disponibilidade de dados não são sinônimos de propriedades magnéticas.",
    "limits": "O SILM não calcula magnetismo, estrutura intermetálica Nd₂Fe₁₄B nem desempenho de ímãs.",
    "missions": [
      "lantanideos-eletrons",
      "lantanideos-estruturas"
    ],
    "routes": [
      "eletrons-metal"
    ],
    "selector": "category-all:lanthanide",
    "track": "familias",
    "problem": "Como trabalhar cientificamente com terras raras quando parte das redes ainda não está homologada?",
    "prediction": "Preveja o que um modelo de elétrons deslocalizados mostra e o que a ficha cristalográfica informa separadamente.",
    "actions": [
      "Escolha um lantanídeo e confira a disponibilidade de rede no próprio SILM.",
      "Para todos os 14 habilitados, realize a missão Lantanídeos: modelo eletrônico; use a missão de rede apenas se ela estiver disponível.",
      "Escreva a diferença entre material puro, liga tecnológica e dado efetivamente calculado."
    ],
    "evidence": "Registro do elemento com sua elegibilidade de rede, evidência eletrônica qualitativa e limite do modelo.",
    "reflection": "Por que uma imagem de alto-falante com ímã Nd–Fe–B não prova a estrutura do neodímio puro?"
  },
  {
    "id": "actinideos-ciencia",
    "title": "Actinídeos: estruturas e cautelas",
    "sub": "Referências cristalográficas",
    "description": "Aprenda a interpretar fontes estruturais de actinídeos sem manuseio de materiais.",
    "idea": "Ac, Th, Pa, Np, Pu e Am dispõem de referências diferentes, inclusive estruturas gerais complexas.",
    "observe": "Examine somente representações digitais da célula e da rede validadas no banco.",
    "interpret": "Dados de fase e geometria não fornecem radioatividade, segurança ou propriedades nucleares.",
    "limits": "Atividade exclusivamente virtual, sem ensaios físicos ou recomendações de manipulação.",
    "missions": [
      "actinideos-referencias"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "category:actinide",
    "track": "familias",
    "problem": "Quais informações cristalográficas podem ser estudadas sem lidar fisicamente com actinídeos?",
    "prediction": "Antecipe a dificuldade de representar uma rede a partir de operações de simetria gerais.",
    "actions": [
      "Selecione um dos actinídeos virtualmente habilitados.",
      "Consulte a missão Actinídeos no modelo cristalográfico.",
      "Anote a fonte dos parâmetros e o que não pode ser inferido do modelo."
    ],
    "evidence": "Identificação do elemento, tipo de estrutura e limite do método.",
    "reflection": "Por que a simulação da rede não mede radioatividade ou características nucleares?"
  },
  {
    "id": "investigacao-ccc",
    "title": "CCC: corpo, vértices e vizinhança",
    "sub": "15 metais com estrutura CCC",
    "description": "Investigue os centros compartilhados, o centro do corpo e a coordenação geométrica.",
    "idea": "A célula CCC contém centros nos vértices e no corpo, com geometria repetida pela rede.",
    "observe": "Navegue pelo centro e destaque os vizinhos imediatos.",
    "interpret": "Os centros mostrados nas bordas pertencem também às células adjacentes.",
    "limits": "A cena é uma rede ideal de referência; não representa defeitos e contornos experimentais.",
    "missions": [
      "ccc-coordenacao"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "type:CCC",
    "track": "estruturas",
    "problem": "O átomo do centro do corpo pertence a quais relações de vizinhança?",
    "prediction": "Preveja o que acontece com a coordenação ao navegar de uma célula à rede.",
    "actions": [
      "Escolha um metal com estrutura CCC homologada.",
      "Realize a missão CCC: vizinhos e repetição.",
      "Registre a vizinhança e a diferença entre átomos desenhados e centros efetivos."
    ],
    "evidence": "Descrição da geometria CCC, seus vizinhos e um parâmetro de referência.",
    "reflection": "A célula CCC significa sempre o mesmo tamanho de rede para metais diferentes?"
  },
  {
    "id": "investigacao-cfc",
    "title": "CFC: o papel das faces",
    "sub": "16 metais CFC",
    "description": "Analise centros de face, célula convencional e rede, sem confundir topologia com propriedade.",
    "idea": "A repetição CFC coloca centros também nas faces da célula convencional.",
    "observe": "Explore a vizinhança e identifique centros que atravessam os limites da célula.",
    "interpret": "A mesma topologia pode existir em metais com parâmetros e aplicações diferentes.",
    "limits": "Não se calcula condutividade ou cor pela geometria CFC isolada.",
    "missions": [
      "cfc-coordenacao"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "type:CFC",
    "track": "estruturas",
    "problem": "Como os centros de face contribuem para a organização coletiva do cristal?",
    "prediction": "Antecipe como se distribuem os vizinhos de um centro no interior da rede CFC.",
    "actions": [
      "Escolha um metal CFC e observe a célula unitária.",
      "Faça a missão CFC: faces e vizinhança, destacando centros próximos.",
      "Compare a ficha do metal com a de outro elemento CFC."
    ],
    "evidence": "Vistas da célula e da rede, com interpretação da coordenação.",
    "reflection": "Por que cobre, prata e ouro não possuem necessariamente a mesma resposta óptica?"
  },
  {
    "id": "investigacao-hc",
    "title": "HC: empilhamentos e parâmetros",
    "sub": "22 metais HC",
    "description": "Investigue as camadas hexagonais compactas e seus parâmetros de rede.",
    "idea": "A estrutura HC relaciona camadas de centros e parâmetros a e c, sem exigir c/a ideal para todos.",
    "observe": "Alterne célula, rede e vizinhança no metal escolhido.",
    "interpret": "A estrutura HC não é sinônimo de qualquer célula de base hexagonal.",
    "limits": "Transformações de fase, defeitos e comportamento mecânico específico não são calculados.",
    "missions": [
      "hc-coordenacao"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "type:HC",
    "track": "estruturas",
    "problem": "Como as camadas compactas participam da vizinhança de um centro?",
    "prediction": "Preveja onde aparecem centros próximos acima e abaixo de uma camada.",
    "actions": [
      "Selecione Mg, Ti, Zn ou outro metal com referência HC.",
      "Execute a missão HC: camadas compactas.",
      "Registre os parâmetros a e c e interprete a diferença entre desenho ideal e dado da fonte."
    ],
    "evidence": "Descrição de camada e vizinhos na estrutura HC de referência.",
    "reflection": "Uma relação c/a experimental distinta da ideal invalida o modelo de referência?"
  },
  {
    "id": "estruturas-nao-canonicas",
    "title": "Cristais além de CCC, CFC e HC",
    "sub": "Estruturas gerais",
    "description": "Estude células tetragonais, romboédricas, monoclínicas e outras geometrias do banco.",
    "idea": "Estruturas gerais podem exigir uma base de posições e operações de simetria; não são equivalentes a três modelos de esferas rígidas.",
    "observe": "Consulte célula e rede dos metais com geometria geral efetivamente homologada.",
    "interpret": "Ausência de fórmula canônica não significa ausência de dados cristalográficos.",
    "limits": "O empacotamento e a deformação do modelo canônico não são aplicados automaticamente.",
    "missions": [
      "estruturas-gerais"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "general",
    "track": "estruturas",
    "problem": "O que o SILM precisa saber além da forma exterior de uma célula para mostrar uma estrutura geral?",
    "prediction": "Preveja a importância de sítios fracionários e simetria.",
    "actions": [
      "Escolha uma estrutura geral disponível, como Mn ou Bi.",
      "Execute a missão Além das três células canônicas.",
      "Registre o tipo estrutural e os dados usados para construir a rede."
    ],
    "evidence": "Ligação explícita entre origem da ficha e visualização resultante.",
    "reflection": "Por que não usar a fórmula ideal de empacotamento CCC para uma rede monoclínica?"
  },
  {
    "id": "parametros-empacotamento",
    "title": "Parâmetros, volume e empacotamento",
    "sub": "Medir e Calcular com origem",
    "description": "Relacione parâmetros cristalográficos, volume e modelos geométricos, respeitando a disponibilidade de cada ferramenta.",
    "idea": "Uma grandeza geométrica precisa de fórmula, entradas e unidades de referência.",
    "observe": "Use instrumentos e cálculos apenas na estrutura compatível.",
    "interpret": "Fator de empacotamento e volume da célula não são densidade experimental ou fração de elétrons.",
    "limits": "Modelos gerais podem não oferecer empacotamento canônico; os valores não devem ser inventados.",
    "missions": [
      "empacotamento-referencias",
      "medidas-metais-leves",
      "volumes-metais-pesados"
    ],
    "routes": [
      "medindo-ordem",
      "volume-celula"
    ],
    "selector": "canonical",
    "track": "calculos",
    "problem": "Que dados tornam uma operação quantitativa válida e reprodutível?",
    "prediction": "Liste parâmetros, unidade e fonte antes de iniciar uma medida.",
    "actions": [
      "Escolha uma estrutura canônica, ative Medir e registre um parâmetro.",
      "Faça um cálculo de volume ou empacotamento apropriado.",
      "Compare os registros e descreva os limites das fórmulas usadas."
    ],
    "evidence": "Dois resultados com unidade, entradas e interpretação científica.",
    "reflection": "Por que um valor calculado a partir do modelo não substitui uma medição experimental de densidade?"
  },
  {
    "id": "conducao-na-oficina",
    "title": "Condução elétrica: observar não é medir",
    "sub": "Cu, Ag, Au e Al",
    "description": "Explore a aplicação do campo e do modelo de elétrons coletivos, distinguindo resposta visual e condutividade tabelada.",
    "idea": "A condutividade real depende de dados de material e condições; o campo da Oficina é qualitativo.",
    "observe": "Observe o controle elétrico e a camada eletrônica deslocalizada.",
    "interpret": "Uma animação não fornece condutividade, resistividade ou velocidade de deriva.",
    "limits": "O catálogo não fornece uma classificação quantitativa dos metais pela animação.",
    "missions": [
      "condutores-em-campo"
    ],
    "routes": [
      "eletrons-metal"
    ],
    "selector": "examples:29,47,79,13",
    "track": "propriedades",
    "problem": "Por que materiais condutores diferentes podem ter aplicações industriais distintas?",
    "prediction": "Preveja o que mudará na cena quando o campo for aplicado.",
    "actions": [
      "Prepare Cu, Ag, Au ou Al, e localize o modelo eletrônico.",
      "Realize a missão Cobre, prata, ouro e alumínio.",
      "Anote o que foi representado, quais dados científicos existem e quais permanecem ausentes."
    ],
    "evidence": "Resposta visual a campo elétrico e declaração dos limites quantitativos.",
    "reflection": "Que medidas seriam necessárias para afirmar que um desses metais conduz melhor?"
  },
  {
    "id": "termica-na-oficina",
    "title": "Condução térmica: propagação didática",
    "sub": "Calor e rede",
    "description": "Estude a propagação por vizinhanças sem deduzir condutividade numérica das animações.",
    "idea": "O motor usa coeficiente didático comum e etapas discretas; não modela uma amostra real.",
    "observe": "Ative a fonte térmica e acompanhe a progressão na rede.",
    "interpret": "A aparência da cena não mede fluxo, difusividade nem tempo físico do elemento.",
    "limits": "Não comparar taxas entre metais como se fossem condutividades térmicas tabeladas.",
    "missions": [
      "calor-metalico"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "examples:29,47,13,12,26,22,74",
    "track": "propriedades",
    "problem": "O que representa o avanço de uma frente térmica na rede esquemática?",
    "prediction": "Descreva qualitativamente como energia pode passar entre regiões próximas.",
    "actions": [
      "Escolha um metal com estrutura térmica habilitada.",
      "Faça a missão Energia atravessando a rede e avance uma etapa de calor.",
      "Desative a fonte e interprete o que a vista ainda não consegue quantificar."
    ],
    "evidence": "Uma observação do aquecimento e suas hipóteses de modelagem.",
    "reflection": "Por que a simulação não determina a temperatura real de uma peça aquecida?"
  },
  {
    "id": "brilho-e-superficies",
    "title": "Brilho metálico e superfície",
    "sub": "Luz, reflexão e materiais",
    "description": "Investigue um feixe óptico na representação sem atribuir cor ou refletância não calculadas.",
    "idea": "Reflexão geométrica é diferente da resposta espectral responsável por cor e aparência do metal.",
    "observe": "Acione a iluminação e relacione incidência e reflexão.",
    "interpret": "O feixe mostra uma regra geométrica que não é exclusiva dos metais.",
    "limits": "Não se calcula cor do ouro, rugosidade, oxidação, polarização ou percentual de luz refletida.",
    "missions": [
      "brilho-com-luz"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "examples:79,47,29,13,78",
    "track": "propriedades",
    "problem": "Por que a aparência de uma superfície não é explicada apenas por uma seta refletida?",
    "prediction": "Preveja a trajetória do feixe quando a iluminação é ativada.",
    "actions": [
      "Escolha um metal habilitado para a experiência óptica.",
      "Realize a missão Brilho: reflexão e limites.",
      "Interprete as trajetórias e descreva dados físicos que faltariam para comparar cores de metais."
    ],
    "evidence": "Relação entre luz incidente, feixe refletido e os limites do esquema.",
    "reflection": "O que distingue reflexão especular de uma propriedade óptica quantitativa do metal?"
  },
  {
    "id": "propriedades-mecanicas",
    "title": "Lâminas, fios e deformação",
    "sub": "Maleabilidade e ductilidade",
    "description": "Diferencie compressão e alongamento em representações didáticas de metais com estruturas canônicas.",
    "idea": "A imagem descreve movimentos coletivos simplificados, não o limite mecânico de uma liga comercial.",
    "observe": "Acione separadamente maleabilidade ou ductilidade e observe a transformação.",
    "interpret": "O mecanismo didático é diferente de medições de tensão, deformação e fratura.",
    "limits": "Não se prevê comportamento mecânico individual dos 65 metais nem propriedades de ligas.",
    "missions": [
      "laminas-maleabilidade",
      "fios-ductilidade"
    ],
    "routes": [
      "deformacao-metal"
    ],
    "selector": "examples:29,13,47,79,28,78",
    "track": "propriedades",
    "problem": "Por que uma lâmina e um fio precisam de explicações mecânicas diferentes?",
    "prediction": "Preveja como a forma deve mudar sob compressão e sob tração.",
    "actions": [
      "Escolha um metal com experiência mecânica habilitada.",
      "Realize uma missão de compressão; em outra tentativa, realize a de alongamento.",
      "Compare a representação e os limites científicos de cada operação."
    ],
    "evidence": "Descrição separada dos dois mecanismos sem números de resistência inventados.",
    "reflection": "Por que maleabilidade não deve ser confundida com módulo elástico ou ductilidade numérica?"
  },
  {
    "id": "travessia-investigativa",
    "title": "Do objeto ao centro metálico",
    "sub": "Quatro escalas para metais habilitados",
    "description": "Investigue objeto, grãos, rede e centro sem fingir uma ampliação experimental contínua.",
    "idea": "Cada escala é um modelo com pergunta própria e não uma fotografia do mesmo material sucessivamente ampliada.",
    "observe": "Use a travessia entre as quatro escalas e destaque a vizinhança de um centro.",
    "interpret": "A geometria de referência é do elemento; a microestrutura da figura é esquemática.",
    "limits": "Metais sem estrutura homologada não podem completar as etapas Rede e Centro.",
    "missions": [
      "travessia-metais",
      "objeto-ao-centro"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "all-crystalline",
    "track": "aplicacoes",
    "problem": "O que cada escala permite investigar sobre o material de uma aplicação?",
    "prediction": "Organize perguntas próprias para Objeto, Grãos, Rede e Centro.",
    "actions": [
      "Escolha um metal cuja rede esteja homologada.",
      "Execute Quatro escalas, muitos metais, passando por todas as representações.",
      "Interprete o que foi observado e compare com um segundo elemento em nova investigação."
    ],
    "evidence": "Registro da passagem real pelas quatro escalas, da vizinhança e da limitação do material ilustrado.",
    "reflection": "Como a escala de estudo muda sem que o desenho determine a microestrutura exata do objeto?"
  }
];
 const metalType=z=>{const e=S.data.get(z);return e?.structures?.find(x=>x.id===e.referenceStructure)?.type||null;};
 const selectMetals=selector=>{
  const all=S.data.elements.filter(e=>e.silmEligibility.status==='available').map(e=>e.atomicNumber);
  const solid=all.filter(z=>S.crystal.eligibility(S.data.get(z)).status==='available');
  let ids=[];
  if(selector==='canonical')ids=solid.filter(z=>!S.crystal.eligibility(S.data.get(z)).general);
  else if(selector==='general')ids=solid.filter(z=>S.crystal.eligibility(S.data.get(z)).general);
  else if(selector==='all-crystalline')ids=solid;
  else if(selector.startsWith('type:'))ids=solid.filter(z=>metalType(z)===selector.slice(5));
  else if(selector.startsWith('category-all:'))ids=all.filter(z=>S.data.get(z).classification.category===selector.slice(13));
  else if(selector.startsWith('category:'))ids=solid.filter(z=>S.data.get(z).classification.category===selector.slice(9));
  else if(selector.startsWith('examples:'))ids=selector.slice(9).split(',').map(Number).filter(z=>solid.includes(z));
  else throw Error('Seletor de tema desconhecido: '+selector);
  return [...new Set(ids)].sort((a,b)=>a-b);
 };
 for(const spec of EXPANDED_THEMES){
  const metals=selectMetals(spec.selector);
  if(!metals.length)throw Error('Tema sem metal elegível: '+spec.id);
  const theme=make(spec.id,spec.title,spec.sub,spec.description,spec.idea,spec.observe,spec.interpret,spec.limits,spec.missions,spec.routes,metals);
  theme.category=spec.track;
  theme.investigation={problem:spec.problem,prediction:spec.prediction,actions:spec.actions,evidence:spec.evidence,reflection:spec.reflection};
  list.push(theme);
 }

 for(const theme of list){
  const study=INVESTIGATIONS[theme.id]||theme.investigation;
  if(!study||!study.problem||!study.prediction||!Array.isArray(study.actions)||study.actions.length<2||!study.evidence||!study.reflection)throw Error('Percurso do tema ausente: '+theme.id);
  theme.investigation=study;
 }
 function validate(themes=list,missions=S.missions.registry){
  if(!Array.isArray(themes)||!Array.isArray(missions))return {ok:false,reason:'REGISTRY_INVALID'};const ids=new Set(),missionIds=new Set(missions.map(m=>m.id));
  for(const t of themes){if(!t?.id||ids.has(t.id)||!t.title||!t.subtitle||!t.concepts?.length||t.concepts.some(c=>!c.title||!c.text))return {ok:false,reason:'THEME_INVALID'};ids.add(t.id);if(!Array.isArray(t.relatedMissions)||t.relatedMissions.some(id=>!missionIds.has(id))||!Array.isArray(t.relatedRoutes)||t.relatedRoutes.some(id=>!S.routes.get(id))||!t.sources?.length||t.sources.some(id=>!S.data.source(id))||t.relatedMetals.some(z=>S.data.get(z)?.silmEligibility.status!=='available'))return {ok:false,reason:'REFERENCE_INVALID'};}
  for(const m of missions)if(!m.relatedThemes?.length||m.relatedThemes.some(id=>!ids.has(id)))return {ok:false,reason:'MISSION_THEME_INVALID'};
  return {ok:true};
 }
 const checked=validate();if(!checked.ok)throw Error('Temas inválidos: '+checked.reason);
 const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
 S.themes=Object.freeze({registry:freeze(list),get:id=>list.find(t=>t.id===id),validate});
})();
