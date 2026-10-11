"""Auditoria reproduzível da distribuição e do núcleo herdado, sem rede."""
from pathlib import Path
import hashlib,json,re,subprocess
root=Path(__file__).resolve().parents[1]
checks=[]
def check(name,condition,detail=None):
    checks.append({'check':name,'status':'PASS' if condition else 'FAIL','detail':detail})
version=(root/'VERSION').read_text().strip()
lock=json.loads((root/'package-lock.json').read_text())
check('Versão única do produto',json.loads((root/'package.json').read_text())['version']==version and lock['version']==version and lock['packages']['']['version']==version and json.loads((root/'BUILD-INFO.json').read_text())['versao']==version and f'data-app-version="{version}"' in (root/'index.html').read_text())
core=json.loads((root/'docs/evidence/NUCLEO-PRESERVADO.json').read_text())
changed=[p for p,h in core['unchanged'].items() if hashlib.sha512((root/p).read_bytes()).hexdigest()!=h]
# Base de comparação: núcleo da SILM 0.3.0 recebida. Única integração aprovada na 0.4.0: retomada direta (correção de origem 0.3.x).
# Integrações aprovadas: activity.js (0.4.0, correção de origem 0.3.x); workspace.js e domain.js (0.5.0, paridade SIAB — fontes Ver/Dados).
expected_integrations={'js/experience/activity.js','js/workspace/workspace.js','js/core/domain.js'}
check('Núcleo herdado preservado com integrações declaradas',set(changed)==expected_integrations,{'verifiedFiles':len(core['unchanged']),'approvedIntegrations':sorted(expected_integrations),'changedFiles':changed})
activity=(root/'js/experience/activity.js').read_text()
check('Integração opcional por domínio (resumeFree)',"resumeFree==='direct'" in activity and "resumeFree:'direct'" in (root/'domain/silm/bootstrap.js').read_text())
html=(root/'index.html').read_text()
assets=re.findall(r'(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"',html)
missing=[x for x in assets if ':' not in x and not (root/x).is_file()]
check('Recursos estáticos presentes',not missing,missing)
check('Scripts locais',not any(re.match(r'https?://',x) for x in re.findall(r'<script[^>]+src="([^"]+)"',html)))
check('Demo removida do runtime',not (root/'domain/demo').exists() and 'DemoEstrutural' not in (root/'domain/entry.js').read_text())
check('Domínio automático SILM', 'SimCore.registerDomain(SILM.create())' in (root/'domain/entry.js').read_text())
runtime_files=[root/'index.html',root/'a11y.js',*list((root/'js').rglob('*.js')),*list((root/'domain').rglob('*.js'))]
# Preferências legadas e comentários históricos não constituem motor científico.
scientific_deps=[]
for file in runtime_files:
    text=re.sub(r'/\*[\s\S]*?\*/|//[^\n]*','',file.read_text())
    if re.search(r'\bSIAB\s*\.|\bDemoEstrutural\s*\(|js/simulation/|chemistry\.js|ph-engine|domain/demo/',text):scientific_deps.append(str(file.relative_to(root)))
check('Dependências executáveis de domínio ácido-base',len(scientific_deps)==0,{'count':len(scientific_deps),'files':scientific_deps})
errors=[]
for file in [*runtime_files[2:],root/'a11y.js',root/'sw.js']:
    result=subprocess.run(['node','--check',str(file)],capture_output=True,text=True)
    if result.returncode:errors.append({'file':str(file.relative_to(root)),'error':result.stderr})
check('Sintaxe JavaScript',not errors,errors)
m=json.loads((root/'manifest.webmanifest').read_text());check('Identidade e ícones PWA',m['short_name']=='SILM' and all((root/icon['src']).is_file() for icon in m['icons']))
sw=(root/'sw.js').read_text();check('Cache independente',f"const VERSION='{version}'" in sw and 'silm@${ROOT.href}' in sw)
# Documentos históricos 0.1.1–0.3.0 não constavam do pacote recebido (ver docs/SILM-0.4.0.md).
required=['SILM-0.4.0.md','MONTAGEM-ESTRUTURA-METALICA.md','SCIENTIFIC-STATE.md','ARQUITETURA-CIENTIFICA.md','ROADMAP-SILM.md','CONTRATO-VERSIONAMENTO.md','INVESTIGACAO.md','PARIDADE-SIAB-1.0.0.md','ESTRUTURAS-CRISTALINAS.md','CONTRATO-CRISTALOGRAFICO.md','COBERTURA-METAIS.md',f'SILM-{version}.md',f'RELATORIO-BUILD-TESTES-{version}.md']
check('Documentação obrigatória',all((root/'docs'/p).is_file() for p in required))
roadmap=(root/'docs/ROADMAP-SILM.md').read_text();check('Roadmap integral até 1.0.0',all('SILM 0.'+str(i)+'.x' in roadmap for i in range(1,19)) and '# SILM 1.0.0-rc.x' in roadmap and '# SILM 1.0.0\n' in roadmap)
assembly=[root/'domain/silm'/n for n in ('assembly.js','assembly-view.js','assembly.css','crystal.js','crystal-view.js')]
check('Montagem (0.4.x) e cristalografia (0.5.x) presentes e carregadas em ordem',all(p.is_file() for p in assembly) and html.index('domain/silm/assembly.js')<html.index('domain/silm/crystal.js')<html.index('domain/silm/state.js')<html.index('domain/silm/assembly-view.js')<html.index('domain/silm/crystal-view.js')<html.index('domain/silm/bootstrap.js') and 'domain/silm/assembly.css' in html)
crystal=re.sub(r'/\*[\s\S]*?\*/','',(root/'domain/silm/crystal-view.js').read_text())
check('Vista cristalina sem elétrons e sem ligações fora do contorno da célula',not re.search(r'electron|bond',crystal,re.I) and crystal.count("svgEl('line'")==1)
view=re.sub(r'/\*[\s\S]*?\*/','',(root/'domain/silm/assembly-view.js').read_text())
check('Sem linhas M—M nem elétrons na representação',not re.search(r"createElementNS\([^)]*,'(line|path|polyline)'\)|electron",view))
check('Sem estados científicos paralelos',not any(re.search(r'routeStructure|missionStructure|routeScientificState|missionScientificState',f.read_text()) for f in (root/'domain').rglob('*.js')))
state=subprocess.run(['node',str(root/'scripts/validate-scientific-state.cjs')],capture_output=True,text=True)
check('Validador do estado científico',state.returncode==0 and '"schemaVersion"' in state.stdout,state.stderr[-500:] or None)
result={'product':'SILM','version':version,'checks':checks,'passed':sum(c['status']=='PASS' for c in checks),'failed':sum(c['status']=='FAIL' for c in checks)}
(root/'docs/evidence/AUDITORIA-SILM.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2));raise SystemExit(bool(result['failed']))
