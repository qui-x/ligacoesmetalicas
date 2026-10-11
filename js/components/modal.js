'use strict';
SimCore.modal=(()=>{
 let current=null,sequence=0;
 function close(value=null){current?.close(value);}
 function open({title='Informação',content='',actions=[],size='standard',dismissible=true,owner=null}={}){
  if(current)close();
  const el=document.createElement('dialog'),id='core-modal-'+(++sequence),origin=document.activeElement;
  el.className='app-dialog';el.dataset.size=size==='wide'?'wide':'standard';el.setAttribute('aria-labelledby',id);el.setAttribute('aria-modal','true');
  const header=document.createElement('header');header.className='dialog-heading';const h=document.createElement('h2');h.id=id;h.textContent=title;header.append(h);
  if(dismissible){const b=document.createElement('button');b.type='button';b.className='quiet-btn';b.textContent='Fechar';b.setAttribute('aria-label','Fechar '+title);b.addEventListener('click',()=>el.close());header.append(b);}
  const body=document.createElement('div');body.className='dialog-body';if(typeof content==='function')content(body);else SimCore.content(body,content);
  const footer=document.createElement('footer');footer.className='dialog-actions';
  for(const a of actions){const b=document.createElement('button');b.type='button';b.textContent=a.label;b.className=a.intent==='danger'?'danger-btn':a.primary?'primary-btn':'secondary-btn';b.addEventListener('click',async()=>{b.disabled=true;try{const result=await a.run?.();if(result!==false)el.close(a.id||a.label);}catch(e){console.error('Falha na ação do diálogo',e);SimCore.notifications.show('Não foi possível concluir esta ação.',{type:'error',owner});}finally{b.disabled=false;}});footer.append(b);}
  if(!dismissible&&!actions.length)throw new TypeError('Modal precisa de uma ação de saída.');
  el.append(header,body);if(actions.length)el.append(footer);document.body.append(el);SimCoreCompat.prepararDialogos();
  let settle;const entry={element:el,owner,close:value=>{if(el.open)el.close(value==null?'':String(value));settle(value==null?'':String(value));}};current=entry;
  const result=new Promise(resolve=>{let done=false;settle=value=>{if(done)return;done=true;if(current===entry)current=null;el.remove();if(origin?.isConnected&&!origin.closest('[inert],[hidden]')&&!document.querySelector('dialog[open]'))origin.focus({preventScroll:true});resolve(value);};el.addEventListener('close',()=>settle(el.returnValue),{once:true});});
  el.addEventListener('cancel',e=>{if(!dismissible)e.preventDefault();});el.addEventListener('keydown',e=>SimCore.trap(e,el));
  el.showModal();(SimCore.focusables(el)[0]||el).focus();
  return {element:el,result,close:entry.close};
 }
 return {open,close,closeOwner:owner=>{if(current?.owner===owner)close();},get current(){return current;}};
})();
