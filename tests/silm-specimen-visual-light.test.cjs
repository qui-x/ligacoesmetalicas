'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function model(){
 const context={window:{SILM:{}}};context.SILM=context.window.SILM;
 vm.runInNewContext(fs.readFileSync(path.join(root,'domain/silm/specimen-visual-light.js'),'utf8'),context);
 return context.SILM.specimenVisualLight;
}
test('sem deformação não existe sombra de intervenção',()=>{
 const v=model();assert.equal(v.projectAll().length,0);
});
test('marcas de compressão identificam local e largura da prensa',()=>{
 const v=model(),a=v.project({mode:'compression',position:.2,width:.15}),
 b=v.project({mode:'compression',position:.8,width:.6});
 assert.ok(a.shadow.x<b.shadow.x);
 assert.ok(a.shadow.rx<b.shadow.rx);
 assert.ok(a.shadow.opacity>0);
});
test('incidência de luz altera direção e deslocamento do realce',()=>{
 const v=model(),m={mode:'tension',position:.5,width:.3};
 const a=v.project(m,{incidenceDeg:5}),b=v.project(m,{incidenceDeg:75});
 assert.ok(b.shadow.x>a.shadow.x);
 assert.ok(b.highlight.x<a.highlight.x);
});
test('luz apagada reduz a contribuição direcional sem apagar a marca',()=>{
 const v=model(),m={mode:'compression',position:.4,width:.4};
 const on=v.project(m,{illuminated:true}),off=v.project(m,{illuminated:false});
 assert.ok(off.shadow.opacity<on.shadow.opacity);
 assert.ok(off.shadow.opacity>0);
});
test('plasticidade da mesma região é agrupada para evitar escurecimento cumulativo irreal',()=>{
 const v=model(),m={mode:'compression',position:.5,width:.25};
 const spots=v.projectAll({marks:[m,m,m]});
 assert.equal(spots.length,1);
 assert.ok(spots[0].shadow.opacity<=.42);
});
test('carga reversível aparece e desaparece, sem criar marca plástica',()=>{
 const v=model(),m={position:.3,width:.35};
 const on=v.projectAll({activeContact:m,mode:'compression',load:.5});
 const off=v.projectAll({activeContact:m,mode:'compression',load:0});
 assert.equal(on.length,1);assert.equal(off.length,0);
});
test('marcas inválidas são rejeitadas, com preservação de dados de versões antigas',()=>{
 const v=model();
 assert.equal(v.validMark({mode:'compression',position:-1,width:.2}),false);
 assert.equal(v.validMark({mode:'shear',position:.5,width:.2}),false);
 assert.equal(v.projectAll({marks:[null,{mode:'tension',position:.2,width:.2}]}).length,1);
 assert.equal(v.projectAll({marks:undefined}).length,0);
});
test('a iluminação é carregada antes da validação e da microestrutura, no cache offline',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),
 sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const js='domain/silm/specimen-visual-light.js';
 assert.ok(html.indexOf(js)>0&&html.indexOf(js)<html.indexOf('domain/silm/state.js'));
 assert.ok(html.indexOf(js)<html.indexOf('domain/silm/surface-micro.js'));
 assert.ok(sw.includes(js));
});
