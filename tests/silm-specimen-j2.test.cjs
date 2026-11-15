'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function engine(){
 const ctx={window:{SILM:{}}};ctx.SILM=ctx.window.SILM;
 for(const file of ['domain/silm/specimen-visual-light.js','domain/silm/specimen-j2.js'])
  vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
 return ctx.SILM.specimenJ2;
}
const mark=(mode='compression',position=.5,width=.3)=>({mode,position,width});
const near=(a,b,tol=1e-6)=>assert.ok(Math.abs(a-b)<tol, a+' != '+b);
test('o estado sem carga não desloca, plasticiza nem cria tensões artificiais',()=>{
 const j=engine(),f=j.history([]);
 assert.ok(f.converged);near(f.maxAlpha,0);
 near(f.sample(.5,.25).dx,0);near(f.sample(.5,.25).dy,0);
 near(f.samplePlastic(.5,.25),0);
 assert.equal(f.kind,'incremental-j2-plane-strain-normalized');
 assert.equal(f.calibrated,false);
});
test('retorno J2 corrige a tensão equivalente e conserva traço plástico nulo',()=>{
 const j=engine(),old={p:Float64Array.from([0,0,0,0]),alpha:0};
 const z=j.material([0,.12,.19],old);
 assert.equal(z.yielded,true);
 near(z.eq,j.MATERIAL.yieldStress+j.MATERIAL.hardening*z.state.alpha,1e-8);
 near(z.state.p[0]+z.state.p[1]+z.state.p[2],0,1e-8);
 assert.ok(z.state.alpha>0);
});
test('no regime subcrítico a resposta é elástica',()=>{
 const j=engine(),z=j.material([0,.003,0],{p:Float64Array.from([0,0,0,0]),alpha:0});
 assert.equal(z.yielded,false);near(z.state.alpha,0);
 const f=j.active([],{mode:'compression',load:.10});
 assert.ok(f.converged);
 near(f.maxAlpha,0);
});
test('a prensa concentra tensão e plasticidade, enquanto a base fica apoiada',()=>{
 const j=engine(),f=j.active([],{mode:'compression',position:.5,width:.3,load:.9});
 assert.ok(f.converged,'A malha J2 não atingiu equilíbrio');
 assert.ok(f.residual<.00009);
 assert.ok(f.maxAlpha>.001);
 near(f.sample(.5,1).dy,0);
 assert.ok(f.sample(.5,0).dy>.04);
 assert.ok(Number.isFinite(f.samplePlastic(.5,.2)));
});
test('descarregamento libera o contato e preserva deformação plástica residual',()=>{
 const j=engine(),m=mark();
 const under=j.active([m],{mode:'compression',load:.8});
 const unloaded=j.history([m]);
 assert.ok(under.converged&&unloaded.converged);
 assert.ok(unloaded.maxAlpha>.001);
 assert.ok(Math.abs(unloaded.sample(.5,0).dy)>.0003);
 near(unloaded.sample(.5,1).dy,0);
 assert.equal(unloaded.cycles,1);
});
test('tração tem deslocamento vertical de sinal oposto à compressão',()=>{
 const j=engine();
 const press=j.active([],{mode:'compression',position:.5,load:.75});
 const traction=j.active([],{mode:'tension',position:.5,load:.75});
 assert.ok(press.converged&&traction.converged);
 assert.ok(press.sample(.5,0).dy>0);
 assert.ok(traction.sample(.5,0).dy<0);
});
test('o local de aplicação muda a distribuição espacial de plasticidade',()=>{
 const j=engine();
 const left=j.history([mark('compression',.2,.2)]);
 const right=j.history([mark('compression',.8,.2)]);
 assert.ok(left.converged&&right.converged);
 const a=left.sample(.2,0).dy,b=right.sample(.2,0).dy;
 assert.ok(Math.abs(a-b)>.001,'Campo residual insensível ao contato');
 assert.ok(left.maxAlpha>0&&right.maxAlpha>0);
});
test('o histórico suporta carga reversa sem perder plasticidade acumulada',()=>{
 const j=engine(),one=j.history([mark()]);
 const two=j.history([mark(),mark('tension',.8,.2)]);
 assert.ok(one.converged&&two.converged);
 assert.equal(two.cycles,2);
 assert.ok(two.maxAlpha>=one.maxAlpha-1e-8);
 assert.ok(Number.isFinite(two.sample(.7,.7).dy));
});
test('caches preservam estados, não mudam a amostra original nem refazem a mesma solução',()=>{
 const j=engine(),m=mark('compression',.2,.2);
 const a=j.history([m]),b=j.history([m]);
 assert.equal(a,b);
 const c=j.active([m],{mode:'compression',position:.5,width:.3,load:.6});
 const d=j.active([m],{mode:'compression',position:.5,width:.3,load:.6});
 assert.equal(c,d);
 assert.notEqual(a,c);
 assert.equal(a.calibrated,false);
});
test('sem parametrização homologada não emite MPa, GPa ou identidade metal-específica',()=>{
 const j=engine(),r=j.history([mark()]);
 assert.equal(j.MATERIAL.calibrated,false);
 assert.equal(j.MATERIAL.units,'relative');
 assert.equal(r.calibrated,false);
 assert.equal('stressMPa' in r,false);
});
test('o HTML inclui o solucionador antes da microestrutura e cache offline',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),
  sw=fs.readFileSync(path.join(root,'sw.js'),'utf8'),
  file='domain/silm/specimen-j2.js';
 assert.ok(html.indexOf(file)>0);
 assert.ok(html.indexOf(file)<html.indexOf('domain/silm/microstructure-view.js'));
 assert.ok(sw.includes(file));
});
