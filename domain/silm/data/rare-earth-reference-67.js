'use strict';
/* SILM — Referências condicionais das 17 terras-raras, etapas 66–68.
   Exclusivamente consulta em Dados do metal. Não calibra os motores físicos
   nem converte compilações a medidas em CNTP.
   Gupta & Krishnamurthy (2005), Table 1.2; Pm: BNWL-1309 (1970).
*/
window.SILM=window.SILM||{};
(()=>{
 const rows=[
  [21,'Sc',56.2,15.8,74.4],[39,'Y',59.6,17.2,63.5],
  [57,'La',61.5,13.4,36.6],[58,'Ce',74.4,11.3,33.6],
  [59,'Pr',70,12.5,37.3],[60,'Nd',64.3,16.5,41.4],
  [61,'Pm',75,18,46],[62,'Sm',94,13.3,49.7],
  [63,'Eu',90,13.9,18.2],[64,'Gd',131,10.5,54.8],
  [65,'Tb',115,11.1,55.7],[66,'Dy',92.6,10.7,61.4],
  [67,'Ho',81.4,16.2,64.8],[68,'Er',86,14.5,69.9],
  [69,'Tm',67.6,16.9,74],[70,'Yb',25,38.5,23.9],
  [71,'Lu',58.2,16.4,68.6]
 ];
 const TABLE=Object.freeze(rows.map(([z,symbol,rho_uohm_cm,thermal_W_mK,young_GPa])=>
  Object.freeze({z,symbol,rho_uohm_cm,thermal_W_mK,young_GPa,
   rho_estimate:symbol==='Pm',thermal_estimate:symbol==='Eu',young_estimate:symbol==='Pm',
   thermal_temperature_K:symbol==='Pm'?300.15:null,
   thermal_uncertainty_W_mK:symbol==='Pm'?2:null,
   thermal_source:symbol==='Pm'?'BNWL-1309':'Gupta-Krishnamurthy-2005',
   data_status:'CONDITIONAL_NOT_CNTP'})));
 const byAtomic=new Map(TABLE.map(r=>[r.z,r]));
 const BOOK='https://www.vector.umd.edu/images/links/Extractive_Metallurgy_of_Rare_Earths_Gupta.pdf';
 const PROMETHIUM='https://www.osti.gov/servlets/purl/4136914';
 const fmt=(v,d=2)=>Number(v).toLocaleString('pt-BR',{maximumFractionDigits:d});
 const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const fact=(dl,label,value)=>dl.append(node('dt',label),node('dd',value));
 const source=(host,label,url)=>{const p=node('p'),a=node('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';p.append(a);host.append(p);};
 function renderData(host,e){
  const r=byAtomic.get(Number(e?.atomicNumber));if(!r)return false;
  const section=node('section');section.className='silm-rare-earth-reference';
  section.setAttribute('aria-label','Propriedades bibliográficas condicionais das terras-raras');
  section.append(node('h4','Dados adicionais de referência · '+r.symbol));
  section.append(node('p','Valores bibliográficos do metal elementar; condições individuais de medição não comprovadas como 0 °C e 1 atm. Não representam calibração das animações.'));
  const dl=node('dl');
  fact(dl,'Resistividade elétrica',fmt(r.rho_uohm_cm,3)+' µΩ·cm'+(r.rho_estimate?' · estimativa':' · compilação'));
  fact(dl,'Condutividade elétrica',fmt(100/r.rho_uohm_cm,3)+' MS/m · derivada de ρ, não medida independente');
  const k=fmt(r.thermal_W_mK,3)+(r.thermal_uncertainty_W_mK!==null?' ± '+fmt(r.thermal_uncertainty_W_mK,3):'');
  fact(dl,'Condutividade térmica',k+' W/(m·K)'+(r.thermal_estimate?' · estimativa':r.thermal_source==='BNWL-1309'?' · medição compilada':' · compilação'));
  fact(dl,'Módulo de Young',fmt(r.young_GPa,3)+' GPa'+(r.young_estimate?' · estimativa':' · compilação'));
  if(r.thermal_temperature_K!==null)
   fact(dl,'Condição da condutividade térmica',fmt(r.thermal_temperature_K,2)+' K (27 °C); pressão não informada');
  else fact(dl,'Condições experimentais','Temperatura e pressão de ensaio não informadas numericamente na compilação');
  section.append(dl);
  const details=node('details');details.append(node('summary','Fontes, limitações e classificação'));
  details.append(node('p','Compilação de propriedades físicas, sem pureza, orientação e temperatura por linha. Valores entre parênteses na fonte são estimativas. A condutividade elétrica foi calculada por σ = 10⁸/ρ em S/m, com ρ em µΩ·cm.'));
  if(r.symbol==='Pm')details.append(node('p','Promécio: a condutividade térmica de 18 ± 2 W/(m·K) foi relatada a 27 °C em relatório de 1970; não usar como valor medido a 0 °C. O módulo elástico e a resistividade são estimativas bibliográficas. Não foi registrado alongamento em tração.'));
  if(r.symbol==='Eu'||r.symbol==='Lu')details.append(node('p','Alongamento à ruptura em tração ainda não verificado para este elemento; não interpolar nem derivar do módulo de Young.'));
  source(details,'Gupta e Krishnamurthy — Extractive Metallurgy of Rare Earths, Tabela 1.2',BOOK);
  if(r.symbol==='Pm')source(details,'Jarrett e Van Tuyl (1970) — BNWL-1309, promécio metálico',PROMETHIUM);
  section.append(details);host.append(section);return true;
 }
 SILM.rareEarthReference=Object.freeze({
  stage:68,kind:'RESEARCH_CONDITIONAL_NOT_CNTP',
  list:()=>TABLE,get:atomicNumber=>byAtomic.get(Number(atomicNumber))||null,
  renderData
 });
})();
