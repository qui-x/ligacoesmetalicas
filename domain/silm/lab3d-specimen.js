'use strict';
/*
 * Superfície procedimental 3D para a SEÇÃO 2D J2 já equilibrada.
 * A coordenada z é uma extrusão visual CONSTANTE; nenhuma componente
 * mecânica ou termomecânica tridimensional é presumida.
 * Somente leitura: não altera geometria original nem ScientificState.
 */
window.SILM=window.SILM||{};
SILM.lab3dSpecimen=(()=>{
 const finite=Number.isFinite;
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const sub=(a,b)=>a.map((x,i)=>x-b[i]);
 const norm=v=>{const len=Math.hypot(...v);return len>1e-12?v.map(x=>x/len):[0,0,1]};
 const quad=(array,a,b,c,d,flip=false)=>{
  const triangles=flip?[[a,c,b],[a,d,c]]:[[a,b,c],[a,c,d]];
  for(const points of triangles){
   const N=norm(cross(sub(points[1],points[0]),sub(points[2],points[0])));
   for(const point of points)array.push(...point,...N);
  }
 };
 function create(field,{segments=18,rows=7,amplification=2.5,
  width=1.03,height=.22,depth=.24,x=0,y=1.03,z=-1.35}={}){
  if(!field||field.converged!==true||typeof field.sample!=='function')
   return Object.freeze({ok:false,reason:'J2_FIELD_NOT_CONVERGED',calibrated:false});
  if(!Number.isInteger(segments)||segments<4||segments>60||
     !Number.isInteger(rows)||rows<2||rows>36||
     ![amplification,width,height,depth,x,y,z].every(finite)||
     amplification<.25||amplification>5||width<=0||height<=0||depth<=0)
   throw new RangeError('Geometria visual ou discretização inválida');
  function position(u,v,side=1){
   if(![u,v,side].every(finite)||u<0||u>1||v<0||v>1||![-1,1].includes(side))
    throw new RangeError('Coordenada do corpo de prova inválida');
   const d=field.sample(u,v);
   if(!d||!finite(d.dx)||!finite(d.dy)||Math.max(Math.abs(d.dx),Math.abs(d.dy))>1)
    throw new TypeError('Campo J2 não finito ou fora de faixa segura');
   return [
    x+width*(u-.5+amplification*d.dx),
    y+height*(v+amplification*d.dy),
    z+side*depth/2
   ];
  }
  const output=[];
  for(let i=0;i<segments;i++){
   const u0=i/segments,u1=(i+1)/segments,a=[];
   // Faces externas subdivididas em v: deformação não afim por superfície.
   for(let j=0;j<rows;j++){
    const v0=j/rows,v1=(j+1)/rows;
    for(const side of [1,-1]){
     const p00=position(u0,v0,side),p10=position(u1,v0,side),
      p11=position(u1,v1,side),p01=position(u0,v1,side);
     quad(a,p00,p10,p11,p01,side<0);
    }
   }
   // Superfícies superior e inferior não criam espessura calculada.
   for(const v of [0,1]){
    const p00=position(u0,v,-1),p10=position(u1,v,-1),
     p11=position(u1,v,1),p01=position(u0,v,1);
    quad(a,p00,p10,p11,p01,v===1);
   }
   // Tampar apenas as extremidades reais, não as fronteiras visuais dos segmentos.
   for(const u of [u0,u1]){
    if((i!==0||u!==u0)&&(i!==segments-1||u!==u1))continue;
    quad(a,position(u,0,-1),position(u,0,1),
      position(u,1,1),position(u,1,-1),u===u0);
   }
   const mid=(i+.5)/segments;
   const p=typeof field.samplePlastic==='function'?field.samplePlastic(mid,.5):null;
   const plastic=finite(p)&&p>=0?p:null;
   output.push(Object.freeze({index:i,normalizedU:mid,
    vertices:Object.freeze(a),vertexCount:a.length/6,
    plasticIndicator:plastic,
    source:'j2-plane-strain',units:'relative',calibrated:false}));
  }
  return Object.freeze({ok:true,segments:Object.freeze(output),
   segmentCount:segments,rows,amplification,width,height,depth,
   position,calibrated:false,units:'relative',source:'j2-plane-strain',
   outOfPlanePredicted:false,geometry:'surface-extrusion',
   limitations:Object.freeze([
    'A deformação é apenas a seção 2D J2 em deformação plana.',
    'A espessura z é constante e visual, não calculada pelo modelo.',
    'Não simula estricção, contato, fratura, grandes deformações ou textura medida.',
    'Amplificação de 0,25–5 é somente apresentação gráfica.'
   ])});
 }
 return Object.freeze({schema:'silm.lab3d.specimen-surface.v1',create});
})();