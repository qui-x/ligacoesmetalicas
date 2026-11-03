'use strict';
/* Comparação de referências: geometria documental separada das medições da bancada. */
SILM.referenceGeometry=e=>{
 const r=e?.structures?.find(x=>x.id===e.referenceStructure);if(!r||r.conditions?.phase?.value!=='solid')return null;
 const known=SILM.crystal.geometry(e);if(known)return {points:known.cell.map(x=>x.cart),edges:known.edges(),center:known.center,label:known.model.general?known.model.label:known.model.name,code:known.model.general?known.model.label:known.model.code,source:r.sourceId,canonical:true};
 const sites=SILM.crystal.expandSites(r.fractionalSites);if(r.type==='DHCP'&&sites.length!==4)return null;
 const p=r.latticeParameters,v=k=>p[k]?.value,rad=Math.PI/180,a=v('a'),b=v('b'),c=v('c'),alpha=v('alpha')*rad,beta=v('beta')*rad,gamma=v('gamma')*rad;
 if(![a,b,c,alpha,beta,gamma].every(Number.isFinite)||Math.min(a,b,c)<=0||Math.abs(Math.sin(gamma))<1e-8)return null;
 const cx=c*Math.cos(beta),cy=c*(Math.cos(alpha)-Math.cos(beta)*Math.cos(gamma))/Math.sin(gamma),cz2=c*c-cx*cx-cy*cy;if(cz2<=0)return null;
 const L=[[a,0,0],[b*Math.cos(gamma),b*Math.sin(gamma),0],[cx,cy,Math.sqrt(cz2)]],cart=f=>[0,1,2].map(i=>f.reduce((n,x,j)=>n+x*L[j][i],0));
 const corners=[0,1].flatMap(x=>[0,1].flatMap(y=>[0,1].map(z=>[x,y,z]))),edges=[];
 for(let i=0;i<8;i++)for(let j=i+1;j<8;j++)if(corners[i].filter((v,k)=>v!==corners[j][k]).length===1)edges.push([cart(corners[i]),cart(corners[j])]);
 return {points:sites.map(cart),edges,center:cart([.5,.5,.5]),label:r.label||r.type,code:r.type||'Referência',source:r.sourceId,canonical:false};
};
/* Visão geral como "Sua bancada" do SIAB (03/11/2026, pedido do autor): título e ações na mesma faixa, contador na aba,
   cartões numerados com "Em foco", desenho à esquerda e informações à direita; tocar num cartão abre a estrutura no Foco
   (a investigação atual é substituída só depois da confirmação); barra inferior com as estruturas e "Nova estrutura".
   current(): metal da investigação atual; open(z): abre a estrutura no Foco; newStructure(): abre Montagem → Preparo.
   Remover (✕) tira a estrutura só desta lista (nada da investigação é apagado); a estrutura em foco não sai. */
