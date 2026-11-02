'use strict';
window.SILM=window.SILM||{};
/* Representação das experiências de propriedades (0.7.x).
   - Sobreposição SVG decorativa (aria-hidden): indicação do campo, setas de força, fonte de calor e feixe de luz,
     sempre nas bordas da cena, fora da estrutura. Sem diagrama de circuito e sem setas por elétron.
     0.11.x: coordenadas em frações do palco (câmera já aplicada); setas e rótulos ficam presos ao palco, e a fonte de
     calor e o alvo do feixe acompanham a estrutura (heatX e light chegam convertidos pela câmera).
   - O estado legível (texto) vem das narrativas de SILM.properties; a animação nunca é a única informação.
   - Controles: somente os da propriedade ativa (mais Restaurar e Encerrar). */
SILM.createPropertyOverlay=(stage,{before=null}={})=>{
 const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','silm-property-overlay');
 const el=(tag,attrs,parent=svg,text=null)=>{const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==null)n.textContent=text;parent.append(n);return n;};
 const defs=el('defs',{}),uid='p'+Math.random().toString(36).slice(2,8);
 const hatch=el('pattern',{id:uid+'-hatch',width:3,height:3,patternUnits:'userSpaceOnUse',patternTransform:'rotate(45)'},defs);el('rect',{width:1.2,height:3,class:'silm-hatch-line'},hatch);
 const rays=el('pattern',{id:uid+'-rays',width:3,height:3,patternUnits:'userSpaceOnUse',patternTransform:'rotate(-30)'},defs);el('rect',{width:1.4,height:3,class:'silm-ray-line'},rays);
 const head=el('marker',{id:uid+'-head',viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:4,markerHeight:4,orient:'auto-start-reverse'},defs);el('polygon',{points:'0,0 10,5 0,10',class:'silm-arrow-head'},head);
 const group=name=>el('g',{class:name});
 const fieldG=group('silm-field-indicator'),forceG=group('silm-force-indicator'),heatG=group('silm-heat-source'),lightG=group('silm-light-beam');
 const arrow=(g,x1,y1,x2,y2,cls)=>el('line',{x1,y1,x2,y2,class:cls,'marker-end':'url(#'+uid+'-head)'},g);
 stage.insertBefore(svg,before);
 function update({field=false,force=null,level=0,plates=null,load=0,heat=false,light=null,heatX=0}={}){
  for(const g of [fieldG,forceG,heatG,lightG])g.replaceChildren();
  if(field){arrow(fieldG,32,4.5,68,4.5,'silm-field-arrow');el('text',{x:73,y:6,class:'silm-overlay-label'},fieldG,'E');
   arrow(fieldG,64,96,40,96,'silm-drift-arrow');el('text',{x:66,y:97.4,class:'silm-overlay-label silm-overlay-small'},fieldG,'elétrons (média)');}
  // 0.17.x: placas nas faces da amostra; setas crescem com a força aplicada (para dentro na compressão, para fora na tração).
  if(force&&plates){const cl=v=>Math.max(1,Math.min(99,v)),{x0,x1}=plates,top=cl(plates.top),bottom=cl(plates.bottom),mid=(x0+x1)/2,w=Math.max(10,x1-x0),len=load>.02?2.5+8*Math.min(1,load):0;
   el('rect',{x:cl(mid-w/2-2),y:top-2.4,width:Math.min(98,w+4),height:1.6,rx:.6,class:'silm-press-plate'},forceG);el('rect',{x:cl(mid-w/2-2),y:bottom+.8,width:Math.min(98,w+4),height:1.6,rx:.6,class:'silm-press-plate'},forceG);
   if(len)for(const x of [mid-w/4,mid,mid+w/4]){if(force==='compress'){arrow(forceG,x,cl(top-3-len),x,top-2.8,'silm-force-arrow');arrow(forceG,x,cl(bottom+3.2+len),x,bottom+2.8,'silm-force-arrow');}
    else{arrow(forceG,x,top-2.8,x,cl(top-3-len),'silm-force-arrow');arrow(forceG,x,bottom+2.8,x,cl(bottom+3.2+len),'silm-force-arrow');}}
   el('text',{x:cl(Math.min(x1+3,80)),y:cl(top-3.5),class:'silm-overlay-label silm-overlay-small'},forceG,force==='compress'?'compressão':'tração');}
  else if(force==='compress'&&level){for(const x of [38,50,62]){arrow(forceG,x,1,x,7,'silm-force-arrow');arrow(forceG,x,99,x,93,'silm-force-arrow');}el('text',{x:66,y:5.5,class:'silm-overlay-label silm-overlay-small'},forceG,'compressão');}
  else if(force==='stretch'&&level){for(const x of [44,56]){arrow(forceG,x,8,x,1,'silm-force-arrow');arrow(forceG,x,92,x,99,'silm-force-arrow');}el('text',{x:60,y:5.5,class:'silm-overlay-label silm-overlay-small'},forceG,'tração');}
  if(heat){el('rect',{x:heatX,y:8,width:5,height:84,fill:'url(#'+uid+'-hatch)',class:'silm-heat-band'},heatG);el('text',{x:heatX+6.5,y:12,class:'silm-overlay-label silm-overlay-small'},heatG,'calor');}
  if(light){const {x,y}=light;el('polygon',{points:`0,2 12,2 ${x+3},${y} ${x-3},${y}`,class:'silm-light-in',fill:'url(#'+uid+'-rays)'},lightG);
   el('polygon',{points:`${x-3},${y} ${x+3},${y} 100,2 88,2`,class:'silm-light-out'},lightG);el('text',{x:2,y:9,class:'silm-overlay-label silm-overlay-small'},lightG,'luz incidente');el('text',{x:98,y:9,'text-anchor':'end',class:'silm-overlay-label silm-overlay-small'},lightG,'luz refletida');}
 }
 return Object.freeze({root:svg,update});
};
/* Controles da experiência ativa. actions: start(id), field(), heat(), advance(), compress(), stretch(), light(),
   restore(), end(). info(): {state, eligibility, editable, reduced}. prefix distingue painel e cena. */
