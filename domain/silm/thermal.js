'use strict';
window.SILM=window.SILM||{};
/* Condução térmica contínua (P2 de docs/PLANO-PROPRIEDADES-METALICAS.md).
   Ciência (o que o modelo afirma):
   - A energia térmica passa de cada centro para os vizinhos imediatos: equação do calor discreta no grafo,
     dTᵢ/dt = D · Σⱼ (Tⱼ − Tᵢ).
   - Quando a fonte é desligada, a estrutura continua trocando calor com o ambiente e retorna gradualmente
     à temperatura ambiente de referência (T normalizada = 0).
   Didática (o que o modelo NÃO afirma):
   - D e COOLING são coeficientes didáticos iguais para todos os metais; não são condutividade, difusividade
     ou coeficiente convectivo medidos. A escala de tempo é a da animação; não há calor específico, geometria
     térmica calibrada, convecção ou radiação por metal; T vai de 0 (ambiente) a 1 (fonte), sem mudança de fase.
   Estado: só "fonte ligada" (properties.thermal.heating) é guardado; temperaturas e posição da fonte são transitórias.
   Calor + corrente (0.17.x): a mesma fonte aquece a estrutura de forma transitória e a camada de elétrons usa
   a temperatura local para o espalhamento (SILM.electronTransport). */
