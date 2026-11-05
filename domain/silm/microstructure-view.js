'use strict';
window.SILM=window.SILM||{};
/* Escala 2: mapa vetorial didático de grãos, independente da rede cristalina.
   Não representa EBSD, metalografia medida, fases, textura ou tamanho de grão de um elemento específico. */
SILM.microstructure=(()=>{
 const NS='http://www.w3.org/2000/svg',H=620;
 let W=1000,CX=W/2,CY=H/2;
 const svgNode=(name,attrs={})=>{const n=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
 const node=(tag,cls='',txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 // Recorta cada região pela mediatriz dos pares de sementes: tesselação de Voronoi esquemática.
 function bisect(poly,a,b){
  if(!poly.length)return poly;
  const dx=2*(b.x-a.x),dy=2*(b.y-a.y),limit=b.x*b.x+b.y*b.y-a.x*a.x-a.y*a.y;
  const side=p=>dx*p[0]+dy*p[1]-limit;
  const out=[];let before=poly[poly.length-1],db=side(before);
  for(const now of poly){const dn=side(now),inside=dn<=0,oldInside=db<=0;
   if(inside!==oldInside){const t=db/(db-dn);out.push([before[0]+t*(now[0]-before[0]),before[1]+t*(now[1]-before[1])]);}
   if(inside)out.push(now);before=now;db=dn;
  }
  return out;
 }
 // Desenha um campo de grãos na razão real do painel, sem esticar o SVG.
 let polygons=[];
 function makeField(aspect){
  const ratio=clamp(aspect,.5,5),rows=Math.max(5,Math.round(Math.sqrt(60/ratio))),cols=Math.max(6,Math.round(rows*ratio));
  W=H*ratio;CX=W/2;CY=H/2;
  const sites=[];let seed=139712;
  const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++)
   sites.push({x:(col+.5+(rnd()-.5)*.65)*W/cols,y:(row+.5+(rnd()-.5)*.65)*H/rows});
  polygons=sites.map((s,i)=>{let poly=[[0,0],[W,0],[W,H],[0,H]];for(let j=0;j<sites.length;j++){if(j!==i)poly=bisect(poly,s,sites[j]);if(!poly.length)break;}return poly;});
 }
 const grainArea=poly=>Math.abs(poly.reduce((sum,p,i)=>{const q=poly[(i+1)%poly.length];return sum+p[0]*q[1]-q[0]*p[1];},0))/2;
 // Demonstração de composição A–B: números gerados apenas para tons visuais, NÃO são dados da liga real.
 // A representação experimental exigirá micrografia e máscara de segmentação registradas com a fonte.
 const isAlloy=item=>typeof item?.material==='string'&&/(?:liga|aço|latão|superliga)/i.test(item.material);
 const demoA=i=>.17+.66*(((Math.imul(i+7,2654435761)>>>0)%997)/996);
 const intensityName=v=>v>=.68?'alta':v>=.34?'intermediária':'baixa';
 const demoTone=(v,focus)=>'hsl('+(focus==='A'?208:29)+' 70% '+Math.round(88-65*v)+'%)';
 makeField(W/H);
 let serial=0;
 function create({element,item=null,chemistry=null}={}){
  const section=node('section','silm-workshop-micro-viewer'),viewport=node('div','silm-workshop-micro-viewport');
  section.setAttribute('aria-label','Microestrutura ampliada: visualização didática de grãos');
  const svg=svgNode('svg',{viewBox:'0 0 '+W+' '+H,preserveAspectRatio:'xMidYMid meet',role:'group','aria-label':'Policristal didático ampliado: percorra os grãos com Tab e destaque com Enter; não é micrografia experimental'});
  svg.classList.add('silm-workshop-micro-map');svg.setAttribute('data-zoom','1');
  const defs=svgNode('defs'),uid='silm-micro-'+(++serial);
  for(let p=0;p<4;p++){const pattern=svgNode('pattern',{id:uid+'-pattern-'+p,patternUnits:'userSpaceOnUse',width:22,height:22,patternTransform:'rotate('+(p*37+12)+')'});
   pattern.append(svgNode('path',{d:'M 0 0 V 22',stroke:'currentColor','stroke-opacity':'.13','stroke-width':1.35}));defs.append(pattern);}
  svg.append(defs);
  const plane=svgNode('g',{'class':'silm-micro-plane'});svg.append(plane);
  let paths=[],cells=[];
  let chosen=-1,zoom=1,offsetX=0,offsetY=0,drag=null,suppressClick=false;
  const showAlloyDemo=isAlloy(item);
  // Elementos reais conhecidos para a FAMÍLIA da liga, não para os grãos simulados.
  const material=chemistry&&Array.isArray(chemistry.constituents)&&chemistry.constituents.length?chemistry:null;
  let compositionMode=false,focusElement='A',materialFocus=null,syncDemo=null;
  let materialButtons=[];
  const materialPart=symbol=>material?.constituents.find(x=>x.symbol===symbol)||null;
  const status=node('span','silm-workshop-micro-status','Selecione um grão · área do desenho: —');
  const dimension=node('span','silm-workshop-micro-dimension','Tamanho real: indisponível (sem escala em µm)');
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
  const selectionLabel=i=>{
   if(materialFocus){
    const constituent=materialPart(materialFocus);
    return 'Grão '+(i+1)+' · '+constituent.name+' ('+constituent.symbol+') na '+material.label+
     ' · composição deste grão não medida';
   }
   if(compositionMode){
    const a=demoA(i),v=focusElement==='A'?a:1-a;
    const dominant=a>.55?'A':a<.45?'B':'nenhum claramente';
    return 'Grão '+(i+1)+' · predominância simulada: '+dominant+
     ' · incidência '+intensityName(v)+' do elemento '+focusElement+' (modelo didático)';
   }
   const share=grainArea(polygons[i])/(W*H)*100;
   return 'Grão '+(i+1)+' · área no desenho: '+share.toLocaleString('pt-BR',{maximumFractionDigits:1,minimumFractionDigits:1})+'% (ilustrativa)';
  };
  function updateStatus(){status.textContent=chosen>=0?selectionLabel(chosen):
   materialFocus?'Selecione um grão · '+materialPart(materialFocus).name+' · composição local não medida':
   compositionMode?'Selecione um grão · mapa A–B simulado':'Selecione um grão · área do desenho: —';}
  function paintComposition(){
   if(compositionMode)svg.dataset.compositionFocus=focusElement;else delete svg.dataset.compositionFocus;
   paths.forEach((p,i)=>{
    if(!p)return;
    if(compositionMode){
     const a=demoA(i),v=focusElement==='A'?a:1-a;
     p.style.setProperty('--map-fill',demoTone(v,focusElement));
     p.setAttribute('aria-label','Selecionar grão ilustrativo '+(i+1)+', incidência '+intensityName(v)+' do elemento '+focusElement+' (simulação)');
    }else{
     p.style.removeProperty('--map-fill');
     p.setAttribute('aria-label','Destacar grão ilustrativo '+(i+1));
    }
   });
   svg.setAttribute('aria-label',compositionMode?
    'Mapa fictício de liga A–B: mais escuro significa maior incidência RELATIVA do elemento selecionado, sem valores medidos. Selecione os grãos com Tab e Enter.':
    'Policristal didático ampliado: percorra os grãos com Tab e destaque com Enter; não é micrografia experimental');
  }
  const choose=i=>{
   chosen=i;paths.forEach((p,j)=>{p.classList.toggle('is-selected',j===i);p.setAttribute('aria-pressed',String(j===i));cells[j]?.classList.toggle('is-selected',j===i);});
   updateStatus();svg.setAttribute('data-selected-grain',String(i+1));
  };
  function drawGrains(){
   paths=[];cells=[];plane.replaceChildren();
   svg.setAttribute('viewBox','0 0 '+W.toFixed(2)+' '+H);
   polygons.forEach((poly,i)=>{
   if(poly.length<3)return;
   const d='M'+poly.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L')+' Z';
   const g=svgNode('g',{'class':'silm-micro-cell'}),p=svgNode('path',{d,'class':'silm-micro-grain',tabindex:0,role:'button','aria-label':'Destacar grão ilustrativo '+(i+1),'aria-pressed':'false'});
   p.style.setProperty('--grain-tone',(16+(i*17)%30)+'%');p.addEventListener('click',()=>{if(!suppressClick)choose(i);});
   p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(i);}});
   const hatch=svgNode('path',{d,'class':'silm-micro-hatching',fill:'url(#'+uid+'-pattern-'+(i%4)+')','pointer-events':'none'});
   g.append(p,hatch);plane.append(g);paths[i]=p;cells[i]=g;
   });
   if(chosen>=polygons.length)chosen=polygons.length-1;
   paintComposition();
   if(chosen>=0)choose(chosen);else updateStatus();
   offsetX=0;offsetY=0;update();svg.dataset.mapReady='true';
  }
  const toolbar=node('div','silm-workshop-micro-toolbar'),zoomLabel=node('output','silm-workshop-micro-zoom','100%');
  zoomLabel.setAttribute('aria-label','Ampliação da microestrutura');
  function update(){
   offsetX=clamp(offsetX,-(zoom-1)*CX,(zoom-1)*CX);
   offsetY=clamp(offsetY,-(zoom-1)*CY,(zoom-1)*CY);
   plane.setAttribute('transform','translate('+(offsetX+CX)+' '+(offsetY+CY)+') scale('+zoom+') translate('+(-CX)+' '+(-CY)+')');
   svg.setAttribute('data-zoom',String(zoom));zoomLabel.value=Math.round(zoom*100)+'%';
   viewport.classList.toggle('is-zoomed',zoom>1);
  }
  const setZoom=z=>{zoom=clamp(Math.round(z*4)/4,1,4);if(zoom===1){offsetX=0;offsetY=0;}update();};
  const button=(name,txt,action)=>{const b=node('button','silm-workshop-micro-control',txt);b.type='button';b.setAttribute('aria-label',name);b.addEventListener('click',action);return b;};
  const zoomControls=node('div','silm-workshop-micro-zoom-tools');
  zoomControls.append(button('Reduzir microestrutura','−',()=>setZoom(zoom-.25)),zoomLabel,button('Ampliar microestrutura','+',()=>setZoom(zoom+.25)),button('Ajustar microestrutura ao quadro','Ajustar',()=>setZoom(1)));
  toolbar.append(status,dimension,zoomControls);
  let chemistryHint=null;
  if(showAlloyDemo){
   const compositionTools=node('div','silm-workshop-micro-composition-tools');
   const modeButton=button('Alternar mapa ilustrativo de liga A–B','Mapa A–B',()=>{compositionMode=!compositionMode;materialFocus=null;syncComposition();updateMaterialSelection();});
   const buttonA=button('Exibir concentração simulada do elemento A','A',()=>{focusElement='A';syncComposition();});
   const buttonB=button('Exibir concentração simulada do elemento B','B',()=>{focusElement='B';syncComposition();});
   chemistryHint=node('span','silm-workshop-micro-composition-key','Mapa simulado · claro: menos, escuro: mais');
   const syncComposition=()=>{
    modeButton.setAttribute('aria-pressed',String(compositionMode));
    buttonA.setAttribute('aria-pressed',String(compositionMode&&focusElement==='A'));
    buttonB.setAttribute('aria-pressed',String(compositionMode&&focusElement==='B'));
    buttonA.disabled=buttonB.disabled=!compositionMode;
    paintComposition();updateStatus();
    chemistryHint.hidden=!compositionMode;
    if(note)note.textContent=compositionMode?
     'SIMULAÇÃO de liga genérica A–B, não representa a composição do objeto real. Tons indicam incidência relativa, sem percentuais ou escala experimental.':
     materialFocus?material.label+' · '+material.note+' Nenhuma cor espacial ou teor por grão foi medido.':
     'Grãos ilustrativos · área relativa ao desenho, não é medida experimental de tamanho em micrômetros.';
   };
   syncDemo=syncComposition;
   compositionTools.append(modeButton,buttonA,buttonB,chemistryHint);
   toolbar.append(compositionTools);
   // O texto da nota será inicializado após os controles.
   modeButton.setAttribute('aria-pressed','false');buttonA.disabled=true;buttonB.disabled=true;chemistryHint.hidden=true;
  }
  // Investigação da composição nominal de uma família tecnológica, nunca da química local do polígono.
  function updateMaterialSelection(){
   for(const b of materialButtons)b.setAttribute('aria-pressed',String(materialFocus===b.dataset.elementSymbol));
  }
  if(material){
   const materialTools=node('div','silm-workshop-micro-material-tools');
   materialTools.setAttribute('role','group');
   materialTools.setAttribute('aria-label','Elementos da família do material');
   materialTools.append(node('span','silm-workshop-micro-material-label','Constituintes:'));
   for(const part of material.constituents){
    const qualifier=part.certainty==='possible'?' (possível)':'';
    const b=button('Consultar '+part.name+' na família de liga',part.symbol+qualifier,()=>{
     materialFocus=materialFocus===part.symbol?null:part.symbol;
     compositionMode=false;
     if(syncDemo)syncDemo();else{paintComposition();updateStatus();}
     updateMaterialSelection();
     if(note)note.textContent=materialFocus?
      material.label+' · '+part.name+': '+part.role+'. '+material.note+
      ' Sem mapa químico medido, não se pode atribuir teor ou identidade elementar ao grão.':
      'Grãos ilustrativos · área relativa ao desenho, não é medida experimental de tamanho em micrômetros.';
    });
    b.dataset.elementSymbol=part.symbol;b.setAttribute('aria-pressed','false');
    materialButtons.push(b);materialTools.append(b);
   }
   toolbar.append(materialTools);
  }
  svg.addEventListener('wheel',e=>{e.preventDefault();setZoom(zoom+(e.deltaY<0?.25:-.25));},{passive:false});
  svg.addEventListener('pointerdown',e=>{if(zoom<=1||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};suppressClick=false;svg.setPointerCapture(e.pointerId);});
  svg.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;
   const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
   if(Math.abs(dx)+Math.abs(dy)>2)drag.moved=true;
   const r=svg.getBoundingClientRect(),factor=Math.min(r.width/W,r.height/H)||1;
   offsetX+=dx/factor;offsetY+=dy/factor;drag.x=e.clientX;drag.y=e.clientY;update();
  });
  const stop=e=>{if(!drag||e.pointerId!==drag.id)return;suppressClick=drag.moved;drag=null;
   if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);
   if(suppressClick)queueMicrotask(()=>{suppressClick=false;});
  };
  svg.addEventListener('pointerup',stop);svg.addEventListener('pointercancel',stop);
  viewport.append(svg);
  const note=node('p','silm-workshop-micro-caveat','Grãos ilustrativos · área relativa ao desenho, não é medida experimental de tamanho em micrômetros.');
  section.append(viewport,toolbar,note);
  let lastAspect=0;
  const resize=()=>{const rect=viewport.getBoundingClientRect();if(rect.width<2||rect.height<2)return;const ratio=rect.width/rect.height;if(Math.abs(ratio-lastAspect)<.025)return;lastAspect=ratio;makeField(ratio);drawGrains();};
  if(typeof ResizeObserver==='function'){const observer=new ResizeObserver(resize);observer.observe(viewport);}else requestAnimationFrame(resize);
  drawGrains();update();return section;
 }
 return Object.freeze({create});
})();