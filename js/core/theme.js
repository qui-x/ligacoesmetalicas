'use strict';
SimCore.theme=(()=>{
 const tokens=Object.freeze({primary:'--primary',onPrimary:'--on-primary',secondary:'--secondary',accent:'--accent',surface:'--panel',background:'--bg',text:'--text',border:'--border',scientificAccent:'--scientific-accent',textAccent:'--text-accent'});let current=null;
 function paint(){const root=document.documentElement;for(const css of Object.values(tokens))root.style.removeProperty(css);if(!current||SimCore.accessibility.state.contrast)return;const colors=current[SimCore.accessibility.state.theme]||current;for(const [name,value]of Object.entries(colors)){if(!tokens[name])continue;if(typeof value!=='string'||!CSS.supports('color',value))throw new TypeError('Token de cor inválido: '+name);root.style.setProperty(tokens[name],value);}}
 SimCore.events.addEventListener('theme:changed',paint);
 return {tokens,apply(theme){current=theme;paint();},get current(){return current;}};
})();