(()=>{
 // D didático: o calor atravessa a célula em alguns segundos visuais.
 const D=.45,COOLING=.18,DT=1/120,SETTLE=.01,AMBIENT=0;
 /* Grafo de vizinhos imediatos entre os centros desenhados (célula e, na vista Rede, a rede extensa). */
 function graph(carts,nearest){
  const n=carts.length,lim=nearest*1.05,edges=Array.from({length:n},()=>[]);
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const a=carts[i],b=carts[j];if(Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])<=lim){edges[i].push(j);edges[j].push(i);}}
  return edges;
 }
 /* Um passo explícito: difusão entre vizinhos + troca simplificada com o ambiente.
    A fonte mantém os centros sob ela em T=1 enquanto estiver ligada. */
 function step(T,edges,pinned,dt=DT,d=D,cooling=COOLING){
  const next=new Float64Array(T.length),lossRate=Math.max(0,cooling);
  for(let i=0;i<T.length;i++){
   if(pinned&&pinned.has(i)){next[i]=1;continue;}
   let s=0;for(const j of edges[i])s+=T[j]-T[i];
   const diffusion=d*dt*s,ambientLoss=lossRate*dt*Math.max(0,T[i]-AMBIENT);
   next[i]=Math.min(1,Math.max(AMBIENT,T[i]+diffusion-ambientLoss));
  }
  return next;
 }
 const spread=T=>{let lo=1,hi=0;for(const v of T){if(v<lo)lo=v;if(v>hi)hi=v;}return T.length?hi-lo:0;};
 const sum=T=>{let s=0;for(const v of T)s+=v;return s;};
 const maximum=T=>{let hi=AMBIENT;for(const v of T)if(v>hi)hi=v;return T.length?hi:AMBIENT;};
 const level=v=>Math.max(0,Math.min(4,Math.round(v*4)));
 /* Controlador contínuo, um por modelo. A vista informa o grafo (setGraph) e os centros sob a fonte (setPinned);
    o controlador avança no tempo e avisa a cada quadro. */
 const controllers=new WeakMap();
 function controller(model,{reducedMotion=()=>false}={}){
  if(controllers.has(model))return controllers.get(model);
  const listeners=new Set();let T=new Float64Array(0),edges=[],keys=[],graphKey='',pinned=new Set(),frame=0,last=0,memo=null,source=null,on=false,active=false,transient=false;
  function ctx(){if(memo)return memo;const st=model.state,p=st.properties,id=p?.active,combined=id==='electrical'&&st.structure?.mode==='crystalline';
   memo={active:id==='thermal'||combined,combined,on:id==='thermal'?!!p.thermal.heating:combined&&transient,key:(st.investigation?.id||'')+'|'+(st.metal?.atomicNumber||'')+'|'+(id||'')+'|'+(p?.startedAt||'')};queueMicrotask(()=>{memo=null;});return memo;}
  const notify=()=>{for(const f of listeners)try{f();}catch(error){console.error(error);}};
  /* A simulação só termina quando todo o grafo retorna próximo do ambiente, não quando fica uniforme e ainda quente. */
  const settled=()=>!on&&maximum(T)-AMBIENT<SETTLE;
  let stateKey='';
  function tick(now){
   frame=0;memo=null;const c=ctx();on=c.on;active=c.active;if(!active){notify();return;}
   const elapsed=last?Math.min(.1,(now-last)/1000):DT;last=now;
   for(let t=0;t<elapsed-1e-9;t+=DT)T=step(T,edges,on?pinned:null,Math.min(DT,elapsed-t));
   notify();if(settled()){last=0;return;}wake();
  }
  function wake(){if(frame||typeof requestAnimationFrame!=='function')return;if(reducedMotion()){jump();return;}frame=requestAnimationFrame(tick);}
  /* Movimento reduzido: sem animação. Com a fonte ligada, avança 2 s; desligada, calcula a regressão
     até próximo do ambiente (limite de 30 s do tempo didático) sem exigir animação. */
  function jump(){
   const duration=on?2:30;
   for(let t=0;t<duration-1e-9;t+=DT){T=step(T,edges,on?pinned:null,DT);if(settled())break;}
   notify();if(settled())last=0;
  }
  const api={
   subscribe(f){listeners.add(f);return ()=>listeners.delete(f);},
   /* Experiência nova/encerrada zera as temperaturas; com fonte desligada, o resfriamento continua. */
   sync(){memo=null;let c=ctx();if(c.key!==stateKey&&transient){transient=false;memo=null;c=ctx();}active=c.active;const wasOn=on;on=c.on;if(c.key!==stateKey||!active){stateKey=c.key;T=new Float64Array(keys.length);last=0;}
    if(active&&(on||!settled())&&(on!==wasOn||!frame))wake();},
   setGraph(key,carts,nearest,ids){if(key===graphKey)return;const old=new Map(keys.map((k,i)=>[k,T[i]]));graphKey=key;keys=ids;edges=graph(carts,nearest);T=Float64Array.from(ids,k=>old.get(k)||0);pinned=new Set([...pinned].filter(i=>i<ids.length));},
   setPinned(list){const next=new Set(list);if(next.size===pinned.size&&[...next].every(i=>pinned.has(i)))return;pinned=next;if(on)wake();},
   setSource(p){source=p?{x:p.x,y:p.y}:null;},
   /* Restaurar: volta à temperatura ambiente (a fonte fica onde está). */
   reset(){T=new Float64Array(keys.length);last=0;notify();},
   /* Calor + corrente: liga/desliga a fonte transitória sem gravar o estado científico. */
   setHeating(v){transient=!!v;memo=null;const c=ctx();on=c.on;if(c.active)wake();notify();return transient;},
   get source(){return source;},
   temperature(key){const i=keys.indexOf(key);return i<0?AMBIENT:T[i];},
   temperatures(){return new Map(keys.map((k,i)=>[k,T[i]]));},
   reading(){const c=ctx(),n=T.length,combined=c.combined,warm=n?[...T].filter(v=>v>=.5).length/n:0,max=maximum(T);return {active:c.active,combined,on:c.on,cooling:c.active&&!c.on&&max-AMBIENT>=SETTLE,ambient:AMBIENT,mean:n?sum(T)/n:AMBIENT,max,spread:spread(T),warm,uniform:spread(T)<SETTLE,full:n>0&&[...T].every(v=>v>=.95),pinned:pinned.size};},
   get pinned(){return new Set(pinned);}
  };
  controllers.set(model,api);return api;
 }
 SILM.thermal=Object.freeze({D,COOLING,DT,SETTLE,AMBIENT,graph,step,spread,sum,maximum,level,controller});
})();
