'use strict';
window.SILM=window.SILM||{};
/*
 * SILM Etapa 81 — reconciliação da matriz documental 92 metais, Etapa 72.
 * Fonte auditada: SILM_matriz_cientifica_92_metais_etapa72_reconciliada.json
 * (14-11-2026), preservada na biblioteca de pesquisa. Snapshot CURADO:
 * NUNCA importar triagens V08/V30 sem URL individual como dados aprovados.
 * Não é homologação quantitativa, nem altera elegibilidade estrutural.
 */
SILM.stage81Reconciliation=(()=>{
 const S=SILM;
 const universe='Ac Ag Al Am Au Ba Be Bi Ca Cd Ce Co Cr Cs Cu Dy Er Eu Fe Gd Hf Ho Ir K La Li Lu Mg Mn Mo Na Nb Nd Ni Np Os Pa Pb Pd Po Pr Pt Pu Ra Rb Re Rh Ru Sc Sm Sn Sr Ta Tb Tc Th Ti Tl Tm V W Y Yb Zn Zr Ga In Pm Hg Fr U Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv'.split(' ');
 const blocked=new Set('Hg Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv'.split(' '));
 const notIndexedStage80=new Set('Ac Np Pa Po Ra Ga Pm Hg Fr Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv'.split(' '));
 const noIndividualSources=new Set('Ac Np Pa Po Ra'.split(' '));
 const V={nist:'https://srd.nist.gov/JPCRD/jpcrdS1Vol3.pdf',
  nist1972:'https://srd.nist.gov/jpcrdreprint/1.3253100.pdf',
  ga:'https://www.espimetals.com/index.php/component/content/article/356-online-catalog/gallium-ga/365-gallium-ga?Itemid=135',
  pm:'https://www.osti.gov/servlets/purl/4136914',
  pmGupta:'https://vector.umd.edu/images/links/Extractive_Metallurgy_of_Rare_Earths_Gupta.pdf',
  indium:'https://www.indium.com/wp-content/uploads/2025/03/Physical-Constants-of-Pure-Indium-APPNOTE-97532-A4-R7-1.pdf',
  uranium:'https://www-pub.iaea.org/MTCD/Publications/PDF/IAEA-THPH_web.pdf'};
 const base=(id,symbol,atomicNumber,property,status,temperatureK,sourceURL,sourceName,sample,qualifier,values,options={})=>
  Object.freeze({id:'stage81-'+id,symbol,atomicNumber,property,status,sourceURL,sourceName,
   sample,qualifier,values:Object.freeze(values.map(v=>Object.freeze(v))),
   temperatureK,temperatureText:options.temperatureText||null,pressurePa:options.pressurePa??null,
   phase:options.phase||null,test:options.test||null,sourceStatus:options.sourceStatus||status,
   origin:'stage81-matrix92',evidenceIsModelEstimate:status==='candidate'&&!!options.modelEstimate,
   sourceVerifiedLevel:options.sourceVerifiedLevel||'conditional-reference-checked',
   calibrationApproved:false,engineRelease:false,referenceOnly:true});
 const v=(code,value,label,unit,meaning)=>({code,value,label,unit,meaning});
 const records=[
  base('ga-k-a273','Ga',31,'thermal','evaluated',273.2,V.nist,
   'Ho, Powell e Liley 1974 · Tabela 59, eixo a do Ga-α',
   'Ga sólido ortorrômbico, direção cristalográfica a; amostra anisotrópica de referência',
   '41 W/(m·K) a 273,2 K é condutividade AO LONGO DO EIXO a, não valor policristalino isotrópico. Curvas b e c são diferentes; não parametrizar calor universal.',
   [v('k-a-axis',41,'Condutividade térmica, direção a (eixo cristalino)','W/(m·K)','evaluated-directional-not-isotropic')],
   {phase:'Ga-α sólido ortorrômbico',test:'avaliação de estudos de monocristais; tabela 59',
    sourceVerifiedLevel:'table-text-checked-pdf-visual-unavailable-large'}),
  base('ga-rho-supplier20','Ga',31,'electrical','candidate',293.15,V.ga,
   'ESPI Metals · Gallium Material Overview', 'Ga comercial; orientação, lote, fase microscópica e método não individualizados',
   '17,4 µΩ·cm a 20°C é valor geral de fornecedor; não apresenta direção do cristal nem ensaio individual; Ga sólido é altamente anisotrópico. σ=1/ρ é cálculo derivado, não medição adicional.',
   [v('rho-general',17.4,'Resistividade elétrica de ficha do fornecedor','µΩ·cm','supplier-general-conditional'),
    v('sigma-derived',1/(17.4e-8),'Condutividade apenas derivada da resistividade de ficha','S/m','derived-not-another-measurement')],
   {phase:'não discriminada para a linha de resistividade',test:'ficha comercial, sem descrição da amostra',
    sourceVerifiedLevel:'supplier-webpage-reviewed'}),
  base('pm-k-bnwl27','Pm',61,'thermal','compiled',300.15,V.pm,
   'BNWL-1309 (Jarrett e Van Tuyl, 1970), p. 22, item i',
   'Promécio, amostra individual não detalhada na tabela compilada',
   'Valor compilado 0,18 ± 0,02 W/(cm·°C) convertido para 18 ± 2 W/(m·K) a 27°C. A página foi conferida em reprodução digital do relatório. Pressão não informada; não é motor calibrado.',
   [v('k-27c',18,'Condutividade térmica de referência','W/(m·K)','historical-reference-uncertainty-plusminus-2')],
   {phase:'metal elementar, fase da amostra não confirmada',test:'tabela compilada de propriedades térmicas',
    sourceVerifiedLevel:'original-report-table-verified-via-mirror'}),
  base('pm-rho-estimate','Pm',61,'electrical','candidate',null,V.pmGupta,
   'Gupta e Krishnamurthy · Extractive Metallurgy of Rare Earths',
   'Promécio; compilação sem amostra, pureza e temperatura individual',
   '75 µΩ·cm aparece entre parênteses na compilação: ESTIMATIVA, não medição direta. Não usar em Joule, em motor elétrico nem inferir condutividade experimental.',
   [v('rho-estimated',75,'Resistividade elétrica estimada','µΩ·cm','estimated-not-measured')],
   {temperatureText:'Temperatura numérica não especificada',sourceVerifiedLevel:'secondary-compilation-estimate'}),
  base('in-k-supplier0','In',49,'thermal','compiled',273.15,V.indium,
   'Indium Corporation · Physical Constants of Pure Indium, R7',
   'Índio puro da ficha do fornecedor; processamento individual não indicado',
   '83,7 W/(m·K) a 0°C como CONSTANTE DE REFERÊNCIA de fornecedor; não confundir com condutividade NIST a 295 K ou medida da mesma amostra elétrica.',
   [v('k-0c',83.7,'Condutividade térmica de ficha a 0°C','W/(m·K)','supplier-reference')],
   {sourceVerifiedLevel:'supplier-pdf-visually-checked'}),
  base('in-rho-supplier20','In',49,'electrical','compiled',293.15,V.indium,
   'Indium Corporation · Physical Constants of Pure Indium, R7',
   'Índio puro da ficha do fornecedor; orientação e lote individuais não indicados',
   '84 nΩ·m a 20°C; a condutividade exibida é calculada de σ=1/ρ e NÃO constitui ensaio independente. Temperatura diferente do valor NIST a 273,15 K.',
   [v('rho-20c',84,'Resistividade elétrica da ficha','nΩ·m','supplier-reference'),
    v('sigma-derived',1/(84e-9),'Condutividade elétrica derivada','S/m','derived-not-another-measurement')],
   {sourceVerifiedLevel:'supplier-pdf-visually-checked'}),
  base('u-k-iaea293','U',92,'thermal','evaluated',293,V.uranium,
   'IAEA-THPH 2008 · Tabela 2.7 e correlação (2.4), α-U',
   'Urânio metálico α (ortorrômbico), valores de referência por correlação',
   '22,5 W/(m·K) a 293 K deriva de correlação λ(T)=22+0,023(T−273) citada pela IAEA; incerteza de correlação ±10%. Não é medição direta desta amostra nem valor a 298 K.',
   [v('k-alpha293',22.5,'Condutividade térmica α-U correlacionada','W/(m·K)','evaluated-correlation-not-direct-measurement')],
   {phase:'α-U ortorrômbico',sourceVerifiedLevel:'IAEA-table2.7-pdf-visually-checked'}),
  base('u-rho-iaea298','U',92,'electrical','evaluated',298,V.uranium,
   'IAEA-THPH 2008 · Tabela 2.4',
   'Urânio metálico, condição de compilação a 0,1 MPa e 298 K',
   'Resistividade 21,8 × 10⁻⁸ Ω·m em referência IAEA; σ derivada por inversão da resistividade, não ensaio independente. Não equiparar automaticamente à amostra térmica de 293 K.',
   [v('rho-total-298',21.8e-8,'Resistividade elétrica compilada','Ω·m','compiled-reference'),
    v('sigma-derived',1/(21.8e-8),'Condutividade apenas calculada','S/m','derived-not-another-measurement')],
   {pressurePa:100000,phase:'urânio metálico de referência (fase não individualizada na tabela 2.4)',
    sourceVerifiedLevel:'IAEA-table2.4-pdf-visually-checked'}),

  // Seis casos antes sem fontes individuais na matriz Etapa72: ESTIMATIVAS
  // rastreadas na edição abreviada de 1972, não medições novas.
  ...[
   ['Ac',89,12,300,'p. 418: actínio; extrapolação de material hipotético, ±50%'],
   ['Np',93,6.3,300,'p. 369: neptúnio policristalino; referência provisória marcada como estimada, ±20%'],
   ['Pa',91,47,300,'p. 418: protactínio; estimativa extremamente incerta, ±50%'],
   ['Po',84,20,300,'p. 418: polônio; estimativa extremamente incerta, ±50%'],
   ['Ra',88,18.6,293.2,'p. 384: rádio sólido; valor provisório, incerteza até ±50%'],
   ['Rf',104,23,300,'p. 418: antigo elemento 104 (Rf); previsão histórica anterior à caracterização do metal, ±50%']
  ].map(([symbol,z,k,T,condition])=>base('historical-thermal-'+symbol.toLowerCase(),symbol,z,
   'thermal','candidate',T,V.nist1972,
   'Ho, Powell e Liley 1972 · estimativa de condutividade térmica',
   'Sem amostra/macroscopia individual experimentalmente estabelecida',
   'Valor de '+condition+'. NBS registra ESTIMATIVA/PROVISÓRIO, NÃO é medição direta. 1972 é uma referência histórica, não previsão moderna DFT. Não calibrar motores.',
   [v('k-nbs-historical-estimate',k,'Condutividade térmica estimada/provisória','W/(m·K)','historical-estimate-not-measured')],
   {modelEstimate:true,sourceVerifiedLevel:'original-1972-pdf-page-visually-verified'})),
  base('fr-k-analog','Fr',87,'thermal','candidate',300,V.nist1972,
   'Ho, Powell e Liley 1972 · tabela p. 418, extrapolação por grupo IA',
   'SEM amostra: metal francium não medido na fonte', 
   '15 W/(m·K) (0,15 W/(cm·K)) é ESTIMATIVA de 1972, provavelmente ±50%, NÃO medição nem previsão ab initio. A matriz Etapa72 trazia 14,5 W/(m·K), valor divergente; prevalece o valor visualmente conferido da tabela original.',
   [v('k-analog',15,'Condutividade térmica estimada por extrapolação','W/(m·K)','empirical-group-prediction')],
   {modelEstimate:true,sourceVerifiedLevel:'legacy-matrix-stated-empirical-extrapolation'}),
  ...['Cm','Bk','Cf','Es','Fm','Md','No','Lr'].map((symbol,i)=>
   base('actinide-k-analogy-'+symbol.toLowerCase(),symbol,[96,97,98,99,100,101,102,103][i],
    'thermal','candidate',300,V.nist1972,
    'Ho, Powell e Liley 1972 · p. 418, estimativa de série',
    'SEM amostra experimental individual identificada',
    '10 W/(m·K) (0,1 W/(cm·K)) é ESTIMATIVA HISTÓRICA altamente incerta (±50%) da tabela de 1972, repetida para vários actinídeos; não foi medida separadamente para '+symbol+'. Não usar como calibração nem como parâmetro próprio do metal.',
    [v('k-group-analogy',10,'Estimativa térmica por analogia de família','W/(m·K)','empirical-group-prediction')],
    {modelEstimate:true,sourceVerifiedLevel:'legacy-matrix-stated-family-analogy'}))
 ].map(Object.freeze);
 const bySymbol=Object.freeze(Object.fromEntries(universe.map(symbol=>[
  symbol,Object.freeze(records.filter(x=>x.symbol===symbol))
 ])));
 const stage72Audit=Object.freeze(universe.map(symbol=>Object.freeze({
  symbol,stage72Eligibility:blocked.has(symbol)?'blocked':'available',
  indexedAtStage80:!notIndexedStage80.has(symbol),
  legacyValuesWithoutIndividualSource:noIndividualSources.has(symbol),
  hasStage81QualifiedOrEstimatedReference:bySymbol[symbol].length>0,
  blockedFromStructuralUse:blocked.has(symbol),
  numericalEngineCalibrationAllowed:false,
  stage81Status:blocked.has(symbol)?'blocked-structural':
   !notIndexedStage80.has(symbol)?'already-indexed-stage80':
   bySymbol[symbol].some(x=>x.status!=='candidate')?'new-sourced-reference':
   bySymbol[symbol].length?'estimates-only':
   noIndividualSources.has(symbol)?'untraced-legacy-values-only':'no-admissible-quantitative-data'
 })));
 const byZ=new Map(records.map(x=>[x.atomicNumber,x.symbol]));
 return Object.freeze({
  schema:'silm.research.metals92.stage81.reconciliation.v1',researchStage:81,
  stage72MatrixDate:'2026-11-14',sourceMatrix:'SILM_matriz_cientifica_92_metais_etapa72_reconciliada.json',
  universe:Object.freeze(universe),blocked:Object.freeze([...blocked]),notIndexedStage80:Object.freeze([...notIndexedStage80]),
  audit:stage72Audit,records:Object.freeze(records),bySymbol,getFor:(z,property)=>{
   const symbol=S.data?.get?.(Number(z))?.symbol||byZ.get(Number(z));
   return symbol?bySymbol[symbol].filter(x=>x.property===property):[];
  },getAudit:z=>{
   const symbol=typeof z==='string'?z:S.data?.get?.(Number(z))?.symbol;
   return stage72Audit.find(x=>x.symbol===symbol)||null;
  },newlyDocumentedAtStage81:Object.freeze(records.filter(x=>notIndexedStage80.has(x.symbol)).map(x=>x.symbol)),
  engineRelease:false,calibrationApproved:false
 });
})();
