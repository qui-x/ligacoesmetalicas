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
expected_integrations={'js/experience/activity.js','js/workspace/workspace.js','js/core/domain.js','js/manual/manual.js'}   # manual.js: link direto para tópico (0.8.0)
# 0.9.0: identity.js (símbolo oficial do SILM como ícone padrão); router.js + app.js (correção de origem: rota inicial direta sem aviso falso).
expected_integrations|={'js/core/identity.js','js/navigation/router.js','js/init/app.js'}
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
required=['SILM-0.4.0.md','MONTAGEM-ESTRUTURA-METALICA.md','SCIENTIFIC-STATE.md','ARQUITETURA-CIENTIFICA.md','ROADMAP-SILM.md','CONTRATO-VERSIONAMENTO.md','INVESTIGACAO.md','PARIDADE-SIAB-1.0.0.md','ESTRUTURAS-CRISTALINAS.md','CONTRATO-CRISTALOGRAFICO.md','COBERTURA-METAIS.md','MODELO-ELETRONICO.md','LIMITACOES-MODELO-ELETRONICO.md','PROPRIEDADES-METALICAS.md','CONTRATO-PROPRIEDADES.md','FONTES-E-PROVENIENCIA.md','MODULO-EXPLORAR.md','CONTRATO-EXPLORACAO.md','MODULO-MEDIR.md','CONTRATO-MEDICOES.md','INSTRUMENTOS-E-UNIDADES.md','IDENTIDADE-VISUAL.md','MODULO-CALCULAR.md','CONTRATO-CALCULOS.md','FORMULAS-CRISTALOGRAFICAS.md','CONSTANTES-CIENTIFICAS.md',f'SILM-{version}.md',f'RELATORIO-BUILD-TESTES-{version}.md']
check('Documentação obrigatória',all((root/'docs'/p).is_file() for p in required))
roadmap=(root/'docs/ROADMAP-SILM.md').read_text();check('Roadmap integral até 1.0.0',all('SILM 0.'+str(i)+'.x' in roadmap for i in range(1,19)) and '# SILM 1.0.0-rc.x' in roadmap and '# SILM 1.0.0\n' in roadmap)
assembly=[root/'domain/silm'/n for n in ('assembly.js','assembly-view.js','assembly.css','crystal.js','crystal-view.js','electron-view.js','properties.js','property-view.js','exploration.js')]
check('Montagem (0.4.x), cristalografia (0.5.x), camada eletrônica (0.6.x), propriedades (0.7.x) e Explorar (0.8.x) presentes e carregadas em ordem',all(p.is_file() for p in assembly) and html.index('domain/silm/assembly.js')<html.index('domain/silm/crystal.js')<html.index('domain/silm/properties.js')<html.index('domain/silm/state.js')<html.index('domain/silm/assembly-view.js')<html.index('domain/silm/crystal-view.js')<html.index('domain/silm/electron-view.js')<html.index('domain/silm/property-view.js')<html.index('domain/silm/exploration.js')<html.index('domain/silm/bootstrap.js') and 'domain/silm/assembly.css' in html)
crystal=re.sub(r'/\*[\s\S]*?\*/','',(root/'domain/silm/crystal-view.js').read_text())
check('Vista cristalina sem ligações fora do contorno da célula; elétrons só pela camada eletrônica',not re.search(r'bond',crystal,re.I) and crystal.count("svgEl('line'")==1 and not re.search(r'getContext|arc\(',crystal))
view=re.sub(r'/\*[\s\S]*?\*/','',(root/'domain/silm/assembly-view.js').read_text())
check('Montagem livre sem linhas M—M; elétrons só pela camada eletrônica',not re.search(r"createElementNS\([^)]*,'(line|path|polyline)'\)|getContext|arc\(",view))
electron=re.sub(r'/\*[\s\S]*?\*/|//[^\n]*','',(root/'domain/silm/electron-view.js').read_text())
check('Camada eletrônica: um canvas decorativo, sem trajetórias, setas, pares ou corrente',electron.count("document.createElement('canvas')")==1 and "setAttribute('aria-hidden','true')" in electron and not re.search(r'lineTo|moveTo|createElementNS|bond|current|voltage|corrente|tens[aã]o',electron,re.I))
statecode=re.sub(r'/\*[\s\S]*?\*/|//[^\n]*','',(root/'domain/silm/state.js').read_text())
props=re.sub(r'/\*[\s\S]*?\*/|//[^\n]*','',(root/'domain/silm/properties.js').read_text())
pview=re.sub(r'/\*[\s\S]*?\*/|//[^\n]*','',(root/'domain/silm/property-view.js').read_text())
check('Propriedades: sem valores típicos embutidos; dados só do banco com fonte',not re.search(r'\d[\d.,]*\s*(S/m|W/\(m|nΩ|µΩ|MS/m)',props) and 'e.properties' in props and 'PROPERTY_DATA_MISSING' in props)
check('Propriedades: sem circuito, instrumentos ou setas por elétron; fora da série',not re.search(r'amper[ií]metro|volt[ií]metro|bateria|circuito|particles|magnet|dureza|corros|\bligas?\b',pview+props,re.I))
explore=re.sub(r'/\*[\s\S]*?\*/|//[^\n]*','',(root/'domain/silm/exploration.js').read_text())
check('Explorar: comparação somente leitura, sem laço extra e sem novo schema',not re.search(r'startProperty|setPropertyParams|activateElectrons|organize\(|restoreFree|storage\.set|beginAssembly',explore) and 'reducedMotion:()=>true' in explore and 'exploration' not in statecode and 'schemaVersion' not in explore)   # a representação da exploração nunca entrou no schema
# Medir (0.9.x): medidas do modelo no estado único (schema 7), sem ± e sem instrumentos sem modelo científico.
measure=re.sub(r'/\*[\s\S]*?\*/|//[^\n]*','',(root/'domain/silm/measurements.js').read_text())
mview=re.sub(r'/\*[\s\S]*?\*/|//[^\n]*','',(root/'domain/silm/measure-view.js').read_text())
boot=re.sub(r'/\*[\s\S]*?\*/|//[^\n]*','',(root/'domain/silm/bootstrap.js').read_text())
check('Medir: scripts presentes e carregados em ordem (medições antes do estado; vista depois da cena)',all((root/'domain/silm'/n).is_file() for n in ('measurements.js','measure-view.js')) and html.index('domain/silm/measurements.js')<html.index('domain/silm/state.js')<html.index('domain/silm/crystal-view.js')<html.index('domain/silm/measure-view.js')<html.index('domain/silm/bootstrap.js'))
schema=int(re.search(r'scientificSchemaVersion=(\d+)',statecode).group(1))
check('Medir: schema ≥ 7, validador recalcula cada registro e só há medida com escala cristalina',schema>=7 and 'compute(m.type' in measure and "MEASUREMENT_WITHOUT_SCALE" in measure and "c.mode!=='crystalline'" in measure)
check('Medir: sem ± (resolução não é incerteza) e sem instrumentos sem modelo',not re.search('±',measure+mview+boot) and not re.search(r'term[oô]metro|amper[ií]metro|mult[ií]metro|volt[ií]metro|ohm[ií]metro|pir[oô]metro',measure+mview+boot,re.I))
check('Medir: medições só no scientificState',not any(re.search(r'measureScientificState|measurementStructure|measurementMetal',f.read_text()) for f in (root/'domain').rglob('*.js')))
check('Marcadores eletrônicos não são estado científico',not re.search(r"particles|electronCount|countReal",statecode) and "representationType:'qualitative'" in statecode)
check('Sem estados científicos paralelos',not any(re.search(r'routeStructure|missionStructure|routeScientificState|missionScientificState|exploreScientificState|exploreStructure|exploreElectrons|exploreProperties',f.read_text()) for f in (root/'domain').rglob('*.js')))
# Calcular (0.10.x): catálogo único de fórmulas, constantes centralizadas com fonte e cálculos só no estado único (schema 8).
calc=re.sub(r'/\*[\s\S]*?\*/|//[^\n]*','',(root/'domain/silm/calculations.js').read_text())
check('Calcular: script presente e carregado em ordem (cristalografia → medições → cálculos → estado)',(root/'domain/silm/calculations.js').is_file() and html.index('domain/silm/crystal.js')<html.index('domain/silm/measurements.js')<html.index('domain/silm/calculations.js')<html.index('domain/silm/state.js'))
check('Calcular: schema 8; o validador recalcula cada cálculo e recusa fórmula fora da estrutura',schema==8 and 'SILM.calculation.validate' in statecode and 'compute(m.formulaId' in calc and 'FORMULA_NOT_APPLICABLE' in calc and 'CALCULATION_TABULATED_MISMATCH' in calc)
others=''.join(re.sub(r'/\*[\s\S]*?\*/|//[^\n]*','',f.read_text()) for f in (root/'domain/silm').glob('*.js') if f.name!='calculations.js')
check('Calcular: constantes centralizadas, sem números mágicos fora do serviço',calc.count('6.02214076e23')==1 and calc.count('1e-24')==1 and 'idealRatio' in calc and not re.search(r'6\.022|1e-24|\b1\.633|Math\.sqrt\(8/3\)',others.replace('idealRatio:Math.sqrt(8/3)','')) and 'src-bipm-si-2019' in calc)
check('Calcular: fórmulas só no catálogo; expressões legíveis, sem sintaxe de programação',re.search(r'Math\.(sqrt|pow|cbrt)',boot) is None and not re.search(r"expression:'[^']*(Math\.|\*\*)",calc) and "spoken:'" in calc)
check('Calcular: cálculos só no scientificState',not any(re.search(r'calculateScientificState|calculationStructure|calculationMetal',f.read_text()) for f in (root/'domain').rglob('*.js')) and 'calculations:' in statecode)
state=subprocess.run(['node',str(root/'scripts/validate-scientific-state.cjs')],capture_output=True,text=True)
check('Validador do estado científico',state.returncode==0 and '"schemaVersion"' in state.stdout,state.stderr[-500:] or None)
# Identidade oficial (0.9.0): cópias íntegras do pacote do autor; o adaptador e a correção ficam em arquivos próprios.
official={'domain/silm/abertura/silm-opening.js':'73a0c65ca0d7defe0669e8f8df891a8debea205b168336337704b63daf3d9b69','domain/silm/abertura/silm-opening.css':'c9436bf26582566e15cc1ffe13af1faf08bb68c32851fefbf0b461fb6686e6f8',
 'assets/silm-simbolo.svg':'b9af1175e401f06b8aec2583b89a8c626a823bb6c88be8b9174ffeaf4721a766','assets/silm-logo-vertical.svg':'3569ac1a23e5d380122d7f3326ab39c5bfe99281f24518b84c144b6dcc3e0968',
 'assets/silm-icone.svg':'15a417fbf0eaeeda13d0d5492cd44bb5157a3784afbf5b6b2e99a0e996b15ea5','favicon-dark.svg':'15a417fbf0eaeeda13d0d5492cd44bb5157a3784afbf5b6b2e99a0e996b15ea5','favicon-light.svg':'15a417fbf0eaeeda13d0d5492cd44bb5157a3784afbf5b6b2e99a0e996b15ea5'}
mismatch=[p for p,h in official.items() if hashlib.sha256((root/p).read_bytes()).hexdigest()!=h]
html=(root/'index.html').read_text()
check('Identidade oficial íntegra e abertura no início do <body>',not mismatch and html.index('domain/silm/abertura/silm-opening.js')<html.index('class="app-header"') and 'id="silm-opening"' not in html and 'assets/silm-simbolo.svg' in html,{'mismatch':mismatch})
result={'product':'SILM','version':version,'checks':checks,'passed':sum(c['status']=='PASS' for c in checks),'failed':sum(c['status']=='FAIL' for c in checks)}
(root/'docs/evidence/AUDITORIA-SILM.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2));raise SystemExit(bool(result['failed']))
