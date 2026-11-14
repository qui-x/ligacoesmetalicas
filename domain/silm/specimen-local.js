'use strict';
window.SILM=window.SILM||{};
/*
 * Ensaio ELÁSTICO LOCAL 2D por elementos finitos CST (triângulos lineares).
 * Condições: tensão plana homogênea, pequena deformação, sem contato
 * unilateral/fricção, sem plasticidade e sem ruptura. A região superior sob
 * prensa/garra recebe deslocamento PRESCRITO; a base é apoiada. A posição
 * e largura do contato determinam o campo espacial de deslocamentos.
 * E = 1 é uma normalização didática, não módulo de Young do metal.
 * Reações não são expostas como forças reais. Deformação plástica residual
 * continua sob o estado compartilhado do SILM, fora deste solver elástico.
 *
 * Referência de formulação: matrizes B^T D B da elasticidade linear 2D.
 */
(()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const cache=new Map(),CACHE_LIMIT=24;
 function mesh({nx=14,ny=12,poisson=.3}={}){
  if(!Number.isInteger(nx)||nx<4||nx>24||!Number.isInteger(ny)||ny<4||ny>24||
     !Number.isFinite(poisson)||poisson<0||poisson>=.49)throw new RangeError('Malha ou Poisson inválidos');
  const nd=2*(nx+1)*(ny+1),rows=Array.from({length:nd},()=>new Map());
  const node=(x,y)=>y*(nx+1)+x;
  const X=i=>(i%(nx+1))/nx, Y=i=>Math.floor(i/(nx+1))/ny;
  const c=1/(1-poisson*poisson),d00=c,d01=poisson*c,d22=1/(2*(1+poisson));
  const triangle=(a,b,cidx)=>{
   const tri=[a,b,cidx],x=tri.map(X),y=tri.map(Y);
   const det=(x[1]-x[0])*(y[2]-y[0])-(x[2]-x[0])*(y[1]-y[0]);
   const area=Math.abs(det)/2;
   const B=[Array(6).fill(0),Array(6).fill(0),Array(6).fill(0)];
   for(let k=0;k<3;k++){
    const p=(k+1)%3,q=(k+2)%3;
    const bx=(y[p]-y[q])/det,cy=(x[q]-x[p])/det;
    B[0][2*k]=bx;B[1][2*k+1]=cy;
    B[2][2*k]=cy;B[2][2*k+1]=bx;
   }
   const dofs=tri.flatMap(i=>[2*i,2*i+1]);
   for(let j=0;j<6;j++){
    const row=rows[dofs[j]];
    for(let k=0;k<6;k++){
     const stiffness=area*(
      B[0][j]*(d00*B[0][k]+d01*B[1][k])+
      B[1][j]*(d01*B[0][k]+d00*B[1][k])+
      B[2][j]*d22*B[2][k]);
     row.set(dofs[k],(row.get(dofs[k])||0)+stiffness);
    }
   }
  };
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
   const a=node(x,y),b=node(x+1,y),cidx=node(x+1,y+1),d=node(x,y+1);
   triangle(a,b,cidx);triangle(a,cidx,d);
  }
  return {nx,ny,nd,node,rows};
 }
 const defaultMesh=mesh();
 function solve({mode='compression',position=.5,width=.3,poisson=.3,nx=14,ny=12,maxIterations=600}={}){
  if(!['compression','tension'].includes(mode))throw new TypeError('Tipo de ensaio inválido');
  if(![position,width].every(Number.isFinite))throw new TypeError('Contato inválido');
  const center=clamp(position,.03,.97),span=clamp(width,.08,.9);
  // A área ativa é amostrada pela malha: não há força pontual infinita.
  const grid=(nx===14&&ny===12&&poisson===.3)?defaultMesh:mesh({nx,ny,poisson});
  const {nd,node,rows}=grid,mask=new Uint8Array(nd),value=new Float64Array(nd);
  const top=[];for(let x=0;x<=nx;x++)if(Math.abs(x/nx-center)<=span/2+1e-9)top.push(x);
  if(!top.length)top.push(clamp(Math.round(center*nx),0,nx));
  // Base com apoio sem deslizamento vertical, mas com expansão lateral livre.
  for(let x=0;x<=nx;x++)mask[2*node(x,ny)+1]=1;
  // Fixação de uma componente horizontal remove translação rígida do sólido.
  mask[2*node(Math.floor(nx/2),ny)]=1;
  const amplitude=mode==='compression'?.06:-.06;
  for(const x of top){
   const i=node(x,0);mask[2*i+1]=1;value[2*i+1]=amplitude;
   if(mode==='tension')mask[2*i]=1; // garra aderente, simplificação explícita
  }
  const b=new Float64Array(nd),u=new Float64Array(nd);
  for(let i=0;i<nd;i++){
   if(mask[i]){u[i]=value[i];continue;}
   let sum=0;
   for(const [j,k] of rows[i])if(mask[j])sum-=k*value[j];
   b[i]=sum;
  }
  const dot=(a,z)=>{let q=0;for(let i=0;i<nd;i++)if(!mask[i])q+=a[i]*z[i];return q;};
  const matvec=(v,out)=>{out.fill(0);for(let i=0;i<nd;i++){
   if(mask[i])continue;let sum=0;for(const [j,k] of rows[i])if(!mask[j])sum+=k*v[j];out[i]=sum;
  }};
  const r=b.slice(),p=r.slice(),Ap=new Float64Array(nd);
  const initial=Math.sqrt(dot(r,r));let rr=dot(r,r),iterations=0;
  for(;iterations<maxIterations&&rr>initial*initial*1e-12;iterations++){
   matvec(p,Ap);const den=dot(p,Ap);
   if(!Number.isFinite(den)||den<=1e-30)break;
   const alpha=rr/den;
   for(let i=0;i<nd;i++)if(!mask[i]){u[i]+=alpha*p[i];r[i]-=alpha*Ap[i];}
   const next=dot(r,r);if(next<=initial*initial*1e-12){rr=next;break;}
   const beta=next/rr;
   for(let i=0;i<nd;i++)if(!mask[i])p[i]=r[i]+beta*p[i];
   rr=next;
  }
  const residual=initial?Math.sqrt(rr)/initial:0;
  // Campo de material: interpolação bilinear das posições nodais.
  function sample(x,y,load=1){
   const xx=clamp(Number.isFinite(x)?x:0,0,1)*nx;
   const yy=clamp(Number.isFinite(y)?y:0,0,1)*ny;
   const i=Math.min(nx-1,Math.floor(xx)),j=Math.min(ny-1,Math.floor(yy));
   const a=xx-i,b=yy-j;
   const ids=[node(i,j),node(i+1,j),node(i,j+1),node(i+1,j+1)];
   const w=[(1-a)*(1-b),a*(1-b),(1-a)*b,a*b],factor=clamp(Number(load)||0,0,1);
   let dx=0,dy=0;
   ids.forEach((n,k)=>{dx+=u[2*n]*w[k];dy+=u[2*n+1]*w[k];});
   return {dx:dx*factor,dy:dy*factor};
  }
  const result=Object.freeze({mode,position:center,width:span,nx,ny,iterations,residual,
   converged:residual<1e-5,sample,contactNodes:top.length,kind:'linear-elastic-plane-stress-relative'});
  return result;
 }
 function field(options={}){
  const mode=options.mode||'compression',position=Number.isFinite(options.position)?options.position:.5,
   width=Number.isFinite(options.width)?options.width:.3;
  const roundedPos=Math.round(clamp(position,.03,.97)*28)/28;
  const roundedWidth=Math.round(clamp(width,.08,.9)*20)/20;
  const key=[mode,roundedPos,roundedWidth].join('|');
  if(cache.has(key))return cache.get(key);
  const solved=solve({mode,position:roundedPos,width:roundedWidth});
  if(cache.size>=CACHE_LIMIT)cache.delete(cache.keys().next().value);
  cache.set(key,solved);return solved;
 }
 SILM.specimenLocal=Object.freeze({mesh,solve,field});
})();
