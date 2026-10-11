'use strict';
/* Disponibilidade e integração opcionais; registros pertencem ao domínio. */
SimCore.createNotebook=ctx=>{
 let spec=null;
 function configure(value){if(!value||value.enabled===false||value.available===false){spec=null;return;}const id=value.id||'caderno',route=value.route||value.rota||'caderno',title=value.title||value.titulo;if(!SimCore.ExperienceUI.id(id)||!SimCore.ExperienceUI.id(route)||!title)throw new TypeError('Caderno inválido');for(const hook of ['render','open'])if(value[hook]!=null&&typeof value[hook]!=='function')throw new TypeError('Integração de Caderno inválida');spec={...value,id,route,title:String(title),icon:value.icon||value.icone||'notebook',description:String(value.description||value.descricao||''),state:value.state||value.estado||'available'};}
 async function render(host,local){
  const U=SimCore.ExperienceUI,current=spec;if(!current||current.state==='disabled'){U.heading(host,'Caderno não disponível','Este recurso está indisponível.');return;}
  U.heading(host,current.title,current.description);const card=U.element('section',null,'content-card');host.append(card);
  if(current.render){const cleanup=await current.render(card,local);if(typeof cleanup==='function'){if(local.scope.active)local.scope.cleanup(cleanup);else cleanup();}}
  else if(current.open)card.append(U.button('Abrir caderno',()=>current.open(local),local.scope,{id:'notebook-open',primary:true}));
  else card.append(U.element('p','Nenhum registro disponível.'));
 }
 return {configure,render,get current(){return spec?{...spec}:null;},get available(){return !!spec&&spec.state!=='disabled';},destroy(){spec=null;}};
};
