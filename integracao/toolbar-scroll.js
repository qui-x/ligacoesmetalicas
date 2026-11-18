'use strict';
// SILM #191: menu contextual no lugar das setas de rolagem da barra inferior.
// Ações originais preservadas; o portal evita recorte por overflow no WebKit.
(()=>{
 function init(){
  const bar=document.getElementById('silm-scene-actionbar');
  const tools=document.getElementById('silm-scene-toolbox');
  const panel=document.getElementById('silm-scene-toolbox-panel');
  if(!bar||!tools||!panel||bar.dataset.toolbarNavigation==='compact')return;
  const summary=tools.querySelector(':scope > summary');
  if(!summary)return;
  bar.dataset.toolbarNavigation='compact';
  document.body.append(panel);
  panel.hidden=true;
  summary.setAttribute('aria-controls',panel.id);
  function position(){
   if(!tools.open)return;
   const v=window.visualViewport,w=v?.width||window.innerWidth,h=v?.height||window.innerHeight;
   const rect=summary.getBoundingClientRect();
   const width=Math.min(360,Math.max(180,w-24));
   panel.style.width=width+'px';
   panel.style.left=Math.max(12,Math.min(rect.right-width,w-width-12))+'px';
   const roomAbove=Math.max(0,rect.top-12);
   const roomBelow=Math.max(0,h-rect.bottom-12);
   const placeAbove=roomAbove>=roomBelow;
   // O painel nunca pode cobrir o gatilho. Se faltar espaço, limitar a
   // altura e rolar o conteúdo dentro da gaveta, não a barra inferior.
   const available=placeAbove?roomAbove:roomBelow;
   const maxHeight=Math.min(420,Math.max(80,available));
   panel.style.maxHeight=maxHeight+'px';
   const height=Math.min(panel.scrollHeight,maxHeight);
   const top=placeAbove?rect.top-height-8:rect.bottom+8;
   panel.style.top=Math.max(8,Math.min(top,h-height-8))+'px';
  }
  function close(focus=false){
   if(!tools.open)return;
   tools.open=false;panel.hidden=true;
   if(focus)summary.focus({preventScroll:true});
  }
  tools.addEventListener('toggle',()=>{
   panel.hidden=!tools.open;
   if(tools.open){
    position();
    // O conteúdo foi portado ao body: transferir o foco de teclado para
    // a gaveta evita que Tab percorra a página fora da sequência lógica.
    requestAnimationFrame(()=>panel.querySelector('button:not([disabled]):not([hidden]), select:not([disabled]), [tabindex="0"]')?.focus({preventScroll:true}));
   }
   else if(panel.contains(document.activeElement))summary.focus({preventScroll:true});
  });
  panel.addEventListener('click',e=>{
   // Iniciar a sala 3D não troca a rota; não deixar a gaveta sobre o WebGL.
   if(e.target.closest?.('.silm-lab3d-entry'))close();
  });
  panel.addEventListener('keydown',e=>{
   if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);}
  });
  document.addEventListener('pointerdown',e=>{
   if(tools.open&&!tools.contains(e.target)&&!panel.contains(e.target)&&
      !e.target.closest?.('#silm-crystal-projection-list'))close();
  });
  document.addEventListener('si-route-changed',()=>close());
  window.addEventListener('resize',position,{passive:true});
  window.addEventListener('scroll',position,{capture:true,passive:true});
  if(window.visualViewport){
   window.visualViewport.addEventListener('resize',position,{passive:true});
   window.visualViewport.addEventListener('scroll',position,{passive:true});
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
