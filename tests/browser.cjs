'use strict';
/* Executor dos testes de navegador: roda todas as suítes (regressão das séries anteriores + série atual)
   e grava as evidências em docs/evidence-<versão>/. Capturas de tela só para a série atual.
   Uso: node tests/browser.cjs [prefixo-de-teste ...] */
const fs=require('node:fs'),path=require('node:path');const {createKit}=require('./browser-kit.cjs');
const version=fs.readFileSync(path.join(__dirname,'..','VERSION'),'utf8').trim(),series=version.split('.').slice(0,2).join('.');
const suites=fs.readdirSync(path.join(__dirname,'suites')).filter(f=>/^s\d+.*\.cjs$/.test(f)).sort().map(f=>require('./suites/'+f));
(async()=>{
 const only=process.argv.slice(2);const kit=createKit({version,only:only.length?only:null});await kit.start();
 try{for(const suite of suites)await suite.run(kit,{screenshots:suite.series===series});
  await kit.test('CONSOLE','Console sem erros críticos (todas as suítes)',async()=>{kit.assert.deepEqual(kit.consoleErrors,[]);return {errors:0};});}
 finally{await kit.stop();}
 const report=kit.finish();process.exitCode=report.failed?1:0;
})().catch(error=>{console.error(error);process.exit(1);});
