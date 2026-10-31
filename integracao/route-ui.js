'use strict';
SILM.createRouteUI=({model,storage,view,onView,schedule,say,onModule,selectMetal,prepareMetal})=>{
 const S=SILM,registry=S.activities||S.routes,B=BaseDemoSI,$=id=>document.getElementById(id),N=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const button=(label,fn,id)=>{const b=N('button',label);b.type='button';b.className='button outline';if(id)b.id=id;b.addEventListener('click',fn);return b;};
 const session=S.createRouteSession({model,storage,view,onView,say});
 const unified=S.createUnifiedUI({model,storage,session,selectMetal,prepareMetal,say});
 const url=id=>'#/'+(registry.get(id)?.type==='mission'?'missoes':'roteiros')+'?item='+encodeURIComponent(id);
 const isMission=()=>session.context()?.type==='mission';
 const noun=()=>isMission()?'Missão':'Roteiro';
 const canBuild=()=>isMission()&&session.allows('structure');
 const prefix=()=>isMission()?'mission':'route';
 function sync(){const c=session.context(),active=!!c;document.body.classList.toggle('silm-guided',active);const href=active?url(c.id):'#/inicio';const back=$('si-return-activity');back.hidden=!active;back.href=href;back.textContent=noun()+' em andamento';B.closeNavigationDrawer(false);window.dispatchEvent(new CustomEvent('si-module-change'));schedule();}
 function complete(){
  const before=session.context(),r=session.complete();let message=r.message,kind=r.ok?'success':'warning';
  if(r.ok&&before){const activity=session.report(before.id),saved=unified.recordActivity(session.route(),activity);if(saved==='added')message+=' Conclusão registrada no Caderno.';else if(saved==='error'){message+=' Não foi possível guardar a referência no Caderno; registre-a manualmente.';kind='warning';}}
  say(message,kind);sync();return r;
 }
 function close(){const destination=isMission()?'#/missoes':'#/roteiros';if(!session.close())return false;onModule(model.state.module.active);location.hash=destination;say('Atividade encerrada. Sua investigação livre foi restaurada.');sync();}
 B.guidedActivityContext=()=>{const c=session.context(),r=session.route();return c?{url:url(c.id),title:r.title,kind:isMission()?'mission':'script',progress:c.status==='completed'?1:0,total:1}:null;};
 B.menuActivity=(kind,id)=>{const c=session.context(),r=session.route();return kind===(isMission()?'mission':'script')&&c?.id===id?{id:r.id,kind,title:r.title,module:r.module,steps:[{label:r.guidance.criterion,requirement:'manual',minimum:1}]}:undefined;};
 B.menuActivityProgress=id=>session.context()?.id===id&&session.context().status==='completed'?1:0;
 B.advanceActivityFromMenu=()=>complete();B.clearGuidedReturn=()=>close();B.endGuidedActivity=()=>close();
 function enter(r,z,resume){if(session.open()){location.hash='#/ambiente';return;}if(!session.start(r.id,z,{resume})){say('Não foi possível preparar esta investigação.','warning');return;}onModule(r.module);location.hash='#/ambiente';sync();say('Contexto restrito: '+r.title+'. Módulo '+r.module+' fixo.');}
 function catalogue(mission=false){
  const catalogue=mission?S.missions.registry:S.routes.registry,pre=mission?'mission':'route';
  const host=$(mission?'silm-mission-catalog':'silm-route-catalog');host.replaceChildren();const doc=session.snapshot(),id=new URLSearchParams(location.hash.split('?')[1]||'').get('item'),r=catalogue.find(item=>item.id===id);
  if(!r){for(const item of catalogue){const card=N('article');card.className='edu-card';card.append(N('h2',item.title),N('p',item.subtitle),N('p','Módulo: '+item.module));if(item.concept)card.append(N('p',item.concept));if(doc.completed[item.id]===item.version)card.append(N('strong','Concluído'));card.append(button('Ver especificações',()=>{location.hash=url(item.id);},pre+'-card-'+item.id));host.append(card);}return;}
  const box=N('article');box.className='edu-card';box.append(N('h2',r.title),N('p',r.subtitle),N('p','Módulo: '+r.module),N('p',r.description));
  for(const [label,items]of [['Objetivos',r.objectives],['Condições e pré-requisitos',r.prerequisites],['Recursos virtuais',r.allowedTools]]){box.append(N('h3',label));const list=N('ul');items.forEach(x=>list.append(N('li',labels[x]||x)));box.append(list);}
  if(!mission)box.append(N('h3','Orientações'),N('p',r.guidance.action),N('p',r.guidance.hint),N('p','Critério de conclusão: '+r.guidance.criterion));
  for(const id of r.sources){const s=S.data.source(id);box.append(N('p','Fonte: '+s.institution+' — '+s.title));}
  if(!session.open()){const related=S.themes.registry.filter(t=>mission?t.relatedMissions.includes(r.id):t.relatedRoutes.includes(r.id));if(related.length)box.append(N('h3','Temas relacionados'));for(const t of related){const a=N('a',t.title);a.className='button outline';a.href='#/aprender?tema='+t.id;box.append(a);}}
  const selection=N('select');selection.id=pre+'-metal';for(const z of r.metalSelection.atomicNumbers){const e=S.data.get(z),o=N('option',e.name+' ('+e.symbol+')');o.value=z;selection.append(o);}selection.value=r.metalSelection.atomicNumbers.includes(29)?'29':String(r.metalSelection.atomicNumbers[0]);if(session.context()?.id===r.id){selection.value=String(model.state.metal.atomicNumber);selection.disabled=true;}const label=N('label','Metal da investigação');label.htmlFor=selection.id;box.append(label,selection);
  if(session.open())box.append(button('Retomar na oficina',()=>{location.hash='#/ambiente';},pre+'-resume'));
  else{if(doc.attempts[r.id])box.append(button('Retomar investigação',()=>enter(r,doc.attempts[r.id].checkpoint.metal.atomicNumber,true),pre+'-resume'));
   box.append(button(doc.completed[r.id]?(mission?'Refazer missão':'Refazer roteiro'):(mission?'Iniciar missão':'Montar na oficina'),async()=>{if(!await B.confirmDialog({title:mission?'Iniciar missão?':'Montar roteiro?',description:'Sua investigação livre será guardada e restaurada ao encerrar a atividade.',confirmText:'Montar'}))return;enter(r,Number(selection.value),false);},pre+'-mount'));}
  if(!mission&&doc.archives[r.id])box.append(button('Abrir relatório',()=>{location.hash='#/relatorios?roteiro='+r.id;}));
  if(!session.open())box.append(button(mission?'Todas as missões':'Todos os roteiros',()=>{location.hash=mission?'#/missoes':'#/roteiros';}));host.append(box);
 }

 /* Missões na arquitetura do SIAB (Etapa 3 do plano de paridade): lista de linhas com situação, especificação em coluna de
    leitura antes de montar e, na Oficina, o painel da missão com problema, objetivo e regras, evidência acompanhada ao vivo,
    conclusão escrita pelo estudante (guardada na sessão) e retorno. O critério científico continua sendo o de route-session. */
 const toolNames=ids=>ids.map(x=>labels[x]||x).join(', ');
 // Rótulo curto da evidência que route-session.ready() confere para cada critério (não cria critério novo).
 const evidenceLabels={crystalline:'Montagem organizada na estrutura de referência do metal',neighbors:'Um centro metálico selecionado, com a vizinhança imediata em destaque','electrons-motion':'Distribuição eletrônica visível, com movimento (ou a representação estática equivalente)','property-field':'Condutividade elétrica iniciada e campo aplicado no modelo coletivo','measure-a':'Uma medida válida do parâmetro a registrada','packing-factor':'Fator de empacotamento calculado a partir dos registros de volume e raio'};
 const moduleName=m=>({explorar:'Explorar',medir:'Medir',calcular:'Calcular'})[m]||m;
 const missionState=(doc,r)=>session.context()?.id===r.id?(session.context().status==='completed'?'Concluído':'Em andamento'):doc.completed[r.id]===r.version?'Concluído':doc.attempts[r.id]?'Em andamento':'Não realizado';
 let missionKey='',lastMission=null;
 window.addEventListener('si-route-changed',event=>{if(event.detail!=='missoes'){missionKey='';lastMission=null;}});
 function missionCatalogue(){
  const host=$('silm-mission-catalog'),head=$('silm-missions-head'),doc=session.snapshot(),id=new URLSearchParams(location.hash.split('?')[1]||'').get('item'),r=S.missions.get(id);
  const key=(r?r.id:'lista')+'|'+S.missions.registry.map(m=>missionState(doc,m)).join(',')+'|'+(session.context()?.id||'');
  if(key===missionKey&&host.childElementCount)return;const previous=missionKey.split('|')[0];missionKey=key;host.replaceChildren();head.hidden=!!r;
  if(id&&!r)say('Missão não encontrada. Escolha uma missão da lista.','warning');
  if(!r){
   const list=N('div');list.className='silm-content-list';
   for(const item of S.missions.registry){const row=N('a');row.className='silm-content-row';row.href=url(item.id);row.id='mission-card-'+item.id;
    const text=N('span');text.append(N('strong',item.title),N('small',item.subtitle+'. '+moduleName(item.module)+' · '+item.concept+'.'));
    const status=N('span',missionState(doc,item));status.className='silm-row-status';row.append(text,status);list.append(row);}
   host.append(list);if(lastMission){const back=$('mission-card-'+lastMission);lastMission=null;if(back)requestAnimationFrame(()=>back.focus());}return;}
  const article=N('article');article.className='silm-reading';article.setAttribute('aria-labelledby','mission-title');
  const eyebrow=N('p','MISSÃO · '+missionState(doc,r));eyebrow.className='eyebrow';const title=N('h1',r.title);title.id='mission-title';title.tabIndex=-1;
  const lead=N('p',r.subtitle+'.');lead.className='silm-lead';article.append(eyebrow,title,lead,N('h2','O problema'),N('p',r.description));
  const rules=N('ul');for(const item of ['Módulo fixo: '+moduleName(r.module)+'.','Recursos liberados: '+toolNames(r.allowedTools)+'.',...r.prerequisites,'A missão é concluída quando o critério científico é atendido na Oficina; sua conclusão escrita vai para o Caderno.'])rules.append(N('li',item));
  article.append(N('h2','Objetivo e regras'),rules);
  const selection=N('select');selection.id='mission-metal';for(const z of r.metalSelection.atomicNumbers){const e=S.data.get(z),o=N('option',e.name+' ('+e.symbol+')');o.value=z;selection.append(o);}
  selection.value=r.metalSelection.atomicNumbers.includes(29)?'29':String(r.metalSelection.atomicNumbers[0]);if(session.context()?.id===r.id){selection.value=String(model.state.metal.atomicNumber);selection.disabled=true;}
  const field=N('div');field.className='silm-field';const label=N('label','Metal da investigação');label.htmlFor=selection.id;field.append(label,selection);article.append(field);
  const actions=N('div');actions.className='silm-actions';
  if(session.open()){const b=button('Retomar na oficina',()=>{location.hash='#/ambiente';},'mission-resume');b.classList.replace('outline','primary');actions.append(b);}
  else{const start=button(doc.completed[r.id]?'Refazer missão':'Iniciar missão',async()=>{if(!await B.confirmDialog({title:'Iniciar missão?',description:'Sua investigação livre será guardada e restaurada ao encerrar a missão.',confirmText:'Montar'}))return;enter(r,Number(selection.value),false);},'mission-mount');start.classList.replace('outline','primary');
   if(doc.attempts[r.id])actions.append(button('Retomar investigação',()=>enter(r,doc.attempts[r.id].checkpoint.metal.atomicNumber,true),'mission-resume'));actions.append(start);}
  article.append(actions);
  if(!session.open()){const related=S.themes.registry.filter(t=>t.relatedMissions.includes(r.id));if(related.length){const box=N('section');box.className='silm-related';box.append(N('h2','Conteúdo relacionado'));const row=N('div');row.className='silm-related-row';row.append(N('span',related.length===1?'Tema relacionado':'Temas relacionados'));for(const t of related){const a=N('a',t.title);a.className='button outline';a.href='#/aprender?tema='+t.id;row.append(a);}box.append(row);article.append(box);}}
  const sources=N('details');sources.append(N('summary','Fontes'));for(const sid of r.sources){const src=S.data.source(sid);sources.append(N('p',src.institution+' — '+src.title));}article.append(sources);
  if(!session.open()){const back=N('a','Todas as missões');back.className='button outline';back.href='#/missoes';back.id='mission-back';article.append(back);}
  host.append(article);lastMission=r.id;if(previous!==r.id)requestAnimationFrame(()=>{window.scrollTo(0,0);title.focus({preventScroll:true});});
 }
 let conclusionField=null,conclusionFor='';
 function missionPanel(host,c,r){
  const done=c.status==='completed',ready=session.ready();
  const eyebrow=N('p','MISSÃO · '+(done?'Concluído':'Em andamento'));eyebrow.className='eyebrow';
  host.append(eyebrow,N('h3',r.title),N('h4','O problema'),N('p',r.description),N('h4','Objetivo e regras'),N('p','Módulo fixo: '+moduleName(r.module)+'. Recursos liberados: '+toolNames(r.allowedTools)+'. Registre a evidência na Oficina e escreva uma conclusão.'));
  const evidence=N('ul');evidence.className='silm-evidence';const item=N('li');item.dataset.objective=r.completionCriteria;item.dataset.met=String(done||ready);
  const state=N('strong',done||ready?'Atendida':'Pendente');item.append(N('span',evidenceLabels[r.completionCriteria]||r.guidance.criterion),state);evidence.append(item);host.append(N('h4','Evidência'),evidence);
  const hint=N('details');hint.append(N('summary','Dica para investigar'),N('p',r.guidance.hint));host.append(hint);
  // O campo de conclusão é o mesmo nó entre redesenhos: digitar nunca perde o foco nem o cursor.
  if(!conclusionField||conclusionFor!==c.id){conclusionFor=c.id;conclusionField=N('textarea');conclusionField.id='mission-conclusion';conclusionField.rows=4;conclusionField.maxLength=6000;
   conclusionField.addEventListener('input',()=>{if(!session.edit('conclusion',conclusionField.value))say('Não foi possível guardar a conclusão nesta sessão.','warning');});}
  const saved=session.report()?.report?.conclusion||'';if(document.activeElement!==conclusionField)conclusionField.value=saved;conclusionField.disabled=done;
  const label=N('label','Conclusão');label.htmlFor='mission-conclusion';const field=N('div');field.className='silm-field';field.append(label,conclusionField);host.append(field);
  const feedback=N('p',done?'Concluído. A conclusão foi registrada no Caderno.':ready?'Critério atendido. Revise sua conclusão e conclua a missão.':'Ainda falta a evidência. Use os recursos liberados na Oficina.');feedback.id='mission-feedback';feedback.setAttribute('role','status');host.append(feedback);
  const actions=N('div');actions.className='silm-actions';
  if(done)actions.append(N('strong','Concluído'));else{const b=button('Concluir missão',complete,'mission-complete');b.classList.replace('outline','primary');b.disabled=!ready;actions.append(b);}
  actions.append(button('Encerrar missão',async()=>{if(await B.confirmDialog({title:'Encerrar atividade?',description:'A investigação livre será restaurada. Uma tentativa ainda não concluída ficará disponível para retomada.',confirmText:'Encerrar'}))close();},'mission-close'));
  host.append(actions);
 }
 const labels={structure:'Estrutura cristalina',unitCell:'Célula unitária',neighbors:'Vizinhança',electrons:'Elétrons deslocalizados',malleability:'Maleabilidade',distance:'Distância',latticeParameter:'Parâmetro de rede',coordination:'Coordenação',electrical:'Condutividade elétrica',radius:'Raio do modelo',packingFactor:'Fator de empacotamento',cellVolume:'Volume da célula',effectiveAtoms:'Contagem geométrica de átomos'};
 function guidance(){const c=session.context(),host=$('silm-route-guidance');host.replaceChildren();if(!c)return;const r=session.route();if(isMission()){missionPanel(host,c,r);return;}host.append(N('h3',r.title),N('p','Módulo fixo: '+r.module));for(const [title,text]of (isMission()?[['Objetivo',r.description],['Critério de conclusão',r.guidance.criterion]]:[['Objetivo',r.objectives.join(' ')],['O que observar/fazer',r.guidance.action],['Pistas',r.guidance.hint],['Critério de conclusão',r.guidance.criterion]])){host.append(N('h4',title),N('p',text));}
  if(c.status==='completed'){host.append(N('strong','Concluído'));if(!isMission())host.append(button('Abrir relatório',()=>{location.hash='#/relatorios?roteiro='+r.id;},'route-report'));}
  else{const b=button(isMission()?'Concluir missão':'Concluir roteiro',complete,prefix()+'-complete');b.disabled=!session.ready();host.append(b);}
  host.append(button(isMission()?'Encerrar missão':'Encerrar atividade',async()=>{if(await B.confirmDialog({title:'Encerrar atividade?',description:'A investigação livre será restaurada. Uma tentativa ainda não concluída ficará disponível para retomada.',confirmText:'Encerrar'}))close();},prefix()+'-close'));
 }
 function report(){const host=$('silm-route-report');host.replaceChildren();const params=new URLSearchParams(location.hash.split('?')[1]||''),archiveKey=params.get('arquivo'),archived=archiveKey?unified.archivedReport(archiveKey):null,id=params.get('roteiro')||session.context()?.id,record=archived?.record||session.report(id)||(!id&&!archiveKey?unified.freeReport():null);if(!record){host.append(N('p','Conclua um roteiro para abrir seu relatório.'));return;}const r=registry.get(record.activityContext.id)||{id:'laboratorio',title:archived?.title||'Investigação livre',subtitle:'Registros do laboratório',module:archived?.module||record.checkpoint.module.active,sources:[]},s=record.checkpoint,e=S.data.get(s.metal.atomicNumber),editable=!archived&&(record.activityContext.type==='free'||session.context()?.id===r.id);
  host.append(N('h1','Relatório — '+r.title),N('p',r.subtitle+' · Módulo '+r.module),N('p','Metal: '+e.name+' ('+e.symbol+') · Estrutura: '+(s.structure?.crystallography?.structureType||'montagem livre')+' · Unidades: '+(s.structure?.units.length||0)));
  const structure=S.data.structure(e);for(const key of ['temperature','pressure','phase']){const d=structure?.conditions?.[key];if(d)host.append(N('p',d.display||String(d.value)));}
  for(const [key,label]of [['name','Nome'],['date','Data'],['observations','Observações'],['interpretation','Interpretação'],['conclusion','Conclusão']]){const l=N('label',label);l.htmlFor='report-'+key;const input=N(['name','date'].includes(key)?'input':'textarea');input.id=l.htmlFor;input.value=record.report[key];input.readOnly=!editable;input.maxLength=10000;const print=N('div',input.value);print.className='silm-print-value';input.addEventListener('input',()=>{if(record.activityContext.type==='free'?unified.editReport(key,input.value):session.edit(key,input.value))print.textContent=input.value;});host.append(l,input,print);}
  host.append(N('h2','Registros científicos'));
  const observations=[];if(record.evidence.cell)observations.push('Célula unitária observada');if(record.evidence.lattice)observations.push('Rede observada');if(record.evidence.deformation)observations.push('Compressão representada');if(s.electrons?.representation.visible)observations.push('Distribuição eletrônica visível');if(observations.length)host.append(N('p',observations.join(' · ')));
  for(const m of s.measurements)host.append(N('p',S.measurement.types[m.type].label+(m.parameter?' '+m.parameter:'')+': '+S.units.format(m.value,m.unit)+' · Medida do modelo · resolução '+S.units.format(m.resolution,m.unit)+' · fonte '+m.source.latticeSourceId));
  for(const c of s.calculations){host.append(N('p',S.formulas[c.formulaId].name+': '+S.calculation.format(c.result,c.unit)+' · Calculado pelo SILM'),N('p',S.formulas[c.formulaId].expression));for(const x of c.inputs)host.append(N('p',x.symbol+' = '+(Array.isArray(x.value)?x.value.join(' – '):x.value)+' '+x.unit+' · '+S.calculation.origins[x.origin]));}
  if(!s.measurements.length&&!s.calculations.length)host.append(N('p','Esta investigação registra observações qualitativas; não foram produzidas medições nem cálculos.'));
  const sources=new Set([...S.data.sourceIds(e),...r.sources,...s.calculations.flatMap(c=>c.provenance.references)]);host.append(N('h2','Fontes'));for(const id of sources){const src=S.data.source(id);if(src)host.append(N('p',src.institution+' — '+src.title+(src.url?' · '+src.url:'')));}
  const controls=N('div');controls.className='silm-report-actions';if(!archived)controls.append(button('Registrar no Caderno',()=>{const latest=record.activityContext.type==='free'?unified.freeReport():session.report(r.id),saved=unified.recordReport(latest||record,r);if(saved==='added')say('Referência do relatório registrada no Caderno.','success');else if(saved==='duplicate')say('Este relatório já está registrado no Caderno.','info');else say('Não foi possível registrar o relatório no Caderno.','warning');},'route-report-notebook'));controls.append(button('Imprimir / salvar em PDF',()=>window.print(),'route-print'),button(session.open()||record.activityContext.type==='free'?'Voltar à oficina':'Voltar aos roteiros',()=>{location.hash=session.open()||record.activityContext.type==='free'?'#/ambiente':'#/roteiros';}));host.append(controls);
 }
 function render(){
  session.observe(B.currentRoute(location.hash)==='ambiente');
  const context=session.context();document.body.classList.toggle('silm-guided',!!context);$('si-return-activity').hidden=!context;
  if(context)$('si-return-activity').href=url(context.id);
  if(B.currentRoute(location.hash)==='roteiros')catalogue();if(B.currentRoute(location.hash)==='missoes')missionCatalogue();if(B.currentRoute(location.hash)==='relatorios')report();guidance();unified.render();
  const activityTab=document.querySelector('[data-left-tab="missao"]');if(activityTab)activityTab.textContent=context?noun():'Roteiro';
  if(context){$('si-dock-activity-status').textContent=noun()+' em andamento · '+session.route().module;if(document.querySelector('[data-left-tab="missao"]').getAttribute('aria-pressed')==='true')$('si-left-title').textContent=noun();}
  const tab=document.querySelector('[data-left-tab][aria-pressed="true"]')?.dataset.leftTab;if(tab==='objetos')$('si-left-title').textContent='Unidades';
  const menu=$('si-activity-context');if(context&&menu)menu.textContent=session.route().title+' · '+(context.status==='completed'?'Concluído':'Em investigação');
  $('silm-report-link').hidden=!!context;$('silm-export-legacy').disabled=!!context;$('silm-import').disabled=!!context;$('silm-metal').disabled=!!context;for(const id of ['silm-start','silm-open-periodic',...(canBuild()?[]:['silm-add','silm-organize','silm-free','scene-clear','si-compact-clear','scene-undo'])])if(context)$(id).disabled=true;
  for(const [id,tool]of [['silm-electrons','electrons'],['silm-motion','electrons'],['silm-crystal-neighbors','neighbors']])if($(id))$(id).hidden=!session.allows(tool);
  const finish=$('si-activity-finish');if(finish){finish.querySelector('span').textContent=isMission()?'Concluir missão':'Concluir roteiro';finish.disabled=!!context&&(context.status==='completed'||!session.ready());}
 }
 /* Durante uma atividade, a navegação fica no Início (com a retomada), na Oficina, na própria atividade, nos relatórios e no Manual. */
 function guard(){if(!session.open())return;const route=B.currentRoute(location.hash),id=new URLSearchParams(location.hash.split('?')[1]||'').get('item');if(!['inicio','ambiente',isMission()?'missoes':'roteiros','relatorios','manual'].includes(route)||['roteiros','missoes'].includes(route)&&id!==session.context().id){location.replace(url(session.context().id));say('Durante '+(isMission()?'a missão':'o roteiro')+', ficam disponíveis o Início, a Oficina, o Manual e os relatórios. Encerre a atividade para abrir outras telas.');}}
 function init(){unified.init();for(const b of document.querySelectorAll('[data-left-tab]'))b.addEventListener('click',schedule);$('nav-toggle').addEventListener('click',()=>requestAnimationFrame(()=>{if(session.open()){$('si-now-description').textContent='Investigação orientada · '+session.route().module;$('si-activity-context').textContent=session.route().title+' · '+(session.context().status==='completed'?'Concluído':'Em investigação');}}));document.addEventListener('click',event=>{const a=event.target.closest('a[href]');if(session.open()&&a&&a.target!=='_blank'&&!a.getAttribute('href').startsWith('#')&&new URL(a.href).origin===location.origin){event.preventDefault();say('Encerre a atividade para abrir outra interface.','warning');}},true);const restored=session.load();if(restored){onModule(session.lockedModule());location.hash=url(session.context().id);}window.addEventListener('hashchange',guard);window.addEventListener('hashchange',schedule);window.addEventListener('si-route-changed',()=>{guard();schedule();});sync();}
 return {session,init,render,canBuild};
};
