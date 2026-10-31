#!/usr/bin/env python3
"""Monta um registro de estrutura do banco científico do SILM a partir de um CIF local do COD.

Uso: python3 scripts/structure-from-cif.py <código COD> <símbolo> <tipo> <rótulo>   (imprime JSON)
Regras (docs/AUDITORIA-ESTRUTURAS-METAIS-0.15.1.md, critérios de homologação):
- parâmetros de rede, grupo espacial, operações de simetria e sítios são copiados do CIF, como publicados;
- temperatura numérica só quando o CIF a informa (_diffrn_ambient_temperature/_cell_measurement_temperature);
  "Sample: at room T" vira referência ambiente qualitativa; nada é extrapolado;
- pressão: convenção ambiente do SILM (valor medido não reportado), salvo valor no CIF;
- pureza e notas do título do CIF ("Sample:", "Note:") são preservadas.
"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIF = os.path.join(ROOT, 'domain/silm/data/evidence/cif')

def parse(code):
    text = open(os.path.join(CIF, code + '.cif'), encoding='utf8').read()
    def val(k):
        m = re.search(r'^' + re.escape(k) + r'\s+(.+)$', text, re.M)
        return m.group(1).strip().strip("'\"") if m else None
    title = re.search(r'^_publ_section_title\s*\n;\s*\n(.*?)\n;', text, re.M | re.S)
    title = [l.strip() for l in title.group(1).splitlines()] if title else []
    ops = []
    m = re.search(r'_space_group_symop_operation_xyz\s*\n(.*?)\n(?:loop_|_)', text, re.S) or re.search(r'_symmetry_equiv_pos_as_xyz\s*\n(.*?)\n(?:loop_|_)', text, re.S)
    if m:
        for line in m.group(1).splitlines():
            line = line.strip().strip("'")
            if line and not line.startswith('#'):
                ops.append(re.sub(r'^\d+\s+', '', line).strip("'").replace(' ', ''))
    sites = []
    m = re.search(r'loop_\s*\n((?:_atom_site_[^\n]+\n)+)(.*?)(?:\nloop_|\Z)', text, re.S)
    if m:
        heads = [h.strip() for h in m.group(1).splitlines()]
        ix, iy, iz = heads.index('_atom_site_fract_x'), heads.index('_atom_site_fract_y'), heads.index('_atom_site_fract_z')
        for row in m.group(2).splitlines():
            parts = row.split()
            if len(parts) >= len(heads):
                strip = lambda s: re.sub(r'\(\d+\)$', '', s)
                sites.append({'label': parts[0], 'x': strip(parts[ix]), 'y': strip(parts[iy]), 'z': strip(parts[iz])})
    t = val('_diffrn_ambient_temperature') or val('_cell_measurement_temperature')
    p = val('_diffrn_ambient_pressure') or val('_cell_measurement_pressure')
    return {'text': text, 'val': val, 'title': title, 'ops': ops, 'sites': sites, 'T': t, 'P': p}

def structure(code, symbol, kind, label, extra_notes=''):
    c = parse(code); v = c['val']; src = 'src-cod-' + code
    cell = lambda k: re.sub(r'\(\d+\)$', '', v(k))
    params = {}
    for key, cif, unit in [('a', '_cell_length_a', 'Å'), ('b', '_cell_length_b', 'Å'), ('c', '_cell_length_c', 'Å'), ('alpha', '_cell_angle_alpha', '°'), ('beta', '_cell_angle_beta', '°'), ('gamma', '_cell_angle_gamma', '°')]:
        raw = cell(cif)
        params[key] = {'value': float(raw) if '.' in raw else int(raw), 'unit': unit, 'kind': 'TABULATED', 'sourceId': src, 'display': raw}
    sample = next((l for l in c['title'] if l.lower().startswith('sample')), '')
    notes = [l for l in c['title'] if l.lower().startswith('note')]
    if c['T']:
        temp = {'value': float(c['T']), 'unit': 'K', 'kind': 'TABULATED', 'sourceId': src, 'display': (c['T'] + ' K').replace('.', ','), 'qualifier': 'reported'}
    elif 'room' in sample.lower():
        temp = {'value': None, 'unit': 'K', 'kind': 'TABULATED', 'sourceId': src, 'display': 'Ambiente; valor numérico não reportado', 'qualifier': 'room-temperature'}
    else:
        temp = {'value': None, 'unit': 'K', 'qualifier': 'ambient-reference', 'kind': 'QUALITATIVE', 'sourceId': 'src-silm-conventions', 'display': 'Ambiente; temperatura numérica não reportada no CIF'}
    if c['P'] and float(c['P']) > 0.2:
        raise SystemExit(code + ': pressão de ' + c['P'] + ' kPa no CIF; não é condição ambiente')
    purity = next((n for n in notes if 'pure' in n.lower()), None)
    note_text = 'A pressão ambiente é a condição de referência adotada, não uma medida de 101325 Pa. A precisão dos parâmetros é a publicada; não autoriza extrapolação térmica.'
    if not c['T']:
        note_text += ' Temperatura exata de aquisição não reportada no CIF.'
    other = [n for n in notes if n is not purity]
    if other:
        note_text += ' Observação da ficha: ' + '; '.join(other) + '.'
    if extra_notes:
        note_text += ' ' + extra_notes
    return {
        'id': symbol.lower() + '-reference', 'type': kind, 'label': label,
        'spaceGroup': v('_symmetry_space_group_name_H-M') or v('_space_group_name_H-M_alt'),
        'spaceGroupNumber': int(v('_space_group_IT_number') or v('_symmetry_Int_Tables_number')),
        'phaseLabel': 'Fase de referência', 'kind': 'TABULATED', 'evidenceType': 'experimental', 'sourceId': src,
        'conditions': {
            'temperature': temp,
            'pressure': {'value': None, 'unit': 'Pa', 'qualifier': 'ambient-reference', 'kind': 'QUALITATIVE', 'sourceId': 'src-silm-conventions', 'display': 'Ambiente (convenção; valor medido não reportado)'},
            'phase': {'value': 'solid', 'display': 'Sólida', 'kind': 'TABULATED', 'sourceId': src},
            'direction': None,
            'purity': {'description': purity or 'Pureza da amostra não explicitada na ficha cristalográfica', 'sourceId': src, 'kind': 'TABULATED'},
            'notes': note_text,
        },
        'latticeParameters': params,
        'fractionalSites': {'representation': 'asymmetric-unit', 'symmetryOperations': c['ops'],
                            'values': [{'x': s['x'], 'y': s['y'], 'z': s['z']} for s in c['sites']], 'sourceId': src, 'kind': 'TABULATED'},
        'notes': 'Parâmetros, grupo espacial, simetria e sítios copiados do CIF local (COD ' + code + '), conferidos contra o modelo cristalográfico.',
    }

if __name__ == '__main__':
    code, symbol, kind, label = sys.argv[1:5]
    print(json.dumps(structure(code, symbol, kind, label), ensure_ascii=False, indent=1))
