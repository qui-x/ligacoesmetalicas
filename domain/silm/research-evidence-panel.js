'use strict';
window.SILM=window.SILM||{};
/** Painel documental no controle existente Explorar > Ductilidade / Maleabilidade.
 * Não modifica investigação, geometria, estado do motor ou propriedades físicas.
 */
SILM.createMultistageResearchPanel=({prefix='silm-multistage'}={})=>{
 const section=document.createElement('section');
 section.className='silm-research-reference silm-research-multistage';
 section.hidden=true;
 section.setAttribute('aria-label','Referências científicas condicionais da pesquisa metálica');
 const heading=document.createElement('strong'),description=document.createElement('p');
 description.className='silm-research-note';
 const pickerLabel=document.createElement('label');
 pickerLabel.className='silm-research-label';
 pickerLabel.textContent='Amostra e condição do estudo';
 const picker=document.createElement('select');picker.id=prefix+'-record';
 picker.setAttribute('aria-label','Escolher condição documental do metal');
 pickerLabel.htmlFor=picker.id;pickerLabel.append(picker);
 const recordTitle=document.createElement('p');recordTitle.className='silm-research-condition';
 const metrics=document.createElement('dl');metrics.className='silm-research-metrics';
 const conditions=document.createElement('p');conditions.className='silm-research-note';
 const source=document.createElement('a');source.target='_blank';source.rel='noopener noreferrer';
 const extra=document.createElement('details');
 const extraSummary=document.createElement('summary');extraSummary.textContent='Limitações, fase e metodologia da fonte';
 const extraBody=document.createElement('p');extraBody.className='silm-research-extra';
 extra.append(extraSummary,extraBody);
 section.append(heading,description,pickerLabel,recordTitle,metrics,conditions,source,extra);
 const metricLabels={
  yield_MPa:'Escoamento',UTS_MPa:'Resistência máxima',
  elong_break_pct:'Alongamento até fratura',elong_uniform_pct:'Alongamento uniforme',
  reduction_area_pct:'Redução de área',
  compression_strain_pct:'Deformação máxima em compressão',
  rolling_reduction_pct:'Redução durante laminação (processamento)'
 };
 const fmt=value=>Number(value).toLocaleString('pt-BR',{maximumFractionDigits:5});
 const unitFor=key=>key.endsWith('_MPa')?'MPa':'%';
 let currentKey='',visible=[];
 function draw(){
  const p=visible[Number(picker.value)]||visible[0];
  if(!p)return;
  const comp=String(p.test).toLowerCase().includes('compress');
  recordTitle.textContent=p.sample+' · etapa '+p.studyStage+' · '+(
   p.classification==='S'?'referência compilada':p.classification==='P1'?
   'experimento primário com temperatura documentada':'experimento condicionado'
  );
  metrics.replaceChildren();
  for(const [key,value] of Object.entries(p.metrics)){
   const title=document.createElement('dt'),amount=document.createElement('dd');
   title.textContent=metricLabels[key]||key;
   if(comp&&['yield_MPa','UTS_MPa'].includes(key))title.textContent+=' (compressão)';
   amount.textContent=fmt(value)+' '+unitFor(key);
   metrics.append(title,amount);
  }
  const temp=p.testTemperatureDescription||
   (Number.isFinite(p.testTemperatureK)?fmt(p.testTemperatureK)+' K (conforme registro da pesquisa)':'Temperatura de ensaio não identificada numericamente');
  conditions.textContent='Ensaio: '+p.test+'. Temperatura: '+temp+'. Pressão de ensaio não homologada como 101325 Pa. Nenhum valor representa automaticamente a CNTP (273,15 K, 101325 Pa).';
  source.href=p.sourceURL;source.textContent='Consultar fonte documental — etapa '+p.studyStage;
  extraBody.textContent='Fase: '+(p.phase||'não especificada')+
   '. Material: '+(p.material||'não especificado')+
   '. Classificação da auditoria: '+(p.reviewStatus||'não informada')+
   '. Ressalvas: '+(p.qualifier||'sem qualificador adicional')+
   (p.notes?'. Notas: '+p.notes:'')+
   '. Registro exclusivo para consulta; NÃO é parâmetro de motor nem extrapolação entre temperaturas.';
 }
 picker.addEventListener('change',draw);
 function update({atomicNumber=null,active=null}={}){
  const symbol=SILM.data?.get?.(atomicNumber)?.symbol||'';
  const eligible=['ductility','malleability'].includes(active);
  const key=symbol+'|'+active;
  if(!eligible||!symbol){section.hidden=true;return;}
  if(key!==currentKey){
   currentKey=key;
   const all=SILM.multistageResearch?.bySymbol?.[symbol]||[];
   visible=all.filter(p=>{
    const test=String(p.test).toLowerCase(),hasComp=Object.hasOwn(p.metrics,'compression_strain_pct');
    if(active==='malleability')return test.includes('compress')||hasComp;
    // Ensaio de tração: não converter valores de compressão ou laminação em ductilidade.
    return !test.includes('compress')&&(test.includes('tração')||test.includes('tensile')||
     Object.hasOwn(p.metrics,'elong_break_pct')||Object.hasOwn(p.metrics,'elong_uniform_pct'));
   });
   picker.replaceChildren();
   for(const [i,p] of visible.entries()){
    const opt=document.createElement('option');opt.value=String(i);
    opt.textContent=(i+1)+'. '+p.sample+' · etapa '+p.studyStage;
    picker.append(opt);
   }
   heading.textContent='Referências documentais · '+symbol;
   description.textContent=visible.length+' condição(ões) da pesquisa científica (etapas 10–57). '+
    (active==='malleability'?'Ensaios de compressão NÃO medem, por si só, a maleabilidade.':
     'Valores de tração dependem de composição e processamento.')+
     ' Fontes primárias, compilações e transcrições pendentes são identificadas individualmente. A animação não utiliza estes números.';
   if(visible.length)draw();
  }
  section.hidden=!visible.length;
 }
 return Object.freeze({root:section,update});
};
