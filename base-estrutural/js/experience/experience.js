'use strict';
SimCore.createExperience=ctx=>{
 const S=SimCore,U=S.ExperienceUI;let configured=false,destroyed=false,disposers=[];
 const experience={options:{},resources:new Map(),storageWarned:false};
 experience.modules=S.createModules(ctx,experience);experience.activity=S.createActivities(ctx,experience);
 experience.teacher=S.createTeacher(ctx,experience);experience.reports=S.createReports(ctx,experience);experience.references=S.createReferences();
 experience.themes=S.createThemes(ctx,experience);experience.notebook=S.createNotebook(ctx,experience);
 experience.allowsModule=id=>experience.activity.allowsModule(id);
 experience.moduleChanged=id=>experience.activity.moduleChanged(id);
 Object.defineProperty(experience,'restricted',{get:()=>{const a=experience.activity.current;return !!a&&a.type!=='free'&&a.navigationMode==='restricted';}});
 experience.allowsRoute=(id,param='')=>{const a=experience.activity.current;if(!experience.restricted)return true;const explicit=experience.activity.getDefinition()?.allowedDestinations||[];return id==='laboratorio'||(id==='relatorios'&&!!experience.options.report&&(!param||param===a.sessionId))||(id==='roteiros'&&a.type==='route'&&param===a.id)||(id==='missoes'&&a.type==='mission'&&param===a.id)||explicit.some(x=>typeof x==='string'?x===id&&!param:(x.destination||x.route||x.id)===id&&String(x.parameter||'')===String(param));};
 function registerScreen(spec){const remove=S.router.register(spec,ctx);disposers.push(remove);return remove;}
 function pathGrid(paths,kind='primary'){const grid=U.element('div',null,'path-grid '+(kind==='support'?'home-support':'home-primary'));for(const path of paths||[]){
   const disabled=path.state==='disabled',card=U.element(disabled?'article':'a',null,'path-card');card.id='path-'+path.id;
   if(!disabled){card.href=S.router.href(path.destination,path.parameter||'');card.dataset.nav=path.destination;}else card.setAttribute('aria-disabled','true');
   if(path.destination==='laboratorio'&&kind==='primary')card.classList.add('path-laboratory');const top=U.element('div',null,'path-top');top.append(U.icon(path.icon||'grid'),U.element('span',String(path.order||''),'eyebrow'));card.append(top,U.element('h2',path.title),U.element('p',path.description||''),U.element('span',disabled?'Indisponível':'Abrir →','path-action'));grid.append(card);
  }return grid;}
 function home(host,local){
  const config=experience.options.home||{};U.heading(host,config.title||ctx.manifest.nome,config.description||'Escolha uma forma de investigar.');
  const available=path=>['laboratorio','manual'].includes(path.destination)||S.router.screens.includes(path.destination);
  const primary=(config.primary||config.paths||[]).filter(available);if(primary.length){host.append(U.element('h2','Caminhos principais','home-section-title'),pathGrid(primary));}
  const support=(config.support||[]).filter(available);if(support.length){host.append(U.element('h2','Apoio','home-section-title'),pathGrid(support,'support'));}
  const preferences=U.element('footer',null,'home-preferences');let startupButton;startupButton=U.button('Configurações de inicialização',()=>S.shell.open('startup',startupButton),local.scope,{id:'home-startup'});preferences.append(startupButton);host.append(preferences);
  if(!primary.length&&!support.length)host.append(U.element('p','Nenhum caminho registrado neste domínio.'));
 }
 function learning(host){experience.themes.renderList(host);}
 function theme(host,local){experience.themes.renderDetail(host,local);}
 function notebook(host,local){return experience.notebook.render(host,local);}
 function activityList(type,host,local){
  const route=type==='route'?'roteiros':'missoes',title=type==='route'?'Roteiros Experimentais':'Missões',a=experience.activity.current;
  const items=experience.activity.list(type),selected=items.find(x=>x.id===local.params);
  if(local.params&&!selected){U.heading(host,'Atividade não encontrada','O registro pode ter mudado.');host.append(U.link('Voltar à lista',route));return;}
  if(!selected){U.heading(host,title,type==='route'?'Investigações guiadas, cada uma com um módulo principal.':'Problemas com condições, evidências e conclusão. Todas as missões podem ser refeitas.');
   const list=U.element('div',null,'activity-list');for(const spec of items){const card=U.element('a',null,'activity-row');card.id=type+'-open-'+spec.id;card.href=S.router.href(route,spec.id);const body=U.element('div');body.append(U.element('h2',spec.title),U.element('p',spec.subtitle||spec.description||''));const meta=U.element('div',null,'activity-meta');meta.append(U.element('span',experience.modules.get(spec.module).title,'status-badge'));if(type==='mission'&&experience.activity.completed(spec.id))meta.append(U.element('span','Concluído','status-badge'));card.append(body,meta);list.append(card);}host.append(list);if(!items.length)host.append(U.element('p','Nenhuma atividade registrada.'));return;
  }
  const back=()=>S.router.navigate(route,'',{restore:true});host.append(U.button('Voltar a '+title,back,local.scope,{id:'activity-back'}));
  local.scope.listen(document,'keydown',e=>{if(e.key==='Escape'&&!e.defaultPrevented&&!document.querySelector('dialog[open]')){e.preventDefault();back();}});
  U.heading(host,selected.title,selected.subtitle||selected.description);host.append(U.element('p',experience.modules.get(selected.module).title+' · '+(selected.navigation==='restricted'?'Navegação restrita':'Navegação livre'),'eyebrow'));
  U.block(host,'Objetivo',selected.objective);U.block(host,'Problema',selected.problem);U.block(host,'Procedimento',selected.procedure);U.block(host,'Requisitos',selected.requirements);U.block(host,'Condições',selected.conditions);U.block(host,'Evidências esperadas',selected.evidence);
  const active=a?.type===type&&a.id===selected.id;
  const status=U.element('p',active?({completed:'Concluído',restarted:'Reiniciada',active:'Ativa'}[a.status]||'Ativa'):type==='mission'&&experience.activity.completed(selected.id)?'Concluído anteriormente · disponível para refazer':'Pronta para iniciar','activity-status');status.id='activity-status';status.setAttribute('role','status');host.append(status);
  const actions=U.element('div',null,'action-row');host.append(actions);
  if(active){actions.append(U.link('Continuar no Laboratório','laboratorio','','activity-continue'),U.link('Relatório','relatorios','','activity-report'));
   if(type==='mission'){
    const saved=experience.reports.fields();const evidence=U.field(host,'Evidências registradas','mission-evidence',{value:saved.evidence,rows:3}),conclusion=U.field(host,'Conclusão','mission-conclusion',{value:saved.conclusion,rows:4});
    local.scope.listen(evidence,'input',()=>experience.reports.setFields({evidence:evidence.value}));local.scope.listen(conclusion,'input',()=>experience.reports.setFields({conclusion:conclusion.value}));
    if(a.status!=='completed'){const finish=U.button('Concluir missão',async()=>{if(await experience.activity.finish())status.textContent='Concluído';},local.scope,{id:'mission-finish',primary:true});host.append(finish);}
   }
   if(type==='route'&&typeof selected.validate==='function'&&a.status!=='completed')host.append(U.button('Concluir roteiro',async()=>{if(await experience.activity.finish())status.textContent='Concluído';},local.scope,{id:'route-finish',primary:true}));
   actions.append(U.button('Refazer',()=>experience.activity.restart(),local.scope,{id:'activity-restart'}));
  }else actions.append(U.button(type==='mission'&&experience.activity.completed(selected.id)?'Refazer missão':'Iniciar '+(type==='route'?'roteiro':'missão'),()=>experience.activity.start(type,selected.id),local.scope,{id:'activity-start',primary:true}));
 }
 function openAbout(){
  const about=experience.options.about||{},content=U.element('div');const brand=U.element('div',null,'about-brand');const icon=U.element('img');icon.src=ctx.manifest.icone||'assets/core-icon.svg';icon.alt='';icon.width=48;icon.height=48;brand.append(icon,U.element('h3',ctx.manifest.nome));content.append(brand,U.element('p',ctx.manifest.subtitulo),U.element('p','Versão '+ctx.manifest.versao));U.block(content,'Sobre o programa',about.description||ctx.manifest.titulo);
  if(about.model)U.block(content,about.modelTitle||'Modelo do domínio',about.model);
  const refs=U.element('section');refs.append(U.element('h3','Referências e créditos'));experience.references.render(refs);content.append(refs);U.block(content,'Licenças',about.licenses||['Consulte as licenças da distribuição.']);
  return ctx.modal.open({title:'Sobre',content,size:'wide',actions:[{id:'manual',label:'Manual de uso',primary:true,run:()=>{S.modal.close();S.router.openManual(about.manualTopic||'');}}]});
 }
 function details(){const a=experience.activity.current;if(!a||a.type==='free')return;const spec=experience.activity.getDefinition(),help=experience.options.contextualHelp?.(a,ctx)||spec?.help||{};const content=U.element('div');content.id='activity-contextual-help';content.append(U.element('h3',a.title));
  for(const [title,text]of [['Instruções',help.instructions||spec?.instructions||spec?.description],['Objetivo',help.objective||spec?.objective],['Procedimento',help.procedure||spec?.procedure],['Condições',help.conditions||spec?.conditions],['Dicas',help.tips],['Explicações',help.explanations]])U.block(content,title,text);
  const topic=S.manual.topics.find(t=>t.id===(help.manualTopic||spec?.manualTopic));if(topic){const related=U.element('section',null,'contextual-manual');related.append(U.element('h2','Orientação relacionada: '+topic.title));const plain=value=>String(value||'').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(_,id,label)=>label||id);for(const text of [topic.summary,topic.content,topic.purpose])if(text)related.append(U.element('p',plain(text)));U.block(related,'Como usar',topic.steps.map(plain));for(const detail of topic.details)U.block(related,detail.title,plain(detail.text));content.append(related);}
  content.append(U.element('p','Módulo: '+experience.modules.get(a.module).title),U.element('p','Navegação: '+(experience.restricted?'restrita aos destinos da atividade':'livre')));
  const ids=a.restrictions.resources;content.append(U.element('p','Recursos: '+(ids===null?'todos os recursos registrados':ids.map(id=>experience.resources.get(id)?.title).join(', ')||'nenhum recurso opcional')));
  const actions=[];if(S.router.screens.includes('relatorios'))actions.push({id:'report',label:'Relatório',run:()=>{S.modal.close();S.router.navigate('relatorios',a.sessionId);}});if(a.type==='mission')actions.unshift({id:'mission',label:'Evidências e conclusão',primary:true,run:()=>{S.modal.close();S.router.navigate('missoes',a.id);}});
  ctx.modal.open({title:'Ajuda da atividade',content,actions});
 }
 experience.updateBanner=()=>{const a=experience.activity.current,banner=S.$('activity-banner');banner.hidden=!a||a.type==='free';if(banner.hidden)return;S.$('activity-banner-title').textContent=a.title;S.$('activity-banner-type').textContent=({route:'Roteiro',mission:'Missão',teacher:'Professor'}[a.type]||'Atividade')+' · '+(a.status==='completed'?'Concluído':a.navigationMode==='restricted'?'Navegação restrita':'Navegação livre');};
 function configure(options={}){
  if(configured)throw new Error('Experiência já configurada');configured=true;experience.options=options;S.experience.current=experience;
  for(const resource of options.resources||[]){if(!U.id(resource.id)||!resource.title||experience.resources.has(resource.id))throw new TypeError('Recurso inválido ou duplicado');experience.resources.set(resource.id,{...resource});}
  for(const module of options.modules||[])experience.modules.register(module);
  for(const route of options.routes||[])experience.activity.register('route',route);
  for(const mission of options.missions||[])experience.activity.register('mission',mission);
  for(const reference of options.references||[])experience.references.register(reference);
  experience.themes.configure(options.themes||[]);experience.notebook.configure(options.notebook);
  if(options.home)registerScreen({id:'inicio',title:'Início',render:home});
  if(options.themes)registerScreen({id:'aprender',title:'Aprender',render:learning});
  if(options.themes)registerScreen({id:'tema',title:'Tema',render:theme});
  if(options.routes)registerScreen({id:'roteiros',title:'Roteiros Experimentais',render:(h,l)=>activityList('route',h,l)});
  if(options.missions)registerScreen({id:'missoes',title:'Missões',render:(h,l)=>activityList('mission',h,l)});
  if(options.notebook&&experience.notebook.available)registerScreen({id:experience.notebook.current.route,title:experience.notebook.current.title,render:notebook});
  if(options.teacher)registerScreen({id:'professor',title:'Área do Professor',render:experience.teacher.render});
  if(options.report)registerScreen({id:'relatorios',title:'Relatórios',render:experience.reports.render});
  for(const screen of options.screens||[])registerScreen(screen);
  if(options.modulePanel!==false)ctx.panels.set('left',{title:'Módulos',render:experience.modules.render});
  ctx.scope.listen(S.$('activity-banner-details'),'click',details);ctx.scope.listen(S.$('activity-banner-exit'),'click',()=>experience.activity.exit());
  ctx.events.on('screen:changed',()=>experience.updateBanner());
  S.shell?.attach(ctx,experience,options);
 }
 async function ready(){if(!configured)return;const initial=typeof S.initialHash==='string'?S.initialHash:location.hash;S.initialHash=null;const preferred=S.shell?.resolveInitialHash(initial);const target=preferred?{id:preferred,param:''}:initial?S.router.parse(initial):{id:experience.options.home?'inicio':'laboratorio',param:''};await S.router.navigate(target.id,target.param,{history:false});await experience.activity.initialize();}
 async function destroy(){if(destroyed)return;destroyed=true;if(S.experience.current===experience){S.experience.current=null;S.$('activity-banner').hidden=true;}S.shell?.detach();await S.router.release();await experience.activity.destroy();await experience.modules.destroy();experience.themes.destroy();experience.notebook.destroy();for(const remove of disposers)remove();disposers=[];experience.references.clear();experience.resources.clear();}
 Object.assign(experience,{configure,ready,destroy,registerScreen,openAbout,details,async reset(){if(await U.confirm(ctx,'Reiniciar investigação?','Os dados da investigação atual serão reiniciados. Os textos do relatório e as preferências serão preservados.','Reiniciar'))await ctx.reset();}});Object.defineProperty(experience,'configured',{get:()=>configured});return experience;
};
