'use strict';
window.SILM=window.SILM||{};
/* Painel integrado ao controle original Explorar → Propriedades.
 * Não cria motor, estado, tela independente nem vincula números de
 * diferentes amostras entre si.
 */
SILM.createSevenConditionPanel=({prefix='silm-seven'}={})=>{
 const root=document.createElement('section');
 root.className='silm-research-reference silm-seven-condition-reference';
 root.setAttribute('aria-label','Dados dos sete metais nas condições das fontes');
 root.hidden=true;
 const title=document.createElement('strong');
 const status=document.createElement('p');status.className='silm-research-note';
 const qty=document.createElement('dl');qty.className='silm-research-metrics';
 const conditions=document.createElement('p');conditions.className='silm-research-note';
 const source=document.createElement('a');source.rel='noopener noreferrer';source.target='_blank';
 const detail=document.createElement('details'),summary=document.createElement('summary');
 const explanation=document.createElement('p');explanation.className='silm-research-extra';
 summary.textContent='Amostra, origem e limites do dado';
 detail.append(summary,explanation);
 root.append(title,status,qty,conditions,source,detail);
 const label=Object.freeze({
  'compilation-evaluated':'Compilação técnica avaliada',
  'compiled-conditional':'Compilação condicionada à fonte',
  'screening-untraced':'TRIAGEM: fonte individual não rastreada',
  'primary-transcription':'Resultado de artigo primário, tabela transcrita',
  'primary-report':'Relatório experimental consultado',
  'primary-conditional':'Ensaio experimental da amostra indicada',
  'primary-applied':'Deformação imposta em ensaio; não é limite de falha',
  'primary-bound':'Limite inferior, NÃO valor pontual',
  'primary-approximate':'Valor aproximado relatado',
  'historical-compilation':'Compilação histórica',
  'processing-only':'Histórico de processamento, NÃO coeficiente de maleabilidade',
  'secondary-pending':'Transcrição SECUNDÁRIA pendente de fonte original',
  'optical-derived':'R(550 nm) calculada/compilada para interface ideal'
 });
 const fmt=n=>Number(n).toLocaleString('pt-BR',{maximumFractionDigits:8});
 let previous='';
 function update({atomicNumber=null,active=null}={}){
  const D=SILM.sevenConditionResearch;
  const record=D?.get(atomicNumber,active);
  root.hidden=!record;
  if(!record){delete root.dataset.evidence;return;}
  const key=record.id;
  if(key===previous)return;
  previous=key;
  root.dataset.evidence=record.grade;
  root.dataset.sourceConditions='reported-not-normalized';
  root.dataset.engineRelease='false';
  title.textContent='Dados experimentais/compilados · '+record.symbol+' · '+D.labels[active];
  status.textContent=label[record.grade]||'Referência condicionada';
  qty.replaceChildren();
  const dt=document.createElement('dt'),dd=document.createElement('dd');
  dt.textContent=record.quantity;dd.textContent=fmt(record.value)+' '+record.unit;
  qty.append(dt,dd);
  conditions.textContent='Temperatura: '+(Number.isFinite(record.temperatureK)?fmt(record.temperatureK)+' K':'não numericamente informada')+
   '. Condição declarada: '+record.temperatureText+'. Pressão: não informada. O dado só descreve a origem citada; não há extrapolação automática.';
  explanation.textContent='Amostra/método: '+record.sample+'. Uso científico: '+record.evidencePolicy+
   '. Não calibrar motores, não comparar valores como se fossem da mesma amostra e não tratar redução de laminação como falha do metal.';
  source.hidden=!record.sourceURL;
  if(record.sourceURL){source.href=record.sourceURL;source.textContent='Consultar a fonte da referência';}
  else{source.removeAttribute('href');source.textContent='';}
 }
 return Object.freeze({root,update});
};
