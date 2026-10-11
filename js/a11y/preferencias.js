'use strict';
SimCore.accessibility=(()=>{
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const state=()=>({...A11Y.estado,colorVision:A11Y.estado.colorblind,reducedMotion:A11Y.estado.motion||media.matches});
 function publish(){
  const e=state();document.documentElement.classList.toggle('large-text',e.fontScale>=1.4);
  const params=new URLSearchParams(location.search),prefs=new URLSearchParams(A11Y.query());for(const [k,v]of prefs)params.set(k,v);
  try{history.replaceState(null,'',location.pathname+'?'+params+location.hash);}catch(_){}
  SimCore.emit('a11y:changed',e);SimCore.emit('theme:changed',{theme:e.theme,contrast:e.contrast});
 }
 const define=A11Y.definir.bind(A11Y);A11Y.definir=(key,value)=>{define(key,value);publish();};
 // Duas superfícies, um estado e um motor. Cada montagem devolve sua limpeza.
 function renderControls(body,{prefix=''}={}){
  const scope=SimCore.createScope(),fields=[];
  const hint=document.createElement('p');hint.className='field-hint';hint.textContent='As preferências valem para toda a aplicação.';body.append(hint);
  const row=(id,label,key,type='checkbox',options=[])=>{const l=document.createElement('label');l.className=type==='checkbox'?'check-row':'field';l.htmlFor=prefix+id;const input=document.createElement(type==='select'?'select':'input');input.id=prefix+id;if(type!=='select')input.type=type;if(type==='select')for(const [value,text]of options){const o=document.createElement('option');o.value=value;o.textContent=text;input.append(o);}if(type==='checkbox')l.append(input,document.createTextNode(label));else l.append(document.createTextNode(label),input);body.append(l);fields.push({input,key,type});scope.listen(input,'change',()=>A11Y.definir(key,type==='checkbox'?input.checked:input.value));return input;};
  row('theme-select','Tema','theme','select',[['dark','Escuro'],['light','Claro']]);
  for(const [id,label,key]of [['contrast-check','Alto contraste','contrast'],['spacing-check','Ampliar espaçamento','spacing'],['motion-check','Reduzir movimento','motion']])row(id,label,key);
  row('reading-select','Leitura','reading','select',[['off','Padrão'],['on','Fonte simplificada']]);
  const font=document.createElement('div');font.className='field';const label=document.createElement('span');label.textContent='Tamanho do texto';const controls=document.createElement('div');controls.className='preference-font';
  const minus=document.createElement('button'),plus=document.createElement('button'),output=document.createElement('output');
  for(const [button,id,text,name]of [[minus,'font-minus','A−','Diminuir texto'],[plus,'font-plus','A+','Aumentar texto']]){button.type='button';button.id=prefix+id;button.className='secondary-btn';button.textContent=text;button.setAttribute('aria-label',name);}
  output.id=prefix+'font-output';output.setAttribute('aria-live','polite');controls.append(minus,output,plus);font.append(label,controls);body.append(font);
  for(const [button,delta]of [[minus,-.05],[plus,.05]])scope.listen(button,'click',()=>A11Y.definir('fontScale',Math.round(Math.max(.75,Math.min(2,A11Y.estado.fontScale+delta))*100)/100));
  row('color-select','Visão de cores','colorblind','select',[['none','Padrão'],['protanopia','Protanopia'],['deuteranopia','Deuteranopia'],['tritanopia','Tritanopia'],['acromatopsia','Acromatopsia']]);
  const sync=()=>{for(const {input,key,type}of fields)if(type==='checkbox')input.checked=!!A11Y.estado[key];else input.value=A11Y.estado[key];output.textContent=Math.round(A11Y.estado.fontScale*100)+'%';minus.disabled=A11Y.estado.fontScale<=.75;plus.disabled=A11Y.estado.fontScale>=2;};
  scope.on('a11y:changed',sync);sync();return()=>scope.destroy();
 }
 function open(){SimCore.shell?.close();const body=document.createElement('div'),cleanup=renderControls(body),handle=SimCore.modal.open({title:'Acessibilidade',content:body,owner:'core'});handle.result.finally(cleanup);return handle;}
 return {get state(){return state();},get reducedMotion(){return state().reducedMotion;},set:(key,value)=>A11Y.definir(key,value),init(){SimCore.$('access-btn').addEventListener('click',()=>SimCore.shell.open('accessibility',SimCore.$('access-btn')));media.addEventListener('change',publish);window.addEventListener('pageshow',publish);publish();},open,renderControls};
})();
