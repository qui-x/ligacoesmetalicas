'use strict';
/* Etapa 11 — Área do Professor e apoio pedagógico, na arquitetura do SIAB 1.0.0:
   1. Atividade e identificação (tipo, atividade do catálogo, título, turma, professor, data), com os recursos necessários;
   2. Recursos do aluno (metais, recursos liberados, navegação);
   3. Gerar e conferir como aluno (resumo, link, copiar, abrir como aluno, exportar, orientações).
   Biblioteca de atividades neste navegador (abrir, copiar link, exportar, editar, duplicar, excluir), importação JSON validada
   (tudo ou nada), guia do professor imprimível e modo projetor. A tela "Atividade" abre o link do aluno.
   Todo o conteúdo vem do catálogo do SILM (SILM.teacherActivities); esta interface não cria ciência. */
SILM.createTeacherUI=({model,storage,session,say,start,applyPreset})=>{
 const S=SILM,T=S.teacherActivities,B=BaseDemoSI,$=id=>document.getElementById(id);
 const N=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=text;if(cls)n.className=cls;return n;};
 const button=(text,fn,cls='button outline',id)=>{const b=N('button',text,cls);b.type='button';if(id)b.id=id;b.addEventListener('click',fn);return b;};
 const KEY='teacher.library';
 let built=false,editing=null,current=null,studentKey='';
 const library=()=>T.library(storage.get(KEY,[]));
 const persist=list=>storage.set(KEY,list.map(r=>({config:r.config,createdAt:r.createdAt,updatedAt:r.updatedAt})));
 const base=()=>location.href.split('#')[0];
 const link=config=>base()+'#/atividade?c='+T.encode(config);
 const today=()=>new Date().toLocaleDateString('pt-BR');
 /* ---------- formulário ---------- */
 let form,typeSelect,itemSelect,titleInput,requirementsBox,metalMode,metalSelect,toolsBox,navigationSelect,errorBox,submit,cancel,result,resultSummary,linkInput,libraryBox,guideBox,importInput,identity={};
 function field(parent,label,control,hint){const wrap=N('div',null,'silm-field');const l=N('label',label);l.htmlFor=control.id;wrap.append(l,control);if(hint){const h=N('p',hint,'silm-field-hint');h.id=control.id+'-hint';control.setAttribute('aria-describedby',h.id);wrap.append(h);}parent.append(wrap);return control;}
 function select(id,items,value){const s=N('select');s.id=id;for(const [v,t]of items){const o=N('option',t);o.value=v;s.append(o);}if(value!==undefined)s.value=value;return s;}
 function build(){
  const host=$('silm-teacher');if(!host||built)return;built=true;host.replaceChildren();
  const projector=N('label',null,'silm-check-row');const pc=N('input');pc.type='checkbox';pc.id='silm-teacher-projector';projector.append(pc,document.createTextNode(' Modo projetor'));
  pc.addEventListener('change',()=>{const main=$('si-projector');if(main&&main.checked!==pc.checked){main.checked=pc.checked;main.dispatchEvent(new Event('change',{bubbles:true}));}syncProjector();});
  const steps=N('ol',null,'silm-teacher-steps');steps.setAttribute('aria-label','Etapas da preparação');for(const [n,t]of [['1','Escolha a atividade'],['2','Defina os recursos'],['3','Gere e confira como aluno']]){const li=N('li');li.append(N('span',n),document.createTextNode(' '+t));steps.append(li);}
  form=N('form',null,'silm-teacher-form');form.id='silm-teacher-form';form.noValidate=true;
  form.append(N('h2','1. Atividade e identificação'));
  typeSelect=field(form,'Tipo',select('teacher-type',Object.entries(T.types),'route'));
  itemSelect=field(form,'Atividade',select('teacher-item',[]));
  titleInput=N('input');titleInput.id='teacher-title-input';titleInput.maxLength=200;titleInput.autocomplete='off';field(form,'Título personalizado',titleInput,'Opcional. Sem título, a atividade usa o nome do catálogo.');
  requirementsBox=N('div',null,'silm-teacher-requirements');requirementsBox.id='teacher-requirements';requirementsBox.setAttribute('role','status');form.append(requirementsBox);
  const idBox=N('fieldset',null,'silm-teacher-identity');idBox.append(N('legend','Identificação (aparece no relatório do aluno)'));
  for(const [k,label]of [['className','Turma'],['teacher','Professor'],['date','Data']]){const i=N('input');i.id='teacher-id-'+k;i.maxLength=160;i.autocomplete='off';if(k==='date')i.value=today();identity[k]=i;field(idBox,label,i);}
  form.append(idBox,N('h2','2. Recursos do aluno'));
  metalMode=field(form,'Metal',select('teacher-metal-mode',[['all','O aluno escolhe entre os metais elegíveis'],['fixed','Um metal definido pelo professor']],'all'));
  metalSelect=field(form,'Metal definido',select('teacher-metal',[]));
  toolsBox=N('fieldset',null,'silm-teacher-tools');toolsBox.id='teacher-tools';form.append(toolsBox);
  navigationSelect=field(form,'Navegação',select('teacher-navigation',Object.entries(T.navigation),'restrita'),'Restrita: durante a atividade ficam o Início, a Oficina, o Manual e o relatório. A restrição organiza a aula; não é proteção contra edição do código.');
  errorBox=N('p',null,'silm-teacher-error');errorBox.id='teacher-error';errorBox.setAttribute('role','alert');
  const actions=N('div',null,'silm-teacher-actions');cancel=button('Cancelar edição',cancelEdit,'button outline','teacher-cancel-edit');cancel.hidden=true;
  submit=N('button','Validar e gerar atividade','button primary');submit.type='submit';submit.id='teacher-submit';actions.append(cancel,submit);form.append(errorBox,actions);
  form.addEventListener('submit',event=>{event.preventDefault();generate();});
  typeSelect.addEventListener('change',()=>{fillItems();refresh(true);});itemSelect.addEventListener('change',()=>refresh(true));metalMode.addEventListener('change',()=>refresh(false));
  // Resultado.
  result=N('section',null,'silm-teacher-result');result.id='teacher-result';result.hidden=true;result.setAttribute('aria-labelledby','teacher-result-title');
  const rt=N('h2','Atividade gerada');rt.id='teacher-result-title';rt.tabIndex=-1;resultSummary=N('p');resultSummary.id='teacher-summary';
  linkInput=N('input');linkInput.id='teacher-link';linkInput.readOnly=true;
  const ra=N('div',null,'silm-teacher-actions');const open=N('a','Abrir como aluno','button outline');open.id='teacher-open';open.target='_blank';open.rel='noopener';
  ra.append(button('Copiar link',()=>copy(current),'button outline','teacher-copy'),open,button('Exportar atividade',()=>download([current]),'button outline','teacher-export'),button('Ver orientações',()=>openGuide(current),'button outline','teacher-guide-open'));
  result.append(rt,resultSummary);field(result,'Link da atividade',linkInput);result.append(ra,N('p','O link guarda a configuração da atividade e não inclui respostas. Para outro aparelho, use o mesmo endereço do SILM (ou envie o arquivo exportado).','silm-field-hint'));
  // Biblioteca.
  const libHead=N('h2','Atividades criadas');libHead.id='teacher-library-title';
  const libHint=N('p','As atividades ficam neste navegador. Editar ou excluir não altera links já enviados: cada link guarda a sua própria configuração.','silm-field-hint');
  const libActions=N('div',null,'silm-teacher-actions');importInput=N('input');importInput.type='file';importInput.accept='application/json,.json';importInput.id='teacher-import';importInput.hidden=true;
  importInput.addEventListener('change',importFile);libActions.append(button('Importar atividades (JSON)',()=>importInput.click(),'button outline','teacher-import-open'),button('Exportar todas',()=>{const all=library().map(r=>r.config);if(!all.length){say('Nenhuma atividade para exportar.','info');return;}download(all);},'button outline','teacher-export-all'),importInput);
  libraryBox=N('div',null,'silm-teacher-library');libraryBox.id='teacher-library';libraryBox.setAttribute('aria-labelledby','teacher-library-title');
  // Material do professor.
  guideBox=N('section',null,'silm-teacher-material');guideBox.id='teacher-material';guideBox.setAttribute('aria-labelledby','teacher-material-title');
  const gt=N('h2','Material do professor');gt.id='teacher-material-title';
  guideBox.append(N('p','APOIO PEDAGÓGICO','eyebrow'),gt,N('p','Orientações para a atividade selecionada no formulário, compostas com o conteúdo do próprio SILM: objetivo, conceitos, preparação, desenvolvimento, critério, limites do modelo e fontes.'));
  const ga=N('div',null,'silm-teacher-actions');ga.append(button('Ver orientações',()=>openGuide(draft(true)),'button outline','teacher-material-open'),button('Imprimir Guia do Professor',()=>printGuide(draft(true)),'button outline','teacher-print'));guideBox.append(ga);
  host.append(projector,steps,form,result,libHead,libHint,libActions,libraryBox,guideBox);
  fillItems();refresh(true);renderLibrary();syncProjector();
  $('silm-teacher-guide-close')?.addEventListener('click',()=>$('silm-teacher-guide-dialog').close());
 }
 function syncProjector(){const pc=$('silm-teacher-projector'),main=$('si-projector');if(pc&&main){pc.checked=main.checked;pc.disabled=main.disabled;}}
 function fillItems(){const type=typeSelect.value;itemSelect.replaceChildren();for(const x of T.catalog(type)){const req=T.requirements(type,x.id);const o=N('option',x.title+(req.available?'':' (indisponível)'));o.value=x.id;o.disabled=!req.available;itemSelect.append(o);}const first=[...itemSelect.options].find(o=>!o.disabled);if(first)itemSelect.value=first.value;}
 /* Requisitos e recursos da atividade escolhida. keepTools=false preserva as marcações (troca do modo de metal). */
 function refresh(resetTools,config=null){
  const type=typeSelect.value,req=T.requirements(type,itemSelect.value);if(!req)return;
  const preset=type==='preset';requirementsBox.replaceChildren();
  requirementsBox.append(N('strong','O que esta atividade usa'));const ul=N('ul');
  ul.append(N('li','Módulo: '+({explorar:'Explorar',medir:'Medir',calcular:'Calcular'})[req.module]+(preset?'.':' (fixo durante a atividade).')));
  if(preset)ul.append(N('li','Metal: '+T.metalNames(req.metals)[0]+'. A montagem pronta prepara a oficina livre.'));
  else{ul.append(N('li',req.metals.length+' metais elegíveis.'));ul.append(N('li',req.required.length?'Recursos necessários ao critério: '+T.toolNames(req.required)+'.':'Nenhum recurso obrigatório além do módulo.'));}
  requirementsBox.append(ul);
  metalMode.closest('.silm-field').hidden=preset;metalSelect.closest('.silm-field').hidden=preset||metalMode.value!=='fixed';navigationSelect.closest('.silm-field').hidden=preset;toolsBox.hidden=preset;
  const chosenMetal=config?config.metals:null;
  if(!preset){
   const prev=metalSelect.value;metalSelect.replaceChildren();for(const z of req.metals){const e=S.data.get(z);const o=N('option',e.name+' ('+e.symbol+')');o.value=String(z);metalSelect.append(o);}
   if(chosenMetal&&chosenMetal.length===1){metalMode.value='fixed';metalSelect.value=String(chosenMetal[0]);metalSelect.closest('.silm-field').hidden=false;}else if(chosenMetal){metalMode.value='all';metalSelect.closest('.silm-field').hidden=true;}else if(req.metals.includes(Number(prev)))metalSelect.value=prev;
   const checked=resetTools||config?null:new Set([...toolsBox.querySelectorAll('input:checked')].map(i=>i.value));toolsBox.replaceChildren(N('legend','Recursos liberados para o aluno'));
   for(const t of req.tools){const row=N('label',null,'silm-check-row');const i=N('input');i.type='checkbox';i.name='tools';i.value=t;i.id='teacher-tool-'+t;const required=req.required.includes(t);
    i.checked=required||(config?config.tools.includes(t):checked?checked.has(t):true);i.disabled=required;row.append(i,document.createTextNode(' '+(T.toolLabels[t]||t)+(required?' (necessário)':'')));toolsBox.append(row);}
  }
 }
 /* Configuração a partir do formulário. lenient: para o guia, sem exigir validade total. */
 function draft(lenient=false){
  const type=typeSelect.value,req=T.requirements(type,itemSelect.value),preset=type==='preset';
  const config={schema:T.schema,id:editing||T.newId(),type,item:itemSelect.value,title:titleInput.value,
   metals:preset?req.metals:metalMode.value==='fixed'?[Number(metalSelect.value)]:req.metals,
   tools:preset?[]:[...toolsBox.querySelectorAll('input[name="tools"]')].filter(i=>i.checked).map(i=>i.value),
   navigation:preset?'livre':navigationSelect.value,identification:Object.fromEntries(Object.entries(identity).map(([k,i])=>[k,i.value]))};
  if(lenient){try{return T.validate(config);}catch{return T.validate({...config,tools:req.tools,metals:req.metals});}}
  return T.validate(config);
 }
 function generate(){
  if(session.open()){errorBox.textContent='Encerre a atividade em curso antes de preparar outra.';return;}
  errorBox.textContent='';let config;try{config=draft();}catch(error){errorBox.textContent=error.message;return;}
  const list=library(),now=new Date().toISOString(),i=list.findIndex(r=>r.config.id===config.id);
  if(i<0&&list.length>=T.maxLibrary){errorBox.textContent='A biblioteca já tem '+T.maxLibrary+' atividades. Exclua alguma antes de criar outra.';return;}
  if(i>=0)list[i]={config,createdAt:list[i].createdAt,updatedAt:now};else list.unshift({config,createdAt:now,updatedAt:now});
  if(!persist(list)){errorBox.textContent='Não foi possível guardar a atividade neste navegador.';return;}
  const wasEditing=!!editing;editing=null;submit.textContent='Validar e gerar atividade';cancel.hidden=true;show(config);renderLibrary();
  say(wasEditing?'Alterações salvas. Links já enviados mantêm a configuração original.':'Atividade gerada e guardada neste navegador.','success');
 }
 function show(config){
  current=config;const s=T.summary(config);result.hidden=false;
  resultSummary.textContent=s.title+' · '+s.type+(s.itemTitle!==s.title?' ('+s.itemTitle+')':'')+' · Módulo '+s.module+' · Metal: '+s.metals+' · Recursos: '+s.tools+' · Navegação: '+s.navigation;
  linkInput.value=link(config);$('teacher-open').href=linkInput.value;requestAnimationFrame(()=>$('teacher-result-title')?.focus());
 }
 async function copy(config){if(!config)return;const value=link(config);try{await navigator.clipboard.writeText(value);say('Link copiado.','success');}catch{linkInput.value=value;result.hidden=false;linkInput.focus();linkInput.select();say('Selecione e copie o link exibido.','info');}}
 function download(configs){
  if(!configs.length||!configs[0])return;const doc=T.exportDocument(configs),blob=new Blob([JSON.stringify(doc,null,2)],{type:'application/json'});
  const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=configs.length===1?'SILM-atividade-'+configs[0].item+'.json':'SILM-atividades.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 /* Importação tudo ou nada: um arquivo inválido não altera a biblioteca. Atividades importadas recebem identificador novo. */
 async function importFile(event){
  const input=event.target,file=input.files[0];if(!file)return;
  try{
   if(file.size>256*1024)throw new Error('O arquivo excede 256 KB.');
   let value;try{value=JSON.parse(await file.text());}catch{throw new Error('O arquivo não é um JSON válido.');}
   const configs=T.importDocument(value),list=library();if(list.length+configs.length>T.maxLibrary)throw new Error('A biblioteca ficaria com mais de '+T.maxLibrary+' atividades.');
   const now=new Date().toISOString(),added=configs.map(c=>({config:T.validate({...c,id:T.newId()}),createdAt:now,updatedAt:now}));
   if(!persist([...added,...list]))throw new Error('Não foi possível guardar as atividades neste navegador.');
   renderLibrary();say(added.length===1?'1 atividade importada.':added.length+' atividades importadas.','success');
  }catch(error){say('Importação recusada: '+error.message+' A biblioteca não foi alterada.','error');}finally{input.value='';}
 }
 function renderLibrary(){
  libraryBox.replaceChildren();const list=library();
  if(!list.length){libraryBox.append(N('p','Nenhuma atividade criada neste navegador.','silm-field-hint'));return;}
  for(const r of list){
   const c=r.config,s=T.summary(c),row=N('article',null,'silm-teacher-entry');row.dataset.activityId=c.id;
   const text=N('div');text.append(N('strong',c.title),N('span',s.type+' · Módulo '+s.module+' · '+s.metals));
   const actions=N('div',null,'silm-teacher-actions');const open=N('a','Abrir','button outline');open.href=link(c);open.target='_blank';open.rel='noopener';
   actions.append(open,button('Copiar link',()=>copy(c)),button('Exportar',()=>download([c])),button('Editar',()=>edit(c)),button('Duplicar',()=>duplicate(c)),button('Excluir',()=>remove(c),'danger-btn'));
   row.append(text,actions);libraryBox.append(row);
  }
 }
 function edit(c){
  editing=c.id;typeSelect.value=c.type;fillItems();itemSelect.value=c.item;titleInput.value=c.title===T.requirements(c.type,c.item).title?'':c.title;
  for(const [k,i]of Object.entries(identity))i.value=c.identification[k]||'';navigationSelect.value=c.navigation;refresh(false,c);
  submit.textContent='Salvar alterações';cancel.hidden=false;errorBox.textContent='';titleInput.focus();say('Editando “'+c.title+'”. Links já enviados mantêm a configuração original.','info');
 }
 function cancelEdit(){editing=null;form.reset();identity.date.value=today();fillItems();refresh(true);submit.textContent='Validar e gerar atividade';cancel.hidden=true;errorBox.textContent='';}
 function duplicate(c){
  const list=library();if(list.length>=T.maxLibrary){say('A biblioteca já tem '+T.maxLibrary+' atividades.','warning');return;}
  const now=new Date().toISOString(),copyConfig=T.validate({...c,id:T.newId(),title:('Cópia de '+c.title).slice(0,200)});
  if(persist([{config:copyConfig,createdAt:now,updatedAt:now},...list])){renderLibrary();say('Atividade duplicada.','success');}
 }
 async function remove(c){
  if(!await B.confirmDialog({title:'Excluir atividade?',description:'“'+c.title+'” será removida da Área do Professor. Links de aluno já enviados continuam funcionando.',confirmText:'Excluir atividade',destructive:true}))return;
  if(persist(library().filter(r=>r.config.id!==c.id))){if(editing===c.id)cancelEdit();if(current?.id===c.id){current=null;result.hidden=true;}renderLibrary();say('Atividade excluída deste navegador.','success');}
 }
 /* ---------- guia do professor ---------- */
 function guideArticle(config){
  const g=T.guide(config),article=N('article',null,'silm-teacher-guide');article.setAttribute('aria-labelledby','teacher-guide-title');
  const h=N('h1',g.title);h.id='teacher-guide-title';article.append(N('p','GUIA DO PROFESSOR · SILM '+B.manifest.version,'eyebrow'),h,N('p',g.subtitle,'silm-lead'));
  for(const sec of g.sections){const box=N('section');box.append(N('h2',sec.title));for(const p of sec.paragraphs)box.append(N('p',p));if(sec.list?.length){const ul=N('ul');for(const x of sec.list)ul.append(N('li',x));box.append(ul);}article.append(box);}
  return article;
 }
 function openGuide(config){if(!config)return;const dialog=$('silm-teacher-guide-dialog'),body=$('silm-teacher-guide-body');body.replaceChildren(guideArticle(config));dialog.showModal();dialog.scrollTop=0;const h=$('teacher-guide-title');h.tabIndex=-1;h.focus({preventScroll:true});}
 function printGuide(config){
  if(!config)return;const sheet=$('silm-guide-print');sheet.replaceChildren(guideArticle(config));document.body.classList.add('silm-printing-guide');
  const done=()=>{document.body.classList.remove('silm-printing-guide');sheet.replaceChildren();window.removeEventListener('afterprint',done);};window.addEventListener('afterprint',done);window.print();setTimeout(()=>{if(!matchMedia('print').matches)done();},0);
 }
 /* ---------- tela do aluno: #/atividade?c=... ---------- */
 function renderStudent(){
  const host=$('silm-student-activity');if(!host)return;const token=new URLSearchParams(location.hash.split('?')[1]||'').get('c')||'';
  const key=token+'|'+(session.open()?session.teacher()?.id||'outra':'livre');if(key===studentKey&&host.childElementCount)return;studentKey=key;host.replaceChildren();
  let config;try{config=T.decode(token);}catch{const h=N('h1','Não foi possível abrir a atividade');h.id='student-activity-title';h.tabIndex=-1;host.append(h,N('p','O link está incompleto, foi alterado ou é de uma versão incompatível do SILM. Peça ao professor o link completo ou o arquivo da atividade.'));return;}
  const s=T.summary(config),req=T.requirements(config.type,config.item);
  const h=N('h1',config.title);h.id='student-activity-title';h.tabIndex=-1;host.append(N('p','ATIVIDADE PREPARADA PELO PROFESSOR','eyebrow'),h,N('p',s.type+(s.itemTitle!==config.title?' · '+s.itemTitle:'')+' · Módulo '+s.module,'silm-lead'));
  const sec=(title,...nodes)=>{const box=N('section');box.append(N('h2',title),...nodes);host.append(box);};
  if(config.type==='preset')sec('Objetivo',N('p',req.item.objective));else sec('Objetivo',N('p',req.item.objectives.join(' ')));
  const ul=N('ul');ul.append(N('li','Metal: '+s.metals+'.'),N('li','Recursos: '+s.tools+'.'),N('li','Navegação: '+s.navigation+'.'));
  const id=config.identification;if(id.className||id.teacher||id.date)ul.append(N('li','Identificação: '+[id.className&&'Turma '+id.className,id.teacher&&'Professor '+id.teacher,id.date].filter(Boolean).join(' · ')+'.'));
  sec('Na oficina',ul);
  const action=N('form',null,'silm-student-start');action.noValidate=true;let pick=null;
  if(config.type!=='preset'&&config.metals.length>1){pick=select('student-metal',config.metals.map(z=>{const e=S.data.get(z);return [String(z),e.name+' ('+e.symbol+')'];}));field(action,'Escolha o metal',pick);}
  const go=N('button',config.type==='preset'?'Montar na oficina':'Começar atividade','button primary');go.type='submit';go.id='student-start';action.append(go);
  if(session.open()){go.disabled=true;const note=N('p',session.teacher()?.id===config.id?'Esta atividade já está em andamento. Use “Atividade em andamento” para voltar à oficina.':'Encerre a atividade em curso antes de abrir outra.','silm-setup-locked');note.id='student-locked';go.setAttribute('aria-describedby',note.id);action.append(note);}
  action.addEventListener('submit',async event=>{event.preventDefault();if(session.open())return;
   if(config.type==='preset'){if(await applyPreset(config.item))say('Atividade do professor: '+config.title+'.','success');return;}
   start(config,pick?Number(pick.value):config.metals[0]);});
  host.append(action);
 }
 function render(page){if(page==='professor'){build();syncProjector();}if(page==='atividade')renderStudent();}
 window.addEventListener('si-route-changed',event=>{if(event.detail!=='atividade')studentKey='';});
 return {render};
};
