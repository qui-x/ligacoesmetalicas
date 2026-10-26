/* O Baile dos Elétrons — user-authored reorchestration v0.2 (SILM).
 * Lossless transport of the original approved MP3 as base64 text shards, so
 * GitHub Pages can serve the exact file without Git LFS, external hosts,
 * third-party trackers or altering the musical recording.
 */
const PREFIX='01_o_baile_dos_eletrons_v02';
const baseUrl=new URL('../audio/',import.meta.url);
const fileUrl=name=>new URL(PREFIX+name,baseUrl);
async function get(url){
  const response=await fetch(url,{cache:'default'});
  if(!response.ok)throw new Error('Não foi possível carregar '+url.pathname+' (HTTP '+response.status+').');
  return response;
}
function digestHex(bytes){
  return crypto.subtle.digest('SHA-256',bytes).then(buffer=>
    Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('')
  );
}
export const BUILTIN_TRACK_NAME='O Baile dos Elétrons — reorquestração v0.2';
let cached=null;
export async function loadBuiltinTrack(onProgress=()=>{}){
  if(cached)return cached;
  const manifest=await (await get(fileUrl('.manifest.json'))).json();
  if(manifest.parts!==27||manifest.bytes!==3203700||
     manifest.sha256!=='1a0bd1ebc54d635ce1568004d6f3510013fd1f046ae1e8c33c5fd6916f866919'){
    throw new Error('Manifesto da faixa musical inesperado.');
  }
  const chunks=new Array(manifest.parts);
  // Five downloads per batch keeps the song loading on mobile connections.
  for(let start=0;start<chunks.length;start+=5){
    const ids=Array.from({length:Math.min(5,chunks.length-start)},(_,i)=>i+start);
    await Promise.all(ids.map(async i=>{
      const suffix='.part'+String(i).padStart(2,'0')+'.b64';
      const text=(await (await get(fileUrl(suffix))).text()).trim();
      if(!/^[A-Za-z0-9+/=]+$/.test(text)||text.length>(manifest.partSizeBase64||160000))
        throw new Error('Parte musical inválida: '+suffix);
      chunks[i]=text;
    }));
    onProgress(chunks.filter(x=>x!==undefined).length,manifest.parts);
  }
  const encoded=chunks.join('');
  if(encoded.length!==manifest.base64Length)throw new Error('A faixa veio incompleta.');
  const binary=atob(encoded);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  if(bytes.byteLength!==manifest.bytes)throw new Error('O tamanho do MP3 não confere.');
  if(globalThis.crypto?.subtle){
    const actual=await digestHex(bytes);
    if(actual!==manifest.sha256)throw new Error('A assinatura SHA-256 do MP3 não confere.');
  }
  const cues=await (await get(fileUrl('.cues.json'))).json();
  const objectUrl=URL.createObjectURL(new Blob([bytes],{type:'audio/mpeg'}));
  cached={objectUrl,cues,title:BUILTIN_TRACK_NAME,duration:manifest.duration,
    sha256:manifest.sha256,bytes:bytes.byteLength};
  return cached;
}
export function releaseBuiltinTrack(){
  if(cached?.objectUrl)URL.revokeObjectURL(cached.objectUrl);
  cached=null;
}
