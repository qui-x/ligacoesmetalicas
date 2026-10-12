const assert=require('node:assert/strict');
require('./harness.cjs')(async({p,service,errors})=>{
 await p.goto(service.url+'/?demo=1');await p.waitForFunction(()=>window.SimCore?.domain.current?.id==='demo');
 await p.click('#manual-open');await p.evaluate(()=>document.querySelector('.skip-link').click());assert.equal(await p.evaluate(()=>document.activeElement.id),'manual-titulo');assert.equal(await p.locator('#manual-screen').isVisible(),true);
 await p.evaluate(()=>{window.dispatchEvent(new Event('beforeprint'));});const ids=await p.locator('[id]').evaluateAll(ns=>ns.map(n=>n.id));assert.equal(new Set(ids).size,ids.length);await p.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 await p.evaluate(()=>SimCore.resetStructure());await p.waitForFunction(()=>document.activeElement.id==='scientific-viewport');assert.equal(await p.locator('#workspace').isVisible(),true);
 for(const width of [320,390])for(const scale of [1,1.5,2]){await p.setViewportSize({width,height:844});await p.evaluate(s=>A11Y.definir('fontScale',s),scale);await p.click('#manual-open');const button=p.locator('#manual-search-form button[type=submit]');assert.equal(await button.evaluate(n=>getComputedStyle(n).whiteSpace),'nowrap');assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.click('#manual-close');}
 assert.deepEqual(errors,[]);console.log('Manual/recuperação: PASS');
},'firefox').catch(e=>{console.error(e);process.exitCode=1;});
