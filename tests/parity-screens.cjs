'use strict';
/* Testes de paridade de telas SIAB × SILM, um módulo por etapa do plano operacional. */
const {serve,launch}=require('./support.cjs');
const screens=[['TEST-HOME',require('./parity/home.cjs')]];
(async()=>{const {server,url}=await serve();const browser=await launch();let failed=false;
 try{for(const [id,run] of screens){try{await run(browser,url);}catch(error){failed=true;console.error('FAIL '+id+':',error.message);}}}
 finally{await browser.close();server.close();}
 if(failed)process.exit(1);
})();
