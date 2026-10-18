'use strict';
window.SILM=window.SILM||{};
/* Estado de representação (0.11.x), separado do estado científico.
   - scientificState ≠ representationState: projeção, câmera (zoom, pan) e modo de enquadramento não são ciência.
     Mudá-los nunca escreve no estado científico, não entra no Desfazer nem no Histórico.
   - Guardado à parte (storage 'representation.view'), com versão própria e ligado à investigação: outra
     investigação, valores inválidos ou de outra versão voltam ao padrão, sem impedir a investigação de abrir.
   - Câmera por modo: a montagem livre e a estrutura cristalina têm cenas diferentes.
     camera = {mode:'fit'|'free', zoom, x, y}: (x, y) é o ponto da cena no centro do palco; zoom 1 mostra a cena inteira.
     Em 'fit', a câmera acompanha o enquadramento da estrutura; um gesto ou botão de zoom/pan a passa para 'free'.
   - Herança do schema 8 (não muda nesta série): vista Célula/Rede, célula, vizinhos, rótulos e unidade selecionada da
     estrutura cristalina, e a visibilidade dos elétrons, continuam em scientificState. A fachada SILM.representationState
     (bootstrap) compõe tudo numa leitura só. */
SILM.representation=(()=>{
 const VERSION=1,PROJECTIONS=Object.freeze(['isometric','front','top','side']),MODES=Object.freeze(['fit','free']);
 const LABELS=Object.freeze({isometric:'Isométrica',front:'Frontal',top:'Superior',side:'Lateral'});
 const ZOOM=Object.freeze({min:.5,max:4,step:1.25});
 const camera=()=>({mode:'fit',zoom:1,x:.5,y:.5});
 const defaults=(investigationId=null)=>({version:VERSION,investigationId,projection:'isometric',cameras:{free:camera(),crystal:camera()}});
 const num=(v,lo,hi,fallback)=>typeof v==='number'&&Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):fallback;
 function sanitizeCamera(c){
  const out=camera();if(!c||typeof c!=='object')return out;
  if(MODES.includes(c.mode))out.mode=c.mode;out.zoom=num(c.zoom,ZOOM.min,ZOOM.max,1);out.x=num(c.x,-3,4,.5);out.y=num(c.y,-3,4,.5);
  return out;
 }
 function sanitize(v,investigationId=null){
  const out=defaults(investigationId);
  if(!v||typeof v!=='object'||v.version!==VERSION||v.investigationId!==investigationId)return out;
  if(PROJECTIONS.includes(v.projection))out.projection=v.projection;
  for(const k of ['free','crystal'])out.cameras[k]=sanitizeCamera(v.cameras?.[k]);
  return out;
 }
 return Object.freeze({VERSION,PROJECTIONS,MODES,LABELS,ZOOM,camera,defaults,sanitize,sanitizeCamera});
})();
