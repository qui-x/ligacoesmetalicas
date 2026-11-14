'use strict';
window.SILM=window.SILM||{};
/* Escala 2: mapa vetorial didático de grãos, independente da rede cristalina.
   Não representa EBSD, metalografia medida, fases, textura ou tamanho de grão de um elemento específico. */
SILM.microstructure=(()=>{
 const NS='http://www.w3.org/2000/svg';
 const svgNode=(name,attrs={})=>{const n=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
 const node=(tag,cls='',txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 let serial=0;
 function create({element,item=null,model=null}={}){
  const section=node('section','silm-workshop-micro-viewer'),viewport=node('div','silm-workshop-micro-viewport');
  const synthetic=SILM.microstructureSynthetic;
  const appearance=SILM.microstructureAppearance?.get(element?.atomicNumber)||null;
  section.dataset.appearanceBasis=appearance?.basis||'symbolic-neutral';
  section.dataset.appearancePalette=appearance?.paletteKey||'neutral-stone';
  const palette=appearance||{light:'#e0e1e3',mid:'#b3bbc2',dark:'#7b8894',edge:'#50606f',
   label:'Paleta neutra didática',basis:'symbolic-neutral',warning:'Cor sem correspondência física exclusiva.'};
  section.style.setProperty('--silm-grain-edge',palette.edge);
  if(!synthetic)throw new Error('Gerador esquemático de microestruturas não carregado.');
  const prefKey='silm:microstructure:schematic:v1:'+String(element?.atomicNumber||'free');
  let seed=synthetic.DEFAULT_SEED,profile='equiaxial';
  try{
   const pref=JSON.parse(localStorage.getItem(prefKey)||'null');
   if(pref&&synthetic.validSeed(pref.seed)&&synthetic.validProfile(pref.profile)){
    seed=pref.seed;profile=pref.profile;
   }
  }catch{/* armazenamento indisponível: usar o desenho padrão */}
  let generated=synthetic.generate({seed,profile}),W=generated.width,H=generated.height;
  let CX=W/2,CY=H/2,polygons=generated.polygons;
  section.dataset.syntheticSeed=String(seed);
  section.dataset.syntheticProfile=profile;
  section.dataset.syntheticGenerator=generated.generator;
  const persist=()=>{try{localStorage.setItem(prefKey,JSON.stringify({seed,profile}));}catch{/* sem persistência disponível */}};
  section.setAttribute('aria-label','Microestrutura ampliada: visualização didática de grãos sem medições experimentais');
  // Guardar proveniência explícita: a tesselação não autoriza porcentagens científicas.
  section.dataset.microstructureSource='schematic';section.dataset.measurementStatus='unavailable';
  section.dataset.didacticEvidenceLevel='D0-schematic-conceptual';
  const svg=svgNode('svg',{viewBox:'0 0 '+W+' '+H,preserveAspectRatio:'xMidYMid meet',role:'group','aria-label':'Policristal didático ampliado: percorra os grãos com Tab e destaque com Enter; não é micrografia experimental'});
  svg.classList.add('silm-workshop-micro-map');svg.setAttribute('data-zoom','1');
  const defs=svgNode('defs'),uid='silm-micro-'+(++serial);
  for(let p=0;p<4;p++){const pattern=svgNode('pattern',{id:uid+'-pattern-'+p,patternUnits:'userSpaceOnUse',width:22,height:22,patternTransform:'rotate('+(p*37+12)+')'});
   pattern.append(svgNode('path',{d:'M 0 0 V 22',stroke:'currentColor','stroke-opacity':'.13','stroke-width':1.35}));defs.append(pattern);}
  // Relevo suave por luz e sombra, sem sugerir medidas/fases. Gradientes são
  // iguais para todo o desenho e variam somente para distinguir polígonos.
  for(let k=0;k<4;k++){
   const g=svgNode('linearGradient',{id:uid+'-material-'+k,x1:(k%2?20:0)+'%',y1:'0%',x2:(k%2?100:80)+'%',y2:'100%'});
   const stops=[
    ['0%',palette.light],['48%',palette.mid],['100%',palette.dark]
   ];
   for(const [offset,color] of stops)g.append(svgNode('stop',{offset,'stop-color':color}));
   defs.append(g);
  }
  svg.append(defs);
  const plane=svgNode('g',{'class':'silm-micro-plane'});svg.append(plane);
  // A transformação didática é uma camada REVERSÍVEL sobre os mesmos caminhos.
  const mechanicalField=svgNode('g',{'class':'silm-micro-mechanical-field'});plane.append(mechanicalField);
  let paths=[],cells=[];let surfaceMicro=null;
  let chosen=-1,zoom=1,offsetX=0,offsetY=0,drag=null,suppressClick=false;
  let sourceData=null; // Mapa importado = análise de polígonos fornecidos, não homologação.
  const status=node('span','silm-workshop-micro-status','Selecione um grão · modelo esquemático');
  const dimension=node('span','silm-workshop-micro-dimension','Tamanho real: indisponível (sem escala em µm)');
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
  // A câmera dos grãos é bidimensional: segue um polígono sem inventar
  // profundidade, orientação cristalográfica ou nova amostra. O mesmo
  // estado visual é usado pela seleção, pelo teclado e pelos botões.
  function focusGrain(i){
   const poly=polygons[i];if(!poly?.length)return false;
   const cx=poly.reduce((sum,p)=>sum+p[0],0)/poly.length;
   const cy=poly.reduce((sum,p)=>sum+p[1],0)/poly.length;
   zoom=Math.max(2,zoom);
   svg.dataset.focusTransition='on';
   offsetX=zoom*(CX-cx);offsetY=zoom*(CY-cy);
   window.setTimeout(()=>{delete svg.dataset.focusTransition;},380);
   update();
   svg.dataset.focusedGrain=String(i+1);
   return true;
  }
  const choose=i=>{
   chosen=i;
   if(typeof focusButton!=='undefined')focusButton.disabled=i<0;
   paths.forEach((p,j)=>{p.classList.toggle('is-selected',j===i);p.setAttribute('aria-pressed',String(j===i));cells[j]?.classList.toggle('is-selected',j===i);});
   if(sourceData){
    const grain=sourceData.grains[i],area=grain?.areaMicrometers2;
    const fmt=v=>v.toLocaleString('pt-BR',{maximumFractionDigits:3});
    status.textContent='Grão '+grain.id+(area===null?' · sem calibração':' · área segmentada '+fmt(area)+' µm²')+' · dados importados não homologados';
   }else status.textContent='Grão '+(i+1)+' selecionado · modelo esquemático';
   svg.setAttribute('data-selected-grain',String(i+1));
  };
  function drawGrains(){
   paths=[];cells=[];mechanicalField.replaceChildren();plane.replaceChildren(mechanicalField);
   polygons.forEach((poly,i)=>{
   if(poly.length<3)return;
   const d='M'+poly.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L')+' Z';
   const g=svgNode('g',{'class':'silm-micro-cell'}),p=svgNode('path',{d,'class':'silm-micro-grain',tabindex:0,role:'button','aria-label':sourceData?'Selecionar grão segmentado '+sourceData.grains[i].id+' (dados importados não homologados)':'Destacar grão ilustrativo '+(i+1),'aria-pressed':'false'});
   p.style.setProperty('--silm-grain-fill',sourceData?'var(--panel2,var(--surface))':'url(#'+uid+'-material-'+(i%4)+')');
   p.addEventListener('click',()=>{if(!suppressClick)choose(i);});
   p.addEventListener('dblclick',e=>{e.preventDefault();choose(i);focusGrain(i);});
   p.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(i);return;}
    if(e.key==='f'||e.key==='F'){e.preventDefault();choose(i);focusGrain(i);return;}
    const step=55*(e.shiftKey?2:1);
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='ArrowDown'){
     e.preventDefault();
     offsetX+=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0;
     offsetY+=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0;
     update();
    }
   });
   const hatch=svgNode('path',{d,'class':'silm-micro-hatching',fill:'url(#'+uid+'-pattern-'+(i%4)+')','pointer-events':'none'});
   const bevel=svgNode('path',{d,'class':'silm-micro-highlight','pointer-events':'none'});
   g.append(p,bevel,hatch);mechanicalField.append(g);paths[i]=p;cells[i]=g;
   });
   surfaceMicro?.rebuild();
   if(chosen>=polygons.length)chosen=polygons.length-1;
   if(chosen>=0)choose(chosen);else status.textContent=sourceData?'Selecione um grão segmentado · dados importados não homologados':'Selecione um grão · modelo esquemático';
   offsetX=0;offsetY=0;update();fitViewport();
   if(typeof refreshMechanical==='function')refreshMechanical();
  }
  const toolbar=node('div','silm-workshop-micro-toolbar'),zoomLabel=node('output','silm-workshop-micro-zoom','100%');
  zoomLabel.setAttribute('aria-label','Ampliação da microestrutura');
  function update(){
   const view=svg.viewBox.baseVal;
   const maxX=Math.max(0,(zoom*W-view.width)/2);
   const maxY=Math.max(0,(zoom*H-view.height)/2);
   offsetX=clamp(offsetX,-maxX,maxX);
   offsetY=clamp(offsetY,-maxY,maxY);
   plane.setAttribute('transform','translate('+(offsetX+CX)+' '+(offsetY+CY)+') scale('+zoom+') translate('+(-CX)+' '+(-CY)+')');
   svg.setAttribute('data-zoom',String(zoom));zoomLabel.value=Math.round(zoom*100)+'%';
   viewport.classList.toggle('is-zoomed',zoom>1);
   viewport.classList.toggle('is-pannable',maxX>1||maxY>1);
  }
  const setZoom=z=>{zoom=clamp(Math.round(z*4)/4,1,4);if(zoom===1){offsetX=0;offsetY=0;}update();};
  // Uma linguagem visual única para todos os comandos da microestrutura,
  // inclusive dentro dos diálogos. Ícones são pictogramas de ação, e os
  // rótulos acessíveis permanecem completos mesmo no celular.
  const microIcons={
   'Reduzir microestrutura':'M5 12h14',
   'Ampliar microestrutura':'M5 12h14M12 5v14',
   'Aproximar grão selecionado':'M7 3H3v4M17 3h4v4M3 17v4h4M21 17v4h-4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
   'Ajustar microestrutura ao quadro':'M4 9V4h5M15 4h5v5M4 15v5h5M20 15v5h-5',
   'Abrir gerador de formações de grãos':'M3 7h7v7H3zM14 4h7v7h-7zM12 15h8v6h-8z',
   'Abrir dados segmentados':'M4 6c0-3 16-3 16 0v12c0 3-16 3-16 0zM4 12c0 3 16 3 16 0M4 6c0 3 16 3 16 0',
   'Gerar formação com a semente informada':'M5 12h14M13 5l7 7-7 7',
   'Gerar nova variação reproduzível':'M4 4v5h5M20 20v-5h-5M5 9a8 8 0 0 1 14-3M19 15a8 8 0 0 1-14 3',
   'Restaurar formação padrão':'M3 11a9 9 0 1 1 3 7M3 4v7h7',
   'Retornar ao mapa didático':'M3 11a9 9 0 1 1 3 7M3 4v7h7',
   'Fechar configurações de formação':'M5 5l14 14M19 5 5 19',
   'Fechar importação de dados':'M5 5l14 14M19 5 5 19'
  };
  const button=(name,txt,action)=>{
   const b=node('button','silm-workshop-micro-control');
   b.type='button';b.setAttribute('aria-label',name);b.dataset.microAction=name;
   const icon=svgNode('svg',{viewBox:'0 0 24 24',width:18,height:18,
    'aria-hidden':'true',fill:'none',stroke:'currentColor','stroke-width':1.8,
    'stroke-linecap':'round','stroke-linejoin':'round'});
   icon.append(svgNode('path',{d:microIcons[name]||'M5 12h14'}));
   const label=node('span','silm-micro-button-label',txt);
   b.append(icon,label);
   b.addEventListener('click',action);
   return b;
  };
  const zoomControls=node('div','silm-workshop-micro-zoom-tools');
  const focusButton=button('Aproximar grão selecionado','Focar',()=>{
   if(chosen>=0)focusGrain(chosen);
  });
  focusButton.disabled=true;
  zoomControls.append(button('Reduzir microestrutura','−',()=>setZoom(zoom-.25)),zoomLabel,button('Ampliar microestrutura','+',()=>setZoom(zoom+.25)),focusButton,button('Ajustar microestrutura ao quadro','Ajustar',()=>setZoom(1)));
  // Informação operacional (grão selecionado + zoom) continua sempre visível.
  // Escala física e limitações científicas ficam num <details> nativo.
  // O aviso "sem escala" é informação essencial e permanece visível mesmo
  // com a seção explicativa recolhida. Isso preserva o contrato didático.

  toolbar.append(status,dimension,zoomControls);
  // PR mecânico: o MESMO controlador de deformação da rede fornece carga e
  // os passos discretos. A microestrutura só representa o resultado visual.
  const deformCtl=model?SILM.deformation?.controller(model):null;
  const mechanicalTools=node('div','silm-micro-mechanical-tools');
  mechanicalTools.hidden=true;mechanicalTools.setAttribute('role','group');
  mechanicalTools.setAttribute('aria-label','Deformação na microestrutura');
  const mechanicalPulse=node('button','silm-workshop-micro-control silm-micro-mechanical-pulse','Comprimir');
  mechanicalPulse.type='button';
  const mechanicalReset=node('button','silm-workshop-micro-control silm-micro-mechanical-reset','Restaurar');
  mechanicalReset.type='button';
  mechanicalReset.setAttribute('aria-label','Restaurar deformação');
  const mechanicalStatus=node('output','silm-micro-mechanical-reading','');
  mechanicalStatus.setAttribute('role','status');mechanicalStatus.setAttribute('aria-live','polite');
  mechanicalTools.append(mechanicalPulse,mechanicalReset,mechanicalStatus);
  toolbar.append(mechanicalTools);

  // Alças operáveis no próprio mapa (não em diálogo ou mini-palco).
  // As posições seguem a borda da área exibida; o campo de grãos fica no
  // mesmo SVG e preserva os polígonos originais, zoom e grão selecionado.
  const topGrip=node('button','silm-micro-mechanical-grip silm-micro-mechanical-top','↓');
  const bottomGrip=node('button','silm-micro-mechanical-grip silm-micro-mechanical-bottom','↑');
  for(const grip of [topGrip,bottomGrip]){
   grip.type='button';grip.hidden=true;grip.title='Arraste para aplicar força; Enter ou Espaço aplica um passo';
   grip.style.touchAction='none';
  }
  let mechanicsMode=null;
  const getMode=()=>{
   const st=model?.state,mode=st?.properties?.active;
   return st?.module?.active==='explorar'&&['malleability','ductility'].includes(mode)?mode:null;
  };
  function refreshMechanical(){
   const mode=getMode(),st=model?.state,active=!!mode;
   mechanicsMode=mode;
   mechanicalTools.hidden=!active;
   topGrip.hidden=bottomGrip.hidden=!active;
   section.dataset.mechanicalStudy=mode||'inactive';
   if(!active){
    mechanicalField.removeAttribute('transform');
    delete section.dataset.mechanicalStep;
    delete section.dataset.mechanicalLoad;
    return;
   }
   const step=mode==='malleability'?st.properties.malleability.compression:st.properties.ductility.elongation;
   const max=SILM.properties.limits[mode==='malleability'?'compression':'elongation'];
   const state=deformCtl?.reading?.()||{load:0,regime:'rest'};
   const load=clamp(Number(state.load)||0,0,1),p=step/max;
   // Envelope geométrico abstrato, sem módulo elástico, tensão ou
   // porcentagem de deformação atribuídos à amostra/material.
   const x=mode==='malleability'?1+.16*p+.04*load:1-.12*p-.025*load;
   const y=mode==='malleability'?1-.16*p-.04*load:1+.22*p+.05*load;
   if(step||load){
    mechanicalField.setAttribute('transform','translate('+CX+' '+CY+') scale('+x+' '+y+') translate('+(-CX)+' '+(-CY)+')');
   }else mechanicalField.removeAttribute('transform');
   section.dataset.mechanicalStep=String(step);
   section.dataset.mechanicalLoad=String(Math.round(load*100));
   section.dataset.mechanicalRegime=state.regime||'rest';
   topGrip.textContent=mode==='malleability'?'↓':'↑';
   bottomGrip.textContent=mode==='malleability'?'↑':'↓';
   for(const grip of [topGrip,bottomGrip])grip.setAttribute('aria-label',mode==='malleability'?
    'Comprimir o campo de grãos':'Tracionar o campo de grãos');
   const pulseLabel=mode==='malleability'?'Comprimir':'Tracionar';
   // Evitar reconstruir o ícone em toda atualização do controlador.
   if(mechanicalPulse.textContent.trim()!==pulseLabel)mechanicalPulse.textContent=pulseLabel;
   mechanicalPulse.setAttribute('aria-label',mode==='malleability'?'Aplicar compressão':'Aplicar tração');
   mechanicalPulse.disabled=step>=max;
   mechanicalReset.disabled=!step&&!load;
   mechanicalStatus.textContent=(mode==='malleability'?'Compressão':'Tração')+
    ' · passo ilustrativo '+step+'/'+max+(load?' · força relativa '+Math.round(load*100)+' %':'')+
    ' · não representa deformação medida por grão';
  }
  const mechanicalPulseStep=()=>{
   const mode=getMode(),st=model?.state;
   if(!mode||!deformCtl||!st?.structure)return false;
   const done=deformCtl.pulse();
   refreshMechanical();return done;
  };
  mechanicalPulse.addEventListener('click',mechanicalPulseStep);
  mechanicalReset.addEventListener('click',()=>{
   if(!getMode())return;
   deformCtl?.setLoad(0);
   model?.restoreProperty();refreshMechanical();
  });
  for(const [grip,upper] of [[topGrip,true],[bottomGrip,false]]){
   let dragged=null;
   const direction=()=>{
    const pressing=getMode()==='malleability';
    return upper?(pressing?1:-1):(pressing?-1:1);
   };
   grip.addEventListener('pointerdown',event=>{
    if(event.button!==0||!getMode()||!deformCtl)return;
    event.preventDefault();event.stopPropagation();
    dragged={id:event.pointerId,y:event.clientY,moved:false};
    try{grip.setPointerCapture(event.pointerId);}catch{}
   });
   grip.addEventListener('pointermove',event=>{
    if(!dragged||event.pointerId!==dragged.id)return;
    event.preventDefault();event.stopPropagation();
    const diff=(event.clientY-dragged.y)*direction();
    if(Math.abs(event.clientY-dragged.y)>3)dragged.moved=true;
    if(dragged.moved){
     deformCtl.setLoad(clamp(diff/Math.max(44,viewport.clientHeight*.25),0,1));
     refreshMechanical();
    }
   });
   const release=event=>{
    if(!dragged||event.pointerId!==dragged.id)return;
    event.preventDefault();event.stopPropagation();
    const tap=!dragged.moved;dragged=null;
    deformCtl?.setLoad(0);
    if(tap&&event.type==='pointerup')mechanicalPulseStep();
    refreshMechanical();
   };
   for(const ev of ['pointerup','pointercancel','lostpointercapture'])grip.addEventListener(ev,release);
   grip.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();});
   grip.addEventListener('keydown',event=>{
    if(!getMode())return;
    if(['Enter',' ','ArrowUp','ArrowDown'].includes(event.key)){
     event.preventDefault();event.stopPropagation();mechanicalPulseStep();
    }else if(event.key==='Escape'){event.preventDefault();deformCtl?.setLoad(0);refreshMechanical();}
   });
  }
  // A seleção de Ver pode mudar sem refazer o mapa e a animação pode
  // atualizar a carga entre os ciclos globais de renderização.
  section.silmMicroMechanicalRefresh=refreshMechanical;
  if(deformCtl){
   let everAttached=false;
   const off=deformCtl.subscribe(()=>{
    if(section.isConnected){everAttached=true;refreshMechanical();}
    else if(everAttached)off();
   });
  }
  refreshMechanical();
  surfaceMicro=SILM.surfaceMicro?.attach({section,svg,mechanicalField,toolbar,model,element,getSize:()=>({width:W,height:H})})||null;
  section.silmMicroSurfaceRefresh=()=>surfaceMicro?.refresh();
  svg.addEventListener('wheel',e=>{e.preventDefault();setZoom(zoom+(e.deltaY<0?.25:-.25));},{passive:false});
  svg.addEventListener('pointerdown',e=>{
   if(e.button!==0||!viewport.classList.contains('is-pannable'))return;
   // Capturar somente APÓS iniciar o arraste: capturar no pointerdown
   // redirecionaria o click para o SVG e impediria selecionar o grão.
   drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};
   suppressClick=false;
  });
  svg.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;
   const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
   if(Math.abs(dx)+Math.abs(dy)>2&&!drag.moved){
    drag.moved=true;
    if(!svg.hasPointerCapture(e.pointerId))svg.setPointerCapture(e.pointerId);
   }
   const r=svg.getBoundingClientRect(),v=svg.viewBox.baseVal;
   const factor=Math.min(r.width/v.width,r.height/v.height)||1;
   offsetX+=dx/factor;offsetY+=dy/factor;drag.x=e.clientX;drag.y=e.clientY;update();
  });
  const stop=e=>{if(!drag||e.pointerId!==drag.id)return;suppressClick=drag.moved;drag=null;
   if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);
   if(suppressClick)queueMicrotask(()=>{suppressClick=false;});
  };
  svg.addEventListener('pointerup',stop);svg.addEventListener('pointercancel',stop);
  viewport.append(svg,topGrip,bottomGrip);
  const note=node('p','silm-workshop-micro-caveat',
   'Grãos e tons ilustrativos; sem composição, fração de fase ou tamanho medidos.');
  // Mudanças de formação são explícitas. Redimensionar, ampliar ou mudar
  // o tema nunca regeneram os grãos, alteram a semente ou as propriedades.
  function applySchematic(options){
   generated=synthetic.generate(options);
   seed=generated.seed;profile=generated.profile;
   W=generated.width;H=generated.height;CX=W/2;CY=H/2;
   polygons=generated.polygons;sourceData=null;
   section.dataset.syntheticSeed=String(seed);
   section.dataset.syntheticProfile=profile;
   section.dataset.microstructureSource='schematic';
   section.dataset.measurementStatus='unavailable';
   section.dataset.didacticEvidenceLevel='D0-schematic-conceptual';
   evidence.dataset.evidenceLevel='D0-schematic-conceptual';
   evidenceStatus.textContent='D0 · Modelo de grãos conceitual. A geometria é ilustrativa: não reproduz uma amostra medida nem a forma real dos grãos deste objeto.';
   dimension.textContent='Tamanho real: indisponível (sem escala em µm)';
   note.textContent='Grãos e tons ilustrativos; sem composição, fração de fase ou tamanho medidos. A cor é uma referência visual, não uma leitura química. Cada estudo descreve uma amostra e condição.';
   chosen=-1;zoom=1;offsetX=0;offsetY=0;
   drawGrains();persist();
   if(formationsButton)formationsButton.disabled=false;
  }
  const genDialog=node('dialog','silm-micro-generator-dialog');
  const genTitle=node('h2','','Formações esquemáticas');
  const genHelp=node('p','silm-micro-import-help','Variações geométricas didáticas, não micrografias de um metal. A mesma semente e perfil reproduzem a mesma formação em qualquer tela.');
  const profileLabel=node('label','','Forma dos grãos'),profileSelect=node('select');
  profileSelect.setAttribute('aria-label','Forma dos grãos');
  for(const [id,info] of Object.entries(synthetic.PROFILES)){
   const option=node('option','',info.label);option.value=id;profileSelect.append(option);
  }
  profileLabel.append(profileSelect);
  const seedLabel=node('label','','Semente reproduzível'),seedInput=node('input');
  seedInput.type='number';seedInput.min='0';seedInput.max='4294967295';seedInput.step='1';
  seedInput.inputMode='numeric';seedInput.setAttribute('aria-label','Semente reproduzível');
  seedLabel.append(seedInput);
  const genReport=node('p','silm-micro-import-report');
  genReport.setAttribute('role','status');
  const reflect=()=>{
   profileSelect.value=profile;seedInput.value=String(seed);
   genReport.textContent='Formação atual: '+synthetic.PROFILES[profile].label+' · semente '+seed+'. Não representa amostra medida.';
  };
  const genActions=node('div','silm-micro-data-actions');
  const parseSeed=()=>{
   const value=seedInput.value.trim();
   if(!/^(0|[1-9][0-9]{0,9})$/.test(value)||!synthetic.validSeed(Number(value)))
    throw new Error('Informe um inteiro de 0 a 4294967295.');
   if(!synthetic.validProfile(profileSelect.value))throw new Error('Perfil geométrico inválido.');
   return Number(value);
  };
  const generateForm=(next=false)=>{
   try{
    if(sourceData)throw new Error('Restaure primeiro o mapa esquemático em Dados.');
    const requested=parseSeed();
    applySchematic({seed:next?synthetic.nextSeed(requested):requested,profile:profileSelect.value});
    reflect();
   }catch(error){genReport.textContent='Formação não gerada: '+(error?.message||String(error));}
  };
  genActions.append(
   button('Gerar formação com a semente informada','Gerar',()=>generateForm()),
   button('Gerar nova variação reproduzível','Nova variação',()=>generateForm(true)),
   button('Restaurar formação padrão','Padrão',()=>{
    applySchematic({seed:synthetic.DEFAULT_SEED,profile:'equiaxial'});reflect();
   }),
   button('Fechar configurações de formação','Fechar',()=>genDialog.close())
  );
  genDialog.append(genTitle,genHelp,profileLabel,seedLabel,genReport,genActions);
  reflect();
  const formationsButton=button('Abrir gerador de formações de grãos','Formações',()=>{
   reflect();genDialog.showModal();
  });
  formationsButton.title='Gerar variantes didáticas mantendo semente e perfil reproduzíveis';
  // A importação é opcional e não altera o estado científico do SILM.
  // O diálogo evita comprimir o quadro principal com metadados extensos.
  const dataDialog=node('dialog','silm-micro-data-dialog'),dataTitle=node('h2','','Mapa segmentado');
  const dataHelp=node('p','','Carregue um JSON com contornos de grãos e origem documentada. A procedência declarada não é verificada automaticamente pelo SILM.');
  dataHelp.className='silm-micro-import-help';
  // Fundamentação por elemento: a evidência cristalográfica NÃO transforma
  // tesselações didáticas em micrografias do produto ou do metal puro.
  const refElement=SILM.data?.get?.(element?.atomicNumber)||element;
  const crystal=refElement&&SILM.data?.structure?.(refElement);
  const crystalSource=crystal?.sourceId?SILM.data?.source?.(crystal.sourceId):null;
  const appReference=SILM.metalAtlas?.get?.(element?.atomicNumber);
  const evidence=node('section','silm-micro-didactic-evidence');
  evidence.setAttribute('aria-label','Fundamentação científica e limites da representação');
  evidence.dataset.evidenceLevel='D0-schematic-conceptual';
  const evidenceStatus=node('p','','D0 · Modelo de grãos conceitual. A geometria é ilustrativa: não reproduz uma amostra medida nem a forma real dos grãos deste objeto.');
  evidence.append(
   evidenceStatus,
   node('p','','Rede de referência: '+(crystal?.type||'não registrada')+
    (crystal?.spaceGroupNumber?' · grupo espacial '+crystal.spaceGroupNumber:'')+
    '. A fase e as condições de uma liga ou produto podem ser diferentes.')
  );
  const sourceURL=crystalSource?.url;
  if(typeof sourceURL==='string'&&/^https:\/\//.test(sourceURL)){
   const link=node('a','','Consultar fonte cristalográfica');
   link.href=sourceURL;link.target='_blank';link.rel='noopener noreferrer';
   evidence.append(link);
  }
  if(appReference){
   evidence.append(node('p','','Contexto de aplicação no atlas: '+appReference.materialCategory+
    '. '+appReference.caveat));
   if(typeof appReference.referenceURL==='string'&&/^https:\/\//.test(appReference.referenceURL)){
    const link=node('a','','Consultar referência da aplicação ilustrada');
    link.href=appReference.referenceURL;link.target='_blank';link.rel='noopener noreferrer';
    evidence.append(link);
   }
  }
  // Estudos catalogados são contexto investigativo, nunca geometrias EBSD
  // nem parâmetros de forma/tamanho dos polígonos. Exibir sob demanda.
  const studies=SILM.microstructureStudies?.forElement?.(element?.atomicNumber)||[];
  evidence.dataset.cataloguedStudies=String(studies.length);
  if(studies.length){
   const collection=node('details','silm-micro-study-context');
   collection.setAttribute('aria-label','Estudos e técnicas catalogados para investigação');
   const summary=node('summary','','Estudos relacionados ('+studies.length+') · contexto científico');
   const description=node('p','silm-micro-study-intro',
    'Estudos sobre materiais que contêm o elemento; podem envolver ligas, compostos ou outras amostras. Nenhum deles define os grãos deste desenho.');
   const items=node('div','silm-micro-study-items');
   studies.forEach(study=>{
    const entry=node('article','silm-micro-study-entry');
    entry.dataset.studyId=study.id;
    const title=node('strong','',study.name);
    const sample=node('p','','Amostra: '+SILM.microstructureStudies.describe(study)+
     (study.technique?' · Técnica: '+study.technique:''));
    const note=node('p','',study.caveat);
    const topics=SILM.microstructureStudies.topicLabels(study);
    const topicLine=topics.length?node('p','silm-micro-study-topics',
     'Aspectos investigados na fonte: '+topics.join(', ')+'.'):null;
    const limit=node('p','silm-micro-study-limit',SILM.microstructureStudies.caveat(study));
    if(study.review?.includes('not-independently-verified')){
     limit.textContent+=' Documento original ainda não conferido de forma independente.';
    }
    const link=node('a','','Consultar estudo original');
    if(/^https:\/\//.test(study.url)){
     link.href=study.url;link.target='_blank';link.rel='noopener noreferrer';
    }else link.hidden=true;
    entry.append(title,sample);
    if(topicLine)entry.append(topicLine);
    entry.append(note,limit,link);
    items.append(entry);
   });
   collection.append(summary,description,items);
   evidence.append(collection);
  }
  evidence.append(node('p','','Dados experimentais de grãos, composição e tamanho físico: não homologados neste modelo. Estudos candidatos não são parâmetros do gerador.'));
  const appearanceNote=node('p','silm-micro-appearance-note',
   'Cores e relevo: '+palette.label+'. '+palette.warning+' As diferenças de tom entre grãos não indicam composição, orientação ou porcentagens.');
  evidence.append(appearanceNote);
  if(appearance?.source){
   const link=node('a','','Referência para a leitura de cor');
   link.href=appearance.source;link.target='_blank';link.rel='noopener noreferrer';
   evidence.append(link);
  }
  const fileLabel=node('label','','Arquivo JSON de microestrutura');
  const fileInput=node('input');fileInput.type='file';fileInput.accept='.json,application/json';fileInput.setAttribute('aria-label','Arquivo JSON de microestrutura');
  fileLabel.append(fileInput);
  const report=node('p','silm-micro-import-report','Nenhum mapa importado.');report.setAttribute('role','status');
  const sourceLink=node('a','','Consultar origem declarada');sourceLink.target='_blank';sourceLink.rel='noopener noreferrer';sourceLink.hidden=true;
  const dialogActions=node('div','silm-micro-data-actions');
  const reset=button('Retornar ao mapa didático','Repor esquema',()=>{
   applySchematic({seed,profile});
   sourceLink.hidden=true;sourceLink.removeAttribute('href');report.textContent='Esquema didático restaurado.';
  });
  const close=button('Fechar importação de dados','Fechar',()=>dataDialog.close());
  dialogActions.append(reset,close);dataDialog.append(dataTitle,dataHelp,note,evidence,fileLabel,report,sourceLink,dialogActions);
  fileInput.addEventListener('change',async()=>{
   const file=fileInput.files?.[0];if(!file)return;
   try{
    if(file.size>1024*1024)throw new Error('Arquivo muito grande (limite de 1 MiB).');
    const json=JSON.parse(await file.text());
    const checked=SILM.microstructureData?.validate(json,element?.atomicNumber);
    if(!checked?.ok)throw new Error(checked?.error||'Módulo de validação indisponível.');
    sourceData=checked.data;
    formationsButton.disabled=true;
    W=sourceData.image.widthPx;H=sourceData.image.heightPx;CX=W/2;CY=H/2;
    polygons=sourceData.grains.map(g=>g.vertices);
    chosen=-1;zoom=1;section.dataset.microstructureSource=sourceData.sourceKind;
    section.dataset.didacticEvidenceLevel='imported-unverified';
    evidence.dataset.evidenceLevel='imported-unverified';
    evidenceStatus.textContent='Contornos importados · informações declaradas pelo arquivo, ainda não homologadas. A referência da rede não valida a amostra.';
    section.dataset.measurementStatus=sourceData.image.micrometersPerPixel===null?'uncalibrated':'provided-unverified';
    dimension.textContent=sourceData.image.micrometersPerPixel===null?'Escala física indisponível':'Escala declarada: '+sourceData.image.micrometersPerPixel.toLocaleString('pt-BR')+' µm/pixel';
    note.textContent='Contornos importados sem homologação científica; medidas derivadas da segmentação/calibração declaradas, nunca composição ou fração de fase.';
    sourceLink.href=sourceData.source.url;sourceLink.hidden=false;
    report.textContent=sourceData.title+' · '+sourceData.grains.length+' grão(s) · '+sourceData.source.citation+' · '+sourceData.segmentation.method;
    drawGrains();
   }catch(error){report.textContent='Importação recusada: '+(error?.message||String(error));}
   fileInput.value='';
  });
  zoomControls.append(formationsButton,button('Abrir dados segmentados','Dados',()=>dataDialog.showModal()));
  // A dimensão não calibrada continua visível e operacional.
  // Métodos, limitações e referências passam ao tópico do Manual;
  // dados declarados no arquivo seguem no diálogo da importação.
  section.append(viewport,toolbar,genDialog,dataDialog);
  // A câmera ocupa o quadro em qualquer proporção sem alterar um só grão.
  // A vista efetua recorte central (não estica geometria nem reamostra a formação).
  function fitViewport(){
   if(!viewport.isConnected)return;
   const rect=viewport.getBoundingClientRect();
   if(rect.width<2||rect.height<2)return;
   // A imagem/segmentação importada deve manter todo o campo disponível:
   // recortá-la esconderia grãos e distorceria a leitura da amostra.
   if(sourceData){
    svg.setAttribute('viewBox','0 0 '+W+' '+H);
    update();svg.dataset.mapReady='true';return;
   }
   const ratio=clamp(rect.width/rect.height,.2,8),base=W/H;
   const boxW=ratio<base?H*ratio:W,boxH=ratio>base?W/ratio:H;
   svg.setAttribute('viewBox',[
    (W-boxW)/2,(H-boxH)/2,boxW,boxH
   ].map(n=>Number(n.toFixed(3))).join(' '));
   update();svg.dataset.mapReady='true';
  }
  let resizeFrame=0;
  const scheduleResize=()=>{
   if(resizeFrame)return;
   resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;fitViewport();});
  };
  if(typeof ResizeObserver==='function'){
   const observer=new ResizeObserver(scheduleResize);
   observer.observe(viewport);
  }else window.addEventListener('resize',scheduleResize,{passive:true});
  drawGrains();update();scheduleResize();return section;
 }
 return Object.freeze({create});
})();