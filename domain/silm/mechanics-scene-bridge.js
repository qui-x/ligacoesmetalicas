'use strict';
/*
 * Adaptador de LEITURA entre campos mecânicos 2D e uma futura cena 3D.
 * Não resolve equilíbrio, não substitui J2/CPFEM, não escreve ScientificState.
 * O eixo z é uma extrusão visual da seção de deformação plana, NÃO um
 * deslocamento nem uma tensão 3D calculados sobre a superfície.
 */
window.SILM=window.SILM||{};
SILM.mechanicsSceneBridge=(()=>{
 const finite=Number.isFinite,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const f2=(v)=>Array.isArray(v)&&v.length===2&&v.every(finite);
 function create(field,{source='j2',amplification=1}={}){
  if(!['j2','cpfem'].includes(source))throw new RangeError('Origem mecânica desconhecida');
  if(!finite(amplification)||amplification<.25||amplification>5)
   throw new RangeError('Amplificação visual fora de 0,25–5');
  if(!field||field.converged!==true||typeof field.sample!=='function')
   return Object.freeze({ok:false,reason:'FIELD_NOT_CONVERGED',source});
  // O campo é capturado por referência, não copiado, recalculado nem mutado.
  const query=(u,v)=>{
   if(!finite(u)||!finite(v)||u<0||u>1||v<0||v>1)
    throw new RangeError('Coordenada normalizada fora da amostra');
   const displacement=field.sample(u,v);
   if(!displacement||!finite(displacement.dx)||!finite(displacement.dy))
    throw new TypeError('Amostra mecânica não finita');
   const p=typeof field.samplePlastic==='function'?field.samplePlastic(u,v):null;
   const plastic=finite(p)&&p>=0?p:null;
   const stress=typeof field.sampleStress==='function'?field.sampleStress(u,v):null;
   const mechanics=typeof field.sampleMechanics==='function'?field.sampleMechanics(u,v):null;
   return Object.freeze({
    u,v,displacement:Object.freeze({dx:displacement.dx,dy:displacement.dy,dz:null}),
    plasticIndicator:plastic,stress:stress||mechanics?.stressTensor||null,
    mechanics:mechanics||null,calibrated:false,units:'relative'
   });
  };
  function point(u,v,z=0){
   if(!finite(z)||z<-.5||z>.5)throw new RangeError('Espessura esquemática inválida');
   const read=query(u,v);
   return Object.freeze({
    x:u-.5+amplification*read.displacement.dx,
    y:v-.5+amplification*read.displacement.dy,
    z, // Extrusão: superfície original, sem inferir deformação fora do plano.
    read
   });
  }
  function sampleGrid(nx=9,ny=7){
   if(!Number.isInteger(nx)||!Number.isInteger(ny)||nx<2||ny<2||nx>45||ny>45)
    throw new RangeError('Amostragem de grade inválida');
   const positions=[],indices=[];
   for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
    const p=point(i/(nx-1),j/(ny-1));
    positions.push(p.x,p.y,p.z);
   }
   for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){
    const a=j*nx+i,b=a+1,c=a+nx,d=c+1;
    indices.push(a,b,d,a,d,c);
   }
   return Object.freeze({positions:Object.freeze(positions),indices:Object.freeze(indices),
    nx,ny,source,calibrated:false,units:'relative',extrusion:'visual-only'});
  }
  function appearance(u,v,{temperature=0,current=0}={}){
   if(!finite(temperature)||!finite(current)||temperature<0||temperature>1||current<0||current>1)
    throw new RangeError('Estímulos visuais relativos devem estar entre 0 e 1');
   const read=query(u,v);
   const p=read.plasticIndicator===null?0:Math.min(1,Math.max(0,read.plasticIndicator)*8);
   // Fatores sem calibração: demonstram que rugosidade e temperatura podem
   // alterar a aparência; NÃO são uma lei óptica ou condutividade medida.
   return Object.freeze({roughnessRelative:clamp(.16+.52*p,.05,.9),
    heatOverlay:temperature,chargeOverlay:current,plasticOverlay:p,
    source,calibrated:false,validAsMaterialPrediction:false});
  }
  return Object.freeze({ok:true,source,calibrated:false,units:'relative',
   amplification,query,point,sampleGrid,appearance,
   limitations:Object.freeze([
    'Deformação plana em 2D: espessura visual não é modelo tridimensional.',
    'Não representa grandes deformações, contato, estricção, ruptura nem aferição experimental.',
    'Calor, corrente e rugosidade são camadas gráficas relativas, não acoplamento constitutivo.'
   ])});
 }
 return Object.freeze({schema:'silm.mechanics-scene-bridge.v1',create});
})();