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
SILM.createStructureComparison=({storage,host})=>{
 const S=SILM,N=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;},svgNS='http://www.w3.org/2000/svg';
 let recent=storage.get('comparison.recent',[]);if(!Array.isArray(recent))recent=[];recent=recent.filter(z=>Number.isInteger(z)&&S.data.get(z)?.silmEligibility.status==='available').slice(0,6);
 let last=null,property='none',level=0,showElectrons=true,moving=false,scopes=[],layers=[];
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('si-no-motion');
 function syncLayers(){const visible=!host.closest('[hidden]')&&location.hash.startsWith('#/ambiente');for(const item of layers)item.layer.update({...item.options,visible:visible&&showElectrons,motion:moving&&!reduced()});}
 new MutationObserver(syncLayers).observe(document.getElementById('workspace-overview'),{attributes:true,attributeFilter:['hidden']});window.addEventListener('hashchange',syncLayers);
 host.replaceChildren();host.classList.add('silm-comparison');
 const controls=N('div');controls.className='silm-comparison-controls';
 const propertyField=N('div');propertyField.className='silm-comparison-field';
 const label=N('label','Propriedade'),select=N('select');select.id='silm-comparison-property';select.className='silm-comparison-select';label.htmlFor=select.id;
 for(const [id,title]of [['none','Referência'],...S.properties.ids.map(id=>[id,S.properties.catalog[id].title])]){const o=N('option',title);o.value=id;select.append(o);}
 propertyField.append(label,select);
 const intensityField=N('div');intensityField.className='silm-comparison-field';
 // Intensidade em botões segmentados (0 a 3), no estilo de "Célula | Rede" — sem barra deslizante.
 const amountLabel=N('span','Intensidade');amountLabel.id='silm-comparison-level-label';const amount=N('div');amount.id='silm-comparison-level';amount.className='silm-comparison-levels';amount.setAttribute('role','group');amount.setAttribute('aria-labelledby',amountLabel.id);
 const levelButtons=[0,1,2,3].map(v=>{const b=N('button',String(v));b.type='button';b.dataset.comparisonLevel=String(v);b.className='secondary-btn';b.setAttribute('aria-label','Intensidade '+v+' de 3');b.setAttribute('aria-pressed',String(v===0));amount.append(b);return b;});
 const status=N('output','0/3');status.setAttribute('aria-live','polite');status.className='silm-comparison-level';intensityField.append(amountLabel,amount,status);
 const actions=N('div');actions.className='silm-comparison-actions';
 const reset=N('button','Restaurar');reset.type='button';reset.className='secondary-btn';
 const electrons=N('button','Elétrons');electrons.type='button';electrons.id='comparison-electrons';electrons.className='secondary-btn';electrons.setAttribute('aria-pressed','true');electrons.title='Mostrar ou ocultar os elétrons deslocalizados';
 const motion=N('button','Movimento');motion.type='button';motion.id='comparison-motion';motion.className='secondary-btn';motion.setAttribute('aria-pressed','false');motion.title='Ativar ou pausar o movimento eletrônico';
 electrons.onclick=()=>{showElectrons=!showElectrons;electrons.setAttribute('aria-pressed',String(showElectrons));syncLayers();};
 motion.onclick=()=>{moving=!moving;motion.setAttribute('aria-pressed',String(moving));syncLayers();};
 actions.append(reset,electrons,motion);controls.append(propertyField,intensityField,actions);
 const note=N('p','Até seis estruturas recentes. Cada uma usa sua referência; não há escala comum.');note.className='silm-comparison-intro';
 const limits=document.createElement('details');limits.className='silm-comparison-limits';
 const limitsTitle=N('summary','Limites da comparação');
 const limitsText=N('p','A intensidade é didática. As cenas não permitem classificar qual metal conduz ou deforma mais.');
 limits.append(limitsTitle,limitsText);
 const cards=N('div');cards.className='silm-comparison-cards';host.append(controls,note,limits,cards);
 select.onchange=()=>{property=select.value;render();};
 const setLevel=v=>{level=v;status.textContent=level+'/3';for(const b of levelButtons)b.setAttribute('aria-pressed',String(Number(b.dataset.comparisonLevel)===v));};
 for(const b of levelButtons)b.onclick=()=>{setLevel(Number(b.dataset.comparisonLevel));render();};
 reset.onclick=()=>{property='none';select.value='none';setLevel(0);render();};
 function draw(g,e){
  const svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox','0 0 300 230');svg.setAttribute('role','img');svg.setAttribute('aria-label',e.name+' — '+g.label+' — '+(property==='none'?'referência':S.properties.catalog[property].title)+', nível '+level);
  const eligible=S.properties.eligibility(e)[property],apply=property!=='none'&&eligible?.status!=='unavailable';
  const transform=p=>apply&&property==='malleability'?S.properties.compress(p,g.center,level):apply&&property==='ductility'?S.properties.elongate(p,g.center,level):p;
  const project=p=>{const q=p.map((v,i)=>v-g.center[i]);return [q[0]+.35*q[1],-q[2]+.3*q[1]];};
  const fit=[...g.points,...g.edges.flat()].map(project),max=Math.max(1,...fit.flat().map(Math.abs))*1.65;
  const screen=p=>{const q=project(transform(p));return [150+q[0]*105/max,115+q[1]*105/max];};
  const shape=(tag,attrs)=>{const n=document.createElementNS(svgNS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);svg.append(n);};
  for(const [a,b]of g.edges){const p=screen(a),q=screen(b);shape('line',{x1:p[0],y1:p[1],x2:q[0],y2:q[1],stroke:'currentColor','stroke-opacity':.4});}
  const pts=g.points.map(screen);const xs=pts.map(p=>p[0]),min=Math.min(...xs),span=Math.max(1,Math.max(...xs)-min);
  pts.forEach((p,i)=>{const heat=apply&&property==='thermal'?Math.max(0,level/3-(p[0]-min)/span*.6):0;shape('circle',{cx:p[0],cy:p[1],r:Math.max(3,7-Math.log10(pts.length)),fill:heat?`hsl(${45-45*heat} 85% 55%)`:'#b69a51',stroke:'currentColor'});if(heat)shape('circle',{cx:p[0],cy:p[1],r:9+heat*4,fill:'none',stroke:'currentColor','stroke-dasharray':'2 3'});});
  if(apply&&property==='electrical'&&level){for(let i=0;i<8;i++){const x=65+(i%4)*50,y=180+Math.floor(i/4)*15;shape('circle',{cx:x,cy:y,r:2,fill:'#168aad'});shape('line',{x1:x,y1:y,x2:x-level*6,y2:y,stroke:'#168aad'});}const t=document.createElementNS(svgNS,'text');t.setAttribute('x','15');t.setAttribute('y','22');t.setAttribute('fill','currentColor');t.textContent='Campo →   deriva dos elétrons ←';svg.append(t);}
  if(apply&&property==='luster'&&level)for(let i=0;i<level;i++){shape('line',{x1:20+i*20,y1:15,x2:100+i*20,y2:80,stroke:'#b69a51','stroke-width':2});shape('line',{x1:100+i*20,y1:80,x2:180+i*20,y2:15,stroke:'#b69a51','stroke-dasharray':'5 3'});}
  return {svg,eligible,apply,centers:pts.map(p=>({x:p[0]/300,y:p[1]/230}))};
 }
 function render(){for(const scope of scopes)scope.destroy();scopes=[];layers=[];cards.replaceChildren();if(!recent.length){cards.append(N('p','Inicie uma investigação para incluir a primeira estrutura.'));return;}
  for(const z of recent){
   const e=S.data.get(z),card=N('article');let g=null;try{g=S.referenceGeometry(e);}catch{}
   if(g){
    const heading=N('header');heading.className='silm-comparison-card-heading';
    heading.append(N('h3',e.name+' ('+e.symbol+')'),N('span',g.canonical?(g.code||g.label):(g.label||g.code),'silm-comparison-structure'));card.append(heading);
    const {svg,eligible,apply,centers}=draw(g,e),stage=N('div');stage.className='silm-comparison-stage';stage.append(svg);card.append(stage);
    const scope=SimCore.createScope();scopes.push(scope);const layer=S.createElectronLayer(stage,{scope,reducedMotion:reduced});layers.push({layer,options:{centers,spacing:.12,connect:true,field:apply&&property==='electrical'&&level>0}});
    if(property!=='none'){const state=N('p',apply?'Qualitativa · '+level+'/3':eligible?.message||'Indisponível nesta estrutura.');state.className='silm-comparison-card-state';card.append(state);}
    const details=document.createElement('details');details.className='silm-comparison-details';details.append(N('summary','Fonte e limites'));
    const detailBody=N('div');let sourceTitle=g.source;try{sourceTitle=S.data.source(g.source)?.title||g.source;}catch(_){}
    detailBody.append(N('p','Fonte: '+(sourceTitle||'Não informada')+'.'));
    if(!g.canonical)detailBody.append(N('p','Célula de referência construída a partir dos sítios e das operações de simetria registrados. Medições e cálculos desta estrutura ainda não estão disponíveis na oficina.'));
    details.append(detailBody);card.append(details);
   }else{
    card.append(N('h3',e.name+' ('+e.symbol+')'),N('p','Geometria de referência indisponível.'));
   }
   cards.append(card);
  }
  syncLayers();
 }
 render();
 return {update(state){const z=state.metal?.atomicNumber;if(z&&z!==last){last=z;const next=[z,...recent.filter(v=>v!==z)].slice(0,6);if(storage.set('comparison.recent',next))recent=next;render();}},render};
};
