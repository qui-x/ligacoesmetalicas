/* SILM Jazz e Metais — engine coreográfico independente de renderizador (ESM).
   Movimentos são metáforas artísticas, NÃO trajetórias de elétrons reais.
   Não escreve no scientificState do SILM. Sem DOM/WebAudio/Babylon. */
export const PERFORMERS = Object.freeze([
  {id:'Eu',name:'Euria',element:'Európio',structure:'CCC',accent:'#efc266',costume:'#254b58'},
  {id:'Ce',name:'Céria',element:'Cério',structure:'CFC',accent:'#ec9067',costume:'#58272e'},
  {id:'Gd',name:'Gádia',element:'Gadolínio',structure:'HC',accent:'#83d6c7',costume:'#263b61'}
]);
export const FORMATIONS=['auto','trio','pares','roda','linha','troca'];
export const STEP_STYLES=['charleston','swing','side-step','pivot'];
const clamp=(v,low,high)=>Math.max(low,Math.min(high,v));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{const x=clamp(t,0,1);return x*x*(3-2*x)};
const point=(x,z,face=0)=>({x,z,face});
const pi=Math.PI,TAU=2*pi;
const H={
  trio:[point(-2.35,.20),point(0,-.32),point(2.35,.20)],
  pares:[point(-1.02,.10,pi/2),point(1.02,.10,-pi/2),point(0,2.25,0)],
  roda:[point(-1.65,0,-pi/2),point(.825,-1.43,pi/6),point(.825,1.43,5*pi/6)],
  linha:[point(-2.25,.3),point(0,.3),point(2.25,.3)],
  troca:[point(2.25,-.10,pi),point(-2.25,-.10,pi),point(0,1.9,0)]
};
const formSeq=['trio','pares','roda','linha','troca'];
export function formationForPhrase(phrase){return formSeq[((phrase%formSeq.length)+formSeq.length)%formSeq.length];}
export function normalizeCueSheet(value){
  if(!value||typeof value!=='object')throw new Error('Marcadores musicais precisam ser um objeto JSON');
  const bpm=Number(value.bpm??value.tempo??120);
  if(!(bpm>=55&&bpm<=240))throw new Error('BPM deve estar entre 55 e 240');
  const beatOffset=Number(value.beatOffset??value.offset??0);
  if(!Number.isFinite(beatOffset)||Math.abs(beatOffset)>60)throw new Error('Deslocamento rítmico inválido');
  // Aceita time em segundos, ou beat index (0-based). Converte marcas
  // {time,section,energy} ou {beat,section,energy} para um formato estável.
  const entries=value.events??value.cues??value.markers??[];
  if(!Array.isArray(entries)||entries.length>10000)throw new Error('Marcadores devem ser uma lista de até 10.000 eventos');
  const events=entries.map(x=>{
    const t=Number(x.time??x.t??((Number(x.beat??0))*60/bpm+beatOffset));
    const energyValue=Number(x.energy??.55);
    const energy=Number.isFinite(energyValue)?clamp(energyValue,0,1):.55;
    return {time:t,section:String(x.section??x.label??''),energy};
  }).filter(x=>Number.isFinite(x.time)&&x.time>=0).sort((a,b)=>a.time-b.time);
  return {bpm,beatOffset,events,track:String(value.title??value.name??'Faixa importada')};
}
export function danceFrame({seconds=0,bpm=120,beatOffset=0,formation='auto',intensity=.65,reduced=false,energy=.5}={}){
  const time=Math.max(0,Number(seconds)||0);
  const tempo=clamp(Number(bpm)||120,55,240);
  const beat=Math.max(0,(time-Number(beatOffset)||0)*tempo/60);
  const phrase=Math.floor(beat/32);
  const chosen=formation==='auto'?formationForPhrase(phrase):H[formation]?formation:'trio';
  const previous=formation==='auto'?(phrase===0?chosen:formationForPhrase(phrase-1)):chosen;
  const transition=formation==='auto'?smooth((beat%32)/4):1;
  const amp=(reduced?0:clamp(Number(intensity)||0,0,1))*mix(.7,1.25,clamp(Number(energy)||0,0,1));
  const cycle=TAU*beat,quarter=cycle/4;
  const footFall=(b,phase)=>Math.max(0,Math.sin(pi*((b+phase)%2)));
  const cast=PERFORMERS.map((p,i)=>{
    const a=H[previous][i],b=H[chosen][i];
    const x=mix(a.x,b.x,transition),z=mix(a.z,b.z,transition);
    const index=(i+phrase)%4;
    const style=STEP_STYLES[index];
    const phase=cycle+i*1.32;
    const left=footFall(beat,i*.3),right=footFall(beat,1+i*.3);
    let dx=0,dz=0,turn=0;
    if(!reduced){
      if(style==='charleston'){dz=.24*Math.sin(phase*.5);dx=.09*Math.cos(phase*.5);}
      else if(style==='swing'){dx=.24*Math.sin(phase*.5);dz=.10*Math.sin(phase);}
      else if(style==='side-step'){dx=.28*Math.sin(phase*.25);dz=.09*Math.cos(phase*.5);}
      else{turn=.24*Math.sin(phase*.22);dx=.11*Math.sin(phase*.45);}
    }
    // Two dancers communicate through a single shared, symmetric gesture.
    const duo=chosen==='pares' && i<2;
    const reach=duo?Math.max(0,Math.sin(quarter+pi*.3))*.7:0;
    const accent=Math.max(0,Math.cos(cycle*.25))*amp;
    return {id:p.id,name:p.name,structure:p.structure,style,
      x:x+dx*amp,z:z+dz*amp,heading:mix(a.face,b.face,transition)+turn*amp,
      rise:.04*amp*(Math.sin(phase)+1),
      torsoRoll:.12*amp*Math.sin(phase*.5),
      torsoYaw:.18*amp*Math.sin(phase*.34),
      headYaw:.17*amp*Math.sin(phase*.3+.8),
      leftArm:(duo?(i===0?.85:-.4)*reach:.55*Math.sin(phase*.48))*amp,
      rightArm:(duo?(i===1?-.85:.4)*reach:-.55*Math.sin(phase*.48))*amp,
      leftElbow:.32*amp+.35*reach*amp,
      rightElbow:.32*amp+.35*reach*amp,
      leftKnee:.16*amp+.30*left*amp,
      rightKnee:.16*amp+.30*right*amp,
      leftFoot:.18*left*amp,rightFoot:.18*right*amp,
      light:accent,duo};
  });
  return {time,beat,phrase,formation:chosen,style:cast[0].style,cast};
}
export function parseTrackEvents(text){
  return normalizeCueSheet(typeof text==='string'?JSON.parse(text):text);
}
