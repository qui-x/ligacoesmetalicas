import {
  Engine, Scene, ArcRotateCamera, Vector3, Vector2, Color3, Color4,
  HemisphericLight, PointLight, MeshBuilder, PBRMaterial,
  Quaternion, SceneLoader
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import './style.css';

const canvas = document.querySelector('#stage');
const status = document.querySelector('#status');
const fallback = document.querySelector('#fallback');
const enabled = document.querySelector('#motion-enabled');
const motionButtons = [...document.querySelectorAll('[data-motion]')];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
if (reduced.matches) enabled.checked = false;
let motion = 'idle';
let scene, engine, camera, controls, morphs = [];
let tick = 0;
const bases = new WeakMap();

function announce(message) { status.textContent = message; }

function material(name, hex, metallic = 0, roughness = .8) {
  const m = new PBRMaterial(name, scene);
  m.albedoColor = Color3.FromHexString(hex);
  m.metallic = metallic;
  m.roughness = roughness;
  return m;
}
function decoBox(name, width, height, depth, x, y, z, m) {
  const box = MeshBuilder.CreateBox(name, { width, height, depth }, scene);
  box.position.set(x,y,z);
  box.material = m;
  box.isPickable = false;
  return box;
}
function createSet() {
  const floor = material('Stage dark walnut','#3b2928',.05,.64);
  const velvet = material('burgundy curtain','#491925',0,.92);
  const brass = material('old brass','#b58a41',.78,.32);
  const smoke = material('dark backdrop','#25202a',0,.9);
  decoBox('stage-floor',11,.16,8,0,-.12,0,floor);
  decoBox('upstage-wall',12,5,.18,0,2.1,2.6,smoke);
  for (const side of [-1,1]) {
    decoBox('curtain',1.25,5,.3,side*5.35,2.2,2.25,velvet);
    decoBox('curtain-gold-border',.08,5,.16,side*4.7,2.2,2.01,brass);
    const pillar=MeshBuilder.CreateCylinder('ArtDeco-pillar',{height:4,diameterTop:.38,diameterBottom:.50,tessellation:12},scene);
    pillar.material=brass;pillar.position.set(side*4.1,1.9,2.2);
  }
  for (let k=-4;k<=4;k++) {
    decoBox('stage-floor-stripe',.014,.005,7.4,k*.78,-.032,0,brass);
  }
  // Low-poly scenery is an original staging aid, not part of Sommerfeld's portrait.
  const chairWood = material('carved-walnut','#593628',.1,.66);
  const chairVelvet = material('velvet-seat','#682733',0,.91);
  decoBox('chair-seat',.86,.13,.78,0,.54,.08,chairVelvet);
  decoBox('chair-back',.86,.97,.14,0,1.04,.49,chairWood);
  for(const x of [-.34,.34]) for(const z of [-.22,.39])
    decoBox('chair-leg',.065,.56,.08,x,.28,z,chairWood);
  const roundTop=MeshBuilder.CreateCylinder('table-top',{height:.08,diameter:1.05,tessellation:48},scene);
  roundTop.position.set(1.05,.78,-.06);roundTop.material=chairWood;
  const tableLeg=MeshBuilder.CreateCylinder('table-leg',{height:.68,diameter:.075,tessellation:16},scene);
  tableLeg.position.set(1.05,.43,-.06);tableLeg.material=brass;
  decoBox('book-small',.24,.03,.17,1.04,.842,-.03,smoke);
  const bulb=MeshBuilder.CreateSphere('set-practical-lamp',{diameter:.11,segments:12},scene);
  bulb.position.set(1.38,.9,-.12);bulb.material=brass;
}
function remember(node) {
  if (!node) return;
  if (!bases.has(node)) bases.set(node,(node.rotationQuaternion || Quaternion.Identity()).clone());
}
function rotate(node, yaw=0,pitch=0,roll=0) {
  if (!node) return;
  remember(node);
  node.rotationQuaternion=bases.get(node).multiply(Quaternion.RotationYawPitchRoll(yaw,pitch,roll));
}
function selectMotion(next) {
  motion=next;
  for (const b of motionButtons) b.setAttribute('aria-pressed',String(b.dataset.motion===next));
  const names={idle:'Respiração discreta',observe:'Observando o palco',notes:'Consultando anotações',applause:'Aplausos discretos'};
  announce('Sommerfeld · '+names[motion]+(enabled.checked?'':' · movimento pausado'));
}
function changeCamera(type) {
  const plans={
    portrait: {alpha:-Math.PI/2+.12,beta:1.33,radius:1.56,target:new Vector3(0,1.72,0)},
    full: {alpha:-Math.PI/2+.3,beta:1.34,radius:4.05,target:new Vector3(0,1.05,0)},
    reset: {alpha:-Math.PI/2+.24,beta:1.27,radius:3.15,target:new Vector3(0,1.34,0)}
  };
  const plan=plans[type] || plans.reset;
  camera.alpha=plan.alpha; camera.beta=plan.beta;camera.radius=plan.radius;
  camera.setTarget(plan.target);
}
function animation(now) {
  if (!controls) return;
  const {head,leftUpper,rightUpper,leftFore,rightFore} = controls;
  const play=enabled.checked && !reduced.matches;
  if (play) tick+=Math.min(now/1000,.07);
  const t=tick;
  let yaw=0,pitch=0;
  if (play) {
    if (motion==='idle'){yaw=Math.sin(t*.6)*.044;pitch=Math.sin(t*.94)*.017;}
    if (motion==='observe'){yaw=.12+Math.sin(t*.58)*.12;pitch=-.037+Math.sin(t*.74)*.027;}
    if (motion==='notes'){yaw=.025+Math.sin(t*.3)*.018;pitch=.11+Math.sin(t*1.25)*.024;}
    if (motion==='applause'){yaw=Math.sin(t*.7)*.08;pitch=-.025;}
  }
  rotate(head,yaw,pitch);
  if(play && motion==='notes'){
    rotate(leftUpper,-.12,.12,-.10);rotate(rightUpper,.03,-.06,.06);
    rotate(leftFore,.12,.19+Math.sin(t*3.2)*.08,.09);
    rotate(rightFore,-.06,-.12,0);
  } else if(play && motion==='applause') {
    const wave=Math.sin(t*6)*.16;
    rotate(leftUpper,.05,.08,.07);rotate(rightUpper,-.05,-.08,-.07);
    rotate(leftFore,.36+wave,.27,.12);
    rotate(rightFore,-.36-wave,-.27,-.12);
  } else {
    rotate(leftUpper,0,0,0);rotate(rightUpper,0,0,0);
    rotate(leftFore,0,0,0);rotate(rightFore,0,0,0);
  }
  // If the imported GLB preserves morphs, animate eyelids without exaggerating.
  const blink=play?Math.exp(-Math.pow(((t%4.15)-1.4)/.055,2)):.0;
  for (const mt of morphs) {
    if (/Blink_[LR]/i.test(mt.name)) mt.influence=blink;
    else if (/BrowRaise/i.test(mt.name)) mt.influence=(play && motion==='observe') ? 0.10 : 0;
    else if (/Smile/i.test(mt.name)) mt.influence=(play && motion==='applause') ? 0.18 : 0;
  }
}
async function initialize() {
  try {
    engine=new Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,antialias:true});
    engine.setHardwareScalingLevel(window.devicePixelRatio>1.5?1.35:1);
    scene=new Scene(engine);
    scene.clearColor=new Color4(.075,.065,.085,1);
    scene.ambientColor=new Color3(.30,.26,.25);
    scene.imageProcessingConfiguration.contrast=1.18;
    scene.imageProcessingConfiguration.exposure=1.23;
    camera=new ArcRotateCamera('audience-camera',-Math.PI/2+.24,1.27,3.15,new Vector3(0,1.34,0),scene);
    camera.lowerRadiusLimit=1.0;camera.upperRadiusLimit=7.5;
    camera.lowerBetaLimit=.30;camera.upperBetaLimit=1.7;
    camera.wheelDeltaPercentage=.01;
    camera.pinchDeltaPercentage=.01;
    camera.attachControl(canvas,true);
    const hemi=new HemisphericLight('ambient',new Vector3(0,1,0),scene);
    hemi.intensity=.48;hemi.diffuse=new Color3(.63,.70,.86);
    const key=new PointLight('warm key',new Vector3(-1.6,3.3,-1.8),scene);
    key.intensity=7;key.diffuse=new Color3(1,.73,.42);
    const rim=new PointLight('rim',new Vector3(1.2,2.6,2.15),scene);
    rim.intensity=4.5;rim.diffuse=new Color3(.35,.62,.81);
    createSet();
    announce('Carregando estudo 3D…');
    const imported=await SceneLoader.ImportMeshAsync('', './assets/', 'sommerfeld-study.glb',scene);
    const all=[...imported.meshes,...imported.transformNodes];
    const match=name=>all.find(n=>n.name===name);
    controls={
      head:match('HEAD_ANCHOR'),
      leftUpper:match('ARM_L_UPPER'),rightUpper:match('ARM_R_UPPER'),
      leftFore:match('ARM_L_FORE'),rightFore:match('ARM_R_FORE')
    };
    if (!controls.head) throw new Error('Controlador HEAD_ANCHOR não encontrado no GLB.');
    for(const node of Object.values(controls)) remember(node);
    for(const object of imported.meshes) {
      const manager=object.morphTargetManager;
      if (manager) for(let i=0;i<manager.numTargets;i++) morphs.push(manager.getTarget(i));
    }
    announce('Sommerfeld carregado · arraste para girar a câmera');
    let previous=performance.now();
    engine.runRenderLoop(()=>{
      if(document.visibilityState==='hidden') return;
      const current=performance.now();
      animation(current-previous);
      previous=current;
      scene.render();
    });
    window.addEventListener('resize',()=>engine.resize());
    document.addEventListener('visibilitychange',()=>{if(!document.hidden) engine.resize();});
  } catch(error){
    console.error('Falha no estudo Sommerfeld:',error);
    announce('Não foi possível iniciar o estudo 3D');
    fallback.hidden=false;
    if(engine) engine.dispose();
  }
}
motionButtons.forEach(button=>button.addEventListener('click',()=>selectMotion(button.dataset.motion)));
document.querySelectorAll('[data-camera]').forEach(button=>button.addEventListener('click',()=>changeCamera(button.dataset.camera)));
document.querySelector('#reset-camera').addEventListener('click',()=>changeCamera('reset'));
enabled.addEventListener('change',()=>selectMotion(motion));
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelector('#back').focus();});
window.addEventListener('pagehide',()=>{if(engine)engine.dispose();});
initialize();
