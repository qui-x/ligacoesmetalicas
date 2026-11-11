'use strict';
SILM.createUnifiedUI=({model,storage,session,selectMetal,prepareMetal,say})=>{
 const S=SILM,B=BaseDemoSI,$=id=>document.getElementById(id),N=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;},link=(text,href)=>{const a=N('a',text);a.className='button outline';a.href=href;return a;};
 const fields={name:'',className:'',date:new Date().toLocaleDateString('pt-BR'),teacher:'',group:'',observations:'',analysis:'',interpretation:'',answer:'',conclusion:''};
 let progress={schemaVersion:1,completed:{}},table=null;let journal=B.createJournalStore(B.storage);let notebookFilter='todos',notebookRefresh=null;
 function normalize(value){const completed={};for(const t of S.themes.registry)if(value?.completed?.[t.id]===t.version)completed[t.id]=t.version;return {schemaVersion:1,completed};}
 function init(){
  const raw=storage.get('learning.themes',null);progress=normalize(raw);
  const aliases={'ligacao-metalica':'ligacao-metalica',estrutura:'estrutura-metais',eletrons:'eletrons-deslocalizados',propriedades:'propriedades-metalicas'};
  if(raw===null){try{for(const [old,id]of Object.entries(aliases))if(JSON.parse(localStorage.getItem('simcore_domain_silm_v1_learning.theme.'+old)||'false')===true)progress.completed[id]=1;}catch{say('Não foi possível ler marcadores antigos. As investigações permanecem preservadas.','warning');}}
  storage.set('learning.themes',progress);
  // Somente campos de recompensa isolados no espaço do aplicativo; nenhum valor científico é removido.
  try{for(const k of Object.keys(localStorage)){const pre=['silm-base-integration:','simcore_domain_silm_v1_'].find(p=>k.startsWith(p));if(pre&&/^(score|points|xp|level|rank|streak|medals|badges|progressPercent)$/i.test(decodeURIComponent(k.slice(pre.length))))localStorage.removeItem(k);}}catch{}
 }
 function home(){
  const themeCount=S.themes.registry.length,missionCount=S.missions.registry.length,routeCount=S.routes.registry.length;
  $('si-home-learning-meta').textContent=themeCount+' '+(themeCount===1?'tema para explorar':'temas para explorar');
  $('si-home-missions-meta').textContent=missionCount+' '+(missionCount===1?'desafio para resolver':'desafios para resolver');
  $('si-home-scripts-meta').textContent=routeCount+' '+(routeCount===1?'investigação guiada':'investigações guiadas');
  const noteCount=journal.snapshot().notes.length;
  $('si-home-notebook-meta').textContent=noteCount?(noteCount+' registro'+(noteCount===1?'':'s')+' salvo'+(noteCount===1?'':'s')):'Pronto para seus registros';
  const c=session.context(),resume=$('si-home-resume');resume.hidden=!c;
  if(c){$('si-home-resume-title').textContent=session.route().title;$('si-home-resume-meta').textContent=c.status==='completed'?'Concluído':'Investigação em andamento';$('si-home-resume-link').href='#/'+(c.type==='mission'?'missoes':'roteiros')+'?item='+c.id;}
  const e=model.state.metal,n=model.state.structure?.units.length||0;
  $('si-home-scene-summary').hidden=!e;
  $('si-home-scene-summary').textContent=e?S.data.get(e.atomicNumber).name+' · '+n+' '+(n===1?'unidade salva':'unidades salvas'):'';
 }
 function notebookScene(snapshot=model.snapshot()){
  const e=snapshot?.metal?S.data.get(snapshot.metal.atomicNumber):null,id=e?'silm-metal-'+e.atomicNumber:null;
  return {schemaVersion:1,entities:e?[{id,label:e.name+' ('+e.symbol+')',kind:'label'}]:[],selectedId:id};
 }
 function notebookPresentation(note){
  const raw=String(note.body||''),lines=raw.split(/\r?\n/),first=lines[0]||'';let title=first,bodyLines=lines;
  if(first.startsWith('Título: ')){title=first.slice(8);bodyLines=lines.slice(1);if(bodyLines[0]==='')bodyLines=bodyLines.slice(1);}else{bodyLines=lines.slice(1);}
  const id=note.attemptId||'';let category=({observacao:'Anotação',hipotese:'Hipótese',conclusao:'Conclusão'})[note.kind]||'Registro';
  if(id.startsWith('attempt-silm-complete-'))category='Atividade concluída';
  else if(id.startsWith('attempt-silm-report-'))category='Relatório registrado';
  return {title:title||'Registro',body:bodyLines.join('\n').trim(),category};
 }
 function archivedReport(id){
  if(typeof id!=='string'||!id.startsWith('attempt-silm-report-'))return null;
  const archive=storage.get('report.archive:'+id,null);
  if(!archive||!archive.record?.checkpoint||!archive.record?.activityContext)return null;
  return archive;
 }
 function exportNotebook(){
  const document=journal.snapshot(),reports={};
  for(const note of document.notes)if(note.attemptId?.startsWith('attempt-silm-report-')){
   const value=archivedReport(note.attemptId);if(!value)throw Error('Há um relatório sem arquivo. Preserve o Caderno atual antes de exportar.');reports[note.attemptId]=value;
  }
  return JSON.stringify({format:'silm-notebook-v2',document,reports},null,2);
 }
 function decodeNotebook(text){
  const value=JSON.parse(text);if(!value||!['silm-notebook-v2','base-demo-si-journal-v1'].includes(value.format)||!B.parseJournal(value.document))throw Error('Backup inválido; os dados atuais foram preservados.');
  const reports=value.format==='silm-notebook-v2'?value.reports:{};
  if(!reports||typeof reports!=='object'||Array.isArray(reports)||Object.keys(reports).length>500)throw Error('Arquivos de relatório inválidos.');
  for(const [id,archive]of Object.entries(reports)){
   const record=archive?.record;
   if(!/^attempt-silm-report-[a-z0-9-]+$/.test(id)||!record?.activityContext||!S.validateScientificState(record.checkpoint).ok||typeof archive.title!=='string'||archive.title.length>300||!record.report||!['name','date','observations','interpretation','conclusion'].every(k=>typeof record.report[k]==='string'&&record.report[k].length<=10000))throw Error('Relatório incompatível; os dados atuais foram preservados.');
  }
  for(const note of value.document.notes)if(note.attemptId?.startsWith('attempt-silm-report-')&&!reports[note.attemptId]){
   if(value.format==='base-demo-si-journal-v1'&&archivedReport(note.attemptId))reports[note.attemptId]=archivedReport(note.attemptId);
   else throw Error('Este backup contém referências sem o relatório completo. Os dados atuais foram preservados.');
  }
  return {document:value.document,reports};
 }
 function restoreNotebook(value){
  return storage.transaction(()=>{
   for(const [id,archive]of Object.entries(value.reports))if(!storage.set('report.archive:'+id,archive))throw Error('Falha ao guardar relatório');
   if(!journal.importJSON({format:'base-demo-si-journal-v1',document:value.document}))throw Error('Falha ao guardar Caderno');
  },{onRollback:()=>{journal=B.createJournalStore(B.storage);}}).ok;
 }
 function notebookRelatedAction(note){
  const id=note.attemptId||'',done='attempt-silm-complete-';
  if(id.startsWith(done)){
   const tail=id.slice(done.length),activityId=[...S.missions.registry,...S.routes.registry].map(r=>r.id).sort((a,b)=>b.length-a.length).find(key=>tail===key||tail.startsWith(key+'-'));
   if(S.missions.get(activityId))return {label:'Abrir missão',href:'#/missoes?item='+encodeURIComponent(activityId)};
   if(S.routes.get(activityId))return {label:'Abrir roteiro',href:'#/roteiros?item='+encodeURIComponent(activityId)};
  }
  if(id.startsWith('attempt-silm-report-'))return {label:'Abrir relatório',href:'#/relatorios?arquivo='+encodeURIComponent(id)};
  return null;
 }
 function recordActivity(route,activity){
  if(!route||!activity?.checkpoint)return 'error';
  const state=activity.checkpoint,e=state.metal?S.data.get(state.metal.atomicNumber):null,type=route.type==='mission'?'Missão':'Roteiro',participle=route.type==='mission'?'concluída':'concluído';
  const key=String(route.id+'-'+(state.investigation?.id||Date.now().toString(36))).toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-|-+$/g,'').slice(0,40);
  const attemptId='attempt-silm-complete-'+key;
  if(journal.snapshot().notes.some(n=>n.attemptId===attemptId))return 'duplicate';
  const structure=(t=>t&&S.crystal.isGeneral(t)?S.crystal.label(t,e):t)(state.structure?.crystallography?.structureType)||(state.structure?.mode==='crystalline'?'Estrutura cristalina':'Montagem livre');
  const lines=[
   'Título: '+type+' '+participle+': '+route.title,
   'Atividade: '+route.title,
   'Módulo: '+route.module,
   e?'Metal: '+e.name+' ('+e.symbol+')':'',
   'Estrutura: '+structure,
   'Unidades na montagem: '+(state.structure?.units?.length||0),
   'Medições registradas: '+(state.measurements?.length||0),
   'Cálculos registrados: '+(state.calculations?.length||0),
   'Critério de conclusão: '+(route.guidance?.criterion||route.completionCriteria||'Atividade concluída'),
   String(activity.report?.conclusion||'').trim()?'Conclusão do estudante: '+String(activity.report.conclusion).trim().slice(0,600):''
  ].filter(Boolean);
  if(!journal.addNote({kind:'conclusao',body:lines.join('\n')},notebookScene(state),attemptId))return 'error';
  home();notebookRefresh?.();return 'added';
 }
 function recordReport(record,route){
  if(!record?.checkpoint||!record.activityContext||!route)return 'error';
  const state=record.checkpoint,report=record.report||{},free=record.activityContext.type==='free';
  const token=String((free?'livre':record.activityContext.id)+'-'+(state.investigation?.id||('metal-'+(state.metal?.atomicNumber||'unknown')))).toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-|-+$/g,'').slice(0,40)||'livre';
  const attemptId='attempt-silm-report-'+token;
  if(journal.snapshot().notes.some(n=>n.attemptId===attemptId))return 'duplicate';
  const e=state.metal?S.data.get(state.metal.atomicNumber):null;
  const structure=(t=>t&&S.crystal.isGeneral(t)?S.crystal.label(t,e):t)(state.structure?.crystallography?.structureType)||(state.structure?.mode==='crystalline'?'Estrutura cristalina':'Montagem livre');
  const short=(value,max=220)=>String(value||'').trim().slice(0,max);
  const lines=[
   'Título: Relatório registrado: '+(route.title||'Investigação livre'),
   'Atividade: '+(route.title||'Investigação livre'),
   'Módulo: '+(route.module||state.module?.active||'explorar'),
   e?'Metal: '+e.name+' ('+e.symbol+')':'',
   'Estrutura: '+structure,
   'Unidades na montagem: '+(state.structure?.units?.length||0),
   'Medições registradas: '+(state.measurements?.length||0),
   'Cálculos registrados: '+(state.calculations?.length||0),
   [report.name,report.className,report.group].some(x=>short(x))?'Identificação: '+[report.name,report.className&&('Turma '+report.className),report.group&&('Grupo '+report.group),report.teacher&&('Professor '+report.teacher)].map(x=>short(x,80)).filter(Boolean).join(' · '):'',
   short(report.observations)?'Observações: '+short(report.observations):'',
   short(report.analysis)?'Análise: '+short(report.analysis):'',
   short(report.interpretation)?'Interpretação: '+short(report.interpretation):'',
   short(report.answer)?'Resposta: '+short(report.answer):'',
   short(report.conclusion)?'Conclusão: '+short(report.conclusion):''
  ].filter(Boolean);
  const body=lines.join('\n').slice(0,1200);
  const archive={record,title:route.title||'Investigação livre',module:route.module||state.module?.active||'explorar',archivedAt:new Date().toISOString()};
  const saved=storage.transaction(()=>{if(!storage.set('report.archive:'+attemptId,archive)||!journal.addNote({kind:'observacao',body},notebookScene(state),attemptId))throw Error('Falha ao arquivar');},{onRollback:()=>{journal=B.createJournalStore(B.storage);}});
  if(!saved.ok)return 'error';
  home();notebookRefresh?.();return 'added';
 }
 /* Aprender na arquitetura do SIAB: lista de linhas (título, resumo e situação) e tema em coluna de leitura (sobretítulo,
    título, ideia principal, ações), com o aprofundamento, as conexões e as fontes do SILM logo abaixo. */
 let themeKey='',lastTheme=null;
 window.addEventListener('si-route-changed',event=>{if(event.detail!=='aprender'){themeKey='';lastTheme=null;}});
 function themes(){
  const host=$('silm-themes'),head=$('silm-themes-head'),id=new URLSearchParams(location.hash.split('?')[1]||'').get('tema'),t=S.themes.get(id);
  const key=(t?t.id:'lista')+'|'+S.themes.registry.map(x=>progress.completed[x.id]?1:0).join('');
  if(key===themeKey&&host.childElementCount)return;const previous=themeKey.split('|')[0];themeKey=key;host.replaceChildren();head.hidden=!!t;
  if(id&&!t)say('Tema não encontrado. Escolha um tema da lista.','warning');
  if(!t){
   const categories={fundamentos:'Fundamentos',familias:'Famílias de metais',estruturas:'Estruturas cristalinas',propriedades:'Propriedades metálicas',calculos:'Medições e cálculos',aplicacoes:'Aplicações e escalas'};
   const controls=N('div');controls.className='silm-learning-filters';
   const label=N('label','Filtrar temas');label.htmlFor='silm-themes-filter';
   const filter=N('select');filter.id='silm-themes-filter';
   for(const [id,title] of [['all','Todos os assuntos'],...Object.entries(categories)]){const opt=N('option',title);opt.value=id;filter.append(opt);}
   const search=N('input');search.type='search';search.id='silm-themes-search';search.placeholder='Pesquisar tema ou metal';search.setAttribute('aria-label','Pesquisar temas');
   const metalLabel=N('label','Metal disponível');metalLabel.htmlFor='silm-themes-metal-filter';
   const metalFilter=N('select');metalFilter.id='silm-themes-metal-filter';metalFilter.setAttribute('aria-label','Filtrar por metal disponível');
   const allMetals=N('option','Todos os metais');allMetals.value='all';metalFilter.append(allMetals);
   for(const e of S.data.elements.filter(e=>e.silmEligibility.status==='available')){
    const option=N('option',e.name+' ('+e.symbol+')');option.value=String(e.atomicNumber);metalFilter.append(option);
   }
   const count=N('p');count.className='silm-learning-count';count.setAttribute('role','status');count.setAttribute('aria-live','polite');
   controls.append(label,filter,metalLabel,metalFilter,search);host.append(controls,count);
   const list=N('div');list.className='silm-content-list silm-learning-catalog';
   const groups=new Map();
   for(const item of S.themes.registry){
    const cat=item.category||'fundamentos';if(!groups.has(cat))groups.set(cat,[]);
    groups.get(cat).push(item);
   }
   const headingMap=new Map(),rows=[];
   for(const [category,items] of groups){
    const heading=N('h2',categories[category]||category);heading.className='silm-catalog-group-heading';headingMap.set(category,heading);list.append(heading);
    for(const item of items){
     const row=N('a');row.className='silm-content-row';row.href='#/aprender?tema='+item.id;row.id='theme-card-'+item.id;
     const detail=item.subtitle+'. '+item.description+' · '+item.relatedMetals.length+' '+(item.relatedMetals.length===1?'metal':'metais');
     const text=N('span');text.append(N('strong',item.title),N('small',detail));
     const status=N('span',progress.completed[item.id]?'Revisado':'Não revisado');status.className='silm-row-status';
     row.append(text,status);list.append(row);
     rows.push({row,category,metals:item.relatedMetals,haystack:(item.title+' '+item.subtitle+' '+item.description+' '+item.relatedMetals.map(z=>S.data.get(z).name+' '+S.data.get(z).symbol).join(' ')).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase()});
    }
   }
   const apply=()=>{
    const q=search.value.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().trim(),counts=new Map();
    for(const item of rows){const shown=(filter.value==='all'||filter.value===item.category)&&(metalFilter.value==='all'||item.metals.includes(Number(metalFilter.value)))&&(!q||item.haystack.includes(q));item.row.hidden=!shown;if(shown)counts.set(item.category,(counts.get(item.category)||0)+1);}
    for(const [id,heading] of headingMap)heading.hidden=!counts.get(id);count.textContent=Array.from(counts.values()).reduce((sum,n)=>sum+n,0)+' de '+rows.length+' temas';
   };
   filter.addEventListener('change',apply);metalFilter.addEventListener('change',apply);search.addEventListener('input',apply);apply();
   host.append(list);
   // Retorno do tema: o foco volta para a linha do tema aberto, como quem fecha um detalhe.
   if(lastTheme){const back=$('theme-card-'+lastTheme);lastTheme=null;if(back)requestAnimationFrame(()=>back.focus({preventScroll:false}));}
   return;}
  const article=N('article');article.className='silm-reading';article.setAttribute('aria-labelledby','theme-title');
  const eyebrow=N('p','APRENDER · TEMA');eyebrow.className='eyebrow';const title=N('h1',t.title);title.id='theme-title';title.tabIndex=-1;
  const idea=t.concepts.find(c=>c.title==='Ideia principal'),lead=N('p',idea?idea.text:t.description);lead.className='silm-lead';
  article.append(eyebrow,title,lead,N('p',t.subtitle+'. '+t.description));
  if(t.investigation){
   const study=t.investigation,section=N('section');section.className='silm-theme-inquiry';
   const heading=N('h2','Investigue este tema'),prompt=N('p',study.problem);
   section.append(heading,prompt,N('h3','Antes de começar'),N('p',study.prediction));
   const steps=N('ol');steps.className='silm-theme-inquiry-steps';
   for(const action of study.actions)steps.append(N('li',action));
   section.append(N('h3','Percurso na Oficina'),steps,N('h3','Que evidência registrar?'),N('p',study.evidence),N('h3','Interprete'),N('p',study.reflection));
   article.append(section);
  }
  let metalChoice=null;
  if(t.relatedMetals.length>1&&!t.comparison){
   const field=N('div');field.className='silm-field silm-theme-metal-choice';
   const label=N('label','Metal a investigar');label.htmlFor='silm-theme-metal';
   const select=N('select');select.id='silm-theme-metal';
   for(const z of t.relatedMetals){
    const e=S.data.get(z),eligible=S.crystal.eligibility(e),opt=N('option',e.name+' ('+e.symbol+')'+(eligible.status!=='available'?' · rede indisponível':''));opt.value=String(z);select.append(opt);
   }
   metalChoice=select;field.append(label,select);
   article.append(field);
  }
  const actions=N('div');actions.className='silm-actions';
  const metal=S.data.get(t.relatedMetals[0]),investigate=N('button',t.comparison?'Preparar Cobre na Oficina':'Investigar na oficina');investigate.type='button';investigate.className='button primary';investigate.id='theme-investigate';
  const prepare=(z)=>{
   const selected=S.data.get(z);if(!selected)return;
   // A seleção não troca automaticamente uma investigação ativa: o fluxo da Montagem mantém o controle do estudante.
   if(model.state.metal?.atomicNumber===selected.atomicNumber){location.hash='#/ambiente';return;}
   if(!prepareMetal?.(selected.atomicNumber)){say('Não foi possível preparar '+selected.name+' na Montagem.','warning');return;}
   location.hash='#/ambiente';say(selected.name+' preparado na Montagem. Escolha Iniciar para começar a investigação.','success');
   requestAnimationFrame(()=>requestAnimationFrame(()=>{const open=document.querySelector('[data-open-dock="montagem"]');if(open&&open.getAttribute('aria-expanded')!=='true')open.click();}));
  };
  investigate.addEventListener('click',()=>prepare(metalChoice?Number(metalChoice.value):metal.atomicNumber));
  const mark=N('button',progress.completed[t.id]?'Revisado · desmarcar':'Marcar como revisado');mark.type='button';mark.className='button outline silm-quiet';mark.id='theme-complete';mark.setAttribute('aria-pressed',String(!!progress.completed[t.id]));
  mark.addEventListener('click',()=>{if(progress.completed[t.id])delete progress.completed[t.id];else progress.completed[t.id]=t.version;storage.set('learning.themes',progress);themes();$('theme-complete').focus();say(progress.completed[t.id]?'Tema marcado como revisado. Ele continua disponível para revisitar.':'Marcação de revisado removida.','success');});
  actions.append(investigate);
  if(t.comparison){
   const second=N('button','Preparar Neodímio na Oficina');second.className='button outline';second.type='button';second.id='theme-compare-neodimio';second.addEventListener('click',()=>prepare(60));
   actions.append(second);
  }
  actions.append(mark);article.append(actions);
  if(t.comparison){const note=N('p',t.comparison.caveat);note.className='silm-learning-science-note';article.append(note);}
  const related=N('section');related.className='silm-related';related.setAttribute('aria-labelledby','theme-related');const rh=N('h2','Conteúdo relacionado');rh.id='theme-related';related.append(rh);
  const group=(label,items)=>{if(!items.length)return;const row=N('div');row.className='silm-related-row';row.append(N('span',label));for(const [text,href] of items)row.append(link(text,href));related.append(row);};
  group(t.relatedMissions.length===1?'Missão relacionada':'Missões relacionadas',t.relatedMissions.map(m=>[S.missions.get(m).title,'#/missoes?item='+m]));
  group(t.relatedRoutes.length===1?'Roteiro relacionado':'Roteiros relacionados',t.relatedRoutes.map(r=>[S.routes.get(r).title,'#/roteiros?item='+r]));
  const metals=N('p');metals.className='silm-related-metals';
  const names=t.relatedMetals.slice(0,10).map(z=>S.data.get(z).name).join(', ');
  const suffix=t.relatedMetals.length>10?' e mais '+(t.relatedMetals.length-10)+' disponíveis pela seleção.':'';
  metals.append(N('span','Metais para observar'),': '+names+suffix);
  related.append(metals);article.append(related);
  const deeper=N('section');deeper.setAttribute('aria-labelledby','theme-deeper');const dh=N('h2','Aprofunde');dh.id='theme-deeper';deeper.append(dh);
  for(const c of t.concepts){if(c===idea)continue;const d=N('details');d.append(N('summary',c.title),N('p',c.text));deeper.append(d);}
  const sources=N('details');sources.append(N('summary','Fontes'));for(const sid of t.sources){const source=S.data.source(sid);const p=N('p',source.institution+' — '+source.title);if(source.url){const a=link('Consultar',source.url);a.target='_blank';a.rel='noopener noreferrer';p.append(' ',a);}sources.append(p);}
  deeper.append(sources);article.append(deeper);
  const back=link('Todos os temas','#/aprender');back.id='theme-back';article.append(back);host.append(article);
  // Ao abrir o tema (não ao remarcar), a página volta ao topo e o foco vai ao título, como no SIAB.
  lastTheme=t.id;if(previous!==t.id)requestAnimationFrame(()=>{window.scrollTo(0,0);title.focus({preventScroll:true});});
 }
 const operation=text=>String(text).replaceAll('Montagem → Metal','Montagem → Preparo').replaceAll('Ver → Analisar → Calcular','Ver → Analisar → Cálculos cristalográficos').replaceAll('Ver → Observar → Camadas','Ver → Observar → Estrutura e representação').replaceAll('O Caderno não está ativado no SILM.','O Caderno guarda observações locais.');
 /* Manual na arquitetura do SIAB: barra com busca, "Voltar à oficina" e impressão; início com apresentação, "Quero saber" e
    grupos de tópicos; tópico com caminho, artigo, detalhes recolhíveis, "Veja também" e retorno; resultados de busca. */
 const MANUAL_GROUPS=[['Investigue',['interface','aplicacoes-metalicas','graos-microestrutura','travessia-escalas','selecionar-metal','montagem','estruturas-cristalinas','eletrons-deslocalizados','propriedades-metalicas','explorar','medir','calcular','vista','vista-3d']],['Prepare e registre',['atividades','montagens-prontas','caderno','relatorio']],['Orientação',['navegacao','tour','problemas','manual','preferencias','abertura','reiniciar','offline','sobre-silm']],['Para ensinar',['professor']]];
 const MANUAL_QUICK=[['selecionar-metal','Como escolher um metal'],['medir','Como medir o parâmetro de rede'],['problemas','Por que uma opção não aparece']];
 const arrowSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const renderReferenceContext=(article,topicId,referenceId)=>{
   if(!['aplicacoes-metalicas','graos-microestrutura'].includes(topicId))return;
   const saved=model.state.metadata?.workshop?.referenceId;
   const selected=S.workshop?.get?.(referenceId||saved);
   const elementId=selected?.atomicNumber??model.state.metal?.atomicNumber;
   const metal=elementId?S.data.get(elementId):null;
   const atlas=elementId?S.metalAtlas?.get?.(elementId):null;
   const section=N('section');section.className='silm-manual-reference';section.id='manual-reference';
   const sourceLink=(label,url)=>{
    if(typeof url!=='string'||!/^https:\/\//.test(url))return null;
    const a=N('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;
   };
   const heading=text=>{const h=N('h2',text);section.append(h);};
   const paragraph=text=>{if(text)section.append(N('p',text));};
   if(topicId==='aplicacoes-metalicas'&&selected){
    heading('Aplicação em estudo: '+selected.title);
    paragraph('Componente: '+selected.component);
    paragraph('Material indicado: '+selected.material);
    paragraph(selected.explanation);
    if(selected.composition?.length){
     section.append(N('h3','Constituintes descritos para esta aplicação'));
     const list=N('ul');
     for(const [name,role]of selected.composition)list.append(N('li',name+' — '+role));
     section.append(list);
    }
    paragraph(selected.caveat);
    paragraph('A rede representa o elemento de referência, não todos os materiais, fases ou camadas de um produto.');
    paragraph('A aproximação entre Objeto, Grãos, Rede e Centro é didática; não equivale a ampliar uma imagem experimental.');
    const credit=selected.atlasPath?'Ilustração gerada por IA · aplicação tecnológica, não fotografia nem certificação de composição.':'Ilustração didática de referência genérica, sem certificação da composição do objeto.';
    paragraph(credit);
    const src=sourceLink('Consultar fonte desta aplicação',selected.sourceURL||atlas?.referenceURL);
    if(src)section.append(src);
    article.append(section);
   }else if(topicId==='aplicacoes-metalicas'&&atlas){
    heading('Referência do metal: '+metal?.name);
    paragraph(atlas.application);paragraph('Material: '+atlas.materialCategory);paragraph(atlas.caveat);
    paragraph('Imagem gerada por IA; não representa uma amostra de composição medida.');
    const src=sourceLink('Fonte da aplicação',atlas.referenceURL);if(src)section.append(src);
    article.append(section);
   }else if(topicId==='graos-microestrutura'&&metal){
    heading('Contexto e fontes: '+metal.name);
    paragraph('O desenho da Oficina é um modelo D0 de policristal, sem tamanho real em µm, composição ou porcentagens medidas.');
    if(selected)paragraph('Objeto de partida: '+selected.title+' · '+selected.material+'. O desenho dos grãos não deriva da peça ilustrada.');
    if(atlas){
     paragraph('Aplicação no atlas: '+atlas.materialCategory+'. '+atlas.caveat);
     const src=sourceLink('Fonte da aplicação ilustrada',atlas.referenceURL);if(src)section.append(src);
    }
    const appearance=S.microstructureAppearance?.get?.(elementId);
    if(appearance){
     paragraph('Cores e relevo: '+appearance.label+'. '+appearance.warning+' Os tons não indicam fração de fase, orientação ou porcentagens dos grãos.');
     const src=sourceLink('Referência da aparência ilustrativa',appearance.source);
     if(src)section.append(src);
    }
    const image=S.metalAtlas?.micro?.(elementId);
    if(image?.path){
     const figure=N('figure');figure.className='silm-manual-micro-figure';
     const img=N('img');img.src=image.path;img.alt='Ilustração esquemática de grãos de '+metal.name+' sem escala física';img.loading='eager';img.decoding='async';
     figure.append(img,N('figcaption',image.caveat));
     section.append(N('h3','Imagem esquemática do atlas'),figure);
    }
    const refElement=S.data?.get?.(elementId);
    const crystal=refElement&&S.data?.structure?.(refElement);
    if(crystal){
     paragraph('Rede de referência: '+(crystal.type||'não registrada')+(crystal.spaceGroupNumber?' · grupo espacial '+crystal.spaceGroupNumber:'')+'. A liga ou produto pode ter outras condições e fases.');
     const crystalSource=crystal.sourceId?S.data?.source?.(crystal.sourceId):null;
     const src=sourceLink('Fonte cristalográfica',crystalSource?.url);if(src)section.append(src);
    }
    const studies=S.microstructureStudies?.forElement?.(elementId)||[];
    if(studies.length){
     const list=N('ul');section.append(N('h3','Estudos relacionados ('+studies.length+')'));
     paragraph('Estes estudos são contexto bibliográfico; não homologam o desenho nem definem seus grãos.');
     for(const study of studies){
      const li=N('li');li.append(N('strong',study.name+' — '));
      li.append(document.createTextNode(S.microstructureStudies.describe(study)+'. '+study.caveat+' '+S.microstructureStudies.caveat(study)));
      if(study.review?.includes('not-independently-verified'))li.append(document.createTextNode(' Documento original ainda não conferido de forma independente.'));
      const src=sourceLink('Consultar estudo',study.url);if(src)li.append(document.createTextNode(' '),src);
      list.append(li);
     }
     section.append(list);
    }
    article.append(section);
   }
  };
 let manualKey='';
 let manualDraft='';
 let manualPrintCleanup=null;
 window.addEventListener('si-route-changed',event=>{if(event.detail!=='manual')manualKey='';});
 /* Organização do Manual espelhada no SIAB: 13 categorias, quatro grupos,
    índice hierárquico, guia rápido e artigo; os 28 tópicos científicos permanecem intactos. */
 const SIAB_MANUAL_CATEGORIES=[
  {id:'comecar',title:'Comece por aqui',summary:'Conheça o simulador, a navegação e o uso offline.',group:'Orientação',icon:'home',topics:['sobre-silm','navegacao','offline']},
  {id:'bancada',title:'Oficina dos Metais',summary:'Prepare o metal, a montagem e as escalas de observação.',group:'Investigue',icon:'lab',topics:['interface','selecionar-metal','montagem','estruturas-cristalinas','travessia-escalas','aplicacoes-metalicas','graos-microestrutura','reiniciar']},
  {id:'explorar',title:'Explorar',summary:'Observe elétrons, estruturas e propriedades em diferentes vistas.',group:'Investigue',icon:'eye',topics:['explorar','eletrons-deslocalizados','propriedades-metalicas','vista','vista-3d']},
  {id:'medir',title:'Medir',summary:'Use ferramentas e registre evidências do modelo.',group:'Investigue',icon:'ruler',topics:['medir']},
  {id:'calcular',title:'Calcular',summary:'Relacione parâmetros e dados cristalográficos.',group:'Investigue',icon:'chart',topics:['calcular']},
  {id:'instrumentos',title:'Instrumentos',summary:'Conheça as técnicas e os limites das medições.',group:'Investigue',icon:'meter',topics:['instrumentos']},
  {id:'montagens',title:'Montagens prontas',summary:'Comece por configurações de referência.',group:'Prepare e registre',icon:'mount',topics:['montagens-prontas']},
  {id:'roteiros',title:'Roteiros Experimentais',summary:'Siga investigações com objetivos e orientações.',group:'Prepare e registre',icon:'protocol',topics:['atividades']},
  {id:'relatorios',title:'Relatórios',summary:'Organize resultados, interpretação e conclusão.',group:'Prepare e registre',icon:'report',topics:['relatorio']},
  {id:'caderno',title:'Caderno',summary:'Guarde hipóteses, registros e descobertas.',group:'Prepare e registre',icon:'notebook',topics:['caderno']},
  {id:'acessibilidade',title:'Acessibilidade',summary:'Ajuste leitura, contraste, cores e movimento.',group:'Orientação',icon:'accessibility',topics:['preferencias','abertura']},
  {id:'problemas',title:'Ajuda e solução de problemas',summary:'Encontre orientações e ajuda contextual.',group:'Orientação',icon:'help',topics:['problemas','manual','tour']},
  {id:'professor',title:'Área do Professor',summary:'Prepare atividades e apresentações para a turma.',group:'Para ensinar',icon:'professor',topics:['professor']}
 ];
 const SIAB_MANUAL_GROUPS=['Investigue','Prepare e registre','Orientação','Para ensinar'];

 /* Ícones vetoriais semânticos do Manual reproduzem a biblioteca do SIAB. */
 const SILM_MANUAL_ICON_PATHS={"home":"M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9","lab":"M4 4h8M5 4v14a3 3 0 0 0 6 0V4M5 13h6M18 5c1 2 3 4 3 6a3 3 0 0 1-6 0c0-2 2-4 3-6Z","eye":"M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0","ruler":"M4 17 17 4l3 3L7 20H4ZM8 13l2 2M11 10l2 2M14 7l2 2","chart":"M4 3v17h17M7 16l4-5 4 2 5-8","meter":"M3 4h12v15H3ZM6 7h6v5H6ZM15 7h3a3 3 0 0 1 3 3v4M19 14h3v7h-3ZM6 15h2M11 15h1","mount":"M2 18h20M4 18v3M20 18v3M5 3h6M6 3v10a2 2 0 0 0 4 0V3M6 10h4M16 6v4l-3 5h8l-3-5V6M15 6h4","protocol":"M8 5H5v16h14V5h-3M8 3h8v4H8ZM8 11l1 1 2-2M13 11h3M8 16h8","report":"M5 3h10l4 4v14H5ZM15 3v5h4M8 12h8M8 16h8","notebook":"M6 3h14v18H6ZM3 7h5M3 12h5M3 17h5M11 7h5M11 11h5M11 15h3","accessibility":"M14 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0M4 8l8 2 8-2M12 10v5M7 22l5-7 5 7","help":"M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M9 8a3 3 0 1 1 4 3c-1 1-1 1-1 3M12 17h.01","professor":"M8 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0M2 20v-5a3 3 0 0 1 6 0v5M13 6h8v15h-9V6h1M14 3h5v5h-5ZM15 12h3M15 16h3","manual":"M12 5C8 3 4 3 2 4v16c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-6-1-10 1ZM12 5v16M16 6v7l2-2 2 2V6","arrow":"M4 9v6M4 12h15M13.5 6.5 19 12l-5.5 5.5","back":"M20 9v6M20 12H5M10.5 6.5 5 12l5.5 5.5","tour":"M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M16 8l-3 5-5 3 3-5Z","history":"M4 8a9 9 0 1 1-1 7M3 3v6h6M12 7v6l4 2","table":"M4 4h16v16H4ZM4 9h16M4 14h16M10 4v16","learn":"M8 16c0-3-3-4-3-8a7 7 0 0 1 14 0c0 4-3 5-3 8ZM8 19h8M10 22h4M9 8l3 3 3-3M12 11v5","projector":"M3 4h18v13H3ZM8 22l4-5 4 5M12 17v5","prepare":"M4 3h7M5 3v5l-3 7a3 3 0 0 0 3 4h5a3 3 0 0 0 3-4l-3-7V3M4 13h7M19 9c-1 2-3 4-3 6a3 3 0 0 0 6 0c0-2-2-4-3-6Z","dropdown":"M6 9.5 12 15.5l6-6M12 4v5"};
 const manualIcon=(name,extraClass='')=>{
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','silm-manual-svg'+(extraClass?' '+extraClass:''));svg.setAttribute('data-icon',name);svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',SILM_MANUAL_ICON_PATHS[name]||SILM_MANUAL_ICON_PATHS.help);svg.append(p);return svg;
 };
 const SIAB_MANUAL_QUICK=[['selecionar-metal','Como escolher um metal'],['medir','Como medir'],['problemas','Por que uma opção não aparece']];
 const manualCategory=id=>SIAB_MANUAL_CATEGORIES.find(c=>c.topics.includes(id));
 const manualNormalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/gi,' ').trim();
 const manualTokens=value=>manualNormalize(value).split(/\s+/).filter(t=>t&&!['a','o','as','os','de','do','da','dos','das','e','um','uma','no','na','como','para','com'].includes(t)).map(t=>t.length>4?t.replace(/oes$/,'ao').replace(/ais$/,'al').replace(/s$/,''):t);
 function manual(){
  const host=$('silm-manual');if(!host)return;
  const params=new URLSearchParams(location.hash.split('?')[1]||'');
  const id=params.get('topico'),cid=params.get('categoria'),query=(params.get('busca')||'').slice(0,120).trim(),referenceId=params.get('referencia');
  const topics=S.manual.topics,find=x=>topics.find(t=>t.id===x)||topics.find(t=>t.id===S.manual.aliases?.[x]),topic=id?find(id):null;
  const cat=SIAB_MANUAL_CATEGORIES.find(c=>c.id===cid),active=topic?manualCategory(topic.id):cat;
  const key=(id||'')+'|'+(cid||'')+'|'+query+'|'+(referenceId||'');
  if(key===manualKey&&host.childElementCount)return;
  if(host.dataset.manualRouteKey!==key)manualDraft=query;
  const previous=manualKey;manualKey=key;host.dataset.manualRouteKey=key;host.replaceChildren();
  const topicHref=x=>'#/manual?topico='+encodeURIComponent(x),catHref=x=>'#/manual?categoria='+encodeURIComponent(x);
  const nav=(text,to,cls)=>{const a=N('a',text);a.href=to;if(cls)a.className=cls;return a;};
  const makeTitle=text=>{const h=N('h1',text);h.id='manual-title';h.tabIndex=-1;return h;};
  const topicLink=t=>{const a=nav('',topicHref(t.id),'silm-manual-topic-link'),category=manualCategory(t.id);const symbol=N('span');symbol.className='silm-manual-symbol';symbol.append(manualIcon(category?.icon||'help'));const body=N('span');body.append(N('strong',t.title),N('span',operation(t.summary)));a.append(symbol,body,manualIcon('arrow','silm-manual-topic-arrow'));return a;};
  const bar=N('div');bar.className='silm-manual-bar';
  const homeLink=nav('Manual','#/manual','silm-manual-home-link');
  const form=N('form');form.className='silm-manual-search';form.role='search';form.setAttribute('aria-label','Busca no Manual');
  const label=N('label','Buscar no Manual');label.htmlFor='manual-search';
  const input=N('input');input.type='search';input.maxLength=120;input.autocomplete='off';input.id='manual-search';input.placeholder='Metal, estrutura, medir, Caderno…';input.value=query||manualDraft;input.setAttribute('aria-describedby','manual-status');
  const clear=N('button','×');clear.type='button';clear.className='silm-manual-clear button outline';clear.id='manual-clear';clear.setAttribute('aria-label','Limpar busca');clear.hidden=!query;
  const go=N('button','Buscar');go.type='submit';go.className='button outline';
  const row=N('div');row.className='silm-manual-search-row';row.append(input,clear,go);form.append(label,row);
  const back=nav('Voltar à oficina','#/ambiente','button outline');back.id='manual-workspace';
  bar.append(homeLink,form,back);
  const tools=N('div');tools.className='silm-manual-tools';
  const toggle=N('button','Índice do Manual');toggle.type='button';toggle.className='button outline silm-manual-index-toggle';toggle.id='manual-index-toggle';toggle.setAttribute('aria-controls','manual-indice');toggle.setAttribute('aria-expanded','false');
  const print=N('button','Imprimir guia rápido');print.type='button';print.className='button outline';print.id='manual-print';
  tools.append(toggle,print);
  const status=N('p');status.id='manual-status';status.className='silm-manual-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
  const shell=N('div');shell.className='silm-manual-shell';
  const index=N('nav');index.id='manual-indice';index.className='silm-manual-index';index.setAttribute('aria-label','Índice do Manual');
  const content=N('div');content.id='manual-conteudo';content.className='silm-manual-content';shell.append(index,content);host.append(bar,tools,status,shell);
  function setIndex(open,focus=false){const state=Boolean(open);host.classList.toggle('silm-manual-index-open',state);toggle.setAttribute('aria-expanded',String(state));toggle.textContent=state?'Fechar índice':'Índice do Manual';if(focus)toggle.focus();}
  function buildIndex(category,selected){
   const home=nav('','#/manual','silm-manual-index-home');home.append(manualIcon('manual'),N('span','Início do Manual'));index.replaceChildren(home);
   const root=N('ul');for(const c of SIAB_MANUAL_CATEGORIES){
    const li=N('li'),a=nav('',catHref(c.id));a.append(manualIcon(c.icon),N('span',c.title));
    if(category===c.id&&!selected)a.setAttribute('aria-current','page');li.append(a);
    if(category===c.id){const inner=N('ul');for(const id of c.topics){const t=find(id);if(!t)continue;const row=N('li'),item=nav(t.title,topicHref(t.id));if(selected===t.id)item.setAttribute('aria-current','page');row.append(item);inner.append(row);}li.append(inner);}
    root.append(li);
   }index.append(root);
  }
  function crumbs(category,t){
   const trail=N('nav');trail.className='silm-manual-breadcrumb';trail.setAttribute('aria-label','Caminho do Manual');
   trail.append(nav('Manual','#/manual'),N('span','/'));
   if(t){trail.append(nav(category?.title||'Investigue',catHref(category?.id||'bancada')),N('span','/'));}
   const current=N('span',t?t.title:category?.title||'Manual');current.setAttribute('aria-current','page');trail.append(current);trail.querySelectorAll('span').forEach(s=>{if(s.textContent==='/')s.setAttribute('aria-hidden','true');});return trail;
  }
  function appendExplanation(article,text){
   const paragraphs=String(text||'').split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);
   if(!paragraphs.length)return;
   const section=N('section');section.className='silm-manual-explanation';section.append(N('h2','Entenda'));
   for(const paragraph of paragraphs)section.append(N('p',operation(paragraph)));
   article.append(section);
  }
  function renderArticle(t){
   const category=manualCategory(t.id),article=N('article');article.className='silm-reading silm-manual-article';article.dataset.manualTopic=t.id;
   const eyebrow=N('p',category?.title||'Manual');eyebrow.className='eyebrow';const lead=N('p',operation(t.summary));lead.className='silm-lead';const heading=N('header');heading.className='silm-manual-article-head';heading.append(eyebrow,makeTitle(t.title),lead);article.append(heading);
   const purpose=N('section');purpose.className='silm-manual-purpose';purpose.append(N('h2','Para que serve'),N('p',operation(t.purpose||t.summary||t.content)));article.append(purpose);
   if(t.content&&t.content!==t.purpose)appendExplanation(article,t.content);
   renderReferenceContext(article,t.id,referenceId);
   if(t.steps?.length){const how=N('section');how.className='silm-manual-how';const steps=N('ol');steps.className='silm-manual-steps';for(const s of t.steps)steps.append(N('li',operation(s)));how.append(N('h2','Como usar'),steps);article.append(how);}
   if(t.example){const example=N('aside');example.className='silm-manual-example';example.setAttribute('aria-label','Exemplo');example.append(N('strong','Exemplo'),N('p',operation(t.example)));article.append(example);}
   if(t.details?.length){const section=N('section');section.className='silm-manual-details';section.append(N('h2','Detalhes importantes'));for(const d of t.details){const details=N('details');details.className='silm-manual-accordion';const summary=N('summary');summary.append(N('span',d.title),manualIcon('dropdown','silm-manual-disclosure'));details.append(summary,N('p',operation(d.text)));section.append(details);}article.append(section);}
   const related=(t.related||[]).map(find).filter(Boolean);if(related.length){const sub=N('nav');sub.className='silm-manual-related';sub.setAttribute('aria-label','Veja também');sub.append(N('h2','Veja também'));const links=N('div');for(const r of related)links.append(nav(r.title+' →',topicHref(r.id)));sub.append(links);article.append(sub);}
   if(t.references?.length){const refs=N('section');refs.append(N('h2','Fontes'));const list=N('ul');for(const r of t.references){const row=N('li');if(r.url&&/^https:\/\//i.test(r.url)){const a=nav(r.label,r.url);a.target='_blank';a.rel='noopener noreferrer';row.append(a);}else row.textContent=r.label;list.append(row);}refs.append(list);article.append(refs);}
   const back=nav('',category?catHref(category.id):'#/manual','silm-manual-back');back.append(manualIcon('back'),N('span','Voltar a '+(category?.title||'Manual')));article.append(back);
   content.append(crumbs(category,t),article);
  }
  function renderCategory(category){
   const guide=S.manual.categoryGuides?.[category.id];
   const article=N('article');article.className='silm-reading silm-manual-category-page';article.dataset.manualCategory=category.id;
   const head=N('header');head.className='silm-manual-article-head';
   const eyebrow=N('p',category.group.toUpperCase());eyebrow.className='eyebrow';
   const lead=N('p',category.summary);lead.className='silm-lead';
   head.append(eyebrow,makeTitle(category.title),lead);article.append(head);
   const first=find(category.topics[0]);
   const purposeText=guide?.purpose||first?.purpose||category.summary;
   const explanationText=guide?.content||first?.content||category.summary;
   const purpose=N('section');purpose.className='silm-manual-purpose';
   purpose.append(N('h2','Para que serve'),N('p',operation(purposeText)));article.append(purpose);
   appendExplanation(article,explanationText);
   const steps=guide?.steps?.length?guide.steps:(first?.steps||[]);
   if(steps.length){
    const how=N('section');how.className='silm-manual-how';
    const ol=N('ol');ol.className='silm-manual-steps';
    for(const step of steps)ol.append(N('li',operation(step)));
    how.append(N('h2','Como usar'),ol);article.append(how);
   }
   if(guide?.details?.length){
    const section=N('section');section.className='silm-manual-details';
    section.append(N('h2','Detalhes importantes'));
    for(const d of guide.details){
     const details=N('details');details.className='silm-manual-accordion';
     const summary=N('summary');summary.append(N('span',d.title),manualIcon('dropdown','silm-manual-disclosure'));
     details.append(summary,N('p',operation(d.text)));section.append(details);
    }
    article.append(section);
   }
   const more=N('section');more.className='silm-manual-more';more.append(N('h2','Nesta categoria'));
   const list=N('div');list.className='silm-manual-topic-list';
   for(const id of category.topics){const t=find(id);if(t)list.append(topicLink(t));}
   more.append(list);article.append(more);
   const back=nav('','#/manual','silm-manual-back');back.append(manualIcon('back'),N('span','Voltar ao início do Manual'));article.append(back);
   content.append(crumbs(category),article);
  }
  function renderHome(){
   const hero=N('header');hero.className='silm-manual-hero silm-manual-hero-parity';
   const left=N('div'),eyebrow=N('p','MANUAL DO USUÁRIO');eyebrow.className='eyebrow';
   const title=makeTitle('Encontre seu próximo passo.');
   const description=N('p','Uma dúvida na Oficina? Consulte uma ferramenta, entenda um resultado ou descubra por onde começar.');
   const actions=N('div');actions.className='silm-actions';const start=nav('Começar a usar',topicHref('interface'),'button primary');start.append(manualIcon('arrow'));start.id='manual-start';const tour=N('button','Iniciar tour da oficina');tour.type='button';tour.id='manual-tour';tour.className='button outline';tour.dataset.tourStart='';actions.append(start,tour);left.append(eyebrow,title,description,actions);
   const figure=N('figure');figure.className='silm-manual-workspace-map';const mapActions=N('div');mapActions.className='silm-manual-map-actions';mapActions.append(nav('Montagem',topicHref('montagem')),nav('Ver',topicHref('explorar')),nav('Dados',topicHref('medir')));
   const scene=N('div');scene.className='silm-manual-map-scene';
   const lattice=document.createElementNS('http://www.w3.org/2000/svg','svg');const svgNS='http://www.w3.org/2000/svg';
   lattice.setAttribute('viewBox','0 0 180 160');lattice.setAttribute('role','img');lattice.setAttribute('aria-label','Esquema didático de rede metálica com centros regularmente organizados');lattice.classList.add('silm-manual-lattice');
   const nodes=[[30,28],[90,28],[150,28],[30,80],[90,80],[150,80],[30,132],[90,132],[150,132]];
   const bonds=document.createElementNS(svgNS,'g');bonds.setAttribute('class','silm-manual-lattice-bonds');
   for(const [i,j] of [[0,1],[1,2],[3,4],[4,5],[6,7],[7,8],[0,3],[3,6],[1,4],[4,7],[2,5],[5,8]]){const line=document.createElementNS(svgNS,'line');line.setAttribute('x1',nodes[i][0]);line.setAttribute('y1',nodes[i][1]);line.setAttribute('x2',nodes[j][0]);line.setAttribute('y2',nodes[j][1]);bonds.append(line);}lattice.append(bonds);
   nodes.forEach(([cx,cy],i)=>{const circle=document.createElementNS(svgNS,'circle');circle.setAttribute('cx',cx);circle.setAttribute('cy',cy);circle.setAttribute('r',i===4?'15':'12');circle.setAttribute('class',i===4?'silm-manual-lattice-center':'silm-manual-lattice-node');lattice.append(circle);});
   const caption=N('div');caption.className='silm-manual-map-description';caption.append(N('strong','Estrutura metálica em foco'),N('span','Explorar · Medir · Calcular'));scene.append(lattice,caption);
   figure.append(mapActions,scene,N('figcaption','Abra uma ferramenta para investigar. Feche o painel para voltar à estrutura.'));
   hero.append(left,figure);
   const quick=N('nav');quick.className='silm-manual-quick';quick.setAttribute('aria-label','Consultas rápidas');const q=N('p','QUERO SABER');q.className='eyebrow';quick.append(q);for(const [x,label] of SIAB_MANUAL_QUICK)if(find(x)){const a=nav(label,topicHref(x));a.append(manualIcon('arrow'));quick.append(a);}
   content.append(hero,quick);
   for(const group of SIAB_MANUAL_GROUPS){const categories=SIAB_MANUAL_CATEGORIES.filter(c=>c.group===group);const section=N('section');section.className='silm-manual-group';section.append(N('h2',group));const grid=N('div');grid.className='silm-manual-grid';
    for(const c of categories){const a=nav('',catHref(c.id),'silm-manual-card');const symbol=N('span');symbol.className='silm-manual-symbol';symbol.append(manualIcon(c.icon));const title=N('h3',c.title),description=N('p',c.summary),action=N('span','Consultar');action.className='silm-manual-card-action';action.append(manualIcon('arrow'));a.append(symbol,title,description,action);grid.append(a);}section.append(grid);content.append(section);}
  }
  function renderBase(){
   content.replaceChildren();status.textContent='';setIndex(false);
   const view=id?(topic?'topic':'missing'):cid?(cat?'category':'missing'):'home';
   host.dataset.manualView=view;buildIndex(active?.id,topic?.id);
   if(view==='topic')renderArticle(topic);
   else if(view==='category')renderCategory(cat);
   else if(view==='home')renderHome();
   else{const h=makeTitle('Tópico não encontrado');content.append(h,N('p','Este endereço não corresponde a um tópico do Manual.'),nav('Voltar ao índice','#/manual','button outline'));}
   print.textContent=view==='topic'?'Imprimir tópico':'Imprimir guia rápido';
  }
  function search(term){
   const normalized=manualTokens(term);if(!normalized.length)return[];
   return topics.map((t,i)=>{const values=[t.title,t.summary,t.purpose,t.content,...(t.steps||[]),...(t.keywords||[]),...(t.details||[]).map(d=>d.title+' '+d.text)].join(' ');const words=manualTokens(values),name=manualNormalize(t.title),keys=manualNormalize((t.keywords||[]).join(' '));let score=normalized.every(s=>words.some(w=>w===s||(s.length>2&&w.startsWith(s))))?1:0;if(score){const q=manualNormalize(term);score+=(name===q?100:0)+(name.includes(q)?30:0)+(keys.includes(q)?20:0)+normalized.reduce((n,s)=>n+(manualTokens(t.title).some(w=>w.startsWith(s))?5:0),0);}return {t,i,score};}).filter(x=>x.score).sort((a,b)=>b.score-a.score||a.i-b.i).map(x=>x.t);
  }
  function renderSearch(term){
   clear.hidden=!term.trim();if(!term.trim()){renderBase();return;}
   host.dataset.manualView='search';setIndex(false);content.replaceChildren();const items=search(term);
   status.textContent=items.length+' '+(items.length===1?'tópico encontrado':'tópicos encontrados')+'.';
   const sec=N('section');sec.className='silm-manual-results';const eye=N('p','BUSCA NO MANUAL');eye.className='eyebrow';
   sec.append(eye,makeTitle(items.length?'Resultados para “'+term+'”':'Nenhum tópico encontrado'),N('p',items.length?'Escolha um tópico para abrir a explicação.':'Tente outra palavra, como metal, estrutura, medir ou relatório.'));
   if(items.length){const ul=N('ul');ul.className='silm-manual-search-list';for(const t of items){const li=N('li'),a=nav('',topicHref(t.id)),label=N('span',manualCategory(t.id)?.title||'Manual');label.className='eyebrow';a.append(label,N('h2',t.title),N('p',operation(t.summary)),manualIcon('arrow'));li.append(a);ul.append(li);}sec.append(ul);}
   const back=nav('','#/manual','silm-manual-back');back.append(manualIcon('back'),N('span','Voltar ao índice'));sec.append(back);content.append(sec);print.textContent='Imprimir guia rápido';
  }
  function preparePrint(){
   if(!host.isConnected||host.closest('[data-view="manual"]')?.hidden)return;
   host.querySelector('#silm-manual-print-sheet')?.remove();
   const sheet=N('article');sheet.className='silm-manual-print-sheet';sheet.id='silm-manual-print-sheet';
   if(host.dataset.manualView==='topic'&&topic){
    const article=content.querySelector('.silm-manual-article')?.cloneNode(true);
    if(article){article.querySelectorAll('.silm-manual-related,.silm-manual-back').forEach(x=>x.remove());article.querySelectorAll('details').forEach(x=>x.open=true);sheet.append(article);}
   }else{
    sheet.append(N('p','SILM · Manual do Usuário'),N('h1','Guia rápido de consulta'),N('p','Escolha uma categoria pela sua dúvida. O Manual digital inclui explicações e referências completas.'));
    for(const c of SIAB_MANUAL_CATEGORIES){const section=N('section');section.className='silm-manual-print-category';section.append(N('h2',c.title),N('p',c.summary));const ol=N('ol');c.topics.map(find).filter(Boolean).slice(0,3).forEach(t=>ol.append(N('li',t.title+': '+operation(t.steps?.[0]||t.summary))));section.append(ol);sheet.append(section);}
   }host.append(sheet);document.body.classList.add('silm-print-manual');
   const done=()=>{document.body.classList.remove('silm-print-manual');sheet.remove();window.removeEventListener('afterprint',done);};manualPrintCleanup=done;window.addEventListener('afterprint',done);
  }
  renderBase();if(query||manualDraft)renderSearch(query||manualDraft);else clear.hidden=true;
  input.addEventListener('input',()=>{manualDraft=input.value;renderSearch(input.value);});
  form.addEventListener('submit',event=>{event.preventDefault();const q=input.value.trim();const to=q?'#/manual?busca='+encodeURIComponent(q):'#/manual';if(location.hash!==to)location.hash=to;else{renderSearch(q);$('manual-title')?.focus();}});
  clear.addEventListener('click',()=>{manualDraft='';input.value='';if(location.hash.includes('?busca='))location.hash='#/manual';renderBase();input.focus();});
  toggle.addEventListener('click',()=>setIndex(toggle.getAttribute('aria-expanded')!=='true'));
  host.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){event.preventDefault();setIndex(false,true);}}, {signal:(()=>{if(!host.manualAbort)host.manualAbort=new AbortController();else{host.manualAbort.abort();host.manualAbort=new AbortController();}return host.manualAbort.signal;})()});
  print.addEventListener('click',()=>{manualPrintCleanup?.();preparePrint();try{window.print();}catch(error){manualPrintCleanup?.();say('Impressão indisponível neste navegador.','warning');}});
  if(previous&&previous!==key)requestAnimationFrame(()=>{$('manual-title')?.focus({preventScroll:true});window.scrollTo(0,0);});
 }
  function notebook(){
  const host=$('silm-notebook');if(!host)return;host.replaceChildren();
  const typeNames={observacao:'Anotação',hipotese:'Hipótese',conclusao:'Conclusão'};
  const intro=N('p','Os registros ficam neste navegador. Exporte um backup para transferi-los entre dispositivos.');intro.className='silm-notebook-intro';
  const composer=N('details');composer.className='silm-notebook-compose';composer.open=false;
  composer.append(N('summary','Nova anotação / hipótese / descoberta'));
  const editor=N('section');editor.className='silm-notebook-editor';
  const kind=N('select');kind.id='notebook-kind';
  for(const [value,label] of Object.entries(typeNames)){const option=N('option',label);option.value=value;kind.append(option);}
  const kindLabel=N('label','Tipo de registro');kindLabel.append(kind);
  const titleInput=N('input');titleInput.id='notebook-title';titleInput.maxLength=120;titleInput.required=true;titleInput.placeholder='Ex.: O cobre conduz eletricidade';
  const titleLabel=N('label','Título');titleLabel.append(titleInput);
  const input=N('textarea');input.id='notebook-text';input.maxLength=1000;input.rows=4;input.required=true;input.placeholder='Registre o que observou, a hipótese ou a conclusão a que chegou.';
  const bodyLabel=N('label','Anotação (até 1.000 caracteres)');bodyLabel.append(input);
  const add=N('button','Registrar no Caderno');add.type='button';add.id='notebook-add';add.className='button primary';
  add.addEventListener('click',()=>{
   const title=titleInput.value.trim(),body=input.value.trim();
   if(!title){say('Dê um título ao registro antes de salvar.','warning');titleInput.focus();return;}
   if(!body){say('Escreva a anotação antes de salvar.','warning');input.focus();return;}
   const snapshot=model.state.investigation?model.snapshot():null;
   const fullBody='Título: '+title+'\n\n'+body;
   if(journal.addNote({kind:kind.value,body:fullBody},notebookScene(snapshot||{}))){titleInput.value='';input.value='';composer.open=false;home();renderEntries();say('Registro salvo no Caderno.','success');}
   else say('Não foi possível salvar. O Caderno aceita até 80 registros de 1.200 caracteres.','warning');
  });
  editor.append(kindLabel,titleLabel,bodyLabel,add);composer.append(editor);
  const actions=N('div');actions.className='silm-notebook-actions';
  // Como no SIAB: CSV, Imprimir e Apagar logo abaixo do cabeçalho; o backup JSON (extensão do SILM) fica num grupo próprio.
  const backup=N('section');backup.className='silm-notebook-backup';backup.setAttribute('aria-label','Backup do Caderno');const backupActions=N('div');backupActions.className='silm-notebook-backup-actions';
  const makeAction=(id,label,fn,box=actions)=>{const b=N('button',label);b.type='button';b.id=id;b.className='button outline';b.addEventListener('click',fn);box.append(b);return b;};
  const download=(name,content,type)=>{const url=URL.createObjectURL(new Blob([content],{type}));const a=N('a');a.href=url;a.download=name;a.hidden=true;host.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  makeAction('notebook-export-json','Exportar backup JSON',()=>download('SILM-caderno.json',exportNotebook(),'application/json;charset=utf-8'),backupActions);
  makeAction('notebook-export-csv','Baixar caderno (CSV)',()=>{if(typeof B.journalCSV!=='function'){say('Exportação CSV indisponível nesta base.','warning');return;}download('SILM-caderno.csv','\uFEFF'+B.journalCSV(journal.snapshot().notes),'text/csv;charset=utf-8');});
  makeAction('notebook-print','Imprimir',()=>{
   const sheet=N('article');sheet.className='silm-notebook-print';sheet.append(N('h1','Caderno de laboratório — SILM'),N('p','Emissão: '+new Date().toLocaleString('pt-BR')));
   const notes=journal.snapshot().notes;
   for(const note of notes){const display=notebookPresentation(note),card=N('section');card.className='silm-notebook-print-entry';card.append(N('p',display.category+' · '+new Date(note.createdAt).toLocaleString('pt-BR')),N('h2',display.title),N('p',display.body));if(note.entityLabel)card.append(N('p','Metal associado: '+note.entityLabel));sheet.append(card);}
   if(!notes.length)sheet.append(N('p','Nenhum registro disponível.'));
   host.append(sheet);document.body.classList.add('silm-print-notebook');
   const cleanup=()=>{document.body.classList.remove('silm-print-notebook');sheet.remove();window.removeEventListener('afterprint',cleanup);};
   window.addEventListener('afterprint',cleanup);
   try{window.print();}catch{cleanup();say('A impressão não está disponível neste navegador.','warning');}
  });
  const importInput=N('input');importInput.id='notebook-import';importInput.type='file';importInput.accept='.json,application/json';importInput.hidden=true;importInput.className='silm-notebook-file';
  makeAction('notebook-import-trigger','Importar backup JSON',()=>importInput.click(),backupActions);
  const filter=N('select');filter.id='notebook-filter';
  for(const [value,label] of [['todos','Todos os registros'],['observacao','Anotações'],['hipotese','Hipóteses'],['conclusao','Conclusões'],['atividade','Missões e roteiros concluídos'],['relatorio','Relatórios associados']]){const option=N('option',label);option.value=value;filter.append(option);}
  filter.value=['todos','observacao','hipotese','conclusao','atividade','relatorio'].includes(notebookFilter)?notebookFilter:'todos';notebookFilter=filter.value;
  const filterLabel=N('label','Filtrar registros');filterLabel.className='silm-notebook-filter';filterLabel.append(filter);
  const entries=N('div');entries.className='silm-notebook-entries';
  function matchesFilter(note){
   const id=note.attemptId||'';
   if(notebookFilter==='todos')return true;
   if(notebookFilter==='atividade')return id.startsWith('attempt-silm-complete-');
   if(notebookFilter==='relatorio')return id.startsWith('attempt-silm-report-');
   if(notebookFilter==='observacao')return note.kind==='observacao'&&!id.startsWith('attempt-silm-report-');
   return note.kind===notebookFilter;
  }
  function renderEntries(){
   entries.replaceChildren();const notes=journal.snapshot().notes,visible=notes.filter(matchesFilter);
   if(!visible.length){const empty=N('p',notes.length?'Nenhum registro corresponde a este filtro.':'Nenhum registro neste Caderno. Escreva uma anotação ou faça uma investigação no laboratório.');empty.className='silm-notebook-empty';entries.append(empty);return;}
   for(const note of visible){
    const display=notebookPresentation(note),card=N('article');card.className='silm-notebook-entry';
    const header=N('header');header.className='silm-notebook-entry-head';
    const eyebrow=N('p',display.category.toLocaleUpperCase('pt-BR')+' · '+new Date(note.createdAt).toLocaleString('pt-BR'));eyebrow.className='silm-notebook-eyebrow';header.append(eyebrow,N('h2',display.title));card.append(header);
    if(note.entityLabel)card.append(N('p','Metal associado: '+note.entityLabel));
    const body=N('p',display.body);body.className='silm-notebook-entry-body';card.append(body);
    const related=notebookRelatedAction(note);if(related){const a=link(related.label,related.href);a.classList.add('silm-notebook-open');card.append(a);}
    const remove=N('button','Apagar registro');remove.type='button';remove.className='button outline';remove.addEventListener('click',async()=>{
     if(!await B.confirmDialog({title:'Apagar registro?',description:'“'+display.title+'” será removido do Caderno. Esta ação não pode ser desfeita.',confirmText:'Apagar registro',cancelText:'Cancelar',destructive:true}))return;
     if(journal.removeNote(note.id)){home();renderEntries();say('Registro removido do Caderno.','success');}else say('Não foi possível remover o registro.','warning');
    });card.append(remove);entries.append(card);
   }
  }
  notebookRefresh=renderEntries;
  filter.addEventListener('change',()=>{notebookFilter=filter.value;renderEntries();});
  importInput.addEventListener('change',event=>{const file=event.currentTarget.files&&event.currentTarget.files[0];if(!file)return;void(async()=>{
   try{
    if(session.open()){say('Encerre a atividade orientada antes de restaurar um backup.','warning');return;}
    if(file.size>5000000)throw new Error('O arquivo excede o limite de 5 MB.');
    const decoded=decodeNotebook(await file.text());
    if(!await B.confirmDialog({title:'Restaurar o Caderno?',description:'O backup substituirá os registros e relatórios do Caderno neste navegador.',confirmText:'Restaurar',cancelText:'Cancelar'}))return;
    if(session.open()){say('A atividade foi iniciada durante a confirmação. O backup não foi importado.','warning');return;}
    if(restoreNotebook(decoded)){notebookFilter='todos';filter.value='todos';home();renderEntries();say('Backup restaurado com validação.','success');}
    else say('Não foi possível restaurar o backup. Os dados atuais foram preservados.','warning');
   }catch(error){say(error.message||'Falha na importação do Caderno.','error');}
   finally{importInput.value='';}
  })();});
  async function clearNotes(){
   if(session.open()){say('Encerre a atividade orientada antes de apagar registros.','warning');return;}
   if(!journal.snapshot().notes.length){say('O Caderno já está vazio.','info');return;}
   if(!await B.confirmDialog({title:'Apagar Caderno?',description:'Exporte o Caderno para preservar uma cópia antes de apagar.',confirmText:'Apagar Caderno',cancelText:'Cancelar',destructive:true}))return;
   if(session.open()){say('A atividade foi iniciada durante a confirmação. Nada foi apagado.','warning');return;}
   if(journal.clearNotes()){notebookFilter='todos';filter.value='todos';home();renderEntries();say('Caderno apagado. Os relatórios arquivados foram preservados.','success');}
   else say('Não foi possível apagar o Caderno.','warning');
  }
  const clearButton=makeAction('notebook-clear','Apagar caderno',clearNotes);clearButton.classList.add('silm-destructive');
  if(session.open()){clearButton.disabled=true;clearButton.title='Encerre a atividade orientada antes de apagar registros.';backupActions.querySelector('#notebook-import-trigger').disabled=true;}
  backup.append(intro,backupActions);
  host.append(actions,filterLabel,composer,entries,backup,importInput);renderEntries();
 }
 /* Etapa 9 — Montagens prontas, no padrão do SIAB: objetivo, o que vai para a oficina, passos e recursos, com "Montar na
    oficina". Tudo o que é dado (metal, estrutura, condição, fonte, sítios da célula) vem do banco no momento de mostrar. */
 let presetsKey='';
 function readyAssemblies(){
  const host=$('silm-presets-list');if(!host)return;const locked=session.open(),items=S.readyAssemblies.list();
  const key=(locked?'atividade':'livre')+'|'+items.map(x=>x.id+':'+x.available).join(',');if(key===presetsKey&&host.childElementCount)return;presetsKey=key;host.replaceChildren();
  if(locked){const note=N('p','As montagens prontas preparam a oficina livre. Encerre a atividade em curso para usá-las.');note.className='silm-setup-locked';note.id='silm-presets-locked';note.setAttribute('role','note');host.append(note);}
  for(const x of items){
   const card=N('article');card.className='silm-setup-card';card.id='preset-'+x.id;card.setAttribute('aria-labelledby','preset-title-'+x.id);
   const title=N('h2',x.title);title.id='preset-title-'+x.id;const eyebrow=N('p',({explorar:'Explorar',medir:'Medir',calcular:'Calcular'})[x.module]+' · Estrutura cristalina');eyebrow.className='eyebrow';
   card.append(title,N('p',x.objective),eyebrow);
   if(!x.available){const why=N('p',x.reason);why.className='silm-setup-reason';card.append(why);host.append(card);continue;}
   const fact=(label,text)=>{const p=N('p');p.append(N('strong',label+': '),document.createTextNode(text));return p;};
   card.append(fact('Na oficina',x.element.name+' ('+x.element.symbol+'), Z = '+x.element.atomicNumber+' · '+x.structureLabel+' · célula unitária completa com '+x.cellSites+' unidades'),
    fact('Condição de referência',x.temperature),fact('Fonte da estrutura',x.sourceTitle),N('h3','Investigue'));
   const steps=N('ol');for(const step of x.steps)steps.append(N('li',step));card.append(steps,fact('Recursos recomendados',x.resources.join(' · ')));
   const go=N('button','Montar na oficina');go.type='button';go.className='button primary';go.dataset.readyAssembly=x.id;go.disabled=locked;if(locked)go.setAttribute('aria-describedby','silm-presets-locked');
   go.addEventListener('click',()=>applyReadyAssembly(x.id));card.append(go);host.append(card);
  }
 }
 /* Aplicar: mesma confirmação de "Iniciar investigação" (substitui a investigação atual), depois montar e organizar segundo a
    estrutura de referência do banco. Em atividade, nada muda. */
 async function applyReadyAssembly(id){
  if(session.open()){say('As montagens prontas preparam a oficina livre. Encerre a atividade em curso para usá-las.','info');return false;}
  const x=S.readyAssemblies.list().find(y=>y.id===id);if(!x?.available){say(x?.reason||'Montagem não encontrada.','warning');return false;}
  if(!await selectMetal(x.atomicNumber))return false;
  if(!model.state.structure)model.beginAssembly();if(!model.state.structure.units.length&&!model.addUnit().ok)return false;
  const r=model.organize();if(!r.ok){say('Não foi possível organizar a estrutura de referência.','warning');return false;}
  location.hash='#/ambiente';say('Montagem pronta: '+x.title+'. Célula unitária completa com '+x.cellSites+' unidades.','success');return true;
 }
 function professor(){if(table)return;const scope=SimCore.createScope();table=S.createPeriodicTable($('silm-professor-table'),{scope,state:{selection:model.state.metal?.atomicNumber||29,query:''},teacher:true,canInvestigate:()=>!session.open(),onInvestigate:async e=>{if(await selectMetal(e.atomicNumber))location.hash='#/ambiente';},onSources:e=>{$('silm-professor-sources').textContent=S.data.sourceIds(e).map(id=>{const s=S.data.source(id);return s.institution+' — '+s.title;}).join('\n');}});}
 /* Roteiro montado na investigação atual (como "experiencia" na bancada do SIAB): só vale para a mesma investigação. */
 function experiment(){const x=storage.get('route.experiment',null),inv=model.state.investigation?.id;const r=x&&inv&&x.investigation===inv?S.routes.get(x.route):null;return r||null;}
 function freeReport(){if(!model.state.investigation)return null;const saved=storage.get('report.free:'+model.state.investigation.id,{}),report={...fields};for(const k of Object.keys(report))if(typeof saved[k]==='string')report[k]=saved[k].slice(0,10000);return {activityContext:{id:'laboratorio',type:'free'},checkpoint:model.snapshot(),evidence:{cell:false,lattice:false,deformation:false},report};}
 function editReport(key,value){if(!Object.hasOwn(fields,key)||value.length>10000)return false;const r=freeReport()?.report||{...fields};r[key]=value;return storage.set('report.free:'+model.state.investigation.id,r);}
 return {init,experiment,freeReport,editReport,recordActivity,recordReport,archivedReport,render(){home();const page=B.currentRoute(location.hash);if(page==='aprender')themes();if(page==='manual')manual();if(page==='caderno'&&!$('notebook-text'))notebook();if(page==='professor')professor();if(page==='montagens')readyAssemblies();},applyReadyAssembly};
};
