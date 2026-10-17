'use strict';
/* Ícones semânticos da família: uma única fonte de traços (24×24, contorno). Diagramas e instrumentos de cada
   domínio conservam seus SVGs próprios. Domínios podem registrar ícones novos sem alterar o núcleo. */
SimCore.icons=(()=>{
 const NS='http://www.w3.org/2000/svg';
 const paths={
  close:'M6 6l12 12M18 6 6 18',menu:'M4 6h16M4 12h16M4 18h16',
  collapse:'M9 4v5H4M9 9 3 3M15 20v-5h5M15 15l6 6M14 3h7v7M3 14v7h7',expand:'M8 3H3v5M3 3l6 6M16 21h5v-5M21 21l-6-6M14 3h7v7M3 14v7h7',
  chevron:'M9 6l6 6-6 6',dropdown:'M6 9.5 12 15.5l6-6M12 4v5',next:'M6 12h11M11.5 5.5 18 12l-6.5 6.5',previous:'M18 12H7M12.5 5.5 6 12l6.5 6.5',
  history:'M4 8a9 9 0 1 1-1 7M3 3v6h6M12 7v6l4 2',table:'M4 4h16v16H4ZM4 9h16M4 14h16M10 4v16',
  prepare:'M4 3h7M5 3v5l-3 7a3 3 0 0 0 3 4h5a3 3 0 0 0 3-4l-3-7V3M4 13h7M19 9c-1 2-3 4-3 6a3 3 0 0 0 6 0c0-2-2-4-3-6Z',
  setup:'M3 20h18M7 20V4h10M5 4h4M13 7h6M14 7v7a2 2 0 0 0 4 0V7M7 11h7M5 15h4',
  home:'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
  learn:'M8 16c0-3-3-4-3-8a7 7 0 0 1 14 0c0 4-3 5-3 8ZM8 19h8M10 22h4M9 8l3 3 3-3M12 11v5',
  mission:'M20 12a8 8 0 1 1-8-8M16 12a4 4 0 1 1-4-4M12 12l9-9M17 3h4v4',
  protocol:'M8 5H5v16h14V5h-3M8 3h8v4H8ZM8 11l1 1 2-2M13 11h3M8 16h8',
  lab:'M4 4h8M5 4v14a3 3 0 0 0 6 0V4M5 13h6M18 5c1 2 3 4 3 6a3 3 0 0 1-6 0c0-2 2-4 3-6Z',
  notebook:'M6 3h14v18H6ZM3 7h5M3 12h5M3 17h5M11 7h5M11 11h5M11 15h3',
  manual:'M12 5C8 3 4 3 2 4v16c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-6-1-10 1ZM12 5v16M16 6v7l2-2 2 2V6',
  mount:'M2 18h20M4 18v3M20 18v3M5 3h6M6 3v10a2 2 0 0 0 4 0V3M6 10h4M16 6v4l-3 5h8l-3-5V6M15 6h4',
  professor:'M8 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0M2 20v-5a3 3 0 0 1 6 0v5M13 6h8v15h-9V6h1M14 3h5v5h-5ZM15 12h3M15 16h3',
  accessibility:'M14 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0M4 8l8 2 8-2M12 10v5M7 22l5-7 5 7',
  settings:'M4 7h9M17 7h3M4 17h3M11 17h9M13 4v6M7 14v6',
  tour:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M16 8l-3 5-5 3 3-5Z',
  install:'M12 3v12M8 11l4 4 4-4M4 17v4h16v-4',
  about:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 11v6M12 7h.01',
  eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  ruler:'M4 17 17 4l3 3L7 20H4ZM8 13l2 2M11 10l2 2M14 7l2 2',
  chart:'M4 3v17h17M7 16l4-5 4 2 5-8',
  meter:'M3 4h12v15H3ZM6 7h6v5H6ZM15 7h3a3 3 0 0 1 3 3v4M19 14h3v7h-3ZM6 15h2M11 15h1',
  report:'M5 3h10l4 4v14H5ZM15 3v5h4M8 12h8M8 16h8',
  data:'M3 7V4h7l2 3h9v13H3ZM7 12h2M7 16h2M12 12h5M12 16h5',
  help:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M9 8a3 3 0 1 1 4 3c-1 1-1 1-1 3M12 17h.01',
  arrow:'M4 9v6M4 12h15M13.5 6.5 19 12l-5.5 5.5',back:'M20 9v6M20 12H5M10.5 6.5 5 12l5.5 5.5',
  explore:'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM16 16l4.5 4.5M8 11h6M11 8v6',
  calculator:'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01',
  search:'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0M15 15l6 6',projector:'M3 4h18v13H3ZM8 22l4-5 4 5M12 17v5',
  undo:'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',check:'M5 12l4 4L19 6',
  grid:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',resource:'M4 5h16v14H4zM8 9h8M8 13h5',
  objects:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM16.5 13v7M13 16.5h7',
  module:'M12 2 3 7v10l9 5 9-5V7zM3 7l9 5 9-5M12 12v10',
  info:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 11v6M12 7h.01',
  /* painel de Acessibilidade */
  'theme-dark':'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z',contrast:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 3v18M12 7h7M12 11h9M12 15h8',
  'text-size':'M5 20 11 4h2l6 16M8 14h8',spacing:'M3 12h18M6 9l-3 3 3 3M18 9l3 3-3 3',motion:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM10 9v6M14 9v6',
  opening:'M10 4v8a4 4 0 0 0 8 0V4M8 4h12M10 9h8M4 17l2 2M4 11h2M5 6l1.5 1.5',reading:'M4 6h16M4 10h16M4 14h10M4 18h7',
  'color-vision':'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  sound:'M4 9v6h4l5 4V5L8 9H4ZM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11',vibrate:'M8 4h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM3 9v6M21 9v6',
  libras:'M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-6.5a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-2.7L3.3 15a1.5 1.5 0 0 1 2.5-1.7L8 16',
  restore:'M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4'
 };
 const aliases={book:'manual',tube:'lab',flask:'lab',list:'protocol',routes:'protocol',access:'accessibility',teacher:'professor',
  montagem:'setup',preparo:'prepare',observe:'eye',observar:'eye',measure:'ruler',medir:'ruler',analyze:'chart',analisar:'chart',
  historico:'history',tabela:'table',view:'eye',ver:'eye',dados:'data',calcular:'calculator'};
 const resolve=name=>{const n=aliases[name]||name;return paths[n]?n:'help';};
 function element(name,className='core-icon'){
  const n=resolve(name),svg=document.createElementNS(NS,'svg');
  for(const [k,v]of [['viewBox','0 0 24 24'],['fill','none'],['stroke','currentColor'],['stroke-width','1.8'],['stroke-linecap','round'],['stroke-linejoin','round'],['aria-hidden','true'],['focusable','false']])svg.setAttribute(k,v);
  svg.setAttribute('class',className);svg.dataset.icon=n;const p=document.createElementNS(NS,'path');p.setAttribute('d',paths[n]);svg.append(p);return svg;
 }
 function register(name,d){if(!/^[a-z][a-z0-9-]{0,40}$/.test(name)||typeof d!=='string'||!/^[MmLlHhVvCcSsQqTtAaZz0-9 .,-]+$/.test(d))throw new TypeError('Ícone inválido: '+name);paths[name]=d;}
 /* [data-app-icon] em marcação estática vira o SVG correspondente. */
 function hydrate(root=document){root.querySelectorAll('[data-app-icon]').forEach(el=>el.replaceWith(element(el.dataset.appIcon,el.getAttribute('class')||'core-icon')));}
 return {element,register,hydrate,has:name=>!!paths[aliases[name]||name],get names(){return Object.keys(paths);}};
})();
