'use strict';
window.SILM=window.SILM||{};
/*
 * Iluminação LOCAL qualitativa da marca de intervenção mecânica.
 * A FEM do SILM resolve deslocamentos 2D, não topografia z(x,y): os
 * gradientes abaixo não são sombras de ray tracing, nem medição de
 * rugosidade, de deformação fora do plano ou BRDF dos grãos.
 * A projeção sombreada sinaliza ONDE a prensa/garra atuou. A direção
 * horizontal da fonte é ilustrativamente fixa à esquerda; a incidência
 * ajusta a extensão relativa do claro/escuro. Óptica intrínseca Fresnel/GGX
 * continua em surface-physics.js e não é modificada por esta camada.
 */
(()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const maxMarks=16;
 function validMark(m){
  return !!m&&typeof m==='object'&&
   ['compression','tension'].includes(m.mode)&&
   Number.isFinite(m.position)&&m.position>=.1&&m.position<=.9&&
   Number.isFinite(m.width)&&m.width>=.1&&m.width<=.8;
 }
 function project(mark,{incidenceDeg=35,illuminated=true,active=false,load=0,field=null,amplitude=0}={}){
  if(!validMark(mark))return null;
  const phi=clamp(Number.isFinite(incidenceDeg)?incidenceDeg:35,0,80)*Math.PI/180;
  const p=mark.position,w=mark.width;
  const contact=mark.mode==='compression',dy=contact?.18:.23;
  const bearing=clamp(Math.sin(phi),0,1);
  const offset=bearing*(.012+w*.085);
  const f=field&&Number.isFinite(amplitude)&&amplitude>0?
   field.sample(p,dy,clamp(amplitude,0,1)):null;
  const cx=clamp(p+(Number.isFinite(f?.dx)?f.dx:0),0,1);
  const cy=clamp(dy+(Number.isFinite(f?.dy)?f.dy:0),0,1);
  const intensity=active?clamp(Number(load)||0,0,1):clamp(.27+.14*((mark.count||1)-1),.27,.9);
  const lighting=illuminated?1:.68;
  return Object.freeze({
   shadow:{x:clamp(cx+offset,0,1),y:cy,rx:clamp(w*.83,.10,.65),
    ry:contact?.15:.19,opacity:clamp((.36+.23*intensity)*lighting,0,.42)},
   highlight:{x:clamp(cx-offset*.78,0,1),y:clamp(cy-.016,0,1),
    rx:clamp(w*.47,.045,.42),ry:contact?.09:.12,
    opacity:clamp((.28+.22*intensity)*lighting,0,.48)},
   illustrative:true
  });
 }
 function projectAll({marks=[],activeContact=null,mode=null,load=0,field=null,
                     amplitude=0,incidenceDeg=35,illuminated=true}={}){
  const list=(Array.isArray(marks)?marks:[]).filter(validMark).slice(-maxMarks);
  const unique=new Map();
  for(const mark of list){
   const key=[mark.mode,mark.position,mark.width].join('|');
   const previous=unique.get(key);
   unique.set(key,{...mark,count:(previous?.count||0)+1});
  }
  const entries=[...unique.values()].map(mark=>project(mark,{incidenceDeg,illuminated,active:false}));
  if(load>1e-4&&activeContact&&['compression','tension'].includes(mode)){
   const live=project({...activeContact,mode},{incidenceDeg,illuminated,active:true,load,field,amplitude});
   if(live)entries.push(live);
  }
  return entries;
 }
 SILM.specimenVisualLight=Object.freeze({validMark,project,projectAll,maxMarks});
})();
