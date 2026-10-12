'use strict';
SimCore.createReports=(ctx,experience)=>{
 const S=SimCore,U=S.ExperienceUI;let renderedSession=null;
 const defaults={observations:'',analysis:'',conclusion:'',evidence:''};
 function fields(id=experience.activity.current?.sessionId){const saved=ctx.storage.get('experience.report.'+id,{});return Object.fromEntries(Object.keys(defaults).map(k=>[k,U.text(saved?.[k],12000)]));}
 function setFields(patch,id=experience.activity.current?.sessionId){if(!id)return;const value={...fields(id)};for(const k of Object.keys(value))if(k in patch)value[k]=U.text(patch[k],12000);ctx.storage.set('experience.report.'+id,value);return value;}
 function sections(host,data,local){
  for(const section of data?.sections||[]){const block=U.element('section',null,'report-section');block.append(U.element('h2',U.text(section.title,200)));if(section.text)block.append(U.element('p',U.text(section.text,12000)));
   if(section.table){const wrapper=U.element('div',null,'table-scroll');wrapper.tabIndex=0;wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label',section.title||'Tabela');const table=U.element('table');table.append(U.element('caption',section.table.caption||section.title||'Dados'));const head=U.element('thead'),tr=U.element('tr');for(const value of section.table.headers||[]){const th=U.element('th',String(value));th.scope='col';tr.append(th);}head.append(tr);table.append(head);const body=U.element('tbody');for(const row of section.table.rows||[]){const tr=U.element('tr');for(const value of row)tr.append(U.element('td',String(value??'')));body.append(tr);}table.append(body);wrapper.append(table);block.append(wrapper);}
   host.append(block);if(typeof section.render==='function'){const cleanup=section.render(block,local);if(typeof cleanup==='function')local.scope.cleanup(cleanup);}
  }
 }
 async function capture(){const a=experience.activity.current;if(!a)return;const data=await experience.options.report?.collect?.(ctx,a)||{sections:[]};if(!ctx.scope.active)return;
  // Só material serializável é arquivado; renderers permanecem no registro do domínio.
  const serial={sections:(data.sections||[]).map(s=>({title:U.text(s.title,200),text:U.text(s.text,12000),...(s.table?{table:U.clone(s.table)}:{})}))};ctx.storage.set('experience.report-data.'+a.sessionId,serial);return data;
 }
 async function render(host,local){
  U.heading(host,'Relatórios','Registre observações, análise e conclusão. A identificação e o contexto acompanham o documento.');
  const active=experience.activity.current,history=ctx.storage.get('experience.history',[]);const items=[...(active?[active]:[]),...(active?.navigationMode==='restricted'?[]:Array.isArray(history)?history:[])].filter((v,i,a)=>a.findIndex(x=>x.sessionId===v.sessionId)===i);
  const target=local.params?items.find(a=>a.sessionId===local.params):active;
  const controls=U.element('div',null,'action-row report-controls');controls.append(U.link('Voltar ao Laboratório','laboratorio','','report-back'));host.append(controls);
  if(items.length>1){const chooser=U.select(controls,'Sessão','report-session',items.map(a=>({id:a.sessionId,title:a.title+' · '+new Date(a.timestamp).toLocaleString()})),target?.sessionId);local.scope.listen(chooser,'change',()=>S.router.navigate('relatorios',chooser.value));}
  if(!target){host.append(U.element('p','Nenhuma sessão disponível para este relatório.'));return;}
  renderedSession=target.sessionId;const data=target.sessionId===active?.sessionId?await capture():ctx.storage.get('experience.report-data.'+target.sessionId,{sections:[]});if(!local.scope.active)return;
  const article=U.element('article',null,'report-document');article.id='report-document';article.append(U.element('p',ctx.manifest.nome+' · '+ctx.manifest.versao,'eyebrow'),U.element('h2',target.title));
  const dl=U.element('dl',null,'report-metadata');const meta=[['Atividade',target.type==='free'?'Laboratório Livre':{route:'Roteiro',mission:'Missão',teacher:'Atividade do Professor'}[target.type]],['Módulo',experience.modules.get(target.module)?.title||target.module],['Data e horário',new Date(target.timestamp).toLocaleString()],['Identificação',target.identity?.student||'Não informada'],['Turma / grupo',target.identity?.group||'Não informado'],['Sessão',target.sessionId]];for(const [label,value]of meta){const row=U.element('div');row.append(U.element('dt',label),U.element('dd',value));dl.append(row);}article.append(dl);sections(article,data,local);
  const labels={observations:'Observações',analysis:'Análise',conclusion:'Conclusão'};for(const [key,label]of Object.entries(labels)){const block=U.element('section',null,'report-writing');block.append(U.element('h2',label));const input=U.field(block,label,'report-'+key,{value:fields(target.sessionId)[key],rows:4,max:12000});const printed=U.element('p',input.value||'Não preenchido.','report-answer');block.append(printed);local.scope.listen(input,'input',()=>{setFields({[key]:input.value},target.sessionId);printed.textContent=input.value||'Não preenchido.';});article.append(block);}host.append(article);
  controls.append(U.button('Imprimir relatório',()=>window.print(),local.scope,{id:'report-print',primary:true}));
 }
 return {fields,setFields,capture,render,get current(){return renderedSession;}};
};
