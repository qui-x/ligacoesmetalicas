'use strict';
window.SimCore = { version:'0.3.0', ready:false, events:new EventTarget() };
SimCore.emit=(type,detail)=>SimCore.events.dispatchEvent(new CustomEvent(type,{detail}));
SimCore.$=id=>document.getElementById(id);
SimCore.escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
SimCore.normalizar=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
SimCore.focusables=node=>[...node.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,a[href],[tabindex="0"]')].filter(el=>el.getClientRects().length&&!el.closest('[hidden],[inert]'));
SimCore.trap=(event,node)=>{if(event.key!=='Tab')return;const list=SimCore.focusables(node),first=list[0],last=list.at(-1);if(!first){event.preventDefault();node.focus();return;}if(event.shiftKey&&(document.activeElement===first||!node.contains(document.activeElement))){event.preventDefault();last.focus();}else if(!event.shiftKey&&(document.activeElement===last||!node.contains(document.activeElement))){event.preventDefault();first.focus();}};
SimCore.content=(host,value)=>{host.replaceChildren();if(value instanceof Node)host.append(value);else host.textContent=String(value??'');};
