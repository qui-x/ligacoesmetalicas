'use strict';
// SILM: portão de homologação DOCUMENTAL de uso condicionado (80 metais × 5).
// Valida o arquivo existente; não cria dados, não consulta APIs externas,
// não autoriza motor, não verifica experimentalmente o artigo citado.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('reports','homologacao-metalica');
fs.mkdirSync(out,{recursive:true});
const box={window:{SILM:{}}};box.SILM=box.window.SILM;
const file='domain/silm/data/science400-reference-stage117.js';
vm.runInNewContext(fs.readFileSync(file,'utf8'),box,{filename:file,timeout:10000});
const catalog=box.SILM.science400Reference,props=['electrical','thermal','malleability','ductility','luster'];
const expected=new Set(props),issues=[],results=[],seen=new Set(),byMetal=new Map();
function fail(slot,reason){issues.push({id:slot?.id||'(catálogo)',reason});}
function text(v){return typeof v==='string'&&v.trim().length>0;}
function validUrl(u){try{const x=new URL(u);return x.protocol==='https:'&&!!x.hostname}catch{return false}}
assert.equal(catalog.schema,'silm.science400.reference.v1');
assert.equal(catalog.engineRelease,false);
assert.equal(catalog.calibrationApproved,false);
assert.equal(catalog.slots.length,400);
for(const slot of catalog.slots){
 if(!expected.has(slot.property))fail(slot,'Propriedade desconhecida');
 if(!Number.isInteger(slot.z)||slot.z<1||slot.z>118)fail(slot,'Número atômico inválido');
 if(!text(slot.symbol)||!text(slot.id)||slot.id!==slot.symbol+'-'+slot.property)
  fail(slot,'Identificação inconsistente');
 if(seen.has(slot.id))fail(slot,'Campo duplicado');
 seen.add(slot.id);
 if(!byMetal.has(slot.z))byMetal.set(slot.z,[]);
 byMetal.get(slot.z).push(slot);
 if(slot.engineCalibrationApproved!==false)fail(slot,'Sinalização indevida de calibração');
 if(slot.source_policy!=='CNTP NAO E FILTRO')fail(slot,'Política de condições originais perdida');
 if(!Array.isArray(slot.alternatives))fail(slot,'Alternativas ausentes');
 if(slot.available){
  if(!slot.best||!Number.isFinite(slot.best.value)||!text(slot.best.unit)||!text(slot.best.metric))
   fail(slot,'Número sem unidade/métrica finita');
 }else if(slot.best&&Number.isFinite(slot.best.value)){
  fail(slot,'Lacuna escondendo valor numérico');
 }
 const linked=Boolean(slot.available&&slot.best&&validUrl(slot.best.sourceURL));
 const sourceConditions=slot.best?.conditions;
 const conditioned=Boolean(sourceConditions&&typeof sourceConditions==='object'&&!Array.isArray(sourceConditions)
  &&Object.values(sourceConditions).some(x=>x!==null&&x!==''&&x!==undefined));
 if(slot.displayEligible!==linked)fail(slot,'Disponibilidade para consulta não coincide com valor + URL HTTPS');
 if(linked&&!conditioned)fail(slot,'Evidência rastreável sem contexto de condição/amostra/fonte');
 if(linked&&(slot.best.engine_calibration_approved!==false||slot.best.source_policy==='CNTP OBRIGATORIA'))
  fail(slot,'Candidato não pode alterar calibração ou impor CNTP');
 const category=!slot.available?'lacuna_numerica':!linked?'numero_sem_fonte':
  slot.requiresPrimaryReview?'consulta_condicionada_revisao_primaria':'consulta_documental_rastreavel';
 results.push({id:slot.id,symbol:slot.symbol,z:slot.z,property:slot.property,
  status:slot.status,category,value:slot.available?slot.best.value:null,
  unit:slot.available?slot.best.unit:null,metric:slot.available?slot.best.metric:null,
  sourceURL:linked?slot.best.sourceURL:null,conditions:linked?slot.best.conditions:null,
  needsPrimaryReview:Boolean(slot.requiresPrimaryReview),engineCalibrationApproved:false,
  consultationEligible:linked});
}
assert.equal(byMetal.size,80,'São necessários exatamente 80 metais');
for(const [z,list]of byMetal){
 if(list.length!==5||new Set(list.map(x=>x.property)).size!==5)
  fail({id:'Z='+z},'Não contém exatamente cinco categorias distintas');
}
const count=category=>results.filter(x=>x.category===category).length;
const summary={
 schema:'silm.qualificacao.documental.v1',scanned:results.length,metals:byMetal.size,
 numeric:results.filter(x=>x.value!==null).length,
 published:results.filter(x=>x.consultationEligible).length,
 catalogReady:count('consulta_documental_rastreavel'),
 provisional:count('consulta_condicionada_revisao_primaria'),
 unsourced:count('numero_sem_fonte'),missing:count('lacuna_numerica'),invalid:issues.length,
 calibrationApproved:false,externalPrimarySourceVerification:false,
 byProperty:Object.fromEntries(props.map(p=>[p,{
  slots:results.filter(x=>x.property===p).length,
  numeric:results.filter(x=>x.property===p&&x.value!==null).length,
  consultation:results.filter(x=>x.property===p&&x.consultationEligible).length,
  documented:results.filter(x=>x.property===p&&x.category==='consulta_documental_rastreavel').length,
  provisional:results.filter(x=>x.property===p&&x.category==='consulta_condicionada_revisao_primaria').length,
  missing:results.filter(x=>x.property===p&&x.category==='lacuna_numerica').length,
  unsourced:results.filter(x=>x.property===p&&x.category==='numero_sem_fonte').length
 }]))
};
const expectedAudit=catalog.metadata.audit;
if(summary.numeric!==expectedAudit.numeric||summary.published!==expectedAudit.withURL||
  summary.scanned!==expectedAudit.total||summary.metals!==expectedAudit.metals)
 issues.push({id:'metadata',reason:'Totais atuais diferem da auditoria declarada no arquivo'});
