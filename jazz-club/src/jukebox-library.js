/* Jukebox 1925 — player/catalogue shared by Babylon and fallback 2D.
   Audio is never autoplayed on page load. User choice can start playback. */
import {CATALOGUE_PATH,catalogueEntries,cuesForTrack,num} from './jukebox-core.js';
const $=id=>document.getElementById(id);
const catalogueURL=new URL(CATALOGUE_PATH,new URL('../',import.meta.url));
export function initializeJukebox({media,onSelected,onAnnounce=()=>{}}){
  const drawer=$('jukebox-drawer'),list=$('jukebox-list'),filter=$('jukebox-filter');
  const group=$('jukebox-collection'),now=$('jukebox-current-title');
  const badge=$('jukebox-count'),status=$('jukebox-status'),indicator=$('jukebox-mini-title');
  const play=$('audio-play'),volume=$('jukebox-volume'),toggle=$('jukebox-toggle');
  let tracks=[],active=null,request=0,open=false,focusBefore=null,focusSceneFn=null;
  let triedOgg=false,requestedPlayback=false;
  media.volume=Number(volume.value)/100;
  const tell=value=>{status.textContent=value;onAnnounce(value)};
  const emit=(type,detail)=>document.dispatchEvent(new CustomEvent('jazz:jukebox:'+type,{detail}));
  const state=()=>({tracks:tracks.map(t=>({number:t.number,title:t.title,bpm:t.bpm,collection:t.collection})),
    selected:active?.number??null,playing:!media.paused,open});
  function setOpen(next){
    open=!!next;drawer.hidden=!open;toggle.setAttribute('aria-expanded',String(open));
    $('jukebox-scene-open').setAttribute('aria-expanded',String(open));
    if(open){focusBefore=document.activeElement;filter.focus();}else if(focusBefore?.focus)focusBefore.focus();
    emit('open',{open});
  }
  toggle.addEventListener('click',()=>setOpen(!open));
  $('jukebox-scene-open').addEventListener('click',()=>{if(focusSceneFn)focusSceneFn();else setOpen(true)});
  $('jukebox-close').addEventListener('click',()=>setOpen(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open){e.preventDefault();setOpen(false)}});
  function render(){
    const text=filter.value.toLocaleLowerCase('pt-BR');
    const collection=group.value;
    const shown=tracks.filter(x=>(!collection||x.collection===collection)&&
      (x.title+' '+x.phenomenon+' '+num(x.number)).toLocaleLowerCase('pt-BR').includes(text));
    list.replaceChildren();
    for(const track of shown){
      const item=document.createElement('li');
      const button=document.createElement('button');
      button.type='button';button.className='jukebox-record';
      if(active?.number===track.number)button.classList.add('selected');
      button.dataset.track=String(track.number);
      button.setAttribute('aria-pressed',String(active?.number===track.number));
      const serial=document.createElement('span');
      serial.className='record-number';serial.textContent=num(track.number);
      const details=document.createElement('span');details.className='record-details';
      const title=document.createElement('strong');title.textContent=track.title;
      const subtitle=document.createElement('small');subtitle.textContent=track.collection;
      details.append(title,subtitle);
      const tempo=document.createElement('span');tempo.className='record-bpm';tempo.textContent=track.bpm+' BPM';
      button.append(serial,details,tempo);
      button.addEventListener('click',()=>select(track.number,{play:true}).catch(error=>tell(error.message)));
      item.append(button);list.append(item);
    }
    badge.textContent=shown.length+' / '+tracks.length+' discos';
  }
  filter.addEventListener('input',render);group.addEventListener('change',render);
  volume.addEventListener('input',()=>{media.volume=Number(volume.value)/100;
    $('jukebox-volume-output').textContent=volume.value+'%'});
  media.addEventListener('play',()=>{requestedPlayback=true;play.textContent='Pausar música';renderPlay()});
  media.addEventListener('pause',()=>{play.textContent='Reproduzir música';renderPlay()});
  media.addEventListener('ended',()=>{renderPlay();tell('Faixa encerrada. Selecione outro disco.')});
  media.addEventListener('error',()=>{
    if(!active)return;
    if(!triedOgg && active.ogg && media.src!==active.ogg){
      triedOgg=true;
      tell('Não foi possível carregar o MP3. Tentando o formato OGG...');
      const resume=requestedPlayback;
      media.src=active.ogg;
      media.load();
      if(resume)media.play().catch(()=>tell('Áudio alternativo pronto. Clique em Reproduzir música.'));
      return;
    }
    tell('O áudio deste disco não carregou. Confira a conexão e tente novamente.');
  });
  function renderPlay(){const title=active?.title||'Nenhum disco selecionado';
    indicator.textContent=title;now.textContent=title;
    $('jukebox-disc').classList.toggle('turning',!media.paused&&!!media.src)}
  async function select(number,{play:autoplay=false}={}){
    const track=tracks.find(t=>t.number===Number(number));
    if(!track)throw new Error('Disco não encontrado: '+number);
    const ticket=++request;active=track;
    media.pause();triedOgg=false;requestedPlayback=autoplay;
    const support=media.canPlayType?.('audio/mpeg')??'probably';
    if(support===''&&track.ogg)triedOgg=true;
    media.src=triedOgg?track.ogg:track.mp3;
    media.load();
    // Sinalizar o novo disco antes de aguardar a rede: o relógio de dança
    // não deve ser reiniciado depois do áudio ter começado a tocar.
    onSelected({track,cues:{title:track.title,bpm:track.bpm,beatOffset:0,events:[]},phase:'selected'});
    // Call media.play() synchronously before the first await: browser gesture.
    const playback=autoplay?media.play().catch(error=>{
      // O evento media.error tentará o arquivo OGG se o MP3 não puder carregar.
      if(!media.error)tell('Reprodução bloqueada: '+error.message);
    }):null;
    now.textContent=track.title;indicator.textContent=track.title;
    $('jukebox-now-collection').textContent=track.collection;
    $('jukebox-now-bpm').textContent=track.bpm+' BPM';
    $('jukebox-now-phenomenon').textContent=track.phenomenon;
    $('bpm').value=String(track.bpm);
    $('bpm-output').textContent=track.bpm+' BPM';
    tell('Selecionado: '+track.title);
    render();renderPlay();
    emit('select',{trackNumber:number,title:track.title,bpm:track.bpm});
    try{
      const response=await fetch(track.cues);
      if(!response.ok)throw Error('HTTP '+response.status);
      const raw=await response.json();
      if(ticket!==request)return;
      const cues=cuesForTrack(raw,track);
      onSelected({track,cues,phase:'markers'});
      tell(track.title+' · '+track.bpm+' BPM · '+cues.events.length+' marcações');
    }catch(error){
      if(ticket!==request)return;
      onSelected({track,cues:{bpm:track.bpm,beatOffset:0,events:[],title:track.title},phase:'markers'});
      tell('Música selecionada; marcadores indisponíveis: '+error.message);
    }
    if(playback)await playback;
  }
  play.addEventListener('click',async()=>{
    if(!active){if(tracks[0])await select(tracks[0].number,{play:true});return;}
    if(media.paused){requestedPlayback=true;try{await media.play()}catch(error){
      if(!media.error)tell('Não foi possível tocar a música: '+error.message);
    }} else{requestedPlayback=false;media.pause();}
  });
  $('jukebox-prev').addEventListener('click',()=>{
    if(!tracks.length)return;
    const idx=active?tracks.indexOf(active):0;
    select(tracks[(idx-1+tracks.length)%tracks.length].number,{play:!media.paused})
      .catch(error=>tell(error.message));
  });
  $('jukebox-next').addEventListener('click',()=>{
    if(!tracks.length)return;
    const idx=active?tracks.indexOf(active):-1;
    select(tracks[(idx+1)%tracks.length].number,{play:!media.paused})
      .catch(error=>tell(error.message));
  });
  const ready=(async()=>{
    try{
      const response=await fetch(catalogueURL);
      if(!response.ok)throw Error('HTTP '+response.status);
      tracks=catalogueEntries(await response.json());
      for(const collection of [...new Set(tracks.map(t=>t.collection))]){
        const o=document.createElement('option');o.value=collection;o.textContent=collection;group.append(o);
      }
      render();
      if(tracks.length)await select(tracks[0].number,{play:false});
      emit('ready',{count:tracks.length});
      return tracks.length;
    }catch(error){tell('Não foi possível carregar o catálogo: '+error.message);throw error;}
  })();
  return {ready,select,open:()=>setOpen(true),close:()=>setOpen(false),toggle:()=>setOpen(!open),
    state,media,selected:()=>active,registerSceneFocus(fn){focusSceneFn=fn}};
}
