'use strict';
/* Aprender/Temas: hub estrutural sem progressão obrigatória ou gamificação. */
SimCore.createThemes=(ctx,experience)=>{
 const S=SimCore,U=S.ExperienceUI,records=new Map();
 const normalize=spec=>{
  if(!spec||!U.id(spec.id)||!(spec.title||spec.titulo))throw new TypeError('Tema inválido');
  const related=spec.related||spec.conteudosRelacionados||{};
  return {id:spec.id,title:String(spec.title||spec.titulo),subtitle:String(spec.subtitle||spec.subtitulo||''),description:String(spec.description||spec.descricao||spec.content||spec.conteudo||''),icon:spec.icon||spec.icone||'learn',state:spec.state||spec.estado||'available',related:{content:Array.isArray(related.content||related.conteudo)?(related.content||related.conteudo):[],investigations:Array.isArray(related.investigations||related.investigacoes)?(related.investigations||related.investigacoes):[],routes:Array.isArray(related.routes||related.roteiros)?(related.routes||related.roteiros):[],missions:Array.isArray(related.missions||related.missoes)?(related.missions||related.missoes):[]}};
 };
 function register(spec){const value=normalize(spec);if(records.has(value.id))throw new TypeError('Tema duplicado: '+value.id);records.set(value.id,value);}
 function completed(id){return ctx.storage.get('learning.theme.'+id,false)===true;}
 function toggle(id){if(!ctx.scope.active||!records.has(id)||records.get(id).state==='disabled')return false;const next=!completed(id);ctx.storage.set('learning.theme.'+id,next);SimCore.emit('theme:progress',{id,completed:next});return next;}
 function card(theme){
  const disabled=theme.state==='disabled',a=document.createElement(disabled?'article':'a');a.className='theme-card';a.id='theme-'+theme.id;if(!disabled){a.href=SimCore.router.href('tema',theme.id);a.dataset.nav='tema';}else a.setAttribute('aria-disabled','true');
  const top=U.element('div',null,'theme-card-top');top.append(U.icon(theme.icon),U.element('span',disabled?'Indisponível':completed(theme.id)?'Concluído':'Disponível','status-badge'));a.append(top,U.element('h2',theme.title));if(theme.subtitle)a.append(U.element('p',theme.subtitle,'theme-subtitle'));if(theme.description)a.append(U.element('p',theme.description));if(!disabled)a.append(U.element('span',completed(theme.id)?'Revisar tema →':'Abrir tema →','path-action'));return a;
 }
 function renderList(host){
  U.heading(host,'Aprender','Temas são pontos de entrada para conteúdo, investigações e atividades relacionadas. Todos permanecem disponíveis para revisitar.');
  const grid=U.element('div',null,'theme-grid');for(const theme of records.values())grid.append(card(theme));host.append(grid);if(!records.size)host.append(U.element('p','Nenhum tema foi registrado neste domínio.','panel-empty'));
 }
 function relatedLinks(host,theme){
  const links=[];for(const id of theme.related.routes){const item=experience.activity.get('route',id);if(item)links.push(U.link(item.title,'roteiros',id,'theme-route-'+id));}
  for(const id of theme.related.missions){const item=experience.activity.get('mission',id);if(item)links.push(U.link(item.title,'missoes',id,'theme-mission-'+id));}
  theme.related.investigations.forEach((item,index)=>{if(!item||!(item.title||item.titulo))return;links.push(U.link(item.title||item.titulo,item.destination||'laboratorio',item.parameter||'', 'theme-investigation-'+theme.id+(index?'-'+index:'')));});
  for(const item of theme.related.content){if(!item||!(item.title||item.titulo))continue;const a=U.element('a',item.title||item.titulo,'secondary-btn');if(item.href){const url=new URL(item.href,location.href);if(!['http:','https:'].includes(url.protocol))continue;a.href=url.href;}else a.href=SimCore.router.href(item.destination||'manual',item.parameter||'');a.dataset.nav=item.destination||'manual';links.push(a);}
  if(links.length){const section=U.element('section',null,'theme-related');section.append(U.element('h2','Relacionados'));const row=U.element('div',null,'action-row');links.forEach(x=>row.append(x));section.append(row);host.append(section);}
 }
 function renderDetail(host,local){
  const theme=records.get(local.params);if(!theme){U.heading(host,'Tema não encontrado','O registro pode ter mudado.');host.append(U.link('Voltar para Aprender','aprender'));return;}
  if(theme.state==='disabled'){U.heading(host,theme.title,'Este Tema está indisponível.');host.append(U.link('Voltar para Aprender','aprender'));return;}
  const wrap=U.element('article',null,'theme-detail');wrap.append(U.element('p','APRENDER · TEMA','eyebrow'),U.element('h1',theme.title));if(theme.subtitle)wrap.append(U.element('p',theme.subtitle,'page-lead'));if(theme.description)U.block(wrap,'Sobre este tema',theme.description);const actions=U.element('div',null,'action-row');const mark=U.button(completed(theme.id)?'Concluído':'Marcar como concluído',()=>{toggle(theme.id);sync();},local.scope,{id:'theme-complete'});function sync(){mark.textContent=completed(theme.id)?'Concluído':'Marcar como concluído';mark.setAttribute('aria-pressed',String(completed(theme.id)));mark.title=completed(theme.id)?'Desmarcar conclusão':'Marcar como concluído';}sync();actions.append(mark,U.link('Voltar para Aprender','aprender'));wrap.append(actions);relatedLinks(wrap,theme);host.append(wrap);
 }
 function configure(list=[]){for(const theme of list||[])register(theme);}
 return {configure,register,renderList,renderDetail,get:id=>records.get(id),list(){return [...records.values()].map(x=>({...x,related:{...x.related}}));},completed,toggle,get size(){return records.size;},destroy(){records.clear();}};
};
