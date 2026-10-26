import {
  Engine, Scene, ArcRotateCamera, HemisphericLight,
  DirectionalLight, Vector3, Color4, SceneLoader
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

const canvas=document.getElementById('stage');
const status=document.getElementById('state');
const engine=new Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true},true);
const scene=new Scene(engine);
scene.clearColor=new Color4(242/255,241/255,236/255,1);

const camera=new ArcRotateCamera('SILM_camera',-Math.PI/2,Math.PI/2.02,7,
                                Vector3.Zero(),scene);
camera.lowerRadiusLimit=4.2;
camera.upperRadiusLimit=15;
camera.wheelPrecision=45;
camera.attachControl(canvas,true);

const ambient=new HemisphericLight('SILM_soft_fill',new Vector3(0,1,0),scene);
ambient.intensity=1.4;
const key=new DirectionalLight('SILM_gold_key',new Vector3(-.5,-.5,.7),scene);
key.intensity=1.15;

let groups=[];
let cameraOrbit=false;
let modelReady=false;

function showStatus(message){
  status.textContent=message;
}
function staticFrame(){
  if(!modelReady)return;
  for(const group of groups){
    group.start(false,1);
    group.goToFrame(group.to);
    group.pause();
  }
  showStatus('Quadro final 3D para comparação com o SVG oficial.');
}
function restart(){
  if(!modelReady)return;
  for(const group of groups){
    group.stop();
    group.reset();
    group.start(false,1);
  }
  showStatus('Reproduzindo sequência 3D (estudo não homologado).');
}

document.getElementById('restart').addEventListener('click',restart);
document.getElementById('skip').addEventListener('click',staticFrame);
document.getElementById('orbit').addEventListener('click',()=>{
  cameraOrbit=!cameraOrbit;
  showStatus(cameraOrbit?'Rotação suave para inspecionar o volume.':'Câmera fixa.');
});

async function load(){
  try {
    const container=await SceneLoader.LoadAssetContainerAsync('./assets/','silm-opening.glb',scene);
    container.addAllToScene();
    groups=container.animationGroups;
    if(groups.length===0)throw new Error('GLB sem animationGroups: verificar exportação Blender');
    modelReady=true;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      staticFrame();
    }else{
      restart();
    }
  }catch(error){
    console.error(error);
    showStatus('Falha ao carregar GLB: '+(error?.message||error));
  }
}
scene.onBeforeRenderObservable.add(()=>{
  if(cameraOrbit && modelReady){
    camera.alpha+=engine.getDeltaTime()*.00010;
  }
});
engine.runRenderLoop(()=>scene.render());
window.addEventListener('resize',()=>engine.resize());
load();
