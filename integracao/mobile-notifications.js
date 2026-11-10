/* SILM Parte 9 — posicionamento geométrico dos avisos, sem modificar notificações SI.
 * O contêiner é mantido no intervalo visível entre a Travessia e as docas.
 * Em telas sem intervalo útil, o CSS de contingência continua valendo. */
(()=>{
 const init=()=>{
  const rail=document.getElementById('si-notifications');
  if(!rail)return;
  const stage=document.getElementById('si-stage');
  const observed=new WeakSet();
  let frame=0;
  const ro=typeof ResizeObserver==='function'?new ResizeObserver(()=>queue()):null;
  const nodes=()=>[
   document.querySelector('#si-workspace .si-workspace-toolbar'),
   document.querySelector('#silm-module-shortcuts'),
   document.querySelector('#si-stage .silm-workshop-scales'),
   document.querySelector('#si-workspace .si-launchers')
  ].filter(Boolean);
  function clear(){
   rail.dataset.silmPositioned='false';
   rail.style.removeProperty('--silm-notice-top');
   rail.style.removeProperty('--silm-notice-bottom');
  }
  function update(){
   frame=0;
   const active=document.body.classList.contains('route-ambiente')&&innerWidth<=900;
   if(!active){clear();return;}
   for(const node of nodes())if(ro&&!observed.has(node)){
    observed.add(node);ro.observe(node);
   }
   const topNodes=nodes().slice(0,3).filter(n=>n.getClientRects().length);
   const navBottom=Math.max(0,...topNodes.map(n=>n.getBoundingClientRect().bottom));
   const dock=document.querySelector('#si-workspace .si-launchers');
   const dockTop=dock?.getClientRects().length?dock.getBoundingClientRect().top:innerHeight-58;
   const ceiling=Math.max(8,Math.ceil(navBottom)+6);
   const floor=Math.max(8,Math.ceil(innerHeight-dockTop)+6);
   if(ceiling+floor+60>innerHeight){clear();return;}
   rail.style.setProperty('--silm-notice-top',ceiling+'px');
   rail.style.setProperty('--silm-notice-bottom',floor+'px');
   rail.dataset.silmPositioned='true';
  }
  function queue(){if(frame)return;frame=requestAnimationFrame(update);}
  window.addEventListener('resize',queue,{passive:true});
  window.visualViewport?.addEventListener('resize',queue,{passive:true});
  const rootChanges=new MutationObserver(queue);
  rootChanges.observe(document.documentElement,{attributes:true,attributeFilter:['class','style']});
  rootChanges.observe(document.body,{attributes:true,attributeFilter:['class']});
  if(stage)new MutationObserver(queue).observe(stage,{attributes:true,childList:true,subtree:true,attributeFilter:['data-workshop-scale']});
  new MutationObserver(()=>{
   if(innerWidth<=900)rail.scrollTop=rail.scrollHeight;
  }).observe(rail,{childList:true});
  queue();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
