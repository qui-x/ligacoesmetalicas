'use strict';
/* Roteiros descrevem o uso dos serviços existentes; não possuem estado ou fórmulas científicas próprios. */
(()=>{
 const S=SILM,eligible=S.data.elements.filter(e=>e.silmEligibility.status==='available'),crystals=eligible.filter(e=>S.crystal.eligibility(e).status==='available');
 const all=eligible.map(e=>e.atomicNumber),solid=crystals.map(e=>e.atomicNumber);
 const make=(id,title,subtitle,module,description,objectives,tools,mode,guidance,criterion,metals=solid)=>({id,version:1,title,subtitle,module,description,objectives,prerequisites:['Selecionar um metal elegível e observar as condições de referência.'],metalSelection:{mode:'choice',atomicNumbers:metals},structureRequirements:mode,allowedTools:tools,initialState:{mode,units:mode==='free'?4:1},guidance,completionCriteria:criterion,reportTemplate:['observations','interpretation','conclusion'],sources:['src-silm-conventions']});
 const list=[
 make('ordem-metal','A Ordem por Trás do Metal','Célula unitária e repetição da rede','explorar','Uma peça metálica parece contínua. Investigue como uma unidade de repetição descreve sua organização interna.',['Relacionar célula e rede sem confundir desenho e tamanho real.'],['structure','unitCell','neighbors'],'crystalline',{action:'Compare Célula e Rede. Observe a vizinhança de um centro metálico.',hint:'Altere a vista sem trocar o metal: o sólido continua além da célula.',criterion:'Observar célula e rede da mesma estrutura.'},'cell-and-lattice'),
 make('eletrons-metal','Elétrons sem Endereço Fixo','Distribuição coletiva no modelo metálico','explorar','Como representar elétrons que não pertencem a um único centro metálico?',['Distinguir a representação coletiva de uma contagem literal de elétrons livres.'],['electrons'],'free',{action:'Mostre e oculte os elétrons e observe sua distribuição entre os centros.',hint:'Os pontos luminosos são marcadores qualitativos; não conte esses pontos como elétrons reais.',criterion:'Observar a distribuição eletrônica coletiva.'},'electrons',all),
 make('deformacao-metal','Quando o Metal se Deforma','Reorganização coletiva e maleabilidade','explorar','Uma lâmina pode mudar de forma mantendo sua constituição metálica. Investigue a representação dessa mudança.',['Relacionar deformação coletiva e maleabilidade sem interpretar a animação como ensaio mecânico.'],['structure','unitCell','malleability'],'crystalline',{action:'Inicie Maleabilidade, aplique compressão e restaure o estado-base.',hint:'Compare a forma antes e depois. Os sítios de referência permanecem guardados no modelo.',criterion:'Observar compressão e restaurar a representação.'},'deform-and-restore'),
 make('medindo-ordem','Medindo a Ordem','Parâmetro de rede no modelo cristalográfico','medir','Uma imagem ampliada parece maior. A medida científica também muda?',['Medir a e distinguir valor do modelo, dado tabelado e escala da tela.'],['distance','latticeParameter','coordination'],'crystalline',{action:'Use Parâmetro de rede e escolha dois sítios que delimitam a na célula. Consulte o registro em Dados.',hint:'Escolha uma aresta da célula. Zoom e rotação não alteram o valor em ångström.',criterion:'Registrar uma medida válida do parâmetro a.'},'measure-a'),
 make('volume-celula','Quanto Cabe em uma Célula?','Geometria e volume da célula unitária','calcular','O volume representado depende dos parâmetros de rede e da célula adotada. Investigue essa relação.',['Calcular o volume com entradas cuja origem esteja identificada.'],['cellVolume','effectiveAtoms'],'crystalline',{action:'Escolha a fórmula de volume e examine a origem de cada parâmetro antes de calcular.',hint:'No HC, observe que a célula adotada é o prisma hexagonal convencional.',criterion:'Registrar um cálculo válido de volume da célula.'},'cell-volume')
 ];
 const knownTools=new Set(['structure','unitCell','neighbors','electrons',...S.properties.ids,...Object.keys(S.measurement.types),...Object.values(S.formulas).map(f=>f.quantity)]);
 function validate(registry){
  if(!Array.isArray(registry)||!registry.length)return {ok:false,reason:'REGISTRY_INVALID'};const ids=new Set();
  for(const r of registry){
   if(!r||!/^[-a-z0-9]{3,60}$/.test(r.id)||ids.has(r.id)||!Number.isInteger(r.version)||r.version<1)return {ok:false,reason:'IDENTITY_INVALID'};ids.add(r.id);
   if(!['explorar','medir','calcular'].includes(r.module)||r.secondaryModule!==undefined)return {ok:false,reason:'MODULE_INVALID'};
   const criteria=['cell-and-lattice','electrons','deform-and-restore','measure-a','cell-volume','crystalline','neighbors','electrons-motion','property-field','packing-factor'];
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
