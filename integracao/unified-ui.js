'use strict';
SILM.createUnifiedUI=({model,storage,session,selectMetal,say})=>{
 const S=SILM,B=BaseDemoSI,$=id=>document.getElementById(id),N=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;},link=(text,href)=>{const a=N('a',text);a.className='button outline';a.href=href;return a;};
 const fields={name:'',date:new Date().toLocaleDateString('pt-BR'),observations:'',interpretation:'',conclusion:''};
 let progress={schemaVersion:1,completed:{}},table=null;const journal=B.createJournalStore(B.storage);let notebookFilter='todos';
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
  $('si-home-learning-meta').textContent=S.themes.registry.length+' temas disponíveis';$('si-home-missions-meta').textContent=S.missions.registry.length+' investigações curtas';$('si-home-scripts-meta').textContent=S.routes.registry.length+' roteiros experimentais';const noteCount=journal.snapshot().notes.length;$('si-home-notebook-meta').textContent=noteCount?(noteCount+' registro'+(noteCount===1?'':'s')+' salvo'+(noteCount===1?'':'s')):'Pronto para seus registros';
  const c=session.context(),resume=$('si-home-resume');resume.hidden=!c;if(c){$('si-home-resume-title').textContent=session.route().title;$('si-home-resume-meta').textContent=c.status==='completed'?'Concluído':'Investigação em andamento';$('si-home-resume-link').href='#/'+(c.type==='mission'?'missoes':'roteiros')+'?item='+c.id;}
  const e=model.state.metal,n=model.state.structure?.units.length||0;$('si-home-scene-summary').hidden=!e;$('si-home-scene-summary').textContent=e?S.data.get(e.atomicNumber).name+' · '+n+' unidades salvas':'';
 }
 function themes(){
  const host=$('silm-themes');host.replaceChildren();const id=new URLSearchParams(location.hash.split('?')[1]||'').get('tema'),t=S.themes.get(id);
  if(!t){for(const item of S.themes.registry){const card=N('article');card.className='edu-card';card.append(N('h2',item.title),N('p',item.subtitle),N('p',item.description));if(progress.completed[item.id])card.append(N('strong','Concluído'));const a=link('Explorar tema','#/aprender?tema='+item.id);a.id='theme-card-'+item.id;card.append(a);host.append(card);}return;}
  const card=N('article');card.className='edu-card';card.append(N('h2',t.title),N('p',t.subtitle),N('p',t.description));
  for(const c of t.concepts){const d=N('details');d.open=c.title==='Ideia principal';d.append(N('summary',c.title),N('p',c.text));card.append(d);}
  const mark=N('button',progress.completed[t.id]?'Concluído — desmarcar':'Marcar como concluído');mark.type='button';mark.className='button outline';mark.id='theme-complete';mark.addEventListener('click',()=>{if(progress.completed[t.id])delete progress.completed[t.id];else progress.completed[t.id]=t.version;storage.set('learning.themes',progress);themes();document.getElementById('theme-complete').focus();});card.append(mark,N('h3','Explore no SILM'),link('Abrir laboratório','#/ambiente'));
  card.append(N('h3','Missões relacionadas'));for(const id of t.relatedMissions)card.append(link(S.missions.get(id).title,'#/missoes?item='+id));card.append(N('h3','Roteiros relacionados'));for(const id of t.relatedRoutes)card.append(link(S.routes.get(id).title,'#/roteiros?item='+id));
  const metals=N('p','Metais para observar: '+t.relatedMetals.map(z=>S.data.get(z).name).join(', '));card.append(metals);const sources=N('details');sources.append(N('summary','Fontes'));for(const id of t.sources){const source=S.data.source(id);const p=N('p',source.institution+' — '+source.title);if(source.url){const a=link('Consultar',source.url);a.target='_blank';a.rel='noopener noreferrer';p.append(a);}sources.append(p);}card.append(sources,link('Todos os temas','#/aprender'));host.append(card);
 }
 const operation=text=>String(text).replaceAll('Montagem → Módulo','Ver → Módulo').replaceAll('Ver → Analisar → Calcular','Ver → Calcular').replaceAll('O Caderno não está ativado no SILM.','O Caderno guarda observações locais.');
 function manual(){const host=$('silm-manual');host.replaceChildren();const search=N('input');search.type='search';search.id='manual-search';const label=N('label','Buscar no manual');label.htmlFor=search.id;const list=N('div');list.className='silm-route-catalog';host.append(label,search,list);
  function fill(query=''){list.replaceChildren();const chosen=new URLSearchParams(location.hash.split('?')[1]||'').get('topico');for(const t of S.manual.topics.filter(t=>(t.title+' '+t.summary+' '+(t.keywords||[]).join(' ')).toLocaleLowerCase().includes(query.toLocaleLowerCase()))){const d=N('details');d.className='edu-card';d.open=t.id===chosen;d.append(N('summary',t.title),N('p',operation(t.summary)));for(const key of ['purpose','content'])if(t[key])d.append(N('p',operation(t[key])));if(t.steps){const ol=N('ol');t.steps.forEach(s=>ol.append(N('li',operation(s))));d.append(ol);}for(const x of t.details||[])d.append(N('h3',x.title),N('p',operation(x.text)));list.append(d);}}
  search.addEventListener('input',()=>fill(search.value));fill();
 }
 function notebook(){
  const host=$('silm-notebook');if(!host)return;host.replaceChildren();
  const typeNames={observacao:'Observação',hipotese:'Hipótese',conclusao:'Conclusão'};
  const intro=N('p','Registre observações, hipóteses e conclusões. Os dados ficam neste navegador; use os backups para transferi-los entre dispositivos.');intro.className='silm-notebook-intro';
  const editor=N('section');editor.className='silm-notebook-editor';
  const kind=N('select');kind.id='notebook-kind';
  for(const [value,label] of Object.entries(typeNames)){const option=N('option',label);option.value=value;kind.append(option);}
  const kindLabel=N('label','Tipo de registro');kindLabel.append(kind);
  const input=N('textarea');input.id='notebook-text';input.maxLength=1200;input.rows=5;input.placeholder='O que você observou? Que hipótese deseja registrar?';
  const bodyLabel=N('label','Registro (até 1.200 caracteres)');bodyLabel.append(input);
  const add=N('button','Registrar observação');add.type='button';add.id='notebook-add';add.className='button primary';
  add.addEventListener('click',()=>{
   const body=input.value.trim();if(!body){say('Escreva uma observação antes de registrar.','warning');input.focus();return;}
   const metal=model.state.investigation&&model.state.metal?S.data.get(model.state.metal.atomicNumber):null;
   const selectedId=metal?'silm-metal-'+metal.atomicNumber:null;
   const scene={schemaVersion:1,entities:metal?[{id:selectedId,label:metal.name+' ('+metal.symbol+')',kind:'label'}]:[],selectedId};
   if(journal.addNote({kind:kind.value,body},scene)){input.value='';home();renderEntries();say('Registro salvo no Caderno.','success');}
   else say('Não foi possível gravar: verifique o texto ou o limite de 80 registros.','warning');
  });
  editor.append(kindLabel,bodyLabel,add);
  const actions=N('div');actions.className='silm-notebook-actions';
  const makeAction=(id,label,fn)=>{const b=N('button',label);b.type='button';b.id=id;b.className='button outline';b.addEventListener('click',fn);actions.append(b);return b;};
  const download=(name,content,type)=>{const url=URL.createObjectURL(new Blob([content],{type}));const a=N('a');a.href=url;a.download=name;a.hidden=true;host.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  makeAction('notebook-export-json','Exportar backup JSON',()=>download('SILM-caderno.json',journal.exportJSON(),'application/json;charset=utf-8'));
  makeAction('notebook-export-csv','Exportar registros CSV',()=>{if(typeof B.journalCSV!=='function'){say('Exportação CSV indisponível nesta base.','warning');return;}download('SILM-caderno.csv','\uFEFF'+B.journalCSV(journal.snapshot().notes),'text/csv;charset=utf-8');});
  makeAction('notebook-print','Imprimir Caderno',()=>{
   const sheet=N('article');sheet.className='silm-notebook-print';sheet.append(N('h1','Caderno de observações — SILM'),N('p','Emissão: '+new Date().toLocaleString('pt-BR')));
   const notes=journal.snapshot().notes;
   for(const note of notes){const card=N('section');card.className='silm-notebook-print-entry';card.append(N('h2',typeNames[note.kind]||'Registro'));card.append(N('p',note.body));card.append(N('p',(note.entityLabel?'Metal: '+note.entityLabel+' · ':'')+new Date(note.createdAt).toLocaleString('pt-BR')));sheet.append(card);}
   if(!notes.length)sheet.append(N('p','Nenhum registro disponível.'));
   host.append(sheet);document.body.classList.add('silm-print-notebook');
   const cleanup=()=>{document.body.classList.remove('silm-print-notebook');sheet.remove();window.removeEventListener('afterprint',cleanup);};
   window.addEventListener('afterprint',cleanup);
   try{window.print();}catch{cleanup();say('A impressão não está disponível neste navegador.','warning');}
  });
  const importInput=N('input');importInput.id='notebook-import';importInput.type='file';importInput.accept='.json,application/json';importInput.hidden=true;importInput.className='silm-notebook-file';
  makeAction('notebook-import-trigger','Importar backup JSON',()=>importInput.click());
  const filter=N('select');filter.id='notebook-filter';
  for(const [value,label] of [['todos','Todos os registros'],['observacao','Observações'],['hipotese','Hipóteses'],['conclusao','Conclusões']]){const option=N('option',label);option.value=value;filter.append(option);}
  filter.value=['todos','observacao','hipotese','conclusao'].includes(notebookFilter)?notebookFilter:'todos';notebookFilter=filter.value;
  const filterLabel=N('label','Filtrar registros');filterLabel.className='silm-notebook-filter';filterLabel.append(filter);
  const entries=N('div');entries.className='silm-notebook-entries';
  function renderEntries(){
   entries.replaceChildren();
   const notes=journal.snapshot().notes;
   const visible=notes.filter(note=>notebookFilter==='todos'||note.kind===notebookFilter);
   if(!visible.length){const empty=N('p',notes.length?'Nenhum registro corresponde a este filtro.':'Ainda não há registros.');empty.className='silm-notebook-empty';entries.append(empty);return;}
   for(const note of visible){
    const card=N('article');card.className='silm-notebook-entry';
    const header=N('div');header.className='silm-notebook-entry-head';
    header.append(N('strong',typeNames[note.kind]||'Registro'));
    const time=N('time',new Date(note.createdAt).toLocaleString('pt-BR'));time.dateTime=note.createdAt;header.append(time);card.append(header);
    if(note.entityLabel)card.append(N('p','Metal associado: '+note.entityLabel));
    const body=N('p',note.body);body.className='silm-notebook-entry-body';card.append(body);
    const remove=N('button','Excluir registro');remove.type='button';remove.className='button outline';remove.addEventListener('click',async()=>{
     if(!await B.confirmDialog({title:'Excluir registro?',description:'Este registro será removido do Caderno. Os relatórios arquivados serão preservados.',confirmText:'Excluir',cancelText:'Cancelar',destructive:true}))return;
     if(journal.removeNote(note.id)){home();renderEntries();say('Registro excluído.','success');}else say('Não foi possível excluir o registro.','warning');
    });card.append(remove);entries.append(card);
   }
  }
  filter.addEventListener('change',()=>{notebookFilter=filter.value;renderEntries();});
  importInput.addEventListener('change',event=>{const file=event.currentTarget.files&&event.currentTarget.files[0];if(!file)return;void(async()=>{
   try{
    if(session.open()){say('Encerre a atividade orientada antes de restaurar um backup.','warning');return;}
    if(file.size>300000)throw new Error('O arquivo excede o limite de 300 KB.');
    const decoded=B.parseJournalImport(await file.text());
    if(!decoded||typeof decoded!=='object'||Array.isArray(decoded)||decoded.format!=='base-demo-si-journal-v1'||!B.parseJournal(decoded.document))throw new Error('Backup inválido ou incompatível; os dados atuais foram preservados.');
    if(!await B.confirmDialog({title:'Restaurar o Caderno?',description:'O backup substituirá os registros e relatórios do Caderno neste navegador.',confirmText:'Restaurar',cancelText:'Cancelar'}))return;
    if(session.open()){say('A atividade foi iniciada durante a confirmação. O backup não foi importado.','warning');return;}
    if(journal.importJSON(decoded)){notebookFilter='todos';filter.value='todos';home();renderEntries();say('Backup restaurado com validação.','success');}
    else say('Não foi possível restaurar o backup. Os dados atuais foram preservados.','warning');
   }catch(error){say(error.message||'Falha na importação do Caderno.','error');}
   finally{importInput.value='';}
  })();});
  async function clearNotes(){
   if(session.open()){say('Encerre a atividade orientada antes de limpar registros.','warning');return;}
   if(!journal.snapshot().notes.length){say('O Caderno já está vazio.','info');return;}
   if(!await B.confirmDialog({title:'Limpar registros?',description:'As observações, hipóteses e conclusões serão removidas. Relatórios arquivados serão preservados.',confirmText:'Limpar registros',cancelText:'Cancelar',destructive:true}))return;
   if(session.open()){say('A atividade foi iniciada durante a confirmação. Nada foi apagado.','warning');return;}
   if(journal.clearNotes()){notebookFilter='todos';filter.value='todos';home();renderEntries();say('Registros removidos; os relatórios foram preservados.','success');}
   else say('Não foi possível limpar o Caderno.','warning');
  }
  const clearButton=makeAction('notebook-clear','Limpar registros',clearNotes);
  if(session.open()){clearButton.disabled=true;clearButton.title='Encerre a atividade orientada antes de limpar registros.';actions.querySelector('#notebook-import-trigger').disabled=true;}
  host.append(intro,editor,actions,filterLabel,entries,importInput);
  renderEntries();
 }
 function professor(){if(table)return;const scope=SimCore.createScope();table=S.createPeriodicTable($('silm-professor-table'),{scope,state:{selection:model.state.metal?.atomicNumber||29,query:''},teacher:true,canInvestigate:()=>!session.open(),onInvestigate:async e=>{if(await selectMetal(e.atomicNumber))location.hash='#/ambiente';},onSources:e=>{$('silm-professor-sources').textContent=S.data.sourceIds(e).map(id=>{const s=S.data.source(id);return s.institution+' — '+s.title;}).join('\n');}});}
 function freeReport(){if(!model.state.investigation)return null;const saved=storage.get('report.free:'+model.state.investigation.id,{}),report={...fields};for(const k of Object.keys(report))if(typeof saved[k]==='string')report[k]=saved[k].slice(0,10000);return {activityContext:{id:'laboratorio',type:'free'},checkpoint:model.snapshot(),evidence:{cell:false,lattice:false,deformation:false},report};}
 function editReport(key,value){if(!Object.hasOwn(fields,key)||value.length>10000)return false;const r=freeReport()?.report||{...fields};r[key]=value;return storage.set('report.free:'+model.state.investigation.id,r);}
 return {init,freeReport,editReport,render(){home();const page=B.currentRoute(location.hash);if(page==='aprender')themes();if(page==='manual')manual();if(page==='caderno'&&!$('notebook-text'))notebook();if(page==='professor')professor();}};
};
