'use strict';
window.SILM=window.SILM||{};
/* Botão de ação sem desabilitação temporária: o estado aria-disabled é decidido pelo domínio
   e o foco permanece no controle mesmo quando a ação deixa de estar disponível. */
SILM.actionButton=(text,run,scope,{id,primary=false,danger=false,glyph=null,label=null}={})=>{
 const U=SimCore.ExperienceUI,b=U.element('button',glyph?null:text,primary?'primary-btn':danger?'danger-btn':'secondary-btn');b.type='button';if(id)b.id=id;
 if(glyph){const g=U.element('span',glyph+' ','silm-glyph');g.setAttribute('aria-hidden','true');b.append(g,U.element('span',text));}if(label)b.setAttribute('aria-label',label);
 scope.listen(b,'click',()=>{if(b.getAttribute('aria-disabled')!=='true')return run();});return b;
};
/* Notas da cena (0.9.1, homologação): explicações, legendas e instruções ficam num bloco recolhível
   "Como ler esta cena". A cena mantém a estrutura, os controles e uma linha de retorno, como a bancada do SIAB.
   Fechado por padrão até 900 px (celular e tablet); a escolha do usuário é lembrada como preferência de representação. */
SILM.createSceneNotes=(parent,{scope,items=[]})=>{
 const U=SimCore.ExperienceUI,store=SimCore.storage.domain('silm'),KEY='scene.notes';
 const box=U.element('details',null,'silm-scene-notes'),summary=U.element('summary','Como ler esta cena'),body=U.element('div',null,'silm-scene-notes-body');
 box.id='silm-scene-notes';box.append(summary,body);body.append(...items.filter(Boolean));
 const saved=store.get(KEY,null);box.open=typeof saved==='boolean'?saved:!matchMedia('(max-width:900px)').matches;
 scope.listen(summary,'click',()=>store.set(KEY,!box.open));   // o clique (ou Enter/Espaço no resumo) alterna depois deste evento
 parent.append(box);return box;
};
/* Representação 2D funcional da montagem (0.4.x). Lê o estado científico e escreve somente pelas
   ações do domínio. Seleção, arrasto e prévia de teclado são estado transitório de interface.
   Sem linhas entre unidades e sem escala física. Elétrons (0.6.x): camada própria, qualitativa, sobre a mesma cena. */
