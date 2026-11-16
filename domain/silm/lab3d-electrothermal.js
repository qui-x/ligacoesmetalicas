'use strict';
/*
 * SILM — acoplamento eletrotérmico DIDÁTICO na sala tridimensional.
 * Projeção de um corpo de prova contínuo numa rede equivalente unidimensional.
 * Reutiliza o mesmo resolvedor Kirchhoff/Joule/energia SILM.electrothermal.
 * NÃO projeta átomos reais nem interpreta dados térmicos/elétricos do metal.
 */
window.SILM=window.SILM||{};
SILM.lab3dElectrothermal=(()=>{
 const finite=Number.isFinite;
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 function equivalentNetwork(segments=18){
  if(!Number.isInteger(segments)||segments<4||segments>60)
   throw new RangeError('Amostra equivalente requer 4–60 segmentos.');
  const sites=Object.freeze(Array.from({length:segments},(_,i)=>
   Object.freeze({key:'lab3d-specimen-'+i,cart:Object.freeze([i/(segments-1),0,0])})));
  const edges=Object.freeze(Array.from({length:segments-1},(_,i)=>
   Object.freeze({a:i,b:i+1,weight:1,length:1/(segments-1)})));
  const fraction=Object.freeze(sites.map((_,i)=>1-i/(segments-1)));
  const terminal=Object.freeze(sites.map((_,i)=>i===0?1:i===segments-1?0:-1));
  const inside=Object.freeze(sites.map((_,i)=>i).slice(1,-1));
  return Object.freeze({sites,edges,fraction,terminal,inside,
   byKey:new Map(sites.map((s,i)=>[s.key,i])),
   source:1, // aquecedor à esquerda, antes do terminal de referência
   geometry:'equivalent-1d',sourceKind:'educational-surrogate',calibrated:false});
 }
 function create({segments=18,engine=window.SILM?.electrothermal}={}){
  if(!engine||typeof engine.createRun!=='function')
   return Object.freeze({ok:false,reason:'ELECTROTHERMAL_SOLVER_UNAVAILABLE',calibrated:false});
  const net=equivalentNetwork(segments),solver=engine.createRun(net);
  if(!solver||typeof solver.advance!=='function'||typeof solver.observe!=='function')
   return Object.freeze({ok:false,reason:'NETWORK_NOT_SOLVABLE',calibrated:false});
  let heating=false,electrified=false,level=.6,steps=0;
  const input=()=>({mode:'voltage',level:electrified?level:0,boundary:'ambient',external:heating});
  const safe=(v,label)=>{
   if(!finite(v)||v<0)throw new TypeError('Leitura não finita: '+label);
   return v;
  };
  function reading(){
   const observed=solver.observe(input(),true);
   if(!observed?.profiles)return null;
   const temperature=net.sites.map(s=>safe(observed.profiles.temperature.get(s.key),'temperatura')),
    potential=net.sites.map(s=>safe(observed.profiles.potential.get(s.key),'potencial')),
    dissipation=net.sites.map(s=>safe(observed.profiles.dissipation.get(s.key),'dissipação'));
   const maxT=Math.max(...temperature),maxV=Math.max(...potential),maxP=Math.max(...dissipation);
   const visibleHeat=temperature.map(v=>clamp(v/(.08+v),0,1)); // Contraste de apresentação, não temperatura física
   const visiblePotential=potential.map(v=>maxV>0?v/maxV:0);
   const visibleJoule=dissipation.map(v=>maxP>0?v/maxP:0);
   return Object.freeze({
    ok:true,source:'SILM.electrothermal.createRun',geometry:'equivalent-1d',
    sourceKind:'educational-surrogate',calibrated:false,units:'relative',
    heating,electrified,level,steps,time:observed.time,
    voltage:observed.voltage,current:observed.current,
    power:observed.power,mean:observed.mean,maximum:observed.maximum,
    storedEnergy:observed.storedEnergy,jouleEnergy:observed.jouleEnergy,
    externalEnergy:observed.externalEnergy,removedEnergy:observed.removedEnergy,
    terminalError:observed.terminalError,
    temperature:Object.freeze(temperature),potential:Object.freeze(potential),
    dissipation:Object.freeze(dissipation),visibleHeat:Object.freeze(visibleHeat),
    visiblePotential:Object.freeze(visiblePotential),visibleJoule:Object.freeze(visibleJoule),
    validAsMeasuredMaterialProperty:false,
    limitation:'Modelo 1D equivalente e relativo. Sem geometria FEM térmica, k, calor específico, resistência ou tensão dimensionais por metal.'
   });
  }
  function setSources({heat=heating,current=electrified,intensity=level}={}){
   if(typeof heat!=='boolean'||typeof current!=='boolean'||!finite(intensity)||
      intensity<.05||intensity>1)
    throw new RangeError('Alimentação do circuito equivalente inválida');
   heating=heat;electrified=current;level=intensity;
   return reading();
  }
  function advance(duration=.2){
   if(!finite(duration)||duration<=0||duration>2)
    throw new RangeError('Passo temporal relativo fora do intervalo.');
   if(!solver.advance(input(),duration))
    return Object.freeze({ok:false,reason:'COUPLED_SOLVER_FAILED',calibrated:false});
   steps++;return reading();
  }
  return Object.freeze({
   ok:true,network:net,reading,setSources,advance,
   schema:'silm.lab3d.electrothermal-surface.v1',source:'SILM.electrothermal.createRun',
   calibrated:false,units:'relative',canApplyMetalCoefficients:false,
   canFeedScientificState:false
  });
 }
 return Object.freeze({schema:'silm.lab3d.electrothermal-surface.v1',
  equivalentNetwork,create,calibrated:false});
})();
