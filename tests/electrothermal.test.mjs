import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const ctx=vm.createContext({console,structuredClone});ctx.window=ctx;
for(const name of ['data/bundle','data-api','crystal','ready-assemblies','electrothermal'])
 vm.runInContext(readFileSync(new URL('../domain/silm/'+name+'.js',import.meta.url),'utf8'),ctx);
const S=ctx.SILM,ET=S.electrothermal;
const controls={mode:'voltage',level:1,boundary:'insulated',external:false};
const chain={sites:['a','b','c'].map(key=>({key})),byKey:new Map([['a',0],['b',1],['c',2]]),
 edges:[{a:0,b:1,weight:1},{a:1,b:2,weight:1}],fraction:[0,.5,1],inside:[1],terminal:[0,-1,1],source:1};
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol, a+' / '+b);
test('dois resistores em série, potência nos terminais e calor em cada sítio',()=>{
 const r=ET.createRun(chain),s=r.observe(controls,true);
 close(s.profiles.potential.get('c')-s.profiles.potential.get('a'),1);close([...s.profiles.dissipation.values()].reduce((a,b)=>a+b,0),s.power);close(s.current,.5);close(s.power,.5);close(s.resistance,2);
 assert.ok(r.advance(controls,.01));close(r.temperatureAt('a'),.00125);close(r.temperatureAt('b'),.0025);close(r.temperatureAt('c'),.00125);
 close(r.observe(controls).time,.01);assert.equal(r.temperatureAt('fora'),undefined);
});
test('retroalimentação tem sentidos distintos para tensão e corrente impostas',()=>{
 for(const mode of ['current','voltage']){
  const r=ET.createRun(chain),c={...controls,mode},cold=r.observe(c);
  assert.ok(r.advance(c,1));const hot=r.observe(c);
  assert.ok(hot.resistance>cold.resistance);
  if(mode==='voltage'){close(hot.voltage,cold.voltage);assert.ok(hot.power<cold.power);}
  else{close(hot.current,cold.current);assert.ok(hot.power>cold.power);}
  close(hot.voltage*hot.current,hot.power);
 }
});
test('fonte externa aquece sem corrente e o contorno determina a perda',()=>{
 const r=ET.createRun(chain),external={...controls,level:0,external:true};
 assert.ok(r.advance(external,1));close(r.observe(external).power,0);close(r.observe(external).mean*3,.25);
 assert.ok(r.advance({...external,external:false},1));close(r.observe(external).mean*3,.25);
 assert.ok(r.advance({...external,external:false,boundary:'ambient'},1));assert.ok(r.observe(external).mean*3<.25);close(r.temperatureAt('a'),0);
 const s=r.observe(external);close(s.storedEnergy,s.jouleEnergy+s.externalEnergy-s.removedEnergy);assert.ok(s.removedEnergy>0);
});
test('intervalos inválidos preservam completamente a amostra',()=>{
 const r=ET.createRun(chain),before=r.observe(controls);
 for(const c of [{...controls,level:NaN},{...controls,boundary:'erro'},{...controls,external:1}])assert.equal(r.advance(c,1),false);
 assert.equal(r.advance(controls,3),false);assert.deepEqual(r.observe(controls),before);
});
for(const ref of S.readyAssemblies.list())test('rede de '+ref.element.symbol+' usa vizinhos reais ou mantém o estudo indisponível',()=>{
 const g=S.crystal.geometry(ref.element),net=ET.buildNetwork(g);
 const supported=['Cu','Fe','Mg','Sn','Po','Am'].includes(ref.element.symbol);
 assert.equal(!!net,supported,ref.title);if(!supported)return;
 const r=ET.createRun(net);assert.ok(r);assert.ok(r.advance(controls,.15));
 const obs=r.observe(controls);close(obs.power,obs.voltage*obs.current);assert.ok(obs.maximum>0);
 assert.equal(r.field().size,net.sites.length);assert.ok(r.field().has(g.cell[0].key));
});
