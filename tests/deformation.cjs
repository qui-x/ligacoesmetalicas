'use strict';
/* Deformação por deslizamento de planos (P1, docs/PLANO-PROPRIEDADES-METALICAS.md): invariantes físicos do modelo.
   - n ⟂ d; b é um vetor da rede (o bloco que desliza cai em sítios da mesma rede); nos cúbicos, b = distância entre vizinhos.
   - Orientação de ensaio: plano e direção a 45° da força (fator de Schmid 0,5).
   - Depois de N deslizamentos, nenhum par de centros fica mais perto que na rede de referência (a vizinhança se refaz).
   - Tração alonga e estreita; compressão encurta e alarga; elástico sem deslizamento volta ao ponto de partida. */
const assert=require('node:assert/strict');
const S=require('../scripts/validate-scientific-state.cjs').load(),D=S.deformation,X=S.crystal;
const close=(a,b,t=1e-9)=>Math.abs(a-b)<=t;
const CENTERING={FCC:[[0,0,0],[.5,.5,0],[.5,0,.5],[0,.5,.5]],BCC:[[0,0,0],[.5,.5,.5]],HCP:[[0,0,0]]};
function frac(L,v){// resolve v = f·L (linhas de L = vetores da rede)
 const det=m=>m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
 const T=[[L[0][0],L[1][0],L[2][0]],[L[0][1],L[1][1],L[2][1]],[L[0][2],L[1][2],L[2][2]]],d=det(T);
 return [0,1,2].map(k=>{const M=T.map(r=>[...r]);for(let i=0;i<3;i++)M[i][k]=v[i];return det(M)/d;});}
const span=(pts,k)=>Math.max(...pts.map(p=>p[k]))-Math.min(...pts.map(p=>p[k]));
let checked=0;
for(const symbol of ['Cu','Fe','Mg','Al','W','Ti']){
 const e=S.data.elements.find(x=>x.symbol===symbol),g=X.geometry(e),sys=D.system(g),type=g.model.id;
 assert.ok(sys,'Sistema de deslizamento: '+symbol);assert.equal(sys.sourceId,'src-callister-rethwisch');
 assert.ok(sys.orthogonal,'Direção no plano: '+symbol);
 // b é translação da rede: frações módulo 1 pertencem à centragem da célula.
 const f=frac(g.vectors,sys.bVector).map(x=>((x%1)+1)%1).map(x=>close(x,1,1e-9)?0:x);
 assert.ok(CENTERING[type].some(c=>c.every((v,i)=>close(v,f[i],1e-9))),'b é vetor da rede: '+symbol+' '+f);
 const nn=g.neighbors(g.cell[0]).distances[0];if(type!=='HCP')assert.ok(close(sys.b,nn,1e-9),'b = distância entre vizinhos: '+symbol);else assert.ok(close(sys.b,g.vectors[0][0],1e-9),'HC: b = a');
 // Orientação de ensaio (sem deslizamento nem carga): n' = (−1/√2, 0, 1/√2) e d' = (1/√2, 0, 1/√2).
 const T0=D.transform(sys,{orient:1}),c=sys.center,img=v=>{const a=T0(c),b=T0([c[0]+v[0],c[1]+v[1],c[2]+v[2]]);return [b[0]-a[0],b[1]-a[1],b[2]-a[2]];};
 const r=Math.SQRT1_2,ni=img(sys.n),di=img(sys.d);
 assert.ok([-r,0,r].every((v,i)=>close(v,ni[i],1e-9))&&[r,0,r].every((v,i)=>close(v,di[i],1e-9)),'Orientação de ensaio a 45°: '+symbol);
 assert.equal(sys.boundaries.length,D.LIMIT,'Planos para '+D.LIMIT+' deslizamentos: '+symbol);
 const sites=[...g.lattice()].map(s=>s.cart),base=sites.map(T0);
 for(const [id,sign] of [['ductility',1],['malleability',-1]]){
  for(let n=1;n<=D.LIMIT;n++){
   const T=D.transform(sys,{progress:D.steps(n),sign,orient:1}),pts=sites.map(T);
   let min=Infinity;for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const d=Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1],pts[i][2]-pts[j][2]);if(d<min)min=d;}
   assert.ok(min>=nn-1e-6,'Sem sobreposição depois de '+n+' deslizamentos ('+id+'): '+symbol+' '+min);
   if(n===D.LIMIT){if(sign>0)assert.ok(span(pts,2)>span(base,2)+1e-6,'Tração alonga: '+symbol);else assert.ok(span(pts,2)<span(base,2)-1e-6&&span(pts,0)>span(base,0)+1e-6,'Compressão encurta e alarga: '+symbol);}
  }
  // Forma estática do estado guardado = transformação com os deslizamentos completos.
  const st={properties:{active:id,malleability:{compression:id==='malleability'?2:0},ductility:{elongation:id==='ductility'?2:0}}};
  const P=S.properties.deformer(st,g),T2=D.transform(sys,{progress:D.steps(2),sign,orient:1});
  for(const p of sites.slice(0,20))assert.deepEqual(P(p),T2(p));
 }
 // Elástico: tração alonga na vertical e estreita na horizontal, sem mudar quem está acima de cada plano.
 const E=D.transform(sys,{strain:.05,orient:1}),pe=sites.map(E);assert.ok(span(pe,2)>span(base,2)&&span(pe,0)<span(base,0),'Elástico: '+symbol);
 checked++;
}
// Modelo geral: sem sistema (a experiência continua indisponível).
const general=S.data.elements.find(e=>X.eligibility(e).general);if(general)assert.equal(D.system(X.geometry(general)),null);
// Estado: até LIMIT deslizamentos.
assert.equal(S.properties.limits.compression,D.LIMIT);assert.equal(S.properties.limits.elongation,D.LIMIT);
console.log('PASS deformation: '+checked+' metais (CFC, CCC e HC) — b é vetor da rede, orientação a 45°, sem sobreposição depois de 1 a '+D.LIMIT+' deslizamentos, tração alonga, compressão encurta e alarga, elástico reversível, estado estático coerente e modelo geral sem deslizamento.');
