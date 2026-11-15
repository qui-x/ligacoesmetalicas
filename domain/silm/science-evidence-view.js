'use strict';
window.SILM=window.SILM||{};
/* Etapa 80: mesma consulta científica nas duas áreas: Dados do metal e Explorar.
 * A interface conserva os painéis especializados e não altera motors físicos.
 */
SILM.createUnifiedElementEvidencePanel=({mode='data'}={})=>{
 const S=SILM,db=S.scienceEvidenceIndex,
  props=S.properties,labels=Object.freeze({
   'experimental-conditional':'Ensaio com condições específicas',
   evaluated:'Referência avaliada',compiled:'Compilação ou ficha técnica',
   candidate:'Dado candidato ou derivado',pending:'Fonte original pendente'
  });
 const root=document.createElement('section');root.className='silm-unified-evidence';
 root.dataset.mode=mode;root.hidden=true;
 const title=document.createElement('h4'),description=document.createElement('p'),list=document.createElement('div');
 description.className='silm-unified-evidence-note';
 root.append(title,description,list);
 const node=(tag,str='',cls='')=>{
  const e=document.createElement(tag);e.textContent=str;if(cls)e.className=cls;return e;
 };
 const fmt=x=>Number(x).toLocaleString('pt-BR',{maximumSignificantDigits:6});
 function article(r){
  const item=node('article','','silm-unified-evidence-record');
  item.dataset.source=r.origin;item.dataset.status=r.status;item.dataset.property=r.property;
  item.dataset.engineRelease='false';
  item.append(node('strong',r.sourceName));
  const details=node('dl','','silm-unified-evidence-values');
  for(const v of r.values){
   details.append(node('dt',v.label),node('dd',fmt(v.value)+' '+v.unit+
    (v.meaning==='lower-bound-not-point'?' (limite inferior, valor > indicado)':'')));
  }
  item.append(details);
  item.append(node('p',(r.evidenceIsModelEstimate?'ESTIMATIVA HISTÓRICA / NÃO medida / precisão baixa':
   (labels[r.status]||'Evidência condicionada'))+' · '+
   (Number.isFinite(r.temperatureK)?fmt(r.temperatureK)+' K':r.temperatureText)+
   ' · amostra: '+r.sample,'silm-unified-evidence-conditions'));
  if(r.qualifier)item.append(node('p',r.qualifier,'silm-unified-evidence-caution'));
  if(r.sourceURL){const link=node('a','Consultar fonte original ou compilação');
   link.href=r.sourceURL;link.rel='noopener noreferrer';link.target='_blank';
   item.append(link);}
  return item;
 }
 function update({atomicNumber=null,active=null}={}){
  const z=Number(atomicNumber);
  const selected=mode==='explore'?[active]:db?.keys||[];
  list.replaceChildren();
  const valid=db&&Number.isInteger(z)&&z>0&&selected.length&&
   selected.every(p=>db.keys.includes(p));
  if(!valid){root.hidden=true;return;}
  let total=0,display=0,pending=0;
  for(const property of selected){
   const all=db.getFor(z,property,{excludeSeven:true});
   if(!all.length)continue;
   const published=all.filter(r=>r.status!=='pending'),unverified=all.filter(r=>r.status==='pending');
   total+=all.length;display+=published.length;pending+=unverified.length;
   const group=node('section','','silm-unified-evidence-group');
   group.dataset.property=property;
   const label=props.catalog[property]?.title||property;
   group.append(node('h5',label+' · '+published.length+' referências'+
    (unverified.length?' · '+unverified.length+' pendentes':'')));
   const top=published.slice(0,mode==='explore'?1:2);
   for(const r of top)group.append(article(r));
   const rest=[...published.slice(top.length),...unverified];
   if(rest.length){
    const more=document.createElement('details');more.className='silm-unified-evidence-more';
    more.append(node('summary','Outros estudos e condições ('+rest.length+')'));
    for(const r of rest)more.append(article(r));
    group.append(more);
   }
   list.append(group);
  }
  root.hidden=!total;
  if(!total)return;
  title.textContent=mode==='explore'?
   'Evidências científicas reunidas desta propriedade':'Outras referências científicas do elemento';
  description.textContent=display+' fichas consultáveis'+(pending?' · '+pending+' registros com fonte original pendente':'')+
   '. Estudos podem se referir a amostras e temperaturas diferentes. '+
   'Valores de ensaios, compilações e estimativas não homologam automaticamente os motores do SILM.';
 }
 return Object.freeze({root,update});
};
