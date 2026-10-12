'use strict';
SimCore.createTeacher=(ctx,experience)=>{
 const S=SimCore,U=S.ExperienceUI;let draft=null;
 function validate(value){
  if(!value||Object.getPrototypeOf(value)!==Object.prototype||value.schema!==1||!U.id(value.id))throw new TypeError('Formato de atividade inválido');
  if(typeof value.title!=='string'||!value.title.trim()||value.title.length>160||typeof value.instructions!=='string'||value.instructions.length>6000)throw new TypeError('Título ou instruções inválidos');
  if(!experience.modules.get(value.module)||!['free','restricted'].includes(value.navigation))throw new TypeError('Módulo ou navegação inválidos');
  if(!Array.isArray(value.resources)||value.resources.length>100||value.resources.some(id=>!experience.resources.has(id)))throw new TypeError('Recurso não reconhecido');
  const identification={student:U.text(value.identification?.student,160),group:U.text(value.identification?.group,160)};
  return {schema:1,id:value.id,title:value.title.trim(),instructions:value.instructions,module:value.module,navigation:value.navigation,resources:[...new Set(value.resources)],identification,restrictions:{modules:[value.module],resources:[...new Set(value.resources)]}};
 }
 const serialize=config=>JSON.stringify(validate(config),null,2);
 function parse(value){if(typeof value!=='string'||value.length>64000)throw new TypeError('Arquivo de atividade excede o limite de 64 mil caracteres');return validate(JSON.parse(value));}
 const save=config=>{draft=validate(config);ctx.storage.set('experience.teacher',draft);return U.clone(draft);};
 async function open(config){const c=validate(config);return experience.activity.startTeacher(c,c.identification);}
 function render(host,local){
  U.heading(host,'Área do Professor','Configure uma atividade, revise os recursos disponíveis e abra a experiência como aluno.');
  const projector=U.button('Modo Projetor',()=>S.shell.setProjector(!S.shell.projector),local.scope,{id:'teacher-projector'});projector.setAttribute('aria-pressed',String(S.shell.projector));local.scope.on('shell:projector',event=>projector.setAttribute('aria-pressed',String(event.detail.on)));host.append(projector);
  // Extensão opcional de recursos pedagógicos; o formulário e seu fluxo permanecem na Base.
  if(typeof experience.options.teacherResources==='function'){const cleanup=experience.options.teacherResources(host,local);if(typeof cleanup==='function')local.scope.cleanup(cleanup);}
  const stored=ctx.storage.get('experience.teacher',null);try{draft=stored?validate(stored):null;}catch(_){draft=null;}
  const form=U.element('form',null,'teacher-form content-card');form.id='teacher-form';
  const title=U.field(form,'Título da atividade','teacher-title',{value:draft?.title||'',max:160,required:true});
  const instructions=U.field(form,'Instruções','teacher-instructions',{value:draft?.instructions||'',rows:4});
  const pair=U.element('div',null,'field-pair');form.append(pair);
  const module=U.select(pair,'Módulo','teacher-module',experience.modules.list,draft?.module);
  const navigation=U.select(pair,'Navegação','teacher-navigation',[{id:'free',title:'Livre'},{id:'restricted',title:'Restrita à atividade'}],draft?.navigation||'restricted');
  const resources=U.element('fieldset');resources.append(U.element('legend','Recursos permitidos'));for(const r of experience.resources.values()){const label=U.element('label',null,'check-row');const b=U.element('input');b.type='checkbox';b.name='resource';b.value=r.id;b.checked=draft?draft.resources.includes(r.id):true;label.append(b,U.element('span',r.title));resources.append(label);}if(!experience.resources.size)resources.append(U.element('p','Este domínio não registrou recursos opcionais.'));form.append(resources);
  const identities=U.element('div',null,'field-pair');form.append(identities);const student=U.field(identities,'Identificação do aluno (opcional)','teacher-student',{value:draft?.identification.student||'',max:160}),group=U.field(identities,'Turma ou grupo (opcional)','teacher-group',{value:draft?.identification.group||'',max:160});
  const submit=U.element('button','Gerar atividade','primary-btn');submit.type='submit';submit.id='teacher-generate';form.append(submit);host.append(form);
  const result=U.element('section',null,'content-card teacher-result');result.id='teacher-result';result.hidden=true;host.append(result);
  function preview(config){result.hidden=false;result.replaceChildren();result.append(U.element('h2','Atividade pronta para revisão'),U.element('h3',config.title),U.element('p',config.instructions||'Sem instruções adicionais.'),U.element('p',experience.modules.get(config.module).title+' · Navegação '+(config.navigation==='restricted'?'restrita':'livre')));
   const names=config.resources.map(id=>experience.resources.get(id).title);result.append(U.element('p','Recursos liberados: '+(names.join(', ')||'nenhum')+'.'));
   const json=U.field(result,'Configuração serializada','teacher-json',{value:serialize(config),rows:8,max:64000});json.readOnly=true;
   const actions=U.element('div',null,'action-row');actions.append(U.button('Abrir como aluno',()=>open(config),local.scope,{id:'teacher-open-student',primary:true}),U.button('Baixar atividade',()=>{
    const blob=new Blob([serialize(config)],{type:'application/json'}),url=URL.createObjectURL(blob),a=U.element('a');a.href=url;a.download='atividade-'+config.id+'.json';a.click();local.scope.timeout(()=>URL.revokeObjectURL(url),1000);local.scope.cleanup(()=>URL.revokeObjectURL(url));
   },local.scope,{id:'teacher-download'}));result.append(actions);result.querySelector('h2').tabIndex=-1;result.querySelector('h2').focus();
  }
  local.scope.listen(form,'submit',e=>{e.preventDefault();try{const config=save({schema:1,id:draft?.id||'atividade-'+Date.now().toString(36),title:title.value,instructions:instructions.value,module:module.value,navigation:navigation.value,resources:[...form.querySelectorAll('input[name=resource]:checked')].map(b=>b.value),identification:{student:student.value,group:group.value}});preview(config);ctx.notify('Atividade gerada.',{type:'success'});}catch(error){ctx.notify(error.message,{type:'error'});}});
  const importer=U.element('section',null,'content-card');importer.append(U.element('h2','Abrir uma configuração salva'));const input=U.field(importer,'Cole a configuração JSON','teacher-import',{rows:5,max:64000});const file=U.field(importer,'Ou selecione um arquivo JSON','teacher-file',{type:'file'});file.accept='.json,application/json';local.scope.listen(file,'change',async()=>{const f=file.files[0];if(!f)return;if(f.size>64000){ctx.notify('Arquivo maior que 64 KB.',{type:'error'});return;}try{input.value=await f.text();}catch(_){ctx.notify('Não foi possível ler o arquivo.',{type:'error'});}});
  importer.append(U.button('Revisar configuração',()=>{try{const c=save(parse(input.value));preview(c);}catch(error){ctx.notify('Configuração inválida: '+error.message,{type:'error'});}},local.scope,{id:'teacher-review-import'}));host.append(importer);
  if(draft)preview(draft);
 }
 return {validate,parse,serialize,save,open,render};
};
