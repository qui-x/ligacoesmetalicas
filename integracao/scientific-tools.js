'use strict';
/* Interface sobre os serviços científicos existentes. Não contém fórmulas próprias. */
SILM.createIntegrationTools=({model,host,moduleHost=host,history,onChange,say,onModule,activity=()=>null})=>{
 const S=SILM,MS=S.measurement,CA=S.calculation,U=S.units;
 let context='',tool=null,picks=[],review=null,formula=null,choice={},user={},unit='Å';
 const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const button=(text,fn)=>{const b=node('button',text);b.type='button';b.className='button outline';b.addEventListener('click',fn);return b;};
 const select=(id,items,value,fn)=>{const s=node('select');s.id=id;for(const [v,t]of items){const o=node('option',t);o.value=v;s.append(o);}s.value=value;s.addEventListener('change',()=>fn(s.value));return s;};
 const field=(parent,text,input)=>{const l=node('label',text);l.htmlFor=input.id;parent.append(l,input);};
 // Segunda faixa de Ver: um botão já escolhe a ferramenta real do motor.
 // A seleção de pontos e o cálculo permanecem atos científicos separados.
 const directIcons={
  distance:'M4 12h16M4 7v10M20 7v10',angle:'M4 19V5m0 14h14M5 18l10-10',
  latticeParameter:'M4 4h16v16H4zM4 9h16M9 4v16',
  coordination:'M12 12h7M12 12l-6-6M12 12l-6 6M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  formula:'M5 5h14M6 11h12M6 17h12M16 14l3 3-3 3'
 };
 const directChoices=(kind,items,selected,onPick,{disabled=false,reason=''}={})=>{
  const bar=document.getElementById('silm-direct-actionbar');if(!bar)return;
  bar.replaceChildren();
  bar.setAttribute('aria-label',kind==='medir'?'Instrumentos de medição':'Fórmulas disponíveis');
  const nav=document.createElement('div');nav.className='silm-direct-choice-row';
  nav.setAttribute('role','group');
  nav.setAttribute('aria-label',kind==='medir'?'Escolher instrumento':'Escolher fórmula');
  for(const item of items){
   const btn=document.createElement('button');btn.type='button';
   btn.className='silm-direct-choice';btn.dataset.silmDirectTool=kind+':'+item.id;
   btn.disabled=disabled||!!item.disabled;
   btn.setAttribute('aria-pressed',String(item.id===selected&&!btn.disabled));
   btn.setAttribute('aria-label',item.label);
   btn.title=btn.disabled?reason||'Organize uma estrutura cristalina válida para utilizar esta ferramenta.':item.label;
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
   svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');
   svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');
   svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
   svg.setAttribute('aria-hidden','true');
   const p=document.createElementNS('http://www.w3.org/2000/svg','path');
   p.setAttribute('d',directIcons[item.id]||directIcons.formula);svg.append(p);
   const caption=document.createElement('span');caption.textContent=item.label;btn.append(svg,caption);
   btn.addEventListener('click',()=>{
    if(btn.disabled)return;
    onPick(item.id);
    requestAnimationFrame(()=>requestAnimationFrame(()=>
     document.querySelector('[data-silm-direct-tool="'+kind+':'+item.id+'"]')?.focus({preventScroll:true})));
   });
   nav.append(btn);
  }
  nav.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   const current=event.target.closest('button[data-silm-direct-tool]');if(!current)return;
   const usable=[...nav.querySelectorAll('button:not(:disabled)')];
   if(!usable.length)return;
   const at=usable.indexOf(current);if(at<0)return;
   event.preventDefault();event.stopPropagation();
   const next=event.key==='Home'?usable[0]:event.key==='End'?usable[usable.length-1]:
    usable[(at+(event.key==='ArrowRight'?1:-1)+usable.length)%usable.length];
   next.click();
  });
  bar.append(nav);
 };
 const available=()=>model.measurementAvailability().ok;
 const type=()=>model.state.structure?.crystallography?.structureType;
 const general=()=>!!type()&&S.crystal.isGeneral(type());
 const element=()=>model.state.metal?S.data.get(model.state.metal.atomicNumber):null;
 const reset=()=>{tool=null;picks=[];review=null;formula=null;choice={};user={};};
 const change=()=>onChange();
 const allowed=t=>!activity()||activity().allows(t);
 function value(m){return U.format(m.value,m.unit==='Å'?unit:m.unit);}
 const points=n=>n+(n===1?' ponto':' pontos');
 const pointLetters=['A','B','C'];
 const measureDirections={
  distance:'Régua: selecione dois centros metálicos. O segmento A–B usa as coordenadas do modelo, não os pixels da tela.',
  angle:'Goniômetro: selecione três centros na ordem A, B, C. O ponto B será o vértice do ângulo.',
  latticeParameter:'Parâmetro de rede: selecione centros equivalentes nas extremidades de uma aresta da célula.',
  coordination:'Coordenação: selecione um centro para identificar os vizinhos de sua primeira camada.'
 };
 function moduleGuide(title,description,{progress='',actions=[]}={}){
  const section=node('section');section.className='silm-module-guide';section.dataset.module=model.state.module.active;
  section.append(node('strong',title),node('p',description));
  if(progress){const p=node('p',progress);p.className='silm-module-guide-progress';p.setAttribute('role','status');section.append(p);}
  if(actions.length){const row=node('div');row.className='silm-module-guide-actions';
   for(const [label,fn]of actions)row.append(button(label,fn));section.append(row);}
  return section;
 }
 function undoPoint(){if(!picks.length)return;picks.pop();review=null;change();}
 function clearPoints(){if(!picks.length)return;picks=[];review=null;change();}
 // O instrumento opera na cena; atalhos só atuam enquanto a oficina ou Ver tem foco.
 // Campos editáveis e diálogos não são afetados.
 document.addEventListener('keydown',event=>{
  if(model.state.module.active!=='medir'||!tool||!picks.length||event.altKey||event.ctrlKey||event.metaKey)return;
  if(event.key!=='Escape'&&event.key!=='Backspace')return;
  if(event.target.closest('input,select,textarea,[contenteditable="true"],dialog'))return;
  if(!event.target.closest('#si-stage,#silm-direct-tools'))return;
  event.preventDefault();event.stopPropagation();
  if(event.key==='Backspace')undoPoint();else clearPoints();
 },true);
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
  if(r.ok)say('Calculado pelo SILM: '+f.outputSymbol+' = '+result(r.calculation),'info',{group:'calcular'});
  else say(calcHelp(r.reason),'warning',{group:'calcular'});
  change();
 }
 function pick(id){
  if(!tool||!allowed(tool)||!available()||model.state.module.active!=='medir')return;
  picks.push(id);
  if(picks.length===MS.types[tool].points){
   const r=model.addMeasurement(tool,picks);picks=[];
   if(r.ok){review=r.measurement.id;say('Medida do modelo: '+value(r.measurement)+(tool==='coordination'&&general()?' '+shellText(id):''),'info',{group:'medir'});if(tool==='coordination')model.setCrystalRepresentation({neighbors:true,selectedUnitId:id});}
   else say(measureHelp(r.reason),'warning',{group:'medir'});
  }else say('Ponto '+picks.length+' selecionado. Selecione o próximo ponto da medida.','info',{group:'medir'});
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
 function activateMeasure(id){
  tool=tool===id?null:id;picks=[];review=null;
  change();say(tool?'Selecione '+points(MS.types[tool].points)+' na cena.':'Instrumento desligado.','info',{group:'medir'});
 }
 function activateFormula(id){formula=id;choice={};user={};change();}
 function render(){
  const state=model.state,key=state.investigation?.id+':'+state.structure?.mode+':'+state.module.active;
  if(key!==context){context=key;reset();}
  host.replaceChildren();moduleHost.replaceChildren();history.replaceChildren();
  if(state.module.active==='medir'){
   directChoices('medir',Object.entries(MS.types).filter(([id])=>allowed(id))
    .map(([id,t])=>({id,label:t.label})),tool,activateMeasure,
    {disabled:!available(),reason:'Organize a estrutura cristalina para medir o modelo.'});
  }else if(state.module.active==='calcular'){
   const applicable=CA.applicable(type()).filter(f=>allowed(f.quantity));
   if(!applicable.some(f=>f.id===formula))formula=applicable[0]?.id||null;
   const listed=applicable.length?applicable:Object.values(S.formulas)
    .filter(f=>allowed(f.quantity)).filter((f,i,all)=>all.findIndex(x=>x.quantity===f.quantity)===i);
   directChoices('calcular',listed.map(f=>({id:f.id,label:f.name})),formula,activateFormula,
    {disabled:!available(),reason:'Organize a estrutura cristalina para calcular.'});
  }
  field(moduleHost,'Módulo ativo',select('silm-module',[['explorar','Explorar'],['medir','Medir'],['calcular','Calcular']],state.module.active,v=>{if(activity()?.lockedModule())return;reset();model.setModule(v);onModule(v);change();}));
  document.getElementById('silm-module').disabled=!!activity()?.lockedModule();
  if(state.module.active!=='explorar'){
   // A ciência trabalha sobre os sítios e o banco cristalográfico, não sobre a imagem renderizada.
   if(!available())host.append(node('p',model.measurementAvailability().reason==='DEFORMED'?'Restaure a experiência de deformação em Explorar para medir ou calcular a estrutura de referência.':'Organize uma estrutura cristalina em Explorar para usar este módulo. A montagem livre não tem escala física.'));
   else if(state.module.active==='medir'){
    const total=tool?MS.types[tool].points:0;
    const nextPoint=pointLetters[picks.length];
    const progress=tool?(picks.length?'Selecionados '+picks.length+'/'+total+' · próximo ponto '+nextPoint:
      'Próximo ponto '+nextPoint+' de '+total):'Selecione o instrumento acima para começar.';
    const operations=tool?[
     ...(picks.length?[['Desfazer último ponto',undoPoint],['Cancelar seleção',clearPoints]]:[]),
     ['Desativar instrumento',()=>activateMeasure(tool)]
    ]:[];
    host.append(moduleGuide(tool?MS.types[tool].label:'Instrumentos de medição',
     tool?measureDirections[tool]:'Escolha uma ferramenta. Em seguida, toque ou use Enter nos centros da cena; o modelo fornece os valores em escala física.',
     {progress,actions:operations}));
    field(host,'Instrumento',select('silm-instrument',[['','Escolha um instrumento'],...Object.entries(MS.types).filter(([k])=>allowed(k)).map(([k,t])=>[k,t.label])],tool||'',v=>{tool=null;activateMeasure(v||null);}));
    field(host,'Unidade de comprimento',select('silm-measure-unit',Object.keys(U.length).map(k=>[k,k]),unit,v=>{unit=v;change();}));
   }else{
    const formulas=CA.applicable(type()).filter(f=>allowed(f.quantity));if(!formulas.some(f=>f.id===formula))formula=formulas[0]?.id;
    field(host,'Fórmula',select('silm-formula',formulas.map(f=>[f.id,f.name]),formula,activateFormula));
    const f=S.formulas[formula];if(f){
     host.append(moduleGuide(f.name,
      'Relação geométrica: '+f.expression+'. Inspecione na cena os centros, as arestas ou os contatos destacados. Os valores registrados mantêm sua origem científica.',
      {progress:f.requiredInputs.length?
       f.requiredInputs.length+' entrada(s) · dado tabelado, medida do modelo, cálculo anterior ou valor informado':
       'Contagem geométrica direta · sem entradas adicionais'}));
     host.append(node('p',f.expression),node('p',f.notes));{const d=f.describe?.(S.crystal.geometry(element()));if(d){const n=node('p',d);n.id='silm-formula-detail';host.append(n);}}
     for(const spec of f.requiredInputs){
      const opts=options(spec);
      // Uma medida realmente realizada nesta investigação prevalece como sugestão,
      // sem impedir que o estudante escolha o dado tabelado ou informe outro valor.
      if(!opts.some(o=>o.id===choice[spec.key]))
       choice[spec.key]=opts.find(o=>o.origin==='MODEL_MEASUREMENT')?.id||opts[0]?.id;
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
 const calcMarks=()=>{
  if(model.state.module.active!=='calcular'||!available()||!formula)return null;
  const f=S.formulas[formula];if(!f)return null;
  // O renderer já dispõe de três anotações científicas. Cada fórmula escolhe
  // a indicação apropriada, sem redesenhar nem recalcular a geometria.
  const mode=f.quantity==='effectiveAtoms'||f.quantity==='packingFactor'?'fractions':
   f.quantity==='radius'||(f.quantity==='latticeParameter'&&f.requiredInputs.some(i=>i.key==='r'))?'contact':'edges';
  return {mode};
 };
 return {render,measure:{pickActive:()=>model.state.module.active==='medir'&&!!tool&&available(),onPick:pick,marks,
  instruction:()=>model.state.module.active==='medir'&&tool&&available()?measureDirections[tool]+' '+(picks.length?'Ponto '+pointLetters[picks.length]+' pendente.':'Inicie no ponto A.') : null},
  calc:{marks:calcMarks}};
};
