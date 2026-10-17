'use strict';
/* Painel de Acessibilidade da família: linhas com ícone, rótulo, dica curta e interruptor (a linha inteira é clicável),
   em grupos — Aparência, Visão de cores, Som e toque e Outros recursos — e "Restaurar padrões" no fim.
   Duas superfícies (menu ☰ e diálogo), um estado e um motor (a11y.js). As linhas de abertura e de som e toque só
   aparecem quando o domínio as declara; a do VLibras some quando o produto a esconde (SimCore.libras.hide()). */
SimCore.accessibility=(()=>{
 const S=SimCore,media=matchMedia('(prefers-reduced-motion: reduce)');
 const DEFAULTS=Object.freeze({theme:'dark',contrast:false,fontScale:1,spacing:false,motion:false,reading:'off',colorblind:'none'});
 const FONT=Object.freeze({step:.1,min:.8,max:2});
 const COLOR_NOTE='Os filtros simulam diferenças de percepção; não corrigem o daltonismo.';
 let colorNote='';
 const state=()=>({...A11Y.estado,colorVision:A11Y.estado.colorblind,reducedMotion:A11Y.estado.motion||media.matches});
 function publish(){
  const e=state();document.documentElement.classList.toggle('large-text',e.fontScale>=1.4);
  const params=new URLSearchParams(location.search),prefs=new URLSearchParams(A11Y.query());for(const [k,v]of prefs)params.set(k,v);
  try{history.replaceState(null,'',location.pathname+'?'+params+location.hash);}catch(_){}
  S.emit('a11y:changed',e);S.emit('theme:changed',{theme:e.theme,contrast:e.contrast});
 }
 const define=A11Y.definir.bind(A11Y);A11Y.definir=(key,value)=>{define(key,value);publish();};
 /* Volta tudo ao padrão (o tradutor de Libras fica como está, como no restante da família) e avisa uma vez. */
 function restore(){
  for(const [key,value]of Object.entries(DEFAULTS))define(key,value);
  if(S.feedback.sound)S.feedback.set('sound',false);if(S.feedback.haptics)S.feedback.set('haptics',false);if(!S.opening.enabled)S.opening.set(true);
  publish();S.notifications.show('Preferências de acessibilidade restauradas.',{type:'success'});
 }
 // Duas superfícies, um estado e um motor. Cada montagem devolve sua limpeza.
 function renderControls(body,{prefix=''}={}){
  const scope=S.createScope(),sync=[],id=name=>prefix+name;body.classList.add('a11y-panel');
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};
  const title=text=>{const p=el('p','a11y-panel-title',text);body.append(p);return p;};
  /* Rótulo da linha: ícone, nome e dica. O nome acessível do controle é só o nome; a dica vira descrição. */
  function label(icon,name,hint,inputId){
   const wrap=el('span','a11y-row-label'),text=el('span'),strong=el('span','a11y-row-name',name);strong.id=inputId+'-label';text.append(strong);
   if(hint){const h=el('span','a11y-row-dica',hint);h.id=inputId+'-hint';text.append(h);}
   wrap.append(S.icons.element(icon,'a11y-row-icon'),text);return wrap;
  }
  function toggle({key,icon,name,hint='',get,set}){
   const inputId=id(key),row=el('label','a11y-row');row.htmlFor=inputId;row.dataset.a11y=key;
   const sw=el('span','switch'),input=el('input');input.type='checkbox';input.setAttribute('role','switch');input.id=inputId;
   input.setAttribute('aria-labelledby',inputId+'-label');if(hint)input.setAttribute('aria-describedby',inputId+'-hint');
   const track=el('span','track');track.setAttribute('aria-hidden','true');track.append(el('span','thumb'));sw.append(input,track);
   row.append(label(icon,name,hint,inputId),sw);body.append(row);
   scope.listen(input,'change',()=>set(input.checked));sync.push(()=>{input.checked=!!get();});return row;
  }
  title('Aparência');
  toggle({key:'theme-dark',icon:'theme-dark',name:'Modo escuro',get:()=>A11Y.estado.theme!=='light',set:on=>A11Y.definir('theme',on?'dark':'light')});
  toggle({key:'contrast-check',icon:'contrast',name:'Alto contraste',get:()=>A11Y.estado.contrast,set:on=>A11Y.definir('contrast',on)});
  const fontRow=el('div','a11y-row a11y-row-font'),fontId=id('font');fontRow.append(label('text-size','Tamanho do texto','',fontId));
  const step=el('span','fontstep');step.setAttribute('role','group');step.setAttribute('aria-labelledby',fontId+'-label');
  const minus=el('button','fontstep-btn','A−'),output=el('output'),plus=el('button','fontstep-btn','A+');
  for(const [button,key,name]of [[minus,'font-minus','Diminuir texto'],[plus,'font-plus','Aumentar texto']]){button.type='button';button.id=id(key);button.setAttribute('aria-label',name);}
  output.id=id('font-output');output.setAttribute('aria-live','polite');step.append(minus,output,plus);fontRow.append(step);body.append(fontRow);
  for(const [button,delta]of [[minus,-FONT.step],[plus,FONT.step]])scope.listen(button,'click',()=>A11Y.definir('fontScale',Math.round(Math.max(FONT.min,Math.min(FONT.max,A11Y.estado.fontScale+delta))*100)/100));
  sync.push(()=>{const v=A11Y.estado.fontScale;output.textContent=Math.round(v*100)+'%';minus.disabled=v<=FONT.min;plus.disabled=v>=FONT.max;});
  toggle({key:'spacing-check',icon:'spacing',name:'Espaçamento de letras',get:()=>A11Y.estado.spacing,set:on=>A11Y.definir('spacing',on)});
  toggle({key:'motion-check',icon:'motion',name:'Reduzir animações',get:()=>A11Y.estado.motion,set:on=>A11Y.definir('motion',on)});
  const opening=S.opening.declared;
  if(opening)toggle({key:'opening-check',icon:'opening',name:opening.label,hint:opening.hint,get:()=>S.opening.enabled,set:on=>{S.opening.set(on);S.notifications.show(on?'A animação de abertura toca na próxima vez que o aplicativo abrir.':'Animação de abertura desligada.',{type:'info'});}});
  toggle({key:'reading-check',icon:'reading',name:'Leitura simples',hint:'Texto maior e cores mais firmes',get:()=>A11Y.estado.reading==='on',set:on=>A11Y.definir('reading',on?'on':'off')});
  title('Visão de cores');
  const colorRow=el('div','a11y-row a11y-row-select'),colorId=id('color-select');colorRow.append(label('color-vision','Simular daltonismo','',colorId));
  const select=el('select');select.id=colorId;select.setAttribute('aria-labelledby',colorId+'-label');
  for(const [value,text]of [['none','Nenhum'],['protanopia','Protanopia'],['deuteranopia','Deuteranopia'],['tritanopia','Tritanopia'],['acromatopsia','Acromatopsia']]){const o=el('option',null,text);o.value=value;select.append(o);}
  colorRow.append(select);body.append(colorRow,el('p','a11y-dica',COLOR_NOTE+(colorNote?' '+colorNote:'')));
  scope.listen(select,'change',()=>A11Y.definir('colorblind',select.value));sync.push(()=>{select.value=A11Y.estado.colorblind;});
  const feedback=S.feedback.config;
  if(feedback?.sound||feedback?.haptics){
   title('Som e toque');
   if(feedback.sound)toggle({key:'sound-check',icon:'sound',name:feedback.sound.label,hint:feedback.sound.hint,get:()=>S.feedback.sound,set:on=>{S.feedback.set('sound',on);if(on)S.feedback.tone(feedback.sound.preview);}});
   if(feedback.haptics)toggle({key:'vibrate-check',icon:'vibrate',name:feedback.haptics.label,hint:feedback.haptics.hint,get:()=>S.feedback.haptics,set:on=>{S.feedback.set('haptics',on);if(on)S.feedback.vibrate();}});
  }
  if(S.libras.available){title('Outros recursos');toggle({key:'libras-check',icon:'libras',name:'Tradutor de Libras (VLibras)',hint:'Precisa de internet',get:()=>S.libras.enabled,set:on=>{S.libras.set(on);}});}
  const reset=el('button','quiet-btn a11y-restaurar');reset.type='button';reset.id=id('a11y-restore');reset.append(S.icons.element('restore'),document.createTextNode('Restaurar padrões'));body.append(reset);
  scope.listen(reset,'click',restore);
  const refresh=()=>{for(const fn of sync)fn();};
  for(const event of ['a11y:changed','feedback:changed','opening:changed'])scope.on(event,refresh);refresh();
  return()=>{scope.destroy();body.classList.remove('a11y-panel');};
 }
 function open(){S.shell?.close();const body=document.createElement('div'),cleanup=renderControls(body),handle=S.modal.open({title:'Acessibilidade',content:body,owner:'core'});handle.result.finally(cleanup);return handle;}
 /* O domínio pode acrescentar uma frase à nota de Visão de cores (ex.: como as cores da cena também são descritas). */
 function configure({colorNote:note=''}={}){colorNote=String(note||'');return()=>{colorNote='';};}
 return {get state(){return state();},get reducedMotion(){return state().reducedMotion;},set:(key,value)=>A11Y.definir(key,value),restore,configure,defaults:DEFAULTS,
  init(){S.$('access-btn').addEventListener('click',()=>S.shell.open('accessibility',S.$('access-btn')));media.addEventListener('change',publish);window.addEventListener('pageshow',publish);publish();},open,renderControls};
})();
