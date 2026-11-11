'use strict';
(()=>{
 const S=SILM,all=S.data.elements.filter(e=>e.silmEligibility.status==='available').map(e=>e.atomicNumber),solid=all.filter(z=>S.crystal.eligibility(S.data.get(z)).status==='available');
 /* Fator de empacotamento usa esferas rígidas de raio único: só nos modelos canônicos (CCC, CFC, HC), não nas estruturas gerais. */
 const canonical=solid.filter(z=>!S.crystal.eligibility(S.data.get(z)).general);
 const make=(id,title,subtitle,concept,module,tools,mode,criterion,objective,theme,metals=solid)=>({id,version:1,type:'mission',title,subtitle,concept,module,description:objective,objectives:[objective],prerequisites:['Use um metal elegível e respeite as condições de referência.'],metalSelection:{mode:'choice',atomicNumbers:metals},structureRequirements:mode,allowedTools:tools,initialState:{mode,units:mode==='free'?4:1},completionCriteria:criterion,guidance:{action:objective,hint:'Use os controles do laboratório e confira os registros em Dados.',criterion:objective},relatedThemes:[theme],sources:['src-silm-conventions'],reportTemplate:[]});
 /* Investigação didática SIAB → SILM: pergunta, previsão, ação, interpretação e limites. */
 const PEDAGOGY={
  "montagem-ordem": {
    "context": "Uma peça metálica parece contínua, mas seu modelo microscópico é organizado por repetição. Uma montagem de esferas posicionadas livremente não é, por si só, uma estrutura cristalina.",
    "question": "O que muda quando a montagem livre passa a seguir uma estrutura cristalina de referência?",
    "prediction": "Antes de organizar, preveja quais aspectos do arranjo deverão se repetir e o que a representação não permite medir.",
    "evidence": "Compare a organização antes e depois; identifique a célula de referência e diferencie repetição periódica de posição arbitrária.",
    "questions": [
      "Quais informações vieram da referência científica e quais foram apenas escolhas da representação?",
      "A célula desenhada é todo o metal ou apenas a unidade de repetição?"
    ],
    "limit": "O ato de organizar uma montagem virtual não prova a estrutura de um objeto metálico real.",
    "teacher": "Evitar a ideia de que cristais são sempre cubos visíveis e de que basta alinhar esferas para obter um material real."
  },
  "vizinhos-metal": {
    "context": "Dois centros metálicos da mesma rede não são moléculas isoladas. A vizinhança imediata depende da organização geométrica adotada.",
    "question": "O que significa chamar outros centros de vizinhos de um centro metálico?",
    "prediction": "Antes de destacar os vizinhos, preveja se a coordenação depende do tipo de estrutura e do centro escolhido.",
    "evidence": "Selecione um centro e destaque sua vizinhança na rede; confronte o número e a organização dos vizinhos com a estrutura de referência.",
    "questions": [
      "Por que é incorreto interpretar um grupo de centros destacados como uma molécula metálica?",
      "Que diferença existe entre observar uma célula e navegar por uma rede extensa?"
    ],
    "limit": "A distância e a coordenação pertencem à geometria de referência; o desenho não identifica defeitos ou contornos de grão de uma amostra.",
    "teacher": "Distinguir coordenação cristalográfica de valência química e ligações moleculares discretas."
  },
  "eletrons-movimento": {
    "context": "No modelo da ligação metálica, elétrons de valência são representados coletivamente, em vez de pertencer a pares localizados entre centros.",
    "question": "Como a visualização pode representar a deslocalização sem sugerir órbitas fixas?",
    "prediction": "Preveja o que a cena mostrará quando a camada eletrônica aparecer ou quando o movimento visual for reduzido.",
    "evidence": "Ative a representação eletrônica e compare sua visibilidade com a estrutura metálica. Se houver animação, interprete-a qualitativamente.",
    "questions": [
      "O número de pontos na tela é a contagem de elétrons de condução do metal?",
      "O que deve permanecer compreensível quando o usuário reduz as animações?"
    ],
    "limit": "Os pontos e sua velocidade na tela não fornecem orbitais, velocidade de deriva, energia ou quantidade real de elétrons.",
    "teacher": "Evitar equiparar animação visual a trajetórias quânticas; respeitar as preferências de redução de movimento."
  },
  "campo-metal": {
    "context": "Um condutor metálico pode responder a um campo elétrico. O SILM usa uma representação coletiva simplificada para explorar a relação entre estrutura e resposta elétrica.",
    "question": "O que o modelo mostra quando um campo elétrico é aplicado ao metal?",
    "prediction": "Antecipe a diferença entre mostrar elétrons sem campo e representar a resposta sob campo.",
    "evidence": "Ative a visualização eletrônica, inicie a propriedade elétrica e aplique o campo. Observe os indicadores da resposta do modelo.",
    "questions": [
      "Por que movimento animado não basta para medir a condutividade elétrica?",
      "Que dados seriam necessários para comparar quantitativamente dois metais sob as mesmas condições?"
    ],
    "limit": "A animação não mede corrente, resistividade, mobilidade nem velocidade de deriva; valores dependem de dados e condições documentados.",
    "teacher": "Evitar a noção de que todos os metais conduzem igualmente ou de que a direção de uma seta visual comprova grandezas elétricas."
  },
  "medida-rede": {
    "context": "Ampliar uma imagem aumenta seu tamanho na tela, mas não altera os parâmetros cristalográficos da estrutura que ela representa.",
    "question": "A medida do parâmetro de rede muda quando a vista é ampliada ou girada?",
    "prediction": "Faça uma previsão antes de usar o instrumento: zoom altera pixels ou o valor científico da distância?",
    "evidence": "Com a estrutura organizada, use o instrumento Parâmetro de rede para registrar a e confira unidade e proveniência em Dados.",
    "questions": [
      "Por que uma distância lida em ångström não deve variar quando a câmera muda?",
      "Uma medida do modelo comprova a dimensão de uma peça metálica real?"
    ],
    "limit": "A medida depende das coordenadas e parâmetros da estrutura de referência; não equivale a medir uma amostra com instrumento físico.",
    "teacher": "Comparar transformação visual da câmera e invariância de medida, separando resolução numérica de incerteza experimental."
  },
  "espaco-ocupado": {
    "context": "A célula unitária pode ser analisada com geometria e esferas rígidas convencionais. Volume da célula e fator de empacotamento são relações diferentes.",
    "question": "Qual é a relação entre número efetivo de átomos, raio adotado e volume da célula?",
    "prediction": "Antes de calcular, preveja quais informações dependem do tipo de célula e quais precisam de referência.",
    "evidence": "Registre o volume da célula, confira o raio do modelo e obtenha o fator de empacotamento. Leia os parâmetros de entrada e suas fontes.",
    "questions": [
      "O que o fator de empacotamento significa no modelo ideal de esferas rígidas?",
      "Por que não se deve confundi-lo com a porcentagem de elétrons nem com a densidade de uma liga real?"
    ],
    "limit": "As relações de esferas rígidas valem apenas para as estruturas canônicas habilitadas; não descrevem densidade eletrônica nem defeitos reais.",
    "teacher": "Diferenciar a fração geométrica ideal do volume físico ocupado por um material real, respeitando o modelo cristalográfico adotado."
  }
};
 const list=[
 make('montagem-ordem','Da Montagem à Ordem','Organização cristalográfica','Montagem e cristalografia','explorar',['structure','unitCell'],'free','crystalline','Organize a montagem segundo a estrutura de referência do metal.','estruturas-cristalinas'),
 make('vizinhos-metal','Quem São os Vizinhos?','Coordenação e vizinhança','Vizinhos imediatos','explorar',['structure','unitCell','neighbors'],'crystalline','neighbors','Selecione um centro metálico e mostre sua vizinhança imediata.','estrutura-metais'),
 make('eletrons-movimento','Elétrons em Movimento','Representação coletiva','Elétrons deslocalizados','explorar',['electrons'],'free','electrons-motion','Mostre a distribuição eletrônica com a preferência de movimento ativada. Com movimento reduzido, observe a representação estática equivalente.','eletrons-deslocalizados',all),
 make('campo-metal','Metal sob Campo','Resposta qualitativa ao campo elétrico','Condutividade elétrica','explorar',['electrons','electrical'],'free','property-field','Inicie Condutividade elétrica e aplique o campo no modelo coletivo.','propriedades-metalicas',all),
 make('medida-rede','Medida de uma Rede','Comprimento cristalográfico','Parâmetro de rede','medir',['latticeParameter'],'crystalline','measure-a','Registre uma medida válida de a no modelo cristalino.','medindo-estruturas'),
 make('espaco-ocupado','Quanto Espaço Está Ocupado?','Volume ocupado por esferas rígidas','Fator de empacotamento','calcular',['effectiveAtoms','cellVolume','radius','packingFactor'],'crystalline','packing-factor','Calcule o volume da célula e o raio do modelo; use esses registros para obter o fator de empacotamento.','estrutura-calculo',canonical)
 ];
 for(const mission of list){
  const study=PEDAGOGY[mission.id];
  if(!study||!study.context||!study.question||!study.prediction||!study.evidence||!study.limit||!study.questions?.length||!study.teacher)throw Error('Sequência didática ausente: '+mission.id);
  mission.study=study;
 }

 /* Cada evidência vem de um sinal observável do motor, não de clique arbitrário.
    'criterion' e 'current' devem continuar válidos no estado atual;
    'observed' guarda a visita/ação documentada na tentativa. */
 const EVIDENCE_OBJECTIVES={
  "montagem-ordem": [
    [
      "crystalline",
      "Organizar uma estrutura cristalina válida",
      "criterion"
    ],
    [
      "cell",
      "Observar a célula unitária",
      "observed"
    ],
    [
      "lattice",
      "Observar a rede além da célula",
      "observed"
    ]
  ],
  "vizinhos-metal": [
    [
      "cell",
      "Identificar a célula de referência",
      "observed"
    ],
    [
      "lattice",
      "Examinar a rede",
      "observed"
    ],
    [
      "neighbors",
      "Selecionar um centro e destacar sua vizinhança",
      "criterion"
    ]
  ],
  "eletrons-movimento": [
    [
      "electrons-visible",
      "Mostrar a distribuição de elétrons deslocalizados",
      "observed"
    ],
    [
      "electrons-hidden",
      "Ocultar a camada depois de observá-la",
      "observed"
    ],
    [
      "electrons-motion",
      "Voltar a mostrar a distribuição e observar movimento ou a versão estática acessível",
      "criterion"
    ]
  ],
  "campo-metal": [
    [
      "electrons-visible",
      "Identificar a camada eletrônica coletiva",
      "observed"
    ],
    [
      "property-field",
      "Ativar a propriedade elétrica e aplicar o campo",
      "criterion"
    ]
  ],
  "medida-rede": [
    [
      "cell",
      "Examinar a célula de referência",
      "observed"
    ],
    [
      "measure-a",
      "Registrar uma medição científica válida de a",
      "criterion"
    ]
  ],
  "espaco-ocupado": [
    [
      "cell-volume",
      "Calcular o volume da célula",
      "current"
    ],
    [
      "radius",
      "Registrar o raio geométrico do modelo",
      "current"
    ],
    [
      "packing-factor",
      "Calcular o fator de empacotamento",
      "criterion"
    ]
  ],
  "objeto-ao-centro": [
    [
      "scale-1",
      "Investigar o objeto e o componente metálico",
      "observed"
    ],
    [
      "scale-2",
      "Observar os grãos da representação didática",
      "observed"
    ],
    [
      "scale-3",
      "Investigar a rede cristalina",
      "observed"
    ],
    [
      "scale-4",
      "Chegar ao centro metálico",
      "observed"
    ],
    [
      "neighbors",
      "Destacar a vizinhança do centro escolhido",
      "criterion"
    ]
  ]
};
 list.push({
  ...make('objeto-ao-centro','Do Objeto ao Centro','Quatro escalas de investigação','Objeto, grãos, rede e centro','explorar',['structure','unitCell','neighbors'],'free','neighbors','Percorra as quatro escalas, selecione um centro e destaque seus vizinhos.','estrutura-metais',[29,60].filter(z=>solid.includes(z))),
  version:1,study:{"context":"Um condutor de cobre e um ímã de liga Nd–Fe–B exemplificam funções de materiais muito diferentes. A imagem do objeto não revela sozinha a estrutura interna nem a composição completa.","question":"O que aprendemos ao atravessar as representações Objeto, Grãos, Rede e Centro sem supor uma ampliação experimental contínua?","prediction":"Antes de navegar, preveja o que cada escala pode explicar e o que exigiria uma medida real da amostra.","evidence":"Observe as quatro escalas do material escolhido e destaque a vizinhança de um centro na rede de referência.","questions":["Por que o cobre de um enrolamento não equivale ao motor inteiro?","Por que o ímã Nd–Fe–B não representa neodímio puro? O SILM já calcula magnetismo ou só mostra estruturas de referência?"],"limit":"Grãos esquemáticos e centros da rede descrevem modelos didáticos; não são micrografia e difração da mesma amostra. Magnetismo de Nd–Fe–B não é calculado nesta versão.","teacher":"Comparar Cobre (Cu) e Neodímio (Nd) em duas tentativas; não afirmar que a cena do Nd representa a fase Nd₂Fe₁₄B nem confundir a liga com metal puro."},initialState:{mode:'free',units:4,workshopScale:1},
  comparison:{metals:[29,60],note:'Investigações separadas. Cu puro não é o motor; Nd puro não é a liga Nd–Fe–B.'}
 });

 /* Expansão curricular baseada nos dados científicos realmente habilitados.
    Uma família indica elementos elegíveis, e nunca atribui valores ausentes. */
 const EXPANDED_CASES=
[
  {
    "id": "alcalinos-rede",
    "title": "Alcalinos: organização CCC",
    "sub": "Li, Na, K, Rb e Cs",
    "concept": "Família e célula cúbica",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell",
      "neighbors"
    ],
    "mode": "crystalline",
    "criterion": "neighbors",
    "theme": "familia-alcalinos",
    "selector": "category:alkali",
    "track": "familias",
    "level": "inicial",
    "objectives": [
      [
        "cell",
        "Identificar a célula cristalina CCC",
        "observed"
      ],
      [
        "lattice",
        "Observar a repetição da rede",
        "observed"
      ],
      [
        "neighbors",
        "Evidenciar os vizinhos do centro",
        "criterion"
      ]
    ],
    "context": "A família dos metais alcalinos reúne elementos distintos, mas os registros de referência utilizados no SILM mostram a organização cúbica de corpo centrado para seus representantes investigáveis.",
    "question": "O que é comum à geometria de referência de Li, Na, K, Rb e Cs, mesmo que sejam elementos diferentes?",
    "prediction": "Preveja onde aparecerão os centros metálicos ao ampliar uma célula CCC para a rede.",
    "evidence": "Observe célula e rede e destaque os vizinhos de um centro; informe o metal e a fonte da estrutura.",
    "questions": [
      "A mesma topologia implica a mesma distância entre centros?",
      "Por que a organização CCC não revela, por si só, a reatividade de cada alcalino?"
    ],
    "limit": "A missão não realiza reações com água nem mede propriedades químicas desses metais; a representação é cristalográfica.",
    "teacher": "Ressaltar que a atividade é virtual e não propõe manuseio de metais alcalinos."
  },
  {
    "id": "alcalinoterrosos-celulas",
    "title": "Alcalinoterrosos não são iguais",
    "sub": "Be, Mg, Ca, Sr, Ba e Ra",
    "concept": "HC, CFC e CCC na mesma família",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell",
      "neighbors"
    ],
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "theme": "familia-alcalinoterrosos",
    "selector": "category:alkaline-earth",
    "track": "familias",
    "level": "inicial",
    "objectives": [
      [
        "cell",
        "Examinar a célula do metal escolhido",
        "observed"
      ],
      [
        "lattice",
        "Expandir para a rede cristalina",
        "observed"
      ],
      [
        "cell-and-lattice",
        "Reconhecer ambas as vistas como a mesma referência",
        "criterion"
      ]
    ],
    "context": "Metais da mesma família podem ter estruturas de referência diferentes: Be e Mg são HC, Ca e Sr são CFC, e Ba e Ra aparecem como CCC no banco do SILM.",
    "question": "Por que pertencer ao mesmo grupo da Tabela Periódica não garante a mesma célula unitária?",
    "prediction": "Preveja o que mudará ao selecionar outro alcalinoterroso em uma investigação separada.",
    "evidence": "Registre o tipo de célula e a rede de pelo menos um elemento e identifique outro da família para comparar em nova tentativa.",
    "questions": [
      "O que deve ser reiniciado para mudar o metal da investigação?",
      "As imagens indicam uma amostra física com a mesma pureza e temperatura?"
    ],
    "limit": "Rádio é radioativo e não deve ser tratado como material de demonstração física; todos os ensaios são virtuais.",
    "teacher": "Não transformar a família em uma única estrutura padrão; reforçar restrições de segurança."
  },
  {
    "id": "bloco-d-diversidade",
    "title": "Bloco d: diversidade estrutural",
    "sub": "Metais de transição disponíveis",
    "concept": "Estruturas variadas do bloco d",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell",
      "neighbors"
    ],
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "theme": "diversidade-bloco-d",
    "selector": "category:d-metal",
    "track": "familias",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Consultar a célula de referência",
        "observed"
      ],
      [
        "lattice",
        "Observar a periodicidade da estrutura",
        "observed"
      ],
      [
        "cell-and-lattice",
        "Validar a relação entre célula e rede",
        "criterion"
      ]
    ],
    "context": "O bloco d inclui metais com referências CCC, CFC, HC e estruturas mais complexas. Elementos como ferro, cobre, titânio e manganês não devem receber a mesma geometria por conveniência didática.",
    "question": "Que características da rede podem variar entre os metais do bloco d sem que a ligação deixe de ser metálica?",
    "prediction": "Escolha dois metais com registros distintos e antecipe quais elementos da geometria mudarão.",
    "evidence": "Identifique o tipo de estrutura e a condição de referência do metal escolhido; faça uma segunda tentativa com outro metal se desejar comparar.",
    "questions": [
      "Por que estrutura cristalina e aplicação tecnológica não são sinônimos?",
      "O que muda quando a estrutura é complexa, além das três células canônicas?"
    ],
    "limit": "O simulador não calcula diagramas de fase, transformações térmicas ou propriedades industriais específicas apenas a partir da célula.",
    "teacher": "Usar a Tabela Periódica e as fontes da estrutura para separar agrupamento químico e modelo geométrico."
  },
  {
    "id": "bloco-p-surpresas",
    "title": "Bloco p: metais e geometrias",
    "sub": "Al, Sn, Tl, Pb, Bi e Po",
    "concept": "Estruturas não uniformes",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell"
    ],
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "theme": "metais-bloco-p",
    "selector": "category:p-metal",
    "track": "familias",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Investigar a célula de referência",
        "observed"
      ],
      [
        "lattice",
        "Examinar sua extensão em rede",
        "observed"
      ],
      [
        "cell-and-lattice",
        "Validar as duas representações",
        "criterion"
      ]
    ],
    "context": "O grupo de metais do bloco p inclui tanto alumínio e chumbo com referência CFC quanto estanho, bismuto e polônio com estruturas diferentes.",
    "question": "Por que um metal do bloco p não pode ser automaticamente representado como CFC?",
    "prediction": "Preveja quais diferenças entre célula e rede podem aparecer conforme o elemento investigado.",
    "evidence": "Registre o tipo de estrutura de referência e compare o desenho com a ficha de origem.",
    "questions": [
      "O tipo de célula explica sozinho ductilidade ou fragilidade?",
      "Que cuidado é necessário ao comparar fases alotrópicas do estanho?"
    ],
    "limit": "Polônio é radioativo e não há experimentação real; o SILM não prevê transformações de fases.",
    "teacher": "Tratar as condições publicadas em cada ficha como parte do resultado."
  },
  {
    "id": "lantanideos-eletrons",
    "title": "Lantanídeos: modelo eletrônico",
    "sub": "Os 14 lantanídeos habilitados",
    "concept": "Elétrons deslocalizados e limites documentais",
    "module": "explorar",
    "tools": [
      "electrons"
    ],
    "mode": "free",
    "criterion": "electrons-motion",
    "theme": "lantanideos-modelos",
    "selector": "category-all:lanthanide",
    "track": "familias",
    "level": "inicial",
    "objectives": [
      [
        "electrons-visible",
        "Exibir a camada eletrônica qualitativa",
        "observed"
      ],
      [
        "electrons-hidden",
        "Ocultar a camada e comparar",
        "observed"
      ],
      [
        "electrons-motion",
        "Retomar a representação, respeitando movimento reduzido",
        "criterion"
      ]
    ],
    "context": "Os 14 lantanídeos habilitados têm fichas científicas, mas La, Pr e Nd ainda não possuem rede cristalina liberada pelo validador. O modelo eletrônico coletivo é uma representação qualitativa distinta.",
    "question": "Como investigar o conceito de deslocalização sem afirmar que uma rede cristalina indisponível foi calculada?",
    "prediction": "Preveja o que a representação eletrônica pode e não pode revelar sobre o metal selecionado.",
    "evidence": "Alterne a visualização dos elétrons e descreva o fenômeno sem contar os marcadores como partículas medidas.",
    "questions": [
      "Qual é a diferença entre deslocalização e uma trajetória eletrônica clássica?",
      "Por que o ímã Nd–Fe–B não pode ser explicado como neodímio puro?"
    ],
    "limit": "Não há cálculo magnético nem estrutura Nd₂Fe₁₄B; La, Pr e Nd não têm visualização de rede homologada.",
    "teacher": "Essa missão não deve oferecer ou exigir ferramentas de Rede e Centro para os três metais indisponíveis."
  },
  {
    "id": "lantanideos-estruturas",
    "title": "Lantanídeos com redes disponíveis",
    "sub": "Estruturas de referência verificadas",
    "concept": "Diferentes células e famílias 4f",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell"
    ],
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "theme": "lantanideos-modelos",
    "selector": "category:lanthanide",
    "track": "familias",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Consultar célula do lantanídeo habilitado",
        "observed"
      ],
      [
        "lattice",
        "Observar a rede correspondente",
        "observed"
      ],
      [
        "cell-and-lattice",
        "Relacionar as duas vistas",
        "criterion"
      ]
    ],
    "context": "Dentro dos lantanídeos há registros CCC, CFC, HC, romboédricos e outros. Nesta atividade entram apenas os elementos cuja estrutura foi liberada pelo motor científico.",
    "question": "Por que é inadequado atribuir a todos os lantanídeos a célula do neodímio?",
    "prediction": "Preveja se a estrutura de referência é uniforme ao longo da série.",
    "evidence": "Registre elemento, estrutura, proveniência e o que pode ser observado na célula e na rede.",
    "questions": [
      "Um desenho de rede prova a microestrutura de uma liga de terras raras?",
      "Por que é necessário conferir o tipo de fase e as condições reportadas?"
    ],
    "limit": "La, Pr e Nd são excluídos automaticamente enquanto a estrutura cristalográfica não estiver homologada para construção.",
    "teacher": "Diferenciar as fichas documentais das estruturas efetivamente disponíveis para exploração."
  },
  {
    "id": "actinideos-referencias",
    "title": "Actinídeos no modelo cristalográfico",
    "sub": "Ac, Th, Pa, Np, Pu e Am",
    "concept": "Referências e modelos de alta complexidade",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell"
    ],
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "theme": "actinideos-ciencia",
    "selector": "category:actinide",
    "track": "familias",
    "level": "avancado",
    "objectives": [
      [
        "cell",
        "Examinar uma célula documentada",
        "observed"
      ],
      [
        "lattice",
        "Examinar a rede construída pelos dados",
        "observed"
      ],
      [
        "cell-and-lattice",
        "Interpretar a periodicidade da referência",
        "criterion"
      ]
    ],
    "context": "Actinídeos investigáveis apresentam estruturas de referência muito diversas. Alguns têm geometrias gerais que exigem a expansão de sítios do banco cristalográfico.",
    "question": "Quais informações sustentam uma rede cristalina de referência sem demonstrar a manipulação física do elemento?",
    "prediction": "Preveja por que uma estrutura complexa requer mais dados que um modelo simples de esferas compactas.",
    "evidence": "Localize a ficha cristalográfica e verifique a relação entre os sítios e a célula exibida.",
    "questions": [
      "Uma geometria registrada determina segurança, estabilidade ou uso industrial?",
      "Que aspectos de uma fase radioativa não são simulados pela rede?"
    ],
    "limit": "Todos os actinídeos desta atividade devem ser estudados virtualmente; não há manuseio de materiais radioativos nem previsão nuclear.",
    "teacher": "Enfatizar limites de fonte, fase e segurança sem propor demonstrações com amostras."
  },
  {
    "id": "ccc-coordenacao",
    "title": "CCC: vizinhos e repetição",
    "sub": "De Li e Fe a Mo e W",
    "concept": "Coordenação da referência CCC",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell",
      "neighbors"
    ],
    "mode": "crystalline",
    "criterion": "neighbors",
    "theme": "investigacao-ccc",
    "selector": "type:CCC",
    "track": "estruturas",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Examinar centros em vértices e corpo",
        "observed"
      ],
      [
        "lattice",
        "Ampliar para a rede CCC",
        "observed"
      ],
      [
        "neighbors",
        "Marcar os vizinhos de um centro",
        "criterion"
      ]
    ],
    "context": "Na referência CCC, os centros aparecem nos vértices e no corpo da célula convencional; a coordenação geométrica ideal pode ser investigada na rede.",
    "question": "Qual é o papel do centro do corpo e por que a vizinhança não termina na borda da célula?",
    "prediction": "Indique onde espera encontrar vizinhos do centro em uma estrutura CCC.",
    "evidence": "Identifique as posições e a coordenação do modelo sem tratar a célula como molécula.",
    "questions": [
      "Quantos centros efetivos correspondem à célula convencional?",
      "Os parâmetros de rede de ferro e tungstênio precisam ser iguais?"
    ],
    "limit": "A coordenação é calculada na geometria de referência, não inclui defeitos experimentais nem outra fase do metal.",
    "teacher": "Relacionar coordenação e repetição, não deduzir propriedades mecânicas numericamente."
  },
  {
    "id": "cfc-coordenacao",
    "title": "CFC: faces e vizinhança",
    "sub": "De Al e Cu a Ag, Au e Pt",
    "concept": "Coordenação geométrica CFC",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell",
      "neighbors"
    ],
    "mode": "crystalline",
    "criterion": "neighbors",
    "theme": "investigacao-cfc",
    "selector": "type:CFC",
    "track": "estruturas",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Identificar centros de faces",
        "observed"
      ],
      [
        "lattice",
        "Reconhecer a extensão da rede",
        "observed"
      ],
      [
        "neighbors",
        "Observar a vizinhança imediata",
        "criterion"
      ]
    ],
    "context": "Cobre, alumínio, prata e ouro aparecem com estruturas CFC no banco de referência, mas suas aplicações e propriedades não são idênticas.",
    "question": "Como vértices e centros de face se combinam para descrever a célula CFC?",
    "prediction": "Preveja a distribuição dos vizinhos de um centro no interior da rede.",
    "evidence": "Descreva a célula, a rede e os vizinhos que atravessam os limites convencionais.",
    "questions": [
      "Por que um centro de face não é um átomo inteiro exclusivo da célula?",
      "Uma estrutura CFC basta para prever cor e condutividade do metal?"
    ],
    "limit": "O modelo CFC não calcula cor, refletância ou condutividade a partir da geometria, sem parâmetros físicos adicionais.",
    "teacher": "Investigar frações compartilhadas e vizinhança sem impor uma interpretação molecular."
  },
  {
    "id": "hc-coordenacao",
    "title": "HC: camadas compactas",
    "sub": "Mg, Ti, Zn, Co e outros",
    "concept": "Organização hexagonal",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell",
      "neighbors"
    ],
    "mode": "crystalline",
    "criterion": "neighbors",
    "theme": "investigacao-hc",
    "selector": "type:HC",
    "track": "estruturas",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Observar a célula hexagonal",
        "observed"
      ],
      [
        "lattice",
        "Identificar a repetição de camadas",
        "observed"
      ],
      [
        "neighbors",
        "Consultar os vizinhos na geometria HC",
        "criterion"
      ]
    ],
    "context": "A estrutura hexagonal compacta organiza centros em camadas; os parâmetros a e c pertencem à fonte de cada elemento e não a um valor universal.",
    "question": "Qual relação existe entre empilhamento de camadas e a vizinhança na estrutura HC?",
    "prediction": "Preveja como se repetem os centros quando a visualização sai da célula e alcança a rede.",
    "evidence": "Compare a visualização de camadas, a vizinhança e os parâmetros identificados na ficha.",
    "questions": [
      "Por que a relação c/a do metal real não é sempre a ideal?",
      "A estrutura de referência de titânio permite prever todas as fases em diferentes temperaturas?"
    ],
    "limit": "A cena é uma estrutura de referência; não simula transição de fase nem uma rede deformada experimentalmente.",
    "teacher": "Evitar confundir HC com todas as estruturas hexagonais, como a dupla hexagonal compacta."
  },
  {
    "id": "estruturas-gerais",
    "title": "Além das três células canônicas",
    "sub": "Complexas, tetragonais e outras",
    "concept": "Cristalografia geral documentada",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell"
    ],
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "theme": "estruturas-nao-canonicas",
    "selector": "general",
    "track": "estruturas",
    "level": "avancado",
    "objectives": [
      [
        "cell",
        "Ler a célula construída pelos sítios fracionários",
        "observed"
      ],
      [
        "lattice",
        "Explorar a extensão da rede geral",
        "observed"
      ],
      [
        "cell-and-lattice",
        "Relacionar a referência documental às vistas",
        "criterion"
      ]
    ],
    "context": "Manganês, estanho, samário, bismuto e alguns actinídeos apresentam estruturas gerais que não podem ser substituídas por CCC, CFC ou HC.",
    "question": "Quais informações são necessárias para construir uma rede além de escolher uma forma geométrica?",
    "prediction": "Preveja por que sítios fracionários e operações de simetria se tornam importantes nessas estruturas.",
    "evidence": "Registre o grupo/forma da estrutura, a rede e a proveniência dos dados exibidos.",
    "questions": [
      "Por que um átomo na base assimétrica não é necessariamente a contagem total da célula?",
      "Quando não se deve usar o fator de empacotamento canônico?"
    ],
    "limit": "Modelos de estruturas gerais não usam o empacotamento de esferas rígidas CCC/CFC/HC nem a deformação mecânica não homologada.",
    "teacher": "Diferenciar visualização de simetria de validação mecânica ou eletrônica da amostra."
  },
  {
    "id": "empacotamento-referencias",
    "title": "Empacotamento com fontes",
    "sub": "Modelos CCC, CFC e HC",
    "concept": "Relações geométricas de esferas rígidas",
    "module": "calcular",
    "tools": [
      "effectiveAtoms",
      "cellVolume",
      "radius",
      "packingFactor"
    ],
    "mode": "crystalline",
    "criterion": "packing-factor",
    "theme": "parametros-empacotamento",
    "selector": "canonical",
    "track": "calculos",
    "level": "avancado",
    "objectives": [
      [
        "cell-volume",
        "Calcular o volume da célula",
        "current"
      ],
      [
        "radius",
        "Registrar o raio do modelo de esferas rígidas",
        "current"
      ],
      [
        "packing-factor",
        "Determinar o fator geométrico de empacotamento",
        "criterion"
      ]
    ],
    "context": "O fator de empacotamento de um modelo canônico exige número efetivo de centros, raio adotado e volume da célula; é uma fração geométrica, não uma densidade medida.",
    "question": "Como o tipo de célula influencia a fração ideal ocupada por esferas rígidas?",
    "prediction": "Preveja quais grandezas precisam estar registradas antes do resultado final.",
    "evidence": "Produza os três registros e identifique unidades, fontes e hipóteses de contato entre esferas.",
    "questions": [
      "Por que esse fator não é a porcentagem de elétrons do metal?",
      "Como distinguir volume ideal da célula e densidade experimental de uma liga?"
    ],
    "limit": "Aplicável somente aos modelos CCC, CFC e HC homologados; não extrapolar para fases e ligas industriais.",
    "teacher": "Exigir explicitação das entradas e suas origens para evitar cálculo automático sem interpretação."
  },
  {
    "id": "condutores-em-campo",
    "title": "Cobre, prata, ouro e alumínio",
    "sub": "Resposta elétrica qualitativa",
    "concept": "Campo e elétrons coletivos",
    "module": "explorar",
    "tools": [
      "electrons",
      "electrical"
    ],
    "mode": "free",
    "criterion": "property-field",
    "theme": "conducao-na-oficina",
    "selector": "examples:29,47,79,13",
    "property": "electrical",
    "track": "propriedades",
    "level": "intermediario",
    "objectives": [
      [
        "electrons-visible",
        "Mostrar o modelo eletrônico coletivo",
        "observed"
      ],
      [
        "electrons-hidden",
        "Ocultar e distinguir a camada da estrutura",
        "observed"
      ],
      [
        "property-field",
        "Aplicar campo elétrico à propriedade elétrica",
        "criterion"
      ]
    ],
    "context": "Cobre, prata, ouro e alumínio são utilizados em aplicações elétricas distintas. A cena representa qualitativamente a resposta coletiva sob campo, não mede a intensidade real de condução.",
    "question": "O que a aplicação de um campo mostra e o que falta para comparar a condutividade de dois metais?",
    "prediction": "Preveja quais indicadores mudam quando a propriedade elétrica é iniciada.",
    "evidence": "Alterne a camada eletrônica, aplique o campo e documente o que foi observado, sem inferir valores ausentes.",
    "questions": [
      "Por que a intensidade da animação não equivale à condutividade tabelada?",
      "Como temperatura, pureza e defeitos podem alterar um condutor real?"
    ],
    "limit": "Os dados quantitativos de condutividade não estão homologados para todos os metais; o campo tem escala didática, sem velocidade de deriva medida.",
    "teacher": "Comparar as aplicações sem apresentar ranking numérico não sustentado pelo banco."
  },
  {
    "id": "calor-metalico",
    "title": "Energia atravessando a rede",
    "sub": "Cu, Ag, Al, Mg, Fe, Ti e W",
    "concept": "Condução térmica qualitativa",
    "module": "explorar",
    "tools": [
      "structure",
      "thermal"
    ],
    "mode": "crystalline",
    "criterion": "property-heating",
    "theme": "termica-na-oficina",
    "selector": "examples:29,47,13,12,26,22,74",
    "property": "thermal",
    "track": "propriedades",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Identificar a rede usada na experiência",
        "observed"
      ],
      [
        "lattice",
        "Observar a propagação por vizinhanças",
        "observed"
      ],
      [
        "property-heating",
        "Ativar o aquecimento e avançar uma etapa do modelo",
        "criterion"
      ]
    ],
    "context": "A experiência térmica do SILM propaga energia de modo qualitativo por centros vizinhos, com coeficiente didático comum. A taxa na animação não compara a condutividade real de cobre, ferro e tungstênio.",
    "question": "O que o modelo mostra quando a fonte de calor é ativada na rede de referência?",
    "prediction": "Preveja como a frente de aquecimento se estende no desenho.",
    "evidence": "Mostre a rede, ative o aquecimento e observe uma etapa de propagação antes de interpretar o registro.",
    "questions": [
      "O que deve acontecer após retirar a fonte de calor?",
      "Quais parâmetros faltam para deduzir uma condutividade térmica real?"
    ],
    "limit": "Não se trata de um cálculo de temperatura local, difusividade, fluxo de calor em W ou comparação quantitativa entre metais.",
    "teacher": "Não confundir as etapas de animação com tempo físico nem com a curva de uma amostra."
  },
  {
    "id": "brilho-com-luz",
    "title": "Brilho: reflexão e limites",
    "sub": "Au, Ag, Cu, Al e Pt",
    "concept": "Resposta óptica do modelo",
    "module": "explorar",
    "tools": [
      "structure",
      "luster"
    ],
    "mode": "crystalline",
    "criterion": "property-light",
    "theme": "brilho-e-superficies",
    "selector": "examples:79,47,29,13,78",
    "property": "luster",
    "track": "propriedades",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Examinar a organização da referência",
        "observed"
      ],
      [
        "lattice",
        "Observar a rede representada",
        "observed"
      ],
      [
        "property-light",
        "Aplicar iluminação na experiência óptica",
        "criterion"
      ]
    ],
    "context": "O brilho metálico depende da resposta eletromagnética e do estado da superfície. O SILM oferece um esquema geométrico de reflexão, sem cálculo de cor nem refletância específica.",
    "question": "A reflexão observada na tela basta para afirmar por que ouro e prata têm cores diferentes?",
    "prediction": "Preveja o efeito visual de ativar a luz no esquema.",
    "evidence": "Acione a iluminação e descreva a relação entre feixe incidente e refletido, distinguindo desenho e dado físico.",
    "questions": [
      "Por que a lei da reflexão não é exclusiva de metais?",
      "Como rugosidade e oxidação influenciariam uma superfície real?"
    ],
    "limit": "A experiência não calcula espectros ópticos, absorção, cor percebida ou percentuais de refletância.",
    "teacher": "Evitar reduzir brilho metálico a um efeito gráfico de cor ou a um único átomo."
  },
  {
    "id": "laminas-maleabilidade",
    "title": "Da rede à lâmina",
    "sub": "Deformação qualitativa em metais canônicos",
    "concept": "Maleabilidade e recuperação do modelo",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell",
      "malleability"
    ],
    "mode": "crystalline",
    "criterion": "deform-and-restore",
    "theme": "propriedades-mecanicas",
    "selector": "examples:13,29,47,79,28,26",
    "property": "malleability",
    "track": "propriedades",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Identificar a rede de referência",
        "observed"
      ],
      [
        "lattice",
        "Examinar a vizinhança antes da compressão",
        "observed"
      ],
      [
        "deform-and-restore",
        "Aplicar compressão e restaurar a representação",
        "criterion"
      ]
    ],
    "context": "O SILM mostra deslizamento didático de planos e mudança de forma, mas não conhece automaticamente o comportamento mecânico medido de cada elemento.",
    "question": "O que muda na representação quando se aplica e depois se restaura a compressão?",
    "prediction": "Preveja como a forma aparente se modifica sem alterar a identificação do metal.",
    "evidence": "Observe a referência, aplique compressão, restaure e compare o estado inicial e final.",
    "questions": [
      "Por que maleabilidade não é o mesmo que ductilidade?",
      "A restauração virtual comprova recuperação elástica da amostra física?"
    ],
    "limit": "O modelo não prevê tensão, deformação real, dureza ou ductilidade específica, e pode não representar materiais frágeis.",
    "teacher": "Não interpretar a restauração do controle como ensaio de limite elástico."
  },
  {
    "id": "fios-ductilidade",
    "title": "Do metal ao fio",
    "sub": "Tração didática em ligas e metais",
    "concept": "Alongamento e limite do modelo",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell",
      "ductility"
    ],
    "mode": "crystalline",
    "criterion": "property-elongation",
    "theme": "propriedades-mecanicas",
    "selector": "examples:29,13,47,79,28,78",
    "property": "ductility",
    "track": "propriedades",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Observar a célula antes do alongamento",
        "observed"
      ],
      [
        "lattice",
        "Examinar a rede não deformada",
        "observed"
      ],
      [
        "property-elongation",
        "Aplicar uma etapa de alongamento qualitativo",
        "criterion"
      ]
    ],
    "context": "O alongamento de fios é representado como uma transformação coletiva da geometria do desenho, mas sua amplitude não é uma deformação experimental medida.",
    "question": "Como a ductilidade difere da compressão associada à maleabilidade?",
    "prediction": "Preveja a diferença visual entre formar uma lâmina e alongar uma estrutura.",
    "evidence": "Registre a condição inicial e a representação com alongamento ativo, indicando a limitação do modelo.",
    "questions": [
      "Que ensaio mediria alongamento na ruptura?",
      "Como defeitos, temperatura e processamento influenciam a resposta real?"
    ],
    "limit": "A simulação não fornece módulo de Young, tensão de escoamento, alongamento percentual ou fratura de material comercial.",
    "teacher": "Não comparar mecanicamente metais pela altura desenhada após arrastar um controle."
  },
  {
    "id": "medidas-metais-leves",
    "title": "Medindo metais leves",
    "sub": "Be, Mg, Al, Sc e Ti",
    "concept": "Parâmetros a em diferentes estruturas",
    "module": "medir",
    "tools": [
      "latticeParameter",
      "distance"
    ],
    "mode": "crystalline",
    "criterion": "measure-a",
    "theme": "parametros-empacotamento",
    "selector": "examples:4,12,13,21,22",
    "track": "medicoes",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Identificar uma aresta da célula",
        "observed"
      ],
      [
        "lattice",
        "Observar o entorno cristalino",
        "observed"
      ],
      [
        "measure-a",
        "Registrar medida válida do parâmetro a",
        "criterion"
      ]
    ],
    "context": "Metais leves podem ter estruturas CFC e HC distintas; o parâmetro a possui significado geométrico e condições de referência da fonte, não corresponde ao tamanho da figura em pixels.",
    "question": "Qual parâmetro pertence ao banco científico e por que não muda ao aplicar zoom?",
    "prediction": "Preveja a medida de a em unidades cristalográficas e a diferença entre duas tentativas.",
    "evidence": "Registre a medida de a, unidade e proveniência antes de comparar com outro metal.",
    "questions": [
      "Por que não basta ler uma régua na tela?",
      "O valor obtido pode ser aplicado a toda peça ou liga sem conhecer sua composição?"
    ],
    "limit": "As medidas derivam do modelo geométrico e não determinam incerteza de difração ou pureza de uma amostra.",
    "teacher": "Comparar somente leituras com unidades e condições compatíveis."
  },
  {
    "id": "volumes-metais-pesados",
    "title": "Volume da célula em metais densos",
    "sub": "W, Ta, Re, Os, Au, Pb e Bi",
    "concept": "Geometria versus densidade macroscópica",
    "module": "calcular",
    "tools": [
      "cellVolume",
      "effectiveAtoms"
    ],
    "mode": "crystalline",
    "criterion": "cell-volume",
    "theme": "parametros-empacotamento",
    "selector": "examples:74,73,75,76,79,82,83",
    "track": "calculos",
    "level": "avancado",
    "objectives": [
      [
        "cell",
        "Consultar a célula antes do cálculo",
        "observed"
      ],
      [
        "cell-volume",
        "Calcular o volume da célula de referência",
        "criterion"
      ]
    ],
    "context": "Um metal pode ter massa específica elevada por razões que incluem massa atômica e volume por átomo. A fórmula de volume da célula não é, isoladamente, densidade de uma amostra.",
    "question": "Como parâmetros de rede e ângulos determinam o volume geométrico de uma célula?",
    "prediction": "Preveja por que algumas células gerais precisam de ângulos além das dimensões a, b, c.",
    "evidence": "Calcule o volume com entradas verificadas e explique o que ainda faltaria para obter densidade física.",
    "questions": [
      "Por que o volume de uma célula não mede o volume de uma peça?",
      "Qual informação seria necessária para relacionar massa e volume por célula?"
    ],
    "limit": "Não conclua densidade real, pureza ou propriedades do metal a partir do volume isolado.",
    "teacher": "Evitar o rótulo de 'metal denso' como justificativa geométrica; diferenciar volume e densidade."
  },
  {
    "id": "travessia-metais",
    "title": "Quatro escalas, muitos metais",
    "sub": "Objeto, Grãos, Rede e Centro",
    "concept": "Roteiro integrado da ligação metálica",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell",
      "neighbors"
    ],
    "mode": "free",
    "criterion": "neighbors",
    "theme": "travessia-investigativa",
    "selector": "all-crystalline",
    "track": "aplicacoes",
    "level": "inicial",
    "objectives": [
      [
        "scale-1",
        "Reconhecer o objeto e seu componente metálico",
        "observed"
      ],
      [
        "scale-2",
        "Examinar a microestrutura didática",
        "observed"
      ],
      [
        "scale-3",
        "Investigar a rede cristalina",
        "observed"
      ],
      [
        "scale-4",
        "Focalizar um centro metálico",
        "observed"
      ],
      [
        "neighbors",
        "Destacar a vizinhança em rede",
        "criterion"
      ]
    ],
    "context": "Um objeto e sua microestrutura são exemplos didáticos de níveis de organização, mas não uma sequência de micrografias calibradas. As redes representam estruturas científicas de referência.",
    "question": "O que podemos concluir em cada escala sem misturar a aplicação real com a célula ideal do elemento?",
    "prediction": "Antes de explorar, indique qual pergunta será respondida em Objeto, Grãos, Rede e Centro.",
    "evidence": "Percorra as quatro escalas e destaque a vizinhança, registrando o metal e a estrutura de referência.",
    "questions": [
      "Por que não basta dar zoom no objeto para conhecer os átomos da peça?",
      "O que distingue um grão da rede ideal associada ao elemento?"
    ],
    "limit": "Disponível somente para metais com rede liberada. Não há microscopia experimental nem identificação de composição do objeto comercial.",
    "teacher": "Usar os quatro níveis com perguntas diferentes e conferir a restrição de troca de metal durante a missão."
  },
  {
    "id": "cobre-prata-ouro",
    "title": "Cobre, Prata e Ouro: a mesma rede?",
    "sub": "Cu · Ag · Au",
    "concept": "CFC e aplicações de condutores",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell",
      "neighbors"
    ],
    "mode": "crystalline",
    "criterion": "neighbors",
    "theme": "metais-nobres-conducao",
    "selector": "examples:29,47,79",
    "track": "aplicacoes",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Observar a célula de referência",
        "observed"
      ],
      [
        "lattice",
        "Identificar a repetição da rede",
        "observed"
      ],
      [
        "neighbors",
        "Destacar a vizinhança de um centro",
        "criterion"
      ]
    ],
    "context": "Condutores, contatos e revestimentos podem utilizar Cu, Ag ou Au por motivos diferentes. A estrutura cristalina não substitui dados elétricos, químicos ou de superfície.",
    "question": "Cobre, prata e ouro têm estrutura de referência CFC. Isso basta para dizer que seus usos e propriedades são idênticos?",
    "prediction": "Preveja o padrão de vizinhança que deve aparecer nos três modelos CFC e uma propriedade que a geometria sozinha não determina.",
    "evidence": "Destaque célula, rede e vizinhos em um dos metais; depois compare os parâmetros e referências dos demais em investigações separadas.",
    "questions": [
      "Quais características geométricas são comuns e quais parâmetros ainda variam entre Cu, Ag e Au?",
      "Por que a escolha de um contato elétrico depende também de superfície, custo e condições de uso?"
    ],
    "limit": "O SILM não mede resistência de contato, corrosão ou qualidade de revestimentos; propriedades quantitativas requerem fonte e condições verificadas.",
    "teacher": "Comparar Cu, Ag e Au por investigações separadas, distinguindo a rede CFC de propriedades elétricas e custos comerciais."
  },
  {
    "id": "ferro-cobalto-niquel",
    "title": "Ferro, Cobalto e Níquel: três redes",
    "sub": "Fe · Co · Ni",
    "concept": "CCC, HC e CFC no grupo do ferro",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell"
    ],
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "theme": "ferro-cobalto-niquel-estruturas",
    "selector": "examples:26,27,28",
    "track": "estruturas",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Observar a célula do elemento",
        "observed"
      ],
      [
        "lattice",
        "Verificar a repetição de sua rede",
        "observed"
      ],
      [
        "cell-and-lattice",
        "Conferir ambas as representações",
        "criterion"
      ]
    ],
    "context": "Nas condições de referência do banco, Fe é CCC, Co é HC e Ni é CFC. O simulador investiga geometria, não magnetização do material.",
    "question": "Fe, Co e Ni aparecem em aplicações magnéticas; por que suas estruturas cristalinas de referência não são todas iguais?",
    "prediction": "Preveja como a disposição dos centros pode diferir entre CCC, HC e CFC antes de abrir as três células.",
    "evidence": "Compare a célula e a repetição da rede com Fe, Co ou Ni, e documente a estrutura homologada do metal selecionado.",
    "questions": [
      "Que diferença cristalográfica o SILM mostra entre Fe, Co e Ni?",
      "Por que uma representação de rede não comprova ferromagnetismo ou curvas de histerese?"
    ],
    "limit": "O SILM não simula domínios, magnetização, histerese nem transformações de fase por temperatura.",
    "teacher": "Usar Fe/Co/Ni para separar organização cristalina e comportamento magnético, não confundir natureza da aplicação com validação de propriedade."
  },
  {
    "id": "aluminio-cobre",
    "title": "Alumínio ou Cobre: componentes distintos",
    "sub": "Al · Cu",
    "concept": "CFC, massa e aplicação tecnológica",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell",
      "neighbors"
    ],
    "mode": "crystalline",
    "criterion": "neighbors",
    "theme": "aluminio-cobre-componentes",
    "selector": "examples:13,29",
    "track": "aplicacoes",
    "level": "inicial",
    "objectives": [
      [
        "cell",
        "Observar a célula de referência",
        "observed"
      ],
      [
        "lattice",
        "Identificar a repetição da rede",
        "observed"
      ],
      [
        "neighbors",
        "Destacar a vizinhança de um centro",
        "criterion"
      ]
    ],
    "context": "Al e Cu podem aparecer como componentes elétricos e estruturais. O objeto completo pode conter ligas, isolantes, conectores e outros metais.",
    "question": "Por que objetos podem utilizar alumínio ou cobre mesmo quando ambos têm rede CFC?",
    "prediction": "Preveja uma semelhança geométrica dos metais puros e duas informações da aplicação que não estão codificadas na célula.",
    "evidence": "Explore a célula CFC e os vizinhos; registre o elemento e o componente do objeto correspondente, sem supor pureza.",
    "questions": [
      "A célula cristalina do alumínio determina sozinha a massa e a função de um cabo?",
      "Por que distinguir metal puro, liga, peça e produto completo?"
    ],
    "limit": "Não se calculam composição industrial nem desempenho de cabos ou ligas a partir de ilustração e rede do elemento.",
    "teacher": "Desfazer a ideia de que o metal de uma peça define a composição de todo o objeto."
  },
  {
    "id": "titanio-zirconio-hafnio",
    "title": "Titânio, Zircônio e Háfnio: redes HC",
    "sub": "Ti · Zr · Hf",
    "concept": "Metais do bloco d com estrutura HC",
    "module": "medir",
    "tools": [
      "latticeParameter",
      "distance",
      "unitCell"
    ],
    "mode": "crystalline",
    "criterion": "measure-a",
    "theme": "trio-titanio-zirconio-hafnio",
    "selector": "examples:22,40,72",
    "track": "estruturas",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Reconhecer a célula unitária",
        "observed"
      ],
      [
        "lattice",
        "Observar a rede de referência",
        "observed"
      ],
      [
        "measure-a",
        "Registrar o parâmetro a com unidade e proveniência",
        "criterion"
      ]
    ],
    "context": "Ti, Zr e Hf são elementos distintos e possuem referências HC no banco. Partilhar um tipo de célula não torna iguais as distâncias cristalográficas.",
    "question": "Três metais com referência HC apresentam o mesmo parâmetro de rede?",
    "prediction": "Preveja se a coordenada visual e o parâmetro a serão invariantes ao trocar de metal, mantendo o mesmo tipo de estrutura.",
    "evidence": "Meça o parâmetro a de um metal; repita em investigação independente para outro e registre unidade e origem dos dados.",
    "questions": [
      "O que permanece igual ao usar a classe HC em três elementos?",
      "Por que não basta comparar o tamanho dos ícones na tela para inferir distâncias físicas?"
    ],
    "limit": "As medidas pertencem às estruturas de referência, não a uma peça tratada termicamente ou a uma liga real.",
    "teacher": "Usar medida a para distinguir geometria comum e parâmetro específico da referência."
  },
  {
    "id": "cromo-molibdenio-tungstenio",
    "title": "Cromo, Molibdênio e Tungstênio: CCC",
    "sub": "Cr · Mo · W",
    "concept": "Rede CCC e metais de engenharia",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell",
      "neighbors"
    ],
    "mode": "crystalline",
    "criterion": "neighbors",
    "theme": "refratarios-ccc-rede",
    "selector": "examples:24,42,74",
    "track": "estruturas",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Observar a célula de referência",
        "observed"
      ],
      [
        "lattice",
        "Identificar a repetição da rede",
        "observed"
      ],
      [
        "neighbors",
        "Destacar a vizinhança de um centro",
        "criterion"
      ]
    ],
    "context": "Cr, Mo e W compartilham uma estrutura de referência CCC no conjunto de dados, mas aplicações em temperaturas elevadas exigem informações que uma geometria estática não oferece.",
    "question": "Quais relações estruturais aproximam Cr, Mo e W e o que a rede CCC não explica?",
    "prediction": "Preveja a distribuição de vizinhos em uma rede CCC e uma propriedade térmica que não se mede com esse recurso.",
    "evidence": "Identifique célula, rede e vizinhança e anote o metal e o modelo, sem transformar o desenho em um ensaio térmico.",
    "questions": [
      "O que a coordenação CCC informa em cada um desses metais?",
      "Por que resistência à temperatura e processamento não podem ser deduzidos de CCC?"
    ],
    "limit": "Não se simulam temperatura de fusão, fluência, oxidação nem desempenho de componentes industriais.",
    "teacher": "Separar classificação de estrutura e interpretação de aplicações refratárias."
  },
  {
    "id": "niobio-tantalo",
    "title": "Nióbio e Tântalo: vizinhos na rede",
    "sub": "Nb · Ta",
    "concept": "Elementos distintos e estrutura CCC",
    "module": "medir",
    "tools": [
      "latticeParameter",
      "distance",
      "unitCell"
    ],
    "mode": "crystalline",
    "criterion": "measure-a",
    "theme": "niobio-tantalo-ccc",
    "selector": "examples:41,73",
    "track": "estruturas",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Reconhecer a célula unitária",
        "observed"
      ],
      [
        "lattice",
        "Observar a rede de referência",
        "observed"
      ],
      [
        "measure-a",
        "Registrar o parâmetro a com unidade e proveniência",
        "criterion"
      ]
    ],
    "context": "O nióbio e o tântalo são usados em materiais tecnológicos por razões específicas, mas o estudo atual se limita ao arranjo de referência de cada elemento.",
    "question": "Nb e Ta compartilham rede CCC: seus parâmetros de rede precisam ser iguais?",
    "prediction": "Preveja se a é um valor inerente ao tipo CCC ou se deve ser consultado em cada metal.",
    "evidence": "Meça o parâmetro a com a estrutura organizada e confira a referência do metal; faça uma segunda tentativa com outro elemento.",
    "questions": [
      "O que significa medir uma constante de rede em vez de uma distância na imagem?",
      "Quais informações de aplicação ainda faltam para comparar componentes feitos de Nb e Ta?"
    ],
    "limit": "O SILM não reproduz dispositivos supercondutores, capacitores, condições extremas ou composição comercial.",
    "teacher": "Mostrar que classificação CCC não substitui dados específicos de Nb e Ta."
  },
  {
    "id": "platinoides-cfc",
    "title": "Ródio, Paládio, Irídio e Platina",
    "sub": "Rh · Pd · Ir · Pt",
    "concept": "Metais do grupo da platina e CFC",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell",
      "neighbors"
    ],
    "mode": "crystalline",
    "criterion": "neighbors",
    "theme": "grupo-platina-cfc",
    "selector": "examples:45,46,77,78",
    "track": "estruturas",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Observar a célula de referência",
        "observed"
      ],
      [
        "lattice",
        "Identificar a repetição da rede",
        "observed"
      ],
      [
        "neighbors",
        "Destacar a vizinhança de um centro",
        "criterion"
      ]
    ],
    "context": "Ródio, paládio, irídio e platina são representados com rede CFC de referência, mas catálise e durabilidade de materiais não são simuladas pela geometria.",
    "question": "Como quatro elementos tecnologicamente distintos podem compartilhar uma rede CFC?",
    "prediction": "Preveja a vizinhança CFC e compare com o comportamento de outro metal da mesma classe estrutural.",
    "evidence": "Destaque a célula, sua repetição e o centro com vizinhos, documentando elemento e fonte de referência.",
    "questions": [
      "O que o arranjo CFC revela sobre a vizinhança imediata?",
      "Por que esse arranjo não explica isoladamente uma atividade catalítica?"
    ],
    "limit": "Nenhuma reação de catálise, adsorção química ou resistência à corrosão é calculada nesta missão.",
    "teacher": "Utilizar o grupo da platina para contrastar cristalografia e atividade catalítica sem extrapolações."
  },
  {
    "id": "zinco-cadmio",
    "title": "Zinco e Cádmio: HC com cautelas",
    "sub": "Zn · Cd",
    "concept": "Rede HC e limites de aplicação",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell",
      "neighbors"
    ],
    "mode": "crystalline",
    "criterion": "neighbors",
    "theme": "zinco-cadmio-hc",
    "selector": "examples:30,48",
    "track": "estruturas",
    "level": "inicial",
    "objectives": [
      [
        "cell",
        "Observar a célula de referência",
        "observed"
      ],
      [
        "lattice",
        "Identificar a repetição da rede",
        "observed"
      ],
      [
        "neighbors",
        "Destacar a vizinhança de um centro",
        "criterion"
      ]
    ],
    "context": "Zinco e cádmio apresentam estruturas HC de referência; propriedades toxicológicas, controle de exposição e aplicações práticas exigem fontes independentes da simulação.",
    "question": "A mesma classe de rede HC significa usos e riscos equivalentes para Zn e Cd?",
    "prediction": "Preveja a coordenação da célula HC e descreva por que a presença da mesma rede não determina segurança de materiais.",
    "evidence": "Observe a célula, a rede e a vizinhança de um dos metais e registre a composição do modelo selecionado.",
    "questions": [
      "O que é semelhante nas representações HC de Zn e Cd?",
      "Por que o simulador não deve ser usado para decidir práticas de manuseio de cádmio?"
    ],
    "limit": "Atividade somente virtual. Não há avaliação toxicológica, corrosão, contaminação nem indicação de segurança laboratorial.",
    "teacher": "Reforçar que investigações didáticas virtuais não equivalem à autorização para manipulação de substâncias perigosas."
  },
  {
    "id": "estanho-bismuto",
    "title": "Estanho e Bismuto: além dos três modelos",
    "sub": "Sn · Bi",
    "concept": "Estruturas tetragonal e romboédrica",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell"
    ],
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "theme": "estanho-bismuto-nao-canonicos",
    "selector": "examples:50,83",
    "track": "estruturas",
    "level": "avancado",
    "objectives": [
      [
        "cell",
        "Observar a célula do elemento",
        "observed"
      ],
      [
        "lattice",
        "Verificar a repetição de sua rede",
        "observed"
      ],
      [
        "cell-and-lattice",
        "Conferir ambas as representações",
        "criterion"
      ]
    ],
    "context": "A referência selecionada para Sn é tetragonal e para Bi é romboédrica, de modo que forçar uma célula canônica em qualquer um deles seria incorreto.",
    "question": "O que se perde ao tentar descrever estanho e bismuto apenas por CCC, CFC ou HC?",
    "prediction": "Preveja diferenças de forma de célula e de repetição entre a estrutura tetragonal e a romboédrica.",
    "evidence": "Observe a célula e a rede do elemento e compare seu tipo com o de outro metal em uma nova investigação.",
    "questions": [
      "Qual é a referência cristalográfica usada para Sn ou Bi?",
      "Por que não aplicar automaticamente o empacotamento ideal de uma estrutura CFC a esses modelos?"
    ],
    "limit": "A missão não calcula transformações alotrópicas por temperatura nem perfis de solidificação de ligas.",
    "teacher": "Valorizar estruturas não canônicas e evitar aplicar fórmulas de esferas rígidas de maneira universal."
  },
  {
    "id": "lantanideos-dhcp",
    "title": "Lantânio, Praseodímio e Neodímio: elétrons",
    "sub": "La · Pr · Nd · visualização eletrônica",
    "concept": "Deslocalização qualitativa e limites da rede",
    "module": "explorar",
    "tools": [
      "electrons"
    ],
    "mode": "free",
    "criterion": "electrons-motion",
    "theme": "lantanideos-dhcp",
    "selector": "available-examples:57,59,60",
    "track": "familias",
    "level": "intermediario",
    "objectives": [
      [
        "electrons-visible",
        "Mostrar a representação eletrônica coletiva",
        "observed"
      ],
      [
        "electrons-hidden",
        "Ocultar e comparar a representação",
        "observed"
      ],
      [
        "electrons-motion",
        "Retomar a visualização eletrônica acessível",
        "criterion"
      ]
    ],
    "context": "La, Pr e Nd possuem dados cristalográficos de referência, mas a rede interativa não está homologada no SILM. Esta missão explora apenas a representação qualitativa de elétrons deslocalizados.",
    "question": "Como investigar o modelo eletrônico de La, Pr e Nd sem afirmar que a rede DHCP está disponível na Oficina?",
    "prediction": "Preveja o que a representação eletrônica permite observar e o que depende de uma rede cristalina ainda não homologada.",
    "evidence": "Mostre, oculte e retome a camada eletrônica coletiva, registrando claramente o elemento e o limite da representação.",
    "questions": [
      "O que é uma representação eletrônica qualitativa e por que ela não define trajetórias de elétrons?",
      "Por que os dados DHCP documentados não significam uma rede interativa homologada para La, Pr e Nd?"
    ],
    "limit": "A rede interativa de La, Pr e Nd permanece indisponível. Não é possível completar tarefas de célula, vizinhos ou parâmetro de rede com esses elementos.",
    "teacher": "Não cobrar navegação atômica ou cálculos cristalográficos de La, Pr e Nd. Utilizar apenas o modelo eletrônico e discutir o significado de uma referência não homologada."
  },
  {
    "id": "lantanideos-diversos",
    "title": "Lantanídeos: HC, CFC e romboédrica",
    "sub": "Ce · Sm · Gd · Tb · Dy · Yb",
    "concept": "Diversidade estrutural das terras raras",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell"
    ],
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "theme": "diversidade-lantanideos",
    "selector": "examples:58,62,64,65,66,70",
    "track": "familias",
    "level": "avancado",
    "objectives": [
      [
        "cell",
        "Observar a célula do elemento",
        "observed"
      ],
      [
        "lattice",
        "Verificar a repetição de sua rede",
        "observed"
      ],
      [
        "cell-and-lattice",
        "Conferir ambas as representações",
        "criterion"
      ]
    ],
    "context": "O conjunto de referências apresenta Ce e Yb como CFC, Sm como romboédrico e Gd, Tb e Dy como HC; a classe química não fixa uma única geometria.",
    "question": "Por que não podemos atribuir a todos os lantanídeos uma única célula unitária?",
    "prediction": "Antes de escolher o elemento, preveja quais tipos de rede aparecerão e quais limites de comparação persistem.",
    "evidence": "Observe a célula e a rede do elemento escolhido e compare classificações em mais de uma investigação.",
    "questions": [
      "Quais variações estruturais são registradas entre os lantanídeos selecionados?",
      "Por que a rede não prediz automaticamente o comportamento magnético ou óptico de materiais comerciais?"
    ],
    "limit": "Não há simulação de terras raras como ligas, ímãs ou estados eletrônicos f quantitativos.",
    "teacher": "Valorizar a heterogeneidade cristalográfica dentro da série dos lantanídeos."
  },
  {
    "id": "actinideos-estruturas",
    "title": "Tório, Protactínio, Netúnio e Plutônio",
    "sub": "Th · Pa · Np · Pu",
    "concept": "Referências CFC, tetragonal, ortorrômbica e monoclínica",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell"
    ],
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "theme": "actinideos-diversidade",
    "selector": "examples:90,91,93,94",
    "track": "familias",
    "level": "avancado",
    "objectives": [
      [
        "cell",
        "Observar a célula do elemento",
        "observed"
      ],
      [
        "lattice",
        "Verificar a repetição de sua rede",
        "observed"
      ],
      [
        "cell-and-lattice",
        "Conferir ambas as representações",
        "criterion"
      ]
    ],
    "context": "Th, Pa, Np e Pu têm referências de estruturas diferentes no banco. O tema é estritamente de leitura virtual e interpretação geométrica.",
    "question": "Por que os actinídeos requerem referências cristalográficas específicas em vez de um único modelo de rede?",
    "prediction": "Preveja por que a diversidade de redes exige modelos não canônicos além dos exemplos cúbicos usuais.",
    "evidence": "Selecione apenas uma referência virtual, observe a célula e a rede e identifique a classe estrutural.",
    "questions": [
      "Que informações de estrutura o banco disponibiliza para o actinídeo selecionado?",
      "Por que a investigação virtual não corresponde a um procedimento físico com material radioativo?"
    ],
    "limit": "O SILM não reproduz radioatividade, segurança radiológica, reatividade nem transformações metalúrgicas. Não é instrução de manipulação.",
    "teacher": "Tratar como estudo documental remoto: sem demonstrações ou recomendações de obtenção e manuseio real."
  },
  {
    "id": "manganes-polonio",
    "title": "Manganês e Polônio: redes incomuns",
    "sub": "Mn · Po",
    "concept": "Cúbica complexa e cúbica simples",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell"
    ],
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "theme": "formas-incomuns-metalicas",
    "selector": "examples:25,84",
    "track": "estruturas",
    "level": "avancado",
    "objectives": [
      [
        "cell",
        "Observar a célula do elemento",
        "observed"
      ],
      [
        "lattice",
        "Verificar a repetição de sua rede",
        "observed"
      ],
      [
        "cell-and-lattice",
        "Conferir ambas as representações",
        "criterion"
      ]
    ],
    "context": "A referência de Mn é cúbica complexa, enquanto Po tem uma referência cúbica simples. Semelhança no adjetivo cúbico não implica a mesma rede.",
    "question": "Por que uma estrutura cúbica complexa não é equivalente a uma cúbica simples?",
    "prediction": "Preveja o que muda na célula e na repetição quando a base cristalográfica é diferente.",
    "evidence": "Compare visualmente célula e rede de Mn ou Po e registre o tipo estrutural, sem calcular fatores canônicos automaticamente.",
    "questions": [
      "Que informação é ocultada quando chamamos ambas as estruturas apenas de cúbicas?",
      "Por que a demonstração de polônio deve ser exclusivamente virtual?"
    ],
    "limit": "Polônio é radioativo: este é um estudo documental virtual, sem orientações de obtenção/manuseio. O SILM não calcula radioatividade.",
    "teacher": "Evidenciar a distinção SC versus complexo cúbico e reforçar a restrição a atividade virtual."
  },
  {
    "id": "cfc-diferentes-familias",
    "title": "Uma rede CFC em quatro famílias",
    "sub": "Al · Ca · Sr · Pb",
    "concept": "CFC em elementos de famílias distintas",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell",
      "neighbors"
    ],
    "mode": "crystalline",
    "criterion": "neighbors",
    "theme": "cfc-familias-diferentes",
    "selector": "examples:13,20,38,82",
    "track": "familias",
    "level": "intermediario",
    "objectives": [
      [
        "cell",
        "Observar a célula de referência",
        "observed"
      ],
      [
        "lattice",
        "Identificar a repetição da rede",
        "observed"
      ],
      [
        "neighbors",
        "Destacar a vizinhança de um centro",
        "criterion"
      ]
    ],
    "context": "Os elementos Al, Ca, Sr e Pb têm referência CFC, embora pertençam a categorias químicas diferentes e exijam informações distintas para discutir segurança e aplicações.",
    "question": "Al, Ca, Sr e Pb compartilham CFC: por que isso não os transforma em metais equivalentes?",
    "prediction": "Preveja o que a coordenação local terá em comum e que dados químicos continuarão específicos de cada elemento.",
    "evidence": "Observe a célula, repita a rede e destaque os vizinhos para o metal escolhido; compare uma segunda referência separadamente.",
    "questions": [
      "A mesma célula torna semelhantes as propriedades químicas de Ca e Pb?",
      "Qual a diferença entre classificação periódica e tipo de rede?"
    ],
    "limit": "A representação cristalina não avalia reatividade, toxicidade nem propriedades mecânicas de ligas e peças.",
    "teacher": "Mostrar que a mesma estrutura não cria uma família química; manter as discussões de segurança fundamentadas em fontes apropriadas."
  },
  {
    "id": "magnesio-aluminio",
    "title": "Magnésio e Alumínio: HC versus CFC",
    "sub": "Mg · Al",
    "concept": "Comparação de duas redes metálicas",
    "module": "explorar",
    "tools": [
      "structure",
      "unitCell"
    ],
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "theme": "magnesio-aluminio-estruturas",
    "selector": "examples:12,13",
    "track": "aplicacoes",
    "level": "inicial",
    "objectives": [
      [
        "cell",
        "Observar a célula do elemento",
        "observed"
      ],
      [
        "lattice",
        "Verificar a repetição de sua rede",
        "observed"
      ],
      [
        "cell-and-lattice",
        "Conferir ambas as representações",
        "criterion"
      ]
    ],
    "context": "Mg possui referência HC e Al referência CFC. Componentes com esses elementos podem incluir ligas e tratamentos que a célula do metal puro não descreve.",
    "question": "Metais usados em componentes leves precisam apresentar a mesma estrutura cristalina?",
    "prediction": "Preveja como a repetição cristalina difere entre HC e CFC e por que isso não é uma comparação direta de densidade.",
    "evidence": "Observe célula e rede de Mg ou Al; registre o tipo e compare com outra investigação sem inferir o comportamento de ligas.",
    "questions": [
      "Que diferença geométrica distingue Mg e Al no SILM?",
      "Por que desempenho mecânico de uma liga não resulta só da rede do elemento?"
    ],
    "limit": "O SILM não determina resistência de ligas Mg–Al, microestruturas reais ou massas de peças a partir do desenho.",
    "teacher": "Relacionar aplicações e características macroscópicas sem simular uma liga não implementada."
  }
];
 const referenceType=z=>{const e=S.data.get(z);return e?.structures?.find(x=>x.id===e.referenceStructure)?.type||null;};
 const pickMetals=(selector,property=null)=>{
  let eligible;
  if(selector==='canonical')eligible=canonical;
  else if(selector==='general')eligible=solid.filter(z=>S.crystal.eligibility(S.data.get(z)).general);
  else if(selector==='all-crystalline')eligible=solid;
  else if(selector.startsWith('type:'))eligible=solid.filter(z=>referenceType(z)===selector.slice(5));
  else if(selector.startsWith('category-all:'))eligible=all.filter(z=>S.data.get(z).classification.category===selector.slice(13));
  else if(selector.startsWith('category:'))eligible=solid.filter(z=>S.data.get(z).classification.category===selector.slice(9));
  else if(selector.startsWith('examples:'))eligible=selector.slice(9).split(',').map(Number).filter(z=>solid.includes(z));
  else if(selector.startsWith('available-examples:'))eligible=selector.slice(19).split(',').map(Number).filter(z=>all.includes(z));
  else throw Error('Seleção de metais desconhecida: '+selector);
  if(property)eligible=eligible.filter(z=>S.properties.eligibility(S.data.get(z))[property]?.status!=='unavailable');
  return [...new Set(eligible)].sort((a,b)=>a-b);
 };
 for(const spec of EXPANDED_CASES){
  const metals=pickMetals(spec.selector,spec.property||null);
  if(!metals.length)throw Error('Missão sem metal elegível: '+spec.id);
  const mission=make(spec.id,spec.title,spec.sub,spec.concept,spec.module,spec.tools,spec.mode,spec.criterion,spec.question,spec.theme,metals);
  mission.category=spec.track;mission.difficulty=spec.level;
  mission.study={context:spec.context,question:spec.question,prediction:spec.prediction,evidence:spec.evidence,questions:spec.questions,limit:spec.limit,teacher:spec.teacher};
  mission.evidenceObjectives=spec.objectives.map(([id,label,mode])=>({id,label,mode}));
  mission.guidance.action=spec.evidence;
  mission.guidance.hint=spec.prediction;
  mission.guidance.criterion=spec.question;
  if(spec.objectives.some(([id,_,mode])=>mode==='observed'&&id.startsWith('scale-')))mission.initialState.workshopScale=1;
  if(mission.evidenceObjectives.length<2||mission.evidenceObjectives.filter(x=>x.mode==='criterion').length!==1||
   new Set(mission.evidenceObjectives.map(x=>x.id)).size!==mission.evidenceObjectives.length)
   throw Error('Evidências duplicadas ou sem critério: '+spec.id);
  list.push(mission);
 }

 for(const mission of list){
  const entries=EVIDENCE_OBJECTIVES[mission.id]||mission.evidenceObjectives?.map(x=>[x.id,x.label,x.mode]);
  if(!entries?.length||!entries.some(x=>x[2]==='criterion')||new Set(entries.map(x=>x[0])).size!==entries.length)throw Error('Evidências inválidas: '+mission.id);
  mission.evidenceObjectives=entries.map(([id,label,mode])=>({id,label,mode}));
 }
 const checked=S.routes.validate(list);if(!checked.ok)throw Error('Missões inválidas: '+checked.reason);
 const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
 S.missions=Object.freeze({registry:freeze(list),get:id=>list.find(m=>m.id===id),validate:items=>S.routes.validate(items)});
 S.activities=Object.freeze({registry:Object.freeze([...S.routes.registry,...list]),get:id=>S.routes.get(id)||S.missions.get(id)});
})();
