'use strict';
/* Som e toque da família (opcionais, desligados por padrão). O domínio declara o que o som e a vibração significam
   (experience.configure({feedback:{sound:{label, hint, preview}, haptics:{label, hint}}})) e as linhas aparecem em
   Acessibilidade → Som e toque. tone(): senoide de 220 Hz (mín.) a 880 Hz (máx.), 0,24 s; vibrate(): só em aparelhos
   compatíveis. Nada toca sem a preferência ligada, sem gesto do usuário ou com a aba oculta. */
SimCore.feedback=(()=>{
 const store=()=>SimCore.storage.core;let config=null,audio=null;
 const prefs=()=>{const v=store().get('feedback',null);return {sound:v?.sound===true,haptics:v?.haptics===true};};
 function set(key,on){if(!['sound','haptics'].includes(key))throw new TypeError('Preferência de retorno inválida');const p={...prefs(),[key]:!!on};store().set('feedback',p);SimCore.emit('feedback:changed',p);return p;}
 function frequency(value,{min=0,max=1}={}){const span=max-min,t=span>0&&Number.isFinite(value)?Math.min(1,Math.max(0,(value-min)/span)):0;return 220*2**(2*t);}
 function tone(value,range={},{force=false}={}){
  if(!force&&!prefs().sound)return false;if(document.hidden)return false;
  try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return false;audio=audio||new Ctx();if(audio.state==='suspended')audio.resume?.();
   const now=audio.currentTime,osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=frequency(value,range);
   gain.gain.setValueAtTime(.001,now);gain.gain.exponentialRampToValueAtTime(.18,now+.02);gain.gain.exponentialRampToValueAtTime(.001,now+.22);
   osc.connect(gain);gain.connect(audio.destination);osc.start(now);osc.stop(now+.24);return true;}catch(error){console.warn('Som indisponível',error);return false;}
 }
 function vibrate(pattern=[60,40,60],{force=false}={}){if(!force&&!prefs().haptics)return false;try{return typeof navigator.vibrate==='function'?navigator.vibrate(pattern):false;}catch{return false;}}
 function configure(spec){
  if(!spec){config=null;SimCore.emit('feedback:configured',{});return;}
  const row=(x,label,hint)=>x?{label:String(x.label||label),hint:String(x.hint??hint),preview:typeof x.preview==='number'?x.preview:.5}:null;
  config={sound:row(spec.sound===true?{}:spec.sound,'Som das leituras','Tom mais agudo para valores maiores'),haptics:row(spec.haptics===true?{}:spec.haptics,'Vibrar nas mudanças','Em celulares compatíveis')};
  SimCore.emit('feedback:configured',{});
 }
 return {configure,set,tone,vibrate,frequency,get prefs(){return prefs();},get config(){return config?{...config}:null;},get sound(){return prefs().sound;},get haptics(){return prefs().haptics;}};
})();
