'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),S=require('../scripts/validate-scientific-state.cjs').load(),box=vm.createContext({SILM:S,Date,JSON,Object});
for(const f of ['routes','missions','themes','route-session'])vm.runInContext(fs.readFileSync('domain/silm/'+f+'.js','utf8'),box);
assert.equal(S.missions.registry.length,6);assert.equal(S.themes.registry.length,7);assert.equal(S.themes.validate().ok,true);
for(const mutate of [x=>x[0].id=x[1].id,x=>x[0].relatedRoutes=['missing'],x=>x[0].relatedMissions=['missing'],x=>x[0].sources=['missing']]){const items=JSON.parse(JSON.stringify(S.themes.registry));mutate(items);assert.equal(S.themes.validate(items).ok,false);}
const missions=JSON.parse(JSON.stringify(S.missions.registry));missions[0].relatedThemes=['missing'];assert.equal(S.themes.validate(S.themes.registry,missions).ok,false);
const m=S.createScientificState(),memory=new Map(),storage={get:(k,d)=>memory.get(k)||d,set:(k,v)=>{memory.set(k,JSON.parse(JSON.stringify(v)));return true;}},args={model:m,storage,view:()=>({}),onView(){},say(){}};
m.begin(29);m.beginAssembly();m.addUnit();const original=JSON.stringify(m.snapshot());let session=S.createRouteSession(args);
assert.equal(session.start('montagem-ordem',29),true);assert.equal(session.context().type,'mission');assert.equal(session.ready(),false);assert.equal(session.complete().ok,false);m.organize();session.observe(true);assert.equal(session.ready(),true);session.complete();assert.equal(session.context().status,'completed');session.close();assert.equal(JSON.stringify(m.snapshot()),original);
session.start('montagem-ordem',29);assert.equal(session.ready(),false);session.close();assert.equal(session.snapshot().completed['montagem-ordem'],1);assert.ok(session.snapshot().attempts['montagem-ordem']);
let saved=memory.get('route.session');saved.score=900;saved.archives['montagem-ordem'].xp=900;memory.set('route.session',saved);session=S.createRouteSession(args);session.load();assert.equal(session.snapshot().score,undefined);assert.equal(session.snapshot().archives['montagem-ordem'].xp,undefined);
console.log('PASS: seis missões, sete temas, referências, contexto único, critérios científicos, refazer, restauração e remoção de recompensas persistidas.');
