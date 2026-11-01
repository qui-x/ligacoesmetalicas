'use strict';
/* Auditoria da construção das estruturas (motor real do SILM, sem DOM).
   Para cada metal com estrutura de referência visualizável (CCC, CFC ou HC), confere a estrutura gerada contra a
   cristalografia e contra cálculos independentes:
   - vizinhança de TODOS os sítios da célula: coordenação, distância ao vizinho mais próximo e camada seguinte;
   - número efetivo de átomos pela posição de cada sítio desenhado (vértice, face, corpo, base, interior);
   - instrumentos do Medir: parâmetro de rede a (e c no HC), coordenação e distância entre vizinhos;
   - fórmulas do Calcular: volume, raio, empacotamento e densidade teórica × cálculo independente;
   - proveniência: fonte da estrutura existente, parâmetros com a mesma fonte, temperatura de referência registrada.
   0.16.x — estruturas fora de CCC/CFC/HC (modelo geral): conferidas contra o próprio CIF guardado no repositório
   (Z = _cell_formula_units_Z, V = _cell_volume), contagem das posições = Z, primeira camada de vizinhos e camadas
   seguintes por busca exaustiva, medidas de a, b e c, volume e densidade teórica por cálculo independente.
   Sem raio nem empacotamento de esferas rígidas nessas estruturas. Fichas incompletas ficam bloqueadas com motivo. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const ctx={Math,console,JSON,Number,Array,Object,Map,Set,String,Error,TypeError};ctx.window=ctx;vm.createContext(ctx);
for(const f of ['domain/silm/data/bundle.js','domain/silm/data-api.js','domain/silm/crystal.js','domain/silm/measurements.js','domain/silm/calculations.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const S=ctx.SILM,D=S.data,C=S.crystal,M=S.measurement,F=S.formulas,SQ2=Math.SQRT2,SQ3=Math.sqrt(3),PI=Math.PI,NA=6.02214076e23;
const rel=(x,y)=>Math.abs(x-y)/Math.max(1e-12,Math.abs(y));
const share={corner:1/8,face:1/2,body:1,'base-vertex':1/6,'base-center':1/2,interior:1};
const counts={BCC:0,FCC:0,HCP:0},general={},blocked=[];
const cif=(ref,key)=>{const text=fs.readFileSync(path.join(root,D.source(ref.sourceId).evidence.path),'utf8'),m=text.match(new RegExp('^'+key+'\\s+([^\\s]+)','m'));return m?Number(m[1].replace(/\(\d+\)$/,'')):null;};
const molar=e=>['standard','interval'].includes(e.atomicWeight?.form)?(e.atomicWeight.form==='interval'?(e.atomicWeight.interval[0]+e.atomicWeight.interval[1])/2:e.atomicWeight.value):null;
for(const e of D.elements.filter(e=>e.silmEligibility.status==='available')){
 const ref=D.structure(e),el=C.eligibility(e),who=e.symbol+': ';
 assert.ok(ref,who+'estrutura de referência ausente');assert.ok(D.source(ref.sourceId),who+'fonte da estrutura ausente');
 const lp=ref.latticeParameters;for(const [k,p] of Object.entries(lp))assert.equal(p.sourceId,ref.sourceId,who+'parâmetro '+k+' com fonte diferente da estrutura');
 assert.ok(ref.conditions?.temperature?.display,who+'temperatura de referência não registrada');
 if(el.status!=='available'){
  // Ficha incompleta: o próprio CIF declara menos átomos por célula do que a estrutura exige (DHC com Z = 2 em vez de 4).
  assert.equal(el.reasonCode,'STRUCTURE_DATA_INCOMPLETE',who+el.reasonCode);assert.ok(el.registeredLabel,who+'rótulo da estrutura registrada ausente');assert.ok(!['CCC','CFC','HC'].includes(ref.type),who+'estrutura suportada bloqueada');
  assert.equal(cif(ref,'_cell_formula_units_Z'),el.atoms,who+'Z do CIF');blocked.push(e.symbol);continue;}
 if(el.general){auditGeneral(e,ref,el,who);continue;}
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
function auditGeneral(e,ref,el,who){
 const g=C.geometry(e),m=g.model,lp=ref.latticeParameters,v=k=>lp[k].value,Z=cif(ref,'_cell_formula_units_Z');general[el.structureType]=(general[el.structureType]||0)+1;
 assert.ok(m.general&&el.coordination===null,who+'estrutura geral sem coordenação fixa');
 // Átomos por célula: gerados pela simetria = Z declarado no CIF; contagem das posições desenhadas (vértice 1/8, aresta 1/4, face 1/2, interior 1) = Z.
 assert.equal(el.databaseSites.length,Z,who+'átomos gerados × Z do CIF');assert.equal(m.effective.value,Z,who+'Z do modelo');
 assert.equal(g.cell.length,m.cellSites,who+'sítios desenhados');
 const share={corner:1/8,edge:1/4,face:1/2,interior:1};assert.ok(Math.abs(g.cell.reduce((t,x)=>t+share[g.role(x).role],0)-Z)<1e-9,who+'átomos efetivos pelas posições');
 // Vizinhança por busca exaustiva (independente de neighbors()): todas as imagens em ±2 células.
 const cart=f=>[0,1,2].map(i=>f[0]*g.vectors[0][i]+f[1]*g.vectors[1][i]+f[2]*g.vectors[2][i]);
 for(const s of g.cell){const ds=[];for(const b of el.databaseSites)for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)for(let k=-2;k<=2;k++){const q=cart([b[0]+i,b[1]+j,b[2]+k]),d=Math.hypot(q[0]-s.cart[0],q[1]-s.cart[1],q[2]-s.cart[2]);if(d>1e-6)ds.push(d);}
  ds.sort((x,y)=>x-y);const n=g.neighbors(s),first=ds.filter(d=>d<=ds[0]*1.03);
  assert.equal(n.list.length,first.length,who+'primeira camada no sítio '+s.key);assert.ok(rel(n.distances[0],ds[0])<1e-9,who+'menor distância no sítio '+s.key);
  assert.ok(ds[0]>=1.8,who+'distância mínima fisicamente plausível');if(n.next!==null)assert.ok(n.next>Math.max(...n.distances),who+'camadas separadas no sítio '+s.key);
  assert.equal(n.shells[0].distance,n.distances[0],who+'primeira camada listada');}
 // Instrumentos do Medir: arestas ao longo de cada eixo dão a, b e c tabelados; coordenação = primeira camada.
 const o={cell:[0,0,0],basis:0};
 ['a','b','c'].forEach((p,i)=>{const cell=[0,0,0];cell[i]=1;const r=M.compute('latticeParameter',g,[o,{cell,basis:0}]);assert.ok(r.ok&&r.parameter===p&&Math.abs(r.value-v(p))<=5e-4+1e-9,who+'medida de '+p);});
 assert.equal(M.compute('coordination',g,[o]).value,g.neighbors(g.site(o)).list.length,who+'medida de coordenação');
 // Fórmulas do Calcular × CIF e × cálculo independente.
 const types=Object.values(F).filter(f=>f.applicability.includes(el.structureType)).map(f=>f.id).sort();
 assert.deepEqual(types,['cell-volume-general','effective-atoms-general','theoretical-density'],who+'sem raio nem empacotamento de esferas rígidas');
 const fv=F['cell-volume-general'].compute({a:v('a'),b:v('b'),c:v('c'),alpha:v('alpha'),beta:v('beta'),gamma:v('gamma')}).value;
 assert.ok(rel(fv,Math.abs(g.vectors[0][0]*(g.vectors[1][1]*g.vectors[2][2]-g.vectors[1][2]*g.vectors[2][1])-g.vectors[0][1]*(g.vectors[1][0]*g.vectors[2][2]-g.vectors[1][2]*g.vectors[2][0])+g.vectors[0][2]*(g.vectors[1][0]*g.vectors[2][1]-g.vectors[1][1]*g.vectors[2][0])))<1e-9,who+'volume × produto misto dos vetores');
 assert.ok(rel(fv,cif(ref,'_cell_volume'))<2e-4,who+'volume × _cell_volume do CIF');
 const fn=S.calculation.compute('effective-atoms-general',[],{geometry:g});assert.ok(fn.ok&&fn.result.value===Z&&S.calculation.effective(el.structureType,e)===Z,who+'n');
 const Mm=molar(e);if(Mm){const rho=F['theoretical-density'].compute({n:Z,M:Mm,V:fv}).value;assert.ok(rel(rho,Z*Mm/(NA*fv*1e-24))<1e-12&&rho>4&&rho<23,who+'densidade teórica: '+rho);}
}
assert.deepEqual(counts,{BCC:15,FCC:16,HCP:22});
assert.deepEqual(general,{COMPLEX_CUBIC:1,DHCP:1,MONOCLINIC:1,ORTHORHOMBIC:1,RHOMBOHEDRAL:2,SC:1,TETRAGONAL:2});
assert.deepEqual(blocked.sort(),['La','Nd','Pr']);
console.log('PASS structure-audit: 62 estruturas — 53 em CCC/CFC/HC conferidas sítio a sítio contra a cristalografia, o Medir e o Calcular; 9 no modelo geral (Mn, Sn, Sm, Bi, Np, Pu, Am, Po, Pa) conferidas contra o próprio CIF (Z e volume), vizinhança exaustiva, medidas de a, b e c e densidade; 3 fichas DHC incompletas (La, Pr, Nd) bloqueadas com motivo.');
