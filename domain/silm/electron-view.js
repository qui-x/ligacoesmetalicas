'use strict';
window.SILM=window.SILM||{};
/* Camada eletrônica (0.6.x): marcadores qualitativos da distribuição coletiva de elétrons de valência
   deslocalizados pela estrutura metálica inteira.
   - Um único canvas decorativo (aria-hidden): nenhum marcador é elemento DOM nem entra na ordem de tabulação.
   - Os marcadores NÃO são estado científico nem contagem de elétrons: posições e trajetórias são geradas a partir
     da estrutura desenhada e nunca são salvas.
   - Região: união de discos em torno dos centros metálicos (e, na montagem livre, pontes ao longo da árvore de
     menor distância, para que a distribuição seja uma só). O contorno da célula não é parede.
   - Movimento: passeio aleatório isotrópico (direção com difusão), sem direção macroscópica, sem órbitas e sem
     trajetórias fechadas. Não representa velocidade física nem temperatura.
   - Campo elétrico (0.7.x, condutividade): só então se soma um viés coletivo no sentido oposto ao do campo
     (portadores negativos); o passeio aleatório continua, e os marcadores que saem a jusante reentram a montante.
   - Sem laço contínuo quando oculto, estático, com movimento reduzido ou com a aba oculta. */
SILM.electronLayerLimits=Object.freeze({min:24,max:150,maxSmall:80,perCenter:6,smallStage:360});
SILM.createElectronLayer=(stage,{scope,before=null,reducedMotion=()=>false})=>{
 const L=SILM.electronLayerLimits;
 const canvas=document.createElement('canvas');canvas.className='silm-electron-canvas';canvas.setAttribute('aria-hidden','true');canvas.hidden=true;
 stage.insertBefore(canvas,before);
 const g2=canvas.getContext('2d');
 let particles=[],centers=[],bridges=[],radius=.1,visible=false,motion=false,field=false,wraps=0,frame=0,last=0,frames=0,cost=0,seed=1,colors=null,signature='',box=null;
 let width=0,height=0,dpr=1;
 /* Gerador determinístico: a distribuição estática é a mesma para a mesma estrutura. */
 const rng=()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};
 const gauss=()=>{const u=Math.max(1e-9,rng()),v=rng();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
 const effectiveMotion=()=>visible&&motion&&!reducedMotion();
 const target=()=>Math.round(Math.min(width&&width<L.smallStage?L.maxSmall:L.max,Math.max(L.min,centers.length*L.perCenter)));
 function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy,t=len?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/len)):0;return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
 /* Distância relativa à região (≤ 1: dentro) e o ponto de referência mais próximo, para conduzir de volta. */
 function nearest(p){
  let best=Infinity,ref=null;
  for(const c of centers){const d=Math.hypot(p.x-c.x,p.y-c.y)/radius;if(d<best){best=d;ref=c;}}
  for(const b of bridges){const d=segmentDistance(p,b.a,b.b)/(radius*.6);if(d<best){best=d;const dx=b.b.x-b.a.x,dy=b.b.y-b.a.y,len=dx*dx+dy*dy,t=len?Math.max(0,Math.min(1,((p.x-b.a.x)*dx+(p.y-b.a.y)*dy)/len)):0;ref={x:b.a.x+t*dx,y:b.a.y+t*dy};}}
  return {d:best,ref};
 }
 function spawn(){
  if(!centers.length)return null;
  const xs=centers.map(c=>c.x),ys=centers.map(c=>c.y),x0=Math.max(0,Math.min(...xs)-radius),x1=Math.min(1,Math.max(...xs)+radius),y0=Math.max(0,Math.min(...ys)-radius),y1=Math.min(1,Math.max(...ys)+radius);
  for(let i=0;i<400;i++){const p={x:x0+rng()*(x1-x0),y:y0+rng()*(y1-y0)};if(nearest(p).d<=1)return make(p);}
  const c=centers[Math.floor(rng()*centers.length)];return make({x:c.x+(rng()-.5)*radius,y:c.y+(rng()-.5)*radius});
 }
 function make(p,heading=rng()*Math.PI*2){return {x:p.x,y:p.y,a:heading,hold:0};}
 /* Árvore de menor distância (Prim) entre os centros da montagem livre: pontes só onde os discos não se tocam. */
 function spanningBridges(list){
  if(list.length<2)return [];const inTree=[0],out=[];const rest=new Set(list.map((_,i)=>i).slice(1));
  while(rest.size){let best=null;for(const i of inTree)for(const j of rest){const d=Math.hypot(list[i].x-list[j].x,list[i].y-list[j].y);if(!best||d<best.d)best={i,j,d};}
   inTree.push(best.j);rest.delete(best.j);if(best.d>radius*1.6)out.push({a:list[best.i],b:list[best.j]});}
  return out;
 }
 function readColors(){const cs=getComputedStyle(stage);colors={fill:cs.getPropertyValue('--silm-electron').trim()||'#5fe3ff',edge:cs.getPropertyValue('--silm-electron-edge').trim()||'#06202a'};}
 function resize(){
  const w=stage.clientWidth,h=stage.clientHeight,ratio=Math.min(2,window.devicePixelRatio||1);if(!w||!h)return;
  if(w===width&&h===height&&ratio===dpr)return;width=w;height=h;dpr=ratio;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  reconcile();draw();
 }
 function reconcile(){
  // Mantém os marcadores ainda dentro da região; completa ou reduz até a densidade visual definida.
  particles=particles.filter(p=>nearest(p).d<=1.25);const n=target();
  while(particles.length<n){const p=spawn();if(!p)break;particles.push(p);}
  if(particles.length>n)particles.length=n;   // nova densidade-alvo (ex.: tamanho da cena conhecido) vale de imediato
 }
 function draw(){
  g2.setTransform(1,0,0,1,0,0);g2.clearRect(0,0,canvas.width,canvas.height);if(!visible||!width)return;
  if(!colors)readColors();const r=Math.max(2.2,Math.min(3.6,width*.0085))*dpr;
  g2.fillStyle=colors.fill;g2.strokeStyle=colors.edge;g2.lineWidth=1.3*dpr;
  for(const p of particles){g2.beginPath();g2.arc(p.x*width*dpr,p.y*height*dpr,r,0,Math.PI*2);g2.fill();g2.stroke();}
 }
 function step(dt){
  const speed=radius*2.2,diffusion=.6,n=target();
  if(particles.length>n){const i=particles.findIndex(p=>!p.hold);if(i>=0)particles.splice(i,1);}
  for(const p of particles){
   if(p.hold>0){p.hold-=dt;continue;}
   p.a+=gauss()*Math.sqrt(2*diffusion*dt);
   const drift=field?speed*.6:0;   // campo E para +x: deslocamento médio dos elétrons para −x
   p.x+=(Math.cos(p.a)*speed*(field?.75:1)-drift)*dt;p.y+=Math.sin(p.a)*speed*(field?.75:1)*dt;
   // Sob campo, quem sai a jusante (esquerda) reentra a montante (direita): fluxo contínuo pela estrutura.
   if(field&&box&&p.x<box.x0-radius*.5){p.x=box.x1+radius*.45;wraps++;if(nearest(p).d>1.2){const q=spawn();if(q){p.x=Math.max(q.x,box.x1-radius);p.y=q.y;}}continue;}
   const {d,ref}=nearest(p);
   if(d>1.6&&!(field&&box&&p.x<box.x0)){const q=spawn();if(q){p.x=q.x;p.y=q.y;}continue;}
   // Fora da região: vira suavemente de volta (sem reflexão em parede, sem órbita).
   if(d>1&&ref&&!(field&&box&&p.x<box.x0)){const back=Math.atan2(ref.y-p.y,ref.x-p.x);let delta=back-p.a;delta=Math.atan2(Math.sin(delta),Math.cos(delta));p.a+=delta*Math.min(1,dt*5);}
   if(p.x<.01||p.x>.99)p.a=Math.PI-p.a;if(p.y<.01||p.y>.99)p.a=-p.a;p.x=Math.min(.99,Math.max(.01,p.x));p.y=Math.min(.99,Math.max(.01,p.y));
  }
 }
 function tick(now){
  frame=0;if(!effectiveMotion()||document.hidden)return;
  const t0=performance.now(),dt=Math.min(.05,Math.max(0,(now-(last||now))/1000));last=now;step(dt);draw();
  frames++;cost=cost*.9+(performance.now()-t0)*.1;frame=requestAnimationFrame(tick);
 }
 function sync(){
  canvas.hidden=!visible;canvas.dataset.running=String(effectiveMotion()&&!document.hidden);
  if(effectiveMotion()&&!document.hidden){if(!frame){last=0;frame=requestAnimationFrame(tick);}}
  else{if(frame)cancelAnimationFrame(frame);frame=0;if(particles.length>target())particles.length=target();particles.forEach(p=>p.hold=0);draw();}
 }
 /* centers: posições normalizadas (0..1) dos centros desenhados; spacing: distância normalizada entre vizinhos. */
 function update({visible:show=false,motion:move=false,field:applied=false,centers:list=[],spacing=.1,connect=false}={}){
  const sig=list.map(c=>c.x.toFixed(3)+','+c.y.toFixed(3)).join(';')+'|'+spacing.toFixed(4)+'|'+connect;
  if(sig!==signature){signature=sig;centers=list.map(c=>({x:c.x,y:c.y}));radius=Math.max(.05,Math.min(.16,spacing*.75));bridges=connect?spanningBridges(centers):[];
   // Estrutura mudou: sem movimento, a distribuição estática é refeita (uniforme e determinística para esta
   // estrutura); com movimento, os marcadores na região continuam e o conjunto se completa.
   if(!(visible&&motion&&!reducedMotion())){particles=[];seed=[...sig].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619),2166136261)|0;}reconcile();}
  if(centers.length){const xs=centers.map(c=>c.x);box={x0:Math.min(...xs),x1:Math.max(...xs)};}else box=null;
  visible=!!show&&centers.length>=SILM.electronModel.minUnits;motion=!!move;field=!!applied;readColors();sync();if(!effectiveMotion())draw();
 }
 /* Transição curta átomo isolado → estrutura: alguns marcadores aparecem junto da nova unidade e logo se
    dispersam no conjunto. Não é ionização: o átomo passa a ser centro metálico da estrutura coletiva. */
 function incorporate(position){
  if(!effectiveMotion())return;
  for(let k=0;k<4;k++){const a=k*Math.PI/2+rng()*.6;particles.push({x:position.x+Math.cos(a)*radius*.35,y:position.y+Math.sin(a)*radius*.35,a,hold:.25});}
 }
 if(window.ResizeObserver)scope.observe(new ResizeObserver(()=>resize()),stage);
 scope.listen(document,'visibilitychange',()=>sync());
 const media=matchMedia('(prefers-reduced-motion: reduce)');scope.listen(media,'change',()=>sync());
 const watcher=new MutationObserver(()=>{readColors();sync();if(!effectiveMotion())draw();});
 watcher.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-contrast','data-motion']});
 scope.cleanup(()=>{watcher.disconnect();if(frame)cancelAnimationFrame(frame);frame=0;particles=[];});
 // Diagnóstico somente leitura (testes): não expõe nem aceita estado científico.
 Object.defineProperty(canvas,'silmElectrons',{value:Object.freeze({snapshot:()=>({visible,running:!!frame,motion:effectiveMotion(),field,wraps,count:visible?particles.length:0,target:target(),frames,cost,radius,centers:centers.length,bridges:bridges.length,
  particles:visible?particles.map(p=>({x:p.x,y:p.y,dx:Math.cos(p.a),dy:Math.sin(p.a),vx:Math.cos(p.a)*(field?.75:1)-(field?.6:0),vy:Math.sin(p.a)*(field?.75:1)})):[],centerList:centers.map(c=>({...c}))})})});
 requestAnimationFrame(()=>resize());
 return Object.freeze({canvas,update,incorporate,resize,get running(){return !!frame;}});
};
/* Controles compartilhados pela montagem livre e pela estrutura cristalina: Mostrar/Ocultar elétrons,
   Movimento eletrônico e estado legível por leitor de tela. */
