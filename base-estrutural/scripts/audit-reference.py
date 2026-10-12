"""Audita a identificação documental atual; preserva a proveniência histórica."""
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parents[1]
expected = 'ff81556ce175bbc6e527eb922a193599b31d127ee07a0cb43a80639e45570c20a75e5660a876f29fbdb435dc636b0556e527d8d1b394739a3cf9fe1b583983b3'
info = json.loads((root / 'BUILD-INFO.json').read_text())
assert info['versao'] == '0.2.4'
assert info['referencia_comportamental'] == 'SIAB(9).zip'
assert info['referencia_siab']['arquivo'] == 'SIAB(9).zip'
assert info['referencia_siab']['sha512'] == expected
current, historical = [], []
for path in root.rglob('*'):
    rel = path.relative_to(root)
    if not path.is_file() or {'node_modules', '__pycache__', '.git'}.intersection(rel.parts):
        continue
    if rel.as_posix().startswith('tests/results/') or path.suffix not in {'.md', '.json', '.js', '.cjs', '.py', '.txt', '.html', '.webmanifest', '.yml'}:
        continue
    history = any(part.endswith('-historico') or part.startswith('origem-0.') for part in rel.parts) or rel.as_posix().startswith('docs/0.2.0/')
    for number, line in enumerate(path.read_text().splitlines(), 1):
        if re.search(r'SIAB\((?:3|4)\)', line):
            (historical if history else current).append({'path': rel.as_posix(), 'line': number})
assert not current, current
result = {'status': 'PASS', 'version': '0.2.4', 'reference': 'SIAB(9).zip', 'sha512': expected, 'incorrect_current_occurrences': current, 'historical_occurrences': historical, 'historical_policy': 'Registros anteriores preservados como histórico; nenhuma ocorrência antiga identifica a referência comportamental atual.'}
out = root / 'tests/results'
out.mkdir(parents=True, exist_ok=True)
(out / 'AUDITORIA-REFERENCIA.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print('SIAB(9).zip; hash preservado; zero identificação incorreta nos arquivos atuais.')
