'use strict';
window.SILM=window.SILM||{};
/* Política de apresentação do relatório por módulo.
   Não modifica o estado científico: registros de outros módulos continuam
   no snapshot e no Caderno, mas não são apresentados fora do seu contexto. */
(()=>{
 const modules=Object.freeze({
  explorar:Object.freeze({label:'Explorar',focus:'Estrutura, elétrons e propriedades metálicas',sections:Object.freeze(['conditions','exploration'])}),
  medir:Object.freeze({label:'Medir',focus:'Instrumentos e medições do modelo',sections:Object.freeze(['conditions','measurements'])}),
  calcular:Object.freeze({label:'Calcular',focus:'Fórmulas, entradas e resultados derivados',sections:Object.freeze(['conditions','calculations'])})
 });
 const known=id=>Object.hasOwn(modules,id);
 function resolve(record,route,archive){
  const state=record?.checkpoint?.module?.active;
  // Investigação livre usa o módulo do snapshot, inclusive no Caderno.
  if(record?.activityContext?.type==='free')return known(state)?state:'explorar';
  // Atividades guiadas possuem módulo fixo, preservado pelo próprio roteiro.
  const guided=archive?.module||route?.module||state;
  return known(guided)?guided:known(state)?state:'explorar';
 }
 const has=(module,section)=>!!modules[module]?.sections.includes(section);
 function properties(state,element){
  const P=SILM.properties,eligibility=P.eligibility(element),active=state.properties?.active;
  return P.ids.filter(id=>eligibility[id]?.status!=='unavailable').map(id=>{
   const item=eligibility[id];
   return {id,title:item.title,status:item.status,
    active:active===id,
    data:item.data||null,
    params:active===id?state.properties[id]:null,
    limitation:P.catalog[id]?.limitation||null};
  });
 }
 function context(state){
  const p=state.properties,active=p?.active;
  if(!active||!SILM.properties.ids.includes(active))return null;
  const v=p[active]||{};
  const actions={
   electrical:v.field?'Campo elétrico aplicado':'Campo elétrico não aplicado',
   thermal:v.heating?'Fonte de calor ligada':'Fonte de calor desligada',
   malleability:v.compression?'Compressão: etapa '+v.compression:'Nenhuma compressão aplicada',
   ductility:v.elongation?'Tração: etapa '+v.elongation:'Nenhuma tração aplicada',
   luster:v.light?'Superfície iluminada':'Luz desligada'
  };
  return {id:active,title:SILM.properties.catalog[active].title,action:actions[active],
   note:'Estado atual da representação didática; não é medição experimental nem histórico de experiências encerradas.'};
 }
 SILM.reportModules=Object.freeze({modules,resolve,has,properties,context});
})();
