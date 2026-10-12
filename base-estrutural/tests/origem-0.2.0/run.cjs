const {spawnSync}=require('node:child_process'),path=require('node:path'),fs=require('node:fs');
process.chdir(path.resolve(__dirname,'..'));fs.mkdirSync('tests/results',{recursive:true});
const rows=[];for(const n of [3,4,5,6,7,8,9,10,11,12,13,15,16,17,18]){const r=spawnSync(process.execPath,['tests/check'+n+'.cjs'],{encoding:'utf8',env:process.env,timeout:120000});rows.push({test:n,status:r.status===0?'PASS':'FAIL',stdout:r.stdout,stderr:r.stderr,error:r.error?.message});console.log('Regressão',n,rows.at(-1).status);if(r.status!==0){console.error(r.stdout,r.stderr);process.exitCode=1;break;}}
fs.writeFileSync('tests/results/REGRESSAO.json',JSON.stringify({date:new Date().toISOString(),rows},null,2));
