/* Jazz e Metais / compatibilidade 2D: música e coreografia sem WebGL.
   Somente provisório; não representa o motor 3D Babylon. */
import {PERFORMERS,danceFrame,normalizeCueSheet} from './dance-core.js';
import {loadBuiltinTrack,releaseBuiltinTrack,BUILTIN_TRACK_NAME} from './builtin-track.js';
const $=id=>document.getElementById(id),canvas=$('dance-stage');
const ctx=canvas.getContext('2d');
if(!ctx){$('scene-error').hidden=false;throw new Error('Canvas indisponível');}
const media=$('audio-player');media.preload='metadata';
media.addEventListener('seeked',()=>{t=media.currentTime});
media.addEventListener('play',()=>{$('audio-play').textContent='Pausar faixa'});
media.addEventListener('pause',()=>{$('audio-play').textContent='Reproduzir faixa'});
let url=null,cues={bpm:120,beatOffset:0,events:[]},t=0,playing=true,last=performance.now();
const reduce=$('reduce-motion');reduce.checked=matchMedia('(prefers-reduced-motion: reduce)').matches;
$('scene-error').hidden=true;
$('music-state').textContent='Visualização de compatibilidade 2D';
const notes={trio:'Trio de abertura',pares:'Dueto e solista',roda:'Roda de jazz',linha:'Linha Charleston',troca:'Troca de parceiros'};
let form='';
let pan=0,drag=false,lastX=0;
function updateCanvas(){
  const w=Math.max(320,canvas.clientWidth),h=Math.max(300,canvas.clientHeight);
  const ratio=Math.min(devicePixelRatio||1,2);
  if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){canvas.width=w*ratio;canvas.height=h*ratio;}
  ctx.setTransform(ratio,0,0,ratio,0,0);
  return [w,h];
}
function draw(now){
  const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;
  if(playing)t=media.src&&!media.paused?media.currentTime:t+dt;
  const bpm=Number($('bpm').value),silent=reduce.checked;
  const result=danceFrame({seconds:silent?0:t,bpm,
    beatOffset:cues.beatOffset,formation:$('formation').value,
    intensity:Number($('intensity').value)/100,reduced:silent});
  if(form!==result.formation){form=result.formation;$('form-title').textContent=notes[form]||'Espetáculo coletivo'}
  const [w,h]=updateCanvas(),cx=w*.49,cy=h*.54,scale=Math.min(w/12,h/8,82);
  const project=(x,z)=>({x:cx+(x*Math.cos(pan)-z*Math.sin(pan))*scale,
    y:cy+(x*Math.sin(pan)+z*Math.cos(pan))*scale*.30});
  const bg=ctx.createLinearGradient(0,0,0,h);
  bg.addColorStop(0,'#201c2b');bg.addColorStop(.62,'#55323c');bg.addColorStop(1,'#241b20');
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='#c5a66b4d';ctx.lineWidth=1;
  for(let i=-9;i<=9;i++){const a=project(i,-8),b=project(i,8);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  for(let i=-8;i<=8;i++){const a=project(-9,i),b=project(9,i);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  const sorted=[...result.cast].sort((a,b)=>a.z-b.z);
  sorted.forEach((pose)=>{
    const p=PERFORMERS.find(d=>d.id===pose.id);
    const pos=project(pose.x,pose.z),s=Math.max(.65,Math.min(1.1,scale/59)),height=122*s;
    ctx.save();ctx.translate(pos.x,pos.y);ctx.rotate(-pose.torsoRoll*.12);
    ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,8,22*s,6*s,0,0,Math.PI*2);ctx.fill();
    ctx.lineWidth=10*s;ctx.lineCap='round';ctx.strokeStyle=p.costume;
    for(const [side,angle] of [[-1,pose.leftKnee],[1,pose.rightKnee]]){
      ctx.beginPath();ctx.moveTo(side*11*s,-27*s);ctx.lineTo(side*(13+angle*7)*s,-2*s);ctx.stroke();}
    ctx.fillStyle=p.costume;ctx.beginPath();ctx.roundRect(-22*s,-86*s,44*s,60*s,9*s);ctx.fill();
    ctx.strokeStyle=p.accent;ctx.lineWidth=3*s;ctx.strokeRect(-17*s,-76*s,34*s,43*s);
    for(const [side,angle] of [[-1,pose.leftArm],[1,pose.rightArm]]){
      ctx.strokeStyle=p.costume;ctx.lineWidth=10*s;ctx.beginPath();ctx.moveTo(side*20*s,-75*s);
      ctx.lineTo(side*(36+angle*12)*s,-47*s+angle*18*s);ctx.stroke();
      ctx.fillStyle='#d9b69b';ctx.beginPath();
      ctx.arc(side*(36+angle*12)*s,-47*s+angle*18*s,5*s,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#cda88d';ctx.beginPath();ctx.ellipse(0,-108*s-pose.headYaw*5*s,17*s,20*s,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#30282b';ctx.beginPath();ctx.ellipse(0,-121*s,17*s,8*s,0,Math.PI,Math.PI*2);ctx.fill();
    ctx.fillStyle='#f4d49a';ctx.font=`600 ${12*s}px system-ui`;ctx.textAlign='center';
    ctx.fillText(p.name,0,25*s);ctx.fillStyle=p.accent;ctx.fillText(p.structure,0,39*s);
    ctx.restore();
  });
  $('beat-status').textContent=`${bpm} BPM · compasso ${Math.floor(result.beat/4)+1} · ${form}`;
  requestAnimationFrame(draw);
}
$('formation').addEventListener('change',()=>{$('announcer').textContent='Formação: '+($('formation').selectedOptions[0]?.text||'')});
$('intensity').addEventListener('input',()=>{$('intensity-output').textContent=$('intensity').value+'%'});
$('bpm').addEventListener('input',()=>{$('bpm-output').textContent=$('bpm').value+' BPM'});
$('transport').addEventListener('click',()=>{
  playing=!playing;$('transport').textContent=playing?'Pausar dança':'Retomar dança';
  $('transport').setAttribute('aria-pressed',String(playing));if(!playing)media.pause();
});
$('builtin-track').addEventListener('click',async()=>{
  const button=$('builtin-track'),label=$('builtin-track-status');
  button.disabled=true;label.textContent='Preparando a faixa original…';
  try{
    const track=await loadBuiltinTrack((loaded,total)=>{
      label.textContent='Carregando música: '+Math.round(loaded*100/total)+'%';
    });
    media.pause();
    if(url){URL.revokeObjectURL(url);url=null;}
    media.src=track.objectUrl;media.load();
    cues=normalizeCueSheet(track.cues);
    $('bpm').value=String(cues.bpm);$('bpm').dispatchEvent(new Event('input'));
    t=0;$('audio-play').disabled=false;
    $('music-state').textContent=BUILTIN_TRACK_NAME+' · pronta para reproduzir';
    label.textContent='MP3 da coleção · 2min13s · 132 BPM · pronto para reproduzir';
    $('announcer').textContent='O Baile dos Elétrons carregado. Clique em Reproduzir faixa.';
  }catch(error){
    label.textContent='Falha ao carregar a faixa: '+error.message;
    $('announcer').textContent=label.textContent;console.error(error);
  }finally{button.disabled=false;}
});
$('audio-file').addEventListener('change',e=>{
  const f=e.target.files?.[0];if(!f)return;
  if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(f);
  media.pause();media.src=url;media.load();
  $('audio-play').disabled=false;$('music-state').textContent=f.name+' · pronto para reproduzir';
});
$('audio-play').addEventListener('click',async()=>{
  try{
    if(media.paused){playing=true;await media.play();$('audio-play').textContent='Pausar faixa'}
    else{media.pause();$('audio-play').textContent='Reproduzir faixa'}
  }catch(e){$('announcer').textContent='Não foi possível tocar a faixa: '+e.message}
});
$('cues-file').addEventListener('change',async e=>{
  try{const f=e.target.files?.[0];if(!f)return;cues=normalizeCueSheet(JSON.parse(await f.text()));
    $('bpm').value=cues.bpm;$('bpm').dispatchEvent(new Event('input'));$('announcer').textContent='Marcadores carregados';}
  catch(e){$('announcer').textContent='Arquivo de marcadores inválido: '+e.message}
});
$('camera-reset').addEventListener('click',()=>{pan=0});
$('fullscreen').addEventListener('click',async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();
    else await $('club').requestFullscreen();}catch(e){$('announcer').textContent='Tela inteira indisponível'}
});
canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(drag){pan+=(e.clientX-lastX)*.007;lastX=e.clientX}});
canvas.addEventListener('pointerup',()=>drag=false);
window.addEventListener('pagehide',()=>{if(url)URL.revokeObjectURL(url);releaseBuiltinTrack()});
document.addEventListener('keydown',e=>{
  if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;
  if(e.code==='Space'){e.preventDefault();$('transport').click();}
  else if(e.key==='r'||e.key==='R')$('camera-reset').click();
  else if('12345'.includes(e.key)&&e.key.length===1){
    $('formation').value=['trio','pares','roda','linha','troca'][Number(e.key)-1];
    $('formation').dispatchEvent(new Event('change'));}
});
requestAnimationFrame(draw);
