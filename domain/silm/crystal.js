'use strict';
window.SILM=window.SILM||{};
/* Modelo cristalográfico (0.5.x). Sem DOM. A geometria vem do banco científico:
   tipo de estrutura, grupo espacial, parâmetros de rede e sítios fracionários (expandidos pelas
   operações de simetria registradas) são conferidos contra o modelo canônico de CCC, CFC ou HC.
   Nenhum metal é mapeado artificialmente: estruturas fora desses três tipos ficam indisponíveis
   para a visualização cristalográfica, com motivo estruturado. */
SILM.crystal=(()=>{
 const TOL=2e-3,SQ3=Math.sqrt(3),deg=Math.PI/180;
 const MODELS=Object.freeze({
  BCC:Object.freeze({id:'BCC',code:'CCC',international:'BCC',name:'cúbica de corpo centrado',system:'cubic',spaceGroupNumber:229,coordination:8,
   basis:Object.freeze([[0,0,0],[.5,.5,.5]]),cellSites:9,effective:Object.freeze({value:2,explanation:'8 vértices × 1/8 + 1 centro do corpo = 2'})}),
  FCC:Object.freeze({id:'FCC',code:'CFC',international:'FCC',name:'cúbica de faces centradas',system:'cubic',spaceGroupNumber:225,coordination:12,
   basis:Object.freeze([[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0]]),cellSites:14,effective:Object.freeze({value:4,explanation:'8 vértices × 1/8 + 6 centros de face × 1/2 = 4'})}),
  // Origem no átomo da camada A (convenção de livros-texto): equivale aos sítios 2c (1/3, 2/3, 1/4) do banco por translação.
  HCP:Object.freeze({id:'HCP',code:'HC',international:'HCP',name:'hexagonal compacta',system:'hexagonal',spaceGroupNumber:194,coordination:12,
   basis:Object.freeze([[0,0,0],[1/3,2/3,.5]]),cellSites:17,idealRatio:Math.sqrt(8/3),effective:Object.freeze({value:6,explanation:'12 vértices × 1/6 + 2 centros de base × 1/2 + 3 internos = 6 (prisma hexagonal)'})})
 });
 const TYPE_BY_DB=Object.freeze({CCC:'BCC',CFC:'FCC',HC:'HCP'});
 const REASONS=Object.freeze({
  REFERENCE_STRUCTURE_MISSING:'Não há estrutura cristalina de referência registrada para este metal.',
  CRYSTAL_STRUCTURE_UNSUPPORTED:'Estrutura cristalina de referência registrada, mas ainda não disponível para visualização no SILM.',
  REFERENCE_CONDITION_UNSUPPORTED:'A condição de referência registrada não corresponde a uma fase sólida cristalina.',
  DATA_CONFLICT:'Os dados cristalográficos registrados não são consistentes com o modelo; a visualização foi bloqueada para revisão.'
 });
 /* ---------- sítios fracionários do banco ---------- */
 const number=text=>{const t=String(text).trim();if(/^[-+]?\d+\/\d+$/.test(t)){const [n,d]=t.split('/').map(Number);return n/d;}const v=Number(t);if(!Number.isFinite(v))throw new TypeError('Coordenada inválida: '+text);return v;};
 const wrap=v=>{const w=v-Math.floor(v);return Math.abs(w-1)<TOL||Math.abs(w)<TOL?0:w;};
 function parseComponent(expr){
  const c=[0,0,0,0],src=String(expr).replace(/\s/g,'');if(!src)throw new TypeError('Operação vazia');
  const terms=src.match(/[+-]?[^+-]+/g);if(!terms||terms.join('')!==src)throw new TypeError('Operação inválida: '+expr);
  for(const term of terms){const sign=term[0]==='-'?-1:1,body=term.replace(/^[+-]/,'');const axis='xyz'.indexOf(body);if(axis>=0)c[axis]+=sign;else c[3]+=sign*number(body);}
  return c;
 }
 const parseOperation=op=>{const parts=String(op).split(',');if(parts.length!==3)throw new TypeError('Operação de simetria inválida: '+op);return parts.map(parseComponent);};
 const apply=(m,p)=>m.map(c=>wrap(c[0]*p[0]+c[1]*p[1]+c[2]*p[2]+c[3]));
 const same=(a,b)=>a.every((v,i)=>{const d=Math.abs(v-b[i]);return d<TOL||Math.abs(d-1)<TOL;});
 function expandSites(fs){
  if(!fs||!Array.isArray(fs.values)||!fs.values.length)throw new TypeError('Sítios ausentes');
  const values=fs.values.map(v=>[number(v.x),number(v.y),number(v.z)]),out=[];
  const ops=fs.representation==='asymmetric-unit'?(fs.symmetryOperations||[]).map(parseOperation):[[[1,0,0,0],[0,1,0,0],[0,0,1,0]]];
  if(fs.representation==='asymmetric-unit'&&!ops.length)throw new TypeError('Operações de simetria ausentes');
  for(const p of values)for(const m of ops){const q=apply(m,p);if(!out.some(x=>same(x,q)))out.push(q);}
  return out;
 }
 /* O conjunto do banco coincide com a base do modelo a menos de uma translação (escolha de origem). */
 function matchesBasis(sites,basis){
  if(sites.length!==basis.length)return false;
  return sites.some(s=>{const t=basis[0].map((v,i)=>v-s[i]);return sites.every(p=>basis.some(b=>same(p.map((v,i)=>wrap(v+t[i])),b.map(wrap))));});
 }
 /* ---------- elegibilidade cristalográfica (distinta da elegibilidade de investigação) ---------- */
 const cache=new Map();
 function analyse(e){
  const fail=(reasonCode,extra={})=>({status:'unavailable',reasonCode,message:REASONS[reasonCode],...extra});
  const ref=e?.structures?.find(s=>s.id===e.referenceStructure)||null;
  if(!ref)return fail('REFERENCE_STRUCTURE_MISSING');
  const id=TYPE_BY_DB[ref.type];
  if(!id)return fail('CRYSTAL_STRUCTURE_UNSUPPORTED',{referenceStructureId:ref.id,registeredType:ref.type,registeredLabel:ref.label});
  if(ref.conditions?.phase?.value!=='solid')return fail('REFERENCE_CONDITION_UNSUPPORTED',{referenceStructureId:ref.id});
  const m=MODELS[id],lp=ref.latticeParameters,v=k=>lp?.[k]?.value;
  const conflicts=[];
  if(ref.spaceGroupNumber!==m.spaceGroupNumber)conflicts.push('grupo espacial');
  const close=(a,b,rel=1e-6)=>Math.abs(a-b)<=rel*Math.max(1,Math.abs(b));
  if(m.system==='cubic'&&!(close(v('a'),v('b'))&&close(v('a'),v('c'))&&[v('alpha'),v('beta'),v('gamma')].every(x=>close(x,90))))conflicts.push('parâmetros cúbicos');
  if(m.system==='hexagonal'&&!(close(v('a'),v('b'))&&close(v('alpha'),90)&&close(v('beta'),90)&&close(v('gamma'),120)&&v('c')/v('a')>1.4&&v('c')/v('a')<2))conflicts.push('parâmetros hexagonais');
  let sites=[];try{sites=expandSites(ref.fractionalSites);if(!matchesBasis(sites,m.basis))conflicts.push('sítios fracionários');}catch(error){conflicts.push('sítios fracionários');}
  if(conflicts.length)return fail('DATA_CONFLICT',{referenceStructureId:ref.id,conflicts});
  return {status:'available',reasonCode:null,structureType:id,referenceStructureId:ref.id,sourceId:ref.sourceId,coordination:m.coordination,databaseSites:sites,reference:ref};
 }
 function eligibility(e){if(!e)return {status:'unavailable',reasonCode:'REFERENCE_STRUCTURE_MISSING',message:REASONS.REFERENCE_STRUCTURE_MISSING};if(!cache.has(e.atomicNumber))cache.set(e.atomicNumber,analyse(e));return cache.get(e.atomicNumber);}
 /* ---------- geometria ---------- */
 const key=s=>s.cell.join(',')+'|'+s.basis;
 function vectors(m,ref){const a=ref.latticeParameters.a.value,c=ref.latticeParameters.c.value;return m.system==='cubic'?[[a,0,0],[0,a,0],[0,0,a]]:[[a,0,0],[-a/2,a*SQ3/2,0],[0,0,c]];}
 const cart=(L,f)=>[0,1,2].map(i=>f[0]*L[0][i]+f[1]*L[1][i]+f[2]*L[2][i]);
 const dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);
 const near=(v,t)=>Math.abs(v-t)<1e-6;
 function makeSite(m,L,cell,basis){const f=m.basis[basis].map((v,i)=>v+cell[i]);return {cell:[...cell],basis,frac:f,cart:cart(L,f),key:key({cell,basis})};}
 function enumerate(m,L,range){const out=[];for(let i=range[0][0];i<=range[0][1];i++)for(let j=range[1][0];j<=range[1][1];j++)for(let k=range[2][0];k<=range[2][1];k++)for(let b=0;b<m.basis.length;b++)out.push(makeSite(m,L,[i,j,k],b));return out;}
 /* Sítios desenhados da célula convencional: inclui os compartilhados nas fronteiras. */
 function inCell(m,L,s){
  if(m.system==='cubic')return s.frac.every(v=>v>-1e-9&&v<1+1e-9);
  if(s.frac[2]<-1e-9||s.frac[2]>1+1e-9)return false;
  const a=L[0][0],x=s.cart[0],y=s.cart[1];return Math.abs(y)<=a*SQ3/2+1e-9&&SQ3*Math.abs(x)+Math.abs(y)<=a*SQ3+1e-9;
 }
 function role(m,L,s,cellKeys){
  if(!cellKeys.has(s.key))return {role:'outside',label:'em célula vizinha',layer:m.system==='hexagonal'?(near(wrap(s.frac[2]),.5)?'B':'A'):null};
  if(m.system==='cubic'){const edges=s.frac.filter(v=>near(v,0)||near(v,1)).length;return edges===3?{role:'corner',label:'vértice da célula',layer:null}:edges===1?{role:'face',label:'centro de face',layer:null}:{role:'body',label:'centro do corpo',layer:null};}
  if(near(s.frac[2],.5))return {role:'interior',label:'camada B, interior da célula',layer:'B'};
  const r=Math.hypot(s.cart[0],s.cart[1]);return r<1e-6?{role:'base-center',label:'camada A, centro da base',layer:'A'}:{role:'base-vertex',label:'camada A, vértice da base',layer:'A'};
 }
 const geometryCache=new Map();
 function geometry(e){
  const el=eligibility(e);if(el.status!=='available')return null;
  if(geometryCache.has(e.atomicNumber))return geometryCache.get(e.atomicNumber);
  const m=MODELS[el.structureType],ref=el.reference,L=vectors(m,ref);
  const hexRange=[[-3,3],[-3,3],[-1,2]],cubicRange=[[-1,2],[-1,2],[-1,2]];
  const all=enumerate(m,L,m.system==='cubic'?cubicRange:hexRange);
  const cell=all.filter(s=>inCell(m,L,s)),cellKeys=new Set(cell.map(s=>s.key));
  if(cell.length!==m.cellSites)throw new Error('Célula com número de sítios inesperado: '+e.symbol);
  const center=m.system==='cubic'?cart(L,[.5,.5,.5]):[0,0,L[2][2]/2];
  const byDistance=(a,b)=>dist(a.cart,center)-dist(b.cart,center)||a.key.localeCompare(b.key);
  const ordered=[...cell].sort(byDistance),extra=all.filter(s=>!cellKeys.has(s.key)).sort(byDistance);
  const index=new Map(all.map(s=>[s.key,s]));
  const g={element:e,model:m,eligibility:el,reference:ref,vectors:L,center,cell:ordered,extra,index,cellKeys,
   ratio:m.system==='hexagonal'?L[2][2]/L[0][0]:1,
   site(siteRef){const k=key(siteRef);return index.get(k)||makeSite(m,L,siteRef.cell,siteRef.basis);},
   role(siteRef){return role(m,L,this.site(siteRef),cellKeys);},
   /* Vizinhos imediatos: os N sítios mais próximos (N = coordenação do modelo), a partir dos parâmetros tabelados. */
   neighbors(siteRef){
    const s=this.site(siteRef),around=enumerate(m,L,[[s.cell[0]-2,s.cell[0]+2],[s.cell[1]-2,s.cell[1]+2],[s.cell[2]-2,s.cell[2]+2]]).filter(x=>x.key!==s.key);
    around.sort((a,b)=>dist(a.cart,s.cart)-dist(b.cart,s.cart)||a.key.localeCompare(b.key));
    const n=m.coordination,list=around.slice(0,n);return {site:s,list,distances:list.map(x=>dist(x.cart,s.cart)),next:dist(around[n].cart,s.cart)};
   },
   /* Rede extensa decorativa: bloco maior que a célula, para comunicar continuidade. */
   lattice(){return m.system==='cubic'?enumerate(m,L,[[-1,2],[-1,2],[-1,2]]).filter(s=>s.frac.every(v=>v>-1-1e-9&&v<2+1e-9)):enumerate(m,L,[[-3,3],[-3,3],[-1,2]]).filter(s=>s.frac[2]>-1-1e-9&&s.frac[2]<2+1e-9&&Math.hypot(s.cart[0],s.cart[1])<=L[0][0]*2.05);},
   edges(){
    if(m.system==='cubic'){const c=[0,1].flatMap(x=>[0,1].flatMap(y=>[0,1].map(z=>[x,y,z])));const out=[];for(let i=0;i<8;i++)for(let j=i+1;j<8;j++)if(c[i].reduce((n,v,k)=>n+(v!==c[j][k]),0)===1)out.push([cart(L,c[i]),cart(L,c[j])]);return out;}
    const a=L[0][0],h=L[2][2],ring=[0,1,2,3,4,5].map(k=>[a*Math.cos(k*60*deg),a*Math.sin(k*60*deg)]),out=[];
    for(const z of [0,h])for(let k=0;k<6;k++)out.push([[...ring[k],z],[...ring[(k+1)%6],z]]);
    for(let k=0;k<6;k++)out.push([[...ring[k],0],[...ring[k],h]]);return out;
   }
  };
  geometryCache.set(e.atomicNumber,g);return g;
 }
 /* ---------- projeção pseudo-3D (ortográfica, com profundidade para oclusão) ---------- */
 function projector(m){
  // Ângulos escolhidos por busca numérica: maximizam a menor separação projetada entre os sítios da célula
  // (inclinação mínima de 16° para manter a leitura 3D). CCC −20°/16°, CFC −11°/17°, HC −10°/16°.
  const view={BCC:[-20,16],FCC:[-11,17],HCP:[-10,16]}[m.id],yaw=view[0]*deg,pitch=view[1]*deg,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  return p=>{const x1=p[0]*cy-p[1]*sy,y1=p[0]*sy+p[1]*cy,z=p[2];const y2=y1*cp-z*sp,z2=y1*sp+z*cp;return {x:x1,y:-z2,depth:y2};};
 }
 /* Ajusta pontos 3D à cena normalizada (0..1). fit = pontos que devem caber; os demais podem ficar fora (rede). */
 function layout(g,fit,{margin=.12}={}){
  const P=projector(g.model),c=P(g.center),pts=fit.map(p=>P(p));
  const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys);
  const scale=(1-2*margin)/Math.max(w,h,1e-9),cx=(Math.max(...xs)+Math.min(...xs))/2,cyy=(Math.max(...ys)+Math.min(...ys))/2;
  const depths=pts.map(p=>p.depth),dmin=Math.min(...depths),dmax=Math.max(...depths);
  return {scale,project(p){const q=P(p);return {x:.5+(q.x-cx)*scale,y:.5+(q.y-cyy)*scale,depth:dmax>dmin?(q.depth-dmin)/(dmax-dmin):.5};},centre:c};
 }
 /* 0.11.x — projeções da representação 2D. A isométrica é o projector acima, congelado: o Organizar e o calor
    usam sempre ela, para que trocar de vista nunca mude o estado científico nem a experiência. As outras são vistas
    quase ortogonais, ao longo de [010] (frontal), [100] (lateral) e [001] (superior), com a menor inclinação que
    mantém todos os centros da célula separados (≥ 0,34 da distância entre vizinhos; busca numérica sobre Fe, Cu e Mg).
    Projeção é representação: não cria estado científico novo. */
 const VIEWS=Object.freeze({
  front:Object.freeze({BCC:[10,14],FCC:[13,5],HCP:[8,8]}),
  side:Object.freeze({BCC:[80,14],FCC:[103,5],HCP:[109,6]}),
  top:Object.freeze({BCC:[0,72],FCC:[0,76],HCP:[0,77]})
 });
 const PROJECTIONS=Object.freeze(['isometric','front','top','side']);
 function projectorFor(m,projection='isometric'){
  const view=VIEWS[projection]?.[m.id];if(!view)return projector(m);
  const yaw=view[0]*deg,pitch=view[1]*deg,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  return p=>{const x1=p[0]*cy-p[1]*sy,y1=p[0]*sy+p[1]*cy,z=p[2];const y2=y1*cp-z*sp,z2=y1*sp+z*cp;return {x:x1,y:-z2,depth:y2};};
 }
 /* Mesmo ajuste de layout(), para qualquer projeção (a cena da 0.11.x: estável, sem depender da câmera). */
 function layoutFor(g,fit,{margin=.12,projection='isometric'}={}){
  if(!VIEWS[projection])return layout(g,fit,{margin});
  const P=projectorFor(g.model,projection),pts=fit.map(p=>P(p));
  const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys);
  const scale=(1-2*margin)/Math.max(w,h,1e-9),cx=(Math.max(...xs)+Math.min(...xs))/2,cyy=(Math.max(...ys)+Math.min(...ys))/2;
  const depths=pts.map(p=>p.depth),dmin=Math.min(...depths),dmax=Math.max(...depths);
  return {scale,project(p){const q=P(p);return {x:.5+(q.x-cx)*scale,y:.5+(q.y-cyy)*scale,depth:dmax>dmin?(q.depth-dmin)/(dmax-dmin):.5};},centre:P(g.center)};
 }
 /* Organização: reaproveita as unidades livres (pareamento guloso pela proximidade na cena) e completa a célula. */
 function organize(g,freeUnits){
  const need=Math.max(freeUnits.length,g.model.cellSites),targets=[...g.cell,...g.extra].slice(0,need);
  const L=layout(g,g.cell.map(s=>s.cart)),pos=targets.map(s=>L.project(s.cart));
  const pairs=[];freeUnits.forEach((u,i)=>pos.forEach((p,j)=>pairs.push([Math.hypot(u.position.x-p.x,u.position.y-p.y),i,j])));
  pairs.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);
  const unitTaken=new Set(),siteTaken=new Set(),assigned=new Array(freeUnits.length);
  for(const [,i,j]of pairs){if(unitTaken.has(i)||siteTaken.has(j))continue;unitTaken.add(i);siteTaken.add(j);assigned[i]=targets[j];}
  return {assigned,missing:targets.filter((_,j)=>!siteTaken.has(j))};
 }
 const label=id=>{const m=MODELS[id];return m?m.code+' ('+m.international+') · '+m.name:id;};
 return Object.freeze({models:MODELS,typeByDatabase:TYPE_BY_DB,reasons:REASONS,structureTypes:Object.freeze(Object.keys(MODELS)),
  eligibility,geometry,projector,layout,organize,expandSites,matchesBasis,parseOperation,key,label,projections:PROJECTIONS,views:VIEWS,projectorFor,layoutFor});
})();
