'use strict';
window.SILM=window.SILM||{};
/*
 * Lei constitutiva elastoplástica UNIAXIAL de pequenas deformações.
 * - Retorno analítico (preditor elástico / corretor plástico) sob ε imposto
 * - Caminho inverso sob tensão imposta (controle de esforço relativo da UI)
 * - Encruamento isotrópico linear; reversão de carga, descarregamento
 * - O estado acumulado é independente do renderizador e das marcas SVG.
 *
 * O exemplo do SILM usa constantes ADIMENSIONAIS. Não há aqui E em GPa,
 * σy em MPa, taxa de deformação, temperatura de ensaio, fratura, estricção,
 * plasticidade em múltiplos eixos nem parâmetro material homologado.
 * Para materiais reais, E, σy e H devem ser medidos na MESMA amostra,
 * condição/temperatura, com proveniência compatível.
 *
 * Referência de método: retorno de plasticidade isotrópica (Simo–Taylor;
 * MOOSE IsotropicPlasticityStressUpdate; FEniCSx plasticity tour).
 */
(()=>{
 const DEMO=Object.freeze({E:10,yieldStress:.5,hardening:12,
  basis:'normalized-demonstration',calibrated:false});
 const epsilon=1e-10;
 const finite=Number.isFinite;
 function parameters(p=DEMO){
  if(!p||![p.E,p.yieldStress,p.hardening].every(finite)||
    p.E<=0||p.yieldStress<=0||p.hardening<0)
   throw new RangeError('Parâmetros elastoplásticos inválidos');
  // Não aceitar o campo calibrated isoladamente como prova de dados reais.
  if(p.calibrated)throw new TypeError('Calibração requer homologação científica externa');
  return p;
 }
 const cleanZero=x=>Math.abs(x)<epsilon?0:x;
 function fresh(){
  return Object.freeze({stress:0,totalStrain:0,elasticStrain:0,
   plasticStrain:0,accumulatedPlastic:0,yielded:false,
   yieldThreshold:DEMO.yieldStress,model:'uniaxial-isotropic-hardening-normalized',
   calibrated:false});
 }
 function validState(s){
  return !!s&&['stress','totalStrain','elasticStrain','plasticStrain',
   'accumulatedPlastic'].every(k=>finite(s[k]))&&s.accumulatedPlastic>=0;
 }
 function finish(stress,plastic,alpha,p,yielded,stressLimited=false){
  const elastic=cleanZero(stress/p.E),epsp=cleanZero(plastic);
  return Object.freeze({
   stress:cleanZero(stress),totalStrain:cleanZero(elastic+epsp),
   elasticStrain:elastic,plasticStrain:epsp,
   accumulatedPlastic:alpha,yielded:!!yielded,
   yieldThreshold:p.yieldStress+p.hardening*alpha,stressLimited,
   model:'uniaxial-isotropic-hardening-normalized',calibrated:false
  });
 }
 // ε_total imposto; retorno analítico à superfície de escoamento 1D.
 function strainStep(previous,totalStrain,p=DEMO){
  parameters(p);
  if(!finite(totalStrain)||!validState(previous))throw new TypeError('Estado ou deformação inválidos');
  const trial=p.E*(totalStrain-previous.plasticStrain);
  const f=Math.abs(trial)-(p.yieldStress+p.hardening*previous.accumulatedPlastic);
  if(f<=epsilon)return finish(trial,previous.plasticStrain,
    previous.accumulatedPlastic,p,false);
  const dp=f/(p.E+p.hardening),direction=Math.sign(trial);
  return finish(trial-p.E*direction*dp,
   previous.plasticStrain+direction*dp,
   previous.accumulatedPlastic+dp,p,true);
 }
 // σ imposto; resolve a superfície com encruamento isotrópico.
 // H=0 não sustenta tensão > σy em plasticidade perfeita sob controle de carga:
 // a tensão é limitada e o programa identifica a saturação.
 function stressStep(previous,targetStress,p=DEMO){
  parameters(p);
  if(!finite(targetStress)||!validState(previous))throw new TypeError('Estado ou carga inválidos');
  const current=p.yieldStress+p.hardening*previous.accumulatedPlastic;
  if(Math.abs(targetStress)<=current+epsilon)
   return finish(targetStress,previous.plasticStrain,previous.accumulatedPlastic,p,false);
  if(!p.hardening)return finish(Math.sign(targetStress)*current,
   previous.plasticStrain,previous.accumulatedPlastic,p,false,true);
  const da=(Math.abs(targetStress)-current)/p.hardening;
  return finish(targetStress,previous.plasticStrain+Math.sign(targetStress)*da,
   previous.accumulatedPlastic+da,p,true);
 }
 const modelInfo=Object.freeze({
  materialScope:'demo-only',stressUnits:'relative',strainUnits:'dimensionless',
  supports:['elastic recovery','permanent strain','isotropic hardening','load reversal'],
  excludes:['measured sample stress','3D plastic strain tensor','fracture','strain rate','temperature-dependent yield']
 });
 SILM.elastoplastic=Object.freeze({DEMO,parameters,fresh,validState,
  strainStep,stressStep,modelInfo});
})();
