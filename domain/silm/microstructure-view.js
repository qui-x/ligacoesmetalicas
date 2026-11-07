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
 function create({element,item=null}={}){
  const section=node('section','silm-workshop-micro-viewer'),viewport=node('div','silm-workshop-micro-viewport');
  const synthetic=SILM.microstructureSynthetic;
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
  const svg=svgNode('svg',{viewBox:'0 0 '+W+' '+H,preserveAspectRatio:'xMidYMid meet',role:'group','aria-label':'Policristal didático ampliado: percorra os grãos com Tab e destaque com Enter; não é micrografia experimental'});
  svg.classList.add('silm-workshop-micro-map');svg.setAttribute('data-zoom','1');
  const defs=svgNode('defs'),uid='silm-micro-'+(++serial);
  for(let p=0;p<4;p++){const pattern=svgNode('pattern',{id:uid+'-pattern-'+p,patternUnits:'userSpaceOnUse',width:22,height:22,patternTransform:'rotate('+(p*37+12)+')'});
   pattern.append(svgNode('path',{d:'M 0 0 V 22',stroke:'currentColor','stroke-opacity':'.13','stroke-width':1.35}));defs.append(pattern);}
  svg.append(defs);
  const plane=svgNode('g',{'class':'silm-micro-plane'});svg.append(plane);
  let paths=[],cells=[];
  let chosen=-1,zoom=1,offsetX=0,offsetY=0,drag=null,suppressClick=false;
  let sourceData=null; // Mapa importado = análise de polígonos fornecidos, não homologação.
  const status=node('span','silm-workshop-micro-status','Selecione um grão · modelo esquemático');
  const dimension=node('span','silm-workshop-micro-dimension','Tamanho real: indisponível (sem escala em µm)');
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
  const choose=i=>{
   chosen=i;
   paths.forEach((p,j)=>{p.classList.toggle('is-selected',j===i);p.setAttribute('aria-pressed',String(j===i));cells[j]?.classList.toggle('is-selected',j===i);});
   if(sourceData){
    const grain=sourceData.grains[i],area=grain?.areaMicrometers2;
    const fmt=v=>v.toLocaleString('pt-BR',{maximumFractionDigits:3});
    status.textContent='Grão '+grain.id+(area===null?' · sem calibração':' · área segmentada '+fmt(area)+' µm²')+' · dados importados não homologados';
   }else status.textContent='Grão '+(i+1)+' selecionado · modelo esquemático';
   svg.setAttribute('data-selected-grain',String(i+1));
  };
  function drawGrains(){
   paths=[];cells=[];plane.replaceChildren();
   polygons.forEach((poly,i)=>{
   if(poly.length<3)return;
   const d='M'+poly.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L')+' Z';
   const g=svgNode('g',{'class':'silm-micro-cell'}),p=svgNode('path',{d,'class':'silm-micro-grain',tabindex:0,role:'button','aria-label':sourceData?'Selecionar grão segmentado '+sourceData.grains[i].id+' (dados importados não homologados)':'Destacar grão ilustrativo '+(i+1),'aria-pressed':'false'});
   p.style.setProperty('--grain-tone',(16+(i*17)%30)+'%');p.addEventListener('click',()=>{if(!suppressClick)choose(i);});
   p.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(i);return;}
    const step=55*(e.shiftKey?2:1);
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='ArrowDown'){
     e.preventDefault();
     offsetX+=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0;
     offsetY+=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0;
     update();
    }
   });
   const hatch=svgNode('path',{d,'class':'silm-micro-hatching',fill:'url(#'+uid+'-pattern-'+(i%4)+')','pointer-events':'none'});
   g.append(p,hatch);plane.append(g);paths[i]=p;cells[i]=g;
   });
   if(chosen>=polygons.length)chosen=polygons.length-1;
   if(chosen>=0)choose(chosen);else status.textContent=sourceData?'Selecione um grão segmentado · dados importados não homologados':'Selecione um grão · modelo esquemático';
   offsetX=0;offsetY=0;update();fitViewport();
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
  const button=(name,txt,action)=>{const b=node('button','silm-workshop-micro-control',txt);b.type='button';b.setAttribute('aria-label',name);b.addEventListener('click',action);return b;};
  const zoomControls=node('div','silm-workshop-micro-zoom-tools');
  zoomControls.append(button('Reduzir microestrutura','−',()=>setZoom(zoom-.25)),zoomLabel,button('Ampliar microestrutura','+',()=>setZoom(zoom+.25)),button('Ajustar microestrutura ao quadro','Ajustar',()=>setZoom(1)));
  toolbar.append(status,dimension,zoomControls);
  svg.addEventListener('wheel',e=>{e.preventDefault();setZoom(zoom+(e.deltaY<0?.25:-.25));},{passive:false});
  svg.addEventListener('pointerdown',e=>{
   if(e.button!==0||!viewport.classList.contains('is-pannable'))return;
   drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};
   suppressClick=false;svg.setPointerCapture(e.pointerId);
  });
  svg.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;
   const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
   if(Math.abs(dx)+Math.abs(dy)>2)drag.moved=true;
   const r=svg.getBoundingClientRect(),v=svg.viewBox.baseVal;
   const factor=Math.min(r.width/v.width,r.height/v.height)||1;
   offsetX+=dx/factor;offsetY+=dy/factor;drag.x=e.clientX;drag.y=e.clientY;update();
  });
  const stop=e=>{if(!drag||e.pointerId!==drag.id)return;suppressClick=drag.moved;drag=null;
   if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);
   if(suppressClick)queueMicrotask(()=>{suppressClick=false;});
  };
  svg.addEventListener('pointerup',stop);svg.addEventListener('pointercancel',stop);
  viewport.append(svg);
  const note=node('p','silm-workshop-micro-caveat','Grãos e tons ilustrativos; sem composição, fração de fase ou tamanho medidos.');
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
   dimension.textContent='Tamanho real: indisponível (sem escala em µm)';
   note.textContent='Grãos e tons ilustrativos; sem composição, fração de fase ou tamanho medidos.';
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
  dialogActions.append(reset,close);dataDialog.append(dataTitle,dataHelp,fileLabel,report,sourceLink,dialogActions);
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
  section.append(viewport,toolbar,note,genDialog,dataDialog);
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