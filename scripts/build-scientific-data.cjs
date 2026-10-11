'use strict';
const fs=require('node:fs'),path=require('node:path');const {validate,load}=require('./validate-scientific-data.cjs');
const data=load(),errors=validate(data,{checkFiles:true});if(errors.length)throw new Error(errors.join('\n'));
const out=path.resolve(__dirname,'../domain/silm/data/bundle.js');
fs.writeFileSync(out,"'use strict';\nwindow.SILM=window.SILM||{};\n/* Gerado dos JSON canônicos por build-scientific-data.cjs. */\nSILM.scientificData="+JSON.stringify(data)+';\n');
console.log('Bundle científico local gerado e validado.');
