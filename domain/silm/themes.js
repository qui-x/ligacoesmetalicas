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
 INVESTIGATIONS['cobre-neodimio']={"problem":"Por que o cobre de um enrolamento e um ímã permanente Nd–Fe–B exigem explicações diferentes, embora ambos envolvam materiais metálicos?","prediction":"Antes de investigar, diferencie o metal puro (Cu ou Nd), a peça do objeto e o material de liga. Preveja quais modelos cristalográficos o SILM pode mostrar.","actions":["Explore um exemplo de cobre no Objeto e atravesse as escalas até a rede e o centro; registre a estrutura cristalina de referência e a função do componente.","Conclua ou encerre essa investigação antes de preparar o neodímio. Em outra investigação, selecione Nd e examine a ficha, o objeto ilustrativo e a representação eletrônica disponível; a rede do neodímio ainda não está homologada.","Compare os registros, indicando explicitamente quais ações estavam habilitadas em Cu e quais não estavam em Nd, e por que a liga Nd–Fe–B não é o metal puro."],"evidence":"Apresente dois registros: em Cu, identifique a estrutura de referência; em Nd, identifique a ficha e a indisponibilidade da rede, sem atribuir a propriedade magnética da liga ao elemento puro.","reflection":"Por que a elevada condutividade do cobre não basta para explicar a função de um ímã Nd–Fe–B? Quais dados e técnicas seriam necessários para discutir o magnetismo da liga?"};
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
 const EXPANDED_THEMES=
