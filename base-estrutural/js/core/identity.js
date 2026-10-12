'use strict';
SimCore.identity=(()=>{
 /* Identidade padrão lida da própria página (marca, título e ícone do index.html do produto), capturada antes de qualquer
    domínio: cada produto declara sua marca no HTML e não precisa alterar o núcleo. Sem marcação, vale a da Base. */
 const read=(id,fallback)=>{const el=document.getElementById(id);return (el?.textContent||'').trim()||fallback;};
 const defaults=Object.freeze({nome:read('brand-name','Base Estrutural'),nomeCurto:read('brand-name','Base Estrutural'),titulo:document.title.trim()||'Base Estrutural',subtitulo:read('brand-subtitle','Aplicações interativas'),icone:document.getElementById('brand-icon')?.getAttribute('src')||'assets/core-icon.svg'});
 const safeIcon=value=>{const url=new URL(value,location.href);if(url.origin!==location.origin||!['http:','https:','file:'].includes(url.protocol))throw new TypeError('Ícone deve ser um recurso local');return url.href;};
 return {defaults,apply(manifest){const m=manifest||defaults;SimCore.$('brand-name').textContent=m.nomeCurto||m.nome;SimCore.$('brand-subtitle').textContent=m.subtitulo;SimCore.$('brand-icon').src=safeIcon(m.icone||defaults.icone);document.title=m.titulo||m.nome;const icon=document.querySelector('link[rel=icon]');if(manifest?.icone){icon.dataset.domainIcon='true';icon.href=safeIcon(manifest.icone);}else{delete icon.dataset.domainIcon;A11Y.atualizarFavicon(A11Y.estado.theme);}}};
})();
SimCore.actions=(()=>{
 let entries=[],context=null,model=null;
 function clear(){entries=[];context=null;model=null;SimCore.$('domain-actions').replaceChildren();}
 function refresh(value=model){model=value;for(const {action,button}of entries){button.hidden=action.visible?!action.visible(value):false;button.disabled=action.enabled?!action.enabled(value):false;if(action.pressed)button.setAttribute('aria-pressed',String(action.pressed(value)));}}
 function register(actions,ctx,scope){clear();context=ctx;const ids=new Set();for(const action of [...actions].sort((a,b)=>(b.priority||0)-(a.priority||0))){if(!action.id||ids.has(action.id)||typeof action.run!=='function')throw new TypeError('Ação inválida ou duplicada');ids.add(action.id);const b=document.createElement('button');b.id='action-'+action.id;b.type='button';b.className='secondary-btn';b.textContent=action.label;b.title=action.tooltip||action.label;b.dataset.priority=String(action.priority||0);scope.listen(b,'click',async()=>{b.disabled=true;try{await action.run(ctx);}finally{if(scope.active)refresh();}});SimCore.$('domain-actions').append(b);entries.push({action,button:b});}refresh();scope.cleanup(clear);}
 return {register,refresh,clear};
})();
