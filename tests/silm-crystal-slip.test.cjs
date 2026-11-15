'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function engine(){
 const c={window:{SILM:{}}};c.SILM=c.window.SILM;
 vm.runInNewContext(fs.readFileSync(path.join(root,'domain/silm/crystal-slip.js'),'utf8'),c);
 return c.SILM.crystalSlip;
}
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,a+' vs '+b);
test('12 CFC, 12 CCC e três basais + três prismáticos em HC',()=>{
 const e=engine();
 assert.equal(e.systems.FCC.length,12);
 assert.equal(e.systems.BCC.length,12);
 assert.equal(e.systems.HCP.length,6);
 for(const family of Object.values(e.systems)){
  for(const s of family){
   near(s.planeNormal.reduce((v,x,i)=>v+x*s.slipDirection[i],0),0,1e-8);
   near(Math.hypot(...s.planeNormal),1);
   near(Math.hypot(...s.slipDirection),1);
  }
 }
});
test('CFC ⟨001⟩ uniaxial: m máximo conhecido = 1/√6',()=>{
 const e=engine(),r=e.analyze({
  structure:'CFC',orientationMatrix:e.identity(),loadAxis:[0,0,1]
 });
 assert.equal(r.status,'GEOMETRY_ONLY');
 assert.equal(r.systemCount,12);
 near(r.highestSchmid,1/Math.sqrt(6));
 assert.equal(r.calibratesJ2,false);
 assert.equal(r.predictsSlipActivation,false);
});
test('rotação 90° preserva a forma cúbica e limites geométricos',()=>{
 const e=engine();
 for(const deg of [0,5,25,45,60,85,90]){
  const R=e.rotationZ(deg);
  assert.equal(e.isMatrix(R),true);
  for(const structure of ['CCC','CFC','HC']){
   const x=e.analyze({structure,orientationMatrix:R,loadAxis:[0,1,0]});
   assert.equal(x.status,'GEOMETRY_ONLY');
   assert.ok(x.highestSchmid>=0&&x.highestSchmid<=.500000001);
  }
 }
});
test('sem orientação não inventa valores: orientação explícita é obrigatória',()=>{
 const e=engine();
 assert.equal(e.analyze({structure:'FCC'}).status,'ORIENTATION_UNAVAILABLE');
 assert.equal(e.analyze({structure:'DHCP',orientationMatrix:e.identity()}).status,'UNSUPPORTED_STRUCTURE');
 assert.equal(e.analyze({structure:'FCC',orientationMatrix:e.identity(),loadAxis:[0,0,0]}).status,'INVALID_LOAD_AXIS');
});
test('matriz mal condicionada, espelhada ou refletida é rejeitada',()=>{
 const e=engine();
 assert.equal(e.isMatrix([[1,0,0],[0,1,0],[0,0,-1]]),false);
 assert.equal(e.isMatrix([[1,1,0],[0,1,0],[0,0,1]]),false);
 assert.equal(e.analyze({structure:'FCC',orientationMatrix:[[0,0,0],[0,1,0],[0,0,1]]}).status,'INVALID_ORIENTATION');
});
test('HC: basal e prismática não são somadas como se CRSS fossem iguais',()=>{
 const e=engine();
 const r=e.analyze({structure:'HC',orientationMatrix:e.rotationZ(30),loadAxis:[0,1,0]});
 assert.equal(r.families.length,2);
 assert.ok(r.families.some(x=>x.family.includes('basal')));
 assert.ok(r.families.some(x=>x.family.includes('prismático')));
 assert.ok(r.caveat.includes('CRSS'));
});
test('CCC identifica limitação não-Schmid, CFC não fornece escoamento',()=>{
 const e=engine();
 const b=e.analyze({structure:'CCC',orientationMatrix:e.identity()});
 const f=e.analyze({structure:'CFC',orientationMatrix:e.identity()});
 assert.match(b.caveat,/não-Schmid/);
 assert.match(f.caveat,/não fornece CRSS/);
 assert.equal(b.calibrated,false);
});
test('o motor novo não aciona o J2 nem altera registro de materiais',()=>{
 const e=engine();
 const r=e.analyze({structure:'FCC',orientationMatrix:e.identity(),provenance:'imported-unverified'});
 assert.equal(r.hasGrainOrientation,true);
 assert.equal(r.calibratesJ2,false);
 assert.equal(e.calibratesJ2,false);
});
test('script carrega antes da importação e está no offline',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const file='domain/silm/crystal-slip.js';
 assert.ok(html.includes(file));
 assert.ok(html.indexOf(file)<html.indexOf('domain/silm/microstructure-data.js'));
 assert.ok(html.indexOf(file)<html.indexOf('domain/silm/microstructure-view.js'));
 assert.ok(sw.includes('"'+file+'"'));
});

test('tensor uniaxial do J2 reproduz Schmid m vezes tensao relativa',()=>{
 const e=engine(),s=e.analyzeStress({structure:'CFC',
  orientationMatrix:e.identity(),
  stressTensor:[[0,0,0],[0,2,0],[0,0,0]],provenance:'demonstration'});
 assert.equal(s.status,'PROJECTED_J2_STRESS');
 near(s.maxAbsShear,2/Math.sqrt(6));
 assert.equal(s.units,'relative');
 assert.equal(s.calibratesJ2,false);
 assert.equal(s.predictsSlipActivation,false);
});
test('pressao hidrostatica gera cisalhamento resolvido nulo e inversao troca sinal',()=>{
 const e=engine(),R=e.rotationZ(25);
 const p=e.analyzeStress({structure:'CFC',orientationMatrix:R,
  stressTensor:[[3,0,0],[0,3,0],[0,0,3]]});
 near(p.maxAbsShear,0,1e-9);
 const up=e.analyzeStress({structure:'CFC',orientationMatrix:R,
  stressTensor:[[0,0,0],[0,1,0],[0,0,0]]});
 const down=e.analyzeStress({structure:'CFC',orientationMatrix:R,
  stressTensor:[[0,0,0],[0,-1,0],[0,0,0]]});
 near(up.maxAbsShear,down.maxAbsShear,1e-9);
 const u=up.families[0].signedShear,d=down.families[0].signedShear;
 near(Math.abs(u),Math.abs(d),1e-9);
});
test('tensao sem orientacao, nao simetrica ou nao finita nao cria leitura',()=>{
 const e=engine(),I=e.identity();
 assert.equal(e.analyzeStress({structure:'CFC',stressTensor:[[0,0,0],[0,1,0],[0,0,0]]}).status,'ORIENTATION_UNAVAILABLE');
 assert.equal(e.analyzeStress({structure:'CFC',orientationMatrix:I,stressTensor:[[0,1,0],[0,1,0],[0,0,0]]}).status,'STRESS_UNAVAILABLE');
 assert.equal(e.analyzeStress({structure:'CFC',orientationMatrix:I,stressTensor:[[0,0,0],[0,Infinity,0],[0,0,0]]}).status,'STRESS_UNAVAILABLE');
});
