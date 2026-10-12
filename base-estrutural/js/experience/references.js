'use strict';
SimCore.createReferences=()=>{
 const U=SimCore.ExperienceUI,records=new Map();
 function register(record){if(!U.id(record.id)||records.has(record.id)||!['conceitual','dados','tecnica'].includes(record.type)||!record.title)throw new TypeError('Referência inválida');let url='';if(record.url){const parsed=new URL(record.url,location.href);if(!['http:','https:'].includes(parsed.protocol))throw new TypeError('URL de referência inválida');url=parsed.href;}records.set(record.id,{...record,url});}
 function render(host){for(const r of records.values()){const article=U.element('article',null,'reference-entry');article.append(U.element('h3',r.title));article.append(U.element('p',[Array.isArray(r.authors)?r.authors.join('; '):r.authors,r.year,r.source].filter(Boolean).join(' · ')));if(r.notes)article.append(U.element('p',r.notes));if(r.url){const a=U.element('a','Consultar fonte');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';article.append(a);}host.append(article);}if(!records.size)host.append(U.element('p','Nenhuma referência registrada.'));}
 return {register,render,get list(){return [...records.values()].map(r=>({...r}));},clear:()=>records.clear()};
};
