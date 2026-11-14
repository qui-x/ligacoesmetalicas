'use strict';
window.SILM=window.SILM||{};
/** Referências de resistividade no controle preexistente Explorar > Elétrica.
 * Só consulta: jamais injeta coeficiente de resistividade no motor Joule.
 */
SILM.createElectricalEvidencePanel=({prefix='silm-electrical'}={})=>{
 const section=document.createElement('section');
 section.className='silm-research-reference silm-electrical-evidence';
 section.hidden=true;section.setAttribute('aria-label','Resistividade elétrica: fontes NBS avaliadas no ponto de gelo');
 const title=document.createElement('strong');
 const explanation=document.createElement('p');explanation.className='silm-research-note';
 explanation.textContent='Dados avaliados ou compilados para 273,15 K (ponto de gelo). Temperatura coincidente com a referência SILM; pressão não confirmada em 101325 Pa, nem amostra e pureza universais. NÃO homologados na CNTP e NÃO calibram a corrente nem o efeito Joule.';
 const label=document.createElement('label');label.className='silm-research-label';
 label.textContent='Escolher referência e amostra';
 const picker=document.createElement('select');picker.id=prefix+'-source';
 picker.setAttribute('aria-label','Referência elétrica: metal e amostra');
 label.htmlFor=picker.id;label.append(picker);
 const dl=document.createElement('dl');dl.className='silm-electrical-metrics';
 const note=document.createElement('p');note.className='silm-research-note';
 const source=document.createElement('a');source.target='_blank';source.rel='noopener noreferrer';
 source.textContent='Consultar publicação original';
 const comparison=document.createElement('p');comparison.className='silm-research-note';
 section.append(title,explanation,label,dl,note,source,comparison);
 label.after(picker);
 let options=[],stateKey='';
 const fmt=(n,d=5)=>Number(n).toLocaleString('pt-BR',{maximumFractionDigits:d});
 const scientific=SILM.researchElectricalIcepoint;
 function draw(){
  const row=options[Number(picker.value)]||options[0];
  if(!row)return;
  const ref=scientific.sources[row.sourceId];
  dl.replaceChildren();
  const metrics=[
   ['Resistividade total ρ',fmt(row.resistivityMicroOhmCm,4)+' µΩ·cm'],
   ['Resistividade ρ em SI',fmt(row.resistivityOhmM*1e8,4)+' × 10⁻⁸ Ω·m'],
   ['Condutividade σ = 1/ρ',fmt(row.conductivitySM/1e6,3)+' MS/m (calculada)'],
   ['Temperatura da fonte','273,15 K (0 °C)']
  ];
  for(const [k,v] of metrics){
   const dt=document.createElement('dt'),dd=document.createElement('dd');
   dt.textContent=k;dd.textContent=v;dl.append(dt,dd);
  }
  note.textContent='Fonte: '+ref.authors+' ('+ref.year+'), '+row.sourceTable+'. '+
   'Amostra: '+row.sample+'. '+row.note+
   ' Pressão numérica da fonte: não informada. Nenhuma equivalência universal entre metal puro, liga, geometria e processamento.';
  source.href=ref.url;
  source.textContent='Abrir '+ref.title;
  comparison.textContent=options.length>1?
   'Existem '+options.length+' referências para este elemento. Diferenças entre tabelas e amostras não autorizam média automática. Selecione outra referência para confrontar os valores.':
   'Esta é uma referência específica, não uma constante universal para qualquer peça do elemento.';
  section.dataset.scientificStatus='source-temperature-only';
 }
 picker.addEventListener('change',draw);
 function update({atomicNumber=null,active=null}={}){
  const shouldShow=active==='electrical'&&Number.isFinite(Number(atomicNumber));
  if(!shouldShow){section.hidden=true;return;}
  const records=scientific?.byAtomicNumber?.(atomicNumber)||[];
  if(!records.length){section.hidden=true;return;}
  const key=String(atomicNumber);
  if(key!==stateKey){
   stateKey=key;options=records;
   picker.replaceChildren();
   for(const [i,row] of records.entries()){
    const ref=scientific.sources[row.sourceId],option=document.createElement('option');
    option.value=String(i);
    option.textContent=ref.authors+' ('+ref.year+') · '+row.sourceType.replaceAll('-',' ');
    picker.append(option);
   }
   title.textContent='Resistividade e condutividade elétrica · '+records[0].symbol;
   draw();
  }
  section.hidden=false;
 }
 return Object.freeze({root:section,update});
};
