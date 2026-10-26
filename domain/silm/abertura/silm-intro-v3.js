(() => {
  'use strict';
  const DURATION_MS=6100;
  if (document.documentElement.dataset.opening === 'off' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.getElementById('silm-intro-v3')) return;
  const root=document.createElement('div');
  root.id='silm-intro-v3';
  root.setAttribute('aria-hidden','true');
  root.innerHTML=`<canvas id="silm-intro-v3-canvas"></canvas>
    <div class="silm-intro-v3-mobile-brand">
      <strong class="silm-intro-v3-wordmark"><span>S</span><span>I</span><span>L</span><span>M</span></strong>
      <span class="silm-intro-v3-fullname">Simulador Interativo de Ligações Metálicas</span>
      <em class="silm-intro-v3-tagline">A Arquitetura dos Metais</em>
    </div>`;
  document.body.prepend(root);
  let rafId=0, timeoutId=0, disposed=false;
  function closeOpening(){
    if(disposed)return;
    disposed=true;
    cancelAnimationFrame(rafId);
    clearTimeout(timeoutId);
    document.removeEventListener('keydown',closeOpening,true);
    root.removeEventListener('pointerdown',closeOpening);
    root.classList.add('silm-intro-v3-exiting');
    setTimeout(()=>root.remove(),360);
  }
  root.addEventListener('pointerdown',closeOpening);
  document.addEventListener('keydown',closeOpening,true);

const canvas=document.getElementById('silm-intro-v3-canvas');
const ctx=canvas.getContext('2d',{alpha:false});
if(!ctx){ root.remove(); return; }
const DURATION=6100,front=[[68,86],[160,86],[160,178],[68,178]],back=[[108,50],[200,50],[200,142],[108,142]],raw=[...front,...back,[130,110]],edgeMap=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
const offsets=[[-65,-48],[69,-45],[78,45],[-69,53],[-24,-47],[71,-62],[78,24],[-55,49],[7,-31]];
const segs=[[[82,133],[98,132],[109,112],[126,110]],[[126,110],[143,108],[151,127],[167,127]],[[167,127],[181,127],[190,118],[202,109]]];
let elapsed=0;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));const mix=(a,b,u)=>a+(b-a)*u;
const ease=(v)=>{v=clamp(v);return v*v*(3-2*v)};
const easeOut=(v)=>{v=clamp(v);return 1-Math.pow(1-v,3)};
const easeInOut=(v)=>{v=clamp(v);return v<.5?4*v*v*v:1-Math.pow(-2*v+2,3)/2};
const phase=(t,start,end)=>ease((t-start)/(end-start));
const envelope=(t,onStart,onEnd,offStart,offEnd)=>phase(t,onStart,onEnd)*(1-phase(t,offStart,offEnd));
const damped=(v)=>{if(v<=0)return 0;return Math.exp(-7.3*v)*Math.sin(13.8*v)};
function bez(a,b,c,d,t){let k=1-t;return [k*k*k*a[0]+3*k*k*t*b[0]+3*k*t*t*c[0]+t*t*t*d[0],k*k*k*a[1]+3*k*k*t*b[1]+3*k*t*t*c[1]+t*t*t*d[1]]}
function trailPoint(v){v=clamp(v)*3;const ix=Math.min(2,Math.floor(v));return bez(...segs[ix],v-ix)}
function label(s,x,y,size,color,bold=false){ctx.font=(bold?'600 ':'400 ')+size+'px system-ui,-apple-system,"Segoe UI",sans-serif';ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(s,x,y)}
function render(time){
 elapsed=clamp(time,0,DURATION);const t=elapsed/DURATION;
 const dpr=Math.min(window.devicePixelRatio||1,2),r=canvas.getBoundingClientRect(),ww=Math.max(1,Math.round(r.width*dpr)),hh=Math.max(1,Math.round(r.height*dpr));
 if(canvas.width!==ww||canvas.height!==hh){canvas.width=ww;canvas.height=hh}
 const portrait=r.width/r.height<1.15;
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#f2f1ec';ctx.fillRect(0,0,ww,hh);
 if(portrait){const scale=ww/960;ctx.setTransform(scale,0,0,scale,0,hh*.34-160*scale);ctx.translate(480,160);ctx.scale(2.25,2.25);ctx.translate(-480,-160)}
 else{ctx.setTransform(ww/960,0,0,hh/540,0,0)}
 ctx.imageSmoothingEnabled=true;
 let bg=ctx.createRadialGradient(480,200,35,480,270,660);bg.addColorStop(0,'#fffdf9');bg.addColorStop(.56,'#f5f3ed');bg.addColorStop(1,'#eae7df');ctx.fillStyle=bg;ctx.fillRect(0,0,960,540);
 // Camera has a restrained establishing move and locks exactly to the identity view.
 const orbitAngle=0;
 const cameraDrift=Math.sin(phase(t,.04,.40)*Math.PI)*.025*(1-phase(t,.38,.61));
 const angle=orbitAngle+cameraDrift;
 const cameraMove=phase(t,.04,.64);
 const zoom=mix(.91,1,phase(t,.06,.53));
 const canvasAspect=r.width/Math.max(1,r.height),mobile=canvasAspect<1.15;
 ctx.save();ctx.translate(480,mobile?160:160);ctx.scale((mobile?1.38:1.42)*zoom,(mobile?1.38:1.42)*zoom);ctx.translate(-134,-118);

 const flex=envelope(t,.567,.616,.665,.712);
 const draw=envelope(t,.693,.737,.770,.816);
 const heat=envelope(t,.432,.466,.505,.548);
 const flexWave=flex*.040;const drawWave=draw*.050;
 const points=raw.map((p,i)=>{
  const back=i>=4&&i<8,inner=i===8,depth=back?1:(inner?.49:0),cx=134,cy=118;
  let x=p[0]-cx,y=p[1]-cy;
 
  x=x*Math.cos(angle)+depth*35*Math.sin(angle);
  y=y+depth*9*Math.sin(angle);
  const lag=back?(.018+.009*(i%2)):.013*(i%3);
  const deformationDelay=Math.max(0,.03*(p[1]-55)/130);
  const mx=envelope(t,.565+deformationDelay,.61+deformationDelay,.66+deformationDelay,.71+deformationDelay)*.04;
  const dy=envelope(t,.69+deformationDelay,.74+deformationDelay,.765+deformationDelay,.817+deformationDelay)*.05;
  x+=mx*(p[1]-cy)*.65+(draw*.007*(p[0]-cx));
  y+=dy*(p[1]-cy)+(flex*.004*(p[0]-cx));
  let final=[cx+x,cy+y];
  const begin=.012+i*.0105+(inner?.14:0)+(back?.04:0);
  const end=begin+.255;
  let p1=clamp((t-begin)/(end-begin)),move=easeOut(p1);
  // Tiny overshoot settles over the first third, without rubbery deformation.
  const settle=p1>0.64?Math.sin((p1-.64)/.36*Math.PI)*.036:0;
  const base=[final[0]+offsets[i][0]*(1-move)-offsets[i][0]*settle,
              final[1]+offsets[i][1]*(1-move)-offsets[i][1]*settle];
  return {pos:base,visibility:phase(t,begin+.025,end-.07),depth};
 });
 const pl=i=>points[i].pos;
 // Depth cue: reserved, shadow on the virtual surface below the logo.
 const shadow=ctx.createRadialGradient(135,217,8,135,217,132);shadow.addColorStop(0,'rgba(119,98,58,.13)');shadow.addColorStop(1,'rgba(119,98,58,0)');ctx.fillStyle=shadow;ctx.beginPath();ctx.ellipse(135,217,140,22,0,0,2*Math.PI);ctx.fill();
 function rod(a,b,intensity=1){if(intensity<=.002)return;ctx.save();ctx.globalAlpha=intensity;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a[0]+.8,a[1]+1.2);ctx.lineTo(b[0]+.8,b[1]+1.2);ctx.strokeStyle='rgba(111,75,15,.2)';ctx.lineWidth=4.8;ctx.stroke();
  const grad=ctx.createLinearGradient(a[0]-7,a[1]-10,b[0]+9,b[1]+9);grad.addColorStop(0,'#8a5910');grad.addColorStop(.24,'#f4db95');grad.addColorStop(.51,'#b9882a');grad.addColorStop(.75,'#f1d58d');grad.addColorStop(1,'#a26e15');ctx.strokeStyle=grad;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();ctx.restore()}
 const order=[4,5,6,7,8,9,10,11,0,1,2,3];
 for(const idx of order){const [a,b]=edgeMap[idx],start=.115+(idx%4)*.012+(idx<4?.047:0),pct=phase(t,start,start+.20),A=pl(a),B=pl(b);rod(A,[mix(A[0],B[0],pct),mix(A[1],B[1],pct)],pct*(idx>=4&&idx<8?.78:.94))}
 // Conductivity ribbon enters once nodes and most lattice struts are visible.
 const flowAlpha=phase(t,.235,.345);
 const flowRest=1-phase(t,.83,.945);
 if(flowAlpha>.01){ctx.save();ctx.globalAlpha=flowAlpha;
  const stroke=new Path2D(),pathPts=[];for(let j=0;j<=90;j++){let u=j/90,p=trailPoint(u);let wave=Math.sin(u*8+t*21)*1.0*flowRest;pathPts.push([p[0]+Math.sin(angle)*6,p[1]+wave]); if(j===0)stroke.moveTo(...pathPts[0]);else stroke.lineTo(...pathPts[j])}
  ctx.lineCap='round';ctx.strokeStyle='rgba(52,177,233,.12)';ctx.lineWidth=19;ctx.stroke(stroke);ctx.strokeStyle='rgba(79,195,247,.21)';ctx.lineWidth=10;ctx.stroke(stroke);
  const g=ctx.createLinearGradient(82,136,201,109);g.addColorStop(0,'#a4eafe');g.addColorStop(.45,'#36b9ec');g.addColorStop(1,'#87e3fd');ctx.strokeStyle=g;ctx.lineWidth=4.9;ctx.stroke(stroke);
  const anchors=[.15,.575,.83];const fadeToLogo=phase(t,.86,.985);
  for(let j=0;j<3;j++){
    // Continuous phase, followed by a soft blend to approved final positions.
    let v=((t-.26)*.85+j/3+1)%1;v=mix(v,anchors[j],fadeToLogo);const p=trailPoint(v);p[1]+=Math.sin(v*8+t*21)*flowRest;
    for(let k=3;k>=1;k--){const tailV=clamp(v-k*.014);const trail=trailPoint(tailV);const alpha=(4-k)/20*(1-fadeToLogo);ctx.fillStyle=`rgba(88,203,245,${alpha})`;ctx.beginPath();ctx.arc(...trail,2+k,0,2*Math.PI);ctx.fill()}
    const gh=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],11);gh.addColorStop(0,'rgba(239,254,255,.95)');gh.addColorStop(.19,'rgba(107,231,255,.88)');gh.addColorStop(1,'rgba(79,195,247,0)');ctx.fillStyle=gh;ctx.beginPath();ctx.arc(...p,12,0,2*Math.PI);ctx.fill();ctx.fillStyle='#e4faff';ctx.beginPath();ctx.arc(...p,2.45,0,2*Math.PI);ctx.fill();
  }
  ctx.restore();}
 if(heat>.01){ctx.save();ctx.globalAlpha=heat*.7;for(const i of [0,2,4,6,8]){const p=pl(i);let spread=14+11*phase(t,.445,.52),g=ctx.createRadialGradient(...p,0,...p,spread);g.addColorStop(0,'rgba(255,225,139,.40)');g.addColorStop(1,'rgba(255,199,81,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(...p,spread,0,2*Math.PI);ctx.fill()}ctx.restore()}
 const sweep=envelope(t,.772,.80,.869,.907),sweepX=mix(52,213,phase(t,.78,.89));
 function orb(p,r,alpha=1,dim=0){if(alpha<=.002)return;const [x,y]=p;ctx.save();ctx.globalAlpha=alpha;
  const sh=ctx.createRadialGradient(x+1,y+3,1,x+1,y+3,r*2.35);sh.addColorStop(0,'rgba(94,67,20,.23)');sh.addColorStop(1,'rgba(94,67,20,0)');ctx.fillStyle=sh;ctx.beginPath();ctx.arc(x+1,y+3,r*2.3,0,2*Math.PI);ctx.fill();
  const metal=ctx.createRadialGradient(x-r*.38,y-r*.51,r*.045,x+r*.17,y+r*.10,r*1.37);metal.addColorStop(0,'#fff6d4');metal.addColorStop(.15,'#f2d183');metal.addColorStop(.41,dim?'#d0a455':'#d5a13c');metal.addColorStop(.72,'#95651d');metal.addColorStop(1,'#674207');ctx.fillStyle=metal;ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fill();ctx.strokeStyle='rgba(255,239,196,.35)';ctx.lineWidth=.6;ctx.stroke();
  const reflection=sweep*Math.exp(-Math.pow((x-sweepX)/24,2));if(reflection>.02){ctx.globalAlpha=alpha*reflection*.54;ctx.fillStyle='#fff9da';ctx.beginPath();ctx.ellipse(x-r*.32,y-r*.35,r*.34,r*.16,-.6,0,Math.PI*2);ctx.fill();}
  ctx.restore()}
 for(const i of [4,5,6,7,8,0,1,2,3]){const r=i===8?13.2:i<4?12.8:(i<6?11:10.2);orb(pl(i),r,points[i].visibility,i>=4&&i<8)}
 ctx.restore();
 if(!portrait){
 // Brand is a staggered typographic animation, not a sudden hard cut.

 const revealBase=.52, goldFade=phase(t,.51,.81), lightSweep=phase(t,.71,.89);
 ctx.save();
 ctx.textAlign='center';ctx.textBaseline='alphabetic';
 const mainFont='normal 67px Georgia, "Times New Roman", serif';
 const glyphs=[...'SILM'];ctx.font=mainFont;
 const widths=glyphs.map(g=>ctx.measureText(g).width);
 const total=widths.reduce((a,b)=>a+b,0)+14*(glyphs.length-1);
 let cursor=480-total/2;
 const wordSweepX=mix(290,690,lightSweep);
 for(let i=0;i<glyphs.length;i++){
  let x=cursor+widths[i]/2;cursor+=widths[i]+14;
  let phaseI=phase(t,.52+i*.037,.69+i*.037);
  if(phaseI<.001)continue;
  let scale=mix(.56,1.0,phaseI)+Math.sin(phaseI*Math.PI)*.04;
  let fromLeft=i%2?-.25:.25;
  let angle=(1-phaseI)*fromLeft;
  let y=376+(1-phaseI)*34;
  ctx.save();ctx.translate(x+(1-phaseI)*20*(i%2?-1:1),y);ctx.rotate(angle);ctx.scale(scale,scale);ctx.globalAlpha=phaseI;
  const goldGradient=ctx.createLinearGradient(-45,-64,40,7);
  goldGradient.addColorStop(0,'#fff0b8');goldGradient.addColorStop(.19,'#e6be60');goldGradient.addColorStop(.44,'#99611b');goldGradient.addColorStop(.68,'#efca71');goldGradient.addColorStop(1,'#8a5c1d');
  ctx.shadowColor='rgba(104,75,23,.20)';ctx.shadowBlur=11;ctx.shadowOffsetY=5;
  ctx.fillStyle=goldGradient;ctx.fillText(glyphs[i],0,0);
  ctx.shadowColor='transparent';ctx.lineWidth=.65;ctx.strokeStyle='rgba(111,68,19,.45)';ctx.strokeText(glyphs[i],0,0);
  const effect=Math.exp(-Math.pow((x-wordSweepX)/48,2))*phase(t,.71,.77)*(1-phase(t,.93,.97));
  if(effect>.02){ctx.globalAlpha=effect*.58*phaseI;ctx.fillStyle='#fff5ba';ctx.fillText(glyphs[i],0,0)}
  ctx.restore();
 }
 // Two hairline rules close the kinetic title without competing with the emblem.
 const lineShow=phase(t,.73,.88);
 if(lineShow>.005){let grad=ctx.createLinearGradient(300,397,660,397);grad.addColorStop(0,'rgba(155,103,25,0)');grad.addColorStop(.3,'rgba(163,112,36,.52)');grad.addColorStop(.7,'rgba(163,112,36,.52)');grad.addColorStop(1,'rgba(155,103,25,0)');ctx.save();ctx.globalAlpha=lineShow;ctx.fillStyle=grad;ctx.fillRect(300,398,360,1);ctx.fillStyle='#b78b3e';ctx.beginPath();ctx.arc(480,398,2.5,0,Math.PI*2);ctx.fill();ctx.restore()}
 const text2=phase(t,.72,.89),text3=phase(t,.82,.975);
 function brand(text,y,font,colour,opacity,weight='400',italic='normal'){
  ctx.save();ctx.globalAlpha=opacity;ctx.fillStyle=colour;ctx.textAlign='center';
  ctx.font=`${italic} ${weight} ${font}px system-ui,-apple-system,"Segoe UI",sans-serif`;
  ctx.fillText(text,480,y+(1-opacity)*16);ctx.restore()}
 brand('Simulador Interativo de Ligações Metálicas',433,16,'#343d46',text2,'500');
 brand('A Arquitetura dos Metais',463,15,'#70767a',text3,'400','italic');
 ctx.restore();
 } // fim do título renderizado para telas largas
 }

  const start=performance.now();
  function tick(now){
    if(disposed) return;
    const delta=Math.min(DURATION_MS,now-start);
    render(delta);
    if(delta>=DURATION_MS) closeOpening();
    else rafId=requestAnimationFrame(tick);
  }
  // Safety timeout: animation errors never block the application.
  timeoutId=setTimeout(closeOpening,7200);
  try{render(0);rafId=requestAnimationFrame(tick)}catch(error){console.warn('Abertura SILM indisponível:',error);closeOpening()}
})();
