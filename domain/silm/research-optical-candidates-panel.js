'use strict';
window.SILM=window.SILM||{};
/**
 * Ficha de PESQUISA dentro de Explorar > Brilho metálico.
 * O valor R550 é apenas avaliação teórica/condicional de fonte em geometria
 * ideal, ou leitura gráfica aproximada. Não altera o motor/objeto/cor.
 * A compilação original por dataset AINDA exige auditoria individual da
 * referência e parâmetros amostrais; só a consistência de Fresnel é checada.
 */
SILM.createOpticalCandidatePanel=({prefix='silm-optical-candidate'}={})=>{
 const section=document.createElement('section');
 section.className='silm-research-reference silm-optical-candidate';
 section.hidden=true;
 section.setAttribute('aria-label','Dados ópticos de pesquisa a 550 nanômetros, não homologados na CNTP');
 const heading=document.createElement('strong');
 heading.textContent='Pesquisa óptica · 550 nm';
 const notice=document.createElement('p');notice.className='silm-optical-candidate-warning';
 notice.textContent='REFERÊNCIA CANDIDATA, NÃO HOMOLOGADA. O cálculo de Fresnel não valida a amostra, a temperatura, a fase nem o brilho percebido. Estes números NÃO controlam a iluminação, a cor da cena ou a simulação.';
 const selectLabel=document.createElement('label');
 selectLabel.className='silm-research-label';
 selectLabel.textContent='Amostra ou conjunto da fonte';
 const select=document.createElement('select');
 select.id=prefix+'-profile';
 select.setAttribute('aria-label','Conjunto óptico de pesquisa, por amostra');
 selectLabel.htmlFor=select.id;
 selectLabel.append(select);
 const result=document.createElement('p');result.className='silm-optical-candidate-result';
 const details=document.createElement('dl');details.className='silm-optical-candidate-metrics';
 const sample=document.createElement('p');sample.className='silm-research-note';
 const provenance=document.createElement('p');provenance.className='silm-research-note';
 const source=document.createElement('a');
 source.target='_blank';source.rel='noopener noreferrer';source.textContent='Consultar arquivo de origem';
 const conclusion=document.createElement('p');conclusion.className='silm-research-note';
 const auditStatus=document.createElement('p');auditStatus.className='silm-optical-yaml-status silm-research-note';
 const auditLink=document.createElement('a');auditLink.target='_blank';auditLink.rel='noopener noreferrer';auditLink.className='silm-optical-yaml-doi';
 section.append(heading,notice,selectLabel,result,details,sample,provenance,auditStatus,auditLink,source,conclusion);
 const study=SILM.opticalResearchCandidates;
 const fmt=(x,d=2)=>Number(x).toLocaleString('pt-BR',{maximumFractionDigits:d});
 let symbol=null,profiles=[];
 function printRows(rows){
  details.replaceChildren();
  for(const [k,v] of rows){
   const dt=document.createElement('dt'),dd=document.createElement('dd');
   dt.textContent=k;dd.textContent=v;details.append(dt,dd);
  }
 }
 function draw(){
  const r=profiles[Number(select.value)]||profiles[0];if(!r)return;
  const percentile=fmt(r.R*100,2)+' %';
  result.textContent='R(550 nm) ≈ '+percentile+' · incidência normal';
  result.dataset.estimate=r.profileKind;
  const estimated=r.profileKind==='graph-digitized-estimate';
  const secondary=r.profileKind==='secondary-tabulated-reflectance';
  const tabulated=r.profileKind==='interpolated-secondary-table';
  const rows=[['Tipo de evidência',
   estimated?'Leitura APROXIMADA de gráfico':
   secondary?'Compilação secundária de refletância':
   tabulated?'Interpolação entre valores tabelados de R':
   'R de Fresnel CALCULADA a partir de n,k']];
  if(r.n!==null&&r.k!==null){
   rows.push(['Índice n da pesquisa',fmt(r.n,5)]);
   rows.push(['Coeficiente k da pesquisa',fmt(r.k,5)]);
  }
  if(Number.isFinite(r.readingLower)&&Number.isFinite(r.readingUpper)){
   rows.push(['Faixa de leitura (NÃO incerteza experimental)',
    fmt(r.readingLower*100,2)+'–'+fmt(r.readingUpper*100,2)+' %']);
  }
  if(Number.isFinite(r.secondaryDirectionR))
   rows.push(['Outra direção tabulada',fmt(r.secondaryDirectionR*100,2)+' %']);
  rows.push(['Temperatura de medição',
   Number.isFinite(r.temperatureK)?fmt(r.temperatureK,2)+' K':r.sourceCondition||'não confirmada']);

  // Conferência documental no dataset YAML, independente da comprovação
  // do estudo experimental e das condições CNTP.
  const audit=SILM.opticalSourceYAMLAudit?.getForSymbol?.(r.symbol);
  const verified=audit?.dataset===r.sourceDataset&&
   Math.abs(audit.R550-r.R)<1e-9;
  if(verified){
   const label=audit.sourceType==='fitted-optical-model'?
    'MODELO ajustado Lorentz–Drude; não equivale a medição direta nesta ficha.':
    audit.sourceType==='electron-loss-derived'?
    'Constantes obtidas da análise de perdas de energia (REELS); não é refletância medida separadamente.':
    'n,k tabulados no arquivo YAML da fonte.';
   auditStatus.textContent='ARQUIVO YAML CONFERIDO: 550 nm dentro do intervalo tabulado, '+
    'n,k interpolados e R de Fresnel conferidos. '+label+' '+
    (audit.comments?'Condições descritas no arquivo: '+audit.comments+'. ':'Condições quantitativas da amostra não informadas no YAML. ')+
    'Artigo científico completo ainda NÃO auditado; NÃO homologado na CNTP.';
   auditLink.hidden=!audit.doi;
   if(audit.doi){
    auditLink.href='https://doi.org/'+audit.doi;
    auditLink.textContent='Estudo citado no YAML · DOI '+audit.doi;
   }else{
    auditLink.removeAttribute('href');
    auditLink.textContent='';
   }
  }else{
   auditStatus.textContent='Arquivo de dados original ainda NÃO confrontado nesta etapa. '+
    'Fórmula de Fresnel conferida na matriz, mas origem, fase e amostra exigem auditoria.';
   auditLink.hidden=true;
   auditLink.removeAttribute('href');
  }
  section.dataset.sourceAudit=verified?'yaml-550nm-verified-paper-pending':'source-unreviewed';
  printRows(rows);
  sample.textContent='Metal: '+r.symbol+'. Amostra/estado: '+r.sample+
   '. Dataset: '+r.sourceDataset+'. '+(r.warning||'Amostra, fase e acabamento exigem conferência específica.');
  provenance.textContent='Origem: '+(r.sourcePage||'arquivo de pesquisa')+
   '. '+(r.method||'Constantes compiladas do dataset')+
   '. '+(r.sourceStatus||'Pesquisa condicionada')+'.';
  source.href=r.sourceURL;
  conclusion.textContent='Valor armazenado em pesquisa anterior, fonte original ainda não reconferida registro por registro. '+
   'R é uma refletância de referência pontual a 550 nm: não prediz brilho visual, cor da peça, '+
   'rugosidade, óxidos nem comportamento em todo o visível. NÃO é CNTP a 273,15 K / 101325 Pa.';
  section.dataset.evidence='research-candidate-not-engine';
  section.dataset.cnpt='not-verified';
 }
 select.addEventListener('change',draw);
 function update({atomicNumber=null,active=null}={}){
  const isOptical=active==='luster';
  const records=isOptical?study?.getFor?.(atomicNumber)||[]:[];
  if(!records.length){section.hidden=true;return;}
  if(records[0].symbol!==symbol){
   symbol=records[0].symbol;profiles=records;
   select.replaceChildren();
   for(const [i,r] of profiles.entries()){
    const option=document.createElement('option');option.value=String(i);
    option.textContent=r.sourceDataset+' · '+r.sample;
    select.append(option);
   }
   select.value='0';draw();
  }
  selectLabel.hidden=profiles.length<=1;select.hidden=profiles.length<=1;
  section.hidden=false;
 }
 return Object.freeze({root:section,update});
};