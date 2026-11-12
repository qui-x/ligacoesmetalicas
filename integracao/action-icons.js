'use strict';
/* SILM: biblioteca vetorial local para ações. Não substitui listeners, nem semântica.
 * Controles perigosos mantêm rótulo textual; o leitor de tela recebe nome explícito. */
window.SILMActionIcons=(()=>{
 const NS='http://www.w3.org/2000/svg';
 const icons=Object.freeze({
 x:'<path d="M18 6 6 18M6 6l12 12"/>',left:'<path d="m15 18-6-6 6-6M9 12h12"/>',
 right:'<path d="m9 18 6-6-6-6M15 12H3"/>',check:'<path d="m20 6-11 11-5-5"/>',
 circle:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
 skip:'<path d="m5 5 11 7-11 7V5ZM19 5v14"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 save:'<path d="M5 3h12l4 4v14H3V3h2ZM7 3v6h10V3M7 21v-8h10v8"/>',
 edit:'<path d="m12 20 8-8M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z"/>',
 trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
 undo:'<path d="M9 14 4 9l5-5M4 9h11a6 6 0 0 1 0 12h-2"/>',
 refresh:'<path d="M20 7v5h-5M4 17v-5h5M5.5 9A7 7 0 0 1 19 7l1 5M4 12l1 5a7 7 0 0 0 13.5-2"/>',
 expand:'<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',
 fit:'<path d="M8 3H3v5m18 0V3h-5M3 16v5h5m13-5v5h-5M8 8h8v8H8z"/>',
 zoomIn:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5M8 11h6M11 8v6"/>',
 zoomOut:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5M8 11h6"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
 download:'<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>',
 upload:'<path d="M12 17V4m-5 5 5-5 5 5M4 17v4h16v-4"/>',
 play:'<path d="m8 4 12 8-12 8V4Z"/>',stop:'<rect x="5" y="5" width="14" height="14" rx="2"/>',
 layers:'<path d="m12 2 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5"/>',
 // O SILM representa centros metálicos em rede e elétrons coletivos,
 // não órbitas tipo Bohr ou pares de ligações localizadas.
 lattice:'<path d="M3 8 9 4l12 4v12l-6 4-12-4ZM3 8l12 4 6-4M15 12v8M9 4v12"/><circle cx="3" cy="8" r="1.5"/><circle cx="9" cy="4" r="1.5"/><circle cx="21" cy="8" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="3" cy="20" r="1.5"/><circle cx="15" cy="20" r="1.5"/>',
 electronSea:'<circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><circle cx="11" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1" fill="currentColor" stroke="none"/><circle cx="8" cy="15" r=".9" fill="currentColor" stroke="none"/><circle cx="16" cy="9" r=".9" fill="currentColor" stroke="none"/>',
 search:'<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
 book:'<path d="M12 5C8 3 4 3 2 4v16c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-1-10 1Zm0 0v16"/>',
 copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"/>',
 print:'<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 15h12v6H6z"/>',
 eraser:'<path d="m20 20-8-8M4 14 14 4a3 3 0 0 1 4 0l3 3a3 3 0 0 1 0 4L11 21H7l-3-3a3 3 0 0 1 0-4ZM10 21h11"/>',
 more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
 calc:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 10h2m4 0h2m-8 4h2m4 0h2m-8 4h2m4 0h2"/>',
 heat:'<path d="M10 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0ZM13 9v8"/>',
 zap:'<path d="m13 2-9 12h8l-1 8 9-12h-8l1-8Z"/>',
 file:'<path d="M6 2h8l5 5v15H6V2Zm8 0v5h5M9 12h7M9 16h7"/>',
 wrench:'<path d="M14 7a5 5 0 0 0-6 6l-5 5a2 2 0 0 0 3 3l5-5a5 5 0 0 0 6-6l-3 3-3-3 3-3Z"/>'
 });
 // IDs mapeados são estáveis; texto contextual cobre os botões gerados por scripts.
 const idMap=Object.freeze({
 'si-nav-continue':['right','label'],'si-activity-finish':['check','label'],'si-activity-exit':['stop','label'],
 'scene-undo':['undo','icon'],'scene-clear':['eraser','label'],'si-compact-clear':['eraser','label'],
 'scene-menu-toggle':['more','label'],'si-expand-structure':['expand','icon'],
 'silm-open-periodic':['grid','label'],'silm-start':['play','label'],'silm-add':['plus','label'],
 'silm-organize':['lattice','label'],'silm-free':['undo','label'],'si-dock-viewer-back':['left','icon'],
 'si-expand':['expand','icon'],'silm-electrons':['electronSea','label'],'silm-motion':['play','label'],
 'silm-data-back':['left','icon'],'silm-export-legacy':['download','label'],'silm-export':['download','label'],
 'distribution-install':['download','label'],'distribution-check':['circle','label'],
 'silm-teacher-guide-close':['x','icon'],'silm-tour-skip':['skip','label'],
 'silm-tour-back':['left','icon'],'silm-tour-next':['right','icon'],
 'si-modal-cancel':['x','label'],'silm-close-periodic':['x','icon'],
 'manual-print':['print','label'],'manual-tour':['play','label'],'notebook-add':['save','label'],
 'theme-investigate':['lattice','label'],'theme-complete':['circle','label'],
 'teacher-submit':['check','label'],'teacher-cancel-edit':['x','label'],'teacher-copy':['copy','label'],
 'teacher-export':['download','label'],'teacher-import-open':['upload','label'],
 'teacher-export-all':['download','label'],'teacher-guide-open':['book','label'],'teacher-print':['print','label'],
 'teacher-material-open':['book','label'],'student-start':['play','label'],
 'route-mount':['play','label'],'route-archive':['file','label'],'route-complete':['check','label'],
 'route-report':['file','label'],'route-resume':['right','label'],'route-close':['stop','label'],
 'mission-mount':['play','label'],'mission-resume':['right','label'],'mission-complete':['check','label'],
 'mission-close':['stop','label'],'route-report-back':['left','label'],
 'route-report-refresh':['refresh','label'],'route-report-close':['stop','label'],
 'route-print':['print','label'],'route-print-blank':['print','label'],
 'si-startup-open':['wrench','label'],'si-drawer-install':['download','label']
 });
 const textRule=text=>{
  const s=String(text||'').replace(/\s+/g,' ').trim();if(!s)return null;
  const table=[
   [/^(Fechar|Sair do painel)\b/i,'x','icon'],[/^(Voltar|Retornar|Recuar)\b|^←/i,'left','label'],
   [/^(Próximo|Avançar)\b/i,'right',s==='Próximo'?'icon':'label'],
   [/^(Continuar|Retomar)\b/i,'right','label'],[/^Pular\b/i,'skip','label'],
   [/^(Concluir|Confirmar|Aplicar|Validar|Conferir)\b/i,'check','label'],
   [/^(Salvar|Registrar)\b/i,'save','label'],[/^(Editar|Renomear)\b/i,'edit',s==='Renomear'?'icon':'label'],
   [/^(Remover|Excluir|Apagar)\b/i,'trash','label'],[/^Encerrar\b/i,'stop','label'],
   [/^(Limpar|Cancelar seleção|Redefinir)\b/i,'eraser','label'],[/^(Cancelar|Agora não)\b/i,'x','label'],
   [/^Ver (em|estruturas em) lista$/i,'list','icon'],[/^Ver (em|estruturas em) grade$/i,'grid','icon'],
   [/^(Exibir no Foco|Em foco|Visualizar)\b/i,'eye','label'],
   [/^(Adicionar|Nova estrutura|Criar|Duplicar)\b|^\+\s*Nova/i,'plus','label'],
   [/^(Buscar|Pesquisar)$/i,'search','icon'],[/^(Ampliar|Expandir)\b/i,'expand','label'],
   [/^(Ajustar|Restaurar vista)$/i,'fit','icon'],
   [/^Reduzir microestrutura/i,'zoomOut','icon'],[/^Ampliar microestrutura/i,'zoomIn','icon'],
   [/^(Organizar|Montar)\b/i,'layers','label'],
   [/^(Iniciar|Começar|Investigar|Refazer|Executar|Ativar)\b/i,'play','label'],
   [/^(Ver aplicações|Tabela Periódica|Fontes)$/i,'grid','label'],
   [/^(Exportar|Baixar)\b/i,'download','label'],[/^(Importar|Abrir arquivo)\b/i,'upload','label'],
   [/^Copiar\b/i,'copy','label'],[/^Imprimir\b/i,'print','label'],[/^Calcular\b/i,'calc','label'],
   [/^Aquecer\b/i,'heat','label'],[/^Aplicar campo\b/i,'zap','label'],
   [/^(Mostrar|Ocultar)\b/i,'eye','label'],[/^Desfazer\b/i,'undo','icon'],
   [/^(Ver detalhes|Sobre esta|Ver orientações|Ajuda)\b/i,'info','label'],
   [/^(Abrir relatório|Relatório)$/i,'file','label'],
   [/^(Selecionar várias|Marcar como|Rever na cena)\b/i,'circle','label']
  ];
  const hit=table.find(([regex])=>regex.test(s));return hit?[hit[1],hit[2]]:null;
 };
 const getName=button=>button.dataset.silmIconGenerated==='true'?(button.textContent||'').trim():(button.getAttribute('aria-label')||button.textContent||'').trim();
 function rule(button){
  if(button.closest('[data-silm-no-icons]')||button.hasAttribute('data-silm-no-icon'))return null;
  // Não duplicar controles que já são iconográficos, como menu, acessibilidade,
  // barra da rede, projeção e botões de exibição atômica.
  if(button.querySelector('svg:not(.silm-action-icon),img,input,select'))return null;
  if(button.matches('.silm-joule-step'))return {icon:'skip',mode:'icon',name:getName(button)};
  if(button.matches('.silm-workshop-scale,.silm-lattice-nav button,[role=tab],[role=option]'))return null;
  const text=button.textContent.trim().replace(/\s+/g,' ');
  let spec;
  if(button.matches('.silm-structure-layout'))spec=/lista/i.test(button.getAttribute('aria-label')||text)?['list','icon']:['grid','icon'];
  else if(button.matches('.silm-workshop-micro-control')){
   const name=button.getAttribute('aria-label')||text;
   spec=/Reduzir/i.test(name)?['zoomOut','icon']:/Ampliar/i.test(name)?['zoomIn','icon']:['fit','icon'];
  }else if(button.matches('.si-dock-close,[data-close-dialog]'))spec=['x','icon'];
  else if(button.id==='silm-tour-next'&&/^Concluir\b/.test(text))spec=['check','icon'];
  else if(button.id==='si-modal-confirm')spec=textRule(text)||['check','label'];
  else if(button.id&&idMap[button.id])spec=idMap[button.id];
  else if(button.id?.startsWith('silm-dependency-go-'))spec=['right','label'];
  else if(button.id?.startsWith('silm-module-activate-'))spec=['play','label'];
  else spec=textRule(text);
  if(!spec||!icons[spec[0]])return null;
  if(/^(Apagar|Excluir|Remover|Encerrar|Limpar estrutura)\b/i.test(text))spec=[spec[0],'label'];
  if(button.id==='si-modal-confirm')spec=[spec[0],'label'];
  return {icon:spec[0],mode:spec[1],name:getName(button)||text};
 }
 function svg(name){
  const out=document.createElementNS(NS,'svg');
  for(const [key,value]of Object.entries({viewBox:'0 0 24 24',width:'20',height:'20',fill:'none',stroke:'currentColor','stroke-width':'1.8','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true',focusable:'false'}))out.setAttribute(key,value);
  out.classList.add('silm-action-icon');out.innerHTML=icons[name];return out;
 }
 function decorate(button){
  if(!(button instanceof HTMLButtonElement)||button.querySelector(':scope > svg.silm-action-icon'))return;
  const c=rule(button);if(!c)return;
  if(c.mode==='icon'){
   const name=document.createElement('span');name.className='silm-action-label';name.setAttribute('aria-hidden','true');
   while(button.firstChild)name.append(button.firstChild);
   button.append(svg(c.icon),name);
   button.classList.remove('silm-action--with-icon');button.classList.add('silm-action--icon');
   if(!button.hasAttribute('aria-label')||button.dataset.silmIconGenerated==='true'){
    button.setAttribute('aria-label',c.name);button.dataset.silmIconGenerated='true';
   }
   if(!button.hasAttribute('title')||button.dataset.silmIconTitle==='true'){
    button.setAttribute('title',c.name);button.dataset.silmIconTitle='true';
   }
  }else{
   button.prepend(svg(c.icon));button.classList.remove('silm-action--icon');button.classList.add('silm-action--with-icon');
  }
  button.dataset.silmAction=c.icon;
 }
 const pending=new Set();let flushScheduled=false;
 function scan(root){
  if(!root||root.nodeType!==1)return;
  if(root.matches?.('button'))pending.add(root);
  for(const b of root.querySelectorAll?.('button')||[])pending.add(b);
  if(flushScheduled)return;flushScheduled=true;
  queueMicrotask(()=>{flushScheduled=false;const batch=[...pending];pending.clear();for(const button of batch)if(button.isConnected)decorate(button);});
 }
 function init(){
  scan(document.body);
  new MutationObserver(mutations=>{
   for(const m of mutations){if(m.type!=='childList')continue;
    for(const n of m.addedNodes)if(n.nodeType===1)scan(n);
    const p=m.target.nodeType===1?m.target:m.target.parentElement;
    if(p?.closest){const b=p.closest('button');if(b)scan(b);}
   }
  }).observe(document.body,{childList:true,subtree:true});
 }
 function audit(){
  const all=[...document.querySelectorAll('button')],mapped=all.filter(b=>!!b.querySelector(':scope > .silm-action-icon'));
  const native=all.filter(b=>!mapped.includes(b)&&!!b.querySelector('svg,img'));
  return {total:all.length,mapped:mapped.length,native:native.length,remaining:all.length-mapped.length-native.length,
   notMapped:all.filter(b=>!mapped.includes(b)&&!native.includes(b)).map(b=>({id:b.id||null,label:b.textContent.trim().slice(0,80)}))};
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 return Object.freeze({audit,scan,available:Object.keys(icons),mappedIds:Object.keys(idMap)});
})();
