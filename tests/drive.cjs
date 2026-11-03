'use strict';
/* P3, P4 e deformação + corrente (docs/PLANO-PROPRIEDADES-METALICAS.md): invariantes dos controles transitórios.
   - Intensidade do campo (P3): limitada a 5 %–100 %, arredondada; a deriva média cresce com a intensidade (v ∝ E).
   - Lanterna (P4): ângulo limitado a 5°–80°; lei da reflexão θr = θi.
   - Deformação + corrente: mais defeitos → mais espalhamento e menos deriva; sem defeitos, nada muda.
   - Nada disso é gravado: o controlador não escreve no estado, e uma experiência nova desliga o campo da deformação. */
const assert=require('node:assert/strict');
const S=require('../scripts/validate-scientific-state.cjs').load(),DR=S.drive;
assert.ok(DR,'SILM.drive exportado');
// Lei da reflexão.
for(const t of [5,20,35,55,80]){const r=DR.reflect(t);assert.equal(r.reflection,r.incidence,'θr = θi');assert.equal(r.incidence,t);}
assert.equal(DR.reflect(-10).incidence,0);assert.equal(DR.reflect(120).incidence,89,'Ângulo limitado abaixo de 90°');
// Controlador sobre um modelo mínimo (o estado é lido, nunca escrito).
let state={investigation:{id:'a'},properties:{active:'electrical',startedAt:'t1'}};const writes=[];
const model={get state(){return JSON.parse(JSON.stringify(state));},dispatch(){writes.push('dispatch');}};
const c=DR.controller(model);assert.equal(DR.controller(model),c,'Um controlador por modelo');
let calls=0;const off=c.subscribe(()=>calls++);
assert.equal(c.intensity,.6);assert.equal(c.angle,35);assert.equal(c.deformField,false);
assert.equal(c.setIntensity(2),true);assert.equal(c.intensity,1,'Intensidade até 100 %');
c.setIntensity(0);assert.equal(c.intensity,DR.MIN_INTENSITY,'Intensidade mínima de 5 % (campo aplicado nunca é nulo)');
c.setIntensity(.437);assert.equal(c.intensity,.44,'Arredondada a 1 %');assert.equal(c.setIntensity(.44),false,'Sem mudança, sem aviso');
c.setAngle(0);assert.equal(c.angle,DR.MIN_ANGLE);c.setAngle(90);assert.equal(c.angle,DR.MAX_ANGLE);c.setAngle(41.6);assert.equal(c.angle,42);
c.sync();c.setDeformField(true);assert.equal(c.deformField,true);c.sync();assert.equal(c.deformField,true,'Mesma experiência: o campo continua');
state={...state,properties:{active:'malleability',startedAt:'t2'}};c.sync();assert.equal(c.deformField,false,'Experiência nova: campo da deformação desligado');
assert.equal(c.intensity,.44,'A intensidade escolhida continua');assert.ok(calls>=6,'Cada mudança avisa a vista');off();
assert.deepEqual(writes,[],'Nada é gravado no estado');
// Transporte eletrônico: intensidade e defeitos.
{const vm=require('node:vm'),fs=require('node:fs');const box={window:{SILM:S},SILM:S,Math};vm.createContext(box);vm.runInContext(fs.readFileSync(__dirname+'/../domain/silm/electron-view.js','utf8'),box);
 const ET=S.electronTransport;let pv=-1,ps=0,pd=Infinity;
 for(let i=0;i<=1.0001;i+=.05){const v=ET.drive(i);assert.ok(v>pv,'A deriva cresce com a intensidade');pv=v;}
 assert.equal(ET.drive(1),1);assert.equal(ET.drive(2),1,'Intensidade limitada a 100 %');
 assert.ok(Math.abs(ET.drive(.5)/ET.drive(1)-.5)<1e-12,'Deriva proporcional à intensidade (v ∝ E)');
 for(let d=0;d<=1.0001;d+=.25){const sc=ET.defectScatter(d),dr=ET.defectDrift(d);assert.ok(sc>=ps&&dr<=pd,'Mais defeitos: mais espalhamento, menos deriva');ps=sc;pd=dr;}
 assert.equal(ET.defectScatter(0),1);assert.equal(ET.defectDrift(0),1,'Sem deslizamentos, o movimento é o de antes');
 assert.ok(ET.defectDrift(1)>0,'A corrente continua com defeitos (metal deformado ainda conduz)');
 assert.ok(ET.defectDrift(1)>ET.drift(1),'Efeito dos defeitos menor que o do calor máximo (didático)');}
console.log('PASS drive: intensidade do campo limitada a 5 %–100 % com deriva proporcional (v ∝ E); lanterna de 5° a 80° com θr = θi; deformação + corrente com mais espalhamento e menos deriva conforme os deslizamentos; nada gravado no estado e campo da deformação desligado em experiência nova.');
