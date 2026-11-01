'use strict';
window.SILM=window.SILM||{};
/* Módulo Calcular (0.10.x): relações cristalográficas e grandezas derivadas sobre o MESMO scientificState.
   - Catálogo único de fórmulas (SILM.formulas): nenhum componente guarda fórmula própria.
   - Constantes centrais (SILM.constants) com valor, unidade e fonte: sem números mágicos espalhados.
   - Toda entrada registra nome, valor, unidade e origem: Dado tabelado, Medida do modelo, Valor informado pelo
     usuário, Calculado pelo SILM ou Constante definida. O resultado é sempre "Calculado pelo SILM".
   - Modelo geométrico de esferas rígidas, declarado em cada fórmula que o usa. O fator de empacotamento não é a
     fração do volume ocupada pela densidade eletrônica real.
   - Célula adotada no HC: prisma hexagonal convencional (3 células primitivas), a mesma desenhada na cena. */
SILM.constants=Object.freeze({
 /* SI 2019: constante definidora, valor exato. */
 avogadro:Object.freeze({key:'NA',symbol:'N_A',name:'constante de Avogadro',value:6.02214076e23,unit:'mol⁻¹',exact:true,sourceId:'src-bipm-si-2019',display:'6,02214076 × 10²³ mol⁻¹'}),
 /* Definição da unidade (1 Å = 10⁻¹⁰ m): relação exata, não é dado medido. */
 angstrom3ToCm3:Object.freeze({key:'A3cm3',symbol:'1 Å³',name:'1 ångström cúbico em centímetros cúbicos',value:1e-24,unit:'cm³',exact:true,sourceId:null,display:'10⁻²⁴ cm³ (definição: 1 Å = 10⁻¹⁰ m)'}),
 idealHcpRatio:Object.freeze({key:'caIdeal',symbol:'(c/a)ideal',name:'razão c/a do empilhamento ideal de esferas rígidas',value:SILM.crystal.models.HCP.idealRatio,unit:'1',exact:true,sourceId:null,display:'√(8/3) ≈ 1,633 (geometria do empilhamento ideal)'})
});
(()=>{
 const C=SILM.constants,PI=Math.PI,SQ2=Math.SQRT2,SQ3=Math.sqrt(3);
 /* Conversões do Calcular (§15), centralizadas. Comprimento reutiliza SILM.units (0.9.x): 1 Å = 100 pm = 0,1 nm.
    Volume: 1 Å³ = 10⁻³ nm³ = 10⁻²⁴ cm³ = 10⁻³⁰ m³. Densidade: 1 g/cm³ = 1000 kg/m³. O valor canônico é sempre o da fórmula. */
 const CONVERT=Object.freeze({volume:Object.freeze({'Å³':1,'nm³':1e-3,'cm³':C.angstrom3ToCm3.value,'m³':1e-30}),density:Object.freeze({'g/cm³':1,'kg/m³':1e3})});
 function convert(kind,value,unit){if(kind==='length')return SILM.units.convert(value,unit);const t=CONVERT[kind];if(!t||!(unit in t))throw new Error('Unidade desconhecida: '+unit);return value*t[unit];}
 const ORIGINS=Object.freeze({TABULATED:'Dado tabelado',MODEL_MEASUREMENT:'Medida do modelo',USER:'Valor informado pelo usuário',CALCULATED:'Calculado pelo SILM',CONSTANT:'Constante definida'});
 const IN={
  a:{key:'a',symbol:'a',name:'parâmetro de rede a',unit:'Å',origins:['TABULATED','MODEL_MEASUREMENT','USER','CALCULATED'],quantity:'latticeParameter'},
  b:{key:'b',symbol:'b',name:'parâmetro de rede b',unit:'Å',origins:['TABULATED','MODEL_MEASUREMENT','USER'],quantity:null},
  c:{key:'c',symbol:'c',name:'parâmetro de rede c',unit:'Å',origins:['TABULATED','MODEL_MEASUREMENT','USER'],quantity:null},
  alpha:{key:'alpha',symbol:'α',name:'ângulo α da célula (entre os eixos b e c)',unit:'°',origins:['TABULATED','USER'],quantity:null},
  beta:{key:'beta',symbol:'β',name:'ângulo β da célula (entre os eixos a e c)',unit:'°',origins:['TABULATED','USER'],quantity:null},
  gamma:{key:'gamma',symbol:'γ',name:'ângulo γ da célula (entre os eixos a e b)',unit:'°',origins:['TABULATED','USER'],quantity:null},
  r:{key:'r',symbol:'r',name:'raio metálico (esferas rígidas)',unit:'Å',origins:['CALCULATED','USER'],quantity:'radius'},
  n:{key:'n',symbol:'n',name:'número efetivo de átomos por célula',unit:'1',origins:['CALCULATED'],quantity:'effectiveAtoms'},
  V:{key:'V',symbol:'V',name:'volume da célula',unit:'Å³',origins:['CALCULATED','USER'],quantity:'cellVolume'},
  M:{key:'M',symbol:'M',name:'massa molar',unit:'g/mol',origins:['TABULATED','USER'],quantity:null}
 };
 const step=(symbol,name,value,unit,interval=null)=>({symbol,name,value,unit,interval});
 const counting={
  BCC:{parts:[{label:'vértices',count:8,share:1/8,shareText:'1/8'},{label:'centro do corpo',count:1,share:1,shareText:'1'}],cell:'cúbica (CCC)'},
  FCC:{parts:[{label:'vértices',count:8,share:1/8,shareText:'1/8'},{label:'centros de face',count:6,share:1/2,shareText:'1/2'}],cell:'cúbica (CFC)'},
  HCP:{parts:[{label:'vértices',count:12,share:1/6,shareText:'1/6'},{label:'centros das bases',count:2,share:1/2,shareText:'1/2'},{label:'internos',count:3,share:1,shareText:'1'}],cell:'prisma hexagonal convencional (3 células primitivas)'}
 };
 const nFormula=type=>{const k=counting[type],expr='n = '+k.parts.map(p=>p.count+' × '+p.shareText).join(' + ');
  return {id:'effective-atoms-'+type.toLowerCase(),quantity:'effectiveAtoms',name:'Número efetivo de átomos por célula',applicability:[type],requiredInputs:[],outputUnit:'1',outputSymbol:'n',
   expression:expr,spoken:'n é a soma das frações de cada centro que pertencem à célula: '+k.parts.map(p=>p.count+' '+p.label+' vezes '+p.shareText.replace('1/','um sobre ')).join(', mais ')+'.',
   model:'contagem geométrica',notes:'Cada centro na fronteira da célula é compartilhado com as células vizinhas; só a fração interna conta. Célula: '+k.cell+'.',
   compute:()=>{const steps=k.parts.map(p=>step(p.count+' × '+p.shareText,p.label,p.count*p.share,'1'));return {value:Math.round(steps.reduce((s,x)=>s+x.value,0)),intermediates:steps};}};};
 /* 0.16.x — estruturas gerais (fora de CCC/CFC/HC). Só relações exatas da geometria da célula: o número efetivo vem da
    contagem das posições desenhadas (cada uma com a fração que fica dentro da célula) e o volume, dos seis parâmetros.
    Raio e empacotamento de esferas rígidas NÃO são oferecidos: nessas estruturas há distâncias de contato diferentes e
    a esfera rígida única não descreve o sólido. */
 const GENERAL=Object.freeze(Object.keys(SILM.crystal.generalTypes)),rad=Math.PI/180;
 const list=[
  nFormula('BCC'),nFormula('FCC'),nFormula('HCP'),
  {id:'effective-atoms-general',quantity:'effectiveAtoms',name:'Número efetivo de átomos por célula',applicability:GENERAL,requiredInputs:[],outputUnit:'1',outputSymbol:'n',
   expression:'n = Σ (centros em cada posição × fração dentro da célula)',spoken:'n é a soma, para cada posição da célula, do número de centros vezes a fração de cada um que fica dentro da célula.',
   model:'contagem geométrica',notes:'Vértice conta 1/8, aresta 1/4, face 1/2 e interior 1. As posições vêm dos sítios e das operações de simetria da ficha cristalográfica; o total é o número de átomos da célula (Z).',
   describe:g=>g?.model?.general?'Nesta estrutura: n = '+g.model.effective.explanation+'.':'',
   compute:(i,ctx)=>{const parts=ctx?.geometry?.model?.general?ctx.geometry.model.effective.parts:null;if(!parts)return {value:NaN,intermediates:[]};
    const steps=parts.map(p=>step(p.count+' × '+p.text,p.count===1?p.label:p.many,p.count*p.share,'1'));return {value:Math.round(steps.reduce((s,x)=>s+x.value,0)),intermediates:steps};}},
  {id:'cell-volume-general',quantity:'cellVolume',name:'Volume da célula unitária',applicability:GENERAL,requiredInputs:[IN.a,IN.b,IN.c,IN.alpha,IN.beta,IN.gamma],outputUnit:'Å³',outputSymbol:'V',
   expression:'V = a · b · c · √(1 − cos²α − cos²β − cos²γ + 2 · cos α · cos β · cos γ)',spoken:'V é igual a a vezes b vezes c, vezes a raiz de um menos cosseno quadrado de alfa, menos cosseno quadrado de beta, menos cosseno quadrado de gama, mais duas vezes o produto dos três cossenos.',
   model:'geometria da célula (paralelepípedo)',notes:'Volume do paralelepípedo definido pelos três eixos da célula. Com os três ângulos retos, reduz-se a a · b · c; é a mesma célula desenhada na cena.',
   compute:i=>{const [ca,cb,cg]=[i.alpha,i.beta,i.gamma].map(x=>Math.cos(x*rad)),f2=1-ca*ca-cb*cb-cg*cg+2*ca*cb*cg;if(!(f2>0)||[i.alpha,i.beta,i.gamma].some(x=>x>=180))return {value:NaN,intermediates:[]};
    const f=Math.sqrt(f2);return {value:i.a*i.b*i.c*f,intermediates:[step('a · b · c','produto dos eixos',i.a*i.b*i.c,'Å³'),step('√(1 − cos²α − cos²β − cos²γ + 2 cos α cos β cos γ)','fator dos ângulos',f,'1')]};}},
  {id:'cell-volume-cubic',quantity:'cellVolume',name:'Volume da célula unitária',applicability:['BCC','FCC'],requiredInputs:[IN.a],outputUnit:'Å³',outputSymbol:'V',
   expression:'V = a³',spoken:'V é igual a a ao cubo.',model:'geometria da célula cúbica',notes:'Célula cúbica convencional.',
   compute:i=>({value:i.a**3,intermediates:[]})},
  {id:'cell-volume-hcp',quantity:'cellVolume',name:'Volume da célula unitária',applicability:['HCP'],requiredInputs:[IN.a,IN.c],outputUnit:'Å³',outputSymbol:'V',
   expression:'V = (3√3/2) · a² · c',spoken:'V é igual a três raiz de três sobre dois, vezes a ao quadrado, vezes c.',model:'geometria do prisma hexagonal',notes:'Prisma hexagonal convencional (3 células primitivas): área da base hexagonal (3√3/2)·a² vezes a altura c. A célula primitiva teria V/3.',
   compute:i=>{const base=3*SQ3/2*i.a**2;return {value:base*i.c,intermediates:[step('A = (3√3/2) · a²','área da base hexagonal',base,'Å²')]};}},
  {id:'radius-from-a-bcc',quantity:'radius',name:'Raio metálico a partir do parâmetro',applicability:['BCC'],requiredInputs:[IN.a],outputUnit:'Å',outputSymbol:'r',
   expression:'r = √3 · a / 4',spoken:'r é igual a raiz de três vezes a, dividido por quatro.',model:'esferas rígidas em contato ao longo da diagonal do cubo (4r = √3·a)',notes:'Válida somente para CCC.',
   compute:i=>({value:SQ3*i.a/4,intermediates:[step('d = √3 · a','diagonal do cubo',SQ3*i.a,'Å')]})},
  {id:'radius-from-a-fcc',quantity:'radius',name:'Raio metálico a partir do parâmetro',applicability:['FCC'],requiredInputs:[IN.a],outputUnit:'Å',outputSymbol:'r',
   expression:'r = √2 · a / 4',spoken:'r é igual a raiz de dois vezes a, dividido por quatro.',model:'esferas rígidas em contato ao longo da diagonal da face (4r = √2·a)',notes:'Válida somente para CFC.',
   compute:i=>({value:SQ2*i.a/4,intermediates:[step('d = √2 · a','diagonal da face',SQ2*i.a,'Å')]})},
  {id:'radius-from-ac-hcp',quantity:'radius',name:'Raio metálico a partir dos parâmetros',applicability:['HCP'],requiredInputs:[IN.a,IN.c],outputUnit:'Å',outputSymbol:'r',
   expression:'r = d / 2,  d = mín(a; √(a²/3 + c²/4))',spoken:'r é a metade da menor distância entre vizinhos: o menor valor entre a, no plano basal, e raiz de a ao quadrado sobre três mais c ao quadrado sobre quatro, entre camadas.',
   model:'esferas rígidas em contato com os vizinhos mais próximos',notes:'No HC real, c/a difere do ideal: se c/a < √(8/3), os vizinhos mais próximos estão nas camadas adjacentes; se c/a > √(8/3), no próprio plano basal. A fórmula cúbica não se aplica.',
   compute:i=>{const inPlane=i.a,between=Math.sqrt(i.a**2/3+i.c**2/4),d=Math.min(inPlane,between);return {value:d/2,intermediates:[step('d₁ = a','distância no plano basal',inPlane,'Å'),step('d₂ = √(a²/3 + c²/4)','distância entre camadas',between,'Å'),step('d = mín(d₁; d₂)','distância de contato',d,'Å')]};}},
  {id:'a-from-radius-bcc',quantity:'latticeParameter',name:'Parâmetro de rede a partir do raio',applicability:['BCC'],requiredInputs:[IN.r],outputUnit:'Å',outputSymbol:'a',
   expression:'a = 4r / √3',spoken:'a é igual a quatro r dividido por raiz de três.',model:'esferas rígidas em contato ao longo da diagonal do cubo',notes:'Válida somente para CCC.',
   compute:i=>({value:4*i.r/SQ3,intermediates:[]})},
  {id:'a-from-radius-fcc',quantity:'latticeParameter',name:'Parâmetro de rede a partir do raio',applicability:['FCC'],requiredInputs:[IN.r],outputUnit:'Å',outputSymbol:'a',
   expression:'a = 2√2 · r',spoken:'a é igual a dois raiz de dois vezes r.',model:'esferas rígidas em contato ao longo da diagonal da face',notes:'Válida somente para CFC. No HC, a relação inversa exige c/a e não é oferecida.',
   compute:i=>({value:2*SQ2*i.r,intermediates:[]})},
  {id:'packing-factor',quantity:'packingFactor',name:'Fator de empacotamento atômico',applicability:['BCC','FCC','HCP'],requiredInputs:[IN.n,IN.r,IN.V],outputUnit:'1',outputSymbol:'FE',
   expression:'FE = n · (4/3)πr³ / V',spoken:'FE é igual a n vezes quatro terços de pi r ao cubo, dividido pelo volume da célula.',model:'esferas rígidas',notes:'Fração do volume da célula ocupada por esferas rígidas de raio r. Não é a fração ocupada pela densidade eletrônica real.',
   compute:i=>{const sphere=4/3*PI*i.r**3,filled=i.n*sphere;return {value:filled/i.V,intermediates:[step('v = (4/3)πr³','volume de uma esfera',sphere,'Å³'),step('n · v','volume ocupado pelas esferas',filled,'Å³'),step('V','volume da célula',i.V,'Å³')]};},
   check:value=>value<=1+1e-9?null:'PHYSICALLY_INVALID'},
  {id:'theoretical-density',quantity:'density',name:'Densidade teórica',applicability:['BCC','FCC','HCP',...GENERAL],requiredInputs:[IN.n,IN.M,IN.V],constants:['avogadro','angstrom3ToCm3'],outputUnit:'g/cm³',outputSymbol:'ρ',
   expression:'ρ = n · M / (N_A · V)',spoken:'rô é igual a n vezes a massa molar, dividido pela constante de Avogadro vezes o volume da célula.',model:'célula ideal sem defeitos, na condição de referência dos parâmetros',notes:'Massa da célula = n·M/N_A; o volume em Å³ é convertido para cm³ (1 Å³ = 10⁻²⁴ cm³). A densidade é calculada, não medida.',
   compute:i=>{const one=M=>{const mass=i.n*M/C.avogadro.value,vol=i.V*C.angstrom3ToCm3.value;return {mass,vol,rho:mass/vol};};
    if(Array.isArray(i.M)){const lo=one(i.M[0]),hi=one(i.M[1]);return {value:null,interval:[lo.rho,hi.rho],intermediates:[step('m = n · M / N_A','massa da célula (intervalo)',null,'g',[lo.mass,hi.mass]),step('V','volume da célula em cm³',lo.vol,'cm³')]};}
    const x=one(i.M);return {value:x.rho,intermediates:[step('m = n · M / N_A','massa da célula',x.mass,'g'),step('V · 10⁻²⁴','volume da célula em cm³',x.vol,'cm³')]};}},
  {id:'ca-ratio-hcp',quantity:'caRatio',name:'Razão c/a',applicability:['HCP'],requiredInputs:[IN.a,IN.c],constants:['idealHcpRatio'],outputUnit:'1',outputSymbol:'c/a',
   expression:'c/a',spoken:'c dividido por a.',model:'razão dos parâmetros do metal',notes:'A razão do empilhamento ideal de esferas rígidas, √(8/3) ≈ 1,633, é um valor geométrico de referência. Não é dado do metal, e a diferença não é erro experimental.',
   compute:i=>({value:i.c/i.a,intermediates:[step('(c/a)ideal = √(8/3)','razão do empilhamento ideal (geometria)',C.idealHcpRatio.value,'1')]})}
 ];
 /* Referências de cada fórmula (§5). A densidade usa N_A exato do SI (BIPM 2019). As demais relações são derivações geométricas
    da célula adotada, documentadas em docs/FORMULAS-CRISTALOGRAFICAS.md e conferidas pelos testes; os dados de entrada trazem a própria fonte. */
 const REFERENCES={'theoretical-density':['src-bipm-si-2019']};
 for(const f of list)f.references=Object.freeze(REFERENCES[f.id]||[]);
 const FORMULAS=Object.freeze(Object.fromEntries(list.map(f=>[f.id,Object.freeze(f)])));
 const QUANTITY=Object.freeze({effectiveAtoms:'Número efetivo',cellVolume:'Volume da célula',radius:'Raio metálico',latticeParameter:'Parâmetro de rede',packingFactor:'Fator de empacotamento',density:'Densidade teórica',caRatio:'Razão c/a'});
 const LIMIT=200;
 const applicable=type=>list.filter(f=>f.applicability.includes(type));
 /* Número efetivo: tabela fixa nos modelos canônicos; nas estruturas gerais, a contagem da célula construída para o metal. */
 const effective=(type,element)=>counting[type]?Math.round(counting[type].parts.reduce((s,p)=>s+p.count*p.share,0)):(g=>g?.model.id===type?g.model.effective.value:null)(element&&SILM.crystal.geometry(element));
 const effectiveFormula=type=>counting[type]?'effective-atoms-'+type.toLowerCase():'effective-atoms-general';
 /* Valores que o SILM conhece (modo assistido), sempre com origem. */
 function tabulated(element,key){
  const st=SILM.data.structure(element);
  if(['a','b','c','alpha','beta','gamma'].includes(key)){const p=st?.latticeParameters?.[key],unit=key.length===1?'Å':'°';return p?{value:p.value,unit,origin:'TABULATED',ref:{sourceId:p.sourceId},display:String(p.display).replace('.',',')+(unit==='Å'?' Å':'°')}:null;}
  if(key==='M'){const w=element.atomicWeight;if(!w||!['standard','interval'].includes(w.form))return null;return {value:w.form==='interval'?[...w.interval]:w.value,unit:'g/mol',origin:'TABULATED',ref:{sourceId:w.sourceId},display:w.display.replace(/\./g,',')+' g/mol',note:w.form==='interval'?'Peso atômico padrão em intervalo (variação isotópica natural): o resultado será um intervalo.':'Massa molar numericamente igual ao peso atômico padrão, em g/mol.'};}
  return null;
 }
 /* Arredondamento de apresentação: 4 algarismos significativos (sem regra sofisticada de significativos). */
 function sig(value,digits=4){if(!Number.isFinite(value))return '—';if(value===0)return '0';const p=Math.max(0,digits-1-Math.floor(Math.log10(Math.abs(value))));return (p>0?value.toFixed(p):String(Math.round(value))).replace('.',',');}
 function format(result,unit){
  if(unit==='1'&&result.value!==null&&Number.isInteger(result.value))return String(result.value);
  const u=unit==='1'?'':' '+unit;
  if(result.interval){const [a,b]=result.interval.map(x=>sig(x));return a===b?a+u:a+' a '+b+u;}
  return sig(result.value)+u;
 }
 const percent=v=>sig(v*100,3)+' %';
 const context=s=>SILM.measurement.context(s);
 const current=(c,s)=>SILM.measurement.current({structureContext:c.structureContext},s);
 const same=(x,y)=>Math.abs(x-y)<=1e-9*Math.max(1,Math.abs(x),Math.abs(y));
 const valuesOf=inputs=>Object.fromEntries(inputs.map(x=>[x.key,x.value]));
 function compute(formulaId,inputs,ctx={}){
  const f=FORMULAS[formulaId];if(!f)return {ok:false,reason:'FORMULA_UNKNOWN'};
  const given=new Map(inputs.map(x=>[x.key,x]));
  for(const r of f.requiredInputs){const x=given.get(r.key);if(!x)return {ok:false,reason:'INPUT_MISSING',input:r.key};
   const ok=v=>typeof v==='number'&&Number.isFinite(v)&&v>0;if(!(Array.isArray(x.value)?x.value.length===2&&x.value.every(ok)&&x.value[0]<=x.value[1]:ok(x.value)))return {ok:false,reason:'INPUT_INVALID',input:r.key};}
  const out=f.compute(valuesOf(inputs),ctx);const vals=out.interval||[out.value];
  if(!vals.every(v=>Number.isFinite(v)&&v>0))return {ok:false,reason:'RESULT_INVALID'};
  const problem=f.check?.(out.interval?out.interval[1]:out.value);if(problem)return {ok:false,reason:problem};
  return {ok:true,result:{value:out.value,interval:out.interval||null},intermediates:out.intermediates};
 }
 /* Validação de cada registro (chamada pelo validador do estado científico). Recalcula o resultado. */
 function validate(records,state,data=SILM.data){
  const fail=reason=>({ok:false,reason}),plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v),keys=(o,k)=>plain(o)&&Object.keys(o).sort().join()===[...k].sort().join();
  if(!Array.isArray(records)||records.length>LIMIT)return fail('CALCULATIONS_INVALID');if(!records.length)return {ok:true};
  if(!state.investigation||!state.metal)return fail('CALCULATION_CONTEXT_INVALID');
  const e=data.get(state.metal.atomicNumber),g=SILM.crystal.geometry(e),ids=new Set();if(!g)return fail('CALCULATION_WITHOUT_STRUCTURE');
  for(const m of records){
   if(!keys(m,['id','type','formulaId','structureType','inputs','result','unit','provenance','structureContext','metalAtomicNumber','createdAt']))return fail('CALCULATION_INVALID');
   if(typeof m.id!=='string'||!/^calc-[a-zA-Z0-9-]{8,80}$/.test(m.id)||ids.has(m.id))return fail('CALCULATION_INVALID');
   const f=FORMULAS[m.formulaId];if(!f||m.type!==f.quantity)return fail('FORMULA_UNKNOWN');
   if(!f.applicability.includes(m.structureType)||m.structureType!==g.eligibility.structureType)return fail('FORMULA_NOT_APPLICABLE');
   if(m.unit!==f.outputUnit)return fail('CALCULATION_UNIT_INVALID');
   if(m.metalAtomicNumber!==state.metal.atomicNumber)return fail('CALCULATION_METAL_MISMATCH');
   if(!Number.isFinite(Date.parse(m.createdAt)))return fail('CALCULATION_INVALID');
   const c=m.structureContext;if(!keys(c,['mode','structureType','referenceStructureId','sourceId','signature'])||c.mode!=='crystalline'||c.structureType!==m.structureType||c.sourceId!==g.eligibility.sourceId)return fail('CALCULATION_CONTEXT_INVALID');
   const need=[...f.requiredInputs.map(r=>r.key),...(f.constants||[]).map(k=>C[k].key)];
   if(!Array.isArray(m.inputs)||m.inputs.length!==need.length||need.some(k=>!m.inputs.some(x=>x.key===k)))return fail('CALCULATION_INPUTS_INVALID');
   for(const x of m.inputs){
    if(!keys(x,['key','symbol','name','value','unit','origin','ref']))return fail('CALCULATION_INPUTS_INVALID');
    const constant=Object.values(C).find(k=>k.key===x.key);
    if(constant){if(x.origin!=='CONSTANT'||x.value!==constant.value||x.unit!==constant.unit)return fail('CALCULATION_CONSTANT_INVALID');continue;}
    const spec=f.requiredInputs.find(r=>r.key===x.key);if(!spec.origins.includes(x.origin)||x.unit!==spec.unit)return fail('CALCULATION_ORIGIN_INVALID');
    const num=v=>typeof v==='number'&&Number.isFinite(v)&&v>0;if(!(num(x.value)||(x.key==='M'&&Array.isArray(x.value)&&x.value.length===2&&x.value.every(num))))return fail('CALCULATION_VALUE_INVALID');
    if(x.origin==='TABULATED'){const t=tabulated(e,x.key);if(!t||JSON.stringify(t.value)!==JSON.stringify(x.value)||!plain(x.ref)||x.ref.sourceId!==t.ref.sourceId)return fail('CALCULATION_TABULATED_MISMATCH');}
    if(x.origin==='MODEL_MEASUREMENT'&&!(plain(x.ref)&&/^meas-[a-zA-Z0-9-]{8,80}$/.test(x.ref.measurementId||'')))return fail('CALCULATION_ORIGIN_INVALID');
    if(x.origin==='USER'&&x.ref!==null)return fail('CALCULATION_ORIGIN_INVALID');
    if(x.origin==='CALCULATED'){if(!plain(x.ref)||!(/^calc-[a-zA-Z0-9-]{8,80}$/.test(x.ref.calculationId||'')||(FORMULAS[x.ref.formulaId]?.applicability.includes(m.structureType))))return fail('CALCULATION_ORIGIN_INVALID');
     if(x.key==='n'&&x.value!==effective(m.structureType,e))return fail('CALCULATION_VALUE_INVALID');}
   }
   if(!keys(m.result,['value','interval']))return fail('CALCULATION_RESULT_INVALID');
   const r=compute(m.formulaId,m.inputs,{geometry:g});if(!r.ok)return fail('CALCULATION_RESULT_INVALID');
   const okValue=m.result.value===null?r.result.value===null:typeof m.result.value==='number'&&same(m.result.value,r.result.value);
   const okInterval=m.result.interval===null?r.result.interval===null:Array.isArray(m.result.interval)&&r.result.interval&&m.result.interval.every((v,k)=>same(v,r.result.interval[k]));
   if(!okValue||!okInterval)return fail('CALCULATION_RESULT_INVALID');
   if(!keys(m.provenance,['kind','model','references','dependsOn'])||m.provenance.kind!=='CALCULATED'||!Array.isArray(m.provenance.references)||!Array.isArray(m.provenance.dependsOn))return fail('CALCULATION_PROVENANCE_INVALID');
   ids.add(m.id);
  }
  return {ok:true};
 }
 SILM.formulas=FORMULAS;
 SILM.calculation=Object.freeze({origins:ORIGINS,quantities:QUANTITY,inputs:IN,counting,limit:LIMIT,conversions:CONVERT,convert,applicable,effective,effectiveFormula,tabulated,compute,validate,format,percent,sig,context,current});
})();
