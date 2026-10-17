'use strict';
/* Histórico da sessão da família (ctx.history): eventos individuais em ordem cronológica, por escopo (investigação ou
   sessão), guardados no armazenamento do domínio. A linha do tempo padrão mostra horário, ação e detalhe.
   log(text) ou log({action, detail, target, at}); entries({target}); clear(); scope(id); render(host, {title, hint, empty}).
   Não entra no relatório; o Desfazer e a troca de módulo são registrados pela Base. */
SimCore.createHistory=(ctx,{limit=300}={})=>{
 const S=SimCore,U=S.ExperienceUI;let current='sessao',list=load();
 function load(){const raw=ctx.storage.get('history.'+current,[]);return Array.isArray(raw)?raw.filter(x=>x&&typeof x.action==='string'&&Number.isFinite(x.at)).slice(-limit):[];}
 function save(){ctx.storage.set('history.'+current,list);S.emit('history:changed',{scope:current,size:list.length});}
 function log(entry){
  if(!ctx.scope.active)return null;const e=typeof entry==='string'?{action:entry}:entry||{};if(!e.action)throw new TypeError('Histórico: informe a ação');
  const item={at:Number.isFinite(e.at)?e.at:Date.now(),action:String(e.action).slice(0,200),detail:e.detail?String(e.detail).slice(0,400):'',target:e.target?String(e.target):''};
  list.push(item);if(list.length>limit)list=list.slice(-limit);save();return {...item};
 }
 function scope(id){const next=String(id||'sessao').replace(/[^a-z0-9._-]/gi,'-').slice(0,80)||'sessao';if(next===current)return current;current=next;list=load();S.emit('history:changed',{scope:current,size:list.length});return current;}
 function render(host,{title='Histórico da sessão',hint='Eventos individuais, em ordem cronológica.',empty='Nenhum evento registrado nesta sessão.',filter=null}={}){
  const box=U.element('section',null,'history-view');if(title)box.append(U.element('h3',title));if(hint)box.append(U.element('p',hint,'field-hint'));const ol=U.element('ol',null,'experiment-timeline');box.append(ol);host.append(box);
  const paint=()=>{const items=list.filter(x=>!filter||filter(x));ol.replaceChildren();if(!items.length){const p=U.element('p',empty,'panel-empty');ol.replaceWith(p);return;}
   for(const x of items){const li=U.element('li'),t=U.element('time',new Date(x.at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}));t.dateTime=new Date(x.at).toISOString();const text=U.element('span');text.append(U.element('strong',x.action));if(x.detail)text.append(U.element('span',x.detail));li.append(t,text);ol.append(li);}};
  paint();const handler=()=>{if(!box.isConnected)return;const p=box.querySelector('.panel-empty');if(p)p.replaceWith(ol);paint();};S.events.addEventListener('history:changed',handler);ctx.scope.cleanup(()=>S.events.removeEventListener('history:changed',handler));return box;
 }
 return {log,scope,render,entries:({target}={})=>list.filter(x=>!target||x.target===target).map(x=>({...x})),clear(){list=[];save();},get size(){return list.length;},get current(){return current;}};
};
