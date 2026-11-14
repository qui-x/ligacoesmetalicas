'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function fem(){
 const box={window:{SILM:{}}};box.SILM=box.window.SILM;
 vm.runInNewContext(fs.readFileSync(path.join(root,'domain/silm/specimen-local.js'),'utf8'),box);
 return box.SILM.specimenLocal;
}
test('prensa centrada: deslocamento vertical positivo no contato e zero no apoio',()=>{
 const solver=fem().solve({mode:'compression',position:.5,width:.3});
 assert.ok(solver.converged);
 assert.ok(solver.sample(.5,0).dy>.05);
 assert.ok(Math.abs(solver.sample(.5,1).dy)<1e-9);
 assert.ok(Math.abs(solver.sample(.5,.5).dy)<Math.abs(solver.sample(.5,0).dy));
});
test('garras de tração: deslocamento vertical oposto e base apoiada',()=>{
 const solver=fem().solve({mode:'tension',position:.5,width:.3});
 assert.ok(solver.converged);
 assert.ok(solver.sample(.5,0).dy<-.05);
 assert.ok(Math.abs(solver.sample(.5,1).dy)<1e-9);
});
test('mover local de contato modifica campo da própria amostra',()=>{
 const a=fem().solve({mode:'compression',position:.2,width:.18});
 const b=fem().solve({mode:'compression',position:.8,width:.18});
 assert.ok(a.converged&&b.converged);
 assert.ok(Math.abs(a.sample(.3,.3).dy-b.sample(.3,.3).dy)>.002);
 assert.ok(Math.abs(a.sample(.8,.3).dy-b.sample(.8,.3).dy)>.002);
});
test('aumentar área de contato altera distribuição sem alterar a condição de apoio',()=>{
 const e=fem(),a=e.solve({width:.14}),b=e.solve({width:.6});
 assert.notEqual(a.contactNodes,b.contactNodes);
 assert.notEqual(a.sample(.1,.25).dy,b.sample(.1,.25).dy);
 assert.equal(a.sample(.5,1).dy,0);
 assert.equal(b.sample(.5,1).dy,0);
});
test('sem carga não há deformação elástica e com carga parcial escala linearmente',()=>{
 const q=fem().solve({mode:'compression',position:.25});
 const p=q.sample(.35,.4,.5),full=q.sample(.35,.4,1),none=q.sample(.35,.4,0);
 assert.equal(none.dx,0);assert.equal(none.dy,0);
 assert.ok(Math.abs(p.dy*2-full.dy)<1e-10);
});
test('falha com valores inválidos, mas região extrema permanece dentro da malha',()=>{
 const e=fem();
 assert.throws(()=>e.solve({mode:'cut'}));
 assert.throws(()=>e.solve({poisson:.7}),RangeError);
 assert.throws(()=>e.solve({position:NaN}),TypeError);
 const q=e.solve({position:.01,width:.08});
 assert.ok(q.contactNodes>=1&&Number.isFinite(q.sample(.2,.5).dx));
});
test('solver em cache reutiliza campo para posição quantizada',()=>{
 const e=fem(),a=e.field({position:.501}),b=e.field({position:.502});
 assert.equal(a,b);assert.ok(a.converged);
});
test('HTML carrega modelo antes da microestrutura',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const fem=html.indexOf('domain/silm/specimen-local.js');
 const micro=html.indexOf('domain/silm/microstructure-view.js');
 assert.ok(fem>=0&&fem<micro);
});
