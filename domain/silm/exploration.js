'use strict';
window.SILM=window.SILM||{};
/* Módulo Explorar (0.8.x): perspectiva de investigação sobre o MESMO scientificState.
   - Nada aqui é estado científico. Foco do painel, camadas de apresentação e último modo de comparação são
     representação da exploração, guardados à parte (storage 'exploration.view'), sem mudar o schema científico.
   - Comparação qualitativa: variantes somente leitura derivadas de um snapshot do estado (nunca gravadas),
     desenhadas por um renderizador estático que reutiliza geometria, transformações e a camada eletrônica
     (sempre estática: nenhum laço de animação a mais). */
(()=>{
 const FOCUS=Object.freeze(['synthesis','unit','structure','electrons','property']);
 const COMPARE=Object.freeze(['free-crystal','cell-lattice','electrons','property']);
 const defaults=Object.freeze({focus:null,layers:Object.freeze({centers:true,propertyHints:true}),compare:null});
 const clone=v=>JSON.parse(JSON.stringify(v));
 /* Valores inválidos ou antigos voltam ao padrão: a representação nunca impede a investigação de abrir. */
 function sanitize(v){
  const out=clone(defaults);if(!v||typeof v!=='object')return out;
  if(FOCUS.includes(v.focus))out.focus=v.focus;if(COMPARE.includes(v.compare))out.compare=v.compare;
  if(v.layers&&typeof v.layers==='object')for(const k of Object.keys(out.layers))if(typeof v.layers[k]==='boolean')out.layers[k]=v.layers[k];
  return out;
 }
 const crystalline=s=>s.structure?.mode==='crystalline';
 function focusOptions(s){
  const has=!!s.structure,sel=crystalline(s)&&!!s.structure.crystallography.representation.selectedUnitId,active=s.properties?.active;
  return [
   {id:'synthesis',label:'Síntese',available:true},
   {id:'unit',label:'Centro',available:sel,reason:'Selecione uma unidade na estrutura cristalina.'},
   {id:'structure',label:crystalline(s)?'Célula':'Montagem',available:has,reason:'Monte uma estrutura.'},
   {id:'electrons',label:'Elétrons',available:has,reason:'Monte uma estrutura.'},
   {id:'property',label:'Propriedade',available:!!active,reason:'Inicie uma experiência em Montagem → Propriedades.'}
  ];
 }
 /* Foco efetivo: o escolhido, se disponível; senão o objeto mais relevante do estado atual. */
 function resolveFocus(view,s){
  const options=focusOptions(s),ok=id=>options.find(o=>o.id===id)?.available;
  if(view.focus&&ok(view.focus))return view.focus;
  if(ok('property'))return 'property';if(ok('unit'))return 'unit';if(s.electrons?.representation.visible)return 'electrons';if(ok('structure'))return 'structure';return 'synthesis';
 }
 const P=()=>SILM.properties;
 function compareModes(s){
  const pr=s.properties,changed=pr?.active&&JSON.stringify(pr[pr.active])!==JSON.stringify(P().defaults[pr.active]);
  return [
   {id:'free-crystal',label:'Montagem livre × estrutura cristalina',a:'Montagem livre',b:'Estrutura cristalina',available:crystalline(s),reason:'Organize a estrutura para comparar com a montagem livre.'},
   {id:'cell-lattice',label:'Célula × rede',a:'Célula unitária',b:'Rede extensa',available:crystalline(s),reason:'Disponível na estrutura cristalina.'},
   {id:'electrons',label:'Elétrons ocultos × visíveis',a:'Elétrons ocultos',b:'Elétrons visíveis',available:!!s.electrons,reason:'Ative os elétrons (Mostrar elétrons) para comparar.'},
   {id:'property',label:'Estado inicial × após a propriedade',a:'Antes: estado-base',b:'Depois: '+(pr?.active?P().catalog[pr.active].title.toLocaleLowerCase('pt-BR'):'experiência'),available:!!changed,reason:'Aplique a ação de uma experiência de propriedade para comparar.'}
  ];
 }
 /* Variantes somente leitura (cópias): nada é gravado no estado científico. */
 /* Só o que a cena desenha (metal, estrutura, elétrons, propriedades): medições, cálculos e histórico não são copiados. */
 const pick=s=>clone({metal:s.metal,structure:s.structure,electrons:s.electrons,properties:s.properties});
 function variants(mode,state){
  const a=pick(state),b=pick(state);
  if(mode==='free-crystal'){const s=a.structure;a.structure={...s,mode:'free',units:clone(s.crystallography.freeUnits),referenceStructureId:null,crystallography:null};a.properties=P().fresh();if(a.electrons&&a.structure.units.length<2)a.electrons=null;}
  if(mode==='cell-lattice'){a.structure.crystallography.representation.view='cell';b.structure.crystallography.representation.view='lattice';for(const v of [a,b])v.structure.crystallography.representation.neighbors=false;}
  if(mode==='electrons'){a.electrons.representation.visible=false;b.electrons.representation.visible=true;}
  if(mode==='property'){const id=a.properties.active;a.properties[id]=clone(P().defaults[id]);}
  return {a,b};
 }
 function describe(s,element){
  const name=element.name.toLocaleLowerCase('pt-BR'),st=s.structure;if(!st)return 'Sem estrutura.';
  const parts=[st.mode==='crystalline'?'Estrutura cristalina '+SILM.crystal.models[st.crystallography.structureType].code+' de '+name+(st.crystallography.representation.view==='lattice'?', rede extensa':', célula unitária'):'Montagem livre de '+name+', '+st.units.length+' unidades'];
  parts.push(s.electrons?.representation.visible?'elétrons visíveis (estáticos)':'elétrons ocultos');
  const pr=s.properties;if(pr?.active){const n=P().narrative(pr.active,pr[pr.active],{reduced:true,electronsVisible:!!s.electrons?.representation.visible});parts.push(P().catalog[pr.active].title+': '+n.action);}
  return parts.join('; ')+'.';
 }
 SILM.exploration=Object.freeze({focus:FOCUS,compare:COMPARE,defaults,sanitize,focusOptions,resolveFocus,compareModes,variants,describe});
})();
/* Comparação (0.8.x; renderizador comum desde a 0.11.x): a mesma cena da vista principal, em modo somente leitura —
   mesma projeção, mesmas camadas (rede em janela, célula com planos do HC, propriedades, elétrons estáticos),
   enquadrada pela câmera. Sem ids, sem foco, sem gestos e sem escrita no estado; a cena é descrita por texto (role=img). */
