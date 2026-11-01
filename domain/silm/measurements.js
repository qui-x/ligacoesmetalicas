'use strict';
window.SILM=window.SILM||{};
/* Módulo Medir (0.9.x): medidas do MODELO cristalográfico, nunca da tela.
   - Os pontos são sítios científicos (célula + base); o valor vem das coordenadas cartesianas em Å, construídas a
     partir dos parâmetros de rede tabelados. Zoom, redimensionamento e projeção não alteram o resultado.
   - Classificação: "Medida do modelo" (≠ dado tabelado ≠ calculado pelo SILM).
   - Montagem livre não tem escala física: nenhuma medida absoluta é produzida sem estrutura cristalina.
   - Resolução do instrumento virtual explícita; nada de "±" (não há modelo de incerteza experimental). */
SILM.units=Object.freeze({
 length:Object.freeze({'Å':{factor:1,decimals:3,name:'ångström'},'pm':{factor:100,decimals:1,name:'picômetro'},'nm':{factor:.1,decimals:4,name:'nanômetro'}}),
 /* Conversão exata e centralizada: 1 Å = 100 pm = 0,1 nm. O valor canônico persistido é sempre em Å. */
 convert(valueA,unit){const u=this.length[unit];if(!u)throw new Error('Unidade de comprimento desconhecida: '+unit);return valueA*u.factor;},
 format(value,unit,{decimals}={}){const u=this.length[unit],d=decimals??(u?u.decimals:unit==='°'?1:0),v=u?this.convert(value,unit):value;return v.toFixed(d).replace('.',',')+(unit==='1'?'':unit==='°'?'°':' '+unit);},
 spoken(value,unit){const u=this.length[unit];if(u)return this.format(value,unit).replace(' '+unit,' '+u.name+'s');if(unit==='°')return value.toFixed(1).replace('.',',')+' graus';return String(value);}
});
(()=>{
 const TYPES=Object.freeze({
  distance:Object.freeze({type:'distance',instrument:'ruler',label:'Distância',unit:'Å',resolution:.001,points:2}),
  angle:Object.freeze({type:'angle',instrument:'goniometer',label:'Ângulo',unit:'°',resolution:.1,points:3}),
  latticeParameter:Object.freeze({type:'latticeParameter',instrument:'cell-gauge',label:'Parâmetro de rede',unit:'Å',resolution:.001,points:2}),
  coordination:Object.freeze({type:'coordination',instrument:'neighbor-counter',label:'Coordenação',unit:'1',resolution:1,points:1})
 });
 const LIMIT=200;
 const round=(v,res)=>{const d=Math.max(0,Math.round(-Math.log10(res)));return +(Math.round(v/res)*res).toFixed(d);};
 const sub=(a,b)=>a.map((v,i)=>v-b[i]),norm=v=>Math.hypot(...v),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
 /* Coordenadas fracionárias de um vetor cartesiano na base dos vetores de rede (inversa 3×3). */
 function fractional(L,v){
  const [a,b,c]=L,det=a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]);
  const inv=[[ (b[1]*c[2]-b[2]*c[1])/det,-(a[1]*c[2]-a[2]*c[1])/det,(a[1]*b[2]-a[2]*b[1])/det],
   [-(b[0]*c[2]-b[2]*c[0])/det,(a[0]*c[2]-a[2]*c[0])/det,-(a[0]*b[2]-a[2]*b[0])/det],
   [ (b[0]*c[1]-b[1]*c[0])/det,-(a[0]*c[1]-a[1]*c[0])/det,(a[0]*b[1]-a[1]*b[0])/det]];
  // v = f0·a + f1·b + f2·c  →  f = v · inv (vetores de rede como linhas)
  return [0,1,2].map(j=>v[0]*inv[0][j]+v[1]*inv[1][j]+v[2]*inv[2][j]);
 }
 const siteRef=s=>({cell:[...s.cell],basis:s.basis});
 /* Cálculo a partir dos sítios científicos. Retorna {ok, value, parameter} ou {ok:false, reason}. */
 function compute(type,g,sites){
  const T=TYPES[type];if(!T||!g)return {ok:false,reason:'TYPE_INVALID'};if(!Array.isArray(sites)||sites.length!==T.points)return {ok:false,reason:'POINTS_INVALID'};
  const S=sites.map(s=>g.site(s));if(S.some(x=>!x))return {ok:false,reason:'POINTS_INVALID'};
  if(type==='distance'){const d=norm(sub(S[1].cart,S[0].cart));if(d<1e-9)return {ok:false,reason:'SAME_POINT'};return {ok:true,value:round(d,T.resolution),parameter:null};}
  if(type==='angle'){const u=sub(S[0].cart,S[1].cart),v=sub(S[2].cart,S[1].cart),nu=norm(u),nv=norm(v);if(nu<1e-9||nv<1e-9)return {ok:false,reason:'SAME_POINT'};
   const cos=Math.max(-1,Math.min(1,dot(u,v)/(nu*nv)));return {ok:true,value:round(Math.acos(cos)*180/Math.PI,T.resolution),parameter:null};}
  if(type==='latticeParameter'){
   if(S[0].basis!==S[1].basis)return {ok:false,reason:'NOT_LATTICE_VECTOR'};
   const f=fractional(g.vectors,sub(S[1].cart,S[0].cart)).map(x=>Math.abs(x)<1e-6?0:x);if(f.some(x=>Math.abs(x-Math.round(x))>1e-6))return {ok:false,reason:'NOT_LATTICE_VECTOR'};
   // Aresta da célula = translação de rede mínima: no plano basal, comprimento |a1| (no hexágono também a1 + a2);
   // ao longo do eixo vertical, uma translação unitária (c no HC; a nos cúbicos).
   const n=f.map(Math.round),len=norm(sub(S[1].cart,S[0].cart)),hex=g.model.system==='hexagonal';
   let parameter=null;
   // Estrutura geral (0.16.x): aresta = translação unitária ao longo de um eixo da célula; o parâmetro é o do eixo (a, b ou c).
   if(g.model.general){const axis=[0,1,2].filter(i=>n[i]!==0);if(axis.length===1&&Math.abs(n[axis[0]])===1)parameter=['a','b','c'][axis[0]];}
   else if(n[2]===0&&Math.abs(len-norm(g.vectors[0]))<1e-6)parameter='a';
   else if(n[0]===0&&n[1]===0&&Math.abs(n[2])===1)parameter=hex?'c':'a';
   if(!parameter)return {ok:false,reason:'NOT_CELL_EDGE'};
   return {ok:true,value:round(len,T.resolution),parameter};
  }
  if(type==='coordination'){const n=g.neighbors(S[0]);return {ok:true,value:n.list.length,parameter:null,neighbors:n};}
  return {ok:false,reason:'TYPE_INVALID'};
 }
 /* Contexto: identifica o estado da estrutura no momento da medida (para marcar medidas de estado anterior). */
 function context(structure){
  if(structure?.mode!=='crystalline')return null;const c=structure.crystallography;
  return {mode:'crystalline',structureType:c.structureType,referenceStructureId:structure.referenceStructureId,sourceId:c.sourceId,signature:c.organizedAt+'|'+structure.units.length};
 }
 const current=(m,structure)=>{const c=context(structure);return !!c&&c.signature===m.structureContext.signature&&c.structureType===m.structureContext.structureType;};
 /* Validação de cada registro (chamada pelo validador do estado científico). */
 function validate(list,state,data=SILM.data){
  const fail=reason=>({ok:false,reason}),plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v),keys=(o,k)=>plain(o)&&Object.keys(o).sort().join()===[...k].sort().join();
  if(!Array.isArray(list)||list.length>LIMIT)return fail('MEASUREMENTS_INVALID');if(!list.length)return {ok:true};
  if(!state.investigation||!state.metal)return fail('MEASUREMENT_CONTEXT_INVALID');
  const e=data.get(state.metal.atomicNumber),g=SILM.crystal.geometry(e),ids=new Set();
  for(const m of list){
   if(!keys(m,['id','type','instrument','value','unit','resolution','points','parameter','structureContext','source','metalAtomicNumber','createdAt']))return fail('MEASUREMENT_INVALID');
   if(typeof m.id!=='string'||!/^meas-[a-zA-Z0-9-]{8,80}$/.test(m.id)||ids.has(m.id))return fail('MEASUREMENT_INVALID');ids.add(m.id);
   const T=TYPES[m.type];if(!T||m.instrument!==T.instrument)return fail('MEASUREMENT_TYPE_INVALID');
   if(m.unit!==T.unit||m.resolution!==T.resolution)return fail('MEASUREMENT_UNIT_INVALID');
   if(typeof m.value!=='number'||!Number.isFinite(m.value))return fail('MEASUREMENT_VALUE_INVALID');
   if(m.metalAtomicNumber!==state.metal.atomicNumber)return fail('MEASUREMENT_METAL_MISMATCH');
   if(!Number.isFinite(Date.parse(m.createdAt)))return fail('MEASUREMENT_INVALID');
   // Sem escala física não há medida absoluta: só contexto cristalino do próprio metal.
   const c=m.structureContext;if(!keys(c,['mode','structureType','referenceStructureId','sourceId','signature'])||c.mode!=='crystalline'||!g)return fail('MEASUREMENT_WITHOUT_SCALE');
   if(c.structureType!==g.eligibility.structureType||c.referenceStructureId!==g.eligibility.referenceStructureId||c.sourceId!==g.eligibility.sourceId)return fail('MEASUREMENT_CONTEXT_INVALID');
   if(!keys(m.source,['kind','latticeSourceId'])||m.source.kind!=='MODEL_MEASUREMENT'||m.source.latticeSourceId!==g.eligibility.sourceId)return fail('MEASUREMENT_SOURCE_INVALID');
   if(!Array.isArray(m.points)||m.points.length!==T.points)return fail('MEASUREMENT_POINTS_INVALID');
   for(const p of m.points){if(!keys(p,['unitId','site'])||typeof p.unitId!=='string'||!keys(p.site,['cell','basis'])||!Array.isArray(p.site.cell)||p.site.cell.length!==3||!p.site.cell.every(v=>Number.isInteger(v)&&Math.abs(v)<=3)||!Number.isInteger(p.site.basis)||p.site.basis<0||p.site.basis>=g.model.basis.length)return fail('MEASUREMENT_POINTS_INVALID');}
   // O valor precisa ser o que o modelo dá para estes sítios (registro não pode ser adulterado).
   const r=compute(m.type,g,m.points.map(p=>p.site));if(!r.ok||Math.abs(r.value-m.value)>m.resolution/2+1e-9||r.parameter!==m.parameter)return fail('MEASUREMENT_VALUE_INVALID');
  }
  return {ok:true};
 }
 SILM.measurement=Object.freeze({types:TYPES,limit:LIMIT,round,compute,context,current,validate,siteRef,fractional});
})();
