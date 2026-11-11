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
  ...make('objeto-ao-centro','Do Objeto ao Centro','Quatro escalas de investigação','Objeto, grãos, rede e centro','explorar',['structure','unitCell','neighbors'],'free','neighbors','Percorra as quatro escalas, selecione um centro e destaque seus vizinhos.','estrutura-metais',[29,60]),
  version:1,study:{"context":"Um condutor de cobre e um ímã de liga Nd–Fe–B exemplificam funções de materiais muito diferentes. A imagem do objeto não revela sozinha a estrutura interna nem a composição completa.","question":"O que aprendemos ao atravessar as representações Objeto, Grãos, Rede e Centro sem supor uma ampliação experimental contínua?","prediction":"Antes de navegar, preveja o que cada escala pode explicar e o que exigiria uma medida real da amostra.","evidence":"Observe as quatro escalas do material escolhido e destaque a vizinhança de um centro na rede de referência.","questions":["Por que o cobre de um enrolamento não equivale ao motor inteiro?","Por que o ímã Nd–Fe–B não representa neodímio puro? O SILM já calcula magnetismo ou só mostra estruturas de referência?"],"limit":"Grãos esquemáticos e centros da rede descrevem modelos didáticos; não são micrografia e difração da mesma amostra. Magnetismo de Nd–Fe–B não é calculado nesta versão.","teacher":"Comparar Cobre (Cu) e Neodímio (Nd) em duas tentativas; não afirmar que a cena do Nd representa a fase Nd₂Fe₁₄B nem confundir a liga com metal puro."},initialState:{mode:'free',units:4,workshopScale:1},
  comparison:{metals:[29,60],note:'Investigações separadas. Cu puro não é o motor; Nd puro não é a liga Nd–Fe–B.'}
 });
 for(const mission of list){
  const entries=EVIDENCE_OBJECTIVES[mission.id];
  if(!entries?.length||!entries.some(x=>x[2]==='criterion')||new Set(entries.map(x=>x[0])).size!==entries.length)throw Error('Evidências inválidas: '+mission.id);
  mission.evidenceObjectives=entries.map(([id,label,mode])=>({id,label,mode}));
 }
 const checked=S.routes.validate(list);if(!checked.ok)throw Error('Missões inválidas: '+checked.reason);
 const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
 S.missions=Object.freeze({registry:freeze(list),get:id=>list.find(m=>m.id===id),validate:items=>S.routes.validate(items)});
 S.activities=Object.freeze({registry:Object.freeze([...S.routes.registry,...list]),get:id=>S.routes.get(id)||S.missions.get(id)});
})();
