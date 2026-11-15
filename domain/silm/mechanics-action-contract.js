'use strict';
window.SILM=window.SILM||{};
/*
 * Contrato de capacidades mecanicas para a futura revisao de Montagem,
 * Ver e Dados. NAO conecta botoes, nao decide prioridades definitivas,
 * nao altera rotas, Dock, estado cientifico nem controles publicados.
 * ownership/prioridade sao propostas sujeitas a homologacao de UX.
 */
SILM.mechanicsActionContract=(()=>{
 const actions=Object.freeze([
  Object.freeze({id:'mechanics.specimen.choose',label:'Escolher corpo de prova',
   proposedMenu:'montagem',priorityCandidate:1,requires:[],kind:'setup',
   gate:'existing-experience',output:'specimen-reference'}),
  Object.freeze({id:'mechanics.microstructure.generate',label:'Preparar policristal didatico',
   proposedMenu:'montagem',priorityCandidate:2,requires:['synthetic-voronoi'],
   kind:'setup',gate:'existing-experience',output:'synthetic-grain-geometry'}),
  Object.freeze({id:'mechanics.load.apply',label:'Aplicar carga de tracao ou compressao',
   proposedMenu:'ver',priorityCandidate:1,requires:['specimen','mechanics-mode'],
   kind:'action',gate:'existing-experience',output:'j2-field'}),
  Object.freeze({id:'mechanics.crystal.preview',label:'Executar ensaio policristalino hipotetico',
   proposedMenu:'ver',priorityCandidate:2,
   requires:['synthetic-voronoi','supported-crystal-structure','hypothetical-parameters'],
   kind:'action',gate:'menu-review',output:'cpfem-field'}),
  Object.freeze({id:'mechanics.field.inspect',label:'Examinar campos de deslocamento e plasticidade',
   proposedMenu:'ver',priorityCandidate:3,requires:['converged-cpfem'],
   kind:'observation',gate:'menu-review',output:'strain-and-slip-map'}),
  Object.freeze({id:'mechanics.grain.inspect',label:'Consultar resposta do grao selecionado',
   proposedMenu:'dados',priorityCandidate:2,requires:['converged-cpfem','grain-selected'],
   kind:'reading',gate:'menu-review',output:'grain-cpfem-reading'}),
  Object.freeze({id:'mechanics.provenance.inspect',label:'Consultar limites e proveniencia do ensaio',
   proposedMenu:'dados',priorityCandidate:1,requires:[],
   kind:'audit',gate:'existing-experience',output:'calibration-audit'}),
  Object.freeze({id:'mechanics.comparison.report',label:'Comparar J2 e policristal sem fundir os motores',
   proposedMenu:'dados',priorityCandidate:3,requires:['converged-cpfem'],
   kind:'report',gate:'menu-review',output:'model-comparison'})
 ]);
 const byId=Object.freeze(Object.fromEntries(actions.map(item=>[item.id,item])));
 const owns=(actionId,menu)=>!!byId[actionId]&&byId[actionId].proposedMenu===menu;
 const status=(actionId,{source='schematic',structure=null,converged=false}={})=>{
  const a=byId[actionId];
  if(!a)return Object.freeze({status:'UNKNOWN_ACTION',enabled:false});
  if(a.gate==='menu-review')return Object.freeze({status:'AWAITING_MENU_REVIEW',
   enabled:false,proposedMenu:a.proposedMenu,priorityCandidate:a.priorityCandidate});
  if(source!=='schematic'&&a.requires.includes('synthetic-voronoi'))
   return Object.freeze({status:'SOURCE_NOT_SYNTHETIC',enabled:false});
  return Object.freeze({status:'CURRENT_EXISTING_FLOW',enabled:true,
   proposedMenu:a.proposedMenu,priorityCandidate:a.priorityCandidate});
 };
 return Object.freeze({
  schema:'silm.mechanics.actions.menu-review.v1',status:'AWAITING_MENU_REVIEW',
  actions,byId,owns,statusFor:status,
  // Sem atribuir CRSS, classe de amostra ou permissao experimental ao menu.
  canPublishCPFEM:false,willChangeExistingMenus:false,
  reviewRequired:Object.freeze(['montagem','ver','dados'])
 });
})();
