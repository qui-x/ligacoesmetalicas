'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),directory=path.join(root,'domain/silm/data');
const read=name=>JSON.parse(fs.readFileSync(path.join(directory,name+'.json'),'utf8'));
function validate({elements,sources,metadata},{checkFiles=false}={}){
 const errors=[],check=(ok,message)=>{if(!ok)errors.push(message);},ids=new Set(sources.map(s=>s.id));
 check(elements.length===118,'O banco precisa conter exatamente 118 elementos.');
 for(const field of ['atomicNumber','symbol','id'])check(new Set(elements.map(e=>e[field])).size===118,'Duplicação de '+field);
 check(ids.size===sources.length,'IDs de fontes duplicados.');
 const kinds=new Set(['TABULATED','CALCULATED','QUALITATIVE']),evidence=new Set(['experimental','evaluated','computed','convention']);
 const reasons=new Set(['NOT_METALLIC','INSUFFICIENT_VALIDATED_DATA','SUPERHEAVY_LIMITATION','STRUCTURE_NOT_HOMOLOGATED','DATA_CONFLICT']);
 function walk(v,location){if(!v||typeof v!=='object')return;for(const [k,x]of Object.entries(v)){
  if(/sourceId$/i.test(k))check(ids.has(x),location+'.'+k+': fonte inexistente '+x);
  if(k==='kind')check(kinds.has(x),location+': tipo de informação inválido');
  if(k==='evidenceType')check(evidence.has(x),location+': natureza da evidência inválida');
  if(x&&typeof x==='object')walk(x,location+'.'+k);
 }}
 sources.forEach(s=>{check(/^[a-z][a-z0-9-]{0,63}$/.test(s.id),'ID de fonte inválido');for(const k of ['title','url','accessedAt','license','notes','institution'])check(typeof s[k]==='string'&&s[k].length>0,s.id+': falta '+k);check(Array.isArray(s.authors),s.id+': autores inválidos');if(checkFiles&&s.evidence){const p=path.join(root,s.evidence.path);check(fs.existsSync(p),s.id+': evidência ausente');if(fs.existsSync(p))check(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')===s.evidence.sha256,s.id+': evidência alterada');}});
 const positions=new Set();
 for(const e of elements){const name=e.symbol||e.id,available=e.silmEligibility?.status==='available';walk(e,name);
  check(Number.isInteger(e.atomicNumber)&&e.atomicNumber>=1&&e.atomicNumber<=118,name+': Z fora da faixa');
  check(/^[A-Z][a-z]?$/.test(e.symbol)&&!!e.name,name+': identidade incompleta');
  check(Number.isInteger(e.period)&&e.period>=1&&e.period<=7,name+': período inválido');
  check(e.group===null||(Number.isInteger(e.group)&&e.group>=1&&e.group<=18),name+': grupo inválido');
  check(['s','p','d','f'].includes(e.block),name+': bloco inválido');
  const position=e.layout?.row+':'+e.layout?.column;check(!positions.has(position),name+': posição repetida');positions.add(position);
  const expectedLayout=e.atomicNumber>=57&&e.atomicNumber<=71?{row:10,column:e.atomicNumber-52}:e.atomicNumber>=89&&e.atomicNumber<=103?{row:11,column:e.atomicNumber-84}:e.group?{row:e.period+1,column:e.group+1}:null;
  check(!!expectedLayout&&e.layout?.row===expectedLayout.row&&e.layout?.column===expectedLayout.column,name+': posição periódica incompatível com grupo/período/série');
  for(const k of ['atomicNumber','symbol','name','period','group','block'])check(ids.has(e.identityProvenance?.[k]?.sourceId),name+': proveniência ausente em '+k);
  check(typeof e.classification?.metallic==='boolean'&&ids.has(e.classification?.sourceId),name+': classificação inválida');
  check(['available','unavailable'].includes(e.silmEligibility?.status),name+': estado de disponibilidade inválido');
  check(available?e.silmEligibility.reasonCode===null:reasons.has(e.silmEligibility?.reasonCode),name+': reasonCode incompatível');
  if(e.atomicNumber>=104)check(!available&&e.silmEligibility.reasonCode==='SUPERHEAVY_LIMITATION',name+': superpesado habilitado');
  if(!e.classification?.metallic)check(!available,name+': não metal habilitado');
  const w=e.atomicWeight;check(w&&ids.has(w.sourceId)&&w.unit==='1',name+': peso atômico sem fonte/unidade');
  if(w?.form==='interval')check(w.value===null&&w.interval?.length===2&&w.interval[0]<w.interval[1]&&w.display.startsWith('['),name+': intervalo de peso perdido');
  else if(w?.form==='massNumber')check(Number.isInteger(w.value)&&w.display==='['+w.value+']'&&w.convention.includes('não é peso'),name+': número de massa confundido com peso');
  else check(w?.form==='standard'&&Number.isFinite(w.value)&&w.value>0,name+': peso inválido');
  const ref=e.structures?.find(s=>s.id===e.referenceStructure);
  if(available){check(e.electronConfiguration?.species==='neutral'&&e.electronConfiguration?.state==='ground'&&!!e.electronConfiguration?.display,name+': configuração neutra fundamental ausente');check(!!e.valenceModel?.convention&&!!e.valenceModel?.explanation&&ids.has(e.valenceModel?.sourceId),name+': modelo de valência ausente');check(!!ref,name+': estrutura de referência ausente');check(ref?.evidenceType==='experimental',name+': estrutura computacional não pode habilitar investigação');}
  for(const s of e.structures||[]){check(ids.has(s.sourceId)&&!!s.type&&!!s.phaseLabel,name+': estrutura sem fonte/fase');
   const c=s.conditions;for(const k of ['temperature','pressure','phase'])check(!!c?.[k]&&ids.has(c?.[k]?.sourceId)&&!!c?.[k]?.display,name+': condição '+k+' ausente');
   for(const [k,u]of [['temperature','K'],['pressure','Pa']]){const v=c?.[k];check(!!v?.unit,name+': condição '+k+' sem unidade');check(v?.value!==null?Number.isFinite(v?.value):!!v?.qualifier,name+': condição não numérica sem qualificador');}
   check(c?.phase?.value==='solid',name+': estrutura não sólida');
   for(const k of ['a','b','c','alpha','beta','gamma']){const v=s.latticeParameters?.[k];check(Number.isFinite(v?.value)&&v.value>0&&v.unit===(k.length===1?'Å':'°')&&ids.has(v.sourceId),name+': parâmetro '+k+' inválido');}
   check(s.fractionalSites?.values?.length>0&&ids.has(s.fractionalSites?.sourceId),name+': base cristalográfica ausente');
  }
  for(const [key,p]of Object.entries(e.properties||{})){check(typeof p==='object'&&!!p.unit&&!!p.conditions&&ids.has(p.sourceId),name+': propriedade '+key+' sem unidade/condição/fonte');}
 }
 check(metadata.version==='0.2.1'&&metadata.schemaVersion===1,'Versão/schema científico incompatível.');
 return errors;
}
const load=()=>({elements:read('elements'),sources:read('sources'),metadata:read('metadata')});
if(require.main===module){const data=load(),errors=validate(data,{checkFiles:true});if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('Banco validado: 118 elementos; '+data.elements.filter(e=>e.silmEligibility.status==='available').length+' metais disponíveis; '+data.sources.length+' fontes; proveniência, unidades e condições consistentes.');}
module.exports={validate,load};
