'use strict';
/* Tabela de dados da família: vistas Compacta e Completa dos mesmos registros e "Baixar CSV bruto".
   Compacta agrupa registros consecutivos compatíveis (mesma chave e valores dentro da tolerância); nada é apagado:
   cada grupo abre em "Ver n registros". O CSV e qualquer gráfico usam sempre os dados brutos.
   SimCore.dataTable(host, {scope, records, columns:[{id, label, value(r)}], compact:{key(r), numeric(r), tolerance(r),
   valueColumn}, mode:'auto'|'compact'|'complete', autoThreshold:24, storage, storageKey, csv:{filename}, caption, empty,
   label}) → {refresh(records), get mode}. */
(()=>{
 const U=SimCore.ExperienceUI;
 /* CSV em pt-BR: ponto e vírgula, aspas quando preciso e proteção contra fórmulas em planilhas. */
 U.csv=rows=>rows.map(row=>row.map(cell=>{let v=cell==null?'':String(cell);if(/^[=+\-@]/.test(v)&&!/^[+-]?\d+([.,]\d+)?([eE][+-]?\d+)?$/.test(v))v="'"+v;return /[;"\r\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}).join(';')).join('\r\n');
 /* Baixa um arquivo de texto (com BOM, para acentos corretos em planilhas). */
 U.download=(name,text,type='text/plain')=>{const blob=new Blob(['﻿'+String(text)],{type:type+';charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=String(name);document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return true;};
 SimCore.dataTable=(host,options={})=>{
  const S=SimCore,scope=options.scope||S.createScope(),columns=options.columns||[];if(!columns.length)throw new TypeError('Tabela: informe as colunas');
  const key=options.storageKey||'data-table.mode',store=options.storage||null,threshold=Number(options.autoThreshold)||24;
  let records=[...(options.records||[])],chosen=store?.get(key,null)||options.mode||'auto',open=new Set();
  const cell=(c,r)=>{try{const v=c.value?c.value(r):r[c.id];return v==null||v===''?'—':String(v);}catch{return '—';}};
  const mode=()=>chosen==='compact'||chosen==='complete'?chosen:records.length>threshold?'compact':'complete';
  const wrap=U.element('div',null,'data-table');host.append(wrap);
  function groups(){
   const c=options.compact;if(!c)return records.map((r,i)=>({items:[r],start:i}));
   const out=[];for(const [i,r]of records.entries()){const last=out.at(-1),k=String(c.key?.(r)??''),n=Number(c.numeric?.(r)),tol=Math.abs(Number(c.tolerance?.(r))||0);
    if(last&&last.key===k&&Number.isFinite(n)&&Number.isFinite(last.base)&&Math.abs(n-last.base)<=tol){last.items.push(r);last.min=Math.min(last.min,n);last.max=Math.max(last.max,n);continue;}
    out.push({items:[r],start:i,key:k,base:n,min:n,max:n});}
   return out;
  }
  function render(){
   wrap.replaceChildren();const m=mode();
   const bar=U.element('div',null,'data-table-bar');const group=U.element('div',null,'segmented data-table-modes');group.setAttribute('role','group');group.setAttribute('aria-label',options.label||'Apresentação dos dados');
   for(const [id,label]of [['compact','Compacta'],['complete','Completa']]){const b=U.element('button',label,'secondary-btn');b.type='button';b.dataset.tableMode=id;b.setAttribute('aria-pressed',String(m===id));scope.listen(b,'click',()=>{chosen=id;store?.set(key,id);render();wrap.querySelector('[data-table-mode='+id+']')?.focus();});group.append(b);}
   const csv=U.element('button','Baixar CSV bruto','quiet-btn data-table-csv');csv.type='button';csv.disabled=!records.length;scope.listen(csv,'click',download);bar.append(group,csv);wrap.append(bar);
   if(!records.length){wrap.append(U.element('p',options.empty||'Nenhum registro ainda.','panel-empty data-table-empty'));return;}
   if(m==='compact'&&options.compact)wrap.append(U.element('p','Registros consecutivos compatíveis com a resolução e a tolerância de apresentação foram agrupados. Os dados brutos, os mínimos e os máximos permanecem preservados.','field-hint data-table-note'));
   const scroller=U.element('div',null,'table-scroll');scroller.tabIndex=0;scroller.setAttribute('role','region');scroller.setAttribute('aria-label',options.caption||'Dados da investigação');
   const table=U.element('table');if(options.caption){const cap=U.element('caption',options.caption);table.append(cap);}
   const head=U.element('thead'),hr=U.element('tr');for(const c of columns){const th=U.element('th',c.label);th.scope='col';hr.append(th);}if(m==='compact'&&options.compact){const th=U.element('th','n');th.scope='col';hr.append(th);}head.append(hr);
   const body=U.element('tbody');
   const row=(r,extra=null,cls='')=>{const tr=U.element('tr',null,cls);for(const c of columns)tr.append(U.element('td',cell(c,r)));if(extra)tr.append(extra);return tr;};
   if(m==='complete'||!options.compact)for(const r of records)body.append(row(r));
   else for(const g of groups()){
    if(g.items.length===1){body.append(row(g.items[0],U.element('td','1')));continue;}
    const id='grp-'+g.start,count=U.element('td'),toggle=U.element('button','Ver '+g.items.length+' registros','text-btn');toggle.type='button';toggle.setAttribute('aria-expanded',String(open.has(id)));count.append(toggle);
    const summary=row(g.items[0],count,'data-table-group');const vc=columns.findIndex(c=>c.id===options.compact.valueColumn);if(vc>=0&&g.min!==g.max){const fmt=options.compact.format||(v=>String(v).replace('.',','));summary.children[vc].textContent=fmt(g.min)+' – '+fmt(g.max);}
    body.append(summary);const details=g.items.map(r=>{const tr=row(r,U.element('td',''),'data-table-detail');tr.hidden=!open.has(id);return tr;});body.append(...details);
    scope.listen(toggle,'click',()=>{const on=!open.has(id);on?open.add(id):open.delete(id);toggle.setAttribute('aria-expanded',String(on));details.forEach(tr=>{tr.hidden=!on;});});
   }
   table.append(head,body);scroller.append(table);wrap.append(scroller);
  }
  function download(){const rows=[columns.map(c=>c.label),...records.map(r=>columns.map(c=>{const v=c.raw?c.raw(r):cell(c,r);return v==='—'?'':v;}))];const name=typeof options.csv?.filename==='function'?options.csv.filename():options.csv?.filename||'dados.csv';U.download(name,U.csv(rows),'text/csv');S.notifications.show('Tabela baixada em CSV.',{type:'success'});}
  render();
  return {refresh(next=records){records=[...(next||[])];render();},download,get mode(){return mode();},get element(){return wrap;}};
 };
})();
