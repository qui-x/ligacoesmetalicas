'use strict';
window.SILM=window.SILM||{};
/* Atividades preparadas pelo professor (Etapa 11 da paridade SIAB × SILM).
   - O padrão vem do SIAB 1.0.0 (tipo + atividade + título, recursos do aluno, navegação, link e biblioteca); o conteúdo
     é do SILM: a atividade é sempre um roteiro, uma missão ou uma montagem pronta que já existem no catálogo do SILM.
   - O professor só RESTRINGE: escolhe metais entre os elegíveis da atividade e recursos entre os liberados por ela. Os
     recursos de que o critério científico depende não podem ser retirados; nenhum critério, dado ou resposta é criado.
   - O guia do professor é composto com textos que já existem no SILM (roteiro ou missão, temas relacionados, limitações
     do Manual e fontes registradas). Não há "resposta esperada" inventada: o critério é o do próprio roteiro/missão.
   - O link guarda a configuração (base64url de JSON). Ele organiza a atividade; não é proteção contra edição. */
(()=>{
 const S=SILM,SCHEMA=1,MAX_TOKEN=8000,MAX_LIBRARY=50;
 const TYPES=Object.freeze({route:'Roteiro Experimental',mission:'Missão',preset:'Montagem pronta'});
 const NAVIGATION=Object.freeze({restrita:'Restrita à atividade',livre:'Livre'});
 const TOOL_LABELS=Object.freeze({structure:'Estrutura cristalina',unitCell:'Célula unitária',neighbors:'Vizinhança',electrons:'Elétrons deslocalizados',malleability:'Maleabilidade',distance:'Distância',latticeParameter:'Parâmetro de rede',coordination:'Coordenação',electrical:'Condutividade elétrica',radius:'Raio do modelo',packingFactor:'Fator de empacotamento',cellVolume:'Volume da célula',effectiveAtoms:'Contagem geométrica de átomos'});
 /* Recursos de que o critério de conclusão (route-session.ready) depende: não podem ser retirados pelo professor. */
 const REQUIRED=Object.freeze({crystalline:['structure'],neighbors:['neighbors'],'electrons-motion':['electrons'],'property-field':['electrons','electrical'],
  'packing-factor':['cellVolume','radius','packingFactor'],'cell-and-lattice':['structure','unitCell'],electrons:['electrons'],'deform-and-restore':['malleability'],
  'measure-a':['latticeParameter'],'cell-volume':['cellVolume']});
 const MODULE=Object.freeze({explorar:'Explorar',medir:'Medir',calcular:'Calcular'});
 const IDENTITY=Object.freeze(['className','teacher','date']);
 const fail=message=>{throw new Error(message);};
 function catalog(type){return type==='route'?S.routes.registry:type==='mission'?S.missions.registry:type==='preset'?S.readyAssemblies.catalog:[];}
 function item(type,id){return catalog(type).find(x=>x.id===id)||null;}
 /* O que a atividade exige e permite (para o formulário e para a validação). */
 function requirements(type,id){
  const x=item(type,id);if(!x)return null;
  if(type==='preset'){const d=S.readyAssemblies.describe(x);return {type,item:x,title:x.title,module:x.module,metals:d.available?[x.atomicNumber]:[],tools:[],required:[],available:d.available,reason:d.reason};}
  const required=(REQUIRED[x.completionCriteria]||[]).filter(t=>x.allowedTools.includes(t));
  return {type,item:x,title:x.title,module:x.module,metals:[...x.metalSelection.atomicNumbers],tools:[...x.allowedTools],required,available:x.metalSelection.atomicNumbers.length>0,reason:null};
 }
 const text=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
 /* Validação completa: a configuração vem do formulário, do link ou de um arquivo importado. */
 function validate(c){
  if(!c||typeof c!=='object'||Array.isArray(c)||c.schema!==SCHEMA)fail('Configuração de atividade inválida ou de outra versão.');
  if(typeof c.id!=='string'||!/^act-[a-z0-9-]{6,60}$/.test(c.id))fail('Identificador da atividade inválido.');
  if(!Object.hasOwn(TYPES,c.type))fail('Tipo de atividade inválido.');
  const req=requirements(c.type,c.item);if(!req)fail('Atividade incompatível com o catálogo deste SILM.');if(!req.available)fail(req.reason||'Atividade indisponível neste SILM.');
  if(!Array.isArray(c.metals)||!c.metals.length||c.metals.length>req.metals.length||new Set(c.metals).size!==c.metals.length||c.metals.some(z=>!req.metals.includes(z)))fail('Metais fora dos elegíveis para esta atividade.');
  if(!Array.isArray(c.tools)||new Set(c.tools).size!==c.tools.length||c.tools.some(t=>!req.tools.includes(t)))fail('Recursos fora dos liberados por esta atividade.');
  if(req.required.some(t=>!c.tools.includes(t)))fail('Faltam recursos necessários ao critério da atividade: '+req.required.filter(t=>!c.tools.includes(t)).map(t=>TOOL_LABELS[t]||t).join(', ')+'.');
  if(!Object.hasOwn(NAVIGATION,c.navigation)||(c.type==='preset'&&c.navigation!=='livre'))fail('Navegação inválida para esta atividade.');
  const identity=c.identification&&typeof c.identification==='object'&&!Array.isArray(c.identification)?c.identification:{};
  return Object.freeze({schema:SCHEMA,id:c.id,type:c.type,item:c.item,title:text(c.title,200)||req.title,metals:Object.freeze([...c.metals].sort((a,b)=>a-b)),
   tools:Object.freeze(req.tools.filter(t=>c.tools.includes(t))),navigation:c.navigation,identification:Object.freeze(Object.fromEntries(IDENTITY.map(k=>[k,text(identity[k],160)])))});
 }
 const newId=()=>'act-'+(globalThis.crypto?.randomUUID?.()||(Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10))).toLowerCase();
 /* Link: "v1." + base64url(JSON em UTF-8). */
 const b64=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 function encode(config){const c=validate(config);return 'v1.'+b64(new TextEncoder().encode(JSON.stringify(c)));}
 function decode(token){
  if(typeof token!=='string'||token.length>MAX_TOKEN)fail('Link inválido.');const [v,body,...extra]=token.split('.');if(v!=='v1'||!body||extra.length||!/^[A-Za-z0-9_-]+$/.test(body))fail('Link incompleto ou alterado.');
  let value;try{value=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(body.replace(/-/g,'+').replace(/_/g,'/')),ch=>ch.charCodeAt(0))));}catch{fail('Link incompleto ou alterado.');}
  return validate(value);
 }
 /* Biblioteca (várias atividades): validação de cada registro; registros inválidos são descartados na leitura. */
 function library(list){if(!Array.isArray(list))return [];const out=[],ids=new Set();for(const r of list.slice(0,MAX_LIBRARY)){try{const c=validate(r?.config);if(ids.has(c.id))continue;ids.add(c.id);out.push({config:c,createdAt:typeof r.createdAt==='string'?r.createdAt:new Date(0).toISOString(),updatedAt:typeof r.updatedAt==='string'?r.updatedAt:r.createdAt||new Date(0).toISOString()});}catch{}}return out;}
 /* Arquivo exportado: uma ou várias configurações. A importação é tudo ou nada. */
 const exportDocument=configs=>({format:'silm-teacher-activities',version:1,activities:configs.map(c=>validate(c))});
 function importDocument(value){
  const list=value?.format==='silm-teacher-activities'&&value.version===1&&Array.isArray(value.activities)?value.activities:value?.schema===SCHEMA?[value]:null;
  if(!list||!list.length)fail('O arquivo não é uma atividade do SILM.');if(list.length>MAX_LIBRARY)fail('O arquivo tem atividades demais (máximo '+MAX_LIBRARY+').');
  return list.map((c,i)=>{try{return validate(c);}catch(error){fail('Atividade '+(i+1)+' do arquivo: '+error.message);}});
 }
 const toolNames=ids=>ids.map(t=>TOOL_LABELS[t]||t).join(', ');
 const metalNames=zs=>zs.map(z=>{const e=S.data.get(z);return e?e.name+' ('+e.symbol+')':String(z);});
 /* Resumo legível (para o professor e para o aluno). */
 function summary(config){
  const c=validate(config),req=requirements(c.type,c.item),all=c.metals.length===req.metals.length&&req.metals.length>1;
  return {title:c.title,type:TYPES[c.type],itemTitle:req.title,module:MODULE[req.module]||req.module,
   metals:c.type==='preset'?metalNames(c.metals)[0]:all?'O aluno escolhe entre os '+req.metals.length+' metais elegíveis':c.metals.length===1?metalNames(c.metals)[0]:'O aluno escolhe entre: '+metalNames(c.metals).join(', '),
   tools:c.type==='preset'?'Os da oficina livre':toolNames(c.tools),navigation:NAVIGATION[c.navigation]};
 }
 /* Guia do professor composto com o conteúdo existente do SILM. */
 function manualDetail(topicId,prefix){const t=S.manual?.topics?.find(x=>x.id===topicId);const d=t?.details?.find(x=>x.title.startsWith(prefix));return d?d.text:null;}
 function limitations(tools,module){
  const out=[],add=x=>{if(x&&!out.includes(x))out.push(x);};
  add(manualDetail('estruturas-cristalinas','Limitações'));
  if(tools.includes('electrons'))add(manualDetail('eletrons-deslocalizados','Limites'));
  if(tools.some(t=>S.properties?.ids?.includes(t)))add(manualDetail('propriedades-metalicas','Limitações'));
  if(module==='medir')add(S.manual?.topics?.find(x=>x.id==='medir')?.content);
  if(module==='calcular')add(S.manual?.topics?.find(x=>x.id==='calcular')?.content);
  return out;
 }
 function guide(config){
  const c=validate(config),req=requirements(c.type,c.item),x=req.item,s=summary(c),sections=[];
  const add=(title,paragraphs,list)=>sections.push({title,paragraphs:(paragraphs||[]).filter(Boolean),list:list||null});
  if(c.type==='preset'){
   const d=S.readyAssemblies.describe(x);
   add('Objetivo',[x.objective]);
   add('Preparação',[],['Montagem pronta: '+x.title+'.','Na oficina: '+d.element.name+' ('+d.element.symbol+') · '+d.structureLabel+' · célula unitária completa com '+d.cellSites+' unidades.','Condição de referência: '+d.temperature+'.','Fonte da estrutura: '+d.sourceTitle+'.']);
   add('Desenvolvimento',[],[...x.steps]);add('Recursos recomendados',[x.resources.join(' · ')]);
  }else{
   const themes=(S.themes?.registry||[]).filter(t=>(c.type==='mission'?t.relatedMissions:t.relatedRoutes)?.includes(x.id));
   add('Objetivo pedagógico',[x.objectives.join(' ')]);
   if(c.type==='route')add('O problema',[x.description]);
   const concept=(t,name)=>t.concepts?.find(k=>k.title===name)?.text;
   if(themes.length)add('Conceitos (temas do Aprender)',[],themes.map(t=>t.title+': '+t.description));
   add('Preparação',[],['Módulo único: '+s.module+'.',x.initialState.mode==='free'?'Começa em montagem livre com '+x.initialState.units+' unidades.':'Começa com a estrutura cristalina de referência do metal escolhido.','Metais: '+s.metals+'.','Recursos liberados: '+s.tools+'.','Navegação: '+s.navigation+'.']);
   add('Desenvolvimento',[x.guidance.action,x.guidance.hint]);
   add('Critério de conclusão',[x.guidance.criterion,'O SILM confere esse critério no modelo; a conclusão escrita é do estudante.']);
   if(themes.length)add('Como interpretar (temas relacionados)',[],themes.map(t=>concept(t,'Como interpretar')).filter(Boolean));
   add('Limites do modelo',[...new Set([...themes.map(t=>concept(t,'Limites do modelo')).filter(Boolean),...limitations(c.tools,req.module)])]);
  }
  if(c.type==='preset')add('Limites do modelo',limitations(c.tools,req.module));
  const sources=[...new Set([...(x.sources||[]),'src-silm-conventions'])].map(id=>S.data.source(id)?.title||id);
  add('Fontes',['Os dados de cada metal (estrutura, parâmetros e condições) têm a fonte registrada no banco do SILM e aparecem em Dados → Fontes.'],sources);
  add('Observação',['Experiência virtual educacional. As orientações não constituem procedimento de laboratório real.']);
  return {title:c.title,subtitle:s.type+' · '+s.itemTitle+' · Módulo '+s.module,sections};
 }
 S.teacherActivities=Object.freeze({schema:SCHEMA,maxLibrary:MAX_LIBRARY,types:TYPES,navigation:NAVIGATION,toolLabels:TOOL_LABELS,required:REQUIRED,catalog,item,requirements,validate,newId,encode,decode,library,exportDocument,importDocument,summary,guide,toolNames,metalNames});
})();