if(summary.published!==summary.catalogReady+summary.provisional||
 summary.numeric!==summary.published+summary.unsourced||
 summary.scanned!==summary.numeric+summary.missing)
 issues.push({id:'conservation',reason:'Contagens da matriz não conservam os 400 campos'});
const report={summary,issues,rows:results};
fs.writeFileSync(path.join(out,'qualification.json'),JSON.stringify(report,null,2)+'\n');
const lines=['# SILM — Homologação documental de uso condicionado','',
 'Aprovação automática de **estrutura de evidências para consulta**; não certifica experimentalmente fontes nem calibra motores.',
 'Todos os 400 campos são classificados, sem imputar dados ausentes. Condições originais preservadas; CNTP não é filtro.','',
 '| Indicador | Quantidade |','|---|---:|',
 [['Examinados',summary.scanned],['Metais',summary.metals],['Numéricos',summary.numeric],
 ['Consultáveis com URL',summary.published],['Rastreáveis sem revisão pendente',summary.catalogReady],
 ['Rastreáveis com revisão primária pendente',summary.provisional],['Numéricos sem fonte',summary.unsourced],
 ['Sem número',summary.missing],['Inconsistências',issues.length]
 ].map(([a,b])=>'| '+a+' | '+b+' |').join('\n'),
 '','| Propriedade | Consultáveis | Revisão primária pendente | Sem fonte | Lacunas |',
 '|---|---:|---:|---:|---:|',
 ...props.map(p=>{const x=summary.byProperty[p];return '| '+p+' | '+x.consultation+' | '+x.provisional+' | '+x.unsourced+' | '+x.missing+' |'}),
 '','## Limites de validade','',
 '- Campos com revisão pendente continuam marcados como candidatos rastreáveis, não como confirmação independente.',
 '- Condições, fase, amostra, método e observações permanecem as registradas. Sem inferir CNTP, sem tornar valores universais.',
 '- Nenhum valor documental é inserido nos motores numéricos automaticamente.',
 '- Uma URL válida estruturalmente não comprova acesso ao artigo, conferência da transcrição nem comparação de amostras.',
 '',...(issues.length?['## Inconsistências',...issues.map(x=>'- '+x.id+': '+x.reason)]:['**Nenhuma inconsistência estrutural identificada.**']),''];
fs.writeFileSync(path.join(out,'qualification.md'),lines.join('\n'));
console.log('QUALIFICATION_SUMMARY '+JSON.stringify(summary));
if(issues.length){console.error('QUALIFICATION_ISSUES '+JSON.stringify(issues.slice(0,30)));process.exitCode=1}
