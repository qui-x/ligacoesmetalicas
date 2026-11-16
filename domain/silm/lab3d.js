'use strict';
/*
 * SILM: sala 3D WebGL2 progressiva, SEM dependência de rede, SEM nova
 * investigação científica. A cena é uma representação/protótipo de UX.
 * Movimento/colisão são da sala; resposta de carga lê o J2 da main.
 * Condutividade/efeitos ópticos na sala são prévios e NÃO calibrados.
 */
(()=>{
 const S=window.SILM||{},C=S.lab3dCore,Surface=S.lab3dSpecimen;
 if(!C||!Surface)return;
 const $=s=>document.querySelector(s),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||
  document.documentElement.classList.contains('si-no-motion');
 const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
 const verts=[];
 const faces=[
  {n:[1,0,0],p:[[.5,-.5,-.5],[.5,-.5,.5],[.5,.5,.5],[.5,.5,-.5]]},
  {n:[-1,0,0],p:[[-.5,-.5,.5],[-.5,-.5,-.5],[-.5,.5,-.5],[-.5,.5,.5]]},
  {n:[0,1,0],p:[[-.5,.5,-.5],[.5,.5,-.5],[.5,.5,.5],[-.5,.5,.5]]},
  {n:[0,-1,0],p:[[-.5,-.5,.5],[.5,-.5,.5],[.5,-.5,-.5],[-.5,-.5,-.5]]},
  {n:[0,0,1],p:[[.5,-.5,.5],[-.5,-.5,.5],[-.5,.5,.5],[.5,.5,.5]]},
  {n:[0,0,-1],p:[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5]]}
 ];
 for(const f of faces)for(const i of [0,1,2,0,2,3])verts.push(...f.p[i],...f.n);
 const mult=(a,b)=>{
  const o=new Float32Array(16);
  for(let c=0;c<4;c++)for(let r=0;r<4;r++){
   let v=0;for(let k=0;k<4;k++)v+=a[k*4+r]*b[c*4+k];o[c*4+r]=v;
  }
  return o;
 };
 const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
 const norm=a=>{const l=Math.hypot(...a)||1;return a.map(x=>x/l)};
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 function matrices(eye,yaw,pitch,aspect){
  const forward=[Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)];
  const z=norm(forward.map(x=>-x)),x=norm(cross([0,1,0],z)),y=cross(z,x);
  const view=new Float32Array([
   x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,
   -dot(x,eye),-dot(y,eye),-dot(z,eye),1
  ]);
  const near=.075,far=65,f=1/Math.tan(Math.PI/5);
  const proj=new Float32Array([f/aspect,0,0,0, 0,f,0,0,
   0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);
  return mult(proj,view);
 }
 const model=(x,y,z,sx,sy,sz)=>new Float32Array([
  sx,0,0,0,0,sy,0,0,0,0,sz,0,x,y,z,1
 ]);
 function shader(gl,type,src){
  const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'Shader inválido');
  return s;
 }
 function makeRenderer(canvas){
  const options={antialias:true,alpha:false,depth:true,preserveDrawingBuffer:false};
  const gl=canvas.getContext('webgl2',options)||canvas.getContext('webgl',options);
  if(!gl)throw new Error('WebGL indisponível neste navegador.');
  const vs=shader(gl,gl.VERTEX_SHADER,
   'attribute vec3 p;attribute vec3 n;uniform mat4 m,vp;varying vec3 N,W;void main(){vec4 world=m*vec4(p,1.);W=world.xyz;N=normalize(mat3(m)*n);gl_Position=vp*world;}');
  const fs=shader(gl,gl.FRAGMENT_SHADER,
   'precision mediump float;varying vec3 N,W;uniform vec3 base,eye;uniform float metallic,shine;void main(){vec3 L=normalize(vec3(-.35,.9,.5));vec3 normal=normalize(N);float d=max(dot(normal,L),0.);vec3 V=normalize(eye-W);float spec=pow(max(dot(reflect(-L,normal),V),0.),shine)*metallic;vec3 color=base*(.25+.74*d)+vec3(.84,.92,1.)*spec*.66;gl_FragColor=vec4(color,1.);}');
  const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Programa WebGL inválido.');
  gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.clearColor(.055,.09,.14,1);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);
  const meshBuffer=gl.createBuffer();
  const layout=(target)=>{
   gl.bindBuffer(gl.ARRAY_BUFFER,target);
   for(const [name,offset] of [['p',0],['n',3]]){
    const id=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(id);
    gl.vertexAttribPointer(id,3,gl.FLOAT,false,24,offset*4);
   }
  };
  layout(buffer);
  const uniform=k=>gl.getUniformLocation(program,k);
  const U={m:uniform('m'),vp:uniform('vp'),base:uniform('base'),
    eye:uniform('eye'),metallic:uniform('metallic'),shine:uniform('shine')};
  return {
   resize(){const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);
    const dpr=Math.min(devicePixelRatio||1,1.6);
    const pw=Math.round(w*dpr),ph=Math.round(h*dpr);
    if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph;}
    gl.viewport(0,0,pw,ph);return w/h;},
   render(items,eye,yaw,pitch){const aspect=this.resize();gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(U.vp,false,matrices(eye,yaw,pitch,aspect));
    gl.uniform3fv(U.eye,new Float32Array(eye));
    let activeBuffer=null;
    for(const a of items){
     const isMesh=!!a.mesh,target=isMesh?meshBuffer:buffer;
     if(activeBuffer!==target){layout(target);activeBuffer=target;}
     if(isMesh)gl.bufferData(gl.ARRAY_BUFFER,a.mesh,gl.DYNAMIC_DRAW);
     gl.uniformMatrix4fv(U.m,false,isMesh?model(0,0,0,1,1,1):model(...a.b));
     gl.uniform3fv(U.base,new Float32Array(a.c));gl.uniform1f(U.metallic,a.m);
     gl.uniform1f(U.shine,a.g);
     gl.drawArrays(gl.TRIANGLES,0,isMesh?a.mesh.length/6:36);
    }
   },
   dispose(){gl.deleteBuffer(meshBuffer);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs)}
  };
 }
 class Session{
  constructor(host,metal,returnFocus){
   this.host=host;this.metal=metal;this.returnFocus=returnFocus;
   this.keys=new Set();this.eye=[0,1.60,2.35];this.yaw=0;this.pitch=-.06;
   this.inspect=false;this.load=0;this.loadMode='compression';
   this.temperature=C.initialHeat();this.heat=false;this.current=false;this.lamp=true;
   this.field=null;this.surface=null;this.surfaceSegments=[];this.strain=0;this.last=0;this.thermalTimer=0;this.frame=null;this.destroyed=false;
   this.ui=make('section','silm-lab3d');this.ui.setAttribute('role','dialog');
   this.ui.setAttribute('aria-modal','true');this.ui.setAttribute('aria-label','Laboratório 3D de metais');
   this.canvas=make('canvas');this.canvas.tabIndex=0;this.canvas.setAttribute('aria-label','Sala tridimensional. Use WASD para caminhar, mouse para olhar, E para interagir.');this.ui.append(this.canvas);
   const hud=make('header','silm-lab3d-hud');
   hud.append(make('h2','silm-lab3d-title','Sala 3D · '+metal));
   const inspect=this.button(hud,'Inspecionar','inspect',()=>this.setInspect(!this.inspect));
   const close=this.button(hud,'Fechar','close',()=>this.close());close.setAttribute('aria-label','Fechar laboratório e voltar à investigação');
   this.inspectButton=inspect;
   this.ui.append(hud,make('div','silm-lab3d-crosshair'));
   const bottom=make('div','silm-lab3d-bottom');
   this.button(bottom,'Tração / compressão','mode',()=>{this.loadMode=this.loadMode==='compression'?'tension':'compression';this.setLoad(this.load)});
   this.button(bottom,'− Carga','less',()=>this.setLoad(this.load-.2));
   this.button(bottom,'+ Carga','more',()=>this.setLoad(this.load+.2));
   this.heatButton=this.button(bottom,'Calor','heat',()=>{this.heat=!this.heat;this.heatButton.setAttribute('aria-pressed',String(this.heat));if(reduced())this.temperature=C.initialHeat().map((_,i)=>this.heat?Math.max(0,1-i/17):0);});
   this.currentButton=this.button(bottom,'Corrente','current',()=>{this.current=!this.current;this.currentButton.setAttribute('aria-pressed',String(this.current));});
   this.lampButton=this.button(bottom,'Luz','lamp',()=>{this.lamp=!this.lamp;this.lampButton.setAttribute('aria-pressed',String(this.lamp));});
   this.button(bottom,'Microscópio','micro',()=>this.enterScale(2));
   this.button(bottom,'Rede','lattice',()=>this.enterScale(3));
   this.status=make('output','silm-lab3d-status','WASD: caminhar · arrastar: olhar · E: interagir · prévia didática sem calibração.');
   this.status.setAttribute('aria-live','polite');bottom.append(this.status);this.ui.append(bottom);
   this.heatButton.setAttribute('aria-pressed','false');this.currentButton.setAttribute('aria-pressed','false');
   this.lampButton.setAttribute('aria-pressed','true');
   const mobile=make('div','silm-lab3d-controls');
   for(const [label,id] of [['↑','forward'],['←','left'],['↓','backward'],['→','right']]){
    const b=this.button(mobile,label,id,()=>{});b.dataset.move=id;
    b.addEventListener('pointerdown',e=>{e.preventDefault();this.keys.add(id);b.setPointerCapture(e.pointerId)});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>this.keys.delete(id));
   }
   this.ui.append(mobile);host.append(this.ui);
   try{this.renderer=makeRenderer(this.canvas)}
   catch(e){this.ui.remove();throw e}
   this.onKey=e=>{
    if(e.key==='Escape'){e.preventDefault();if(document.pointerLockElement===this.canvas)document.exitPointerLock();else this.close();return;}
    const k=e.key.toLowerCase();
    if(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright','e'].includes(k)){
     if(e.target.closest?.('button,input,textarea,select')&&k!=='e')return;
     e.preventDefault();e.stopPropagation();
     if(k==='e'){this.interact();return}
     this.keys.add(k);
    }
   };
   this.onUp=e=>this.keys.delete(e.key.toLowerCase());
   this.onMove=e=>{
    if(document.pointerLockElement===this.canvas||this.dragging){
     this.yaw+=e.movementX*.0028;this.pitch=clamp(this.pitch-e.movementY*.0028,-1.15,1.0);
    }
   };
   this.onPointerDown=e=>{if(e.button===0){this.dragging=true;this.canvas.focus({preventScroll:true});}};
   this.onPointerUp=()=>{this.dragging=false};
   this.onClick=()=>{if(this.touchMoved){this.touchMoved=false;return}
    if(this.canvas.requestPointerLock&&matchMedia('(pointer:fine)').matches&&document.pointerLockElement!==this.canvas){
     try{const r=this.canvas.requestPointerLock();r?.catch?.(()=>{});}catch{}
    }else this.interact();
   };
   this.onWheel=e=>{if(this.inspect){e.preventDefault();this.eye[2]=clamp(this.eye[2]+Math.sign(e.deltaY)*.18,.15,1.85);}};
   this.onRoute=()=>{if(!location.hash.startsWith('#/ambiente'))this.close()};
   document.addEventListener('keydown',this.onKey,true);document.addEventListener('keyup',this.onUp,true);
   document.addEventListener('mousemove',this.onMove);window.addEventListener('mouseup',this.onPointerUp);
   this.canvas.addEventListener('pointerdown',this.onPointerDown);
   this.canvas.addEventListener('click',this.onClick);this.canvas.addEventListener('wheel',this.onWheel,{passive:false});
   window.addEventListener('hashchange',this.onRoute);
   this.touch=null;
   this.onTouchStart=e=>{this.touchMoved=false;if(e.touches.length===1)this.touch={x:e.touches[0].clientX,y:e.touches[0].clientY}};
   this.onTouchMove=e=>{if(!this.touch||e.touches.length!==1)return;
    const x=e.touches[0].clientX,y=e.touches[0].clientY;
    if(Math.hypot(x-this.touch.x,y-this.touch.y)>2)this.touchMoved=true;
    this.yaw+=(x-this.touch.x)*.005;this.pitch=clamp(this.pitch-(y-this.touch.y)*.005,-1.1,1);
    this.touch={x,y};
   };
   this.canvas.addEventListener('touchstart',this.onTouchStart,{passive:true});
   this.canvas.addEventListener('touchmove',this.onTouchMove,{passive:true});
   this.setLoad(0); // A primeira malha lê o campo J2 de referência, sem carga.
   this.canvas.focus({preventScroll:true});
   this.frame=requestAnimationFrame(t=>this.tick(t));
  }
  button(parent,text,id,handler){
   const b=make('button','',text);b.type='button';b.dataset.labAction=id;
   b.addEventListener('click',handler);parent.append(b);return b;
  }
  setInspect(on){
   this.inspect=on;this.eye=on?[0,1.65,.6]:[0,1.6,2.35];
   this.yaw=0;this.pitch=on?-.16:-.06;
   this.inspectButton.setAttribute('aria-pressed',String(on));
   this.status.textContent=on?'Inspeção: gire a câmera e use a roda para aproximar.':'Caminhe com WASD, observe a bancada e pressione E para interagir.';
  }
  setLoad(value){
   const load=clamp(Math.round(value*10)/10,0,1);
   if(load===this.load&&this.field)return;
   try{
    const field=S.specimenJ2?.active?.([],{mode:this.loadMode,position:.5,width:.3,load});
    if(!field||!field.converged)throw new Error('Solver J2 não convergiu.');
    const upper=C.sampleField(field,.5,1),lower=C.sampleField(field,.5,0);
    if(!upper||!lower)throw new Error('Deslocamento da amostra não disponível.');
    const surface=Surface.create(field,{segments:this.temperature.length,rows:6,amplification:2.5});
    if(!surface.ok)throw new Error('Malha visual J2 indisponível.');
    const surfaceSegments=surface.segments.map(seg=>({index:seg.index,
     vertices:new Float32Array(seg.vertices),plasticIndicator:seg.plasticIndicator}));
    this.field=field;this.surface=surface;this.surfaceSegments=surfaceSegments;this.load=load;
    this.strain=clamp((upper.dy-lower.dy)*2,-.18,.18);
    this.ui.dataset.specimenSurface='j2-plane-strain';
    this.ui.dataset.specimenSegments=String(surfaceSegments.length);
    this.ui.dataset.specimenLoad=String(load);
    this.ui.dataset.specimenProbe=surface.position(.75,.75,1).map(v=>v.toFixed(7)).join(',');
    this.status.textContent='J2 normalizado · '+(this.loadMode==='compression'?'compressão':'tração')+
     ' · carga '+Math.round(load*100)+'% (unidades relativas). Superfície deformada por campo 2D; espessura apenas visual.';
   }catch(e){this.status.textContent='Amostra original preservada: '+(e?.message||'sem resposta do modelo J2');}
  }
  interact(){
   const items=[
    {id:'microscope',center:[1.07,1.36,-1.3],radius:.4},
    {id:'heater',center:[-1.15,1.19,-1.39],radius:.42},
    {id:'lamp',center:[-1.63,1.35,-1.31],radius:.35},
    {id:'power',center:[1.65,1.08,-1.5],radius:.38},
    {id:'press',center:[0,1.25,-1.35],radius:.63}
   ];
   const hit=C.pickTarget(this.eye,this.yaw,this.pitch,items);
   if(!hit){this.status.textContent='Mire um instrumento da bancada com o retículo e pressione E ou clique. Aproximar também está disponível.';return}
   if(hit.id==='microscope'){this.enterScale(2);return}
   if(hit.id==='heater'){this.heatButton.click();this.status.textContent='Fonte térmica '+(this.heat?'ligada':'desligada')+' · propagação relativa.';return}
   if(hit.id==='lamp'){this.lampButton.click();this.status.textContent='Iluminação '+(this.lamp?'ligada':'desligada')+' · superfície esquemática.';return}
   if(hit.id==='power'){this.currentButton.click();this.status.textContent='Fonte elétrica '+(this.current?'ligada':'desligada')+' · marcadores visuais.';return}
   this.setLoad(this.load+.2);
  }
  enterScale(n){
   const step=$('#silm-workshop-context .silm-workshop-scale[data-scale="'+n+'"]');
   if(!step||step.disabled){this.status.textContent='Selecione primeiro um objeto de investigação com estrutura disponível.';return}
   this.close(false);step.click();
   requestAnimationFrame(()=>$('#silm-workshop-context .silm-workshop-scale[data-scale="'+n+'"]')?.focus({preventScroll:true}));
  }
  items(time){
   const items=[],add=(b,c,m=0,g=20)=>items.push({b,c,m,g});
   const steel=[.51,.60,.66],wall=[.21,.3,.4],wood=[.32,.24,.19],dark=[.08,.14,.21];
   add([0,-.10,0,7.65,.2,7.65],[.25,.3,.34]);
   add([0,1.65,-3.87,7.7,3.3,.18],wall);
   add([-3.88,1.65,0,.18,3.3,7.7],[.18,.25,.32]);
   add([3.88,1.65,0,.18,3.3,7.7],[.18,.25,.32]);
   for(let k=-3;k<=3;k++)add([k,0,0,.01,.01,7.6],[.13,.18,.23]);
   add([0,.83,-1.36,3.4,.16,1.46],wood,0,12);
   for(const x of [-1.48,1.48])for(const z of [-1.86,-.85])
    add([x,.39,z,.14,.75,.14],steel,.5,20);
   add([0,.92,-1.35,1.18,.07,.40],dark);
   // Prensa com duas colunas, garra superior móvel e célula de prova.
   for(const x of [-.62,.62])add([x,1.28,-1.6,.09,.76,.1],steel,.8,48);
   add([0,1.73,-1.6,1.35,.14,.24],[.37,.49,.59],.8,52);
   // O sólido deformado usa a função sample(u,v) do mesmo campo J2 convergido.
   // z permanece constante, pois o campo resolvido é bidimensional.
   const upperY=this.surface?.ok?this.surface.position(.5,1,1)[1]:1.25;
   add([0,upperY+.042,-1.35,1.12,.06,.31],steel,.92,70);
   if(this.surface?.ok){
    for(const seg of this.surfaceSegments){
     const q=this.temperature[Math.min(this.temperature.length-1,seg.index)]||0;
     const p=clamp((seg.plasticIndicator||0)*8,0,1);
     const blink=this.current&&!reduced()?Math.max(0,Math.sin(time*.004-seg.index*.85))*.16:0;
     const color=[.53+.42*q+.08*p+.05*blink,.62-.32*q-.13*p+.07*blink,.69-.48*q-.16*p+.13*blink];
     items.push({mesh:seg.vertices,c:color,m:.96,g:this.lamp?Math.max(24,70-40*p):16});
    }
   }else add([0,1.14,-1.35,1.03,.22,.24],[.48,.54,.6],.95,65);
   // Microscópio, luminária, resistência e fonte elétrica: modelos 3D preliminares.
   add([1.08,.97,-1.25,.44,.08,.38],dark,.1);
   add([1.07,1.3,-1.4,.11,.61,.11],[.61,.68,.71],.55);
   add([1.07,1.52,-1.26,.43,.09,.16],steel,.55);
   add([1.06,1.32,-1.24,.15,.25,.15],[.13,.19,.24],.85,30);
   add([-1.15,1.05,-1.39,.44,.27,.42],[.29,.31,.37],.1);
   add([-1.15,1.19,-1.39,.25,.04,.23],this.heat?[1,.29,.1]:[.3,.48,.59],.4);
   add([-1.63,1.11,-1.31,.13,.42,.12],[.42,.44,.45],.25);
   add([-1.63,1.34,-1.31,.25,.12,.28],this.lamp?[.98,.89,.57]:[.24,.30,.36],.4);
   add([1.65,1.02,-1.5,.34,.27,.44],[.15,.31,.42],.32);
   for(const z of [-1.47,-1.30])add([1.43,.96,z,.42,.035,.035],this.current?[.27,.79,.95]:[.18,.28,.37],.5);
   // Referências de escala e ferramentas do ambiente.
   add([0,2.92,-3.65,1.92,.34,.06],[.11,.27,.41],.35);
   add([-2.85,1.42,-3.76,.36,1.5,.08],[.32,.46,.53],.3);
   add([2.85,1.42,-3.76,.36,1.5,.08],[.32,.46,.53],.3);
   return items;
  }
  tick(time){
   if(this.destroyed)return;
   const dt=this.last?Math.min((time-this.last)/1000,.05):0;this.last=time;
   if(!this.inspect&&dt){
    const f=Number(this.keys.has('w')||this.keys.has('arrowup')||this.keys.has('forward'))-
     Number(this.keys.has('s')||this.keys.has('arrowdown')||this.keys.has('backward'));
    const r=Number(this.keys.has('d')||this.keys.has('arrowright')||this.keys.has('right'))-
     Number(this.keys.has('a')||this.keys.has('arrowleft')||this.keys.has('left'));
    const speed=2.1*dt/Math.max(1,Math.hypot(f,r));
    const dx=(Math.cos(this.yaw)*r+Math.sin(this.yaw)*f)*speed;
    const dz=(Math.sin(this.yaw)*r-Math.cos(this.yaw)*f)*speed;
    if(C.canWalk(this.eye[0]+dx,this.eye[2]))this.eye[0]+=dx;
    if(C.canWalk(this.eye[0],this.eye[2]+dz))this.eye[2]+=dz;
   }
   if(!reduced()){
    this.thermalTimer+=dt;
    while(this.thermalTimer>=1/24){this.temperature=C.heatStep(this.temperature,{source:this.heat});this.thermalTimer-=1/24;}
   }
   try{this.renderer.render(this.items(time),this.eye,this.yaw,this.pitch)}
   catch(e){this.status.textContent='Renderização 3D interrompida: '+e.message;this.close(false);return;}
   this.frame=requestAnimationFrame(t=>this.tick(t));
  }
  close(restore=true){
   if(this.destroyed)return;
   this.destroyed=true;cancelAnimationFrame(this.frame);
   if(document.pointerLockElement===this.canvas)document.exitPointerLock();
   document.removeEventListener('keydown',this.onKey,true);document.removeEventListener('keyup',this.onUp,true);
   document.removeEventListener('mousemove',this.onMove);window.removeEventListener('mouseup',this.onPointerUp);
   window.removeEventListener('hashchange',this.onRoute);
   this.canvas.removeEventListener('pointerdown',this.onPointerDown);
   this.canvas.removeEventListener('click',this.onClick);this.canvas.removeEventListener('wheel',this.onWheel);
   this.canvas.removeEventListener('touchstart',this.onTouchStart);this.canvas.removeEventListener('touchmove',this.onTouchMove);
   this.renderer.dispose();this.ui.remove();
   document.body.classList.remove('silm-lab3d-open');
   if(restore&&this.returnFocus?.isConnected)this.returnFocus.focus({preventScroll:true});
   if(active===this)active=null;
  }
 }
 let active=null;
 function boot(){
  const bar=$('#silm-scene-actionbar'),stage=$('#si-stage');
  if(!bar||!stage)return;
  const entry=make('button','button outline silm-lab3d-entry','Sala 3D');
  entry.type='button';entry.setAttribute('aria-label','Entrar na sala tridimensional de investigação do metal');
  entry.title='Prévia navegável 3D integrada à investigação atual';
  const count=$('#scene-count');count?.parentElement?.insertBefore(entry,count);
  entry.addEventListener('click',()=>{
   if(active){active.close();return;}
   const state=window.SILMIntegration?.snapshot?.();
   if(!state?.metal){entry.title='Selecione e inicie a investigação de um metal primeiro.';entry.focus();return;}
   if(!location.hash.startsWith('#/ambiente'))return;
   try{
    const metal=S.data?.get?.(state.metal.atomicNumber)?.name||state.metal.symbol||'metal';
    active=new Session(stage,metal,entry);document.body.classList.add('silm-lab3d-open');
   }catch(e){
    const msg='Sala 3D indisponível: '+(e?.message||'falha gráfica')+'. A investigação original continua disponível.';
    if(window.SimCore?.notifications?.announce)window.SimCore.notifications.announce(msg);
    else entry.title=msg;
   }
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();