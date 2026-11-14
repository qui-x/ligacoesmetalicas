'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function engine(){
 const context={window:{SILM:{}}};context.SILM=context.window.SILM;
 for(const file of [
  'domain/silm/specimen-local.js',
  'domain/silm/specimen-visual-light.js',
  'domain/silm/specimen-relief.js'
 ])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context);
 return context.SILM.specimenRelief;
}
const mark=(mode='compression',position=.2,width=.25)=>({mode,position,width});
test('sem contato não cria deformação residual nem sombra artificial',()=>{
 const e=engine();
 assert.equal(e.residual([], .2,.2).dy,0);
 assert.equal(e.shadeAt({marks:[],u:.2,v:.2}).dark,0);
 assert.equal(e.shadeAt({marks:[],u:.2,v:.2}).light,0);
});
test('o mesmo passo plástico altera mais a região carregada do que a região distante',()=>{
 const e=engine(),marks=[mark()];
 const near=e.residual(marks,.2,0),far=e.residual(marks,.8,0);
 assert.ok(Math.abs(near.dy)>Math.abs(far.dy)*4,
  'A deformação permanente ainda está uniforme, não localizada.');
 assert.ok(near.dy>0);
});
test('a posição escolhida transporta a deformação plástica residual',()=>{
 const e=engine();
 const left=e.residual([mark('compression',.2)],.2,0).dy;
 const right=e.residual([mark('compression',.8)],.2,0).dy;
 assert.ok(left>right+.01);
});
test('tração e compressão mantêm sinais verticais distintos após retirada da carga',()=>{
 const e=engine();
 const press=e.residual([mark('compression',.5)],.5,0);
 const pull=e.residual([mark('tension',.5)],.5,0);
 assert.ok(press.dy>0&&pull.dy<0);
});
test('realce e sombra mudam ao girar a fonte sem modificar material',()=>{
 const e=engine(),marks=[mark()];
 const low=e.shadeAt({marks,u:.35,v:.18,incidenceDeg:10,illuminated:true});
 const high=e.shadeAt({marks,u:.35,v:.18,incidenceDeg:75,illuminated:true});
 assert.ok(Math.abs(low.dark-high.dark)+Math.abs(low.light-high.light)>.05);
 assert.equal(low.illustrative,true);
});
test('as sombras continuam visíveis sob luz ambiente e aumentam com luz incidente',()=>{
 const e=engine(),marks=[mark()];
 const ambient=e.shadeAt({marks,u:.35,v:.18,illuminated:false});
 const lamp=e.shadeAt({marks,u:.35,v:.18,illuminated:true});
 assert.ok(ambient.dark>.05);
 assert.ok(lamp.dark>ambient.dark);
});
test('a carga elástica tem pista visual transitória sem criar deformação permanente',()=>{
 const e=engine(),active={...mark('compression',.5),load:.7};
 const under=e.shadeAt({marks:[],active,u:.67,v:.18});
 const unloaded=e.shadeAt({marks:[],active:null,u:.67,v:.18});
 assert.ok(under.dark+under.light>.03);
 assert.equal(unloaded.dark+unloaded.light,0);
});
test('muitos passos didáticos ficam limitados para evitar auto-interseções extremas',()=>{
 const e=engine(),marks=Array.from({length:16},()=>mark('compression',.5,.2));
 const p=e.residual(marks,.5,0);
 assert.ok(Number.isFinite(p.dy)&&Math.abs(p.dy)<=.10);
 assert.equal(e.group(marks)[0].count,8);
});
test('shader da mesma cena é carregado antes de microestrutura e preservado offline',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const file='domain/silm/specimen-relief.js';
 assert.ok(html.includes(file)&&html.indexOf(file)<html.indexOf('domain/silm/microstructure-view.js'));
 assert.ok(sw.includes(file));
});
