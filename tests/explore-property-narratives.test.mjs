import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const ctx=vm.createContext({console});
ctx.window=ctx;
vm.runInContext(readFileSync(new URL('../domain/silm/optical-observation.js',import.meta.url),'utf8'),ctx);
vm.runInContext(readFileSync(new URL('../domain/silm/properties.js',import.meta.url),'utf8'),ctx);
const P=ctx.SILM.properties;

test('brilho em Explorar explica a superfície e o observador sem prever cor',()=>{
 const catalog=P.catalog.luster.limitation;
 assert.match(catalog,/ilustração qualitativa/);
 assert.match(catalog,/CNTP não verificada/);
 assert.match(catalog,/θr = θi/);
 const n=P.narrative('luster',{light:true},{drive:{
  angle:35,observerAngle:35,finish:'polished'}});
 assert.match(n.action,/observador a 35°/);
 assert.match(n.observation,/direção especular/);
 assert.match(n.interpretation,/não são medições/);
 assert.doesNotMatch(n.observation,/reflete a maior parte/);
 const shifted=P.narrative('luster',{light:true},{drive:{
  angle:35,observerAngle:80,finish:'polished'}});
 assert.match(shifted.observation,/afastado da direção especular/);
 const rough=P.narrative('luster',{light:true},{drive:{
  angle:35,observerAngle:80,finish:'matte'}});
 assert.match(rough.observation,/espalhamento ilustrado/);
});

test('sem luz ou controlador não há brilho fictício',()=>{
 const unlit=P.narrative('luster',{light:false},{drive:{angle:35}});
 assert.match(unlit.observation,/Lanterna apagada/);
 const n=P.narrative('luster',{light:true});
 assert.match(n.observation,/qualitativamente/);
 assert.doesNotMatch(n.observation,/maior parte/);
 assert.match(n.interpretation,/não fornece valores numéricos/);
});

test('texto térmico segue a dissipação ambiental do motor, sem conservação fictícia',()=>{
 assert.match(P.catalog.thermal.limitation,/troca simplificada com o ambiente/);
 const heating=P.narrative('thermal',{heating:true,stage:0},{thermal:{on:true,full:false,mean:.2,uniform:false}});
 assert.match(heating.interpretation,/perda simplificada para o ambiente/);
 const cooling=P.narrative('thermal',{heating:false,stage:0},{thermal:{on:false,full:false,mean:.2,uniform:false}});
 assert.match(cooling.observation,/transferida ao ambiente/);
 assert.doesNotMatch(cooling.observation,/energia total se conserva/);
 const uniform=P.narrative('thermal',{heating:false,stage:0},{thermal:{on:false,full:false,mean:.2,uniform:true}});
 assert.match(uniform.observation,/retornando à temperatura ambiente/);
});

test('esclarecer limites não adiciona parâmetro óptico ou estado científico não homologado',()=>{
 const fresh=P.fresh();
 assert.deepEqual(Object.keys(fresh.luster),['light']);
 assert.equal(fresh.luster.light,false);
 assert.deepEqual([...P.ids],['electrical','thermal','malleability','ductility','luster']);
});
