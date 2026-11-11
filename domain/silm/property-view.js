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
 function update({field=false,coupled=null,intensity=null,drift=null,fieldY=4.5,beam=null,force=null,level=0,plates=null,load=0,heat=false,light=null,heatX=0}={}){
  for(const g of [fieldG,forceG,heatG,lightG])g.replaceChildren();
  // 0.17.x: seta E com comprimento pela intensidade; seta da deriva média pela intensidade × (calor, defeitos).
  if(coupled){
   // Terminais em x mínimo (+) e x máximo (0), sem confundir U imposto com campo local.
   const U=coupled.voltage,I=coupled.current,H=5+25*U/(1+U),Ld=4+14*I/(1+I);
   el('text',{x:50-H-3,y:fieldY+1.5,class:'silm-overlay-label'},fieldG,'+');
   el('text',{x:50+H+2,y:fieldY+1.5,class:'silm-overlay-label'},fieldG,'0');
   el('text',{x:50,y:fieldY+1.5,'text-anchor':'middle',class:'silm-overlay-label'},fieldG,'U (rel.)');
   if(I>0){arrow(fieldG,50+Ld,96,50-Ld,96,'silm-drift-arrow');el('text',{x:Math.min(80,50+Ld+2),y:97.4,class:'silm-overlay-label silm-overlay-small'},fieldG,'elétrons (qualitativo)');}
  }else if(field&&intensity!==null){const H=5+25*intensity,Ld=4+14*intensity*(drift??1);arrow(fieldG,50-H,fieldY,50+H,fieldY,'silm-field-arrow');el('text',{x:Math.min(97,50+H+5),y:fieldY+1.5,class:'silm-overlay-label'},fieldG,'E');
   arrow(fieldG,50+Ld,96,50-Ld,96,'silm-drift-arrow');el('text',{x:Math.min(80,50+Ld+2),y:97.4,class:'silm-overlay-label silm-overlay-small'},fieldG,'elétrons (média)');}
  else if(field){arrow(fieldG,32,4.5,68,4.5,'silm-field-arrow');el('text',{x:73,y:6,class:'silm-overlay-label'},fieldG,'E');
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
  // 0.17.x (P4): normal da superfície, feixe incidente da lanterna e feixe refletido com θr = θi (sem feixe transmitido).
  if(beam){const {point:P,lantern:L,end:E,angle,on}=beam,len=Math.hypot(L.x-P.x,L.y-P.y);
   el('line',{x1:P.x,y1:P.y,x2:P.x,y2:Math.max(1,P.y-len),class:'silm-normal-line'},lightG);el('text',{x:P.x+1,y:Math.max(3,P.y-len+2),class:'silm-overlay-label silm-overlay-small'},lightG,'normal');
   if(on){el('line',{x1:L.x,y1:L.y,x2:P.x,y2:P.y,class:'silm-light-in-line'},lightG);el('line',{x1:P.x,y1:P.y,x2:E.x,y2:E.y,class:'silm-light-out-line'},lightG);
    el('text',{x:Math.max(1,(L.x+P.x)/2-12),y:(L.y+P.y)/2,class:'silm-overlay-label silm-overlay-small'},lightG,'θᵢ = '+angle+'°');
    el('text',{x:Math.min(86,(E.x+P.x)/2+2),y:(E.y+P.y)/2,class:'silm-overlay-label silm-overlay-small'},lightG,'θᵣ = '+angle+'°');}}
  else if(light){const {x,y}=light;el('polygon',{points:`0,2 12,2 ${x+3},${y} ${x-3},${y}`,class:'silm-light-in',fill:'url(#'+uid+'-rays)'},lightG);
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
 const readings=U.element('dl',null,'silm-joule-readings');readings.hidden=true;
 const quantities=[['resistance','Resistência equivalente'],['maximum','Temperatura máxima'],['jouleEnergy','Energia gerada por Joule'],['externalEnergy','Energia da fonte externa'],['storedEnergy','Energia armazenada'],['removedEnergy','Energia removida']];
 const valuesByKey=new Map(quantities.map(([key,label])=>{const value=U.element('dd','');readings.append(U.element('dt',label),value);return [key,value];}));
 const opticalSection=U.element('section',null,'silm-optical-sample');opticalSection.hidden=true;
 opticalSection.setAttribute('aria-label','Amostra experimental de refletância');
 const opticalHeading=U.element('strong','Resposta óptica por metal'),opticalNote=U.element('p','','silm-optical-note');
 const spectralBars=U.element('div',null,'silm-optical-bands');
 const channels=[['Azul',450],['Verde',550],['Vermelho',650]].map(([name,nm])=>{
  const item=U.element('div',null,'silm-optical-band'),label=U.element('span',name+' · '+nm+' nm'),
   meter=U.element('meter'),value=U.element('output');
  meter.min=0;meter.max=1;meter.value=0;
  meter.setAttribute('aria-label','Refletância de referência a '+nm+' nanômetros');
  value.setAttribute('aria-label','Refletância da amostra');
  item.append(label,meter,value);spectralBars.append(item);return {nm,meter,value};
 });
 const opticalSource=U.element('p','','silm-optical-source');
 opticalSection.append(opticalHeading,opticalNote,spectralBars,opticalSource);
 box.append(head,row,status,readings,opticalSection,list);container.append(box);
 function updateOptical(state,angle){
  const service=SILM.materialEngine;
  const numeric=state.metal?.atomicNumber;
  const cap=service?.capability(numeric,'luster');
  const validated=cap?.ok&&cap.mode==='reference-data';
  spectralBars.hidden=!validated;
  opticalSection.dataset.evidence=validated?'tabulated':'qualitative';
  opticalSection.dataset.reference=validated?
   (cap.conditionMatch?.ok?'cntp-verified':'source-conditions-only'):'unavailable';
  if(!validated){
   opticalNote.textContent='Modelo geométrico qualitativo. Sem perfil óptico homologado para este metal: não são exibidas porcentagens nem uma cor calculada.';
   opticalSource.textContent='A luz e a superfície continuam como esquema, não como previsão da aparência.';
   return;
  }
  const angleDeg=Number.isFinite(angle)?angle:0,values=channels.map(row=>service.optical(numeric,row.nm,angleDeg));
  if(values.some(v=>!v.ok)){
   spectralBars.hidden=true;
   opticalNote.textContent='A amostra não permite calcular esta condição sem extrapolar os dados.';
   opticalSource.textContent='Revise o intervalo espectral ou o perfil de referência.';
   return;
  }
  for(let i=0;i<channels.length;i++){
   const v=values[i],channel=channels[i];channel.meter.value=v.reflectance;
   channel.value.textContent=(100*v.reflectance).toLocaleString('pt-BR',{maximumFractionDigits:1})+' %';
  }
  const atReference=!!cap.conditionMatch?.ok;
  opticalNote.textContent=cap.symbol+' · interface lisa ideal ar–metal · luz não polarizada · incidência '+angleDeg+'° da normal de referência. Valores ilustram a fonte original, não a cor de uma peça real.';
  opticalSource.textContent=(atReference?'Condição CNTP verificada. ':
   'ATENÇÃO: fonte à temperatura ambiente; CNTP (0 °C, 1 atm) não verificada — não interpretar estas porcentagens como previsão em CNTP. ')+
   'Constantes n,k: '+cap.source.authors+' ('+cap.source.year+'). Sem considerar óxido, rugosidade ou filme.';
 }

 const button=(id,label,run,opts={})=>{const b=SILM.actionButton(label,run,scope,{id:prefix+'-'+id,...opts});return b;};
 const B={field:button('field','Aplicar campo elétrico',()=>actions.field(),{primary:true}),heat:button('heat','Aquecer região',()=>actions.heat(),{primary:true}),advance:button('advance','Avançar propagação',()=>actions.advance()),
  compress:button('compress','Aplicar compressão',()=>actions.compress(),{primary:true}),stretch:button('stretch','Alongar',()=>actions.stretch(),{primary:true}),light:button('light','Incidir luz',()=>actions.light(),{primary:true}),
  restore:button('restore','Restaurar',()=>actions.restore()),end:button('end','Encerrar experiência',()=>actions.end())};
 const starts=Object.fromEntries(P.ids.map(id=>[id,button('start-'+id,P.catalog[id].title,()=>actions.start(id))]));
 const reasons=Object.fromEntries(P.ids.map(id=>{const r=U.element('span','','silm-property-reason');r.id=prefix+'-reason-'+id;starts[id].setAttribute('aria-describedby',r.id);return [id,r];}));
 for(const id of P.ids){const item=U.element('div',null,'silm-property-item');item.append(starts[id],reasons[id]);list.append(item);}
 function update(){
  const {state,eligibility,editable,reduced,availability,joule}=info(),pr=state.properties,active=pr?.active;
  readings.hidden=!joule||compact;
  opticalSection.hidden=active!=='luster'||compact;
  if(!opticalSection.hidden)updateOptical(state,info().drive?.angle);
  box.dataset.active=active||'';list.hidden=!!active||compact;row.hidden=!active;
  if(!active){head.textContent=compact?'':'Escolha uma propriedade para investigar.';status.textContent=compact?'':'Uma experiência por vez; as experiências não alteram a estrutura científica.';
   for(const id of P.ids){const el=eligibility[id],able=availability(id),ok=el.status!=='unavailable'&&able.ok&&editable;starts[id].setAttribute('aria-disabled',String(!ok));
    reasons[id].textContent=el.status==='unavailable'?'Indisponível: '+el.message:!able.ok?able.message:!editable?'Disponível em Explorar.':(el.status==='available'?'Experiência qualitativa · dado tabelado':'Experiência qualitativa');}
   return;}
  const p=pr[active],L=P.limits;head.textContent=P.catalog[active].title;
  const show=(...ids)=>{for(const [k,b]of Object.entries(B))b.hidden=!ids.includes(k);};
  if(joule){
   const {input,values}=joule,format=n=>n.toLocaleString('pt-BR',{maximumFractionDigits:3});
   head.textContent='Condutividade elétrica e térmica · efeito Joule';
   show('field','heat','advance','restore','end');
   B.field.textContent=p.field?'Desligar alimentação':'Ligar alimentação';
   B.field.setAttribute('aria-pressed',String(p.field));
   B.heat.textContent=input.external?'Desligar calor externo':'Ligar calor externo';
   B.heat.setAttribute('aria-pressed',String(input.external));
   B.advance.textContent='Avançar meio intervalo';
   for(const key of ['field','heat','advance','restore','end'])B[key].setAttribute('aria-disabled',String(!editable));
   status.textContent='Grandezas relativas · t '+format(values.time)+' · potência Joule '+format(values.power)+' · temperatura média '+format(values.mean)+'. O tempo avança pelos controles da experiência.';
   for(const [key,value]of valuesByKey)value.textContent=format(values[key]);
   return;
  }
  // Calor + corrente (0.17.x): na estrutura cristalina, a condutividade elétrica também tem a fonte de calor.
  const combined=active==='electrical'&&!!info().thermal?.combined;
  if(combined){B.heat.textContent=info().thermal.on?'Desligar fonte de calor':'Ligar fonte de calor';B.heat.setAttribute('aria-pressed',String(!!info().thermal.on));}
  if(active==='electrical'){show('field',...(combined?['heat']:[]),'restore','end');B.field.textContent=p.field?'Remover campo':'Aplicar campo elétrico';B.field.setAttribute('aria-pressed',String(p.field));}
  // 0.17.x: no modo contínuo, o calor avança sozinho no tempo; não há "Avançar propagação".
  if(active==='thermal'&&info().thermal){show('heat','restore','end');B.heat.textContent=p.heating?'Desligar fonte de calor':'Ligar fonte de calor';B.heat.setAttribute('aria-pressed',String(p.heating));}
  else if(active==='thermal'){show('heat','advance','restore','end');B.heat.textContent=p.heating?'Desligar fonte de calor':'Aquecer região';B.heat.setAttribute('aria-pressed',String(p.heating));B.advance.setAttribute('aria-disabled',String(!p.heating||p.stage>=L.heatStages||!editable));}
  // 0.17.x: na deformação contínua, a força vem da prensa ou da garra na cena (arraste ou teclado); o botão faz um pulso completo.
  const r=info().deformation||null;
  // Deformação + corrente: botão de campo elétrico (transitório) na maleabilidade e na ductilidade.
  const dv=info().drive,deformField=!!dv&&(active==='malleability'||active==='ductility');
  if(deformField){B.field.textContent=dv.deformField?'Remover campo elétrico':'Aplicar campo elétrico';B.field.setAttribute('aria-pressed',String(dv.deformField));}
  if(active==='malleability'){show('compress',...(deformField?['field']:[]),'restore','end');B.compress.setAttribute('aria-disabled',String(p.compression>=L.compression||!editable));B.compress.textContent=r?'Comprimir até deslizar ('+p.compression+'/'+L.compression+')':p.compression?'Comprimir mais ('+p.compression+'/'+L.compression+')':'Aplicar compressão';}
  if(active==='ductility'){show('stretch',...(deformField?['field']:[]),'restore','end');B.stretch.setAttribute('aria-disabled',String(p.elongation>=L.elongation||!editable));B.stretch.textContent=r?'Puxar até deslizar ('+p.elongation+'/'+L.elongation+')':p.elongation?'Alongar mais ('+p.elongation+'/'+L.elongation+')':'Alongar';}
  if(active==='luster'){show('light','restore','end');B.light.textContent=p.light?'Apagar luz':'Incidir luz';B.light.setAttribute('aria-pressed',String(p.light));}
  for(const k of ['field','heat','light','restore','end'])if(!B[k].hidden&&k!=='end')B[k].setAttribute('aria-disabled',String(!editable));
  B.end.setAttribute('aria-disabled','false');
  const n=P.narrative(active,p,{reduced,electronsVisible:!!state.electrons?.representation.visible,deformation:info().deformation||null,thermal:info().thermal||null,drive:info().drive||null});if(status.textContent!==n.observation)status.textContent=n.observation;
 }
 for(const b of Object.values(B))row.append(b);update();return Object.freeze({root:box,update});
};
