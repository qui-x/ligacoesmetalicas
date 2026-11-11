'use strict';
window.SILM=window.SILM||{};

// Bancada didática em grandezas relativas. Cada sítio armazena calor e cada par
// de primeiros vizinhos conduz carga e calor. A malha pertence à amostra inteira.
SILM.electrothermal=(()=>{
 const sum=values=>values.reduce((total,x)=>total+x,0);
 function buildNetwork(g){
  const sites=[...new Map([...g.lattice(),...g.cell].map(s=>[s.key,s])).values()];
  if(sites.length<2)return null;
  const byKey=new Map(sites.map((s,i)=>[s.key,i])),shells=new Map(),unique=new Map();
  for(const [i,s] of sites.entries()){
   if(!shells.has(s.basis)){
    const neighbors=g.neighbors(s);
    shells.set(s.basis,neighbors.list.map((n,k)=>({offset:n.cell.map((v,a)=>v-s.cell[a]),basis:n.basis,d:neighbors.distances[k]})));
   }
   for(const n of shells.get(s.basis)){
    const cell=s.cell.map((v,a)=>v+n.offset[a]),j=byKey.get(SILM.crystal.key({cell,basis:n.basis}));
    if(j===undefined||j===i||!(n.d>0))continue;
    const a=Math.min(i,j),b=Math.max(i,j);
    unique.set(a+','+b,{a,b,length:n.d});
   }
  }
  const edges=[...unique.values()];
  if(!edges.length)return null;
  const shortest=Math.min(...edges.map(e=>e.length)),adj=sites.map(()=>[]);
  for(const e of edges){e.weight=shortest/e.length;adj[e.a].push(e.b);adj[e.b].push(e.a);}
  const seen=new Set([0]),queue=[0];
  for(let k=0;k<queue.length;k++)for(const j of adj[queue[k]])if(!seen.has(j)){seen.add(j);queue.push(j);}
  if(seen.size!==sites.length)return null;
  const xs=sites.map(s=>s.cart[0]),low=Math.min(...xs),high=Math.max(...xs),span=high-low;
  if(span<1e-8)return null;
  const fraction=xs.map(x=>(high-x)/span),terminal=fraction.map(x=>x<1e-7?0:x>1-1e-7?1:-1);
  const inside=sites.map((_,i)=>i).filter(i=>terminal[i]<0);
  if(!inside.length)return null;
  const source=inside.reduce((best,i)=>Math.hypot(...sites[i].cart.map((v,k)=>v-g.center[k]))<Math.hypot(...sites[best].cart.map((v,k)=>v-g.center[k]))?i:best);
  return {sites,byKey,edges,fraction,terminal,inside,source};
 }
 // Problema de Dirichlet com tensão unitária. O laplaciano com os terminais
 // fixos é positivo definido no interior; gradientes conjugados resolvem Kirchhoff.
 function electrical(net,T,initial){
  const {sites,edges,terminal,inside}=net,n=sites.length;
  const G=edges.map(({a,b,weight})=>weight/(1+.5*(T[a]+T[b])/2));
  const x=Float64Array.from(initial||net.fraction);
  function laplacian(v){
   const out=new Float64Array(n);
   edges.forEach(({a,b},i)=>{const current=G[i]*(v[a]-v[b]);out[a]+=current;out[b]-=current;});
   return out;
  }
  const flux=laplacian(x),r=new Float64Array(n);
  for(const i of inside)r[i]=-flux[i];
  const direction=r.slice(),dot=(a,b)=>inside.reduce((v,i)=>v+a[i]*b[i],0);
  let norm=dot(r,r);
  for(let k=0;norm>1e-18&&k<2*n;k++){
   const q=laplacian(direction),den=dot(direction,q);
   if(!(den>0))return null;
   const step=norm/den;
   for(const i of inside){x[i]+=step*direction[i];r[i]-=step*q[i];}
   const next=dot(r,r);
   for(const i of inside)direction[i]=r[i]+next/norm*direction[i];
   norm=next;
  }
  if(!(norm<=1e-18))return null;
  const currents=laplacian(x),conductance=sum(currents.filter((_,i)=>terminal[i]===1));
  return conductance>0?{potential:x,G,conductance}:null;
 }
 const valid=c=>c&&['voltage','current'].includes(c.mode)&&['ambient','insulated'].includes(c.boundary)&&Number.isFinite(c.level)&&c.level>=0&&c.level<=1&&typeof c.external==='boolean';
 function createRun(net){
  if(!net)return null;
  let T=new Float64Array(net.sites.length),time=0,warm=null;
  let jouleEnergy=0,externalEnergy=0,removedEnergy=0;
  const cold=electrical(net,T);
  if(!cold)return null;
  const degree=new Float64Array(T.length);
  for(const {a,b,weight} of net.edges){degree[a]+=.15*weight;degree[b]+=.15*weight;}
  const maxStep=Math.min(.1,.8/Math.max(...degree));
  function sample(temp,c,guess){
   const sol=electrical(net,temp,guess);
   if(!sol)return null;
   const V=c.mode==='voltage'?c.level:c.level*cold.conductance/sol.conductance,I=V*sol.conductance;
   const joule=new Float64Array(temp.length);
   net.edges.forEach(({a,b},k)=>{const half=.5*sol.G[k]*(V*(sol.potential[a]-sol.potential[b]))**2;joule[a]+=half;joule[b]+=half;});
   const power=sum(joule),error=Math.abs(power-V*I);
   if(!Number.isFinite(power)||error>1e-7*(1+power))return null;
   return {sol,V,I,joule,power,error,external:c.external ? .25 : 0};
  }
  function observe(c,includeFields=false){
   if(!valid(c))return null;
   const s=sample(T,c,warm);
   if(!s)return null;
   const values={time,voltage:s.V,current:s.I,resistance:1/s.sol.conductance,power:s.power,external:s.external,
    storedEnergy:sum(T),jouleEnergy,externalEnergy,removedEnergy,mean:sum(T)/T.length,maximum:Math.max(...T),terminalError:s.error};
   if(includeFields){
    values.profiles={
     temperature:new Map(net.sites.map((n,i)=>[n.key,T[i]])),
     potential:new Map(net.sites.map((n,i)=>[n.key,s.V*s.sol.potential[i]])),
     dissipation:new Map(net.sites.map((n,i)=>[n.key,s.joule[i]]))
    };
   }
   return values;
  }
  function advance(c,duration=.5){
   if(!valid(c)||!Number.isFinite(duration)||duration<=0||duration>2)return false;
   const steps=Math.ceil(duration/maxStep),dt=duration/steps;
   let temp=T.slice(),guess=warm,generated=0,added=0,removed=0;
   for(let k=0;k<steps;k++){
    // Uma mudança para terminais a temperatura imposta pode retirar calor acumulado.
    if(c.boundary==='ambient')net.terminal.forEach((t,i)=>{if(t>=0){removed+=temp[i];temp[i]=0;}});
    const s=sample(temp,c,guess);if(!s)return false;
    const rate=s.joule.slice();rate[net.source]+=s.external;
    for(const {a,b,weight} of net.edges){
     const transfer=.15*weight*(temp[b]-temp[a]);rate[a]+=transfer;rate[b]-=transfer;
    }
    const next=temp.slice();let out=0;
    for(let i=0;i<next.length;i++){
     if(net.terminal[i]>=0&&c.boundary==='ambient')out+=rate[i]*dt;
     else next[i]+=dt*rate[i];
    }
    const balance=sum(next)-sum(temp)-dt*(s.power+s.external)+out;
    if(Math.abs(balance)>1e-7*(1+sum(next))||next.some(t=>!Number.isFinite(t)||t< -1e-10||t>10))return false;
    generated+=s.power*dt;added+=s.external*dt;removed+=out;
    temp=next;guess=s.sol.potential;
   }
   T=temp;warm=guess;time+=duration;jouleEnergy+=generated;externalEnergy+=added;removedEnergy+=removed;return true;
  }
  return Object.freeze({advance,observe,temperatureAt:key=>T[net.byKey.get(key)],field:()=>new Map(net.sites.map((s,i)=>[s.key,T[i]]))});
 }
 // Leitura de causa e efeito derivada das mesmas grandezas da malha,
 // sem acrescentar outro motor, unidades SI ou parâmetros metal-específicos.
 // Potência Joule (instantânea), calor armazenado e calor externo são distintos.
 function explainFlow(input,values){
  if(!input||!values||!['ambient','insulated'].includes(input.boundary)||
   !['power','mean','external'].every(k=>Number.isFinite(values[k])&&values[k]>=0))return null;
  const joule=values.power>1e-10,external=values.external>1e-10,warm=values.mean>1e-8;
  const boundary=input.boundary==='ambient'?
   'O calor pode sair pelos terminais mantidos na referência térmica.':
   'Sem troca térmica pelas bordas idealmente isoladas.';
  let phase,message;
  if(joule&&external){
   phase='combined';message='Corrente e fonte de calor externa atuam juntas. A dissipação Joule e o aporte externo são contabilizados separadamente.';
  }else if(joule&&warm){
   phase='heating';message='Corrente elétrica → dissipação Joule na malha → calor acumulado e redistribuído entre regiões do metal.';
  }else if(joule){
   phase='generating';message='Corrente elétrica → potência Joule distribuída na malha. O aquecimento aparece quando o tempo avança.';
  }else if(external){
   phase='external';message='Sem corrente: potência Joule igual a zero. O aquecimento decorre da fonte térmica externa.';
  }else if(warm){
   phase='residual';message='Fonte elétrica desligada: a geração Joule cessou. O calor já acumulado continua a se redistribuir.';
  }else{
   phase='idle';message='Sem alimentação: não há dissipação Joule nem elevação térmica acumulada.';
  }
  return Object.freeze({phase,message,boundary,activeDissipation:joule,
   residualHeat:warm,externalHeat:external});
 }
 return Object.freeze({buildNetwork,createRun,explainFlow});
})();