SILM.createPropertyControls=(container,{scope,info,actions,prefix='silm-prop',compact=false})=>{
 const U=SimCore.ExperienceUI,P=SILM.properties,box=U.element('div',null,'silm-property-controls'+(compact?' silm-property-compact':''));box.setAttribute('role','group');box.setAttribute('aria-label','Propriedades metálicas');
 const head=U.element('p','','silm-property-title'),status=U.element('p','','silm-property-status');status.id=prefix+'-status';
 const row=U.element('div',null,'silm-property-actions'),list=U.element('div',null,'silm-property-list');
 box.append(head,row,status,list);container.append(box);
 const button=(id,label,run,opts={})=>{const b=SILM.actionButton(label,run,scope,{id:prefix+'-'+id,...opts});return b;};
 const B={field:button('field','Aplicar campo elétrico',()=>actions.field(),{primary:true}),heat:button('heat','Aquecer região',()=>actions.heat(),{primary:true}),advance:button('advance','Avançar propagação',()=>actions.advance()),
  compress:button('compress','Aplicar compressão',()=>actions.compress(),{primary:true}),stretch:button('stretch','Alongar',()=>actions.stretch(),{primary:true}),light:button('light','Incidir luz',()=>actions.light(),{primary:true}),
  restore:button('restore','Restaurar',()=>actions.restore()),end:button('end','Encerrar experiência',()=>actions.end())};
 const starts=Object.fromEntries(P.ids.map(id=>[id,button('start-'+id,P.catalog[id].title,()=>actions.start(id))]));
 const reasons=Object.fromEntries(P.ids.map(id=>{const r=U.element('span','','silm-property-reason');r.id=prefix+'-reason-'+id;starts[id].setAttribute('aria-describedby',r.id);return [id,r];}));
 for(const id of P.ids){const item=U.element('div',null,'silm-property-item');item.append(starts[id],reasons[id]);list.append(item);}
 function update(){
  const {state,eligibility,editable,reduced,availability}=info(),pr=state.properties,active=pr?.active;
  box.dataset.active=active||'';list.hidden=!!active||compact;row.hidden=!active;
  if(!active){head.textContent=compact?'':'Escolha uma propriedade para investigar.';status.textContent=compact?'':'Uma experiência por vez; as experiências não alteram a estrutura científica.';
   for(const id of P.ids){const el=eligibility[id],able=availability(id),ok=el.status!=='unavailable'&&able.ok&&editable;starts[id].setAttribute('aria-disabled',String(!ok));
    reasons[id].textContent=el.status==='unavailable'?'Indisponível: '+el.message:!able.ok?able.message:!editable?'Disponível em Explorar.':(el.status==='available'?'Experiência qualitativa · dado tabelado':'Experiência qualitativa');}
   return;}
  const p=pr[active],L=P.limits;head.textContent=P.catalog[active].title;
  const show=(...ids)=>{for(const [k,b]of Object.entries(B))b.hidden=!ids.includes(k);};
  if(active==='electrical'){show('field','restore','end');B.field.textContent=p.field?'Remover campo':'Aplicar campo elétrico';B.field.setAttribute('aria-pressed',String(p.field));}
  if(active==='thermal'){show('heat','advance','restore','end');B.heat.textContent=p.heating?'Desligar fonte de calor':'Aquecer região';B.heat.setAttribute('aria-pressed',String(p.heating));B.advance.setAttribute('aria-disabled',String(!p.heating||p.stage>=L.heatStages||!editable));}
  // 0.17.x: na deformação contínua, a força vem da prensa ou da garra na cena (arraste ou teclado); o botão faz um pulso completo.
  const r=info().deformation||null;
  if(active==='malleability'){show('compress','restore','end');B.compress.setAttribute('aria-disabled',String(p.compression>=L.compression||!editable));B.compress.textContent=r?'Comprimir até deslizar ('+p.compression+'/'+L.compression+')':p.compression?'Comprimir mais ('+p.compression+'/'+L.compression+')':'Aplicar compressão';}
  if(active==='ductility'){show('stretch','restore','end');B.stretch.setAttribute('aria-disabled',String(p.elongation>=L.elongation||!editable));B.stretch.textContent=r?'Puxar até deslizar ('+p.elongation+'/'+L.elongation+')':p.elongation?'Alongar mais ('+p.elongation+'/'+L.elongation+')':'Alongar';}
  if(active==='luster'){show('light','restore','end');B.light.textContent=p.light?'Apagar luz':'Incidir luz';B.light.setAttribute('aria-pressed',String(p.light));}
  for(const k of ['field','heat','light','restore','end'])if(!B[k].hidden&&k!=='end')B[k].setAttribute('aria-disabled',String(!editable));
  B.end.setAttribute('aria-disabled','false');
  const n=P.narrative(active,p,{reduced,electronsVisible:!!state.electrons?.representation.visible,deformation:info().deformation||null});if(status.textContent!==n.observation)status.textContent=n.observation;
 }
 for(const b of Object.values(B))row.append(b);update();return Object.freeze({root:box,update});
};
