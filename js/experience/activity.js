'use strict';
/* Sessão contém apenas metadados. O domínio captura e restaura seus próprios dados. */
SimCore.createActivities=(ctx,experience)=>{
 const S=SimCore,U=S.ExperienceUI,records={route:new Map(),mission:new Map()};let current=null,pending=null,queue=Promise.resolve(),alive=true,dirty=false,freeSession=null,initializing=false;
 const uuid=()=>globalThis.crypto?.randomUUID?.()||'session-'+Date.now()+'-'+Math.random().toString(36).slice(2);
 const enqueue=fn=>{const result=queue.then(()=>alive&&ctx.scope.active?fn():false);queue=result.catch(()=>{});return result;};
 const snapshot=()=>current?U.clone(current):null;
 const store=(key,value)=>{const saved=ctx.storage.set('experience.'+key,value);if(saved===false&&!experience.storageWarned){experience.storageWarned=true;ctx.notify('O armazenamento está indisponível. A sessão será mantida apenas nesta página.',{type:'warning'});}return saved;};
 const definition=a=>a?.type==='teacher'?a.configuration:records[a?.type]?.get(a?.id);
 const emit=()=>{S.emit('activity:changed',snapshot());experience.updateBanner();};
 function normalize(spec,type){
  if(!U.id(spec.id)||!spec.title||!experience.modules.get(spec.module))throw new TypeError('Atividade inválida ou módulo ausente');
  const navigation=spec.navigation||'free';if(!['free','restricted'].includes(navigation))throw new TypeError('Navegação inválida');
  const modules=type==='route'?[spec.module]:(spec.restrictions?.modules||[spec.module]);
  if(!Array.isArray(modules)||!modules.includes(spec.module)||modules.some(id=>!experience.modules.get(id)))throw new TypeError('Módulos da atividade inválidos');
  const resources=spec.restrictions?.resources??null;if(resources!==null&&(!Array.isArray(resources)||resources.some(id=>!experience.resources.has(id))))throw new TypeError('Recursos da atividade inválidos');
  if(type==='mission'&&typeof spec.validate!=='function')throw new TypeError('Missão exige validação do domínio');
  if(spec.validate!=null&&typeof spec.validate!=='function')throw new TypeError('Validação da atividade inválida');
  return {...spec,navigation,restrictions:{modules:[...new Set(modules)],resources:resources===null?null:[...new Set(resources)]}};
 }
 function register(type,spec){if(!records[type]||records[type].has(spec.id))throw new TypeError('Registro de atividade inválido ou duplicado');records[type].set(spec.id,normalize(spec,type));}
 function metadata(type,spec){return {schema:1,domain:ctx.manifest.id,sessionId:uuid(),type,id:spec?.id||'free',title:spec?.title||'Laboratório Livre',module:spec?.module||experience.modules.current||experience.modules.list.find(m=>experience.modules.available(m.id))?.id||null,
  restrictions:spec?.restrictions||{modules:null,resources:null},navigationMode:spec?.navigation||'free',status:'active',timestamp:new Date().toISOString(),identity:{},...(type==='teacher'?{configuration:spec}:{})};}
 async function save(){if(!current||!alive||!ctx.scope.active)return false;current.timestamp=new Date().toISOString();await experience.options.session?.capture?.(snapshot(),ctx);await experience.reports.capture();if(!alive||!ctx.scope.active)return false;store('session',snapshot());return true;}
 async function confirmReplace(){if(!current)return true;const changes=dirty||await experience.options.session?.hasChanges?.(snapshot(),ctx);if(!changes&&current.type==='free')return true;
  return U.confirm(ctx,'Substituir investigação?','A sessão atual será salva antes de iniciar outra. Você poderá consultar seu relatório em Relatórios.','Salvar e continuar');}
 function archive(status){if(!current)return;if(current.status!=='completed')current.status=status;if(status==='closed')current.closedAt=new Date().toISOString();const old=ctx.storage.get('experience.history',[]);const list=Array.isArray(old)?old:[];store('history',[snapshot(),...list.filter(x=>x.sessionId!==current.sessionId)].slice(0,30));}
 async function begin(type,spec,{resume=null,restart=false,identity={},stay=false}={}){
  const previous=snapshot();if(!resume&&type!=='free'&&previous?.type==='free'){freeSession=previous;store('free-session',previous);}
  current=resume?U.clone(resume):metadata(type,spec);if(!resume)current.identity=identity;if(restart)current.status='restarted';dirty=false;
  try{
   if(resume){if(typeof experience.options.session?.restore!=='function')throw new Error('Domínio não oferece restauração de sessão');await experience.options.session.restore(snapshot(),ctx);}
   else await experience.options.onStart?.(spec||{type:'free'},snapshot(),ctx);
   if(!alive||!ctx.scope.active)return false;
   if(current.module&&!await experience.modules.select(current.module))throw new Error('Módulo inicial indisponível');
   await save();emit();const report=current.status==='completed'&&experience.options.report;if(report&&S.router.current?.id==='relatorios'&&S.router.current.param===current.sessionId)await S.router.refresh();else if(!stay)await S.router.navigate(report?'relatorios':'laboratorio',report?current.sessionId:'');return true;
  }catch(error){current=previous;if(previous&&alive&&ctx.scope.active){try{await experience.options.session?.restore?.(previous,ctx);await experience.modules.select(previous.module);}catch(restoreError){console.error('Falha ao restaurar investigação após erro',restoreError);}}emit();throw error;}
 }
 function start(type,id,options={}){return enqueue(async()=>{
  if(current?.navigationMode==='restricted'&&current.type!=='free'){ctx.notify('Encerre a atividade antes de iniciar outra.',{type:'warning'});return false;}
  const spec=type==='free'?null:records[type]?.get(id);if(type!=='free'&&!spec)throw new TypeError('Atividade não encontrada');
  if(!await confirmReplace())return false;await save();archive('interrupted');return begin(type,spec,options);
 });}
 function startTeacher(config,identity={}){return enqueue(async()=>{config=experience.teacher.validate(config);if(current?.navigationMode==='restricted')return false;if(!await confirmReplace())return false;await save();archive('interrupted');return begin('teacher',config,{identity});});}
 function finish(){return enqueue(async()=>{
  if(!current||!['mission','route'].includes(current.type))return false;const spec=definition(current),fields=experience.reports.fields();if(typeof spec?.validate!=='function')return false;if(current.status==='completed')return true;
  const result=await spec.validate({activity:snapshot(),fields,context:ctx});if(!alive)return false;
  const ok=result===true||result?.ok===true;if(!ok){ctx.notify(U.text(result?.message)||'Confira as evidências e a conclusão antes de concluir.',{type:'warning'});return false;}
  current.status='completed';if(current.type==='mission'){const saved=ctx.storage.get('experience.completed',{});store('completed',{...(saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{}),[current.id]:true});}await save();if(!alive||!ctx.scope.active)return false;emit();ctx.notify(current.type==='mission'?'Missão concluída. Ela continua disponível para ser refeita.':'Roteiro concluído. O contexto permanece disponível até encerrar.',{type:'success'});if(experience.options.report)await S.router.navigate('relatorios',current.sessionId);return true;
 });}
 function restart(){return enqueue(async()=>{if(!current||current.type==='free')return false;if(!await U.confirm(ctx,'Refazer atividade?','Uma nova tentativa será iniciada. O relatório anterior permanece disponível.','Refazer'))return false;const a=snapshot(),spec=definition(a);await save();archive('restarted');return begin(a.type,spec,{restart:true,identity:a.identity});});}
 function exit(){return enqueue(async()=>{if(!current||current.type==='free')return false;if(!await U.confirm(ctx,'Encerrar atividade?','A sessão e o relatório serão preservados neste navegador. Você voltará à investigação livre.','Encerrar atividade'))return false;
  await save();archive('closed');const free=freeSession;freeSession=null;ctx.storage.remove('experience.free-session');if(free&&experience.options.session?.restore)await begin('free',null,{resume:free});else await begin('free',null);ctx.notify('Atividade encerrada.',{type:'info'});await S.router.navigate(S.router.screens.includes('inicio')?'inicio':'laboratorio');return true;
 });}
 async function offerResume(saved=ctx.storage.get('experience.session',null)){
  if(!saved)return false;
  try{if(saved.schema!==1||saved.domain!==ctx.manifest.id||!['free','route','mission','teacher'].includes(saved.type)||typeof saved.sessionId!=='string'||!experience.modules.get(saved.module))throw new Error('Sessão incompatível');
   let spec=saved.type==='teacher'?experience.teacher.validate(saved.configuration):definition(saved);if(saved.type!=='free'&&!spec)throw new Error('Atividade ausente');
   pending={schema:1,domain:ctx.manifest.id,sessionId:U.text(saved.sessionId,160),type:saved.type,id:U.text(saved.id,64),module:saved.module,status:['active','completed','interrupted','restarted'].includes(saved.status)?saved.status:'active',timestamp:Number.isFinite(Date.parse(saved.timestamp))?saved.timestamp:new Date().toISOString(),identity:{student:U.text(saved.identity?.student,160),group:U.text(saved.identity?.group,160)},title:spec?.title||'Laboratório Livre',restrictions:spec?.restrictions||{modules:null,resources:null},navigationMode:spec?.navigation||'free',...(saved.type==='teacher'?{configuration:spec}:{})};
  }catch(error){ctx.notify('A sessão anterior não corresponde aos registros atuais e não será retomada.',{type:'warning'});return false;}
  if(typeof experience.options.session?.restore!=='function'){ctx.notify('Há uma sessão anterior, mas este domínio não oferece retomada.',{type:'info'});return false;}
  // Opção do domínio: a sessão livre é retomada diretamente, sem diálogo. Atividades continuam perguntando.
  if(pending.type==='free'&&experience.options.session?.resumeFree==='direct'){const resume=pending;pending=null;await begin('free',definition(resume),{resume,stay:true});return true;}
  const handle=ctx.modal.open({title:'Retomar sessão?',dismissible:false,content:pending.title+' · '+experience.modules.get(pending.module).title,actions:[{id:'new',label:'Começar outra sessão'},{id:'resume',label:'Retomar',primary:true}]});
  const answer=await handle.result;if(!alive)return true;const resume=pending;pending=null;
  if(answer==='resume'){await begin(resume.type,definition(resume),{resume});return true;}const history=ctx.storage.get('experience.history',[]);store('history',[{...resume,status:resume.status==='completed'?'completed':'interrupted'},...(Array.isArray(history)?history:[]).filter(x=>x.sessionId!==resume.sessionId)].slice(0,30));return false;
 }
 return {register,start,startTeacher,finish,restart,exit,save,offerResume,
  async initialize(){const free=ctx.storage.get('experience.free-session',null);freeSession=free?.type==='free'&&free?.domain===ctx.manifest.id&&experience.modules.get(free.module)?free:null;const saved=ctx.storage.get('experience.session',null);initializing=true;current=metadata('free',null);await experience.modules.select(current.module);initializing=false;emit();if(saved)offerResume(saved).then(async resumed=>{if(!resumed&&alive)await save();}).catch(error=>{console.error('Falha ao retomar sessão',error);ctx.notify('Não foi possível retomar a sessão.',{type:'error'});});},
  touch(){dirty=true;return save();},moduleChanged(id){if(current){current.module=id;if(!initializing)store('session',snapshot());}},
  allowsModule:id=>!current?.restrictions.modules||current.restrictions.modules.includes(id),
  allowsResource:id=>experience.resources.has(id)&&(!current?.restrictions.resources||current.restrictions.resources.includes(id)),
  get current(){return snapshot();},get pending(){return pending?U.clone(pending):null;},getDefinition:()=>definition(current),
  list:type=>[...(records[type]?.values()||[])],get:(type,id)=>records[type]?.get(id),
  completed:id=>ctx.storage.get('experience.completed',{})?.[id]===true,
  async destroy(){alive=false;pending=null;current=null;freeSession=null;records.route.clear();records.mission.clear();}
 };
};
