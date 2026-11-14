'use strict';
window.SILM=window.SILM||{};
/**
 * Painel dentro do controle Explorar > Elétrica. Curvas publicadas
 * não correspondem a ρtotal de qualquer peça, e NÃO calibram Joule.
 */
SILM.createPGMIntrinsicPanel=({prefix='silm-pgm'}={})=>{
 const section=document.createElement('section');
 section.className='silm-research-reference silm-pgm-intrinsic';
 section.hidden=true;section.setAttribute('aria-label','Curva científica de resistividade intrínseca');
 const title=document.createElement('strong');
 const caution=document.createElement('p');caution.className='silm-research-note';
 caution.textContent='ρᵢ é a resistividade INTRÍNSECA avaliada, sem a parcela residual ρ₀ de defeitos e impurezas. Uma peça real possui ρtotal≈ρᵢ+ρ₀ nas condições de aplicação da regra de Matthiessen. Não converter este valor em condutividade macroscópica de um objeto do SILM. Temperatura e fase declaradas; pressão/amostra simulada não homologadas em CNTP.';
 const label=document.createElement('label');label.className='silm-research-label';
 const select=document.createElement('select');select.id=prefix+'-intrinsic-temperature';
 select.setAttribute('aria-label','Temperatura da curva avaliada, em kelvins');
 label.htmlFor=select.id;label.append(select);
 const result=document.createElement('p');result.className='silm-pgm-intrinsic-result';
 const directional=document.createElement('p');directional.className='silm-research-note';
 const provenance=document.createElement('p');provenance.className='silm-research-note';
 const graph=document.createElementNS('http://www.w3.org/2000/svg','svg');
 graph.setAttribute('viewBox','0 0 330 160');
 graph.setAttribute('role','img');graph.setAttribute('class','silm-pgm-intrinsic-chart');
 const chartTitle=document.createElementNS('http://www.w3.org/2000/svg','title');
 chartTitle.textContent='Pontos tabelados da resistividade intrínseca em função da temperatura';
 const chartDescription=document.createElementNS('http://www.w3.org/2000/svg','desc');
 chartDescription.textContent='Exibe exclusivamente os pontos publicados; segmentos retos apenas auxiliam a leitura visual, não são um modelo de interpolação.';
 graph.append(chartTitle,chartDescription);
 const plotGroup=document.createElementNS('http://www.w3.org/2000/svg','g');
 graph.append(plotGroup);
 const scroller=document.createElement('div');scroller.className='silm-research-scroll';
 const table=document.createElement('table');table.className='silm-pgm-intrinsic-table';
 const head=document.createElement('thead'),trh=document.createElement('tr');
 for(const heading of ['T (K)','ρᵢ médio (µΩ·cm)','ρᵢ ⟂ c (µΩ·cm)','ρᵢ ∥ c (µΩ·cm)']){
  const th=document.createElement('th');th.scope='col';th.textContent=heading;trh.append(th);
 }
 head.append(trh);
 const body=document.createElement('tbody');table.append(head,body);scroller.append(table);
 const source=document.createElement('a');source.target='_blank';source.rel='noopener noreferrer';
 const qualifier=document.createElement('p');qualifier.className='silm-research-note';
 section.append(title,caution,label,result,directional,graph,scroller,provenance,source,qualifier);
 let currentZ=null,profile=null;
 const fmt=(n,d=3)=>Number(n).toLocaleString('pt-BR',{maximumFractionDigits:d});
 const svg=(name,props,content)=>{
  const el=document.createElementNS('http://www.w3.org/2000/svg',name);
  for(const [k,v] of Object.entries(props||{}))el.setAttribute(k,String(v));
  if(content!==undefined)el.textContent=content;
  return el;
 };
 const register=SILM.researchIntrinsicPGM;
 const xOf=T=>42+270*(T-230)/70;
 function redraw(){
  const index=Number(select.value);
  const row=profile.curve[index]||profile.icePoint;
  const limits=profile.curve.map(x=>x.rhoIntrinsicMicroOhmCm);
  const minV=Math.min(...limits),maxV=Math.max(...limits);
  const yOf=y=>126-96*(y-minV)/(maxV-minV);
  const pointStrings=profile.curve.map(p=>xOf(p.temperatureK)+','+yOf(p.rhoIntrinsicMicroOhmCm)).join(' ');
  plotGroup.replaceChildren(
   svg('line',{x1:42,y1:126,x2:317,y2:126,class:'silm-pgm-axis'}),
   svg('line',{x1:42,y1:18,x2:42,y2:126,class:'silm-pgm-axis'}),
   svg('polyline',{points:pointStrings,fill:'none',class:'silm-pgm-polyline'})
  );
  for(const [idx,p] of profile.curve.entries()){
   plotGroup.append(svg('circle',{
    cx:xOf(p.temperatureK),cy:yOf(p.rhoIntrinsicMicroOhmCm),
    r:idx===index?4.4:2.5,class:idx===index?'silm-pgm-marker-selected':'silm-pgm-marker'
   }));
  }
  plotGroup.append(
   svg('text',{x:42,y:145,class:'silm-pgm-axis-label'},'230 K'),
   svg('text',{x:280,y:145,class:'silm-pgm-axis-label'},'300 K'),
   svg('text',{x:46,y:12,class:'silm-pgm-axis-label'},'ρᵢ (µΩ·cm)')
  );
  const ice=Number(row.temperatureK)===273.15;
  result.textContent='T = '+fmt(row.temperatureK,2)+' K · ρᵢ'+
   (profile.selectedOrientation.includes('average')?' médio':'')+
   ' = '+fmt(row.rhoIntrinsicMicroOhmCm,3)+' µΩ·cm'+
   (ice&&profile.selectedUncertaintyMicroOhmCm!==null?
    ' (seleção ± '+fmt(profile.selectedUncertaintyMicroOhmCm,3)+' µΩ·cm)':'');
  if(row.rhoPerpendicularMicroOhmCm!==null&&row.rhoParallelMicroOhmCm!==null){
   directional.textContent='Cristal HC · ρᵢ perpendicular ao eixo c: '+
    fmt(row.rhoPerpendicularMicroOhmCm,3)+' µΩ·cm · paralelo: '+
    fmt(row.rhoParallelMicroOhmCm,3)+' µΩ·cm. A média é a seleção da publicação, não uma média entre fontes.';
  }else if(profile.phase.includes('HC')){
   directional.textContent='Cristal HC: esta tabela não publica separadamente as duas orientações nesta temperatura. Não foram preenchidas por aproximação.';
  }else{
   directional.textContent='Estrutura CFC: perfil intrínseco avaliado sem componentes direcionais adicionais.';
  }
  body.replaceChildren();
  for(const [i,p] of profile.curve.entries()){
   const tr=document.createElement('tr');
   if(i===index)tr.className='silm-pgm-active-row';
   const vals=[fmt(p.temperatureK,2),fmt(p.rhoIntrinsicMicroOhmCm,3),
    p.rhoPerpendicularMicroOhmCm===null?'—':fmt(p.rhoPerpendicularMicroOhmCm,3),
    p.rhoParallelMicroOhmCm===null?'—':fmt(p.rhoParallelMicroOhmCm,3)];
   for(const v of vals){const td=document.createElement('td');td.textContent=v;tr.append(td);}
   body.append(tr);
  }
  section.dataset.resistivityKind='intrinsic-evaluated-not-total';
  section.dataset.referenceStatus='not-cntp-homologated';
 }
 select.addEventListener('change',redraw);
 function update({atomicNumber=null,active=null}={}){
  if(active!=='electrical'){section.hidden=true;return;}
  const next=register?.get(atomicNumber);
  if(!next){section.hidden=true;return;}
  if(next.atomicNumber!==currentZ){
   profile=next;currentZ=next.atomicNumber;
   select.replaceChildren();
   for(const [i,p] of profile.curve.entries()){
    const option=document.createElement('option');
    option.value=String(i);
    option.textContent=fmt(p.temperatureK,2)+' K';
    select.append(option);
   }
   const idx=profile.curve.findIndex(p=>p.temperatureK===273.15);
   select.value=String(idx);
   title.textContent='Curva avaliada de resistividade intrínseca · '+profile.name+' ('+profile.symbol+')';
   const publication=register.sources[profile.sourceId];
   source.href=publication.url;source.textContent='Fonte: Arblaster ('+publication.year+
    '), '+publication.title+' · '+profile.sourceTable;
   provenance.textContent='Fase considerada: '+profile.phase+' · '+profile.details;
   qualifier.textContent='Pontos da tabela científica, sem extrapolação e sem interpolação numérica. '+
    'A conexão visual entre pontos não representa uma nova equação. Pressão não registrada; '+
    'os valores NÃO calibram a corrente, a condutividade de uma amostra nem o efeito Joule.';
   redraw();
  }
  section.hidden=false;
 }
 return Object.freeze({root:section,update});
};
