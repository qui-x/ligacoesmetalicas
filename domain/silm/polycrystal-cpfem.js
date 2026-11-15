'use strict';
window.SILM=window.SILM||{};
/*
 * Policristal sintetico com equilibrio global FEM 2D de pequenas deformacoes.
 * Cada triangulo integra a lei SILM.crystalPlasticity de seu grao Voronoi.
 * Cargas/deslocamentos e parametros constitutivos sao RELATIVOS: nao sao
 * dados experimentais do metal, micrografia/EBSD, nem CPFEM validado.
 *
 * Plane strain eps_zz = 0, sigma_zz nao precisa ser zero; CST triangular;
 * orientacoes sinteticas deterministicas (cristal -> amostra); integracao
 * incremental, Newton com tangente numerica e PCG para equilibrio.
 * Nao substitui J2, nao aplica fratura/estriccao/rotacao da rede, nao
 * transfere propriedades de mapas importados nem modifica o ScientificState.
 */
SILM.polycrystalCPFEM=(()=>{
 const cp=SILM.crystalPlasticity,slip=SILM.crystalSlip;
 const NX=12,NY=8,NE=2*NX*NY,ND=2*(NX+1)*(NY+1);
 const MAX_GRAINS=256,MAX_STEPS=12;
 const clip=(x,a,b)=>Math.max(a,Math.min(b,x));
 const finite=Number.isFinite;
 const node=(x,y)=>y*(NX+1)+x;
 const matMul=(A,B)=>A.map(row=>[0,1,2].map(i=>row.reduce((s,v,j)=>s+v*B[j][i],0)));
 const rz=a=>[[Math.cos(a),-Math.sin(a),0],[Math.sin(a),Math.cos(a),0],[0,0,1]];
 const ry=a=>[[Math.cos(a),0,Math.sin(a)],[0,1,0],[-Math.sin(a),0,Math.cos(a)]];
 const rx=a=>[[1,0,0],[0,Math.cos(a),-Math.sin(a)],[0,Math.sin(a),Math.cos(a)]];
 const fixedOrientation=(seed,index)=>{
  let v=(seed^(Math.imul(index+1,0x9e3779b1)))>>>0;
  const rand=()=>{v=(Math.imul(v,1664525)+1013904223)>>>0;return v/4294967296;};
  return matMul(matMul(rz(2*Math.PI*rand()),ry(Math.acos(1-2*rand()))),rx(2*Math.PI*rand()));
 };
 const contains=(poly,x,y)=>{
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
   const a=poly[i],b=poly[j];
   if(((a[1]>y)!==(b[1]>y))&&
    x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
 };
 const center=poly=>poly.reduce((p,v)=>[p[0]+v[0]/poly.length,p[1]+v[1]/poly.length],[0,0]);
 const grainAt=(polygons,x,y,centers)=>{
  for(let i=0;i<polygons.length;i++)if(contains(polygons[i],x,y))return i;
  // Numerical boundary ambiguity only; never infer scientific grain ownership.
  let best=0,d=Infinity;
  centers.forEach((p,i)=>{const q=(x-p[0])**2+(y-p[1])**2;if(q<d){d=q;best=i;}});
  return best;
 };
 const mesh=()=>{
  const triangles=[];
  function add(ids){
   const xs=ids.map(id=>id%(NX+1)/NX),ys=ids.map(id=>Math.floor(id/(NX+1))/NY);
   const det=(xs[1]-xs[0])*(ys[2]-ys[0])-(xs[2]-xs[0])*(ys[1]-ys[0]);
   if(!(det>0))throw new Error('Elemento FEM com orientacao invalida');
   const B=[new Float64Array(6),new Float64Array(6),new Float64Array(6)];
   for(let k=0;k<3;k++){
    const p=(k+1)%3,q=(k+2)%3;
    const dx=(ys[p]-ys[q])/det,dy=(xs[q]-xs[p])/det;
    B[0][2*k]=dx;B[1][2*k+1]=dy;
    B[2][2*k]=dy;B[2][2*k+1]=dx;
   }
   triangles.push(Object.freeze({ids:Object.freeze([...ids]),
    dofs:Object.freeze(ids.flatMap(i=>[2*i,2*i+1])),B,area:det/2,
    center:Object.freeze([xs.reduce((a,b)=>a+b,0)/3,ys.reduce((a,b)=>a+b,0)/3])}));
  }
  for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){
   const a=node(i,j),b=node(i+1,j),c=node(i+1,j+1),d=node(i,j+1);
   add([a,b,c]);add([a,c,d]);
  }
  return Object.freeze(triangles);
 };
 const triangles=mesh();
 const strainOf=(triangle,u)=>{
  const e=[0,0,0];
  for(let j=0;j<6;j++)for(let i=0;i<3;i++)e[i]+=triangle.B[i][j]*u[triangle.dofs[j]];
  return e;
 };
 const bToCrystal=e=>[e[0],e[1],0,e[2]/2,0,0];
 const vectorStress=z=>[z.state.stress[0],z.state.stress[1],z.state.stress[3]];
 const newRows=()=>Array.from({length:ND},()=>new Map());
 const addStiffness=(rows,triangle,D)=>{
  const B=triangle.B,dofs=triangle.dofs;
  for(let a=0;a<6;a++)for(let b=0;b<6;b++){
   let v=0;
   for(let i=0;i<3;i++)for(let j=0;j<3;j++)v+=B[i][a]*D[i][j]*B[j][b];
   const row=rows[dofs[a]],index=dofs[b];
   row.set(index,(row.get(index)||0)+v*triangle.area);
  }
 };
 const fixed=(mode,position,width,load,release)=>{
  const mask=new Uint8Array(ND),values=new Float64Array(ND);
  for(let i=0;i<=NX;i++)mask[2*node(i,NY)+1]=1;
  mask[2*node(Math.floor(NX/2),NY)]=1;
  if(!release&&load>0){
   const contact=[];
   for(let i=0;i<=NX;i++)if(Math.abs(i/NX-position)<=width/2+1e-9)contact.push(i);
   if(!contact.length)contact.push(clip(Math.round(position*NX),0,NX));
   for(const i of contact){
    const k=2*node(i,0),sign=mode==='tension'?-1:1;
    // Limite de deslocamento reduzido: contato localizado concentra 
    // deformacao; preservar o dominio de pequenas deformacoes (< 5%).
    mask[k+1]=1;values[k+1]=sign*.012*load;
    if(mode==='tension'){mask[k]=1;values[k]=0;}
   }
  }
  return{mask,values};
 };
 const norm=(force,mask)=>{
  let sum=0;for(let i=0;i<ND;i++)if(!mask[i])sum+=force[i]**2;
  return Math.sqrt(sum);
 };
 function pcg(rows,mask,force){
  const x=new Float64Array(ND),r=new Float64Array(ND),
   z=new Float64Array(ND),p=new Float64Array(ND),diag=new Float64Array(ND),
   Ap=new Float64Array(ND);
  let rz=0;
  for(let i=0;i<ND;i++)if(!mask[i]){
   r[i]=-force[i];
   diag[i]=Math.max(1e-8,rows[i].get(i)||0);
   z[i]=r[i]/diag[i];p[i]=z[i];rz+=z[i]*r[i];
  }
  const target=Math.max(1e-12,Math.sqrt(rz)*1e-7);
  if(Math.sqrt(rz)<=target)return{x,converged:true};
  for(let t=0;t<Math.max(300,ND*3);t++){
   let denom=0;
   for(let i=0;i<ND;i++)if(!mask[i]){
    let v=0;for(const [j,a] of rows[i])if(!mask[j])v+=a*p[j];
    Ap[i]=v;denom+=v*p[i];
   }
   if(!finite(denom)||denom<=1e-24)return{x,converged:false};
   const alpha=rz/denom;let nrz=0;
   for(let i=0;i<ND;i++)if(!mask[i]){
    x[i]+=alpha*p[i];r[i]-=alpha*Ap[i];z[i]=r[i]/diag[i];nrz+=r[i]*z[i];
   }
   if(Math.sqrt(nrz)<=target)return{x,converged:true};
   const beta=nrz/rz;rz=nrz;
   for(let i=0;i<ND;i++)if(!mask[i])p[i]=z[i]+beta*p[i];
  }
  return{x,converged:false};
 }
 function create({structure,synthetic,parameters={E:10,nu:.3,crss:.045,hardening:1.8}}={}){
  if(!cp||!slip)throw new Error('Constitutivo de cristal nao carregado');
  if(synthetic?.kind!=='schematic'||synthetic.generator!=='silm-voronoi-v1'||
   !slip?.types?.[structure])throw new TypeError('Somente estrutura suportada e Voronoi esquematico');
  const polygons=synthetic.polygons;
  if(!Array.isArray(polygons)||polygons.length<2||polygons.length>MAX_GRAINS||
   !finite(synthetic.width)||!finite(synthetic.height)||
   synthetic.width<=0||synthetic.height<=0||
   !Number.isInteger(synthetic.seed)||synthetic.seed<0||synthetic.seed>4294967295||
   !polygons.every(poly=>Array.isArray(poly)&&poly.length>=3&&poly.every(p=>
    Array.isArray(p)&&p.length===2&&p.every(finite))))
   throw new RangeError('Formacao sintetica invalida');
  const grainCenters=polygons.map(center);
  const orientations=polygons.map((poly,i)=>fixedOrientation(synthetic.seed,i));
  const models=orientations.map(orientationMatrix=>cp.create({
   structure,orientationMatrix,parameters,provenance:'synthetic-demonstration'
  }));
  const grainOfTriangle=triangles.map(t=>grainAt(polygons,
   t.center[0]*synthetic.width,t.center[1]*synthetic.height,grainCenters));
  const indexOf=(u,v)=>{
   const xx=clip(Number(u)||0,0,1)*NX,yy=clip(Number(v)||0,0,1)*NY,
    i=Math.min(NX-1,Math.floor(xx)),j=Math.min(NY-1,Math.floor(yy));
   return 2*(j*NX+i)+((yy-j)<=(xx-i)?0:1);
  };
  const initial=()=>({u:new Float64Array(ND),force:new Float64Array(ND),
   points:triangles.map((t,i)=>models[grainOfTriangle[i]].initial())});
  function assemble(u,prior,{stiffness=false}={}){
   const force=new Float64Array(ND),states=new Array(NE),out=new Array(NE),
    rows=stiffness?newRows():null;
   let total=0,plastic=0,maxSlip=0;
   let energyElastic=0,energyHardening=0,energyDissipated=0,maxAbsLocalStrain=0;
   let activeIndex=-1,activeStage='start';
   try{
    for(let i=0;i<NE;i++){
     activeIndex=i;activeStage='return-map';
     const t=triangles[i],model=models[grainOfTriangle[i]],
      strain=strainOf(t,u),e=bToCrystal(strain),z=model.step(prior.points[i],e,{
       tolerance:2e-9,maxSweeps:180
      });
     if(!z.converged)return {failure:'LOCAL_NONCONVERGED',element:i,strain:e};
     states[i]=z.state;out[i]=z;
     const st=z.state,stress3=st.stress;
     const elastic3=st.totalStrain.map((x,j)=>x-st.plasticStrain[j]);
     let strainEnergy=0;
     for(let j=0;j<6;j++)strainEnergy+=elastic3[j]*stress3[j]*(j<3?1:2);
     // Energetica 3D incluindo sigma_zz: equilibrio FEM e de deformacao plana.
     // A dissipacao acumulada refere-se ao modelo relativo, nao ao calor medido.
     energyElastic+=.5*strainEnergy*t.area;
     energyHardening+=.5*parameters.hardening*st.accumulatedSlip**2*t.area;
     for(let a=0;a<st.slipBySystem.length;a++)
      energyDissipated+=model.parameters.crss[a]*st.slipBySystem[a]*t.area;
     maxAbsLocalStrain=Math.max(maxAbsLocalStrain,...e.map(Math.abs));
     plastic+=z.activeSystems>0?1:0;
     total+=z.accumulatedSlip*t.area;maxSlip=Math.max(maxSlip,z.accumulatedSlip);
     const sig=vectorStress(z);
     for(let a=0;a<6;a++){
      let value=0;for(let j=0;j<3;j++)value+=t.B[j][a]*sig[j];
      force[t.dofs[a]]+=value*t.area;
     }
     if(stiffness){
      activeStage='tangent';
      const D=Array.from({length:3},()=>[0,0,0]),h=1e-6;
      for(let j=0;j<3;j++){
       const ep=e.slice(),em=e.slice();
       // B uses engineering gamma_xy; crystalPlasticity uses tensor eps_xy.
       const jj=j===2?3:j,scale=j===2?.5:1;
       ep[jj]+=h*scale;em[jj]-=h*scale;
       const a=model.step(prior.points[i],ep,{tolerance:1e-8,maxSweeps:150});
       const b=model.step(prior.points[i],em,{tolerance:1e-8,maxSweeps:150});
       if(!a.converged||!b.converged)return {failure:'TANGENT_NONCONVERGED',element:i,strain:e};
       const ap=vectorStress(a),bp=vectorStress(b);
       for(let k=0;k<3;k++)D[k][j]=(ap[k]-bp[k])/(2*h);
      }
      for(let j=0;j<3;j++)for(let k=j+1;k<3;k++){
       const mean=.5*(D[j][k]+D[k][j]);D[j][k]=mean;D[k][j]=mean;
      }
      for(let j=0;j<3;j++)D[j][j]+=1e-5;
      addStiffness(rows,t,D);
     }
    }
   }catch(error){return {failure:'LOCAL_ERROR',element:activeIndex,stage:activeStage,message:error?.message||String(error)};}
   return{force,rows,states,out,plasticTriangles:plastic,
    meanSlip:total,maxSlip,maxAbsLocalStrain,
    energy:Object.freeze({elasticStored:energyElastic,
     hardeningStored:energyHardening,plasticDissipated:energyDissipated,
     total:energyElastic+energyHardening+energyDissipated})};
  }
  function equilibrate(previous,{mode,position,width,load,release=false}){
   const {mask,values}=fixed(mode,position,width,load,release);
   let u=previous.u.slice();
   for(let i=0;i<ND;i++)if(mask[i])u[i]=values[i];
   let last=null,iter=0,done=false,err=Infinity;
   for(;iter<16;iter++){
    const a=assemble(u,previous,{stiffness:true});
    if(!a||a.failure)return{converged:false,reason:a?.failure||'CONSTITUTIVE_INTEGRATION',diagnostic:a||null,iterations:iter};
    last=a;err=norm(a.force,mask);
    if(err<8e-5){done=true;break;}
    const d=pcg(a.rows,mask,a.force);
    if(!d.converged)return{converged:false,reason:'LINEAR_SOLVE',iterations:iter,residual:err};
    let accepted=false,scale=1;
    for(let line=0;line<10;line++){
     const candidate=u.slice();
     for(let j=0;j<ND;j++)if(!mask[j])candidate[j]+=scale*d.x[j];
     const next=assemble(candidate,previous);
     if(next&&!next.failure&&norm(next.force,mask)<err*(1-1e-5*scale)){
      u=candidate;last=next;accepted=true;break;
     }
     scale*=.5;
    }
    if(!accepted)return{converged:false,reason:'LINE_SEARCH',iterations:iter,residual:err};
   }
   last=assemble(u,previous);
   if(!last||last.failure)return{converged:false,reason:last?.failure||'CONSTITUTIVE_INTEGRATION',diagnostic:last||null,iterations:iter};
   err=norm(last.force,mask);
   if(err<8e-5)done=true;
   let netFx=0,netFy=0,topY=0,bottomY=0,contactReactionX=0;
   for(let i=0;i<ND/2;i++){
    const x=last.force[2*i],y=last.force[2*i+1],row=Math.floor(i/(NX+1));
    netFx+=x;netFy+=y;
    if(mask[2*i]&&row===0)contactReactionX+=x;
    if(mask[2*i+1]&&row===0)topY+=y;
    if(mask[2*i+1]&&row===NY)bottomY+=y;
   }
   const reactions=Object.freeze({topY,bottomY,contactX:contactReactionX,
    netFx,netFy,freeResidual:err,units:'relative'});
   return done?{converged:true,record:{u,force:last.force,points:last.states},
    iterations:iter+1,residual:err,plasticTriangles:last.plasticTriangles,
    meanSlip:last.meanSlip,maxSlip:last.maxSlip,maxAbsLocalStrain:last.maxAbsLocalStrain,
    energy:last.energy,reactions}:
    {converged:false,reason:'EQUILIBRIUM_NOT_CONVERGED',
     iterations:iter,residual:err};
  }
  function report(record,solved){
   const sums=polygons.map(()=>({count:0,total:0,max:0,plastic:0}));
   for(let i=0;i<NE;i++){
    const id=grainOfTriangle[i],acc=record.points[i].accumulatedSlip,
     g=sums[id];g.count++;g.total+=acc;g.max=Math.max(g.max,acc);
     if(acc>1e-8)g.plastic++;
   }
   const grains=Object.freeze(sums.map((g,i)=>Object.freeze({
    grainId:i+1,orientationMatrix:Object.freeze(orientations[i].map(row=>Object.freeze([...row]))),
    integrationPoints:g.count,meanAccumulatedSlip:g.count?g.total/g.count:null,
    maxAccumulatedSlip:g.count?g.max:null,
    plasticIntegrationPoints:g.plastic,
    status:g.count?'SYNTHETIC_MODEL':'NOT_SAMPLED_BY_FEM',
    calibrated:false
   })));
   const sample=(u,v)=>{
    const xx=clip(Number(u)||0,0,1)*NX,yy=clip(Number(v)||0,0,1)*NY,
     i=Math.min(NX-1,Math.floor(xx)),j=Math.min(NY-1,Math.floor(yy)),
     a=xx-i,b=yy-j,ids=[node(i,j),node(i+1,j),node(i,j+1),node(i+1,j+1)],
     weights=[(1-a)*(1-b),a*(1-b),(1-a)*b,a*b];
    let dx=0,dy=0;ids.forEach((id,k)=>{
     dx+=weights[k]*record.u[2*id];dy+=weights[k]*record.u[2*id+1];
    });
    return Object.freeze({dx,dy});
   };
   const samplePlastic=(u,v)=>record.points[indexOf(u,v)].accumulatedSlip;
   const sampleStress=(u,v)=>{
    const s=record.points[indexOf(u,v)].stress;
    return Object.freeze([Object.freeze([s[0],s[3],s[5]]),
     Object.freeze([s[3],s[1],s[4]]),Object.freeze([s[5],s[4],s[2]])]);
   };
   return Object.freeze({
    schema:'silm.polycrystal-cpfem.small-strain.v1',
    status:'CONVERGED',converged:true,
    sourceKind:'synthetic-voronoi',orientationKind:'deterministic-hypothetical',
    structure:slip.types[structure],nx:NX,ny:NY,triangles:NE,
    grainCount:polygons.length,sampledGrains:grains.filter(g=>g.integrationPoints>0).length,
    grains,plasticTriangles:solved.plasticTriangles,
    meanAccumulatedSlip:solved.meanSlip,maxAccumulatedSlip:solved.maxSlip,
    iterations:solved.iterations,residual:solved.residual,
    maxAbsLocalStrain:solved.maxAbsLocalStrain,
    energy:solved.energy,reactions:solved.reactions,
    energyBalanceStatus:'NOT_EVALUATED_EXTERNAL_WORK',
    sample,samplePlastic,sampleStress,
    calibrated:false,units:'relative',canFeedJ2:false,canFeedMetalProperties:false,
    canClaimMeasuredGrainResponse:false,finiteDeformation:false,
    limitation:'Policristal hipotetico em pequenas deformacoes, FEM plano, parametros relativos. Sem EBSD medido, fronteiras intergranulares especiais, deformacao finita, estriccao ou ruptura.'
   });
  }
  function run({mode='tension',position=.5,width=.3,load=0.7,
   increments=4,unload=false}={}){
   if(!['tension','compression'].includes(mode)||![position,width,load].every(finite)||
    position<.1||position>.9||width<.1||width>.8||load<0||load>1||
    !Number.isInteger(increments)||increments<1||increments>MAX_STEPS)
    return Object.freeze({status:'INVALID_LOADING',converged:false});
   let prior=initial(),last=null,stepsCompleted=0,externalWork=0;
   const history=[];
   // Integracao trapezoidal do trabalho no contato com deslocamento prescrito.
   // Ao remover bruscamente Dirichlet na descarga nao conhecemos o trabalho.
   const accumulateWork=(before,after,command,stepNumber)=>{
    const prescribed=fixed(mode,position,width,command,false).mask;
    let increment=0;
    for(let i=0;i<ND;i++)if(prescribed[i]){
     const du=after.record.u[i]-before.u[i];
     increment+=.5*(before.force[i]+after.record.force[i])*du;
    }
    externalWork+=increment;
    const stored=after.energy.total;
    const imbalance=externalWork-stored;
    const relative=Math.abs(imbalance)/Math.max(Math.abs(externalWork),Math.abs(stored),1e-10);
    history.push(Object.freeze({step:stepNumber,relativeCommand:command,
     externalWorkIncrement:increment,externalWorkCumulative:externalWork,
     internalEnergyCumulative:stored,workEnergyResidual:imbalance,
     relativeResidual:relative,freeResidual:after.residual,
     integration:'trapezoidal-prescribed-displacement',units:'relative'}));
   };
   for(let i=1;i<=increments;i++){
    const r=equilibrate(prior,{mode,position,width,load:load*i/increments});
    if(!r.converged)return Object.freeze({status:'NONCONVERGED',converged:false,
     reason:r.reason,diagnostic:r.diagnostic||null,stepsCompleted,requestedSteps:increments,calibrated:false});
    accumulateWork(prior,r,load*i/increments,i);
    prior=r.record;last=r;stepsCompleted++;
   }
   if(unload){
    const r=equilibrate(prior,{mode,position,width,load:0,release:true});
    if(!r.converged)return Object.freeze({status:'NONCONVERGED',converged:false,
     reason:r.reason,diagnostic:r.diagnostic||null,stepsCompleted,requestedSteps:increments+1,calibrated:false});
    // O contato e liberado sem rampa de deslocamento controlado. Nenhum
    // resultado de balanco energetico da descarga pode ser reivindicado.
    prior=r.record;last=r;stepsCompleted++;
   }
   const loaded=history[history.length-1];
   const energyAudit=Object.freeze({
    status:unload?'UNLOADING_PATH_NOT_RESOLVED':'TRAPEZOIDAL_ESTIMATE',
    externalWorkLoading:externalWork,
    storedPlusDissipatedLoading:loaded?.internalEnergyCumulative||0,
    loadingWorkEnergyResidual:loaded?.workEnergyResidual||0,
    loadingRelativeResidual:loaded?.relativeResidual||0,
    unloadingExternalWork:null,
    validAsExperimentalBalance:false,calibrated:false,units:'relative',
    method:'trapezoidal-reactions-at-prescribed-nodes',
    limitation:unload?
     'O contato e liberado sem curva de descarga controlada; trabalho de descarga desconhecido.':
     'Quadratura trapezoidal por passos discretos; o erro depende dos incrementos.'
   });
   return Object.freeze({...report(prior,last),energyAudit,
    workHistory:Object.freeze(history),stepsCompleted,unloaded:unload,
    loadCase:Object.freeze({mode,position,width,load,increments,unload,
     kind:'prescribed-displacement',units:'relative'})});
  }
  return Object.freeze({schema:'silm.polycrystal-cpfem.small-strain.v1',
   structure:slip.types[structure],sourceKind:'synthetic-voronoi',
   grainCount:polygons.length,triangles:NE,parameters:Object.freeze({
    E:parameters.E,nu:parameters.nu,crss:parameters.crss,hardening:parameters.hardening,
    calibrated:false,units:'relative'
   }),run,calibrated:false,canFeedJ2:false,requiresMenuReview:true});
 }
 // Patch de deformacao afim: valida somente geometria CST e interpolacao.
 // Nao substitui ensaio de convergencia de malha nem verifica equilibrio
 // elastoplastico ou condicoes experimentais de contorno.
 function verifyAffinePatch({exx=.001,eyy=-.0005,gammaXY=.0004}={}){
  if(![exx,eyy,gammaXY].every(finite)||
   [exx,eyy,gammaXY].some(v=>Math.abs(v)>.02))
   throw new RangeError('Patch requer componentes finitas de pequenas deformacoes');
  const u=new Float64Array(ND);
  for(let y=0;y<=NY;y++)for(let x=0;x<=NX;x++){
   const id=node(x,y),xx=x/NX,yy=y/NY;
   u[2*id]=exx*xx+gammaXY*yy*.5;
   u[2*id+1]=eyy*yy+gammaXY*xx*.5;
  }
  let area=0,maxError=0;
  for(const tri of triangles){
   area+=tri.area;
   const observed=strainOf(tri,u),expected=[exx,eyy,gammaXY];
   for(let j=0;j<3;j++)maxError=Math.max(maxError,Math.abs(observed[j]-expected[j]));
  }
  return Object.freeze({status:maxError<1e-10&&Math.abs(area-1)<1e-10?'AFFINE_PATCH_PASS':'AFFINE_PATCH_FAIL',
   maxStrainError:maxError,integratedArea:area,areaError:Math.abs(area-1),
   triangles:NE,engineeringShear:true,calibrated:false,meshConvergenceVerified:false});
 }
 return Object.freeze({schema:'silm.polycrystal-cpfem.small-strain.v1',
  create,verifyAffinePatch,calibrated:false,requiresMenuReview:true,canFeedJ2:false,
  NX,NY,triangles:NE});
})();
