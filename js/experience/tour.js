'use strict';
/* Tour do laboratório (coachmark da família): escurece a tela, contorna uma parte por vez e explica num cartão com
   "PASSO n DE N", "Pular tour", "Voltar" e "Próximo"/"Concluir". É um <dialog> modal: Esc encerra.
   Na primeira entrada no laboratório livre, uma nota "Primeira vez no laboratório?" oferece o tour uma única vez.
   Configuração: experience.configure({tour:{title, welcome:{title, text, manualTopic}, steps:[{target, mobileTarget,
   title, text, open:{side, option}}]}}). Os passos e os textos são do domínio. */
SimCore.createTour=(ctx,experience)=>{
 const S=SimCore,$=S.$,mobile=matchMedia('(max-width:'+S.breakpoints.mobile+'px)');
 let spec=null,steps=[],current=0,dialog=null,origin=null,bound=false,snap=null;
 const KEY='tour.welcome-seen';
 const seen=()=>ctx.storage.get(KEY,false)===true;
 const markSeen=()=>{ctx.storage.set(KEY,true);const note=$('workspace-welcome');if(note)note.hidden=true;};
 const visible=el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).visibility!=='hidden';};
 const freeLab=()=>{const a=experience.activity.current;return !a||a.type==='free';};
 function targetOf(step){const selector=(mobile.matches&&step.mobileTarget)||step.target;if(!selector)return null;return [...document.querySelectorAll(selector)].find(visible)||null;}
 function build(){
  if(dialog)return dialog;
  dialog=document.createElement('dialog');dialog.id='tour';dialog.className='tour';dialog.setAttribute('aria-labelledby','tour-titulo');
  dialog.innerHTML='<div class="tour-anel" aria-hidden="true"></div><div class="tour-cartao"><div id="tour-conteudo" aria-live="polite"><p class="tour-passo eyebrow" id="tour-passo"></p><h2 id="tour-titulo"></h2><p id="tour-texto"></p></div><div class="tour-pontos" id="tour-pontos" aria-hidden="true"></div><div class="tour-acoes"><button type="button" class="quiet-btn" id="tour-pular">Pular tour</button><button type="button" class="secondary-btn" id="tour-voltar"></button><button type="button" class="primary-btn" id="tour-proximo"></button></div></div>';
  document.body.append(dialog);SimCoreCompat.prepararDialogos?.();
  dialog.querySelector('#tour-proximo').addEventListener('click',()=>{if(current<steps.length-1)show(current+1);else finish();});
  dialog.querySelector('#tour-voltar').addEventListener('click',()=>show(Math.max(0,current-1)));
  dialog.querySelector('#tour-pular').addEventListener('click',finish);
  dialog.addEventListener('keydown',e=>S.trap(e,dialog));
  dialog.addEventListener('close',()=>{S.workspace.restore(snap);snap=null;markSeen();S.emit('tour:ended',{});
   requestAnimationFrame(()=>{const target=origin?.isConnected&&visible(origin)&&!origin.closest('[inert],[hidden]')?origin:document.querySelector('#viewport-content [data-stage-focus]')||$('scientific-viewport');target?.focus({preventScroll:true});origin=null;});});
  return dialog;
 }
 /* Contorna o alvo e põe o cartão abaixo, acima ou ao lado, sem sair da tela. */
 function place(){
  if(!dialog?.open)return;const target=targetOf(steps[current]),ring=dialog.querySelector('.tour-anel'),card=dialog.querySelector('.tour-cartao');
  const W=innerWidth,H=innerHeight,M=12,c=card.getBoundingClientRect();
  if(!target){ring.hidden=true;card.style.left=(W-c.width)/2+'px';card.style.top=(H-c.height)/2+'px';return;}
  const r=target.getBoundingClientRect(),top=Math.max(r.top-6,4),bottom=Math.min(r.bottom+6,H-4),left=Math.max(r.left-6,4);
  ring.hidden=false;Object.assign(ring.style,{left:left+'px',top:top+'px',width:Math.min(r.right+6,W-4)-left+'px',height:bottom-top+'px'});
  const clampX=x=>Math.min(Math.max(x,M),W-c.width-M),clampY=y=>Math.min(Math.max(y,M),H-c.height-M);let x,y;
  if(bottom+M+c.height<=H-M){x=clampX(r.left+r.width/2-c.width/2);y=bottom+M;}
  else if(top-M-c.height>=M){x=clampX(r.left+r.width/2-c.width/2);y=top-M-c.height;}
  else if(r.right+M+c.width<=W-M){x=r.right+M;y=clampY(r.top);}
  else if(r.left-M-c.width>=M){x=r.left-M-c.width;y=clampY(r.top);}
  else{x=clampX((W-c.width)/2);y=H-c.height-M;}
  card.style.left=x+'px';card.style.top=y+'px';
 }
 function show(n){
  current=n;const step=steps[n];S.workspace.close('left',false);S.workspace.close('right',false);
  if(!mobile.matches&&step.open?.side)S.workspace.open(step.open.side,null,step.open.option||null);
  dialog.querySelector('#tour-passo').textContent='PASSO '+(n+1)+' DE '+steps.length;
  dialog.querySelector('#tour-titulo').textContent=step.title;dialog.querySelector('#tour-texto').textContent=step.text;
  const dots=dialog.querySelector('#tour-pontos');dots.replaceChildren(...steps.map((_,i)=>{const d=document.createElement('span');if(i===n)d.className='atual';return d;}));
  const back=dialog.querySelector('#tour-voltar'),next=dialog.querySelector('#tour-proximo');back.hidden=n===0;
  back.replaceChildren(S.icons.element('previous'),document.createTextNode('Voltar'));next.replaceChildren(document.createTextNode(n===steps.length-1?'Concluir':'Próximo'),S.icons.element('next'));
  targetOf(step)?.scrollIntoView({block:'center',behavior:'auto'});requestAnimationFrame(place);next.focus({preventScroll:true});
 }
 async function start(trigger=document.activeElement){
  if(!steps.length)return false;
  if(!freeLab()){ctx.notify('O tour está disponível no laboratório livre.',{type:'info'});return false;}
  origin=trigger;if(S.router.current?.id!=='laboratorio')await S.router.navigate('laboratorio');
  build();S.modal.close();S.shell?.close();snap=S.workspace.snapshot();dialog.showModal();show(0);S.emit('tour:started',{});return true;
 }
 function finish(){if(dialog?.open)dialog.close();}
 /* Nota de boas-vindas: aparece no laboratório livre enquanto o tour não foi feito nem dispensado. */
 function renderWelcome(){
  const host=$('workspace-welcome');if(!host)return;const w=spec?.welcome;
  const show=!!w&&S.router.current?.id==='laboratorio'&&freeLab()&&!seen()&&steps.length>0;
  if(!show){host.hidden=true;return;}
  host.replaceChildren();const p=document.createElement('p'),strong=document.createElement('strong');strong.textContent=w.title||'Primeira vez no laboratório?';p.append(strong,document.createTextNode(' '+(w.text||'O tour mostra cada painel do laboratório.')));
  const row=document.createElement('div'),go=document.createElement('button');go.type='button';go.className='primary-btn';go.id='workspace-welcome-tour';go.textContent='Fazer o tour';go.addEventListener('click',()=>start(go));
  const manual=document.createElement('a');manual.className='secondary-btn';manual.id='workspace-welcome-manual';manual.textContent='Abrir o manual';manual.href=S.router.href('manual',w.manualTopic||'');
  const later=document.createElement('button');later.type='button';later.className='quiet-btn';later.id='workspace-welcome-later';later.textContent='Agora não';later.addEventListener('click',()=>{markSeen();$('workspace-left')?.focus({preventScroll:true});});
  row.append(go,manual,later);host.append(p,row);host.hidden=false;
 }
 function configure(options){
  if(!options)return;
  if(!Array.isArray(options.steps)||!options.steps.length||options.steps.some(s=>!s||!s.title||!s.text))throw new TypeError('Tour inválido: cada passo precisa de título e texto');
  spec={...options};steps=options.steps.map(s=>({...s}));
  if(!bound){bound=true;ctx.scope.listen(window,'resize',place);ctx.scope.listen(document,'scroll',place,true);
   for(const event of ['screen:changed','activity:changed'])ctx.events.on(event,renderWelcome);
   ctx.scope.cleanup(()=>{finish();dialog?.remove();dialog=null;const host=$('workspace-welcome');if(host){host.hidden=true;host.replaceChildren();}});}
  renderWelcome();
 }
 return {configure,start,finish,get active(){return !!dialog?.open;},get configured(){return steps.length>0;},refresh:renderWelcome,steps:()=>steps.map(s=>({...s}))};
};
