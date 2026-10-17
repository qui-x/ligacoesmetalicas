'use strict';
/* Desfazer da família: cada mudança reversível tem um nome. O botão diz "Desfazer: <ação>", o leitor de tela
   ouve "Desfeito: <ação>." e o foco volta ao título da cena quando o botão usado deixa de existir.
   Dois modos: pilha própria (push(label, revert)) ou adaptador de um histórico do domínio (bind({canUndo, label, undo})). */
SimCore.createUndo=(scope,{limit=60,onUndo=null}={})=>{
 const S=SimCore;let stack=[],adapter=null,busy=false;
 const notify=()=>{S.workspace.actions.bindUndo(api);S.emit('undo:changed',{canUndo:api.canUndo,label:api.label});};
 const api={
  push(label,revert){
   if(adapter)throw new TypeError('Desfazer já está ligado a um histórico do domínio');
   if(typeof revert!=='function'||!String(label||'').trim())throw new TypeError('Entrada de desfazer inválida');
   stack.push({label:String(label).trim(),revert});if(stack.length>limit)stack.shift();notify();
  },
  bind(spec){
   if(spec&&(typeof spec.canUndo!=='function'||typeof spec.undo!=='function'))throw new TypeError('Adaptador de desfazer inválido');
   adapter=spec||null;stack=[];notify();
  },
  clear(){stack=[];notify();},
  refresh:notify,
  get canUndo(){try{return adapter?!!adapter.canUndo():stack.length>0;}catch(error){console.error('Falha ao consultar o desfazer',error);return false;}},
  get label(){try{return adapter?String(adapter.label?.()||''):stack.at(-1)?.label||'';}catch{return '';}},
  async undo(){
   if(busy||!api.canUndo)return false;busy=true;const label=api.label;
   try{if(adapter)await adapter.undo();else await stack.pop().revert();}
   catch(error){console.error('Falha ao desfazer',error);S.notifications.show('Não foi possível desfazer esta ação.',{type:'error'});return false;}
   finally{busy=false;notify();}
   S.notifications.announce(label?'Desfeito: '+label+'.':'Ação desfeita.');try{onUndo?.(label);}catch(error){console.error('Falha ao registrar o Desfazer',error);}
   const focus=document.activeElement;
   if(!focus||focus===document.body||focus.closest('[hidden],[inert]')||!focus.isConnected)(document.querySelector('#viewport-content [data-stage-focus]')||S.$('scientific-viewport'))?.focus({preventScroll:true});
   return true;
  }
 };
 scope.cleanup(()=>{stack=[];adapter=null;S.workspace.actions.bindUndo(null);});
 notify();
 return api;
};
