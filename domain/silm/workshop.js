'use strict';
window.SILM=window.SILM||{};
SILM.workshop=(()=>{
 const REFERENCES=Object.freeze([
 {id:'cobre-motor',atomicNumber:29,title:'Motor elétrico',context:'Ventiladores, eletrodomésticos e ferramentas',component:'Enrolamentos do estator e do rotor',material:'Fios de cobre condutor',visual:'motor',composition:[['Cobre','enrolamentos condutores'],['Aço elétrico à base de ferro','núcleo magnético laminado'],['Alumínio ou aço','carcaça e suporte, conforme o projeto'],['Verniz e polímeros','isolamento elétrico']],explanation:'O cobre está nos enrolamentos. O motor completo reúne componentes de materiais diferentes; a carcaça não deve ser confundida com o condutor.',caveat:'Exemplo de arquitetura de motor. Materiais e proporções variam com projeto e aplicação.'},
 {id:'cobre-latao',atomicNumber:29,title:'Conexão hidráulica de latão',context:'Torneiras, válvulas e conexões',component:'Corpo da conexão',material:'Liga cobre–zinco (latão)',visual:'fitting',composition:[['Cobre','componente principal da liga'],['Zinco','elemento de liga'],['Aço ou polímero','fixadores, vedações e conexões adjacentes']],explanation:'O cobre integra o latão junto com zinco. A peça também pode ter vedantes e outros componentes.',caveat:'A família de latões é ampla; a proporção e outros elementos dependem da especificação.'},
 {id:'ferro-parafuso',atomicNumber:26,title:'Parafuso de aço',context:'Móveis, equipamentos e estruturas',component:'Corpo roscado do parafuso',material:'Aço-carbono ou aço-liga à base de ferro',visual:'screw',composition:[['Ferro','matriz metálica da liga'],['Carbono','participa da constituição do aço'],['Manganês e outros elementos','dependem do grau do aço'],['Zinco ou outro revestimento','pode proteger a superfície, quando especificado']],explanation:'O parafuso não é ferro puro. O ferro participa de uma liga; o revestimento, quando existe, é uma camada distinta do núcleo.',caveat:'A composição depende da classe, norma, tratamento térmico e acabamento.'},
 {id:'ferro-transformador',atomicNumber:26,title:'Transformador elétrico',context:'Distribuição de energia e fontes de alimentação',component:'Núcleo magnético laminado',material:'Aço elétrico ferro–silício',visual:'transformer',composition:[['Ferro','base da liga do núcleo'],['Silício','elemento de liga que altera propriedades magnéticas'],['Cobre ou alumínio','enrolamentos, conforme o projeto'],['Verniz e isolamento','separam lâminas e enrolamentos']],explanation:'O ferro está no núcleo magnético, não nos enrolamentos. A máquina reúne núcleo, bobinas e isolantes.',caveat:'Aço elétrico tem especificações próprias; esta referência não substitui a ficha do transformador.'},
 {id:'magnesio-notebook',atomicNumber:12,title:'Carcaça de equipamento portátil',context:'Notebooks e equipamentos leves',component:'Tampa ou estrutura externa',material:'Liga de magnésio; algumas famílias incluem alumínio e zinco',visual:'laptop',composition:[['Magnésio','base da liga leve'],['Alumínio e zinco','elementos de liga em famílias comuns'],['Polímeros e vidro','teclas, tela, isolantes e peças não metálicas'],['Cobre e aço','cabos, placas e fixadores internos']],explanation:'O magnésio está na liga de uma peça estrutural específica. O equipamento inteiro contém muitos outros materiais.',caveat:'Nem todo notebook usa carcaça de magnésio; a liga varia por modelo.'},
 {id:'magnesio-veiculo',atomicNumber:12,title:'Componente automotivo leve',context:'Volantes, suportes e carcaças de componentes',component:'Peça fundida ou suporte estrutural',material:'Liga de magnésio para aplicação automotiva',visual:'wheel',composition:[['Magnésio','base da liga'],['Alumínio, zinco ou manganês','possíveis elementos de liga'],['Aço','fixadores e interfaces'],['Polímeros','acabamentos e peças de contato']],explanation:'O magnésio pode compor uma peça para reduzir massa. O veículo combina ligas e materiais diferentes.',caveat:'A composição deve ser confirmada pela especificação da peça; famílias de ligas não são intercambiáveis.'},
 {id:'lantanio-bateria',atomicNumber:57,title:'Bateria recarregável NiMH',context:'Pilhas recarregáveis e módulos de bateria',component:'Liga armazenadora de hidrogênio no eletrodo negativo',material:'Liga à base de níquel com terras raras, podendo conter lantânio',visual:'battery',composition:[['Lantânio e outras terras raras','presentes em algumas formulações de mischmetal'],['Níquel','base comum da liga armazenadora de hidrogênio'],['Cobalto, manganês ou alumínio','adições possíveis conforme a formulação'],['Outros materiais','eletrodo positivo, eletrólito, separador e invólucro']],explanation:'O lantânio pode integrar a liga do eletrodo negativo. A bateria reúne ainda outros eletrodos, eletrólito, separador e invólucro.',caveat:'As ligas AB5 e as misturas de terras raras variam; nem toda NiMH contém a mesma quantidade de lantânio.'},
 {id:'lantanio-isqueiro',atomicNumber:57,title:'Pedra de isqueiro',context:'Isqueiros mecânicos e acendedores',component:'Liga pirofórica raspada pela roda',material:'Liga de terras raras com ferro, podendo conter lantânio',visual:'lighter',composition:[['Lantânio e cério','podem integrar a mistura de terras raras'],['Outras terras raras','dependem da formulação'],['Ferro','componente comum da liga pirofórica'],['Aço e polímeros','roda, corpo e demais partes']],explanation:'A pedra não é lantânio puro. É uma liga pirofórica de terras raras e ferro; o isqueiro acrescenta roda de aço e outros materiais.',caveat:'Formulações comerciais variam e precisam ser verificadas para um produto específico.'}
 ]);
 const BY_ID=new Map(REFERENCES.map(x=>[x.id,x]));
 const list=z=>REFERENCES.filter(x=>x.atomicNumber===Number(z));
 const get=id=>BY_ID.get(String(id))||null;
 const valid=()=>{const ids=new Set();for(const x of REFERENCES){if(!x.id||ids.has(x.id)||!Number.isInteger(x.atomicNumber)||!x.component||!x.material||!x.composition?.length||!x.caveat)return false;ids.add(x.id);}return true;};
 const SVG={
  motor:'<svg viewBox="0 0 180 112" role="img" aria-label="Esquema de motor elétrico"><rect x="28" y="25" width="112" height="62" rx="15"/><path d="M140 43h16v26h-16M28 43H15v26h13M51 25v62M117 25v62M72 32v48M94 32v48"/><circle cx="84" cy="56" r="23"/><circle cx="84" cy="56" r="8"/><path class="silm-workshop-highlight" d="M60 36q24-16 48 0M60 76q24 16 48 0"/></svg>',
  fitting:'<svg viewBox="0 0 180 112" role="img" aria-label="Esquema de conexão metálica"><path d="M28 42h27V30h70v12h27v28h-27v12H55V70H28z"/><path d="M55 30v52m70-52v52"/><path class="silm-workshop-highlight" d="M58 35h64v42H58z"/></svg>',
  screw:'<svg viewBox="0 0 180 112" role="img" aria-label="Esquema de parafuso"><path d="M42 31h36v14l-8 7v46H50V52l-8-7zM70 56l16-8m-16 20 16-8m-16 20 16-8m-16 20 16-8"/><path class="silm-workshop-highlight" d="M50 52h20v46H50z"/></svg>',
  transformer:'<svg viewBox="0 0 180 112" role="img" aria-label="Esquema de transformador"><path d="M28 25h124v62H28zM42 36h96v40H42z"/><path d="M55 36v40m12-40v40m12-40v40m12-40v40m12-40v40m12-40v40"/><path class="silm-workshop-highlight" d="M43 37h94v38H43z"/></svg>',
  laptop:'<svg viewBox="0 0 180 112" role="img" aria-label="Esquema de notebook"><path d="M39 23h102v63H39zM23 91h134l-13 9H36z"/><path class="silm-workshop-highlight" d="M45 29h90v51H45z"/></svg>',
  wheel:'<svg viewBox="0 0 180 112" role="img" aria-label="Esquema de componente automotivo"><circle cx="86" cy="56" r="38"/><circle cx="86" cy="56" r="12"/><circle cx="86" cy="56" r="26"/><path d="M86 18v26m0 24v26M48 56h26m24 0h26M59 29l18 18m18 18 18 18m0-54L95 47M77 65 59 83"/><path class="silm-workshop-highlight" d="M86 20a36 36 0 0 1 34 24"/></svg>',
  battery:'<svg viewBox="0 0 180 112" role="img" aria-label="Esquema de bateria recarregável"><rect x="42" y="24" width="96" height="68" rx="8"/><path d="M68 24v-8h18v8m20 0v-8h18v8"/><path class="silm-workshop-highlight" d="M54 34h72v48H54z"/></svg>',
  lighter:'<svg viewBox="0 0 180 112" role="img" aria-label="Esquema de pedra de isqueiro"><path d="M48 74h82V97H48zM65 74V46h48v28"/><circle cx="89" cy="35" r="22"/><circle cx="89" cy="35" r="8"/><path class="silm-workshop-highlight" d="M89 12a23 23 0 0 1 21 14"/></svg>'
 };
 const MICRO='<svg viewBox="0 0 220 110" role="img" aria-label="Esquema didático de grãos metálicos"><path d="M8 10 44 8 62 31 45 58 12 53zM44 8l43 2 14 26-39-5zM87 10l48-1 13 26-47 1zM135 9l37 5 10 30-34-9zM172 14l39-2 1 43-30-11zM12 53l33 5 23 30-48 9zM45 58l39-21 27 32-42 28zM84 37l48 0 11 32-32 28zM132 37l34 8 22 31-45-7zM166 45l46 10-4 36-34-15z"/><path class="silm-workshop-highlight" d="M44 9 62 31 45 58m42-48 14 26-17 28m48-55 13 26-13 29"/></svg>';
 const LATTICE='<svg viewBox="0 0 220 110" role="img" aria-label="Esquema de rede cristalina"><path d="M36 29 110 9l74 20v52l-74 20-74-20zM36 29l74 21 74-21M110 50v51"/><g class="silm-workshop-atoms"><circle cx="36" cy="29" r="5"/><circle cx="110" cy="9" r="5"/><circle cx="184" cy="29" r="5"/><circle cx="36" cy="81" r="5"/><circle cx="110" cy="101" r="5"/><circle cx="184" cy="81" r="5"/><circle cx="110" cy="50" r="7"/></g></svg>';
 const node=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
 const IMAGE_LABELS={motor:'Motor aberto com enrolamentos de cobre',fitting:'Conexão hidráulica de latão',screw:'Parafuso de aço com revestimento metálico',transformer:'Transformador com núcleo laminado e bobinas',laptop:'Notebook com a carcaça inferior removida',wheel:'Estrutura metálica de um volante',battery:'Pilhas NiMH com corte ilustrativo do eletrodo',lighter:'Isqueiro mecânico com pedra pirofórica'};
 const visual=(kind,scale)=>{
  if(scale===2)return MICRO;
  if(scale>=3)return LATTICE;
  if(!IMAGE_LABELS[kind])return LATTICE;
  return '<figure class="silm-workshop-photo"><img src="assets/workshop/'+kind+'.webp" width="960" height="640" loading="lazy" decoding="async" alt="'+IMAGE_LABELS[kind]+'"><figcaption>Ilustração realista gerada por IA · referência genérica</figcaption></figure>';
 };
 function itemCard(item,onAction,label='Investigar componente'){
  const article=node('article','silm-workshop-card');article.dataset.referenceId=item.id;
  const art=node('div','silm-workshop-art');art.innerHTML=visual(item.visual,1);
  const body=node('div','silm-workshop-card-body');
  body.append(node('p','silm-workshop-eyebrow',item.context),node('h3','',item.title),node('p','silm-workshop-component-label','Componente: '+item.component),node('p','silm-workshop-material','Material: '+item.material),node('p','silm-workshop-card-note',item.explanation),node('p','silm-workshop-caveat',item.caveat));
  const b=node('button','button outline',label);b.type='button';b.addEventListener('click',()=>onAction(item));body.append(b);article.append(art,body);return article;
 }
 function renderDiscovery(host,{element,notice='',onOpenPeriodic=()=>{},onContinue=()=>{},onInvestigate=()=>{},onStartDirect=()=>{}}={}){
  host.replaceChildren();host.hidden=false;const s=node('section','silm-workshop-discovery');
  s.append(node('p','silm-workshop-eyebrow','OFICINA DOS METAIS · INVESTIGAÇÃO POR ELEMENTO'),node('h2','','Onde encontramos '+(element?.name||'um metal')+'?'),
   node('p','silm-workshop-intro',element?'Escolha um componente que contenha o elemento. O objeto completo reúne outros metais, ligas, isolantes e materiais.':'Comece selecionando um metal na Tabela Periódica.'));
  if(notice)s.append(node('p','silm-workshop-pending-notice',notice));
  const actions=node('div','silm-workshop-discovery-actions'),table=node('button','button primary','Tabela Periódica'),free=node('button','button outline','Montagem livre');
  table.type='button';free.type='button';table.addEventListener('click',onOpenPeriodic);free.addEventListener('click',onContinue);actions.append(table,free);s.append(actions);
  if(!element){host.append(s);return;}
  const refs=list(element.atomicNumber);
  if(!refs.length){s.append(node('p','silm-workshop-empty','Esta primeira curadoria ainda não possui aplicações cadastradas para este metal. A investigação direta continua disponível.'));
   const direct=node('button','button outline','Iniciar investigação sem referência');direct.type='button';direct.addEventListener('click',onStartDirect);s.append(direct);host.append(s);return;}
  s.append(node('h3','silm-workshop-section-title','Materiais e dispositivos de referência'));
  const grid=node('div','silm-workshop-grid');for(const item of refs)grid.append(itemCard(item,onInvestigate));s.append(grid);host.append(s);
 }
 function renderReference(host,{element,item=null,items=[],scale=1,onChoose=()=>{},onScale=()=>{},onOpenPeriodic=()=>{}}={}){
  host.replaceChildren();host.hidden=false;
  const s=node('section','silm-workshop-reference');
  if(scale===2){
   s.classList.add('silm-workshop-micro-mode');
   const heading=node('div','silm-workshop-micro-heading'),titles=node('div','silm-workshop-micro-titles');
   titles.append(node('h2','','Microestrutura · '+element.name));
   titles.append(node('p','silm-workshop-micro-component',item?item.component+' · '+item.material:'Policristal didático · '+element.symbol));
   const table=node('button','button outline','Tabela Periódica');table.type='button';table.addEventListener('click',onOpenPeriodic);
   heading.append(titles,table);s.append(heading);
   if(SILM.microstructure?.create)s.append(SILM.microstructure.create({element,item}));
   else{const fallback=node('div','silm-workshop-reference-art');fallback.innerHTML=MICRO;s.append(fallback);}
  }else{
   const top=node('div','silm-workshop-reference-top'),art=node('div','silm-workshop-reference-art');
   if(item){art.innerHTML=visual(item.visual,1);top.append(art);}
   const summary=node('div','silm-workshop-reference-summary');summary.append(node('p','silm-workshop-eyebrow','OBJETO E COMPOSIÇÃO'),node('h2','','Investigando '+element.name));
  if(item){summary.append(node('p','silm-workshop-selected-title',item.title+' · '+item.component),node('p','silm-workshop-material','Material do componente: '+item.material),node('p','silm-workshop-card-note',item.explanation));
   const ul=node('ul','silm-workshop-composition');for(const [name,role]of item.composition){const li=node('li','');li.append(node('strong','',name),node('span','',role));ul.append(li);}const details=node('details','silm-workshop-materials');details.append(node('summary','','Composição e fonte'),ul,node('p','silm-workshop-caveat',item.caveat));
   const source=node('a','','Fonte da aplicação');source.target='_blank';source.rel='noopener noreferrer';
   const sources={12:'https://periodic-table.rsc.org/element/12/magnesium',29:'https://periodic-table.rsc.org/element/29/copper',57:'https://periodic-table.rsc.org/element/57/lanthanum'};
   source.href=sources[item.atomicNumber]||(item.id==='ferro-transformador'?'https://www.thyssenkrupp-steel.com/en/industries/energy/energy.html':'https://worldsteel.org/about-steel/what-is-steel/');
   details.append(source);summary.append(details,node('p','silm-workshop-caveat','A rede representa o elemento de referência. A peça pode conter outras fases e materiais.'));
  }else summary.append(node('p','silm-workshop-intro','Associe uma aplicação cotidiana para manter o vínculo entre o objeto e a organização interna. A investigação atual permanece preservada.'));
  const table=node('button','button outline','Tabela Periódica');table.type='button';table.addEventListener('click',onOpenPeriodic);summary.append(table);top.append(summary);s.append(top);
  }
  const scales=node('div','silm-workshop-scales');scales.setAttribute('role','group');scales.setAttribute('aria-label','Escalas de investigação');
  for(const [i,label]of ['Objeto e componente','Microestrutura','Rede e célula','Ambiente atômico'].entries()){const b=node('button','silm-workshop-scale',String(i+1)+' · '+label);b.type='button';b.setAttribute('aria-pressed',String(scale===i+1));b.addEventListener('click',()=>onScale(i+1));scales.append(b);}s.append(scales);
  if(scale!==2)s.append(node('p','silm-workshop-scale-note',scale===2?'Esquema de grãos didático; não representa uma metalografia medida.':scale===3?'A rede e a célula unitária estão na área científica abaixo. A escala visual não altera os parâmetros cristalográficos.':scale===4?'Um centro está selecionado e os vizinhos destacados pertencem à mesma rede. Selecione outro átomo diretamente na cena.':'O componente permanece identificado enquanto a visualização se aproxima; o zoom não troca o material.'));
  if(scale!==2&&items.some(other=>other.id!==item?.id)){const alt=node('div','silm-workshop-alternatives'),row=node('div','silm-workshop-alternative-list');alt.append(node('h3','','Outras aplicações com '+element.name));
   for(const other of items){if(other.id===item?.id)continue;const b=node('button','silm-workshop-alternative',other.title);b.type='button';b.addEventListener('click',()=>onChoose(other));row.append(b);}alt.append(row);s.append(alt);}
  host.append(s);
 }
 if(!valid())throw new Error('Catálogo inicial da Oficina dos Metais inválido.');
 return Object.freeze({references:REFERENCES,list,get,valid,renderDiscovery,renderReference});
})();
