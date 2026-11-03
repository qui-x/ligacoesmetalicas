'use strict';
/* F1 — contrato de compatibilidade das APIs científicas existentes.
   Congela responsabilidades e assinaturas públicas sem alterar equações nem exigir DOM. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const S=require('../scripts/validate-scientific-state.cjs').load();

function methods(target,names,label){
 for(const name of names)assert.equal(typeof target?.[name],'function',label+'.'+name+' deve ser função pública');
}
function values(target,names,label){
 for(const name of names)assert.ok(name in target,label+'.'+name+' deve existir');
}

// Estado científico: versão e módulos permanecem independentes dos motores.
assert.equal(S.scientificSchemaVersion,8,'F1 não deve migrar o schema científico');
assert.deepEqual(Array.from(S.scientificModules),['explorar','medir','calcular']);
methods(S,['createScientificState','validateScientificState','emptyScientificState'],'SILM');
const model=S.createScientificState();
assert.equal(model.state.schemaVersion,8);
methods(model,['snapshot','connect','begin','setModule','startProperty','restoreProperty','endProperty','addMeasurement','addCalculation'],'ScientificState');

// Dados: consulta e fonte são resolvidas, sem cálculo ou mutação do banco.
methods(S.data,['get','source','sourceIds','structure','search'],'data-api');
const copper=S.data.get(29);
assert.equal(copper.symbol,'Cu');
const sourceIds=S.data.sourceIds(copper);
assert.ok(sourceIds.length>0);
assert.ok(sourceIds.every(id=>S.data.source(id)),'Toda fonte usada precisa ser resolvível');

// Geometria: núcleo puro, sem obrigação de relógio ou renderer.
methods(S.crystal,['eligibility','geometry','key','parseOperation','expandSites','matchesBasis'],'crystal');
const geometry=S.crystal.geometry(copper);
assert.ok(geometry);
assert.equal(typeof geometry.lattice,'function');
assert.equal(typeof geometry.neighbors,'function');
assert.equal(typeof geometry.site,'function');
const geometrySignature=()=>JSON.stringify({
 model:geometry.model.id,
 cell:geometry.cell.map(site=>S.crystal.key(site)),
 vectors:geometry.vectors.map(vector=>vector.map(value=>Number(value.toFixed(10))))
});
assert.equal(geometrySignature(),geometrySignature(),'A assinatura geométrica deve ser determinística');

// Térmico: função de passo pura e controlador dinâmico separados.
methods(S.thermal,['graph','step','spread','sum','level','controller'],'thermal');
const edges=[[1],[0,2],[1]],initial=Float64Array.from([1,0,0]);
const thermalA=S.thermal.step(initial,edges,null);
const thermalB=S.thermal.step(initial,edges,null);
assert.deepEqual(Array.from(thermalA),Array.from(thermalB),'O mesmo estado e entrada devem produzir o mesmo passo');
assert.equal(S.thermal.D,.45);
assert.equal(S.thermal.DT,1/120);

// Mecânico: sistema geométrico e transformação não dependem da camada de desenho.
methods(S.deformation,['system','transform','staticTransform','steps','controller','describe'],'deformation');
const slip=S.deformation.system(geometry);
assert.ok(slip,'Cobre FCC deve possuir o sistema representativo atual');
assert.equal(typeof S.deformation.transform(slip,{progress:S.deformation.steps(0)}),'function');

// Estímulo: controlador, não solver físico nem proprietário do estado científico.
methods(S.drive,['controller','reflect'],'drive');
const driveModel={get state(){return {investigation:{id:'inv-contract-test'},properties:{active:'electrical',startedAt:'2026-11-03T00:00:00.000Z'}};}};
const drive=S.drive.controller(driveModel);
methods(drive,['subscribe','sync','setIntensity','setAngle','setDeformField','reading'],'drive.controller');
assert.equal(S.drive.controller(driveModel),drive,'Um controlador por modelo');
assert.equal(drive.reading().intensity,.6);

// Renderer de elétrons: exporta renderer e representação qualitativa, não serviço de corrente física.
const box={window:{SILM:S},SILM:S,Math,Float64Array,Uint32Array};
vm.createContext(box);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../domain/silm/electron-view.js'),'utf8'),box,{filename:'electron-view.js'});
methods(S,['createElectronLayer','createElectronControls'],'electron-view');
methods(S.electronTransport,['scatter','drift','defectScatter','defectDrift','drive'],'electronTransport');
assert.equal(S.electronTransport.scatter(0),1);
assert.equal(S.electronTransport.drift(0),1);

// Catálogo: IDs das cinco experiências permanecem estáveis; narrativa e elegibilidade não executam a física.
values(S.properties,['ids','defaults','limits','catalog','reasons','eligibility','narrative','fresh'],'properties');
assert.deepEqual(Array.from(S.properties.ids),['electrical','thermal','malleability','ductility','luster']);
for(const id of S.properties.ids){
 assert.equal(S.properties.catalog[id].id,id);
 assert.ok(S.properties.defaults[id]);
}

// Medir e Calcular são serviços independentes, puros e com contratos próprios.
methods(S.measurement,['compute','context','current','validate','siteRef','fractional'],'measurement');
values(S.measurement,['types','limit'],'measurement');
methods(S.calculation,['compute','validate','applicable','effective','effectiveFormula','convert','context','current'],'calculation');
values(S,['formulas','constants'],'calculations');

// Os controladores dinâmicos expõem estado transitório e listeners sem inserir um loop obrigatório nos serviços puros.
const thermalModel={get state(){return {investigation:{id:'inv-contract-test'},metal:{atomicNumber:29},structure:{mode:'crystalline'},properties:{active:'thermal',startedAt:'2026-11-03T00:00:00.000Z',thermal:{heating:false}}};}};
const thermal=S.thermal.controller(thermalModel);
methods(thermal,['subscribe','sync','setGraph','setPinned','setSource','reset','setHeating','temperature','temperatures','reading'],'thermal.controller');
const mechanicalModel={get state(){return {investigation:{id:'inv-contract-test'},metal:{atomicNumber:29},structure:{mode:'crystalline'},properties:{active:null}};}};
const mechanical=S.deformation.controller(mechanicalModel);
methods(mechanical,['subscribe','sync','setLoad','pulse','transform','reading'],'deformation.controller');

console.log('PASS engine-contracts: estado schema 8; APIs de dados/geometria/motores/controladores/renderer/catálogo/Medir/Calcular presentes; geometria e passo térmico determinísticos; classes e responsabilidades preservadas.');
