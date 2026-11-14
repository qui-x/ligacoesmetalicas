'use strict';
window.SILM=window.SILM||{};
/* Etapa 78 — sete metais selecionados; fonte e condição do ensaio no lugar
 * de exigir coincidência com CNTP. As categorias são independentes:
 * a mesma ficha NÃO indica a mesma amostra/temperatura para todas elas.
 * Condição experimental desconhecida é null, NUNCA 273.15 ou 'ambiente=298'.
 * Valores de triagem sem origem individual seguem disponíveis com aviso,
 * mas não são homologados para o motor.
 */
SILM.sevenConditionResearch=(()=>{
 const KEYS=Object.freeze(['electrical','thermal','malleability','ductility','luster']);
 const NBS='https://nvlpubs.nist.gov/nistpubs/Legacy/TN/nbstechnicalnote1053.pdf';
 const GUPTA='https://vector.umd.edu/images/links/Extractive_Metallurgy_of_Rare_Earths_Gupta.pdf';
 const SIMMONS='https://digital.library.unt.edu/ark:/67531/metadc1248886/m2/1/high_res_d/metadc1248886.pdf';
 const NASA='https://ntrs.nasa.gov/api/citations/19680026529/downloads/19680026529.pdf';
 // Values below are from the stage72 reconciled matrix or the referenced
 // original reports. Read as conditional observations, NEVER universal metal constants.
 const observations=[
 ['Co','electrical',5.24,'µΩ·cm','Resistividade elétrica total',273.15,'ponto de gelo','compilation-evaluated',NBS,'Tabela 1.1, Co; referência compilada de metal puro'],
 ['Co','thermal',100,'W/(m·K)','Condutividade térmica',null,'temperatura não rastreada','screening-untraced',null,'Triagem legada v08; não liberar para cálculo'],
 ['Co','malleability',25,'%','Deformação máxima observada em compressão',null,'temperatura ambiente, K não declarado','primary-transcription','https://doi.org/10.3390/ma13245775','Co policristalino 99,9%, condição trefilada AD; εmáx 0,25, σ0,2=486 MPa; corpo 9×6,35 mm'],
 ['Co','ductility',35,'%','Limite inferior estrito do alongamento em tração',null,'temperatura do ensaio não rastreada','primary-bound','https://doi.org/10.1016/j.actamat.2026.122245','Co de grão ultrafino CFC estabilizado; alongamento >35%, não igual a 35%'],
 ['Co','luster',0.657102393567,'fração','Refletância especular ideal R(550 nm)',null,'temperatura não rastreada','optical-derived','https://github.com/polyanskiy/refractiveindex.info-database/blob/main/database/data/main/Co/nk/Johnson.yml','n,k interpolados; interface ideal, não brilho da peça'],
 ['Er','electrical',86,'µΩ·cm','Resistividade elétrica',null,'não informada na compilação','compiled-conditional',GUPTA,'Er elementar em compilação de terras-raras; preparo/pressão desconhecidos'],
 ['Er','thermal',14.5,'W/(m·K)','Condutividade térmica',null,'não informada na compilação','compiled-conditional',GUPTA,'Er elementar em compilação; sem temperatura individual'],
 ['Er','malleability',60,'%','Redução aplicada em laminação a frio',null,'ensaio de processamento; T numérica não fixada','processing-only','https://pmc.ncbi.nlm.nih.gov/articles/PMC8880798/','Laminação 60% com caracterização EBSD; não é limite intrínseco de maleabilidade'],
 ['Er','ductility',4,'%','Alongamento à ruptura de ficha histórica',null,'temperatura do ensaio não especificada','historical-compilation',SIMMONS,'Metal fundido; tabela histórica de Simmons 1959, lote não reconstruído'],
 ['Er','luster',0.489725424635,'fração','Refletância ideal R(550 nm)',4.2,'4,2 K; condição criogênica','optical-derived','https://jhweaver.matse.illinois.edu/optical-prop/Er.pdf','Amostra criogênica; não aplicar automaticamente à temperatura ambiente'],
 ['Hf','electrical',3.31e-7,'Ω·m','Resistividade elétrica',293,'293 K (triagem sem origem individual)','screening-untraced',null,'Triagem v08; amostra e fonte individual não rastreadas'],
 ['Hf','thermal',23,'W/(m·K)','Condutividade térmica',null,'temperatura não rastreada','screening-untraced',null,'Triagem v08; necessita fonte individual'],
 ['Hf','malleability',90,'%','Redução aplicada em laminação',null,'temperatura do processo não representa T do ensaio','processing-only','https://doi.org/10.1016/j.ijrmhm.2026.107893','Folha Hf puro 0,06 mm, 90% laminado e posteriormente recozido; não é falha em compressão'],
 ['Hf','ductility',35,'%','Alongamento aproximado em tração',null,'temperatura do ensaio não rastreada','primary-approximate','https://doi.org/10.1016/j.ijrmhm.2026.107893','Estimativa aproximada do artigo; recozimento >700 °C NÃO é temperatura de tração'],
 ['Hf','luster',0.531255,'fração','Refletância R(550 nm) interpolada',null,'temperatura não rastreada','optical-derived','https://jhweaver.matse.illinois.edu/optical-prop/Hf.pdf','Estimativa/compilação óptica, condições específicas incompletas'],
 ['Ta','electrical',1.31e-7,'Ω·m','Resistividade elétrica',293,'293 K (triagem sem origem individual)','screening-untraced',null,'Triagem v08; requer fonte individual e amostra'],
 ['Ta','thermal',57.5,'W/(m·K)','Condutividade térmica',null,'temperatura não rastreada','screening-untraced',null,'Triagem v08, não calibrar motor'],
 ['Ta','malleability',40,'%','Deformação imposta em compressão',null,'temperatura do ensaio não rastreada','primary-applied','https://doi.org/10.1007/s11661-024-07459-9','Ta puro em compressão; 40% não é deformação até falha'],
 ['Ta','ductility',16,'%','Alongamento registrado em tração',null,'temperatura do ensaio não declarada','primary-conditional','https://doi.org/10.3390/ma16083161','Ta fabricado por SLM 190 J/mm³, sem recozimento; artigo também menciona 18% em outro trecho; manter divergência'],
 ['Ta','luster',0.841786584124,'fração','Refletância ideal R(550 nm)',null,'temperatura não rastreada','optical-derived','https://github.com/polyanskiy/refractiveindex.info-database/blob/main/database/data/main/Ta/nk/Werner.yml','Derivada de n,k no espectro óptico; não é brilho observado da peça'],
 ['Tc','electrical',2e-7,'Ω·m','Resistividade elétrica',293,'293 K (triagem sem origem individual)','screening-untraced',null,'Triagem v08, sem fonte por metal'],
 ['Tc','thermal',50.6,'W/(m·K)','Condutividade térmica',null,'temperatura não rastreada','screening-untraced',null,'Triagem v08, não calibrar calor'],
 ['Tc','malleability',45.6,'%','Redução por laminação a frio na amostra',null,'processamento a frio, temperatura exata não declarada','processing-only',NASA,'Tecnécio trabalhado a frio, redução de 45,6%; não é limite de falha'],
 ['Tc','ductility',30,'%','Alongamento à ruptura em tração',null,'temperatura ambiente, K não declarado','primary-report',NASA,'BNWL-865; Tc recozido, Rm≈798 MPa, Rp0,2≈319 MPa; corpo específico; ruptura fora do comprimento útil'],
 ['Tc','luster',0.63412343434,'fração','Refletância ideal R(550 nm)',null,'temperatura não rastreada','optical-derived','https://jetp.ras.ru/cgi-bin/dn/e_067_09_1842.pdf','Fresnel de n=3,36 e k=4,21; não representa acabamento real'],
 ['Th','electrical',1.57e-7,'Ω·m','Resistividade elétrica',273,'273 K em triagem (não 273,15)','screening-untraced',null,'Triagem legada sem origem individual'],
 ['Th','thermal',54,'W/(m·K)','Condutividade térmica',null,'temperatura não rastreada','screening-untraced',null,'Triagem legada sem origem individual'],
 ['Th','malleability',50,'%','Redução de folha por laminação',null,'temperatura do processo não informada','secondary-pending','https://banksolar.ru/?p=25985','Tabela de livro reproduzida por terceiros; original não reaberto, NÃO homologar'],
 ['Th','ductility',36,'%','Alongamento à ruptura (transcrição)',null,'temperatura ambiente, K não declarado','secondary-pending','https://banksolar.ru/?p=25985','Tório rota iodide, wrought/annealed; original da Tabela 7.3 não conferido'],
 ['Th','luster',0.667879871329,'fração','Refletância ideal R(550 nm)',null,'temperatura não rastreada','optical-derived','https://jhweaver.matse.illinois.edu/optical-prop/Th.pdf','Resposta óptica ideal; superfície/fase e preparo específicos a conferir'],
 ['Zr','electrical',4.21e-7,'Ω·m','Resistividade elétrica',293,'293 K em triagem sem fonte individual','screening-untraced',null,'Triagem legada v08; não substituir resistividade total rastreada'],
 ['Zr','thermal',22.6,'W/(m·K)','Condutividade térmica',null,'temperatura não rastreada','screening-untraced',null,'Triagem v08 sem fonte individual'],
 ['Zr','malleability',30,'%','Redução por laminação do material',null,'temperatura de laminação ambiente; número K ausente','processing-only','https://doi.org/10.1002/adem.202001039','Zr702 comercialmente puro, não isento de Hf; processo da amostra, não limite universal'],
 ['Zr','ductility',22.2,'%','Alongamento à ruptura em tração',null,'temperatura ambiente, K não declarado','primary-conditional','https://doi.org/10.1002/adem.202001039','Zr702 como recebido, tração na direção RD, ~0,01 s⁻¹; não representa Zr ultra-puro'],
 ['Zr','luster',0.307085150797,'fração','Refletância ideal R(550 nm)',null,'temperatura não rastreada','optical-derived','https://github.com/polyanskiy/refractiveindex.info-database/blob/main/database/data/main/Zr/nk/Palm.yml','Filme tratado; n,k e Fresnel não medem brilho em superfície maciça']
 ];
 const ATOMIC=Object.freeze({Co:27,Er:68,Hf:72,Ta:73,Tc:43,Th:90,Zr:40});
 const strict=new Set(['primary-report','primary-conditional','primary-transcription']);
 const records=Object.freeze(observations.map(([symbol,property,value,unit,quantity,temperatureK,temperatureText,grade,sourceURL,sample],i)=>{
  if(!KEYS.includes(property)||!Number.isFinite(value)||!(symbol in ATOMIC)||temperatureK!==null&&!Number.isFinite(temperatureK))throw Error('Etapa78: registro inválido '+i);
  return Object.freeze({id:'stage78-'+symbol.toLowerCase()+'-'+property,atomicNumber:ATOMIC[symbol],symbol,property,value,unit,quantity,temperatureK,pressurePa:null,temperatureText,grade,sourceURL,sample,sourceTracked:!!sourceURL,
   observationIsMeasured:strict.has(grade),canDisplayReference:true,engineRelease:false,calibrationApproved:false,
   evidencePolicy:grade==='screening-untraced'?'triagem-sem-homologação':grade==='secondary-pending'?'transcrição-pendente':
    grade==='processing-only'?'processamento-não-maleabilidade':'referência-condicionada'});
 }));
 const BY=Object.freeze(Object.fromEntries(Object.keys(ATOMIC).map(symbol=>[symbol,Object.freeze(Object.fromEntries(KEYS.map(property=>[property,records.find(r=>r.symbol===symbol&&r.property===property)])))])));
 const labels=Object.freeze({electrical:'Condutividade elétrica · dado de resistividade',thermal:'Condutividade térmica',malleability:'Maleabilidade · evidência de processamento/compressão',ductility:'Ductilidade · evidência de tração',luster:'Brilho metálico · refletância espectral'});
 const get=(atomicNumber,property)=>{
  const symbol=Object.keys(ATOMIC).find(k=>ATOMIC[k]===Number(atomicNumber));
  return symbol?BY[symbol][property]||null:null;
 };
 return Object.freeze({stage:78,keys:KEYS,atomicNumbers:ATOMIC,labels,records,bySymbol:BY,get,
  candidates:records.length,fullyCalibrated:0,referenceConditionsRequired:false});
})();
