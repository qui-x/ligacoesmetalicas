#!/usr/bin/env node
/**
 * Auditoria SOMENTE LEITURA de estruturas CCC candidatas de Db e Sg via OPTIMADE/MPDD.
 * Nunca altera catalogo, habilitacao, propriedades, cache ou a main do SILM.
 * Node.js 22+: node scripts/audit-db-sg-mpdd.mjs
 * Endpoint alternativo: MPDD_OPTIMADE_BASE=https://... node scripts/audit-db-sg-mpdd.mjs
 */
import {pathToFileURL} from 'node:url';

const TARGETS = Object.freeze(['Db', 'Sg']);
const DEFAULT_ENDPOINT = 'https://optimade.mpdd.org';
const PROVIDER_ALTERNATE_HTTPS = 'https://mpddoptimade.phaseslab.org';
const PROVIDER_ALTERNATE_HTTP = 'http://mpddoptimade.phaseslab.org';
const MAX_PAGES = 10;

function positive(value) {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Resultado de uma pagina; um candidato NAO significa fase de equilibrio homologada. */
export function auditMPDDResponse(payload, symbol) {
  if (!TARGETS.includes(symbol)) throw new Error('Elemento fora do escopo: ' + symbol);
  if (!Array.isArray(payload?.data)) throw new Error('Resposta OPTIMADE sem data[]');
  const candidates = [];
  let otherPhasesOrUnknown = 0;
  for (const record of payload.data) {
    const a = record?.attributes ?? {};
    if (!Array.isArray(a.elements) || a.elements.length !== 1 || a.elements[0] !== symbol ||
        a.nperiodic_dimensions !== 3) continue;
    // Um elemento puro com fase diferente, ou sem grupo espacial, nao prova a CCC.
    if (positive(a._mpdd_spacegroupn) !== 229) { otherPhasesOrUnknown++; continue; }
    const findings = [];
    const nsites = positive(a.nsites);
    const atomVol = positive(a._mpdd_atomicvolume);
    const cellVol = positive(a._mpdd_volume);
    if (nsites !== null && !Number.isInteger(nsites)) findings.push('fractional-site-count');
    const fromCell = nsites && Number.isInteger(nsites) && cellVol ? cellVol / nsites : null;
    if (!atomVol && !fromCell) findings.push('missing-atomic-volume');
    if (atomVol && fromCell && Math.abs(atomVol - fromCell) / atomVol > 0.01) {
      findings.push('atomic-cell-volume-mismatch');
    }
    const validVolume = !findings.length ? (atomVol ?? fromCell) : null;
    const refData = record?.relationships?.references?.data;
    const sourceRefs = Array.isArray(refData) ?
      refData.map(r => String(r?.id ?? '')).filter(Boolean) : [];
    // MPDD e secundario; referencia listada NAO substitui tabela/método primario.
    findings.push('primary-source-unverified');
    candidates.push({
      id: String(record?.id ?? ''),
      symbol,
      spaceGroupNumber: 229,
      volumePerAtomAngstrom3: validVolume,
      derivedConventionalBCCaAngstrom: validVolume ? Math.cbrt(2 * validVolume) : null,
      nsites,
      sourceReferenceIds: sourceRefs,
      findings,
      status: validVolume ? 'candidate-requires-primary-source-check' : 'requires-additional-audit',
      homologated: false
    });
  }
  return {
    symbol,
    inspectedRecords: payload.data.length,
    otherPhasesOrUnknown,
    count: candidates.length,
    hasNextPage: Boolean(payload?.links?.next),
    candidates
  };
}

export function makeQueryURL(base, symbol) {
  if (!TARGETS.includes(symbol)) throw new Error('Elemento fora do escopo');
  const baseURL = new URL(base);
  if (!['http:', 'https:'].includes(baseURL.protocol)) throw new Error('Base OPTIMADE deve ser HTTP(S)');
  const url = new URL('/v1/structures', baseURL);
  url.searchParams.set('filter', 'elements HAS ONLY "' + symbol + '" AND nperiodic_dimensions=3');
  url.searchParams.set('page_limit', '100');
  // Apenas campos anunciados no painel publico da MPDD. _mpdd_metadata NAO e campo garantido.
  url.searchParams.set('response_fields',
    'elements,nperiodic_dimensions,nsites,_mpdd_atomicvolume,_mpdd_volume,_mpdd_spacegroupn');
  return url.toString();
}

export function safeNextPage(currentURL, next) {
  if (!next) return null;
  const url = new URL(next, currentURL);
  const current = new URL(currentURL);
  if (url.origin !== current.origin) throw new Error('Paginacao aponta para origem diferente');
  if (url.protocol !== current.protocol) throw new Error('Paginacao muda protocolo');
  if (!url.pathname.endsWith('/v1/structures')) throw new Error('Paginacao fora de /v1/structures');
  return url.toString();
}

export async function queryMPDD(base, symbol, fetchImpl=fetch) {
  let pageURL = makeQueryURL(base, symbol);
  const visited = new Set();
  const candidates = [];
  let otherPhasesOrUnknown = 0;
  let inspectedRecords = 0;
  let pageCount = 0;
  while (pageURL && pageCount < MAX_PAGES) {
    if (visited.has(pageURL)) throw new Error(symbol + ': paginacao ciclica');
    visited.add(pageURL);
    let response;
    try {
      response = await fetchImpl(pageURL, {
        signal: AbortSignal.timeout(15000),
        headers: {Accept:'application/vnd.api+json'}
      });
    } catch (error) {
      throw new Error(symbol + ': endpoint OPTIMADE indisponivel (' + error.message + ')');
    }
    if (!response.ok) throw new Error(symbol + ': API HTTP ' + response.status);
    const payload = await response.json();
    if (payload?.errors?.length) throw new Error(symbol + ': API retornou errors[]');
    const parsed = auditMPDDResponse(payload, symbol);
    candidates.push(...parsed.candidates);
    otherPhasesOrUnknown += parsed.otherPhasesOrUnknown;
    inspectedRecords += parsed.inspectedRecords;
    pageCount++;
    pageURL = safeNextPage(pageURL, payload?.links?.next);
  }
  return {
    symbol, queryBase: base, pagesRead: pageCount, inspectedRecords,
    otherPhasesOrUnknown, count: candidates.length,
    incompletePagination: Boolean(pageURL),
    candidates,
    homologated: false,
    warning:'Dados secundarios candidatos, sem homologacao: confrontar DOI, tabela, fase, funcional, relatividade e unidades.'
  };
}

/**
 * Testa endpoints documentados do MESMO provedor (nao mistura banco MPDD com MPDS).
 * Um endereco HTTP pode ser consultado SOMENTE se o operador o permitir
 * explicitamente; retorno nao criptografado jamais tem status de homologacao.
 * Falha em todos os endpoints => resultado indeterminado, nunca contagem zero.
 */
export function knownMPDDEndpoints(overrides={}) {
  if (overrides.base) return [overrides.base];
  const bases=[DEFAULT_ENDPOINT,PROVIDER_ALTERNATE_HTTPS];
  if (overrides.allowHTTP === true) bases.push(PROVIDER_ALTERNATE_HTTP);
  return bases;
}

export async function auditAcrossEndpoints(symbol, options={}) {
  const endpoints=options.endpoints ?? knownMPDDEndpoints({base:options.base,allowHTTP:options.allowHTTP});
  if (!Array.isArray(endpoints) || !endpoints.length) throw new Error('Nenhum endpoint configurado');
  const attempts=[];
  for (const base of endpoints) {
    try {
      const result=await queryMPDD(base,symbol,options.fetchImpl ?? fetch);
      attempts.push({base,outcome:'queried',pagesRead:result.pagesRead,
        count:result.count,incompletePagination:result.incompletePagination});
      return {
        ...result,
        attempts,
        sourceTransport:base.startsWith('https:')?'https':'http-unverified',
        homologated:false
      };
    } catch (error) {
      attempts.push({base,outcome:'unavailable',message:error.message});
    }
  }
  return {
    symbol,
    outcome:'indeterminate-all-endpoints-failed',
    attempts,
    count:null,
    candidates:[],
    homologated:false,
    warning:'Falha dos endpoints nao significa que nao haja estrutura.'
  };
}

async function main() {
  const endpoints=knownMPDDEndpoints({
    base:process.env.MPDD_OPTIMADE_BASE,
    allowHTTP:process.env.MPDD_ALLOW_INSECURE_HTTP==='1'
  });
  let failures=0;
  for (const symbol of TARGETS) {
    const result=await auditAcrossEndpoints(symbol,{endpoints});
    console.log(JSON.stringify({
      provider:'MPDD/OPTIMADE',
      retrievedAt:new Date().toISOString(),
      ...result
    },null,2));
    if (result.outcome==='indeterminate-all-endpoints-failed') failures++;
  }
  if (failures) process.exitCode=1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(e => {console.error(e); process.exitCode=1;});
}
