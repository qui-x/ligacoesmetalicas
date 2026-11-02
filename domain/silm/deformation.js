'use strict';
window.SILM=window.SILM||{};
/* Deformação de metais com mecânica contínua (P1 de docs/PLANO-PROPRIEDADES-METALICAS.md).
   Ciência (o que o modelo afirma):
   - A deformação plástica de um metal cristalino acontece por DESLIZAMENTO de planos inteiros, num sistema de
     deslizamento (plano + direção), em passos de um vetor da rede (vetor de Burgers, b). Depois de cada passo, a rede
     de cada bloco é a mesma rede: a vizinhança se refaz e a coesão (elétrons deslocalizados) continua.
   - Sistemas de deslizamento por estrutura: Callister & Rethwisch, tabela de sistemas de deslizamento (fonte
     src-callister-rethwisch). O SILM usa um sistema representativo de cada família.
   - b, a distância entre planos e as posições vêm da geometria do banco (parâmetros de rede com fonte).
   Didática (o que o modelo NÃO afirma):
   - Orientação de ensaio: o cristal é girado para que o plano de deslizamento fique a 45° da força (orientação mais
     favorável, fator de Schmid 0,5). É uma escolha de apresentação, não a orientação de uma amostra real.
   - Deformação elástica exagerada para ser vista (até 6 %), com contração lateral ilustrativa; limiar de escoamento
     único e didático, igual para todos os metais (o banco não tem limite de escoamento por metal).
   - Sem encruamento, sem discordâncias individuais, sem fratura: no máximo LIMIT deslizamentos.
   Estado: o número de deslizamentos (properties.malleability.compression / ductility.elongation) é o resultado
   guardado; carga, deformação elástica e progresso das animações são transitórios e nunca são salvos. */
