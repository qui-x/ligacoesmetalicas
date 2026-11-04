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
SILM.createStructureComparison=({storage,host,current=()=>null,open=null,newStructure=null,say=null,confirm=null})=>{
 const S=SILM,N=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=text;if(cls)n.className=cls;return n;},NS='http://www.w3.org/2000/svg';
 const KEY='structures.collection',MAX=30,copy=x=>JSON.parse(JSON.stringify(x));
 const validRecord=r=>{
  if(!r||typeof r!=='object'||typeof r.id!=='string'||typeof r.name!=='string'||!r.name.trim()||!r.snapshot||r.snapshot.investigation?.id!==r.id)return false;
  const checked=S.validateScientificState(r.snapshot);
  return checked.ok&&checked.value.investigation?.type==='free'&&checked.value.structure?.units?.length>0&&checked.value.metal?.atomicNumber===r.atomicNumber;
 };
 let raw=storage.get(KEY,[]),records=Array.isArray(raw)?raw.filter(validRecord):[];
 let normalizedNames=false;
 for(const record of records)if(!record.customName){
  const element=S.data.get(record.atomicNumber),defaultLabel=element?.name;
  if(defaultLabel&&record.name!==defaultLabel){record.name=defaultLabel;normalizedNames=true;}
 }
 if(normalizedNames)storage.set(KEY,records);
 let lastCurrent=null,layout=storage.get('structures.layout','grid');
 if(!['grid','list'].includes(layout))layout='grid';
 if(!Array.isArray(raw)||records.length!==raw.length)storage.set(KEY,records);
 host.replaceChildren();host.classList.add('silm-structure-manager');
 const page=host.closest('#workspace-overview'),pageTitle=page?.querySelector(':scope>h2');
 if(pageTitle)pageTitle.textContent='Gerenciamento de estruturas';
 if(page)page.setAttribute('aria-label','Gerenciamento de estruturas salvas');
 const intro=N('p','Selecione uma estrutura salva para continuar no Foco.','silm-structure-manager-intro');
 const toolbar=N('div',null,'silm-structure-manager-toolbar');
 const layoutButton=N('button',layout==='grid'?'Ver em lista':'Ver em grade','secondary-btn silm-structure-layout');layoutButton.type='button';
 const count=N('span','0 estruturas','silm-structure-count');count.setAttribute('role','status');
 toolbar.append(count,layoutButton);
 const cards=N('div',null,'silm-structure-cards');host.append(intro,toolbar,cards);
 const strip=N('div',null,'silm-overview-strip');strip.setAttribute('role','group');strip.setAttribute('aria-label','Estruturas salvas');
 const stripLabel=N('div',null,'silm-overview-strip-label');stripLabel.append(N('span','Estruturas'),N('strong','0'));
 const chips=N('div',null,'silm-overview-chips');
 const add=N('button','+ Nova estrutura','button outline silm-overview-new');add.type='button';add.addEventListener('click',()=>newStructure?.());
 strip.append(stripLabel,chips,add);
 // A faixa é conteúdo exclusivo da Visão geral: deve ser filha do painel de gerenciamento,
 // nunca da barra de ações compartilhada com o Foco.
 host.append(strip);
 const defaultName=state=>{
  const e=S.data.get(state.metal.atomicNumber),structure=state.structure;
  const label=structure.mode==='crystalline'?'Estrutura cristalina':'Montagem livre';
  return (e?.name||'Estrutura')+' · '+label;
 };
 function persist(next){
  if(!storage.set(KEY,next)){say?.('Não foi possível atualizar o gerenciamento de estruturas. Os dados anteriores foram preservados.','warning');return false;}
  records=next;return true;
 }
 function saveCurrent(state){
  if(!state?.investigation||state.investigation.type!=='free'||!state.structure?.units?.length||!state.metal)return false;
  const id=state.investigation.id,index=records.findIndex(r=>r.id===id),old=index>=0?records[index]:null,snapshot=copy(state);
  const record={
   id,
   name:old?.customName?old.name:defaultName(state),
   customName:!!old?.customName,
   atomicNumber:state.metal.atomicNumber,
   mode:state.structure.mode,
   unitCount:state.structure.units.length,
   createdAt:old?.createdAt||state.investigation.createdAt,
   updatedAt:state.investigation.updatedAt||state.structure.updatedAt,
   snapshot
  };
  if(old&&old.name===record.name&&old.mode===record.mode&&old.unitCount===record.unitCount&&JSON.stringify(old.snapshot)===JSON.stringify(snapshot))return false;
  const next=[record,...records.filter(r=>r.id!==id)].slice(0,MAX);
  return persist(next);
 }
 function updateCount(cur){
  const tab=document.querySelector('[data-scene-view="overview"]');
  if(tab){let badge=tab.querySelector('.si-tab-count');if(!badge){badge=N('span','','si-tab-count');tab.append(' ',badge);}badge.textContent=String(records.length);badge.hidden=!records.length;}
  count.textContent=records.length+' '+(records.length===1?'estrutura salva':'estruturas salvas');
  stripLabel.lastElementChild.textContent=String(records.length);
 }
 function path(svg,d,attrs={}){
  const p=document.createElementNS(NS,'path');p.setAttribute('d',d);for(const [k,v]of Object.entries(attrs))p.setAttribute(k,String(v));svg.append(p);return p;
 }
 let gradient=0;
 function preview(record){
  const state=record.snapshot,element=S.data.get(record.atomicNumber),structure=state.structure;
  const width=360,height=240;
  const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 360 240');svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.setAttribute('role','img');
  svg.setAttribute('aria-label',record.name+', '+record.unitCount+' unidades, '+(record.mode==='crystalline'?'prévia da estrutura cristalográfica':'prévia da montagem livre'));
  const defs=document.createElementNS(NS,'defs'),gid='silm-manager-sphere-'+(++gradient);
  const grad=document.createElementNS(NS,'radialGradient');grad.id=gid;grad.setAttribute('cx','32%');grad.setAttribute('cy','25%');grad.setAttribute('r','78%');
  for(const [offset,color]of [['0','#fff1cb'],['.32','#e2c273'],['.72','#b98743'],['1','#69451f']]){
   const stop=document.createElementNS(NS,'stop');stop.setAttribute('offset',offset);stop.setAttribute('stop-color',color);grad.append(stop);
  }
  defs.append(grad);svg.append(defs);
  const line=(x1,y1,x2,y2,opacity=.48)=>{
   const l=document.createElementNS(NS,'line');
   for(const [k,v]of Object.entries({x1,y1,x2,y2}))l.setAttribute(k,String(v));
   l.setAttribute('stroke','currentColor');l.setAttribute('stroke-opacity',String(opacity));l.setAttribute('stroke-width','1.35');l.setAttribute('stroke-linecap','round');svg.append(l);
  };
  const sphere=(x,y,r)=>{
   const halo=document.createElementNS(NS,'circle');halo.setAttribute('cx',String(x));halo.setAttribute('cy',String(y));halo.setAttribute('r',String(r+2.2));halo.setAttribute('fill','none');halo.setAttribute('stroke','#d9b55e');halo.setAttribute('stroke-opacity','.48');halo.setAttribute('stroke-width','1.1');svg.append(halo);
   const c=document.createElementNS(NS,'circle');c.setAttribute('cx',String(x));c.setAttribute('cy',String(y));c.setAttribute('r',String(r));c.setAttribute('fill','url(#'+gid+')');c.setAttribute('stroke','#4a361c');c.setAttribute('stroke-width','1.15');svg.append(c);
   if(r>=9){const t=document.createElementNS(NS,'text');t.setAttribute('x',String(x));t.setAttribute('y',String(y));t.setAttribute('text-anchor','middle');t.setAttribute('dominant-baseline','central');t.setAttribute('font-size',String(Math.max(8,r*.82)));t.setAttribute('font-weight','800');t.setAttribute('fill','#17181b');t.textContent=element.symbol;svg.append(t);}
  };
  if(structure.mode==='free'){
   const units=structure.units||[],positions=units.map(u=>u.position).filter(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y));
   if(positions.length){
    const xs=positions.map(p=>p.x),ys=positions.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const spanX=Math.max(1e-6,maxX-minX),spanY=Math.max(1e-6,maxY-minY),scale=Math.min(250/spanX,150/spanY);
    const cx=(minX+maxX)/2,cy=(minY+maxY)/2,radius=Math.max(9,Math.min(19,86/Math.sqrt(positions.length)));
    positions.forEach(p=>sphere(width/2+(p.x-cx)*scale,height/2-(p.y-cy)*scale,radius));
   }
  }else{
   let geometry=null;try{geometry=S.referenceGeometry(element);}catch{}
   const expected=structure.crystallography?.structureType;if(geometry&&expected&&geometry.model?.id!==expected)geometry=null;
   if(geometry&&geometry.points?.length&&geometry.edges?.length){
    const project=p=>{const q=p.map((v,i)=>v-geometry.center[i]);return [q[0]+.35*q[1],-q[2]+.3*q[1],q[1]];};
    const all=[...geometry.points,...geometry.edges.flat()].map(project);
    const xs=all.map(p=>p[0]),ys=all.map(p=>p[1]);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const spanX=Math.max(1e-6,maxX-minX),spanY=Math.max(1e-6,maxY-minY);
    // Todas as prévias cristalográficas usam a mesma moldura e orientação, com escala
    // normalizada pela maior dimensão da célula, para permitir comparação visual direta.
    const scale=Math.min(250/spanX,162/spanY);
    const centerX=(minX+maxX)/2,centerY=(minY+maxY)/2;
    const screen=p=>{const q=project(p);return [width/2+(q[0]-centerX)*scale,height/2-(q[1]-centerY)*scale,q[2]];};
    for(const [a,b]of geometry.edges){const p=screen(a),q=screen(b);line(p[0],p[1],q[0],q[1],.54);}
    const points=geometry.points.map(screen),depth=points.map(p=>p[2]),lo=Math.min(...depth),hi=Math.max(...depth),depthSpan=Math.max(1e-9,hi-lo);
    const radius=Math.max(7.5,Math.min(18,82/Math.sqrt(points.length)));
    points.map(p=>({p,far:(p[2]-lo)/depthSpan})).sort((a,b)=>b.far-a.far).forEach(({p,far})=>sphere(p[0],p[1],radius*(1-.12*far)));
   }else{
    const label=document.createElementNS(NS,'text');label.setAttribute('x','180');label.setAttribute('y','120');label.setAttribute('text-anchor','middle');label.setAttribute('dominant-baseline','central');label.setAttribute('fill','currentColor');label.setAttribute('opacity','.72');label.setAttribute('font-size','13');label.textContent='Geometria de referência indisponível';svg.append(label);
   }
  }
  return svg;
 }
  function setLayout(){
  cards.dataset.layout=layout;layoutButton.textContent=layout==='grid'?'Ver em lista':'Ver em grade';
  layoutButton.setAttribute('aria-label',layout==='grid'?'Ver estruturas em lista':'Ver estruturas em grade');
 }
 layoutButton.addEventListener('click',()=>{layout=layout==='grid'?'list':'grid';storage.set('structures.layout',layout);setLayout();});
 function renderStrip(cur){
  chips.replaceChildren();
  records.forEach((record,index)=>{
   const e=S.data.get(record.atomicNumber),chip=N('button',null,'silm-overview-chip');chip.type='button';
   chip.setAttribute('aria-pressed',String(record.id===cur));
   const symbol=N('span',e.symbol,'silm-overview-chip-symbol');symbol.setAttribute('aria-hidden','true');
   const text=N('span',null);text.append(N('strong',record.name),N('small',(index+1)+' · '+e.symbol));
   chip.append(symbol,text);chip.setAttribute('aria-label','Exibir '+record.name+' no Foco');
   chip.addEventListener('click',()=>openRecord(record.id));chips.append(chip);
  });
 }
 function saveName(id,value){
  const name=value.trim().slice(0,100);if(!name){say?.('Informe um nome para a estrutura.','warning');return false;}
  const next=records.map(r=>r.id===id?{...r,name,customName:true}:r);
  return persist(next);
 }
 function editName(record,card,trigger){
  const title=card.querySelector('.silm-structure-title'),form=N('form',null,'silm-structure-rename');
  const input=N('input');input.type='text';input.maxLength=100;input.required=true;input.value=record.name;input.setAttribute('aria-label','Nome da estrutura');input.autocomplete='off';
  const save=N('button','Salvar','button primary');save.type='submit';const cancel=N('button','Cancelar','button outline');cancel.type='button';
  form.append(input,save,cancel);title.replaceWith(form);if(trigger)trigger.disabled=true;
  cancel.addEventListener('click',render);
  form.addEventListener('submit',event=>{event.preventDefault();if(saveName(record.id,input.value)){say?.('Nome da estrutura atualizado.','success');render();}});
  input.focus();input.select();
 }
 async function removeRecord(record){
  if(record.id===current())return;
  const accepted=confirm?await confirm({title:'Remover estrutura salva?',description:'A estrutura será retirada do gerenciamento. A investigação atualmente aberta não será alterada.',confirmText:'Remover',cancelText:'Cancelar',destructive:true}):false;
  if(!accepted)return;
  const next=records.filter(r=>r.id!==record.id);if(persist(next)){say?.(record.name+' removida do gerenciamento.','info');render();}
 }
 async function openRecord(id){
  const record=records.find(r=>r.id===id);if(!record||!open)return;
  const ok=await open(copy(record));if(ok)render();
 }
 function renderCards(cur){
  cards.replaceChildren();
  if(!records.length){
   const empty=N('div',null,'silm-structure-empty');
   empty.append(N('h3','Nenhuma estrutura salva'),N('p','Adicione unidades em Montagem. Cada estrutura criada aparece aqui com seu próprio nome e pode ser retomada no Foco.'));
   const action=N('button','Abrir Montagem','button primary');action.type='button';action.addEventListener('click',()=>newStructure?.());
   empty.append(action);cards.append(empty);return;
  }
  for(const [index,record]of records.entries()){
   const e=S.data.get(record.atomicNumber);if(!e)continue;
   const structure=record.snapshot.structure;
   const card=N('article',null,'silm-structure-card');card.dataset.structureId=record.id;card.dataset.mode=record.mode;
   if(record.id===cur)card.dataset.current='true';
   const head=N('header',null,'silm-structure-card-head');
   const counter=N('span','#'+String(index+1).padStart(2,'0'),'silm-structure-card-index');
   const heading=N('div',null,'silm-structure-card-heading');
   const title=N('h3',record.name,'silm-structure-title');
   const kind=record.mode==='crystalline'?S.crystal.label(structure.crystallography.structureType,e):'Montagem livre';
   const composition=N('p',e.name+' ('+e.symbol+') · '+kind+' · '+record.unitCount+' '+(record.unitCount===1?'unidade':'unidades'),'silm-structure-composition');
   heading.append(title,composition);
   const status=N('span',record.id===cur?'Em foco':'Salva','silm-structure-status');
   head.append(counter,heading,status);card.append(head);
   const figure=N('div',null,'silm-structure-preview');figure.append(preview(record));card.append(figure);
   const actions=N('div',null,'silm-structure-card-actions');
   const focus=N('button',record.id===cur?'Em foco':'Exibir no Foco',record.id===cur?'button outline':'button primary');
   focus.type='button';focus.disabled=record.id===cur;focus.addEventListener('click',()=>openRecord(record.id));
   const rename=N('button','Renomear','button outline');rename.type='button';rename.addEventListener('click',()=>editName(record,card,rename));
   const remove=N('button','Remover','button outline silm-structure-remove');remove.type='button';remove.disabled=record.id===cur;
   remove.title=record.id===cur?'A estrutura em foco não pode ser removida.':'Remover esta estrutura salva';
   remove.addEventListener('click',()=>removeRecord(record));
   actions.append(focus,rename,remove);card.append(actions);
   cards.append(card);
  }
 }
  function render(){
  const cur=current();updateCount(cur);renderStrip(cur);renderCards(cur);setLayout();
 }
 function update(state){
  const changed=saveCurrent(state),cur=current();
  if(changed||cur!==lastCurrent){lastCurrent=cur;render();}
 }
 async function openFromStripOrCard(id){return openRecord(id);}
 records.forEach(r=>r.updatedAt=r.updatedAt||r.createdAt||'');
 records.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
 render();lastCurrent=current();
 return {update,render,open:openFromStripOrCard,records:()=>copy(records)};
};