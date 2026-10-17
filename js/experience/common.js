'use strict';
SimCore.experience={current:null};
SimCore.ExperienceUI=(()=>{
 const S=SimCore;
 function element(tag,text,className){const e=document.createElement(tag);if(text!=null)e.textContent=text;if(className)e.className=className;return e;}
 /* Botão de ação: impede cliques repetidos sem usar disabled, que tiraria o foco do botão nos navegadores atuais
    (e a janela aberta por ele não saberia para onde devolver o foco). */
 function button(text,run,scope,{id,primary=false}={}){const b=element('button',text,primary?'primary-btn':'secondary-btn');b.type='button';if(id)b.id=id;let busy=false;scope.listen(b,'click',async()=>{if(busy||b.getAttribute('aria-disabled')==='true')return;busy=true;b.setAttribute('aria-busy','true');try{await run();}finally{busy=false;b.removeAttribute('aria-busy');}});return b;}
 function link(text,id,param='',name){const a=element('a',text,'secondary-btn');a.href=S.router.href(id,param);if(name)a.id=name;a.dataset.nav=id;return a;}
 function heading(host,title,summary){const h=element('header',null,'page-heading');const t=element('h1',title);t.tabIndex=-1;t.dataset.screenFocus='';h.append(t);if(summary)h.append(element('p',summary,'page-lead'));host.append(h);return h;}
 function field(host,label,name,{value='',type='text',rows,max=6000,required=false}={}){const wrapper=element('label',null,'field');wrapper.append(element('span',label));const input=element(rows?'textarea':'input');input.id=name;input.name=name;if(rows)input.rows=rows;else input.type=type;input.maxLength=max;input.value=value;input.required=required;wrapper.append(input);host.append(wrapper);return input;}
 function select(host,label,name,values,value){const wrapper=element('label',null,'field');wrapper.append(element('span',label));const input=element('select');input.id=name;input.name=name;for(const x of values){const o=element('option',x.title);o.value=x.id;o.disabled=x.enabled===false;input.append(o);}if(value)input.value=value;wrapper.append(input);host.append(wrapper);return input;}
 function block(host,title,text){if(!text?.length)return;const section=element('section',null,'content-block');section.append(element('h2',title));if(Array.isArray(text)){const list=element('ol');for(const item of text)list.append(element('li',String(item)));section.append(list);}else section.append(element('p',String(text)));host.append(section);}
 /* Ícones vêm do registro único da família (SimCore.icons); nomes antigos continuam valendo por apelido. */
 function icon(name){return S.icons.element(name,'experience-icon');}
 /* Link '?' de ajuda contextual: abre o tópico do Manual ("Ajuda: <assunto>"). */
 function helpLink(topic,subject){const a=element('a','?','help-link ajuda-link');a.href=S.router.href('manual',String(topic||''));const label='Ajuda: '+String(subject||topic||'');a.setAttribute('aria-label',label);a.title=label;return a;}
 const id=value=>typeof value==='string'&&/^[a-z][a-z0-9-]{0,63}$/.test(value);
 const clone=value=>JSON.parse(JSON.stringify(value));
 const text=(value,max=6000)=>typeof value==='string'?value.slice(0,max):'';
 function confirm(ctx,title,content,label='Continuar'){const handle=ctx.modal.open({title,content,actions:[{id:'cancel',label:'Cancelar'},{id:'confirm',label,primary:true}]});return handle?handle.result.then(value=>value==='confirm'):Promise.resolve(false);}
 return {element,button,link,heading,field,select,block,icon,helpLink,id,clone,text,confirm};
})();
