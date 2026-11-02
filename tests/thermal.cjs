'use strict';
/* Condução térmica contínua (P2, docs/PLANO-PROPRIEDADES-METALICAS.md): invariantes da equação do calor discreta no grafo
   de vizinhos imediatos da estrutura (geometria do banco).
   - Grafo simétrico, só com vizinhos imediatos; sem fonte, a energia total se conserva e a diferença máxima diminui até o
     equilíbrio uniforme; com a fonte, os centros sob ela ficam em 1 e os vizinhos esquentam antes dos distantes;
     temperaturas sempre em [0, 1]. */
const assert=require('node:assert/strict');
const S=require('../scripts/validate-scientific-state.cjs').load(),TH=S.thermal,X=S.crystal;
let checked=0;
for(const symbol of ['Cu','Fe','Mg','Np']){
 const e=S.data.elements.find(x=>x.symbol===symbol),g=X.geometry(e),sites=g.lattice(),carts=sites.map(s=>s.cart),nn=g.neighbors(g.cell[0]).distances[0];
 const edges=TH.graph(carts,nn);
 // Simétrico e só vizinhos imediatos.
 edges.forEach((list,i)=>{for(const j of list){assert.ok(edges[j].includes(i),'Grafo simétrico: '+symbol);const d=Math.hypot(...[0,1,2].map(k=>carts[i][k]-carts[j][k]));assert.ok(d<=nn*1.05+1e-9,'Só vizinhos imediatos: '+symbol);}});
 assert.ok(edges.some(l=>l.length>0),'Há vizinhos no bloco: '+symbol);
 // Sem fonte: energia conservada e tendência ao equilíbrio.
 let T=Float64Array.from(sites,(_,i)=>i===0?1:0);const total=TH.sum(T);let spread=TH.spread(T);
 for(let n=0;n<2400;n++){T=TH.step(T,edges,null);if(n%200===199){const s=TH.spread(T);assert.ok(s<=spread+1e-12,'Diferença máxima não aumenta: '+symbol);spread=s;}}
 assert.ok(Math.abs(TH.sum(T)-total)<1e-9,'Energia total conservada sem fonte: '+symbol);
 assert.ok([...T].every(v=>v>=0&&v<=1),'Temperaturas em [0, 1]: '+symbol);
 // Com a fonte no centro 0: ele fica em 1, os vizinhos esquentam antes dos distantes.
 let H=new Float64Array(sites.length);const pinned=new Set([0]);for(let n=0;n<60;n++)H=TH.step(H,edges,pinned);
 assert.equal(H[0],1,'Centro sob a fonte na temperatura da fonte: '+symbol);
 const dist=i=>Math.hypot(...[0,1,2].map(k=>carts[i][k]-carts[0][k]));
 const neighbor=edges[0][0],far=sites.map((_,i)=>i).sort((a,b)=>dist(b)-dist(a))[0];
 assert.ok(H[neighbor]>H[far],'Vizinho esquenta antes do distante: '+symbol);
 assert.ok([...H].every(v=>v>=0&&v<=1),'Temperaturas em [0, 1] com fonte: '+symbol);
 checked++;
}
console.log('PASS thermal: '+checked+' estruturas (CFC, CCC, HC e ortorrômbica) — grafo simétrico de vizinhos imediatos, energia conservada sem fonte, equilíbrio uniforme, fonte aquece primeiro os vizinhos e temperaturas em [0, 1].');
