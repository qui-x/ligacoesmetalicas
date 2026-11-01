'use strict';
/* Interface sobre os serviços científicos existentes. Não contém fórmulas próprias. */
SILM.createIntegrationTools=({model,host,moduleHost=host,history,onChange,say,onModule,activity=()=>null})=>{
 const S=SILM,MS=S.measurement,CA=S.calculation,U=S.units;
 let context='',tool=null,picks=[],review=null,formula=null,choice={},user={},unit='Å';
 const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const button=(text,fn)=>{const b=node('button',text);b.type='button';b.className='button outline';b.addEventListener('click',fn);return b;};
 const select=(id,items,value,fn)=>{const s=node('select');s.id=id;for(const [v,t]of items){const o=node('option',t);o.value=v;s.append(o);}s.value=value;s.addEventListener('change',()=>fn(s.value));return s;};
 const field=(parent,text,input)=>{const l=node('label',text);l.htmlFor=input.id;parent.append(l,input);};
 const available=()=>model.measurementAvailability().ok;
 const type=()=>model.state.structure?.crystallography?.structureType;
 const general=()=>!!type()&&S.crystal.isGeneral(type());
 const element=()=>model.state.metal?S.data.get(model.state.metal.atomicNumber):null;
 const reset=()=>{tool=null;picks=[];review=null;formula=null;choice={};user={};};
 const change=()=>onChange();
 const allowed=t=>!activity()||activity().allows(t);
 function value(m){return U.format(m.value,m.unit==='Å'?unit:m.unit);}
 const points=n=>n+(n===1?' ponto':' pontos');
 /* O que fazer quando a seleção não serve ao instrumento: explicação em linguagem do estudante, sem códigos internos. */
 function measureHelp(reason){
  const hex=type()==='HCP',axes=general()?' (cada aresta corresponde a um eixo: a, b ou c).':hex?' (aresta da base para a; aresta vertical para c).':'.';
  return {NOT_LATTICE_VECTOR:'Esses centros não ocupam posições equivalentes da rede (por exemplo, um vértice e um centro). Para o parâmetro de rede, escolha dois centros equivalentes ligados por uma aresta da célula'+axes,
   NOT_CELL_EDGE:'Esses centros são equivalentes, mas a linha entre eles não é uma aresta da célula. Escolha dois vértices vizinhos na mesma aresta'+axes,
   SAME_POINT:'Os pontos precisam ser diferentes. Escolha outro centro.',POINTS_INVALID:'A seleção não foi reconhecida. Selecione os pontos de novo.',
   MEASUREMENTS_LIMIT:'Esta investigação já tem o máximo de 200 medidas. Use Dados para consultar as anteriores.',DEFORMED:'Restaure a experiência de deformação em Explorar para medir a estrutura de referência.',
   NO_SCALE:'Organize a estrutura cristalina em Explorar para medir: a montagem livre não tem escala física.'}[reason]||'Essa seleção não serve para este instrumento. Tente outros pontos.';
 }
 function calcHelp(reason){
  return {INPUT_MISSING:'Falta um valor de entrada. Escolha a origem de cada valor.',INPUT_INVALID:'Um valor de entrada não é válido. Confira os números informados.',
   RESULT_INVALID:'Com esses valores, o resultado não é fisicamente possível (por exemplo, empacotamento acima de 100 %). Confira os valores informados.',
   FORMULA_NOT_APPLICABLE:'Esta fórmula não se aplica à estrutura atual.',CALCULATIONS_LIMIT:'Esta investigação já tem o máximo de cálculos. Use Dados para consultar os anteriores.',
   CALCULATION_CONTEXT_INVALID:'A estrutura mudou desde que os valores foram obtidos. Escolha os valores de novo.',DEFORMED:'Restaure a experiência de deformação em Explorar para calcular a estrutura de referência.',
   NO_SCALE:'Organize a estrutura cristalina em Explorar para calcular: a montagem livre não tem escala física.'}[reason]||'Não foi possível calcular com esses valores. Confira as entradas.';
 }
 function result(c){return CA.format(c.result,c.unit);}
 function options(spec){
  const state=model.state,e=S.data.get(state.metal.atomicNumber),out=[];
  if(spec.origins.includes('TABULATED')){const t=CA.tabulated(e,spec.key);if(t)out.push({id:'tab',origin:'TABULATED',value:t.value,ref:t.ref,label:'Dado tabelado: '+t.display});}
  if(spec.origins.includes('MODEL_MEASUREMENT'))for(const m of state.measurements.filter(m=>m.type==='latticeParameter'&&m.parameter===spec.key&&MS.current(m,state.structure)))out.push({id:m.id,origin:'MODEL_MEASUREMENT',value:m.value,ref:{measurementId:m.id},label:'Medida do modelo: '+U.format(m.value,'Å')});
  if(spec.origins.includes('CALCULATED')){
   if(spec.key==='n')out.push({id:'n',origin:'CALCULATED',value:CA.effective(type(),e),ref:{formulaId:CA.effectiveFormula(type())},label:'Calculado pelo SILM: contagem geométrica'});
   else for(const c of state.calculations.filter(c=>c.type===spec.quantity&&c.result.value!==null&&CA.current(c,state.structure)))out.push({id:c.id,origin:'CALCULATED',value:c.result.value,ref:{calculationId:c.id},label:'Calculado pelo SILM: '+result(c)});
  }
  if(spec.origins.includes('USER'))out.push({id:'user',origin:'USER',value:null,ref:null,label:'Valor informado pelo usuário'});
  return out;
 }
 function calculate(f){
  if(!allowed(f.quantity))return;
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
  else say(calcHelp(r.reason),'warning');
  change();
 }
 function pick(id){
  if(!tool||!allowed(tool)||!available()||model.state.module.active!=='medir')return;
  picks.push(id);
  if(picks.length===MS.types[tool].points){
   const r=model.addMeasurement(tool,picks);picks=[];
   if(r.ok){review=r.measurement.id;say('Medida do modelo: '+value(r.measurement)+(tool==='coordination'&&general()?' '+shellText(id):''));if(tool==='coordination')model.setCrystalRepresentation({neighbors:true,selectedUnitId:id});}
   else say(measureHelp(r.reason),'warning');
  }else say('Ponto '+picks.length+' selecionado. Selecione o próximo ponto da medida.');
  change();
 }
 /* Estrutura geral: o número de vizinhos depende do critério de distância, então a medida diz qual é a primeira camada e
    quais são as seguintes. */
 function shellText(unitId){
  const u=model.state.structure?.units.find(x=>x.id===unitId),g=S.crystal.geometry(element());if(!u||!g)return '';
  const n=g.neighbors(u.site),f=d=>U.format(d,unit);
  const lo=n.distances[0],hi=n.distances[n.distances.length-1],next=n.shells.filter(s=>s.distance>hi+5e-4);
  return 'vizinhos na primeira camada, '+(hi-lo>5e-4?'entre '+f(lo)+' e '+f(hi):'a '+f(lo))+'.'+(next.length?' Camadas seguintes: '+next.map(s=>s.count+' a '+f(s.distance)).join('; ')+'.':'')+' Nesta estrutura, o número de coordenação depende da distância considerada.';
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
  host.replaceChildren();moduleHost.replaceChildren();history.replaceChildren();
  field(moduleHost,'Módulo ativo',select('silm-module',[['explorar','Explorar'],['medir','Medir'],['calcular','Calcular']],state.module.active,v=>{if(activity()?.lockedModule())return;reset();model.setModule(v);onModule(v);change();}));
  document.getElementById('silm-module').disabled=!!activity()?.lockedModule();
  if(state.module.active!=='explorar'){
   host.append(node('p','Medições e cálculos usam o modelo cristalográfico em escala física. Zoom e projeção não alteram os valores.'));
   if(!available())host.append(node('p',model.measurementAvailability().reason==='DEFORMED'?'Restaure a experiência de deformação em Explorar para medir ou calcular a estrutura de referência.':'Organize uma estrutura cristalina em Explorar para usar este módulo. A montagem livre não tem escala física.'));
   else if(state.module.active==='medir'){
    field(host,'Instrumento',select('silm-instrument',[['','Escolha um instrumento'],...Object.entries(MS.types).filter(([k])=>allowed(k)).map(([k,t])=>[k,t.label])],tool||'',v=>{tool=v||null;picks=[];review=null;change();say(v?'Selecione '+points(MS.types[v].points)+' na cena.':'Instrumento desligado.');}));
    field(host,'Unidade de comprimento',select('silm-measure-unit',Object.keys(U.length).map(k=>[k,k]),unit,v=>{unit=v;change();}));
    host.append(node('p',tool?'Selecionados: '+picks.length+' de '+MS.types[tool].points+'. Para ângulos, B é o vértice.':'Selecione um instrumento para medir na cena.'));
    host.append(button('Cancelar seleção',()=>{tool=null;picks=[];change();}));
   }else{
    const formulas=CA.applicable(type()).filter(f=>allowed(f.quantity));if(!formulas.some(f=>f.id===formula))formula=formulas[0]?.id;
    field(host,'Fórmula',select('silm-formula',formulas.map(f=>[f.id,f.name]),formula,id=>{formula=id;choice={};user={};change();}));
    const f=S.formulas[formula];if(f){
     host.append(node('p',f.expression),node('p',f.notes));{const d=f.describe?.(S.crystal.geometry(element()));if(d){const n=node('p',d);n.id='silm-formula-detail';host.append(n);}}
     for(const spec of f.requiredInputs){
      const opts=options(spec);if(!opts.some(o=>o.id===choice[spec.key]))choice[spec.key]=opts[0]?.id;
      field(host,spec.symbol+' — '+spec.name+' ('+spec.unit+')',select('silm-origin-'+spec.key,opts.map(o=>[o.id,o.label]),choice[spec.key],v=>{choice[spec.key]=v;change();}));
      // Entrada que o SILM calcula (V, r…) mas que ainda não foi calculada: indicar a fórmula que vem antes.
      const before=spec.origins.includes('CALCULATED')&&spec.key!=='n'&&!opts.some(o=>o.origin!=='USER')?CA.applicable(type()).find(x=>x.quantity===spec.quantity&&x.id!==f.id&&allowed(x.quantity)):null;
      if(before){const hint=node('p');hint.className='silm-calc-dependency';hint.id='silm-dependency-'+spec.key;hint.textContent='Ainda não há '+spec.name+' calculado nesta investigação. Calcule antes “'+before.name+'” ou informe o valor.';
       const go=button('Ir para “'+before.name+'”',()=>{formula=before.id;choice={};user={};change();say('Fórmula escolhida: '+before.name+'.');document.getElementById('silm-formula')?.focus();});go.id='silm-dependency-go-'+spec.key;host.append(hint,go);}
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
   if(MS.current(m,state.structure))row.append(button('Rever na cena',()=>{if(activity()?.lockedModule()&&activity().lockedModule()!=='medir')return;reset();review=m.id;model.setModule('medir');onModule('medir');change();}));
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
