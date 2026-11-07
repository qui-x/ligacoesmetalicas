'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const shared={};const sandbox={window:{SILM:shared},SILM:shared};
vm.runInNewContext(read('domain/silm/metal-atlas.js'),sandbox);
vm.runInNewContext(read('domain/silm/microstructure-appearance.js'),sandbox);
vm.runInNewContext(read('domain/silm/microstructure-study-context.js'),sandbox);
const atlas=shared.metalAtlas,appearance=shared.microstructureAppearance,context=shared.microstructureStudies;

test('65 elementos recebem paleta com natureza da evidência explicitada',()=>{
 assert.equal(atlas.entries.length,65);
 assert.equal(appearance.count,65);
 assert.equal(context.atomicNumbers.length,65);
 for(const element of atlas.entries){
  const a=appearance.get(element.atomicNumber);
  assert.ok(a,element.symbol);
  assert.equal(a.symbol,element.symbol);
  assert.match(a.label,/./);assert.match(a.warning,/./);
  assert.match(a.source,/^https:\/\//);
  for(const key of ['light','mid','dark','edge'])assert.match(a[key],/^#[0-9a-fA-F]{6}$/);
  assert.ok(['documented-native','symbolic-mineral','symbolic-neutral'].includes(a.basis));
  assert.ok(!Object.hasOwn(a,'compositionPercent'));
  assert.ok(!Object.hasOwn(a,'grainSizeMicrometers'));
 }
});
test('somente cores dos metais nativos Cu, Au e Ag se apresentam como nativas',()=>{
 for(const [z,symbol] of [[29,'Cu'],[79,'Au'],[47,'Ag']]){
  const rec=appearance.get(z);assert.equal(rec.symbol,symbol);
  assert.equal(rec.basis,'documented-native');
 }
 for(const element of atlas.entries){
  const a=appearance.get(element.atomicNumber);
  if(![29,79,47].includes(element.atomicNumber))assert.notEqual(a.basis,'documented-native');
 }
 assert.equal(appearance.get(26).basis,'symbolic-mineral');
 assert.equal(appearance.get(26).paletteKey,'iron-ore');
});
test('a explicação é científica e objetiva, sem a frase de contexto da conversa',()=>{
 const html=read('index.html'),view=read('domain/silm/microstructure-view.js'),styles=read('domain/silm/workshop.css');
 assert.ok(!view.includes('Não é bem assim'));
 assert.ok(!view.includes('mas é como podemos nos aproximar'));
 assert.ok(view.includes('Grãos e tons ilustrativos; sem composição, fração de fase ou tamanho medidos.'));
 assert.ok(view.includes('linearGradient'));
 assert.ok(view.includes('appearance.warning')||view.includes('palette.warning'));
 assert.match(view,/dataset\.appearancePalette/);
 assert.ok(styles.includes('silm-micro-highlight'));
 assert.ok(html.includes('domain/silm/microstructure-appearance.js'));
 assert.ok(html.includes('domain/silm/microstructure-study-context.js'));
 const sw=read('sw.js');
 assert.ok(sw.includes('"domain/silm/microstructure-appearance.js"'));
});
