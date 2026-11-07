'use strict';
// SILM R09: a faixa de ferramentas permanece em uma única linha e rola
// horizontalmente; as setas tornam explícitos os comandos fora da tela.
(()=>{
 function init(){
  const bar=document.getElementById('silm-scene-actionbar');
  if(!bar||bar.dataset.toolbarNavigation==='ready')return;
  bar.dataset.toolbarNavigation='ready';
  const make=(side,label,glyph)=>{
   const button=document.createElement('button');
   button.type='button';button.className='silm-toolbar-scroll-arrow silm-toolbar-scroll-'+side;
   button.setAttribute('aria-label',label);
   button.setAttribute('title',label);
   button.textContent=glyph;
   button.hidden=true;
   return button;
  };
  const prev=make('prev','Mostrar ferramentas anteriores','‹');
  const next=make('next','Mostrar próximas ferramentas','›');
  bar.prepend(prev);bar.append(next);
  let frame=0;
  function update(){
   const overflow=bar.scrollWidth>bar.clientWidth+4;
   const canLeft=overflow&&bar.scrollLeft>3;
   const canRight=overflow&&bar.scrollLeft+bar.clientWidth<bar.scrollWidth-3;
   if(prev.hidden===canLeft)prev.hidden=!canLeft;
   if(next.hidden===canRight)next.hidden=!canRight;
   if(bar.dataset.toolbarOverflow!==String(overflow))bar.dataset.toolbarOverflow=String(overflow);
  }
  function schedule(){
   if(frame)return;
   frame=requestAnimationFrame(()=>{frame=0;update();});
  }
  const scroll=direction=>{
   bar.scrollBy({left:direction*Math.max(128,bar.clientWidth*.62),
    behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
   schedule();
  };
  prev.addEventListener('click',()=>scroll(-1));
  next.addEventListener('click',()=>scroll(1));
  bar.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  const resize=typeof ResizeObserver!=='undefined'?new ResizeObserver(schedule):null;
  resize?.observe(bar);
  for(const id of ['silm-view-controls','silm-view-quick-actions']){const child=document.getElementById(id);if(child)resize?.observe(child);}
  const mutation=new MutationObserver(schedule);
  mutation.observe(bar,{subtree:true,childList:true,attributes:true,
   attributeFilter:['hidden','class','aria-expanded','aria-pressed']});
  schedule();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
