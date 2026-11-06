'use strict';
/* Contrato de visualização experimental sem inferência de composição local.
   Executar: node tests/microstructure-experimental-source.test.cjs */
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const {runInNewContext}=require('node:vm');
class Node {
 constructor(tag){this.tag=tag;this.children=[];this.listeners={};this.attributes={};this.dataset={};this.style={};this.hidden=false;
  this.textContent='';this.className='';this.classList={toggle:()=>{},add:()=>{}};}
 append(...x){this.children.push(...x)}
 replaceChildren(...x){this.children=x}
 setAttribute(k,v){this.attributes[k]=String(v)}
 addEventListener(k,fn){this.listeners[k]=fn}
}
const document={createElement:t=>new Node(t),createElementNS:(_ns,t)=>new Node(t)};
const window={SILM:{}},SILM=window.SILM;
const root=join(__dirname,'..');
for(const file of ['domain/silm/microstructure-experimental.js','domain/silm/workshop.js'])
 runInNewContext(readFileSync(join(root,file),'utf8'),{document,window,SILM},{filename:file});
assert.equal(SILM.workshop.valid(),true);
const item=SILM.workshop.list(37).find(r=>r.id==='rubidio-alsi');
assert.ok(item,'O rubídio precisa apresentar uma referência experimental pesquisável.');
assert.equal(item.microSampleId,'al-si-rb-alloy3-metals-2023-1398');
const sample=SILM.experimentalMicrostructure.samples[item.microSampleId];
assert.ok(sample,'Registro da fonte não carregado.');
const viewer=SILM.experimentalMicrostructure.create({sampleId:item.microSampleId});
const walk=n=>[n,...n.children.flatMap(walk)];
const nodes=walk(viewer),buttons=nodes.filter(n=>n.tag==='button');
const figures=buttons.filter(n=>n.attributes['aria-label']?.startsWith('Visualizar '));
const image=nodes.find(n=>n.tag==='img'),warning=nodes.find(n=>n.className==='silm-experiment-warning');
const fallback=nodes.find(n=>n.className==='silm-experiment-fallback');
const source=nodes.find(n=>n.className==='silm-experiment-source'&&n.tag==='a'&&n.textContent.includes('DOI'));
assert.equal(figures.length,3,'Figuras 2, 3a-b e 3c-d devem estar acessíveis.');
assert.match(image.src,/g002\.png$/);
assert.match(warning.textContent,/não é possível selecionar um grão real/);
assert.match(warning.textContent,/não é uma barra de escala/);
assert.ok(source.href.startsWith('https://www.mdpi.com/'));
figures[1].listeners.click();
assert.match(image.src,/g003a\.png$/);
assert.equal(figures[1].attributes['aria-pressed'],'true');
figures[2].listeners.click();
assert.match(image.src,/g003b\.png$/);
image.listeners.error();
assert.equal(image.hidden,true);
assert.equal(fallback.hidden,false,'O erro de carregamento precisa ter acesso à fonte original.');
const metadata=JSON.parse(readFileSync(join(root,'docs/atlas-microestruturas-amostras-curadas.json'),'utf8')).samples[0];
assert.equal(metadata.display.calibrated,false);
assert.equal(metadata.display.regionSelection,false);
assert.equal(metadata.microstructure.scale.micrometersPerPixel,null);
assert.equal(metadata.display.publicationPreview,true);
assert.equal(metadata.source.license,'Creative Commons Attribution 4.0 (CC BY 4.0)');
console.log('OK — Al–Si–Rb: fonte, figura experimental, fallback e bloqueio de falsa escala/composição.');
