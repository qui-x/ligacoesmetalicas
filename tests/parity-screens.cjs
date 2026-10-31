'use strict';
/* Testes de paridade de telas SIAB × SILM, um módulo por etapa do plano operacional. */
const {serve,launch}=require('./support.cjs');
const screens=[['TEST-HOME',require('./parity/home.cjs')],['TEST-LEARN',require('./parity/learn.cjs')],['TEST-MISSION',require('./parity/mission.cjs')],['TEST-ROUTE',require('./parity/route.cjs')],['TEST-WORKSPACE',require('./parity/workspace.cjs')],['TEST-NOTEBOOK',require('./parity/notebook.cjs')],['TEST-MANUAL',require('./parity/manual.cjs')],['TEST-REPORT',require('./parity/report.cjs')],['TEST-TOUR',require('./parity/tour.cjs')],['TEST-SHELL',require('./parity/shell.cjs')]];
(async()=>{const {server,url}=await serve();const browser=await launch();let failed=false;
 try{for(const [id,run] of screens){try{await run(browser,url);}catch(error){failed=true;console.error('FAIL '+id+':',error.message);}}}
 finally{await browser.close();server.close();}
 if(failed)process.exit(1);
})();
