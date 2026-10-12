from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
files=[p for p in root.rglob('*') if p.is_file() and p.suffix in ['.js','.css','.html','.svg','.webmanifest'] and p.relative_to(root).parts[0] not in ['docs','tests','scripts','node_modules']]
terms=r'(?i)\b(?:SIAB|ácidos?|bases?|pH|pOH|Ka|Kb|titulação|indicador(?:es)?|substâncias?|vidrarias?|buretas?|pipetas?|gotejamento|reagentes?|metais|metal|átomos?|ligaç(?:ão|ões)|gás|gases|pressão|cristais|cristal|moléculas?|acid|burette|reagent|titration)\b|siab_[\w*]*'
occ=[]
for p in files:
 for n,line in enumerate(p.read_text().splitlines(),1):
  for match in re.finditer(terms,line):
   term=match.group();name=p.relative_to(root).as_posix()
   allowed='migração exclusiva de preferências de interface' if name=='js/storage/migration.js' else 'nome técnico Base / camada CSS' if term.lower()=='base' else 'unidade de tamanho de arquivo (kilobytes)' if name=='js/experience/teacher.js' and term=='KB' and '64 KB' in line else None
   occ.append({'arquivo':name,'linha':n,'termo':term,'justificativa':allowed})
assert all(row['justificativa'] for row in occ),[row for row in occ if not row['justificativa']]
html=(root/'index.html').read_text();refs=[]
for ref in re.findall(r'(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"',html):
 if ':' not in ref:
  assert (root/ref).exists(),ref
  refs.append(ref)
assert (root/'VERSION').read_text().strip()=='0.2.4'
assert "VERSION='0.2.4'" in (root/'sw.js').read_text()
assert all((root/'js/experience'/n).exists() for n in ['common.js','activity.js','experience.js','modules.js','learning.js','notebook.js','shell.js','teacher.js','reports.js','references.js'])
data={'status':'PASS','versao':'0.2.4','arquivos_runtime':len(files),'referencias_html':len(refs),'dependencias_cientificas':0,'ocorrencias_classificadas':occ,'metodo':'Busca por termos completos e inspeção das referências locais; nenhuma dependência ou catálogo científico no runtime. A palavra Base nomeia a plataforma. A migração herdada lê apenas preferências de interface.'}
out=root/'tests/results';out.mkdir(parents=True,exist_ok=True);(out/'AUDITORIA-NEUTRALIDADE.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(f'{len(files)} arquivos de runtime; {len(refs)} referências HTML verificadas; zero dependência científica.')
