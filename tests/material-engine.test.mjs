import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const ctx=vm.createContext({console,structuredClone});
ctx.window=ctx;
for(const path of ['data/bundle','data-api','crystal','properties','reference-conditions','material-profile-registry','data/material-profile-demo-cu','material-engine']){
 vm.runInContext(readFileSync(new URL('../domain/silm/'+path+'.js',import.meta.url),'utf8'),ctx,{filename:path+'.js'});
}
const S=ctx.SILM,ENGINE=S.materialEngine;
const close=(actual,expected,tolerance=1e-3)=>assert.ok(Math.abs(actual-expected)<=tolerance,actual+' != '+expected);

test('o motor geral atende 73 metais (8 com escopo estrutural), sem copiar o perfil de Cu',()=>{
 const metals=S.data.elements.filter(e=>e.silmEligibility.status==='available');
 assert.equal(metals.length,73);
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
 assert.equal(cap.requestedReference,'CNTP_BR_0C_1ATM');
 assert.equal(cap.conditionMatch.ok,false);
 assert.equal(cap.conditionMatch.reasonCode,'CONDITIONS_UNVERIFIED');
 assert.equal(S.materialProfiles.list().length,1);
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

test('CNTP Brasil e STP IUPAC são condições distintas, não sinônimas',()=>{
 const reference=S.referenceConditions;
 const br=reference.standards.CNTP_BR_0C_1ATM;
 const international=reference.standards.STP_IUPAC_0C_1BAR;
 assert.equal(br.temperatureK,273.15);
 assert.equal(br.pressurePa,101325);
 assert.equal(international.temperatureK,273.15);
 assert.equal(international.pressurePa,100000);
 assert.equal(reference.compare({...br,basis:br.id}).ok,true);
 assert.equal(reference.compare({...international,basis:international.id}).reasonCode,'CONDITIONS_MISMATCH');
 assert.equal(reference.compare({...br,basis:br.id},international.id).reasonCode,'CONDITIONS_MISMATCH');
 assert.equal(reference.validate({basis:'CNTP_BR_0C_1ATM',temperatureK:298.15,pressurePa:101325}).reasonCode,'CONDITIONS_STANDARD_MISMATCH');
 assert.equal(reference.validate({basis:'CNTP_BR_0C_1ATM',temperatureK:273.15,pressurePa:100000}).reasonCode,'CONDITIONS_STANDARD_MISMATCH');
 assert.equal(reference.validate('CNTP').reasonCode,'CONDITIONS_UNSTRUCTURED');
});

test('Cu experimental em temperatura ambiente não é certificado como CNTP',()=>{
 const q=ENGINE.optical(29,550,0);
 assert.equal(q.ok,true);
 assert.equal(q.conditionMatch.ok,false);
 assert.equal(q.conditionMatch.reasonCode,'CONDITIONS_UNVERIFIED');
 assert.equal(q.conditions.basis,'SOURCE_REPORTED');
 assert.equal(q.conditions.temperatureK,null);
 assert.equal(q.conditions.pressurePa,null);
 const strict=ENGINE.opticalForReference(29,550);
 assert.equal(strict.ok,false);
 assert.equal(strict.reasonCode,'CONDITIONS_UNVERIFIED');
 assert.equal(strict.requestedReference,'CNTP_BR_0C_1ATM');
 assert.equal(Object.hasOwn(strict,'reflectance'),false);
});

test('o registro recusa dados rotulados CNTP com T e P inconsistentes',()=>{
 const P=S.materialProfiles;
 const valid={basis:'CNTP_BR_0C_1ATM',temperatureK:273.15,pressurePa:101325};
 const wrong={basis:'CNTP_BR_0C_1ATM',temperatureK:273.15,pressurePa:100000};
 assert.throws(()=>P.register({atomicNumber:47,element:'Ag',properties:{
  electrical:{evidence:'TABULATED',value:1,unit:'S/m',source:{title:'Teste'},conditions:wrong}
 }}),/CONDITIONS_STANDARD_MISMATCH/);
 assert.equal(P.list().length,1);
 assert.equal(S.referenceConditions.compare(valid).ok,true);
});

test('motor geral recebe propriedades CNTP futuras sem copiar o perfil do cobre',()=>{
 // Instância isolada: valor fictício de contrato, nunca exposto à Oficina.
 const isolated=vm.createContext({console,structuredClone});isolated.window=isolated;
 for(const path of ['data/bundle','data-api','crystal','properties','reference-conditions',
                    'material-profile-registry','data/material-profile-demo-cu','material-engine'])
  vm.runInContext(readFileSync(new URL('../domain/silm/'+path+'.js',import.meta.url),'utf8'),isolated);
 const T=isolated.SILM;
 T.materialProfiles.register({atomicNumber:47,element:'Ag',
  properties:{thermal:{
   evidence:'TABULATED',value:1,unit:'unidade fictícia de teste',
   source:{title:'Fixture de teste — não é fonte científica'},
   conditions:{basis:'CNTP_BR_0C_1ATM',temperatureK:273.15,pressurePa:101325}
  }}
 });
 const silver=T.materialEngine.capability(47,'thermal');
 assert.equal(silver.ok,true);
 assert.equal(silver.mode,'reference-data');
 assert.equal(silver.tabulatedValue.value,1);
 assert.equal(silver.conditionMatch.ok,true);
 const copper=T.materialEngine.capability(29,'thermal');
 assert.notEqual(copper.tabulatedValue?.value,1);
 assert.notEqual(T.materialEngine.optical(47,550).ok,true);
});
