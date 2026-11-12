'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('domain/silm/report-property-history.js','utf8');
const ctx={SILM:{properties:{
 ids:['electrical','thermal','malleability','ductility','luster'],
 catalog:Object.fromEntries(['electrical','thermal','malleability','ductility','luster'].map(x=>[x,{title:x}]))
}}};ctx.window=ctx;vm.runInNewContext(code,ctx,{filename:'report-property-history.js'});
const H=ctx.SILM.reportPropertyHistory;
const docs=new Map(),storage={get:(k,fallback)=>docs.has(k)?JSON.parse(JSON.stringify(docs.get(k))):fallback,
 set:(k,v)=>{docs.set(k,JSON.parse(JSON.stringify(v)));return true;}};
const id='inv-123456789abcde',metal=29;
const make=(active=null,params={},module='explorar',ident=id)=>({
 investigation:{id:ident},metal:{atomicNumber:metal},module:{active:module},
 properties:{active,electrical:{field:false},thermal:{heating:false,stage:0},
  malleability:{compression:0},ductility:{elongation:0},luster:{light:false},...params}
});
const base=make(),started=make('electrical');
assert.equal(H.capture(storage,'properties:started',base,started),true);
let h=H.read(storage,id,metal);
assert.equal(h.events.length,1);assert.equal(h.events[0].kind,'iniciada');
assert.equal(h.events[0].property,'electrical');assert.equal(h.events[0].parameters.field,false);
const field=make('electrical',{electrical:{field:true}});
assert.equal(H.capture(storage,'properties:changed',started,field),true);
h=H.read(storage,id,metal);
assert.equal(h.events.length,2);
assert.match(h.events[1].summary,/Campo elétrico aplicado/);
assert.ok(H.valid(h,id,metal));
const luster=make('luster');
H.capture(storage,'properties:started',field,luster);
const light=make('luster',{luster:{light:true}});
H.capture(storage,'properties:changed',luster,light);
const restored=make('luster');
H.capture(storage,'properties:restored',light,restored);
H.capture(storage,'properties:ended',restored,make());
h=H.read(storage,id,metal);
assert.deepEqual(Array.from(new Set(h.events.map(x=>x.property))),['electrical','luster']);
assert.equal(h.events.at(-1).kind,'encerrada');
assert.equal(h.events.at(-1).property,'luster');
assert.equal(h.events.at(-1).parameters.light,false);
assert.ok(h.events.every(x=>Number.isFinite(Date.parse(x.at))));
assert.ok(h.events.every(x=>!x.summary.includes('resultado experimental')));
const before=JSON.stringify(h);
const otherModule=make('thermal',{thermal:{heating:true,stage:1}},'medir');
assert.equal(H.capture(storage,'properties:changed',restored,otherModule),true);
assert.equal(JSON.stringify(H.read(storage,id,metal)),before,'Fora do Explorar não registra propriedades');
assert.equal(H.capture(storage,'measurements:added',restored,otherModule),true);
assert.equal(JSON.stringify(H.read(storage,id,metal)),before);
assert.equal(H.read(storage,'inv-abcdef012345678',29).events.length,0);
assert.equal(H.read(storage,id,30),null,'Não cruzar metais');
assert.equal(H.valid({...h,events:[{...h.events[0],property:'fake'}]},id,metal),false);
assert.equal(H.valid({...h,events:[{...h.events[0],summary:'',kind:'alterada'}]},id,metal),false);
const failing={get:storage.get,set:()=>false};
assert.equal(H.capture(failing,'properties:started',base,started),false);
assert.equal(JSON.stringify(H.read(storage,id,metal)),before);
// O limite de retenção evita explosão de armazenamento quando o aluno aciona
// muitas vezes o botão, sem perder o último estado registrado.
let prev=make();
for(let i=0;i<100;i++){
 const curr=make('thermal');
 assert.equal(H.capture(storage,'properties:started',prev,curr),true);
 assert.equal(H.capture(storage,'properties:ended',curr,make()),true);
}
h=H.read(storage,id,metal);
assert.equal(h.events.length,H.limit);
assert.ok(h.discarded>0);
assert.ok(H.valid(h,id,metal));
assert.equal(h.events.at(-1).kind,'encerrada');
for(const path of ['index.html','sw.js']){
 const s=fs.readFileSync(path,'utf8');
 assert.ok(s.includes('domain/silm/report-property-history.js'),path+' não inclui o histórico offline');
}
const adapter=fs.readFileSync('integracao/adapter.js','utf8');
assert.match(adapter,/reportPropertyHistory\.capture\(storage,detail\.change,detail\.previous,detail\.current\)/);
const persistent=fs.readFileSync('integracao/durable-storage.js','utf8');
assert.match(persistent,/property-history/);
const ui=fs.readFileSync('integracao/route-ui.js','utf8');
assert.match(ui,/dataReport|Ações registradas no módulo Explorar/);
const unified=fs.readFileSync('integracao/unified-ui.js','utf8');
assert.match(unified,/propertyHistory:|\{propertyHistory\}/);
assert.match(unified,/reportPropertyHistory\.valid/);
console.log('OK: histórico científico por metal/investigação, retenção limitada, rollback, backup e escopo Explorar.');
