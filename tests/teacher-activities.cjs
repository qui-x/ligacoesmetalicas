'use strict';
/* Atividades do professor (Etapa 11): validação, link, biblioteca, importação tudo ou nada, guia composto e sessão restrita. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const S=require('../scripts/validate-scientific-state.cjs').load();
const box=vm.createContext({SILM:S,window:{SILM:S},Date,JSON,Object,Math,TextEncoder,TextDecoder,btoa,atob,Uint8Array,crypto:globalThis.crypto});
for(const f of ['routes.js','missions.js','themes.js','manual.js','ready-assemblies.js','teacher-activities.js','route-session.js'])vm.runInContext(fs.readFileSync('domain/silm/'+f,'utf8'),box,{filename:f});
const T=S.teacherActivities,copy=x=>JSON.parse(JSON.stringify(x));
const make=(type,item,patch={})=>{const r=T.requirements(type,item);return {schema:1,id:T.newId(),type,item,title:'',metals:type==='preset'?r.metals:[r.metals[0]],tools:[...r.tools],navigation:type==='preset'?'livre':'restrita',identification:{className:'2º A',teacher:'Ana',date:'01/11/2026'},...patch};};
const rejects=(c,re)=>assert.throws(()=>T.validate(c),re);
/* 1. Todas as atividades do catálogo podem ser preparadas, com guia composto e fontes. */
let count=0;
for(const type of Object.keys(T.types))for(const x of T.catalog(type)){
 const c=T.validate(make(type,x.id)),g=T.guide(c);count++;
 assert.equal(c.title,x.title,'Sem título, usa o do catálogo');assert.ok(g.sections.length>=5,type+' '+x.id);
 assert.ok(g.sections.some(s=>s.title==='Fontes'&&s.list.length),'Guia com fontes: '+x.id);assert.ok(g.sections.every(s=>s.paragraphs.length||s.list?.length),'Seções não vazias: '+x.id);
 if(type!=='preset'){assert.ok(g.sections.find(s=>s.title==='Critério de conclusão').paragraphs.includes(x.guidance.criterion),'Critério é o do catálogo: '+x.id);
  for(const t of T.requirements(type,x.id).required)assert.ok(x.allowedTools.includes(t));}
 assert.deepEqual(T.decode(T.encode(c)),c,'Link ida e volta: '+x.id);
}
assert.equal(count,S.routes.registry.length+S.missions.registry.length+S.readyAssemblies.catalog.length);
/* 2. O professor só restringe: rejeições. */
rejects({...make('route','medindo-ordem'),schema:2},/outra versão/);
rejects({...make('route','medindo-ordem'),id:'x'},/Identificador/);
rejects({...make('route','medindo-ordem'),type:'prova'},/Tipo/);
rejects({...make('route','medindo-ordem'),item:'inexistente'},/catálogo/);
rejects(make('route','medindo-ordem',{metals:[8]}),/Metais fora/);
rejects(make('route','medindo-ordem',{metals:[]}),/Metais fora/);
rejects(make('route','medindo-ordem',{metals:[29,29]}),/Metais fora/);
rejects(make('route','medindo-ordem',{tools:['distance','latticeParameter','packingFactor']}),/Recursos fora/);
rejects(make('route','medindo-ordem',{tools:['distance']}),/Faltam recursos necessários ao critério da atividade: Parâmetro de rede/);
rejects(make('mission','espaco-ocupado',{tools:['effectiveAtoms','cellVolume','packingFactor']}),/Raio do modelo/);
rejects(make('route','medindo-ordem',{navigation:'aberta'}),/Navegação/);
rejects(make('preset','cobre-cfc',{navigation:'restrita'}),/Navegação/);
rejects(make('preset','cobre-cfc',{metals:[26]}),/Metais fora/);
const long=T.validate(make('route','medindo-ordem',{title:'x'.repeat(500),identification:{className:'y'.repeat(500)}}));assert.equal(long.title.length,200);assert.equal(long.identification.className.length,160);
/* 3. Link: alterado ou incompleto é recusado; tamanho limitado. */
const token=T.encode(make('route','medindo-ordem'));
for(const bad of ['','v2.'+token.slice(3),token.slice(0,40),token+'.extra','v1.@@@',token.replace(/.$/,c=>c==='A'?'B':'A').slice(0,-6),'v1.'+'A'.repeat(9000)])assert.throws(()=>T.decode(bad));
/* 4. Biblioteca e importação. */
const a=T.validate(make('route','medindo-ordem')),b=T.validate(make('mission','vizinhos-metal'));
const lib=T.library([{config:a,createdAt:'2026-11-01T00:00:00Z'},{config:{...a}},{config:{...b,tools:[]}},{config:b,createdAt:'2026-11-01T00:00:00Z'},null]);
assert.deepEqual(copy(lib.map(r=>r.config.id)),[a.id,b.id],'Duplicata e inválido descartados na leitura');
const doc=T.exportDocument([a,b]);assert.deepEqual(copy(T.importDocument(copy(doc)).map(c=>c.id)),[a.id,b.id]);assert.equal(T.importDocument(copy(a)).length,1,'Aceita uma configuração solta');
assert.throws(()=>T.importDocument({...copy(doc),activities:[copy(a),{...copy(b),tools:[]}]}),/Atividade 2 do arquivo/);
assert.throws(()=>T.importDocument({format:'outro'}),/não é uma atividade/);assert.throws(()=>T.importDocument({...copy(doc),activities:Array(51).fill(copy(a))}),/demais/);
/* 5. Sessão: a atividade do professor restringe metal e recursos, guarda título e identificação e não se mistura com o roteiro livre. */
const m=S.createScientificState();m.begin(29);m.beginAssembly();m.addUnit();const original=copy(m.snapshot());const memory=new Map();
const storage={get:(k,d)=>memory.has(k)?copy(memory.get(k)):d,set:(k,v)=>{memory.set(k,copy(v));return true;}},params={model:m,storage,view:()=>({free:true}),onView(){},say(){}};
let session=S.createRouteSession(params);
const cfg=T.validate(make('route','medindo-ordem',{title:'Medida de a — 2º A',metals:[29,26],tools:['distance','latticeParameter']}));
assert.equal(session.start('medindo-ordem',12,{teacher:cfg}),false,'Metal fora do escolhido pelo professor');
assert.equal(session.start('ordem-metal',29,{teacher:cfg}),false,'Configuração de outra atividade');
assert.equal(session.start('medindo-ordem',26,{teacher:cfg}),true);
assert.equal(session.title(),'Medida de a — 2º A');assert.equal(session.teacher().navigation,'restrita');assert.equal(session.allows('latticeParameter'),true);assert.equal(session.allows('coordination'),false,'Recurso retirado pelo professor');
assert.equal(session.report().report.className,'2º A');assert.equal(session.report().report.teacher,'Ana');
session.observe(true);session=S.createRouteSession(params);assert.equal(session.load(),true,'Sessão do professor recarrega');assert.equal(session.title(),'Medida de a — 2º A');assert.equal(session.allows('coordination'),false);
assert.equal(session.close(),true);assert.deepEqual(copy(m.snapshot()),original,'Encerrar restaura a investigação livre');
assert.equal(session.start('medindo-ordem',12,{resume:true}),true,'Roteiro livre não retoma a tentativa do professor');assert.equal(session.teacher(),null);assert.equal(session.allows('coordination'),true);assert.equal(session.close(),true);
const tampered=copy(memory.get('route.session'));tampered.attempts['medindo-ordem'].activityContext.teacher={id:cfg.id,title:'x',metals:[12],tools:[],navigation:'restrita'};memory.set('route.session',tampered);
assert.equal(S.createRouteSession(params).load(),false,'Sobreposição adulterada não é aceita');
console.log('PASS teacher-activities: '+count+' atividades do catálogo preparáveis com guia e link, rejeições (versão, tipo, catálogo, metais, recursos necessários, navegação), link alterado, biblioteca, importação tudo ou nada e sessão restrita (metal, recursos, título, identificação, recarga, isolamento do roteiro livre, adulteração).');
