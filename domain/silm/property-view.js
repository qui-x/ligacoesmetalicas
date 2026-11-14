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
   if(I>0){
    arrow(fieldG,50+Ld,96,50-Ld,96,'silm-drift-arrow');
    el('text',{x:Math.min(80,50+Ld+2),y:97.4,class:'silm-overlay-label silm-overlay-small'},fieldG,'elétrons (qualitativo)');
    // A lei da conversão aparece na própria rede, não num diagrama
    // independente. A malha eletrotérmica calcula P=UI e distribuição.
    el('text',{x:50,y:11,'text-anchor':'middle',class:'silm-overlay-label silm-overlay-small'},fieldG,'P Joule = U × I → calor');
   }
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
  // Brilho: o alvo acompanha a região superficial da estrutura projetada
  // pela câmera. Sem átomo emissor, superfície fictícia ou outra bancada.
  if(beam){
   const {point:P,lantern:L,end:E,observer:O,angle,on,rays,finish,appearance}=beam;
   el('ellipse',{cx:P.x,cy:P.y,rx:7,ry:2.5,
    class:'silm-optical-surface-marker'},lightG);
   if(on&&finish==='polished'&&['aligned','near'].includes(appearance)){
    el('ellipse',{cx:P.x,cy:P.y,rx:appearance==='aligned'?6:3,ry:1.7,
     class:'silm-optical-highlight'},lightG);
   }
   if(on&&finish==='matte'){
    // Espalhamento explicitamente qualitativo, sem rugosidade ou BRDF.
    for(const delta of [-40,-20,0,20,40]){
     const a=(angle+delta)*Math.PI/180;
     el('line',{x1:P.x,y1:P.y,x2:P.x+9*Math.sin(a),
      y2:P.y-9*Math.cos(a),class:'silm-optical-diffuse-ray'},lightG);
    }
   }
   if(rays){
    el('line',{x1:P.x,y1:P.y,x2:P.x,y2:P.y-15,class:'silm-optical-normal'},lightG);
    if(on){
     el('line',{x1:L.x,y1:L.y,x2:P.x,y2:P.y,class:'silm-optical-incidence'},lightG);
     el('line',{x1:P.x,y1:P.y,x2:E.x,y2:E.y,class:'silm-optical-reflection'},lightG);
    }
   }
  }
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
 const opticalLink=document.createElement('a');
 opticalLink.className='silm-optical-source-link';
 opticalLink.target='_blank';opticalLink.rel='noopener noreferrer';
 opticalLink.hidden=true;opticalLink.textContent='Consultar fonte científica original';
 opticalSection.append(opticalHeading,opticalNote,spectralBars,opticalSource,opticalLink);
 // Valor térmico institucional, em 295 K, somente para consulta junto da experiência.
 // Não alimenta o solver nem é atribuído à CNTP adotada pelo SILM.
 const thermalSection=U.element('section',null,'silm-research-reference silm-thermal-nist-reference');
 thermalSection.hidden=true;thermalSection.setAttribute('aria-label','Condutividade térmica de referência NIST a 295 K');
 const thermalTitle=U.element('strong','Condutividade térmica · referência NIST');
 const thermalValue=U.element('p','','silm-thermal-nist-value');
 const thermalNote=U.element('p','','silm-research-note');
 const thermalSource=document.createElement('a');
 thermalSource.href='https://www.nist.gov/ncnr/neutron-instruments/sample-environment/sample-mounting/reference-tables';
 thermalSource.target='_blank';thermalSource.rel='noopener noreferrer';
 thermalSource.textContent='Ver tabela do NIST · 295 K';
 thermalSection.append(thermalTitle,thermalValue,thermalNote,thermalSource);
 // Evidencia de pesquisa incorporada no mesmo painel "Explorar > Ductilidade".
 // Selecionar amostra altera APENAS a tabela documental; nao altera o motor.
 const researchSection=U.element('section',null,'silm-research-reference');researchSection.hidden=true;
 researchSection.setAttribute('aria-label','Ensaio primario de tracao: referencia documental');
 const researchTitle=U.element('strong','Ensaios documentados de tração · Fe');
 const researchNote=U.element('p','Fonte primária NIST · 21 ± 3 °C · pressão de ensaio não registrada. Valores exclusivos das amostras e taxas testadas, NÃO homologados na CNTP (0 °C, 1 atm). Estes números não calibram a animação.','silm-research-note');
 const researchPickerLabel=U.element('label','Amostra de ferro: ','silm-research-label');
 const researchPicker=document.createElement('select');researchPicker.id=prefix+'-research-sample';
 researchPickerLabel.htmlFor=researchPicker.id;
 researchPicker.setAttribute('aria-label','Selecionar amostra de ferro do ensaio NIST');
 researchPickerLabel.append(researchPicker);
 const researchPurity=U.element('p','','silm-research-purity');
 const researchScroll=U.element('div',null,'silm-research-scroll');
 const researchTable=U.element('table',null,'silm-research-table');
 const researchHead=document.createElement('thead'),researchHeadRow=document.createElement('tr');
 for(const heading of ['Taxa (s⁻¹)','Escoamento (MPa)','Resistência (MPa)','Ruptura (%)','Redução de área (%)']){
  const cell=document.createElement('th');cell.scope='col';cell.textContent=heading;researchHeadRow.append(cell);
 }
 researchHead.append(researchHeadRow);
 const researchBody=document.createElement('tbody');researchTable.append(researchHead,researchBody);
 researchScroll.append(researchTable);
 const researchSource=document.createElement('a');researchSource.href='https://doi.org/10.6028/NIST.TN.1879';researchSource.target='_blank';researchSource.rel='noopener noreferrer';
 researchSource.textContent='Fonte: NIST Technical Note 1879, Tabela 6';
 const scientificEvidence=SILM.researchEvidence;
 if(scientificEvidence)for(const sample of Object.values(scientificEvidence.samples)){
  const option=document.createElement('option');option.value=sample.code;option.textContent=sample.code+' · '+sample.name;
  researchPicker.append(option);
 }
 const fmt=value=>Number(value).toLocaleString('pt-BR',{maximumFractionDigits:6});
 function updateResearchRows(){
  if(!scientificEvidence)return;
  const selected=scientificEvidence.samples[researchPicker.value]||scientificEvidence.samples.K05;
  researchPurity.textContent=selected.name+' · pureza estimada a partir das impurezas declaradas: '+fmt(selected.purityPercent)+' %.';
  researchBody.replaceChildren();
  const rates=new Map([[1e-3,'10⁻³'],[1e-4,'10⁻⁴'],[1e-5,'10⁻⁵']]);
  for(const profile of scientificEvidence.bySample(26,selected.code)){
   const tr=document.createElement('tr');
   const vals=[rates.get(profile.strainRatePerSecond)||fmt(profile.strainRatePerSecond),
    profile.yieldStrengthMPa,profile.tensileStrengthMPa,
    profile.elongationAtFracturePercent,profile.reductionOfAreaPercent];
   for(const value of vals){const td=document.createElement('td');td.textContent=String(value);tr.append(td);}
   researchBody.append(tr);
  }
 }
 researchPicker.addEventListener('change',updateResearchRows);
 researchSection.append(researchTitle,researchNote,researchPickerLabel,researchPurity,researchScroll,researchSource);
 const opticalCandidate=SILM.createOpticalCandidatePanel?.({prefix});
 const electricalEvidence=SILM.createElectricalEvidencePanel?.({prefix});
 const intrinsicEvidence=SILM.createPGMIntrinsicPanel?.({prefix});
 const multistageEvidence=SILM.createMultistageResearchPanel?.({prefix});\n const sevenEvidence=SILM.createSevenConditionPanel?.({prefix});
 box.append(head,row,status,readings,opticalSection,researchSection,...(opticalCandidate?[opticalCandidate.root]:[]),thermalSection,...(electricalEvidence?[electricalEvidence.root]:[]),...(intrinsicEvidence?[intrinsicEvidence.root]:[]),...(multistageEvidence?[multistageEvidence.root]:[]),...(sevenEvidence?[sevenEvidence.root]:[]),list);container.append(box);
 function updateOptical(state,driveState){
  const service=SILM.materialEngine;
  const angle=driveState?.angle??35,finish=driveState?.finish??'polished';
  const numeric=state.metal?.atomicNumber;
  const cap=service?.capability(numeric,'luster');
  const validated=cap?.ok&&cap.mode==='reference-data';
  spectralBars.hidden=!validated||finish==='matte';
  opticalSection.dataset.evidence=validated?'tabulated':'qualitative';
  opticalSection.dataset.finish=finish;
  opticalSection.dataset.reference=validated?
   (cap.conditionMatch?.ok?'cntp-verified':'source-conditions-only'):'unavailable';
  opticalLink.hidden=!validated||typeof cap?.source?.url!=='string';
  if(!opticalLink.hidden)opticalLink.href=cap.source.url;
  if(!validated){
   opticalNote.textContent='A bancada na cena permite comparar reflexão polida e espalhamento fosco qualitativamente. Não há perfil óptico quantitativo de referência disponível para este metal.';
   opticalSource.textContent='Não atribuímos ao metal a refletância nem a cor de outro elemento. Mova lanterna e observador na cena.';
   return;
  }
  const sourceConditions=cap.conditions?.description||'Condições experimentais não informadas numericamente.';
  const sampleDetails=cap.source?.sample?'Amostra: '+cap.source.sample+'. ':'';
  if(finish==='matte'){
   opticalNote.textContent='Acabamento fosco: espalhamento apenas ilustrativo. Os valores experimentais n,k são de uma amostra específica; o modelo de Fresnel é para interface ideal lisa, não para superfície fosca.';
   opticalSource.textContent='Fonte: '+cap.source.authors+' ('+cap.source.year+'). '+sampleDetails+sourceConditions+' Não CNTP verificada.';
   return;
  }
  const angleDeg=Number.isFinite(angle)?angle:0;
  const values=channels.map(row=>service.optical(numeric,row.nm,angleDeg));
  const nValid=values.filter(v=>v.ok).length;
  if(!nValid){
   spectralBars.hidden=true;
   opticalNote.textContent='Não é possível calcular a refletância deste ângulo e intervalo espectral sem extrapolar a fonte.';
   opticalSource.textContent=sampleDetails+sourceConditions+' Sem extrapolação.';
   return;
  }
  for(let i=0;i<channels.length;i++){
   const v=values[i],channel=channels[i];
   channel.meter.hidden=!v.ok;
   if(v.ok){
    channel.meter.value=v.reflectance;
    channel.value.textContent=(100*v.reflectance).toLocaleString('pt-BR',{maximumFractionDigits:1})+' %';
   }else{
    channel.value.textContent=v.reasonCode==='SPECTRAL_OUT_OF_RANGE'?
     'Sem medição nesta faixa':'Indisponível';
   }
  }
  const atReference=!!cap.conditionMatch?.ok;
  const range=cap.source?.spectralRangeNm;
  const rangeNote=nValid<values.length&&Array.isArray(range)?
   ' Série disponível somente entre '+range[0]+' e '+range[1]+' nm; demais canais não são extrapolados.':'';
  opticalNote.textContent=cap.symbol+' · cálculo de Fresnel para interface lisa ideal ar–metal · luz não polarizada · incidência '+angleDeg+'°. '+
   'Os valores exibidos NÃO são medição direta de brilho, cor percebida ou aparência de uma peça real.'+rangeNote;
  opticalSource.textContent=(atReference?'Temperatura e pressão da referência coincidem, sem validar superfície e pureza. ':
   'ATENÇÃO: medição não homologada na CNTP (0 °C, 1 atm). ')+
   sampleDetails+sourceConditions+' Fonte: '+cap.source.authors+' ('+cap.source.year+
   '). Não considerar óxido, rugosidade ou a temperatura de deposição como temperatura da medição.';
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
  if(!opticalSection.hidden)updateOptical(state,info().drive);
  if(opticalCandidate)opticalCandidate.update({atomicNumber:compact?null:state.metal?.atomicNumber,active});
  const thermalReference=(!compact&&active==='thermal')?
   SILM.researchThermalNIST?.get?.(state.metal?.atomicNumber):null;
  thermalSection.hidden=!thermalReference;
  if(thermalReference){
   thermalTitle.textContent='Condutividade térmica · '+thermalReference.name;
   thermalValue.textContent=Number(thermalReference.conductivity).toLocaleString('pt-BR')+
    ' W/(m·K) · tabela de referência a 295 K';
   thermalNote.textContent='Dado compilado na tabela técnica do NIST para 295 K. Pureza, processamento e pressão da amostra não são identificados individualmente. NÃO é condutividade homologada na CNTP do SILM (273,15 K, 101325 Pa) e NÃO calibra a animação de calor.';
   thermalSection.dataset.evidence='compiled-source-conditions-only';
  }
  researchSection.hidden=active!=='ductility'||compact||state.metal?.atomicNumber!==26||!scientificEvidence;
  if(!researchSection.hidden)updateResearchRows();
  if(multistageEvidence)multistageEvidence.update({atomicNumber:compact?null:state.metal?.atomicNumber,active});\n  if(sevenEvidence)sevenEvidence.update({atomicNumber:compact?null:state.metal?.atomicNumber,active});
  if(electricalEvidence)electricalEvidence.update({atomicNumber:compact?null:state.metal?.atomicNumber,active});
  if(intrinsicEvidence)intrinsicEvidence.update({atomicNumber:compact?null:state.metal?.atomicNumber,active});
  box.dataset.active=active||'';list.hidden=!!active||compact;row.hidden=!active;
  if(!active){head.textContent=compact?'':'Escolha uma propriedade para investigar.';status.textContent=compact?'':'Uma experiência por vez; as experiências não alteram a estrutura científica.';
   for(const id of P.ids){const el=eligibility[id],able=availability(id),ok=el.status!=='unavailable'&&able.ok&&editable;starts[id].setAttribute('aria-disabled',String(!ok));
    reasons[id].textContent=el.status==='unavailable'?'Indisponível: '+el.message:!able.ok?able.message:!editable?'Disponível em Explorar.':(el.status==='available'?'Experiência qualitativa · dado tabelado':'Experiência qualitativa');}
   return;}
  const p=pr[active],L=P.limits;head.textContent=P.catalog[active].title;
  const show=(...ids)=>{for(const [k,b]of Object.entries(B))b.hidden=!ids.includes(k);};
  if(joule){
   const {input,values}=joule,format=n=>n.toLocaleString('pt-BR',{maximumFractionDigits:3});
   head.textContent='Elétrica + térmica → efeito Joule';
   // A fonte, o relógio e os mapas pertencem ao mesmo palco. Não duplicar
   // controles aqui: o painel Ver conserva apenas contexto e leituras.
   show();
   status.textContent='Corrente elétrica gera aquecimento na rede. Fonte, evolução, mapas e balanço no quadro Joule da barra inferior. Grandezas relativas · t '+format(values.time)+' · potência '+format(values.power)+' · elevação térmica média '+format(values.mean)+'.';
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
