"""Auditoria reproduzível da arquitetura atual do SILM (Base SI + motor científico), sem rede.

Desde a 0.15.5 a auditoria confere a entrada que de fato roda: a Base SI travada por hash, a entrada gerada a partir
de integracao/index.html, um único shell carregado, o motor científico na ordem de dependência, o cache offline e os
contratos científicos (schema 8, sem ligações M—M, representação fora do estado, isométrica congelada). O núcleo
antigo (Base Estrutural 0.3.1 em js/, css/, a11y.js) permanece no repositório como histórico e não pode ser carregado.
"""
from pathlib import Path
import hashlib, json, re, subprocess

root = Path(__file__).resolve().parents[1]
checks = []


def check(name, condition, detail=None):
    checks.append({'check': name, 'status': 'PASS' if condition else 'FAIL', 'detail': detail})


def read(path):
    return (root / path).read_text(encoding='utf-8')


def node(*args):
    result = subprocess.run(['node', *args], cwd=root, capture_output=True, text=True)
    return result.returncode, (result.stdout + result.stderr).strip()[-600:]


def strip_comments(code):
    return re.sub(r'/\*[\s\S]*?\*/|//[^\n]*', '', code)


version = read('VERSION').strip()

# 1. Versão única (a mesma verificação do build).
code, out = node('scripts/check-version.cjs')
check('Versão única do produto (VERSION, pacote, BUILD-INFO, manifesto, rótulos, cache)', code == 0, out)

# 2. Base SI travada: cada arquivo do snapshot upstream confere com o hash do base-lock.
lock = json.loads(read('integracao/base-lock.json'))
mismatch = [p for p, h in lock['files'].items()
            if not (root / 'integracao/upstream' / p).is_file()
            or hashlib.sha256((root / 'integracao/upstream' / p).read_bytes()).hexdigest() != h]
check('Base SI travada por hash (integracao/base-lock.json)', not mismatch,
      {'version': lock.get('version'), 'commit': lock.get('commit'), 'divergentes': mismatch})

# 3. Entrada gerada coerente: index.html é exatamente a saída de build-main-entry a partir da fonte.
source = read('integracao/index.html')


def forward(html):
    def rewrite(m):
        url = m.group(2)
        url = url[3:] if url.startswith('../') else url if (':' in url or url.startswith('#')) else 'integracao/' + url
        return m.group(1) + url + m.group(3)
    html = re.sub(r'((?:src|href)=")([^"]+)(")', rewrite, html)
    return html.replace('</head>', '<link rel="manifest" href="manifest.webmanifest"><script src="integracao/pwa.js" defer></script></head>', 1)


html = read('index.html')
check('index.html gerado a partir de integracao/index.html (sem edição direta)', forward(source) == html)

# 4. Um único shell: a entrada não carrega o núcleo antigo nem o bootstrap antigo do domínio.
legacy = [ref for ref in re.findall(r'(?:src|href)="([^"]+)"', html)
          if ref.startswith(('js/', 'css/')) or ref in ('a11y.js', 'domain/entry.js', 'domain/silm/bootstrap.js', 'domain/silm/prelude.js')]
check('Um único shell carregado (Base SI); núcleo antigo fora da entrada', not legacy and 'integracao/base-core.js' in html and 'integracao/compat.js' in html, legacy)

# 5. Motor científico carregado na ordem de dependência, com o adaptador por último.
order = ['integracao/base-core.js', 'integracao/compat.js', 'domain/silm/data/bundle.js', 'domain/silm/data-api.js', 'domain/silm/assembly.js',
         'domain/silm/crystal.js', 'domain/silm/properties.js', 'domain/silm/measurements.js', 'domain/silm/calculations.js', 'domain/silm/state.js',
         'domain/silm/representation.js', 'domain/silm/renderer-2d.js', 'domain/silm/assembly-view.js', 'domain/silm/crystal-view.js',
         'domain/silm/electron-view.js', 'domain/silm/property-view.js', 'domain/silm/measure-view.js', 'domain/silm/routes.js',
         'domain/silm/missions.js', 'domain/silm/themes.js', 'domain/silm/route-session.js', 'integracao/adapter.js']
positions = [html.find('src="' + p + '"') for p in order]
check('Motor científico na ordem de dependência e adaptador por último', all(p >= 0 for p in positions) and positions == sorted(positions),
      {p: i for p, i in zip(order, positions) if i < 0} or None)

# 6. Cache offline: todo arquivo existe, toda dependência da entrada está no cache e nada morto entra nele.
sw = read('sw.js')
files = json.loads(re.search(r'const FILES=(\[[\s\S]*?\]);\nconst local', sw).group(1))
missing = [f for f in files if f != './' and not (root / f).is_file()]
refs = [r for r in re.findall(r'(?:src|href)="([^"?#]+)', html) if ':' not in r and (root / r).is_file()]
uncached = [r for r in refs if r not in files]
dead = [f for f in files if f.startswith(('js/', 'css/')) or f in ('a11y.js', 'domain/silm/bootstrap.js', 'integracao/upstream/app.js') or f.endswith(('.ts', '.cif'))]
check('Cache offline íntegro: arquivos existentes, dependências da entrada presentes, sem arquivos mortos',
      not missing and not uncached and not dead, {'recursos': len(files), 'ausentes': missing, 'fora_do_cache': uncached, 'mortos': dead})

