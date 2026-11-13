#!/usr/bin/env node
/**
 * Auditoria SOMENTE LEITURA de celulas CCC candidatas (Db, Sg) no MPDD/OPTIMADE.
 * Nao altera catalogo, habilitacao, dados fisicos, cache ou main do SILM.
 * Requer Node.js 22+. Uso: node scripts/audit-db-sg-mpdd.mjs
 * Opcional: MPDD_OPTIMADE_BASE=https://... node scripts/audit-db-sg-mpdd.mjs
 */
import {pathToFileURL} from 'node:url';

const targets = Object.freeze(['Db', 'Sg']);
const defaultEndpoint = 'https://optimade.mpdd.org';

/** Coercao estrita: null, vazio, infinito e valores nao positivos nao sao numero. */
function positive(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * O MPDD e fonte secundaria de estruturas. Uma linha com volume, por si so,
 * NAO constitui homologacao da fonte primaria, metodo ou fase de equilibrio.
 */
export function auditMPDDResponse(payload, symbol) {
  if (!targets.includes(symbol)) throw new Error('Elemento fora do escopo: ' + symbol);
  if (!Array.isArray(payload?.data)) throw new Error('Resposta OPTIMADE sem data[]');
  const candidates = [];
  for (const record of payload.data) {
    const a = record?.attributes ?? {};
    if (!Array.isArray(a.elements) || a.elements.length !== 1 || a.elements[0] !== symbol) continue;
    if (a.nperiodic_dimensions !== 3 || Number(a._mpdd_spacegroupn) !== 229) continue;
    const reasons = [];
    const nsites = positive(a.nsites);
    const vAtom = positive(a._mpdd_atomicvolume);
    const vCell = positive(a._mpdd_volume);
    const fromCell = nsites && vCell ? vCell / nsites : null;
    if (!vAtom && !fromCell) reasons.push('missing-atomic-volume');
    if (vAtom && fromCell && Math.abs(vAtom - fromCell) / vAtom > 0.01) {
      reasons.push('atomic-cell-volume-mismatch');
    }
    if (nsites && !Number.isInteger(nsites)) reasons.push('fractional-site-count');
    const chosen = reasons.length ? null : (vAtom ?? fromCell);
    const aBCC = chosen ? Math.cbrt(2 * chosen) : null;
    const meta = a._mpdd_metadata;
    const metadataPresent = meta !== null && meta !== undefined &&
      (typeof meta !== 'object' || Object.keys(meta).length > 0);
    if (!metadataPresent) reasons.push('missing-source-metadata');
    candidates.push({
      id: String(record?.id ?? ''),
      symbol,
      spaceGroupNumber: 229,
      volumePerAtomAngstrom3: chosen,
      derivedConventionalBCCaAngstrom: aBCC,
      nsites: nsites,
      metadataPresent,
      findings: reasons,
      status: reasons.length ? 'requires-additional-audit' : 'candidate-requires-primary-source-check',
      homologated: false
    });
  }
  return {
    symbol,
    count: candidates.length,
    hasNextPage: Boolean(payload?.links?.next),
    candidates
  };
}

export function makeQueryURL(base, symbol) {
  if (!targets.includes(symbol)) throw new Error('Elemento fora do escopo');
  const url = new URL('/v1/structures', base);
  url.searchParams.set('filter', 'elements HAS ONLY "' + symbol + '" AND nperiodic_dimensions=3');
  url.searchParams.set('page_limit', '100');
  url.searchParams.set('response_fields',
    'elements,nperiodic_dimensions,nsites,_mpdd_atomicvolume,_mpdd_volume,_mpdd_spacegroupn,_mpdd_metadata');
  return url.toString();
}

async function main() {
  const base = process.env.MPDD_OPTIMADE_BASE || defaultEndpoint;
  for (const symbol of targets) {
    const url = makeQueryURL(base, symbol);
    let response;
    try {
      response = await fetch(url, {
        signal: AbortSignal.timeout(15000),
        headers: {Accept: 'application/vnd.api+json'}
      });
    } catch (error) {
      throw new Error(symbol + ': endpoint MPDD indisponivel (' + error.message + ')');
    }
    if (!response.ok) throw new Error(symbol + ': HTTP ' + response.status + ' do MPDD');
    const data = await response.json();
    const audit = auditMPDDResponse(data, symbol);
    console.log(JSON.stringify({
      provider: 'MPDD/OPTIMADE',
      retrievedAt: new Date().toISOString(),
      queryURL: url,
      ...audit,
      warning: 'Valores candidatos, NAO homologados: verificar fonte primaria, funcional, relatividade, fase e unidades.'
    }, null, 2));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
