'use strict';
window.SILM=window.SILM||{};
/* Propriedades metálicas (0.7.x): catálogo, elegibilidade por propriedade, dados tabelados com proveniência e
   transformações didáticas. Princípio: estrutura → comportamento → propriedade observada.
   - Nenhuma propriedade é atribuída "a todo metal": a elegibilidade é calculada do banco para cada elemento.
   - Mecânica qualitativa ≠ valor tabelado: valores numéricos só com valor, unidade, condição e fonte do banco;
     lacunas ficam indisponíveis (PROPERTY_DATA_MISSING), nunca preenchidas com "valor típico".
   - As experiências não alteram a estrutura científica: deformação, aquecimento, campo e luz são estados da
     experiência aplicados à representação. Restaurar volta ao estado-base sem tocar investigação ou metal. */
(()=>{
 const IDS=Object.freeze(['electrical','thermal','malleability','ductility','luster']);
 const defaults=Object.freeze({electrical:Object.freeze({field:false}),thermal:Object.freeze({heating:false,stage:0}),malleability:Object.freeze({compression:0}),ductility:Object.freeze({elongation:0}),luster:Object.freeze({light:false})});
 const limits=Object.freeze({heatStages:4,compression:3,elongation:3});
 const catalog=Object.freeze({
  electrical:{id:'electrical',title:'Condutividade elétrica',requires:'electrons',limitation:'O movimento visual dos elétrons sob campo é uma representação qualitativa e não corresponde diretamente à velocidade real dos portadores de carga.'},
  thermal:{id:'thermal',title:'Condutividade térmica',requires:'crystalline',limitation:'A transferência térmica apresentada é qualitativa e não constitui solução quantitativa da equação de transporte de calor.'},
  malleability:{id:'malleability',title:'Maleabilidade',requires:'crystalline',limitation:'A deformação é uma representação didática e não reproduz uma curva tensão-deformação real do material.'},
  ductility:{id:'ductility',title:'Ductilidade',requires:'crystalline',limitation:'A deformação é uma representação didática e não reproduz uma curva tensão-deformação real do material.'},
  luster:{id:'luster',title:'Brilho metálico',requires:'crystalline',limitation:'A reflexão de luz é uma representação qualitativa do comportamento óptico metálico e não um cálculo espectroscópico completo.'}
 });
 const reasons=Object.freeze({
  PROPERTY_DATA_MISSING:'Dado tabelado não homologado no banco do SILM para este metal.',
  MODEL_NOT_APPLICABLE:'A experiência exige a estrutura cristalina organizada, e a estrutura de referência deste metal não tem visualização no SILM.',
  REFERENCE_PHASE_UNSUPPORTED:'Não há fase sólida de referência homologada para a condição adotada.',
  INSUFFICIENT_VALIDATION:'O comportamento mecânico real deste metal não está homologado no banco: a experiência mostra o mecanismo didático, não a resposta específica do metal.',
  LIQUID_AT_REFERENCE_CONDITION:'Líquido na condição de referência registrada: deformação de rede sólida, condução pela rede e superfície sólida não se aplicam.',
  METAL_NOT_INVESTIGABLE:'Metal não habilitado para investigação no SILM.'
 });
 /* Fase na condição de referência: da estrutura de referência (sólida) ou do dado de fase registrado no banco. */
 function phase(e){
  const ref=e.structures?.find(s=>s.id===e.referenceStructure);if(ref)return {value:ref.conditions.phase.value,display:ref.conditions.phase.display,sourceId:ref.conditions.phase.sourceId};
  // Dado de fase sem estrutura de referência (ex.: líquido na condição adotada), quando homologado no banco.
  const p=e.phaseAtReference;return p?{value:p.value,display:p.display,conditions:p.conditions,sourceId:p.sourceId}:{value:'unknown',display:'Sem fase sólida de referência registrada',sourceId:null};
 }
 /* Dado numérico só com valor finito, unidade, condição e fonte registrados. */
 const datum=x=>!!x&&Number.isFinite(x.value)&&typeof x.unit==='string'&&!!x.unit&&typeof x.sourceId==='string'&&!!x.conditions;
 function data(e,id){
  const p=e.properties||{};
  if(id==='electrical'){
   if(datum(p.electricalConductivity))return {kind:'TABULATED',label:'Condutividade elétrica',...p.electricalConductivity};
   // Fonte com resistividade: σ = 1/ρ é calculado pelo SILM e classificado como tal (§39).
   if(datum(p.electricalResistivity)){const r=p.electricalResistivity;return {kind:'CALCULATED',label:'Condutividade elétrica (σ = 1/ρ)',from:{kind:'TABULATED',label:'Resistividade elétrica',...r},value:1/r.value,unit:'1/('+r.unit+')',conditions:r.conditions,sourceId:r.sourceId};}
   return null;
  }
  if(id==='thermal')return datum(p.thermalConductivity)?{kind:'TABULATED',label:'Condutividade térmica',...p.thermalConductivity}:null;
  return null;
 }
 /* Elegibilidade por propriedade: 'available' (experiência + dado tabelado), 'qualitative' (só experiência
    qualitativa), 'unavailable' (com motivo). Calculada do banco a cada uso; nunca gravada no estado. */
 function eligibility(e){
  const out={},ph=e?phase(e):null,investigable=e?.silmEligibility?.status==='available',crystal=e?SILM.crystal.eligibility(e):null;
  for(const id of IDS){
   const c=catalog[id],d=e?data(e,id):null,needsNumber=['electrical','thermal'].includes(id);
   let status='qualitative',reasonCode=null;
   const solidOnly=id!=='electrical';
   if(!e||e.classification?.metallic===false){status='unavailable';reasonCode=e?'MODEL_NOT_APPLICABLE':'METAL_NOT_INVESTIGABLE';}
   // Fase: a limitação pertence à propriedade + fase + condição, não à classificação do metal.
   else if(solidOnly&&ph.value==='liquid'){status='unavailable';reasonCode='LIQUID_AT_REFERENCE_CONDITION';}
   else if(solidOnly&&ph.value!=='solid'){status='unavailable';reasonCode='REFERENCE_PHASE_UNSUPPORTED';}
   else if(!investigable){status='unavailable';reasonCode='METAL_NOT_INVESTIGABLE';}
   else if(c.requires==='crystalline'&&crystal.status!=='available'){status='unavailable';reasonCode='MODEL_NOT_APPLICABLE';}
   else if(d)status='available';
   const note=status!=='unavailable'&&['malleability','ductility'].includes(id)?reasons.INSUFFICIENT_VALIDATION:null;
   out[id]={id,title:c.title,status,reasonCode,message:reasonCode?reasons[reasonCode]:null,requires:c.requires,data:d,dataReason:needsNumber&&!d?'PROPERTY_DATA_MISSING':null,note};
  }
  return out;
 }
 /* ---------- transformações didáticas (coordenadas cartesianas da célula, em Å) ---------- */
 /* Maleabilidade: compressão vertical; camadas deslizam umas sobre as outras e a forma se espalha (lâmina). */
 function compress(p,c,level){const t=level/limits.compression;return [c[0]+(p[0]-c[0])*(1+.18*t)+.3*t*(p[2]-c[2]),c[1]+(p[1]-c[1])*(1+.18*t),c[2]+(p[2]-c[2])*(1-.28*t)];}
 /* Ductilidade: tração ao longo do eixo vertical; a estrutura se alonga e se estreita (fio), com reorganização
    coletiva por deslizamento. Forma oposta à da lâmina: alta e fina, não larga e baixa. */
 function elongate(p,c,level){const t=level/limits.elongation;return [c[0]+(p[0]-c[0])*(1-.24*t)+.12*t*(p[2]-c[2]),c[1]+(p[1]-c[1])*(1-.24*t),c[2]+(p[2]-c[2])*(1+.5*t)];}
 function deformer(state,geometry){
  const pr=state?.properties,c=geometry.center;if(!pr?.active)return null;
  if(pr.active==='malleability'&&pr.malleability.compression)return p=>compress(p,c,pr.malleability.compression);
  if(pr.active==='ductility'&&pr.ductility.elongation)return p=>elongate(p,c,pr.ductility.elongation);
  return null;
 }
 /* Fontes: as unidades da faixa esquerda (18 % da largura) na projeção de referência; a vista as marca onde estiverem. */
 function heatSources(points){const xs=points.map(p=>p.x),min=Math.min(...xs),max=Math.max(...xs),span=Math.max(1e-9,max-min);return points.map(p=>(p.x-min)/span<=.18);}
 /* Condução térmica: propagação qualitativa por vizinhança, a partir da região aquecida (lado esquerdo).
    Etapas discretas e determinísticas; valores limitados a 1 (sem fusão nem mudança de fase). */
 function heat(points,spacing,stage){
  const n=points.length;if(!n)return [];
  const source=heatSources(points),links=points.map((p,i)=>points.map((q,j)=>j!==i&&Math.hypot(p.x-q.x,p.y-q.y)<=spacing*1.25?j:-1).filter(j=>j>=0));
  let e=points.map((_,i)=>source[i]?1:0);
  for(let s=0;s<stage*2;s++){const next=e.map((v,i)=>source[i]?1:Math.min(1,v+.14*links[i].reduce((a,j)=>a+(e[j]-v),0)));e=next;}
  return e.map(v=>Math.round(Math.max(0,Math.min(1,v))*4));   // níveis 0–4 (padrão de anéis + texto, não só cor)
 }
 const heatWord=l=>['ambiente','baixa','moderada','alta','muito alta'][l];
 /* Textos curtos: o que você alterou, o que aconteceu, como interpretar (§78). */
 function narrative(id,params,{reduced=false,electronsVisible=true}={}){
  const off={action:'Nenhuma ação aplicada.',observation:'Estado-base da estrutura.',interpretation:''};
  if(id==='electrical'){if(!params.field)return {action:'Campo elétrico desligado.',observation:'Sem estímulo externo, o movimento eletrônico não tem direção macroscópica preferencial.',interpretation:'Os elétrons de valência deslocalizados se movem em todas as direções; não há corrente orientada.'};
   return {action:'Campo elétrico aplicado (sentido indicado pela seta E).',observation:electronsVisible?(reduced?'Representação estática: a seta inferior indica o deslocamento médio dos elétrons, no sentido oposto ao do campo.':'A distribuição eletrônica passa a apresentar componente direcional: deslocamento coletivo médio no sentido oposto ao do campo.'):'Mostre os elétrons para observar a resposta coletiva.',interpretation:'Os elétrons de valência deslocalizados podem responder coletivamente a um campo elétrico; esse deslocamento orientado é a base qualitativa da condução elétrica.'};}
  if(id==='thermal'){if(!params.heating&&!params.stage)return {action:'Nenhuma região aquecida.',observation:'Estrutura em temperatura ambiente na representação.',interpretation:''};
   return {action:'Região à esquerda aquecida'+(params.heating?'':' (fonte desligada)')+'.',observation:'Etapa '+params.stage+' de '+limits.heatStages+': a energia térmica se espalha da região aquecida para o restante da estrutura (anéis indicam o nível)'+(params.stage>=limits.heatStages?'; sem fusão nem mudança de fase nesta representação.':'.'),interpretation:'No metal, a energia térmica é transferida pela vibração da rede e pelos elétrons deslocalizados; a representação é qualitativa e não inclui fusão.'};}
  if(id==='malleability'){if(!params.compression)return off;
   return {action:'Compressão aplicada (etapa '+params.compression+' de '+limits.compression+').',observation:'As camadas da estrutura deslizam umas sobre as outras e a forma se achata, como uma lâmina; os elétrons continuam distribuídos pelo conjunto.',interpretation:'A ligação metálica não depende de pares direcionais rígidos entre átomos específicos: as camadas podem se deslocar sem romper a coesão coletiva. A deformação possível varia entre metais.'};}
  if(id==='ductility'){if(!params.elongation)return off;
   return {action:'Alongamento aplicado (etapa '+params.elongation+' de '+limits.elongation+').',observation:'Sob tração, a estrutura se alonga e se estreita, como um fio, por reorganização coletiva das camadas.',interpretation:'O deslizamento de camadas mantido pela distribuição eletrônica coletiva permite alongar sem fratura imediata. A ductilidade real varia entre metais e condições.'};}
  if(id==='luster'){if(!params.light)return {action:'Luz desligada.',observation:'Sem luz incidente.',interpretation:''};
   return {action:'Luz incidente sobre a superfície.',observation:'A superfície reflete a maior parte da luz visível incidente: brilho metálico.',interpretation:'Os elétrons deslocalizados próximos da superfície respondem à luz incidente e a reemitem, o que produz alta reflexão. A cor própria de cada metal não é representada.'};}
  return off;
 }
 SILM.properties=Object.freeze({ids:IDS,defaults,limits,catalog,reasons,phase,data,eligibility,deformer,compress,elongate,heat,heatSources,heatWord,narrative,
  fresh:()=>({modelVersion:1,active:null,startedAt:null,...JSON.parse(JSON.stringify(defaults))})});
})();
