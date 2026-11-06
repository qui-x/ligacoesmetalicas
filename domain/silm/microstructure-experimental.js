'use strict';
window.SILM=window.SILM||{};
/* SILM Parte 5 — visualização de figura científica publicada.
   NÃO associa pontos/grãos a concentrações sem máscaras e calibração independentes.
   Figuras remotas preservadas integralmente; se não carregarem, há link do artigo original. */
SILM.experimentalMicrostructure=(()=>{
 const SAMPLES=Object.freeze({
  'al-si-rb-alloy3-metals-2023-1398':Object.freeze({
   id:'al-si-rb-alloy3-metals-2023-1398',
   label:'Al–12% Si modificado com Rb · liga 3',
   target:'Rb',evidence:'experimental-publication-preview',
   study:'Petrov et al., Metals 13 (2023), artigo 1398',
   doi:'10.3390/met13081398',
   article:'https://www.mdpi.com/2075-4701/13/8/1398',
   license:'CC BY 4.0 — autoria Petrov, Shlyaptseva, Ryakhovsky, Medvedeva e Tcherdyntsev (2023).',
   measured:{Rb:0.0075,Si:11.36,Fe:0.20,unit:'% em massa da amostra global'},
   siLength:'0,36–2,29 µm (faixa de médias dos componentes de Si eutético reportada para a liga 3)',
   sdas:'37 ± 9 µm (espaçamento entre braços dendríticos secundários)',
   methods:'Microscopia óptica, SEM–EDS e mapeamento elementar',
   chemistry:'Os autores detectaram Rb em baixa concentração associado ao silício eutético modificado; a evidência não determina o teor de Rb em cada grão.',
   // URLs do artigo; a disponibilidade externa é verificada pelo navegador.
   figures:Object.freeze([
    Object.freeze({id:'fig2',name:'Figura 2 — microestruturas',url:'https://www.mdpi.com/metals/metals-13-01398/article_deploy/html/images/metals-13-01398-g002.png',
     description:'Painéis ópticos de amostras diferentes: (a) sem adição e (b–e) ligas 1–4. A liga 3 corresponde ao painel (d).'}),
    Object.freeze({id:'fig3a',name:'Figura 3 — análises A–B',url:'https://www.mdpi.com/metals/metals-13-01398/article_deploy/html/images/metals-13-01398-g003a.png',
     description:'Dois campos de SEM/EDS da amostra liga 3, contendo micrografia e mapeamento. Os painéis não compartilham obrigatoriamente a mesma ampliação.'}),
    Object.freeze({id:'fig3b',name:'Figura 3 — análises C–D',url:'https://www.mdpi.com/metals/metals-13-01398/article_deploy/html/images/metals-13-01398-g003b.png',
     description:'Outros campos de SEM/EDS da mesma amostra. A seleção aqui corresponde à figura, não à composição de um grão específico.'})
   ])
  })
 });
 const el=(tag,cls,txt)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(txt!==undefined)d.textContent=txt;return d;};
 function create({sampleId}={}){
  const sample=SAMPLES[sampleId];
  if(!sample)return null;
  const section=el('section','silm-experiment-viewer');
  section.setAttribute('aria-label','Microestrutura experimental publicada, sem seleção química por grão');
  const viewport=el('div','silm-experiment-viewport');
  const figure=el('figure','silm-experiment-figure');
  const img=el('img','silm-experiment-image');
  img.loading='lazy';img.decoding='async';
  img.alt='Figura científica da publicação: '+sample.label+'. As cores e indicações são as da fonte original.';
  img.draggable=false;
  const fallback=el('div','silm-experiment-fallback');
  fallback.hidden=true;fallback.append(el('strong','','Imagem indisponível nesta conexão.'));
  fallback.append(el('p','','Acesse o artigo de origem para consultar a figura original. A ausência da imagem não autoriza substituí-la por uma ilustração apresentada como experimental.'));
  const original=el('a','silm-experiment-source','Abrir artigo e figuras originais');
  original.href=sample.article;original.target='_blank';original.rel='noopener noreferrer';fallback.append(original);
  const figcaption=el('figcaption','silm-experiment-caption');
  figure.append(img,figcaption,fallback);viewport.append(figure);
  const toolbar=el('div','silm-experiment-controls'),select=el('div','silm-experiment-figures');
  select.setAttribute('role','group');select.setAttribute('aria-label','Selecionar figura da publicação');
  const buttons=[];
  let active=sample.figures[0],zoom=1;
  const zoomOutput=el('output','silm-experiment-zoom','100%');
  const btn=(label,text,cb)=>{const b=el('button','silm-workshop-micro-control',text);b.type='button';b.setAttribute('aria-label',label);b.addEventListener('click',cb);return b;};
  function renderZoom(){img.style.transform='scale('+zoom+')';zoomOutput.value=Math.round(zoom*100)+'%';viewport.classList.toggle('is-zoomed',zoom>1);}
  function setFigure(f){
   active=f;
   img.hidden=false;fallback.hidden=true;
   img.src=f.url; // URL exata da figura publicada, sem modificações ou recoloração.
   figcaption.textContent=f.description;
   for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.figureId===f.id));
   zoom=1;renderZoom();
  }
  sample.figures.forEach(f=>{const b=btn('Visualizar '+f.name,f.name.replace('Figura ','Fig. '),()=>setFigure(f));
   b.dataset.figureId=f.id;buttons.push(b);select.append(b);});
  img.addEventListener('error',()=>{img.hidden=true;fallback.hidden=false;});
  const zoomControls=el('div','silm-experiment-zoom-controls');
  zoomControls.append(btn('Reduzir a figura','−',()=>{zoom=Math.max(1,Math.round((zoom-.25)*4)/4);renderZoom();}),
   zoomOutput,btn('Ampliar a figura','+',()=>{zoom=Math.min(4,Math.round((zoom+.25)*4)/4);renderZoom();}),
   btn('Restaurar o enquadramento','Ajustar',()=>{zoom=1;renderZoom();}));
  toolbar.append(select,zoomControls);
  const details=el('div','silm-experiment-evidence');
  const headline=el('p','silm-experiment-badge','EXPERIMENTAL · FIGURA PUBLICADA · CALIBRAÇÃO NÃO HOMOLOGADA NO SILM');
  const paragraph=el('p','silm-experiment-explainer',sample.chemistry);
  const data=el('p','silm-experiment-values',
   'Composição global: Rb 0,0075% · Si 11,36% (massa). Dimensões de Si eutético: '+sample.siLength+'. SDAS: '+sample.sdas+'.');
  const warning=el('p','silm-experiment-warning',
   'Ainda não é possível selecionar um grão real nesta figura para medir sua composição. Não há máscara de segmentação co-registrada nem calibração em µm/pixel validada. Ampliação × não é uma barra de escala.');
  const source=el('a','silm-experiment-source','Petrov e colaboradores · DOI '+sample.doi);
  source.href=sample.article;source.target='_blank';source.rel='noopener noreferrer';
  const rights=el('p','silm-experiment-license',sample.license);
  details.append(headline,paragraph,data,warning,source,rights);
  section.append(viewport,toolbar,details);
  setFigure(active);
  return section;
 }
 return Object.freeze({samples:SAMPLES,create});
})();