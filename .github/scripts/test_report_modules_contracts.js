'use strict';
/* Regressão: o relatório de uma mesma investigação não mistura módulos. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx=vm.createContext({Object,Array,String,Number,Set,Math,Date,console});
ctx.window=ctx;
ctx.SILM={properties:{
 ids:['electrical','thermal','malleability','ductility','luster'],
 catalog:{
  electrical:{title:'Condutividade elétrica',limitation:'Modelo qualitativo'},
  thermal:{title:'Condutividade térmica',limitation:'Modelo qualitativo'},
  malleability:{title:'Maleabilidade',limitation:'Modelo qualitativo'},
  ductility:{title:'Ductilidade',limitation:'Modelo qualitativo'},
  luster:{title:'Brilho metálico',limitation:'Modelo qualitativo'}
 },
 eligibility:()=>({
  electrical:{title:'Condutividade elétrica',status:'available',data:{kind:'TABULATED',value:1,unit:'S/m'}},
  thermal:{title:'Condutividade térmica',status:'available',data:{kind:'TABULATED',value:10,unit:'W/(m K)'}},
  malleability:{title:'Maleabilidade',status:'qualitative'},
  ductility:{title:'Ductilidade',status:'qualitative'},
  luster:{title:'Brilho metálico',status:'unavailable'}
 })
}};
vm.runInContext(fs.readFileSync('domain/silm/report-modules.js','utf8'),ctx);
const R=ctx.SILM.reportModules;
const snapshot={
 module:{active:'explorar'},
 properties:{active:'electrical',electrical:{field:true}},
 measurements:[{type:'distance',value:1.25}],
 calculations:[{formulaId:'cellVolume',result:12.6}]
};
const record={activityContext:{type:'free'},checkpoint:snapshot,report:{}};
const source='domain/silm/report-modules.js';
for(const [mod,visible,hidden]of [
 ['explorar','exploration',['measurements','calculations']],
 ['medir','measurements',['exploration','calculations']],
 ['calcular','calculations',['exploration','measurements']]
]){
 snapshot.module.active=mod;
 assert.equal(R.resolve(record,{module:'explorar'}),mod,mod+' deve seguir o estado livre, não o roteiro anterior');
 assert.ok(R.has(mod,visible),mod+' deveria mostrar '+visible);
 for(const kind of hidden)assert.equal(R.has(mod,kind),false,mod+' mostra seção indevida: '+kind);
 assert.ok(R.has(mod,'conditions'));
}
snapshot.module.active='explorar';
assert.equal(R.resolve({activityContext:{type:'mission'},checkpoint:snapshot},{module:'medir'}),'medir',
 'Missão deve permanecer no módulo fixo');
assert.equal(R.resolve(record,{module:'explorar'},{module:'calcular'}),'explorar',
 'Arquivo de investigação livre usa o módulo do snapshot');
const props=R.properties(snapshot,{atomicNumber:29});
assert.equal(props.length,4,'Propriedade indisponível não deve ser oferecida');
assert.ok(props.find(p=>p.id==='electrical').active);
assert.ok(props.find(p=>p.id==='thermal').data.value===10);
assert.equal(R.context(snapshot).action,'Campo elétrico aplicado');
assert.ok(R.context(snapshot).note.includes('não é medição experimental'));
assert.equal(snapshot.measurements.length,1);
assert.equal(snapshot.calculations.length,1);
snapshot.properties.active=null;
assert.equal(R.context(snapshot),null);
const ui=fs.readFileSync('integracao/route-ui.js','utf8');
for(const section of ['exploration','measurements','calculations']){
 assert.ok(ui.includes("S.reportModules.has(reportModule,'"+section+"')"),'Filtro de '+section+' ausente');
}
assert.ok(ui.includes("doc.dataset.scientificModule=reportModule"));
assert.ok(ui.includes("reportPolicy.focus"));
assert.ok(ui.includes("group('Incluir dados',Object.entries(REPORT_DATA).filter"));
assert.ok(ui.includes("if(reportModule==='explorar')provenance.append"));
assert.ok(ui.includes("if(reportModule==='medir')provenance.append"));
assert.ok(ui.includes("if(reportModule==='calcular')provenance.append"));
const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert.ok(html.includes('src="'+source+'"'));
assert.ok(sw.includes('"'+source+'"'));
console.log('OK: relatórios exclusivos por módulo, registros científicos preservados e guiados fixos.');
