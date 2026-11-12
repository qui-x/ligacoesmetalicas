'use strict';
/* Paridade pedagógica: Guia do Professor e atividade do aluno reutilizam
   os dados dos 26 roteiros e das 42 missões, sem duplicar motor científico. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({Date,JSON,Set,Map,Number,String,Object,Array,Math,console});
ctx.window=ctx;ctx.SILM={};
for(const path of [
 'domain/silm/data/bundle.js','domain/silm/data-api.js',
 'domain/silm/crystal.js','domain/silm/properties.js'
])vm.runInContext(fs.readFileSync(path,'utf8'),ctx,{filename:path});
const S=ctx.SILM;
S.measurement={types:{distance:{},latticeParameter:{},coordination:{}},current:()=>true};
S.formulas={atoms:{quantity:'effectiveAtoms'},volume:{quantity:'cellVolume'},radius:{quantity:'radius'},packing:{quantity:'packingFactor'}};
for(const path of [
 'domain/silm/routes.js','domain/silm/missions.js',
 'domain/silm/themes.js','domain/silm/manual.js','domain/silm/teacher-activities.js'
])vm.runInContext(fs.readFileSync(path,'utf8'),ctx,{filename:path});
const T=S.teacherActivities;
assert.equal(S.routes.registry.length,26);
assert.equal(S.missions.registry.length,42);
assert.equal(S.themes.registry.length,39);
for(const [type,collection]of [['route',S.routes.registry],['mission',S.missions.registry]]){
 for(const item of collection){
  const z=item.metalSelection.atomicNumbers[0];
  const c=T.validate({schema:T.schema,id:'act-test-'+item.id,
   type,item:item.id,title:item.title,metals:[z],tools:[...item.allowedTools],
   navigation:'restrita',identification:{className:'Turma teste'}});
  const g=T.guide(c),sections=new Map(g.sections.map(s=>[s.title,s]));
  const has=(heading,needle)=>{
   assert.ok(sections.has(heading),item.id+' sem '+heading);
   assert.ok([...sections.get(heading).paragraphs,...(sections.get(heading).list||[])].some(s=>s.includes(needle)),item.id+' sem conteúdo '+needle);
  };
  const formative=T.formative(item);
  assert.equal(formative.title,item.title);
  assert.ok(formative.criteria.length>=5,item.id+' sem critérios formativos suficientes');
  assert.equal(new Set(formative.criteria.map(k=>k.id)).size,formative.criteria.length,item.id+' com critérios duplicados');
  assert.ok(formative.criteria.every(k=>typeof k.focus==='string'&&k.focus&&typeof k.reference==='string'&&k.reference));
  assert.ok(/não atribui nota/.test(formative.notice),item.id+' deve rejeitar avaliação automática');
  assert.ok(formative.criteria.some(k=>k.id==='limits'),item.id+' precisa delimitar o modelo');
  assert.ok(formative.criteria.some(k=>k.id==='conclusion'),item.id+' precisa tratar da conclusão');
  assert.ok(sections.has('Ficha de acompanhamento formativo'),item.id+' sem ficha docente');
  assert.ok(sections.get('Ficha de acompanhamento formativo').list.length>=5,item.id+' sem indicadores no guia');
  if(type==='mission')
   assert.equal(formative.criteria.filter(k=>k.id.startsWith('evidence-')).length,item.evidenceObjectives.length);
  assert.equal(g.title,item.title);
  assert.ok(sections.has('Objetivo pedagógico'));
  assert.ok(sections.has('Critério de conclusão'));
  assert.ok(sections.has('Limites do modelo'));
  assert.ok(sections.has('Fontes'));
  assert.ok(sections.has('Mediação do professor'),item.id+' sem mediação');
  assert.ok(item.study?.question,item.id+' sem pergunta');
  has('Contexto e pergunta investigativa',item.study.question);
  has('Mediação do professor',item.study.teacher);
  if(type==='route'){
   has('Hipótese inicial para discussão',item.study.hypothesis);
   has('Procedimento investigativo',item.study.tasks[0]);
   has('Plano de observações',item.study.observe[0]);
   has('Questões para interpretar',item.study.interpretation[0]);
   has('Limites do modelo',item.study.limits);
   assert.ok(sections.has('Avaliação formativa'));
  }else{
   has('Previsão inicial para discussão',item.study.prediction);
   has('Evidências a procurar',item.study.evidence);
   has('Questões para interpretar',item.study.questions[0]);
   has('Limites do modelo',item.study.limit);
   has('Evidências verificáveis da missão',item.evidenceObjectives[0].label);
  }
  const mandatory={'property-heating':'thermal','property-light':'luster',
   'property-elongation':'ductility'}[item.completionCriteria];
  if(mandatory){
   assert.ok(T.requirements(type,item.id).required.includes(mandatory),item.id+' sem ferramenta obrigatória');
   assert.throws(()=>T.validate({...c,tools:c.tools.filter(t=>t!==mandatory)}),/Faltam recursos necessários/);
  }
  assert.throws(()=>T.validate({...c,metals:[0]}),/Metais fora/);
  assert.throws(()=>T.validate({...c,tools:[...c.tools,'ferramenta-inexistente']}),/Recursos fora/);
 }
}
console.log('OK: 26 roteiros e 42 missões possuem ficha formativa sem nota automática e sem ampliar ferramentas ou metais.');
