'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function load(){const box={window:{},console,Math,Date,Uint8Array};box.window=box;vm.createContext(box);
 for(const file of ['data/bundle.js','data-api.js','state.js'])vm.runInContext(fs.readFileSync(path.join(root,'domain/silm',file),'utf8'),box,{filename:file});return box.SILM;}
function validate(){const S=load(),storage=new Map(),events=[];
 const adapter={get:(key,fallback)=>storage.has(key)?structuredClone(storage.get(key)):fallback,set:(key,value)=>{storage.set(key,structuredClone(value));return true;}};
 const m=S.createScientificState();m.connect({storage:adapter,emit:(name,detail)=>events.push({name,detail})});
 assert.equal(S.scientificSchemaVersion,2);assert.equal(S.validateScientificState(m.state).ok,true);
 for(const z of [1,6,104,118,999])assert.equal(m.begin(z),false);
 assert.equal(m.begin(29),true);const first=m.snapshot(),id=first.investigation.id;
 assert.match(id,/^inv-/);assert.equal(first.metal.symbol,'Cu');assert.equal(first.structure,null);assert.equal(first.electrons,null);
 assert.equal(first.conditions.temperature,null);assert.equal(first.measurements.length,0);assert.equal(first.calculations.length,0);
 assert.equal(m.setModule('medir'),true);assert.equal(m.setModule('illegal'),false);assert.equal(m.state.metal.atomicNumber,29);assert.equal(m.state.investigation.id,id);
 assert.equal(m.resetInvestigation(),true);assert.equal(m.state.metal.atomicNumber,29);assert.equal(m.state.investigation.id,id);
 assert.equal(m.setStatus('paused'),true);assert.equal(m.state.investigation.status,'paused');assert.equal(m.setStatus('active'),true);
 const reloaded=S.createScientificState();reloaded.connect({storage:adapter,emit:()=>{}});assert.equal(reloaded.load().ok,true);
 assert.equal(reloaded.state.metal.atomicNumber,29);assert.equal(reloaded.state.module.active,'medir');assert.equal(reloaded.state.investigation.id,id);
 assert.equal(reloaded.begin(26),true);assert.notEqual(reloaded.state.investigation.id,id);assert.equal(reloaded.state.metal.symbol,'Fe');
 const invalid=[
  v=>v.schemaVersion=999,v=>v.investigation.id='',v=>v.investigation.status='closed',v=>v.metal=[v.metal],
  v=>v.metal.atomicNumber=6,v=>v.metal.atomicNumber=104,v=>v.metal.symbol='Cu',v=>v.module.active='illegal',
  v=>v.structure={type:'CFC'},v=>v.electrons={},v=>v.measurements=[{value:3}],v=>v.conditions.temperature=25,
  v=>v.investigation.updatedAt='yesterday',v=>v.investigation.type='unknown'
 ];
 for(const mutate of invalid){const sample=structuredClone(reloaded.state);mutate(sample);assert.equal(S.validateScientificState(sample).ok,false,mutate.toString());}
 const stale=structuredClone(reloaded.state);stale.metal.atomicNumber=118;adapter.set('scientific.state',stale);
 const fallback=S.createScientificState();fallback.connect({storage:adapter,emit:()=>{}});assert.equal(fallback.load().ok,false);assert.equal(fallback.state.metal,null);
 assert.equal(fallback.restore({schemaVersion:1,metal:29}).ok,true);assert.equal(fallback.state.metal.symbol,'Cu');assert.equal(fallback.state.investigation.type,'free');
 assert.equal(fallback.restore({schemaVersion:1,metal:null}).ok,true);assert.equal(fallback.state.investigation,null);
 assert.equal(reloaded.close(),true);assert.equal(reloaded.state.investigation,null);assert.equal(reloaded.state.metal,null);
 assert.ok(events.some(e=>e.name==='investigation:created'));assert.ok(events.some(e=>e.name==='investigation:reset'));
 assert.ok(events.some(e=>e.name==='metal:changed'));assert.equal(storage.get('scientific.state').schemaVersion,2);
 return {schemaVersion:2,invalidCases:invalid.length,migration:'0.2.1 → 0.3.0',persistence:true,resetPreservesMetal:true,closeRemovesMetal:true};
}
if(require.main===module){try{console.log(JSON.stringify(validate(),null,2));}catch(error){console.error(error);process.exitCode=1;}}
module.exports={validate,load};
