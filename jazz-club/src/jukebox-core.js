/* Jazz e Metais: interpretação do catálogo científico-musical, sem DOM e sem 3D. */
export const CATALOGUE_PATH='./audio/jazz%20e%20metais/catalogo.json';
export const AUDIO_ROOT='./audio/jazz%20e%20metais/';
export function catalogueEntries(catalogue){
  if(!catalogue||!Array.isArray(catalogue.faixas))
    throw new Error('Catálogo do clube ausente ou inválido');
  const numbers=new Set();
  const tracks=catalogue.faixas.map(entry=>{
    const number=Number(entry.numero),bpm=Number(entry.bpm);
    const mp3=entry.arquivos?.mp3,cues=entry.arquivos?.sincronizacao;
    if(!Number.isInteger(number)||number<1||number>999||numbers.has(number)||
       !(bpm>=55&&bpm<=240)||typeof mp3!=='string'||
       typeof cues!=='string'||!/^faixas\/[0-9]{2}\/[^\\\/\x00-\x1f?#%]+\.mp3$/iu.test(mp3)||
       !/^faixas\/[0-9]{2}\/[^\\\/\x00-\x1f?#%]+\.json$/iu.test(cues)||
       mp3.includes('..')||cues.includes('..'))throw new Error('Metadados inválidos na faixa '+number);
    numbers.add(number);
    return Object.freeze({
      number,title:String(entry.titulo),collection:String(entry.colecao),
      phenomenon:String(entry.fenomeno||''),bpm,
      duration:Number(entry.duracao_segundos)||0,
      mp3:new URL(AUDIO_ROOT+mp3,locationSafe()).href,
      cues:new URL(AUDIO_ROOT+cues,locationSafe()).href
    });
  });
  return tracks.sort((a,b)=>a.number-b.number);
}
function locationSafe(){
  return (typeof document!=='undefined'?new URL('../',import.meta.url):new URL('../',import.meta.url));
}
export function cuesForTrack(raw,track){
  const bpm=Number(raw?.bpm??track.bpm);
  if(!Number.isFinite(bpm)||bpm<55||bpm>240)throw Error('BPM inválido');
  const sections=Array.isArray(raw?.sections)?raw.sections.slice().sort((a,b)=>a.start_seconds-b.start_seconds):[];
  const beats=Array.isArray(raw?.beats)?raw.beats:[];
  const patterns=['trio','linha','pares','roda','troca','trio'];
  const energies=[.32,.66,.57,.90,.72,.45];
  const events=beats.length?beats.map(beat=>{
    const time=Number(beat.t);if(!Number.isFinite(time)||time<0)throw Error('Marcação musical inválida');
    let i=0;while(i+1<sections.length&&Number(sections[i+1].start_seconds)<=time)i++;
    return {time,section:sections[i]?.name??'',formation:patterns[i%patterns.length],
      energy:Math.min(1,energies[i%energies.length]+(Number(beat.beat)===1?.12:0))};
  }):sections.map((s,i)=>({time:Number(s.start_seconds)||0,
    section:String(s.name),formation:patterns[i%patterns.length],energy:energies[i%energies.length]}));
  return {title:track.title,bpm,beatOffset:0,events};
}
export const num=n=>String(n).padStart(2,'0');
