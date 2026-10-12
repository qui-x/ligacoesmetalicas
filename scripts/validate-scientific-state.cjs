'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function load(){const box={window:{},console,Math,Date,Uint8Array,crypto:globalThis.crypto};box.window=box;vm.createContext(box);
 for(const file of ['data/bundle.js','data-api.js','assembly.js','crystal.js','state.js'])vm.runInContext(fs.readFileSync(path.join(root,'domain/silm',file),'utf8'),box,{filename:file});return box.SILM;}
const plain=value=>JSON.parse(JSON.stringify(value));
/* Geometria cristalográfica (§115–119): todos os metais suportados, a partir do banco. */
function validateGeometry(S){
 const X=S.crystal,report={BCC:[],FCC:[],HCP:[]},unsupported=[];
 const expectRoles={BCC:{corner:8,body:1},FCC:{corner:8,face:6},HCP:{'base-vertex':12,'base-center':2,interior:3}};
 for(const e of S.data.elements.filter(x=>x.silmEligibility.status==='available')){
  const el=X.eligibility(e);
  if(el.status!=='available'){assert.ok(Object.keys(X.reasons).includes(el.reasonCode),e.symbol);assert.ok(!['CCC','CFC','HC'].includes(D(e).type),e.symbol+' suportado recusado');unsupported.push(e.symbol+':'+el.reasonCode);continue;}
  assert.equal(X.typeByDatabase[D(e).type],el.structureType,e.symbol+': tipo vem do banco');
  const g=X.geometry(e),m=g.model;assert.equal(g.cell.length,m.cellSites,e.symbol);
  const roles={};for(const s of g.cell){const r=g.role(s).role;roles[r]=(roles[r]||0)+1;}assert.deepEqual(roles,expectRoles[m.id],e.symbol+' papéis dos sítios');
  const carts=g.cell.map(s=>s.cart.map(v=>v.toFixed(6)).join());assert.equal(new Set(carts).size,carts.length,e.symbol+': sítios duplicados');
  assert.equal(el.databaseSites.length,m.basis.length,e.symbol+': sítios expandidos do banco');
  for(const s of g.cell){const n=g.neighbors(s);assert.equal(n.list.length,m.coordination);assert.ok((n.next-n.distances.at(-1))/n.distances.at(-1)>.1,e.symbol+': camada de vizinhos bem separada');}
  const a=D(e).latticeParameters.a.value,c=D(e).latticeParameters.c.value,d=g.neighbors(g.cell[0]).distances[0];
  if(m.id==='BCC')assert.ok(Math.abs(d-a*Math.sqrt(3)/2)<1e-9,e.symbol+' d(CCC)=a√3/2');
  if(m.id==='FCC')assert.ok(Math.abs(d-a/Math.SQRT2)<1e-9,e.symbol+' d(CFC)=a/√2');
  if(m.id==='HCP'){const n=g.neighbors(g.cell.find(s=>g.role(s).role==='base-center'));const expect=[a,Math.sqrt(a*a/3+c*c/4)].sort((x,y)=>x-y);assert.ok(Math.abs(n.distances[0]-expect[0])<1e-9&&Math.abs(n.distances.at(-1)-expect[1])<1e-9,e.symbol+' d(HC)');assert.ok(Math.abs(g.ratio-c/a)<1e-12);}
  report[m.id].push(e.symbol);
 }
 function D(e){return e.structures.find(s=>s.id===e.referenceStructure);}
 // Entradas adulteradas do banco não podem gerar estrutura falsa.
 const cu=S.data.get(29),tamper=mut=>{const copy=JSON.parse(JSON.stringify(cu));copy.atomicNumber=9000+Math.floor(Math.random()*999);mut(copy.structures.find(s=>s.id===copy.referenceStructure));return X.eligibility(copy);};
 assert.equal(tamper(s=>s.spaceGroupNumber=229).reasonCode,'DATA_CONFLICT');
 assert.equal(tamper(s=>s.fractionalSites.values=s.fractionalSites.values.slice(0,2)).reasonCode,'DATA_CONFLICT');
 assert.equal(tamper(s=>s.latticeParameters.c.value=4).reasonCode,'DATA_CONFLICT');
 assert.equal(tamper(s=>s.conditions.phase.value='liquid').reasonCode,'REFERENCE_CONDITION_UNSUPPORTED');
 assert.equal(tamper(s=>s.type='TETRAGONAL').reasonCode,'CRYSTAL_STRUCTURE_UNSUPPORTED');
 assert.deepEqual(plain(X.parseOperation('1/2+x,-y+1/2,z-1/4')),[[1,0,0,.5],[0,-1,0,.5],[0,0,1,-.25]]);
 return {supported:{BCC:report.BCC.length,FCC:report.FCC.length,HCP:report.HCP.length},unsupported};
}
function validate(){const S=load(),A=S.assembly,C=A.contract,storage=new Map(),events=[];
 const adapter={get:(key,fallback)=>storage.has(key)?structuredClone(storage.get(key)):fallback,set:(key,value)=>{storage.set(key,structuredClone(value));return true;}};
 const fresh=(emit=()=>{})=>{const m=S.createScientificState();m.connect({storage:adapter,emit});return m;},collect=(name,detail)=>events.push({name,detail});
 const noOverlap=units=>{for(let i=0;i<units.length;i++)for(let j=i+1;j<units.length;j++)if(A.distance(units[i].position,units[j].position)<C.minDistance-1e-9)return false;return true;};
 const geometry=validateGeometry(S);
 const m=fresh(collect);
 assert.equal(S.scientificSchemaVersion,5);assert.equal(S.validateScientificState(m.state).ok,true);

 // Regressão 0.3.x: investigação, metal único, módulo, status.
 for(const z of [1,6,104,118,999])assert.equal(m.begin(z),false);
 assert.equal(m.begin(29),true);const first=m.snapshot(),id=first.investigation.id;
 assert.match(id,/^inv-/);assert.equal(first.metal.symbol,'Cu');assert.equal(first.structure,null);assert.equal(first.electrons,null);
 assert.equal(m.addUnit().ok,false,'Adicionar sem montagem iniciada');

 // Regressão 0.4.x: montagem livre.
 assert.equal(m.beginAssembly(),true);assert.equal(m.beginAssembly(),false);
 let s=m.state.structure;
 assert.deepEqual({v:s.modelVersion,t:s.type,mode:s.mode,z:s.metalAtomicNumber,st:s.status,n:s.units.length,a:plain(s.assistance),r:s.referenceStructureId,c:s.crystallography},{v:2,t:'metallic-assembly',mode:'free',z:29,st:'empty',n:0,a:{enabled:true,mode:'placement'},r:null,c:null});
 for(const target of [1,2,5,10]){while(m.state.structure.units.length<target){const r=m.addUnit();assert.equal(r.ok,true);}
  s=m.state.structure;assert.equal(new Set(s.units.map(u=>u.id)).size,target);assert.ok(noOverlap(s.units));assert.equal(S.validateScientificState(m.state).ok,true);}
 const ids=m.state.structure.units.map(u=>u.id);
 assert.equal(m.moveUnit(ids[0],{x:.9,y:.9}).placement,'manual');
 const occupied=m.state.structure.units[1].position,assisted=m.moveUnit(ids[0],occupied);assert.equal(assisted.adjusted,true);assert.ok(noOverlap(m.state.structure.units));
 assert.equal(m.setAssistance(false),true);assert.equal(m.moveUnit(ids[0],m.state.structure.units[2].position).reason,'OCCUPIED');assert.equal(m.setAssistance(true),true);
 const origin=plain(m.state.structure.units[3].position);m.moveUnit(ids[3],{x:.1,y:.1});assert.equal(m.undo().action,'move');assert.deepEqual(plain(m.state.structure.units[3].position),origin);
 m.addUnit();assert.equal(m.undo().action,'add');assert.deepEqual(m.state.structure.units.map(u=>u.id),ids);

 // 0.5.x: organizar a montagem segundo a estrutura de referência do banco (Cu → CFC).
 const freeBefore=plain(m.state.structure.units);
 const org=m.organize();assert.deepEqual({ok:org.ok,type:org.structureType,reused:org.reused,added:org.added},{ok:true,type:'FCC',reused:10,added:4});
 s=plain(m.state.structure);const g=S.crystal.geometry(S.data.get(29));
 assert.equal(s.mode,'crystalline');assert.equal(s.referenceStructureId,'cu-reference');assert.equal(s.crystallography.structureType,'FCC');assert.equal(s.crystallography.coordination,12);
 assert.equal(s.units.length,14);assert.deepEqual(s.crystallography.freeUnits,freeBefore);assert.equal(S.validateScientificState(m.state).ok,true);
 assert.ok(g.cell.every(c=>s.units.some(u=>S.crystal.key(u.site)===c.key)),'Célula completa');
 // Autoria: unidades do estudante mantêm ID e origem; as completadas são "crystallographic".
 for(const u of freeBefore){const now=s.units.find(x=>x.id===u.id);assert.equal(now.placement,u.placement);assert.equal(now.createdAt,u.createdAt);}
 assert.equal(s.units.filter(u=>u.placement==='crystallographic').length,4);
 assert.equal(m.addUnit().reason,'CRYSTALLINE_MODE');assert.equal(m.moveUnit(ids[0],{x:.5,y:.5}).reason,'CRYSTALLINE_MODE');assert.equal(m.undo().ok,false);assert.equal(m.organize().ok,false);
 // Camadas e vista não alteram a ciência.
 const science=x=>({units:x.units,updatedAt:x.updatedAt,type:x.crystallography.structureType,ref:x.referenceStructureId});const fixed=science(m.state.structure);
 for(let i=0;i<6;i++){assert.equal(m.setCrystalRepresentation({unitCell:i%2===1}),true);assert.equal(m.setCrystalRepresentation({view:i%2?'cell':'lattice'}),true);}
 assert.deepEqual(plain(science(m.state.structure)),plain(fixed));
 assert.equal(m.setCrystalRepresentation({view:'cubo'}),false);assert.equal(m.setCrystalRepresentation({selectedUnitId:'unit-inexistente'}),false);assert.equal(m.setCrystalRepresentation({extra:1}),false);
 const chosen=m.state.structure.units[0].id;assert.equal(m.setCrystalRepresentation({selectedUnitId:chosen,neighbors:true,view:'lattice'}),true);
 // Reload: estrutura cristalina e representação restauradas.
 const reloaded=fresh(collect);assert.equal(reloaded.load().ok,true);assert.deepEqual(plain(reloaded.state.structure),plain(m.state.structure));
 assert.equal(reloaded.state.structure.crystallography.representation.selectedUnitId,chosen);
 // Voltar à montagem livre e retornar ao cristalino.
 const crystalUnits=plain(reloaded.state.structure.units);
 assert.equal(reloaded.restoreFree(),true);s=plain(reloaded.state.structure);assert.equal(s.mode,'free');assert.deepEqual(s.units,freeBefore);assert.equal(s.crystallography,null);assert.equal(reloaded.state.metal.symbol,'Cu');assert.equal(reloaded.state.investigation.id,id);
 assert.equal(reloaded.organize().ok,true);
 const sameSites=plain(reloaded.state.structure.units).filter(u=>u.placement!=='crystallographic').map(u=>[u.id,S.crystal.key(u.site)]);
 assert.deepEqual(sameSites,crystalUnits.filter(u=>u.placement!=='crystallographic').map(u=>[u.id,S.crystal.key(u.site)]),'Reorganização determinística');
 // Limpar mantém metal; reset remove; troca de metal não reaproveita estrutura.
 assert.equal(reloaded.clearStructure(),true);assert.equal(reloaded.state.structure,null);assert.equal(reloaded.state.metal.symbol,'Cu');
 reloaded.beginAssembly();for(let i=0;i<3;i++)reloaded.addUnit();reloaded.organize();assert.equal(reloaded.resetInvestigation(),true);assert.equal(reloaded.state.structure,null);assert.equal(reloaded.state.metal.symbol,'Cu');
 reloaded.beginAssembly();reloaded.addUnit();reloaded.organize();assert.equal(reloaded.begin(26),true);assert.equal(reloaded.state.structure,null);assert.equal(reloaded.state.metal.symbol,'Fe');

 // Fe e Mg: estrutura definida pela referência registrada no banco, não pelo símbolo.
 const fe=fresh();fe.begin(26);fe.beginAssembly();fe.addUnit();fe.addUnit();assert.equal(fe.organize().structureType,S.crystal.eligibility(S.data.get(26)).structureType);
 assert.equal(fe.state.structure.crystallography.structureType,'BCC');assert.equal(fe.state.structure.units.length,9);assert.equal(fe.state.structure.crystallography.coordination,8);
 const mg=fresh();mg.begin(12);mg.beginAssembly();for(let i=0;i<20;i++)mg.addUnit();assert.equal(mg.organize().structureType,'HCP');
 assert.equal(mg.state.structure.units.length,20);assert.equal(mg.state.structure.units.filter(u=>u.placement==='crystallographic').length,0);assert.equal(S.validateScientificState(mg.state).ok,true);
 // Metal sem estrutura suportada: investigação e montagem livre continuam; organização indisponível com motivo.
 const mn=fresh();assert.equal(mn.begin(25),true);mn.beginAssembly();assert.equal(mn.addUnit().ok,true);assert.equal(mn.organize().reason,'CRYSTAL_STRUCTURE_UNSUPPORTED');
 assert.equal(mn.state.structure.mode,'free');assert.equal(mn.addUnit().ok,true);assert.equal(S.validateScientificState(mn.state).ok,true);

 // 0.6.x: modelo eletrônico qualitativo associado à estrutura inteira.
 const E=S.electronModel,el=fresh(collect);el.begin(29);
 assert.equal(el.activateElectrons().reason,'NO_STRUCTURE','Sem estrutura, sem modelo eletrônico');el.beginAssembly();
 assert.equal(el.activateElectrons().reason,'TOO_FEW_UNITS');el.addUnit();assert.equal(el.activateElectrons().reason,'TOO_FEW_UNITS','Uma unidade isolada não forma distribuição coletiva');
 el.addUnit();el.addUnit();const act=el.activateElectrons();assert.equal(act.created,true);
 let ex=plain(el.state.electrons);const eCu=S.data.get(29);
 assert.deepEqual({v:ex.modelVersion,t:ex.type,st:ex.status,z:ex.metalAtomicNumber,src:ex.source,r:ex.representation},{v:1,t:'delocalized-electron-model',st:'active',z:29,src:{model:'valence-electron-contribution',valenceSourceId:eCu.valenceModel.sourceId,configurationSourceId:eCu.electronConfiguration.sourceId},r:{visible:true,motion:true,densityMode:'qualitative',representationType:'qualitative'}});
 assert.ok(!('particles' in ex)&&!('electronCountReal' in ex),'Marcadores não são estado científico');assert.equal(S.validateScientificState(el.state).ok,true);
 // Ocultar e mostrar repetidamente: o modelo permanece; só representation.visible muda; updatedAt não muda.
 const stamp=el.state.investigation.updatedAt,model0={...ex,representation:null};
 for(let i=0;i<8;i++){assert.equal(el.setElectronRepresentation({visible:i%2===1}),true);assert.equal(el.state.electrons.representation.visible,i%2===1);}
 assert.equal(el.setElectronRepresentation({motion:false}),true);assert.equal(el.state.electrons.representation.motion,false);
 assert.deepEqual({...plain(el.state.electrons),representation:null},model0);assert.equal(el.state.investigation.updatedAt,stamp);
 for(const bad of [{visible:'sim'},{speed:2},{densityMode:'count'},{representationType:'quantitative'},null])assert.equal(el.setElectronRepresentation(bad),false,JSON.stringify(bad));
 el.setElectronRepresentation({visible:false});assert.equal(el.activateElectrons().shown,true,'Mostrar elétrons sobre modelo oculto apenas o torna visível');el.setElectronRepresentation({motion:true});
 // Reload restaura modelo e representação.
 const elReload=fresh();assert.equal(elReload.load().ok,true);assert.deepEqual(plain(elReload.state.electrons),plain(el.state.electrons));
 // Organizar preserva o modelo; desfazer abaixo de duas unidades o remove.
 assert.equal(el.organize().ok,true);assert.deepEqual(plain(el.state.electrons),plain(elReload.state.electrons));assert.equal(S.validateScientificState(el.state).ok,true);
 assert.equal(el.restoreFree(),true);assert.notEqual(el.state.electrons,null,'Três unidades livres mantêm o modelo');
 el.addUnit();assert.equal(el.undo().electronsCleared,false);
 el.moveUnit(el.state.structure.units[0].id,{x:.2,y:.2});el.undo();
 while(el.state.structure.units.length>1&&el.undo().ok);assert.equal(el.state.electrons===null,el.state.structure.units.length<2,'Modelo existe somente com duas ou mais unidades');
 const minimal=fresh();minimal.begin(29);minimal.beginAssembly();minimal.addUnit();minimal.addUnit();minimal.activateElectrons();assert.equal(minimal.undo().electronsCleared,true);assert.equal(minimal.state.electrons,null);assert.equal(S.validateScientificState(minimal.state).ok,true);
 // Uma unidade organizada vira célula completa; voltar ao livre com uma unidade remove o modelo.
 const one=fresh();one.begin(26);one.beginAssembly();one.addUnit();one.organize();assert.equal(one.activateElectrons().created,true);assert.equal(one.restoreFree(),true);assert.equal(one.state.electrons,null);assert.equal(S.validateScientificState(one.state).ok,true);
 // Limpar, resetar e trocar de metal: nenhum modelo eletrônico residual.
 const life=fresh();life.begin(29);life.beginAssembly();life.addUnit();life.addUnit();life.activateElectrons();assert.equal(life.clearStructure(),true);assert.equal(life.state.electrons,null);assert.equal(life.state.metal.symbol,'Cu');
 life.beginAssembly();life.addUnit();life.addUnit();life.activateElectrons();life.resetInvestigation();assert.equal(life.state.electrons,null);
 life.beginAssembly();life.addUnit();life.addUnit();life.activateElectrons();life.begin(13);assert.equal(life.state.electrons,null);assert.equal(life.state.metal.symbol,'Al');
 // Metais de transição e de grupo principal usam a mesma convenção do banco: nenhuma contagem por grupo.
 for(const z of [11,13,26,29,79]){const x=fresh();x.begin(z);x.beginAssembly();x.addUnit();x.addUnit();x.activateElectrons();const src=x.state.electrons.source,e=S.data.get(z);assert.equal(src.valenceSourceId,e.valenceModel.sourceId);assert.equal(e.valenceModel.kind,'QUALITATIVE');assert.ok(!JSON.stringify(x.state.electrons).match(/count|group|charge/i));}

 // Estados inválidos (schema 5).
 const freeSample=(()=>{const x=fresh();x.begin(29);x.beginAssembly();for(let i=0;i<3;i++)x.addUnit();return x.state;})();
 const crystalSample=(()=>{const x=fresh();x.begin(29);x.beginAssembly();for(let i=0;i<5;i++)x.addUnit();x.organize();return x.state;})();
 assert.equal(S.validateScientificState(freeSample).ok,true);assert.equal(S.validateScientificState(crystalSample).ok,true);
 const invalidFree=[
  v=>v.schemaVersion=3,v=>v.schemaVersion=999,v=>v.investigation.id='',v=>v.metal.atomicNumber=6,v=>v.module.active='illegal',v=>v.electrons={},v=>v.measurements=[{value:3}],
  v=>v.structure.modelVersion=1,v=>v.structure.modelVersion=3,v=>v.structure.type='CFC',v=>v.structure.mode='cristal',v=>delete v.structure.mode,v=>v.structure.crystalState={},
  v=>v.structure.metalAtomicNumber=26,v=>v.structure.status='empty',v=>v.structure.referenceStructureId='cu-reference',v=>v.structure.crystallography={},
  v=>v.structure.units[0].position.x=NaN,v=>v.structure.units[0].position={x:1.2,y:.5},v=>v.structure.units[1].id=v.structure.units[0].id,
  v=>v.structure.units[0].placement='crystallographic',v=>v.structure.units[0].atomicNumber=26,v=>v.structure.units[1].position={...v.structure.units[0].position},
  v=>v.structure.units[0].site={cell:[0,0,0],basis:0},v=>{v.investigation=null;v.metal=null;}
 ];
 const invalidCrystal=[
  v=>v.structure.crystallography.structureType='cúbica qualquer',v=>v.structure.crystallography.structureType='HCP',v=>v.structure.referenceStructureId='fe-reference',
  v=>v.structure.crystallography.sourceId='src-inexistente',v=>v.structure.crystallography.coordination=8,v=>v.structure.crystallography=null,v=>v.structure.mode='free',
  v=>v.structure.units.pop(),v=>v.structure.units[1].site={...v.structure.units[0].site},v=>v.structure.units[0].site.basis=7,v=>v.structure.units[0].site.cell=[0,0,9],
  v=>v.structure.units[0].site.cell=[0,0,.5],v=>v.structure.units.find(u=>u.placement==='crystallographic').placement='manual',
  v=>v.structure.units[0].placement='crystallographic',v=>v.structure.units[0].position={x:.5,y:.5},v=>v.structure.crystallography.freeUnits=[],
  v=>v.structure.crystallography.freeUnits.pop(),v=>v.structure.crystallography.representation.view='cubo',v=>v.structure.crystallography.representation.unitCell='sim',
  v=>v.structure.crystallography.representation.selectedUnitId='unit-desconhecida-0000',v=>v.structure.crystallography.representation.electrons=true,
  v=>v.structure.crystallography.organizedAt='ontem',v=>v.structure.crystallography.lattice=[],v=>v.structure.units[2].symbol='Fe',v=>v.electrons={type:'sea'},
  v=>{v.metal={...v.metal,atomicNumber:25,symbol:'Mn'};v.structure.metalAtomicNumber=25;}
 ];
 const electronSample=(()=>{const x=fresh();x.begin(29);x.beginAssembly();for(let i=0;i<3;i++)x.addUnit();x.activateElectrons();return x.state;})();
 assert.equal(S.validateScientificState(electronSample).ok,true);
 const invalidElectrons=[
  [v=>v.electrons.particles=[{x:.1,y:.1}],'ELECTRONS_INVALID'],[v=>v.electrons.electronCountReal=12,'ELECTRONS_INVALID'],[v=>v.electrons.type='electron-sea','ELECTRONS_INVALID'],
  [v=>v.electrons.modelVersion=2,'ELECTRONS_INVALID'],[v=>v.electrons.status='inactive','ELECTRONS_INVALID'],[v=>v.electrons.createdAt='ontem','ELECTRONS_INVALID'],
  [v=>v.electrons.metalAtomicNumber=26,'ELECTRONS_METAL_MISMATCH'],[v=>v.structure=null,'ELECTRONS_WITHOUT_STRUCTURE'],[v=>{v.structure.units.splice(1);v.structure.status='assembling';},'ELECTRONS_WITHOUT_STRUCTURE'],
  [v=>v.electrons.source.model='group-number','ELECTRON_SOURCE_INVALID'],[v=>v.electrons.source.count=3,'ELECTRON_SOURCE_INVALID'],[v=>v.electrons.source.valenceSourceId='src-inexistente','ELECTRON_SOURCE_MISMATCH'],
  [v=>v.electrons.representation.representationType='quantitative','ELECTRON_REPRESENTATION_INVALID'],[v=>v.electrons.representation.densityMode='count','ELECTRON_REPRESENTATION_INVALID'],
  [v=>v.electrons.representation.visible='sim','ELECTRON_REPRESENTATION_INVALID'],[v=>v.electrons.representation.current=true,'ELECTRON_REPRESENTATION_INVALID'],[v=>v.electrons.representation.speed=3,'ELECTRON_REPRESENTATION_INVALID'],
  [v=>{v.investigation=null;v.metal=null;v.structure=null;},'ORPHAN_METAL']
 ];
 for(const [mutate,reason] of invalidElectrons){const copy=structuredClone(electronSample);mutate(copy);assert.equal(S.validateScientificState(copy).reason,reason,mutate.toString());}
 for(const mutate of invalidFree){const copy=structuredClone(freeSample);mutate(copy);assert.equal(S.validateScientificState(copy).ok,false,mutate.toString());}
 for(const mutate of invalidCrystal){const copy=structuredClone(crystalSample);mutate(copy);assert.equal(S.validateScientificState(copy).ok,false,mutate.toString());}

 // Migrações para o schema 5: 4 → 5 preserva estrutura cristalina e representação; 3 → 5 preserva a montagem livre; 2 → 5; 1 → 5.
 const v050=structuredClone(crystalSample);v050.schemaVersion=4;v050.structure.crystallography.representation={...v050.structure.crystallography.representation,view:'lattice',neighbors:true,selectedUnitId:v050.structure.units[0].id};
 const m4=fresh();const r4=m4.restore(v050);assert.deepEqual({ok:r4.ok,migrated:r4.migrated,from:r4.from},{ok:true,migrated:true,from:4});
 assert.equal(m4.state.schemaVersion,5);assert.deepEqual(plain(m4.state.structure),plain(v050.structure));assert.equal(m4.state.electrons,null);assert.equal(m4.state.investigation.id,v050.investigation.id);
 assert.equal(fresh().restore({...structuredClone(v050),electrons:{type:'sea'}}).ok,false,'Schema 4 com elétrons não é estado da 0.5.x');
 const v040=structuredClone(freeSample);v040.schemaVersion=3;v040.structure={...v040.structure,modelVersion:1};delete v040.structure.mode;delete v040.structure.crystallography;
 adapter.set('scientific.state',v040);const migrated=fresh();const migration=migrated.load();
 assert.deepEqual({ok:migration.ok,migrated:migration.migrated,from:migration.from},{ok:true,migrated:true,from:3});
 assert.equal(migrated.state.schemaVersion,5);assert.equal(migrated.state.structure.mode,'free');assert.deepEqual(plain(migrated.state.structure.units),plain(v040.structure.units));assert.equal(migrated.state.structure.status,'assembling');
 const v030={...structuredClone(freeSample),schemaVersion:2,structure:null};const m2=fresh();assert.equal(m2.restore(v030).ok,true);assert.equal(m2.state.structure,null);assert.equal(m2.state.schemaVersion,5);
 assert.equal(fresh().restore({...v030,structure:{type:'CFC'}}).ok,false);
 const m1=fresh();assert.equal(m1.restore({schemaVersion:1,metal:29}).ok,true);assert.equal(m1.state.schemaVersion,5);
 const badV3=structuredClone(v040);badV3.structure.units[1].position={...badV3.structure.units[0].position};assert.equal(fresh().restore(badV3).ok,false);

 // Storage corrompido.
 const corrupted=structuredClone(crystalSample);corrupted.structure.units.pop();adapter.set('scientific.state',corrupted);
 const fallback=fresh();assert.equal(fallback.load().ok,false);assert.equal(fallback.state.structure,null);assert.equal(fallback.state.metal,null);
 for(const name of ['investigation:created','structure:created','structure:unit-added','structure:organized','structure:representation','structure:free','structure:cleared','investigation:reset','electrons:activated','electrons:representation'])assert.ok(events.some(e=>e.name===name),name);
 assert.ok(!events.some(e=>/bond|electron/i.test(JSON.stringify(e.detail.current?.structure||null))),'Nenhum par M—M; elétrons fora da estrutura');
 return {schemaVersion:5,structureModelVersion:2,electronModelVersion:E.modelVersion,geometry,invalidCases:invalidFree.length+invalidCrystal.length+invalidElectrons.length,migrations:['4 → 5 (estrutura e representação preservadas)','3 → 5 (montagem preservada)','2 → 5','1 → 5'],
  electrons:{requiresUnits:E.minUnits,visibilityIsRepresentation:true,markersPersisted:false,droppedBelowMinimum:true,clearedWithStructure:true,valenceConvention:'banco (QUALITATIVE)'},organize:{Cu:'FCC',Fe:'BCC',Mg:'HCP',Mn:'CRYSTAL_STRUCTURE_UNSUPPORTED'},authorshipPreserved:true,representationIsNotScience:true,returnToFree:true,undoHistoryPersisted:false};
}
if(require.main===module){try{console.log(JSON.stringify(validate(),null,2));}catch(error){console.error(error);process.exitCode=1;}}
module.exports={validate,load};
