'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function load(){const box={window:{},console,Math,Date,Uint8Array,crypto:globalThis.crypto};box.window=box;vm.createContext(box);
 for(const file of ['data/bundle.js','data-api.js','assembly.js','state.js'])vm.runInContext(fs.readFileSync(path.join(root,'domain/silm',file),'utf8'),box,{filename:file});return box.SILM;}
const plain=value=>JSON.parse(JSON.stringify(value));
function validate(){const S=load(),A=S.assembly,C=A.contract,storage=new Map(),events=[];
 const adapter={get:(key,fallback)=>storage.has(key)?structuredClone(storage.get(key)):fallback,set:(key,value)=>{storage.set(key,structuredClone(value));return true;}};
 const fresh=(emit=()=>{})=>{const m=S.createScientificState();m.connect({storage:adapter,emit});return m;},collect=(name,detail)=>events.push({name,detail});
 const noOverlap=units=>{for(let i=0;i<units.length;i++)for(let j=i+1;j<units.length;j++)if(A.distance(units[i].position,units[j].position)<C.minDistance-1e-9)return false;return true;};
 const m=fresh(collect);
 assert.equal(S.scientificSchemaVersion,3);assert.equal(S.validateScientificState(m.state).ok,true);

 // Regressão 0.3.x: investigação, metal único, módulo, status.
 for(const z of [1,6,104,118,999])assert.equal(m.begin(z),false);
 assert.equal(m.begin(29),true);const first=m.snapshot(),id=first.investigation.id;
 assert.match(id,/^inv-/);assert.equal(first.metal.symbol,'Cu');assert.equal(first.structure,null);assert.equal(first.electrons,null);
 assert.equal(first.conditions.temperature,null);assert.equal(first.measurements.length,0);assert.equal(first.calculations.length,0);
 assert.equal(m.addUnit().ok,false,'Adicionar sem montagem iniciada');

 // Iniciar montagem cria estrutura vazia e não adiciona unidades.
 assert.equal(m.beginAssembly(),true);assert.equal(m.beginAssembly(),false);
 let s=m.state.structure;
 assert.deepEqual({v:s.modelVersion,t:s.type,z:s.metalAtomicNumber,st:s.status,n:s.units.length,a:plain(s.assistance),r:s.referenceStructureId},{v:1,t:'metallic-assembly',z:29,st:'empty',n:0,a:{enabled:true,mode:'placement'},r:null});
 assert.equal(m.state.investigation.id,id);assert.equal(m.state.metal.atomicNumber,29);assert.equal(m.canUndo,false);

 // Adicionar 1, 2, 5 e 10 unidades: IDs estáveis e únicos, sem sobreposição, persistidas.
 for(const target of [1,2,5,10]){while(m.state.structure.units.length<target){const r=m.addUnit();assert.equal(r.ok,true);assert.equal(r.unit.placement,'assisted');}
  s=m.state.structure;assert.equal(s.units.length,target);assert.equal(new Set(s.units.map(u=>u.id)).size,target);
  assert.ok(s.units.every(u=>/^unit-/.test(u.id)&&A.inBounds(u.position)));assert.ok(noOverlap(s.units));
  assert.equal(s.status,'assembling');assert.equal(S.validateScientificState(m.state).ok,true);assert.deepEqual(storage.get('scientific.state').structure,plain(s));}
 const ids=m.state.structure.units.map(u=>u.id);

 // Movimentação: destino livre é aceito como manual; persistido.
 const moved=m.moveUnit(ids[0],{x:.9,y:.9});assert.equal(moved.ok,true);assert.equal(moved.placement,'manual');
 assert.deepEqual(plain(m.state.structure.units[0].position),{x:.9,y:.9});assert.deepEqual(storage.get('scientific.state').structure.units[0].position,{x:.9,y:.9});
 // Sobreposição com assistência: ajuste discreto até o espaço livre mais próximo.
 const occupied=m.state.structure.units[1].position,assisted=m.moveUnit(ids[0],occupied);
 assert.equal(assisted.ok,true);assert.equal(assisted.adjusted,true);assert.equal(assisted.placement,'assisted');assert.ok(noOverlap(m.state.structure.units));
 assert.ok(A.distance(assisted.position,occupied)<C.minDistance*1.7,'Ajuste deve ser discreto');
 // Sem assistência: destino ocupado é recusado e a posição anterior é mantida.
 assert.equal(m.setAssistance(false),true);const before=plain(m.state.structure.units[0].position);
 const refused=m.moveUnit(ids[0],m.state.structure.units[2].position);assert.equal(refused.ok,false);assert.equal(refused.reason,'OCCUPIED');
 assert.deepEqual(plain(m.state.structure.units[0].position),before);assert.equal(m.state.structure.assistance.enabled,false);assert.equal(m.setAssistance(true),true);
 // Limites da cena e valores não finitos.
 const clamped=m.moveUnit(ids[0],{x:5,y:-3});assert.equal(clamped.ok,true);assert.ok(A.inBounds(clamped.position));
 for(const bad of [{x:NaN,y:.5},{x:Infinity,y:.5},{x:'0.5',y:.5},null])assert.equal(m.moveUnit(ids[0],bad).ok,false);
 assert.equal(m.moveUnit('unit-inexistente',{x:.5,y:.5}).ok,false);

 // Desfazer movimento e adição.
 const origin=plain(m.state.structure.units[3].position);assert.equal(m.moveUnit(ids[3],{x:.1,y:.1}).ok,true);
 assert.equal(m.undo().action,'move');assert.deepEqual(plain(m.state.structure.units[3].position),origin);
 assert.equal(m.addUnit().ok,true);assert.equal(m.state.structure.units.length,11);assert.equal(m.undo().action,'add');assert.equal(m.state.structure.units.length,10);
 assert.deepEqual(m.state.structure.units.map(u=>u.id),ids,'Desfazer adição não altera os IDs restantes');
 // Teclado: repetições do mesmo gesto formam uma única ação desfazível.
 const start=plain(m.state.structure.units[4].position);let p={...start};
 for(let i=0;i<3;i++){p={x:p.x,y:p.y-C.keyboardStep};const r=m.moveUnit(ids[4],p,{gesture:'teclado-1'});if(!r.ok)break;p=r.position;}
 m.undo();assert.deepEqual(plain(m.state.structure.units[4].position),start);
 // Histórico limitado.
 for(let i=0;i<40;i++)m.moveUnit(ids[5],{x:i%2?.12:.88,y:.5});assert.ok(m.historySize<=C.historyLimit);

 // Troca de módulo, pausa e retomada preservam a montagem.
 const assembled=plain(m.state.structure);
 for(const module of ['medir','calcular','explorar'])assert.equal(m.setModule(module),true);
 assert.deepEqual(plain(m.state.structure),assembled);
 assert.equal(m.setStatus('paused'),true);assert.equal(m.setStatus('active'),true);assert.deepEqual(plain(m.state.structure),assembled);
 const reloaded=fresh(collect);assert.equal(reloaded.load().ok,true);assert.deepEqual(plain(reloaded.state.structure),assembled);
 assert.equal(reloaded.state.investigation.id,id);assert.equal(reloaded.canUndo,false,'Histórico de desfazer não é persistido');

 // Concluída é marcação do usuário; qualquer edição retorna à construção.
 assert.equal(reloaded.setAssemblyStatus('assembled'),true);assert.equal(reloaded.state.structure.status,'assembled');
 reloaded.moveUnit(ids[6],{x:.5,y:.12});assert.equal(reloaded.state.structure.status,'assembling');

 // Limpar estrutura: structure → null; investigação, metal e módulo mantidos.
 reloaded.setModule('medir');assert.equal(reloaded.clearStructure(),true);
 assert.equal(reloaded.state.structure,null);assert.equal(reloaded.state.metal.atomicNumber,29);assert.equal(reloaded.state.investigation.id,id);assert.equal(reloaded.state.module.active,'medir');
 assert.equal(reloaded.undo().ok,false);assert.equal(reloaded.clearStructure(),false);

 // Limite didático de unidades.
 assert.equal(reloaded.beginAssembly(),true);for(let i=0;i<C.maxUnits;i++)assert.equal(reloaded.addUnit().ok,true,'unidade '+(i+1));
 assert.equal(reloaded.addUnit().reason,'UNITS_LIMIT');assert.ok(noOverlap(reloaded.state.structure.units));assert.equal(S.validateScientificState(reloaded.state).ok,true);

 // Reset remove a estrutura e preserva o metal; troca de metal não converte unidades.
 assert.equal(reloaded.resetInvestigation(),true);assert.equal(reloaded.state.structure,null);assert.equal(reloaded.state.metal.symbol,'Cu');assert.equal(reloaded.state.investigation.id,id);
 reloaded.beginAssembly();reloaded.addUnit();assert.equal(reloaded.begin(26),true);
 assert.equal(reloaded.state.metal.symbol,'Fe');assert.equal(reloaded.state.structure,null);assert.notEqual(reloaded.state.investigation.id,id);

 // Estados inválidos: schema 3 e contrato da estrutura.
 reloaded.beginAssembly();for(let i=0;i<3;i++)reloaded.addUnit();const sample=reloaded.state;assert.equal(S.validateScientificState(sample).ok,true);
 const invalid=[
  v=>v.schemaVersion=2,v=>v.schemaVersion=999,v=>v.investigation.id='',v=>v.investigation.status='closed',v=>v.metal=[v.metal],
  v=>v.metal.atomicNumber=6,v=>v.metal.atomicNumber=104,v=>v.metal.symbol='Cu',v=>v.module.active='illegal',
  v=>v.structure={type:'CFC'},v=>v.electrons={},v=>v.measurements=[{value:3}],v=>v.calculations=[{value:1}],v=>v.conditions.temperature=25,
  v=>v.investigation.updatedAt='yesterday',v=>v.investigation.type='unknown',
  v=>v.structure.modelVersion=2,v=>v.structure.type='CFC',v=>v.structure.metalAtomicNumber=29,v=>delete v.structure.units,v=>v.structure.units={},
  v=>v.structure.status='crystal',v=>v.structure.status='empty',v=>{v.structure.units=v.structure.units.slice(0,1);v.structure.status='assembled';},
  v=>v.structure.assistance={enabled:'sim',mode:'placement'},v=>v.structure.assistance.mode='force',v=>v.structure.referenceStructureId='fe-reference',
  v=>v.structure.updatedAt='ontem',v=>v.structure.units[0].position.x=NaN,v=>v.structure.units[0].position.y=Infinity,v=>v.structure.units[0].position={x:1.2,y:.5},
  v=>v.structure.units[0].position={x:-0.1,y:.5},v=>v.structure.units[0].position={x:'0.5',y:.5},v=>v.structure.units[0].position.z=0,
  v=>v.structure.units[1].id=v.structure.units[0].id,v=>v.structure.units[0].id='0',v=>v.structure.units[0].placement='physics',
  v=>v.structure.units[0].createdAt='hoje',v=>v.structure.units[0].atomicNumber=26,v=>v.structure.units[0].symbol='Fe',v=>v.structure.units[0].bond='unit-x',
  v=>v.structure.units[1].position={...v.structure.units[0].position},v=>v.structure.units[1].position={x:v.structure.units[0].position.x+C.minDistance/3,y:v.structure.units[0].position.y},
  v=>{while(v.structure.units.length<=C.maxUnits)v.structure.units.push({...v.structure.units[0],id:'unit-extra-'+String(v.structure.units.length).padStart(4,'0')});},
  v=>{v.investigation=null;v.metal=null;}
 ];
 for(const mutate of invalid){const copy=structuredClone(sample);mutate(copy);assert.equal(S.validateScientificState(copy).ok,false,mutate.toString());}
 const mixed=structuredClone(sample);mixed.structure.units[0].atomicNumber=26;assert.equal(S.validateScientificState(mixed).reason,'STRUCTURE_MIXED_ELEMENTS');
 const overlapping=structuredClone(sample);overlapping.structure.units[1].position={...overlapping.structure.units[0].position};assert.equal(S.validateScientificState(overlapping).reason,'UNITS_OVERLAP');

 // Migração schema 2 (0.3.0) → schema 3: sem montagem automática.
 const v030={schemaVersion:2,investigation:{id:'inv-0123456789abcdef',status:'active',type:'free',createdAt:'2026-10-01T10:00:00.000Z',updatedAt:'2026-10-01T10:05:00.000Z'},metal:plain(first.metal),module:{active:'calcular'},structure:null,electrons:null,conditions:{temperature:null,pressure:null},observations:[],measurements:[],calculations:[],representation:{dimension:null,layers:[]},metadata:{}};
 adapter.set('scientific.state',v030);const migrated=fresh();const migration=migrated.load();
 assert.deepEqual({ok:migration.ok,migrated:migration.migrated,from:migration.from},{ok:true,migrated:true,from:2});
 assert.equal(migrated.state.schemaVersion,3);assert.equal(migrated.state.structure,null);assert.equal(migrated.state.investigation.id,v030.investigation.id);
 assert.equal(migrated.state.metal.symbol,'Cu');assert.equal(migrated.state.module.active,'calcular');assert.equal(storage.get('scientific.state').schemaVersion,3);
 assert.equal(fresh().restore({...v030,structure:{type:'CFC'}}).ok,false);assert.equal(fresh().restore({...v030,electrons:{}}).ok,false);
 const legacy=fresh();assert.equal(legacy.restore({schemaVersion:1,metal:29}).ok,true);assert.equal(legacy.state.metal.symbol,'Cu');assert.equal(legacy.state.schemaVersion,3);
 assert.equal(legacy.restore({schemaVersion:1,metal:null}).ok,true);assert.equal(legacy.state.investigation,null);

 // Storage corrompido: recuperação sem quebrar a aplicação.
 const corrupted=structuredClone(sample);corrupted.structure.units[0].position.x=Infinity;adapter.set('scientific.state',corrupted);
 const fallback=fresh();assert.equal(fallback.load().ok,false);assert.equal(fallback.state.metal,null);assert.equal(fallback.state.structure,null);
 const stale=structuredClone(sample);stale.metal.atomicNumber=118;adapter.set('scientific.state',stale);assert.equal(fresh().load().ok,false);

 // Encerrar remove estrutura, investigação e metal.
 assert.equal(reloaded.close(),true);assert.equal(reloaded.state.investigation,null);assert.equal(reloaded.state.metal,null);assert.equal(reloaded.state.structure,null);
 for(const name of ['investigation:created','investigation:reset','metal:changed','structure:created','structure:unit-added','structure:unit-moved','structure:undone','structure:assistance','structure:status','structure:cleared','investigation:closed'])assert.ok(events.some(e=>e.name===name),name);
 assert.ok(!events.some(e=>JSON.stringify(e.detail.current?.structure||null).includes('bond')),'Nenhum par M—M é armazenado');
 return {schemaVersion:3,structureModelVersion:C.modelVersion,invalidCases:invalid.length,migration:'schema 2 (0.3.0) → schema 3 (0.4.0)',unitsTested:[1,2,5,10,C.maxUnits],overlapPrevented:true,undo:['add','move'],clearPreservesMetal:true,resetPreservesMetal:true,closeRemovesInvestigation:true,undoHistoryPersisted:false};
}
if(require.main===module){try{console.log(JSON.stringify(validate(),null,2));}catch(error){console.error(error);process.exitCode=1;}}
module.exports={validate,load};
