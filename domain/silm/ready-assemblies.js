'use strict';
window.SILM=window.SILM||{};
/* Montagens prontas (Etapa 9 da paridade SIAB × SILM): configurações rápidas da Oficina.
   - O padrão da tela vem do SIAB 1.0.0 (cartão com objetivo, o que vai na oficina, passos e recursos); o conteúdo é do SILM:
     as três montagens são as que o SILM já tinha (configuração "presets" da 0.x), uma por modelo canônico (CFC, CCC, HC).
   - Nenhum dado é escrito aqui: metal, estrutura, condição de referência e fonte vêm do banco científico no momento de
     mostrar e de aplicar. Se o metal deixar de ser elegível, ou se a estrutura registrada não for mais a esperada, a
     montagem fica indisponível com o motivo (nunca troca de metal nem de estrutura).
   - Aplicar = iniciar a investigação do metal, montar e organizar segundo a estrutura de referência do banco. */
(()=>{
 const S=SILM;
 const CATALOG=Object.freeze([
  {id:'cobre-cfc',title:'Cobre · CFC',atomicNumber:29,expectedType:'FCC',module:'explorar',
   objective:'Comece pela estrutura cúbica de face centrada do cobre.',
   steps:['Observe a célula unitária e a vizinhança de um centro.','Meça a distância entre vizinhos mais próximos.'],
   resources:['Célula e Rede','Mostrar vizinhos','Medir: distância']},
  {id:'ferro-ccc',title:'Ferro · CCC',atomicNumber:26,expectedType:'BCC',module:'explorar',
   objective:'Comece pela estrutura cúbica de corpo centrado do ferro α.',
   steps:['Compare a coordenação com a do cobre.','Calcule o fator de empacotamento.'],
   resources:['Mostrar vizinhos','Medir: coordenação','Calcular: fator de empacotamento']},
  {id:'magnesio-hc',title:'Magnésio · HC',atomicNumber:12,expectedType:'HCP',module:'explorar',
   objective:'Comece pela estrutura hexagonal compacta do magnésio.',
   steps:['Meça os parâmetros a e c.','Calcule a razão c/a e compare com o valor ideal.'],
   resources:['Medir: parâmetro de rede','Calcular: razão c/a']}
 ].map(x=>Object.freeze({...x,steps:Object.freeze(x.steps),resources:Object.freeze(x.resources)})));
 const REASONS=Object.freeze({
  METAL_UNAVAILABLE:'O metal desta montagem não está disponível para investigação no banco do SILM.',
  STRUCTURE_UNAVAILABLE:'A estrutura de referência deste metal não está disponível para visualização no SILM.',
  STRUCTURE_CHANGED:'A estrutura de referência registrada para este metal não é mais a desta montagem; ela fica indisponível até ser revista.'
 });
 /* Estado de cada montagem a partir do banco (nunca gravado). */
 function describe(item,data=S.data){
  const e=data.get(item.atomicNumber),fail=code=>({...item,element:e||null,available:false,reasonCode:code,reason:REASONS[code]});
  if(!e||e.silmEligibility?.status!=='available')return fail('METAL_UNAVAILABLE');
  const el=S.crystal.eligibility(e);if(el.status!=='available')return fail('STRUCTURE_UNAVAILABLE');
  if(el.structureType!==item.expectedType)return fail('STRUCTURE_CHANGED');
  const ref=el.reference,g=S.crystal.geometry(e),source=data.source(ref.sourceId);
  return {...item,element:e,available:true,reasonCode:null,reason:null,structureLabel:S.crystal.label(el.structureType,e),
   temperature:ref.conditions.temperature.display,sourceTitle:source?.title||ref.sourceId,cellSites:g.model.cellSites};
 }
 const list=(data=S.data)=>CATALOG.map(x=>describe(x,data));
 const get=id=>CATALOG.find(x=>x.id===id)||null;
 S.readyAssemblies=Object.freeze({catalog:CATALOG,reasons:REASONS,describe,list,get});
})();
