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
 const DEFAULT_NX=12,DEFAULT_NY=8;

 // Campos para leitura visual sem substituir os valores cientificos.
 // Escalas relativas e calculadas exclusivamente dos graos amostrados.
 function describeGrainMap(result,{kind='plastic-strain'}={}){
  const definitions=Object.freeze({
   'plastic-strain':Object.freeze({property:'meanEquivalentPlasticStrain',
    label:'Deformação plástica equivalente',signed:false,residualOnly:false}),
   'residual-von-mises':Object.freeze({property:'meanVonMisesStress',
    label:'Tensão equivalente residual (von Mises)',signed:false,residualOnly:true}),
   'residual-axial':Object.freeze({property:'meanAxialStress',
    label:'Tensão axial residual σyy',signed:true,residualOnly:true})
  });
  const spec=definitions[kind];
  if(!spec)throw new RangeError('Grandeza CPFEM sem mapa homologado');
  if(!result?.converged||result.sourceKind!=='synthetic-voronoi'||
   !Array.isArray(result.grains)||result.calibrated!==false)
   throw new TypeError('Mapa somente para solucao CPFEM sintetica convergente');
  if(spec.residualOnly&&(!result.residualSummary||
   result.mechanicalState!=='ZERO_TOP_FORCE'))
   return Object.freeze({status:'UNAVAILABLE_RESIDUAL_BOUNDARY',kind,
    label:spec.label,entries:Object.freeze([]),units:'relative',calibrated:false,
    explanation:'O topo precisa atingir equilibrio numerico com forca externa zero.'});
  const data=result.grains.map(grain=>{
   const value=grain.mechanics?.[spec.property];
   const usable=Number.isFinite(value)&&grain.integrationPoints>0;
   return Object.freeze({grainId:grain.grainId,
    value:usable?value:null,integrationPoints:grain.integrationPoints,
    integrationArea:grain.integrationArea||0,
    status:usable?'SAMPLED_SYNTHETIC':'NOT_SAMPLED_BY_FEM'});
  });
  const valid=data.filter(v=>v.value!==null);
  // Zero e origem fisica das magnitudes; tensao axial usa escala centrada.
  const maxAbs=Math.max(0,...valid.map(v=>Math.abs(v.value)));
  const max=spec.signed?maxAbs:Math.max(0,...valid.map(v=>v.value));
  const min=spec.signed?-maxAbs:0;
  const entries=Object.freeze(data.map(v=>Object.freeze({...v,
   normalized:v.value===null?null:maxAbs===0?0:
    spec.signed?v.value/maxAbs:v.value/Math.max(max,1e-30)
  })));
  return Object.freeze({status:valid.length?'DIAGNOSTIC_ONLY':'NO_SAMPLED_GRAINS',
   kind,label:spec.label,signed:spec.signed,min,max,
   sampledGrains:valid.length,totalGrains:data.length,entries,
   domain:'per-run-sampled-grains',units:'relative',calibrated:false,
   sourceKind:'synthetic-voronoi',measured:false,
   explanation:'Escala relativa ao ensaio atual; comparacao de cor entre ensaios nao e quantitativa.'});
 }

 const MAX_GRAINS=256,MAX_STEPS=12;
 const clip=(x,a,b)=>Math.max(a,Math.min(b,x));
 const finite=Number.isFinite;
 // A mesma formulacao FEM deve poder ser resolvida em mais de uma malha.
 // O cache e apenas de geometria/alocacao; cada ensaio e independente.
 function buildGrid(NX,NY){
 const NE=2*NX*NY,ND=2*(NX+1)*(NY+1);
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
 const fixed=(mode,position,width,load,release,holdContact=false)=>{
  const mask=new Uint8Array(ND),values=new Float64Array(ND);
  for(let i=0;i<=NX;i++)mask[2*node(i,NY)+1]=1;
  mask[2*node(Math.floor(NX/2),NY)]=1;
  if(!release&&(load>0||holdContact)){
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
  function equilibrate(previous,{mode,position,width,load,release=false,holdContact=false,external=null}){
   const {mask,values}=fixed(mode,position,width,load,release,holdContact);
   let u=previous.u.slice();
   for(let i=0;i<ND;i++)if(mask[i])u[i]=values[i];
   if(external&&(!(external instanceof Float64Array)||external.length!==ND||
    external.some(v=>!finite(v))))
    return{converged:false,reason:'INVALID_EXTERNAL_FORCE'};
   const residualOf=force=>{
    if(!external)return force;
    const r=force.slice();
    for(let k=0;k<ND;k++)r[k]-=external[k];
    return r;
   };
   let last=null,iter=0,done=false,err=Infinity;
   for(;iter<16;iter++){
    const a=assemble(u,previous,{stiffness:true});
    if(!a||a.failure)return{converged:false,reason:a?.failure||'CONSTITUTIVE_INTEGRATION',diagnostic:a||null,iterations:iter};
    last=a;err=norm(residualOf(a.force),mask);
    if(err<8e-5){done=true;break;}
    const d=pcg(a.rows,mask,residualOf(a.force));
    if(!d.converged)return{converged:false,reason:'LINEAR_SOLVE',iterations:iter,residual:err};
    let accepted=false,scale=1;
    for(let line=0;line<10;line++){
     const candidate=u.slice();
     for(let j=0;j<ND;j++)if(!mask[j])candidate[j]+=scale*d.x[j];
     const next=assemble(candidate,previous);
     if(next&&!next.failure&&norm(residualOf(next.force),mask)<err*(1-1e-5*scale)){
      u=candidate;last=next;accepted=true;break;
     }
     scale*=.5;
    }
    if(!accepted)return{converged:false,reason:'LINE_SEARCH',iterations:iter,residual:err};
   }
   last=assemble(u,previous);
   if(!last||last.failure)return{converged:false,reason:last?.failure||'CONSTITUTIVE_INTEGRATION',diagnostic:last||null,iterations:iter};
   err=norm(residualOf(last.force),mask);
   if(err<8e-5)done=true;
   let netFx=0,netFy=0,topY=0,bottomY=0,contactReactionX=0;
   for(let i=0;i<ND/2;i++){
    const x=last.force[2*i],y=last.force[2*i+1],row=Math.floor(i/(NX+1));
    netFx+=x;netFy+=y;
    if(mask[2*i]&&row===0)contactReactionX+=x;
    if(mask[2*i+1]&&row===0)topY+=y;
    if(mask[2*i+1]&&row===NY)bottomY+=y;
   }
   let appliedContactForce=0,topFreeResidual=0;
   if(external)for(let k=0;k<ND;k++){
    appliedContactForce+=external[k]*external[k];
    if(Math.floor(k/2/(NX+1))===0&&!mask[k])
     topFreeResidual+=Math.pow(last.force[k]-external[k],2);
   }
   const reactions=Object.freeze({topY,bottomY,contactX:contactReactionX,
    netFx,netFy,freeResidual:err,appliedContactForceNorm:Math.sqrt(appliedContactForce),
    topFreeResidual:Math.sqrt(topFreeResidual),units:'relative'});
   return done?{converged:true,record:{u,force:last.force,points:last.states},
    iterations:iter+1,residual:err,plasticTriangles:last.plasticTriangles,
    meanSlip:last.meanSlip,maxSlip:last.maxSlip,maxAbsLocalStrain:last.maxAbsLocalStrain,
    energy:last.energy,reactions}:
    {converged:false,reason:'EQUILIBRIUM_NOT_CONVERGED',
     iterations:iter,residual:err};
  }
  // Tensor simetrico 3D com 6 componentes [xx,yy,zz,xy,yz,xz].
  // Os cisalhamentos sao TENSORIAIS (nao gamma de engenharia).
  const tensor=v=>Object.freeze([
   Object.freeze([v[0],v[3],v[5]]),
   Object.freeze([v[3],v[1],v[4]]),
   Object.freeze([v[5],v[4],v[2]])
  ]);
  const devSquared=v=>{
   const p=(v[0]+v[1]+v[2])/3;
   return (v[0]-p)**2+(v[1]-p)**2+(v[2]-p)**2+
    2*(v[3]**2+v[4]**2+v[5]**2);
  };
  const equivalentPlastic=v=>Math.sqrt(Math.max(0,2*devSquared(v)/3));
  const vonMises=v=>Math.sqrt(Math.max(0,3*devSquared(v)/2));
  function report(record,solved,{peakRecord=null,residualAtZeroForce=false,
   mechanicalState='LOADED'}={}){
   const residual=Boolean(residualAtZeroForce&&peakRecord);
   // Area ponderada em vez de contagem bruta: preserva a unidade da media.
   const sums=polygons.map(()=>({count:0,area:0,total:0,max:0,plastic:0,
    totalYY:0,plasticYY:0,elasticYY:0,stressYY:0,eqp:0,maxEqp:0,
    vm:0,maxVm:0,peakYY:0}));
   let domainArea=0,domainTotalYY=0,domainPlasticYY=0,domainElasticYY=0,
    domainStressYY=0,domainEqp=0,domainVm=0,domainPeakYY=0,domainMaxVm=0;
   for(let i=0;i<NE;i++){
    const st=record.points[i],peak=peakRecord?.points[i],area=triangles[i].area,
     g=sums[grainOfTriangle[i]],acc=st.accumulatedSlip,
     eqp=equivalentPlastic(st.plasticStrain),vm=vonMises(st.stress),
     elasticYY=st.totalStrain[1]-st.plasticStrain[1];
    g.count++;g.area+=area;g.total+=acc*area;g.max=Math.max(g.max,acc);
    if(acc>1e-8)g.plastic++;
    g.totalYY+=st.totalStrain[1]*area;
    g.plasticYY+=st.plasticStrain[1]*area;
    g.elasticYY+=elasticYY*area;g.stressYY+=st.stress[1]*area;
    g.eqp+=eqp*area;g.maxEqp=Math.max(g.maxEqp,eqp);
    g.vm+=vm*area;g.maxVm=Math.max(g.maxVm,vm);
    if(peak)g.peakYY+=peak.totalStrain[1]*area;
    domainArea+=area;domainTotalYY+=st.totalStrain[1]*area;
    domainPlasticYY+=st.plasticStrain[1]*area;domainElasticYY+=elasticYY*area;
    domainStressYY+=st.stress[1]*area;
    domainEqp+=eqp*area;domainVm+=vm*area;
    domainMaxVm=Math.max(domainMaxVm,vm);
    if(peak)domainPeakYY+=peak.totalStrain[1]*area;
   }
   const grains=Object.freeze(sums.map((g,i)=>{
    const sampled=g.count>0;
    const mechanics=sampled?Object.freeze({
     meanTotalAxialStrain:g.totalYY/g.area,
     meanPlasticAxialStrain:g.plasticYY/g.area,
     meanElasticAxialStrain:g.elasticYY/g.area,
     meanEquivalentPlasticStrain:g.eqp/g.area,
     maxEquivalentPlasticStrain:g.maxEqp,
     meanAxialStress:g.stressYY/g.area,
     meanVonMisesStress:g.vm/g.area,
     maxVonMisesStress:g.maxVm,
     peakAxialStrain:peakRecord?g.peakYY/g.area:null,
     axialStrainChangeFromPeak:peakRecord?(g.peakYY-g.totalYY)/g.area:null,
     residualAtZeroTopForce:residual,
     calibrated:false,units:'relative'
    }):null;
    return Object.freeze({
     grainId:i+1,orientationMatrix:Object.freeze(orientations[i].map(row=>Object.freeze([...row]))),
     integrationPoints:g.count,integrationArea:g.area,
     meanAccumulatedSlip:sampled?g.total/g.area:null,
     maxAccumulatedSlip:sampled?g.max:null,plasticIntegrationPoints:g.plastic,
     mechanics,status:sampled?'SYNTHETIC_MODEL':'NOT_SAMPLED_BY_FEM',calibrated:false
    });
   }));
   const sampleFrom=(state,u,v)=>{
    const xx=clip(Number(u)||0,0,1)*NX,yy=clip(Number(v)||0,0,1)*NY,
     i=Math.min(NX-1,Math.floor(xx)),j=Math.min(NY-1,Math.floor(yy)),
     a=xx-i,b=yy-j,ids=[node(i,j),node(i+1,j),node(i,j+1),node(i+1,j+1)],
     weights=[(1-a)*(1-b),a*(1-b),(1-a)*b,a*b];
    let dx=0,dy=0;ids.forEach((id,k)=>{
     dx+=weights[k]*state.u[2*id];dy+=weights[k]*state.u[2*id+1];
    });
    return Object.freeze({dx,dy});
   };
   const sample=(u,v)=>sampleFrom(record,u,v);
   const samplePlastic=(u,v)=>record.points[indexOf(u,v)].accumulatedSlip;
   const sampleStress=(u,v)=>tensor(record.points[indexOf(u,v)].stress);
   const sampleMechanics=(u,v)=>{
    const st=record.points[indexOf(u,v)],
     elastic=st.totalStrain.map((x,i)=>x-st.plasticStrain[i]);
    return Object.freeze({
     totalStrain:tensor(st.totalStrain),
     plasticStrain:tensor(st.plasticStrain),
     elasticStrain:tensor(elastic),
     stress:tensor(st.stress),
     equivalentPlasticStrain:equivalentPlastic(st.plasticStrain),
     vonMisesStress:vonMises(st.stress),accumulatedSlip:st.accumulatedSlip,
     residualAtZeroTopForce:residual,calibrated:false,units:'relative'
    });
   };
   const samplePeakDisplacement=peakRecord?
    (u,v)=>sampleFrom(peakRecord,u,v):()=>null;
   const sampleDisplacementChangeFromPeak=peakRecord?(u,v)=>{
    const before=sampleFrom(peakRecord,u,v),after=sample(u,v);
    return Object.freeze({dx:before.dx-after.dx,dy:before.dy-after.dy});
   }:()=>null;
   // "Recuperacao" no sentido de deslocamento pico->final. Pode haver
   // deslizamento durante a descarga, portanto nao chamamos puramente elastica.
   const residualSummary=residual?Object.freeze({
    status:'ZERO_TOP_FORCE_EQUILIBRIUM_ESTIMATE',
    boundaryCondition:'traction-free-top',
    meanTotalAxialStrain:domainTotalYY/domainArea,
    meanPlasticAxialStrain:domainPlasticYY/domainArea,
    meanElasticAxialStrain:domainElasticYY/domainArea,
    meanEquivalentPlasticStrain:domainEqp/domainArea,
    meanAxialStress:domainStressYY/domainArea,
    meanVonMisesStress:domainVm/domainArea,
    maxVonMisesStress:domainMaxVm,
    peakAxialStrain:domainPeakYY/domainArea,
    axialStrainChangeFromPeak:(domainPeakYY-domainTotalYY)/domainArea,
    calibrated:false,measured:false,units:'relative'
   }):null;
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
    residualSummary,mechanicalState,
    sample,samplePlastic,sampleStress,sampleMechanics,
    samplePeakDisplacement,sampleDisplacementChangeFromPeak,
    calibrated:false,units:'relative',canFeedJ2:false,canFeedMetalProperties:false,
    canClaimMeasuredGrainResponse:false,finiteDeformation:false,
    limitation:'Policristal hipotetico em pequenas deformacoes, FEM plano, parametros relativos. Sem EBSD medido, fronteiras intergranulares especiais, deformacao finita, estriccao ou ruptura.'
   });
  }
  function run({mode='tension',position=.5,width=.3,load=0.7,
   increments=4,unload=false,unloadIncrements=5,unloadMode='displacement'}={}){
   if(!['tension','compression'].includes(mode)||![position,width,load].every(finite)||
    position<.1||position>.9||width<.1||width>.8||load<0||load>1||
    !Number.isInteger(increments)||increments<1||increments>MAX_STEPS||
    !Number.isInteger(unloadIncrements)||unloadIncrements<1||unloadIncrements>MAX_STEPS||
    !['displacement','force'].includes(unloadMode))
    return Object.freeze({status:'INVALID_LOADING',converged:false});
   let prior=initial(),last=null,stepsCompleted=0,externalWork=0;
   const history=[];
   // Trabalho externo: quadratura trapezoidal das reacoes no contato com
   // deslocamento imposto. A garra permanece prescrita na descarga ate
   // deslocamento ZERO; nao ha liberacao instantanea de Dirichlet.
   const accumulateWork=(before,after,command,stepNumber,phase)=>{
    const mask=fixed(mode,position,width,command,false,true).mask;
    let increment=0;
    for(let i=0;i<ND;i++)if(mask[i]){
     const du=after.record.u[i]-before.u[i];
     increment+=.5*(before.force[i]+after.record.force[i])*du;
    }
    externalWork+=increment;
    const stored=after.energy.total;
    const imbalance=externalWork-stored;
    const relative=Math.abs(imbalance)/Math.max(Math.abs(externalWork),Math.abs(stored),1e-10);
    history.push(Object.freeze({step:stepNumber,phase,relativeCommand:command,
     externalWorkIncrement:increment,externalWorkCumulative:externalWork,
     internalEnergyCumulative:stored,workEnergyResidual:imbalance,
     relativeResidual:relative,freeResidual:after.residual,
     integration:'trapezoidal-prescribed-displacement',units:'relative'}));
   };
   for(let i=1;i<=increments;i++){
    const command=load*i/increments;
    const r=equilibrate(prior,{mode,position,width,load:command});
    if(!r.converged)return Object.freeze({status:'NONCONVERGED',converged:false,
     phase:'loading',reason:r.reason,diagnostic:r.diagnostic||null,
     stepsCompleted,requestedSteps:increments+(unload?unloadIncrements:0),calibrated:false});
    accumulateWork(prior,r,command,i,'loading');
    prior=r.record;last=r;stepsCompleted++;
   }
   const loaded=history[history.length-1];
   const peakRecord=prior; // estado de pico ANTES de qualquer descarga
   const externalWorkLoading=externalWork;
   let peakContactForceNorm=null;
   let boundaryFinal=unload?'contact-fixed-at-zero':'contact-displacement-prescribed';
   if(unload){
    if(unloadMode==='displacement'){
     // 84D: recuar a garra, mantendo os mesmos graus de liberdade prescritos.
     for(let j=1;j<=unloadIncrements;j++){
      const command=load*(1-j/unloadIncrements);
      const r=equilibrate(prior,{mode,position,width,load:command,holdContact:true});
      if(!r.converged)return Object.freeze({status:'NONCONVERGED',converged:false,
       phase:'unloading',unloadMode,reason:r.reason,diagnostic:r.diagnostic||null,
       stepsCompleted,requestedSteps:increments+unloadIncrements,calibrated:false});
      accumulateWork(prior,r,command,increments+j,'unloading');
      prior=r.record;last=r;stepsCompleted++;
     }
    }else{
     // 84E: liberar os DOFs da garra e substitui-los pelas respectivas
     // forcas nodais EXATAMENTE da solucao de carregamento anterior.
     // A cada incremento reduz-se esse vetor ate zero (controle Neumann).
     // Não e modelo unilateral de contato ou força medida em newtons.
     const atPeak=fixed(mode,position,width,load,false,true).mask;
     const supports=fixed(mode,position,width,0,true).mask;
     const peakLoads=new Float64Array(ND);
     for(let k=0;k<ND;k++)if(atPeak[k]&&!supports[k])
      peakLoads[k]=prior.force[k];
     peakContactForceNorm=Math.hypot(...peakLoads);
     let lastLoads=peakLoads;
     for(let j=1;j<=unloadIncrements;j++){
      const fraction=Math.max(0,1-j/unloadIncrements);
      const nextLoads=peakLoads.map(force=>fraction*force);
      const r=equilibrate(prior,{mode,position,width,load:0,
       release:true,external:nextLoads});
      if(!r.converged)return Object.freeze({status:'NONCONVERGED',converged:false,
       phase:'force-unloading',unloadMode,reason:r.reason,diagnostic:r.diagnostic||null,
       stepsCompleted,requestedSteps:increments+unloadIncrements,calibrated:false});
      let increment=0;
      for(let k=0;k<ND;k++){
       const du=r.record.u[k]-prior.u[k];
       increment+=.5*(lastLoads[k]+nextLoads[k])*du;
      }
      externalWork+=increment;
      const stored=r.energy.total,imbalance=externalWork-stored;
      const relative=Math.abs(imbalance)/
       Math.max(Math.abs(externalWork),Math.abs(stored),1e-10);
      history.push(Object.freeze({step:increments+j,phase:'force-unloading',
       relativeCommand:fraction,externalWorkIncrement:increment,
       externalWorkCumulative:externalWork,internalEnergyCumulative:stored,
       workEnergyResidual:imbalance,relativeResidual:relative,
       freeResidual:r.residual,
       appliedContactForceNorm:r.reactions.appliedContactForceNorm,
       integration:'trapezoidal-prescribed-nodal-force',units:'relative'}));
      prior=r.record;last=r;lastLoads=nextLoads;stepsCompleted++;
     }
     boundaryFinal='traction-free-top';
    }
   }
   const final=history[history.length-1];
   const forceUnloaded=unload&&unloadMode==='force';
   const heldAtZero=unload&&unloadMode==='displacement';
   const energyAudit=Object.freeze({
    status:forceUnloaded?'ZERO_FORCE_EQUILIBRIUM_ESTIMATE':
     unload?'CONTROLLED_UNLOADING_ESTIMATE':'TRAPEZOIDAL_ESTIMATE',
    externalWorkLoading,externalWorkTotal:externalWork,
    storedPlusDissipatedLoading:loaded?.internalEnergyCumulative||0,
    loadingWorkEnergyResidual:loaded?.workEnergyResidual||0,
    loadingRelativeResidual:loaded?.relativeResidual||0,
    unloadingExternalWork:unload?externalWork-externalWorkLoading:null,
    storedPlusDissipatedFinal:final?.internalEnergyCumulative||0,
    finalWorkEnergyResidual:final?.workEnergyResidual||0,
    finalRelativeResidual:final?.relativeResidual||0,
    unloadingIncrements:unload?unloadIncrements:0,
    unloadingMode:unload?unloadMode:null,
    contactHeldAtZero:heldAtZero,contactReleased:forceUnloaded,
    appliedContactForceNormFinal:forceUnloaded?
     last.reactions.appliedContactForceNorm:null,
    topFreeResidual:forceUnloaded?last.reactions.topFreeResidual:null,
    peakContactForceNorm,
    boundaryConditionFinal:boundaryFinal,
    validAsExperimentalBalance:false,calibrated:false,units:'relative',
    method:forceUnloaded?'trapezoidal-nodal-force-and-reaction':
     'trapezoidal-reactions-at-prescribed-nodes',
    limitation:forceUnloaded?
     'Descarga gradual por vetor de forcas nodais ate zero; garra cinematicamente liberada. Equilibrio estatico sem tracao externa, nao contato unilateral, friccao nem medicao real.':
     unload?
      'Descarga gradual controlada ate deslocamento zero, com garra mantida. Nao representa liberacao do contato, forca zero, dinamica nem ensaio medido.':
      'Quadratura trapezoidal por incrementos discretos; incerteza numerica depende da discretizacao.'
   });
   return Object.freeze({...report(prior,last,{
     peakRecord:unload?peakRecord:null,residualAtZeroForce:forceUnloaded,
     mechanicalState:forceUnloaded?'ZERO_TOP_FORCE':heldAtZero?'GRIP_AT_ZERO':'LOADED'
    }),energyAudit,
    energyBalanceStatus:'TRAPEZOIDAL_WORK_AUDIT',
    workHistory:Object.freeze(history),stepsCompleted,unloaded:unload,
    loadCase:Object.freeze({mode,position,width,load,increments,unload,
     unloadMode:unload?unloadMode:null,
     unloadIncrements:unload?unloadIncrements:0,
     contactHeldAtZero:heldAtZero,contactReleased:forceUnloaded,
     boundaryConditionFinal:boundaryFinal,
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
 return Object.freeze({create,verifyAffinePatch,NX,NY,triangles:NE});
 }
 const grids=new Map();
 const allowedGrids=Object.freeze([[6,4],[12,8],[18,12]].map(p=>Object.freeze(p)));
 const grid=(nx,ny)=>{
  if(!allowedGrids.some(([x,y])=>nx===x&&ny===y))
   throw new RangeError('Malha CPFEM indisponivel; use 6x4, 12x8 ou 18x12.');
  const key=nx+'x'+ny;
  if(!grids.has(key))grids.set(key,buildGrid(nx,ny));
  return grids.get(key);
 };
 const create=({meshNX=DEFAULT_NX,meshNY=DEFAULT_NY,...rest}={})=>
  grid(meshNX,meshNY).create(rest);
 const verifyAffinePatch=({meshNX=DEFAULT_NX,meshNY=DEFAULT_NY,...rest}={})=>
  grid(meshNX,meshNY).verifyAffinePatch(rest);
 function compareMeshSensitivity({structure,synthetic,parameters,
    mode='compression',position=.5,width=.5,load=.04}={}){
  // A comparacao registra sensibilidade; nunca certifica convergencia.
  if(!['tension','compression'].includes(mode)||![position,width,load].every(finite)||
    position<.1||position>.9||width<.1||width>.8||load<0||load>.2)
   throw new RangeError('Carga fora da faixa de auditoria de malha.');
  const readings=allowedGrids.map(([nx,ny])=>{
   const model=create({structure,synthetic,parameters,meshNX:nx,meshNY:ny});
   const result=model.run({mode,position,width,load,increments:1});
   if(!result.converged)return Object.freeze({nx,ny,triangles:2*nx*ny,
     status:'NONCONVERGED',reason:result.reason||result.status,calibrated:false});
   const point=result.sample(.5,.3);
   return Object.freeze({nx,ny,triangles:result.triangles,status:'CONVERGED',
    displacement:point,contactReactionY:result.reactions.topY,
    energyTotal:result.energy.total,maxAccumulatedSlip:result.maxAccumulatedSlip,
    residual:result.residual,calibrated:false});
  });
  const complete=readings.every(x=>x.status==='CONVERGED');
  const compare=(a,b)=>Object.freeze({
   meshes:[a.nx+'x'+a.ny,b.nx+'x'+b.ny],
   absoluteDisplacementDifference:Math.hypot(a.displacement.dx-b.displacement.dx,
    a.displacement.dy-b.displacement.dy),
   relativeReactionDifference:Math.abs(a.contactReactionY-b.contactReactionY)/
    Math.max(Math.abs(a.contactReactionY),Math.abs(b.contactReactionY),1e-12),
   relativeEnergyDifference:Math.abs(a.energyTotal-b.energyTotal)/
    Math.max(Math.abs(a.energyTotal),Math.abs(b.energyTotal),1e-12)
  });
  return Object.freeze({status:complete?'DIAGNOSTIC_ONLY':'INCOMPLETE',
   grids:Object.freeze(readings),comparisons:complete?Object.freeze([
    compare(readings[0],readings[1]),compare(readings[1],readings[2])]):Object.freeze([]),
   meshConvergenceVerified:false,calibrated:false,units:'relative',
   limitation:'Geometria sintética e atribuição de grãos por centro do triângulo mudam com o refinamento. Comparações não provam convergência nem identificam valores experimentais.'});
 }
 return Object.freeze({schema:'silm.polycrystal-cpfem.small-strain.v1',
  create,verifyAffinePatch,compareMeshSensitivity,describeGrainMap,
  meshPresets:allowedGrids,calibrated:false,requiresMenuReview:true,canFeedJ2:false,
  NX:DEFAULT_NX,NY:DEFAULT_NY,triangles:2*DEFAULT_NX*DEFAULT_NY});
})();
