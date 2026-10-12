'use strict';
window.SILM=window.SILM||{};
/* Representação 2D/pseudo-3D da estrutura cristalina (0.5.x). Lê o estado científico; vista, camadas e
   seleção são gravadas pelas ações do domínio. Unidades são botões acessíveis; a rede extensa é um
   único grupo SVG decorativo. Sem linhas de ligação: o contorno da célula é geométrico e tracejado. */
SILM.createCrystalView=(host,{scope,model,element,geometry:g,actions,moduleTitle='Explorar',note='',animateFrom=null,reducedMotion=()=>false,electrons:electronOptions=null,properties:propertyOptions=null,measure:measureOptions=null})=>{
 const U=SimCore.ExperienceUI,X=SILM.crystal,m=g.model,name=element.name.toLocaleLowerCase('pt-BR'),NS='http://www.w3.org/2000/svg';
 const structureName='Estrutura cristalina '+m.name+' de '+name;
 const root=U.element('section',null,'silm-assembly silm-crystal');root.dataset.editable='true';root.setAttribute('aria-labelledby','silm-assembly-title');
 const bar=U.element('header',null,'silm-assembly-bar'),identity=U.element('div',null,'silm-assembly-identity'),titles=U.element('div');
 const badge=U.element('span',element.symbol,'silm-assembly-symbol');badge.setAttribute('aria-hidden','true');
 const eyebrow=U.element('p','MÓDULO · '+moduleTitle.toLocaleUpperCase('pt-BR'),'eyebrow silm-assembly-eyebrow');
 const title=U.element('h1',element.name);title.id='silm-assembly-title';title.tabIndex=-1;
 const help=U.element('a','?','ajuda-link');help.href='#/manual/estruturas-cristalinas';help.setAttribute('aria-label','Ajuda: estruturas cristalinas');help.title='Ajuda: estruturas cristalinas';
 const heading=U.element('div',null,'silm-assembly-heading');heading.append(title,help);
 const meta=U.element('p','','silm-assembly-meta');meta.id='silm-assembly-meta';titles.append(eyebrow,heading,meta);identity.append(badge,titles);
 const tools=U.element('div',null,'silm-assembly-tools silm-crystal-tools');
 const views=U.element('div',null,'silm-segmented');views.setAttribute('role','group');views.setAttribute('aria-label','Vista da estrutura');
 const cellView=SILM.actionButton('Célula',()=>actions.represent({view:'cell'}),scope,{id:'silm-crystal-view-cell'}),latticeView=SILM.actionButton('Rede',()=>actions.represent({view:'lattice'}),scope,{id:'silm-crystal-view-lattice'});
 views.append(cellView,latticeView);
 const neighborsButton=SILM.actionButton('Mostrar vizinhos',()=>actions.toggleNeighbors(),scope,{id:'silm-crystal-neighbors'});
 tools.append(views,neighborsButton);bar.append(identity,tools);
 const area=U.element('div',null,'silm-assembly-area'),stage=U.element('div',null,'silm-assembly-stage silm-crystal-stage');stage.id='silm-assembly-stage';stage.setAttribute('role','group');
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('aria-hidden','true');svg.classList.add('silm-crystal-svg');
 const layer=name=>{const g=document.createElementNS(NS,'g');g.setAttribute('class',name);svg.append(g);return g;};
 const latticeLayer=layer('silm-lattice'),planeLayer=layer('silm-cell-planes'),cellLayer=layer('silm-cell-edges'),ghostLayer=layer('silm-neighbor-ghosts');
 const units=U.element('div',null,'silm-assembly-units');units.setAttribute('role','group');units.setAttribute('aria-label','Unidades da estrutura de '+name);
 stage.append(svg,units);area.append(stage);
 const footer=U.element('div',null,'silm-assembly-footer');
 const kind=U.element('span','Representação didática: esferas reduzidas, sem escala física absoluta; proporções da célula a partir dos parâmetros tabelados.','silm-assembly-kind');
 const cellStatus=U.element('span','','silm-assist-badge');cellStatus.id='silm-crystal-cell-status';
 const instructions=U.element('p','Selecione uma unidade (clique, toque ou Enter) e use Mostrar vizinhos. Setas percorrem as unidades; Esc limpa a seleção.'+(note?' '+note:''),'silm-assembly-help');instructions.id='silm-assembly-help';
 const legend=U.element('p',m.id==='HCP'?'Camadas A e B: empilhamento ABAB. Unidades da camada B têm anel interno tracejado.':'O sólido continua em todas as direções: a célula é a unidade que se repete.','silm-crystal-legend');
 const feedback=U.element('p','','silm-assembly-feedback');feedback.id='silm-assembly-feedback';
 footer.append(feedback);root.append(bar,area,footer);host.append(root);
 // 0.6.x: a distribuição eletrônica acompanha a rede; o contorno da célula não é parede.
 const electronLayer=SILM.createElectronLayer(stage,{scope,before:units,reducedMotion});
 const electronLegend=U.element('p','Pontos ciano: elétrons de valência deslocalizados pela estrutura inteira, marcadores qualitativos (não indicam o número real de elétrons). Não pertencem a um átomo nem a pares de átomos.','silm-electron-legend');electronLegend.id='silm-electron-legend';electronLegend.hidden=true;
 const electronControls=electronOptions?SILM.createElectronControls(footer,{scope,state:()=>model.state,actions:electronOptions.actions,reducedMotion,canActivate:electronOptions.canActivate}):null;
 if(electronControls)footer.prepend(electronControls.root);
 // 0.7.x: experiências de propriedades — sobreposição fora da estrutura e controles da propriedade ativa.
 const P=SILM.properties,overlay=SILM.createPropertyOverlay(stage,{before:units}),propertyHost=U.element('div',null,'silm-property-host');
 footer.insertBefore(propertyHost,feedback);const propertyControls=propertyOptions?.controls?.(propertyHost,scope)||null;
 SILM.createSceneNotes(footer,{scope,items:[instructions,legend,electronLegend,cellStatus,kind]});
 let deform=null,heatTimer=false;const D=c=>deform?deform(c):c;
 // 0.9.x: medição — pontos escolhidos nas unidades; sobreposição projetada dos sítios científicos.
 const measureOverlay=measureOptions?SILM.createMeasureOverlay(stage):null;
 function scheduleHeat(){const pr=model.state.properties;if(heatTimer||!propertyOptions?.advanceHeat||pr?.active!=='thermal'||!pr.thermal.heating||pr.thermal.stage>=P.limits.heatStages||reducedMotion())return;
  heatTimer=true;scope.timeout(()=>{heatTimer=false;if(document.hidden){scheduleHeat();return;}propertyOptions.advanceHeat();},900);}

 const nodes=new Map(),say=(text,{announce=true}={})=>{feedback.textContent=text;if(announce)SimCore.notifications.announce(text);};
 let focusId=null,frame=0,layout=null,unitFraction=.1;
 /* 0.9.1: o símbolo acompanha o diâmetro da esfera e some quando não cabe (a unidade continua nomeada por aria-label). */
 const sizeSymbols=()=>{const px=(parseFloat(stage.style.getPropertyValue('--stage'))||300)*unitFraction;stage.style.setProperty('--unit-px',px.toFixed(1)+'px');root.dataset.symbols=px<16?'hidden':'shown';};
 const st=()=>model.state.structure,rep=()=>st().crystallography.representation;
 const unitsList=()=>st().units;
 const shortRole={corner:'V',face:'F',body:'C','base-vertex':'A','base-center':'A',interior:'B',outside:''};
 function computeLayout(extra=[]){
  // Com vizinhos visíveis, os vizinhos fora da célula também entram no enquadramento (todos ficam inteiros na cena).
  const list=unitsList(),fit=[...g.cell.map(s=>s.cart),...list.map(u=>g.site(u.site).cart),...extra].map(D);
  layout=X.layout(g,fit,{margin:rep().view==='lattice'?.3:.12});
  // Esferas reduzidas: diâmetro ≈ 30% da distância entre vizinhos (projetada), para que a geometria fique visível.
  const d=g.neighbors(g.cell[0]).distances[0];return Math.min(.11,Math.max(.045,d*layout.scale*.3));
 }
 const svgEl=(tag,attrs)=>{const el=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,String(v));return el;};
 const pt=p=>{const q=layout.project(D(p));return {x:q.x*100,y:q.y*100,depth:q.depth};};
 function drawCell(){
  cellLayer.replaceChildren();planeLayer.replaceChildren();if(!rep().unitCell)return;
  for(const [a,b]of g.edges()){const p=pt(a),q=pt(b);cellLayer.append(svgEl('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,'data-back':String((p.depth+q.depth)/2>.55)}));}
  if(m.id==='HCP'){const h=g.vectors[2][2];for(const z of [0,h]){const ring=[0,1,2,3,4,5].map(k=>{const a=g.vectors[0][0];return pt([a*Math.cos(k*Math.PI/3),a*Math.sin(k*Math.PI/3),z]);});planeLayer.append(svgEl('polygon',{points:ring.map(p=>p.x+','+p.y).join(' ')}));}}
 }
 function drawLattice(radius){
  latticeLayer.replaceChildren();if(rep().view!=='lattice')return;
  const occupied=new Set(unitsList().map(u=>X.key(u.site))),centre=pt(g.center);
  const sites=g.lattice().filter(s=>!occupied.has(s.key)).map(s=>({s,p:pt(s.cart)})).sort((a,b)=>b.p.depth-a.p.depth);
  for(const {p}of sites){const fade=Math.max(0,1-Math.hypot(p.x-centre.x,p.y-centre.y)/62);if(fade<=.04)continue;latticeLayer.append(svgEl('circle',{cx:p.x,cy:p.y,r:radius*36*(1.08-.16*p.depth),opacity:(.14+.42*fade).toFixed(3)}));}
 }
 function createNode(u){
  const node=U.element('button',null,'silm-unit silm-crystal-unit');node.type='button';node.dataset.unitId=u.id;node.tabIndex=-1;node.setAttribute('aria-describedby','silm-assembly-help');
  const core=U.element('span',element.symbol,'silm-unit-core');core.setAttribute('aria-hidden','true');const tag=U.element('span','','silm-site-label');tag.setAttribute('aria-hidden','true');
  node.append(core,tag);units.append(node);return node;
 }
 function render(){
  const s=st();if(!s||s.mode!=='crystalline')return;const r=rep(),list=s.units,pr=model.state.properties,active=pr?.active||null;deform=P.deformer(model.state,g);
  root.dataset.view=r.view;root.dataset.labels=String(r.labels);root.dataset.cell=String(r.unitCell);
  for(const [id,node]of nodes)if(!list.some(u=>u.id===id)){node.remove();nodes.delete(id);}
  const selected=r.selectedUnitId,neighbors=r.neighbors&&selected?g.neighbors(list.find(u=>u.id===selected).site):null,neighborKeys=new Set(neighbors?.list.map(x=>x.key)||[]);
  const radius=computeLayout(neighbors?neighbors.list.map(n=>n.cart):[]);unitFraction=radius;stage.style.setProperty('--unit-size',(radius*100).toFixed(3)+'%');sizeSymbols();
  list.forEach((u,i)=>{
   let node=nodes.get(u.id);if(!node){node=createNode(u);nodes.set(u.id,node);}
   const p=layout.project(D(g.site(u.site).cart)),info=g.role(u.site);
   if(!node.dataset.animating){node.style.left=(p.x*100)+'%';node.style.top=(p.y*100)+'%';}
   node.style.zIndex=String(10+Math.round((1-p.depth)*100));node.style.setProperty('--depth-scale',(1.08-.16*p.depth).toFixed(3));node.style.setProperty('--depth-fade',(1-.22*p.depth).toFixed(3));
   node.dataset.role=info.role;node.dataset.layer=info.layer||'';node.dataset.placement=u.placement;node.querySelector('.silm-site-label').textContent=shortRole[info.role]||'';
   const flag=neighborKeys.has(X.key(u.site));if(flag)node.dataset.neighbor='';else delete node.dataset.neighbor;
   node.setAttribute('aria-pressed',String(selected===u.id));
   node.setAttribute('aria-label','Unidade de '+name+' '+(i+1)+' de '+list.length+': '+info.label+(u.placement==='crystallographic'?', completada pelo SILM':'')+(flag?', vizinha imediata da unidade selecionada':''));
  });
  const roving=selected||(focusId&&nodes.has(focusId)?focusId:list[0]?.id);for(const [id,node]of nodes)node.tabIndex=id===roving?0:-1;
  drawLattice(radius);drawCell();
  ghostLayer.replaceChildren();
  if(neighbors){const occupied=new Set(list.map(u=>X.key(u.site)));for(const n of neighbors.list)if(!occupied.has(n.key)){const p=pt(n.cart);ghostLayer.append(svgEl('circle',{cx:p.x,cy:p.y,r:radius*50*(1.08-.16*p.depth)}));}}
  const el=model.state.electrons,shownElectrons=!!el?.representation.visible,moving=shownElectrons&&el.representation.motion&&!reducedMotion();
  const centres=list.map(u=>layout.project(D(g.site(u.site).cart)));
  if(r.view==='lattice'){const occupied=new Set(list.map(u=>X.key(u.site)));for(const site of g.lattice())if(!occupied.has(site.key)){const q=layout.project(D(site.cart));if(q.x>-.05&&q.x<1.05&&q.y>-.05&&q.y<1.05)centres.push(q);}}
  const spacing=g.neighbors(g.cell[0]).distances[0]*layout.scale,fieldOn=active==='electrical'&&pr.electrical.field;
  electronLayer.update({visible:shownElectrons,motion:!!el?.representation.motion,field:fieldOn,centers:centres,spacing,connect:false});
  // Condução térmica: níveis 0–4 por unidade (anel e vibração), propagados a partir da região aquecida.
  const heated=active==='thermal'&&(pr.thermal.heating||pr.thermal.stage>0),levels=heated?P.heat(centres.slice(0,list.length),spacing,pr.thermal.stage):[];
  let light=null;const lit=new Set();
  if(active==='luster'&&pr.luster.light){const zs=list.map(u=>g.site(u.site).cart[2]),top=Math.max(...zs);list.forEach((u,i)=>{if(zs[i]>=top-.05)lit.add(u.id);});
   const tops=list.map((u,i)=>[u,centres[i]]).filter(([u])=>lit.has(u.id)).map(([,c])=>c);light={x:tops.reduce((a,c)=>a+c.x,0)/tops.length*100,y:tops.reduce((a,c)=>a+c.y,0)/tops.length*100};}   // centro da face superior
  list.forEach((u,i)=>{const node=nodes.get(u.id);if(heated){node.dataset.heat=String(levels[i]);node.setAttribute('aria-label',node.getAttribute('aria-label')+', energia térmica '+P.heatWord(levels[i]));}else delete node.dataset.heat;
   if(lit.has(u.id))node.dataset.lit='';else delete node.dataset.lit;});
  overlay.update({field:fieldOn,force:active==='malleability'?'compress':active==='ductility'?'stretch':null,level:active==='malleability'?pr.malleability.compression:active==='ductility'?pr.ductility.elongation:0,heat:active==='thermal'&&pr.thermal.heating,light});
  root.dataset.property=active||'';propertyControls?.update();scheduleHeat();
  let measureText='';
  if(measureOverlay){const marks=measureOptions.marks();root.dataset.measuring=String(!!measureOptions.pickActive());
   if(marks){const pts=marks.points.map(p=>{const site=p.site||list.find(u=>u.id===p.unitId)?.site;if(!site)return null;const q=layout.project(D(g.site(site).cart));return {x:q.x,y:q.y,label:p.label};}).filter(Boolean);
    measureOverlay.update(pts.length===marks.points.length?{points:pts,kind:marks.kind,text:marks.text}:{});measureText=marks.spoken||'';}else measureOverlay.update({});}
  const narrative=active?P.narrative(active,pr[active],{reduced:reducedMotion(),electronsVisible:shownElectrons}):null;
  root.dataset.electrons=shownElectrons?'visible':'hidden';electronLegend.hidden=!shownElectrons;electronControls?.update();
  const inCell=list.filter(u=>g.cellKeys.has(X.key(u.site))).length,added=list.filter(u=>u.placement==='crystallographic').length;
  // Indicador compacto (0.8.x): estrutura e, quando houver, a propriedade em estudo.
  meta.textContent=m.code+' · '+m.name+' · '+list.length+' unidades'+(added?' ('+added+' completadas pelo SILM)':'')+(active?' · '+P.catalog[active].title+' em estudo':'');
  meta.title=meta.textContent;   // 0.9.1: texto integral quando o celular limita a duas linhas
  stage.setAttribute('aria-label',structureName+'. '+(r.view==='lattice'?'Vista da rede extensa':'Vista da célula')+'; célula unitária '+(r.unitCell?'visível':'oculta')+'. '+inCell+' unidades na célula desenhada.'+(shownElectrons?' Elétrons visíveis: representação qualitativa de elétrons de valência deslocalizados distribuídos pela estrutura metálica; '+(moving?'movimento visual ativo.':'representação estática.'):'')+(narrative&&JSON.stringify(pr[active])!==JSON.stringify(P.defaults[active])?' '+P.catalog[active].title+': '+narrative.action+' '+narrative.observation:'')+(measureText?' '+measureText:''));
  cellStatus.textContent='Célula unitária '+(r.unitCell?'visível':'oculta');
  cellView.setAttribute('aria-pressed',String(r.view==='cell'));latticeView.setAttribute('aria-pressed',String(r.view==='lattice'));
  neighborsButton.setAttribute('aria-pressed',String(r.neighbors));neighborsButton.textContent=r.neighbors?'Ocultar vizinhos':'Mostrar vizinhos';
 }
 /* Transição curta da montagem livre para os sítios; com redução de movimento, estado final direto. */
 function animate(){
  if(!animateFrom||reducedMotion())return;
  for(const [id,node]of nodes){const from=animateFrom[id];node.dataset.animating='';if(from){node.style.left=(from.x*100)+'%';node.style.top=(from.y*100)+'%';}else node.dataset.appearing='';}
  frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{frame=0;root.dataset.organizing='';for(const node of nodes.values()){delete node.dataset.animating;delete node.dataset.appearing;}render();scope.timeout(()=>{delete root.dataset.organizing;},650);});});
 }
 scope.cleanup(()=>{if(frame)cancelAnimationFrame(frame);frame=0;});
 scope.listen(units,'click',event=>{const node=event.target.closest('.silm-unit');if(!node)return;const id=node.dataset.unitId,current=rep().selectedUnitId;
  if(measureOptions?.pickActive()){focusId=id;measureOptions.onPick(id);return;}   // com instrumento ativo, o clique (ou Enter) escolhe o ponto
  actions.select(current===id?null:id);});
 scope.listen(units,'focusin',event=>{const node=event.target.closest('.silm-unit');if(node)focusId=node.dataset.unitId;});
 scope.listen(units,'keydown',event=>{
  const node=event.target.closest('.silm-unit');if(!node||event.altKey||event.ctrlKey||event.metaKey)return;const list=unitsList(),k=list.findIndex(u=>u.id===node.dataset.unitId);
  if(event.key==='Escape'&&rep().selectedUnitId){event.preventDefault();event.stopPropagation();actions.select(null);return;}
  const next={ArrowRight:k+1,ArrowDown:k+1,ArrowLeft:k-1,ArrowUp:k-1,Home:0,End:list.length-1}[event.key];
  if(next!=null){event.preventDefault();const target=list[Math.max(0,Math.min(list.length-1,next))];focusId=target.id;render();nodes.get(target.id).focus();}
 });
 const fit=()=>{const size=Math.max(160,Math.floor(Math.min(area.clientWidth,area.clientHeight))-2);stage.style.setProperty('--stage',size+'px');sizeSymbols();};
 let resizeFrame=0;const schedule=()=>{if(!resizeFrame)resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;fit();});};
 if(window.ResizeObserver)scope.observe(new ResizeObserver(schedule),area);else scope.listen(window,'resize',schedule);
 scope.cleanup(()=>{if(resizeFrame)cancelAnimationFrame(resizeFrame);});
 render();fit();animate();
 return Object.freeze({root,title,update:render,say,focusUnit:id=>{if(nodes.has(id)){focusId=id;render();nodes.get(id).focus();}}});
};
