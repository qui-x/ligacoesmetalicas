/* Jazz e Metais — faixa 01 oficial, publicada no GitHub Pages.
 * Reproduz o MP3 original diretamente, sem reconstrução base64 nem cópias.
 * O JSON original contém seções e 288 batidas para sincronização musical.
 * Nenhum áudio é iniciado automaticamente pelo código.
 */
const TRACK_BASE=new URL('../audio/jazz%20e%20metais/faixas/01/',import.meta.url);
const AUDIO_URL=new URL('01_O_Baile_dos_Eletrons_v02.mp3',TRACK_BASE);
const CUES_URL=new URL('01_O_Baile_dos_Eletrons_v02_cues.json',TRACK_BASE);
export const BUILTIN_TRACK_NAME='O Baile dos Elétrons — reorquestração v0.2';
export const BUILTIN_TRACK_URL=AUDIO_URL.href;
export const BUILTIN_TRACK_BPM=132;
let pending=null;

function cuesForDance(raw){
  if(!raw||Number(raw.bpm)!==132||!Array.isArray(raw.beats)||raw.beats.length<200||
      !Array.isArray(raw.sections)||raw.sections.length<1){
    throw new Error('Marcadores musicais originais ausentes ou inválidos.');
  }
  const sequence=['trio','linha','pares','roda','troca','trio'];
  const intensities=[.32,.69,.56,.92,.77,.43];
  const sections=[...raw.sections].sort((a,b)=>a.start_seconds-b.start_seconds);
  const events=raw.beats.map(beat=>{
    const time=Number(beat.t);
    const bar=Number(beat.bar);
    if(!Number.isFinite(time)||time<0||!Number.isFinite(bar))
      throw new Error('Marcador de batida inválido.');
    let index=0;
    while(index+1<sections.length&&time>=Number(sections[index+1].start_seconds))index++;
    const accent=Number(beat.beat)===1?.14:0;
    return {time,section:String(sections[index].name),
      formation:sequence[index%sequence.length],
      energy:Math.min(1,intensities[index%intensities.length]+accent)};
  });
  return {title:raw.title,bpm:132,beatOffset:0,events};
}
async function load(){
  const response=await fetch(CUES_URL,{cache:'default'});
  if(!response.ok)throw new Error('Não foi possível carregar os marcadores (HTTP '+response.status+').');
  const raw=await response.json();
  return Object.freeze({
    objectUrl:AUDIO_URL.href,
    title:BUILTIN_TRACK_NAME,
    bpm:BUILTIN_TRACK_BPM,
    cues:cuesForDance(raw),
    duration:133.46,
    source:'GitHub Pages',
    // Checksum as recorded in the repository's SHA256SUMS.txt.
    sha256:'1a0bd1ebc54d635ce1568004d6f3510013fd1f046ae1e8c33c5fd6916f866919'
  });
}
export async function loadBuiltinTrack(onProgress=()=>{}){
  if(!pending)pending=load().catch(error=>{pending=null;throw error});
  const result=await pending;
  onProgress(1,1);
  return result;
}
export function releaseBuiltinTrack(){
  // Playback streams directly from the published MP3. No object URL to revoke.
  pending=null;
}
