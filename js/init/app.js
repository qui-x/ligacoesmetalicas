'use strict';
(()=>{
 const S=SimCore,$=S.$,U=S.ExperienceUI;
 S.initialHash=location.hash;S.notifications.init();S.workspace.init();S.viewport.init();S.accessibility.init();S.responsive.init();S.manual.init();S.pwa.init();S.router.init();S.shell.init();SimCoreCompat.prepararDialogos();
 document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();const id=S.router.current?.id;const node=id==='manual'?$('manual-titulo'):id==='laboratorio'?$('scientific-viewport'):$('screens-host').querySelector('[data-screen-focus]');node?.focus();});
 /* Na inicialização as telas do domínio ainda não estão registradas: endereço desconhecido segue em silêncio para o padrão, e a experiência reabre o endereço inicial (S.initialHash) depois do registro. */
 S.router.navigate(S.router.parse(location.hash).id,S.router.parse(location.hash).param,{history:false,quiet:true});S.ready=true;SimCoreCompat.concluir();S.emit('core:ready',{});
})();
