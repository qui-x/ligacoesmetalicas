'use strict';
/* Auditoria da construção das estruturas (motor real do SILM, sem DOM).
   Para cada metal com estrutura de referência visualizável (CCC, CFC ou HC), confere a estrutura gerada contra a
   cristalografia e contra cálculos independentes:
   - vizinhança de TODOS os sítios da célula: coordenação, distância ao vizinho mais próximo e camada seguinte;
   - número efetivo de átomos pela posição de cada sítio desenhado (vértice, face, corpo, base, interior);
   - instrumentos do Medir: parâmetro de rede a (e c no HC), coordenação e distância entre vizinhos;
   - fórmulas do Calcular: volume, raio, empacotamento e densidade teórica × cálculo independente;
   - proveniência: fonte da estrutura existente, parâmetros com a mesma fonte, temperatura de referência registrada.
   Os metais com estrutura fora de CCC/CFC/HC continuam bloqueados, com motivo e rótulo da estrutura registrada. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const ctx={Math,console,JSON,Number,Array,Object,Map,Set,String,Error,TypeError};ctx.window=ctx;vm.createContext(ctx);
for(const f of ['domain/silm/data/bundle.js','domain/silm/data-api.js','domain/silm/crystal.js','domain/silm/measurements.js','domain/silm/calculations.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const S=ctx.SILM,D=S.data,C=S.crystal,M=S.measurement,F=S.formulas,SQ2=Math.SQRT2,SQ3=Math.sqrt(3),PI=Math.PI,NA=6.02214076e23;
const rel=(x,y)=>Math.abs(x-y)/Math.max(1e-12,Math.abs(y));
const share={corner:1/8,face:1/2,body:1,'base-vertex':1/6,'base-center':1/2,interior:1};
const counts={BCC:0,FCC:0,HCP:0},blocked=[];
for(const e of D.elements.filter(e=>e.silmEligibility.status==='available')){
 const ref=D.structure(e),el=C.eligibility(e),who=e.symbol+': ';
 assert.ok(ref,who+'estrutura de referência ausente');assert.ok(D.source(ref.sourceId),who+'fonte da estrutura ausente');
 const lp=ref.latticeParameters;for(const [k,p] of Object.entries(lp))assert.equal(p.sourceId,ref.sourceId,who+'parâmetro '+k+' com fonte diferente da estrutura');
 assert.ok(ref.conditions?.temperature?.display,who+'temperatura de referência não registrada');
 if(el.status!=='available'){assert.equal(el.reasonCode,'CRYSTAL_STRUCTURE_UNSUPPORTED',who+el.reasonCode);assert.ok(el.registeredLabel,who+'rótulo da estrutura registrada ausente');assert.ok(!['CCC','CFC','HC'].includes(ref.type),who+'estrutura suportada bloqueada');blocked.push(e.symbol);continue;}
 const g=C.geometry(e),m=g.model,a=lp.a.value,c=lp.c.value;counts[m.id]++;
 // Vizinhança analítica: CCC 8 a √3·a/2 (camada seguinte a); CFC 12 a a/√2 (seguinte a); HC 6 a a e 6 a √(a²/3 + c²/4).
 const d2=Math.sqrt(a*a/3+c*c/4),[near,far,next]=m.id==='BCC'?[SQ3*a/2,SQ3*a/2,a]:m.id==='FCC'?[a/SQ2,a/SQ2,a]:[Math.min(a,d2),Math.max(a,d2),null];
 for(const s of g.cell){const n=g.neighbors(s);assert.equal(n.list.length,m.coordination,who+'coordenação no sítio '+s.key);
  assert.ok(rel(Math.min(...n.distances),near)<1e-9&&rel(Math.max(...n.distances),far)<1e-9,who+'distâncias de vizinhos no sítio '+s.key);
  if(next)assert.ok(rel(n.next,next)<1e-9,who+'camada seguinte no sítio '+s.key);assert.ok(n.next>Math.max(...n.distances)*1.05,who+'camadas de vizinhos não separadas');}
 assert.equal(g.cell.length,m.cellSites,who+'sítios desenhados');
 assert.ok(Math.abs(g.cell.reduce((t,x)=>t+share[g.role(x).role],0)-m.effective.value)<1e-9,who+'átomos efetivos pelas posições');
 // Instrumentos do Medir.
 const o={cell:[0,0,0],basis:0},la=M.compute('latticeParameter',g,[o,{cell:[1,0,0],basis:0}]);assert.ok(la.ok&&la.parameter==='a'&&Math.abs(la.value-a)<5e-4,who+'medida de a');
 if(m.id==='HCP'){const lc=M.compute('latticeParameter',g,[o,{cell:[0,0,1],basis:0}]);assert.ok(lc.ok&&lc.parameter==='c'&&Math.abs(lc.value-c)<5e-4,who+'medida de c');}
 assert.equal(M.compute('coordination',g,[o]).value,m.coordination,who+'medida de coordenação');
 const nb=g.neighbors(g.cell[0]),dd=M.compute('distance',g,[nb.site,nb.list[0]]);assert.ok(dd.ok&&Math.abs(dd.value-near)<5e-4,who+'distância medida entre vizinhos');
 // Fórmulas do Calcular × cálculo independente.
 const V=m.id==='HCP'?3*SQ3/2*a*a*c:a**3,Mm=e.atomicWeight.form==='interval'?(e.atomicWeight.interval[0]+e.atomicWeight.interval[1])/2:e.atomicWeight.value;
 const fv=F[m.id==='HCP'?'cell-volume-hcp':'cell-volume-cubic'].compute({a,c}).value,fr=F[{BCC:'radius-from-a-bcc',FCC:'radius-from-a-fcc',HCP:'radius-from-ac-hcp'}[m.id]].compute({a,c}).value;
 const fn=F['effective-atoms-'+m.id.toLowerCase()].compute({}).value,fp=F['packing-factor'].compute({n:fn,r:fr,V:fv}).value,rho=F['theoretical-density'].compute({n:fn,M:Mm,V:fv}).value;
 assert.equal(fn,m.effective.value,who+'n');assert.ok(rel(fv,V)<1e-12,who+'volume');assert.ok(rel(fr,near/2)<1e-12,who+'raio = metade da distância entre vizinhos');
 assert.ok(rel(rho,fn*Mm/(NA*V*1e-24))<1e-12,who+'densidade teórica');
 if(m.id!=='HCP')assert.ok(rel(fp,m.id==='BCC'?PI*SQ3/8:PI/(3*SQ2))<1e-9,who+'empacotamento cúbico');else assert.ok(fp<=PI/(3*SQ2)+1e-9&&fp>0.6,who+'empacotamento do HC');
 assert.ok(rho>0.4&&rho<23,who+'densidade teórica fora da faixa dos metais: '+rho);
}
assert.deepEqual(counts,{BCC:13,FCC:14,HCP:21});
assert.deepEqual(blocked.sort(),['Bi','La','Mn','Nd','Np','Pr','Pu','Sm','Sn']);
console.log('PASS structure-audit: 48 estruturas (13 CCC, 14 CFC, 21 HC) conferidas sítio a sítio contra a cristalografia, os instrumentos do Medir e as fórmulas do Calcular; 9 estruturas fora de CCC/CFC/HC bloqueadas com motivo.');
