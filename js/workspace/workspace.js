'use strict';
/* Área de trabalho da família: uma cena central e três lançadores que abrem docas flutuantes.
   O conteúdo, a disponibilidade e os rótulos vêm do domínio; o núcleo cuida de geometria, níveis, foco,
   memória por escopo e acessibilidade.

   Doca esquerda (Montagem), forma nova:  {title, icon, tabsLabel, summary:{title, render}, groups:[{id, title, heading,
     icon, editable, visible(ctx), render, help}], defaultGroup, help}
   Doca direita (Ver + Dados), forma nova: {title, heading, icon, presentation, help, families:[{id, title, icon,
     items:[{id, title, presentation, visible(ctx), render, help}]}], data:{title, heading, icon, intro, tools:[id|item],
     report:{title, text, action:{label, run}} | render}}
   As formas anteriores (sections e sources) continuam aceitas. */
SimCore.workspace=(()=>{
 const S=SimCore,$=S.$,root=document.documentElement,mobile=matchMedia('(max-width:'+S.breakpoints.mobile+'px)');
 const PRESENTATIONS=['compact','standard','wide'];
 const state={left:'collapsed',right:'collapsed',leftGroup:null,presentation:'standard',source:null,level:'tool',family:null,tool:null,lastTools:{},scope:'livre'};
 const specs={left:null,right:null},origins={},selected={},cleanups={left:[],right:[]};
 let ready=false,lastDock='right',raf=0,suspended=false,context=null,stash=null,prefs=null,activityGroup=null;
 const restoring=new Set();   // lados já restaurados desde a última limpeza
 const panel=side=>$(side==='left'?'controls':'context-panel');
 const icon=(name,cls='core-icon')=>S.icons.element(name,cls);
 const allowed=spec=>!!spec&&(!spec.visible||spec.visible(context)!==false);
 const visibleItem=x=>{try{return !x.visible||x.visible(context)!==false;}catch(error){console.error('Falha na visibilidade do painel',error);return false;}};
 const announce=text=>S.notifications.announce(text);

 /* ---------- formas de doca ---------- */
 const sources=side=>side==='right'&&Array.isArray(specs.right?.sources)&&specs.right.sources.length?specs.right.sources:null;
 const isGroups=()=>!!specs.left&&(Array.isArray(specs.left.groups)||!!specs.left.summary);
 const isFamilies=()=>!!specs.right&&(Array.isArray(specs.right.families)||!!specs.right.data);
 const legacyEffective=side=>{const list=sources(side);return list?list.find(x=>x.id===state.source)||list[0]:specs[side];};

 /* ---------- Montagem: Resumo e grupos ---------- */
 function groups(){
  if(!isGroups())return [];
  const list=(specs.left.groups||[]).filter(visibleItem);
  return activityGroup?[activityGroup]:list;
 }
 const editableGroups=()=>groups().filter(g=>g.editable!==false);
 function defaultGroup(){
  if(activityGroup)return activityGroup.id;
  const list=editableGroups(),wanted=typeof specs.left.defaultGroup==='function'?specs.left.defaultGroup(context):specs.left.defaultGroup;
  return (list.find(g=>g.id===wanted)||list[0])?.id||null;
 }
 function leftHeading(){
  const spec=specs.left,group=groups().find(g=>g.id===state.leftGroup);
  if(state.left==='expanded'&&group)return {text:group.heading||group.title,icon:group.icon||spec.icon||'setup'};
  return {text:spec.title||'Montagem',icon:spec.icon||'setup'};
 }

 /* ---------- Ver: famílias e ferramentas ---------- */
 function families(){
  if(!isFamilies())return [];
  return (specs.right.families||[]).map(f=>({...f,items:(f.items||[]).filter(visibleItem)})).filter(f=>f.items.length);
 }
 const allTools=()=>families().flatMap(f=>f.items.map(item=>({...item,family:f})));
 function dataTools(){
  const data=specs.right?.data;if(!data)return [];
  const known=allTools();
  return (data.tools||[]).map(x=>typeof x==='string'?known.find(t=>t.id===x)||null:visibleItem(x)?{...x,family:null,data:true}:null).filter(Boolean);
 }
 const hasReport=()=>{const r=specs.right?.data?.report;return !!r&&visibleItem(r);};
 const dataAvailable=()=>!!specs.right?.data&&(dataTools().length>0||hasReport());
 function findTool(id){return allTools().find(t=>t.id===id)||dataTools().find(t=>t.id===id)||null;}
 function presentationOf(tool){const p=tool?.presentation||specs.right?.presentation||'standard';return PRESENTATIONS.includes(p)?p:'standard';}

 /* ---------- persistência por escopo ---------- */
 function readPrefs(){
  const saved=S.storage.core.get('workspace',null);
  if(saved&&typeof saved==='object'&&saved.v===1)return saved;
  const legacy=S.storage.core.get('panels',null);   // 0.2.x: só aberto/fechado
  return legacy&&typeof legacy==='object'?{v:1,scope:'livre',left:legacy.left?'expanded':'collapsed',right:legacy.right?'open':'collapsed'}:{v:1};
 }
 function save(){
  if(!ready)return;
  const presentation=state.presentation==='fullscreen'?presentationOf(findTool(state.tool)):state.presentation;
  prefs={v:1,scope:state.scope,left:state.left,leftGroup:state.leftGroup,right:state.right,source:state.source,tool:state.tool,lastTools:{...state.lastTools},presentation};
  S.storage.core.set('workspace',prefs);
 }
 function restoreSide(side){
  const p=prefs||{},valid=p.scope===state.scope;
  if(side==='left'){state.left=valid&&['compact','expanded','open'].includes(p.left)?p.left:'collapsed';state.leftGroup=valid?p.leftGroup||null:null;}
  else{state.right=valid&&p.right==='open'?'open':'collapsed';state.lastTools=valid&&p.lastTools&&typeof p.lastTools==='object'?{...p.lastTools}:{};
   if(valid&&typeof p.tool==='string')state.tool=p.tool;if(valid&&['ver','dados'].includes(p.source))state.source=p.source;}
  if(document.body.classList.contains('projector'))state[side]='collapsed';
  if((mobile.matches||innerWidth<S.breakpoints.dualPanels)&&state.left!=='collapsed'&&state.right!=='collapsed')state.left='collapsed';
 }
 function restoreScope(){restoreSide('left');restoreSide('right');}

 /* ---------- renderização ---------- */
 function release(side){for(const fn of cleanups[side]||[])try{fn();}catch(error){console.error('Falha ao limpar painel',error);}cleanups[side]=[];}
 const mount=(side,fn,host)=>{const cleanup=fn?.(host);if(typeof cleanup==='function')cleanups[side].push(cleanup);};
 function headerTitle(side,text,symbol){
  const h=$('title-'+side);h.replaceChildren();if(symbol)h.append(icon(symbol));h.append(document.createTextNode(text));
 }
 function helpLink(side,help){
  const slot=$('help-'+side);if(!slot)return;slot.replaceChildren();
  if(help?.topic){const subject=help.subject||String(help.label||'').replace(/^Ajuda:\s*/,'')||$('title-'+side).textContent;slot.append(S.ExperienceUI.helpLink(help.topic,subject));}
  slot.hidden=!slot.children.length;
 }
 function launcher(id,label,symbol){
  const b=$(id);if(!b)return;b.replaceChildren(icon(symbol),Object.assign(document.createElement('span'),{textContent:label}));
  b.setAttribute('aria-label',label);b.title=label;
 }
 function renderLegacy(side){
  const spec=legacyEffective(side),host=$('dock-'+side+'-content'),tabs=$('dock-'+side+'-tabs');
  const title=spec?.title||(side==='left'?'Ferramentas':'Informações');headerTitle(side,title,null);
  launcher('workspace-'+side,title,side==='left'?'setup':'view');
  if(side==='right'){const list=sources('right'),alt=$('workspace-right-alt');alt.hidden=!list||list.length<2;if(list){launcher('workspace-right',list[0].title,'view');if(list[1])launcher('workspace-right-alt',list[1].title,'data');}}
  $('close-'+side).setAttribute('aria-label','Fechar '+title);
  const key=side+':'+(side==='right'&&state.source?state.source:'');
  if(!spec){const p=document.createElement('p');p.className='panel-empty';p.textContent='Nenhum conteúdo disponível neste contexto.';host.append(p);return;}
  helpLink(side,spec.help);
  if(spec.sections?.length){
   const available=spec.sections.filter(visibleItem),active=available.find(x=>x.id===selected[key])||available[0];selected[key]=active?.id;tabs.hidden=available.length<2;
   for(const section of available){const b=document.createElement('button');b.type='button';b.className='secondary-btn';b.textContent=section.title;b.setAttribute('aria-pressed',String(section===active));b.setAttribute('aria-controls',host.id);
    b.addEventListener('click',()=>{selected[key]=section.id;render(side);tabs.querySelector('[aria-pressed=true]')?.focus();});tabs.append(b);}
   mount(side,active?.render,host);
  }else mount(side,spec.render,host);
 }
 function renderLeft(){
  const spec=specs.left,host=$('dock-left-content'),tabs=$('dock-left-tabs'),list=groups(),editable=editableGroups();
  if(state.left==='expanded'&&!editable.length)state.left=spec.summary?'compact':'expanded';
  if(!list.some(g=>g.id===state.leftGroup))state.leftGroup=defaultGroup();
  tabs.setAttribute('aria-label',spec.tabsLabel||'Seções de '+(spec.title||'Montagem'));
  const entries=[...(spec.summary?[{id:'resumo',title:spec.summary.title||'Resumo'}]:[]),...list];
  for(const g of entries){
   const b=document.createElement('button');b.type='button';b.className='secondary-btn dock-button';b.id='dock-left-'+g.id;b.dataset.dockGroup=g.id;b.textContent=g.title;b.setAttribute('aria-controls','dock-left-content');
   b.setAttribute('aria-pressed',String(g.id==='resumo'?state.left==='compact':state.left==='expanded'&&state.leftGroup===g.id));
   b.addEventListener('click',()=>{state.left=g.id==='resumo'?'compact':'expanded';if(g.id!=='resumo')state.leftGroup=g.id;render('left');apply();save();$('dock-left-'+g.id)?.focus({preventScroll:true});});
   tabs.append(b);
  }
  tabs.hidden=!editable.length||entries.length<2;
  const heading=leftHeading();headerTitle('left',heading.text,heading.icon);
  launcher('workspace-left',spec.title||'Montagem',spec.icon||'setup');
  $('close-left').setAttribute('aria-label','Fechar '+(spec.title||'Montagem'));
  const group=list.find(g=>g.id===state.leftGroup);
  helpLink('left',state.left==='expanded'?group?.help||spec.help:spec.summary?.help||spec.help);
  host.dataset.dockState=state.left;
  if(state.left==='compact'||!group)mount('left',spec.summary?.render,host);else mount('left',group.render,host);
 }
 function tablist(label,buttons,cls){const l=document.createElement('div');l.className=cls;l.setAttribute('role','tablist');l.setAttribute('aria-label',label);l.append(...buttons);return l;}
 function tab(id,text,selectedTab,controls,data,symbol){
  const b=document.createElement('button');b.type='button';b.className='tab-btn';b.id=id;b.setAttribute('role','tab');b.setAttribute('aria-selected',String(selectedTab));b.tabIndex=selectedTab?0:-1;b.setAttribute('aria-controls',controls);
  Object.assign(b.dataset,data);if(symbol)b.append(icon(symbol));b.append(document.createTextNode(text));return b;
 }
 function renderRight(){
  const spec=specs.right,host=$('dock-right-content');
  const fams=families(),tools=allTools(),data=spec.data,dtools=dataTools(),inData=state.source==='dados';
  // seleção atual: ferramenta lembrada, senão a primeira
  let current=findTool(state.tool);
  if(!current||(!inData&&current.data))current=tools.find(t=>t.id===state.tool)||tools[0]||null;
  if(inData&&state.level!=='data'&&!current)state.level='data';
  state.tool=current?.id||null;state.family=current?.family?.id||null;
  if(state.presentation!=='fullscreen')state.presentation=presentationOf(current);
  launcher('workspace-right',spec.title||'Ver',spec.icon||'view');
  if(data)launcher('workspace-right-alt',data.title||'Dados',data.icon||'data');
  $('workspace-right').hidden=!fams.length||!allowed(spec);
  $('workspace-right-alt').hidden=!data||!dataAvailable();
  // cabeçalho
  const family=current?.family,level=state.level;
  const title=level==='data'?data?.heading||'Dados da investigação':mobile.matches&&level==='tool'&&current?current.title:spec.heading||'Investigar';
  headerTitle('right',title,level==='data'?data?.icon||'data':mobile.matches&&level==='tool'&&current?null:spec.icon||'view');
  $('close-right').setAttribute('aria-label',level==='data'?'Fechar '+(data?.title||'Dados'):'Fechar '+(spec.closeLabel||'investigação'));
  const back=$('dock-back');back.replaceChildren(icon('back'),document.createTextNode(inData?data?.title||'Dados':level==='tool'?family?.title||spec.title||'Ver':spec.title||'Ver'));
  let hideBack=level==='data'||(!inData&&!mobile.matches)||(!inData&&level==='families');
  if(!inData&&(tools.length===1||(fams.length===1&&level==='tools')))hideBack=true;
  back.hidden=hideBack;
  helpLink('right',level==='data'?data?.help:current?.help||spec.help);
  $('dock-expand').hidden=mobile.matches||level==='data';
  // menu de Dados
  const menu=document.createElement('div');menu.className='dock-data-menu';menu.id='dock-data-menu';menu.hidden=level!=='data';
  if(data){
   if(data.intro){const p=document.createElement('p');p.className='field-hint';p.textContent=data.intro;menu.append(p);}
   for(const t of dtools){const b=document.createElement('button');b.type='button';b.className='secondary-btn dock-button';b.id='dock-data-'+t.id;b.dataset.dockTool=t.id;b.append(icon(t.icon||'data'),document.createTextNode(t.title));menu.append(b);}
   if(hasReport()){const r=data.report,sec=document.createElement('section');sec.className='dock-report';sec.id='dock-data-report';
    if(typeof r.render==='function')mount('right',r.render,sec);
    else{const h=document.createElement('h3');h.textContent=r.title||'Relatório';sec.append(h);if(r.text){const p=document.createElement('p');p.textContent=r.text;sec.append(p);}
     if(r.action){const b=document.createElement('button');b.type='button';b.className='secondary-btn';b.id='dock-data-report-open';b.textContent=r.action.label||'Abrir relatório';b.addEventListener('click',()=>r.action.run?.(context));sec.append(b);}}
    menu.append(sec);}
  }
  // famílias e ferramentas
  const tabsHost=document.createElement('div');tabsHost.className='ver-tabs';tabsHost.id='ver-tabs';tabsHost.hidden=level==='data'||(inData&&!!current?.data);
  if(current&&!current.data){
   const famTools=family.items,single=fams.length===1&&famTools.length===1;
   if(single){const p=document.createElement('p');p.className='ver-single';p.id='tab-'+current.id;p.textContent=family.title.toLocaleUpperCase('pt-BR')+' · '+current.title;tabsHost.append(p);}
   else{
    if(fams.length>1)tabsHost.append(tablist(spec.familiesLabel||'Famílias do painel',fams.map(f=>tab('family-'+f.id,f.title.toLocaleUpperCase('pt-BR'),f.id===family.id,'ver-subpanel',{verFamily:f.id},f.icon||f.id)),'ver-family-tabs'));
    else{const e=document.createElement('p');e.className='eyebrow ver-family-eyebrow';e.textContent=family.title.toLocaleUpperCase('pt-BR');tabsHost.append(e);}
    const sub=document.createElement('div');sub.id='ver-subpanel';if(fams.length>1){sub.setAttribute('role','tabpanel');sub.setAttribute('aria-labelledby','family-'+family.id);}
    sub.append(tablist(family.title,famTools.map(t=>tab('tab-'+t.id,t.title,t.id===current.id,'ver-conteudo',{ver:t.id})),'ver-item-tabs'));tabsHost.append(sub);
   }
  }
  const content=document.createElement('div');content.className='ver-conteudo';content.id='ver-conteudo';content.tabIndex=0;content.setAttribute('role','tabpanel');content.hidden=level==='data';
  if(current)content.setAttribute('aria-labelledby',current.data?'dock-data-'+current.id:'tab-'+current.id);
  host.append(menu,tabsHost,content);
  if(level!=='data'&&current)mount('right',current.render,content);
  else if(level!=='data'){const p=document.createElement('p');p.className='panel-empty';p.textContent=spec.empty||'Nenhuma ferramenta disponível neste contexto.';content.append(p);}
  panel('right').dataset.level=level;panel('right').dataset.source=inData?'dados':'ver';
 }
 function render(side){
  release(side);const host=$('dock-'+side+'-content'),tabs=$('dock-'+side+'-tabs');
  const focus=document.activeElement,keep=focus?.closest?.('#'+panel(side).id)?{id:focus.id,data:{...focus.dataset}}:null;
  host.replaceChildren();tabs.replaceChildren();tabs.hidden=true;
  if(side==='left'&&isGroups())renderLeft();else if(side==='right'&&isFamilies())renderRight();else renderLegacy(side);
  if(keep&&!panel(side).contains(document.activeElement)){const target=(keep.id&&$(keep.id))||[...panel(side).querySelectorAll('button')].find(b=>Object.keys(keep.data).length&&Object.entries(keep.data).every(([k,v])=>b.dataset[k]===v));target?.focus({preventScroll:true});}
 }

 /* ---------- geometria e estado visual ---------- */
 function geometry(){
  if(!ready)return;const vv=window.visualViewport,height=vv?.height||innerHeight,top=vv?.offsetTop||0;
  root.style.setProperty('--workspace-visible-height',height+'px');root.style.setProperty('--sheet-top',Math.round(top+Math.max(8,height*.1))+'px');root.style.setProperty('--sheet-height',Math.round(height-Math.max(8,height*.1)-8)+'px');
  for(const side of ['left','right'])$('workspace').style.setProperty('--dock-'+side+'-inset',(!mobile.matches&&state[side]!=='collapsed'&&!(side==='right'&&state.presentation==='fullscreen')?panel(side).getBoundingClientRect().width+20:0)+'px');
 }
 function apply(){
  if(!ready)return;const ws=$('workspace'),visible=!ws.hidden&&!suspended;
  root.dataset.workspaceSize=mobile.matches?'compact':innerWidth<S.breakpoints.dualPanels?'medium':'expanded';
  for(const side of ['left','right']){
   const el=panel(side),open=visible&&state[side]!=='collapsed';el.classList.toggle('dock-collapsed',!open);el.classList.toggle('bottom-sheet',mobile.matches);el.inert=!open;el.setAttribute('aria-hidden',String(!open));el.setAttribute('role',mobile.matches&&open?'dialog':'region');
   if(mobile.matches&&open)el.setAttribute('aria-modal','true');else el.removeAttribute('aria-modal');
  }
  const list=sources('right'),inData=state.source==='dados';
  const rightOpen=visible&&state.right!=='collapsed';
  $('workspace-left').setAttribute('aria-expanded',String(visible&&state.left!=='collapsed'));
  $('workspace-right').setAttribute('aria-expanded',String(rightOpen&&(isFamilies()?!inData:!list||state.source===list[0].id)));
  $('workspace-right-alt').setAttribute('aria-expanded',String(rightOpen&&(isFamilies()?inData:!!list&&state.source===list[1]?.id)));
  panel('right').dataset.presentation=state.presentation;panel('left').dataset.dockState=state.left;
  ws.dataset.leftOpen=String(state.left!=='collapsed');ws.dataset.rightOpen=String(state.right!=='collapsed');ws.dataset.rightPresentation=state.presentation;ws.dataset.rightSource=inData?'dados':'ver';
  ws.dataset.leftGroup=state.left==='expanded'?state.leftGroup||'':state.left==='compact'?'resumo':'';
  ws.dataset.activeTool=rightOpen&&state.level==='tool'&&isFamilies()?state.tool||'':'';
  const sheet=visible&&mobile.matches&&(state.left!=='collapsed'||state.right!=='collapsed'),full=visible&&!mobile.matches&&state.right!=='collapsed'&&state.presentation==='fullscreen';
  $('sheet-backdrop').hidden=!sheet;document.body.classList.toggle('sheet-open',sheet);$('scientific-stage').inert=sheet||full;$('workspace-launchers').inert=sheet||full;
  const actions=$('workspace-actions');if(actions)actions.inert=sheet||full;
  document.querySelector('.app-header').inert=sheet;ws.classList.toggle('dock-fullscreen',full);panel('left').inert=panel('left').inert||full;
  $('bottom-nav').inert=sheet;$('activity-banner').inert=sheet;
  const expand=$('dock-expand');expand.replaceChildren(icon(full?'collapse':'expand'),document.createTextNode(full?'Restaurar':'Expandir'));expand.setAttribute('aria-expanded',String(full));
  geometry();
 }

 /* ---------- abrir, fechar, selecionar ---------- */
 function close(side=lastDock,restore=true){
  if(!['left','right'].includes(side))return;const was=state[side]!=='collapsed';state[side]='collapsed';
  if(side==='right'&&state.presentation==='fullscreen')state.presentation=presentationOf(findTool(state.tool));
  apply();save();
  if(restore){const target=origins[side];(target?.isConnected&&target.getClientRects().length&&!target.closest('[inert],[hidden],.dock')?target:$(side==='left'?'workspace-left':state.source==='dados'?'workspace-right-alt':'workspace-right')).focus({preventScroll:true});}
  if(was)S.emit('panel:closed',{side});
 }
 function landingLevel(){const fams=families(),tools=allTools();if(tools.length===1)return 'tool';if(!mobile.matches)return 'tool';return fams.length===1?'tools':'families';}
 function open(side,trigger=document.activeElement,option=null){
  if(!ready||!['left','right'].includes(side)||$('workspace').hidden||suspended)return;if(specs[side]&&!allowed(specs[side]))return;
  if(side==='right'&&isFamilies()&&option!=='dados'&&!families().length&&!findTool(option))return;
  origins[side]=trigger;lastDock=side;
  const other=side==='left'?'right':'left';
  if(side==='right'&&isFamilies()){
   if(option==='dados'){state.source='dados';state.level='data';}
   else{state.source='ver';state.level=landingLevel();if(option&&findTool(option)){selectTool(option,{silent:true});state.level='tool';if(findTool(option).data)state.source='dados';}}
   if(state.presentation==='fullscreen')state.presentation=presentationOf(findTool(state.tool));
   if(state.presentation!=='fullscreen')state.presentation=presentationOf(findTool(state.tool));
   render('right');
  }else if(side==='right'&&option&&sources('right')?.some(x=>x.id===option)&&state.source!==option){state.source=option;state.presentation=legacyEffective('right')?.presentation||'standard';render('right');}
  if(side==='left'&&isGroups()){
   const editable=editableGroups();
   if(option==='resumo'||!editable.length)state.left=specs.left.summary?'compact':'expanded';
   else{state.left='expanded';state.leftGroup=groups().some(g=>g.id===option)?option:defaultGroup();}
   render('left');
  }
  if(mobile.matches||innerWidth<S.breakpoints.dualPanels||(side==='right'&&['wide','fullscreen'].includes(state.presentation)))close(other,false);
  if(side==='left'&&state.presentation==='fullscreen')state.presentation=presentationOf(findTool(state.tool));
  if(side==='left'&&state.left==='collapsed')state.left=isGroups()?'expanded':'open';
  if(side==='right')state.right='open';
  apply();save();$('close-'+side).focus({preventScroll:true});
  announce(side==='left'?(specs.left?.title||'Montagem')+': painel aberto.':state.source==='dados'&&isFamilies()?(specs.right?.data?.title||'Dados')+': painel aberto.':(isFamilies()?specs.right?.heading||'Investigação':$('title-right').textContent)+': painel aberto.');
  S.emit('panel:opened',{side,source:state.source});
 }
 /* Seleciona uma ferramenta (Ver ou Dados), lembrando a última de cada família. */
 function selectTool(id,{silent=false,focus=true}={}){
  const tool=findTool(id);if(!tool)return false;
  state.tool=tool.id;if(tool.family){state.family=tool.family.id;state.lastTools[tool.family.id]=tool.id;}
  state.presentation=presentationOf(tool);
  if(!silent){
   if(mobile.matches||state.source==='dados')state.level='tool';
   if(state.presentation==='wide'&&state.left!=='collapsed')state.left='collapsed';
   render('right');apply();save();
   if(focus){if(mobile.matches){const back=$('dock-back');(!back.hidden?back:$('close-right')).focus({preventScroll:true});}else $('tab-'+tool.id)?.focus({preventScroll:true});}
   announce('Ferramenta selecionada: '+tool.title+'.');S.emit('panel:tool',{tool:tool.id,family:tool.family?.id||null});
  }
  return true;
 }
 function selectFamily(id){
  const fam=families().find(f=>f.id===id);if(!fam)return false;
  const previous=fam.items.find(t=>t.id===state.lastTools[fam.id])||fam.items[0];
  state.tool=previous.id;state.family=fam.id;state.presentation=presentationOf(previous);
  if(mobile.matches)state.level=fam.items.length>1?'tools':'tool';
  if(state.presentation==='wide'&&state.left!=='collapsed')state.left='collapsed';
  render('right');apply();save();
  if(mobile.matches&&state.level==='tools')$('ver-subpanel')?.querySelector('[aria-selected="true"]')?.focus({preventScroll:true});
  else if(mobile.matches){const back=$('dock-back');(!back.hidden?back:$('close-right')).focus({preventScroll:true});}
  else $('family-'+fam.id)?.focus({preventScroll:true});
  announce('Ferramenta selecionada: '+previous.title+'.');S.emit('panel:tool',{tool:previous.id,family:fam.id});return true;
 }
 function back(){
  state.level=state.source==='dados'?'data':state.level==='tool'?(families().find(f=>f.id===state.family)?.items.length>1?'tools':'families'):'families';
  render('right');apply();
  const target=state.level==='data'?$('dock-data-menu')?.querySelector('button:not([hidden])'):state.level==='tools'?$('ver-subpanel')?.querySelector('[aria-selected="true"]'):$('ver-tabs')?.querySelector('[data-ver-family][aria-selected="true"]');
  (target||$('close-right')).focus({preventScroll:true});
 }
 function refresh(){if(!ready||raf)return;raf=requestAnimationFrame(()=>{raf=0;
  if(mobile.matches||innerWidth<S.breakpoints.dualPanels){if(state.left!=='collapsed'&&state.right!=='collapsed')close(lastDock==='left'?'right':'left',false);}
  if(isFamilies()&&state.right!=='collapsed'){const level=state.level;if(!mobile.matches&&['families','tools'].includes(level))state.level='tool';if(level!==state.level)render('right');}
  apply();
  if(mobile.matches&&document.activeElement?.matches('input,textarea,select')&&document.activeElement.closest('.dock'))document.activeElement.scrollIntoView({block:'nearest'});
  if(mobile.matches&&state[lastDock]!=='collapsed'&&!panel(lastDock).contains(document.activeElement)&&!document.querySelector('dialog[open]'))$('close-'+lastDock).focus();});}
 function set(side,spec){
  if(!['left','right'].includes(side))throw new TypeError('Painel inválido');
  if(spec?.presentation&&!PRESENTATIONS.includes(spec.presentation))throw new TypeError('Apresentação inválida');
  for(const f of spec?.families||[])for(const t of f.items||[])if(t.presentation&&!PRESENTATIONS.includes(t.presentation))throw new TypeError('Apresentação inválida: '+t.id);
  specs[side]=spec;for(const k of Object.keys(selected))if(k.startsWith(side+':'))delete selected[k];
  if(side==='right'){
   if(isFamilies()){if(!['ver','dados'].includes(state.source))state.source='ver';if(state.source==='dados'&&!dataAvailable())state.source='ver';state.level=state.source==='dados'?'data':landingLevel();}
   else{state.source=sources('right')?.[0]?.id||null;state.presentation=legacyEffective('right')?.presentation||'standard';}
  }
  if(side==='left'&&!isGroups()&&['compact','expanded'].includes(state.left))state.left='open';
  if(side==='left'&&isGroups()&&state.left==='open')state.left='expanded';
  if(spec&&ready&&!restoring.has(side)){restoring.add(side);restoreSide(side);if(side==='left'&&isGroups()&&state.left==='open')state.left='expanded';if(side==='left'&&!isGroups()&&['compact','expanded'].includes(state.left))state.left='open';}
  render(side);$('workspace-'+side).hidden=!!spec&&!allowed(spec);
  if(side==='right'&&!isFamilies())$('workspace-right-alt').hidden=!(sources('right')?.length>1);
  if(spec&&!allowed(spec))close(side,false);
  if(!spec&&side==='right')$('workspace-right-alt').hidden=true;
  apply();
 }

 /* ---------- barra superior: vistas da cena e rótulo do modo ---------- */
 const views={list:[],current:null,onChange:null};
 function renderViews(){
  const nav=$('workspace-views');if(!nav)return;nav.replaceChildren();
  for(const v of views.list){
   const b=document.createElement('button');b.type='button';b.className='secondary-btn view-tab-btn';b.id='workspace-view-'+v.id;b.dataset.view=v.id;
   const count=typeof v.count==='function'?v.count(context):null;b.textContent=v.label+(count!=null&&count!==''?' '+count:'');
   b.setAttribute('aria-pressed',String(v.id===views.current));b.disabled=typeof v.disabled==='function'?!!v.disabled(context):!!v.disabled;
   b.addEventListener('click',()=>{if(views.current===v.id)return;views.current=v.id;renderViews();try{views.onChange?.(v.id);}catch(error){console.error('Falha ao trocar a vista',error);}$('workspace-view-'+v.id)?.focus({preventScroll:true});});
   nav.append(b);
  }
  nav.hidden=!views.list.length;if(views.label)nav.setAttribute('aria-label',views.label);
 }
 function setViews(list,{current=null,onChange=null,label=null}={}){
  if(!Array.isArray(list))throw new TypeError('Vistas inválidas');
  views.list=list.filter(v=>v&&/^[a-z][a-z0-9-]{0,63}$/.test(v.id)&&v.label).map(v=>({...v,label:String(v.label)}));
  views.current=views.list.some(v=>v.id===current)?current:views.list[0]?.id||null;views.onChange=onChange;views.label=label;renderViews();
 }
 function setStatus(text){const el=$('module-status');if(el){el.textContent=String(text||'');el.hidden=!text;}}

 /* ---------- barra de ações sob a cena ---------- */
 const actions={list:[],label:'Ações da investigação',undo:null};
 function renderActions(){
  const bar=$('workspace-actions');if(!bar)return;bar.replaceChildren();bar.setAttribute('aria-label',actions.label);
  for(const a of actions.list){
   if(a.builtin==='undo'){const u=actions.undo,b=document.createElement('button');b.type='button';b.className='secondary-btn workspace-undo';b.id='workspace-undo';b.setAttribute('aria-label','Desfazer última ação');
    b.append(document.createTextNode('↶ '),Object.assign(document.createElement('span'),{textContent:'Desfazer'}));
    const label=u?.label||'';b.disabled=!u?.canUndo;b.title=u?.canUndo?'Desfazer: '+label:'Nada para desfazer';
    b.addEventListener('click',()=>u?.undo());bar.append(b);continue;}
   if(typeof a.visible==='function'&&a.visible(context)===false)continue;
   const b=document.createElement('button');b.type='button';b.className=a.primary?'primary-btn':'secondary-btn';b.id='workspace-action-'+a.id;
   if(a.icon)b.append(icon(a.icon));b.append(document.createTextNode(a.label));if(a.description)b.title=a.description;
   b.disabled=typeof a.disabled==='function'?!!a.disabled(context):!!a.disabled;if(a.pressed)b.setAttribute('aria-pressed',String(!!a.pressed(context)));
   b.addEventListener('click',async()=>{b.disabled=true;try{await a.run?.(context);}catch(error){console.error('Falha na ação',error);S.notifications.show('Não foi possível concluir esta ação.',{type:'error'});}finally{renderActions();}});
   bar.append(b);
  }
  bar.hidden=!bar.children.length;geometry();
 }
 function setActions(list,{label=null}={}){
  if(!Array.isArray(list))throw new TypeError('Ações inválidas');const ids=new Set();
  actions.list=list.map(a=>{if(!a||(a.builtin!=='undo'&&(!/^[a-z][a-z0-9-]{0,63}$/.test(a.id)||typeof a.run!=='function'||!a.label)))throw new TypeError('Ação inválida');const id=a.builtin==='undo'?'undo':a.id;if(ids.has(id))throw new TypeError('Ação duplicada: '+id);ids.add(id);return {...a,id};});
  if(label)actions.label=String(label);renderActions();
 }

 /* ---------- ciclo de vida ---------- */
 function init(){
  if(ready)return;ready=true;root.dataset.workspace='core';prefs=readPrefs();
  for(const side of ['left','right']){render(side);$('close-'+side).addEventListener('click',()=>close(side));}
  $('workspace-left').addEventListener('click',e=>state.left!=='collapsed'?close('left'):open('left',e.currentTarget));
  $('workspace-right').addEventListener('click',e=>{
   if(isFamilies()){if(state.right!=='collapsed'&&state.source!=='dados')close('right');else open('right',e.currentTarget,null);return;}
   const list=sources('right');if(list&&(state.right==='collapsed'||state.source!==list[0].id)){open('right',e.currentTarget,list[0].id);return;}
   if(state.right!=='collapsed')close('right');else open('right',e.currentTarget);
  });
  $('workspace-right-alt').addEventListener('click',e=>{
   if(isFamilies()){if(state.right!=='collapsed'&&state.source==='dados')close('right');else open('right',e.currentTarget,'dados');return;}
   const list=sources('right');if(!list?.[1])return;if(state.right!=='collapsed'&&state.source===list[1].id)close('right');else open('right',e.currentTarget,list[1].id);
  });
  $('dock-expand').addEventListener('click',()=>{state.presentation=state.presentation==='fullscreen'?(isFamilies()?presentationOf(findTool(state.tool)):legacyEffective('right')?.presentation||'standard'):'fullscreen';if(state.presentation==='fullscreen')close('left',false);apply();save();$('dock-expand').focus();});
  $('dock-back').addEventListener('click',back);
  const right=panel('right');
  right.addEventListener('click',e=>{
   const b=e.target.closest('button');if(!b||!isFamilies())return;
   if(b.dataset.verFamily){selectFamily(b.dataset.verFamily);return;}
   if(b.dataset.ver){e.stopPropagation();selectTool(b.dataset.ver);return;}
   if(b.dataset.dockTool){state.source='dados';selectTool(b.dataset.dockTool);state.level='tool';render('right');apply();const bk=$('dock-back');(!bk.hidden?bk:$('close-right')).focus({preventScroll:true});}
  });
  right.addEventListener('keydown',e=>{
   const t=e.target.closest('[role="tab"]'),list=t?.closest('[role="tablist"]');
   if(!list||!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();
   const tabs=[...list.querySelectorAll('[role="tab"]')],i=tabs.indexOf(t);
   const n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:tabs.length-1))%tabs.length;tabs[n].click();
  });
  $('sheet-backdrop').addEventListener('click',()=>close());
  document.addEventListener('keydown',e=>{if($('workspace').hidden||document.querySelector('dialog[open]'))return;const side=state[lastDock]!=='collapsed'?lastDock:lastDock==='left'?'right':'left';if(state[side]==='collapsed')return;if(e.key==='Escape'){e.preventDefault();close(side);}if(mobile.matches||(side==='right'&&state.presentation==='fullscreen'))S.trap(e,panel(side));});
  window.addEventListener('resize',refresh);window.visualViewport?.addEventListener('resize',refresh);window.visualViewport?.addEventListener('scroll',refresh);
  new MutationObserver(refresh).observe($('workspace'),{attributes:true,attributeFilter:['hidden']});
  S.events.addEventListener('shell:projector',event=>{if(event.detail?.on&&(state.left!=='collapsed'||state.right!=='collapsed')){state.left=state.right='collapsed';apply();}});
  restoreScope();if(!mobile.matches&&innerWidth<S.breakpoints.dualPanels&&state.left!=='collapsed'&&state.right!=='collapsed')state.left='collapsed';
  apply();S.emit('workspace:ready',{});
 }
 function setScope(id){
  const next=String(id||'livre');if(next===state.scope)return;state.scope=next;restoreScope();
  for(const side of ['left','right'])render(side);apply();
 }
 function setContext(value){
  context=value;
  for(const side of ['left','right']){render(side);$('workspace-'+side).hidden=!!specs[side]&&!allowed(specs[side]);if(specs[side]&&!allowed(specs[side]))close(side,false);}
  if(isFamilies()){$('workspace-right').hidden=!families().length||!allowed(specs.right);$('workspace-right-alt').hidden=!dataAvailable();if(state.right!=='collapsed'&&state.source!=='dados'&&!families().length)close('right',false);}
  renderViews();renderActions();apply();
 }
 /* Grupo da atividade (ex.: Missão): quando ativo, é o único grupo editável e o destino do lançador. */
 function setActivityGroup(group){
  activityGroup=group&&group.id&&typeof group.render==='function'?{editable:true,icon:'mission',...group}:null;
  if(isGroups()){if(activityGroup)state.leftGroup=activityGroup.id;else if(state.leftGroup&&!groups().some(g=>g.id===state.leftGroup))state.leftGroup=defaultGroup();render('left');apply();}
 }
 return {
  init,open,close,set,refresh,geometry,state,selectTool,selectFamily,back,setScope,setContext,setActivityGroup,
  views:{set:setViews,select(id){if(views.list.some(v=>v.id===id)){views.current=id;renderViews();}},refresh:renderViews,get current(){return views.current;}},
  actions:{set:setActions,refresh:renderActions,clear(){actions.list=[];renderActions();},bindUndo(u){actions.undo=u;renderActions();}},
  setStatus,
  get source(){return state.source;},get ready(){return ready;},get tool(){return state.tool;},get level(){return state.level;},
  clear(){for(const side of ['left','right']){set(side,null);state[side]='collapsed';delete origins[side];}restoring.clear();context=null;activityGroup=null;views.list=[];views.current=null;views.onChange=null;renderViews();actions.list=[];actions.undo=null;renderActions();apply();},
  /* Retrato do estado das docas (ex.: para o tour) e devolução do estado exatamente como estava. */
  snapshot(){return {left:state.left,right:state.right,leftGroup:state.leftGroup,source:state.source,tool:state.tool,level:state.level,presentation:state.presentation};},
  restore(snap){if(!snap||typeof snap!=='object')return;for(const k of ['left','right','leftGroup','source','tool','level','presentation'])if(k in snap)state[k]=snap[k];for(const side of ['left','right'])render(side);apply();save();},
  suspend(){stash={left:state.left,right:state.right};suspended=true;apply();},
  resume(){suspended=false;if(stash){state.left=stash.left;state.right=stash.right;stash=null;}for(const side of ['left','right'])render(side);apply();save();}
 };
})();
