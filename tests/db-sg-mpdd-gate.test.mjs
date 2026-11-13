import test from 'node:test';
import assert from 'node:assert/strict';
import {auditMPDDResponse, makeQueryURL} from '../scripts/audit-db-sg-mpdd.mjs';

const record = (symbol, overrides={}) => ({
  id: 'mpdd-test-'+symbol,
  attributes: {
    elements:[symbol], nperiodic_dimensions:3, nsites:2,
    _mpdd_spacegroupn:229, _mpdd_atomicvolume:27,
    _mpdd_volume:54,
    _mpdd_metadata:{source:'fixture; provenance must be verified'},
    ...overrides
  }
});

test('Db CCC: 27 A^3 por atomo gera a=(2V)^(1/3), mas NAO homologa', () => {
  const result=auditMPDDResponse({data:[record('Db')],links:{}},'Db');
  assert.equal(result.count,1);
  assert.ok(Math.abs(result.candidates[0].derivedConventionalBCCaAngstrom-Math.cbrt(54))<1e-12);
  assert.equal(result.candidates[0].status,'candidate-requires-primary-source-check');
  assert.equal(result.candidates[0].homologated,false);
});

test('inconsistencia de volumes, ausencia de dados e metadados nao geram a ficticio', () => {
  const mismatch=auditMPDDResponse({data:[record('Sg',{_mpdd_volume:108})]},'Sg').candidates[0];
  assert.equal(mismatch.derivedConventionalBCCaAngstrom,null);
  assert.ok(mismatch.findings.includes('atomic-cell-volume-mismatch'));
  const empty=auditMPDDResponse({data:[record('Sg',{_mpdd_atomicvolume:null,_mpdd_volume:null,_mpdd_metadata:null})]},'Sg').candidates[0];
  assert.equal(empty.derivedConventionalBCCaAngstrom,null);
  assert.ok(empty.findings.includes('missing-atomic-volume'));
  assert.ok(empty.findings.includes('missing-source-metadata'));
  assert.equal(empty.homologated,false);
});

test('excluir outros elementos, compostos, estruturas nao CCC e objetos nao periodicos',()=>{
  const data=[record('Db'),record('Db',{elements:['Db','O']}),record('Db',{_mpdd_spacegroupn:194}),record('Db',{nperiodic_dimensions:0}),record('Sg')];
  const out=auditMPDDResponse({data},'Db');
  assert.equal(out.count,1);
  assert.equal(out.candidates[0].symbol,'Db');
});

test('consulta tem filtro mono-elementar e paginacao explicitamente identificada',()=>{
  const url=new URL(makeQueryURL('https://optimade.mpdd.org','Sg'));
  assert.match(url.searchParams.get('filter'),/elements HAS ONLY "Sg"/);
  const out=auditMPDDResponse({data:[],links:{next:'https://example.org/p2'}},'Sg');
  assert.equal(out.hasNextPage,true);
  assert.throws(()=>auditMPDDResponse({data:null},'Sg'));
});
