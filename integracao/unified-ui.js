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
  const structure=state.structure?.crystallography?.structureType||(state.structure?.mode==='crystalline'?'Estrutura cristalina':'Montagem livre');
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
  const structure=state.structure?.crystallography?.structureType||(state.structure?.mode==='crystalline'?'Estrutura cristalina':'Montagem livre');
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
   const list=N('div');list.className='silm-content-list';
   for(const item of S.themes.registry){const row=N('a');row.className='silm-content-row';row.href='#/aprender?tema='+item.id;row.id='theme-card-'+item.id;
    const text=N('span');text.append(N('strong',item.title),N('small',item.subtitle+'. '+item.description));
    const status=N('span',progress.completed[item.id]?'Revisado':'Não revisado');status.className='silm-row-status';row.append(text,status);list.append(row);}
   host.append(list);
   // Retorno do tema: o foco volta para a linha do tema aberto, como quem fecha um detalhe.
   if(lastTheme){const back=$('theme-card-'+lastTheme);lastTheme=null;if(back)requestAnimationFrame(()=>back.focus({preventScroll:false}));}
   return;}
  const article=N('article');article.className='silm-reading';article.setAttribute('aria-labelledby','theme-title');
  const eyebrow=N('p','APRENDER · TEMA');eyebrow.className='eyebrow';const title=N('h1',t.title);title.id='theme-title';title.tabIndex=-1;
  const idea=t.concepts.find(c=>c.title==='Ideia principal'),lead=N('p',idea?idea.text:t.description);lead.className='silm-lead';
  article.append(eyebrow,title,lead,N('p',t.subtitle+'. '+t.description));
  const actions=N('div');actions.className='silm-actions';
  const metal=S.data.get(t.relatedMetals[0]),investigate=N('button','Investigar na oficina');investigate.type='button';investigate.className='button primary';investigate.id='theme-investigate';
  investigate.addEventListener('click',()=>{
   // Prepara o metal representativo na Montagem; a investigação só começa quando o estudante escolher Iniciar.
   if(model.state.metal?.atomicNumber===metal.atomicNumber){location.hash='#/ambiente';return;}
   if(!prepareMetal?.(metal.atomicNumber)){say('Não foi possível preparar '+metal.name+' na Montagem.','warning');return;}
   location.hash='#/ambiente';say(metal.name+' preparado na Montagem. Escolha Iniciar para começar a investigação.','success');
   requestAnimationFrame(()=>requestAnimationFrame(()=>{const open=document.querySelector('[data-open-dock="montagem"]');if(open&&open.getAttribute('aria-expanded')!=='true')open.click();}));
  });
  const mark=N('button',progress.completed[t.id]?'Revisado · desmarcar':'Marcar como revisado');mark.type='button';mark.className='button outline silm-quiet';mark.id='theme-complete';mark.setAttribute('aria-pressed',String(!!progress.completed[t.id]));
  mark.addEventListener('click',()=>{if(progress.completed[t.id])delete progress.completed[t.id];else progress.completed[t.id]=t.version;storage.set('learning.themes',progress);themes();$('theme-complete').focus();say(progress.completed[t.id]?'Tema marcado como revisado. Ele continua disponível para revisitar.':'Marcação de revisado removida.','success');});
  actions.append(investigate,mark);article.append(actions);
  const related=N('section');related.className='silm-related';related.setAttribute('aria-labelledby','theme-related');const rh=N('h2','Conteúdo relacionado');rh.id='theme-related';related.append(rh);
  const group=(label,items)=>{if(!items.length)return;const row=N('div');row.className='silm-related-row';row.append(N('span',label));for(const [text,href] of items)row.append(link(text,href));related.append(row);};
  group(t.relatedMissions.length===1?'Missão relacionada':'Missões relacionadas',t.relatedMissions.map(m=>[S.missions.get(m).title,'#/missoes?item='+m]));
  group(t.relatedRoutes.length===1?'Roteiro relacionado':'Roteiros relacionados',t.relatedRoutes.map(r=>[S.routes.get(r).title,'#/roteiros?item='+r]));
  const metals=N('p');metals.className='silm-related-metals';metals.append(N('span','Metais para observar'),' '+t.relatedMetals.map(z=>S.data.get(z).name).join(', ')+'. Investigar na oficina prepara '+metal.name+'.');related.append(metals);article.append(related);
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
 const MANUAL_GROUPS=[['Investigue',['interface','selecionar-metal','montagem','estruturas-cristalinas','eletrons-deslocalizados','propriedades-metalicas','explorar','medir','calcular','vista','vista-3d']],['Prepare e registre',['atividades','caderno','relatorio']],['Orientação',['navegacao','problemas','manual','preferencias','abertura','reiniciar','offline','sobre-silm']],['Para ensinar',['professor']]];
 const MANUAL_QUICK=[['selecionar-metal','Como escolher um metal'],['medir','Como medir o parâmetro de rede'],['problemas','Por que uma opção não aparece']];
 const arrowSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
 let manualKey='';
 window.addEventListener('si-route-changed',event=>{if(event.detail!=='manual')manualKey='';});
 function manual(){
  const host=$('silm-manual');if(!host)return;const params=new URLSearchParams(location.hash.split('?')[1]||''),id=params.get('topico'),query=(params.get('busca')||'').trim();
  const topics=S.manual.topics,find=x=>topics.find(t=>t.id===x)||topics.find(t=>t.id===S.manual.aliases?.[x]),topic=id?find(id):null;
  const key=(id||'')+'|'+query;if(key===manualKey&&host.childElementCount)return;const previous=manualKey;manualKey=key;host.replaceChildren();
  const href=x=>'#/manual?topico='+encodeURIComponent(x);
  const arrowLink=(text,to,cls)=>{const a=N('a',text+' ');a.href=to;if(cls)a.className=cls;a.insertAdjacentHTML('beforeend',arrowSvg);return a;};
  // Barra: busca, voltar à oficina e imprimir.
  const bar=N('div');bar.className='silm-manual-bar';const form=N('form');form.className='silm-manual-search';form.setAttribute('role','search');
  const label=N('label','Buscar no Manual');label.htmlFor='manual-search';const input=N('input');input.type='search';input.id='manual-search';input.placeholder='Metal, estrutura, medir, Caderno…';input.value=query;
  const go=N('button','Buscar');go.type='submit';go.className='button outline';const row=N('div');row.className='silm-manual-search-row';row.append(input,go);form.append(label,row);
  form.addEventListener('submit',event=>{event.preventDefault();const q=input.value.trim();location.hash=q?'#/manual?busca='+encodeURIComponent(q):'#/manual';});
  const tools=N('div');tools.className='silm-manual-tools';const back=link('Voltar à oficina','#/ambiente');back.id='manual-workspace';
  const print=N('button',topic?'Imprimir tópico':'Imprimir guia rápido');print.type='button';print.className='button outline';print.id='manual-print';
  print.addEventListener('click',()=>{if(!topic){const sheet=N('section');sheet.className='silm-manual-guide';sheet.append(N('h1','Guia rápido do SILM'));for(const t of topics){sheet.append(N('h2',t.title),N('p',operation(t.summary)));if(t.steps){const ol=N('ol');t.steps.forEach(x=>ol.append(N('li',operation(x))));sheet.append(ol);}}host.append(sheet);document.body.classList.add('silm-print-manual');
   const done=()=>{document.body.classList.remove('silm-print-manual');sheet.remove();window.removeEventListener('afterprint',done);};window.addEventListener('afterprint',done);window.print();setTimeout(done,1000);}else window.print();});
  tools.append(back,print);bar.append(form,tools);host.append(bar);
  let focusTarget=null;
  if(query){
   // Resultados da busca: título, lista com resumo e limpar.
   const q=query.toLocaleLowerCase(),found=topics.filter(t=>[t.title,t.summary,t.purpose,t.content,(t.keywords||[]).join(' ')].join(' ').toLocaleLowerCase().includes(q));
   const box=N('section');box.className='silm-manual-results';const eyebrow=N('p','BUSCA NO MANUAL');eyebrow.className='eyebrow';const h1=N('h1',found.length?'Resultados para “'+query+'”':'Nenhum resultado para “'+query+'”');h1.id='manual-title';h1.tabIndex=-1;
   box.append(eyebrow,h1);if(!found.length)box.append(N('p','Tente outra palavra, como metal, estrutura, medir ou Caderno, ou consulte os grupos do Manual.'));
   const list=N('div');list.className='silm-content-list';for(const t of found){const a=N('a');a.className='silm-content-row';a.href=href(t.id);const span=N('span');span.append(N('strong',t.title),N('small',operation(t.summary)));a.append(span);list.append(a);}
   box.append(list,link('Limpar busca','#/manual'));host.append(box);focusTarget=h1;
  }else if(id){
   if(!topic){const h1=N('h1','Tópico não encontrado');h1.id='manual-title';h1.tabIndex=-1;host.append(h1,N('p','Este endereço não corresponde a um tópico do Manual.'),link('Voltar ao Manual','#/manual'));focusTarget=h1;}
   else{
    const group=MANUAL_GROUPS.find(([,ids])=>ids.includes(topic.id))?.[0]||'Manual';
    const crumb=N('nav');crumb.className='silm-manual-breadcrumb';crumb.setAttribute('aria-label','Caminho do Manual');const home=N('a','Manual');home.href='#/manual';const here=N('span',topic.title);here.setAttribute('aria-current','page');
    crumb.append(home,N('span','/'),N('span',group),N('span','/'),here);for(const sep of crumb.querySelectorAll('span:not([aria-current])'))if(sep.textContent==='/')sep.setAttribute('aria-hidden','true');
    const article=N('article');article.className='silm-reading silm-manual-article';const eyebrow=N('p',group.toUpperCase());eyebrow.className='eyebrow';const h1=N('h1',topic.title);h1.id='manual-title';h1.tabIndex=-1;const lead=N('p',operation(topic.summary));lead.className='silm-lead';
    article.append(eyebrow,h1,lead);for(const k of ['purpose','content'])if(topic[k])article.append(N('p',operation(topic[k])));
    if(topic.steps){article.append(N('h2','Passo a passo'));const ol=N('ol');topic.steps.forEach(x=>ol.append(N('li',operation(x))));article.append(ol);}
    if(topic.details?.length){article.append(N('h2','Saiba mais'));for(const d of topic.details){const det=N('details');det.append(N('summary',d.title),N('p',operation(d.text)));article.append(det);}}
    const related=(topic.related||[]).map(find).filter(Boolean);if(related.length){const nav=N('nav');nav.className='silm-manual-related';nav.setAttribute('aria-label','Veja também');nav.append(N('h2','Veja também'));const box=N('div');for(const r of related)box.append(arrowLink(r.title,href(r.id)));nav.append(box);article.append(nav);}
    const backLink=link('Voltar ao Manual','#/manual');backLink.id='manual-back';article.append(backLink);host.append(crumb,article);focusTarget=h1;
   }
  }else{
   // Início do Manual: apresentação, "Quero saber" e grupos.
   const hero=N('header');hero.className='silm-manual-hero';const eyebrow=N('p','MANUAL DO USUÁRIO');eyebrow.className='eyebrow';const h1=N('h1','Encontre seu próximo passo.');h1.id='manual-title';h1.tabIndex=-1;
   const actions=N('div');actions.className='silm-actions';const start=arrowLink('Começar a usar',href('interface'),'button primary');start.id='manual-start';actions.append(start);
   hero.append(eyebrow,h1,N('p','Uma dúvida na Oficina? Consulte uma ferramenta, entenda um resultado ou descubra por onde começar.'),actions);
   const quick=N('nav');quick.className='silm-manual-quick';quick.setAttribute('aria-label','Quero saber');const qt=N('p','QUERO SABER');qt.className='eyebrow';quick.append(qt);for(const [x,text] of MANUAL_QUICK)if(find(x))quick.append(arrowLink(text,href(x)));
   host.append(hero,quick);
   for(const [name,ids] of MANUAL_GROUPS){const sec=N('section');sec.className='silm-manual-group';sec.append(N('h2',name));const grid=N('div');grid.className='silm-manual-grid';
    for(const x of ids){const t=find(x);if(!t)continue;const a=N('a');a.className='silm-manual-card';a.href=href(t.id);a.append(N('h3',t.title),N('p',operation(t.summary)));const act=N('span','Consultar ');act.className='silm-manual-card-action';act.insertAdjacentHTML('beforeend',arrowSvg);a.append(act);grid.append(a);}
    sec.append(grid);host.append(sec);}
   if(previous)focusTarget=h1;
  }
  if(focusTarget&&previous!==key&&previous!=='')requestAnimationFrame(()=>{window.scrollTo(0,0);focusTarget.focus({preventScroll:true});});
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
 function professor(){if(table)return;const scope=SimCore.createScope();table=S.createPeriodicTable($('silm-professor-table'),{scope,state:{selection:model.state.metal?.atomicNumber||29,query:''},teacher:true,canInvestigate:()=>!session.open(),onInvestigate:async e=>{if(await selectMetal(e.atomicNumber))location.hash='#/ambiente';},onSources:e=>{$('silm-professor-sources').textContent=S.data.sourceIds(e).map(id=>{const s=S.data.source(id);return s.institution+' — '+s.title;}).join('\n');}});}
 function freeReport(){if(!model.state.investigation)return null;const saved=storage.get('report.free:'+model.state.investigation.id,{}),report={...fields};for(const k of Object.keys(report))if(typeof saved[k]==='string')report[k]=saved[k].slice(0,10000);return {activityContext:{id:'laboratorio',type:'free'},checkpoint:model.snapshot(),evidence:{cell:false,lattice:false,deformation:false},report};}
 function editReport(key,value){if(!Object.hasOwn(fields,key)||value.length>10000)return false;const r=freeReport()?.report||{...fields};r[key]=value;return storage.set('report.free:'+model.state.investigation.id,r);}
 return {init,freeReport,editReport,recordActivity,recordReport,archivedReport,render(){home();const page=B.currentRoute(location.hash);if(page==='aprender')themes();if(page==='manual')manual();if(page==='caderno'&&!$('notebook-text'))notebook();if(page==='professor')professor();}};
};
