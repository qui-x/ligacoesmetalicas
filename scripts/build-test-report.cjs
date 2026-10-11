'use strict';
/* Gera docs/RELATORIO-BUILD-TESTES-<versão>.md a partir das evidências reais: validadores científicos,
   resultados de navegador (JSON), auditoria e o checklist da versão (docs/checklists/CHECKLIST-<versão>.md). */
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),version=fs.readFileSync(path.join(root,'VERSION'),'utf8').trim();
const run=(cmd,args)=>{try{return {ok:true,out:execFileSync(cmd,args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']})};}catch(error){return {ok:false,out:String(error.stdout||'')+String(error.stderr||'')};}};
const jsonFrom=text=>{const i=text.indexOf('{');try{return JSON.parse(text.slice(i,text.lastIndexOf('}')+1));}catch(_){return null;}};
const data=run('node',['tests/scientific-data.cjs']),state=run('node',['scripts/validate-scientific-state.cjs']);
const browserFile=path.join(root,'docs/evidence-'+version,'RESULTADOS-NAVEGADOR-'+version+'.json');
const browser=fs.existsSync(browserFile)?JSON.parse(fs.readFileSync(browserFile,'utf8')):null;
const auditFile=path.join(root,'docs/evidence/AUDITORIA-SILM.json'),audit=fs.existsSync(auditFile)?JSON.parse(fs.readFileSync(auditFile,'utf8')):null;
const checklistFile=path.join(root,'docs/checklists/CHECKLIST-'+version+'.md'),checklist=fs.existsSync(checklistFile)?fs.readFileSync(checklistFile,'utf8').trim():'';
const shots=fs.existsSync(path.join(root,'docs/evidence-'+version,'capturas'))?fs.readdirSync(path.join(root,'docs/evidence-'+version,'capturas')).filter(f=>f.endsWith('.png')).sort():[];
const d=jsonFrom(data.out),s=jsonFrom(state.out);
const series=[...new Set((browser?.results||[]).map(r=>r.id.split('-')[0]))];
const rows=(browser?.results||[]).map(r=>`| ${r.id} | ${r.name.replace(/\|/g,'/')} | ${r.status==='PASS'?'✅ aprovado':'❌ reprovado'} | ${(r.durationMs/1000).toFixed(1)} s |`).join('\n');
const doc=`# Relatório de build e testes — SILM ${version}

Gerado por \`scripts/build-test-report.cjs\` a partir das evidências desta versão.

## 1. Build e auditoria

- \`npm run build\`: validação do banco e do estado científico (bloqueantes), bundle, layout, service worker e cobertura.
- Auditoria (\`npm run audit\`): **${audit?audit.passed+' aprovadas, '+audit.failed+' reprovadas':'não executada'}**${audit&&audit.failed?' — '+audit.checks.filter(c=>c.status==='FAIL').map(c=>c.check).join('; '):''}.

## 2. Banco científico (regressão 0.2.x)

${data.ok&&d?`Elementos: ${d.elements} · metais disponíveis: ${d.availableMetals} · fontes: ${d.sources} · casos negativos recusados: ${d.negativeCases} · busca: ${d.search}.`:'❌ Falhou:\n\n```\n'+data.out.slice(0,1500)+'\n```'}

## 3. Estado científico

${state.ok&&s?'```json\n'+JSON.stringify(s,null,2)+'\n```':'❌ Falhou:\n\n```\n'+state.out.slice(0,1500)+'\n```'}

## 4. Navegador — todas as suítes (${series.join(', ')})

${browser?`${browser.browser} · ${browser.date.slice(0,10)} · **${browser.passed} aprovados, ${browser.failed} reprovados** · erros de console: **${browser.consoleErrors.length}**.

As suítes das séries anteriores rodam inteiras como regressão. Prefixo do item = série do prompt.

| Item | Teste | Resultado | Duração |
|---|---|---|---|
${rows}`:'Resultados de navegador ausentes.'}

## 5. Capturas (\`docs/evidence-${version}/capturas/\`)

${shots.map(f=>'- `'+f+'`').join('\n')||'—'}

${checklist?'## 6. Checklist da versão\n\n'+checklist+'\n':''}
## ${checklist?7:6}. Limites desta homologação

- Executado somente em **Chromium**; o ambiente não tem Firefox nem WebKit. Gecko e WebKit pertencem à homologação técnica.
- Mobile, toque, 150% de fonte, alto contraste e movimento reduzido foram **emulados**. Aparelhos físicos, leitor de tela real, projetor e impressão física requerem verificação manual.
- O offline foi testado com service worker real em \`localhost\`, desconectando o contexto do navegador.
`;
fs.writeFileSync(path.join(root,'docs/RELATORIO-BUILD-TESTES-'+version+'.md'),doc);
console.log('Relatório gerado: docs/RELATORIO-BUILD-TESTES-'+version+'.md');