SILM.createStructureComparison=({storage,host,current=()=>null,open=null,newStructure=null,say=null})=>{
 const S=SILM,N=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;},svgNS='http://www.w3.org/2000/svg';
 let recent=storage.get('comparison.recent',[]);if(!Array.isArray(recent))recent=[];recent=recent.filter(z=>Number.isInteger(z)&&S.data.get(z)?.silmEligibility.status==='available').slice(0,6);
 let last=null,shownCurrent=null,property='none',level=0,showElectrons=true,moving=false,scopes=[],layers=[];
 let layout=storage.get('comparison.layout','grid');if(layout!=='list')layout='grid';
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('si-no-motion');
 function syncLayers(){const visible=!host.closest('[hidden]')&&location.hash.startsWith('#/ambiente');for(const item of layers)item.layer.update({...item.options,visible:visible&&showElectrons,motion:moving&&!reduced()});}
 new MutationObserver(syncLayers).observe(document.getElementById('workspace-overview'),{attributes:true,attributeFilter:['hidden']});window.addEventListener('hashchange',syncLayers);
 host.replaceChildren();host.classList.add('silm-comparison');
 // Faixa do título: "Estruturas recentes" à esquerda, ações à direita (como "Sua bancada" no SIAB).
 const head=N('div',null,'silm-overview-head'),title=host.closest('#workspace-overview')?.querySelector(':scope>h2')||N('h2','Estruturas recentes');head.append(title);
 const actions=N('div',null,'silm-comparison-actions');
 const electrons=N('button','Elétrons','secondary-btn');electrons.type='button';electrons.id='comparison-electrons';electrons.setAttribute('aria-pressed','true');electrons.title='Mostrar ou ocultar os elétrons deslocalizados';
 const motion=N('button','Movimento','secondary-btn');motion.type='button';motion.id='comparison-motion';motion.setAttribute('aria-pressed','false');motion.title='Ativar ou pausar o movimento eletrônico';
 const view=N('button','','secondary-btn');view.type='button';view.id='comparison-layout';view.title='Alternar entre grade e lista';
 electrons.onclick=()=>{showElectrons=!showElectrons;electrons.setAttribute('aria-pressed',String(showElectrons));syncLayers();};
 motion.onclick=()=>{moving=!moving;motion.setAttribute('aria-pressed',String(moving));syncLayers();};
 view.onclick=()=>{layout=layout==='grid'?'list':'grid';storage.set('comparison.layout',layout);applyLayout();};
 actions.append(electrons,motion,view);head.append(actions);
 title.tabIndex=-1;
 // Comparar uma propriedade: seletor, intensidade em botões segmentados (0 a 3) e Restaurar.
 const controls=N('div',null,'silm-comparison-controls');
 const propertyField=N('div',null,'silm-comparison-field');
 const label=N('label','Propriedade'),select=N('select',null,'silm-comparison-select');select.id='silm-comparison-property';label.htmlFor=select.id;
 for(const [id,name]of [['none','Referência'],...S.properties.ids.map(id=>[id,S.properties.catalog[id].title])]){const o=N('option',name);o.value=id;select.append(o);}
 propertyField.append(label,select);
 const intensityField=N('div',null,'silm-comparison-field');
 const amountLabel=N('span','Intensidade');amountLabel.id='silm-comparison-level-label';const amount=N('div',null,'silm-comparison-levels');amount.id='silm-comparison-level';amount.setAttribute('role','group');amount.setAttribute('aria-labelledby',amountLabel.id);
 const levelButtons=[0,1,2,3].map(v=>{const b=N('button',String(v),'secondary-btn');b.type='button';b.dataset.comparisonLevel=String(v);b.setAttribute('aria-label','Intensidade '+v+' de 3');b.setAttribute('aria-pressed',String(v===0));amount.append(b);return b;});
 const status=N('output','0/3','silm-comparison-level');status.setAttribute('aria-live','polite');intensityField.append(amountLabel,amount,status);
 const reset=N('button','Restaurar','secondary-btn silm-comparison-reset');reset.type='button';
 controls.append(propertyField,intensityField,reset);
 const limits=document.createElement('details');limits.className='silm-comparison-limits';
 limits.append(N('summary','Limites da comparação'),N('p','A intensidade é didática. As cenas não permitem classificar qual metal conduz ou deforma mais.'));
 // Menos texto: "Limites da comparação" (recolhido) fica na mesma linha dos controles; a dica saiu (o ✕ e o cartão dizem o que fazem).
 limits.querySelector('p').textContent='Até seis estruturas, cada uma com a sua referência e sem escala comum. A intensidade é didática: as cenas não permitem classificar qual metal conduz ou deforma mais.';controls.append(limits);
 const cards=N('div',null,'silm-comparison-cards');host.append(head,controls,cards);
 select.onchange=()=>{property=select.value;render();};
 const setLevel=v=>{level=v;status.textContent=level+'/3';for(const b of levelButtons)b.setAttribute('aria-pressed',String(Number(b.dataset.comparisonLevel)===v));};
 for(const b of levelButtons)b.onclick=()=>{setLevel(Number(b.dataset.comparisonLevel));render();};
 reset.onclick=()=>{property='none';select.value='none';setLevel(0);render();};
 function applyLayout(){cards.dataset.layout=layout;view.textContent=layout==='grid'?'Ver em lista':'Ver em grade';view.setAttribute('aria-label',layout==='grid'?'Ver em lista':'Ver em grade');}
 applyLayout();
 // Contador na aba "Visão geral" (como "Visão geral 2" no SIAB).
 function updateCount(){const tab=document.querySelector('[data-scene-view="overview"]');if(!tab)return;let badge=tab.querySelector('.si-tab-count');if(!badge){badge=N('span','','si-tab-count');tab.append(' ',badge);}badge.textContent=String(recent.length);badge.hidden=!recent.length;}
 // Barra inferior na Visão geral: as estruturas (ficha por metal) e "Nova estrutura" (como a bancada do SIAB).
 const strip=N('div',null,'silm-overview-strip');strip.setAttribute('role','group');strip.setAttribute('aria-label','Estruturas recentes');
 const stripLabel=N('div',null,'silm-overview-strip-label');const stripTitle=N('span','Estruturas'),stripCount=N('strong','0');stripLabel.append(stripTitle,stripCount);
 const chips=N('div',null,'silm-overview-chips');const add=N('button','+ Nova estrutura','button outline silm-overview-new');add.type='button';add.onclick=()=>newStructure?.();
 strip.append(stripLabel,chips,add);document.querySelector('#si-workspace .si-actionbar')?.append(strip);
 const structureCode=e=>{try{const g=S.referenceGeometry(e);return g?(g.canonical?(g.code||g.label):(g.label||g.code)):'';}catch{return '';}};
 async function openStructure(z){if(open)await open(z);}
 function removeStructure(z){const i=recent.indexOf(z);if(i<0||z===current())return;const next=recent.filter(v=>v!==z);if(!storage.set('comparison.recent',next))return;recent=next;render();
  say?.(S.data.get(z).name+' removido da Visão geral. Ele volta à lista quando for investigado de novo.','info');
  (cards.querySelectorAll('.silm-comparison-open')[Math.min(i,recent.length-1)]||title).focus();}
 function renderStrip(cur){chips.replaceChildren();stripCount.textContent=String(recent.length);
  recent.forEach((z,i)=>{const e=S.data.get(z),b=N('button',null,'silm-overview-chip');b.type='button';b.setAttribute('aria-pressed',String(z===cur));
   const sym=N('span',e.symbol,'silm-overview-chip-symbol');sym.setAttribute('aria-hidden','true');const txt=N('span');txt.append(N('strong',e.name),N('small',(i+1)+' · '+(structureCode(e)||'referência')));
   b.append(sym,txt);b.setAttribute('aria-label',(i+1)+'. '+e.name+(z===cur?', em foco':'')+' — abrir no Foco');b.onclick=()=>openStructure(z);chips.append(b);});}
 /* Desenho do cartão como no Foco (03/11/2026, pedido do autor: "dê o mesmo foco que deu na parte de em foco"): esferas
    com volume (o mesmo gradiente das unidades do Foco), menores e desenhadas antes quando estão mais ao fundo, com o
    símbolo do metal; arestas da célula finas; sem texto além de "E" no campo. Fonte e referência ficam no nome acessível. */
 let gradientId=0;
 function draw(g,e,source){
  const svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox','0 0 300 230');svg.setAttribute('role','img');
  const eligible=S.properties.eligibility(e)[property],apply=property!=='none'&&eligible?.status!=='unavailable';
  svg.setAttribute('aria-label',e.name+' — '+g.label+' — '+(property==='none'?'referência':S.properties.catalog[property].title+(apply?', intensidade '+level+' de 3 (qualitativa)':', indisponível: '+(eligible?.message||'nesta estrutura')))+(source?'. Fonte: '+source:''));
  const transform=p=>apply&&property==='malleability'?S.properties.compress(p,g.center,level):apply&&property==='ductility'?S.properties.elongate(p,g.center,level):p;
  const project=p=>{const q=p.map((v,i)=>v-g.center[i]);return [q[0]+.35*q[1],-q[2]+.3*q[1],q[1]];};
  const fit=[...g.points,...g.edges.flat()].map(project),max=Math.max(1,...fit.flatMap(q=>[Math.abs(q[0]),Math.abs(q[1])]))*1.32;
  const screen=p=>{const q=project(transform(p));return [150+q[0]*105/max,117+q[1]*105/max,q[2]];};
  const shape=(tag,attrs,parent=svg)=>{const n=document.createElementNS(svgNS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n;};
  const gid='silm-cmp-sphere-'+(++gradientId),defs=shape('defs',{}),grad=shape('radialGradient',{id:gid,cx:'34%',cy:'30%',r:'72%'},defs);
  for(const [o,c]of [['0','#f3e7c2'],['.34','#d4b465'],['.74','#a8743b'],['1','#6e4a22']])shape('stop',{offset:o,'stop-color':c},grad);
  for(const [a,b]of g.edges){const p=screen(a),q=screen(b);shape('line',{x1:p[0],y1:p[1],x2:q[0],y2:q[1],stroke:'currentColor','stroke-opacity':.35,'stroke-width':1.2,class:'silm-comparison-edge'});}
  const pts=g.points.map(screen),ds=pts.map(p=>p[2]),dMin=Math.min(...ds),dSpan=Math.max(1e-9,Math.max(...ds)-dMin);
  const xs=pts.map(p=>p[0]),min=Math.min(...xs),span=Math.max(1,Math.max(...xs)-min),R=Math.max(8,Math.min(17,60/Math.sqrt(pts.length)));
  // Do fundo para a frente: as esferas da frente cobrem as de trás, como no Foco.
  pts.map((p,i)=>({p,i,far:(p[2]-dMin)/dSpan})).sort((a,b)=>b.far-a.far).forEach(({p,far})=>{
   const r=R*(1-.22*far),heat=apply&&property==='thermal'?Math.max(0,level/3-(p[0]-min)/span*.6):0;
   shape('circle',{cx:p[0],cy:p[1],r,fill:`url(#${gid})`,stroke:'#2a2016','stroke-width':1,class:'silm-comparison-sphere'});
   if(heat){shape('circle',{cx:p[0],cy:p[1],r,fill:`hsl(${45-45*heat} 90% 55%)`,'fill-opacity':(.25+.45*heat).toFixed(2)});shape('circle',{cx:p[0],cy:p[1],r:r+3+heat*4,fill:'none',stroke:'currentColor','stroke-dasharray':'2 3'});}
   if(r>=10){const t=shape('text',{x:p[0],y:p[1],'text-anchor':'middle','dominant-baseline':'central','font-size':(r*.78).toFixed(1),'font-weight':800,fill:'#17181b',class:'silm-comparison-symbol'});t.textContent=e.symbol;}
  });
  const arrow=(x1,y1,x2,y2,color)=>{shape('line',{x1,y1,x2,y2,stroke:color,'stroke-width':2.2,'stroke-linecap':'round'});const a=Math.atan2(y2-y1,x2-x1),h=7;shape('polygon',{points:[[x2,y2],[x2-h*Math.cos(a-.45),y2-h*Math.sin(a-.45)],[x2-h*Math.cos(a+.45),y2-h*Math.sin(a+.45)]].map(q=>q.map(v=>v.toFixed(1)).join(',')).join(' '),fill:color});};
  if(apply&&property==='electrical'&&level){arrow(118,12,182,12,'currentColor');const t=shape('text',{x:190,y:12,'dominant-baseline':'central','font-size':13,'font-weight':800,fill:'currentColor'});t.textContent='E';
   for(let i=0;i<3;i++){const y=216;const x=110+i*40;arrow(x+level*5,y,x-level*5,y,'#168aad');}}
  if(apply&&property==='luster'&&level)for(let i=0;i<level;i++){shape('line',{x1:20+i*20,y1:12,x2:100+i*20,y2:70,stroke:'#b69a51','stroke-width':2});shape('line',{x1:100+i*20,y1:70,x2:180+i*20,y2:12,stroke:'#b69a51','stroke-dasharray':'5 3'});}
  return {svg,eligible,apply,centers:pts.map(p=>({x:p[0]/300,y:p[1]/230}))};
 }
 function render(){for(const scope of scopes)scope.destroy();scopes=[];layers=[];cards.replaceChildren();const cur=current();shownCurrent=cur;updateCount();renderStrip(cur);
  if(!recent.length){cards.append(N('p','Inicie uma investigação para incluir a primeira estrutura.'));return;}
  recent.forEach((z,i)=>{
   const e=S.data.get(z),card=N('article',null,'silm-comparison-card');let g=null;try{g=S.referenceGeometry(e);}catch{}
   const focused=z===cur;if(focused)card.dataset.current='true';
   const index=N('span',String(i+1),'silm-comparison-index');index.setAttribute('aria-hidden','true');card.append(index);
   if(focused){const badge=N('span','Em foco','silm-comparison-focus');card.append(badge);}
   else{const del=N('button','✕','silm-comparison-remove');del.type='button';del.setAttribute('aria-label','Remover '+e.name+' da Visão geral');del.title='Remover da Visão geral';del.onclick=ev=>{ev.stopPropagation();removeStructure(z);};card.append(del);}
   // O cartão inteiro abre a estrutura no Foco (botão transparente sobre o cartão; o nome acessível diz o que faz).
   const go=N('button',null,'silm-comparison-open');go.type='button';go.setAttribute('aria-label',(focused?'Ver ':'Abrir ')+e.name+' ('+e.symbol+') no Foco'+(focused?' (em foco)':''));go.title=focused?'Ver no Foco':'Abrir no Foco';go.onclick=()=>openStructure(z);card.append(go);
   const heading=N('header',null,'silm-comparison-card-heading');heading.append(N('h3',e.name+' ('+e.symbol+')'));
   if(g){
    let sourceTitle=g.source;try{sourceTitle=S.data.source(g.source)?.title||g.source;}catch(_){}
    const code=g.canonical?(g.code||g.label):(g.label||g.code),pill=N('span',code,'silm-comparison-structure');pill.title=(g.label&&g.label!==code?g.label.charAt(0).toUpperCase()+g.label.slice(1)+'. ':'')+'Fonte: '+(sourceTitle||'não informada')+(g.canonical?'':'. Célula construída a partir dos sítios e da simetria registrados.');heading.append(pill);
    const {svg,eligible,apply,centers}=draw(g,e,sourceTitle),stage=N('div',null,'silm-comparison-stage');stage.append(svg);card.append(stage);
    const scope=SimCore.createScope();scopes.push(scope);const layer=S.createElectronLayer(stage,{scope,reducedMotion:reduced});layers.push({layer,options:{centers,spacing:.12,connect:true,field:apply&&property==='electrical'&&level>0}});
    card.dataset.state=property==='none'?'reference':apply?'qualitative':'unavailable';
    // Só a indisponibilidade aparece em texto (curto); o motivo fica no título e no nome acessível do desenho.
    if(property!=='none'&&!apply){const chip=N('span','Indisponível','silm-comparison-card-state');chip.title=eligible?.message||'Indisponível nesta estrutura.';heading.append(chip);}
   }else{card.dataset.state='no-geometry';const none=N('p','Geometria de referência indisponível.','silm-comparison-kind');card.append(none);}
   card.append(heading);cards.append(card);
  });
  syncLayers();
 }
 render();
 return {update(state){const z=state.metal?.atomicNumber;if(z&&z!==last){last=z;const next=[z,...recent.filter(v=>v!==z)].slice(0,6);if(storage.set('comparison.recent',next))recent=next;render();}else if((z||null)!==shownCurrent)render();},render};
};
