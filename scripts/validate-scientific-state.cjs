'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function load(){const box={window:{},console,Math,Date,Uint8Array,crypto:globalThis.crypto};box.window=box;vm.createContext(box);
 for(const file of ['data/bundle.js','data-api.js','assembly.js','crystal.js','properties.js','measurements.js','calculations.js','state.js'])vm.runInContext(fs.readFileSync(path.join(root,'domain/silm',file),'utf8'),box,{filename:file});return box.SILM;}
const plain=value=>JSON.parse(JSON.stringify(value));
/* Geometria cristalográfica (§115–119): todos os metais suportados, a partir do banco. */
function validateGeometry(S){
 const X=S.crystal,report={BCC:[],FCC:[],HCP:[]},general={},unsupported=[];
 const expectRoles={BCC:{corner:8,body:1},FCC:{corner:8,face:6},HCP:{'base-vertex':12,'base-center':2,interior:3}};
 for(const e of S.data.elements.filter(x=>x.silmEligibility.status==='available')){
  const el=X.eligibility(e);
  if(el.status!=='available'){assert.ok(Object.keys(X.reasons).includes(el.reasonCode),e.symbol);assert.ok(!['CCC','CFC','HC'].includes(D(e).type),e.symbol+' suportado recusado');unsupported.push(e.symbol+':'+el.reasonCode);continue;}
  if(el.general){
   // 0.16.x — modelo geral: o tipo é o do banco; Σ frações das posições = átomos gerados; sítios sem duplicata; primeira camada não vazia.
   assert.equal(D(e).type,el.structureType,e.symbol+': tipo vem do banco');const g=X.geometry(e),m=g.model,share={corner:1/8,edge:1/4,face:1/2,interior:1};
   assert.ok(Math.abs(g.cell.reduce((t,s)=>t+share[g.role(s).role],0)-el.databaseSites.length)<1e-9,e.symbol+': contagem da célula');
   const carts=g.cell.map(s=>s.cart.map(v=>v.toFixed(6)).join());assert.equal(new Set(carts).size,carts.length,e.symbol+': sítios duplicados');
   for(const s of g.cell){const n=g.neighbors(s);assert.ok(n.list.length>0&&n.distances[0]>=1.8,e.symbol+': vizinhança');}
   general[el.structureType]=(general[el.structureType]||0)+1;continue;}
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
 assert.equal(tamper(s=>s.type='HEXAGONAL_X').reasonCode,'CRYSTAL_STRUCTURE_UNSUPPORTED');
 // Modelo geral: tipo que contradiz o grupo espacial ou a métrica, e ficha sem os sítios completos, não geram estrutura.
 assert.equal(tamper(s=>s.type='TETRAGONAL').reasonCode,'DATA_CONFLICT','CFC rotulada como tetragonal');
 const mn=S.data.get(25),tamperMn=mut=>{const copy=JSON.parse(JSON.stringify(mn));copy.atomicNumber=9000+Math.floor(Math.random()*999);mut(copy.structures.find(s=>s.id===copy.referenceStructure));return X.eligibility(copy);};
 assert.equal(tamperMn(s=>{s.latticeParameters.c.value=9.5;}).reasonCode,'DATA_CONFLICT','cúbica com c diferente de a');
 for(let i=0;i<4;i++)assert.equal(tamperMn(s=>{s.fractionalSites.values=s.fractionalSites.values.filter((_,j)=>j!==i);}).reasonCode,'STRUCTURE_DATA_INCOMPLETE','α-Mn sem o sítio '+i);
 assert.equal(tamperMn(s=>{delete s.fractionalSites.cellFormulaUnitsZ;}).reasonCode,'STRUCTURE_DATA_INCOMPLETE','estrutura geral sem o Z da ficha');
 assert.equal(tamperMn(s=>{s.fractionalSites.cellFormulaUnitsZ=29;}).reasonCode,'DATA_CONFLICT','mais átomos gerados que o Z da ficha');
 assert.deepEqual(plain(X.parseOperation('1/2+x,-y+1/2,z-1/4')),[[1,0,0,.5],[0,-1,0,.5],[0,0,1,-.25]]);
 return {supported:{BCC:report.BCC.length,FCC:report.FCC.length,HCP:report.HCP.length},general,unsupported};
}
function validate(){const S=load(),A=S.assembly,C=A.contract,storage=new Map(),events=[];
 const adapter={get:(key,fallback)=>storage.has(key)?structuredClone(storage.get(key)):fallback,set:(key,value)=>{storage.set(key,structuredClone(value));return true;}};
 const fresh=(emit=()=>{})=>{const m=S.createScientificState();m.connect({storage:adapter,emit});return m;},collect=(name,detail)=>events.push({name,detail});
 const noOverlap=units=>{for(let i=0;i<units.length;i++)for(let j=i+1;j<units.length;j++)if(A.distance(units[i].position,units[j].position)<C.minDistance-1e-9)return false;return true;};
 const geometry=validateGeometry(S);
 const m=fresh(collect);
 assert.equal(S.scientificSchemaVersion,8);assert.equal(S.validateScientificState(m.state).ok,true);

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
 // Metal com ficha incompleta (DHC do lantânio com 2 átomos por célula): investigação e montagem livre continuam; organização indisponível com motivo.
 const la=fresh();assert.equal(la.begin(57),true);la.beginAssembly();assert.equal(la.addUnit().ok,true);assert.equal(la.organize().reason,'STRUCTURE_DATA_INCOMPLETE');
 assert.equal(la.state.structure.mode,'free');assert.equal(la.addUnit().ok,true);assert.equal(S.validateScientificState(la.state).ok,true);
 // 0.16.x — modelo geral (α-Mn): organiza a célula da ficha, sem coordenação fixa; medidas e cálculos gerais validam.
 {const mn=fresh();assert.equal(mn.begin(25),true);mn.beginAssembly();mn.addUnit();mn.addUnit();const om=mn.organize();
 assert.equal(om.ok,true);assert.equal(om.structureType,'COMPLEX_CUBIC');const gm=S.crystal.geometry(S.data.get(25));
 assert.equal(mn.state.structure.units.length,gm.model.cellSites);assert.equal(mn.state.structure.crystallography.coordination,null);assert.equal(S.validateScientificState(mn.state).ok,true);
 mn.setModule('medir');const mu=mn.state.structure.units,mo=mu.find(u=>u.site.basis===0&&u.site.cell.join()==='0,0,0'),me=mu.find(u=>u.site.basis===0&&u.site.cell.join()==='0,0,1');
 const mc=mn.addMeasurement('latticeParameter',[mo.id,me.id]);assert.equal(mc.ok,true);assert.equal(mc.measurement.parameter,'c');assert.ok(Math.abs(mc.measurement.value-8.9125)<=5e-4+1e-9);
 mn.setModule('calcular');const tab=k=>{const t=S.calculation.tabulated(S.data.get(25),k);return {key:k,symbol:k,name:k,value:t.value,unit:t.unit,origin:'TABULATED',ref:t.ref};};
 const vol=mn.addCalculation('cell-volume-general',['a','b','c','alpha','beta','gamma'].map(tab));assert.equal(vol.ok,true);assert.ok(Math.abs(vol.calculation.result.value-8.9125**3)<1e-6);
 const nIn={key:'n',symbol:'n',name:'n',value:S.calculation.effective('COMPLEX_CUBIC',S.data.get(25)),unit:'1',origin:'CALCULATED',ref:{formulaId:'effective-atoms-general'}};assert.equal(nIn.value,58);
 const rho=mn.addCalculation('theoretical-density',[nIn,tab('M'),{key:'V',symbol:'V',name:'V',value:vol.calculation.result.value,unit:'Å³',origin:'CALCULATED',ref:{calculationId:vol.calculation.id}}]);
 assert.equal(rho.ok,true);assert.ok(rho.calculation.result.value>7.4&&rho.calculation.result.value<7.5,'densidade teórica do α-Mn');
 assert.equal(mn.addCalculation('packing-factor',[]).reason,'FORMULA_NOT_APPLICABLE','sem empacotamento de esferas rígidas no modelo geral');
 assert.equal(S.validateScientificState(mn.state).ok,true);
 const forged=JSON.parse(JSON.stringify(mn.state));forged.calculations[1].inputs.find(x=>x.key==='n').value=57;assert.equal(S.validateScientificState(forged).ok,false,'n adulterado no modelo geral');}

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

 // 0.7.x: propriedades metálicas — elegibilidade por propriedade e experiência ativa no mesmo estado.
 const P=S.properties,pm=fresh(collect);pm.begin(29);
 assert.equal(pm.startProperty('electrical').reason,'NO_STRUCTURE');pm.beginAssembly();pm.addUnit();
 assert.equal(pm.startProperty('electrical').reason,'TOO_FEW_UNITS');pm.addUnit();assert.equal(pm.startProperty('thermal').reason,'NEEDS_CRYSTALLINE','Experiências de rede exigem a estrutura cristalina');
 assert.equal(pm.startProperty('magnetism').reason,'PROPERTY_UNKNOWN');
 const st=pm.startProperty('electrical');assert.equal(st.ok,true);assert.equal(st.electrons,true,'Condutividade ativa e mostra o modelo eletrônico');assert.equal(pm.state.electrons.representation.visible,true);
 assert.equal(pm.state.properties.active,'electrical');assert.equal(S.validateScientificState(pm.state).ok,true);
 const structureBefore=plain(pm.state.structure);assert.equal(pm.setPropertyParams({field:true}),true);assert.equal(pm.state.properties.electrical.field,true);
 assert.deepEqual(plain(pm.state.structure),structureBefore,'Campo não altera a estrutura');
 for(const bad of [{field:'sim'},{voltage:5},{stage:2}])assert.equal(pm.setPropertyParams(bad),false,JSON.stringify(bad));
 assert.equal(pm.restoreProperty(),true);assert.equal(pm.state.properties.electrical.field,false);assert.equal(pm.state.properties.active,'electrical');assert.equal(pm.state.metal.symbol,'Cu');
 pm.organize();assert.equal(pm.state.properties.active,'electrical','Organizar mantém a experiência elétrica');
 const crystalBefore=plain(pm.state.structure);
 for(const [id,patch,bad] of [['thermal',{heating:true,stage:4},{stage:5}],['malleability',{compression:3},{compression:4}],['ductility',{elongation:3},{elongation:-1}],['luster',{light:true},{light:1}]]){
  const r=pm.startProperty(id);assert.equal(r.ok,true,id);assert.ok(P.ids.filter(x=>x!==id).every(x=>JSON.stringify(pm.state.properties[x])===JSON.stringify(P.defaults[x])),'Troca sem resíduo: '+id);
  assert.equal(pm.setPropertyParams(patch),true,id);assert.equal(pm.setPropertyParams(bad),false,id+' fora da faixa');assert.equal(S.validateScientificState(pm.state).ok,true,id);
  assert.deepEqual(plain(pm.state.structure),crystalBefore,'A experiência não altera a cristalografia: '+id);
  for(let k=0;k<5;k++)pm.setPropertyParams(patch);assert.deepEqual(plain(pm.state.structure),crystalBefore,'Repetição sem fusão nem mudança estrutural: '+id);
  assert.equal(pm.restoreProperty(),true);assert.deepEqual(plain(pm.state.properties[id]),plain(P.defaults[id]),'Restaurar: '+id);
 }
 pm.setPropertyParams({light:true});const prReload=fresh();assert.equal(prReload.load().ok,true);assert.deepEqual(plain(prReload.state.properties),plain(pm.state.properties),'Reload restaura a experiência');
 assert.equal(pm.endProperty(),true);assert.deepEqual(plain(pm.state.properties),plain(P.fresh()));
 pm.startProperty('malleability');pm.setPropertyParams({compression:2});assert.equal(pm.restoreFree(),true);assert.equal(pm.state.properties.active,null,'Voltar ao livre encerra experiência de rede');
 const drop=fresh();drop.begin(29);drop.beginAssembly();drop.addUnit();drop.addUnit();drop.startProperty('electrical');drop.setPropertyParams({field:true});assert.equal(drop.undo().electronsCleared,true);assert.equal(drop.state.properties.active,null,'Sem elétrons, sem experiência elétrica');assert.equal(S.validateScientificState(drop.state).ok,true);
 const lifecycle=fresh();lifecycle.begin(29);lifecycle.beginAssembly();lifecycle.addUnit();lifecycle.addUnit();lifecycle.organize();lifecycle.startProperty('thermal');lifecycle.setPropertyParams({heating:true,stage:2});
 assert.equal(lifecycle.clearStructure(),true);assert.deepEqual(plain(lifecycle.state.properties),plain(P.fresh()),'Limpar estrutura limpa propriedades');
 lifecycle.beginAssembly();lifecycle.addUnit();lifecycle.addUnit();lifecycle.organize();lifecycle.startProperty('luster');lifecycle.resetInvestigation();assert.equal(lifecycle.state.properties.active,null,'Reset limpa propriedades');
 lifecycle.beginAssembly();lifecycle.addUnit();lifecycle.addUnit();lifecycle.startProperty('electrical');lifecycle.begin(26);assert.equal(lifecycle.state.properties.active,null,'Troca de metal sem experiência antiga');
 lifecycle.close();assert.deepEqual(plain(lifecycle.state.properties),plain(P.fresh()),'Encerrar: cleanup completo');
 // Elegibilidade por propriedade a partir do banco (nunca "todo metal igual").
 const elig=z=>Object.fromEntries(Object.entries(P.eligibility(S.data.get(z))).map(([k,v])=>[k,v.status==='unavailable'?v.reasonCode:v.status]));
 assert.deepEqual(elig(29),{electrical:'qualitative',thermal:'qualitative',malleability:'qualitative',ductility:'qualitative',luster:'qualitative'});
 assert.deepEqual(elig(57),{electrical:'qualitative',thermal:'MODEL_NOT_APPLICABLE',malleability:'MODEL_NOT_APPLICABLE',ductility:'MODEL_NOT_APPLICABLE',luster:'MODEL_NOT_APPLICABLE'},'La: sem visualização cristalina (ficha incompleta)');
 assert.deepEqual(elig(25),{electrical:'qualitative',thermal:'qualitative',malleability:'DEFORMATION_MODEL_NOT_APPLICABLE',ductility:'DEFORMATION_MODEL_NOT_APPLICABLE',luster:'qualitative'},'Mn (modelo geral): sem deformação didática');
 assert.deepEqual(elig(80),{electrical:'METAL_NOT_INVESTIGABLE',thermal:'REFERENCE_PHASE_UNSUPPORTED',malleability:'REFERENCE_PHASE_UNSUPPORTED',ductility:'REFERENCE_PHASE_UNSUPPORTED',luster:'REFERENCE_PHASE_UNSUPPORTED'},'Hg: sem fase sólida de referência');
 const liquid={...S.data.get(29),silmEligibility:{status:'unavailable',reasonCode:'STRUCTURE_NOT_HOMOLOGATED'},referenceStructure:null,structures:[],phaseAtReference:{value:'liquid',display:'Líquida'}};
 assert.ok(['thermal','malleability','ductility','luster'].every(id=>P.eligibility(liquid)[id].reasonCode==='LIQUID_AT_REFERENCE_CONDITION'),'Regra de fase líquida (dado de fase homologado)');
 assert.ok(Object.values(P.eligibility(S.data.get(29))).every(x=>x.data===null&&(['electrical','thermal'].includes(x.id)?x.dataReason==='PROPERTY_DATA_MISSING':true)),'Sem valor típico: lacuna declarada');
 const withRho={...S.data.get(29),properties:{electricalResistivity:{value:16.78,unit:'nΩ·m',conditions:{temperature:{value:293.15,unit:'K'}},sourceId:'src-silm-conventions'}}};
 const calc=P.eligibility(withRho).electrical;assert.equal(calc.status,'available');assert.equal(calc.data.kind,'CALCULATED','σ = 1/ρ classificado como calculado');assert.equal(calc.data.from.kind,'TABULATED');
 const noProvenance={...S.data.get(29),properties:{thermalConductivity:{value:401,unit:'W/(m·K)'}}};assert.equal(P.eligibility(noProvenance).thermal.data,null,'Dado sem condição/fonte é recusado');
 const laState=fresh();laState.begin(57);laState.beginAssembly();laState.addUnit();laState.addUnit();assert.equal(laState.startProperty('electrical').ok,true);assert.equal(laState.startProperty('malleability').reason,'MODEL_NOT_APPLICABLE');
 const mnState=fresh();mnState.begin(25);mnState.beginAssembly();mnState.addUnit();mnState.addUnit();assert.equal(mnState.startProperty('malleability').reason,'DEFORMATION_MODEL_NOT_APPLICABLE');

 // 0.9.x: medições do modelo — pontos em sítios científicos, valor recalculado das coordenadas em Å.
 const MS=S.measurement,me=fresh(collect);me.begin(29);me.beginAssembly();me.addUnit();me.addUnit();
 assert.equal(me.addMeasurement('distance',me.state.structure.units.map(u=>u.id)).reason,'NO_SCALE','Montagem livre: sem medida absoluta');
 me.organize();const gCu=S.crystal.geometry(S.data.get(29)),K=S.crystal.key,byKey=new Map(me.state.structure.units.map(u=>[K(u.site),u.id]));
 const corner=gCu.cell.find(c=>c.frac.every(v=>Math.abs(v)<1e-9)),nn=gCu.neighbors(corner).list.find(n=>byKey.has(n.key)),edge=gCu.cell.find(c=>c.basis===corner.basis&&Math.abs(Math.hypot(...c.cart.map((v,i)=>v-corner.cart[i]))-gCu.vectors[0][0])<1e-6);
 const d=me.addMeasurement('distance',[byKey.get(corner.key),byKey.get(nn.key)]);assert.equal(d.measurement.value,2.556);assert.equal(d.measurement.unit,'Å');assert.equal(d.measurement.source.kind,'MODEL_MEASUREMENT');
 const lp=me.addMeasurement('latticeParameter',[byKey.get(corner.key),byKey.get(edge.key)]);assert.equal(lp.measurement.value,3.615);assert.equal(lp.measurement.parameter,'a');
 assert.equal(me.addMeasurement('latticeParameter',[byKey.get(corner.key),byKey.get(nn.key)]).reason,'NOT_LATTICE_VECTOR','Vértice × face não é parâmetro de rede');
 const co=me.addMeasurement('coordination',[byKey.get(corner.key)]);assert.equal(co.measurement.value,12);
 const an=me.addMeasurement('angle',[byKey.get(nn.key),byKey.get(corner.key),byKey.get(edge.key)]);assert.ok(an.ok&&an.measurement.unit==='°');
 assert.equal(me.addMeasurement('distance',[byKey.get(corner.key),byKey.get(corner.key)]).reason,'SAME_POINT');assert.equal(S.validateScientificState(me.state).ok,true);
 for(const [z,expect] of [[26,{nn:2.482,a:2.865,coord:8}],[12,{nn:3.197,a:3.209,c:5.21,coord:12}]]){const x=fresh();x.begin(z);x.beginAssembly();x.addUnit();x.organize();const g=S.crystal.geometry(S.data.get(z)),map=new Map(x.state.structure.units.map(u=>[K(u.site),u.id]));
  const c0=g.cell.find(c=>c.frac.every(v=>Math.abs(v)<1e-9)),n0=g.neighbors(c0).list.find(n=>map.has(n.key)),same=g.cell.filter(c=>c.basis===c0.basis&&c.key!==c0.key);
  assert.equal(x.addMeasurement('distance',[map.get(c0.key),map.get(n0.key)]).measurement.value,expect.nn);assert.equal(x.addMeasurement('coordination',[map.get(c0.key)]).measurement.value,expect.coord);
  const params=new Set(same.map(c=>x.addMeasurement('latticeParameter',[map.get(c0.key),map.get(c.key)])).filter(r=>r.ok).map(r=>r.measurement.parameter+'='+r.measurement.value));
  assert.ok(params.has('a='+expect.a),[...params].join());if(expect.c)assert.ok(params.has('c='+expect.c),[...params].join());assert.equal(S.validateScientificState(x.state).ok,true);}
 const kept=JSON.parse(JSON.stringify(me.state.measurements));me.restoreFree();assert.deepEqual(plain(me.state.measurements),kept);assert.equal(MS.current(me.state.measurements[0],me.state.structure),false);assert.equal(S.validateScientificState(me.state).ok,true);
 assert.equal(me.removeMeasurement(kept[0].id),true);assert.equal(me.state.measurements.length,kept.length-1);const st0=plain(me.state.structure);assert.equal(me.clearMeasurements(),true);assert.deepEqual(plain(me.state.measurements),[]);assert.deepEqual(plain(me.state.structure),st0,'Limpar medições não limpa a estrutura');
 const deform=fresh();deform.begin(29);deform.beginAssembly();deform.addUnit();deform.organize();deform.startProperty('malleability');deform.setPropertyParams({compression:1});assert.equal(deform.addMeasurement('coordination',[deform.state.structure.units[0].id]).reason,'DEFORMED');
 const newInv=fresh();newInv.begin(29);assert.deepEqual(plain(newInv.state.measurements),[],'Nova investigação não herda medições');
 assert.equal(S.units.format(2.556,'pm'),'255,6 pm');assert.equal(S.units.format(2.556,'nm'),'0,2556 nm');assert.equal(S.units.convert(1,'pm'),100);assert.equal(S.units.convert(1,'nm'),.1);

 // Estados inválidos (schema 7).
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
 const propertySample=(()=>{const x=fresh();x.begin(29);x.beginAssembly();for(let i=0;i<3;i++)x.addUnit();x.organize();x.startProperty('malleability');x.setPropertyParams({compression:2});return x.state;})();
 assert.equal(S.validateScientificState(propertySample).ok,true);
 const invalidProperties=[
  [v=>delete v.properties,'PROPERTIES_INVALID'],[v=>v.properties.modelVersion=2,'PROPERTIES_INVALID'],[v=>v.properties.magnetism={},'PROPERTIES_INVALID'],[v=>v.properties.active='hardness','PROPERTY_UNKNOWN'],
  [v=>v.properties.malleability.compression=7,'PROPERTY_PARAMS_INVALID'],[v=>v.properties.malleability.compression=1.5,'PROPERTY_PARAMS_INVALID'],[v=>v.properties.electrical={field:true,voltage:3},'PROPERTY_PARAMS_INVALID'],
  [v=>v.properties.thermal.stage=9,'PROPERTY_PARAMS_INVALID'],[v=>v.properties.luster.light=true,'PROPERTY_STATE_RESIDUAL'],[v=>v.properties.ductility.elongation=1,'PROPERTY_STATE_RESIDUAL'],
  [v=>v.properties.startedAt='ontem','PROPERTIES_INVALID'],[v=>{v.properties.active=null;v.properties.malleability.compression=0;},'PROPERTIES_INVALID'],
  [v=>{v.structure.mode='free';},'MODE_INCONSISTENT'],[v=>{v.properties.active='electrical';v.properties.malleability.compression=0;},'PROPERTY_CONTEXT_INVALID'],
  [v=>{v.investigation=null;v.metal=null;v.structure=null;},'PROPERTY_CONTEXT_INVALID']
 ];
 for(const [mutate,reason] of invalidProperties){const copy=structuredClone(propertySample);mutate(copy);assert.equal(S.validateScientificState(copy).reason,reason,mutate.toString());}
 const measureSample=(()=>{const x=fresh();x.begin(29);x.beginAssembly();x.addUnit();x.organize();const ids=x.state.structure.units.map(u=>u.id);x.addMeasurement('distance',[ids[0],ids[1]]);x.addMeasurement('coordination',[ids[0]]);return x.state;})();
 assert.equal(S.validateScientificState(measureSample).ok,true);
 const invalidMeasurements=[
  [v=>v.measurements[0].value=9.9,'MEASUREMENT_VALUE_INVALID'],[v=>v.measurements[0].value=NaN,'MEASUREMENT_VALUE_INVALID'],[v=>v.measurements[0].value=Infinity,'MEASUREMENT_VALUE_INVALID'],
  [v=>v.measurements[0].unit='nm','MEASUREMENT_UNIT_INVALID'],[v=>v.measurements[0].resolution=1e-6,'MEASUREMENT_UNIT_INVALID'],[v=>v.measurements[0].type='density','MEASUREMENT_TYPE_INVALID'],
  [v=>v.measurements[0].instrument='multímetro','MEASUREMENT_TYPE_INVALID'],[v=>v.measurements[1].id=v.measurements[0].id,'MEASUREMENT_INVALID'],[v=>v.measurements[0].uncertainty=.01,'MEASUREMENT_INVALID'],
  [v=>v.measurements[0].metalAtomicNumber=26,'MEASUREMENT_METAL_MISMATCH'],[v=>v.measurements[0].structureContext.mode='free','MEASUREMENT_WITHOUT_SCALE'],[v=>v.measurements[0].structureContext.structureType='BCC','MEASUREMENT_CONTEXT_INVALID'],
  [v=>v.measurements[0].source.kind='TABULATED','MEASUREMENT_SOURCE_INVALID'],[v=>v.measurements[0].points.pop(),'MEASUREMENT_POINTS_INVALID'],[v=>v.measurements[0].points[0]={x:120,y:44},'MEASUREMENT_POINTS_INVALID'],
  [v=>v.measurements[0].points[1].site.basis=9,'MEASUREMENT_POINTS_INVALID'],[v=>v.measurements[0].createdAt='ontem','MEASUREMENT_INVALID']
 ];
 for(const [mutate,reason] of invalidMeasurements){const copy=structuredClone(measureSample);mutate(copy);assert.equal(S.validateScientificState(copy).reason,reason,mutate.toString());}
 for(const mutate of invalidFree){const copy=structuredClone(freeSample);mutate(copy);assert.equal(S.validateScientificState(copy).ok,false,mutate.toString());}
 for(const mutate of invalidCrystal){const copy=structuredClone(crystalSample);mutate(copy);assert.equal(S.validateScientificState(copy).ok,false,mutate.toString());}

 // Migrações para o schema 8: 7 → 8 (cálculos vazios); 6 → 8 (medições vazias); 5 → 8 preserva elétrons; 4 → 8; 3 → 8 preserva a montagem livre; 2 → 8; 1 → 8.
 const v080=structuredClone(propertySample);v080.schemaVersion=6;const m6=fresh();const r6=m6.restore(v080);assert.deepEqual({ok:r6.ok,from:r6.from},{ok:true,from:6});assert.equal(m6.state.schemaVersion,8);assert.deepEqual(plain(m6.state.properties),plain(v080.properties));
 assert.equal(fresh().restore({...structuredClone(v080),measurements:[{type:'distance'}]}).ok,false,'Schema 6 com medições não é estado da 0.8.x');
 const v060=structuredClone(electronSample);v060.schemaVersion=5;delete v060.properties;const m5=fresh();const r5=m5.restore(v060);
 assert.deepEqual({ok:r5.ok,from:r5.from},{ok:true,from:5});assert.equal(m5.state.schemaVersion,8);assert.deepEqual(plain(m5.state.electrons),plain(v060.electrons));assert.deepEqual(plain(m5.state.structure),plain(v060.structure));assert.deepEqual(plain(m5.state.properties),plain(P.fresh()));
 const v050=structuredClone(crystalSample);v050.schemaVersion=4;delete v050.properties;v050.structure.crystallography.representation={...v050.structure.crystallography.representation,view:'lattice',neighbors:true,selectedUnitId:v050.structure.units[0].id};
 const m4=fresh();const r4=m4.restore(v050);assert.deepEqual({ok:r4.ok,migrated:r4.migrated,from:r4.from},{ok:true,migrated:true,from:4});
 assert.equal(m4.state.schemaVersion,8);assert.deepEqual(plain(m4.state.structure),plain(v050.structure));assert.equal(m4.state.electrons,null);assert.equal(m4.state.investigation.id,v050.investigation.id);
 assert.equal(fresh().restore({...structuredClone(v050),electrons:{type:'sea'}}).ok,false,'Schema 4 com elétrons não é estado da 0.5.x');
 assert.equal(fresh().restore({...structuredClone(v060),properties:{active:'electrical'}}).ok,false,'Schema 5 com propriedades não é estado da 0.6.x');
 const v040=structuredClone(freeSample);v040.schemaVersion=3;delete v040.properties;v040.structure={...v040.structure,modelVersion:1};delete v040.structure.mode;delete v040.structure.crystallography;
 adapter.set('scientific.state',v040);const migrated=fresh();const migration=migrated.load();
 assert.deepEqual({ok:migration.ok,migrated:migration.migrated,from:migration.from},{ok:true,migrated:true,from:3});
 assert.equal(migrated.state.schemaVersion,8);assert.equal(migrated.state.structure.mode,'free');assert.deepEqual(plain(migrated.state.structure.units),plain(v040.structure.units));assert.equal(migrated.state.structure.status,'assembling');
 const v030={...structuredClone(freeSample),schemaVersion:2,structure:null};delete v030.properties;const m2=fresh();assert.equal(m2.restore(v030).ok,true);assert.equal(m2.state.structure,null);assert.equal(m2.state.schemaVersion,8);
 assert.equal(fresh().restore({...v030,structure:{type:'CFC'}}).ok,false);
 const m1=fresh();assert.equal(m1.restore({schemaVersion:1,metal:29}).ok,true);assert.equal(m1.state.schemaVersion,8);
 const badV3=structuredClone(v040);badV3.structure.units[1].position={...badV3.structure.units[0].position};assert.equal(fresh().restore(badV3).ok,false);

 // 7 → 8 (0.9.x → 0.10.0): cálculos vazios; schema 7 com cálculos não é estado da 0.9.x.
 const v090=structuredClone(measureSample);v090.schemaVersion=7;const m7=fresh();const r7=m7.restore(v090);assert.deepEqual({ok:r7.ok,from:r7.from},{ok:true,from:7});assert.equal(m7.state.schemaVersion,8);assert.deepEqual(plain(m7.state.measurements),plain(v090.measurements));
 assert.equal(fresh().restore({...structuredClone(v090),calculations:[{type:'density'}]}).ok,false,'Schema 7 com cálculos não é estado da 0.9.x');

 // 0.10.x: cálculos — catálogo único, entradas com origem, resultado recalculado pelo validador.
 const KC=S.calculation,TAB=(e,k)=>{const t=KC.tabulated(e,k);return {key:k,symbol:k,name:KC.inputs[k].name,value:t.value,unit:t.unit,origin:'TABULATED',ref:t.ref};};
 const calcSummary={};
 for(const [z,t,exp] of [[29,'FCC',{n:4,V:47.24,r:1.278,FE:0.7405,rho:8.935}],[26,'BCC',{n:2,V:23.53,r:1.241,FE:0.6802,rho:7.883}],[12,'HCP',{n:6,V:139.4,r:1.598,FE:0.7362,rho:1.737,ca:1.624}]]){
  const x=fresh(collect);x.begin(z);x.beginAssembly();x.addUnit();x.organize();x.setModule('calcular');const e=S.data.get(z);
  const n=x.addCalculation('effective-atoms-'+t.toLowerCase(),[]);assert.ok(n.ok,JSON.stringify(n));assert.equal(n.calculation.result.value,exp.n);
  const geo=t==='HCP'?[TAB(e,'a'),TAB(e,'c')]:[TAB(e,'a')];
  const V=x.addCalculation(t==='HCP'?'cell-volume-hcp':'cell-volume-cubic',geo);assert.ok(V.ok);assert.equal(KC.sig(V.calculation.result.value).replace(',','.'),String(exp.V));
  const r=x.addCalculation(t==='HCP'?'radius-from-ac-hcp':'radius-from-a-'+t.toLowerCase(),geo);assert.ok(r.ok);assert.equal(+KC.sig(r.calculation.result.value).replace(',','.'),exp.r);
  const N={key:'n',symbol:'n',name:'n',value:exp.n,unit:'1',origin:'CALCULATED',ref:{calculationId:n.calculation.id}},Vin={key:'V',symbol:'V',name:'V',value:V.calculation.result.value,unit:'Å³',origin:'CALCULATED',ref:{calculationId:V.calculation.id}};
  const fe=x.addCalculation('packing-factor',[N,{key:'r',symbol:'r',name:'r',value:r.calculation.result.value,unit:'Å',origin:'CALCULATED',ref:{calculationId:r.calculation.id}},Vin]);assert.ok(fe.ok);assert.equal(+KC.sig(fe.calculation.result.value).replace(',','.'),exp.FE);
  const rho=x.addCalculation('theoretical-density',[N,TAB(e,'M'),Vin]);assert.ok(rho.ok,JSON.stringify(rho));
  const shown=+KC.format(rho.calculation.result,'g/cm³').split(' ')[0].replace(',','.');assert.equal(shown,exp.rho);
  assert.ok(rho.calculation.inputs.some(i=>i.key==='NA'&&i.origin==='CONSTANT'&&i.value===6.02214076e23),'N_A como constante central com origem');
  assert.ok(rho.calculation.provenance.references.includes('src-bipm-si-2019')&&rho.calculation.provenance.dependsOn.includes(V.calculation.id));
  if(t==='HCP'){assert.ok(Array.isArray(rho.calculation.result.interval),'peso atômico em intervalo → densidade em intervalo');const ca=x.addCalculation('ca-ratio-hcp',geo);assert.equal(+KC.sig(ca.calculation.result.value).replace(',','.'),exp.ca);
   assert.equal(x.addCalculation('cell-volume-cubic',[TAB(e,'a')]).reason,'FORMULA_NOT_APPLICABLE','fórmula cúbica recusada no HC');assert.equal(x.addCalculation('a-from-radius-fcc',[{key:'r',symbol:'r',name:'r',value:1.6,unit:'Å',origin:'USER',ref:null}]).reason,'FORMULA_NOT_APPLICABLE');}
  else assert.equal(x.addCalculation('cell-volume-hcp',geo).reason,'FORMULA_NOT_APPLICABLE');
  assert.equal(S.validateScientificState(x.state).ok,true);
  calcSummary[e.symbol]={n:exp.n,V:KC.format(V.calculation.result,'Å³'),r:KC.format(r.calculation.result,'Å'),FE:KC.format(fe.calculation.result,'1'),rho:KC.format(rho.calculation.result,'g/cm³')};
  if(z===29){
   const ok=x.state;
   for(const [mutate,reason] of [[v=>v.calculations[1].result.value*=1.01,'CALCULATION_RESULT_INVALID'],[v=>v.calculations[1].inputs[0].value=3.7,'CALCULATION_TABULATED_MISMATCH'],[v=>v.calculations[1].formulaId='cell-volume-hcp','FORMULA_NOT_APPLICABLE'],
     [v=>v.calculations[1].inputs[0].origin='GUESS','CALCULATION_ORIGIN_INVALID'],[v=>v.calculations[4].inputs.find(i=>i.key==='NA').value=6e23,'CALCULATION_CONSTANT_INVALID'],[v=>v.calculations[0].id='x','CALCULATION_INVALID'],
     [v=>v.calculations[1].unit='cm³','CALCULATION_UNIT_INVALID'],[v=>v.calculations[1].metalAtomicNumber=26,'CALCULATION_METAL_MISMATCH'],[v=>v.calculations[3].inputs.find(i=>i.key==='n').value=3,'CALCULATION_VALUE_INVALID'],
     [v=>v.calculations[1].inputs[0]={...v.calculations[1].inputs[0],origin:'USER',ref:null,value:NaN},'CALCULATION_VALUE_INVALID'],[v=>v.calculations[1].type='density','FORMULA_UNKNOWN']]){
    const copy=structuredClone(ok);mutate(copy);assert.equal(S.validateScientificState(copy).reason,reason,mutate.toString());}
   // Valores informados pelo usuário: origem própria; fisicamente impossível é recusado; sem NaN/Infinity.
   const user=x.addCalculation('cell-volume-cubic',[{key:'a',symbol:'a',name:'a',value:3.6,unit:'Å',origin:'USER',ref:null}]);assert.ok(user.ok);assert.equal(user.calculation.inputs[0].origin,'USER');
   assert.equal(x.addCalculation('packing-factor',[N,{key:'r',symbol:'r',name:'r',value:2,unit:'Å',origin:'USER',ref:null},Vin]).reason,'PHYSICALLY_INVALID');
   for(const bad of [NaN,Infinity,-Infinity,0,-1])assert.equal(x.addCalculation('cell-volume-cubic',[{key:'a',symbol:'a',name:'a',value:bad,unit:'Å',origin:'USER',ref:null}]).ok,false,String(bad));
   // Medida do modelo como entrada (escolha entre medida e referência).
   const ids=x.state.structure.units;const g=S.crystal.geometry(e),KK=S.crystal.key,byKey=new Map(ids.map(u=>[KK(u.site),u.id])),corner=g.cell.find(c=>c.frac.every(v=>Math.abs(v)<1e-9)),edge=g.cell.filter(c=>c.basis===corner.basis&&c.key!==corner.key).map(c=>({c,d:Math.hypot(...c.cart.map((v,i)=>v-corner.cart[i]))})).sort((a,b)=>a.d-b.d)[0].c;
   const meas=x.addMeasurement('latticeParameter',[byKey.get(corner.key),byKey.get(edge.key)]);assert.ok(meas.ok,JSON.stringify(meas));
   const fromMeas=x.addCalculation('cell-volume-cubic',[{key:'a',symbol:'a',name:'a',value:meas.measurement.value,unit:'Å',origin:'MODEL_MEASUREMENT',ref:{measurementId:meas.measurement.id}}]);assert.ok(fromMeas.ok);assert.ok(fromMeas.calculation.provenance.dependsOn.includes(meas.measurement.id));
   // Limpar cálculos não limpa estrutura nem medições; nova investigação não herda cálculos.
   assert.equal(x.removeCalculation(user.calculation.id),true);assert.ok(!x.state.calculations.some(c=>c.id===user.calculation.id));
   const before=x.state.measurements.length;assert.equal(x.clearCalculations(),true);assert.equal(x.state.calculations.length,0);assert.ok(x.state.structure);assert.equal(x.state.measurements.length,before);
   x.addCalculation('effective-atoms-fcc',[]);x.resetInvestigation();assert.equal(x.state.calculations.length,0);
   // Sem estrutura cristalina: nenhum cálculo absoluto.
   const free=fresh();free.begin(29);free.beginAssembly();free.addUnit();free.addUnit();assert.equal(free.addCalculation('effective-atoms-fcc',[]).reason,'NO_SCALE');
  }
 }

 // Storage corrompido.
 const corrupted=structuredClone(crystalSample);corrupted.structure.units.pop();adapter.set('scientific.state',corrupted);
 const fallback=fresh();assert.equal(fallback.load().ok,false);assert.equal(fallback.state.structure,null);assert.equal(fallback.state.metal,null);
 for(const name of ['investigation:created','structure:created','structure:unit-added','structure:organized','structure:representation','structure:free','structure:cleared','investigation:reset','electrons:activated','electrons:representation','properties:started','properties:changed','properties:restored','properties:ended','measurements:added','measurements:removed','measurements:cleared','calculations:added','calculations:removed','calculations:cleared'])assert.ok(events.some(e=>e.name===name),name);
 assert.ok(!events.some(e=>/bond|electron/i.test(JSON.stringify(e.detail.current?.structure||null))),'Nenhum par M—M; elétrons fora da estrutura');
 // Conversões (§15): exatas e centralizadas; o comprimento reutiliza SILM.units.
 {const K=S.calculation;assert.equal(K.convert('volume',1,'cm³'),1e-24);assert.equal(K.convert('volume',1,'m³'),1e-30);assert.equal(K.convert('volume',1000,'nm³'),1);
  assert.equal(K.convert('density',8.96,'kg/m³'),8960);assert.equal(K.convert('length',2.556,'pm'),S.units.convert(2.556,'pm'));assert.throws(()=>K.convert('volume',1,'L'));}
 // Catálogo central (§5): cada fórmula declara id, nome, expressão, aplicabilidade, entradas, unidade, referências e notas.
 for(const f of Object.values(S.formulas)){for(const k of ['id','name','expression','applicability','requiredInputs','outputUnit','references','notes'])assert.ok(k in f,f.id+': '+k);
  assert.ok(Array.isArray(f.references)&&f.references.every(id=>S.data.sources.some(x=>x.id===id)),f.id+': referência registrada');assert.ok(!/Math\.|\*\*/.test(f.expression),f.id+': expressão legível');}
 return {schemaVersion:8,measurementTypes:Object.keys(MS.types),formulas:Object.keys(S.formulas),calculations:calcSummary,structureModelVersion:2,electronModelVersion:E.modelVersion,propertiesModelVersion:1,geometry,invalidCases:invalidFree.length+invalidCrystal.length+invalidElectrons.length+invalidProperties.length+invalidMeasurements.length,migrations:['7 → 8 (cálculos vazios)','6 → 8 (medições vazias)','5 → 6 (elétrons e estrutura preservados)','4 → 6 (estrutura e representação preservadas)','3 → 6 (montagem preservada)','2 → 6','1 → 6'],
  properties:{oneActive:true,noResidualOnSwitch:true,structureUnchanged:true,restoreKeepsInvestigation:true,eligibility:{Cu:'todas qualitativas',Mn:'só elétrica',Hg:'REFERENCE_PHASE_UNSUPPORTED (sem fase sólida de referência)'},tabulatedValues:'PROPERTY_DATA_MISSING (nenhum valor típico)'},
  electrons:{requiresUnits:E.minUnits,visibilityIsRepresentation:true,markersPersisted:false,droppedBelowMinimum:true,clearedWithStructure:true,valenceConvention:'banco (QUALITATIVE)'},organize:{Cu:'FCC',Fe:'BCC',Mg:'HCP',Mn:'CRYSTAL_STRUCTURE_UNSUPPORTED'},authorshipPreserved:true,representationIsNotScience:true,returnToFree:true,undoHistoryPersisted:false};
}
if(require.main===module){try{console.log(JSON.stringify(validate(),null,2));}catch(error){console.error(error);process.exitCode=1;}}
module.exports={validate,load};
