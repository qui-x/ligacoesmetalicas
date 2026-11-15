'use strict';
window.SILM=window.SILM||{};
/*
 * Sistemas de deslizamento e fator de Schmid, SOMENTE GEOMÉTRICOS.
 * Referências: MTEX SlipSystems / SchmidFactor e orientação crystal -> specimen.
 *
 * Exemplos limitados: CFC {111}<110>; CCC {110}<111>;
 * HC (HCP) basal {0001}<a> e prismático de 1ª ordem <a>.
 * Não resolve {112}/{123} CCC, {pyramidal}<c+a> HC, CRSS,
 * efeitos não-Schmid, maclação, orientação cristalina por grão,
 * nem altera FEM J2 macro-contínuo ou o limite de escoamento.
 */
SILM.crystalSlip=(()=>{
 const EPS=1e-8,RAD=Math.PI/180;
 const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
 const norm=a=>Math.hypot(...a);
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const unit=a=>{const n=norm(a);return n>EPS?a.map(x=>x/n):null;};
 const signed=a=>{
  const i=a.findIndex(x=>Math.abs(x)>EPS);
  return i<0?a:(a[i]<0?a.map(x=>-x):a);
 };
 const unique=rows=>{
  const map=new Map();
  for(const row of rows){
   const v=signed(row),key=v.join(',');
   if(!map.has(key))map.set(key,v);
  }
  return [...map.values()];
 };
 const perms=v=>new Set([
  [v[0],v[1],v[2]].join(','),
  [v[0],v[2],v[1]].join(','),
  [v[1],v[0],v[2]].join(','),
  [v[1],v[2],v[0]].join(','),
  [v[2],v[0],v[1]].join(','),
  [v[2],v[1],v[0]].join(',')
 ]).values().map(x=>x.split(',').map(Number)).toArray();
 const types=Object.freeze({CCC:'BCC',CFC:'FCC',HC:'HCP',BCC:'BCC',FCC:'FCC',HCP:'HCP'});
 const cubicNormals=family=>{
  if(family==='FCC')return unique([-1,1].flatMap(x=>[-1,1].flatMap(y=>[-1,1].map(z=>[x,y,z]))));
  return unique(perms([1,1,0]).flatMap(v=>[-1,1].flatMap(a=>[-1,1].map(b=>
   v.map((n,i)=>n===0?0:(i===v.findIndex(k=>k!==0)?a:b)))));
 };
 const cubicDirs=family=>{
  if(family==='FCC')return cubicNormals('BCC');
  return cubicNormals('FCC');
 };
 const createSystems=()=>{
  const fcc=[],bcc=[],hcp=[];
  for(const family of ['FCC','BCC']){
   const normals=cubicNormals(family),dirs=cubicDirs(family);
   const out=family==='FCC'?fcc:bcc;
   normals.forEach((n,i)=>dirs.filter(d=>Math.abs(dot(n,d))<EPS).forEach((d,j)=>{
    out.push(Object.freeze({
     family:family==='FCC'?'CFC · {111}⟨110⟩':'CCC · {110}⟨111⟩',
     id:family+'-'+i+'-'+j,planeNormal:Object.freeze(unit(n)),
     slipDirection:Object.freeze(unit(d))
    }));
   }));
  }
  const z=[0,0,1];
  for(let i=0;i<3;i++){
   const ang=i*Math.PI/3,d=[Math.cos(ang),Math.sin(ang),0];
   hcp.push(Object.freeze({family:'HC · basal {0001}⟨a⟩',id:'HCP-basal-'+i,
    planeNormal:Object.freeze(z.slice()),slipDirection:Object.freeze(d)}));
   const prism=unit(cross(z,d));
   hcp.push(Object.freeze({family:'HC · prismático {10-10}⟨a⟩',id:'HCP-prismatic-'+i,
    planeNormal:Object.freeze(prism),slipDirection:Object.freeze(d)}));
  }
  return Object.freeze({
   FCC:Object.freeze(fcc),BCC:Object.freeze(bcc),HCP:Object.freeze(hcp)
  });
 };
 const systems=createSystems();
 const isMatrix=M=>{
  if(!Array.isArray(M)||M.length!==3||
    !M.every(row=>Array.isArray(row)&&row.length===3&&row.every(Number.isFinite)))return false;
  const rs=M.map(r=>unit(r));if(rs.some(x=>!x))return false;
  if(M.some(row=>Math.abs(norm(row)-1)>1e-3))return false;
  if(Math.abs(dot(M[0],M[1]))>1e-3||Math.abs(dot(M[1],M[2]))>1e-3||
    Math.abs(dot(M[0],M[2]))>1e-3)return false;
  const det=dot(M[0],cross(M[1],M[2]));
  return Math.abs(det-1)<=2e-3;
 };
 const identity=()=>[[1,0,0],[0,1,0],[0,0,1]];
 const rotationZ=degrees=>{
  if(!Number.isFinite(degrees)||degrees<0||degrees>360)
   throw new RangeError('Ângulo didático fora de 0 a 360 graus');
  const t=degrees*RAD,c=Math.cos(t),s=Math.sin(t);
  return [[c,-s,0],[s,c,0],[0,0,1]];
 };
 const transposeMultiply=(M,v)=>[0,1,2].map(i=>
  M[0][i]*v[0]+M[1][i]*v[1]+M[2][i]*v[2]);
 // A tensão é uniaxial orientada segundo a direção declarada na amostra.
 // m = | (t·n)(t·s) | <= 1/2. NÃO há unidades ou CRSS neste cálculo.
 function analyze({structure,orientationMatrix=null,loadAxis=[0,1,0],
  provenance='none'}={}){
  const kind=types[structure];
  if(!kind)return Object.freeze({status:'UNSUPPORTED_STRUCTURE',calibratesJ2:false});
  if(!orientationMatrix)return Object.freeze({status:'ORIENTATION_UNAVAILABLE',
   structure:kind,calibratesJ2:false});
  if(!isMatrix(orientationMatrix))return Object.freeze({status:'INVALID_ORIENTATION',
   structure:kind,calibratesJ2:false});
  if(!Array.isArray(loadAxis)||loadAxis.length!==3||
    !loadAxis.every(Number.isFinite)||norm(loadAxis)<EPS)
   return Object.freeze({status:'INVALID_LOAD_AXIS',structure:kind,calibratesJ2:false});
  const loading=unit(transposeMultiply(orientationMatrix,unit(loadAxis)));
  const evaluated=systems[kind].map(sys=>{
   const m=dot(loading,sys.planeNormal)*dot(loading,sys.slipDirection);
   return Object.freeze({id:sys.id,family:sys.family,schmid:Math.abs(m),
    signedSchmid:m});
  });
  const families=[...new Set(evaluated.map(x=>x.family))].map(name=>{
   const entries=evaluated.filter(x=>x.family===name).sort((a,b)=>
    b.schmid-a.schmid||a.id.localeCompare(b.id));
   return Object.freeze({family:name,count:entries.length,
    maxSchmid:entries[0].schmid,representative:entries[0].id});
  });
  return Object.freeze({
   status:'GEOMETRY_ONLY',structure:kind,provenance,
   loadAxis:Object.freeze([...unit(loadAxis)]),
   systemCount:evaluated.length,families:Object.freeze(families),
   highestSchmid:Math.max(...evaluated.map(x=>x.schmid)),
   calibrated:false,crssAvailable:false,calibratesJ2:false,
   predictsSlipActivation:false,hasGrainOrientation:provenance==='imported-unverified',
   caveat:kind==='BCC'?
    'CCC: efeitos não-Schmid e sistemas {112}/{123} não calculados.':
    kind==='HCP'?
    'HC: CRSS basal/prismática distintas; sistemas piramidais ⟨c+a⟩ não calculados.':
    'CFC: fator geométrico não fornece CRSS nem tensão de escoamento.'
  });
 }
 return Object.freeze({
  schema:'silm.crystal-slip-geometry.v1',types,systems,
  isMatrix,identity,rotationZ,analyze,calibratesJ2:false,
  references:Object.freeze([
   'https://mtex-toolbox.github.io/SlipSystems.html',
   'https://mtex-toolbox.github.io/SchmidFactor.html',
   'https://mtex-toolbox.github.io/OrientationImport.html'
  ])
 });
})();
