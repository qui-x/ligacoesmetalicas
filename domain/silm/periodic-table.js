'use strict';
window.SILM=window.SILM||{};
/* Um componente, dois contextos. O callback de investigação é a única escrita científica. */
SILM.createPeriodicTable=(host,{scope,state,teacher=false,onInvestigate,onSources,onSelect=()=>{},onExplore=()=>{},canInvestigate=()=>true,toolbar=null,entryObjects=false})=>{
 const U=SimCore.ExperienceUI,D=SILM.data,sequence=++SILM.tableSequence,prefix='periodic-'+sequence;
 const root=U.element('section',null,'silm-periodic');root.dataset.context=teacher?'presentation':entryObjects?'objects':'investigation';
 const head=U.element('header',null,'periodic-heading'),title=U.element('h1',entryObjects?'Tabela Periódica · Objetos':'Tabela Periódica');title.id=prefix+'-title';title.tabIndex=-1;
 root.setAttribute('aria-labelledby',title.id);
 const intro=U.element('div');intro.append(U.element('p',teacher?'SILM · APRESENTAÇÃO':entryObjects?'ESCOLHA UM METAL PARA EXPLORAR OBJETOS':'SILM · SELEÇÃO DE METAL','eyebrow'),title);head.append(intro);
 const searchBox=U.element('form',null,'periodic-search'),label=U.element('label','Buscar elemento');label.htmlFor=prefix+'-search';
 const input=U.element('input');input.id=prefix+'-search';input.type='search';input.placeholder='Nome, símbolo ou Z';input.autocomplete='off';input.value=state.query||'';input.maxLength=80;
 const find=U.element('button','Localizar','secondary-btn');find.type='submit';searchBox.append(label,input,find);head.append(searchBox);if(toolbar)head.append(toolbar);root.append(head);
 const status=U.element('p','','periodic-status');status.id=prefix+'-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');input.setAttribute('aria-describedby',status.id);root.append(status);
 const scroll=U.element('div',null,'periodic-scroll');scroll.setAttribute('role','region');scroll.tabIndex=0;scroll.setAttribute('aria-label',entryObjects?'Tabela Periódica de 118 elementos organizada em 18 grupos, visível por completo no desktop.':'Tabela Periódica, 118 elementos. Deslize horizontal ou verticalmente para percorrer todos os grupos.');
 const grid=U.element('div',null,'periodic-grid');scroll.append(grid);root.append(scroll);
 /* R06: em telas estreitas a Tabela completa não cabe com células tocáveis; a dica mostra que há mais grupos ao lado. */
 const scrollHint=U.element('p','Deslize para os lados para percorrer os grupos 1 a 18.','periodic-scroll-hint');scrollHint.id=prefix+'-scroll-hint';scrollHint.hidden=entryObjects;if(!entryObjects)scroll.setAttribute('aria-describedby',scrollHint.id);root.append(scrollHint);
 const place=(node,row,column,span=1)=>{node.style.gridRow=String(row);node.style.gridColumn=String(column)+(span>1?' / span '+span:'');grid.append(node);};
 for(let g=1;g<=18;g++)place(U.element('span',String(g),'periodic-group'),1,g+1);
 for(let p=1;p<=7;p++)place(U.element('span',String(p),'periodic-period'),p+1,1);
 for(const [row,text]of [[7,'57–71'],[8,'89–103']]){const n=U.element('span',text,'periodic-series-mark');n.title=row===7?'Lantanídeos: linha destacada abaixo':'Actinídeos: linha destacada abaixo';place(n,row,4);}
 place(U.element('span','Lantanídeos','periodic-series-label'),10,1,4);place(U.element('span','Actinídeos','periodic-series-label'),11,1,4);
 const buttons=new Map();
 for(const e of D.elements){
  const b=U.element('button',null,'periodic-element');b.type='button';b.dataset.z=e.atomicNumber;b.dataset.symbol=e.symbol;
  const available=e.silmEligibility.status==='available';b.dataset.availability=available?'available':e.classification.metallic?'unavailable':'outside';
  b.dataset.category=e.classification.category;b.id=prefix+'-z'+e.atomicNumber;
  b.setAttribute('aria-label',D.label(e));b.title=D.label(e);b.setAttribute('aria-pressed','false');
  const z=U.element('span',String(e.atomicNumber),'element-z'),symbol=U.element('strong',e.symbol,'element-symbol'),name=U.element('span',e.name,'element-name');
  const badge=U.element('span',available?'✓':e.classification.metallic?'—':'·','element-badge');badge.setAttribute('aria-hidden','true');
  b.append(z,symbol,name,badge);place(b,e.layout.row,e.layout.column);buttons.set(e.atomicNumber,b);
 }
 // Apenas a porta de entrada Objeto usa o modo por famílias. A Tabela
 // ampliada continua clássica (118 botões, rolagem e teclas intactos).
 const familyPages=[
  ...Array.from({length:18},(_,i)=>({id:String(i+1),name:'Grupo '+(i+1)})),
  {id:'lanthanides',name:'Lantanídeos'},
  {id:'actinides',name:'Actinídeos'}
 ];
 const familyNames={
  '1':'Hidrogênio e metais alcalinos','2':'Metais alcalino-terrosos',
  '3':'Grupo do escândio','4':'Grupo do titânio','5':'Grupo do vanádio',
  '6':'Grupo do crômio','7':'Grupo do manganês','8':'Grupo do ferro',
  '9':'Grupo do cobalto','10':'Grupo do níquel','11':'Grupo do cobre',
  '12':'Grupo do zinco','13':'Família do boro','14':'Família do carbono',
  '15':'Família do nitrogênio','16':'Calcogênios','17':'Halogênios',
  '18':'Gases nobres',lanthanides:'Série dos lantanídeos',
  actinides:'Série dos actinídeos'
 };
 let familyIndex=0;
 let familyPanel=null,familySelect=null,familyList=null,familyTitle=null;
 const familyPageFor=e=>{
  if(!e)return 0;
  if(e.atomicNumber>=57&&e.atomicNumber<=71)return 18;
  if(e.atomicNumber>=89&&e.atomicNumber<=103)return 19;
  return Math.max(0,Math.min(17,(e.layout.column||2)-2));
 };
 const elementsForFamily=page=>{
  if(page.id==='lanthanides')return D.elements.filter(e=>e.atomicNumber>=57&&e.atomicNumber<=71);
  if(page.id==='actinides')return D.elements.filter(e=>e.atomicNumber>=89&&e.atomicNumber<=103);
  return D.elements.filter(e=>e.layout.row>=2&&e.layout.row<=8&&e.layout.column===Number(page.id)+1)
   .sort((a,b)=>a.layout.row-b.layout.row);
 };
 function renderFamily(){
  if(!familyList)return;
  const page=familyPages[familyIndex],elements=elementsForFamily(page);
  familySelect.value=page.id;
  familyTitle.textContent=(page.id==='lanthanides'||page.id==='actinides'?'Série':'Família')+
   ' · '+familyNames[page.id]+' · '+elements.length+' elementos';
  familyList.classList.toggle('silm-family-series',elements.length>8);
  familyList.replaceChildren();
  for(const e of elements){
   const b=U.element('button',null,'silm-family-element');
   b.type='button';b.dataset.z=String(e.atomicNumber);
   b.dataset.availability=e.silmEligibility.status==='available'?'available':
    e.classification.metallic?'unavailable':'outside';
   b.setAttribute('aria-label',D.label(e));b.title=D.label(e);
   b.setAttribute('aria-pressed',String(e.atomicNumber===state.selection));
   b.append(U.element('small',String(e.atomicNumber),'silm-family-z'),
    U.element('strong',e.symbol,'silm-family-symbol'),
    U.element('span',e.name,'silm-family-name'));
   if(e.atomicNumber===state.selection)b.classList.add('is-selected');
   familyList.append(b);
  }
 }
 if(entryObjects){
  familyPanel=U.element('section',null,'silm-periodic-family');
  familyPanel.setAttribute('aria-label','Navegar entre famílias da Tabela Periódica');
  const familyNav=U.element('div',null,'silm-family-navigation');
  const previous=U.element('button','‹','silm-family-previous');
  const next=U.element('button','›','silm-family-next');
  for(const b of [previous,next])b.type='button';
  previous.setAttribute('aria-label','Família anterior');
  next.setAttribute('aria-label','Próxima família');
  familySelect=U.element('select',null,'silm-family-picker');
  familySelect.setAttribute('aria-label','Escolher grupo ou série');
  for(const page of familyPages){
   const option=U.element('option',page.name);option.value=page.id;
   familySelect.append(option);
  }
  familyNav.append(previous,familySelect,next);
  familyTitle=U.element('p',null,'silm-family-title');
  familyTitle.setAttribute('aria-live','polite');
  familyList=U.element('div',null,'silm-family-list');
  familyList.setAttribute('role','group');
  familyList.setAttribute('aria-label','Elementos desta família');
  familyPanel.append(familyNav,familyTitle,familyList);
  root.insertBefore(familyPanel,scrollHint);
  const navigate=index=>{
   familyIndex=(index+familyPages.length)%familyPages.length;
   renderFamily();
  };
  scope.listen(previous,'click',()=>navigate(familyIndex-1));
  scope.listen(next,'click',()=>navigate(familyIndex+1));
  scope.listen(familySelect,'change',()=>{
   const index=familyPages.findIndex(page=>page.id===familySelect.value);
   if(index>=0)navigate(index);
  });
  scope.listen(familyList,'click',event=>{
   const b=event.target.closest('button[data-z]');
   if(b)inspect(Number(b.dataset.z));
  });
  scope.listen(familyList,'keydown',event=>{
   if(!['ArrowUp','ArrowDown'].includes(event.key))return;
   const b=event.target.closest('button[data-z]');if(!b)return;
   const cells=[...familyList.querySelectorAll('button[data-z]')];
   const index=cells.indexOf(b),step=event.key==='ArrowDown'?1:-1;
   if(index<0)return;
   event.preventDefault();
   cells[Math.max(0,Math.min(cells.length-1,index+step))]?.focus({preventScroll:true});
  });
  renderFamily();
 }
 const foot=U.element('footer',null,'periodic-footer'),legend=U.element('div',null,'periodic-legend');legend.setAttribute('aria-label','Legenda de disponibilidade');
 for(const [style,text]of [['available','✓ Disponível'],['unavailable','— Metal indisponível'],['outside','· Fora do escopo metálico']]){const item=U.element('span',text);item.dataset.availability=style;legend.append(item);}foot.append(legend);
 const summary=U.element('div',null,'periodic-summary');summary.id=prefix+'-summary';summary.setAttribute('aria-live','polite');foot.append(summary);
 const actions=U.element('div',null,'periodic-actions');const clear=U.button('Limpar destaque',()=>{state.selection=null;state.query='';input.value='';updateSearch(false);update();input.focus();},scope,{id:prefix+'-clear'});
 const investigate=U.button(teacher?'Investigar este metal':'Iniciar investigação',()=>{const e=D.get(state.selection);if(e?.silmEligibility.status==='available'&&canInvestigate())return onInvestigate(e);},scope,{id:prefix+'-investigate',primary:true});
 const explore=U.button('Ver aplicações',()=>{const e=D.get(state.selection);if(e?.silmEligibility.status==='available'&&canInvestigate())return onExplore(e);},scope,{id:prefix+'-explore'});
 const sources=U.button('Fontes',()=>{const e=D.get(state.selection);if(e)onSources(e);},scope,{id:prefix+'-sources'});actions.append(clear,investigate,explore,sources);foot.append(actions);root.append(foot);host.append(root);
 function update(){
  const e=D.get(state.selection);for(const [z,b]of buttons){b.setAttribute('aria-pressed',String(z===state.selection));b.classList.toggle('is-selected',z===state.selection);}
  if(familyList)for(const b of familyList.querySelectorAll('button[data-z]')){
   const selected=Number(b.dataset.z)===state.selection;
   b.setAttribute('aria-pressed',String(selected));b.classList.toggle('is-selected',selected);
  }
  summary.replaceChildren();clear.disabled=!state.selection&&!input.value;sources.hidden=!e;investigate.hidden=entryObjects||!e||e.silmEligibility.status!=='available';investigate.disabled=!canInvestigate();explore.hidden=entryObjects||teacher||!e||e.silmEligibility.status!=='available';explore.disabled=!canInvestigate();
  if(!e){summary.append(U.element('p',teacher?'Escolha um elemento para apresentar à turma.':entryObjects?'Selecione um metal disponível para abrir seus objetos no catálogo.':'Selecione um metal para iniciar uma investigação.'));return;}
  summary.append(U.element('strong',e.symbol+' · '+e.name+' · Z = '+e.atomicNumber),U.element('span',D.categoryLabel(e)));
  const ref=D.structure(e);summary.append(U.element('span',e.silmEligibility.status==='available'?'Disponível · '+(ref?.label||''):D.reason(e)));
  if(e.classification.note)summary.append(U.element('small',e.classification.note));
  if(!canInvestigate()&&e.silmEligibility.status==='available')summary.append(U.element('small','Encerre a atividade atual para iniciar outra investigação.'));
 }
 // Trazer uma célula para a área útil da grade sem deslocar o diálogo,
 // as docas, a tela ou outro ancestral. scrollIntoView deslocava toda
 // a cadeia de contêineres em telas pequenas e no WebKit.
 function reveal(b){
  if(!b||!scroll.isConnected)return;
  if(entryObjects&&window.matchMedia('(max-width:900px)').matches){
   const page=familyPageFor(D.get(Number(b.dataset.z)));
   if(page!==familyIndex){familyIndex=page;renderFamily();}
   return;
  }
  const frame=scroll.getBoundingClientRect(),cell=b.getBoundingClientRect(),margin=8;
  const left=frame.left+margin,right=frame.right-margin;
  const top=frame.top+margin,bottom=frame.bottom-margin;
  if(cell.left<left)scroll.scrollLeft+=cell.left-left;
  else if(cell.right>right)scroll.scrollLeft+=cell.right-right;
  if(cell.top<top)scroll.scrollTop+=cell.top-top;
  else if(cell.bottom>bottom)scroll.scrollTop+=cell.bottom-bottom;
 }
 function inspect(z,focus=false){
  state.selection=z;update();
  const selected=D.get(z);
  if(selected?.silmEligibility.status==='available'&&canInvestigate())onSelect(selected);
  if(focus){
   const b=buttons.get(z);reveal(b);
   const visible=entryObjects&&window.matchMedia('(max-width:900px)').matches
    ?familyList?.querySelector('button[data-z="'+z+'"]'):b;
   visible?.focus({preventScroll:true});
  }
 }
 function updateSearch(focus){state.query=input.value;const results=D.search(input.value);for(const [z,b]of buttons)b.classList.toggle('is-match',!!input.value.trim()&&results.some(e=>e.atomicNumber===z));
  status.textContent=input.value.trim()?(results.length?results.length+' resultado'+(results.length===1?'':'s')+'. '+D.label(results[0]):'Nenhum elemento encontrado. A tabela continua completa.'):'118 elementos · grupos 1–18 · use as setas para navegar entre elementos.';
  // Digitar apenas destaca e localiza visualmente o resultado: a seleção
  // científica só muda após Localizar/Enter ou toque no elemento.
  if(input.value.trim()&&results.length){
   if(focus)inspect(results[0].atomicNumber,true);
   else reveal(buttons.get(results[0].atomicNumber));
  }else if(!input.value.trim()){update();}
 }
 scope.listen(input,'input',()=>updateSearch(false));scope.listen(searchBox,'submit',event=>{event.preventDefault();updateSearch(true);});
 scope.listen(grid,'click',event=>{const b=event.target.closest('button[data-z]');if(b)inspect(Number(b.dataset.z));});
 scope.listen(grid,'keydown',event=>{const b=event.target.closest('button[data-z]');if(!b)return;const e=D.get(Number(b.dataset.z));let target;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
   const horizontal=['ArrowLeft','ArrowRight'].includes(event.key),forward=['ArrowRight','ArrowDown'].includes(event.key),axis=horizontal?'column':'row',other=horizontal?'row':'column';
   target=D.elements.filter(n=>n.layout[other]===e.layout[other]&&(forward?n.layout[axis]>e.layout[axis]:n.layout[axis]<e.layout[axis])).sort((a,c)=>Math.abs(a.layout[axis]-e.layout[axis])-Math.abs(c.layout[axis]-e.layout[axis]))[0];
  }else if(event.key==='Home')target=D.elements[0];else if(event.key==='End')target=D.elements[117];else return;
  event.preventDefault();if(target){
   const next=buttons.get(target.atomicNumber);next?.focus({preventScroll:true});reveal(next);
  }
 });
 // WebKit: mutações de --periodic-cell alteram o tamanho da própria região
 // observada. Nunca escrever CSS nem alternar a dica no callback do ResizeObserver.
 // Dimensionar no frame seguinte e somente quando o valor calculado mudou.
 let resizeFrame=0,hintFrame=0;
 const resize=()=>{
  if(!root.isConnected)return;
  if(entryObjects){
   // A entrada por Objeto não tem rolagem. O palco determina a largura
   // de 18 grupos e a altura das 9 linhas, sem escala mínima de 44px:
   // essa área é visão panorâmica, enquanto o mobile oferece alvos
   // de toque reais de 44px por família.
   const fit=Math.min((scroll.clientWidth-100)/18,(scroll.clientHeight-45)/9);
   const density=fit<30?'tiny':fit<42?'compact':'full';
   if(root.dataset.density!==density)root.dataset.density=density;
   if(scrollHint.hidden!==true)scrollHint.hidden=true;
   return;
  }
  // Uma grade química não pode encolher abaixo de um alvo de toque razoável.
  // Se não couber, a navegação ocorre *dentro* da tabela, sem reduzir todas
  // as células ou aumentar a largura da página.
  const min=44,gap=4,style=getComputedStyle(scroll);
  const pad=(parseFloat(style.paddingLeft)||0)+(parseFloat(style.paddingRight)||0);
  const available=Math.max(0,scroll.clientWidth-pad);
  const gridFixed=20+18*gap; // eixo esquerdo + 18 espaços entre 19 colunas
  const widthCell=(available-gridFixed)/18;
  // A largura define a escala para evitar oscilações de layout causadas
  // por barras de rolagem verticais ou variações da altura da janela.
  const size=Math.max(min,Math.min(82,Math.floor(widthCell*2)/2));
  const previous=parseFloat(root.style.getPropertyValue('--periodic-cell'));
  if(!Number.isFinite(previous)||Math.abs(previous-size)>.1)
   root.style.setProperty('--periodic-cell',size+'px');
  const density=size<48?'compact':'full';
  if(root.dataset.density!==density)root.dataset.density=density;
  if(!hintFrame)hintFrame=requestAnimationFrame(()=>{
   hintFrame=0;
   if(!root.isConnected||scroll.clientWidth<=0)return;
   const hidden=scroll.scrollWidth<=scroll.clientWidth+1;
   if(scrollHint.hidden!==hidden)scrollHint.hidden=hidden;
  });
 };
 const scheduleResize=()=>{
  if(resizeFrame)return;
  resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;resize();});
 };
 if(window.ResizeObserver){
  const observer=new ResizeObserver(scheduleResize);
  scope.observe(observer,scroll);
 }
 scope.listen(window,'resize',scheduleResize);
 scope.on('theme:changed',scheduleResize);
 scope.cleanup(()=>{
  if(resizeFrame)cancelAnimationFrame(resizeFrame);
  if(hintFrame)cancelAnimationFrame(hintFrame);
  resizeFrame=0;hintFrame=0;
 });
 update();if(state.query)updateSearch(false);else status.textContent='118 elementos · grupos 1–18 · use as setas para navegar entre elementos.';scheduleResize();
 return {root,title,inspect,resize,refresh:update,input,buttons,destroy:()=>root.remove()};
};
SILM.tableSequence=0;
