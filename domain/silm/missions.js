'use strict';
(()=>{
 const S=SILM,all=S.data.elements.filter(e=>e.silmEligibility.status==='available').map(e=>e.atomicNumber),solid=all.filter(z=>S.crystal.eligibility(S.data.get(z)).status==='available');
 /* Fator de empacotamento usa esferas rígidas de raio único: só nos modelos canônicos (CCC, CFC, HC), não nas estruturas gerais. */
 const canonical=solid.filter(z=>!S.crystal.eligibility(S.data.get(z)).general);
 const make=(id,title,subtitle,concept,module,tools,mode,criterion,objective,theme,metals=solid)=>({id,version:1,type:'mission',title,subtitle,concept,module,description:objective,objectives:[objective],prerequisites:['Use um metal elegível e respeite as condições de referência.'],metalSelection:{mode:'choice',atomicNumbers:metals},structureRequirements:mode,allowedTools:tools,initialState:{mode,units:mode==='free'?4:1},completionCriteria:criterion,guidance:{action:objective,hint:'Use os controles do laboratório e confira os registros em Dados.',criterion:objective},relatedThemes:[theme],sources:['src-silm-conventions'],reportTemplate:[]});
 const list=[
 make('montagem-ordem','Da Montagem à Ordem','Organização cristalográfica','Montagem e cristalografia','explorar',['structure','unitCell'],'free','crystalline','Organize a montagem segundo a estrutura de referência do metal.','estruturas-cristalinas'),
 make('vizinhos-metal','Quem São os Vizinhos?','Coordenação e vizinhança','Vizinhos imediatos','explorar',['structure','unitCell','neighbors'],'crystalline','neighbors','Selecione um centro metálico e mostre sua vizinhança imediata.','estrutura-metais'),
 make('eletrons-movimento','Elétrons em Movimento','Representação coletiva','Elétrons deslocalizados','explorar',['electrons'],'free','electrons-motion','Mostre a distribuição eletrônica com a preferência de movimento ativada. Com movimento reduzido, observe a representação estática equivalente.','eletrons-deslocalizados',all),
 make('campo-metal','Metal sob Campo','Resposta qualitativa ao campo elétrico','Condutividade elétrica','explorar',['electrons','electrical'],'free','property-field','Inicie Condutividade elétrica e aplique o campo no modelo coletivo.','propriedades-metalicas',all),
 make('medida-rede','Medida de uma Rede','Comprimento cristalográfico','Parâmetro de rede','medir',['latticeParameter'],'crystalline','measure-a','Registre uma medida válida de a no modelo cristalino.','medindo-estruturas'),
 make('espaco-ocupado','Quanto Espaço Está Ocupado?','Volume ocupado por esferas rígidas','Fator de empacotamento','calcular',['effectiveAtoms','cellVolume','radius','packingFactor'],'crystalline','packing-factor','Calcule o volume da célula e o raio do modelo; use esses registros para obter o fator de empacotamento.','estrutura-calculo',canonical)
 ];
 const checked=S.routes.validate(list);if(!checked.ok)throw Error('Missões inválidas: '+checked.reason);
 const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
 S.missions=Object.freeze({registry:freeze(list),get:id=>list.find(m=>m.id===id),validate:items=>S.routes.validate(items)});
 S.activities=Object.freeze({registry:Object.freeze([...S.routes.registry,...list]),get:id=>S.routes.get(id)||S.missions.get(id)});
})();
