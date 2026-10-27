/* Physical 1925 music cabinet; Blender GLB mesh is authoritative.
   Fallback meshes are used only until that GLB can be exported/loaded.
   The real screen is a material applied ON the Blender-authored mesh.
*/
export async function buildJukeboxInScene(scene,canvas,library){
  const B=window.BABYLON;
  const {MeshBuilder,TransformNode,Vector3,StandardMaterial,Color3,DynamicTexture,SceneLoader}=B;
  const root=new TransformNode('Jazz1925Jukebox',scene);
  root.position.set(4.65,0,3.2);
  const camera=scene.activeCamera;
  const savedCamera=camera?{
    alpha:camera.alpha,beta:camera.beta,radius:camera.radius,
    target:camera.target.clone()
  }:null;
  let focused=false,cameraDestination=null;
  const cameraObserver=scene.onBeforeRenderObservable.add(()=>{
    if(!camera||!cameraDestination)return;
    const t=Math.min(.22,scene.getEngine().getDeltaTime()/220);
    camera.alpha+=(cameraDestination.alpha-camera.alpha)*t;
    camera.beta+=(cameraDestination.beta-camera.beta)*t;
    camera.radius+=(cameraDestination.radius-camera.radius)*t;
    const next=Vector3.Lerp(camera.target,cameraDestination.target,t);
    camera.setTarget(next);
    if(Math.abs(camera.radius-cameraDestination.radius)<.006 &&
       Vector3.Distance(camera.target,cameraDestination.target)<.009)
      cameraDestination=null;
  });
  function focus(){
    if(!camera)return;
    focused=true;
    cameraDestination={
      alpha:-Math.PI/2,beta:1.32,radius:3.7,
      target:new Vector3(root.position.x,1.7,root.position.z)
    };
    document.querySelector('#jukebox-scene-open').textContent='Inspecionando o fonógrafo';
  }
  function restoreCamera(){
    focused=false;
    if(savedCamera)cameraDestination={...savedCamera};
    document.querySelector('#jukebox-scene-open').textContent='Ver visor no fonógrafo';
  }
  library.registerSceneFocus(()=>focused?restoreCamera():focus());
  const wood=new StandardMaterial('CabinetFallbackMahogany',scene);
  wood.diffuseColor=Color3.FromHexString('#542b1d');wood.specularColor=Color3.FromHexString('#825332');
  const brass=new StandardMaterial('CabinetFallbackBrass',scene);
  brass.diffuseColor=Color3.FromHexString('#c1a06a');
  const black=new StandardMaterial('CabinetFallbackBlack',scene);
  black.diffuseColor=Color3.FromHexString('#201b1a');
  const discTexture=new DynamicTexture('Jukebox1925RealDisplay',{width:1024,height:1024},scene,false);
  discTexture.hasAlpha=false;
  const screenMaterial=new StandardMaterial('Jukebox1925SelectionPaper',scene);
  screenMaterial.diffuseTexture=discTexture;
  screenMaterial.emissiveTexture=discTexture;
  screenMaterial.emissiveColor=Color3.FromHexString('#545047');
  screenMaterial.backFaceCulling=false;
  let page=0,visible=[],screen=null,usingBlender=false;
  const fallback=[];
  const box=(name,size,pos,mat)=>{
    const m=MeshBuilder.CreateBox(name,{width:size[0],height:size[1],depth:size[2]},scene);
    m.parent=root;m.position.set(...pos);m.material=mat;m.isPickable=true;
    fallback.push(m);return m;
  };
  box('JB_CABINET_FALLBACK_1925',[1.55,2.82,.83],[0,1.46,0],wood);
  box('JB_BRASS_FRAME_FALLBACK_1925',[1.25,1.43,.12],[0,1.96,-.47],brass);
  box('JB_LOWER_PANEL_FALLBACK_1925',[1.15,.48,.09],[0,.67,-.465],black);
  box('JB_CONTROLS_FALLBACK_1925',[1.10,.24,.10],[0,1.07,-.48],brass);
  box('JB_ROOF_FALLBACK_1925',[1.66,.19,1.00],[0,2.88,0],brass);
  for(const [name,x] of [['JB_PREV_1925',-.40],['JB_PLAY_1925',0],['JB_NEXT_1925',.40]]){
    const key=MeshBuilder.CreateCylinder(name,{diameter:.145,height:.09,tessellation:20},scene);
    key.parent=root;key.position.set(x,1.04,-.59);key.rotation.x=Math.PI/2;
    key.material=brass;key.isPickable=true;fallback.push(key);
  }
  screen=MeshBuilder.CreatePlane('JB_SELECTION_WINDOW_1925',{width:1.08,height:1.26},scene);
  screen.parent=root;screen.position.set(0,1.96,-.55);
  screen.material=screenMaterial;screen.isPickable=true;fallback.push(screen);
  const titleCanvas=discTexture.getContext();
  function draw(){
    const c=titleCanvas,w=1024,h=1024;
    c.fillStyle='#e9d7b2';c.fillRect(0,0,w,h);
    c.fillStyle='#9a7951';c.fillRect(16,16,w-32,h-32);
    c.fillStyle='#f5e5c4';c.fillRect(28,28,w-56,h-56);
    c.strokeStyle='#775130';c.lineWidth=8;c.strokeRect(40,40,w-80,h-80);
    c.textAlign='center';c.fillStyle='#503522';
    c.font='bold 47px Georgia,serif';c.fillText('JAZZ & METAIS',512,107);
    c.font='24px Georgia,serif';c.fillText('GABINETE MUSICAL • ANNO 1925',512,152);
    c.fillStyle='#765535';c.fillRect(64,180,w-128,3);
    const items=library.state().tracks;
    page=Math.max(0,Math.min(Math.max(0,Math.ceil(items.length/5)-1),page));
    visible=items.slice(page*5,page*5+5);
    for(let i=0;i<5;i++){
      const y=216+i*122;
      c.fillStyle=i%2?'#e3cca2':'#f1e0bc';
      c.fillRect(62,y,900,110);
      const item=visible[i];if(!item)continue;
      const selected=library.state().selected===item.number;
      if(selected){c.fillStyle='#ad8850';c.fillRect(63,y,896,110);}
      c.fillStyle=selected?'#fff9e7':'#6b3e25';
      c.textAlign='left';c.font='bold 31px Georgia,serif';
      c.fillText(String(item.number).padStart(2,'0'),89,y+66);
      c.font='bold 29px Georgia,serif';
      let title=item.title;
      if(title.length>31)title=title.slice(0,29)+'…';
      c.fillText(title,171,y+52);
      c.font='22px Georgia,serif';
      c.fillText(item.bpm+' BPM · '+(item.collection.length>27?item.collection.slice(0,25)+'…':item.collection),171,y+84);
    }
    c.fillStyle='#67472e';c.fillRect(64,852,896,3);
    c.fillStyle='#553622';c.textAlign='center';c.font='bold 29px Georgia,serif';
    c.fillText('◀    PÁGINA '+(page+1)+' / '+Math.max(1,Math.ceil(items.length/5))+'    ▶',512,917);
    c.font='22px Georgia,serif';c.fillText('CLIQUE NO DISCO PARA TOCAR',512,957);
    discTexture.update(false);
  }
  draw();
  const redraw=()=>draw();
  document.addEventListener('jazz:jukebox:ready',redraw);
  document.addEventListener('jazz:jukebox:select',e=>{
    if(e.detail?.trackNumber)page=Math.floor((Number(e.detail.trackNumber)-1)/5);
    draw();
  });
  async function selectFromGlass(pick){
    const uv=pick.getTextureCoordinates?.();
    if(!uv){library.open();return}
    const top=(1-uv.y)*1024;
    if(top>=853){
      if(uv.x<.5)page=(page-1+Math.max(1,Math.ceil(library.state().tracks.length/5)))%
        Math.max(1,Math.ceil(library.state().tracks.length/5));
      else page=(page+1)%Math.max(1,Math.ceil(library.state().tracks.length/5));
      draw();return;
    }
    if(top<204){library.open();return}
    const idx=Math.floor((top-204)/122);
    const item=visible[idx];if(!item){library.open();return}
    try{await library.select(item.number,{play:true})}
    catch(error){console.warn('Jukebox não conseguiu selecionar disco:',error);library.open();}
  }
  function selectRelative(delta){
    const collection=library.state().tracks;
    if(!collection.length)return;
    const index=collection.findIndex(t=>t.number===library.state().selected);
    const selected=collection[((index<0?0:index)+delta+collection.length)%collection.length];
    library.select(selected.number,{play:true}).catch(error=>console.warn('Jukebox:',error));
  }
  const pointerObserver=scene.onPointerObservable.add(info=>{
    if(info.type!==B.PointerEventTypes.POINTERPICK)return;
    const pick=info.pickInfo;
    if(!pick?.hit||!pick.pickedMesh)return;
    let mesh=pick.pickedMesh;
    while(mesh&&mesh!==root){
      if(mesh.name.startsWith('JB_')&&!focused){focus();return}
      if(mesh===screen||mesh.name.includes('JB_SELECTION_WINDOW')){selectFromGlass(pick);return}
      if(mesh.name.startsWith('JB_PREV')){selectRelative(-1);return}
      if(mesh.name.startsWith('JB_NEXT')){selectRelative(1);return}
      if(mesh.name.startsWith('JB_PLAY')){document.querySelector('#audio-play').click();return}
      if(mesh.name.startsWith('JB_')||mesh.name.includes('Jukebox')){library.open();return}
      mesh=mesh.parent;
    }
  },B.PointerEventTypes.POINTERPICK);
  // Blender-generated cabinet, when available, replaces the placeholder,
  // while the same DynamicTexture remains bound to the physical glass mesh.
  try{
    const loaded=await SceneLoader.ImportMeshAsync('','./assets/','jukebox-1925.glb',scene);
    const glass=loaded.meshes.find(m=>m.name==='JB_SELECTION_WINDOW_1925');
    if(!glass)throw new Error('Modelo sem visor físico selecionável');
    // Blender Z-up is converted to glTF Y-up, but Blender's negative Y
    // (cabinet front) becomes positive glTF Z. Rotate 180° to face the stage.
    const blenderRoot=new TransformNode('JB_BLENDER_ORIENTATION_1925',scene);
    blenderRoot.parent=root;blenderRoot.rotation.y=Math.PI;
    for(const m of loaded.meshes)if(!m.parent)m.parent=blenderRoot;
    glass.material=screenMaterial;glass.isPickable=true;
    loaded.meshes.forEach(m=>{if(m.name.startsWith('JB_'))m.isPickable=true});
    fallback.forEach(m=>m.dispose());
    screen=glass;usingBlender=true;
    console.info('Jukebox 1925: malha original Blender carregada');
  }catch(error){
    console.info('Jukebox Blender GLB indisponível; gabinete 3D provisório ativo:',error.message);
  }
  return {root,draw,isBlenderModel:()=>usingBlender,
    focus,restoreCamera,
    dispose:()=>{scene.onPointerObservable.remove(pointerObserver);
      scene.onBeforeRenderObservable.remove(cameraObserver);
      document.removeEventListener('jazz:jukebox:ready',redraw);root.dispose()}};
}
