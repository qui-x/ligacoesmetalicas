'use strict';
window.SILM=window.SILM||{};
/* Representação 2D/pseudo-3D da estrutura cristalina (0.5.x; renderizador comum desde a 0.11.x). Lê o estado
   científico; vista, camadas e seleção são gravadas pelas ações do domínio; projeção e câmera são representação
   (SILM.representation), nunca ciência. Unidades são botões acessíveis; a rede extensa, a célula e os vizinhos são
   camadas SVG decorativas do mundo. Sem linhas de ligação: o contorno da célula é geométrico e tracejado.
   Cena estável: célula + unidades na projeção escolhida (margem 0,12). A câmera enquadra a estrutura desenhada
   (com vizinhos, se visíveis; com margem maior na rede) e o usuário pode aproximar, afastar e deslocar.
   0.12.x — vista 3D: as mesmas unidades (botões), a mesma célula e a mesma rede, projetadas por uma câmera de órbita
   (SILM.crystal.layout3D) a partir das coordenadas científicas em Å. Nada é reconstruído a partir de pixels. Arrastar
   gira; zoom e deslocamento são a câmera 2D sobre a cena projetada; o Organizar e o calor continuam na isométrica. */
SILM.createCrystalView=(host,{scope,model,element,geometry:g,actions,moduleTitle='Explorar',note='',animateFrom=null,reducedMotion=()=>false,electrons:electronOptions=null,properties:propertyOptions=null,measure:measureOptions=null,calc:calcOptions=null,representation=null,observer=null,localFocus=false})=>{
 const U=SimCore.ExperienceUI,X=SILM.crystal,RD=SILM.renderer2d,RP=SILM.representation,m=g.model,name=element.name.toLocaleLowerCase('pt-BR'),NS='http://www.w3.org/2000/svg';
 const rep2=representation||{projection:()=>'isometric',setProjection:()=>{},camera:()=>null,saveCamera:()=>{},viewMode:()=>'2d',camera3D:()=>RP.camera3D(),available3D:()=>false,setViewMode:()=>{},setCamera3D:()=>{},fail3D:()=>{}};
 const mode3d=rep2.viewMode()==='3d',cameraKey=localFocus?(mode3d?'center3d':'center'):(mode3d?'crystal3d':'crystal');
 const structureName='Estrutura cristalina '+m.name+' de '+name;
 const root=U.element('section',null,'silm-assembly silm-crystal');root.dataset.editable='true';root.dataset.localFocus=String(localFocus);root.setAttribute('aria-labelledby','silm-assembly-title');
 const title=U.element('h1',structureName,'sr-only');title.id='silm-assembly-title';
 const meta=U.element('p','','sr-only');meta.id='silm-assembly-meta';
 const quickHost=document.getElementById('silm-view-quick-actions'),cameraHost=document.getElementById('silm-view-controls');
 if(quickHost){quickHost.hidden=false;quickHost.replaceChildren();}
 if(cameraHost)cameraHost.replaceChildren();
 const area=U.element('div',null,'silm-assembly-area'),stage=U.element('div',null,'silm-assembly-stage silm-crystal-stage');stage.id='silm-assembly-stage';stage.setAttribute('role','group');
 const units=U.element('div',null,'silm-assembly-units');units.setAttribute('role','group');units.setAttribute('aria-label','Unidades da estrutura de '+name);
 area.append(stage);
 const feedback=U.element('p','','sr-only silm-assembly-feedback');feedback.id='silm-assembly-feedback';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
 root.append(title,meta,area,feedback);host.append(root);
 const say=(text,{announce=true}={})=>{feedback.textContent=text;if(announce)SimCore.notifications.announce(text);};
 /* ---------- comandos rápidos: os mesmos estados de Ver → Camadas → Estrutura ---------- */
 // Ações estruturais ficam centralizadas em Ver → Observar; aqui permanece apenas o seletor de projeção.
 const projectionBox=U.element('div',null,'silm-quick-projection');
 const projectionIcon=document.createElementNS(NS,'svg');projectionIcon.setAttribute('viewBox','0 0 24 24');projectionIcon.setAttribute('fill','none');projectionIcon.setAttribute('stroke','currentColor');projectionIcon.setAttribute('stroke-width','1.8');projectionIcon.setAttribute('aria-hidden','true');
 const projectionShape=document.createElementNS(NS,'path');projectionShape.setAttribute('d','M3 6h18M6 3v6M18 3v6M5 13h14l-3 8H8z');projectionIcon.append(projectionShape);
 const projection=document.createElement('button');projection.type='button';projection.id='silm-crystal-projection';projection.className='silm-projection-trigger';
 projection.setAttribute('aria-label','Projeção e orientação da vista');projection.setAttribute('aria-haspopup','listbox');projection.setAttribute('aria-expanded','false');projection.setAttribute('aria-controls','silm-crystal-projection-list');
 const projectionValue=U.element('span','Isométrica','silm-projection-value'),projectionChevron=U.element('span','▾','silm-projection-chevron');projectionChevron.setAttribute('aria-hidden','true');projection.append(projectionValue,projectionChevron);
 projectionBox.title='Projeção e orientação da vista';projectionBox.append(projectionIcon,projection);quickHost?.append(projectionBox);
 const projectionMenu=U.element('div',null,'silm-projection-menu');projectionMenu.id='silm-crystal-projection-list';projectionMenu.hidden=true;projectionMenu.setAttribute('role','listbox');projectionMenu.setAttribute('aria-label','Projeções 2D e orientações 3D');
 const projectionChoices=[
  {group:'2D',items:RP.PROJECTIONS.map(id=>({value:id,label:RP.LABELS[id]}))},
  {group:'3D',items:RP.PRESETS.map(id=>({value:id==='3d'?'3d':'3d-'+id,label:RP.PRESET_LABELS[id]}))}
 ];
 const projectionOptions=new Map();
 for(const group of projectionChoices){
  const section=U.element('div',null,'silm-projection-group');section.setAttribute('role','group');section.setAttribute('aria-label',group.group);
  section.append(U.element('span',group.group,'silm-projection-group-label'));
  for(const item of group.items){
   const option=U.element('button',item.label,'silm-projection-option');option.type='button';option.dataset.value=item.value;option.setAttribute('role','option');option.setAttribute('aria-selected','false');
   if(group.group==='3D'&&!rep2.available3D()){option.disabled=true;option.title='Representação 3D indisponível neste ambiente.';}
   option.addEventListener('click',()=>chooseProjection(item.value));section.append(option);projectionOptions.set(item.value,option);
  }
  projectionMenu.append(section);
 }
 document.body.append(projectionMenu);
 const projectionLabel=value=>projectionChoices.flatMap(group=>group.items).find(item=>item.value===value)?.label||'Isométrica';
 const syncProjectionPicker=value=>{
  projectionValue.textContent=projectionLabel(value);
  projection.setAttribute('aria-label','Projeção e orientação da vista: '+projectionLabel(value));
  for(const [id,option]of projectionOptions)option.setAttribute('aria-selected',String(id===value));
 };
 const closeProjectionMenu=({restore=false}={})=>{
  if(projectionMenu.hidden)return;
  projectionMenu.hidden=true;projection.setAttribute('aria-expanded','false');
  if(restore)projection.focus({preventScroll:true});
 };
 const positionProjectionMenu=()=>{
  if(projectionMenu.hidden)return;
  const rect=projection.getBoundingClientRect(),vw=window.visualViewport?.width||window.innerWidth,vh=window.visualViewport?.height||window.innerHeight;
  projectionMenu.style.maxHeight=Math.max(120,Math.min(420,vh-24))+'px';
  const menuHeight=Math.min(projectionMenu.scrollHeight,420,vh-24),menuWidth=Math.min(Math.max(projectionMenu.offsetWidth,190),vw-24);
  const above=rect.top-12,below=vh-rect.bottom-12;
  const top=above>=Math.min(menuHeight,220)?Math.max(12,rect.top-menuHeight-8):Math.min(rect.bottom+8,Math.max(12,vh-menuHeight-12));
  const left=Math.max(12,Math.min(rect.left,vw-menuWidth-12));
  projectionMenu.style.left=left+'px';projectionMenu.style.top=top+'px';
 };
 const openProjectionMenu=()=>{
  projectionMenu.hidden=false;projection.setAttribute('aria-expanded','true');positionProjectionMenu();
  const selected=projectionMenu.querySelector('[role=option][aria-selected=true]:not(:disabled)');
  (selected||projectionMenu.querySelector('[role=option]:not(:disabled)'))?.focus({preventScroll:true});
 };
 const chooseProjection=value=>{
  closeProjectionMenu();
  if(value.startsWith('3d')){const preset=value==='3d'?'3d':value.slice(3);rep2.setCamera3D({preset,yaw:null,pitch:null},{silent:!mode3d});if(!mode3d)rep2.setViewMode('3d');}
  else if(mode3d)rep2.setViewMode('2d',{projection:value});else rep2.setProjection(value);
 };
 scope.listen(projection,'click',()=>projectionMenu.hidden?openProjectionMenu():closeProjectionMenu({restore:true}));
 scope.listen(projection,'keydown',event=>{
  if(['ArrowDown','ArrowUp','Enter',' '].includes(event.key)){event.preventDefault();openProjectionMenu();}
 });
 scope.listen(projectionMenu,'keydown',event=>{
  const options=Array.from(projectionMenu.querySelectorAll('[role=option]:not(:disabled)')),index=options.indexOf(document.activeElement);
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeProjectionMenu({restore:true});return;}
  if(event.key==='Tab'){closeProjectionMenu();return;}
  if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
   event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?options.length-1:(index+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;options[next]?.focus({preventScroll:true});
  }
 });
 scope.listen(document,'pointerdown',event=>{if(!projectionMenu.hidden&&!projectionMenu.contains(event.target)&&!projection.contains(event.target))closeProjectionMenu();});
 const repositionProjectionMenu=()=>positionProjectionMenu();
 scope.listen(window,'resize',repositionProjectionMenu);scope.listen(window,'scroll',repositionProjectionMenu,{capture:true});
 if(window.visualViewport){scope.listen(window.visualViewport,'resize',repositionProjectionMenu);scope.listen(window.visualViewport,'scroll',repositionProjectionMenu);}
 scope.cleanup(()=>projectionMenu.remove());
 scope.cleanup(()=>{if(quickHost){quickHost.replaceChildren();quickHost.hidden=true;}const notes=document.getElementById('silm-structure-notes');if(notes)notes.replaceChildren();});
 const instructions=U.element('p','Selecione uma unidade (clique, toque ou Enter) para identificar seu centro e consultar vizinhos. Setas percorrem as unidades; Esc limpa a seleção.'+(note?' '+note:''),'silm-assembly-help');instructions.id='silm-assembly-help';
 const cameraHelp=U.element('p',mode3d?'Vista 3D: arraste para girar; J e L giram na horizontal, I e K na vertical e P alterna perspectiva/ortográfica. Shift + arrastar desloca; + e − aproximam; F enquadra; 0 restaura.':'Vista: + e − aproximam e afastam, F enquadra, C centraliza, 0 restaura e Shift + setas deslocam. Arraste o fundo para deslocar; no celular, use dois dedos para aproximar.','silm-camera-help');
 const localStatus=localFocus?U.element('p','','silm-center-focus-summary'):null;
 if(localStatus){localStatus.setAttribute('role','status');localStatus.setAttribute('aria-live','polite');area.append(localStatus);}
 const legend=U.element('p',m.id==='HCP'?'Camadas A e B: empilhamento ABAB. Unidades da camada B têm anel interno tracejado. Na projeção Superior, a camada B aparece nos espaços entre os centros da camada A.':m.general?'Célula da ficha cristalográfica (grupo espacial '+m.spaceGroup+'), com posições geradas pelas operações de simetria registradas. O sólido continua em todas as direções: a célula é a unidade que se repete.':'O sólido continua em todas as direções: a célula é a unidade que se repete.','silm-crystal-legend');
 const electronLegend=U.element('p','Pontos ciano: elétrons de valência deslocalizados pela estrutura inteira. A distribuição representa a interação metálica coletiva, não ligações localizadas entre pares nem o número real de elétrons.','silm-electron-legend');
 const cellStatus=U.element('span','','silm-assist-badge');cellStatus.id='silm-crystal-cell-status';
 const kind=U.element('p','Representação didática: esferas reduzidas, sem escala física absoluta; proporções da célula a partir dos parâmetros tabelados.','silm-assembly-kind');
 let layout=null,scene=null,selectedPoint=null,unitItems=[],fitKey=null;
 let perspectiveButton=null,orbitLive=null,orbitFrame=0,orbiting=false,lastPreset=null;
 const R=RD.createStage(stage,{scope,area,viewport:area,idPrefix:'silm',camera:rep2.camera(cameraKey),reducedMotion,announce:text=>SimCore.notifications.announce(text),
  describe:()=>sceneDescription(),onCamera:c=>rep2.saveCamera(cameraKey,c),items:()=>unitItems,focusPoint:()=>selectedPoint,canArrowPan:()=>true,
  onUnitTap:id=>unitAction(id),onReset:()=>{if(mode3d){orbitLive=null;rep2.setCamera3D({preset:'3d',yaw:null,pitch:null},{silent:true});render();}else if(rep2.projection()!=='isometric')rep2.setProjection('isometric');},toolbarHost:cameraHost,
  onOrbit:mode3d?(dx,dy,phase)=>orbit(dx,dy,phase):null,
  extraButtons:mode3d?button=>{perspectiveButton=button('perspective','◫','Perspectiva (desligada: ortográfica)','P',()=>rep2.setCamera3D({projection:rep2.camera3D().projection==='perspective'?'orthographic':'perspective'}));return [perspectiveButton];}:null});
 if(mode3d)R.setDragMode('orbit');
 const worldSvg=cls=>{const s=document.createElementNS(NS,'svg');s.setAttribute('viewBox','0 0 100 100');s.setAttribute('aria-hidden','true');s.setAttribute('class','silm-crystal-svg '+cls);return s;};
 const latticeSvg=worldSvg('silm-lattice-layer'),cellSvg=worldSvg('silm-cell-layer'),ghostSvg=worldSvg('silm-ghost-layer');
 const group=(svg,cls)=>{const n=document.createElementNS(NS,'g');n.setAttribute('class',cls);svg.append(n);return n;};
 const latticeLayer=group(latticeSvg,'silm-lattice'),planeLayer=group(cellSvg,'silm-cell-planes'),cellLayer=group(cellSvg,'silm-cell-edges'),ghostLayer=group(ghostSvg,'silm-neighbor-ghosts');
 R.layer('lattice',latticeSvg,{camera:true});R.layer('unitCell',cellSvg,{camera:true});R.layer('neighbors',ghostSvg,{camera:true});
 // Navegação local: os vizinhos são sítios cristalográficos reais, não
 // moléculas nem unidades adicionadas ao estado científico.
 const localShellLayer=U.element('div',null,'silm-center-shell-layer');
 if(localFocus)R.layer('neighbors',localShellLayer,{camera:true});
 R.layer('structure',units,{camera:true});
 // 0.6.x: a distribuição eletrônica acompanha a rede; o contorno da célula não é parede.
 const electronLayer=SILM.createElectronLayer(stage,{scope,viewport:area,before:units,reducedMotion});R.layer('electrons',electronLayer.canvas);
 // Elétrons e propriedades mantêm seus controles completos no painel Ver; o palco recebe somente as camadas visuais.
 // 0.7.x: a sobreposição da experiência permanece sobre a cena; comandos ficam em Ver → Observar.
 const P=SILM.properties,overlay=SILM.createPropertyOverlay(stage,{before:units});R.layer('properties',overlay.root);
 const notesHost=document.getElementById('silm-structure-notes');
 if(notesHost){notesHost.replaceChildren();SILM.createSceneNotes(notesHost,{scope,items:[instructions,cameraHelp,legend,electronLegend,cellStatus,kind]});}
 let deform=null,heatTimer=false,nearest=null,lastControls=0;const D=c=>deform?deform(c):c;
 /* 0.17.x: deformação contínua (SILM.deformation) — orientação de ensaio, elástico amortecido e deslizamento de planos
    animado. A alça da prensa (ou da garra) é só para ponteiro; "Força aplicada" e os botões são a alternativa acessível. */
 const DF=SILM.deformation,deformCtl=DF?DF.controller(model,{reducedMotion}):null;let specimen=false,stableBox=null,stableKey='',align=null,alignKey='';
 // Câmera da vista no início da experiência (ou ao trocar de projeção 2D): a orientação de ensaio fica de frente para ela.
 const camAngles=proj=>mode3d?X.orientation3D(m,{...rep2.camera3D(),...(orbitLive||{})}):(X.views[proj]?.[m.id]||X.orientation3D(m,{}));
 if(deformCtl)scope.cleanup(deformCtl.subscribe(()=>{if(scope.active)render();}));
 const handle=U.element('div',null,'silm-press-handle');handle.hidden=true;handle.tabIndex=0;handle.setAttribute('role','slider');handle.setAttribute('aria-valuemin','0');handle.setAttribute('aria-valuemax','100');handle.setAttribute('aria-valuenow','0');stage.append(handle);
 // Teclado: setas aumentam ou diminuem a força (10 %), Home solta e End aplica a força máxima; sair da alça solta.
 scope.listen(handle,'keydown',e=>{if(!deformCtl)return;const k=e.key,sign=model.state.properties?.active==='ductility'?-1:1,step={ArrowDown:.1*sign,ArrowUp:-.1*sign,ArrowRight:.1,ArrowLeft:-.1,PageDown:.25*sign,PageUp:-.25*sign}[k];
  if(step!==undefined){e.preventDefault();e.stopPropagation();deformCtl.setLoad(deformCtl.load+step);}else if(k==='Home'||k==='Escape'){e.preventDefault();e.stopPropagation();deformCtl.setLoad(0);}else if(k==='End'){e.preventDefault();e.stopPropagation();deformCtl.setLoad(1);}});
 scope.listen(handle,'blur',()=>{if(!drag)deformCtl?.setLoad(0);});
 let drag=null;
 scope.listen(handle,'pointerdown',e=>{if(!deformCtl)return;e.preventDefault();e.stopPropagation();try{handle.setPointerCapture(e.pointerId);}catch{}drag={y:e.clientY,id:e.pointerId,base:deformCtl.load};handle.dataset.dragging='';});
 scope.listen(handle,'pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;e.stopPropagation();const sign=model.state.properties?.active==='ductility'?-1:1,h=Math.max(120,stage.clientHeight*.32);deformCtl.setLoad(drag.base+sign*(e.clientY-drag.y)/h);});
 const releaseDrag=e=>{if(!drag||(e&&e.pointerId!==drag.id))return;drag=null;delete handle.dataset.dragging;deformCtl.setLoad(0);};
 for(const type of ['pointerup','pointercancel','lostpointercapture'])scope.listen(handle,type,releaseDrag);
 /* 0.17.x: condução térmica contínua (SILM.thermal) — equação do calor no grafo de vizinhos, fonte de calor arrastável.
    Toque na fonte liga ou desliga; arrastar a move. Teclado com a fonte em foco: setas movem, Enter ou Espaço ligam e desligam. */
 const TH=SILM.thermal,thermalCtl=TH?TH.controller(model,{reducedMotion}):null;
 if(thermalCtl)scope.cleanup(thermalCtl.subscribe(()=>{if(scope.active)render();}));
 const heater=U.element('div',null,'silm-heat-handle');heater.hidden=true;heater.tabIndex=0;heater.setAttribute('role','button');stage.append(heater);
 let heaterDrag=null;
 const toggleHeat=()=>propertyOptions?.toggleHeat?.();
 function nearestPoint(points,p){
  let best=0,distance=Infinity;
  points.forEach((q,i)=>{const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<distance){distance=d;best=i;}});
  return best;
 }
 function moveHeatTo(point){
  if(!scene?.heatViewSites)return;
  const i=nearestPoint(scene.heatViewSites,point),v=scene.heatViewSites[i],r=scene.heatRefSites[i];
  thermalCtl.setSource({x:Math.max(0,Math.min(1,r.x+point.x-v.x)),y:Math.max(0,Math.min(1,r.y+point.y-v.y))});
  render();
 }
 const moveSource=(dx,dy)=>{const p=scene?.heatPoint;if(p)moveHeatTo({x:p.x+dx,y:p.y+dy});};
 scope.listen(heater,'pointerdown',e=>{if(!scene?.heatPoint)return;e.preventDefault();e.stopPropagation();try{heater.setPointerCapture(e.pointerId);}catch{}heaterDrag={x:e.clientX,y:e.clientY,id:e.pointerId,moved:false,start:scene.heatPoint};heater.dataset.dragging='';});
 scope.listen(heater,'pointermove',e=>{if(!heaterDrag||e.pointerId!==heaterDrag.id)return;e.stopPropagation();const dx=e.clientX-heaterDrag.x,dy=e.clientY-heaterDrag.y;if(!heaterDrag.moved&&Math.hypot(dx,dy)<6)return;heaterDrag.moved=true;
  const size=(R.size||stage.clientWidth||300)*(R.camera.zoom||1);
  moveHeatTo({x:heaterDrag.start.x+dx/size,y:heaterDrag.start.y+dy/size});});
 const heaterUp=e=>{if(!heaterDrag||(e&&e.pointerId!==heaterDrag.id))return;const tap=!heaterDrag.moved;heaterDrag=null;delete heater.dataset.dragging;if(tap&&e?.type==='pointerup')toggleHeat();};
 for(const type of ['pointerup','pointercancel','lostpointercapture'])scope.listen(heater,type,heaterUp);
 scope.listen(heater,'keydown',e=>{const step={ArrowLeft:[-.04,0],ArrowRight:[.04,0],ArrowUp:[0,-.04],ArrowDown:[0,.04]}[e.key];if(step){e.preventDefault();e.stopPropagation();moveSource(...step);}else if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();toggleHeat();}});
 /* 0.17.x (SILM.drive, transitórios): alça de intensidade na seta E (P3) e lanterna do brilho (P4). Arraste ou teclado. */
 const DR=SILM.drive,driveCtl=DR?DR.controller(model):null;
 if(driveCtl)scope.cleanup(driveCtl.subscribe(()=>{if(scope.active)render();}));
 const slider=(cls,label,min,max)=>{const n=U.element('div',null,cls);n.hidden=true;n.tabIndex=0;n.setAttribute('role','slider');n.setAttribute('aria-label',label);n.setAttribute('aria-valuemin',String(min));n.setAttribute('aria-valuemax',String(max));stage.append(n);return n;};
 const fieldKnob=slider('silm-field-knob','Intensidade do campo elétrico',5,100),lantern=slider('silm-lantern','Lanterna: ângulo de incidência (graus)',5,80);
 const stageXY=e=>{const r=stage.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*100,y:(e.clientY-r.top)/r.height*100};};
 let knobDrag=null,lampDrag=null;
 scope.listen(fieldKnob,'pointerdown',e=>{if(!driveCtl)return;e.preventDefault();e.stopPropagation();try{fieldKnob.setPointerCapture(e.pointerId);}catch{}knobDrag={id:e.pointerId};fieldKnob.dataset.dragging='';});
 scope.listen(fieldKnob,'pointermove',e=>{if(!knobDrag||e.pointerId!==knobDrag.id)return;e.stopPropagation();driveCtl.setIntensity((stageXY(e).x-55)/25);});
 scope.listen(lantern,'pointerdown',e=>{if(!driveCtl)return;e.preventDefault();e.stopPropagation();try{lantern.setPointerCapture(e.pointerId);}catch{}lampDrag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};lantern.dataset.dragging='';});
 scope.listen(lantern,'pointermove',e=>{if(!lampDrag||e.pointerId!==lampDrag.id)return;e.stopPropagation();if(!lampDrag.moved&&Math.hypot(e.clientX-lampDrag.x,e.clientY-lampDrag.y)<6)return;lampDrag.moved=true;
  const s=scene?.surfaceView;if(!s)return;const q=stageXY(e);driveCtl.setAngle(Math.atan2(s.x-q.x,s.y-q.y)*180/Math.PI);});
 const dragEnd=(node,get,set,tap)=>e=>{const d=get();if(!d||(e&&e.pointerId!==d.id))return;set(null);delete node.dataset.dragging;if(tap&&!d.moved&&e?.type==='pointerup')tap();};
 for(const type of ['pointerup','pointercancel','lostpointercapture']){scope.listen(fieldKnob,type,dragEnd(fieldKnob,()=>knobDrag,v=>{knobDrag=v;},null));scope.listen(lantern,type,dragEnd(lantern,()=>lampDrag,v=>{lampDrag=v;},()=>propertyOptions?.toggleLight?.()));}
 scope.listen(fieldKnob,'keydown',e=>{if(!driveCtl)return;const step={ArrowRight:.1,ArrowUp:.1,ArrowLeft:-.1,ArrowDown:-.1,PageUp:.25,PageDown:-.25}[e.key];
  if(step!==undefined){e.preventDefault();e.stopPropagation();driveCtl.setIntensity(driveCtl.intensity+step);}else if(e.key==='Home'||e.key==='End'){e.preventDefault();e.stopPropagation();driveCtl.setIntensity(e.key==='End'?1:.05);}});
 scope.listen(lantern,'keydown',e=>{if(!driveCtl)return;const step={ArrowRight:-5,ArrowUp:-5,ArrowLeft:5,ArrowDown:5}[e.key];
  if(step!==undefined){e.preventDefault();e.stopPropagation();driveCtl.setAngle(driveCtl.angle+step);}else if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();propertyOptions?.toggleLight?.();}});
 /* Enquadramento estável durante a deformação: caixa que cobre a forma de referência, a orientada e a de máximo
    deslizamento, para a câmera não "respirar" a cada quadro. */
 function deformFit(list,proj,view,id){
  const sys=DF?.system(g),sign=id==='ductility'?1:-1;if(!sys)return null;const k=[id,proj,view,list.length,alignKey].join('|');if(k===stableKey&&stableBox)return stableBox;
  const carts=[...g.cell.map(c=>c.cart),...(g.corners||[]),...list.map(u=>g.site(u.site).cart),...(view==='lattice'?DF.specimen(g).map(x=>x.cart):[])],camera=align;
  const T=[DF.transform(sys,{orient:1,camera}),DF.transform(sys,{progress:DF.steps(DF.LIMIT),sign,orient:1,camera}),DF.transform(sys,{orient:1,strain:sign*DF.EPS_YIELD,camera}),DF.transform(sys,{progress:DF.steps(DF.LIMIT),sign,orient:1,strain:sign*DF.EPS_YIELD,camera})];
  stableKey=k;stableBox=T.flatMap(t=>carts.map(t));return stableBox;
 }
 // 0.9.x: medição — pontos escolhidos nas unidades; sobreposição dos sítios científicos, no espaço do palco.
 const measureOverlay=measureOptions?SILM.createMeasureOverlay(stage):null;if(measureOverlay)R.layer('measurementOverlay',measureOverlay.root);
 const calcOverlay=calcOptions?SILM.createCalcOverlay(stage):null;if(calcOverlay)R.layer('calculationOverlay',calcOverlay.root);
 const labels=R.labelsLayer(),selection=R.selectionLayer();
 // 0.12.x: eixos x, y e z no canto da cena 3D — referência visual (não é a rede cristalina nem um grid de medida).
 const axes=mode3d?document.createElementNS(NS,'svg'):null;
 if(axes){axes.setAttribute('viewBox','0 0 64 64');axes.setAttribute('aria-hidden','true');axes.setAttribute('class','silm-axes');area.append(axes);}
 function drawAxes(){
  if(!axes)return;axes.replaceChildren();const o=layout.project(g.center),len=g.vectors[0][0];
  for(const [name,v,dash] of [['x',[1,0,0],''],['y',[0,1,0],'4 2'],['z',[0,0,1],'1.5 2']]){const q=layout.project([g.center[0]+v[0]*len,g.center[1]+v[1]*len,g.center[2]+v[2]*len]),dx=q.x-o.x,dy=q.y-o.y,n=Math.hypot(dx,dy);
   const ex=32+(n>1e-6?dx/n:0)*22*Math.min(1,n/(len*layout.scale||1)),ey=32+(n>1e-6?dy/n:0)*22*Math.min(1,n/(len*layout.scale||1));
   axes.append(svgEl('path',{d:'M32 32L'+ex.toFixed(2)+' '+ey.toFixed(2),'stroke-dasharray':dash,class:'silm-axis silm-axis-'+name}));
   const t=svgEl('text',{x:32+(ex-32)*1.22,y:32+(ey-32)*1.22+3,'text-anchor':'middle',class:'silm-axis-label'});t.textContent=name;axes.append(t);}
 }
 function scheduleHeat(pr=model.state.properties){if(thermalCtl||heatTimer||!propertyOptions?.advanceHeat||pr?.active!=='thermal'||!pr.thermal.heating||pr.thermal.stage>=P.limits.heatStages||reducedMotion())return;
  heatTimer=true;scope.timeout(()=>{heatTimer=false;if(document.hidden){scheduleHeat();return;}propertyOptions.advanceHeat();},900);}

 const nodes=new Map();
 let focusId=null,frame=0,unitFraction=.1;
 /* 0.9.1: o símbolo acompanha o diâmetro da esfera na tela e some quando não cabe (a unidade continua nomeada por aria-label). */
 const sizeSymbols=()=>{const px=(R.size||300)*unitFraction*R.camera.zoom;stage.style.setProperty('--unit-px',px.toFixed(1)+'px');root.dataset.symbols=px<16?'hidden':'shown';root.dataset.labelsFit=px<20?'no':'yes';
  // Alvo mínimo de 24 px na tela (com folga): margem transparente em coordenadas do palco, descontando zoom e profundidade.
  const visual=(R.size||300)*unitFraction,zoom=R.camera.zoom||1;for(const node of nodes.values()){const ds=node.__depthScale||1;node.style.setProperty('--hit-pad',Math.max(0,(25/(zoom*ds)-visual)/2).toFixed(2)+'px');}};
 const shortRole=m.general?{corner:'V',edge:'Ar',face:'F',interior:'I',outside:''}:{corner:'V',face:'F',body:'C','base-vertex':'A','base-center':'A',interior:'B',outside:''};
 /* 0.10.x: fração de cada centro que pertence à célula (contagem do número efetivo). */
 const SHARE={BCC:{corner:'1/8',body:'1'},FCC:{corner:'1/8',face:'1/2'},HCP:{'base-vertex':'1/6','base-center':'1/2',interior:'1'},general:{corner:'1/8',edge:'1/4',face:'1/2',interior:'1'}};
 const shares=SHARE[m.general?'general':m.id];
 /* Par de centros em contato (vizinhos mais próximos), para o destaque de raio e empacotamento. */
 function contactPair(list){const byKey=new Map(list.map(u=>[X.key(u.site),u])),corner=list.find(u=>g.role(u.referenceSite||u.site).role==='corner'||g.role(u.referenceSite||u.site).role==='base-vertex')||list[0];if(!corner)return null;
  const near=g.neighbors(corner.site).list.find(n=>byKey.has(n.key));return near?[corner,byKey.get(near.key)]:null;}
 const svgEl=(tag,attrs)=>{const el=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,String(v));return el;};
 // O cursor percorre o mesmo recorte e a mesma projeção utilizados pelas propriedades.
 const initialStructure=model.state.structure;
 const initialUnit=initialStructure.units.find(u=>u.id===initialStructure.crystallography.representation.selectedUnitId);
 const navigator=SILM.createLatticePanel({geometry:g,scope,initialKey:rep2.latticeFocus?.()||(initialUnit&&X.key(initialUnit.site)),initialAnchor:initialUnit?.site,onFocus(site,anchor){
  const unit=model.state.structure.units.find(u=>X.key(u.site)===anchor.key);
  rep2.setLatticeFocus?.(site.key);
  if(layout)R.setCamera({...R.camera,mode:'free'},{settled:false});
  if(unit&&model.state.structure.crystallography.representation.selectedUnitId!==unit.id)actions.select(unit.id);
  render();
  if(layout)R.revealBounds(RD.boundsOf(scene.drawn),layout.project(D(site.cart)),unitFraction*.72);
 }});
 const cellCart=cart=>scene?.rep.view==='lattice'?navigator.cursor.displayCart(cart):cart;
 root.insertBefore(navigator.status,area);
 // Os comandos acompanham a câmera inclusive na vista expandida.
 if(cameraHost)cameraHost.after(navigator.root);
 else root.append(navigator.root);
 scope.cleanup(()=>navigator.root.remove());
 const fieldNames={temperature:'Temperatura',potential:'Potencial elétrico',dissipation:'Dissipação Joule'};
 let jouleControls=null,jouleSettings=null;
 const formatRelative=value=>value.toLocaleString('pt-BR',{maximumFractionDigits:3});
 // Reutiliza os comandos de Observar e as mesmas restrições científicas em cada referência.
 if(propertyOptions?.quickActions&&model.state.module.active==='explorar'){
  const choices=[
   ['electrons','Mar de elétrons',[]],
   ['electrical','Campo elétrico',['electrical']],['thermal','Fonte de calor',['thermal']],
   ['malleability','Compressão',['malleability']],['ductility','Tração',['ductility']],['luster','Luz',['luster']],
   ['joule','Efeito Joule · corrente e calor',['electrical','thermal']],
   ['heatElectrical','Campo elétrico + calor externo',['electrical','thermal']],
   ['malleabilityElectrical','Compressão + campo elétrico',['malleability','electrical']],
   ['ductilityElectrical','Tração + campo elétrico',['ductility','electrical']]
  ];
  const control=document.createElement('select');control.setAttribute('aria-label','Aplicar estímulo na rede');control.className='silm-lattice-stimulus';
  const prompt=document.createElement('option');prompt.value='';prompt.textContent='Estímulos';control.append(prompt);
  for(const [id,label,required]of choices){
   const option=document.createElement('option');option.value=id;option.textContent=label;
   option.disabled=required.some(prop=>!propertyOptions.canStudy(prop));
   control.append(option);
  }
  scope.listen(control,'change',()=>{
   const choice=choices.find(([id])=>id===control.value);control.value='';
   if(!choice||model.state.module.active!=='explorar'||choice[2].some(prop=>!propertyOptions.canStudy(prop)))return;
   if(choice[0]==='joule')propertyOptions.quickActions.beginJoule();
   else if(choice[0]==='electrons')propertyOptions.quickActions.toggleElectrons();
   else if(choice[2].length===2)propertyOptions.quickActions.activateCombination(choice[0]);
   else propertyOptions.quickActions.toggleProperty(choice[0]);
  });
  navigator.root.append(control);
  jouleControls=U.element('span',null,'silm-joule-controls');jouleControls.hidden=true;
  jouleSettings=document.createElement('select');jouleSettings.setAttribute('aria-label','Condições do efeito Joule');
  for(const [value,label] of [['','Condições Joule'],['voltage','Tensão imposta'],['current','Corrente imposta'],['ambient','Terminais à temperatura ambiente'],['insulated','Amostra isolada'],['supply','Ligar ou desligar alimentação'],['external','Ligar ou desligar calor externo'],['temperature','Ver temperatura'],['potential','Ver potencial elétrico'],['dissipation','Ver dissipação Joule'],['readings','Leituras e balanço de energia'],['restore','Reiniciar ensaio'],['end','Encerrar efeito Joule']]){
   const option=document.createElement('option');option.value=value;option.textContent=label;jouleSettings.append(option);
  }
  scope.listen(jouleSettings,'change',()=>{const action=jouleSettings.value;jouleSettings.value='';propertyOptions.quickActions.jouleAction(action,jouleSettings);});
  const step=U.element('button','Avançar 0,5');step.type='button';step.setAttribute('aria-label','Avançar meio intervalo no efeito Joule');step.title='Avançar meio intervalo no efeito Joule';step.classList.add('silm-joule-step');
  scope.listen(step,'click',()=>propertyOptions.quickActions.jouleAction('step'));
  jouleControls.append(jouleSettings,step);navigator.root.append(jouleControls);

 }

 const pt=p=>{const q=layout.project(D(p));return {x:q.x*100,y:q.y*100,depth:q.depth};};
 /* Escala de profundidade: no 2D e na ortográfica, a pista da 0.5.x; na perspectiva, o fator da própria projeção. */
 const dscale=q=>layout?.perspective?Math.max(.5,Math.min(1.7,q.size)):1.08-.16*q.depth;
 function drawCell(forced){
  cellLayer.replaceChildren();planeLayer.replaceChildren();if(localFocus||!scene.rep.unitCell&&!forced)return;
  for(const [a,b]of g.edges()){const p=pt(cellCart(a)),q=pt(cellCart(b));cellLayer.append(svgEl('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,'data-back':String((p.depth+q.depth)/2>.55)}));}
  if(m.id==='HCP'){const h=g.vectors[2][2];for(const z of [0,h]){const ring=[0,1,2,3,4,5].map(k=>{const a=g.vectors[0][0];return pt(cellCart([a*Math.cos(k*Math.PI/3),a*Math.sin(k*Math.PI/3),z]));});planeLayer.append(svgEl('polygon',{points:ring.map(p=>p.x+','+p.y).join(' ')}));}}
 }
 /* Rede extensa em janela: só os sítios perto da área visível (com esmaecimento a partir do centro da vista) e no
    máximo 260 círculos. O sólido continua; a rede desenhada não é infinita nem é estado científico. */
 const LATTICE_CAP=260;
 function latticeWindow(view={w:R.visible(),c:R.toScene({x:.5,y:.5}),zoom:R.camera.zoom}){
  if(localFocus||scene.rep.view!=='lattice')return [];const {w,c:cv}=view,pad=.06,occupied=new Set(scene.list.map(u=>X.key(u.site))),reach=.62/view.zoom;
  // Na deformação, a rede vira a amostra: todos os sítios do bloco, sem esmaecimento, deslizando com as unidades.
  const sys=specimen&&DF?DF.system(g):null,pr=scene.pr||{},n=pr?.active==='malleability'?pr.malleability.compression:pr?.active==='ductility'?pr.ductility.elongation:0;
  const out=[];for(const s of (specimen&&DF?DF.specimen(g):navigator.cursor.contextSites)){if(occupied.has(s.key))continue;const q=layout.project(D(s.cart));if(specimen){out.push({q,fade:1,block:DF.block(sys,s.cart,n)});continue;}const T=scene.heatTemps?.get(s.key);if(q.x<w.x0-pad||q.x>w.x1+pad||q.y<w.y0-pad||q.y>w.y1+pad)continue;
   const fade=Math.max(.07,1-Math.hypot(q.x-cv.x,q.y-cv.y)/reach);out.push({q,fade:T===undefined?fade:Math.max(fade,.7),heat:T,key:s.key});}
  out.sort((a,b)=>b.fade-a.fade);return out.slice(0,LATTICE_CAP);
 }
 function drawLattice(sites){
  latticeLayer.replaceChildren();
  for(const {q,fade,block,heat,key}of [...sites].sort((a,b)=>b.q.depth-a.q.depth)){
   const value=scene.fieldMap?.get(key),fraction=value===undefined?heat:value/(1+value);
   latticeLayer.append(svgEl('circle',{cx:q.x*100,cy:q.y*100,r:unitFraction*36*dscale(q),opacity:(.14+.42*fade).toFixed(3),...(block===undefined?{}:{class:block%2?'silm-specimen silm-block-odd':'silm-specimen'}),...(fraction===undefined?{}:{style:'fill:color-mix(in srgb,var(--silm-field-color,var(--silm-heat)) '+Math.round(fraction*85)+'%,var(--silm-bronze))'})}));
  }
 }
 function createNode(u){
  const node=U.element('button',null,'silm-unit silm-crystal-unit');node.type='button';node.dataset.unitId=u.id;node.tabIndex=-1;node.setAttribute('aria-describedby','silm-assembly-help');
  const core=U.element('span',element.symbol,'silm-unit-core');core.setAttribute('aria-hidden','true');const tag=U.element('span','','silm-site-label');tag.setAttribute('aria-hidden','true');
  // Identificação de centros é uma camada própria de Observar; não depende dos rótulos auxiliares de Camadas.
  const centerTag=U.element('span','','silm-observer-center-tag');centerTag.setAttribute('aria-hidden','true');centerTag.hidden=true;
  // O corpo guarda o tamanho visual da esfera; o botão em volta cresce até 24 px na tela (alvo de toque, WCAG 2.5.8).
  const body=U.element('span',null,'silm-unit-body');body.setAttribute('aria-hidden','true');body.append(core,tag);node.append(body,centerTag);units.append(node);return node;
 }
 const projectionName=()=>RP.LABELS[rep2.projection()]||RP.LABELS.isometric;
 const orientationNow=()=>layout?.orientation||null;
 function viewName(){
  if(!mode3d)return 'Projeção '+projectionName().toLocaleLowerCase('pt-BR');
  const c=rep2.camera3D(),o=orientationNow(),preset=orbitLive?null:c.preset;
  return 'Vista 3D '+(c.projection==='perspective'?'em perspectiva':'ortográfica')+(preset&&preset!=='3d'?', '+RP.PRESET_LABELS[preset].toLocaleLowerCase('pt-BR'):o?', girada '+Math.round(o[0])+'° na horizontal e '+Math.round(o[1])+'° na vertical':'')+'. Eixos x, y e z no canto: referência visual, não é a rede';
 }
 function sceneDescription(){
  if(!scene)return '';const r=scene.rep,sel=r.selectedUnitId?scene.list.findIndex(u=>u.id===r.selectedUnitId):-1;
  return structureName+'. '+viewName()+'; '+(localFocus?'ambiente local do centro metálico':r.view==='lattice'?'rede extensa':'célula unitária')+'. '+(observer?.centers?'Centros metálicos identificados. ':'')+(sel>=0?'Unidade '+(sel+1)+' selecionada'+(r.neighbors?', com os vizinhos imediatos destacados':'')+'.':'Nenhuma unidade selecionada.')+
   (scene.heatAside?' Nesta projeção, a região aquecida (contorno tracejado) não fica à esquerda; a experiência é a mesma da vista isométrica.':'');
 }
 function render(){
  const S=model.state,s=S.structure;if(!s||s.mode!=='crystalline')return;const r=s.crystallography.representation,baseUnits=s.units,pr=S.properties,active=pr?.active||null;const alignNow=(mode3d?'3d':rep2.projection())+'|'+(pr?.startedAt||'');if(alignNow!==alignKey){alignKey=alignNow;align=camAngles(rep2.projection());}
  const list=r.view==='lattice'?baseUnits.map(u=>({...u,referenceSite:u.site,site:navigator.cursor.displaySite(u.site)})):baseUnits;
  const focusSite=localFocus?navigator.cursor.site:null;
  const focusShell=focusSite?g.neighbors(focusSite):null;
  const localKey=focusSite?.key||null;
  deformCtl?.sync();const live=deformCtl?.transform(align)||null;deform=live||P.deformer(S,g,align);const deforming=!!live||(!!deform&&['malleability','ductility'].includes(active));specimen=deforming;
  const proj=rep2.projection(),cam3=mode3d?{...rep2.camera3D(),...(orbitLive||{})}:null,selectValue=mode3d?(cam3.preset&&cam3.preset!=='3d'?'3d-'+cam3.preset:'3d'):proj;
  syncProjectionPicker(selectValue);root.dataset.projection=mode3d?'3d':proj;root.dataset.viewMode=mode3d?'3d':'2d';
  if(perspectiveButton){const on=cam3.projection==='perspective';perspectiveButton.setAttribute('aria-pressed',String(on));perspectiveButton.setAttribute('aria-label',on?'Perspectiva (ligada)':'Perspectiva (desligada: ortográfica)');}
  const calcMark=calcOptions?.marks?.()||null;root.dataset.calc=calcMark?.mode||'';
  root.dataset.view=r.view;root.dataset.labels=String(r.labels);root.dataset.cell=String(r.unitCell);root.dataset.observerCenters=String(observer?.centers===true);
  for(const [id,node]of nodes)if(!list.some(u=>u.id===id)){node.remove();nodes.delete(id);}
  const selected=r.selectedUnitId,selectedUnit=selected?list.find(u=>u.id===selected):null,neighbors=localFocus?focusShell:r.neighbors&&selectedUnit?g.neighbors(selectedUnit.site):null,neighborKeys=new Set(neighbors?.list.map(x=>x.key)||[]);
  // Cena estável (sem vizinhos nem margem de rede): a câmera, e não o layout, enquadra o que estiver visível.
  // Durante a deformação, a cena enquadra também a amostra orientada e as formas extremas (sem "respirar" a cada quadro).
  const extra=deforming&&!mode3d?deformFit(baseUnits,proj,r.view,active)||[]:[],
   fitCarts=localFocus?[focusSite.cart,...focusShell.list.map(site=>site.cart)]:
    [...g.cell.map(c=>c.cart),...(g.corners||[]),...baseUnits.map(u=>g.site(u.site).cart),...extra];
  if(mode3d){try{
   const center=localFocus?focusSite.cart:r.view==='lattice'?navigator.cursor.displayCart(g.center):g.center;
   const refFit=r.view==='lattice'?fitCarts.map(cart=>navigator.cursor.displayCart(cart)):fitCarts;
   layout=X.layout3D({...g,center},refFit,cam3);}catch(error){rep2.fail3D(error);layout=X.layoutFor(g,fitCarts,{margin:.12,projection:proj});}}
  else layout=X.layoutFor(localFocus?{...g,center:focusSite.cart}:g,fitCarts,{margin:localFocus?.09:.12,projection:proj});
  // Distância entre vizinhos: fixa para a geometria (calculada uma vez, não a cada quadro).
  const d=nearest??=g.neighbors(g.cell[0]).distances[0];unitFraction=Math.min(.11,Math.max(.045,d*layout.scale*.3));stage.style.setProperty('--unit-size',(unitFraction*100).toFixed(3)+'%');
  scene={rep:r,list,selected,neighbors,active,module:S.module.active};
  const drawn=list.map(u=>layout.project(D(g.site(u.site).cart)));
  list.forEach((u,i)=>{
   let node=nodes.get(u.id);if(!node){node=createNode(u);nodes.set(u.id,node);}
   const p=drawn[i],info=g.role(u.referenceSite||u.site);node.dataset.site=X.key(u.site);
   if(!node.dataset.animating){node.style.left=(p.x*100)+'%';node.style.top=(p.y*100)+'%';}
   // Ordem dentro da camada da estrutura: profundidade; a selecionada fica por cima (o anel de seleção vem da camada própria).
   node.style.zIndex=String(selected===u.id?200:10+Math.round((1-p.depth)*100));node.__depthScale=dscale(p);node.style.setProperty('--depth-scale',node.__depthScale.toFixed(3));node.style.setProperty('--depth-fade',(1-.22*p.depth).toFixed(3));
   node.dataset.role=info.role;node.dataset.layer=info.layer||'';node.dataset.placement=u.placement;node.querySelector('.silm-site-label').textContent=calcMark?.mode==='fractions'?(shares[info.role]||''):(shortRole[info.role]||'');
   const centerTag=node.querySelector('.silm-observer-center-tag');centerTag.textContent='M'+(i+1)+(shortRole[info.role]?' · '+shortRole[info.role]:'');centerTag.hidden=!observer?.centers;
   if(localFocus&&u.id===selected)node.dataset.localCenter='';else delete node.dataset.localCenter;
   // Rede durante a deformação: a amostra é uma fatia fina; unidades da célula fora dela ficam esmaecidas.
   if(specimen&&r.view==='lattice'&&DF&&!DF.inSlab(g,g.site(u.site).cart))node.dataset.outside='';else delete node.dataset.outside;
   {const k=specimen&&DF?DF.block(DF.system(g),g.site(u.site).cart,active==='malleability'?pr.malleability.compression:active==='ductility'?pr.ductility.elongation:0):0;if(k%2)node.dataset.block='odd';else delete node.dataset.block;}
   const flag=neighborKeys.has(X.key(u.site));if(flag)node.dataset.neighbor='';else delete node.dataset.neighbor;
   node.setAttribute('aria-pressed',String(selected===u.id));
   node.setAttribute('aria-label','Unidade de '+name+' '+(i+1)+' de '+list.length+': '+info.label+(u.placement==='crystallographic'?', completada pelo SILM':'')+(flag?', vizinha imediata da unidade selecionada':''));
  });
  unitItems=list.map((u,i)=>({id:u.id,x:drawn[i].x,y:drawn[i].y,r:unitFraction/2*dscale(drawn[i]),depth:drawn[i].depth,priority:selected===u.id?1:0}));
  selectedPoint=selectedUnit?drawn[list.indexOf(selectedUnit)]:null;
  const roving=selected||(focusId&&nodes.has(focusId)?focusId:list[0]?.id);for(const [id,node]of nodes)node.tabIndex=id===roving?0:-1;
  // Durante a deformação, o contorno da célula sai (os cantos ficam em blocos diferentes depois de deslizar).
  if(deforming){cellLayer.replaceChildren();planeLayer.replaceChildren();const sys=DF?.system(g),n=active==='malleability'?pr.malleability.compression:active==='ductility'?pr.ductility.elongation:0,half=(scene.rep.view==='lattice'?3.6:1.2)*(nearest||1);
   // Planos já deslizados: linha tracejada ao longo da direção de deslizamento.
   if(sys)for(let i=0;i<n;i++){const t=DF.trace(sys,i,half);if(!t)continue;const a=pt(t[0]),b=pt(t[1]);planeLayer.append(svgEl('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:'silm-slip-plane'}));}
   scene.slipCount=n;}
  else{scene.slipCount=0;drawCell(calcMark?.mode==='edges');}
  ghostLayer.replaceChildren();
  if(neighbors&&!localFocus){const occupied=new Set(list.map(u=>X.key(u.site)));for(const n of neighbors.list)if(!occupied.has(n.key)){const q=layout.project(D(n.cart));ghostLayer.append(svgEl('circle',{cx:q.x*100,cy:q.y*100,r:unitFraction*50*dscale(q)}));}}
  // Visualização dedicada: a geometria dos vizinhos vem exclusivamente do
  // motor SILM. Tocar um vizinho transfere o foco, como no visualizador do
  // QuímiX, sem produzir nova estrutura nem uma ligação localizada.
  if(localFocus){
   localShellLayer.replaceChildren();
   for(const [index,site] of focusShell.list.entries()){
    const p=layout.project(D(site.cart));
    const button=U.element('button',element.symbol,'silm-center-neighbor');
    button.type='button';button.dataset.siteKey=site.key;
    button.style.left=(p.x*100)+'%';button.style.top=(p.y*100)+'%';
    button.style.setProperty('--local-depth',String(p.depth));
    button.setAttribute('aria-label','Focalizar vizinho '+(index+1)+' de '+focusShell.list.length+
     ', distância '+focusShell.distances[index].toLocaleString('pt-BR',{maximumFractionDigits:3})+' ångströms');
    button.title='Focalizar centro vizinho '+(index+1);
    button.disabled=!navigator.cursor.has(site.key);
    button.addEventListener('click',()=>{if(!button.disabled)navigator.visit(site);});
    localShellLayer.append(button);
   }
   localStatus.textContent=element.symbol+' · centro em foco · '+focusShell.list.length+
    ' primeiros vizinhos · distância '+(focusShell.distances[0]||0).toLocaleString('pt-BR',{maximumFractionDigits:3})+' Å · modelo cristalográfico';
   root.dataset.centerSite=localKey;
   root.dataset.coordination=String(focusShell.list.length);
  }
  // Caixa de interesse da câmera: estrutura desenhada (com a deformação da propriedade e os vizinhos visíveis).
  const cellDrawn=[...g.cell.map(c=>c.cart),...(g.corners||[])].map(p=>layout.project(D(cellCart(p))));
  // Trocar a projeção ou a vista (Célula/Rede) reenquadra; mostrar vizinhos ou deformar mantém a câmera do usuário.
  const presetKey=mode3d?(cam3.preset||lastPreset||'3d'):'',key=(mode3d?'3d:'+presetKey:proj)+'|'+r.view+(deforming?'|deformação':'')+
   (localFocus?'|local:'+localKey:''),refit=fitKey!==null&&fitKey!==key&&(localFocus||R.camera.mode!=='fit');fitKey=key;if(mode3d&&cam3.preset)lastPreset=cam3.preset;
  if(refit)R.setCamera({...R.camera,mode:'fit'},{settled:false});
  const box=localFocus?RD.boundsOf([layout.project(D(focusSite.cart)),...focusShell.list.map(site=>layout.project(D(site.cart)))]):
   extra.length?RD.boundsOf(extra.map(c=>layout.project(c))):RD.boundsOf([...cellDrawn,...drawn]),
   boxMargin=localFocus?.1:extra.length?.17:.12;
  R.setInterest(box,{margin:boxMargin});if(refit)rep2.saveCamera(cameraKey,R.camera);
  sizeSymbols();
  // Calor e níveis: sempre sobre a projeção de referência (isométrica, congelada), para que a vista nunca mude a experiência.
  const refLayout=X.layout(g,[...g.cell.map(c=>c.cart),...(g.corners||[]),...baseUnits.map(u=>g.site(u.site).cart)].map(D),{margin:.12});
  const refCentres=list.map(u=>refLayout.project(D(g.site(u.site).cart))),refSpacing=d*refLayout.scale;
  // Calor + corrente (0.17.x): a mesma fonte de calor também na condutividade elétrica (transitória, sem gravar).
  const coupled=propertyOptions?.jouleReading?.(S);
  if(jouleControls)jouleControls.hidden=!coupled;
  if(coupled){navigator.reading.setAttribute('aria-live','polite');navigator.reading.tabIndex=0;}
  else{navigator.reading.removeAttribute('aria-live');navigator.reading.removeAttribute('tabindex');}
  scene.coupled=coupled;
  if(coupled){root.dataset.fieldMap=coupled.layer;scene.fieldMap=coupled.values.profiles[coupled.layer];}
  else delete root.dataset.fieldMap;
  const continuous=!coupled&&!!thermalCtl&&(active==='thermal'||active==='electrical');let heated=active==='thermal'&&(pr.thermal.heating||pr.thermal.stage>0),levels=[],sources=[],temps=null;
  if(coupled){
   // A cor satura suavemente; a leitura numérica conserva a temperatura relativa calculada.
   temps=new Map([...coupled.field].map(([k,t])=>[k,t/(1+t)]));
   scene.heatTemps=temps;heated=coupled.values.maximum>0;
   levels=list.map(u=>TH.level(temps.get(X.key(u.site))||0));sources=list.map(()=>false);
  }else if(continuous){
   // Grafo: as unidades e, na vista Rede, a rede extensa — com os vizinhos imediatos pela distância da geometria do banco.
   const assembled=new Set(baseUnits.map(u=>X.key(u.site)));
   const sites=[...baseUnits.map(u=>g.site(u.site)),...(r.view==='lattice'?g.lattice().filter(s=>!assembled.has(s.key)):[])],ids=sites.map(s=>s.key);
   thermalCtl.setGraph(r.view+'|'+ids.join(';'),sites.map(s=>s.cart),d,ids);
   const proj=sites.map(s=>refLayout.project(s.cart));
   scene.heatRefSites=proj;scene.heatViewSites=sites.map(s=>layout.project(D(s.cart)));
   // Posição inicial: sobre a unidade mais à esquerda da célula (sempre visível), como a região aquecida das versões anteriores.
   if(!thermalCtl.source){const units=proj.slice(0,list.length),left=units.reduce((a,p)=>p.x<a.x?p:a,units[0]);thermalCtl.setSource({x:left.x,y:left.y});}
   const src=thermalCtl.source,reach=Math.max(.04,d*refLayout.scale*.6),near=proj.map((p,i)=>[i,Math.hypot(p.x-src.x,p.y-src.y)]).filter(([,dd])=>dd<=reach).map(([i])=>i);
   if(!near.length){const best=proj.map((p,i)=>[i,Math.hypot(p.x-src.x,p.y-src.y)]).sort((a,b)=>a[1]-b[1])[0];if(best&&best[1]<=reach*2)near.push(best[0]);}
   const index=nearestPoint(proj,src),v=scene.heatViewSites[index];
   scene.heatPoint={x:v.x+src.x-proj[index].x,y:v.y+src.y-proj[index].y};
   thermalCtl.sync();const heatOn=thermalCtl.reading().on;thermalCtl.setPinned(heatOn?near:[]);temps=thermalCtl.temperatures();heated=active==='thermal'||[...temps.values()].some(v=>v>.01);scene.heatOn=heatOn;
   const pinned=new Set(heatOn?near.map(i=>ids[i]):[]);levels=list.map(u=>TH.level(temps.get(X.key(u.site))||0));sources=list.map(u=>pinned.has(X.key(u.site)));scene.heatTemps=temps;
  }else{scene.heatTemps=null;if(heated){levels=P.heat(refCentres,refSpacing,pr.thermal.stage);sources=P.heatSources(refCentres);}}
  const lit=new Set(),surface=[];if(active==='luster'){const zs=list.map(u=>g.site(u.site).cart[2]),top=Math.max(...zs);list.forEach((u,i)=>{if(zs[i]>=top-.05){surface.push(i);if(pr.luster.light)lit.add(u.id);}});}scene.surfaceIdx=surface;
  // As fontes (região aquecida) ficam marcadas em qualquer projeção; a faixa "calor" só aparece onde elas estiverem à esquerda.
  list.forEach((u,i)=>{const node=nodes.get(u.id),k=X.key(u.site),value=scene.fieldMap?.get(k);
   if(value!==undefined){
    node.style.setProperty('--field-strength',Math.round(100*value/(1+value))+'%');node.dataset.fieldValue='';
    node.setAttribute('aria-label',node.getAttribute('aria-label')+', '+fieldNames[coupled.layer]+' relativa '+formatRelative(value));
   }else{delete node.dataset.fieldValue;node.style.removeProperty('--field-strength');}
   if(heated&&(!coupled||value!==undefined)){node.dataset.heat=String(levels[i]);if(temps)node.style.setProperty('--heat',(temps.get(X.key(u.site))||0).toFixed(3));node.setAttribute('aria-label',node.getAttribute('aria-label')+', energia térmica '+P.heatWord(levels[i])+(sources[i]?(continuous?', sob a fonte de calor':', na região aquecida'):''));}else{delete node.dataset.heat;node.style.removeProperty('--heat');}
   if(sources[i])node.dataset.heatSource='';else delete node.dataset.heatSource;
   if(lit.has(u.id))node.dataset.lit='';else delete node.dataset.lit;});
  const sourcePts=drawn.filter((_,i)=>sources[i]),xs=drawn.map(p=>p.x),xMin=Math.min(...xs),xSpan=Math.max(1e-9,Math.max(...xs)-xMin);
  scene.heatSources=sourcePts;scene.heatAside=!continuous&&sourcePts.length>0&&!sourcePts.every(p=>(p.x-xMin)/xSpan<=.25);scene.continuousHeat=continuous;
  scene.deforming=deforming;scene.drawn=drawn;scene.lit=lit;scene.active=active;scene.pr=pr;scene.calcMark=calcMark;scene.d=d;
  const el=S.electrons,shownElectrons=!!el?.representation.visible,moving=shownElectrons&&el.representation.motion&&!reducedMotion();scene.shownElectrons=shownElectrons;scene.electrons=el;
  updateWindow();
  /* Elétrons: centros na janela da vista enquadrada (não da câmera atual). Aproximar ou deslocar não refaz a distribuição. */
  const fc=RD.fit(box,boxMargin),fa=RD.toScene(fc,{x:0,y:0}),fb=RD.toScene(fc,{x:1,y:1}),
   electronSites=localFocus?[focusSite,...focusShell.list].map(site=>({
    q:layout.project(D(site.cart)),fade:1,key:site.key
   })):latticeWindow({w:{x0:fa.x,y0:fa.y,x1:fb.x,y1:fb.y},c:{x:fc.x,y:fc.y},zoom:fc.zoom});
  driveCtl?.sync();const deformExp=active==='malleability'||active==='ductility',slips=active==='malleability'?pr.malleability.compression:active==='ductility'?pr.ductility.elongation:0;
  const fieldOn=active==='electrical'&&pr.electrical.field||deformExp&&!!driveCtl?.deformField,defects=deformExp&&DF?slips/DF.LIMIT:0,ET=SILM.electronTransport;
  scene.fieldOn=fieldOn;scene.defects=defects;
  // A órbita atualiza a região projetada sem interromper a animação eletrônica.
  // Calor + corrente: cada centro leva a temperatura local (0 sem calor) para o espalhamento dos elétrons.
  const tOf=k=>scene.heatTemps?.get(k)||0;
  const centersT=[...(localFocus?[]:drawn.map((q,i)=>({x:q.x,y:q.y,t:tOf(X.key(list[i].site))))),
   ...electronSites.map(s=>({x:s.q.x,y:s.q.y,t:tOf(s.key)}))];
  // Deriva média relativa (seta "elétrons (média)"): calor e defeitos reduzem; a intensidade do campo aumenta.
  scene.driftFactor=ET?(centersT.reduce((a,c)=>a+ET.drift(c.t),0)/Math.max(1,centersT.length))*ET.defectDrift(defects):1;
  // Pista visual da corrente total calculada: não representa trajetórias locais nem velocidade em SI.
  const currentFactor=coupled?coupled.values.current/(1+coupled.values.current):null;
  electronLayer.update({visible:shownElectrons,motion:!!el?.representation.motion,field:fieldOn,centers:centersT,spacing:d*layout.scale,connect:false,drive:driveCtl?.intensity??.6,defects,currentFactor});
  navigator.root.hidden=navigator.status.hidden=r.view!=='lattice';
  if(r.view==='lattice'){
   const effects=[];
   if(active)effects.push(P.catalog[active].title);
   if(active==='electrical'&&thermalCtl?.reading().on)effects.push('aquecimento externo');
   if((active==='malleability'||active==='ductility')&&driveCtl?.reading().deformField)effects.push('campo elétrico');
   if(shownElectrons)effects.push('elétrons deslocalizados');
   const local=scene.heatTemps?.get(navigator.cursor.site.key);
   let info=effects.join(' + ')+(local==null?'':' · aquecimento local '+Math.round(100*local)+'% da escala didática');
   if(coupled){
    const {input,values,field}=coupled,localT=field.get(navigator.cursor.site.key);
    const parameters=[['t',values.time],['U',values.voltage],['I',values.current],['R',values.resistance],['P Joule',values.power],['T média',values.mean]];
    if(localT!==undefined)parameters.push(['T local',localT]);
    info=['Efeito Joule · grandezas relativas',input.mode==='voltage'?'tensão imposta':'corrente imposta',
     input.boundary==='ambient'?'terminais à temperatura ambiente':'amostra isolada',
     ...(input.external?['calor externo ligado']:[]),...parameters.map(([label,val])=>label+' '+formatRelative(val))].join(' · ');
    const fieldValue=scene.fieldMap.get(navigator.cursor.site.key);
    info+=' · Mapa: '+fieldNames[coupled.layer];
    if(fieldValue===undefined)info+=' · sítio fora da malha do ensaio';
    else if(coupled.layer!=='temperature')info+=' local '+formatRelative(fieldValue);
   }
   if(navigator.reading.textContent!==info)navigator.reading.textContent=info;
  }
  drawAxes();
  // Durante a animação da deformação, os controles e o texto são atualizados até 10 vezes por segundo (o desenho, a cada quadro).
  const busy=deforming&&!!deformCtl&&(r=>r.load>0||r.sliding||Math.abs(r.strain)>1e-3||(r.orient>1e-4&&r.orient<1-1e-4))(deformCtl.reading()),tNow=performance.now();
  root.dataset.property=active||'';scheduleHeat(pr);
  const narrative=active&&!coupled?P.narrative(active,pr[active],{reduced:reducedMotion(),electronsVisible:shownElectrons}):null;
  root.dataset.electrons=shownElectrons?'visible':'hidden';electronLegend.hidden=!shownElectrons;
  const inCell=baseUnits.filter(u=>g.cellKeys.has(X.key(u.site))).length,added=list.filter(u=>u.placement==='crystallographic').length;
  // Indicador compacto (0.8.x): estrutura e, quando houver, a propriedade em estudo.
  meta.textContent=(m.general?m.label+' · '+m.spaceGroup:m.code+' · '+m.name)+' · '+list.length+' unidades'+(added?' ('+added+' completadas pelo SILM)':'')+(active?' · '+P.catalog[active].title+' em estudo':'');
  meta.title=meta.textContent;   // 0.9.1: texto integral quando o celular limita a duas linhas
  paint();
  stage.setAttribute('aria-label',structureName+'. '+(localFocus?'Ambiente local do centro e '+focusShell.list.length+' primeiros vizinhos':r.view==='lattice'?'Vista da rede extensa':'Vista da célula')+'; célula unitária '+(localFocus?'oculta na escala Centro':r.unitCell?'visível':'oculta')+'. '+inCell+' unidades na célula desenhada.'+(shownElectrons?' Elétrons visíveis: representação qualitativa de elétrons de valência deslocalizados distribuídos pela estrutura metálica; '+(moving?'movimento visual ativo.':'representação estática.'):'')+(coupled?' Ensaio Joule em grandezas relativas; os elétrons são uma pista visual da corrente total, não trajetórias locais calculadas.':'')+(narrative&&JSON.stringify(pr[active])!==JSON.stringify(P.defaults[active])?' '+P.catalog[active].title+': '+narrative.action+' '+narrative.observation:'')+(scene.measureText?' '+scene.measureText:''));
  cellStatus.textContent='Célula unitária '+(r.unitCell?'visível':'oculta')+(observer?.centers?' · centros identificados':'');
  R.describe();
 }
 /* Rede na janela visível (refeita ao fim de cada gesto de câmera, não a cada quadro). */
 function updateWindow(){if(scene?.drawn){const sites=latticeWindow();scene.specimenPts=specimen?sites.map(x=>x.q):[];drawLattice(sites);}}
 /* Sobreposições no espaço do palco (tamanho de tela constante): seguem a câmera sem refazer a estrutura. */
 function paint(){
  if(!scene?.drawn||!scene.lit)return;const {list,drawn,active,pr,calcMark,selected}=scene;
  electronLayer.setCamera?.(R.camera);
  // Margens em % para as alças (raio em px) ficarem inteiras dentro da cena, também no celular.
  const pct=px=>px/(R.size||stage.clientWidth||300)*100,lampEdge=()=>Math.max(4,pct(24)),fieldY=Math.max(4.5,pct(20));
  // Lanterna (P4): ponto da superfície (centro da face de cima), lanterna a θ da normal e feixe refletido a θ do outro lado.
  let beam=null;scene.surfaceView=null;
  if(driveCtl&&active==='luster'&&scene.surfaceIdx?.length){const pts=scene.surfaceIdx.map(i=>drawn[i]),m={x:pts.reduce((a,c)=>a+c.x,0)/pts.length,y:pts.reduce((a,c)=>a+c.y,0)/pts.length},v=R.toView(m),P={x:v.x*100,y:v.y*100};
   const th=driveCtl.angle*Math.PI/180,sn=Math.sin(th),cs=Math.cos(th),e=lampEdge(),Rr=Math.max(8,Math.min(38,(P.y-e)/cs,(P.x-e)/Math.max(sn,.01),(100-e-P.x)/Math.max(sn,.01)));
   beam={point:P,lantern:{x:P.x-Rr*sn,y:P.y-Rr*cs},end:{x:P.x+Rr*sn,y:P.y-Rr*cs},angle:driveCtl.angle,on:!!pr.luster.light};scene.surfaceView=P;}
  const lampOn=!!beam&&scene.module==='explorar';lantern.hidden=!lampOn;
  if(lampOn){lantern.style.left=beam.lantern.x+'%';lantern.style.top=beam.lantern.y+'%';lantern.dataset.on=String(beam.on);lantern.setAttribute('aria-valuenow',String(beam.angle));lantern.setAttribute('aria-valuetext',beam.angle+' graus da normal, luz '+(beam.on?'acesa':'apagada'));lantern.title='Arraste para mudar o ângulo; toque para '+(beam.on?'apagar':'acender')+'. Teclado: setas mudam o ângulo, Enter acende e apaga.';}
  const knobOn=!!driveCtl&&!!scene.fieldOn&&scene.module==='explorar';fieldKnob.hidden=!knobOn;
  if(knobOn){const I=driveCtl.intensity;fieldKnob.style.left=(55+25*I)+'%';fieldKnob.style.top=fieldY+'%';fieldKnob.setAttribute('aria-valuenow',String(Math.round(I*100)));fieldKnob.setAttribute('aria-valuetext',Math.round(I*100)+' %');
   fieldKnob.setAttribute('aria-label',scene.coupled?(scene.coupled.input.mode==='voltage'?'Tensão imposta':'Corrente imposta')+' (escala relativa)':'Intensidade do campo elétrico');}
  let light=null;if(!beam&&scene.lit.size){const tops=list.map((u,i)=>[u,drawn[i]]).filter(([u])=>scene.lit.has(u.id)).map(([,c])=>c),mean={x:tops.reduce((a,c)=>a+c.x,0)/tops.length,y:tops.reduce((a,c)=>a+c.y,0)/tops.length},v=R.toView(mean);light={x:v.x*100,y:v.y*100};}   // centro da face superior
  const sourceX=scene.heatSources.length?Math.min(...scene.heatSources.map(p=>p.x)):Math.min(...drawn.map(p=>p.x)),left=R.toView({x:sourceX-unitFraction,y:.5}).x;
  // Prensa (compressão) ou garras (tração) nas faces de cima e de baixo da amostra, acompanhando a forma a cada quadro.
  const reading=deformCtl?.reading();let plates=null;
  if(scene.deforming&&reading?.active){const pts=[...drawn,...(scene.specimenPts||[])].map(p=>R.toView(p)),rr=unitFraction*(R.camera.zoom||1)*.6,xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);
   plates={x0:(Math.min(...xs)-rr)*100,x1:(Math.max(...xs)+rr)*100,top:(Math.min(...ys)-rr)*100,bottom:(Math.max(...ys)+rr)*100};}
  // Fonte de calor (contínuo): na posição escolhida; ligada (contorno cheio) ou desligada (tracejado).
  const heaterOn=!!scene.continuousHeat&&!!thermalCtl?.source&&scene.module==='explorar';heater.hidden=!heaterOn;
  if(heaterOn){const v=R.toView(scene.heatPoint),on=!!scene.heatOn;heater.style.left=Math.max(2,Math.min(98,v.x*100))+'%';heater.style.top=Math.max(2,Math.min(98,v.y*100))+'%';
   if(heater.dataset.on!==String(on)){heater.dataset.on=String(on);heater.setAttribute('aria-pressed',String(on));heater.setAttribute('aria-label','Fonte de calor: '+(on?'ligada':'desligada'));heater.title='Toque para '+(on?'desligar':'ligar')+'; arraste para mover. Teclado: Enter liga e desliga, setas movem.';}}
  const canPress=!!plates&&scene.module==='explorar';handle.hidden=!canPress;
  if(canPress){handle.style.left=Math.max(4,Math.min(96,(plates.x0+plates.x1)/2))+'%';handle.style.top=Math.max(3,Math.min(97,plates.top-2))+'%';handle.dataset.mode=reading.active;
   const comp=reading.active==='malleability',pct=Math.round(reading.load*100),word=reading.regime==='plastic'?'regime plástico':reading.regime==='elastic'?'regime elástico':'sem força';
   handle.setAttribute('aria-label',comp?'Prensa: força de compressão':'Garra: força de tração');handle.title=(comp?'Arraste a prensa para baixo':'Arraste a garra para cima')+' para aplicar a força; solte para retirar. Teclado: setas, Home solta.';
   if(handle.getAttribute('aria-valuenow')!==String(pct)){handle.setAttribute('aria-valuenow',String(pct));handle.setAttribute('aria-valuetext',pct+' %, '+word);}}
  overlay.update({field:!!scene.fieldOn,coupled:scene.coupled?.values,intensity:driveCtl?.intensity??null,drift:scene.driftFactor,fieldY,beam,force:active==='malleability'?'compress':active==='ductility'?'stretch':null,level:active==='malleability'?pr.malleability.compression:active==='ductility'?pr.ductility.elongation:0,plates,load:reading?.active?reading.load:0,heat:active==='thermal'&&pr.thermal.heating&&!scene.heatAside&&!scene.continuousHeat,light,heatX:Math.max(0,Math.min(.8,left-.05))*100});
  const view=p=>{const v=R.toView(p);return {x:v.x,y:v.y};};
  let measureText='';
  // A deformação só existe em Explorar: sem medição em curso, nada a ler (evita cópias do estado a cada quadro).
  if(measureOverlay&&scene.deforming)measureOverlay.update({});
  else if(measureOverlay){const marks=measureOptions.marks();root.dataset.measuring=String(!!measureOptions.pickActive());
   if(marks){const pts=marks.points.map(p=>{const site=p.site?(scene.rep.view==='lattice'?navigator.cursor.displaySite(p.site):p.site):list.find(u=>u.id===p.unitId)?.site;if(!site)return null;const q=view(layout.project(D(g.site(site).cart)));return {x:q.x,y:q.y,label:p.label};}).filter(Boolean);
    measureOverlay.update(pts.length===marks.points.length?{points:pts,kind:marks.kind,text:marks.text}:{});measureText=marks.spoken||'';}
   else measureOverlay.update({});}
  if(calcOverlay){if(!measureText&&calcMark?.mode==='contact'){const pair=contactPair(list);calcOverlay.update(pair?{mode:'contact',points:pair.map(u=>view(layout.project(D(g.site(u.site).cart)))),text:'d = 2r'}:{});}else calcOverlay.update({});}
  scene.measureText=measureText;
  // Calcular (c/a no HC): rótulos a e c junto das arestas correspondentes da célula.
  const edgeLabels=[];if(calcMark?.mode==='edges'&&m.id==='HCP'){const a0=layout.project(D(cellCart([0,0,0]))),a1=layout.project(D(cellCart(g.vectors[0]))),c1=layout.project(D(cellCart(g.vectors[2])));edgeLabels.push({x:(a0.x+a1.x)/2,y:(a0.y+a1.y)/2,r:0,text:'a',className:'silm-edge-label',key:'a'},{x:(a0.x+c1.x)/2,y:(a0.y+c1.y)/2,r:0,text:'c',className:'silm-edge-label',key:'c'});}
  labels.update(edgeLabels);
  selection.update(selected&&selectedPoint?[{x:selectedPoint.x,y:selectedPoint.y,r:unitFraction/2*(1.08-.16*selectedPoint.depth)}]:[]);
 }
 scope.listen(window,'silm:observer-presentation-changed',render);
 let windowTimer=0;
 R.onCamera(()=>{sizeSymbols();paint();if(windowTimer)clearTimeout(windowTimer);windowTimer=setTimeout(()=>{windowTimer=0;updateWindow();paint();},140);});
 R.onResize(()=>{if(scene?.drawn)updateWindow();sizeSymbols();paint();});
 scope.cleanup(()=>{if(windowTimer)clearTimeout(windowTimer);windowTimer=0;});
 /* Transição curta da montagem livre para os sítios; com redução de movimento, estado final direto.
    animateFrom: posições no palco (frações), convertidas para a cena pela câmera desta vista. */
 function animate(){
  if(!animateFrom||reducedMotion())return;
  // Ponto de partida sem transição (a .silm-unit tem 120 ms em left/top): a animação parte das posições livres.
  for(const [id,node]of nodes){const from=animateFrom[id];node.dataset.animating='';node.style.transition='none';if(from){const s=R.toScene(from);node.style.left=(s.x*100)+'%';node.style.top=(s.y*100)+'%';}else node.dataset.appearing='';}
  void units.offsetWidth;for(const node of nodes.values())node.style.transition='';
  frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{frame=0;root.dataset.organizing='';for(const node of nodes.values()){delete node.dataset.animating;delete node.dataset.appearing;}render();scope.timeout(()=>{delete root.dataset.organizing;},650);});});
 }
 scope.cleanup(()=>{if(frame)cancelAnimationFrame(frame);frame=0;});
 /* Órbita (3D): 0,4° por pixel; arrastar para a direita traz a frente para a direita, para baixo mostra mais o topo.
    Os quadros do gesto só redesenham (sem gravar); ao soltar, grava a orientação, refaz os elétrons e anuncia. */
 function orbit(dx,dy,phase){
  const base=orbitLive||(()=>{const [yaw,pitch]=X.orientation3D(m,rep2.camera3D());return {yaw,pitch};})();
  if(phase!=='end')orbitLive={yaw:base.yaw+dx*.4,pitch:Math.max(-90,Math.min(90,base.pitch+dy*.4))};
  if(phase==='move'){orbiting=true;if(!orbitFrame)orbitFrame=requestAnimationFrame(()=>{orbitFrame=0;render();});return;}
  if(!orbitLive)return;const done=orbitLive;orbitLive=null;orbiting=false;if(orbitFrame){cancelAnimationFrame(orbitFrame);orbitFrame=0;}
  rep2.setCamera3D({yaw:done.yaw,pitch:done.pitch},{silent:true});lastPreset=null;render();
  const o=orientationNow()||[done.yaw,done.pitch];SimCore.notifications.announce('Vista 3D girada: '+Math.round(o[0])+'° na horizontal, '+Math.round(o[1])+'° na vertical.');
 }
 scope.cleanup(()=>{if(orbitFrame)cancelAnimationFrame(orbitFrame);orbitFrame=0;});
 if(mode3d)scope.listen(area,'keydown',e=>{if((e.key==='p'||e.key==='P')&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)){e.preventDefault();perspectiveButton?.click();}});
 function unitAction(id){const current=model.state.structure?.crystallography?.representation.selectedUnitId;
  if(measureOptions?.pickActive()){focusId=id;measureOptions.onPick(id);return;}   // com instrumento ativo, o clique (ou Enter) escolhe o ponto
  const unit=model.state.structure.units.find(unit=>unit.id===id);
  if(unit&&scene?.rep.view==='lattice'&&current!==id){navigator.visit(navigator.cursor.displaySite(unit.site),unit.site);return;}
  actions.select(current===id?null:id);}
 /* Com as margens de toque, os botões podem se sobrepor: no clique de ponteiro vale a unidade de centro mais próximo
    (a da frente quando o ponto cai em mais de uma esfera), como no toque central do renderizador. Enter e Espaço
    (detail 0) usam a própria unidade em foco. */
 function nearestUnit(event){
  const p=R.clientToScene(event);let best=null;
  for(const it of unitItems){const d=Math.hypot(it.x-p.x,it.y-p.y)-it.r,inside=d<=0;
   if(!best||(inside&&(!best.inside||it.depth<best.depth))||(!inside&&!best.inside&&d<best.d))best={id:it.id,d,inside,depth:it.depth};}
  return best?.id||null;
 }
 scope.listen(units,'click',event=>{const node=event.target.closest('.silm-unit');if(!node)return;unitAction((event.detail>0&&nearestUnit(event))||node.dataset.unitId);});
 scope.listen(units,'focusin',event=>{const node=event.target.closest('.silm-unit');if(node)focusId=node.dataset.unitId;});
 scope.listen(units,'keydown',event=>{
  const node=event.target.closest('.silm-unit');if(!node||event.altKey||event.ctrlKey||event.metaKey)return;const list=model.state.structure.units,k=list.findIndex(u=>u.id===node.dataset.unitId);
  if(event.key==='Escape'&&model.state.structure.crystallography.representation.selectedUnitId){event.preventDefault();event.stopPropagation();actions.select(null);return;}
  if(event.shiftKey)return;   // Shift + setas: deslocar a vista (renderizador)
  const next={ArrowRight:k+1,ArrowDown:k+1,ArrowLeft:k-1,ArrowUp:k-1,Home:0,End:list.length-1}[event.key];
  if(next!=null){event.preventDefault();const target=list[Math.max(0,Math.min(list.length-1,next))];focusId=target.id;render();nodes.get(target.id).focus({preventScroll:true});}
 });
 render();animate();
 return Object.freeze({root,title,update:render,say,renderer:R,orientation:()=>mode3d?orientationNow():null,focusUnit:id=>{if(nodes.has(id)){focusId=id;render();nodes.get(id).focus({preventScroll:true});}}});
};
