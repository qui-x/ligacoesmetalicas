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
 INVESTIGATIONS['cobre-neodimio']={"problem":"Por que o cobre de um enrolamento e um ímã permanente Nd–Fe–B exigem explicações diferentes, embora ambos envolvam materiais metálicos?","prediction":"Antes de investigar, diferencie o metal puro (Cu ou Nd), a peça do objeto e o material de liga. Preveja quais modelos cristalográficos o SILM pode mostrar.","actions":["Explore um exemplo de cobre no Objeto e atravesse as escalas até a rede e o centro; registre a estrutura cristalina de referência e a função do componente.","Conclua ou encerre essa investigação antes de preparar o neodímio. Na segunda tentativa, compare Objeto, Grãos, Rede e Centro, lembrando que a imagem do ímã representa uma liga Nd–Fe–B.","Compare os registros e explique por que a cena do elemento Nd não demonstra estrutura, propriedade magnética ou composição do ímã comercial."],"evidence":"Apresente dois registros separados, identificando o elemento (Cu ou Nd), o objeto de origem, a estrutura de referência e uma limitação científica em cada caso.","reflection":"Por que a elevada condutividade do cobre não basta para explicar a função de um ímã Nd–Fe–B? Quais dados e técnicas seriam necessários para discutir o magnetismo da liga?"};
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
 for(const theme of list){
  const study=INVESTIGATIONS[theme.id];
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
