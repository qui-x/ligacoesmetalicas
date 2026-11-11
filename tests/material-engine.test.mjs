import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const ctx=vm.createContext({console,structuredClone});
ctx.window=ctx;
for(const path of ['data/bundle','data-api','crystal','properties','data/material-profile-demo-cu','material-engine']){
 vm.runInContext(readFileSync(new URL('../domain/silm/'+path+'.js',import.meta.url),'utf8'),ctx,{filename:path+'.js'});
}
const S=ctx.SILM,ENGINE=S.materialEngine;
const close=(actual,expected,tolerance=1e-3)=>assert.ok(Math.abs(actual-expected)<=tolerance,actual+' != '+expected);

test('o motor geral atende todos os 65 metais, sem copiar o perfil de Cu',()=>{
 const metals=S.data.elements.filter(e=>e.silmEligibility.status==='available');
 assert.equal(metals.length,65);
 for(const el of metals){
  for(const property of ENGINE.propertyIds){
   const cap=ENGINE.capability(el.atomicNumber,property);
   assert.equal(cap.atomicNumber,el.atomicNumber);
   assert.equal(cap.property,property);
   assert.ok(['qualitative','reference-data',undefined].includes(cap.mode));
   if(el.atomicNumber!==29&&property==='luster'){
    // Alguns dos 65 metais são investigáveis na Oficina, mas não habilitados
    // para esta experiência específica (fase, estrutura etc.). Não forçar
    // disponibilidade nem dados do Cu sobre um metal inelegível.
    assert.notEqual(cap.mode,'reference-data',el.symbol);
    const result=ENGINE.optical(el.atomicNumber,550);
    assert.equal(result.ok,false,el.symbol);
    assert.equal(result.reasonCode,
     cap.ok?'OPTICAL_DATA_NOT_HOMOLOGATED':cap.reasonCode,el.symbol);
   }
  }
 }
 assert.equal(ENGINE.capability(1,'luster').reasonCode,'METAL_UNAVAILABLE');
 assert.equal(ENGINE.capability(29,'not-a-property').reasonCode,'PROPERTY_UNKNOWN');
});

test('um perfil óptico demonstrativo valida somente o cobre',()=>{
 const cap=ENGINE.capability(29,'luster');
 assert.equal(cap.ok,true);
 assert.equal(cap.mode,'reference-data');
 assert.equal(cap.dataKind,'TABULATED_NK');
 assert.equal(cap.source.doi,'10.1103/PhysRevB.6.4370');
 assert.equal(Object.keys(S.materialPropertyProfiles.byAtomicNumber).length,1);
 const q=ENGINE.optical(29,550,0);
 assert.equal(q.ok,true);assert.equal(q.source.doi,cap.source.doi);
 assert.equal(q.assumptions.includes('sem filme de óxido'),true);
 assert.ok(q.reflectance>0&&q.reflectance<1);
});

test('Fresnel oblíquo coincide com refletância normal no limite θ=0',()=>{
 for(const nm of [450,500,550,600,650,700]){
  const v=ENGINE.optical(29,nm,0);
  assert.equal(v.ok,true);
  const R=((v.n-1)**2+v.k*v.k)/((v.n+1)**2+v.k*v.k);
  close(v.reflectance,R,1e-10);
 }
 // Resultados exemplificativos da fonte original Johnson & Christy (1972).
 close(ENGINE.optical(29,450).reflectance,.53826,.001);
 close(ENGINE.optical(29,550).reflectance,.62351,.001);
 close(ENGINE.optical(29,650).reflectance,.93522,.001);
 const tilted=ENGINE.optical(29,550,70);
 assert.equal(tilted.ok,true);
 assert.ok(tilted.reflectance>=0&&tilted.reflectance<=1);
});

test('fora da faixa ou com entrada inválida não há extrapolação',()=>{
 for(const nm of [100,3000]){
  const res=ENGINE.optical(29,nm,0);
  assert.equal(res.ok,false);
  assert.equal(res.reasonCode,'SPECTRAL_OUT_OF_RANGE');
 }
 for(const angle of [-1,89,Infinity]){
  const res=ENGINE.optical(29,550,angle);
  assert.equal(res.ok,false);
  assert.equal(res.reasonCode,'INVALID_OPTICAL_INPUT');
 }
 assert.equal(ENGINE.optical(29,Number.NaN).reasonCode,'INVALID_OPTICAL_INPUT');
});
