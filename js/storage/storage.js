'use strict';
/* Memória de contingência derivada de persistencia.js da baseline. */
SimCore.storage=(()=>{
 const memory=new Map(),pending=new Set();
 function namespace(prefix){
  const key=name=>prefix+encodeURIComponent(String(name));
  return Object.freeze({
   prefix,
   get(name,fallback=null){const k=key(name);if(pending.has(k))return memory.get(k)??fallback;try{const v=localStorage.getItem(k);return v===null?(memory.get(k)??fallback):JSON.parse(v);}catch(error){console.warn('Storage inválido ou indisponível; usando padrão.',k,error);return memory.get(k)??fallback;}},
   set(name,value){const k=key(name);let json;try{json=JSON.stringify(value);if(json===undefined)throw new TypeError('Valor não serializável');}catch(e){throw new TypeError('Storage requer dados JSON: '+e.message);}memory.set(k,JSON.parse(json));try{localStorage.setItem(k,json);pending.delete(k);return true;}catch(_){pending.add(k);SimCore.emit('storage:unavailable',{prefix});return false;}},
   remove(name){const k=key(name);memory.delete(k);pending.add(k);try{localStorage.removeItem(k);pending.delete(k);}catch(_){}},
   clear(){const keys=new Set([...memory.keys(),...pending]);try{for(let i=0;i<localStorage.length;i++)keys.add(localStorage.key(i));}catch(_){}for(const k of keys)if(k&&k.startsWith(prefix)){memory.delete(k);pending.add(k);try{localStorage.removeItem(k);pending.delete(k);}catch(_){}}}
  });
 }
 return {core:namespace('simcore_core_v1_'),domain(id){if(!/^[a-z][a-z0-9-]{0,63}$/.test(id))throw new TypeError('ID de domínio inválido');return namespace('simcore_domain_'+id+'_v1_');}};
})();