SILM.createAssemblyView=(host,{scope,model,element,editable,actions,note='',reference='de referência',moduleTitle='Explorar',describeLast=()=>null,canExplore=()=>false,onExplore=()=>{},organize=null,reducedMotion=()=>false,electrons:electronOptions=null,properties:propertyOptions=null})=>{
 const U=SimCore.ExperienceUI,A=SILM.assembly,C=A.contract,name=element.name.toLocaleLowerCase('pt-BR');
 const statusLabel={empty:'Vazia',assembling:'Em construção',assembled:'Concluída pelo usuário'};
 const root=U.element('section',null,'silm-assembly');root.dataset.editable=String(editable);root.setAttribute('aria-labelledby','silm-assembly-title');
 const bar=U.element('header',null,'silm-assembly-bar'),identity=U.element('div',null,'silm-assembly-identity'),titles=U.element('div');
 const badge=U.element('span',element.symbol,'silm-assembly-symbol');badge.setAttribute('aria-hidden','true');
 const eyebrow=U.element('p','MONTAGEM LIVRE','eyebrow silm-assembly-eyebrow');
 const title=U.element('h1',element.name);title.id='silm-assembly-title';title.tabIndex=-1;
 const help=U.element('a','?','ajuda-link');help.href='#/manual/montagem';help.setAttribute('aria-label','Ajuda: montagem da estrutura');help.title='Ajuda: montagem da estrutura';
 const heading=U.element('div',null,'silm-assembly-heading');heading.append(title,help);
 const meta=U.element('p','','silm-assembly-meta');meta.id='silm-assembly-meta';titles.append(eyebrow,heading,meta);identity.append(badge,titles);
 const tools=U.element('div',null,'silm-assembly-tools');let add=null,undo=null;
 let organizeButton=null;
 if(editable){add=SILM.actionButton('Adicionar unidade',()=>actions.add(),scope,{id:'silm-assembly-add',primary:true,glyph:'+'});undo=SILM.actionButton('Desfazer',()=>actions.undo(),scope,{id:'silm-assembly-undo',glyph:'↶',label:'Desfazer última ação'});tools.append(add,undo);
  // 0.5.x: organização cristalográfica segundo a estrutura de referência do banco.
  if(organize){organizeButton=SILM.actionButton('Organizar estrutura',()=>organize.run(),scope,{id:'silm-assembly-organize'});organizeButton.setAttribute('aria-describedby','silm-assembly-crystal-reason');tools.append(organizeButton);}}
 else if(canExplore())tools.append(SILM.actionButton('Montar em Explorar',onExplore,scope,{id:'silm-assembly-explore'}));
 bar.append(identity,tools);
 const area=U.element('div',null,'silm-assembly-area'),stage=U.element('div',null,'silm-assembly-stage');stage.id='silm-assembly-stage';
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('aria-hidden','true');svg.classList.add('silm-assembly-collective');
 const collective=document.createElementNS(svg.namespaceURI,'g');svg.append(collective);
 const layer=U.element('div',null,'silm-assembly-units');
 const empty=U.element('p','Montagem iniciada. Use Adicionar unidade para inserir a primeira unidade de '+name+'.','silm-assembly-empty');
 stage.append(svg,layer,empty);area.append(stage);
 const footer=U.element('div',null,'silm-assembly-footer'),assist=U.element('span','Posicionamento assistido','silm-assist-badge');assist.title='Mecanismo de interface: evita sobreposição. Não representa forças entre átomos.';
 const kind=U.element('span','Representação didática, sem escala física · ainda não representa a geometria cristalográfica '+reference+'.','silm-assembly-kind');
 const instructions=U.element('p',editable?'Selecione uma unidade e toque no destino, arraste-a ou use as setas. Shift + seta move em passo fino; Esc solta a unidade.':(note?note+' ':'')+'A edição da montagem está disponível em Explorar.','silm-assembly-help');instructions.id='silm-assembly-help';
 const feedback=U.element('p','','silm-assembly-feedback');feedback.id='silm-assembly-feedback';
 const crystalReason=U.element('p','','silm-assembly-reason');crystalReason.id='silm-assembly-crystal-reason';
 footer.append(crystalReason,feedback);root.append(bar,area,footer);host.append(root);
 // 0.6.x: elétrons de valência deslocalizados — distribuição preliminar sobre a montagem livre.
 const electronLayer=SILM.createElectronLayer(stage,{scope,before:layer,reducedMotion});
 const electronLegend=U.element('p','Pontos ciano: elétrons de valência deslocalizados, marcadores qualitativos (não indicam o número real de elétrons). Na montagem livre, a distribuição é uma representação didática preliminar da ligação metálica coletiva.','silm-electron-legend');electronLegend.id='silm-electron-legend';electronLegend.hidden=true;
 const electronControls=electronOptions?SILM.createElectronControls(footer,{scope,state:()=>model.state,actions:electronOptions.actions,reducedMotion,canActivate:electronOptions.canActivate}):null;
 if(electronControls)footer.prepend(electronControls.root);
 // 0.7.x: na montagem livre, somente a condutividade elétrica (observação básica sobre os elétrons).
 const P=SILM.properties,overlay=SILM.createPropertyOverlay(stage,{before:layer}),propertyHost=U.element('div',null,'silm-property-host');
 footer.insertBefore(propertyHost,crystalReason);const propertyControls=propertyOptions?.controls?.(propertyHost,scope)||null;
 SILM.createSceneNotes(footer,{scope,items:[instructions,electronLegend,assist,kind]});
 const known=new Set();let drawn=false;
 const freeSpacing=list=>{if(list.length<2)return .12;const nn=list.map(u=>Math.min(...list.filter(v=>v!==u).map(v=>A.distance(u.position,v.position)))).sort((a,b)=>a-b);return Math.max(.1,Math.min(.2,nn[Math.floor(nn.length/2)]));};
 if(editable){layer.setAttribute('role','group');layer.setAttribute('aria-label','Unidades da montagem de '+name);}
 else{stage.setAttribute('role','img');}

 const nodes=new Map();let selected=null,focusId=null,serial=0,drag=null,keyMove=null,suppressClick=false,frame=0,lastRegion=new Map();
 const units=()=>model.state.structure?.units||[];
 const indexOf=id=>units().findIndex(u=>u.id===id);
 const label=id=>'Unidade de '+name+' '+(indexOf(id)+1)+' de '+units().length;
 const place=(node,p)=>{node.style.left=(p.x*100)+'%';node.style.top=(p.y*100)+'%';};
 const say=(text,{announce=true}={})=>{feedback.textContent=text;if(announce)SimCore.notifications.announce(text);};
 const region=p=>{const h=p.x<1/3?'esquerda':p.x<2/3?'centro':'direita',v=p.y<1/3?'superior':p.y<2/3?'central':'inferior';return h==='centro'&&v==='central'?'região central':'região '+v+(h==='centro'?' ao centro':' '+h);};
 const toScene=event=>{const r=stage.getBoundingClientRect();return {x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height};};
 function createNode(u){
  const node=U.element(editable?'button':'span',null,'silm-unit');node.dataset.unitId=u.id;
  if(editable){node.type='button';node.setAttribute('aria-describedby',instructions.id);node.tabIndex=-1;}else node.setAttribute('aria-hidden','true');
  const core=U.element('span',element.symbol,'silm-unit-core');core.setAttribute('aria-hidden','true');node.append(core);layer.append(node);return node;
 }
 function render(){
  const s=model.state.structure;if(!s)return;const list=s.units;let lostFocus=false;
  for(const [id,node]of nodes)if(!list.some(u=>u.id===id)){lostFocus=lostFocus||node.contains(document.activeElement);node.remove();nodes.delete(id);lastRegion.delete(id);if(selected===id)selected=null;if(focusId===id)focusId=null;}
  for(const u of list){let node=nodes.get(u.id);if(!node){node=createNode(u);nodes.set(u.id,node);}
   if(drag?.id!==u.id&&keyMove?.id!==u.id){place(node,u.position);delete node.dataset.conflict;}
   if(editable){node.setAttribute('aria-label',label(u.id));node.setAttribute('aria-pressed',String(selected===u.id));}
   node.dataset.placement=u.placement;
  }
  const roving=selected||(focusId&&nodes.has(focusId)?focusId:list[0]?.id);if(editable)for(const [id,node]of nodes)node.tabIndex=id===roving?0:-1;
  if(lostFocus)(nodes.get(roving)||title).focus();
  collective.replaceChildren(...list.map(u=>{const c=document.createElementNS(svg.namespaceURI,'circle');c.setAttribute('cx',String(u.position.x*100));c.setAttribute('cy',String(u.position.y*100));c.setAttribute('r',String(C.minDistance*78));return c;}));
  const el=model.state.electrons,shownElectrons=!!el?.representation.visible&&list.length>=2;
  const pr=model.state.properties,fieldOn=pr?.active==='electrical'&&pr.electrical.field;
  electronLayer.update({visible:shownElectrons,motion:!!el?.representation.motion,field:fieldOn,centers:list.map(u=>u.position),spacing:freeSpacing(list),connect:true});
  overlay.update({field:fieldOn});root.dataset.property=pr?.active||'';propertyControls?.update();
  for(const u of list)if(!known.has(u.id)){known.add(u.id);if(drawn&&shownElectrons)electronLayer.incorporate(u.position);}
  for(const id of [...known])if(!list.some(u=>u.id===id))known.delete(id);drawn=true;
  root.dataset.electrons=shownElectrons?'visible':'hidden';electronLegend.hidden=!shownElectrons;electronControls?.update();
  const n=list.length;meta.textContent='Montagem metálica · '+n+' '+(n===1?'unidade':'unidades')+' · '+statusLabel[s.status]+(pr?.active?' · '+P.catalog[pr.active].title+' em estudo':'');meta.title=meta.textContent;
  empty.hidden=n>0;assist.hidden=!s.assistance.enabled;root.dataset.status=s.status;
  if(!editable)stage.setAttribute('aria-label','Montagem de '+name+' com '+n+' '+(n===1?'unidade':'unidades')+'. Representação didática; a edição está disponível em Explorar.'+(shownElectrons?' Elétrons visíveis: representação qualitativa de elétrons de valência deslocalizados distribuídos pela estrutura metálica.':'')+(fieldOn?' Campo elétrico aplicado: a representação eletrônica apresenta deslocamento coletivo orientado.':''));
  add?.setAttribute('aria-disabled',String(n>=C.maxUnits));undo?.setAttribute('aria-disabled',String(!model.canUndo));if(undo){const last=describeLast();undo.title=last?'Desfazer: '+last:'Nada para desfazer';}
  if(organize){const o=organize.state();crystalReason.textContent=o.reason||'';crystalReason.hidden=!o.reason;if(organizeButton){organizeButton.setAttribute('aria-disabled',String(o.disabled));organizeButton.title=o.reason||o.title||'';}}
 }
 function select(id,{announce=true,focus=false}={}){
  if(!editable)return;flushKeys();if(id&&!nodes.has(id))return;
  const previous=selected;selected=id;serial++;if(id)focusId=id;render();
  if(focus&&id)nodes.get(id).focus();
  if(announce){if(id)say('Unidade de '+name+' '+(indexOf(id)+1)+' selecionada.');else if(previous&&nodes.has(previous))say('Unidade de '+name+' '+(indexOf(previous)+1)+' solta.');}
 }
 function moveTo(id,target){
  const r=actions.move(id,target),k=indexOf(id)+1;
  if(!r.ok)say(r.reason==='OCCUPIED'?'Destino ocupado. A unidade permaneceu na posição anterior.':'Destino inválido. A unidade permaneceu na posição anterior.');
  else if(r.unchanged)return r;
  else say(r.adjusted?'Posição ajustada para evitar sobreposição. Use Desfazer para voltar.':'Unidade de '+name+' '+k+' movida. Use Desfazer para voltar.');
  return r;
 }
 /* Teclado: prévia local a cada tecla; uma única escrita ao soltar a tecla. */
 function keyStep(id,dx,dy){
  const u=units().find(x=>x.id===id),current=keyMove?.id===id?keyMove.position:u.position,target=A.clamp({x:current.x+dx,y:current.y+dy});
  if(target.x===current.x&&target.y===current.y){say('Limite da área de montagem.');return;}
  if(!A.isFree(units(),target,id)){say('Movimento bloqueado: espaço ocupado.');return;}
  keyMove={id,position:target,gesture:'teclado-'+serial};place(nodes.get(id),target);
 }
 function flushKeys(){
  if(!keyMove)return;const pending=keyMove;keyMove=null;const r=actions.move(pending.id,pending.position,{gesture:pending.gesture});
  if(!r.ok){say('Movimento bloqueado: espaço ocupado.');return;}
  const where=region(r.position);if(lastRegion.get(pending.id)!==where){lastRegion.set(pending.id,where);say('Unidade '+(indexOf(pending.id)+1)+': '+where+'.');}
 }
 if(editable){
  scope.listen(layer,'pointerdown',event=>{
   suppressClick=false;const node=event.target.closest('.silm-unit');if(!node||event.button>0||drag)return;flushKeys();
   const u=units().find(x=>x.id===node.dataset.unitId);if(!u)return;
   const p=toScene(event);drag={id:u.id,node,pointerId:event.pointerId,x:event.clientX,y:event.clientY,offset:{x:p.x-u.position.x,y:p.y-u.position.y},moved:false,position:u.position,threshold:event.pointerType==='mouse'?4:8};
   try{node.setPointerCapture(event.pointerId);}catch(_){}
  });
  scope.listen(layer,'pointermove',event=>{
   if(!drag||event.pointerId!==drag.pointerId)return;
   if(!drag.moved&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<drag.threshold)return;
   if(!drag.moved){drag.moved=true;drag.node.dataset.dragging='';if(selected!==drag.id)select(drag.id,{announce:false});}
   const p=toScene(event);drag.position=A.clamp({x:p.x-drag.offset.x,y:p.y-drag.offset.y});place(drag.node,drag.position);
   if(A.isFree(units(),drag.position,drag.id))delete drag.node.dataset.conflict;else drag.node.dataset.conflict='';
  });
  const endDrag=(event,commit)=>{
   if(!drag||event.pointerId!==drag.pointerId)return;const current=drag;drag=null;delete current.node.dataset.dragging;delete current.node.dataset.conflict;
   try{current.node.releasePointerCapture(current.pointerId);}catch(_){}
   if(current.moved){suppressClick=true;if(commit)moveTo(current.id,current.position);render();}
  };
  scope.listen(layer,'pointerup',event=>endDrag(event,true));
  scope.listen(layer,'pointercancel',event=>endDrag(event,false));
  scope.listen(layer,'lostpointercapture',event=>endDrag(event,false));
  scope.cleanup(()=>{if(drag){try{drag.node.releasePointerCapture(drag.pointerId);}catch(_){}drag=null;}});
  scope.listen(layer,'click',event=>{const node=event.target.closest('.silm-unit');if(!node)return;event.stopPropagation();if(suppressClick){suppressClick=false;return;}const id=node.dataset.unitId;select(selected===id?null:id);});
  // Alternativa sem arrasto: unidade selecionada → toque ou clique no destino.
  scope.listen(stage,'click',event=>{if(event.target.closest('.silm-unit'))return;suppressClick=false;if(!selected){if(units().length)say('Selecione uma unidade para posicioná-la.');return;}moveTo(selected,toScene(event));});
  scope.listen(layer,'focusin',event=>{const node=event.target.closest('.silm-unit');if(node)focusId=node.dataset.unitId;});
  scope.listen(layer,'focusout',()=>flushKeys());
  scope.listen(layer,'keydown',event=>{
   const node=event.target.closest('.silm-unit');if(!node||event.altKey||event.ctrlKey||event.metaKey)return;const id=node.dataset.unitId,list=units();
   const arrows={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
   if(event.key==='Escape'&&selected){event.preventDefault();event.stopPropagation();select(null);return;}
   if(arrows[event.key]&&selected===id){event.preventDefault();const step=event.shiftKey?C.fineStep:C.keyboardStep,[dx,dy]=arrows[event.key];keyStep(id,dx*step,dy*step);return;}
   // Sem unidade selecionada, as setas apenas percorrem as unidades; nada é movido.
   const k=indexOf(id),next={ArrowRight:k+1,ArrowDown:k+1,ArrowLeft:k-1,ArrowUp:k-1,Home:0,End:list.length-1}[event.key];
   if(next!=null&&!selected){event.preventDefault();const target=list[Math.max(0,Math.min(list.length-1,next))];focusId=target.id;render();nodes.get(target.id).focus();}
  });
  scope.listen(layer,'keyup',event=>{if(event.key.startsWith('Arrow'))flushKeys();});
  scope.cleanup(()=>flushKeys());
 }
 // Cena quadrada: posições normalizadas são independentes do tamanho da tela.
 const fit=()=>{frame=0;const size=Math.max(160,Math.floor(Math.min(area.clientWidth,area.clientHeight))-2);stage.style.setProperty('--stage',size+'px');};
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(fit);};
 if(window.ResizeObserver)scope.observe(new ResizeObserver(schedule),area);else scope.listen(window,'resize',schedule);
 scope.cleanup(()=>{if(frame)cancelAnimationFrame(frame);frame=0;});
 render();fit();
 return Object.freeze({root,title,update:render,select:(id,options)=>select(id,options),say,get selected(){return selected;},focusAdd:()=>add?.focus(),
  focusUnit:id=>{if(nodes.has(id)){focusId=id;render();nodes.get(id).focus();}}});
};
