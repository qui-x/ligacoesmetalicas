import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const ctx=vm.createContext({console});
ctx.window=ctx;
vm.runInContext(readFileSync(new URL('../domain/silm/properties.js',import.meta.url),'utf8'),ctx);
const P=ctx.SILM.properties;

test('brilho em Explorar explicita que o feixe é apenas esquema geométrico',()=>{
 const catalog=P.catalog.luster.limitation;
 assert.match(catalog,/lei geral|não exclusiva/);
 assert.match(catalog,/não calcula refletância/);
 const n=P.narrative('luster',{light:true},{drive:{angle:35}});
 assert.match(n.action,/normal de referência do diagrama/);
 assert.match(n.observation,/θᵣ = θᵢ = 35°/);
 assert.match(n.observation,/não determina quanta luz/);
 assert.doesNotMatch(n.observation,/reflete a maior parte/);
 assert.match(n.interpretation,/absorções entre bandas|resposta eletrônica/);
});

test('texto óptico sem controlador não inventa refletância específica',()=>{
 const n=P.narrative('luster',{light:true});
 assert.match(n.observation,/sem representar refletância específica/);
 assert.doesNotMatch(n.observation,/maior parte/);
 assert.match(n.interpretation,/acabamento da superfície/);
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
