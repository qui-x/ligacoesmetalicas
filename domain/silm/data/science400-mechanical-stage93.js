'use strict';
window.SILM=window.SILM||{};
/*
 * SILM — Etapa 93, 80 × 5. Apenas evidências condicionais, sem parâmetros de motor.
 * CNTP não é filtro; temperatura de SOLIDIFICACAO do Ga não é temperatura do teste.
 * ε aplicado em compressão não é limite de ruptura.
 */
SILM.scientificMechanicalStage93=(()=>{
 const rows=[],add=({symbol,z,property,origin,value,unit,metric,meaning,sourceURL,sourceName,
  sample,temperatureK=null,temperatureText='',phase='solid',test='',qualifier='',details=[],
  additionalValues=[]})=>{
  const data=Object.freeze([{code:metric,value,label:metric==='elong'?
   'Alongamento em tração relatado':metric==='historical-compression'?
   'Plasticidade em compressão (Tabela XIII)':'Deformação aplicada em compressão',
   unit,meaning},...additionalValues].map(Object.freeze));
  rows.push(Object.freeze({id:'stage93-'+origin,atomicNumber:z,symbol,property,
   origin:'stage93-conditional-study',status:'experimental-conditional',
   values:data,sourceURL,sourceName,sample,temperatureK,temperatureText,phase,test,
   qualifier,referenceOnly:true,engineRelease:false,calibrationApproved:false,
   sourceStatus:'RESEARCH_CONDITIONED_NOT_ENGINE',details:Object.freeze(details)}));
 };
 const Ga='https://doi.org/10.1002/admi.202202100';
 for(const [label,elong,strength,nucleated] of [
  ['temperatura ambiente',55,8.38,true],['4 °C',80,8.7,true],['−20 °C',110,22,false]
 ]){
  add({symbol:'Ga',z:31,property:'ductility',origin:'ga-solidified-'+elong,value:elong,unit:'%',
   metric:'elong',meaning:elong===110?'maximum-reported-not-typical':'observed-specimen-specific',
   sourceURL:Ga,sourceName:'Wang et al. (2023), Advanced Materials Interfaces 10, 2202100',
   sample:'Ga sólido, solidificação a '+label+(nucleated?' com semente de Ga':' sem semente adicionada'),
   temperatureK:null,temperatureText:'Temperatura do ENSAIO não individualizada; '+label+' é a temperatura de SOLIDIFICAÇÃO',
   test:'tração, Fig. 5f–g',
   qualifier:'Alongamento específico da amostra; '+(elong===110?'até 110% é máximo relatado, não propriedade típica. ':'')+
   'Não confundir temperatura da solidificação com temperatura do ensaio nem o valor em tração com compressão.',
   additionalValues:[{code:'UTS',value:strength,unit:'MPa',label:'Resistência máxima à tração associada',meaning:'observed-same-preparation-condition'}]});
 }
 for(const [symbol,z,purity] of [['Pb',82,'99,999% (5N)'],['Pb',82,'99,9% (3N)'],
  ['Sn',50,'99,999% (5N)'],['Sn',50,'99,99% (4N)']]){
  add({symbol,z,property:'malleability',origin:symbol.toLowerCase()+'-'+purity.replace(/[^0-9a-z]/gi,''),
   value:0.69,unit:'adimensional',metric:'epsilon-true-compression',
   meaning:'applied-true-strain-NOT-failure-strain',
   sourceURL:'https://doi.org/10.2320/matertrans.MRA2007078',
   sourceName:'Hotta et al. (2007), Materials Transactions 48, 2665–2673',
   sample:symbol+' de pureza '+purity+', barras comerciais recozidas',
   temperatureText:'223–348 K conforme cada ensaio; taxa 0,002–1 s⁻¹',
   test:'compressão THERMEC MASTER-Z; amostras pré-recozidas a 373 K por 300 s',
   qualifier:'Deformação verdadeira alvo ε=0,69; não é porcentagem, não é fratura, não é curva completa. '+purity+' não se mistura com outras purezas.'});
 }
 add({symbol:'Nb',z:41,property:'malleability',origin:'nb-yu-2025',value:0.9,
  unit:'adimensional',metric:'epsilon-true-compression',meaning:'applied-true-strain-NOT-failure-strain',
  sourceURL:'https://doi.org/10.1088/2053-1591/ae2a92',sourceName:'Yu et al. (2025), Materials Research Express 12, 126508',
  sample:'Nb R04200, pureza >99,95%, laminado a quente; cilindro Ø8×12 mm',
  temperatureText:'25, 100, 200 e 300 °C; 0,01/0,1/1/10 s⁻¹',
  test:'Gleeble3500, compressão ao longo da direção de laminação',
  qualifier:'ε verdadeira aplicada = 0,90, NÃO limite de ruptura. SVP/DE+Sigmoid é ajuste constitutivo; validar por condição e verificar especialmente 25°C e altas taxas.'});
 add({symbol:'Ti',z:22,property:'malleability',origin:'ti-precompression-2024',value:9,
  unit:'%',metric:'epsilon-precompression-percent',meaning:'processing-prestrain-NOT-failure',
  sourceURL:'https://doi.org/10.1016/j.mtla.2024.102181',
  sourceName:'Materialia 36 (2024), 102181, Effects of pre-strain on shock compression and spallation damage of titanium',
  sample:'titânio comercialmente puro, pré-deformado na direção de laminação',
  temperatureText:'Temperatura numérica não identificada no resumo',
  test:'pré-compressão seguida de impacto de placa e análise EBSD',
  qualifier:'Pré-deformação de até 9% no PROCESSO; não é maleabilidade intrínseca, não é ruptura e não é calibração para o motor.'});
 add({symbol:'Y',z:39,property:'malleability',origin:'y-savitskii-1963',value:17,
  unit:'%',metric:'historical-compression',meaning:'historical-plasticity-percent-NOT-verified-failure',
  sourceURL:'https://doi.org/10.1070/PU1963v006n01ABEH003496',
  sourceName:'Savitskii, Terekhova e Naumkin (1963), Tabela XIII, p. 136',
  sample:'ítrio fundido; série histórica com pureza típica de 98–99%, sem determinação individual para a linha',
  temperatureText:'Temperatura ambiente, K não especificado',
  test:'plasticidade em compressão, coluna de dados dos autores',
  qualifier:'Plasticidade 17% da Tabela XIII; ponto final, velocidade e modo de cálculo não completamente esclarecidos. É evidência histórica, não limite universal.'});
 add({symbol:'In',z:49,property:'ductility',origin:'in-iliev-2017',value:5,
  unit:'%',metric:'elong',meaning:'range-minimum-NOT-typical',
  sourceURL:'https://doi.org/10.1016/j.msea.2016.12.017',
  sourceName:'Iliev et al. (2017), Materials Science and Engineering A 683, 244–251',
  sample:'índio de 99,999%, grãos ~0,5 mm, placas prensadas a 80 °C',
  temperatureText:'Ensaio em temperatura ambiente, não numericizada na fonte consultada',
  test:'tração de baixa taxa; fratura parcial/completa ou primeira grande perda de carga',
  qualifier:'FAIXA de 5–15% da deformação na fratura/perda de carga: NÃO substituir pelo mínimo nem usar média. Condições diferem do relato de 70% (1958).',
  additionalValues:[{code:'elong-range-maximum',value:15,unit:'%',label:'Extremo superior da faixa de fratura',meaning:'range-maximum-NOT-typical'}]});
 const byKey=new Map();
 for(const r of rows){const k=r.atomicNumber+'|'+r.property;const existing=byKey.get(k)||[];byKey.set(k,[...existing,r]);}
 for(const [k,records] of byKey.entries())byKey.set(k,Object.freeze(records));
 return Object.freeze({schema:'silm.stage93.conditional-mechanics.v1',rows:Object.freeze(rows),
  getFor:(z,p)=>byKey.get(Number(z)+'|'+p)||[],
  newNumericSlots:Object.freeze(['Ga-ductility','Nb-malleability','Ti-malleability','Pb-malleability','Sn-malleability']),
  sourceUpgrade:'Y-malleability',dataNotEngineCalibration:true});
})();
