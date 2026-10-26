'use strict';
window.SILM=window.SILM||{};
/* Um componente, dois contextos. O callback de investigação é a única escrita científica. */
SILM.createPeriodicTable=(host,{scope,state,teacher=false,onInvestigate,onSources,onSelect=()=>{},canInvestigate=()=>true,toolbar=null})=>{
 const U=SimCore.ExperienceUI,D=SILM.data,sequence=++SILM.tableSequence,prefix='periodic-'+sequence;
 const root=U.element('section',null,'silm-periodic');root.dataset.context=teacher?'presentation':'investigation';
 const head=U.element('header',null,'periodic-heading'),title=U.element('h1','Tabela Periódica');title.id=prefix+'-title';title.tabIndex=-1;
 root.setAttribute('aria-labelledby',title.id);
 const intro=U.element('div');intro.append(U.element('p',teacher?'SILM · APRESENTAÇÃO':'SILM · SELEÇÃO DE METAL','eyebrow'),title);head.append(intro);
 const searchBox=U.element('form',null,'periodic-search'),label=U.element('label','Buscar elemento');label.htmlFor=prefix+'-search';
 const input=U.element('input');input.id=prefix+'-search';input.type='search';input.placeholder='Nome, símbolo ou Z';input.autocomplete='off';input.value=state.query||'';input.maxLength=80;
 const find=U.element('button','Localizar','secondary-btn');find.type='submit';searchBox.append(label,input,find);head.append(searchBox);if(toolbar)head.append(toolbar);root.append(head);
 const status=U.element('p','','periodic-status');status.id=prefix+'-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');input.setAttribute('aria-describedby',status.id);root.append(status);
 const scroll=U.element('div',null,'periodic-scroll');scroll.setAttribute('aria-label','Tabela completa. Role dentro desta região para ver todos os grupos.');
 const grid=U.element('div',null,'periodic-grid');scroll.append(grid);root.append(scroll);
 /* R06: em telas estreitas a Tabela completa não cabe com células tocáveis; a dica mostra que há mais grupos ao lado. */
 const scrollHint=U.element('p','Deslize a tabela para os lados para ver os grupos 1 a 18.','periodic-scroll-hint');scrollHint.hidden=true;root.append(scrollHint);
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
 const foot=U.element('footer',null,'periodic-footer'),legend=U.element('div',null,'periodic-legend');legend.setAttribute('aria-label','Legenda de disponibilidade');
 for(const [style,text]of [['available','✓ Disponível'],['unavailable','— Metal indisponível'],['outside','· Fora do escopo metálico']]){const item=U.element('span',text);item.dataset.availability=style;legend.append(item);}foot.append(legend);
 const summary=U.element('div',null,'periodic-summary');summary.id=prefix+'-summary';summary.setAttribute('aria-live','polite');foot.append(summary);
 const actions=U.element('div',null,'periodic-actions');const clear=U.button('Limpar destaque',()=>{state.selection=null;state.query='';input.value='';updateSearch(false);update();input.focus();},scope,{id:prefix+'-clear'});
 const investigate=U.button(teacher?'Investigar este metal':'Iniciar investigação',()=>{const e=D.get(state.selection);if(e?.silmEligibility.status==='available'&&canInvestigate())return onInvestigate(e);},scope,{id:prefix+'-investigate',primary:true});
 const sources=U.button('Fontes',()=>{const e=D.get(state.selection);if(e)onSources(e);},scope,{id:prefix+'-sources'});actions.append(clear,investigate,sources);foot.append(actions);root.append(foot);host.append(root);
 function update(){
  const e=D.get(state.selection);for(const [z,b]of buttons){b.setAttribute('aria-pressed',String(z===state.selection));b.classList.toggle('is-selected',z===state.selection);}
  summary.replaceChildren();clear.disabled=!state.selection&&!input.value;sources.hidden=!e;investigate.hidden=!e||e.silmEligibility.status!=='available';investigate.disabled=!canInvestigate();
  if(!e){summary.append(U.element('p',teacher?'Escolha um elemento para apresentar à turma.':'Selecione um metal para iniciar uma investigação.'));return;}
  summary.append(U.element('strong',e.symbol+' · '+e.name+' · Z = '+e.atomicNumber),U.element('span',D.categoryLabel(e)));
  const ref=D.structure(e);summary.append(U.element('span',e.silmEligibility.status==='available'?'Disponível · '+(ref?.label||''):D.reason(e)));
  if(e.classification.note)summary.append(U.element('small',e.classification.note));
  if(!canInvestigate()&&e.silmEligibility.status==='available')summary.append(U.element('small','Encerre a atividade atual para iniciar outra investigação.'));
 }
 function inspect(z,focus=false){state.selection=z;update();const selected=D.get(z);if(selected?.silmEligibility.status==='available'&&canInvestigate())onSelect(selected);if(focus){const b=buttons.get(z);b?.focus({preventScroll:true});b?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});}}
 function updateSearch(focus){state.query=input.value;const results=D.search(input.value);for(const [z,b]of buttons)b.classList.toggle('is-match',!!input.value.trim()&&results.some(e=>e.atomicNumber===z));
  status.textContent=input.value.trim()?(results.length?results.length+' resultado'+(results.length===1?'':'s')+'. '+D.label(results[0]):'Nenhum elemento encontrado. A tabela continua completa.'):'118 elementos · grupos 1–18 · use as setas para navegar entre elementos.';
  if(input.value.trim()&&results.length){inspect(results[0].atomicNumber,focus);if(!focus)buttons.get(results[0].atomicNumber)?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});}else if(!input.value.trim()){update();}
 }
 scope.listen(input,'input',()=>updateSearch(false));scope.listen(searchBox,'submit',event=>{event.preventDefault();updateSearch(true);});
 scope.listen(grid,'click',event=>{const b=event.target.closest('button[data-z]');if(b)inspect(Number(b.dataset.z));});
 scope.listen(grid,'keydown',event=>{const b=event.target.closest('button[data-z]');if(!b)return;const e=D.get(Number(b.dataset.z));let target;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
   const horizontal=['ArrowLeft','ArrowRight'].includes(event.key),forward=['ArrowRight','ArrowDown'].includes(event.key),axis=horizontal?'column':'row',other=horizontal?'row':'column';
   target=D.elements.filter(n=>n.layout[other]===e.layout[other]&&(forward?n.layout[axis]>e.layout[axis]:n.layout[axis]<e.layout[axis])).sort((a,c)=>Math.abs(a.layout[axis]-e.layout[axis])-Math.abs(c.layout[axis]-e.layout[axis]))[0];
  }else if(event.key==='Home')target=D.elements[0];else if(event.key==='End')target=D.elements[117];else return;
  event.preventDefault();if(target){buttons.get(target.atomicNumber).focus();buttons.get(target.atomicNumber).scrollIntoView({block:'nearest',inline:'nearest'});}
 });
 const resize=()=>{if(!root.isConnected)return;const min=26,gap=4;
  const width=scroll.clientWidth-30,wide=(width-20-18*gap)/18;let cell=Math.max(min,wide);
  if(root.closest('.silm-presentation.is-expanded,.silm-laboratory')){
   // Onze linhas: cabeçalho de 20 px, separador de 8 px e nove linhas de elementos.
   // Descontar os dez intervalos e o padding real evita overflow por poucos pixels no tablet.
   const style=getComputedStyle(scroll),padding=(parseFloat(style.paddingTop)||0)+(parseFloat(style.paddingBottom)||0);
   const tall=(scroll.clientHeight-padding-20-8-10*gap-2)/9/1.13;cell=Math.max(min,Math.min(wide,tall));
  }
  const size=Math.max(min,Math.min(96,cell));root.style.setProperty('--periodic-cell',size+'px');root.dataset.density=size<34?'tiny':size<46?'compact':'full';requestAnimationFrame(()=>{scrollHint.hidden=scroll.scrollWidth<=scroll.clientWidth+1;});
 };
 if(window.ResizeObserver){const observer=new ResizeObserver(resize);scope.observe(observer,scroll);}scope.listen(window,'resize',resize);scope.on('theme:changed',resize);
 update();if(state.query)updateSearch(false);else status.textContent='118 elementos · grupos 1–18 · use as setas para navegar entre elementos.';resize();
 return {root,title,inspect,resize,refresh:update,input,buttons,destroy:()=>root.remove()};
};
SILM.tableSequence=0;
