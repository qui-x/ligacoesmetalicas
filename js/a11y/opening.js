'use strict';
/* Animação de abertura da família. A Base cuida da camada, da preferência (ligada por padrão), da linha em
   Acessibilidade e do ciclo de vida; o produto decide se tem abertura e pode desenhar a sua no palco.
   1. No <head>, js/a11y/opening-gate.js marca <html data-opening="on|off"> antes do primeiro desenho.
   2. A camada #app-opening vem no início do <body> com "hidden": o produto a liga tirando "hidden" (e escrevendo a
      sua marca nela). Sem desenho próprio, a Base revela a marca com um esmaecer curto.
   3. Desenho próprio: SimCore.opening.define({duration, brandAt, safety, tagline, mount(stage) → {hide, destroy}}),
      chamado por um script do produto logo depois da camada ou antes de app.js.
   A animação de segurança recomeça quando o ciclo começa (0.3.1): um carregamento lento não corta o desenho.
   SimCore.opening.stop() encerra a abertura na hora (por exemplo, quando o produto falha ao montar).
   Toque, clique ou tecla pulam; pulada pelo teclado, o foco vai ao conteúdo da tela. "Reduzir animações", o sistema
   pedindo menos movimento ou a preferência desligada impedem a abertura. Ao terminar, emite 'opening:finished'. */
SimCore.opening=(()=>{
 const S=SimCore,KEY='opening',root=document.documentElement;let spec=null,custom=null,active=null,finished=false,auto=null;
 const enabled=()=>S.storage.core.get(KEY,true)!==false;
 const reduced=()=>!!window.A11Y?.estado?.motion||matchMedia('(prefers-reduced-motion: reduce)').matches;
 function set(on){const value=!!on;S.storage.core.set(KEY,value);if(!value)active?.stop();S.emit('opening:changed',{enabled:value});return value;}
 /* Linha "Animação de abertura" em Acessibilidade → Aparência. */
 function declare(options={}){const own={label:String(options.label||'Animação de abertura'),hint:String(options.hint??'Ao abrir ou recarregar')};spec=own;S.emit('opening:declared',{declared:true});return()=>{if(spec!==own)return;spec=null;S.emit('opening:declared',{declared:false});};}
 function define(options={}){
  if(options.mount!=null&&typeof options.mount!=='function')throw new TypeError('Abertura: mount deve ser função');
  const ms=(v,fallback)=>Number.isFinite(v)&&v>=0?v:fallback;
  custom={mount:options.mount||null,duration:ms(options.duration,options.mount?3650:2600),brandAt:ms(options.brandAt,options.mount?2350:300),safety:ms(options.safety,6000),tagline:options.tagline==null?null:String(options.tagline)};
  const layer=S.$('app-opening');if(layer)paint(layer);return()=>{custom=null;};
 }
 function paint(layer){
  const c=custom||{};layer.style.setProperty('--opening-brand-at',(c.brandAt??300)+'ms');layer.style.setProperty('--opening-safety',(c.safety??6000)+'ms');
  if(c.tagline!=null){const t=S.$('app-opening-tagline');if(t)t.textContent=c.tagline;}
 }
 /* Conteúdo principal da tela atual: recebe o foco quando a abertura é pulada pelo teclado. */
 function content(){const id=S.router?.current?.id;return id==='manual'?S.$('manual-titulo'):id==='laboratorio'?S.$('scientific-viewport'):document.querySelector('#screens-host [data-screen-focus]');}
 function finish(played){if(finished)return;finished=true;if(root.dataset.opening!=='off')root.dataset.opening='done';S.emit('opening:finished',{played});}
 /* Ciclo de vida de uma camada já na tela: pular, encerrar por tempo, sair com transição e limpar. */
 function run(layer,{duration=4000,hide=null,destroy=null,exit=400}={}){
  if(!layer?.isConnected||!enabled()||reduced()){try{destroy?.();}finally{layer?.remove?.();finish(false);}return()=>{};}
  let done=false,timer=0,exitTimer=0;
  const off=()=>{clearTimeout(timer);layer.removeEventListener('pointerdown',skip);layer.removeEventListener('click',skip);document.removeEventListener('keydown',skip,true);S.events.removeEventListener('a11y:changed',onA11y);layer.removeEventListener('animationend',onSafety);};
  const remove=()=>{off();clearTimeout(exitTimer);try{destroy?.();}catch(error){console.warn('Falha ao encerrar a abertura',error);}layer.remove();if(active===handle)active=null;finish(true);};
  function skip(event){
   if(event?.type==='pointerdown'||event?.type==='click'){event.preventDefault();event.stopPropagation();}
   if(done)return;done=true;off();
   if(event?.type==='keydown'){event.preventDefault();content()?.focus({preventScroll:true});}
   if(reduced()||typeof hide!=='function'){remove();return;}
   try{hide();}catch(error){console.warn('Falha na saída da abertura',error);}exitTimer=setTimeout(remove,exit);
  }
  function onA11y(event){if(event.detail?.reducedMotion)remove();}
  function onSafety(event){if(event.target===layer&&event.animationName==='app-opening-safety')remove();}
  layer.addEventListener('pointerdown',skip);layer.addEventListener('click',skip);document.addEventListener('keydown',skip,true);S.events.addEventListener('a11y:changed',onA11y);layer.addEventListener('animationend',onSafety);
  timer=setTimeout(skip,Math.max(0,duration));
  const handle={stop:remove,skip:()=>skip()};active=handle;return remove;
 }
 /* Chamado por app.js: toca a camada da Base quando o produto a ligou. */
 function init(){
  const layer=S.$('app-opening');
  if(!layer||layer.hidden){layer?.remove();finish(false);return;}
  auto=auto||declare();paint(layer);
  if(root.dataset.opening!=='on'||!enabled()||reduced()){layer.remove();finish(false);return;}
  const c=custom||{};let parts=null;
  layer.style.animationName='none';void layer.offsetWidth;layer.style.animationName='';
  if(c.mount){try{parts=c.mount(S.$('app-opening-stage'),{reducedMotion:false})||null;}catch(error){console.warn('Desenho da abertura omitido',error);parts=null;}}
  run(layer,{duration:c.duration??2600,exit:400,
   hide:()=>{layer.classList.add('is-leaving');try{parts?.hide?.();}catch(error){console.warn('Falha na saída do desenho',error);}},
   destroy:()=>{if(typeof parts==='function')parts();else parts?.destroy?.();}});
 }
 return {set,declare,define,run,init,stop(){active?.stop();},get enabled(){return enabled();},get allowed(){return enabled()&&!reduced();},get declared(){return spec?{...spec}:null;},get playing(){return !!active;},get finished(){return finished;}};
})();