SILM.renderSnapshot=(host,{scope,state,element,label,projection='isometric'})=>{
 const U=SimCore.ExperienceUI,X=SILM.crystal,P=SILM.properties,RD=SILM.renderer2d,NS='http://www.w3.org/2000/svg';
 const figure=U.element('figure',null,'silm-snapshot'),stage=U.element('div',null,'silm-snapshot-stage'),caption=U.element('figcaption',label,'silm-snapshot-label');
 stage.setAttribute('role','img');stage.setAttribute('aria-label',label+'. '+SILM.exploration.describe(state,element));
 figure.append(caption,stage);host.append(figure);
 const s=state.structure;if(!s){caption.textContent=label+' · sem estrutura';return {root:figure};}
 const R=RD.createStage(stage,{scope,readOnly:true});
 const world=cls=>{const v=document.createElementNS(NS,'svg');v.setAttribute('viewBox','0 0 100 100');v.setAttribute('aria-hidden','true');v.setAttribute('class','silm-snapshot-svg '+cls);return v;};
 const latticeSvg=world('silm-snapshot-lattice-layer'),cellSvg=world('silm-snapshot-cell-layer'),top=world('silm-snapshot-units');
 R.layer('lattice',latticeSvg,{camera:true});R.layer('unitCell',cellSvg,{camera:true});R.layer('structure',top,{camera:true});
 const el=(parent,tag,attrs,text=null)=>{const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==null)n.textContent=text;parent.append(n);return n;};
 let points=[],spacing=.12,radius=.05,lattice=[],refPoints=[],refSpacing=.12;const pr=state.properties,active=pr?.active;
 if(s.mode==='crystalline'){
  const g=X.geometry(SILM.data.get(state.metal.atomicNumber)),r=s.crystallography.representation,def=P.deformer(state,g),D=c=>def?def(c):c;
  const carts=[...g.cell.map(c=>c.cart),...s.units.map(u=>g.site(u.site).cart)],L=X.layoutFor(g,carts,{margin:.12,projection});
  points=s.units.map(u=>{const q=L.project(D(g.site(u.site).cart));return {x:q.x,y:q.y,depth:q.depth,z:g.site(u.site).cart[2]};});
  const d=g.neighbors(g.cell[0]).distances[0];spacing=d*L.scale;radius=Math.min(.11,Math.max(.045,spacing*.3));
  const ref=X.layout(g,carts.map(D),{margin:.12});refPoints=s.units.map(u=>ref.project(D(g.site(u.site).cart)));refSpacing=d*ref.scale;   // calor: projeção de referência
  R.setInterest(RD.boundsOf([...g.cell.map(c=>L.project(D(c.cart))),...points]),{margin:r.view==='lattice'?.3:.12});
  if(r.unitCell){for(const [a,b]of g.edges()){const p=L.project(D(a)),q=L.project(D(b));el(cellSvg,'line',{x1:p.x*100,y1:p.y*100,x2:q.x*100,y2:q.y*100,class:'silm-snapshot-edge'});}
   if(g.model.id==='HCP'){const h=g.vectors[2][2],a=g.vectors[0][0];for(const z of [0,h])el(cellSvg,'polygon',{points:[0,1,2,3,4,5].map(k=>{const q=L.project(D([a*Math.cos(k*Math.PI/3),a*Math.sin(k*Math.PI/3),z]));return q.x*100+','+q.y*100;}).join(' '),class:'silm-snapshot-plane'});}}
  if(r.view==='lattice'){const w=R.visible(),cv=R.toScene({x:.5,y:.5}),reach=.62/R.camera.zoom,occupied=new Set(s.units.map(u=>X.key(u.site)));
   lattice=g.lattice().filter(x=>!occupied.has(x.key)).map(x=>L.project(D(x.cart))).filter(q=>q.x>w.x0-.06&&q.x<w.x1+.06&&q.y>w.y0-.06&&q.y<w.y1+.06).map(q=>({q,fade:Math.max(0,1-Math.hypot(q.x-cv.x,q.y-cv.y)/reach)})).filter(o=>o.fade>.04).sort((a,b)=>b.fade-a.fade).slice(0,260);}
 }else{
  points=s.units.map(u=>({x:u.position.x,y:u.position.y,depth:.5,z:0}));refPoints=points;
  if(points.length>1){const nn=points.map(p=>Math.min(...points.filter(q=>q!==p).map(q=>Math.hypot(p.x-q.x,p.y-q.y)))).sort((a,b)=>a-b);spacing=Math.max(.1,Math.min(.2,nn[Math.floor(nn.length/2)]));}radius=.084;refSpacing=spacing;   // mesmo diâmetro da montagem livre (unidade 10%, núcleo 84%)
  R.setInterest({x0:0,y0:0,x1:1,y1:1},{margin:0});
 }
 for(const {q,fade}of [...lattice].sort((a,b)=>b.q.depth-a.q.depth))el(latticeSvg,'circle',{cx:q.x*100,cy:q.y*100,r:radius*36*(1.08-.16*q.depth),opacity:(.14+.42*fade).toFixed(3),class:'silm-snapshot-lattice'});
 const heated=active==='thermal'&&(pr.thermal.heating||pr.thermal.stage>0),levels=heated?P.heat(refPoints,refSpacing,pr.thermal.stage):[];
 const topZ=Math.max(...points.map(p=>p.z)),lit=active==='luster'&&pr.luster.light;
 points.map((p,i)=>({p,i})).sort((a,b)=>b.p.depth-a.p.depth).forEach(({p,i})=>{
  const Rr=radius*50*(1.08-.16*p.depth);   // radius é o diâmetro relativo, como --unit-size na cena principal
  for(let k=1;k<=(levels[i]||0);k++)el(top,'circle',{cx:p.x*100,cy:p.y*100,r:Rr+k*.9,class:'silm-snapshot-heat'});
  el(top,'circle',{cx:p.x*100,cy:p.y*100,r:Rr,class:'silm-snapshot-unit'+(lit&&p.z>=topZ-.05?' silm-snapshot-lit':'')});
  el(top,'text',{x:p.x*100,y:p.y*100+Rr*.32,'text-anchor':'middle','font-size':Rr*.9,class:'silm-snapshot-symbol'},element.symbol);
 });
 const overlay=SILM.createPropertyOverlay(stage,{before:top});R.layer('properties',overlay.root);
 let light=null;if(lit){const tops=points.filter(p=>p.z>=topZ-.05),v=R.toView({x:tops.reduce((a,c)=>a+c.x,0)/tops.length,y:tops.reduce((a,c)=>a+c.y,0)/tops.length});light={x:v.x*100,y:v.y*100};}
 const left=points.length?R.toView({x:Math.min(...points.map(p=>p.x))-radius,y:.5}).x:0;
 overlay.update({field:active==='electrical'&&pr.electrical.field,force:active==='malleability'?'compress':active==='ductility'?'stretch':null,level:active==='malleability'?pr.malleability.compression:active==='ductility'?pr.ductility.elongation:0,heat:active==='thermal'&&pr.thermal.heating,light,heatX:Math.max(0,Math.min(.8,left-.05))*100});
 const centres=[...points.map(p=>({x:p.x,y:p.y})),...lattice.map(o=>({x:o.q.x,y:o.q.y}))];
 const electrons=SILM.createElectronLayer(stage,{scope,before:overlay.root,reducedMotion:()=>true});R.layer('electrons',electrons.canvas);electrons.setCamera(R.camera);
 electrons.update({visible:!!state.electrons?.representation.visible,motion:false,field:active==='electrical'&&pr.electrical.field,centers:centres,spacing,connect:s.mode!=='crystalline'});
 return {root:figure};
};
