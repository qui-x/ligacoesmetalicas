'use strict';
window.SILM=window.SILM||{};
/*
 * FEM elastoplástico incremental bidimensional, PLANE STRAIN (eps_zz = 0).
 * Elementos CST P1 com 1 ponto de integração/triângulo, pequenas deformações.
 * J2/von Mises associado e encruamento isotrópico linear. Retorno radial 3D
 * nos pontos de integração (sigma_zz e epsilon^p_zz são conservados).
 * Equilíbrio global não linear resolvido por Newton com tangente material
 * numérica central (derivada da lei J2), busca linear e PCG.
 * Condição de controle: deslocamento vertical prescrito na área superior
 * da prensa/garra; base apoiada no eixo vertical; um ponto horizontal fixo.
 * No descarregamento, as restrições superiores são removidas; as tensões
 * internas relaxam e os deslocamentos residuais resultam do equilíbrio.
 *
 * NORMALIZADO / DEMONSTRATIVO: E=10, nu=.3, sigma_y=.5, H=12; unidades
 * relativas, não medição da amostra. Sem contato unilateral, atrito,
 * ruptura, deformação finita, anisotropia cristalina ou calibração por metal.
 * A luz e as sombras continuam ilustrativas, não superfície 3D medida.
 *
 * Método: MOOSE RadialReturnStressUpdate; Simo & Hughes (2006).
 */
