'use strict';
window.SILM=window.SILM||{};
/* Sobreposições de instrumento (0.9.x; no espaço do palco desde a 0.11.x). Marcadores A/B/C com letra (não só cor),
   cota de medição com traços nas extremidades (é instrumento, não ligação M—M) e arco de ângulo. Desenhadas em px do
   palco: o texto mantém o tamanho na tela com qualquer zoom e o rótulo se afasta dos marcadores e da borda.
   Decorativas (aria-hidden): o resultado é anunciado em texto. Os pontos chegam em frações do palco (câmera aplicada). */
(()=>{
 const NS='http://www.w3.org/2000/svg';
 const el=(parent,tag,attrs,text=null)=>{const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==null)n.textContent=text;parent.append(n);return n;};
 const scale=()=>{const f=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale'));return Number.isFinite(f)&&f>0?f:1;};
 /* Rótulo do valor: caixa com o texto, fora dos marcadores e dentro do palco. */
 function valueLabel(svg,S,x,y,text,avoid=[],nx=0,ny=-1){
  const f=scale(),w=text.length*6.6*f+12,h=17*f;let cx=x,cy=y;
  for(let k=0;k<6;k++){if(!avoid.some(p=>Math.abs(p.x-cx)<w/2+12&&Math.abs(p.y-cy)<h/2+12))break;cx+=nx*12;cy+=ny*12;}
  cx=Math.max(w/2+2,Math.min(S-w/2-2,cx));cy=Math.max(h/2+2,Math.min(S-h/2-2,cy));
  const g=el(svg,'g',{class:'silm-dimension-label'});el(g,'rect',{x:cx-w/2,y:cy-h/2,width:w,height:h,rx:4});el(g,'text',{x:cx,y:cy+.5,'text-anchor':'middle','dominant-baseline':'middle'},text);
 }
 /* Cota entre dois pontos (px), com traços nas extremidades; o rótulo sai pela normal. */
 function dimension(svg,S,a,b,text,avoid){
  const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
  el(svg,'line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:'silm-dimension-line'});
  for(const p of [a,b])el(svg,'line',{x1:p.x-nx*6.5,y1:p.y-ny*6.5,x2:p.x+nx*6.5,y2:p.y+ny*6.5,class:'silm-dimension-tick'});
  if(text)valueLabel(svg,S,(a.x+b.x)/2+nx*16,(a.y+b.y)/2+ny*16,text,avoid,nx,ny);
 }
 function sized(svg,stage){const S=stage.clientWidth||300;svg.setAttribute('viewBox','0 0 '+S+' '+S);return S;}
 SILM.createMeasureOverlay=stage=>{
  const svg=document.createElementNS(NS,'svg');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','silm-measure-overlay');stage.append(svg);
  /* points: [{x,y,label}] em frações do palco; kind: distance | latticeParameter | angle | coordination | null; text: valor formatado. */
  function update({points=[],kind=null,text=''}={}){
   svg.replaceChildren();const S=sized(svg,stage);if(!points.length)return;const P=points.map(p=>({x:p.x*S,y:p.y*S,label:p.label})),marks=P.map(p=>({x:p.x+11,y:p.y-11}));
   if((kind==='distance'||kind==='latticeParameter')&&P.length===2)dimension(svg,S,P[0],P[1],text,marks);
   if(kind==='angle'&&P.length===3){
    const [a,b,c]=P;for(const p of [a,c])el(svg,'line',{x1:b.x,y1:b.y,x2:p.x,y2:p.y,class:'silm-angle-ray'});
    const r=22,a1=Math.atan2(a.y-b.y,a.x-b.x),a2=Math.atan2(c.y-b.y,c.x-b.x);let d=a2-a1;d=Math.atan2(Math.sin(d),Math.cos(d));
    const s={x:b.x+r*Math.cos(a1),y:b.y+r*Math.sin(a1)},e={x:b.x+r*Math.cos(a1+d),y:b.y+r*Math.sin(a1+d)};
    el(svg,'path',{d:`M${s.x} ${s.y} A${r} ${r} 0 0 ${d>0?1:0} ${e.x} ${e.y}`,class:'silm-angle-arc'});
    if(text){const mid=a1+d/2;valueLabel(svg,S,b.x+(r+18)*Math.cos(mid),b.y+(r+18)*Math.sin(mid),text,marks,Math.cos(mid),Math.sin(mid));}
   }
   // Marcador deslocado do centro, para não cobrir o símbolo da unidade; a cota parte do centro.
   P.forEach((p,i)=>{const g=el(svg,'g',{class:'silm-measure-marker'}),{x,y}=marks[i];el(g,'circle',{cx:x,cy:y,r:10*scale()});el(g,'text',{x,y:y+.5,'text-anchor':'middle','dominant-baseline':'middle'},p.label);});
  }
  return Object.freeze({root:svg,update});
 };
 /* Calcular (0.10.x; camada própria desde a 0.11.x): destaque do contato entre vizinhos (d = 2r) no raio e no
    empacotamento. As arestas da célula e as frações ficam na própria cena; aqui só o que é cota. */
 SILM.createCalcOverlay=stage=>{
  const svg=document.createElementNS(NS,'svg');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','silm-calc-overlay');stage.append(svg);
  function update({mode=null,points=[],text=''}={}){
   svg.replaceChildren();const S=sized(svg,stage);if(mode!=='contact'||points.length!==2)return;
   const P=points.map(p=>({x:p.x*S,y:p.y*S}));dimension(svg,S,P[0],P[1],text,[]);
   for(const p of P)el(svg,'circle',{cx:p.x,cy:p.y,r:5,class:'silm-calc-point'});
  }
  return Object.freeze({root:svg,update});
 };
})();
