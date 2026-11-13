'use strict';
/* Roteiros descrevem o uso dos serviços existentes; não possuem estado ou fórmulas científicas próprios. */
(()=>{
 const S=SILM,eligible=S.data.elements.filter(e=>e.silmEligibility.status==='available'&&e.silmEligibility.scope!=='structure-only'),crystals=eligible.filter(e=>S.crystal.eligibility(e).status==='available');
 const all=eligible.map(e=>e.atomicNumber),solid=crystals.map(e=>e.atomicNumber);
 /* Deformação didática (maleabilidade) só nos modelos canônicos CCC, CFC e HC: no modelo geral ela não é homologada. */
 const canonical=crystals.filter(e=>!S.crystal.eligibility(e).general).map(e=>e.atomicNumber);
 const make=(id,title,subtitle,module,description,objectives,tools,mode,guidance,criterion,metals=solid)=>({id,version:1,title,subtitle,module,description,objectives,prerequisites:['Selecionar um metal elegível e observar as condições de referência.'],metalSelection:{mode:'choice',atomicNumbers:metals},structureRequirements:mode,allowedTools:tools,initialState:{mode,units:mode==='free'?4:1},guidance,completionCriteria:criterion,reportTemplate:['observations','interpretation','conclusion'],sources:['src-silm-conventions']});
 const list=[
 make('ordem-metal','A Ordem por Trás do Metal','Célula unitária e repetição da rede','explorar','Uma peça metálica parece contínua. Investigue como uma unidade de repetição descreve sua organização interna.',['Relacionar célula e rede sem confundir desenho e tamanho real.'],['structure','unitCell','neighbors'],'crystalline',{action:'Compare Célula e Rede. Observe a vizinhança de um centro metálico.',hint:'Altere a vista sem trocar o metal: o sólido continua além da célula.',criterion:'Observar célula e rede da mesma estrutura.'},'cell-and-lattice'),
 make('eletrons-metal','Elétrons sem Endereço Fixo','Distribuição coletiva no modelo metálico','explorar','Como representar elétrons que não pertencem a um único centro metálico?',['Distinguir a representação coletiva de uma contagem literal de elétrons livres.'],['electrons'],'free',{action:'Mostre e oculte os elétrons e observe sua distribuição entre os centros.',hint:'Os pontos luminosos são marcadores qualitativos; não conte esses pontos como elétrons reais.',criterion:'Observar a distribuição eletrônica coletiva.'},'electrons',all),
 make('deformacao-metal','Quando o Metal se Deforma','Reorganização coletiva e maleabilidade','explorar','Uma lâmina pode mudar de forma mantendo sua constituição metálica. Investigue a representação dessa mudança.',['Relacionar deformação coletiva e maleabilidade sem interpretar a animação como ensaio mecânico.'],['structure','unitCell','malleability'],'crystalline',{action:'Inicie Maleabilidade, aplique compressão e restaure o estado-base.',hint:'Compare a forma antes e depois. Os sítios de referência permanecem guardados no modelo.',criterion:'Observar compressão e restaurar a representação.'},'deform-and-restore',canonical),
 make('medindo-ordem','Medindo a Ordem','Parâmetro de rede no modelo cristalográfico','medir','Uma imagem ampliada parece maior. A medida científica também muda?',['Medir o parâmetro de rede a e distinguir a medida do modelo, o dado tabelado e a escala da tela.'],['distance','latticeParameter','coordination'],'crystalline',{action:'Use o instrumento Parâmetro de rede e escolha dois centros nas pontas de uma aresta da célula que corresponda ao parâmetro a (no hexagonal compacto, uma aresta da base). Consulte o registro em Dados.',hint:'Escolha uma aresta da célula. Zoom e rotação não alteram o valor em ångström.',criterion:'Registrar uma medida válida do parâmetro a.'},'measure-a'),
 make('volume-celula','Quanto Cabe em uma Célula?','Geometria e volume da célula unitária','calcular','O volume representado depende dos parâmetros de rede e da célula adotada. Investigue essa relação.',['Calcular o volume com entradas cuja origem esteja identificada.'],['cellVolume','effectiveAtoms'],'crystalline',{action:'Escolha a fórmula de volume e examine a origem de cada parâmetro antes de calcular.',hint:'No HC, observe que a célula adotada é o prisma hexagonal convencional.',criterion:'Registrar um cálculo válido de volume da célula.'},'cell-volume')
 ];

 /* Roteiros no modelo do SIAB: problema, hipótese, procedimento, observações,
    perguntas e relatório. Não geram resultados científicos ou travas de missão. */
 const LEGACY_STUDIES={
  "ordem-metal": {
    "context": "Investigação guiada pelo problema: O que a célula unitária explica sobre a repetição de uma rede metálica?",
    "category": "estruturas",
    "difficulty": "inicial",
    "question": "O que a célula unitária explica sobre a repetição de uma rede metálica?",
    "hypothesis": "Preveja como a mesma estrutura aparece quando a visualização muda de Célula para Rede.",
    "tasks": [
      "Prepare um metal com estrutura cristalina homologada e registre o tipo de referência.",
      "Abra a célula unitária e descreva os centros que participam do arranjo.",
      "Alterne para a rede, observe a repetição e retorne à célula para comparar.",
      "Registre a organização observada e explique por que o modelo não é uma micrografia da peça."
    ],
    "observe": [
      "Tipo de estrutura e metal escolhido",
      "Célula e repetição da rede",
      "Vizinhança e limites da representação"
    ],
    "interpretation": [
      "A célula mostra o metal inteiro?",
      "Qual aspecto da organização é um dado de referência e qual é representação didática?"
    ],
    "limits": "O desenho não mede o tamanho de um grão nem a estrutura de um objeto comercial.",
    "teacher": "Confrontar a hipótese com a repetição cristalográfica; evitar confusão entre célula e objeto."
  },
  "eletrons-metal": {
    "context": "Investigação guiada pelo problema: Como representar elétrons deslocalizados sem tratá-los como trajetórias individuais?",
    "category": "fundamentos",
    "difficulty": "inicial",
    "question": "Como representar elétrons deslocalizados sem tratá-los como trajetórias individuais?",
    "hypothesis": "Preveja o que deve continuar visível ao ativar e desativar a camada de elétrons.",
    "tasks": [
      "Selecione qualquer metal habilitado para investigação, inclusive um que não possua rede liberada.",
      "Mostre a representação coletiva dos elétrons e descreva sua distribuição visual.",
      "Oculte e volte a mostrar a camada, usando redução de movimento se necessário.",
      "Registre o que essa representação ajuda a explicar e o que não permite contar ou medir."
    ],
    "observe": [
      "Metal selecionado e condições de referência",
      "Representação eletrônica visível/oculta",
      "Limites da animação ou representação estática"
    ],
    "interpretation": [
      "A quantidade de pontos desenhados equivale ao número real de elétrons?",
      "Por que a distribuição coletiva não representa órbitas fixas?"
    ],
    "limits": "O SILM não calcula estados eletrônicos, velocidades de deriva ou orbitais individuais.",
    "teacher": "Valorizar representações acessíveis e evitar explicações quantitativas a partir dos pontos gráficos."
  },
  "deformacao-metal": {
    "context": "Investigação guiada pelo problema: O que uma deformação representada permite discutir sobre a maleabilidade de um metal?",
    "category": "propriedades",
    "difficulty": "intermediario",
    "question": "O que uma deformação representada permite discutir sobre a maleabilidade de um metal?",
    "hypothesis": "Preveja o que acontece ao aplicar compressão e ao restaurar a geometria inicial.",
    "tasks": [
      "Escolha um metal de rede canônica com maleabilidade disponível e registre sua estrutura.",
      "Observe a célula e a rede antes de ativar a deformação.",
      "Ative Maleabilidade, aplique compressão e descreva a resposta visual do modelo.",
      "Restaure a condição de referência e explique quais características não foram medidas experimentalmente."
    ],
    "observe": [
      "Estado inicial da rede",
      "Compressão no modelo",
      "Estado restaurado e limitações mecânicas"
    ],
    "interpretation": [
      "A animação calcula limite de escoamento ou resistência mecânica?",
      "Por que composição e processamento industrial importam para a maleabilidade real?"
    ],
    "limits": "A deformação é transposição didática, não simula tensão-deformação, defeitos cristalinos ou corpos de prova reais.",
    "teacher": "Diferenciar maleabilidade, dureza e resistência; não inferir curvas numéricas de animações."
  },
  "medindo-ordem": {
    "context": "Investigação guiada pelo problema: A distância cristalográfica muda quando a câmera aproxima ou gira a célula?",
    "category": "medicoes",
    "difficulty": "intermediario",
    "question": "A distância cristalográfica muda quando a câmera aproxima ou gira a célula?",
    "hypothesis": "Preveja se o valor em ångström muda quando somente o zoom se altera.",
    "tasks": [
      "Escolha um metal com estrutura de referência homologada e abra o módulo Medir.",
      "Selecione Parâmetro de rede e os centros correspondentes a uma aresta da célula.",
      "Registre o valor do parâmetro a, a unidade e a fonte em Dados → Medições.",
      "Mude apenas a vista ou o zoom e confronte leitura científica com tamanho da imagem."
    ],
    "observe": [
      "Metal e célula de referência",
      "Parâmetro a e unidade",
      "Origem do dado e efeito visual da câmera"
    ],
    "interpretation": [
      "O que distingue um valor em ångström de pixels da tela?",
      "Resolução numérica significa incerteza experimental?"
    ],
    "limits": "A medida corresponde às coordenadas e parâmetros do modelo, não a uma amostra física.",
    "teacher": "Exigir unidade, seleção correta e origem do parâmetro, não apenas o número final."
  },
  "volume-celula": {
    "context": "Investigação guiada pelo problema: Quais parâmetros científicos determinam o volume da célula unitária?",
    "category": "calculos",
    "difficulty": "intermediario",
    "question": "Quais parâmetros científicos determinam o volume da célula unitária?",
    "hypothesis": "Preveja quais dimensões da célula serão utilizadas pela fórmula de volume.",
    "tasks": [
      "Escolha uma estrutura cristalina validada e ative o módulo Calcular.",
      "Localize a fórmula de volume compatível com a geometria de referência.",
      "Confira as entradas, unidades e fontes antes de executar o cálculo.",
      "Registre o resultado e relacione as dimensões calculadas à célula, não ao volume da peça."
    ],
    "observe": [
      "Tipo cristalográfico e parâmetros de rede",
      "Fórmula e origem das entradas",
      "Volume calculado e unidade"
    ],
    "interpretation": [
      "O que muda no cálculo entre células de geometrias diferentes?",
      "Por que o volume da célula não é o volume de um objeto comercial?"
    ],
    "limits": "O resultado é geométrico e depende das dimensões de referência; não substitui medidas macroscópicas.",
    "teacher": "Analisar a coerência dimensional e a proveniência antes de qualquer comparação de valores."
  }
};
 const EXPERIMENTS=[
  {
    "id": "roteiro-alcalinos",
    "title": "Uma família, uma rede?",
    "subtitle": "Metais alcalinos e estrutura CCC",
    "category": "familias",
    "difficulty": "inicial",
    "selector": "category:alkali",
    "module": "explorar",
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "tools": [
      "structure",
      "unitCell"
    ],
    "question": "Quais aspectos cristalográficos se repetem nos alcalinos e quais variam entre os elementos?",
    "context": "Metais alcalinos apresentam exemplos de rede CCC no banco, mas identidade química e reatividade não resultam da célula.",
    "hypothesis": "Preveja a repetição da célula CCC e um dado específico que precisa ser verificado para cada metal.",
    "tasks": [
      "Escolha um metal alcalino disponível e identifique seu símbolo e referência cristalográfica.",
      "Observe a célula unitária e depois a rede periódica.",
      "Registre os centros e a organização; repita com outro metal em investigação separada.",
      "Compare os registros sem extrapolar para reatividade ou manuseio do metal."
    ],
    "observe": [
      "Elemento escolhido",
      "Estrutura de referência e fonte",
      "Semelhanças/diferenças geométricas"
    ],
    "interpretation": [
      "Uma estrutura CCC determina a reatividade de um alcalino?",
      "A célula CCC tem sempre o mesmo parâmetro dimensional?"
    ],
    "limits": "Atividade exclusivamente virtual; não simula reação com água ou manuseio de metais reativos."
  },
  {
    "id": "roteiro-alcalinoterrosos",
    "title": "Alcalinoterrosos não são todos iguais",
    "subtitle": "Be, Mg, Ca, Sr, Ba e Ra",
    "category": "familias",
    "difficulty": "intermediario",
    "selector": "category:alkaline-earth",
    "module": "explorar",
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "tools": [
      "structure",
      "unitCell"
    ],
    "question": "Uma mesma família química determina uma única estrutura cristalina?",
    "context": "Os metais alcalinoterrosos têm diferentes estruturas de referência no banco científico.",
    "hypothesis": "Preveja se a mesma organização se aplica a todos os elementos dessa família.",
    "tasks": [
      "Escolha um metal alcalinoterroso e verifique a classe de estrutura disponível.",
      "Observe a célula de referência e a rede.",
      "Repita o procedimento, em investigação independente, com um segundo metal da família.",
      "Compare a geometria observada e as fontes, sem supor equivalência química."
    ],
    "observe": [
      "Elemento e classe de estrutura",
      "Célula e rede",
      "Comparação entre referências"
    ],
    "interpretation": [
      "Como a classificação periódica se diferencia do tipo de rede?",
      "O que os modelos não dizem sobre aplicações e riscos dos materiais?"
    ],
    "limits": "Não se reproduzem reação, toxicidade nem radioatividade; Ra é tratado apenas virtualmente."
  },
  {
    "id": "roteiro-transicao",
    "title": "Os Metais de Transição em Perspectiva",
    "subtitle": "Estruturas diversificadas do bloco d",
    "category": "familias",
    "difficulty": "intermediario",
    "selector": "category:d-metal",
    "module": "explorar",
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "tools": [
      "structure",
      "unitCell"
    ],
    "question": "Por que não é possível descrever os metais do bloco d por uma única célula?",
    "context": "O bloco d do catálogo contém elementos com células CCC, CFC, HC e estruturas gerais.",
    "hypothesis": "Preveja quais diferenças geométricas aparecerão ao selecionar dois metais do bloco d.",
    "tasks": [
      "Selecione um metal do bloco d e identifique a sua rede de referência.",
      "Compare Célula e Rede, registrando o tipo e o metal.",
      "Escolha outro metal do bloco d em uma investigação distinta.",
      "Confronte os tipos de rede e os limites de inferir propriedades tecnológicas."
    ],
    "observe": [
      "Metal e classe cristalográfica",
      "Repetição observada",
      "Comparação entre duas investigações"
    ],
    "interpretation": [
      "Como a diversidade estrutural aparece dentro de uma mesma categoria do bloco d?",
      "A rede determina por si só condutividade e resistência?"
    ],
    "limits": "O programa representa estruturas de referência e não uma liga comercial nem uma transformação de fase."
  },
  {
    "id": "roteiro-bloco-p",
    "title": "Metais do Bloco p: além dos Cubos",
    "subtitle": "Al, Sn, Tl, Pb, Bi e Po",
    "category": "familias",
    "difficulty": "intermediario",
    "selector": "category:p-metal",
    "module": "explorar",
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "tools": [
      "structure",
      "unitCell"
    ],
    "question": "Quais redes metálicas aparecem quando observamos os metais do bloco p?",
    "context": "O banco inclui referências CFC, tetragonais, romboédricas, hexagonais e outras para metais do bloco p.",
    "hypothesis": "Preveja se a representação de cada elemento cabe nos três modelos canônicos.",
    "tasks": [
      "Escolha um metal do bloco p e leia o tipo cristalográfico de referência.",
      "Explore Célula e Rede, sem converter estruturas gerais para CCC/CFC/HC.",
      "Registre o tipo e a origem da informação.",
      "Compare com um segundo elemento apenas em nova investigação."
    ],
    "observe": [
      "Estrutura específica",
      "Limitações da célula canônica",
      "Comparação e fonte"
    ],
    "interpretation": [
      "Por que não se pode impor o fator de empacotamento CFC a uma rede romboédrica?",
      "O que diferencia categoria química e estrutura?"
    ],
    "limits": "O estudo não valida manuseio de Pb ou Po; radioatividade e toxicidade não são simuladas."
  },
  {
  "id": "roteiro-lantanideos",
  "title": "Terras Raras: explorar os metais e suas propriedades",
  "subtitle": "Sc, Y e lantanídeos · do objeto aos elétrons",
  "category": "familias",
  "difficulty": "intermediario",
  "selector": "rare-earths",
  "module": "explorar",
  "mode": "free",
  "criterion": "electrons",
  "tools": [
    "electrons",
    "electrical"
  ],
  "question": "O que podemos descobrir sobre as terras raras explorando objetos, grãos, elétrons e a resposta elétrica dos metais?",
  "context": "As terras raras são 17 elementos: escândio (Sc), ítrio (Y) e os 15 lantanídeos, de La a Lu. No SILM, 16 estão disponíveis para investigação; o promécio (Pm) permanece indisponível. Investigue as representações de cada elemento, observe uma aplicação e compare o modelo de ligação metálica com a resposta elétrica qualitativa. A exploração começa na Oficina, não em uma lista de restrições.",
  "hypothesis": "Escolha uma terra rara e preveja como a distribuição dos elétrons e a resposta visual a um campo elétrico poderão ajudar a compreender seu caráter metálico. Em que aspectos você espera semelhanças com outro elemento do grupo?",
  "tasks": [
    "Escolha Sc, Y ou um lantanídeo disponível. Abra Objeto, examine a aplicação ilustrada e identifique o componente metálico que será investigado.",
    "Percorra a escala Grãos, examine as regiões da microestrutura ilustrativa e descreva quais diferenças visuais você percebe em relação ao objeto.",
    "No módulo Explorar, mostre e oculte os elétrons deslocalizados. Observe sua distribuição representada junto aos centros metálicos, sem tratá-los como órbitas de partículas individuais.",
    "Ative a propriedade elétrica e aplique um campo. Compare o estado com e sem campo e registre o comportamento qualitativo exibido pela Oficina.",
    "Para elementos com rede habilitada, avance até Rede e Centro: examine a célula, navegue pelos centros e destaque vizinhos. Registre as descobertas e, depois, investigue uma segunda terra rara em uma nova sessão."
  ],
  "observe": [
    "Terra rara escolhida, símbolo, objeto ilustrado e componente investigado",
    "Regiões de grãos representadas e características da microestrutura ilustrativa",
    "Representação de elétrons deslocalizados visível e oculta",
    "Resposta elétrica qualitativa antes e depois de aplicar o campo",
    "Rede, célula e vizinhança quando habilitadas; observações para comparar outra terra rara"
  ],
  "interpretation": [
    "Como a visualização de elétrons deslocalizados e a resposta ao campo ajudam a compreender a ligação metálica?",
    "Que semelhanças e diferenças surgem ao explorar outra terra rara, considerando objeto, microestrutura, rede e respostas disponíveis?",
    "Quais características do material você investigaria a seguir, e por quê?"
  ],
  "limits": "Os gráficos e as respostas de campo são representações didáticas. La, Pr e Nd ainda não permitem navegar na rede cristalográfica interativa; nesse caso, prossiga pelas escalas e recursos disponíveis. O modelo não calcula magnetismo de ligas Nd–Fe–B nem estrutura eletrônica quantitativa.",
  "teacher": "Comece pelo objeto e incentive a manipulação livre de elétrons e campo elétrico. Organize comparações em duas investigações registradas separadamente. Explique que as terras raras incluem Sc, Y e quinze lantanídeos; Pm não está habilitado. Trate diferenças de disponibilidade de ferramentas como orientação pontual, não como objetivo central."
},
  {
    "id": "roteiro-actinideos",
    "title": "Actinídeos: estruturas sem experimento físico",
    "subtitle": "Estudo documental virtual",
    "category": "familias",
    "difficulty": "avancado",
    "selector": "category:actinide",
    "module": "explorar",
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "tools": [
      "structure",
      "unitCell"
    ],
    "question": "Por que diferentes actinídeos apresentam estruturas de referência distintas?",
    "context": "A investigação virtual compara modelos cristalográficos sem manipular substâncias radioativas.",
    "hypothesis": "Preveja diferenças entre as células de Th, Pa, Np e Pu com base nas referências disponíveis.",
    "tasks": [
      "Selecione um actinídeo habilitado na interface virtual.",
      "Observe sua célula e a repetição da rede.",
      "Identifique o tipo cristalográfico e a origem do dado.",
      "Compare com outra referência virtual e discuta os limites de segurança e do modelo."
    ],
    "observe": [
      "Elemento e tipo de célula",
      "Padrão de repetição",
      "Fonte e limites da representação"
    ],
    "interpretation": [
      "Por que os actinídeos não podem ser reduzidos a uma única rede?",
      "Por que o estudo digital não autoriza obtenção ou manuseio de amostras reais?"
    ],
    "limits": "Nenhuma instrução de obtenção/manuseio. O SILM não calcula radiação, reatividade ou transformação nuclear."
  },
  {
    "id": "roteiro-ccc",
    "title": "Cúbica de Corpo Centrado: a Rede",
    "subtitle": "Estruturas CCC em vários metais",
    "category": "estruturas",
    "difficulty": "inicial",
    "selector": "type:CCC",
    "module": "explorar",
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "tools": [
      "structure",
      "unitCell"
    ],
    "question": "Que padrão se repete numa célula cúbica de corpo centrado?",
    "context": "Vários elementos têm rede CCC de referência, mas seus parâmetros físicos não são idênticos.",
    "hypothesis": "Preveja a posição de centros e a diferença entre visualizar célula e rede.",
    "tasks": [
      "Escolha um metal CCC e observe a célula convencional.",
      "Identifique qualitativamente os centros de canto e do corpo.",
      "Alterne para a rede e observe a repetição.",
      "Registre o que é geometria comum e o que pertence ao metal escolhido."
    ],
    "observe": [
      "Metal e referência CCC",
      "Célula convencional",
      "Rede e comparação de parâmetros"
    ],
    "interpretation": [
      "Uma célula CCC é um cubo isolado?",
      "A estrutura CCC indica resistência mecânica numérica?"
    ],
    "limits": "Não há medida de propriedades mecânicas reais nem de grãos experimentais."
  },
  {
    "id": "roteiro-cfc",
    "title": "Cúbica de Faces Centradas: repetir",
    "subtitle": "Metais CFC em uma mesma classe",
    "category": "estruturas",
    "difficulty": "inicial",
    "selector": "type:CFC",
    "module": "explorar",
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "tools": [
      "structure",
      "unitCell"
    ],
    "question": "O que diferencia a disposição da célula CFC da CCC?",
    "context": "Cu, Ag, Au, Al e outros elementos apresentam estruturas CFC de referência, mas podem ter aplicações distintas.",
    "hypothesis": "Preveja onde aparecem os centros das faces e como a célula forma uma rede.",
    "tasks": [
      "Escolha um metal CFC e confira a referência.",
      "Observe os centros nas faces e vértices da célula.",
      "Amplie a rede e identifique a periodicidade.",
      "Registre uma comparação com a CCC sem inferir propriedades não medidas."
    ],
    "observe": [
      "Metal e rede CFC",
      "Centros das faces e repetição",
      "Limitações da comparação"
    ],
    "interpretation": [
      "CFC é um tipo de liga ou de arranjo cristalino?",
      "Por que um contato de ouro e um fio de cobre não são objetos equivalentes?"
    ],
    "limits": "A rede não reproduz revestimentos, interfaces elétricas ou processos de liga."
  },
  {
    "id": "roteiro-hc",
    "title": "Hexagonal Compacta: nova organização",
    "subtitle": "Metais HC e célula hexagonal",
    "category": "estruturas",
    "difficulty": "intermediario",
    "selector": "type:HC",
    "module": "explorar",
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "tools": [
      "structure",
      "unitCell"
    ],
    "question": "Como se repete a organização hexagonal compacta?",
    "context": "Metais como Mg, Ti e Zn apresentam referências HC no banco, distintas das cúbicas.",
    "hypothesis": "Preveja a organização da base hexagonal e sua repetição pela rede.",
    "tasks": [
      "Selecione um metal HC e observe a célula convencional.",
      "Identifique a geometria de sua base e a repetição em três dimensões.",
      "Compare a visualização da célula com a rede.",
      "Registre a diferença do modelo HC em relação aos modelos cúbicos."
    ],
    "observe": [
      "Metal e estrutura HC",
      "Base hexagonal e rede",
      "Diferenças em relação a CCC/CFC"
    ],
    "interpretation": [
      "Por que não se deve chamar a célula HC de cubo?",
      "A classificação HC determina isoladamente propriedades mecânicas?"
    ],
    "limits": "O desenho não determina texturas cristalográficas reais ou comportamentos de ligas tratadas."
  },
  {
    "id": "roteiro-gerais",
    "title": "Quando CCC, CFC e HC não bastam",
    "subtitle": "Estruturas cristalinas gerais",
    "category": "estruturas",
    "difficulty": "avancado",
    "selector": "general",
    "module": "explorar",
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "tools": [
      "structure",
      "unitCell"
    ],
    "question": "Como investigar células que não pertencem às três estruturas canônicas?",
    "context": "O banco possui estruturas tetragonais, romboédricas, complexas e outras que exigem modelos cristalográficos específicos.",
    "hypothesis": "Preveja o que se perde ao substituir uma estrutura geral por uma célula cúbica ideal.",
    "tasks": [
      "Escolha um metal de estrutura geral habilitada.",
      "Observe a célula de referência com seu tipo geométrico.",
      "Passe para a rede e compare a periodicidade.",
      "Registre o tipo e a fonte, sem aplicar fórmulas de empacotamento inadequadas."
    ],
    "observe": [
      "Tipo da estrutura geral",
      "Repetição observada",
      "Limitações das fórmulas canônicas"
    ],
    "interpretation": [
      "O que torna a referência de Sn diferente da de Cu?",
      "Uma célula cúbica complexa equivale à cúbica simples?"
    ],
    "limits": "O fator de empacotamento de esferas rígidas canônicas não se aplica automaticamente a estruturas gerais."
  },
  {
    "id": "roteiro-objeto-centro",
    "title": "Do Objeto ao Centro Metálico",
    "subtitle": "Quatro escalas com perguntas diferentes",
    "category": "aplicacoes",
    "difficulty": "intermediario",
    "selector": "crystalline",
    "module": "explorar",
    "mode": "free",
    "criterion": "crystalline",
    "tools": [
      "structure",
      "unitCell",
      "neighbors"
    ],
    "question": "Quais aspectos do material aparecem em Objeto, Grãos, Rede e Centro?",
    "context": "A Oficina oferece quatro representações complementares, não ampliação calibrada da mesma amostra.",
    "hypothesis": "Preveja qual pergunta será respondida em cada escala e quais informações exigiriam uma análise real.",
    "tasks": [
      "Selecione um objeto e identifique o componente metálico representado.",
      "Passe por Grãos e identifique as regiões esquemáticas sem inferir composição por cor.",
      "Observe Rede e Centro, organize o modelo de referência se necessário.",
      "Relacione o que cada escala permite explicar e registre a limitação da travessia."
    ],
    "observe": [
      "Objeto e componente investigado",
      "Grãos esquemáticos",
      "Rede e centro de referência"
    ],
    "interpretation": [
      "Grãos e rede são medições da mesma peça?",
      "Quais escalas são modelos e quais dados provêm de fontes?"
    ],
    "limits": "Não há microscopia contínua nem determinação experimental de microestrutura do objeto."
  },
  {
    "id": "roteiro-campo-eletrico",
    "title": "Sob Campo Elétrico",
    "subtitle": "Representação coletiva dos portadores",
    "category": "propriedades",
    "difficulty": "intermediario",
    "selector": "property:electrical",
    "module": "explorar",
    "mode": "free",
    "criterion": "property-field",
    "tools": [
      "electrons",
      "electrical"
    ],
    "question": "O que o modelo representa quando um campo elétrico é aplicado?",
    "context": "A propriedade elétrica permite observar um efeito didático, mas não calcular automaticamente a condutividade de um componente.",
    "hypothesis": "Preveja a diferença da representação antes e depois de aplicar o campo.",
    "tasks": [
      "Escolha um metal com propriedade elétrica habilitada.",
      "Ative a camada eletrônica e observe o estado sem campo.",
      "Aplique o campo e compare a resposta visual.",
      "Registre o que é efeito do modelo e quais dados faltam para a comparação quantitativa."
    ],
    "observe": [
      "Condição sem campo",
      "Condição com campo",
      "Dados científicos versus movimento gráfico"
    ],
    "interpretation": [
      "O movimento visual equivale a medir corrente?",
      "Que informações seriam necessárias para comparar resistividades sob as mesmas condições?"
    ],
    "limits": "A representação não fornece corrente elétrica, mobilidade ou resistência de um fio real."
  },
  {
    "id": "roteiro-fluxo-calor",
    "title": "Uma Fonte de Calor no Metal",
    "subtitle": "Representação térmica e condições",
    "category": "propriedades",
    "difficulty": "intermediario",
    "selector": "property:thermal",
    "module": "explorar",
    "mode": "crystalline",
    "criterion": "property-heating",
    "tools": [
      "structure",
      "thermal"
    ],
    "question": "Como interpretar a resposta térmica do modelo sem confundi-la com uma medida?",
    "context": "Condução térmica e aquecimento têm representações didáticas distintas das medições de temperatura de laboratório.",
    "hypothesis": "Preveja a alteração visual ao ativar uma fonte de calor e o que permanece como referência.",
    "tasks": [
      "Selecione metal e rede com propriedade térmica habilitada.",
      "Registre o estado visual antes de ligar a fonte de calor.",
      "Ative o aquecimento e observe as etapas disponíveis.",
      "Desative a fonte e interprete a resposta, sem inventar temperatura ou taxa física."
    ],
    "observe": [
      "Estado inicial",
      "Resposta visual ao aquecimento",
      "Retorno/limites da representação"
    ],
    "interpretation": [
      "Por que a animação não é um termômetro?",
      "Que parâmetros são necessários para discutir difusividade térmica numericamente?"
    ],
    "limits": "Não se calcula experimentalmente curva de aquecimento ou temperatura real de uma peça."
  },
  {
    "id": "roteiro-brilho",
    "title": "O Metal e a Luz",
    "subtitle": "Brilho metálico e visualização óptica",
    "category": "propriedades",
    "difficulty": "intermediario",
    "selector": "property:luster",
    "module": "explorar",
    "mode": "crystalline",
    "criterion": "property-light",
    "tools": [
      "structure",
      "luster"
    ],
    "question": "O que significa observar brilho metálico no modelo?",
    "context": "A interação com luz representa qualitativamente uma resposta óptica da superfície idealizada, não uma fotografia ou espectro experimental.",
    "hypothesis": "Preveja a diferença entre o estado visual com e sem a fonte de luz.",
    "tasks": [
      "Prepare um metal cuja representação óptica esteja disponível.",
      "Observe o aspecto inicial e ative a interação com luz.",
      "Compare a resposta óptica representada.",
      "Descreva os limites ligados a rugosidade, oxidação, composição e comprimento de onda."
    ],
    "observe": [
      "Fonte de luz ausente/presente",
      "Resposta óptica representada",
      "Limites da superfície idealizada"
    ],
    "interpretation": [
      "Brilho metálico significa que todos os metais têm a mesma cor?",
      "Por que oxidação e acabamento alterariam a aparência de uma peça real?"
    ],
    "limits": "Sem espectroscopia ou medição de refletância; cores gráficas não identificam composição."
  },
  {
    "id": "roteiro-maleabilidade",
    "title": "Da Chapa ao Modelo",
    "subtitle": "Maleabilidade em rede canônica",
    "category": "propriedades",
    "difficulty": "intermediario",
    "selector": "property:malleability",
    "module": "explorar",
    "mode": "crystalline",
    "criterion": "deform-and-restore",
    "tools": [
      "structure",
      "malleability"
    ],
    "question": "O que uma compressão didática pode esclarecer sobre a maleabilidade?",
    "context": "A geometria de referência é mantida separada da visualização de deformação de um corpo de prova.",
    "hypothesis": "Preveja a resposta da camada mecânica ao aplicar compressão e restaurar a geometria.",
    "tasks": [
      "Escolha um metal com maleabilidade habilitada e rede de referência.",
      "Observe a geometria inicial e ative a propriedade.",
      "Aplique compressão e depois restaure o estado.",
      "Compare os estados sem afirmar que foi medido limite de escoamento."
    ],
    "observe": [
      "Geometria de referência",
      "Compressão",
      "Restauração e limitações"
    ],
    "interpretation": [
      "Maleabilidade e resistência à tração são equivalentes?",
      "Por que microestrutura real e processamento importam?"
    ],
    "limits": "Não há ensaio de compressão calibrado ou comportamento de uma liga específica."
  },
  {
    "id": "roteiro-ductilidade",
    "title": "Fios e Alongamento",
    "subtitle": "Ductilidade didática",
    "category": "propriedades",
    "difficulty": "intermediario",
    "selector": "property:ductility",
    "module": "explorar",
    "mode": "crystalline",
    "criterion": "property-elongation",
    "tools": [
      "structure",
      "ductility"
    ],
    "question": "Como representar alongamento sem confundi-lo com um ensaio de tração?",
    "context": "O módulo explora ductilidade de forma qualitativa; os controles não medem tensão, deformação percentual ou falha.",
    "hypothesis": "Preveja a alteração da geometria macroscópica do corpo de prova ao aplicar alongamento.",
    "tasks": [
      "Prepare uma estrutura com ductilidade disponível.",
      "Observe a geometria de referência.",
      "Ative Ductilidade e aplique alongamento.",
      "Interprete o que o desenho representa e os dados ausentes."
    ],
    "observe": [
      "Geometria inicial",
      "Alongamento representado",
      "Limitações de medida"
    ],
    "interpretation": [
      "Qual é a diferença entre ductilidade e maleabilidade?",
      "Por que o mesmo desenho não determina um gráfico tensão × deformação?"
    ],
    "limits": "A resposta gráfica não mede deformação real, resistência ou ruptura."
  },
  {
    "id": "roteiro-parametro-a",
    "title": "O Parâmetro a em Diferentes Redes",
    "subtitle": "Medida cristalográfica com fonte",
    "category": "medicoes",
    "difficulty": "intermediario",
    "selector": "crystalline",
    "module": "medir",
    "mode": "crystalline",
    "criterion": "measure-a",
    "tools": [
      "latticeParameter",
      "distance"
    ],
    "question": "Metais da mesma rede apresentam necessariamente o mesmo parâmetro a?",
    "context": "O instrumento fornece uma leitura do modelo de referência e não uma medida instrumental de uma amostra real.",
    "hypothesis": "Preveja se o parâmetro a depende apenas da classe estrutural ou também do metal.",
    "tasks": [
      "Selecione um metal com rede interativa habilitada e entre em Medir.",
      "Escolha centros adequados e registre o parâmetro a.",
      "Anote unidade e proveniência em Dados → Medições.",
      "Repita com outro metal em uma investigação independente e compare."
    ],
    "observe": [
      "Elemento e estrutura",
      "Parâmetro a",
      "Unidade e origem"
    ],
    "interpretation": [
      "Zoom altera um valor em ångström?",
      "O resultado pode ser usado sem identificar o metal e a estrutura?"
    ],
    "limits": "A resolução numérica do simulador não substitui incerteza experimental."
  },
  {
    "id": "roteiro-volume",
    "title": "Volume de Célula: Fórmula e Geometria",
    "subtitle": "Cálculo para estruturas homologadas",
    "category": "calculos",
    "difficulty": "intermediario",
    "selector": "crystalline",
    "module": "calcular",
    "mode": "crystalline",
    "criterion": "cell-volume",
    "tools": [
      "cellVolume",
      "effectiveAtoms"
    ],
    "question": "Como a geometria da célula influencia o cálculo do volume?",
    "context": "O cálculo usa parâmetros tabelados e fórmulas compatíveis com a estrutura selecionada.",
    "hypothesis": "Preveja quais dimensões serão usadas para uma célula cúbica versus uma hexagonal.",
    "tasks": [
      "Escolha uma estrutura validada e ative Calcular.",
      "Verifique a fórmula, as entradas e a fonte dos parâmetros.",
      "Execute o cálculo de volume da célula.",
      "Registre unidades e explique por que isso não representa volume de uma peça."
    ],
    "observe": [
      "Metal e geometria da célula",
      "Entradas científicas",
      "Volume e unidade"
    ],
    "interpretation": [
      "Quais dimensões entram na fórmula?",
      "Qual é a diferença entre volume de célula e volume macroscópico?"
    ],
    "limits": "Não calcula densidade de uma liga ou volume de um objeto sem informações adicionais."
  },
  {
    "id": "roteiro-empacotamento",
    "title": "O Espaço na Célula",
    "subtitle": "Fator de empacotamento ideal",
    "category": "calculos",
    "difficulty": "avancado",
    "selector": "canonical",
    "module": "calcular",
    "mode": "crystalline",
    "criterion": "packing-factor",
    "tools": [
      "cellVolume",
      "radius",
      "packingFactor"
    ],
    "question": "Como representar a fração geométrica ocupada por esferas rígidas ideais?",
    "context": "O fator de empacotamento depende de uma convenção geométrica válida para modelos canônicos CCC, CFC e HC.",
    "hypothesis": "Preveja quais entradas são exigidas para comparar modelos de esferas rígidas.",
    "tasks": [
      "Selecione uma estrutura canônica habilitada.",
      "Obtenha volume da célula e raio usado pelo modelo.",
      "Calcule o fator de empacotamento e verifique as entradas.",
      "Explique por que o resultado não é densidade eletrônica ou porcentagem de liga."
    ],
    "observe": [
      "Tipo da célula e contagem geométrica",
      "Raio e volume de referência",
      "Fator de empacotamento"
    ],
    "interpretation": [
      "Por que o resultado depende do modelo de esferas rígidas?",
      "Em que tipos de célula não se deve aplicar automaticamente essa fórmula?"
    ],
    "limits": "Não se aplica automaticamente a estruturas gerais; não representa densidade eletrônica nem defeitos."
  },
  {
    "id": "roteiro-comparar-cu-al",
    "title": "Cobre e Alumínio em Componentes",
    "subtitle": "Duas investigações de metais puros",
    "category": "aplicacoes",
    "difficulty": "intermediario",
    "selector": "examples:13,29",
    "module": "explorar",
    "mode": "crystalline",
    "criterion": "cell-and-lattice",
    "tools": [
      "structure",
      "unitCell"
    ],
    "question": "Por que um produto pode utilizar Cu ou Al sem que a mesma célula implique o mesmo desempenho?",
    "context": "Cu e Al são elementos com referência CFC, mas componentes reais dependem de composição e processamento.",
    "hypothesis": "Preveja uma semelhança estrutural e uma diferença que o modelo cristalino não consegue calcular.",
    "tasks": [
      "Explore a célula e rede de Cu ou Al e registre a referência.",
      "Localize um componente ilustrativo do material na escala Objeto.",
      "Finalize o registro dessa investigação.",
      "Repita com o outro metal e compare as conclusões, sem mesclar os estados."
    ],
    "observe": [
      "Metal e célula CFC",
      "Aplicação ilustrada",
      "Limites de comparação"
    ],
    "interpretation": [
      "A rede CFC explica por si só a resistência de um cabo?",
      "Que dados adicionais seriam necessários para comparar projetos de componentes?"
    ],
    "limits": "A Oficina não modela cabos comerciais, ligas, dimensionamento elétrico ou perdas industriais."
  },
  {
    "id": "roteiro-cu-nd",
    "title": "Cobre e Neodímio: aplicações diferentes",
    "subtitle": "Metal condutor × terra rara em liga",
    "category": "aplicacoes",
    "difficulty": "intermediario",
    "selector": "examples-all:29,60",
    "module": "explorar",
    "mode": "free",
    "criterion": "electrons",
    "tools": [
      "electrons"
    ],
    "question": "Como distinguir cobre elementar de um ímã Nd–Fe–B sem confundir os modelos?",
    "context": "Cu puro e Nd puro são investigados separadamente. O ímã comercial é uma liga intermetálica com Fe e B, não o metal neodímio isolado.",
    "hypothesis": "Preveja o que a representação eletrônica permite comparar e quais propriedades tecnológicas ficam fora do motor.",
    "tasks": [
      "Escolha Cu ou Nd e identifique sua aplicação ilustrativa, sem supor pureza do objeto.",
      "Ative a representação eletrônica e registre seus limites.",
      "Conclua o relatório; em investigação separada repita para o outro elemento.",
      "Compare os registros sem atribuir ao Nd puro propriedades de um ímã Nd–Fe–B."
    ],
    "observe": [
      "Elemento selecionado",
      "Modelo eletrônico disponível",
      "Limitações e aplicação ilustrativa"
    ],
    "interpretation": [
      "Uma peça contendo cobre corresponde ao motor completo?",
      "Por que o magnetismo da liga Nd–Fe–B não é calculado a partir da rede do Nd puro?"
    ],
    "limits": "Sem simulação de magnetismo, estrutura Nd₂Fe₁₄B, composição de ligas ou propriedades elétricas quantitativas de componentes."
  }
];
 const byType=z=>{const e=S.data.get(z);return e?.structures?.find(st=>st.id===e.referenceStructure)?.type||null;};
 const availableFor=selector=>{
  let picked=[];
  if(selector==='crystalline')picked=solid;
  else if(selector==='canonical')picked=canonical;
  else if(selector==='rare-earths')picked=[21,39,...Array.from({length:15},(_,i)=>57+i)].filter(z=>all.includes(z));
  else if(selector==='general')picked=solid.filter(z=>S.crystal.eligibility(S.data.get(z)).general);
  else if(selector.startsWith('category-all:'))picked=all.filter(z=>S.data.get(z).classification.category===selector.slice(13));
  else if(selector.startsWith('category:'))picked=solid.filter(z=>S.data.get(z).classification.category===selector.slice(9));
  else if(selector.startsWith('type:'))picked=solid.filter(z=>byType(z)===selector.slice(5));
  else if(selector.startsWith('property:'))picked=solid.filter(z=>S.properties.eligibility(S.data.get(z))[selector.slice(9)]?.status!=='unavailable');
  else if(selector.startsWith('examples-all:'))picked=selector.slice(13).split(',').map(Number).filter(z=>all.includes(z));
  else if(selector.startsWith('examples:'))picked=selector.slice(9).split(',').map(Number).filter(z=>solid.includes(z));
  else throw Error('Seletor de roteiro desconhecido: '+selector);
  return [...new Set(picked)].sort((a,b)=>a-b);
 };
 const expandStudy=x=>({
  context:x.context,question:x.question,hypothesis:x.hypothesis,tasks:x.tasks,
  observe:x.observe,interpretation:x.interpretation,limits:x.limits,
  teacher:x.teacher||'Orientar a escolha de evidências, discutir aproximações e não inferir dados ausentes.'
 });
 for(const r of list){
  const study=LEGACY_STUDIES[r.id];
  if(!study)throw Error('Falta estudo didático do roteiro: '+r.id);
  r.category=study.category;r.difficulty=study.difficulty;r.study=expandStudy(study);
 }
 for(const spec of EXPERIMENTS){
  const metals=availableFor(spec.selector);
  if(!metals.length)throw Error('Roteiro sem metal elegível: '+spec.id);
  if(spec.mode==='crystalline'&&metals.some(z=>!solid.includes(z)))throw Error('Roteiro requer rede não habilitada: '+spec.id);
  const r=make(spec.id,spec.title,spec.subtitle,spec.module,spec.context,[spec.question],spec.tools,
   spec.mode,{action:spec.tasks[0],hint:spec.observe.join(' · '),criterion:spec.question},spec.criterion,metals);
  r.category=spec.category;r.difficulty=spec.difficulty;r.study=expandStudy(spec);
  list.push(r);
 }
 const knownTools=new Set(['structure','unitCell','neighbors','electrons',...S.properties.ids,...Object.keys(S.measurement.types),...Object.values(S.formulas).map(f=>f.quantity)]);
 function validate(registry){
  if(!Array.isArray(registry)||!registry.length)return {ok:false,reason:'REGISTRY_INVALID'};const ids=new Set();
  for(const r of registry){
   if(!r||!/^[-a-z0-9]{3,60}$/.test(r.id)||ids.has(r.id)||!Number.isInteger(r.version)||r.version<1)return {ok:false,reason:'IDENTITY_INVALID'};ids.add(r.id);
   if(!['explorar','medir','calcular'].includes(r.module)||r.secondaryModule!==undefined)return {ok:false,reason:'MODULE_INVALID'};
   const criteria=['cell-and-lattice','electrons','deform-and-restore','measure-a','cell-volume','crystalline','neighbors','electrons-motion','property-field','packing-factor','property-heating','property-light','property-elongation'];
   if(!criteria.includes(r.completionCriteria)||!r.initialState||r.initialState.mode!==r.structureRequirements||!['free','crystalline'].includes(r.initialState.mode)||!Number.isInteger(r.initialState.units)||r.initialState.units<1)return {ok:false,reason:'CONTEXT_INVALID'};
   if(!r.title||!r.subtitle||!r.description||!r.objectives?.length||!r.guidance?.criterion||!r.completionCriteria)return {ok:false,reason:'CONTENT_INVALID'};
   if(!Array.isArray(r.allowedTools)||!r.allowedTools.length||r.allowedTools.some(t=>!knownTools.has(t)))return {ok:false,reason:'TOOLS_INVALID'};
   const permitted=r.module==='medir'?Object.keys(S.measurement.types):r.module==='calcular'?Object.values(S.formulas).map(f=>f.quantity):['structure','unitCell','neighbors','electrons',...S.properties.ids];
   if(r.allowedTools.some(t=>!permitted.includes(t)))return {ok:false,reason:'TOOLS_MODULE_INVALID'};
   if(r.metalSelection?.mode!=='choice'||!Array.isArray(r.metalSelection.atomicNumbers)||!r.metalSelection.atomicNumbers.length||r.metalSelection.atomicNumbers.some(z=>!all.includes(z)||(r.structureRequirements==='crystalline'&&!solid.includes(z))))return {ok:false,reason:'METALS_INVALID'};
   if(!r.sources?.length||r.sources.some(id=>!S.data.source(id)))return {ok:false,reason:'SOURCES_INVALID'};
  }return {ok:true};
 }
 const result=validate(list);if(!result.ok)throw Error('Catálogo SILM inválido: '+result.reason);
 const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
 S.routes=Object.freeze({registry:freeze(list),get:id=>list.find(r=>r.id===id),validate,coverage:()=>eligible.map(e=>({atomicNumber:e.atomicNumber,symbol:e.symbol,routes:list.filter(r=>r.metalSelection.atomicNumbers.includes(e.atomicNumber)).map(r=>r.id)}))});
})();
