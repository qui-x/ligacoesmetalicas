'use strict';
window.SILM=window.SILM||{};
/* Sobreposição de medição (0.9.x): marcadores A/B/C com letra (não só cor), cota de medição com traços nas
   extremidades (não é ligação M—M) e arco de ângulo. Decorativa (aria-hidden): o resultado é anunciado em texto. */
SILM.createMeasureOverlay=stage=>{
 const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','silm-measure-overlay');stage.append(svg);
 const el=(tag,attrs,parent=svg,text=null)=>{const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==null)n.textContent=text;parent.append(n);return n;};
 /* points: [{x,y,label}] em 0..1; kind: distance | latticeParameter | angle | coordination | null; text: valor formatado. */
 function update({points=[],kind=null,text=''}={}){
  svg.replaceChildren();if(!points.length)return;const P=points.map(p=>({x:p.x*100,y:p.y*100,label:p.label}));
  if((kind==='distance'||kind==='latticeParameter')&&P.length===2){
   const [a,b]=P,dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len*2.2,ny=dx/len*2.2;
   el('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:'silm-dimension-line'});
   for(const p of [a,b])el('line',{x1:p.x-nx,y1:p.y-ny,x2:p.x+nx,y2:p.y+ny,class:'silm-dimension-tick'});
   if(text){const mx=(a.x+b.x)/2+nx*1.8,my=(a.y+b.y)/2+ny*1.8,g=el('g',{class:'silm-dimension-label'});const t=el('text',{x:mx,y:my,'text-anchor':'middle','dominant-baseline':'middle'},g,text);
    const w=text.length*1.75+2;g.insertBefore(el('rect',{x:mx-w/2,y:my-2.6,width:w,height:5.2,rx:1},g),t);}
  }
  if(kind==='angle'&&P.length===3){
   const [a,b,c]=P;for(const p of [a,c])el('line',{x1:b.x,y1:b.y,x2:p.x,y2:p.y,class:'silm-angle-ray'});
   const r=7,a1=Math.atan2(a.y-b.y,a.x-b.x),a2=Math.atan2(c.y-b.y,c.x-b.x);let d=a2-a1;d=Math.atan2(Math.sin(d),Math.cos(d));
   const s={x:b.x+r*Math.cos(a1),y:b.y+r*Math.sin(a1)},e={x:b.x+r*Math.cos(a1+d),y:b.y+r*Math.sin(a1+d)};
   el('path',{d:`M${s.x} ${s.y} A${r} ${r} 0 0 ${d>0?1:0} ${e.x} ${e.y}`,class:'silm-angle-arc'});
   if(text){const m=a1+d/2,g=el('g',{class:'silm-dimension-label'}),x=b.x+(r+5)*Math.cos(m),y=b.y+(r+5)*Math.sin(m),w=text.length*1.75+2;el('rect',{x:x-w/2,y:y-2.6,width:w,height:5.2,rx:1},g);el('text',{x,y,'text-anchor':'middle','dominant-baseline':'middle'},g,text);}
  }
  // Marcador deslocado do centro, para não cobrir o símbolo da unidade; a cota parte do centro.
  for(const p of P){const g=el('g',{class:'silm-measure-marker'}),x=p.x+3.4,y=p.y-3.4;el('circle',{cx:x,cy:y,r:3.2},g);el('text',{x,y:y+.1,'text-anchor':'middle','dominant-baseline':'middle'},g,p.label);}
 }
 return Object.freeze({root:svg,update});
};