SILM.createElectronControls=(container,{scope,state,actions,reducedMotion=()=>false,canActivate=()=>({ok:true})})=>{
 const U=SimCore.ExperienceUI,bar=U.element('div',null,'silm-electron-bar');bar.setAttribute('role','group');bar.setAttribute('aria-label','Modelo eletrônico');
 const toggle=SILM.actionButton('Mostrar elétrons',()=>{const el=state().electrons;return el?.representation.visible?actions.hide():actions.show();},scope,{id:'silm-electrons-toggle'});
 const motion=SILM.actionButton('Movimento eletrônico',()=>actions.motion(),scope,{id:'silm-electrons-motion'});
 const status=U.element('span','','silm-electron-status');status.id='silm-electron-status';
 const help=U.element('a','?','ajuda-link');help.href='#/manual/eletrons-deslocalizados';help.setAttribute('aria-label','Ajuda: elétrons deslocalizados');help.title='Ajuda: elétrons deslocalizados';
 bar.append(toggle,motion,status,help);container.append(bar);
 function update(){
  const el=state().electrons,shown=!!el?.representation.visible,reduced=reducedMotion(),able=canActivate();
  toggle.textContent=shown?'Ocultar elétrons':'Mostrar elétrons';toggle.setAttribute('aria-pressed',String(shown));
  toggle.setAttribute('aria-disabled',String(!el&&!able.ok));toggle.title=!el&&!able.ok?able.reason:'';
  const moving=shown&&el.representation.motion&&!reduced;
  // Alternância com rótulo fixo: aria-pressed indica se o movimento visual está ativo.
  motion.setAttribute('aria-pressed',String(moving));
  motion.setAttribute('aria-disabled',String(!shown||reduced));motion.title=reduced?'Movimento reduzido ativo: a representação permanece estática e com a mesma informação.':!shown?'Mostre os elétrons para alterar o movimento.':'';
  status.textContent=!el&&!able.ok?able.reason:!shown?'Elétrons ocultos':moving?'Elétrons visíveis · movimento visual ativo':'Elétrons visíveis · representação estática'+(reduced?' (movimento reduzido)':'');
  bar.dataset.visible=String(shown);
 }
 update();return Object.freeze({root:bar,update});
};
