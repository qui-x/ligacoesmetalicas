'use strict';
window.SILM=window.SILM||{};
/* Condução térmica contínua (P2 de docs/PLANO-PROPRIEDADES-METALICAS.md).
   Ciência (o que o modelo afirma):
   - A energia térmica passa de cada centro para os vizinhos imediatos mais frios: equação do calor discreta no grafo de
     vizinhos da própria estrutura (distâncias da geometria do banco), dTᵢ/dt = D · Σⱼ (Tⱼ − Tᵢ).
   - Sem fonte, a energia total se conserva e a temperatura tende a ficar uniforme (equilíbrio térmico).
   - Com a fonte encostada, os centros sob ela ficam na temperatura da fonte e o calor avança pela estrutura.
   Didática (o que o modelo NÃO afirma):
   - D é um coeficiente didático único, igual para todos os metais (o banco não tem condutividade nem difusividade
     térmica com fonte); a escala de tempo é da animação, não do metal; sem perdas para o ambiente; T vai de 0
     (ambiente) a 1 (fonte), sem fusão nem mudança de fase.
   Estado: só "fonte ligada" (properties.thermal.heating) é guardado; temperaturas e posição da fonte são transitórias. */
(()=>{
 // D didático: o calor leva alguns segundos para atravessar a célula (visível); não é a difusividade do metal.
 const D=.45,DT=1/120,SETTLE=.01;
 /* Grafo de vizinhos imediatos entre os centros desenhados (célula e, na vista Rede, a rede extensa). */
 function graph(carts,nearest){
  const n=carts.length,lim=nearest*1.05,edges=Array.from({length:n},()=>[]);
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const a=carts[i],b=carts[j];if(Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])<=lim){edges[i].push(j);edges[j].push(i);}}
  return edges;
 }
 /* Um passo explícito (estável: D·dt·grau ≤ 0,45/120·12 ≈ 0,05 < 0,5). pinned: centros sob a fonte, mantidos em 1. */
 function step(T,edges,pinned,dt=DT,d=D){
  const next=new Float64Array(T.length);
  for(let i=0;i<T.length;i++){if(pinned&&pinned.has(i)){next[i]=1;continue;}let s=0;for(const j of edges[i])s+=T[j]-T[i];next[i]=Math.min(1,Math.max(0,T[i]+d*dt*s));}
  return next;
 }
 const spread=T=>{let lo=1,hi=0;for(const v of T){if(v<lo)lo=v;if(v>hi)hi=v;}return T.length?hi-lo:0;};
 const sum=T=>{let s=0;for(const v of T)s+=v;return s;};
 const level=v=>Math.max(0,Math.min(4,Math.round(v*4)));
 /* Controlador contínuo, um por modelo. A vista informa o grafo (setGraph) e os centros sob a fonte (setPinned);
    o controlador avança no tempo e avisa a cada quadro (subscribe). */
 const controllers=new WeakMap();
 function controller(model,{reducedMotion=()=>false}={}){
  if(controllers.has(model))return controllers.get(model);
  const listeners=new Set();let T=new Float64Array(0),edges=[],keys=[],graphKey='',pinned=new Set(),frame=0,last=0,memo=null,source=null,on=false,active=false;
  function ctx(){if(memo)return memo;const st=model.state,p=st.properties;memo={active:p?.active==='thermal',on:p?.active==='thermal'&&!!p.thermal.heating,key:(st.investigation?.id||'')+'|'+(st.metal?.atomicNumber||'')+'|'+(p?.startedAt||'')};queueMicrotask(()=>{memo=null;});return memo;}
  const notify=()=>{for(const f of listeners)try{f();}catch(error){console.error(error);}};
  const settled=()=>!on&&spread(T)<SETTLE;
  let stateKey='';
  function tick(now){
   frame=0;memo=null;const c=ctx();on=c.on;active=c.active;if(!active){notify();return;}
   const elapsed=last?Math.min(.1,(now-last)/1000):DT;last=now;
   for(let t=0;t<elapsed-1e-9;t+=DT)T=step(T,edges,on?pinned:null,Math.min(DT,elapsed-t));
   notify();if(settled()){last=0;return;}wake();
  }
  function wake(){if(frame||typeof requestAnimationFrame!=='function')return;if(reducedMotion()){jump();return;}frame=requestAnimationFrame(tick);}
  /* Movimento reduzido: sem animação; cada ação mostra o estado depois de 2 s de propagação. */
  function jump(){for(let t=0;t<2;t+=DT){T=step(T,edges,on?pinned:null);if(settled())break;}notify();}
  const api={
   subscribe(f){listeners.add(f);return ()=>listeners.delete(f);},
   /* Chamado a cada desenho: experiência nova (ou encerrada) zera as temperaturas; fonte ligada mantém o laço. */
   sync(){memo=null;const c=ctx();active=c.active;const wasOn=on;on=c.on;if(c.key!==stateKey||!active){stateKey=c.key;T=new Float64Array(keys.length);last=0;}
    if(active&&(on||!settled())&&(on!==wasOn||!frame))wake();},
   setGraph(key,carts,nearest,ids){if(key===graphKey)return;const old=new Map(keys.map((k,i)=>[k,T[i]]));graphKey=key;keys=ids;edges=graph(carts,nearest);T=Float64Array.from(ids,k=>old.get(k)||0);pinned=new Set([...pinned].filter(i=>i<ids.length));},
   setPinned(list){const next=new Set(list);if(next.size===pinned.size&&[...next].every(i=>pinned.has(i)))return;pinned=next;if(on)wake();},
   setSource(p){source=p?{x:p.x,y:p.y}:null;},
   /* Restaurar: volta à temperatura ambiente (a fonte fica onde está). */
   reset(){T=new Float64Array(keys.length);last=0;notify();},
   get source(){return source;},
   temperature(key){const i=keys.indexOf(key);return i<0?0:T[i];},
   temperatures(){return new Map(keys.map((k,i)=>[k,T[i]]));},
   reading(){const c=ctx(),n=T.length,warm=n?[...T].filter(v=>v>=.5).length/n:0;return {active:c.active,on:c.on,mean:n?sum(T)/n:0,spread:spread(T),warm,uniform:spread(T)<SETTLE,full:n>0&&[...T].every(v=>v>=.95),pinned:pinned.size};},
   get pinned(){return new Set(pinned);}
  };
  controllers.set(model,api);return api;
 }
 SILM.thermal=Object.freeze({D,DT,SETTLE,graph,step,spread,sum,level,controller});
})();
