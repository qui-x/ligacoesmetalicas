'use strict';
window.SILM=window.SILM||{};
/* Estado de representação (0.11.x; 3D desde a 0.12.x), separado do estado científico.
   - scientificState ≠ representationState: modo 2D/3D, projeção, câmera (zoom, pan, órbita) e enquadramento não são
     ciência. Mudá-los nunca escreve no estado científico, não entra no Desfazer nem no Histórico.
   - Guardado à parte (storage 'representation.view'), com versão própria e ligado à investigação: outra
     investigação, valores inválidos ou de versão desconhecida voltam ao padrão, sem impedir a investigação de abrir.
     A versão 1 (0.11.x) migra para a 2 sem perda: projeção e câmeras ficam; o modo começa em 2D.
   - Câmera por modo: a montagem livre, a estrutura em 2D e a estrutura em 3D têm cenas diferentes.
     camera = {mode:'fit'|'free', zoom, x, y}: (x, y) é o ponto da cena no centro do palco; zoom 1 mostra a cena inteira.
     camera3D = {preset:'3d'|'xy'|'xz'|'yz'|null, yaw, pitch, projection:'perspective'|'orthographic'}: orientação da
     órbita em graus (null = a do preset; '3d' parte da vista de referência da estrutura). Alvo = centro da célula;
     posição = alvo + distância na direção da orientação; zoom e pan são a camera do modo 3D.
   - Herança do schema 8 (não muda nesta série): vista Célula/Rede, célula, vizinhos, rótulos e unidade selecionada da
     estrutura cristalina, e a visibilidade dos elétrons, continuam em scientificState. A fachada SILM.representationState
     (bootstrap) compõe tudo numa leitura só. */
SILM.representation=(()=>{
 const VERSION=2,PROJECTIONS=Object.freeze(['isometric','front','top','side']),MODES=Object.freeze(['fit','free']);
 const VIEW_MODES=Object.freeze(['2d','3d']),PRESETS=Object.freeze(['3d','xy','xz','yz']),PROJECTIONS3D=Object.freeze(['perspective','orthographic']);
 const LABELS=Object.freeze({isometric:'Isométrica',front:'Frontal',top:'Superior',side:'Lateral'});
 const PRESET_LABELS=Object.freeze({'3d':'3D livre',xy:'Plano XY (de cima)',xz:'Plano XZ (de frente)',yz:'Plano YZ (de lado)'});
 const ZOOM=Object.freeze({min:.5,max:4,step:1.25});
 const camera=()=>({mode:'fit',zoom:1,x:.5,y:.5});
 const camera3D=()=>({preset:'3d',yaw:null,pitch:null,projection:'perspective'});
 const defaults=(investigationId=null)=>({version:VERSION,investigationId,viewMode:'2d',projection:'isometric',camera3D:camera3D(),cameras:{free:camera(),crystal:camera(),crystal3d:camera()}});
 const num=(v,lo,hi,fallback)=>typeof v==='number'&&Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):fallback;
 function sanitizeCamera(c){
  const out=camera();if(!c||typeof c!=='object')return out;
  if(MODES.includes(c.mode))out.mode=c.mode;out.zoom=num(c.zoom,ZOOM.min,ZOOM.max,1);out.x=num(c.x,-3,4,.5);out.y=num(c.y,-3,4,.5);
  return out;
 }
 /* Guinada em −180..180; inclinação em −90..90 (sem virar de cabeça para baixo). Com ângulos, o preset é null. */
 function sanitizeCamera3D(c){
  const out=camera3D();if(!c||typeof c!=='object')return out;
  if(PROJECTIONS3D.includes(c.projection))out.projection=c.projection;
  const yaw=num(c.yaw,-1e6,1e6,null),pitch=num(c.pitch,-90,90,null);
  if(yaw!==null&&pitch!==null){out.preset=null;out.yaw=((yaw+180)%360+360)%360-180;out.pitch=pitch;}
  else if(PRESETS.includes(c.preset))out.preset=c.preset;
  return out;
 }
 function sanitize(v,investigationId=null){
  const out=defaults(investigationId);
  if(!v||typeof v!=='object'||(v.version!==1&&v.version!==VERSION)||v.investigationId!==investigationId)return out;
  if(PROJECTIONS.includes(v.projection))out.projection=v.projection;
  for(const k of ['free','crystal','crystal3d'])out.cameras[k]=sanitizeCamera(v.cameras?.[k]);
  if(v.version===VERSION){if(VIEW_MODES.includes(v.viewMode))out.viewMode=v.viewMode;out.camera3D=sanitizeCamera3D(v.camera3D);}   // versão 1: modo 2D, câmera 3D padrão
  return out;
 }
 return Object.freeze({VERSION,PROJECTIONS,MODES,VIEW_MODES,PRESETS,PROJECTIONS3D,LABELS,PRESET_LABELS,ZOOM,camera,camera3D,defaults,sanitize,sanitizeCamera,sanitizeCamera3D});
})();
