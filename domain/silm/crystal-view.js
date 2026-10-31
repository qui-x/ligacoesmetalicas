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
SILM.createCrystalView=(host,{scope,model,element,geometry:g,actions,moduleTitle='Explorar',note='',animateFrom=null,reducedMotion=()=>false,electrons:electronOptions=null,properties:propertyOptions=null,measure:measureOptions=null,calc:calcOptions=null,representation=null})=>{
 const U=SimCore.ExperienceUI,X=SILM.crystal,RD=SILM.renderer2d,RP=SILM.representation,m=g.model,name=element.name.toLocaleLowerCase('pt-BR'),NS='http://www.w3.org/2000/svg';
 const rep2=representation||{projection:()=>'isometric',setProjection:()=>{},camera:()=>null,saveCamera:()=>{},viewMode:()=>'2d',camera3D:()=>RP.camera3D(),available3D:()=>false,setViewMode:()=>{},setCamera3D:()=>{},fail3D:()=>{}};
 const mode3d=rep2.viewMode()==='3d',cameraKey=mode3d?'crystal3d':'crystal';
 const structureName='Estrutura cristalina '+m.name+' de '+name;
 const root=U.element('section',null,'silm-assembly silm-crystal');root.dataset.editable='true';root.setAttribute('aria-labelledby','silm-assembly-title');
 const bar=U.element('header',null,'silm-assembly-bar'),identity=U.element('div',null,'silm-assembly-identity'),titles=U.element('div');
 const badge=U.element('span',element.symbol,'silm-assembly-symbol');badge.setAttribute('aria-hidden','true');
 const eyebrow=U.element('p','ESTRUTURA CRISTALINA','eyebrow silm-assembly-eyebrow');
 const title=U.element('h1',element.name);title.id='silm-assembly-title';title.tabIndex=-1;
 const help=U.element('a','?','ajuda-link');help.href='#/manual/estruturas-cristalinas';help.setAttribute('aria-label','Ajuda: estruturas cristalinas');help.title='Ajuda: estruturas cristalinas';
 const heading=U.element('div',null,'silm-assembly-heading');heading.append(title,help);
 const meta=U.element('p','','silm-assembly-meta');meta.id='silm-assembly-meta';titles.append(eyebrow,heading,meta);identity.append(badge,titles);
 const tools=U.element('div',null,'silm-assembly-tools silm-crystal-tools');
 const views=U.element('div',null,'silm-segmented');views.setAttribute('role','group');views.setAttribute('aria-label','Vista da estrutura');
 const cellView=SILM.actionButton('Célula',()=>actions.represent({view:'cell'}),scope,{id:'silm-crystal-view-cell'}),latticeView=SILM.actionButton('Rede',()=>actions.represent({view:'lattice'}),scope,{id:'silm-crystal-view-lattice'});
 views.append(cellView,latticeView);
 const neighborsButton=SILM.actionButton('Mostrar vizinhos',()=>actions.toggleNeighbors(),scope,{id:'silm-crystal-neighbors'});
 // 0.11.x: projeção da representação (não muda a estrutura nem as medidas).
 const projectionBox=U.element('label',null,'silm-projection'),projectionText=U.element('span','Projeção','silm-projection-label'),projection=U.element('select');projection.id='silm-crystal-projection';
 // 0.12.x: um só seletor para as vistas 2D (projeções) e 3D (órbita livre e planos XY, XZ e YZ).
 const group2=U.element('optgroup'),group3=U.element('optgroup');group2.label='2D';group3.label='3D';
 for(const id of RP.PROJECTIONS){const o=U.element('option',RP.LABELS[id]);o.value=id;group2.append(o);}
 for(const id of RP.PRESETS){const o=U.element('option',RP.PRESET_LABELS[id]);o.value=id==='3d'?'3d':'3d-'+id;o.disabled=!rep2.available3D();group3.append(o);}
 projection.append(group2,group3);projectionBox.append(projectionText,projection);
 scope.listen(projection,'change',()=>{const v=projection.value;
  if(v.startsWith('3d')){const preset=v==='3d'?'3d':v.slice(3);rep2.setCamera3D({preset,yaw:null,pitch:null},{silent:!mode3d});if(!mode3d)rep2.setViewMode('3d');}
  else if(mode3d)rep2.setViewMode('2d',{projection:v});else rep2.setProjection(v);});
 tools.append(views,neighborsButton,projectionBox);bar.append(identity,tools);
 const area=U.element('div',null,'silm-assembly-area'),stage=U.element('div',null,'silm-assembly-stage silm-crystal-stage');stage.id='silm-assembly-stage';stage.setAttribute('role','group');
 const units=U.element('div',null,'silm-assembly-units');units.setAttribute('role','group');units.setAttribute('aria-label','Unidades da estrutura de '+name);
 area.append(stage);
 const footer=U.element('div',null,'silm-assembly-footer');
 const kind=U.element('span','Representação didática: esferas reduzidas, sem escala física absoluta; proporções da célula a partir dos parâmetros tabelados.','silm-assembly-kind');
 const cellStatus=U.element('span','','silm-assist-badge');cellStatus.id='silm-crystal-cell-status';
 const instructions=U.element('p','Selecione uma unidade (clique, toque ou Enter) e use Mostrar vizinhos. Setas percorrem as unidades; Esc limpa a seleção.'+(note?' '+note:''),'silm-assembly-help');instructions.id='silm-assembly-help';
 const cameraHelp=U.element('p',mode3d?'Vista 3D: arraste para girar (no celular, um dedo); J e L giram na horizontal, I e K na vertical, P alterna perspectiva e ortográfica. Shift + arrastar desloca; + e − aproximam; F enquadra; 0 restaura. Os eixos no canto são só referência. A vista não muda a estrutura nem as medidas.':
  'Vista: + e − aproximam e afastam, F enquadra, C centraliza, 0 restaura e Shift + setas deslocam. Arraste o fundo para deslocar; no celular, use dois dedos para aproximar. A vista não muda a estrutura nem as medidas.','silm-camera-help');
 const legend=U.element('p',m.id==='HCP'?'Camadas A e B: empilhamento ABAB. Unidades da camada B têm anel interno tracejado. Na projeção Superior, a camada B aparece nos espaços entre os centros da camada A.':'O sólido continua em todas as direções: a célula é a unidade que se repete.','silm-crystal-legend');
 const feedback=U.element('p','','silm-assembly-feedback');feedback.id='silm-assembly-feedback';
 footer.append(feedback);root.append(bar,area,footer);host.append(root);
 const say=(text,{announce=true}={})=>{feedback.textContent=text;if(announce)SimCore.notifications.announce(text);};
 /* ---------- renderizador comum ---------- */
 let layout=null,scene=null,selectedPoint=null,unitItems=[],fitKey=null;
 let perspectiveButton=null,orbitLive=null,orbitFrame=0,orbiting=false,lastPreset=null;
 const R=RD.createStage(stage,{scope,area,idPrefix:'silm',camera:rep2.camera(cameraKey),reducedMotion,announce:text=>SimCore.notifications.announce(text),
  describe:()=>sceneDescription(),onCamera:c=>rep2.saveCamera(cameraKey,c),items:()=>unitItems,focusPoint:()=>selectedPoint,canArrowPan:()=>true,
  onUnitTap:id=>unitAction(id),onReset:()=>{if(mode3d){orbitLive=null;rep2.setCamera3D({preset:'3d',yaw:null,pitch:null},{silent:true});render();}else if(rep2.projection()!=='isometric')rep2.setProjection('isometric');},toggleHost:tools,
  onOrbit:mode3d?(dx,dy,phase)=>orbit(dx,dy,phase):null,
  extraButtons:mode3d?button=>{perspectiveButton=button('perspective','◫','Perspectiva (desligada: ortográfica)','P',()=>rep2.setCamera3D({projection:rep2.camera3D().projection==='perspective'?'orthographic':'perspective'}));return [perspectiveButton];}:null});
 if(mode3d)R.setDragMode('orbit');
 const worldSvg=cls=>{const s=document.createElementNS(NS,'svg');s.setAttribute('viewBox','0 0 100 100');s.setAttribute('aria-hidden','true');s.setAttribute('class','silm-crystal-svg '+cls);return s;};
 const latticeSvg=worldSvg('silm-lattice-layer'),cellSvg=worldSvg('silm-cell-layer'),ghostSvg=worldSvg('silm-ghost-layer');
 const group=(svg,cls)=>{const n=document.createElementNS(NS,'g');n.setAttribute('class',cls);svg.append(n);return n;};
 const latticeLayer=group(latticeSvg,'silm-lattice'),planeLayer=group(cellSvg,'silm-cell-planes'),cellLayer=group(cellSvg,'silm-cell-edges'),ghostLayer=group(ghostSvg,'silm-neighbor-ghosts');
 R.layer('lattice',latticeSvg,{camera:true});R.layer('unitCell',cellSvg,{camera:true});R.layer('neighbors',ghostSvg,{camera:true});R.layer('structure',units,{camera:true});
 // 0.6.x: a distribuição eletrônica acompanha a rede; o contorno da célula não é parede.
 const electronLayer=SILM.createElectronLayer(stage,{scope,before:units,reducedMotion});R.layer('electrons',electronLayer.canvas);
 const electronLegend=U.element('p','Pontos ciano: elétrons de valência deslocalizados pela estrutura inteira, marcadores qualitativos (não indicam o número real de elétrons). Não pertencem a um átomo nem a pares de átomos.','silm-electron-legend');electronLegend.id='silm-electron-legend';electronLegend.hidden=true;
 const electronControls=electronOptions?SILM.createElectronControls(footer,{scope,state:()=>model.state,actions:electronOptions.actions,reducedMotion,canActivate:electronOptions.canActivate}):null;
 if(electronControls)footer.prepend(electronControls.root);
 // 0.7.x: experiências de propriedades — sobreposição fora da estrutura e controles da propriedade ativa.
 const P=SILM.properties,overlay=SILM.createPropertyOverlay(stage,{before:units}),propertyHost=U.element('div',null,'silm-property-host');R.layer('properties',overlay.root);
 footer.insertBefore(propertyHost,feedback);const propertyControls=propertyOptions?.controls?.(propertyHost,scope)||null;
 SILM.createSceneNotes(footer,{scope,items:[instructions,cameraHelp,legend,electronLegend,cellStatus,kind]});
 let deform=null,heatTimer=false;const D=c=>deform?deform(c):c;
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
 function scheduleHeat(){const pr=model.state.properties;if(heatTimer||!propertyOptions?.advanceHeat||pr?.active!=='thermal'||!pr.thermal.heating||pr.thermal.stage>=P.limits.heatStages||reducedMotion())return;
  heatTimer=true;scope.timeout(()=>{heatTimer=false;if(document.hidden){scheduleHeat();return;}propertyOptions.advanceHeat();},900);}

 const nodes=new Map();
 let focusId=null,frame=0,unitFraction=.1;
 /* 0.9.1: o símbolo acompanha o diâmetro da esfera na tela e some quando não cabe (a unidade continua nomeada por aria-label). */
 const sizeSymbols=()=>{const px=(R.size||300)*unitFraction*R.camera.zoom;stage.style.setProperty('--unit-px',px.toFixed(1)+'px');root.dataset.symbols=px<16?'hidden':'shown';root.dataset.labelsFit=px<20?'no':'yes';
  // Alvo mínimo de 24 px na tela (com folga): margem transparente em coordenadas do palco, descontando zoom e profundidade.
  const visual=(R.size||300)*unitFraction,zoom=R.camera.zoom||1;for(const node of nodes.values()){const ds=parseFloat(node.style.getPropertyValue('--depth-scale'))||1;node.style.setProperty('--hit-pad',Math.max(0,(25/(zoom*ds)-visual)/2).toFixed(2)+'px');}};
 const shortRole={corner:'V',face:'F',body:'C','base-vertex':'A','base-center':'A',interior:'B',outside:''};
 /* 0.10.x: fração de cada centro que pertence à célula (contagem do número efetivo). */
 const SHARE={BCC:{corner:'1/8',body:'1'},FCC:{corner:'1/8',face:'1/2'},HCP:{'base-vertex':'1/6','base-center':'1/2',interior:'1'}};
 /* Par de centros em contato (vizinhos mais próximos), para o destaque de raio e empacotamento. */
 function contactPair(list){const byKey=new Map(list.map(u=>[X.key(u.site),u])),corner=list.find(u=>g.role(u.site).role==='corner'||g.role(u.site).role==='base-vertex')||list[0];if(!corner)return null;
  const near=g.neighbors(corner.site).list.find(n=>byKey.has(n.key));return near?[corner,byKey.get(near.key)]:null;}
 const svgEl=(tag,attrs)=>{const el=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,String(v));return el;};
 const pt=p=>{const q=layout.project(D(p));return {x:q.x*100,y:q.y*100,depth:q.depth};};
 /* Escala de profundidade: no 2D e na ortográfica, a pista da 0.5.x; na perspectiva, o fator da própria projeção. */
 const dscale=q=>layout?.perspective?Math.max(.5,Math.min(1.7,q.size)):1.08-.16*q.depth;
 function drawCell(forced){
  cellLayer.replaceChildren();planeLayer.replaceChildren();if(!scene.rep.unitCell&&!forced)return;
  for(const [a,b]of g.edges()){const p=pt(a),q=pt(b);cellLayer.append(svgEl('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,'data-back':String((p.depth+q.depth)/2>.55)}));}
  if(m.id==='HCP'){const h=g.vectors[2][2];for(const z of [0,h]){const ring=[0,1,2,3,4,5].map(k=>{const a=g.vectors[0][0];return pt([a*Math.cos(k*Math.PI/3),a*Math.sin(k*Math.PI/3),z]);});planeLayer.append(svgEl('polygon',{points:ring.map(p=>p.x+','+p.y).join(' ')}));}}
 }
 /* Rede extensa em janela: só os sítios perto da área visível (com esmaecimento a partir do centro da vista) e no
    máximo 260 círculos. O sólido continua; a rede desenhada não é infinita nem é estado científico. */
 const LATTICE_CAP=260;
 function latticeWindow(view={w:R.visible(),c:R.toScene({x:.5,y:.5}),zoom:R.camera.zoom}){
  if(scene.rep.view!=='lattice')return [];const {w,c:cv}=view,pad=.06,occupied=new Set(scene.list.map(u=>X.key(u.site))),reach=.62/view.zoom;
  const out=[];for(const s of g.lattice()){if(occupied.has(s.key))continue;const q=layout.project(D(s.cart));if(q.x<w.x0-pad||q.x>w.x1+pad||q.y<w.y0-pad||q.y>w.y1+pad)continue;
   const fade=Math.max(0,1-Math.hypot(q.x-cv.x,q.y-cv.y)/reach);if(fade<=.04)continue;out.push({q,fade});}
  out.sort((a,b)=>b.fade-a.fade);return out.slice(0,LATTICE_CAP);
 }
 function drawLattice(sites){
  latticeLayer.replaceChildren();
  for(const {q,fade}of [...sites].sort((a,b)=>b.q.depth-a.q.depth))latticeLayer.append(svgEl('circle',{cx:q.x*100,cy:q.y*100,r:unitFraction*36*dscale(q),opacity:(.14+.42*fade).toFixed(3)}));
 }
 function createNode(u){
  const node=U.element('button',null,'silm-unit silm-crystal-unit');node.type='button';node.dataset.unitId=u.id;node.tabIndex=-1;node.setAttribute('aria-describedby','silm-assembly-help');
  const core=U.element('span',element.symbol,'silm-unit-core');core.setAttribute('aria-hidden','true');const tag=U.element('span','','silm-site-label');tag.setAttribute('aria-hidden','true');
  // O corpo guarda o tamanho visual da esfera; o botão em volta cresce até 24 px na tela (alvo de toque, WCAG 2.5.8).
  const body=U.element('span',null,'silm-unit-body');body.setAttribute('aria-hidden','true');body.append(core,tag);node.append(body);units.append(node);return node;
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
  return structureName+'. '+viewName()+'; '+(r.view==='lattice'?'rede extensa':'célula unitária')+'. '+(sel>=0?'Unidade '+(sel+1)+' selecionada'+(r.neighbors?', com os vizinhos imediatos destacados':'')+'.':'Nenhuma unidade selecionada.')+
   (scene.heatAside?' Nesta projeção, a região aquecida (contorno tracejado) não fica à esquerda; a experiência é a mesma da vista isométrica.':'');
 }
 function render(){
  const S=model.state,s=S.structure;if(!s||s.mode!=='crystalline')return;const r=s.crystallography.representation,list=s.units,pr=S.properties,active=pr?.active||null;deform=P.deformer(S,g);
  const proj=rep2.projection(),cam3=mode3d?{...rep2.camera3D(),...(orbitLive||{})}:null,selectValue=mode3d?(cam3.preset&&cam3.preset!=='3d'?'3d-'+cam3.preset:'3d'):proj;
  if(projection.value!==selectValue)projection.value=selectValue;root.dataset.projection=mode3d?'3d':proj;root.dataset.viewMode=mode3d?'3d':'2d';
  if(perspectiveButton){const on=cam3.projection==='perspective';perspectiveButton.setAttribute('aria-pressed',String(on));perspectiveButton.setAttribute('aria-label',on?'Perspectiva (ligada)':'Perspectiva (desligada: ortográfica)');}
  const calcMark=calcOptions?.marks?.()||null;root.dataset.calc=calcMark?.mode||'';
  root.dataset.view=r.view;root.dataset.labels=String(r.labels);root.dataset.cell=String(r.unitCell);
  for(const [id,node]of nodes)if(!list.some(u=>u.id===id)){node.remove();nodes.delete(id);}
  const selected=r.selectedUnitId,selectedUnit=selected?list.find(u=>u.id===selected):null,neighbors=r.neighbors&&selectedUnit?g.neighbors(selectedUnit.site):null,neighborKeys=new Set(neighbors?.list.map(x=>x.key)||[]);
  // Cena estável (sem vizinhos nem margem de rede): a câmera, e não o layout, enquadra o que estiver visível.
  const fitCarts=[...g.cell.map(c=>c.cart),...list.map(u=>g.site(u.site).cart)];
  if(mode3d){try{layout=X.layout3D(g,fitCarts,cam3);}catch(error){rep2.fail3D(error);layout=X.layoutFor(g,fitCarts,{margin:.12,projection:proj});}}
  else layout=X.layoutFor(g,fitCarts,{margin:.12,projection:proj});
  const d=g.neighbors(g.cell[0]).distances[0];unitFraction=Math.min(.11,Math.max(.045,d*layout.scale*.3));stage.style.setProperty('--unit-size',(unitFraction*100).toFixed(3)+'%');
  scene={rep:r,list,selected,neighbors};
  const drawn=list.map(u=>layout.project(D(g.site(u.site).cart)));
  list.forEach((u,i)=>{
   let node=nodes.get(u.id);if(!node){node=createNode(u);nodes.set(u.id,node);}
   const p=drawn[i],info=g.role(u.site);
   if(!node.dataset.animating){node.style.left=(p.x*100)+'%';node.style.top=(p.y*100)+'%';}
   // Ordem dentro da camada da estrutura: profundidade; a selecionada fica por cima (o anel de seleção vem da camada própria).
   node.style.zIndex=String(selected===u.id?200:10+Math.round((1-p.depth)*100));node.style.setProperty('--depth-scale',dscale(p).toFixed(3));node.style.setProperty('--depth-fade',(1-.22*p.depth).toFixed(3));
   node.dataset.role=info.role;node.dataset.layer=info.layer||'';node.dataset.placement=u.placement;node.querySelector('.silm-site-label').textContent=calcMark?.mode==='fractions'?(SHARE[m.id][info.role]||''):(shortRole[info.role]||'');
   const flag=neighborKeys.has(X.key(u.site));if(flag)node.dataset.neighbor='';else delete node.dataset.neighbor;
   node.setAttribute('aria-pressed',String(selected===u.id));
   node.setAttribute('aria-label','Unidade de '+name+' '+(i+1)+' de '+list.length+': '+info.label+(u.placement==='crystallographic'?', completada pelo SILM':'')+(flag?', vizinha imediata da unidade selecionada':''));
  });
  unitItems=list.map((u,i)=>({id:u.id,x:drawn[i].x,y:drawn[i].y,r:unitFraction/2*dscale(drawn[i]),depth:drawn[i].depth,priority:selected===u.id?1:0}));
  selectedPoint=selectedUnit?drawn[list.indexOf(selectedUnit)]:null;
  const roving=selected||(focusId&&nodes.has(focusId)?focusId:list[0]?.id);for(const [id,node]of nodes)node.tabIndex=id===roving?0:-1;
  drawCell(calcMark?.mode==='edges');
  ghostLayer.replaceChildren();const ghosts=[];
  if(neighbors){const occupied=new Set(list.map(u=>X.key(u.site)));for(const n of neighbors.list)if(!occupied.has(n.key)){const q=layout.project(D(n.cart));ghosts.push(q);ghostLayer.append(svgEl('circle',{cx:q.x*100,cy:q.y*100,r:unitFraction*50*dscale(q)}));}}
  // Caixa de interesse da câmera: estrutura desenhada (com a deformação da propriedade e os vizinhos visíveis).
  const cellDrawn=g.cell.map(c=>layout.project(D(c.cart)));
  // Trocar a projeção ou a vista (Célula/Rede) reenquadra; mostrar vizinhos ou deformar mantém a câmera do usuário.
  const presetKey=mode3d?(cam3.preset||lastPreset||'3d'):'',key=(mode3d?'3d:'+presetKey:proj)+'|'+r.view,refit=fitKey!==null&&fitKey!==key&&R.camera.mode!=='fit';fitKey=key;if(mode3d&&cam3.preset)lastPreset=cam3.preset;
  if(refit)R.setCamera({...R.camera,mode:'fit'},{settled:false});
  const box=mode3d?{x0:.08,y0:.08,x1:.92,y1:.92}:RD.boundsOf([...cellDrawn,...drawn,...ghosts]),boxMargin=mode3d?.08:r.view==='lattice'?.3:.12;
  R.setInterest(box,{margin:boxMargin});if(refit)rep2.saveCamera(cameraKey,R.camera);
  sizeSymbols();
  // Calor e níveis: sempre sobre a projeção de referência (isométrica, congelada), para que a vista nunca mude a experiência.
  const refLayout=X.layout(g,[...g.cell.map(c=>c.cart),...list.map(u=>g.site(u.site).cart)].map(D),{margin:.12});
  const refCentres=list.map(u=>refLayout.project(D(g.site(u.site).cart))),refSpacing=d*refLayout.scale;
  const heated=active==='thermal'&&(pr.thermal.heating||pr.thermal.stage>0),levels=heated?P.heat(refCentres,refSpacing,pr.thermal.stage):[],sources=heated?P.heatSources(refCentres):[];
  const lit=new Set();if(active==='luster'&&pr.luster.light){const zs=list.map(u=>g.site(u.site).cart[2]),top=Math.max(...zs);list.forEach((u,i)=>{if(zs[i]>=top-.05)lit.add(u.id);});}
  // As fontes (região aquecida) ficam marcadas em qualquer projeção; a faixa "calor" só aparece onde elas estiverem à esquerda.
  list.forEach((u,i)=>{const node=nodes.get(u.id);if(heated){node.dataset.heat=String(levels[i]);node.setAttribute('aria-label',node.getAttribute('aria-label')+', energia térmica '+P.heatWord(levels[i])+(sources[i]?', na região aquecida':''));}else delete node.dataset.heat;
   if(sources[i])node.dataset.heatSource='';else delete node.dataset.heatSource;
   if(lit.has(u.id))node.dataset.lit='';else delete node.dataset.lit;});
  const sourcePts=drawn.filter((_,i)=>sources[i]),xs=drawn.map(p=>p.x),xMin=Math.min(...xs),xSpan=Math.max(1e-9,Math.max(...xs)-xMin);
  scene.heatSources=sourcePts;scene.heatAside=sourcePts.length>0&&!sourcePts.every(p=>(p.x-xMin)/xSpan<=.25);
  scene.drawn=drawn;scene.lit=lit;scene.active=active;scene.pr=pr;scene.calcMark=calcMark;scene.d=d;
  const el=S.electrons,shownElectrons=!!el?.representation.visible,moving=shownElectrons&&el.representation.motion&&!reducedMotion();scene.shownElectrons=shownElectrons;scene.electrons=el;
  updateWindow();
  /* Elétrons: centros na janela da vista enquadrada (não da câmera atual). Aproximar ou deslocar não refaz a distribuição. */
  const fc=RD.fit(box,boxMargin),fa=RD.toScene(fc,{x:0,y:0}),fb=RD.toScene(fc,{x:1,y:1}),electronSites=latticeWindow({w:{x0:fa.x,y0:fa.y,x1:fb.x,y1:fb.y},c:{x:fc.x,y:fc.y},zoom:fc.zoom});
  const fieldOn=active==='electrical'&&pr.electrical.field;
  // A órbita atualiza a região projetada sem interromper a animação eletrônica.
  electronLayer.update({visible:shownElectrons,motion:!!el?.representation.motion,field:fieldOn,centers:[...drawn,...electronSites.map(s=>s.q)],spacing:d*layout.scale,connect:false});
  drawAxes();
  root.dataset.property=active||'';propertyControls?.update();scheduleHeat();
  const narrative=active?P.narrative(active,pr[active],{reduced:reducedMotion(),electronsVisible:shownElectrons}):null;
  root.dataset.electrons=shownElectrons?'visible':'hidden';electronLegend.hidden=!shownElectrons;electronControls?.update();
  const inCell=list.filter(u=>g.cellKeys.has(X.key(u.site))).length,added=list.filter(u=>u.placement==='crystallographic').length;
  // Indicador compacto (0.8.x): estrutura e, quando houver, a propriedade em estudo.
  meta.textContent=m.code+' · '+m.name+' · '+list.length+' unidades'+(added?' ('+added+' completadas pelo SILM)':'')+(active?' · '+P.catalog[active].title+' em estudo':'');
  meta.title=meta.textContent;   // 0.9.1: texto integral quando o celular limita a duas linhas
  paint();
  stage.setAttribute('aria-label',structureName+'. '+(r.view==='lattice'?'Vista da rede extensa':'Vista da célula')+'; célula unitária '+(r.unitCell?'visível':'oculta')+'. '+inCell+' unidades na célula desenhada.'+(shownElectrons?' Elétrons visíveis: representação qualitativa de elétrons de valência deslocalizados distribuídos pela estrutura metálica; '+(moving?'movimento visual ativo.':'representação estática.'):'')+(narrative&&JSON.stringify(pr[active])!==JSON.stringify(P.defaults[active])?' '+P.catalog[active].title+': '+narrative.action+' '+narrative.observation:'')+(scene.measureText?' '+scene.measureText:''));
  cellStatus.textContent='Célula unitária '+(r.unitCell?'visível':'oculta');
  cellView.setAttribute('aria-pressed',String(r.view==='cell'));latticeView.setAttribute('aria-pressed',String(r.view==='lattice'));
  neighborsButton.setAttribute('aria-pressed',String(r.neighbors));neighborsButton.textContent=r.neighbors?'Ocultar vizinhos':'Mostrar vizinhos';
  R.describe();
 }
 /* Rede na janela visível (refeita ao fim de cada gesto de câmera, não a cada quadro). */
 function updateWindow(){if(scene?.drawn)drawLattice(latticeWindow());}
 /* Sobreposições no espaço do palco (tamanho de tela constante): seguem a câmera sem refazer a estrutura. */
 function paint(){
  if(!scene?.drawn||!scene.lit)return;const {list,drawn,active,pr,calcMark,selected}=scene;
  electronLayer.setCamera?.(R.camera);
  let light=null;if(scene.lit.size){const tops=list.map((u,i)=>[u,drawn[i]]).filter(([u])=>scene.lit.has(u.id)).map(([,c])=>c),mean={x:tops.reduce((a,c)=>a+c.x,0)/tops.length,y:tops.reduce((a,c)=>a+c.y,0)/tops.length},v=R.toView(mean);light={x:v.x*100,y:v.y*100};}   // centro da face superior
  const sourceX=scene.heatSources.length?Math.min(...scene.heatSources.map(p=>p.x)):Math.min(...drawn.map(p=>p.x)),left=R.toView({x:sourceX-unitFraction,y:.5}).x;
  overlay.update({field:active==='electrical'&&pr.electrical.field,force:active==='malleability'?'compress':active==='ductility'?'stretch':null,level:active==='malleability'?pr.malleability.compression:active==='ductility'?pr.ductility.elongation:0,heat:active==='thermal'&&pr.thermal.heating&&!scene.heatAside,light,heatX:Math.max(0,Math.min(.8,left-.05))*100});
  const view=p=>{const v=R.toView(p);return {x:v.x,y:v.y};};
  let measureText='';
  if(measureOverlay){const marks=measureOptions.marks();root.dataset.measuring=String(!!measureOptions.pickActive());
   if(marks){const pts=marks.points.map(p=>{const site=p.site||list.find(u=>u.id===p.unitId)?.site;if(!site)return null;const q=view(layout.project(D(g.site(site).cart)));return {x:q.x,y:q.y,label:p.label};}).filter(Boolean);
    measureOverlay.update(pts.length===marks.points.length?{points:pts,kind:marks.kind,text:marks.text}:{});measureText=marks.spoken||'';}
   else measureOverlay.update({});}
  if(calcOverlay){if(!measureText&&calcMark?.mode==='contact'){const pair=contactPair(list);calcOverlay.update(pair?{mode:'contact',points:pair.map(u=>view(layout.project(D(g.site(u.site).cart)))),text:'d = 2r'}:{});}else calcOverlay.update({});}
  scene.measureText=measureText;
  // Calcular (c/a no HC): rótulos a e c junto das arestas correspondentes da célula.
  const edgeLabels=[];if(calcMark?.mode==='edges'&&m.id==='HCP'){const a0=layout.project(D([0,0,0])),a1=layout.project(D(g.vectors[0])),c1=layout.project(D(g.vectors[2]));edgeLabels.push({x:(a0.x+a1.x)/2,y:(a0.y+a1.y)/2,r:0,text:'a',className:'silm-edge-label',key:'a'},{x:(a0.x+c1.x)/2,y:(a0.y+c1.y)/2,r:0,text:'c',className:'silm-edge-label',key:'c'});}
  labels.update(edgeLabels);
  selection.update(selected&&selectedPoint?[{x:selectedPoint.x,y:selectedPoint.y,r:unitFraction/2*(1.08-.16*selectedPoint.depth)}]:[]);
 }
 let windowTimer=0;
 R.onCamera(()=>{sizeSymbols();paint();if(windowTimer)clearTimeout(windowTimer);windowTimer=setTimeout(()=>{windowTimer=0;updateWindow();paint();},140);});
 R.onResize(()=>{sizeSymbols();paint();});
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
