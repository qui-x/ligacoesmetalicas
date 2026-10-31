'use strict';
/* Aprender/Temas: hub estrutural sem progressão obrigatória ou gamificação. */
/* Aprender da família: lista discreta (título, resumo e "Revisado"/"Não revisado"), detalhe com "Investigar no
   Laboratório" como ação principal, missão e roteiro relacionados e o marcador de revisão. themes aceita uma lista
   (compatibilidade) ou {items, layout:'list'|'cards', heading:{title, lead}, marker:{done, pending, action}, detailHint}.
   Cada tema pode trazer investigate:{label, run(ctx)} para preparar o laboratório. */
SimCore.createThemes=(ctx,experience)=>{
 const S=SimCore,U=S.ExperienceUI,records=new Map();let view={layout:'list',heading:{title:'Temas',lead:'Escolha um tema.'},marker:{done:'Revisado',pending:'Não revisado',action:'Marcar como revisado'},detailHint:''};
 const normalize=spec=>{
  if(!spec||!U.id(spec.id)||!(spec.title||spec.titulo))throw new TypeError('Tema inválido');
  const related=spec.related||spec.conteudosRelacionados||{};
  if(spec.investigate!=null&&typeof spec.investigate.run!=='function')throw new TypeError('Tema: investigate.run deve ser função');
  return {investigate:spec.investigate||null,id:spec.id,title:String(spec.title||spec.titulo),subtitle:String(spec.subtitle||spec.subtitulo||''),description:String(spec.description||spec.descricao||spec.content||spec.conteudo||''),icon:spec.icon||spec.icone||'learn',state:spec.state||spec.estado||'available',related:{content:Array.isArray(related.content||related.conteudo)?(related.content||related.conteudo):[],investigations:Array.isArray(related.investigations||related.investigacoes)?(related.investigations||related.investigacoes):[],routes:Array.isArray(related.routes||related.roteiros)?(related.routes||related.roteiros):[],missions:Array.isArray(related.missions||related.missoes)?(related.missions||related.missoes):[]}};
 };
 function register(spec){const value=normalize(spec);if(records.has(value.id))throw new TypeError('Tema duplicado: '+value.id);records.set(value.id,value);}
 function completed(id){return ctx.storage.get('learning.theme.'+id,false)===true;}
 function toggle(id){if(!ctx.scope.active||!records.has(id)||records.get(id).state==='disabled')return false;const next=!completed(id);ctx.storage.set('learning.theme.'+id,next);SimCore.emit('theme:progress',{id,completed:next});return next;}
 function card(theme){
  const disabled=theme.state==='disabled',a=document.createElement(disabled?'article':'a');a.className='theme-card';a.id='theme-'+theme.id;if(!disabled){a.href=SimCore.router.href('tema',theme.id);a.dataset.nav='tema';}else a.setAttribute('aria-disabled','true');
  const top=U.element('div',null,'theme-card-top');top.append(U.icon(theme.icon),U.element('span',disabled?'Indisponível':completed(theme.id)?'Revisado':'Disponível','status-badge'));a.append(top,U.element('h2',theme.title));if(theme.subtitle)a.append(U.element('p',theme.subtitle,'theme-subtitle'));if(theme.description)a.append(U.element('p',theme.description));if(!disabled)a.append(U.element('span',completed(theme.id)?'Revisar tema →':'Abrir tema →','path-action'));return a;
 }
 function row(theme){
  const disabled=theme.state==='disabled',a=document.createElement(disabled?'article':'a');a.className='content-row theme-card';a.id='theme-'+theme.id;if(!disabled){a.href=SimCore.router.href('tema',theme.id);a.dataset.nav='tema';}else a.setAttribute('aria-disabled','true');
  const text=U.element('span');text.append(U.element('strong',theme.title),U.element('small',theme.subtitle||theme.description));a.append(text,U.element('span',disabled?'Indisponível':completed(theme.id)?view.marker.done:view.marker.pending,'status-text'+(completed(theme.id)?' is-done':'')));return a;
 }
 function renderList(host){
  if(view.layout==='list'){U.heading(host,view.heading.title,view.heading.lead);const list=U.element('div',null,'content-list theme-list');for(const theme of records.values())list.append(row(theme));host.append(list);if(!records.size)host.append(U.element('p','Nenhum tema foi registrado neste domínio.','panel-empty'));return;}
  U.heading(host,'Aprender','Escolha um tema para aprofundar.');
  const grid=U.element('div',null,'theme-grid');for(const theme of records.values())grid.append(card(theme));host.append(grid);if(!records.size)host.append(U.element('p','Nenhum tema foi registrado neste domínio.','panel-empty'));
 }
 function relatedLinks(host,theme,{skip=[]}={}){
  const links=[];for(const id of theme.related.routes.filter(x=>!skip.includes(x))){const item=experience.activity.get('route',id);if(item)links.push(U.link(item.title,'roteiros',id,'theme-route-'+id));}
  for(const id of theme.related.missions.filter(x=>!skip.includes(x))){const item=experience.activity.get('mission',id);if(item)links.push(U.link(item.title,'missoes',id,'theme-mission-'+id));}
  theme.related.investigations.forEach((item,index)=>{if(index===0&&!theme.investigate&&view.layout==='list')return;if(!item||!(item.title||item.titulo))return;links.push(U.link(item.title||item.titulo,item.destination||'laboratorio',item.parameter||'', 'theme-investigation-'+theme.id+(index?'-'+index:'')));});
  for(const item of theme.related.content){if(!item||!(item.title||item.titulo))continue;const a=U.element('a',item.title||item.titulo,'secondary-btn');if(item.href){const url=new URL(item.href,location.href);if(!['http:','https:'].includes(url.protocol))continue;a.href=url.href;}else a.href=SimCore.router.href(item.destination||'manual',item.parameter||'');a.dataset.nav=item.destination||'manual';links.push(a);}
  if(links.length){const section=U.element('section',null,'theme-related');section.append(U.element('h2','Relacionados'));const row=U.element('div',null,'action-row');links.forEach(x=>row.append(x));section.append(row);host.append(section);}
 }
 function renderDetail(host,local){
  const theme=records.get(local.params);if(!theme){U.heading(host,'Tema não encontrado','O registro pode ter mudado.');host.append(U.link('Voltar para Aprender','aprender'));return;}
  if(theme.state==='disabled'){U.heading(host,theme.title,'Este Tema está indisponível.');host.append(U.link('Voltar para Aprender','aprender'));return;}
  const wrap=U.element('article',null,'theme-detail');wrap.append(U.element('p','APRENDER · TEMA','eyebrow'),U.element('h1',theme.title));if(theme.subtitle)wrap.append(U.element('p',theme.subtitle,'page-lead'));if(theme.description)U.block(wrap,'Sobre este tema',theme.description);if(view.detailHint)wrap.append(U.element('p',view.detailHint,'field-hint theme-hint'));const actions=U.element('div',null,'action-row');
  const investigation=theme.investigate||(view.layout==='list'&&theme.related.investigations[0]?{label:theme.related.investigations[0].title||theme.related.investigations[0].titulo,run:()=>S.router.navigate(theme.related.investigations[0].destination||'laboratorio',theme.related.investigations[0].parameter||'')}:null);
  if(investigation){const go=U.button(investigation.label||'Investigar no Laboratório',async()=>{if(experience.restricted){ctx.notify('Configuração definida pela atividade.',{type:'info'});return;}await investigation.run(ctx);if(S.router.current?.id!=='laboratorio')await S.router.navigate('laboratorio');},local.scope,{id:'theme-investigate'});go.className='primary-btn';actions.append(go);}
  const mission=theme.related.missions.map(id=>experience.activity.get('mission',id)).find(Boolean),route=theme.related.routes.map(id=>experience.activity.get('route',id)).find(Boolean);
  if(mission)actions.append(U.link('Missão relacionada','missoes',mission.id,'theme-mission'));if(route)actions.append(U.link('Roteiro relacionado','roteiros',route.id,'theme-route'));
  const mark=U.button(completed(theme.id)?view.marker.done:view.marker.action,()=>{toggle(theme.id);sync();},local.scope,{id:'theme-complete'});mark.className='quiet-btn';function sync(){mark.textContent=completed(theme.id)?view.marker.done:view.marker.action;mark.setAttribute('aria-pressed',String(completed(theme.id)));mark.title=completed(theme.id)?'Desmarcar revisão':view.marker.action;}sync();actions.append(mark,U.link('Voltar para Aprender','aprender'));wrap.append(actions);relatedLinks(wrap,theme,{skip:view.layout==='list'?[mission?.id,route?.id]:[]});host.append(wrap);
 }
 function configure(spec=[]){const list=Array.isArray(spec)?spec:spec?.items||[];if(!Array.isArray(spec)&&spec){view={layout:spec.layout==='cards'?'cards':'list',heading:{...view.heading,...spec.heading},marker:{...view.marker,...spec.marker},detailHint:spec.detailHint??view.detailHint};}for(const theme of list)register(theme);}
 return {configure,register,renderList,renderDetail,get:id=>records.get(id),list(){return [...records.values()].map(x=>({...x,related:{...x.related}}));},completed,toggle,get size(){return records.size;},destroy(){records.clear();}};
};
