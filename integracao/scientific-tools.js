'use strict';
/* Interface sobre os serviços científicos existentes. Não contém fórmulas próprias. */
SILM.createIntegrationTools=({model,host,history,onChange,say,onModule})=>{
 const S=SILM,MS=S.measurement,CA=S.calculation,U=S.units;
 let context='',tool=null,picks=[],review=null,formula=null,choice={},user={},unit='Å';
 const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const button=(text,fn)=>{const b=node('button',text);b.type='button';b.className='button outline';b.addEventListener('click',fn);return b;};
 const select=(id,items,value,fn)=>{const s=node('select');s.id=id;for(const [v,t]of items){const o=node('option',t);o.value=v;s.append(o);}s.value=value;s.addEventListener('change',()=>fn(s.value));return s;};
 const field=(parent,text,input)=>{const l=node('label',text);l.htmlFor=input.id;parent.append(l,input);};
 const available=()=>model.measurementAvailability().ok;
 const type=()=>model.state.structure?.crystallography?.structureType;
 const reset=()=>{tool=null;picks=[];review=null;formula=null;choice={};user={};};
 const change=()=>onChange();
 function value(m){return U.format(m.value,m.unit==='Å'?unit:m.unit);}
 function result(c){return CA.format(c.result,c.unit);}
 function options(spec){
  const state=model.state,e=S.data.get(state.metal.atomicNumber),out=[];
  if(spec.origins.includes('TABULATED')){const t=CA.tabulated(e,spec.key);if(t)out.push({id:'tab',origin:'TABULATED',value:t.value,ref:t.ref,label:'Dado tabelado: '+t.display});}
  if(spec.origins.includes('MODEL_MEASUREMENT'))for(const m of state.measurements.filter(m=>m.type==='latticeParameter'&&m.parameter===spec.key&&MS.current(m,state.structure)))out.push({id:m.id,origin:'MODEL_MEASUREMENT',value:m.value,ref:{measurementId:m.id},label:'Medida do modelo: '+U.format(m.value,'Å')});
  if(spec.origins.includes('CALCULATED')){
   if(spec.key==='n')out.push({id:'n',origin:'CALCULATED',value:CA.effective(type()),ref:{formulaId:'effective-atoms-'+type().toLowerCase()},label:'Calculado pelo SILM: contagem geométrica'});
   else for(const c of state.calculations.filter(c=>c.type===spec.quantity&&c.result.value!==null&&CA.current(c,state.structure)))out.push({id:c.id,origin:'CALCULATED',value:c.result.value,ref:{calculationId:c.id},label:'Calculado pelo SILM: '+result(c)});
  }
  if(spec.origins.includes('USER'))out.push({id:'user',origin:'USER',value:null,ref:null,label:'Valor informado pelo usuário'});
  return out;
 }
 function calculate(f){
  const inputs=[];
  for(const spec of f.requiredInputs){
   const opts=options(spec),o=opts.find(o=>o.id===choice[spec.key])||opts[0];
   if(!o){say('Nenhum valor disponível para '+spec.symbol+'.','warning');return;}
   let v=o.value;
   if(o.origin==='USER'){
    const text=String(user[spec.key]||'').trim().replace(',','.');v=/^[+]?\d*\.?\d+(e[+-]?\d+)?$/i.test(text)?Number(text):NaN;
    if(!Number.isFinite(v)||v<=0){say('Informe um número positivo e finito para '+spec.symbol+', em '+spec.unit+'.','warning');document.getElementById('silm-input-'+spec.key)?.focus();return;}
   }
   inputs.push({key:spec.key,symbol:spec.symbol,name:spec.name,value:v,unit:spec.unit,origin:o.origin,ref:o.ref});
  }
  const r=model.addCalculation(f.id,inputs);
  if(r.ok)say('Calculado pelo SILM: '+f.outputSymbol+' = '+result(r.calculation));
  else say('Não foi possível calcular: '+r.reason,'warning');
  change();
 }
 function pick(id){
  if(!tool||!available()||model.state.module.active!=='medir')return;
  picks.push(id);
  if(picks.length===MS.types[tool].points){
   const r=model.addMeasurement(tool,picks);picks=[];
   if(r.ok){review=r.measurement.id;say('Medida do modelo: '+value(r.measurement));if(tool==='coordination')model.setCrystalRepresentation({neighbors:true,selectedUnitId:id});}
   else say('Seleção inválida para este instrumento: '+r.reason+'. Tente outros pontos.','warning');
  }else say('Ponto '+picks.length+' selecionado. Selecione o próximo ponto da medida.');
  change();
 }
 function marks(){
  if(model.state.module.active!=='medir')return null;
  if(picks.length)return {points:picks.map((id,i)=>({unitId:id,label:['A','B','C'][i]})),kind:null};
  const m=model.state.measurements.find(m=>m.id===review);if(!m||!MS.current(m,model.state.structure))return null;
  return {points:m.points.map((p,i)=>({site:p.site,label:['A','B','C'][i]})),kind:m.type==='coordination'?null:m.type,text:value(m),spoken:'Medida do modelo: '+value(m)};
 }
 function render(){
  const state=model.state,key=state.investigation?.id+':'+state.structure?.mode;
  if(key!==context){context=key;reset();}
  host.replaceChildren();history.replaceChildren();
  field(host,'Módulo',select('silm-module',[['explorar','Explorar'],['medir','Medir'],['calcular','Calcular']],state.module.active,v=>{reset();model.setModule(v);onModule(v);change();}));
  if(state.module.active!=='explorar'){
   host.append(node('p','Medições e cálculos usam o modelo cristalográfico em escala física. Zoom e projeção não alteram os valores.'));
   if(!available())host.append(node('p',model.measurementAvailability().reason==='DEFORMED'?'Restaure a experiência de deformação em Explorar para medir ou calcular a estrutura de referência.':'Organize uma estrutura cristalina em Explorar para usar este módulo. A montagem livre não tem escala física.'));
   else if(state.module.active==='medir'){
    field(host,'Instrumento',select('silm-instrument',[['','Escolha um instrumento'],...Object.entries(MS.types).map(([k,t])=>[k,t.label])],tool||'',v=>{tool=v||null;picks=[];review=null;change();say(v?'Selecione '+MS.types[v].points+' ponto(s) na cena.':'Instrumento desligado.');}));
    field(host,'Unidade de comprimento',select('silm-measure-unit',Object.keys(U.length).map(k=>[k,k]),unit,v=>{unit=v;change();}));
    host.append(node('p',tool?'Selecionados: '+picks.length+' de '+MS.types[tool].points+'. Para ângulos, B é o vértice.':'Selecione um instrumento para medir na cena.'));
    host.append(button('Cancelar seleção',()=>{tool=null;picks=[];change();}));
   }else{
    const formulas=CA.applicable(type());if(!formulas.some(f=>f.id===formula))formula=formulas[0]?.id;
    field(host,'Fórmula',select('silm-formula',formulas.map(f=>[f.id,f.name]),formula,id=>{formula=id;choice={};user={};change();}));
    const f=S.formulas[formula];if(f){
     host.append(node('p',f.expression),node('p',f.notes));
     for(const spec of f.requiredInputs){
      const opts=options(spec);if(!opts.some(o=>o.id===choice[spec.key]))choice[spec.key]=opts[0]?.id;
      field(host,spec.symbol+' — '+spec.name+' ('+spec.unit+')',select('silm-origin-'+spec.key,opts.map(o=>[o.id,o.label]),choice[spec.key],v=>{choice[spec.key]=v;change();}));
      if(choice[spec.key]==='user'){
       const input=node('input');input.id='silm-input-'+spec.key;input.type='text';input.inputMode='decimal';input.value=user[spec.key]||'';input.addEventListener('input',()=>{user[spec.key]=input.value;});field(host,'Valor de '+spec.symbol+' em '+spec.unit,input);
      }
     }
     host.append(button('Calcular',()=>calculate(f)));
    }
   }
  }
  history.append(node('h3','Medições e cálculos'));
  for(const m of state.measurements){
   const row=node('details');row.append(node('summary',MS.types[m.type].label+(m.parameter?' '+m.parameter:'')+': '+value(m)+' · Medida do modelo'));
   row.append(node('p','Resolução: '+U.format(m.resolution,m.unit)+' · Fonte: '+m.source.latticeSourceId));
   if(MS.current(m,state.structure))row.append(button('Rever na cena',()=>{reset();review=m.id;model.setModule('medir');onModule('medir');change();}));
   history.append(row);
  }
  for(const c of state.calculations){
   const row=node('details');row.append(node('summary',S.formulas[c.formulaId].name+': '+result(c)+' · Calculado pelo SILM'));
   row.append(node('p',S.formulas[c.formulaId].expression));
   for(const i of c.inputs)row.append(node('p',i.symbol+' = '+(Array.isArray(i.value)?i.value.join(' – '):i.value)+' '+i.unit+' · '+CA.origins[i.origin]));
   row.append(node('p','Modelo: '+c.provenance.model+' · Fontes: '+c.provenance.references.join(', ')));history.append(row);
  }
  if(!state.measurements.length&&!state.calculations.length)history.append(node('p','Nenhum registro nesta investigação.'));
 }
 return {render,measure:{pickActive:()=>model.state.module.active==='medir'&&!!tool&&available(),onPick:pick,marks},calc:{marks:()=>null}};
};
