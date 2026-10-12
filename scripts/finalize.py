"""Fechamento da versão (ordem fixa, para que relatório, auditoria e entrega concordem):
relatório → auditoria → relatório → entrega (SHA512SUMS + ZIP + SHA-512 externo) → auditoria → conferências.
Uso: python3 -I scripts/finalize.py  (depois de npm run build e node tests/browser.cjs)"""
import hashlib,json,pathlib,subprocess,sys,zipfile
root=pathlib.Path(__file__).resolve().parent.parent
version=(root/'VERSION').read_text().strip()
def run(*cmd,check=True):
    r=subprocess.run(cmd,cwd=root,capture_output=True,text=True)
    if check and r.returncode: sys.exit(f'falhou: {" ".join(cmd)}\n{r.stdout[-2000:]}\n{r.stderr[-2000:]}')
    return r
run('node','scripts/build-test-report.cjs')
run('python3','scripts/audit-silm.py',check=False)
run('node','scripts/build-test-report.cjs')
run('python3','-I','scripts/release.py')
run('python3','scripts/audit-silm.py',check=False)
audit=json.loads((root/'docs/evidence/AUDITORIA-SILM.json').read_text())
browser=json.loads((root/f'docs/evidence-{version}/RESULTADOS-NAVEGADOR-{version}.json').read_text())
z=root/f'entregas/SILM-{version}.zip'
digest=hashlib.sha512(z.read_bytes()).hexdigest();external=(root/f'entregas/SILM-{version}.zip.sha512').read_text().split()[0]
with zipfile.ZipFile(z) as f:inner=json.loads(f.read('SILM/docs/evidence/AUDITORIA-SILM.json'))
bad=[l for l in (root/'SHA512SUMS.txt').read_text().splitlines() if l.strip() and hashlib.sha512((root/l.split('  ',1)[1]).read_bytes()).hexdigest()!=l.split('  ',1)[0]]
ok=audit['failed']==0 and browser['failed']==0 and digest==external and inner==audit and not bad
print(json.dumps({'version':version,'audit':f"{audit['passed']}/{audit['passed']+audit['failed']}",'browser':f"{browser['passed']}/{browser['passed']+browser['failed']}",'sha512':digest,'zipAuditMatches':inner==audit,'sha512sums':'ok' if not bad else bad[:5],'ok':ok},ensure_ascii=False,indent=1))
sys.exit(0 if ok else 1)