# 7. Sintaxe JavaScript dos arquivos carregados.
errors = []
for ref in refs:
    if ref.endswith('.js'):
        code, out = node('--check', ref)
        if code:
            errors.append({ref: out})
check('Sintaxe JavaScript dos scripts da entrada', not errors, errors or None)

# 8. Estado científico: schema 8 e validadores do banco e do estado.
state = read('domain/silm/state.js')
code_data, out_data = node('scripts/validate-scientific-data.cjs')
code_state, out_state = node('scripts/validate-scientific-state.cjs')
check('Estado científico no schema 8; banco e estado validados', 'schemaVersion:8' in state and code_data == 0 and code_state == 0,
      None if code_data == 0 and code_state == 0 else {'dados': out_data, 'estado': out_state})

# 9. Contratos de representação: sem ligações M—M; câmera fora do estado; isométrica congelada para Organizar e calor.
crystal_view = read('domain/silm/crystal-view.js')
crystal = strip_comments(read('domain/silm/crystal.js'))
representation = strip_comments(read('domain/silm/representation.js'))
# Linhas permitidas: o contorno da célula e, na deformação (0.17.x), o traço do plano de deslizamento (não é ligação).
slip_lines = crystal_view.count("svgEl('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:'silm-slip-plane'})")
check('Vista cristalina sem ligações fora do contorno da célula', not re.search(r'bond', crystal_view, re.I) and crystal_view.count("svgEl('line'") == 1 + slip_lines and slip_lines <= 1)
check('Representação fora do estado científico (câmera, projeção, modo 2D/3D)',
      'VERSION=2' in representation and not re.search(r'camera|zoom|projection|representation\.view', strip_comments(state)))
check('Projeção isométrica congelada para o Organizar e o calor',
      re.search(r'function organize\(g,freeUnits\)\{[^}]*const L=layout\(g,', crystal) is not None and 'P.heat(refCentres' in crystal_view)
check('Representação 3D sobre as coordenadas científicas, sem WebGL no domínio',
      'function layout3D(g,fit,cam' in crystal and not re.search(r'WebGL|getContext\(.webgl|THREE\.', strip_comments(crystal_view) + crystal))

# 10. Roteiros: catálogo válido, um módulo por roteiro (a mesma regra do validador do domínio).
code, out = node('-e', "const fs=require('fs'),vm=require('vm');const S=require('./scripts/validate-scientific-state.cjs').load();"
                 "const box=vm.createContext({SILM:S,Date,JSON,Object});vm.runInContext(fs.readFileSync('domain/silm/routes.js','utf8'),box);"
                 "const r=S.routes.registry;if(!r.length||r.some(x=>typeof x.module!=='string'))process.exit(1);console.log(r.length+' roteiros')")
check('Roteiros: catálogo válido, um módulo por roteiro', code == 0, out)

# 11. Documentação obrigatória da arquitetura atual.
required = ['ROADMAP-SILM.md', 'SCIENTIFIC-STATE.md', 'ARQUITETURA-CIENTIFICA.md', 'CONTRATO-VERSIONAMENTO.md', 'ESTRUTURAS-CRISTALINAS.md',
            'CONTRATO-CRISTALOGRAFICO.md', 'COBERTURA-METAIS.md', 'MODELO-ELETRONICO.md', 'PROPRIEDADES-METALICAS.md', 'CONTRATO-PROPRIEDADES.md',
            'FONTES-E-PROVENIENCIA.md', 'MODULO-MEDIR.md', 'CONTRATO-MEDICOES.md', 'MODULO-CALCULAR.md', 'CONTRATO-CALCULOS.md',
            'CONTRATO-REPRESENTACAO-2D.md', 'CONTRATO-REPRESENTACAO-3D.md', 'RENDERER-2D.md', 'RENDERER-3D.md', 'ROTEIROS-EXPERIMENTAIS.md',
            'CONTRATO-ROTEIROS.md', 'COBERTURA-ROTEIROS.md', 'MISSOES.md', 'CONTRATO-MISSOES.md', 'APRENDER-TEMAS.md', 'CONTRATO-TEMAS.md',
            'INTEGRACAO-BASE-0.9.8.md', 'PARIDADE-BASE-SI-0.15.2.md', 'PARIDADE-SIAB-SILM.md', 'PARIDADE-MECANICA-SIAB-SILM-2026-10-29.md',
            'SILM-' + version + '.md']
absent = [p for p in required if not (root / 'docs' / p).is_file()]
check('Documentação obrigatória', not absent, absent or None)

result = {'product': 'SILM', 'version': version, 'architecture': 'Base SI ' + str(lock.get('version')) + ' + motor científico SILM',
          'checks': checks, 'passed': sum(c['status'] == 'PASS' for c in checks), 'failed': sum(c['status'] == 'FAIL' for c in checks)}
(root / 'docs/evidence/AUDITORIA-SILM.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result, ensure_ascii=False, indent=2))
raise SystemExit(bool(result['failed']))