[
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
  },
  {
    "id": "metais-nobres-conducao",
    "title": "Condutores nobres: Cu, Ag e Au",
    "sub": "Cu · Ag · Au",
    "description": "Condutores, contatos e revestimentos podem utilizar Cu, Ag ou Au por motivos diferentes. A estrutura cristalina não substitui dados elétricos, químicos ou de superfície.",
    "idea": "Os três metais têm estrutura de referência CFC, mas composição, aplicação, superfície e propriedades não podem ser inferidas apenas da célula.",
    "observe": "Selecione o elemento no catálogo da Oficina e execute a missão Cobre, Prata e Ouro: a mesma rede?.",
    "interpret": "Explicar semelhanças da vizinhança geométrica sem declarar condutividades numéricas inexistentes.",
    "limits": "O SILM não mede resistência de contato, corrosão ou qualidade de revestimentos; propriedades quantitativas requerem fonte e condições verificadas.",
    "missions": [
      "cobre-prata-ouro"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "examples:29,47,79",
    "track": "aplicacoes",
    "problem": "Cobre, prata e ouro têm estrutura de referência CFC. Isso basta para dizer que seus usos e propriedades são idênticos?",
    "prediction": "Preveja o padrão de vizinhança que deve aparecer nos três modelos CFC e uma propriedade que a geometria sozinha não determina.",
    "actions": [
      "Escolha um dos metais Cu · Ag · Au e identifique no catálogo sua estrutura de referência.",
      "Execute a missão Cobre, Prata e Ouro: a mesma rede?, registrando as evidências exigidas na Oficina.",
      "Em outra investigação, selecione um segundo metal do conjunto e compare o tipo de célula, as fontes e as limitações do modelo."
    ],
    "evidence": "Destaque célula, rede e vizinhos em um dos metais; depois compare os parâmetros e referências dos demais em investigações separadas.",
    "reflection": "Quais características geométricas são comuns e quais parâmetros ainda variam entre Cu, Ag e Au? Por que a escolha de um contato elétrico depende também de superfície, custo e condições de uso?"
  },
  {
    "id": "ferro-cobalto-niquel-estruturas",
    "title": "Fe, Co e Ni: estrutura não é magnetismo",
    "sub": "Fe · Co · Ni",
    "description": "Nas condições de referência do banco, Fe é CCC, Co é HC e Ni é CFC. O simulador investiga geometria, não magnetização do material.",
    "idea": "Fe, Co e Ni possuem redes diferentes na referência, apesar de associações tecnológicas frequentes com fenômenos magnéticos.",
    "observe": "Selecione o elemento no catálogo da Oficina e execute a missão Ferro, Cobalto e Níquel: três redes.",
    "interpret": "Diferenciar estrutura cristalina e propriedades magnéticas que dependem de outras teorias e dados.",
    "limits": "O SILM não simula domínios, magnetização, histerese nem transformações de fase por temperatura.",
    "missions": [
      "ferro-cobalto-niquel"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "examples:26,27,28",
    "track": "estruturas",
    "problem": "Fe, Co e Ni aparecem em aplicações magnéticas; por que suas estruturas cristalinas de referência não são todas iguais?",
    "prediction": "Preveja como a disposição dos centros pode diferir entre CCC, HC e CFC antes de abrir as três células.",
    "actions": [
      "Escolha um dos metais Fe · Co · Ni e identifique no catálogo sua estrutura de referência.",
      "Execute a missão Ferro, Cobalto e Níquel: três redes, registrando as evidências exigidas na Oficina.",
      "Em outra investigação, selecione um segundo metal do conjunto e compare o tipo de célula, as fontes e as limitações do modelo."
    ],
    "evidence": "Compare a célula e a repetição da rede com Fe, Co ou Ni, e documente a estrutura homologada do metal selecionado.",
    "reflection": "Que diferença cristalográfica o SILM mostra entre Fe, Co e Ni? Por que uma representação de rede não comprova ferromagnetismo ou curvas de histerese?"
  },
  {
    "id": "aluminio-cobre-componentes",
    "title": "Alumínio e Cobre no cotidiano",
    "sub": "Al · Cu",
    "description": "Al e Cu podem aparecer como componentes elétricos e estruturais. O objeto completo pode conter ligas, isolantes, conectores e outros metais.",
    "idea": "Al e Cu podem compartilhar estrutura CFC de referência e, ainda assim, representar papéis diferentes no projeto de um produto.",
    "observe": "Selecione o elemento no catálogo da Oficina e execute a missão Alumínio ou Cobre: componentes distintos.",
    "interpret": "Diferenciar semelhança cristalográfica, identidade do elemento e aplicação de um componente.",
    "limits": "Não se calculam composição industrial nem desempenho de cabos ou ligas a partir de ilustração e rede do elemento.",
    "missions": [
      "aluminio-cobre"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "examples:13,29",
    "track": "aplicacoes",
    "problem": "Por que objetos podem utilizar alumínio ou cobre mesmo quando ambos têm rede CFC?",
    "prediction": "Preveja uma semelhança geométrica dos metais puros e duas informações da aplicação que não estão codificadas na célula.",
    "actions": [
      "Escolha um dos metais Al · Cu e identifique no catálogo sua estrutura de referência.",
      "Execute a missão Alumínio ou Cobre: componentes distintos, registrando as evidências exigidas na Oficina.",
      "Em outra investigação, selecione um segundo metal do conjunto e compare o tipo de célula, as fontes e as limitações do modelo."
    ],
    "evidence": "Explore a célula CFC e os vizinhos; registre o elemento e o componente do objeto correspondente, sem supor pureza.",
    "reflection": "A célula cristalina do alumínio determina sozinha a massa e a função de um cabo? Por que distinguir metal puro, liga, peça e produto completo?"
  },
  {
    "id": "trio-titanio-zirconio-hafnio",
    "title": "Ti, Zr e Hf: mesma classe, parâmetros distintos",
    "sub": "Ti · Zr · Hf",
    "description": "Ti, Zr e Hf são elementos distintos e possuem referências HC no banco. Partilhar um tipo de célula não torna iguais as distâncias cristalográficas.",
    "idea": "Os três metais têm estrutura HC de referência, mas cada estrutura utiliza parâmetros próprios de origem documentada.",
    "observe": "Selecione o elemento no catálogo da Oficina e execute a missão Titânio, Zircônio e Háfnio: redes HC.",
    "interpret": "Comparar parâmetros em unidades físicas, não comprimentos aparentes no monitor.",
    "limits": "As medidas pertencem às estruturas de referência, não a uma peça tratada termicamente ou a uma liga real.",
    "missions": [
      "titanio-zirconio-hafnio"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "examples:22,40,72",
    "track": "estruturas",
    "problem": "Três metais com referência HC apresentam o mesmo parâmetro de rede?",
    "prediction": "Preveja se a coordenada visual e o parâmetro a serão invariantes ao trocar de metal, mantendo o mesmo tipo de estrutura.",
    "actions": [
      "Escolha um dos metais Ti · Zr · Hf e identifique no catálogo sua estrutura de referência.",
      "Execute a missão Titânio, Zircônio e Háfnio: redes HC, registrando as evidências exigidas na Oficina.",
      "Em outra investigação, selecione um segundo metal do conjunto e compare o tipo de célula, as fontes e as limitações do modelo."
    ],
    "evidence": "Meça o parâmetro a de um metal; repita em investigação independente para outro e registre unidade e origem dos dados.",
    "reflection": "O que permanece igual ao usar a classe HC em três elementos? Por que não basta comparar o tamanho dos ícones na tela para inferir distâncias físicas?"
  },
  {
    "id": "refratarios-ccc-rede",
    "title": "Cr, Mo e W: estruturas de metais refratários",
    "sub": "Cr · Mo · W",
    "description": "Cr, Mo e W compartilham uma estrutura de referência CCC no conjunto de dados, mas aplicações em temperaturas elevadas exigem informações que uma geometria estática não oferece.",
    "idea": "A estrutura CCC é um ponto de comparação geométrica; aplicações de engenharia exigem propriedades e condições adicionais.",
    "observe": "Selecione o elemento no catálogo da Oficina e execute a missão Cromo, Molibdênio e Tungstênio: CCC.",
    "interpret": "Concluir somente sobre simetria e vizinhança documentadas no modelo.",
    "limits": "Não se simulam temperatura de fusão, fluência, oxidação nem desempenho de componentes industriais.",
    "missions": [
      "cromo-molibdenio-tungstenio"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "examples:24,42,74",
    "track": "estruturas",
    "problem": "Quais relações estruturais aproximam Cr, Mo e W e o que a rede CCC não explica?",
    "prediction": "Preveja a distribuição de vizinhos em uma rede CCC e uma propriedade térmica que não se mede com esse recurso.",
    "actions": [
      "Escolha um dos metais Cr · Mo · W e identifique no catálogo sua estrutura de referência.",
      "Execute a missão Cromo, Molibdênio e Tungstênio: CCC, registrando as evidências exigidas na Oficina.",
      "Em outra investigação, selecione um segundo metal do conjunto e compare o tipo de célula, as fontes e as limitações do modelo."
    ],
    "evidence": "Identifique célula, rede e vizinhança e anote o metal e o modelo, sem transformar o desenho em um ensaio térmico.",
    "reflection": "O que a coordenação CCC informa em cada um desses metais? Por que resistência à temperatura e processamento não podem ser deduzidos de CCC?"
  },
  {
    "id": "niobio-tantalo-ccc",
    "title": "Nióbio e Tântalo: estrutura e medida",
    "sub": "Nb · Ta",
    "description": "O nióbio e o tântalo são usados em materiais tecnológicos por razões específicas, mas o estudo atual se limita ao arranjo de referência de cada elemento.",
    "idea": "Metais que compartilham estrutura cristalina devem ser comparados com parâmetros de referência próprios.",
    "observe": "Selecione o elemento no catálogo da Oficina e execute a missão Nióbio e Tântalo: vizinhos na rede.",
    "interpret": "Comparar dados de medida sem extrapolar para tecnologias não modeladas.",
    "limits": "O SILM não reproduz dispositivos supercondutores, capacitores, condições extremas ou composição comercial.",
    "missions": [
      "niobio-tantalo"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "examples:41,73",
    "track": "estruturas",
    "problem": "Nb e Ta compartilham rede CCC: seus parâmetros de rede precisam ser iguais?",
    "prediction": "Preveja se a é um valor inerente ao tipo CCC ou se deve ser consultado em cada metal.",
    "actions": [
      "Escolha um dos metais Nb · Ta e identifique no catálogo sua estrutura de referência.",
      "Execute a missão Nióbio e Tântalo: vizinhos na rede, registrando as evidências exigidas na Oficina.",
      "Em outra investigação, selecione um segundo metal do conjunto e compare o tipo de célula, as fontes e as limitações do modelo."
    ],
    "evidence": "Meça o parâmetro a com a estrutura organizada e confira a referência do metal; faça uma segunda tentativa com outro elemento.",
    "reflection": "O que significa medir uma constante de rede em vez de uma distância na imagem? Quais informações de aplicação ainda faltam para comparar componentes feitos de Nb e Ta?"
  },
  {
    "id": "grupo-platina-cfc",
    "title": "Metais do grupo da platina",
    "sub": "Rh · Pd · Ir · Pt",
    "description": "Ródio, paládio, irídio e platina são representados com rede CFC de referência, mas catálise e durabilidade de materiais não são simuladas pela geometria.",
    "idea": "Os modelos de Rh, Pd, Ir e Pt compartilham estrutura CFC, mas não se confundem em composição e propriedades.",
    "observe": "Selecione o elemento no catálogo da Oficina e execute a missão Ródio, Paládio, Irídio e Platina.",
    "interpret": "Distinguir parâmetro estrutural de processos de superfície e catálise.",
    "limits": "Nenhuma reação de catálise, adsorção química ou resistência à corrosão é calculada nesta missão.",
    "missions": [
      "platinoides-cfc"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "examples:45,46,77,78",
    "track": "estruturas",
    "problem": "Como quatro elementos tecnologicamente distintos podem compartilhar uma rede CFC?",
    "prediction": "Preveja a vizinhança CFC e compare com o comportamento de outro metal da mesma classe estrutural.",
    "actions": [
      "Escolha um dos metais Rh · Pd · Ir · Pt e identifique no catálogo sua estrutura de referência.",
      "Execute a missão Ródio, Paládio, Irídio e Platina, registrando as evidências exigidas na Oficina.",
      "Em outra investigação, selecione um segundo metal do conjunto e compare o tipo de célula, as fontes e as limitações do modelo."
    ],
    "evidence": "Destaque a célula, sua repetição e o centro com vizinhos, documentando elemento e fonte de referência.",
    "reflection": "O que o arranjo CFC revela sobre a vizinhança imediata? Por que esse arranjo não explica isoladamente uma atividade catalítica?"
  },
  {
    "id": "zinco-cadmio-hc",
    "title": "Zn e Cd: a rede não revela a segurança",
    "sub": "Zn · Cd",
    "description": "Zinco e cádmio apresentam estruturas HC de referência; propriedades toxicológicas, controle de exposição e aplicações práticas exigem fontes independentes da simulação.",
    "idea": "A estrutura HC é comparável, mas identidade química e riscos materiais não se inferem de geometria cristalina.",
    "observe": "Selecione o elemento no catálogo da Oficina e execute a missão Zinco e Cádmio: HC com cautelas.",
    "interpret": "Manter a discussão no domínio da estrutura, remetendo segurança a protocolos especializados.",
    "limits": "Atividade somente virtual. Não há avaliação toxicológica, corrosão, contaminação nem indicação de segurança laboratorial.",
    "missions": [
      "zinco-cadmio"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "examples:30,48",
    "track": "estruturas",
    "problem": "A mesma classe de rede HC significa usos e riscos equivalentes para Zn e Cd?",
    "prediction": "Preveja a coordenação da célula HC e descreva por que a presença da mesma rede não determina segurança de materiais.",
    "actions": [
      "Escolha um dos metais Zn · Cd e identifique no catálogo sua estrutura de referência.",
      "Execute a missão Zinco e Cádmio: HC com cautelas, registrando as evidências exigidas na Oficina.",
      "Em outra investigação, selecione um segundo metal do conjunto e compare o tipo de célula, as fontes e as limitações do modelo."
    ],
    "evidence": "Observe a célula, a rede e a vizinhança de um dos metais e registre a composição do modelo selecionado.",
    "reflection": "O que é semelhante nas representações HC de Zn e Cd? Por que o simulador não deve ser usado para decidir práticas de manuseio de cádmio?"
  },
  {
    "id": "estanho-bismuto-nao-canonicos",
    "title": "Sn e Bi: tetragonal e romboédrica",
    "sub": "Sn · Bi",
    "description": "A referência selecionada para Sn é tetragonal e para Bi é romboédrica, de modo que forçar uma célula canônica em qualquer um deles seria incorreto.",
    "idea": "Alguns metais fogem às geometrias CCC, CFC e HC; o tipo de célula deve seguir o registro científico.",
    "observe": "Selecione o elemento no catálogo da Oficina e execute a missão Estanho e Bismuto: além dos três modelos.",
    "interpret": "Explicar diferenças geométricas sem generalizar empacotamentos das estruturas canônicas.",
    "limits": "A missão não calcula transformações alotrópicas por temperatura nem perfis de solidificação de ligas.",
    "missions": [
      "estanho-bismuto"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "examples:50,83",
    "track": "estruturas",
    "problem": "O que se perde ao tentar descrever estanho e bismuto apenas por CCC, CFC ou HC?",
    "prediction": "Preveja diferenças de forma de célula e de repetição entre a estrutura tetragonal e a romboédrica.",
    "actions": [
      "Escolha um dos metais Sn · Bi e identifique no catálogo sua estrutura de referência.",
      "Execute a missão Estanho e Bismuto: além dos três modelos, registrando as evidências exigidas na Oficina.",
      "Em outra investigação, selecione um segundo metal do conjunto e compare o tipo de célula, as fontes e as limitações do modelo."
    ],
    "evidence": "Observe a célula e a rede do elemento e compare seu tipo com o de outro metal em uma nova investigação.",
    "reflection": "Qual é a referência cristalográfica usada para Sn ou Bi? Por que não aplicar automaticamente o empacotamento ideal de uma estrutura CFC a esses modelos?"
  },
  {
    "id": "lantanideos-dhcp",
    "title": "La, Pr e Nd: o que o simulador permite observar",
    "sub": "La · Pr · Nd · limites da estrutura DHCP",
    "description": "Estude o modelo eletrônico de La, Pr e Nd e diferencie os dados DHCP documentados das redes ainda não homologadas na Oficina.",
    "idea": "Os registros podem descrever estruturas DHCP, mas a existência de dados de referência não libera automaticamente a montagem cristalográfica interativa.",
    "observe": "Acompanhe a visualização eletrônica coletiva e seus controles de visibilidade no modo livre.",
    "interpret": "Distinguir referência cristalográfica documental, modelo eletrônico qualitativo e interação de rede implementada.",
    "limits": "Não há rede, coordenação ou parâmetro cristalográfico interativo homologado para La, Pr e Nd; o magnetismo da liga Nd–Fe–B não é calculado.",
    "missions": [
      "lantanideos-dhcp"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "available-examples:57,59,60",
    "track": "familias",
    "problem": "Como estudar três lantanídeos sem interpretar dados DHCP como uma rede acessível no SILM?",
    "prediction": "Preveja o que a camada de elétrons representa, mesmo quando a estrutura cristalina não está habilitada.",
    "actions": [
      "Selecione La, Pr ou Nd no catálogo de metais disponíveis.",
      "Inicie a missão Lantânio, Praseodímio e Neodímio: elétrons e compare as camadas visíveis e ocultas.",
      "Interprete o que a representação eletrônica permite concluir e por que a rede DHCP ainda não está acessível."
    ],
    "evidence": "Registro da ativação e ocultação da representação eletrônica e explicitação dos limites da rede não homologada.",
    "reflection": "Por que a visualização de elétrons em La, Pr e Nd não comprova estrutura de liga Nd–Fe–B ou resposta magnética?"
  },
  {
    "id": "diversidade-lantanideos",
    "title": "Lantanídeos não têm uma única rede",
    "sub": "Ce · Sm · Gd · Tb · Dy · Yb",
    "description": "O conjunto de referências apresenta Ce e Yb como CFC, Sm como romboédrico e Gd, Tb e Dy como HC; a classe química não fixa uma única geometria.",
    "idea": "Os lantanídeos investigáveis incluem estruturas HC, CFC, DHCP e romboédricas, dependendo do elemento e da referência.",
    "observe": "Selecione o elemento no catálogo da Oficina e execute a missão Lantanídeos: HC, CFC e romboédrica.",
    "interpret": "Comparar as referências do banco sem afirmar que uma família inteira apresenta o mesmo arranjo.",
    "limits": "Não há simulação de terras raras como ligas, ímãs ou estados eletrônicos f quantitativos.",
    "missions": [
      "lantanideos-diversos"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "examples:58,62,64,65,66,70",
    "track": "familias",
    "problem": "Por que não podemos atribuir a todos os lantanídeos uma única célula unitária?",
    "prediction": "Antes de escolher o elemento, preveja quais tipos de rede aparecerão e quais limites de comparação persistem.",
    "actions": [
      "Escolha um dos metais Ce · Sm · Gd · Tb · Dy · Yb e identifique no catálogo sua estrutura de referência.",
      "Execute a missão Lantanídeos: HC, CFC e romboédrica, registrando as evidências exigidas na Oficina.",
      "Em outra investigação, selecione um segundo metal do conjunto e compare o tipo de célula, as fontes e as limitações do modelo."
    ],
    "evidence": "Observe a célula e a rede do elemento escolhido e compare classificações em mais de uma investigação.",
    "reflection": "Quais variações estruturais são registradas entre os lantanídeos selecionados? Por que a rede não prediz automaticamente o comportamento magnético ou óptico de materiais comerciais?"
  },
  {
    "id": "actinideos-diversidade",
    "title": "Actinídeos e estruturas não canônicas",
    "sub": "Th · Pa · Np · Pu",
    "description": "Th, Pa, Np e Pu têm referências de estruturas diferentes no banco. O tema é estritamente de leitura virtual e interpretação geométrica.",
    "idea": "Th, Pa, Np e Pu mostram diversidade de formas de célula e evidenciam os limites das classificações simplificadas.",
    "observe": "Selecione o elemento no catálogo da Oficina e execute a missão Tório, Protactínio, Netúnio e Plutônio.",
    "interpret": "Comparar somente modelos e dados de referência, sem extrapolar para protocolos experimentais de radionuclídeos.",
    "limits": "O SILM não reproduz radioatividade, segurança radiológica, reatividade nem transformações metalúrgicas. Não é instrução de manipulação.",
    "missions": [
      "actinideos-estruturas"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "examples:90,91,93,94",
    "track": "familias",
    "problem": "Por que os actinídeos requerem referências cristalográficas específicas em vez de um único modelo de rede?",
    "prediction": "Preveja por que a diversidade de redes exige modelos não canônicos além dos exemplos cúbicos usuais.",
    "actions": [
      "Escolha um dos metais Th · Pa · Np · Pu e identifique no catálogo sua estrutura de referência.",
      "Execute a missão Tório, Protactínio, Netúnio e Plutônio, registrando as evidências exigidas na Oficina.",
      "Em outra investigação, selecione um segundo metal do conjunto e compare o tipo de célula, as fontes e as limitações do modelo."
    ],
    "evidence": "Selecione apenas uma referência virtual, observe a célula e a rede e identifique a classe estrutural.",
    "reflection": "Que informações de estrutura o banco disponibiliza para o actinídeo selecionado? Por que a investigação virtual não corresponde a um procedimento físico com material radioativo?"
  },
  {
    "id": "formas-incomuns-metalicas",
    "title": "Células incomuns: Mn e Po",
    "sub": "Mn · Po",
    "description": "A referência de Mn é cúbica complexa, enquanto Po tem uma referência cúbica simples. Semelhança no adjetivo cúbico não implica a mesma rede.",
    "idea": "Estruturas cúbicas podem ter bases e padrões de repetição diferentes, como mostram Mn e Po.",
    "observe": "Selecione o elemento no catálogo da Oficina e execute a missão Manganês e Polônio: redes incomuns.",
    "interpret": "Não substituir a geometria complexa por um arranjo de esferas simples nem deduzir segurança de material.",
    "limits": "Polônio é radioativo: este é um estudo documental virtual, sem orientações de obtenção/manuseio. O SILM não calcula radioatividade.",
    "missions": [
      "manganes-polonio"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "examples:25,84",
    "track": "estruturas",
    "problem": "Por que uma estrutura cúbica complexa não é equivalente a uma cúbica simples?",
    "prediction": "Preveja o que muda na célula e na repetição quando a base cristalográfica é diferente.",
    "actions": [
      "Escolha um dos metais Mn · Po e identifique no catálogo sua estrutura de referência.",
      "Execute a missão Manganês e Polônio: redes incomuns, registrando as evidências exigidas na Oficina.",
      "Em outra investigação, selecione um segundo metal do conjunto e compare o tipo de célula, as fontes e as limitações do modelo."
    ],
    "evidence": "Compare visualmente célula e rede de Mn ou Po e registre o tipo estrutural, sem calcular fatores canônicos automaticamente.",
    "reflection": "Que informação é ocultada quando chamamos ambas as estruturas apenas de cúbicas? Por que a demonstração de polônio deve ser exclusivamente virtual?"
  },
  {
    "id": "cfc-familias-diferentes",
    "title": "CFC além das famílias químicas",
    "sub": "Al · Ca · Sr · Pb",
    "description": "Os elementos Al, Ca, Sr e Pb têm referência CFC, embora pertençam a categorias químicas diferentes e exijam informações distintas para discutir segurança e aplicações.",
    "idea": "Uma estrutura cristalina pode aparecer em elementos de famílias distintas sem determinar sua identidade e comportamento químico.",
    "observe": "Selecione o elemento no catálogo da Oficina e execute a missão Uma rede CFC em quatro famílias.",
    "interpret": "Contrastar estrutura CFC, classificação periódica e limites de aplicações.",
    "limits": "A representação cristalina não avalia reatividade, toxicidade nem propriedades mecânicas de ligas e peças.",
    "missions": [
      "cfc-diferentes-familias"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "examples:13,20,38,82",
    "track": "familias",
    "problem": "Al, Ca, Sr e Pb compartilham CFC: por que isso não os transforma em metais equivalentes?",
    "prediction": "Preveja o que a coordenação local terá em comum e que dados químicos continuarão específicos de cada elemento.",
    "actions": [
      "Escolha um dos metais Al · Ca · Sr · Pb e identifique no catálogo sua estrutura de referência.",
      "Execute a missão Uma rede CFC em quatro famílias, registrando as evidências exigidas na Oficina.",
      "Em outra investigação, selecione um segundo metal do conjunto e compare o tipo de célula, as fontes e as limitações do modelo."
    ],
    "evidence": "Observe a célula, repita a rede e destaque os vizinhos para o metal escolhido; compare uma segunda referência separadamente.",
    "reflection": "A mesma célula torna semelhantes as propriedades químicas de Ca e Pb? Qual a diferença entre classificação periódica e tipo de rede?"
  },
  {
    "id": "magnesio-aluminio-estruturas",
    "title": "Mg e Al: redes de metais leves",
    "sub": "Mg · Al",
    "description": "Mg possui referência HC e Al referência CFC. Componentes com esses elementos podem incluir ligas e tratamentos que a célula do metal puro não descreve.",
    "idea": "O magnésio e o alumínio têm tipos de referência diferentes, de modo que a classificação de aplicação não define a célula.",
    "observe": "Selecione o elemento no catálogo da Oficina e execute a missão Magnésio e Alumínio: HC versus CFC.",
    "interpret": "Explicar diferença HC/CFC e limites de inferir propriedades do componente real.",
    "limits": "O SILM não determina resistência de ligas Mg–Al, microestruturas reais ou massas de peças a partir do desenho.",
    "missions": [
      "magnesio-aluminio"
    ],
    "routes": [
      "ordem-metal"
    ],
    "selector": "examples:12,13",
    "track": "aplicacoes",
    "problem": "Metais usados em componentes leves precisam apresentar a mesma estrutura cristalina?",
    "prediction": "Preveja como a repetição cristalina difere entre HC e CFC e por que isso não é uma comparação direta de densidade.",
    "actions": [
      "Escolha um dos metais Mg · Al e identifique no catálogo sua estrutura de referência.",
      "Execute a missão Magnésio e Alumínio: HC versus CFC, registrando as evidências exigidas na Oficina.",
      "Em outra investigação, selecione um segundo metal do conjunto e compare o tipo de célula, as fontes e as limitações do modelo."
    ],
    "evidence": "Observe célula e rede de Mg ou Al; registre o tipo e compare com outra investigação sem inferir o comportamento de ligas.",
    "reflection": "Que diferença geométrica distingue Mg e Al no SILM? Por que desempenho mecânico de uma liga não resulta só da rede do elemento?"
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
  else if(selector.startsWith('available-examples:'))ids=selector.slice(19).split(',').map(Number).filter(z=>all.includes(z));
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