(()=>{
 const SOURCE='src-callister-rethwisch';
 // Sistema representativo de cada família. plane: (hkl) na célula convencional; slip: vetor de deslizamento em frações
 // da célula (b = slip · vetores da rede). HC em três índices: [100] corresponde a [2 −1 −1 0] (= a₁).
 const SYSTEMS=Object.freeze({
  // Rótulos com sinal de menos explícito ([−1 0 1] = [1̄01]): a barra combinada sobre o dígito some em várias fontes.
  FCC:Object.freeze({family:'{111}⟨110⟩',plane:[1,1,1],planeLabel:'(111)',slip:[-.5,0,.5],directionLabel:'[−1 0 1]',count:12}),
  BCC:Object.freeze({family:'{110}⟨111⟩',plane:[1,0,1],planeLabel:'(101)',slip:[-.5,.5,.5],directionLabel:'[−1 1 1]',count:12}),
  HCP:Object.freeze({family:'{0001}⟨1 1 −2 0⟩',plane:[0,0,1],planeLabel:'(0001)',slip:[1,0,0],directionLabel:'[2 −1 −1 0]',count:3})
 });
 const LIMIT=4,YIELD=.5,EPS_YIELD=.06,LATERAL=.3;
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
 const mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len=a=>Math.hypot(...a),unit=a=>mul(a,1/len(a));
 const comb=(f,L)=>[0,1,2].map(k=>f[0]*L[0][k]+f[1]*L[1][k]+f[2]*L[2][k]);
 /* Quatérnios: interpolação suave da orientação (identidade → orientação de ensaio). */
 function quatFromRows(R){const [[m00,m01,m02],[m10,m11,m12],[m20,m21,m22]]=R,t=m00+m11+m22;let w,x,y,z;
  if(t>0){const s=Math.sqrt(t+1)*2;w=s/4;x=(m21-m12)/s;y=(m02-m20)/s;z=(m10-m01)/s;}
  else if(m00>m11&&m00>m22){const s=Math.sqrt(1+m00-m11-m22)*2;w=(m21-m12)/s;x=s/4;y=(m01+m10)/s;z=(m02+m20)/s;}
  else if(m11>m22){const s=Math.sqrt(1+m11-m00-m22)*2;w=(m02-m20)/s;x=(m01+m10)/s;y=s/4;z=(m12+m21)/s;}
  else{const s=Math.sqrt(1+m22-m00-m11)*2;w=(m10-m01)/s;x=(m02+m20)/s;y=(m12+m21)/s;z=s/4;}
  const n=Math.hypot(w,x,y,z);return w<0?[-w/n,-x/n,-y/n,-z/n]:[w/n,x/n,y/n,z/n];}
 function partial(q,t){const angle=2*Math.acos(Math.min(1,q[0])),s=Math.sin(angle/2);if(s<1e-9)return [1,0,0,0];const k=Math.sin(angle*t/2)/s;return [Math.cos(angle*t/2),q[1]*k,q[2]*k,q[3]*k];}
 function rotate(q,v){const [w,x,y,z]=q,u=[x,y,z],t=mul(cross(u,v),2);return add(add(v,mul(t,w)),cross(u,t));}
 /* Sistema de deslizamento aplicado à geometria do metal: normal n, direção d, b, orientação de ensaio e planos. */
 const cache=new WeakMap();
 function system(g){
  if(!g||g.model?.general)return null;const spec=SYSTEMS[g.model?.id];if(!spec)return null;if(cache.has(g))return cache.get(g);
  const L=g.vectors,V=dot(L[0],cross(L[1],L[2])),B=[mul(cross(L[1],L[2]),1/V),mul(cross(L[2],L[0]),1/V),mul(cross(L[0],L[1]),1/V)];
  const n=unit(comb(spec.plane,B)),bVec=comb(spec.slip,L),d=unit(bVec),c=g.center;
  // Orientação de ensaio: força ao longo de e3 = (n + d)/√2 (45° do plano e da direção), e1 = (d − n)/√2 na horizontal.
  const e3=unit(add(n,d)),e1=unit(sub(d,n)),e2=cross(e3,e1),rows=[e1,e2,e3];
  // Planos de deslizamento: níveis ocupados ao longo de n (rede extensa + célula) e fronteiras no meio de dois níveis.
  const levels=[];for(const s of [...g.lattice(),...g.cell]){const h=dot(sub(s.cart,c),n);if(!levels.some(x=>Math.abs(x-h)<1e-3))levels.push(h);}levels.sort((a,b)=>a-b);
  const mids=levels.slice(1).map((h,i)=>(h+levels[i])/2).sort((a,b)=>Math.abs(a)-Math.abs(b)||b-a);
  const spacing=levels.length>1?Math.min(...levels.slice(1).map((h,i)=>h-levels[i])):0;
  const out=Object.freeze({...spec,sourceId:SOURCE,n,d,bVector:bVec,b:len(bVec),spacing,center:c,rows,quat:quatFromRows(rows),boundaries:mids.slice(0,LIMIT),orthogonal:Math.abs(dot(n,d))<1e-9});
  cache.set(g,out);return out;
 }
 /* Câmera das projeções do SILM (guinada e inclinação, em graus; crystal.js): direita r, cima u e profundidade f
    em coordenadas cartesianas. Sem câmera, r = x, f = y, u = z. */
 function cameraBasis(camera){
  if(!camera)return {r:[1,0,0],f:[0,1,0],u:[0,0,1]};const yaw=camera[0]*Math.PI/180,pitch=camera[1]*Math.PI/180,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  return {r:[cy,-sy,0],u:[sy*sp,cy*sp,cp],f:[sy*cp,cy*cp,-sp]};
 }
 /* Orientação de ensaio vista pela câmera: e1 → direita, e3 (força) → cima, e2 → profundidade. Assim o plano e a direção
    de deslizamento ficam no plano da tela, em qualquer projeção. */
 function orientation(sys,camera){
  const B=cameraBasis(camera),M=[0,1,2].map(i=>[B.r[i],B.f[i],B.u[i]]),R=sys.rows;
  const Q=[0,1,2].map(i=>[0,1,2].map(j=>M[i][0]*R[0][j]+M[i][1]*R[1][j]+M[i][2]*R[2][j]));return {quat:quatFromRows(Q),basis:B};
 }
 /* Posição exibida. progress[i] ∈ [0,1]: quanto o deslizamento i já avançou; sign: +1 tração, −1 compressão;
    strain: deformação elástica (negativa na compressão), aplicada na vertical da tela (direção da força) com contração
    lateral; orient ∈ [0,1]: identidade → orientação de ensaio; camera: [guinada, inclinação] da vista. */
 function transform(sys,{progress=[],sign=1,strain=0,orient=1,camera=null}={}){
  if(!sys)return p=>p;const o=orientation(sys,camera),q=partial(o.quat,orient),c=sys.center,e=strain*orient,{r,f,u}=o.basis;
  return p=>{const h=dot(sub(p,c),sys.n);let k=0;for(let i=0;i<sys.boundaries.length;i++)if(progress[i]&&h>sys.boundaries[i])k+=progress[i];
   let v=rotate(q,add(sub(p,c),mul(sys.bVector,sign*k)));
   if(e)v=add(v,add(mul(u,e*dot(v,u)),mul(add(mul(r,dot(v,r)),mul(f,dot(v,f))),-LATERAL*e)));
   return add(c,v);};
 }
 /* Amostra da vista Rede durante a deformação: uma fatia fina do cristal no plano de deslizamento (|e2| pequeno), com
    os sítios da própria rede (sem criar posições novas). */
 const specimens=new WeakMap();
 function specimen(g){
  const sys=system(g);if(!sys)return [];if(specimens.has(g))return specimens.get(g);
  const nn=g.neighbors(g.cell[0]).distances[0],half=3*nn,depth=.75*nn,[e1,e2,e3]=sys.rows,c=sys.center,L=g.vectors,reach=Math.ceil(Math.hypot(half,half,depth)/Math.min(...L.map(len)))+1;
  const out=[],seen=new Set();for(let i=-reach;i<=reach;i++)for(let j=-reach;j<=reach;j++)for(let k=-reach;k<=reach;k++)for(let b=0;b<g.model.basis.length;b++){
   const site=g.site({cell:[i,j,k],basis:b}),v=sub(site.cart,c);if(seen.has(site.key))continue;seen.add(site.key);
   if(Math.abs(dot(v,e1))<=half+1e-9&&Math.abs(dot(v,e3))<=half+1e-9&&Math.abs(dot(v,e2))<=depth+1e-9)out.push(site);}
  specimens.set(g,out);return out;
 }
 /* Bloco de cada centro: quantos planos já deslizados ficam abaixo dele (blocos alternados ajudam a ver o deslizamento). */
 function block(sys,cart,count){if(!sys||!count)return 0;const h=dot(sub(cart,sys.center),sys.n);let k=0;for(let i=0;i<Math.min(count,sys.boundaries.length);i++)if(h>sys.boundaries[i])k++;return k;}
 /* Traço do plano de deslizamento i (pontos no plano, ao longo da direção d), para desenhar a linha tracejada. */
 function trace(sys,i,half){const B=sys.boundaries[i];if(B===undefined)return null;const o=add(sys.center,mul(sys.n,B));return [add(o,mul(sys.d,-half)),add(o,mul(sys.d,half))];}
 /* Fora da fatia (para esmaecer unidades da célula que ficam na frente ou atrás dela). */
 function inSlab(g,cart){const sys=system(g);if(!sys)return true;const nn=g.neighbors(g.cell[0]).distances[0];return Math.abs(dot(sub(cart,sys.center),sys.rows[1]))<=.75*nn+1e-9;}
 const steps=n=>Array.from({length:LIMIT},(_,i)=>i<n?1:0);
 /* Forma estática (resultado guardado): n deslizamentos completos, sem carga. */
 function staticTransform(g,id,count,camera=null){const sys=system(g);if(!sys)return null;return transform(sys,{progress:steps(count),sign:id==='ductility'?1:-1,strain:0,orient:1,camera});}
 const fmt=v=>v.toFixed(2).replace('.',',');
 /* Controlador contínuo, um por modelo: carga (0–1), deformação elástica amortecida, deslizamentos animados e
    orientação. A carga vem do arraste na cena, do controle "Força aplicada" ou do botão (pulso). */
 const controllers=new WeakMap();
 function controller(model,{reducedMotion=()=>false}={}){
  if(controllers.has(model))return controllers.get(model);
  const listeners=new Set(),DT=1/120,W=2*Math.PI*2.2,ZETA=.22,SLIDE=.45,TURN=.6,WORK=.6,S=SILM;
  let load=0,strain=0,velocity=0,work=0,progress=steps(0),orient=0,frame=0,last=0,pulse=null,limitReached=false,key='',lastSys=null,lastSign=-1,memo=null;
  /* model.state devolve uma cópia completa do estado: uma leitura por tarefa (quadro, evento), reaproveitada até o fim dela. */
  function ctx(){
   if(memo)return memo;const st=model.state,p=st.properties,id=p?.active==='malleability'||p?.active==='ductility'?p.active:null;let g=null;
   if(id&&st.metal&&st.structure?.mode==='crystalline'){try{g=S.crystal.geometry(S.data.get(st.metal.atomicNumber));}catch{g=null;}}
   const sys=g?system(g):null,sign=id==='ductility'?1:-1;if(sys){lastSys=sys;lastSign=sign;}
   memo={id,sys,sign,count:id==='malleability'?p.malleability.compression:id==='ductility'?p.ductility.elongation:0,key:(st.investigation?.id||'')+'|'+(st.metal?.atomicNumber||'')+'|'+(st.structure?.mode||'')};
   queueMicrotask(()=>{memo=null;});return memo;
  }
  const notify=()=>{for(const f of listeners)try{f();}catch(error){console.error(error);}};
  const targets=c=>({orient:c.id&&c.sys?1:0,progress:steps(c.count)});
  const moving=(c,t=targets(c))=>progress.some((v,i)=>Math.abs(v-t.progress[i])>1e-4);
  function settled(c){const t=targets(c);return Math.abs(orient-t.orient)<1e-4&&!moving(c,t)&&!load&&!pulse&&Math.abs(strain)<1e-4&&Math.abs(velocity)<1e-4;}
  function snap(c){const t=targets(c);orient=t.orient;progress=t.progress;if(!load&&!pulse){strain=0;velocity=0;}}
  function commit(c,n){if(!c.id)return false;const ok=model.setPropertyParams(c.id==='malleability'?{compression:n}:{elongation:n});memo=null;if(ok)c.count=n;return ok;}
  function step(dt,c){
   const t=targets(c),turn=dt/TURN,slide=dt/SLIDE;
   orient+=Math.max(-turn,Math.min(turn,t.orient-orient));
   for(let i=0;i<LIMIT;i++)progress[i]+=Math.max(-slide,Math.min(slide,t.progress[i]-progress[i]));
   if(pulse){pulse.t+=dt;load=pulse.t<.35?pulse.t/.35:pulse.t<.9?1:0;if(pulse.t>=.9){pulse=null;load=0;}}
   // Plástico: acima do limiar, o esforço acumulado produz um novo deslizamento (um por vez; o pulso já registrou o seu).
   if(c.id&&!pulse&&load>YIELD&&!moving(c)){if(c.count<LIMIT){work+=(load-YIELD)/(1-YIELD)*dt/WORK;if(work>=1){work=0;commit(c,c.count+1);}}else limitReached=true;}
   else if(load<=YIELD){work=Math.max(0,work-dt/WORK);limitReached=false;}
   // Elástico: oscilador amortecido em direção à deformação proporcional à carga (limitada ao escoamento).
   const target=c.id&&orient>.999?c.sign*EPS_YIELD*Math.min(load,YIELD)/YIELD:0;
   velocity+=(-W*W*(strain-target)-2*ZETA*W*velocity)*dt;strain+=velocity*dt;
  }
  function tick(now){
   frame=0;memo=null;const c=ctx(),elapsed=last?Math.min(.1,(now-last)/1000):DT;last=now;
   // O desenho chamado por notify() pode já ter agendado o próximo quadro (sync → wake): nunca agendar dois.
   if(reducedMotion()){snap(c);notify();if(!settled(c))wake();else last=0;return;}
   for(let t=0;t<elapsed-1e-9;t+=DT)step(Math.min(DT,elapsed-t),c);
   notify();if(settled(c)){last=0;strain=0;velocity=0;return;}wake();
  }
  function wake(){if(!frame&&typeof requestAnimationFrame==='function')frame=requestAnimationFrame(tick);}
  /* Estado novo (troca de metal, de investigação ou recarga): posições finais sem animação. */
  function sync(){const c=ctx();if(c.key!==key){key=c.key;load=0;pulse=null;work=0;snap(c);strain=0;velocity=0;}if(!settled(c))wake();}
  const api={
   subscribe(f){listeners.add(f);return ()=>listeners.delete(f);},
   sync,
   setLoad(v){const x=Math.max(0,Math.min(1,Number(v)||0));if(x===load&&!pulse)return;pulse=null;load=x;memo=null;const c=ctx();if(reducedMotion()&&x>YIELD&&c.id&&c.count<LIMIT)commit(c,c.count+1);wake();notify();},
   /* Pulso (botão e teclado): registra um deslizamento agora e anima carga → deslizamento → retorno elástico. */
   pulse(){memo=null;const c=ctx();if(!c.id||c.count>=LIMIT)return false;if(!commit(c,c.count+1))return false;if(!reducedMotion()){pulse={t:0};wake();}else snap(c);notify();return true;},
   // Ao encerrar ou restaurar, o retorno também é animado: o último sistema vale até a forma voltar à de referência.
   transform(camera=null){const c=ctx(),s=c.sys||lastSys;if(!s||(!c.id&&orient<1e-4&&progress.every(v=>v<1e-4)))return null;return transform(s,{progress,sign:c.id?c.sign:lastSign,strain,orient,camera});},
   reading(){const c=ctx();return {active:c.id,load,strain,regime:!c.id?null:load>YIELD||pulse?'plastic':load>0?'elastic':Math.abs(strain)>.002?'returning':'rest',count:c.count,limit:LIMIT,limitReached,sliding:moving(c),orient,system:c.sys};},
   get load(){return load;}
  };
  controllers.set(model,api);return api;
 }
 /* Texto científico curto do sistema de deslizamento, com b calculado da geometria do banco. */
 function describe(sys){if(!sys)return '';return 'Plano '+sys.planeLabel+' da família '+sys.family+', direção '+sys.directionLabel+'; b = '+fmt(sys.b)+' Å (calculado pelo SILM a partir do parâmetro de rede).';}
 SILM.deformation=Object.freeze({SYSTEMS,LIMIT,YIELD,EPS_YIELD,SOURCE,system,transform,staticTransform,controller,describe,steps,cameraBasis,specimen,inSlab,block,trace});
})();
