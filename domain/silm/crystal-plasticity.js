'use strict';
window.SILM=window.SILM||{};
/*
 * Plasticidade cristalografica INCREMENTAL de pequenas deformacoes para um
 * cristal isolado. Na configuracao do cristal R: cristal -> amostra.
 * eps_p = soma_gamma sym(s \otimes n); sigma = C:(eps-eps_p).
 * Retorno rate-independent pelo minimo de energia elastica + dissipacao
 * de cisalhamento com endurecimento isotropico linear acumulado:
 *   W = 1/2 (eps-ep):C:(eps-ep) + sum_a g0_a |delta_gamma_a|
 *       + H/2 (sum_a |delta_gamma_a|)^2.
 * A solucao e calculada por descenso coordenado convexo (soft-threshold).
 * C isotropico, parametros relativos HIPOTETICOS, sem calibracao por metal.
 * Nao resolve grandes deformacoes, rotacao da rede, maclacao, efeitos
 * nao-Schmid CCC, <c+a> HC, contorno de grao, dano ou equilibrio FEM.
 */
SILM.crystalPlasticity=(()=>{
 const slip=SILM.crystalSlip;
 const EPS=1e-12;
 const weights=[1,1,1,2,2,2];
 const finiteArray=(a,n)=>Array.isArray(a)&&a.length===n&&a.every(Number.isFinite);
 const contract=(a,b)=>a.reduce((s,x,i)=>s+weights[i]*x*b[i],0);
 const rotate=(R,v)=>R.map(row=>row.reduce((s,x,i)=>s+x*v[i],0));
 const project=(d,n)=>[
  d[0]*n[0],d[1]*n[1],d[2]*n[2],
  .5*(d[0]*n[1]+d[1]*n[0]),
  .5*(d[1]*n[2]+d[2]*n[1]),
  .5*(d[0]*n[2]+d[2]*n[0])
 ];
 const tensor=v=>Object.freeze([
  Object.freeze([v[0],v[3],v[5]]),
  Object.freeze([v[3],v[1],v[4]]),
  Object.freeze([v[5],v[4],v[2]])
 ]);
 const frozen=a=>Object.freeze([...a]);
 const familyLimit=Object.freeze({
  FCC:'Somente CFC {111}<110>; sem anisotropia elastica, rotacao de rede ou encruamento latente por familia.',
  BCC:'Somente CCC {110}<111>; sem {112}/{123} nem efeitos nao-Schmid.',
  HCP:'Somente HC basal e prismatica <a>; sem piramidal <c+a>, maclacao ou resistencia inferida.'
 });
 function create({structure,orientationMatrix,parameters,provenance='hypothetical'}={}){
  const kind=slip?.types?.[structure];
  if(!kind||!slip.systems[kind])throw new RangeError('Estrutura cristalografica sem sistemas implementados');
  if(!slip.isMatrix(orientationMatrix))throw new TypeError('Orientacao cristalografica valida e obrigatoria');
  const p=parameters||{},E=p.E,nu=p.nu,H=p.hardening;
  if(![E,nu,H].every(Number.isFinite)||E<=0||nu<0||nu>=.49||H<0)
   throw new RangeError('Elasticidade ou encruamento fora dos limites');
  const systems=slip.systems[kind];
  const crss=systems.map(sys=>{
   const value=typeof p.crss==='number'?p.crss:p.crss?.[sys.family];
   if(!Number.isFinite(value)||value<=0)throw new RangeError('CRSS positiva requerida para toda familia');
   return value;
  });
  const lambda=E*nu/((1+nu)*(1-2*nu));
  const mu=E/(2*(1+nu));
  const elastic=e=>{
   const tr=e[0]+e[1]+e[2];
   return [lambda*tr+2*mu*e[0],lambda*tr+2*mu*e[1],
    lambda*tr+2*mu*e[2],2*mu*e[3],2*mu*e[4],2*mu*e[5]];
  };
  const P=systems.map(sys=>project(rotate(orientationMatrix,sys.slipDirection),
   rotate(orientationMatrix,sys.planeNormal)));
  const CP=P.map(elastic);
  const stiffness=P.map((s,i)=>contract(s,CP[i]));
  if(stiffness.some(v=>!(v>EPS)))throw new Error('Geometria ou rigidez de deslizamento invalida');
  const signature=JSON.stringify([kind,orientationMatrix,[E,nu,H],crss]);
  const newState=(strain,plastic,cumulative,slipBySystem,stress)=>Object.freeze({
   model:signature,totalStrain:frozen(strain),plasticStrain:frozen(plastic),
   accumulatedSlip:cumulative,slipBySystem:frozen(slipBySystem),stress:frozen(stress),
   calibrated:false
  });
  const initial=()=>newState([0,0,0,0,0,0],[0,0,0,0,0,0],0,
   systems.map(()=>0),[0,0,0,0,0,0]);
  function step(previous,strain,{tolerance=1e-10,maxSweeps=1000}={}){
   if(!previous||previous.model!==signature||
    !finiteArray(previous.plasticStrain,6)||
    !finiteArray(previous.slipBySystem,systems.length)||
    !Number.isFinite(previous.accumulatedSlip)||previous.accumulatedSlip<0)
    throw new TypeError('Historico plasticidade de outra configuracao ou invalido');
   if(!finiteArray(strain,6)||strain.some(x=>Math.abs(x)>.05))
    throw new RangeError('Deformacao tensorial pequena, finita e <= 5% requerida');
   if(!Number.isFinite(tolerance)||tolerance<=0||!Number.isInteger(maxSweeps)||maxSweeps<1||maxSweeps>10000)
    throw new RangeError('Controle de convergencia invalido');
   const trial=elastic(strain.map((v,i)=>v-previous.plasticStrain[i]));
   const stress=trial.slice(),dg=systems.map(()=>0);
   let sum=0,converged=false,sweeps=0;
   for(;sweeps<maxSweeps;sweeps++){
    let change=0;
    for(let a=0;a<systems.length;a++){
     const old=dg[a],others=sum-Math.abs(old);
     const tau=contract(P[a],stress);
     const target=tau+stiffness[a]*old;
     const threshold=crss[a]+H*(previous.accumulatedSlip+others);
     const value=Math.sign(target)*Math.max(0,
      (Math.abs(target)-threshold)/(stiffness[a]+H));
     const delta=value-old;
     if(delta!==0){
      dg[a]=value;sum=others+Math.abs(value);
      for(let j=0;j<6;j++)stress[j]-=CP[a][j]*delta;
      change=Math.max(change,Math.abs(delta));
     }
    }
    if(change<tolerance){converged=true;sweeps++;break;}
   }
   if(!converged)return Object.freeze({status:'NONCONVERGED',converged:false,
    sweeps,calibrated:false,previous});
   const plastic=previous.plasticStrain.slice();
   for(let a=0;a<systems.length;a++)for(let j=0;j<6;j++)plastic[j]+=P[a][j]*dg[a];
   const accumulated=previous.accumulatedSlip+sum;
   const bySystem=dg.map((d,i)=>previous.slipBySystem[i]+Math.abs(d));
   const state=newState(strain,plastic,accumulated,bySystem,stress);
   const resolved=systems.map((sys,i)=>Object.freeze({
    id:sys.id,family:sys.family,signedShear:contract(P[i],stress),
    incrementalSlip:dg[i],accumulatedSlip:bySystem[i],
    resistance:crss[i]+H*accumulated,active:Math.abs(dg[i])>1e-8
   }));
   const plasticSystems=resolved.filter(r=>r.active).length;
   return Object.freeze({status:plasticSystems?'PLASTIC':'ELASTIC',converged:true,
    state,stressTensor:tensor(stress),systems:Object.freeze(resolved),
    activeSystems:plasticSystems,accumulatedSlip:accumulated,
    plasticStrainNorm:Math.sqrt(contract(plastic,plastic)),
    dissipationLowerBound:dg.reduce((v,d,i)=>v+crss[i]*Math.abs(d),0),
    sweeps,calibrated:false,couplesJ2:false,solvesGrainEquilibrium:false,
    provenance,limitation:familyLimit[kind]
   });
  }
  function runAxial({mode='tension',magnitude=0,steps=10}={}){
   if(!['tension','compression'].includes(mode)||!Number.isFinite(magnitude)||
    magnitude<0||magnitude>.04||!Number.isInteger(steps)||steps<1||steps>80)
    throw new RangeError('Ensaio de deformacao axial hipotetico invalido');
   let state=initial(),last=null;
   for(let i=1;i<=steps;i++){
    const e=[0,(mode==='compression'?-1:1)*magnitude*i/steps,0,0,0,0];
    last=step(state,e);
    if(!last.converged)return last;
    state=last.state;
   }
   return last||step(state,[0,0,0,0,0,0]);
  }
  return Object.freeze({schema:'silm.crystal-plasticity.small-strain.v1',
   structure:kind,systemCount:systems.length,orientationProvenance:provenance,
   calibrated:false,couplesJ2:false,solvesGrainEquilibrium:false,
   parameters:Object.freeze({E,nu,hardening:H,crss:frozen(crss),units:'relative'}),
   initial,step,runAxial,limitation:familyLimit[kind]});
 }
 return Object.freeze({schema:'silm.crystal-plasticity.small-strain.v1',create,
  calibrated:false,grainEquilibrium:false,finiteDeformation:false});
})();
