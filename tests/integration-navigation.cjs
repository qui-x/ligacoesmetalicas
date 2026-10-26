'use strict';
// Percorre os mesmos níveis de doca usados pelo aluno, sem contornar a interface.
async function viewer(page,id){
 const titles={estrutura:'Estrutura e representação',eletrons:'Elétrons deslocalizados',propriedades:'Propriedades metálicas',instrumentos:'Instrumentos de medição',calculos:'Cálculos cristalográficos'};
 if(await page.locator('[data-open-dock="ver"]').getAttribute('aria-expanded')!=='true')await page.locator('[data-open-dock="ver"]').click();
 if(await page.locator('#si-dock-viewer-back').isVisible())await page.locator('#si-dock-viewer-back').click();
 const family=id==='instrumentos'?'Medir':id==='calculos'?'Analisar':'Observar';
 const tab=page.locator('#si-viewer-families').getByRole('tab',{name:family,exact:true});
 if(await tab.getAttribute('aria-selected')!=='true')await tab.click();
 await page.locator('#si-viewer-buttons').getByRole('button',{name:titles[id],exact:true}).click();
}
async function moduleChoice(page,id){
 if(await page.locator('[data-open-dock="ver"]').getAttribute('aria-expanded')==='true'||await page.locator('[data-open-dock="dados"]').getAttribute('aria-expanded')==='true')await page.locator('[data-close-dock="right"]').click();
 if(await page.locator('[data-open-dock="montagem"]').getAttribute('aria-expanded')!=='true')await page.locator('[data-open-dock="montagem"]').click();
 await page.locator('[data-left-tab="modulo"]').click();await page.locator('#silm-module').selectOption(id);
 await page.waitForFunction(id=>SILMIntegration.snapshot().module.active===id,id);
 await page.locator('[data-close-dock="left"]').click();
}
async function data(page,id){
 if(await page.locator('[data-open-dock="dados"]').getAttribute('aria-expanded')!=='true')await page.locator('[data-open-dock="dados"]').click();
 if(await page.locator('#silm-data-back').isVisible())await page.locator('#silm-data-back').click();
 await page.locator('[data-silm-data-open="'+id+'"]').click();
}
module.exports={viewer,moduleChoice,data};
