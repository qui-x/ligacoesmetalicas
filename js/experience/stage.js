'use strict';
/* Cena da família: cabeçalho do objeto em foco (sobretítulo, título que recebe o foco, linha de estado), estado vazio
   com a ação principal, linha de estado sob a cena e selo temporário que lembra de observar ou medir de novo.
   Também os canais de retorno: anúncio para leitor de tela e aviso de resultado que lembra o Desfazer. */
SimCore.createStage=(scope,{undo=null,owner=null}={})=>{
 const S=SimCore,U=S.ExperienceUI;let chipTimer=0,sequence=0;
 function heading(host,{eyebrow='',title='',meta='',help=null,actions=[]}={}){
  const header=U.element('header',null,'stage-heading'),e=U.element('p',eyebrow,'eyebrow stage-eyebrow');e.hidden=!eyebrow;
  const row=U.element('div',null,'name-row'),t=U.element('h1',title,'stage-title');t.tabIndex=-1;t.dataset.stageFocus='';row.append(t);
  if(help?.topic)row.append(U.helpLink(help.topic,help.subject||title));
  for(const a of actions){if(!a?.label||typeof a.run!=='function')throw new TypeError('Ação do cabeçalho inválida');const b=U.element('button',null,'icon-btn stage-action');b.type='button';b.setAttribute('aria-label',a.label);b.title=a.label;b.append(U.icon(a.icon||'settings'));scope.listen(b,'click',()=>a.run());row.append(b);}
  const m=U.element('p',meta,'stage-meta');m.hidden=!meta;header.append(e,row,m);host.append(header);
  return {element:header,focus:()=>t.focus({preventScroll:true}),
   update(patch={}){if('eyebrow' in patch){e.textContent=patch.eyebrow||'';e.hidden=!patch.eyebrow;}if('title' in patch)t.textContent=patch.title||'';if('meta' in patch){m.textContent=patch.meta||'';m.hidden=!patch.meta;}}};
 }
 function empty(host,{title='Nada por aqui ainda',text='',icon='lab',actions=[]}={}){
  const box=U.element('section',null,'stage-empty'),id='stage-empty-title-'+(++sequence);box.setAttribute('aria-labelledby',id);
  const mark=S.icons.element(icon,'stage-empty-icon'),h=U.element('h1',title);h.id=id;h.tabIndex=-1;h.dataset.stageFocus='';box.append(mark,h);
  if(text)box.append(U.element('p',text));
  if(actions.length){const row=U.element('div',null,'stage-empty-actions');for(const a of actions){let node;
    if(a.href){node=U.element('a',a.label,a.primary?'primary-btn':'secondary-btn');node.href=a.href;}
    else{if(typeof a.run!=='function')throw new TypeError('Ação do estado vazio inválida');node=U.element('button',a.label,a.primary?'primary-btn':'secondary-btn');node.type='button';scope.listen(node,'click',()=>a.run());}
    if(a.id)node.id=a.id;row.append(node);}box.append(row);}
  host.append(box);return box;
 }
 /* Linha discreta sob a cena (estado do objeto em foco); null apaga. */
 function status(text){const el=S.$('workspace-status');if(!el)return;el.textContent=text?String(text):'';el.hidden=!text;S.workspace.geometry();}
 /* Selo temporário sobre a cena ("+5 ações · observe ou meça novamente"); é visual: o anúncio vem por announce(). */
 function chip(text,{duration=2800}={}){const el=S.$('workspace-chip');if(!el)return;clearTimeout(chipTimer);el.textContent=String(text||'');el.hidden=!text;el.classList.remove('pulse');void el.offsetWidth;el.classList.add('pulse');if(text&&duration>0)chipTimer=setTimeout(()=>{el.hidden=true;},Math.max(800,duration));}
 function clear(){clearTimeout(chipTimer);status(null);const el=S.$('workspace-chip');if(el){el.hidden=true;el.textContent='';}}
 scope.cleanup(clear);
 return Object.freeze({heading,empty,status,chip,clear,
  announce:text=>S.notifications.announce(String(text)),
  /* Resultado de uma ação: aviso curto; quando a ação pode ser desfeita, lembra o Desfazer. */
  outcome(text,{type='info',undoable=false,duration=3600}={}){const hint=undoable&&undo?.canUndo?' Use Desfazer para voltar.':'';return S.notifications.show(String(text)+hint,{type,duration,owner});}});
};
