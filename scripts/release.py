"""Congela a versão atual: regenera SHA512SUMS.txt, gera entregas/SILM-<versão>.zip (pasta raiz SILM/)
e grava o SHA-512 externo em entregas/SILM-<versão>.zip.sha512. Sem rede."""
from pathlib import Path
import hashlib, zipfile
root = Path(__file__).resolve().parents[1]
version = (root / 'VERSION').read_text().strip()
skip = ('.git/', 'node_modules/', 'entregas/', 'base-estrutural/')   # a Base Estrutural é um produto próprio, com pacote próprio
def files():
    return sorted(p for p in root.rglob('*') if p.is_file() and not str(p.relative_to(root)).startswith(skip))
listed = [p for p in files() if p.name != 'SHA512SUMS.txt' or p.parent != root]
with open(root / 'SHA512SUMS.txt', 'w', encoding='utf8') as out:
    for p in listed:
        out.write(hashlib.sha512(p.read_bytes()).hexdigest() + '  ' + str(p.relative_to(root)) + '\n')
(root / 'entregas').mkdir(exist_ok=True)
target = root / 'entregas' / f'SILM-{version}.zip'
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in files():
        z.write(p, 'SILM/' + str(p.relative_to(root)))
digest = hashlib.sha512(target.read_bytes()).hexdigest()
(root / 'entregas' / f'SILM-{version}.zip.sha512').write_text(f'{digest}  SILM-{version}.zip\n')
with zipfile.ZipFile(target) as z:
    assert z.testzip() is None
    count = len(z.namelist())
print(f'SILM {version}: {count} arquivos · {target.stat().st_size // 1024} KiB')
print(digest)
