/* Functional jazz club choreography — Babylon.js + procedural rehearsal rigs.
   A rendered dance is ARTISTIC, not a microscopic/chemical measurement. */
const {
  Engine,Scene,ArcRotateCamera,Vector3,Color3,Color4,HemisphericLight,SpotLight,
  PointLight,TransformNode,MeshBuilder,PBRMaterial,StandardMaterial
} = window.BABYLON;
import {PERFORMERS,FORMATIONS,danceFrame,normalizeCueSheet} from './dance-core.js';


const $=id=>document.getElementById(id);
const canvas=$('dance-stage'),info=$('form-title'),bpmEl=$('bpm');
const status=$('music-state'),announcer=$('announcer'),beatStatus=$('beat-status');
const reduced=$('reduce-motion'),formationEl=$('formation'),intensity=$('intensity');
const media=new Audio();media.preload='metadata';media.loop=false;
let sourceUrl=null,ctx=null,analyser=null,clip=null,scene=null,engine=null;
let dancers=[],clock=0,playing=true,lastTime=performance.now(),peak=0;
let cues={bpm:120,beatOffset:0,events:[],track:'Ensaio rítmico sem áudio'};
let activeForm='trio',errorState=false,previousForm=null,formationChangeAt=-999,lastCueFormation=null;
const quiet=window.matchMedia('(prefers-reduced-motion: reduce)');
reduced.checked=quiet.matches;
const say=s=>announcer.textContent=s;
const color=hex=>Color3.FromHexString(hex);
function mat(name,hex,metal=0,rough=.7,glow=null){
  const p=new PBRMaterial(name,scene);
  p.albedoColor=color(hex);p.metallic=metal;p.roughness=rough;
  if(glow)p.emissiveColor=color(glow);return p;
}
function primitive(name,type,opts,parent,m,xyz=[0,0,0]){
  let mesh=type==='sphere'?MeshBuilder.CreateSphere(name,opts,scene)
    :type==='cyl'?MeshBuilder.CreateCylinder(name,opts,scene)
    :type==='disc'?MeshBuilder.CreateDisc(name,opts,scene)
    :MeshBuilder.CreateBox(name,opts,scene);
  mesh.material=m;mesh.parent=parent||null;mesh.position.set(...xyz);
  mesh.isPickable=false;return mesh;
}
function node(name,parent,x=0,y=0,z=0){
  const n=new TransformNode(name,scene);n.parent=parent||null;n.position.set(x,y,z);return n;
}
function createEnvironment(){
  const wood=mat('dance-floor','#4a3030',.13,.57);
  const bronze=mat('artdeco-bronze','#c39b5a',.72,.32);
  const dark=mat('stage-panel','#22202b',0,.93);
  const velvet=mat('stage-velvet','#4e2234',0,.96);
  primitive('whole-floor','box',{width:20,height:.16,depth:15},null,wood,[0,-.12,0]);
  primitive('upstage-wall','box',{width:20,height:7,depth:.24},null,dark,[0,3.25,5.4]);
  for(let k=-8;k<=8;k++){
    primitive('artdeco-floor-inlay','box',{width:.019,height:.008,depth:12.5},null,bronze,[k*.98,-.029,0]);
  }
  for(let k=-5;k<=5;k++)primitive('cross-inlay','box',
    {width:19,height:.008,depth:.015},null,bronze,[0,-.028,k*1.16]);
  for(const x of [-9,-6.8,6.8,9]){
    primitive('velvet-curtain','box',{width:1.15,height:6.3,depth:.26},null,velvet,[x,3.2,5.1]);
    primitive('curtain-trim','box',{width:.055,height:6.3,depth:.12},null,bronze,[x+.55,3.2,4.92]);
  }
  for(const x of [-5.9,5.9]){
    primitive('gold-stage-pillar','cyl',{height:5.2,diameter:.26,tessellation:12},
      null,bronze,[x,2.55,4.95]);
    primitive('stage-lamp','sphere',{diameter:.35,segments:16},null,bronze,[x,5.30,4.92]);
  }
  for(const [x,z] of [[-8,1.5],[8,1.5],[-7,-4],[7,-4]]){
    primitive('audience-table','cyl',{diameter:1.13,height:.09,tessellation:24},
      null,wood,[x,.74,z]);
    primitive('table-stem','cyl',{diameter:.08,height:.70,tessellation:12},
      null,bronze,[x,.35,z]);
  }
  const gleam=mat('brass-ornament','#b28e4e',.63,.32);
  for(let i=0;i<11;i++){
    const n=primitive('marquee','sphere',{diameter:.125,segments:8},null,gleam,
      [-5+i,5.75,4.95]);
    n.material.emissiveColor=color('#7b5524');
  }
  // Qualitative ornamental particles: NOT a physical electron sea simulation.
  const c=mat('decorative-electron-metaphor','#8ee7e8',.18,.24,'#176469');
  const dots=[];
  for(let i=0;i<48;i++){
    const p=primitive('artistic-floating-light','sphere',{diameter:.035,segments:6},
      null,c,[0,1,0]);dots.push(p);
  }
  return dots;
}
function costumeDetail(parent,id,gold){
  if(id==='Eu'){
    const icon=primitive('CCC-emblem','box',{size:.22},parent,gold,[0,1.69,-.38]);
    icon.rotation.y=Math.PI/4;icon.rotation.x=Math.PI/6;
  }else if(id==='Ce'){
    for(const sx of [-.17,.17])
      primitive('CFC-face-ornament','box',{width:.14,height:.13,depth:.04},parent,gold,[sx,1.68,-.38]);
  }else{
    primitive('HC-hex-medallion','cyl',{diameter:.27,height:.037,tessellation:6},
      parent,gold,[0,1.68,-.385]).rotation.x=Math.PI/2;
  }
}
function createDancer(p){
  const root=node(p.name+'-floor-anchor');
  const torsoPivot=node(p.name+'-torso',root,0,1.17,0);
  const torso=mat(p.name+'-costume',p.costume,0,.84);
  const trim=mat(p.name+'-metallic-embroidery',p.accent,.42,.36);
  const skin=mat(p.name+'-skin','#cda88d',0,.86);
  const shoes=mat(p.name+'-shoes','#121823',0,.64);
  const hair=mat(p.name+'-hair','#2b2526',0,.88);
  const shirt=mat(p.name+'-shirt','#e7d9be',0,.83);
  const body=primitive(p.name+'-torso-volume','cyl',
    {height:.88,diameterTop:.66,diameterBottom:.81,tessellation:16},
    torsoPivot,torso,[0,.35,0]);
  primitive('vest','box',{width:.43,height:.57,depth:.09},torsoPivot,shirt,[0,.38,-.355]);
  primitive('collar','cyl',{height:.10,diameter:.20,tessellation:12},
    torsoPivot,skin,[0,.87,0]);
  const headPivot=node('head',torsoPivot,0,.97,0);
  primitive('face','sphere',{diameter:.47,segments:20},headPivot,skin,[0,.07,-.01]);
  primitive('hair','sphere',{diameter:.49,segments:20},headPivot,hair,[0,.22,.035]).scaling.y=.40;
  for(const x of [-.087,.087])
    primitive('eye','sphere',{diameter:.035,segments:8},headPivot,shoes,[x,.078,-.228]);
  costumeDetail(torsoPivot,p.id,trim);
  const arms=[],forearms=[],legs=[],knees=[];
  for(const side of [-1,1]){
    const upperArm=node('shoulder-'+side,torsoPivot,side*.43,.70,0);
    primitive('sleeve','cyl',{height:.53,diameter:.21,tessellation:10},upperArm,torso,[0,-.26,0]);
    const lowerArm=node('elbow-'+side,upperArm,0,-.52,0);
    primitive('cuff','cyl',{height:.45,diameter:.15,tessellation:10},lowerArm,torso,[0,-.21,0]);
    primitive('hand','sphere',{diameter:.17,segments:10},lowerArm,skin,[0,-.47,0]);
    arms.push(upperArm);forearms.push(lowerArm);
    const leg=node('hip-'+side,root,side*.21,1.13,0);
    primitive('thigh','cyl',{height:.53,diameter:.26,tessellation:11},leg,torso,[0,-.26,0]);
    const knee=node('knee-'+side,leg,0,-.52,0);
    primitive('shin','cyl',{height:.51,diameter:.20,tessellation:10},knee,torso,[0,-.24,0]);
    primitive('shoe','sphere',{diameter:.25,segments:10},knee,shoes,[0,-.51,-.12]);
    legs.push(leg);knees.push(knee);
  }
  return {id:p.id,root,torsoPivot,headPivot,arms,forearms,legs,knees};
}
function applyPose(rig,pose){
  rig.root.position.set(pose.x,pose.rise,pose.z);
  rig.root.rotation.y=pose.heading;
  rig.torsoPivot.rotation.z=pose.torsoRoll;
  rig.torsoPivot.rotation.y=pose.torsoYaw;
  rig.headPivot.rotation.y=pose.headYaw;
  rig.arms[0].rotation.z=pose.leftArm*.85;
  rig.arms[1].rotation.z=pose.rightArm*.85;
  rig.arms[0].rotation.x=.19*Math.sin(pose.leftArm*2);
  rig.arms[1].rotation.x=-.19*Math.sin(pose.rightArm*2);
  rig.forearms[0].rotation.x=-pose.leftElbow;
  rig.forearms[1].rotation.x=-pose.rightElbow;
  rig.legs[0].rotation.x=pose.leftKnee+pose.leftFoot*.7;
  rig.legs[1].rotation.x=pose.rightKnee+pose.rightFoot*.7;
  rig.knees[0].rotation.x=-pose.leftKnee*.72;
  rig.knees[1].rotation.x=-pose.rightKnee*.72;
}
function updateMusicLabel(){
  const track=media.src?('Faixa · '+(clip?.name||'importada')):'Ritmo silencioso';
  status.textContent=track+(media.paused?' · pausada':' · tocando');
  $('audio-play').textContent=media.paused?'Reproduzir faixa':'Pausar faixa';
}
function energy(){
  if(!analyser)return .5;
  const data=new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  const take=Math.min(32,data.length);
  let sum=0;for(let i=0;i<take;i++)sum+=data[i]/255;
  return Math.min(1,sum/Math.max(1,take)*2.1);
}
function cueAt(t){
  // Binary search avoids rescanning every timestamp 60 times/second.
  const es=cues.events;
  let low=0,high=es.length-1,best=-1;
  while(low<=high){const mid=(low+high)>>1;
    if(es[mid].time<=t){best=mid;low=mid+1}else high=mid-1;
  }
  return best<0?null:es[best];
}
function cueEnergy(t){return cueAt(t)?.energy ?? energy();}
function frame(now,dots){
  const delta=Math.min(.05,Math.max(0,(now-lastTime)/1000));lastTime=now;
  if(!playing) return;
  const isAudioActive=!!media.src&&!media.paused&&!media.ended;
  if(isAudioActive)clock=media.currentTime;else clock+=delta;
  const frameReduced=reduced.checked;
  const visualTime=frameReduced?0:clock;
  const bpm=Number(bpmEl.value);
  const activeCue=cueAt(clock);
  const cueFormation=formationEl.value==='auto'?activeCue?.formation:null;
  if(cueFormation && cueFormation!==lastCueFormation){
    previousForm=activeForm;formationChangeAt=clock;lastCueFormation=cueFormation;
  }else if(!cueFormation)lastCueFormation=null;
  const selectedFormation=cueFormation||formationEl.value;
  const result=danceFrame({
    seconds:visualTime,bpm,beatOffset:cues.beatOffset,
    formation:selectedFormation,
    previousFormation:selectedFormation!=='auto'&&(clock-formationChangeAt)<4*60/bpm?previousForm:null,
    formationBlend:selectedFormation!=='auto'&&(clock-formationChangeAt)<4*60/bpm?(clock-formationChangeAt)*bpm/240:null,
    intensity:Number(intensity.value)/100,
    reduced:frameReduced,energy:cueEnergy(clock)
  });
  if(activeForm!==result.formation){
    activeForm=result.formation;
    const labels={trio:'Trio de abertura',pares:'Dueto e solista',roda:'Roda de jazz',
      linha:'Linha Charleston',troca:'Troca de parceiros'};
    info.textContent=labels[activeForm]||'Improvisação coletiva';
    say('Formação: '+info.textContent);
  }
  result.cast.forEach(p=>{
    const rig=dancers.find(r=>r.id===p.id);
    if(rig)applyPose(rig,p);
  });
  const phase=result.beat%1;
  peak=peak*.68+(phase<.16?1:0)*.32;
  $('beat-light').classList.toggle('active',peak>.13);
  beatStatus.textContent=`${bpm} BPM · compasso ${Math.floor(result.beat/4)+1} · ${activeForm}`;
  dots.forEach((mesh,i)=>{
    const a=i*2.39996+visualTime*.13;
    const r=2.1+(i%7)*.52;
    mesh.position.set(Math.cos(a)*r,1.4+(i%13)*.155+
      Math.sin(visualTime*.5+i)*.17,Math.sin(a)*r);
  });
}
function init(){
  try{
    engine=new Engine(canvas,true,{stencil:true,antialias:true,adaptToDeviceRatio:true});
    engine.setHardwareScalingLevel(Math.max(1,window.devicePixelRatio/1.6));
    scene=new Scene(engine);
    scene.clearColor=new Color4(.07,.075,.10,1);
    const camera=new ArcRotateCamera('dance-orbit',-Math.PI/2,1.18,12,
      new Vector3(0,1.5,0),scene);
    camera.lowerRadiusLimit=7;camera.upperRadiusLimit=25;
    camera.lowerBetaLimit=.50;camera.upperBetaLimit=1.48;
    camera.wheelDeltaPercentage=.009;camera.pinchDeltaPercentage=.01;
    camera.attachControl(canvas,true);
    const hemi=new HemisphericLight('club-fill',new Vector3(0,1,0),scene);
    hemi.intensity=.6;hemi.diffuse=color('#b9d5eb');
    const key=new PointLight('amber-spot',new Vector3(-3,7,-3),scene);
    key.intensity=140;key.diffuse=color('#ffd39a');
    const rim=new PointLight('blue-rim',new Vector3(3,5,5),scene);
    rim.intensity=90;rim.diffuse=color('#8cbbdf');
    const dots=createEnvironment();
    dancers=PERFORMERS.map(createDancer);
    const initial=danceFrame({seconds:0,bpm:120,intensity:0,reduced:true,formation:'trio'});
    initial.cast.forEach(p=>applyPose(dancers.find(d=>d.id===p.id),p));
    engine.runRenderLoop(()=>{
      frame(performance.now(),dots);
      scene.render();
    });
    window.addEventListener('resize',()=>engine.resize());
    window.addEventListener('pagehide',()=>{if(engine)engine.dispose();if(sourceUrl)URL.revokeObjectURL(sourceUrl)});
    $('camera-reset').onclick=()=>{
      camera.alpha=-Math.PI/2;camera.beta=1.18;camera.radius=12;
      camera.setTarget(new Vector3(0,1.5,0));say('Câmera restaurada');
    };
    if(new URLSearchParams(location.search).has('qa')){
      window.__danceQa=Object.freeze({snapshot:()=>({
        ready:!scene.isDisposed(),cast:dancers.length,formation:activeForm,
        beat:clock*Number(bpmEl.value)/60,meshCount:scene.meshes.length,
        audioActive:!media.paused, reduced:reduced.checked,
        dancers:dancers.map(d=>({id:d.id,x:d.root.position.x,z:d.root.position.z}))
      })});
    }
  }catch(e){
    errorState=true;
    console.error('Jazz e Metais: falha no palco Babylon',e);
    try { if(engine) engine.dispose(); } catch {}
    // Canvas cannot switch from WebGL to 2D without replacing the element.
    const original=$('dance-stage'),replacement=original.cloneNode(false);
    original.replaceWith(replacement);
    import('./dance-fallback.js').catch(fallbackError=>{
      console.error('Fallback Canvas2D indisponível',fallbackError);
      $('scene-error').hidden=false;
    });
  }
}
$('transport').addEventListener('click',()=>{
  playing=!playing;
  $('transport').setAttribute('aria-pressed',String(playing));
  $('transport').textContent=playing?'Pausar dança':'Retomar dança';
  if(!playing&&!media.paused)media.pause();
  lastTime=performance.now();
  say(playing?'Coreografia retomada':'Coreografia pausada');
  updateMusicLabel();
});
formationEl.addEventListener('change',()=>{
  previousForm=activeForm;
  formationChangeAt=clock;
  const labels={auto:'Coreografia automática',trio:'Trio',pares:'Dueto e solista',
    roda:'Roda',linha:'Linha Charleston',troca:'Troca de posições'};
  say(labels[formationEl.value]||'Formação alterada');
});
intensity.addEventListener('input',()=>{$('intensity-output').textContent=intensity.value+'%'});
bpmEl.addEventListener('input',()=>{
  $('bpm-output').textContent=bpmEl.value+' BPM';cues.bpm=Number(bpmEl.value);
});
$('audio-file').addEventListener('change',e=>{
  const file=e.target.files?.[0];
  if(!file)return;
  if(sourceUrl)URL.revokeObjectURL(sourceUrl);
  sourceUrl=URL.createObjectURL(file);
  media.pause();media.src=sourceUrl;media.load();
  clip=file;$('audio-play').disabled=false;
  clock=0;lastCueFormation=null;updateMusicLabel();say('Faixa '+file.name+' carregada; clique para reproduzir');
});
$('cues-file').addEventListener('change',async e=>{
  const file=e.target.files?.[0];if(!file)return;
  try{
    cues=normalizeCueSheet(JSON.parse(await file.text()));lastCueFormation=null;
    bpmEl.value=String(Math.round(cues.bpm));
    $('bpm-output').textContent=bpmEl.value+' BPM';
    say('Marcadores carregados: '+cues.events.length+', '+cues.bpm+' BPM');
  }catch(err){say('Erro nos marcadores: '+err.message)}
});
$('audio-play').addEventListener('click',async()=>{
  if(!media.src)return;
  if(!media.paused){media.pause();updateMusicLabel();return}
  try{
    if(!ctx){
      ctx=new (window.AudioContext||window.webkitAudioContext)();
      analyser=ctx.createAnalyser();
      analyser.fftSize=256;
      ctx.createMediaElementSource(media).connect(analyser);
      analyser.connect(ctx.destination);
    }
    await ctx.resume();
    playing=true;$('transport').textContent='Pausar dança';
    $('transport').setAttribute('aria-pressed','true');
    await media.play();updateMusicLabel();say('Faixa em reprodução');
  }catch(error){say('Não foi possível reproduzir a faixa: '+error.message)}
});
media.addEventListener('ended',()=>{media.pause();updateMusicLabel();say('Faixa encerrada')});
reduced.addEventListener('change',()=>say(reduced.checked?'Movimento reduzido ativado':'Movimento reduzido desativado'));
$('fullscreen').addEventListener('click',async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();
    else await $('club').requestFullscreen();
  }catch{say('Tela inteira indisponível neste navegador')}
});
document.addEventListener('keydown',e=>{
  if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;
  if(e.code==='Space'){e.preventDefault();$('transport').click()}
  else if(e.key==='r'||e.key==='R')$('camera-reset').click();
  else if('12345'.includes(e.key)&&e.key.length===1){
    const key=['trio','pares','roda','linha','troca'][Number(e.key)-1];
    if(key){formationEl.value=key;formationEl.dispatchEvent(new Event('change'))}
  }
});
init();
