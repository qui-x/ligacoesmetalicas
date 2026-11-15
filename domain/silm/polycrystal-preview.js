'use strict';
window.SILM=window.SILM||{};
/*
 * Adaptador de pre-visualizacao TECNICA CPFEM: removivel de sua montagem.
 * Sem registrar controles em Montagem/Ver/Dados; a revisao de prioridades
 * definira seu destino. O opt-in por query so funciona neste ramo de prova.
 * Nao escreve no scientificState; J2 permanece o solver principal.
 */
SILM.polycrystalPreview=(()=>{
 const n=(tag,cls='',text='')=>{
  const el=document.createElement(tag);
  if(cls)el.className=cls;if(text)el.textContent=text;
  return el;
 };
 const fmt=x=>Number(x||0).toFixed(4).replace('.',',');
 function mount({container,getSynthetic,getStructure,getMode,getContact,onChange}={}){
  if(!container||typeof getSynthetic!=='function'||typeof getStructure!=='function'||
   typeof getMode!=='function'||typeof getContact!=='function'||typeof onChange!=='function')
   throw new TypeError('Adaptador CPFEM requer contexto, sem assumir controle do menu');
  const details=n('details','silm-micro-cpfem-preview');
  details.append(n('summary','','Prévia técnica do policristal · ramo de desenvolvimento'));
  details.append(n('p','silm-micro-cpfem-limit',
   'Acesso temporário para revisão de Montagem, Ver e Dados. Grãos sintéticos e orientações hipotéticas; FEM 2D em pequenas deformações, sem parâmetros experimentais do metal.'));
  const row=n('div','silm-micro-cpfem-actions');
  const loadLabel=n('label','','Carga relativa da prévia (0–100%)');
  const load=n('input','silm-micro-cpfem-load');load.type='range';load.min='10';load.max='100';
  load.step='5';load.value='70';load.setAttribute('aria-label','Deslocamento prescrito relativo do ensaio de policristal hipotético');
  const value=n('output','silm-micro-cpfem-load-value','70%');
  load.addEventListener('input',()=>{value.textContent=load.value+'%';invalidateIfSolved('Alteração da carga: recalcule o ensaio CPFEM.');});
  loadLabel.append(load,value);
  const unloadLabel=n('label','silm-micro-cpfem-unload-label');
  const unload=n('input','silm-micro-cpfem-unload');unload.type='checkbox';
  unload.setAttribute('aria-label','Executar descarregamento após a aplicação da carga');
  unloadLabel.append(unload,n('span','','Descarregar após o ensaio'));
  unload.addEventListener('change',()=>invalidateIfSolved('Alteração do descarregamento: recalcule o ensaio CPFEM.'));
  const run=n('button','silm-workshop-micro-control silm-micro-cpfem-run','Calcular prévia CPFEM');
  run.type='button';run.setAttribute('aria-label','Calcular equilíbrio dos grãos sintéticos na prévia CPFEM');
  const showLabel=n('label','silm-micro-cpfem-show-label');
  const show=n('input','silm-micro-cpfem-show');show.type='checkbox';show.disabled=true;
  show.setAttribute('aria-label','Sobrepor deslocamentos do policristal hipotético à microestrutura');
  showLabel.append(show,n('span','','Mostrar campo na microestrutura'));
  row.append(loadLabel,unloadLabel,run,showLabel);
  const status=n('output','silm-micro-cpfem-status',
   'Nenhum ensaio calculado. Esta prévia não representa o metal da investigação.');
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const grainReading=n('output','silm-micro-cpfem-grain',
   'Selecione um grão para ler a resposta após o cálculo.');
  grainReading.setAttribute('aria-label','Leitura relativa do grão sintético no modelo CPFEM');
  details.append(row,status,grainReading);
  container.append(details);
  let result=null,selected=-1,mode=null,configuration=null,destroyed=false,working=false;
  const currentField=()=>{
   if(destroyed||!show.checked||!result?.converged||!configuration)return null;
   const contact=getContact();
   return getSynthetic()===configuration.synthetic&&
    getStructure()===configuration.structure&&getMode()===configuration.mode&&
    contact?.position===configuration.position&&contact?.width===configuration.width&&
    Number(load.value)===configuration.load&&unload.checked===configuration.unload?result:null;
  };
  function renderGrain(){
   if(!result){grainReading.textContent='Selecione um grão para ler a resposta após o cálculo.';return;}
   if(selected<0||selected>=result.grains.length){
    grainReading.textContent='Selecione um grão do mapa para consultar os pontos de integração.';return;
   }
   const g=result.grains[selected];
   grainReading.textContent=g.integrationPoints?
    'Grão sintético '+g.grainId+' · '+g.integrationPoints+' ponto(s) de integração · '+
    'deslizamento médio '+fmt(g.meanAccumulatedSlip)+
    ' · máximo '+fmt(g.maxAccumulatedSlip)+
    ' · regiões plastificadas '+g.plasticIntegrationPoints+'/'+g.integrationPoints+
    '. Não é medição nem plasticidade EBSD.':
    'Grão sintético '+g.grainId+' sem ponto de integração nesta malha: nenhum resultado plástico atribuído.';
  }
  function invalidate(message='Prévia inválida após mudança da formação ou origem dos grãos.'){
   result=null;mode=null;configuration=null;show.checked=false;show.disabled=true;
   status.textContent=message;renderGrain();onChange();
  }
  function invalidateIfSolved(message){
   if(result||show.checked)invalidate(message);
  }
  run.addEventListener('click',()=>{
   if(working)return;
   const synthetic=getSynthetic(),structure=getStructure(),study=getMode(),contact=getContact();
   if(!synthetic||!structure||!['compression','tension'].includes(study)||
    !contact||![contact.position,contact.width].every(Number.isFinite)){
    invalidate('Prévia indisponível: exige formação sintética, estrutura suportada e ensaio mecânico ativo.');
    return;
   }
   working=true;run.disabled=true;show.checked=false;show.disabled=true;result=null;configuration=null;
   status.textContent='Calculando equilíbrio mecânico do policristal hipotético…';
   onChange();
   // Uma etapa visual para exibir a atividade antes do processamento síncrono.
   requestAnimationFrame(()=>{
    if(destroyed)return;
    try{
     const model=SILM.polycrystalCPFEM.create({structure,synthetic});
     const requestedLoad=Number(load.value),requestedUnload=unload.checked;
     const response=model.run({mode:study,position:contact.position,width:contact.width,
      load:requestedLoad/100,unload:requestedUnload,increments:5});
     if(!response.converged){
      status.textContent='CPFEM não convergiu ('+(response.reason||response.status)+
       '); campo não aplicado. Reduza a carga ou revise o domínio do modelo.';
     }else{
      result=response;mode=study;
       configuration=Object.freeze({synthetic,structure,mode:study,
        position:contact.position,width:contact.width,load:requestedLoad,unload:requestedUnload});
       show.disabled=false;
      status.textContent='Policristal hipotético · '+response.sampledGrains+'/'+response.grainCount+
       ' grãos com pontos de integração · '+response.plasticTriangles+
       ' elementos plastificados no último incremento · deslizamento máximo '+
       fmt(response.maxAccumulatedSlip)+' · resíduo FEM '+fmt(response.residual)+
       (response.unloaded?' · após descarregamento':' · sob carregamento')+
       '. Sem calibração por metal; NÃO modifica o solucionador J2.';
     }
    }catch(error){
     status.textContent='Prévia indisponível: '+(error?.message||String(error))+
      '. Nenhum campo aplicado.';
    }finally{
     working=false;run.disabled=false;renderGrain();onChange();
    }
   });
  });
  show.addEventListener('change',()=>onChange());
  return Object.freeze({
   status:'STAGING_PREVIEW',element:details,
   selected(index){selected=Number.isInteger(index)?index:-1;renderGrain();},
   invalidate,field:currentField,
   result:()=>result,
   destroy(){destroyed=true;details.remove();result=null;configuration=null;show.checked=false;}
  });
 }
 return Object.freeze({schema:'silm.polycrystal-preview.staging.v1',mount,
  willChangeMenus:false,published:false,requiresMenuReview:true});
})();
