'use strict';
/* Documento único de domínio: cada transição publica todos os seus documentos numa só gravação. */
SILM.createDurableStorage=({backend,prefix='silm-base-integration:',onStatus=()=>{},onConflict=()=>{},events=globalThis.window})=>{
 const key=prefix+'documents-v1',format='silm-documents-v1',errors=new Set();
 const critical=k=>['comparison.recent','scientific.state','route.session','representation.view','journal-document-v1','teacher.library','mounting.presets','operation.history','recovery.snapshot'].includes(k)||/^report\.(free|archive):/.test(k);
 let raw=null,document={format,revision:0,documents:{}},conflict=false,depth=0,draft=null,changed=new Set(),rollbacks=[],aborted=null;
 const copy=x=>JSON.parse(JSON.stringify(x));
 const read=k=>backend.getItem(k);
 const valid=d=>d&&d.format===format&&Number.isSafeInteger(d.revision)&&d.revision>=0&&d.documents&&typeof d.documents==='object'&&!Array.isArray(d.documents)&&Object.entries(d.documents).every(([k,v])=>critical(k)&&typeof v==='string');
 const status=()=>({ok:!conflict&&!errors.size,conflict,documents:[...errors]});
 const notify=()=>onStatus(status());
 function lock(){if(!conflict){conflict=true;onConflict();notify();}return false;}
 try{raw=read(key);if(raw!==null){const value=JSON.parse(raw);if(!valid(value))throw Error('Documento inválido');document=value;}}
 catch{errors.add('documento');conflict=true;onConflict('invalid');}
 const observedLegacy=new Map();
 function current(k){
  const source=draft||document;
  if(Object.hasOwn(source.documents,k))return source.documents[k];
  if(raw!==null)return null;
  try{const value=read(prefix+k);if(!observedLegacy.has(k))observedLegacy.set(k,value);return value;}catch{errors.add(k);notify();return null;}
 }
 function writable(){
  if(conflict)return false;
  try{
   if(read(key)!==raw)return lock();
   if(raw===null)for(const [k,value]of observedLegacy)if(read(prefix+k)!==value)return lock();
   return true;
  }catch{errors.add('documento');notify();return false;}
 }
 function finishFailure(reason){
  const callbacks=rollbacks;draft=null;depth=0;rollbacks=[];
  for(const k of changed)errors.add(k);changed=new Set();
  for(const rollback of callbacks.reverse())try{rollback();}catch{/* O último documento persistido continua sendo a autoridade. */}
  notify();return {ok:false,reason:conflict?'STORAGE_CONFLICT':reason||'STORAGE_FAILURE'};
 }
 function transaction(fn,{onRollback}={}){
  if(depth){if(onRollback)rollbacks.push(onRollback);depth++;try{return {ok:true,value:fn()};}catch(error){aborted=error;return {ok:false,reason:error.message||'STORAGE_FAILURE'};}finally{depth--;}}
  if(!writable()){onRollback?.();return {ok:false,reason:conflict?'STORAGE_CONFLICT':'STORAGE_FAILURE'};}
  draft=copy(document);changed=new Set();rollbacks=onRollback?[onRollback]:[];aborted=null;depth=1;
  try{
   const value=fn();if(aborted)throw aborted;
   if(!writable())return finishFailure();
   if(changed.size){
    // A primeira gravação incorpora os documentos legados sem apagá-los.
    if(raw===null){
     for(let i=0;i<backend.length;i++){const full=backend.key(i);if(full?.startsWith(prefix)){const legacy=full.slice(prefix.length);if(critical(legacy)&&!Object.hasOwn(draft.documents,legacy)){const v=read(full);if(v!==null)draft.documents[legacy]=v;}}}
    }
    draft.revision=document.revision+1;
    const encoded=JSON.stringify(draft);backend.setItem(key,encoded);
    if(read(key)!==encoded){lock();return finishFailure();}
    document=draft;raw=encoded;for(const k of changed)errors.delete(k);errors.delete('documento');
   }
   draft=null;depth=0;changed=new Set();rollbacks=[];notify();return {ok:true,value};
  }catch{return finishFailure();}
 }
 function write(k,value){
  if(!critical(k)){try{backend.setItem(prefix+k,value);errors.delete(k);notify();return true;}catch{errors.add(k);notify();return false;}}
  const result=transaction(()=>{draft.documents[k]=value;changed.add(k);return true;});return result.ok;
 }
 const port={
  read(k){if(!critical(k)){try{return read(prefix+k);}catch{return null;}}return current(k);},
  write,transaction,status,
  get(k,fallback=null){try{const value=port.read(k);return value===null?fallback:JSON.parse(value);}catch{return fallback;}},
  set(k,value){return write(k,JSON.stringify(value));},
  keys(){return [...new Set([...Object.keys(document.documents),...observedLegacy.keys()])];},
  get storageKey(){return key;}
 };
 events?.addEventListener?.('storage',event=>{
  if(event.key===key&&event.newValue!==raw)lock();
  else if(raw===null&&event.key?.startsWith(prefix)&&observedLegacy.has(event.key.slice(prefix.length))&&observedLegacy.get(event.key.slice(prefix.length))!==event.newValue)lock();
 });
 return Object.freeze(port);
};
SILM.protectScientificModel=(model,storage,{onFailure=()=>{}}={})=>{
 const changes=new Set(['begin','setModule','resetInvestigation','close','setStatus','restore','beginAssembly','addUnit','moveUnit','undo','clearStructure','setAssistance','setAssemblyStatus','organize','restoreFree','setCrystalRepresentation','activateElectrons','setElectronRepresentation','startProperty','setPropertyParams','restoreProperty','endProperty','addMeasurement','removeMeasurement','clearMeasurements','addCalculation','removeCalculation','clearCalculations','load']);
 const objectResults=new Set(['restore','addUnit','moveUnit','undo','organize','startProperty','addMeasurement','addCalculation','load']);
 const wrapped={};
 return new Proxy({},{get(_target,key){
  const member=Reflect.get(model,key);if(typeof member!=='function'||!changes.has(key))return member;
  return wrapped[key]??=(...args)=>{
   const checkpoint=model.checkpoint();
   const result=storage.transaction(()=>member(...args),{onRollback:()=>model.rollback(checkpoint)});
   if(result.ok)return result.value;
   onFailure(result.reason);return objectResults.has(key)?{ok:false,reason:result.reason}:false;
  };
 }});
};
