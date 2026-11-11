import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const context=vm.createContext({console});
context.window=context;
for(const path of ['optical-observation','drive'])
 vm.runInContext(readFileSync(new URL('../domain/silm/'+path+'.js',import.meta.url),'utf8'),context,{filename:path+'.js'});
const O=context.SILM.opticalObservation,D=context.SILM.drive;

test('posição do observador altera apenas o destaque geométrico qualitativo',()=>{
 const aligned=O.observe({illuminated:true,incidenceDeg:35,observerDeg:35});
 assert.equal(aligned.appearance,'aligned');
 assert.equal(aligned.reflectionDeg,35);
 assert.equal(aligned.differenceDeg,0);
 assert.equal(Object.hasOwn(aligned,'reflectance'),false);
 assert.match(aligned.limitation,/não são medições de refletância/);
 const near=O.observe({illuminated:true,incidenceDeg:35,observerDeg:47});
 const away=O.observe({illuminated:true,incidenceDeg:35,observerDeg:80});
 assert.equal(near.appearance,'near');
 assert.equal(away.appearance,'away');
 assert.equal(near.reflectionDeg,35);
 assert.equal(away.reflectionDeg,35);
 assert.equal(O.observe({illuminated:false,incidenceDeg:35,observerDeg:35}).appearance,'off');
});

test('acabamento fosco espalha destaque sem números ou falsa cor de metal',()=>{
 const matte=O.observe({illuminated:true,incidenceDeg:35,observerDeg:80,finish:'matte'});
 assert.equal(matte.appearance,'diffuse');
 assert.match(matte.description,/sem valores medidos/);
 assert.equal(Object.hasOwn(matte,'color'),false);
 assert.equal(Object.hasOwn(matte,'roughness'),false);
 assert.equal(Object.hasOwn(matte,'intensity'),false);
 assert.equal(O.observe({finish:'mirrored'}),null);
 assert.equal(O.observe({incidenceDeg:-2}),null);
 assert.equal(O.observe({observerDeg:Infinity}),null);
});

test('lanterna, observador e raios são transitórios: não mudam a investigação',()=>{
 const original={investigation:{id:'exp-01'},properties:{active:'luster',startedAt:10,luster:{light:true}}};
 const model={get state(){return original;}},baseline=JSON.stringify(original);
 const drive=D.controller(model),events=[];
 const unsub=drive.subscribe(()=>events.push(drive.reading().observerAngle));
 assert.equal(drive.angle,35);
 assert.equal(drive.observerAngle,35);
 assert.equal(drive.finish,'polished');
 assert.equal(drive.rays,false);
 assert.equal(drive.setObserverAngle(80),true);
 assert.equal(drive.setAngle(65),true);
 assert.equal(drive.setFinish('matte'),true);
 assert.equal(drive.setRays(true),true);
 assert.equal(drive.setObserverAngle(-3),true);
 assert.equal(drive.observerAngle,0);
 assert.equal(drive.setObserverAngle(Infinity),false);
 assert.equal(drive.setFinish('bogus'),false);
 assert.equal(events.length,5);
 assert.equal(JSON.stringify(original),baseline);
 unsub();
});
