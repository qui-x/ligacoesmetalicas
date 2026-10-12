'use strict';
/* Shell único: registros do domínio, foco e preferências estruturais. */
SimCore.shell=(()=>{
 const S=SimCore,U=S.ExperienceUI,$=S.$,store=()=>S.storage.core;
 let ctx=null,experience=null,options={},desktop=[],bottom=[],resources=[],startup=[],ready=false,drawerTrigger=null,navExpanded=null,a11yExpanded=false,drawerA11yCleanup=null,brandHref=null,brandLabel=null;
 const hasScreen=id=>['laboratorio','manual'].includes(id)||S.router.screens.includes(id);
 const restricted=()=>experience?.restricted===true;
 const activeActivity=()=>{const a=experience?.activity.current;return a&&a.type!=='free'?a:null;};
 function item(raw){
  const x=typeof raw==='string'?{id:raw}:raw||{},destination=x.destination||x.route||x.id,id=x.id||destination;
  if(!U.id(id)||!U.id(destination))throw new TypeError('Destino do shell inválido');
  return {...x,id,destination,parameter:String(x.parameter||''),label:String(x.label||x.title||destination),icon:x.icon||x.icone||'grid',visible:x.visible??x.visibility};
 }
 function resource(raw){
  if(!raw||!U.id(raw.id)||!(raw.title||raw.label))throw new TypeError('Recurso do shell inválido');
  if(raw.action!=null&&typeof raw.action!=='function')throw new TypeError('Ação de recurso inválida');
  if(!raw.action&&!(raw.destination||raw.route))throw new TypeError('Recurso exige ação ou destino');
  return {...raw,label:String(raw.label||raw.title),title:String(raw.title||raw.label),icon:raw.icon||'resource',visible:raw.visible??raw.visibility};
 }
 function visible(x){try{return typeof x.visible==='function'?!!x.visible({ctx,experience,activity:activeActivity()}):x.visible!==false;}catch(error){console.error('Falha na visibilidade do shell',error);return false;}}
 function enabled(x){return typeof x.enabled==='function'?x.enabled({ctx,experience,activity:activeActivity()})!==false:x.enabled!==false;}
 const allowed=x=>enabled(x)&&hasScreen(x.destination)&&(!experience||experience.allowsRoute(x.destination,x.parameter||''));
 function resourceAllowed(x){return enabled(x)&&(!x.resourceId||experience?.activity.allowsResource(x.resourceId))&&(!activeActivity()||!restricted()||x.allowDuringActivity===true);}
 function defaults(cfg){
  const all=[['inicio','Início','home'],['aprender','Aprender','learn'],['missoes','Missões','mission'],['roteiros','Roteiros Experimentais','routes'],['laboratorio','Laboratório','lab'],['caderno','Caderno','notebook'],['manual','Manual','manual']].filter(([id])=>hasScreen(id)).map(([id,label,icon])=>({id,label,icon}));
  return {desktop:(cfg.navigation?.desktop||cfg.shell?.desktop||all).map(item),bottom:(cfg.navigation?.mobile||cfg.navigation?.bottom||cfg.shell?.mobile||all.filter(x=>['inicio','aprender','laboratorio','caderno'].includes(x.id)).slice(0,4)).map(item)};
 }
 function navElement(x,kind){
  const a=U.element('a',null,kind==='bottom'?'shell-bottom-link':kind==='drawer'?'drawer-link':'shell-nav-link');
  a.dataset.nav=x.destination;a.dataset.shellNav=x.id;a.dataset.shellKind=kind;a.title=x.tooltip||x.label;
  a.append(U.icon(x.icon),U.element('span',x.label));
  if(allowed(x))a.href=S.router.href(x.destination,x.parameter);else{a.setAttribute('role','link');a.setAttribute('aria-disabled','true');a.dataset.disabled='true';a.tabIndex=0;a.title=x.label+' — indisponível neste contexto';}
  return a;
 }
 function renderNav(){
  const focus=document.activeElement,focused=focus?.dataset.shellNav,kind=focus?.dataset.shellKind;
  for(const [host,items,navKind]of [[$('main-nav'),desktop,'desktop'],[$('bottom-nav'),bottom,'bottom']]){if(!host)continue;host.replaceChildren();items.filter(x=>visible(x)&&hasScreen(x.destination)).forEach(x=>host.append(navElement(x,navKind)));host.hidden=restricted()||!host.children.length;}
  if(focused&&kind!=='drawer')document.querySelectorAll('[data-shell-nav]').forEach(a=>{if(a.dataset.shellNav===focused&&a.dataset.shellKind===kind)a.focus({preventScroll:true});});
  const limited=restricted(),brand=document.querySelector('.brand');document.body.classList.toggle('activity-restricted',limited);
  if(brand){if(brandHref===null){brandHref=brand.getAttribute('href')||S.router.href('inicio');brandLabel=brand.getAttribute('aria-label');}brand.inert=false;brand.removeAttribute('aria-disabled');brand.removeAttribute('tabindex');if(limited){const a=activeActivity(),report=a.status==='completed'&&hasScreen('relatorios');brand.href=S.router.href(report?'relatorios':'laboratorio',report?a.sessionId:'');brand.setAttribute('aria-label',(report?'Voltar ao relatório da atividade: ':'Voltar à atividade: ')+a.title);}else{brand.href=brandHref;if(brandLabel)brand.setAttribute('aria-label',brandLabel);else brand.removeAttribute('aria-label');}}
  $('drawer-title').textContent=limited?'Menu da atividade':'Menu';$('core-menu').setAttribute('aria-label',limited?'Abrir menu da atividade':'Abrir menu');
  if(focused&&limited&&!document.querySelector('dialog[open]'))$('core-menu').focus({preventScroll:true});
  updateActive();S.responsive.refresh();
 }
 function section(title,id){const s=U.element('section',null,'drawer-section');s.id=id;s.append(U.element('h3',title,'drawer-section-title'));return s;}
 function button(label,id,icon,cls='drawer-link'){const b=U.element('button',label,cls);b.type='button';b.id=id;if(icon)b.prepend(U.icon(icon));return b;}
 function context(){
  const route=S.router.current||{id:'laboratorio',param:''},titles={inicio:'Início',aprender:'Aprender',tema:'Tema',missoes:'Missões',roteiros:'Roteiros Experimentais',laboratorio:'Laboratório',caderno:'Caderno',manual:'Manual',professor:'Área do Professor',relatorios:'Relatório'};
  let title=titles[route.id]||desktop.find(x=>x.destination===route.id)?.label||route.id,detail='Seu contexto atual.';
  if(route.id==='laboratorio')detail='Módulo: '+(experience?.modules.get(experience.modules.current)?.title||'Nenhum módulo carregado');
  if(route.id==='tema')title=experience?.themes.get(route.param)?.title||title;
  if(['roteiros','missoes'].includes(route.id)&&route.param){const type=route.id==='roteiros'?'route':'mission',spec=experience?.activity.get(type,route.param);if(spec){title=spec.title;detail=(type==='route'?'Roteiro':'Missão')+' · Módulo: '+(experience.modules.get(spec.module)?.title||spec.module);}}
  if(route.id==='manual')detail='Orientação de uso e consulta.';
  return {route,title,detail};
 }
 function disclosure(label,id,controls,expanded,icon){const b=button(label,id,icon,'drawer-link drawer-disclosure');b.setAttribute('aria-expanded',String(expanded));b.setAttribute('aria-controls',controls);const arrow=U.element('span','›','disclosure-arrow');arrow.setAttribute('aria-hidden','true');b.append(arrow);return b;}
 function clearDrawerControls(){drawerA11yCleanup?.();drawerA11yCleanup=null;}
 function renderDrawer({opening=false}={}){
  const host=$('drawer-sections');if(!host)return;const focusId=document.activeElement?.id,scroll=host.scrollTop;clearDrawerControls();host.replaceChildren();
  const a=activeActivity(),limited=restricted(),now=context();$('drawer-title').textContent=limited?'Menu da atividade':'Menu';
  if(a){
   const s=section(a.status==='completed'?'Atividade concluída':'Atividade em andamento','drawer-activity'),type={route:'Roteiro',mission:'Missão',teacher:'Atividade do Professor'}[a.type]||'Atividade',status={active:'Ativa',restarted:'Reiniciada',completed:'Concluída',interrupted:'Interrompida'}[a.status]||a.status;
   s.append(U.element('p',type+' · '+status,'drawer-context-detail'),U.element('p',a.title,'drawer-context-title'),U.element('p','Módulo: '+(experience.modules.get(a.module)?.title||a.module)+' · '+(limited?'Navegação restrita':'Navegação livre'),'drawer-context-detail'));
   const row=U.element('div',null,'drawer-actions');row.append(button('Continuar','shell-activity-continue','arrow'),button('Ajuda da atividade','shell-activity-details','info'));
   if(hasScreen('relatorios'))row.append(button('Relatório','shell-activity-report','report'));
   if(a.type==='mission'&&a.status!=='completed')row.append(button('Finalizar missão','shell-activity-finish','check'));
   if(a.type==='route'&&typeof experience.activity.getDefinition()?.validate==='function'&&a.status!=='completed')row.append(button('Concluir roteiro','shell-activity-finish','check'));
   row.append(button('Encerrar atividade','shell-activity-exit','close','drawer-link drawer-danger'));s.append(row);host.append(s);
  }
  if(!limited){const n=section('Agora','drawer-now');n.append(U.element('strong',now.title),U.element('p',now.detail,'drawer-context-detail'),button('Continuar','drawer-continue','arrow'));host.append(n);}
  const explicit=experience?.activity.getDefinition()?.allowedDestinations||[];
  const destinations=limited?explicit.map(x=>item(typeof x==='string'?desktop.find(n=>n.destination===x)||x:x)).filter(x=>visible(x)&&allowed(x)):desktop.filter(x=>visible(x)&&hasScreen(x.destination));
  if(destinations.length){const nav=section(limited?'Destinos permitidos':'Navegar','drawer-navigation-section'),list=U.element('nav',null,'drawer-list');list.id='drawer-navigation';list.setAttribute('aria-label',limited?'Destinos permitidos pela atividade':'Destinos principais');destinations.forEach(x=>list.append(navElement(x,'drawer')));if(!limited){nav.replaceChildren(disclosure('Navegar','shell-navigation-toggle',list.id,navExpanded,'grid'));list.hidden=!navExpanded;}nav.append(list);host.append(nav);}
  const available=resources.filter(x=>visible(x)&&(x.action||hasScreen(x.destination||x.route))&&(!limited||x.allowDuringActivity===true&&resourceAllowed(x)&&(x.action||allowed(item(x)))));
  if(available.length){const s=section('Recursos','drawer-resources'),l=U.element('div',null,'drawer-list');for(const r of available){if(r.action){const b=button(r.label,'shell-resource-'+r.id,r.icon);b.dataset.shellResource=r.id;b.disabled=!resourceAllowed(r);b.title=b.disabled?r.label+' — indisponível nesta atividade':r.tooltip||r.label;l.append(b);}else l.append(navElement(item(r),'drawer'));}s.append(l);host.append(s);}
  if(!limited&&hasScreen('professor')){const s=section('Professor','drawer-professor');s.append(navElement(item({id:'professor',label:'Área do Professor',icon:'teacher'}),'drawer'));if(options.shell?.projectorFromTeacher!==false){const b=button('Modo Projetor','shell-projector-teacher','projector');b.setAttribute('aria-pressed',String(isProjector()));s.append(b);}host.append(s);}
  const pref=section('Preferências','drawer-preferences');pref.append(disclosure('Acessibilidade','shell-accessibility','shell-a11y-controls',a11yExpanded,'accessibility'));const controls=U.element('div',null,'drawer-a11y-controls');controls.id='shell-a11y-controls';controls.hidden=!a11yExpanded;pref.append(controls);if(a11yExpanded&&(opening||$('app-drawer').open))drawerA11yCleanup=S.accessibility.renderControls(controls,{prefix:'drawer-'});
  if(!limited){
   pref.append(button('Inicialização','shell-startup','home'));
   const label=U.element('label',null,'drawer-check'),check=U.element('input');check.id='shell-projector';check.type='checkbox';check.checked=isProjector();label.append(check,U.element('span','Modo Projetor'));pref.append(label);
  }host.append(pref);
  if(!limited){const app=section('Aplicativo','drawer-app');if(S.pwa?.supported())app.append(button('Instalar aplicativo','shell-install','install'));app.append(button('Sobre','shell-about','info'),button('Reorganizar interface','shell-layout-reset','grid'));if(ctx)app.append(button('Reiniciar investigação','shell-module-reset','lab'));app.append(U.element('p','Versão '+(ctx?.manifest.versao||S.version),'drawer-version'));host.append(app);}
  host.scrollTop=scroll;if(focusId&&$('app-drawer').open){if($(focusId)?.isConnected)$(focusId).focus({preventScroll:true});else $('drawer-close').focus({preventScroll:true});}updateActive();
 }
 function toggleDisclosure(id){
  if(id==='shell-navigation-toggle'){navExpanded=!navExpanded;$(id).setAttribute('aria-expanded',String(navExpanded));$('drawer-navigation').hidden=!navExpanded;}
  if(id==='shell-accessibility'){a11yExpanded=!a11yExpanded;$(id).setAttribute('aria-expanded',String(a11yExpanded));const host=$('shell-a11y-controls');host.hidden=!a11yExpanded;if(a11yExpanded)drawerA11yCleanup=S.accessibility.renderControls(host,{prefix:'drawer-'});else{clearDrawerControls();host.replaceChildren();}}
 }
 function startupOptions(){const configured=options.startup?.destinations||options.shell?.startup?.destinations||options.shell?.startup||[];return (Array.isArray(configured)?configured:[]).map(item).filter(x=>visible(x)&&enabled(x)&&hasScreen(x.destination));}
 function fallback(){return hasScreen('inicio')?'inicio':'laboratorio';}
 function startupValue(){startup=startupOptions();const value=store().get('startup',fallback());return startup.some(x=>x.destination===value)?value:fallback();}
 function setStartup(value){startup=startupOptions();if(value!==fallback()&&!startup.some(x=>x.destination===value))return false;store().set('startup',value);S.emit('shell:startup',{destination:value});return true;}
 function openStartup(){
  if(restricted())return;close();const owner=ctx,selected=startupValue(),defaultRoute=fallback(),choices=[...startup];
  if(!choices.some(x=>x.destination===defaultRoute))choices.unshift({destination:defaultRoute,label:defaultRoute==='inicio'?'Início':'Laboratório'});
  const content=U.element('div');content.id='startup-settings';content.append(U.element('p','Escolha a tela que será aberta ao iniciar o aplicativo.'));
  const group=U.element('div');group.setAttribute('role','radiogroup');group.setAttribute('aria-label','Destino inicial');
  for(const x of choices.filter((x,i,list)=>list.findIndex(y=>y.destination===x.destination)===i)){const label=U.element('label',null,'drawer-check'),radio=U.element('input');radio.type='radio';radio.name='startup-destination';radio.value=x.destination;radio.checked=x.destination===selected;label.append(radio,U.element('span',x.label+(x.destination===defaultRoute?' (padrão)':'')));group.append(label);}content.append(group);
  return (owner?.modal||S.modal).open({title:'Como deseja iniciar?',content,actions:[{id:'cancel',label:'Cancelar'},{id:'save',label:'Salvar',primary:true,run:()=>{if(ctx!==owner)return;const value=group.querySelector('input:checked')?.value;if(!setStartup(value)){S.notifications.show('Este destino não está mais disponível. Abra as configurações novamente.',{type:'warning'});return false;}}}]});
 }
 function isProjector(){return store().get('projector',false)===true;}
 function setProjector(value){const on=!!value;store().set('projector',on);document.documentElement.dataset.projetor=on?'on':'off';document.body.classList.toggle('projector',on);if($('shell-projector'))$('shell-projector').checked=on;$('shell-projector-teacher')?.setAttribute('aria-pressed',String(on));S.responsive.refresh();S.emit('shell:projector',{on});}
 async function handleAction(id){
  if(id==='shell-startup')return openStartup();
  if(['shell-navigation-toggle','shell-accessibility'].includes(id)){toggleDisclosure(id);return;}
  if(id==='shell-projector-teacher'){setProjector(!isProjector());return;}
  const now=context(),a=activeActivity();close();
  if(id==='drawer-continue')return S.router.navigate(now.route.id,now.route.param);
  if(id==='shell-activity-continue')return S.router.navigate(a?.status==='completed'&&hasScreen('relatorios')?'relatorios':'laboratorio',a?.status==='completed'&&hasScreen('relatorios')?a.sessionId:'');
  if(id==='shell-activity-details')return experience?.details();
  if(id==='shell-activity-report')return S.router.navigate('relatorios',a?.sessionId||'');
  if(id==='shell-activity-finish')return S.router.navigate(a?.type==='route'?'roteiros':'missoes',a?.id||'');
  if(id==='shell-activity-exit')return experience?.activity.exit();
  if(id==='shell-install')return S.pwa.install();
  if(id==='shell-about')return experience?experience.openAbout():S.modal.open({title:'Sobre',content:'Base Estrutural · Versão '+S.version+' · Plataforma para aplicações interativas. Licença GNU GPL v3.'});
  if(id==='shell-layout-reset')return S.resetStructure();
  if(id==='shell-module-reset')return activeActivity()?experience.activity.restart():experience?.reset()||S.domain.reset();
 }
 function failure(error){console.error('Falha na ação do shell',error);S.notifications.show('Não foi possível concluir esta ação.',{type:'error'});}
 function update(){renderNav();if($('app-drawer')?.open)renderDrawer();}
 function updateActive(){const r=S.router.current;document.querySelectorAll('[data-shell-nav]').forEach(a=>{const active=r&&(a.dataset.nav===r.id||a.dataset.nav==='aprender'&&r.id==='tema');if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
 function restoreFocus(){const origin=drawerTrigger;drawerTrigger=null;if(!document.querySelector('dialog[open]')&&origin?.isConnected)origin.focus({preventScroll:true});}
 function open(section=null,trigger=$('core-menu')){if(section==='startup')return openStartup();const d=$('app-drawer');if(!d)return;if(section==='accessibility')a11yExpanded=true;
  if(!d.open){S.modal.close();drawerTrigger=trigger;renderDrawer({opening:true});d.showModal();$('drawer-sections').scrollTop=0;document.body.classList.add('drawer-open');$('core-menu').setAttribute('aria-expanded','true');}else if(section==='accessibility'&&!$('shell-a11y-controls').children.length)renderDrawer();
  const focus=section==='accessibility'?$('shell-accessibility'):section==='startup'?$('shell-startup'):$('drawer-close');(focus||$('drawer-close')).focus({preventScroll:true});if(section)focus?.scrollIntoView({block:'nearest'});
 }
 function close(){const d=$('app-drawer');if(!d?.open)return;d.close();clearDrawerControls();document.body.classList.remove('drawer-open');$('core-menu').setAttribute('aria-expanded','false');restoreFocus();}
 function bind(){
  $('core-menu').addEventListener('click',()=>open());$('drawer-close').addEventListener('click',close);const d=$('app-drawer');
  d.addEventListener('cancel',e=>{e.preventDefault();close();});d.addEventListener('close',()=>{if(d.open)return;clearDrawerControls();document.body.classList.remove('drawer-open');$('core-menu').setAttribute('aria-expanded','false');restoreFocus();});
  d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();return;}const b=e.target.closest('[data-shell-resource]');if(b&&!b.disabled){const r=resources.find(x=>x.id===b.dataset.shellResource);if(r&&resourceAllowed(r)){close();Promise.resolve().then(()=>r.action({ctx,experience,shell:api})).catch(failure);}return;}const action=e.target.closest('button[id^="shell-"],#drawer-continue');if(action&&!action.disabled)Promise.resolve(handleAction(action.id)).catch(failure);});
  d.addEventListener('change',e=>{if(e.target.id==='shell-projector')setProjector(e.target.checked);});
  document.querySelector('.brand')?.addEventListener('click',e=>{if(!restricted()||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button)return;e.preventDefault();const a=activeActivity(),report=a.status==='completed'&&hasScreen('relatorios');S.router.navigate(report?'relatorios':'laboratorio',report?a.sessionId:'').then(()=>{const focus=report?document.querySelector('#screens-host [data-screen-focus]'):$('scientific-viewport');focus?.focus({preventScroll:true});window.scrollTo(0,0);}).catch(failure);});
  document.addEventListener('click',e=>{const a=e.target.closest('[data-shell-nav]');if(!a)return;if(a.dataset.disabled){e.preventDefault();S.notifications.show('Este destino não está disponível neste contexto. Encerre a atividade para liberar a navegação.',{type:'warning'});}else if(d.open)close();});
  document.addEventListener('keydown',e=>{if(d.open){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}else S.trap(e,d);}else if(e.target.matches('[data-shell-nav][data-disabled]')&&['Enter',' '].includes(e.key)){e.preventDefault();e.target.click();}},true);
  for(const event of ['screen:changed','activity:changed','module:changed'])S.events.addEventListener(event,update);
 }
 function resolveInitialHash(hash){const raw=String(hash||'');if(raw&&!['#/','#/inicio'].includes(raw))return null;return startupValue();}
 function attach(newCtx,newExperience,cfg){ctx=newCtx;experience=newExperience;options=cfg||{};const nav=defaults(options);desktop=nav.desktop;bottom=nav.bottom;resources=(options.shell?.resources||[]).map(resource);if(options.shell?.tour)resources.push(resource({id:'tour',title:'Iniciar tour',icon:'tour',action:options.shell.tour}));startup=startupOptions();renderNav();renderDrawer();}
 function detach(){close();ctx=null;experience=null;options={};const nav=defaults({});desktop=nav.desktop.filter(x=>['laboratorio','manual'].includes(x.destination));bottom=nav.bottom.filter(x=>x.destination==='laboratorio');resources=[];startup=[];renderNav();renderDrawer();}
 function init(){if(ready)return;ready=true;navExpanded=matchMedia('(max-width:'+S.breakpoints.mobile+'px)').matches;bind();const nav=defaults({});desktop=nav.desktop;bottom=nav.bottom;startup=startupOptions();setProjector(isProjector());renderNav();renderDrawer();}
 function append(list,spec,normalize){const value=normalize(spec);if(list.some(x=>x.id===value.id))throw new TypeError('Registro do shell duplicado: '+value.id);list.push(value);update();return ()=>{const i=list.indexOf(value);if(i>=0){list.splice(i,1);update();}};}
 const api={init,attach,detach,open,close,renderNav,renderDrawer,refreshLayout:()=>S.responsive.refresh(),resolveInitialHash,setStartup,setProjector,registerResource:spec=>append(resources,spec,resource),registerDesktop:spec=>append(desktop,spec,item),registerBottom:spec=>append(bottom,spec,item),registerTour:action=>append(resources,{id:'tour',title:'Iniciar tour',icon:'tour',action},resource),get projector(){return isProjector();},get desktop(){return desktop.map(x=>({...x}));},get bottom(){return bottom.map(x=>({...x}));}};
 return api;
})();
