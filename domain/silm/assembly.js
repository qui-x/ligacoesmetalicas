'use strict';
window.SILM=window.SILM||{};
/* Contrato da montagem metálica (0.4.x). Somente geometria de interface, sem DOM e sem física.
   Coordenadas normalizadas de uma cena quadrada: 0..1 nos dois eixos. Não são pixels nem ångström.
   A assistência de posicionamento é um mecanismo didático de interface: não representa força,
   energia, atração entre átomos, dinâmica molecular ou cristalização. */
SILM.assembly=(()=>{
 const contract=Object.freeze({
  modelVersion:1,type:'metallic-assembly',
  statuses:Object.freeze(['empty','assembling','assembled']),placements:Object.freeze(['manual','assisted']),assistanceModes:Object.freeze(['placement']),
  unitRadius:0.042,   // raio visual da unidade
  minDistance:0.1,    // espaçamento visual mínimo entre centros (contrato de sobreposição)
  margin:0.06,        // área segura: nenhuma unidade sai da cena nem fica sob a borda
  maxUnits:48,        // limite didático de legibilidade da cena
  historyLimit:30,    // ações desfazíveis mantidas em memória
  keyboardStep:0.02,fineStep:0.005,precision:4
 });
 const {minDistance,margin}=contract,factor=10**contract.precision,EPSILON=1e-9;
 const round=v=>Math.round(v*factor)/factor;
 const clampValue=v=>Math.min(1-margin,Math.max(margin,v));
 const clamp=p=>({x:round(clampValue(Number(p.x))),y:round(clampValue(Number(p.y)))});
 const finite=p=>!!p&&typeof p==='object'&&Number.isFinite(p.x)&&Number.isFinite(p.y);
 const inBounds=p=>finite(p)&&p.x>=margin-EPSILON&&p.x<=1-margin+EPSILON&&p.y>=margin-EPSILON&&p.y<=1-margin+EPSILON;
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const conflicts=(units,p,ignoreId=null,spacing=minDistance)=>units.filter(u=>u.id!==ignoreId&&distance(u.position,p)<spacing-EPSILON);
 const isFree=(units,p,ignoreId=null,spacing=minDistance)=>inBounds(p)&&!conflicts(units,p,ignoreId,spacing).length;
 /* Menor deslocamento até um ponto livre: anéis concêntricos ao redor do destino,
    começando pela direção que se afasta da unidade conflitante mais próxima. */
 function nearestFree(units,target,ignoreId=null,maxRadius=minDistance*1.6){
  const p=clamp(target);if(isFree(units,p,ignoreId))return p;
  const near=conflicts(units,p,ignoreId).sort((a,b)=>distance(a.position,p)-distance(b.position,p))[0];
  const start=near?Math.atan2(p.y-near.position.y,p.x-near.position.x):0;
  for(let r=0.01;r<=maxRadius+EPSILON;r+=0.01){
   const steps=Math.max(12,Math.ceil(2*Math.PI*r/0.008));
   for(let i=0;i<steps;i++){
    const k=i%2?Math.ceil(i/2):-Math.ceil(i/2),angle=start+k*2*Math.PI/steps;
    const q=clamp({x:p.x+r*Math.cos(angle),y:p.y+r*Math.sin(angle)});
    if(isFree(units,q,ignoreId))return q;
   }
  }
  return null;
 }
 /* Destino solicitado → posição aceita. Sem assistência, um destino ocupado é recusado. */
 function resolve(units,id,target,{assisted=true}={}){
  if(!finite(target))return {ok:false,reason:'INVALID_TARGET'};
  const p=clamp(target);
  if(isFree(units,p,id))return {ok:true,position:p,placement:'manual',adjusted:false};
  if(!assisted)return {ok:false,reason:'OCCUPIED'};
  const q=nearestFree(units,p,id);
  return q?{ok:true,position:q,placement:'assisted',adjusted:true}:{ok:false,reason:'OCCUPIED'};
 }
 /* Posição inicial de uma unidade nova: perto do conjunto já montado (formação coletiva).
    Os candidatos seguem uma espiral de ângulo áureo, sem translação periódica:
    a assistência não gera CCC, CFC, HC, hexágonos ou cubos. */
 function spawnPosition(units){
  const center=units.length?{x:units.reduce((s,u)=>s+u.position.x,0)/units.length,y:units.reduce((s,u)=>s+u.position.y,0)/units.length}:{x:.5,y:.5};
  const spacing=minDistance*1.05,golden=Math.PI*(3-Math.sqrt(5));
  for(let k=0;k<900;k++){const r=0.03*Math.sqrt(k),q=clamp({x:center.x+r*Math.cos(k*golden),y:center.y+r*Math.sin(k*golden)});if(isFree(units,q,null,spacing))return q;}
  let best=null;
  for(let x=margin;x<=1-margin+EPSILON;x+=0.01)for(let y=margin;y<=1-margin+EPSILON;y+=0.01){const q=clamp({x,y});if(isFree(units,q)&&(!best||distance(q,center)<distance(best,center)))best=q;}
  return best;
 }
 // Toda edição de unidades devolve a montagem ao estado em construção.
 const statusFor=units=>units.length?'assembling':'empty';
 return Object.freeze({contract,round,clamp,inBounds,distance,conflicts,isFree,nearestFree,resolve,spawnPosition,statusFor});
})();
