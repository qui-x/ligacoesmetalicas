'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../domain/silm/microstructure-data.js'),'utf8'),sandbox);
const data=sandbox.window.SILM.microstructureData;
const sample=()=>({
 schema:'silm.microstructure-map.v1',id:'fixture-cu-001',title:'Geometria sintética (somente teste)',
 materialAtomicNumber:29,material:'Cobre de teste (não é amostra real)',
 sourceKind:'literature-image',
 source:{citation:'Fixture sintético, sem uso científico',url:'https://example.org/synthetic-fixture',
  acquisitionMethod:'Simulação geométrica (somente teste)'},
 image:{widthPx:100,heightPx:80,micrometersPerPixel:.5,
  calibrationReference:'Calibração fictícia exclusiva do teste'},
 segmentation:{method:'Polígonos manuais sintéticos, somente teste'},
 grains:[{id:'g1',vertices:[[10,10],[30,10],[30,20],[10,20]]}]
});
test('Contrato v1: área calibrada e diâmetro equivalente vêm somente dos vértices',()=>{
 const output=data.validate(sample(),29);
 assert.equal(output.ok,true,output.error);
 assert.equal(output.data.validationStatus,'unverified-import');
 assert.equal(output.data.grains.length,1);
 assert.equal(output.data.grains[0].areaPixels2,200);
 assert.equal(output.data.grains[0].areaMicrometers2,50);
 assert.ok(Math.abs(output.data.grains[0].equivalentCircleDiameterMicrometers-7.978846)<1e-5);
 assert.equal(output.data.grains[0].id,'g1');
 assert.ok(!Object.hasOwn(output.data.grains[0],'composition'));
 assert.ok(!Object.hasOwn(output.data.grains[0],'areaFraction'));
});
test('Sem calibração, não há medidas físicas',()=>{
 const input=sample();delete input.image.micrometersPerPixel;delete input.image.calibrationReference;
 const output=data.validate(input,29);
 assert.equal(output.ok,true);
 assert.equal(output.data.grains[0].areaPixels2,200);
 assert.equal(output.data.grains[0].areaMicrometers2,null);
 assert.equal(output.data.grains[0].equivalentCircleDiameterMicrometers,null);
});
test('Origem, escala e metal de referência obrigatórios',()=>{
 const invalids=[
  a=>a.schema='v0',a=>a.materialAtomicNumber=26,
  a=>delete a.source.url,a=>a.source.url='javascript:alert(1)',
  a=>a.image.micrometersPerPixel=-4,a=>delete a.image.calibrationReference,
  a=>a.sourceKind='schematic',a=>a.segmentation.method='',
 ];
 for(const makeInvalid of invalids){
  const a=sample();makeInvalid(a);
  assert.equal(data.validate(a,29).ok,false,JSON.stringify(a));
 }
});
test('Identidades exclusivas, vértices válidos e áreas não degeneradas',()=>{
 const badCases=[
  a=>a.grains.push({...a.grains[0]}),
  a=>a.grains[0].vertices=[[10,10],[20,20],[30,30]],
  a=>a.grains[0].vertices=[[10,10],[120,10],[30,20]],
  a=>a.grains[0].vertices=[[10,10],[NaN,10],[30,20]],
  a=>a.grains=[],
 ];
 for(const change of badCases){const a=sample();change(a);assert.equal(data.validate(a,29).ok,false);}
});
test('Geometria sem efeito de câmera ou janela',()=>{
 const area=data.grainArea([[0,0],[40,0],[40,20],[0,20]]);
 assert.equal(area,800);
 assert.equal(data.eqCircleDiameter(0),0);
 assert.ok(data.eqCircleDiameter(area)>31);
});
