'use strict';
window.SILM=window.SILM||{};
/* Representação 2D/pseudo-3D da estrutura cristalina (0.5.x; renderizador comum desde a 0.11.x). Lê o estado
   científico; vista, camadas e seleção são gravadas pelas ações do domínio; projeção e câmera são representação
   (SILM.representation), nunca ciência. Unidades são botões acessíveis; a rede extensa, a célula e os vizinhos são
   camadas SVG decorativas do mundo. Sem linhas de ligação: o contorno da célula é geométrico e tracejado.
   Cena estável: célula + unidades na projeção escolhida (margem 0,12). A câmera enquadra a estrutura desenhada
   (com vizinhos, se visíveis; com margem maior na rede) e o usuário pode aproximar, afastar e deslocar. */
SILM.createCrystalView=(host,{scope,model,element,geometry:g,actions,moduleTitle='Explorar',note='',animateFrom=null,reducedMotion=()=>false,electrons:electronOptions=null,properties:propertyOptions=null,measure:measureOptions=null,calc:calcOptions=null,representation=null})=>{
 const U=SimCore.ExperienceUI,X=SILM.crystal,RD=SILM.renderer2d,RP=SILM.representation,m=g.model,name=element.name.toLocaleLowerCase('pt-BR'),NS='http://www.w3.org/2000/svg';
 const rep2=representation||{projection:()=>'isometric',setProjection:()=>{},camera:()=>null,saveCamera:()=>{}};
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
 for(const id of RP.PROJECTIONS){const o=U.element('option',RP.LABELS[id]);o.value=id;projection.append(o);}
 projectionBox.append(projectionText,projection);scope.listen(projection,'change',()=>rep2.setProjection(projection.value));
 tools.append(views,neighborsButton,projectionBox);bar.append(identity,tools);
 const area=U.element('div',null,'silm-assembly-area'),stage=U.element('div',null,'silm-assembly-stage silm-crystal-stage');stage.id='silm-assembly-stage';stage.setAttribute('role','group');
 const units=U.element('div',null,'silm-assembly-units');units.setAttribute('role','group');units.setAttribute('aria-label','Unidades da estrutura de '+name);
 area.append(stage);
 const footer=U.element('div',null,'silm-assembly-footer');
 const kind=U.element('span','Representação didática: esferas reduzidas, sem escala física absoluta; proporções da célula a partir dos parâmetros tabelados.','silm-assembly-kind');
 const cellStatus=U.element('span','','silm-assist-badge');cellStatus.id='silm-crystal-cell-status';
 const instructions=U.element('p','Selecione uma unidade (clique, toque ou Enter) e use Mostrar vizinhos. Setas percorrem as unidades; Esc limpa a seleção.'+(note?' '+note:''),'silm-assembly-help');instructions.id='silm-assembly-help';
 const cameraHelp=U.element('p','Vista: + e − aproximam e afastam, F enquadra, C centraliza, 0 restaura e Shift + setas deslocam. Arraste o fundo para deslocar; no celular, use dois dedos para aproximar. A vista não muda a estrutura nem as medidas.','silm-camera-help');
 const legend=U.element('p',m.id==='HCP'?'Camadas A e B: empilhamento ABAB. Unidades da camada B têm anel interno tracejado. Na projeção Superior, a camada B aparece nos espaços entre os centros da camada A.':'O sólido continua em todas as direções: a célula é a unidade que se repete.','silm-crystal-legend');
 const feedback=U.element('p','','silm-assembly-feedback');feedback.id='silm-assembly-feedback';
 footer.append(feedback);root.append(bar,area,footer);host.append(root);
 const say=(text,{announce=true}={})=>{feedback.textContent=text;if(announce)SimCore.notifications.announce(text);};
 /* ---------- renderizador comum ---------- */
 let layout=null,scene=null,selectedPoint=null,unitItems=[],fitKey=null;
 const R=RD.createStage(stage,{scope,area,idPrefix:'silm',camera:rep2.camera('crystal'),reducedMotion,announce:text=>SimCore.notifications.announce(text),
  describe:()=>sceneDescription(),onCamera:c=>rep2.saveCamera('crystal',c),items:()=>unitItems,focusPoint:()=>selectedPoint,canArrowPan:()=>true,
  onUnitTap:id=>unitAction(id),onReset:()=>{if(rep2.projection()!=='isometric')rep2.setProjection('isometric');}});
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
 function scheduleHeat(){const pr=model.state.properties;if(heatTimer||!propertyOptions?.advanceHeat||pr?.active!=='thermal'||!pr.thermal.heating||pr.thermal.stage>=P.limits.heatStages||reducedMotion())return;
  heatTimer=true;scope.timeout(()=>{heatTimer=false;if(document.hidden){scheduleHeat();return;}propertyOptions.advanceHeat();},900);}

 const nodes=new Map();
 let focusId=null,frame=0,unitFraction=.1;
 /* 0.9.1: o símbolo acompanha o diâmetro da esfera na tela e some quando não cabe (a unidade continua nomeada por aria-label). */
 const sizeSymbols=()=>{const px=(R.size||300)*unitFraction*R.camera.zoom;stage.style.setProperty('--unit-px',px.toFixed(1)+'px');root.dataset.symbols=px<16?'hidden':'shown';root.dataset.labelsFit=px<20?'no':'yes';};
 const shortRole={corner:'V',face:'F',body:'C','base-vertex':'A','base-center':'A',interior:'B',outside:''};
 /* 0.10.x: fração de cada centro que pertence à célula (contagem do número efetivo). */
 const SHARE={BCC:{corner:'1/8',body:'1'},FCC:{corner:'1/8',face:'1/2'},HCP:{'base-vertex':'1/6','base-center':'1/2',interior:'1'}};
 /* Par de centros em contato (vizinhos mais próximos), para o destaque de raio e empacotamento. */
 function contactPair(list){const byKey=new Map(list.map(u=>[X.key(u.site),u])),corner=list.find(u=>g.role(u.site).role==='corner'||g.role(u.site).role==='base-vertex')||list[0];if(!corner)return null;
  const near=g.neighbors(corner.site).list.find(n=>byKey.has(n.key));return near?[corner,byKey.get(near.key)]:null;}
 const svgEl=(tag,attrs)=>{const el=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,String(v));return el;};
 const pt=p=>{const q=layout.project(D(p));return {x:q.x*100,y:q.y*100,depth:q.depth};};
 function drawCell(forced){
  cellLayer.replaceChildren();planeLayer.replaceChildren();if(!scene.rep.unitCell&&!forced)return;
  for(const [a,b]of g.edges()){const p=pt(a),q=pt(b);cellLayer.append(svgEl('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,'data-back':String((p.depth+q.depth)/2>.55)}));}
  if(m.id==='HCP'){const h=g.vectors[2][2];for(const z of [0,h]){const ring=[0,1,2,3,4,5].map(k=>{const a=g.vectors[0][0];return pt([a*Math.cos(k*Math.PI/3),a*Math.sin(k*Math.PI/3),z]);});planeLayer.append(svgEl('polygon',{points:ring.map(p=>p.x+','+p.y).join(' ')}));}}
 }
 /* Rede extensa em janela: só os sítios perto da área visível (com esmaecimento a partir do centro da vista) e no
    máximo 260 círculos. O sólido continua; a rede desenhada não é infinita nem é estado científico. */
 const LATTICE_CAP=260;
 function latticeWindow(){
  if(scene.rep.view!=='lattice')return [];const w=R.visible(),pad=.06,occupied=new Set(scene.list.map(u=>X.key(u.site))),cv=R.toScene({x:.5,y:.5}),reach=.62/R.camera.zoom;
  const out=[];for(const s of g.lattice()){if(occupied.has(s.key))continue;const q=layout.project(D(s.cart));if(q.x<w.x0-pad||q.x>w.x1+pad||q.y<w.y0-pad||q.y>w.y1+pad)continue;
   const fade=Math.max(0,1-Math.hypot(q.x-cv.x,q.y-cv.y)/reach);if(fade<=.04)continue;out.push({q,fade});}
  out.sort((a,b)=>b.fade-a.fade);return out.slice(0,LATTICE_CAP);
 }
 function drawLattice(sites){
  latticeLayer.replaceChildren();
  for(const {q,fade}of [...sites].sort((a,b)=>b.q.depth-a.q.depth))latticeLayer.append(svgEl('circle',{cx:q.x*100,cy:q.y*100,r:unitFraction*36*(1.08-.16*q.depth),opacity:(.14+.42*fade).toFixed(3)}));
 }
 function createNode(u){
  const node=U.element('button',null,'silm-unit silm-crystal-unit');node.type='button';node.dataset.unitId=u.id;node.tabIndex=-1;node.setAttribute('aria-describedby','silm-assembly-help');
  const core=U.element('span',element.symbol,'silm-unit-core');core.setAttribute('aria-hidden','true');const tag=U.element('span','','silm-site-label');tag.setAttribute('aria-hidden','true');
  node.append(core,tag);units.append(node);return node;
 }
 const projectionName=()=>RP.LABELS[rep2.projection()]||RP.LABELS.isometric;
 function sceneDescription(){
  if(!scene)return '';const r=scene.rep,sel=r.selectedUnitId?scene.list.findIndex(u=>u.id===r.selectedUnitId):-1;
  return structureName+'. Projeção '+projectionName().toLocaleLowerCase('pt-BR')+'; '+(r.view==='lattice'?'rede extensa':'célula unitária')+'. '+(sel>=0?'Unidade '+(sel+1)+' selecionada'+(r.neighbors?', com os vizinhos imediatos destacados':'')+'.':'Nenhuma unidade selecionada.');
 }
 function render(){
  const S=model.state,s=S.structure;if(!s||s.mode!=='crystalline')return;const r=s.crystallography.representation,list=s.units,pr=S.properties,active=pr?.active||null;deform=P.deformer(S,g);
  const proj=rep2.projection();if(projection.value!==proj)projection.value=proj;root.dataset.projection=proj;
  const calcMark=calcOptions?.marks?.()||null;root.dataset.calc=calcMark?.mode||'';
  root.dataset.view=r.view;root.dataset.labels=String(r.labels);root.dataset.cell=String(r.unitCell);
  for(const [id,node]of nodes)if(!list.some(u=>u.id===id)){node.remove();nodes.delete(id);}
  const selected=r.selectedUnitId,selectedUnit=selected?list.find(u=>u.id===selected):null,neighbors=r.neighbors&&selectedUnit?g.neighbors(selectedUnit.site):null,neighborKeys=new Set(neighbors?.list.map(x=>x.key)||[]);
  // Cena estável (sem vizinhos nem margem de rede): a câmera, e não o layout, enquadra o que estiver visível.
  layout=X.layoutFor(g,[...g.cell.map(c=>c.cart),...list.map(u=>g.site(u.site).cart)],{margin:.12,projection:proj});
  const d=g.neighbors(g.cell[0]).distances[0];unitFraction=Math.min(.11,Math.max(.045,d*layout.scale*.3));stage.style.setProperty('--unit-size',(unitFraction*100).toFixed(3)+'%');
  scene={rep:r,list,selected,neighbors};
  const drawn=list.map(u=>layout.project(D(g.site(u.site).cart)));
  list.forEach((u,i)=>{
   let node=nodes.get(u.id);if(!node){node=createNode(u);nodes.set(u.id,node);}
   const p=drawn[i],info=g.role(u.site);
   if(!node.dataset.animating){node.style.left=(p.x*100)+'%';node.style.top=(p.y*100)+'%';}
   // Ordem dentro da camada da estrutura: profundidade; a selecionada fica por cima (o anel de seleção vem da camada própria).
   node.style.zIndex=String(selected===u.id?200:10+Math.round((1-p.depth)*100));node.style.setProperty('--depth-scale',(1.08-.16*p.depth).toFixed(3));node.style.setProperty('--depth-fade',(1-.22*p.depth).toFixed(3));
   node.dataset.role=info.role;node.dataset.layer=info.layer||'';node.dataset.placement=u.placement;node.querySelector('.silm-site-label').textContent=calcMark?.mode==='fractions'?(SHARE[m.id][info.role]||''):(shortRole[info.role]||'');
   const flag=neighborKeys.has(X.key(u.site));if(flag)node.dataset.neighbor='';else delete node.dataset.neighbor;
   node.setAttribute('aria-pressed',String(selected===u.id));
   node.setAttribute('aria-label','Unidade de '+name+' '+(i+1)+' de '+list.length+': '+info.label+(u.placement==='crystallographic'?', completada pelo SILM':'')+(flag?', vizinha imediata da unidade selecionada':''));
  });
  unitItems=list.map((u,i)=>({id:u.id,x:drawn[i].x,y:drawn[i].y,r:unitFraction/2*(1.08-.16*drawn[i].depth),depth:drawn[i].depth,priority:selected===u.id?1:0}));
  selectedPoint=selectedUnit?drawn[list.indexOf(selectedUnit)]:null;
  const roving=selected||(focusId&&nodes.has(focusId)?focusId:list[0]?.id);for(const [id,node]of nodes)node.tabIndex=id===roving?0:-1;
  drawCell(calcMark?.mode==='edges');
  ghostLayer.replaceChildren();const ghosts=[];
  if(neighbors){const occupied=new Set(list.map(u=>X.key(u.site)));for(const n of neighbors.list)if(!occupied.has(n.key)){const q=layout.project(D(n.cart));ghosts.push(q);ghostLayer.append(svgEl('circle',{cx:q.x*100,cy:q.y*100,r:unitFraction*50*(1.08-.16*q.depth)}));}}
  // Caixa de interesse da câmera: estrutura desenhada (com a deformação da propriedade e os vizinhos visíveis).
  const cellDrawn=g.cell.map(c=>layout.project(D(c.cart)));
  // Trocar a projeção ou a vista (Célula/Rede) reenquadra; mostrar vizinhos ou deformar mantém a câmera do usuário.
  const key=proj+'|'+r.view,refit=fitKey!==null&&fitKey!==key&&R.camera.mode!=='fit';fitKey=key;if(refit)R.setCamera({...R.camera,mode:'fit'},{settled:false});
  R.setInterest(RD.boundsOf([...cellDrawn,...drawn,...ghosts]),{margin:r.view==='lattice'?.3:.12});if(refit)rep2.saveCamera('crystal',R.camera);
  sizeSymbols();
  // Calor e níveis: sempre sobre a projeção de referência (isométrica, congelada), para que a vista nunca mude a experiência.
  const refLayout=X.layout(g,[...g.cell.map(c=>c.cart),...list.map(u=>g.site(u.site).cart)].map(D),{margin:.12});
  const refCentres=list.map(u=>refLayout.project(D(g.site(u.site).cart))),refSpacing=d*refLayout.scale;
  const heated=active==='thermal'&&(pr.thermal.heating||pr.thermal.stage>0),levels=heated?P.heat(refCentres,refSpacing,pr.thermal.stage):[];
  const lit=new Set();if(active==='luster'&&pr.luster.light){const zs=list.map(u=>g.site(u.site).cart[2]),top=Math.max(...zs);list.forEach((u,i)=>{if(zs[i]>=top-.05)lit.add(u.id);});}
  list.forEach((u,i)=>{const node=nodes.get(u.id);if(heated){node.dataset.heat=String(levels[i]);node.setAttribute('aria-label',node.getAttribute('aria-label')+', energia térmica '+P.heatWord(levels[i]));}else delete node.dataset.heat;
   if(lit.has(u.id))node.dataset.lit='';else delete node.dataset.lit;});
  scene.drawn=drawn;scene.lit=lit;scene.active=active;scene.pr=pr;scene.calcMark=calcMark;scene.d=d;
  const el=S.electrons,shownElectrons=!!el?.representation.visible,moving=shownElectrons&&el.representation.motion&&!reducedMotion();scene.shownElectrons=shownElectrons;scene.electrons=el;
  updateWindow();
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
 /* Rede e centros eletrônicos na janela visível (refeitos ao fim de cada gesto de câmera, não a cada quadro). */
 function updateWindow(){
  if(!scene?.drawn)return;const sites=latticeWindow();drawLattice(sites);
  const centres=[...scene.drawn,...sites.map(s=>s.q)],spacing=scene.d*layout.scale,pr=scene.pr,fieldOn=scene.active==='electrical'&&pr.electrical.field;
  electronLayer.update({visible:scene.shownElectrons,motion:!!scene.electrons?.representation.motion,field:fieldOn,centers:centres,spacing,connect:false});
 }
 /* Sobreposições no espaço do palco (tamanho de tela constante): seguem a câmera sem refazer a estrutura. */
 function paint(){
  if(!scene?.drawn||!scene.lit)return;const {list,drawn,active,pr,calcMark,selected}=scene;
  electronLayer.setCamera?.(R.camera);
  let light=null;if(scene.lit.size){const tops=list.map((u,i)=>[u,drawn[i]]).filter(([u])=>scene.lit.has(u.id)).map(([,c])=>c),mean={x:tops.reduce((a,c)=>a+c.x,0)/tops.length,y:tops.reduce((a,c)=>a+c.y,0)/tops.length},v=R.toView(mean);light={x:v.x*100,y:v.y*100};}   // centro da face superior
  const left=R.toView({x:Math.min(...drawn.map(p=>p.x))-unitFraction,y:.5}).x;
  overlay.update({field:active==='electrical'&&pr.electrical.field,force:active==='malleability'?'compress':active==='ductility'?'stretch':null,level:active==='malleability'?pr.malleability.compression:active==='ductility'?pr.ductility.elongation:0,heat:active==='thermal'&&pr.thermal.heating,light,heatX:Math.max(0,Math.min(.8,left-.05))*100});
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
  for(const [id,node]of nodes){const from=animateFrom[id];node.dataset.animating='';if(from){const s=R.toScene(from);node.style.left=(s.x*100)+'%';node.style.top=(s.y*100)+'%';}else node.dataset.appearing='';}
  frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{frame=0;root.dataset.organizing='';for(const node of nodes.values()){delete node.dataset.animating;delete node.dataset.appearing;}render();scope.timeout(()=>{delete root.dataset.organizing;},650);});});
 }
 scope.cleanup(()=>{if(frame)cancelAnimationFrame(frame);frame=0;});
 function unitAction(id){const current=model.state.structure?.crystallography?.representation.selectedUnitId;
  if(measureOptions?.pickActive()){focusId=id;measureOptions.onPick(id);return;}   // com instrumento ativo, o clique (ou Enter) escolhe o ponto
  actions.select(current===id?null:id);}
 scope.listen(units,'click',event=>{const node=event.target.closest('.silm-unit');if(!node)return;unitAction(node.dataset.unitId);});
 scope.listen(units,'focusin',event=>{const node=event.target.closest('.silm-unit');if(node)focusId=node.dataset.unitId;});
 scope.listen(units,'keydown',event=>{
  const node=event.target.closest('.silm-unit');if(!node||event.altKey||event.ctrlKey||event.metaKey)return;const list=model.state.structure.units,k=list.findIndex(u=>u.id===node.dataset.unitId);
  if(event.key==='Escape'&&model.state.structure.crystallography.representation.selectedUnitId){event.preventDefault();event.stopPropagation();actions.select(null);return;}
  if(event.shiftKey)return;   // Shift + setas: deslocar a vista (renderizador)
  const next={ArrowRight:k+1,ArrowDown:k+1,ArrowLeft:k-1,ArrowUp:k-1,Home:0,End:list.length-1}[event.key];
  if(next!=null){event.preventDefault();const target=list[Math.max(0,Math.min(list.length-1,next))];focusId=target.id;render();nodes.get(target.id).focus();}
 });
 render();animate();
 return Object.freeze({root,title,update:render,say,renderer:R,focusUnit:id=>{if(nodes.has(id)){focusId=id;render();nodes.get(id).focus();}}});
};
