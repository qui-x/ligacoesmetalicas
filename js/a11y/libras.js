'use strict';
/* Tradutor de Libras (VLibras), opcional: carrega o componente oficial só quando a pessoa liga a opção
   (Acessibilidade → Outros recursos). Precisa de internet. Ao desligar, o tradutor sai da tela ao recarregar. */
SimCore.libras=(()=>{
 const SRC='https://vlibras.gov.br/app/vlibras-plugin.js',APP='https://vlibras.gov.br/app';let loading=null,available=true;
 const enabled=()=>SimCore.storage.core.get('libras',false)===true;
 function remove(){document.getElementById('vlibras-widget')?.remove();document.getElementById('vlibras-script')?.remove();loading=null;}
 function load(){
  if(loading)return loading;if(document.getElementById('vlibras-widget'))return Promise.resolve(true);
  const widget=document.createElement('div');widget.setAttribute('vw','');widget.className='enabled';widget.id='vlibras-widget';
  widget.innerHTML='<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';document.body.append(widget);
  loading=new Promise(resolve=>{const s=document.createElement('script');s.id='vlibras-script';s.src=SRC;s.async=true;
   s.onload=()=>{try{new window.VLibras.Widget(APP);resolve(true);}catch(error){console.warn('VLibras indisponível',error);fail();resolve(false);}};
   s.onerror=()=>{fail();resolve(false);};document.body.append(s);});
  return loading;
 }
 function fail(){remove();SimCore.notifications.show('O VLibras não pôde ser carregado agora. Verifique a conexão ou tente mais tarde.',{type:'warning'});}
 async function set(on){SimCore.storage.core.set('libras',!!on);if(on)return load();SimCore.notifications.show('O tradutor de Libras sai da tela ao recarregar a página.',{type:'info'});return false;}
 return {set,load,get enabled(){return enabled();},get available(){return available;},hide(){available=false;SimCore.emit('libras:availability',{available});},show(){available=true;SimCore.emit('libras:availability',{available});},init(){if(enabled())load();}};
})();
