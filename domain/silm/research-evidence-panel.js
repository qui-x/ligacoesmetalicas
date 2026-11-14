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
 // Auditoria suplementar da etapa 65. Valores originais não conferidos não
 // aparecem como medidas validadas; os perfis ficam rastreados no catálogo.
 const statusNote=document.createElement('p');statusNote.className='silm-research-note silm-stage65-status';
 const contextDetails=document.createElement('details');contextDetails.className='silm-stage65-context';contextDetails.hidden=true;
 const contextSummary=document.createElement('summary');contextSummary.textContent='Evidências qualitativas e limites da pesquisa';
 const contextList=document.createElement('ul');contextDetails.append(contextSummary,contextList);
 const pendingDetails=document.createElement('details');pendingDetails.className='silm-stage65-pending';pendingDetails.hidden=true;
 const pendingSummary=document.createElement('summary');pendingSummary.textContent='Transcrições secundárias que ainda exigem verificação original';
 const pendingIntroduction=document.createElement('p');pendingIntroduction.textContent='Dados preservados para auditoria, sem autorização de uso quantitativo no simulador e sem classificação como ensaios primários homologados.';
 const pendingList=document.createElement('ul');pendingDetails.append(pendingSummary,pendingIntroduction,pendingList);
 section.append(heading,description,pickerLabel,recordTitle,statusNote,metrics,conditions,source,extra,contextDetails,pendingDetails);
 const metricLabels={
  yield_MPa:'Escoamento',UTS_MPa:'Resistência máxima',
  elong_break_pct:'Alongamento até fratura',elong_uniform_pct:'Alongamento uniforme',
  reduction_area_pct:'Redução de área',
  compression_strain_pct:'Deformação máxima em compressão',
  rolling_reduction_pct:'Redução durante laminação (processamento)',
  elong_break_reported_max_pct:'Máximo de alongamento relatado (não valor típico)',
  compression_reported_epsilon_tested:'Deformação ε aplicada no ensaio (não limite)',
  compression_true_strain_tested:'Deformação verdadeira avaliada (não limite)',
  compression_yield_strength_MPa:'Escoamento em compressão da amostra (não maleabilidade)',
  compression_hardening_transition_strain_approx:'Deformação da mudança de encruamento (aprox.)',
  compression_reported_strain_pct:'Compressão aplicada no estudo (não limite)',
  compression_asymptotic_model_MPa:'Tensão assintótica AJUSTADA (não escoamento inicial)'
 };
 const fmt=value=>Number(value).toLocaleString('pt-BR',{maximumFractionDigits:5});
 const unitFor=key=>key.endsWith('_MPa')?'MPa':
  ['compression_reported_epsilon_tested','compression_true_strain_tested',
   'compression_hardening_transition_strain_approx'].includes(key)?'(adimensional)':'%';
 let currentKey='',visible=[];
 function draw(){
  const p=visible[Number(picker.value)]||visible[0];
  if(!p)return;
  const comp=String(p.test).toLowerCase().includes('compress');
  recordTitle.textContent=p.sample+' · etapa '+p.studyStage+' · '+(
   p.classification==='S'?'referência compilada':p.classification==='P1'?
   'experimento primário com temperatura documentada':'experimento condicionado'
  );
  statusNote.hidden=p.studyStage<58;
  if(!statusNote.hidden){
   const qual=p.sourceStatus;
   if(p.studyStage===73){
    statusNote.textContent='Fonte primária '+(
     p.sourceReview==='open-access-full-text-checked'?'com artigo aberto inspecionado':
     p.sourceReview==='report-text-and-curves-descriptions-checked'?'com texto do relatório consultado':
     'com resumo e trechos verificáveis, sem auditoria completa do artigo')+
     '. Medida específica da amostra: deformação relatada NÃO é limite de maleabilidade;'+
     ' valor ajustado de modelo NÃO é medição de escoamento. Pressão CNTP não comprovada.';
   }else{
   statusNote.textContent=qual==='primary-fulltext-confirmed'?
    'Fonte primária conferida, com amostra e temperatura do ensaio declaradas; NÃO é CNTP.':
    qual==='maximum-from-primary-abstract'?
    'Resumo primário: apenas um MÁXIMO relatado, sem série completa de ensaios, e NÃO um valor típico de ductilidade.':
    qual==='historical-table-inspected'?
    'Tabela histórica conferida, mas faltam condições completas do experimento; compressão não equivale a tração.':
    qual==='secondary-laboratory-review'?
    'Revisão técnica de laboratório: valor reportado por estudo anterior; amostra e fase não generalizáveis.':
    qual==='historical-patent-reproduction'?
    'Transcrição secundária em patente histórica: fase cristalina e condições não foram verificadas; NÃO atribuir à fase HC automaticamente.':
    'Referência condicional não homologada na CNTP.';
   }
  }
  metrics.replaceChildren();
  for(const [key,value] of Object.entries(p.metrics)){
   const title=document.createElement('dt'),amount=document.createElement('dd');
   title.textContent=metricLabels[key]||key;
   if(comp&&['yield_MPa','UTS_MPa'].includes(key))title.textContent+=' (compressão)';
   amount.textContent=fmt(value)+' '+unitFor(key);
   metrics.append(title,amount);
  }
  const qualifierFlag=p.sourceStatus==='maximum-from-primary-abstract'?
    ' ATENÇÃO: alongamento máximo, não ruptura média da amostra.':'';
  const temp=p.testTemperatureDescription||
   (Number.isFinite(p.testTemperatureK)?fmt(p.testTemperatureK)+' K (conforme registro da pesquisa)':'Temperatura de ensaio não identificada numericamente');
  conditions.textContent='Ensaio: '+p.test+'. Temperatura: '+temp+'. Pressão de ensaio não homologada como 101325 Pa. Nenhum valor representa automaticamente a CNTP (273,15 K, 101325 Pa).'+qualifierFlag;
  source.href=p.sourceURL;source.textContent='Consultar fonte documental — etapa '+p.studyStage;
  extraBody.textContent='Fase: '+(p.phase||'não especificada')+
   '. Material: '+(p.material||'não especificado')+
   '. Classificação da auditoria: '+(p.reviewStatus||'não informada')+
   '. Ressalvas: '+(p.qualifier||'sem qualificador adicional')+
   (p.notes?'. Notas: '+p.notes:'')+
   (p.additionalBound?'. Limite reportado na fonte: m ≤0,009 (expoente da sensibilidade à taxa; NÃO valor exato).':'')+
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
   const supplement=SILM.stage65Evidence;
   const approvedSupplement=supplement?.numericBySymbol?.[symbol]||[];
   const primaryCompression=SILM.compressionStage73?.bySymbol?.[symbol]||[];
   visible=[...all,...approvedSupplement,...(active==='malleability'?primaryCompression:[])].filter(p=>{
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
   const rawContext=supplement?.contextBySymbol?.[symbol]||[];
   contextDetails.hidden=active!=='ductility'||rawContext.length===0;
   contextList.replaceChildren();
   if(!contextDetails.hidden)for(const record of rawContext){
    const li=document.createElement('li');
    const condition=Number.isFinite(record.testTemperatureK)?record.testTemperatureK+' K':'temperatura não quantificada';
    const prefixText=record.bound?
     'Limite estrito: alongamento <0,1% (NÃO uma medida pontual). ':
     'Descrição experimental sem alongamento numérico de ruptura. ';
    li.textContent='Etapa '+record.studyStage+' · '+condition+'. '+prefixText+
     (record.qualifier||record.notes||'')+' ';
    const link=document.createElement('a');link.href=record.sourceURL;
    link.target='_blank';link.rel='noopener noreferrer';link.textContent='Fonte';
    li.append(link);contextList.append(li);
   }
   const pending=active==='ductility'?(supplement?.pendingBySymbol?.[symbol]||[]):[];
   pendingDetails.hidden=pending.length===0;
   pendingList.replaceChildren();
   pendingSummary.textContent=pending.length+' transcrições secundárias: conferência original pendente';
   if(pending.length)for(const record of pending){
    const li=document.createElement('li');
    li.textContent=record.sample+' · Etapa '+record.studyStage+
     ' · valores transcritos, mas original ainda não conferido. ';
    const link=document.createElement('a');link.href=record.sourceURL;link.textContent='Reprodução documental';
    link.target='_blank';link.rel='noopener noreferrer';li.append(link);pendingList.append(li);
   }
   heading.textContent='Referências documentais · '+symbol;
   description.textContent=visible.length+' condição(ões) da pesquisa científica (etapas 10–73). '+
    (active==='malleability'?'Ensaios de compressão NÃO medem, por si só, a maleabilidade.':
     'Valores de tração dependem de composição e processamento.')+
     ' Fontes primárias, compilações e transcrições pendentes são identificadas individualmente. A animação não utiliza estes números.';
   if(visible.length)draw();
  }
  section.hidden=!visible.length&&contextDetails.hidden&&pendingDetails.hidden;
 }
 return Object.freeze({root:section,update});
};