(()=>{
 const S=window.SILM,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const MATERIAL=Object.freeze({E:10,nu:.3,yieldStress:.5,hardening:12,
  calibrated:false,units:'relative'});
 const NX=8,NY=6,MAX_CACHE=28,MAX_STEPS=16;
 const historyCache=new Map(),activeCache=new Map(),privateState=new WeakMap();
 const lambda=MATERIAL.E*MATERIAL.nu/((1+MATERIAL.nu)*(1-2*MATERIAL.nu));
 const G=MATERIAL.E/(2*(1+MATERIAL.nu));
 const elasticD=[
  [lambda+2*G,lambda,0],
  [lambda,lambda+2*G,0],
  [0,0,G]
 ];
 const nd=2*(NX+1)*(NY+1),node=(x,y)=>y*(NX+1)+x;
 const makeMesh=()=>{
  const tris=[];
  const add=(ids)=>{
   const xs=ids.map(i=>i%(NX+1)/NX),ys=ids.map(i=>Math.floor(i/(NX+1))/NY);
   const det=(xs[1]-xs[0])*(ys[2]-ys[0])-(xs[2]-xs[0])*(ys[1]-ys[0]);
   if(!(det>0))throw new Error('Orientação da malha CST inválida');
   const B=[new Float64Array(6),new Float64Array(6),new Float64Array(6)];
   for(let k=0;k<3;k++){
    const p=(k+1)%3,q=(k+2)%3,dx=(ys[p]-ys[q])/det,dy=(xs[q]-xs[p])/det;
    B[0][2*k]=dx;B[1][2*k+1]=dy;
    B[2][2*k]=dy;B[2][2*k+1]=dx;
   }
   tris.push({ids,dofs:ids.flatMap(i=>[2*i,2*i+1]),B,area:det/2});
  };
  for(let y=0;y<NY;y++)for(let x=0;x<NX;x++){
   const a=node(x,y),b=node(x+1,y),c=node(x+1,y+1),d=node(x,y+1);
   add([a,b,c]);add([a,c,d]);
  }
  return tris;
 };
 const triangles=makeMesh();
 const zeroPlastic=()=>({p:new Float64Array(4),alpha:0}); // exx eyy ezz exy (tensor shear)
 const empty=()=>({u:new Float64Array(nd),history:triangles.map(zeroPlastic)});
 // strain = [exx,eyy,gamma_xy]. Eps_zz=0 from plane strain hypothesis.
 function material(strain,old){
  const ep=old.p,exx=strain[0]-ep[0],eyy=strain[1]-ep[1],
   ezz=-ep[2],exy=strain[2]*.5-ep[3],trace=exx+eyy+ezz;
  const sx=lambda*trace+2*G*exx,sy=lambda*trace+2*G*eyy,
   sz=lambda*trace+2*G*ezz,sxy=2*G*exy,mean=(sx+sy+sz)/3;
  const d0=sx-mean,d1=sy-mean,d2=sz-mean;
  const q=Math.sqrt(1.5*(d0*d0+d1*d1+d2*d2+2*sxy*sxy));
  const threshold=MATERIAL.yieldStress+MATERIAL.hardening*old.alpha;
  if(q<=threshold+1e-11)
   return{stress:[sx,sy,sxy],state:old,eq:q,yielded:false};
  const delta=(q-threshold)/(3*G+MATERIAL.hardening),factor=1-3*G*delta/q;
  const scale=1.5*delta/q;
  return{stress:[mean+d0*factor,mean+d1*factor,sxy*factor],
   state:{p:Float64Array.from([ep[0]+scale*d0,ep[1]+scale*d1,
    ep[2]+scale*d2,ep[3]+scale*sxy]),alpha:old.alpha+delta},
   eq:MATERIAL.yieldStress+MATERIAL.hardening*(old.alpha+delta),yielded:true};
 }
 function strainOf(tri,u){
  return tri.B.map(row=>{
   let sum=0;for(let j=0;j<6;j++)sum+=row[j]*u[tri.dofs[j]];
   return sum;
  });
 }
 const tangent=(strain,old,elastic)=>{
  if(elastic)return elasticD;
  const h=1e-6,D=Array.from({length:3},()=>new Float64Array(3));
  for(let j=0;j<3;j++){
   const plus=[...strain],minus=[...strain];plus[j]+=h;minus[j]-=h;
   const up=material(plus,old).stress,down=material(minus,old).stress;
   for(let i=0;i<3;i++)D[i][j]=(up[i]-down[i])/(2*h);
  }
  for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){
   const a=(D[i][j]+D[j][i])/2;D[i][j]=a;D[j][i]=a;
  }
  return D;
 };
 function assemble(u,prior,{stiffness=false}={}){
  const force=new Float64Array(nd),states=new Array(triangles.length);
  const rows=stiffness?Array.from({length:nd},()=>new Map()):null;
  let yielding=0,maxAlpha=0,sumAlpha=0;
  for(let k=0;k<triangles.length;k++){
   const t=triangles[k],strain=strainOf(t,u),z=material(strain,prior.history[k]);
   states[k]=z.state;
   if(z.yielded)yielding++;
   maxAlpha=Math.max(maxAlpha,z.state.alpha);sumAlpha+=z.state.alpha;
   for(let a=0;a<6;a++){
    const i=t.dofs[a];
    let fa=0;for(let r=0;r<3;r++)fa+=t.B[r][a]*z.stress[r];
    force[i]+=fa*t.area;
   }
   if(stiffness){
    const D=tangent(strain,prior.history[k],!z.yielded);
    for(let a=0;a<6;a++)for(let b=0;b<6;b++){
     let stiffnessAB=0;
     for(let i=0;i<3;i++)for(let j=0;j<3;j++)
      stiffnessAB+=t.B[i][a]*D[i][j]*t.B[j][b];
     const row=rows[t.dofs[a]],jj=t.dofs[b];
     row.set(jj,(row.get(jj)||0)+stiffnessAB*t.area);
    }
   }
  }
  return{force,rows,states,yielding,maxAlpha,meanAlpha:sumAlpha/triangles.length};
 }
 function constraints({mode,position,width,load,release=false}){
  const mask=new Uint8Array(nd),values=new Float64Array(nd);
  for(let x=0;x<=NX;x++)mask[2*node(x,NY)+1]=1;
  mask[2*node(Math.floor(NX/2),NY)]=1;
  if(!release&&load>0){
   const contact=[];
   for(let x=0;x<=NX;x++)if(Math.abs(x/NX-position)<=width/2+1e-9)contact.push(x);
   if(!contact.length)contact.push(clamp(Math.round(position*NX),0,NX));
   for(const x of contact){
    const k=2*node(x,0);mask[k+1]=1;
    values[k+1]=(mode==='compression'?.06:-.06)*load;
    if(mode==='tension'){mask[k]=1;values[k]=0;}
   }
  }
  return{mask,values};
 }
 function residual(f,mask){
  let sum=0;
  for(let i=0;i<nd;i++)if(!mask[i])sum+=f[i]*f[i];
  return Math.sqrt(sum);
 }
 function pcg(rows,mask,rhs,maxIter=340){
  const x=new Float64Array(nd),r=rhs.slice(),z=new Float64Array(nd),
   p=new Float64Array(nd),Ap=new Float64Array(nd);
  const diag=new Float64Array(nd);
  let rz=0;
  for(let i=0;i<nd;i++){
   if(mask[i]){r[i]=0;continue;}
   diag[i]=Math.max(1e-8,rows[i].get(i)||0);
   z[i]=r[i]/diag[i];p[i]=z[i];rz+=r[i]*z[i];
  }
  const initial=Math.sqrt(rz),target=Math.max(1e-12,initial*1e-7);
  if(initial<=target)return{x,converged:true};
  for(let it=0;it<maxIter;it++){
   let den=0;
   for(let i=0;i<nd;i++){
    if(mask[i])continue;let q=0;
    for(const [j,k] of rows[i])if(!mask[j])q+=k*p[j];
    Ap[i]=q;den+=p[i]*q;
   }
   if(!Number.isFinite(den)||den<=1e-24)return{x,converged:false};
   const a=rz/den;let next=0;
   for(let i=0;i<nd;i++)if(!mask[i]){
    x[i]+=a*p[i];r[i]-=a*Ap[i];z[i]=r[i]/diag[i];next+=r[i]*z[i];
   }
   if(Math.sqrt(next)<=target)return{x,converged:true};
   const beta=next/rz;rz=next;
   for(let i=0;i<nd;i++)if(!mask[i])p[i]=z[i]+beta*p[i];
  }
  return{x,converged:false};
 }
 function equilibrate(previous,{mode='compression',position=.5,width=.3,load=0,release=false}={}){
  if(!['compression','tension'].includes(mode)||![position,width,load].every(Number.isFinite)||
   position<.1||position>.9||width<.08||width>.9||load<0||load>1)
   throw new RangeError('Contato ou carga fora dos limites');
  const {mask,values}=constraints({mode,position,width,load,release});
  let u=previous.u.slice();
  for(let i=0;i<nd;i++)if(mask[i])u[i]=values[i];
  const maxNewton=18,tol=8e-5; // Norma residual relativa ao E=10 normalizado.
  let iterations=0,solved=false,a=null;
  for(;iterations<maxNewton;iterations++){
   a=assemble(u,previous,{stiffness:true});
   const norm=residual(a.force,mask);
   if(norm<tol){solved=true;break;}
   const rhs=new Float64Array(nd);
   for(let i=0;i<nd;i++)if(!mask[i])rhs[i]=-a.force[i];
   const correction=pcg(a.rows,mask,rhs);
   if(!correction.converged)break;
   let accepted=false,scale=1;
   for(let trial=0;trial<8;trial++){
    const candidate=u.slice();
    for(let i=0;i<nd;i++)if(!mask[i])candidate[i]+=scale*correction.x[i];
    const err=residual(assemble(candidate,previous).force,mask);
    if(err<norm*(1-1e-4*scale)||err<tol){
     u=candidate;accepted=true;break;
    }
    scale*=.5;
   }
   if(!accepted)break;
  }
  a=assemble(u,previous);
  const norm=residual(a.force,mask);
  if(norm<tol)solved=true;
  return{converged:solved,record:{u,history:a.states},
   iterations,residual:norm,yielding:a.yielding,maxAlpha:a.maxAlpha,
   meanAlpha:a.meanAlpha};
 }
 const neutral=()=>empty();
 const names=m=>Array.isArray(m)?m.filter(x=>S.specimenVisualLight?.validMark(x)).slice(-MAX_STEPS):[];
 const sig=m=>m.map(x=>[x.mode,x.position,x.width].join(':')).join(';');
 const store=(cache,key,value)=>{
  if(cache.has(key))cache.delete(key);
  cache.set(key,value);
  while(cache.size>MAX_CACHE)cache.delete(cache.keys().next().value);
  return value;
 };
 function fieldFor(record,metadata={}){
  const info=Object.freeze({...metadata,
   kind:'incremental-j2-plane-strain-normalized',
   calibrated:false,nx:NX,ny:NY});
  const sample=(u,v)=>{
   const xx=clamp(Number(u)||0,0,1)*NX,yy=clamp(Number(v)||0,0,1)*NY;
   const ix=Math.min(NX-1,Math.floor(xx)),iy=Math.min(NY-1,Math.floor(yy)),
    a=xx-ix,b=yy-iy;
   const ids=[node(ix,iy),node(ix+1,iy),node(ix,iy+1),node(ix+1,iy+1)];
   const weights=[(1-a)*(1-b),a*(1-b),(1-a)*b,a*b];
   let dx=0,dy=0;
   ids.forEach((id,k)=>{dx+=weights[k]*record.u[2*id];dy+=weights[k]*record.u[2*id+1];});
   return{dx,dy};
  };
  const samplePlastic=(u,v)=>{
   const xx=clamp(Number(u)||0,0,1)*NX,yy=clamp(Number(v)||0,0,1)*NY;
   const ix=Math.min(NX-1,Math.floor(xx)),iy=Math.min(NY-1,Math.floor(yy)),
    tri=(yy-iy)<=(xx-ix)?0:1;
   return record.history[2*(iy*NX+ix)+tri].alpha;
  };
  const exposed=Object.freeze({...info,sample,samplePlastic});
  privateState.set(exposed,record);
  return exposed;
 }
 function history(marks=[]){
  const safe=names(marks),key='h:'+sig(safe);
  if(historyCache.has(key))return historyCache.get(key);
  if(!safe.length){
   return store(historyCache,'h:',fieldFor(neutral(),{converged:true,cycles:0,
    maxAlpha:0,meanAlpha:0,iterations:0,residual:0}));
  }
  const prefix=history(safe.slice(0,-1)),old=privateState.get(prefix),m=safe[safe.length-1];
  let last={record:old,converged:true,iterations:0},allConverged=true;
  for(const load of [.5,1,.5,0]){
   last=equilibrate(last.record,{
    mode:m.mode,position:m.position,width:m.width,
    load,release:load===0
   });
   if(!last.converged){allConverged=false;break;}
  }
  if(!allConverged)return store(historyCache,key,fieldFor(old,{
   converged:false,cycles:safe.length-1,residual:last.residual,
   maxAlpha:prefix.maxAlpha,meanAlpha:prefix.meanAlpha,failedAt:safe.length
  }));
  // State from unloaded equilibrium: plastic strains remain, elastic relaxes.
  const field=fieldFor(last.record,{converged:true,cycles:safe.length,
   maxAlpha:last.maxAlpha,meanAlpha:last.meanAlpha,
   residual:last.residual,iterations:last.iterations});
  return store(historyCache,key,field);
 }
 function active(marks=[],{mode='compression',position=.5,width=.3,load=0}={}){
  const prefix=history(marks);
  if(!prefix.converged||!(load>0))return prefix;
  const q=Math.round(clamp(load,0,1)*20)/20;
  const key='a:'+sig(names(marks))+'|'+mode+':'+position+':'+width+':'+q;
  if(activeCache.has(key))return activeCache.get(key);
  const previous=privateState.get(prefix);
  let last={record:previous,converged:true},ok=true;
  for(let i=1;i<=Math.ceil(q/.25);i++){
   last=equilibrate(last.record,{mode,position,width,load:q*i/Math.ceil(q/.25)});
   if(!last.converged){ok=false;break;}
  }
  if(!ok)return store(activeCache,key,fieldFor(previous,{converged:false,
   cycles:prefix.cycles,maxAlpha:prefix.maxAlpha,meanAlpha:prefix.meanAlpha,
   residual:last.residual,fallback:true}));
  return store(activeCache,key,fieldFor(last.record,{converged:true,cycles:prefix.cycles,
   maxAlpha:last.maxAlpha,meanAlpha:last.meanAlpha,residual:last.residual,
   iterations:last.iterations,load:q}));
 }
 S.specimenJ2=Object.freeze({
  MATERIAL,material,history,active,equilibrate,
  field:active,neutral,grid:{nx:NX,ny:NY,triangles:triangles.length},
  model:'incremental-associated-von-mises-plane-strain-normalized'
 });
})();
