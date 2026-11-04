'use strict';
window.SILM=window.SILM||{};
/* F1.3 — resolve APIs declaradas sem copiar estado, mover algoritmos ou impor capacidades genéricas. */
(()=>{
 const failure=(reason,extra={})=>({ok:false,reason,...extra});
 function createEngineAdapters(catalog=window.SILM.engineCatalog,root=window.SILM){
  if(!catalog||!Array.isArray(catalog.entries)||!root)throw new TypeError('Catálogo ou raiz de componentes ausente.');
  const byId=new Map();
  for(const entry of catalog.entries){
   if(!entry?.id||byId.has(entry.id))throw new TypeError('ID de componente ausente ou duplicado: '+entry?.id);
   byId.set(entry.id,entry);
  }
  const ids=Object.freeze([...byId.keys()]);
  const descriptor=id=>byId.get(id)||null;
  function sourceValue(symbol){
   if(typeof symbol!=='string'||!symbol.startsWith('SILM.'))return undefined;
   return symbol.slice(5).split('.').reduce((value,key)=>value?.[key],root);
  }
  function resolve(id){
   const entry=descriptor(id);if(!entry)return failure('ENGINE_UNKNOWN',{id});
   const declaration=entry.publicApi||{},functions=declaration.functions||[],properties=declaration.properties||[];
   let target,api,callTarget=root,names=[...functions];
   if(declaration.root==='source'){
    api={};
    for(const symbol of declaration.symbols||[]){
     const value=sourceValue(symbol),name=symbol.split('.').at(-1);
     if(typeof value!=='function')return failure('ENGINE_API_MISSING',{id,missing:[symbol]});
     api[name]=value;names.push(name);
    }
    api=Object.freeze(api);
   }else{
    target=declaration.root==='SILM'?root:root[declaration.root];
    if(!target||typeof target!=='object')return failure('ENGINE_ROOT_MISSING',{id,root:declaration.root});
    api=target;callTarget=target;
   }
   const missingFunctions=functions.filter(name=>typeof api[name]!=='function');
   const missingProperties=properties.filter(name=>!(name in api));
   if(missingFunctions.length||missingProperties.length)return failure('ENGINE_API_MISSING',{id,missingFunctions,missingProperties});
   const allowed=new Set(names);
   const invoke=(name,...args)=>{
    if(!allowed.has(name))return failure('ENGINE_API_NOT_DECLARED',{id,name});
    const fn=api[name];if(typeof fn!=='function')return failure('ENGINE_API_MISSING',{id,name});
    return {ok:true,value:Reflect.apply(fn,callTarget,args)};
   };
   return Object.freeze({ok:true,id,descriptor:entry,api,invoke});
  }
  function invoke(id,name,...args){
   const binding=resolve(id);if(!binding.ok)return binding;
   return binding.invoke(name,...args);
  }
  return Object.freeze({catalog,ids,descriptor,resolve,invoke});
 }
 window.SILM.createEngineAdapters=createEngineAdapters;
 window.SILM.engineAdapters=createEngineAdapters(window.SILM.engineCatalog,window.SILM);
})();
