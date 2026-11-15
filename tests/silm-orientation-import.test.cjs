'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function module(){
 const w={SILM:{}},ctx={window:w,SILM:w.SILM};
 for(const p of ['domain/silm/crystal-slip.js','domain/silm/microstructure-data.js'])
  vm.runInNewContext(fs.readFileSync(path.join(root,p),'utf8'),ctx);
 return w.SILM.microstructureData;
}
const copy=o=>JSON.parse(JSON.stringify(o));
const base=()=>({
 schema:'silm.microstructure-map.v1',id:'fe-ebsd-001',
 title:'Grãos segmentados',materialAtomicNumber:26,material:'Fe ensaiado',
 sourceKind:'experimental-image',
 source:{citation:'Exemplo de arquivo com método documentado',
  url:'https://example.org/material',acquisitionMethod:'EBSD'},
 image:{widthPx:200,heightPx:200,micrometersPerPixel:null},
 segmentation:{method:'Contorno EBSD'},grains:[
  {id:'A',vertices:[[0,0],[70,0],[70,70],[0,70]]},
  {id:'B',vertices:[[100,100],[190,100],[190,190],[100,190]]}
 ]
});
const header=()=>({
 convention:'crystal-to-specimen-matrix',phaseStructure:'BCC',
 method:'EBSD',sourceURL:'https://example.org/ebsd',
 frame:{x:'RD',y:'TD',z:'ND',imageX:'RD',imageY:'TD'},
 status:'declared-unverified'
});
const matrix=()=>[[1,0,0],[0,1,0],[0,0,1]];
test('v1 legado sem EBSD continua importável, sem atribuir orientação',()=>{
 const r=module().validate(base(),26);
 assert.equal(r.ok,true);
 assert.equal(r.data.orientation,null);
 assert.equal(r.data.grains[0].orientationMatrix,null);
});
test('v1 admite matrizes explícitas de uma amostra, sem homologá-las',()=>{
 const raw=base();raw.orientation=header();
 raw.grains[0].orientationMatrix=matrix();
 const r=module().validate(raw,26);
 assert.equal(r.ok,true,r.error);
 assert.equal(r.data.orientation.phaseStructure,'BCC');
 assert.equal(r.data.orientation.calibrationApproved,false);
 assert.equal(r.data.grains[0].orientationStatus,'declared-unverified');
 assert.equal(r.data.grains[1].orientationMatrix,null);
 assert.equal(Object.isFrozen(r.data.grains[0].orientationMatrix),true);
});
test('não aceitar orientação clandestina sem fonte/convenção',()=>{
 const raw=base();raw.grains[0].orientationMatrix=matrix();
 const r=module().validate(raw,26);
 assert.equal(r.ok,false);assert.match(r.error,/metadados/);
});
test('não aceitar matriz refletida ou não ortogonal',()=>{
 for(const bad of [
  [[1,0,0],[0,1,0],[0,0,-1]],
  [[1,.1,0],[0,1,0],[0,0,1]]
 ]){
  const raw=base();raw.orientation=header();raw.grains[0].orientationMatrix=bad;
  const r=module().validate(raw,26);
  assert.equal(r.ok,false);assert.match(r.error,/Matriz de orientação inválida/);
 }
});
test('os eixos do mapa devem corresponder aos eixos da amostra',()=>{
 const raw=base();raw.orientation=header();raw.orientation.frame.imageX='ND';
 raw.grains[0].orientationMatrix=matrix();
 const r=module().validate(raw,26);
 assert.equal(r.ok,false);assert.match(r.error,/eixos da imagem compatíveis/);
});
test('não autorizar homologação autodeclarada',()=>{
 const raw=base();raw.orientation=header();raw.orientation.status='approved';
 raw.grains[0].orientationMatrix=matrix();
 const r=module().validate(raw,26);
 assert.equal(r.ok,false);assert.match(r.error,/autodeclarada/);
});
test('não aceitar fase fora CCC CFC HC nem orientação sem grãos indexados',()=>{
 const m=module();
 const x=base();x.orientation=header();x.orientation.phaseStructure='DHCP';x.grains[0].orientationMatrix=matrix();
 assert.equal(m.validate(x,26).ok,false);
 const y=base();y.orientation=header();assert.equal(m.validate(y,26).ok,false);
});
test('importação pertence ao metal selecionado sem converter liga em metal puro',()=>{
 const raw=base();raw.orientation=header();raw.grains[0].orientationMatrix=matrix();
 assert.equal(module().validate(raw,29).ok,false);
});
