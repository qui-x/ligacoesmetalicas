'use strict';
SimCore.createExperience=ctx=>{
 const S=SimCore,U=S.ExperienceUI;let configured=false,destroyed=false,disposers=[];
 const experience={options:{},resources:new Map(),storageWarned:false};
 experience.modules=S.createModules(ctx,experience);experience.activity=S.createActivities(ctx,experience);
 experience.teacher=S.createTeacher(ctx,experience);experience.reports=S.createReports(ctx,experience);experience.references=S.createReferences();
 experience.themes=S.createThemes(ctx,experience);experience.notebook=S.createNotebook(ctx,experience);
 experience.tour=S.createTour(ctx,experience);
 experience.allowsModule=id=>experience.activity.allowsModule(id);
 experience.moduleChanged=id=>{experience.activity.moduleChanged(id);experience.updateStatus();};
 /* Rótulo do modo na barra da área de trabalho ("MÓDULO · EXPLORAR" ou "MISSÃO") e escopo da memória das docas. */
 experience.updateStatus=()=>{const a=experience.activity.current,m=experience.modules.get?.(experience.modules.current),custom=experience.options.workspace?.status;let text;
  try{text=typeof custom==='function'?custom({module:m||null,activity:a&&a.type!=='free'?a:null}):null;}catch(error){console.error('Falha no rótulo do modo',error);}
  if(text==null)text=a&&a.type==='mission'?'MISSÃO':m?'MÓDULO · '+String(m.title).toLocaleUpperCase('pt-BR'):ctx.manifest.titulo;
  S.workspace.setStatus(text);S.workspace.setScope(a&&a.type!=='free'?'atividade-'+(a.sessionId||a.id):'livre');};
 Object.defineProperty(experience,'restricted',{get:()=>{const a=experience.activity.current;return !!a&&a.type!=='free'&&a.navigationMode==='restricted';}});
 experience.allowsRoute=(id,param='')=>{const a=experience.activity.current;if(!experience.restricted)return true;const explicit=experience.activity.getDefinition()?.allowedDestinations||[];return id==='laboratorio'||(id==='relatorios'&&!!experience.options.report&&(!param||param===a.sessionId))||(id==='roteiros'&&a.type==='route'&&param===a.id)||(id==='missoes'&&a.type==='mission'&&param===a.id)||explicit.some(x=>typeof x==='string'?x===id&&!param:(x.destination||x.route||x.id)===id&&String(x.parameter||'')===String(param));};
 function registerScreen(spec){const remove=S.router.register(spec,ctx);disposers.push(remove);return remove;}
 /* Página inicial editorial da família: sobretítulo, título com destaque, lema e ícone; "Escolha seu próximo passo"
    com um cartão em destaque (o Laboratório, por padrão) e metas vivas; apoio como links no rodapé.
    home={eyebrow, title, titleAccent, motto, description, icon, sectionTitle, sectionNote, featured, primary:[{id, title,
    description, icon, destination, parameter, tag, invite, cta, meta, decoration(node)}], support:[…], supportStyle:'links'|'cards'}. */
 const META={aprender:n=>n+(n===1?' tema para explorar':' temas para explorar'),missoes:n=>n+(n===1?' desafio para resolver':' desafios para resolver'),roteiros:n=>n+(n===1?' investigação guiada':' investigações guiadas')};
 function meta(path){
  if(typeof path.meta==='function'){try{return String(path.meta()||'');}catch(error){console.error('Falha na meta do cartão',error);return '';}}
  if(path.meta!=null)return String(path.meta);
  if(path.destination==='aprender')return META.aprender(experience.themes.list().length);
  if(path.destination==='missoes')return META.missoes(experience.activity.list('mission').length);
  if(path.destination==='roteiros')return META.roteiros(experience.activity.list('route').length);
  if(path.destination===experience.notebook.current?.route){const n=Number(experience.options.notebook?.count?.());return Number.isFinite(n)&&n>0?n+(n===1?' registro salvo':' registros salvos'):'Pronto para suas descobertas';}
  return '';
 }
 function pathCard(path,{featured=false,kind='primary'}={}){
  const disabled=path.state==='disabled',card=U.element(disabled?'article':'a',null,'path-card'+(featured?' is-featured':''));card.id='path-'+path.id;
  if(!disabled){card.href=S.router.href(path.destination,path.parameter||'');card.dataset.nav=path.destination;}else card.setAttribute('aria-disabled','true');
  if(path.destination==='laboratorio'&&kind==='primary')card.classList.add('path-laboratory');
  const tile=U.element('span',null,'path-icon');tile.append(U.icon(path.icon||'grid'));const top=U.element('span',null,'path-top');top.append(tile);
  if(featured){
   top.append(U.element('span',path.tag||'Espaço livre','path-tag'));card.append(top,U.element('span',path.invite||'Explore na prática','path-invite'),U.element('h2',path.title),U.element('p',path.description||'','path-description'));
   if(typeof path.decoration==='function'){const deco=U.element('span',null,'path-decoration');deco.setAttribute('aria-hidden','true');try{path.decoration(deco);}catch(error){console.error('Falha na decoração do cartão',error);}card.append(deco);}
   const cta=U.element('span',disabled?'Indisponível':path.cta||'Entrar no '+path.title.toLowerCase(),'path-cta');if(!disabled)cta.append(U.icon('arrow'));card.append(cta);
  }else{
   const arrow=U.icon('arrow');arrow.classList.add('path-arrow');top.append(arrow);card.append(top,U.element('h2',path.title),U.element('p',path.description||'','path-description'));
   const m=disabled?'Indisponível':meta(path);if(m){const span=U.element('span',m,'path-meta');span.id='path-'+path.id+'-meta';card.append(span);}
  }
  return card;
 }
 function pathGrid(paths,kind='primary',featured=null){const grid=U.element(kind==='primary'?'nav':'div',null,'path-grid '+(kind==='support'?'home-support':'home-primary home-paths'));
  if(kind==='primary')grid.setAttribute('aria-label','O que fazer no '+(ctx.manifest.nomeCurto||ctx.manifest.nome));
  for(const path of paths||[])grid.append(pathCard(path,{featured:kind==='primary'&&path.destination===featured,kind}));return grid;}
 function home(host,local){
  const config=experience.options.home||{},m=ctx.manifest,available=path=>['laboratorio','manual'].includes(path.destination)||S.router.screens.includes(path.destination);
  const hero=U.element('div',null,'home-hero'),text=U.element('div',null,'home-hero-text');
  const eyebrow=config.eyebrow===false?'':String(config.eyebrow||m.subtitulo||'').toLocaleUpperCase('pt-BR');if(eyebrow)text.append(U.element('p',eyebrow,'eyebrow home-eyebrow'));
  const h1=U.element('h1',null,'home-title');h1.id='home-title';h1.tabIndex=-1;h1.dataset.screenFocus='';h1.append(document.createTextNode(config.title||m.nome));
  if(config.titleAccent){h1.append(document.createTextNode(' '),U.element('span',config.titleAccent,'home-accent'));}text.append(h1);
  if(config.motto)text.append(U.element('p',config.motto,'home-motto'));if(config.description)text.append(U.element('p',config.description,'home-description'));hero.append(text);
  if(config.icon!==false){const img=U.element('img',null,'home-icon');img.src=config.icon||S.$('brand-icon')?.src||m.icone||'assets/core-icon.svg';img.alt='';img.width=144;img.height=144;hero.append(img);}host.append(hero);
  const primary=(config.primary||config.paths||[]).filter(available),featured=config.featured===false?null:config.featured||(primary.some(x=>x.destination==='laboratorio')?'laboratorio':null);
  if(primary.length){const head=U.element('div',null,'home-section-head');head.append(U.element('h2',config.sectionTitle||'Escolha seu próximo passo','home-section-title'));if(config.sectionNote!==false)head.append(U.element('span',config.sectionNote||'Da curiosidade à descoberta'));host.append(head,pathGrid(primary,'primary',featured));}
  const support=(config.support||[]).filter(available),footer=U.element('div',null,'home-footer home-preferences');
  if(support.length){if(config.supportStyle==='cards'){host.append(U.element('h2','Apoio','home-section-title'),pathGrid(support,'support'));}
   else{const nav=U.element('nav',null,'home-support home-support-links');nav.setAttribute('aria-label','Apoio e configurações');for(const path of support){const a=U.element('a',path.title);a.id='path-'+path.id;a.href=S.router.href(path.destination,path.parameter||'');a.dataset.nav=path.destination;nav.append(a);}footer.append(nav);}}
  let startupButton;startupButton=U.button('Configurações de inicialização',()=>S.shell.open('startup',startupButton),local.scope,{id:'home-startup'});startupButton.className='quiet-btn';startupButton.prepend(U.icon('settings'));footer.append(startupButton);host.append(footer);
  if(!primary.length&&!support.length)host.append(U.element('p','Nenhum caminho registrado neste domínio.'));
 }
 function learning(host){experience.themes.renderList(host);}
 function theme(host,local){experience.themes.renderDetail(host,local);}
 function notebook(host,local){return experience.notebook.render(host,local);}
 function activityList(type,host,local){
  const route=type==='route'?'roteiros':'missoes',title=type==='route'?'Roteiros Experimentais':'Missões',a=experience.activity.current;
  const items=experience.activity.list(type),selected=items.find(x=>x.id===local.params);
  if(local.params&&!selected){U.heading(host,'Atividade não encontrada','O registro pode ter mudado.');host.append(U.link('Voltar à lista',route));return;}
  if(!selected){U.heading(host,title,type==='route'?'Escolha uma investigação e prepare o Laboratório.':'Problemas abertos à investigação, com condições de sucesso.');
   /* Lista discreta da família: título, uma frase e o estado (missões) ou o módulo (roteiros) à direita. */
   const list=U.element('div',null,'content-list activity-list');for(const spec of items){const row=U.element('a',null,'content-row activity-row');row.id=type+'-open-'+spec.id;row.href=S.router.href(route,spec.id);const body=U.element('span');body.append(U.element('strong',spec.title),U.element('small',spec.subtitle||spec.description||''));
    let meta;if(type==='mission'){const done=experience.activity.completed(spec.id);meta=U.element('span',done?'Concluído':'Não realizado','status-text'+(done?' is-done':''));}else{meta=U.element('span',experience.modules.get(spec.module).title,'row-meta');meta.append(U.icon('arrow'));}
    row.append(body,meta);list.append(row);}host.append(list);if(!items.length)host.append(U.element('p','Nenhuma atividade registrada.'));return;
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
 function activityCard(host){
  const local=S.createScope(),render=()=>{
   const a=experience.activity.current;host.replaceChildren();if(!a||a.type==='free')return;const spec=experience.activity.getDefinition()||{},kind={mission:'MISSÃO',route:'ROTEIRO',teacher:'ATIVIDADE'}[a.type],done=a.status==='completed';
   const card=U.element('article',null,'activity-card');card.id='activity-card';card.append(U.element('p',kind+' · '+(done?'Concluído':a.type==='route'?'Em andamento':'Não realizado'),'eyebrow'));const h=U.element('h2',a.title);h.tabIndex=-1;card.append(h);
   U.block(card,'O problema',spec.problem||spec.description);U.block(card,'Objetivo e regras',spec.rules||'Escolha sua estratégia. Registre evidências e uma conclusão que responda ao problema.');
   const steps=(spec.steps||[]).filter(s=>s.type==='action');
   if(steps.length){const ul=U.element('ul',null,'activity-objectives');for(const s of steps){const li=U.element('li');li.dataset.objective=s.id;const met=a.objectives?.[s.id];li.append(U.element('span',s.text));if(met){li.classList.add('is-met');li.append(U.element('strong','Concluído'));}ul.append(li);}card.append(ul);}
   else card.append(U.element('p','Faça uma intervenção ou medição e use a evidência em sua conclusão.','field-hint'));
   const fields=experience.reports.fields(),conclusion=U.field(card,'Conclusão','activity-conclusion',{value:fields.conclusion,rows:4});conclusion.maxLength=6000;local.listen(conclusion,'input',()=>experience.reports.setFields({conclusion:conclusion.value}));
   const feedback=U.element('p',null,'activity-feedback');feedback.id='activity-feedback';feedback.setAttribute('role','status');card.append(feedback);
   const row=U.element('div',null,'action-row');
   if(a.type==='mission'&&!done){const go=U.button('Concluir missão',async()=>{if(await experience.activity.finish())feedback.textContent='Concluído. Síntese registrada no relatório.';},local,{id:'activity-complete',primary:true});row.append(go);}
   if(experience.options.report)row.append(U.link('Relatório','relatorios',a.sessionId,'activity-report'));card.append(row);host.append(card);
  };
  render();for(const e of ['activity:changed','activity:objective'])local.on(e,()=>{const focus=document.activeElement?.id;render();if(focus)S.$(focus)?.focus({preventScroll:true});});return()=>local.destroy();
 }
 function syncActivityPanel(){const a=experience.activity.current;if(experience.options.activityPanel===false||!a||!['mission','route','teacher'].includes(a.type)){S.workspace.setActivityGroup(null);return;}
  S.workspace.setActivityGroup({id:'atividade',title:{mission:'Missão',route:'Roteiro',teacher:'Atividade'}[a.type],heading:a.title,icon:'mission',render:host=>activityCard(host)});}
 /* Montagens prontas: configurações rápidas do laboratório (presets:[{id, title, objective, module, meta, facts, steps,
    recommended, apply(ctx), notice, confirm}]). Cada cartão mostra objetivo e passos e "Preparar no Laboratório".
    confirm troca a confirmação pedida quando já há dados (0.3.1): {title, text, label}, ou uma função (ctx) que devolve
    esse objeto conforme o estado atual, ou null/false quando não há nada a perder. O produto diz o que de fato acontece. */
 function presetsScreen(host,local){
  U.heading(host,'Montagens prontas','Configurações rápidas do Laboratório.');const grid=U.element('div',null,'setup-grid');
  for(const p of experience.options.presets||[]){const card=U.element('article',null,'setup-card');card.id='preset-'+p.id;const mod=experience.modules.get(p.module)?.title;card.append(U.element('p',[mod,p.meta].filter(Boolean).join(' · '),'eyebrow'),U.element('h2',p.title));if(p.objective)card.append(U.element('p',p.objective));
   if(p.facts?.length){const ul=U.element('ul',null,'setup-facts');p.facts.forEach(f=>ul.append(U.element('li',f)));card.append(ul);}
   if(p.steps?.length){card.append(U.element('h3','Investigue'));const ol=U.element('ol');p.steps.forEach(s=>ol.append(U.element('li',s)));card.append(ol);}
   if(p.recommended?.length)card.append(U.element('p','Recursos recomendados: '+p.recommended.join(', ')+'.','field-hint'));
   const go=U.button('Preparar no Laboratório',async()=>{if(experience.restricted){ctx.notify('Configuração definida pela atividade.',{type:'info'});return;}
     const a=experience.activity.current;let ask=p.confirm;if(typeof ask==='function'){try{ask=await ask(ctx);}catch(error){console.error('Falha na confirmação da montagem',error);ask=undefined;}}
     if(ask!==null&&ask!==false&&a&&await experience.activity.hasData()&&!await U.confirm(ctx,ask?.title||'Substituir a montagem?',ask?.text||'A configuração atual do laboratório será trocada por esta montagem. Use Desfazer ou o relatório para rever o que foi feito.',ask?.label||'Preparar'))return;
     if(p.module)await experience.modules.select(p.module);const ok=await p.apply(ctx);if(ok===false)return;await S.router.navigate('laboratorio');ctx.notify(p.notice||'Montagem pronta.',{type:'success'});},local.scope,{id:'preset-apply-'+p.id,primary:true});card.append(go);grid.append(card);}
  host.append(grid);
 }
 function about(){const a=experience.activity.current;if(!a||a.type==='free')return;const spec=experience.activity.getDefinition()||{},content=U.element('div');content.id='activity-about';content.append(U.element('h3',a.title));
  U.block(content,'O problema',spec.problem||spec.description);U.block(content,'Objetivo',spec.objective);U.block(content,'Procedimento',spec.procedure);
  content.append(U.element('p','Registre as evidências, escreva suas conclusões no relatório e finalize a atividade. Encerrar atividade sai deste contexto.','field-hint'));
  return ctx.modal.open({title:'Sobre esta atividade',content,actions:[{id:'back',label:'Voltar à atividade',primary:true}]});}
 function details(){const a=experience.activity.current;if(!a||a.type==='free')return;const spec=experience.activity.getDefinition(),help=experience.options.contextualHelp?.(a,ctx)||spec?.help||{};const content=U.element('div');content.id='activity-contextual-help';content.append(U.element('h3',a.title));
  for(const [title,text]of [['Instruções',help.instructions||spec?.instructions||spec?.description],['Objetivo',help.objective||spec?.objective],['Procedimento',help.procedure||spec?.procedure],['Condições',help.conditions||spec?.conditions],['Dicas',help.tips],['Explicações',help.explanations]])U.block(content,title,text);
  const topic=S.manual.topics.find(t=>t.id===(help.manualTopic||spec?.manualTopic));if(topic){const related=U.element('section',null,'contextual-manual');related.append(U.element('h2','Orientação relacionada: '+topic.title));const plain=value=>String(value||'').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(_,id,label)=>label||id);for(const text of [topic.summary,topic.content,topic.purpose])if(text)related.append(U.element('p',plain(text)));U.block(related,'Como usar',topic.steps.map(plain));for(const detail of topic.details)U.block(related,detail.title,plain(detail.text));content.append(related);}
  content.append(U.element('p','Módulo: '+experience.modules.get(a.module).title),U.element('p','Navegação: '+(experience.restricted?'restrita aos destinos da atividade':'livre')));
  const ids=a.restrictions.resources;content.append(U.element('p','Recursos: '+(ids===null?'todos os recursos registrados':ids.map(id=>experience.resources.get(id)?.title).join(', ')||'nenhum recurso opcional')));
  const actions=[];if(S.router.screens.includes('relatorios'))actions.push({id:'report',label:'Relatório',run:()=>{S.modal.close();S.router.navigate('relatorios',a.sessionId);}});if(a.type==='mission')actions.unshift({id:'mission',label:'Evidências e conclusão',primary:true,run:()=>{S.modal.close();S.router.navigate('missoes',a.id);}});
  ctx.modal.open({title:'Ajuda da atividade',content,actions});
 }
 experience.updateBanner=()=>{const a=experience.activity.current,banner=S.$('activity-banner');banner.hidden=!a||a.type==='free';if(banner.hidden)return;S.$('activity-banner-title').textContent=a.title;S.$('activity-banner-type').textContent=({route:'Roteiro',mission:'Missão',teacher:'Professor'}[a.type]||'Atividade')+' · '+(a.status==='completed'?'Concluído':a.navigationMode==='restricted'?'Navegação restrita':'Navegação livre');
  S.$('activity-banner-caption').textContent=(experience.options.labels?.activityCaption||'ATIVIDADE')+(a.navigationMode==='restricted'?' · MODO RESTRITO':'')+' · '+a.title;S.$('activity-banner-finish').hidden=a.stage==='finished';S.responsive?.refresh();};
 function configure(options={}){
  if(configured)throw new Error('Experiência já configurada');configured=true;experience.options=options;S.experience.current=experience;
  for(const resource of options.resources||[]){if(!U.id(resource.id)||!resource.title||experience.resources.has(resource.id))throw new TypeError('Recurso inválido ou duplicado');experience.resources.set(resource.id,{...resource});}
  for(const module of options.modules||[])experience.modules.register(module);
  for(const route of options.routes||[])experience.activity.register('route',route);
  for(const mission of options.missions||[])experience.activity.register('mission',mission);
  for(const reference of options.references||[])experience.references.register(reference);
  experience.themes.configure(options.themes||[]);experience.notebook.configure(options.notebook);
  /* Som e toque, animação de abertura e nota de Visão de cores: linhas do painel de Acessibilidade declaradas pelo domínio. */
  if(options.feedback){S.feedback.configure(options.feedback);disposers.push(()=>S.feedback.configure(null));}
  if(options.opening)disposers.push(S.opening.declare(options.opening===true?{}:options.opening));
  if(options.accessibility?.colorNote)disposers.push(S.accessibility.configure({colorNote:options.accessibility.colorNote}));
  if(options.home)registerScreen({id:'inicio',title:'Início',render:home});
  if(options.themes)registerScreen({id:'aprender',title:'Aprender',render:learning});
  if(options.themes)registerScreen({id:'tema',title:'Tema',render:theme});
  if(options.routes)registerScreen({id:'roteiros',title:'Roteiros Experimentais',render:(h,l)=>activityList('route',h,l)});
  if(options.missions)registerScreen({id:'missoes',title:'Missões',render:(h,l)=>activityList('mission',h,l)});
  if(options.notebook&&experience.notebook.available)registerScreen({id:experience.notebook.current.route,title:experience.notebook.current.title,render:notebook});
  if(options.teacher)registerScreen({id:'professor',title:'Área do Professor',render:experience.teacher.render});
  if(options.report)registerScreen({id:'relatorios',title:'Relatórios',render:experience.reports.render});
  if(Array.isArray(options.presets)&&options.presets.length){for(const p of options.presets)if(!U.id(p.id)||!p.title||typeof p.apply!=='function')throw new TypeError('Montagem pronta inválida');registerScreen({id:'montagens',title:'Montagens prontas',render:presetsScreen});}
  for(const screen of options.screens||[])registerScreen(screen);
  if(options.modulePanel!==false)ctx.panels.set('left',{title:'Módulos',render:experience.modules.render});
  ctx.scope.listen(S.$('activity-banner-details'),'click',details);ctx.scope.listen(S.$('activity-banner-exit'),'click',()=>experience.activity.exit());ctx.scope.listen(S.$('activity-banner-finish'),'click',()=>experience.activity.finalize());
  ctx.events.on('screen:changed',()=>experience.updateBanner());ctx.events.on('activity:changed',()=>experience.updateStatus());let panelKey='';ctx.events.on('activity:changed',a=>{const key=a&&a.type!=='free'?a.sessionId:'';if(key!==panelKey){panelKey=key;syncActivityPanel();}});ctx.scope.cleanup(()=>S.workspace.setActivityGroup(null));
  /* Tour do laboratório: um recurso do menu ("Tour do laboratório") e a nota de boas-vindas da primeira visita. */
  let shellOptions=options;if(options.tour){experience.tour.configure(options.tour);const tour={id:'tour',title:options.tour.title||'Tour do laboratório',icon:'tour',action:()=>experience.tour.start(S.$('core-menu'))};shellOptions={...options,shell:{...options.shell,tour:undefined,resources:[...(options.shell?.resources||[]).filter(r=>r.id!=='tour'),tour]}};}
  if(options.presets?.length&&!(shellOptions.shell?.resources||[]).some(r=>r.id==='montagens'))shellOptions={...shellOptions,shell:{...shellOptions.shell,resources:[{id:'montagens',title:'Montagens prontas',icon:'mount',destination:'montagens'},...(shellOptions.shell?.resources||[])]}};
  S.shell?.attach(ctx,experience,shellOptions);
 }
 async function ready(){if(!configured)return;const initial=typeof S.initialHash==='string'?S.initialHash:location.hash;S.initialHash=null;const preferred=S.shell?.resolveInitialHash(initial);const target=preferred?{id:preferred,param:''}:initial?S.router.parse(initial):{id:experience.options.home?'inicio':'laboratorio',param:''};await S.router.navigate(target.id,target.param,{history:false});await experience.activity.initialize();experience.updateStatus();S.shell?.inviteFirstRun?.();}
 async function destroy(){if(destroyed)return;destroyed=true;if(S.experience.current===experience){S.experience.current=null;S.$('activity-banner').hidden=true;}S.shell?.detach();await S.router.release();await experience.activity.destroy();await experience.modules.destroy();experience.themes.destroy();experience.notebook.destroy();for(const remove of disposers)remove();disposers=[];experience.references.clear();experience.resources.clear();}
 Object.assign(experience,{configure,ready,destroy,registerScreen,openAbout,details,about,async reset(){if(await U.confirm(ctx,'Reiniciar investigação?','Os dados da investigação atual serão reiniciados. Os textos do relatório e as preferências serão preservados.','Reiniciar'))await ctx.reset();}});Object.defineProperty(experience,'configured',{get:()=>configured});return experience;
};
