import test from 'node:test';
import assert from 'node:assert/strict';
import {auditMPDDResponse,makeQueryURL,safeNextPage,queryMPDD} from '../scripts/audit-db-sg-mpdd.mjs';

const record=(symbol,overrides={})=>({
  id:'fixture-'+symbol,
  attributes:{
    elements:[symbol],nperiodic_dimensions:3,nsites:2,
    _mpdd_spacegroupn:229,_mpdd_atomicvolume:27,_mpdd_volume:54,
    ...overrides
  }
});

test('volume atomico de CCC corresponde ao parametro convencional, mas nao homologa',()=>{
  const c=auditMPDDResponse({data:[record('Db')]},'Db').candidates[0];
  assert.ok(Math.abs(c.derivedConventionalBCCaAngstrom-Math.cbrt(54))<1e-12);
  assert.equal(c.homologated,false);
  assert.equal(c.status,'candidate-requires-primary-source-check');
  assert.ok(c.findings.includes('primary-source-unverified'));
});

test('sem metadados da API: nao supor proveniencia nem inventar celula',()=>{
  const missing=auditMPDDResponse({data:[record('Sg',{_mpdd_atomicvolume:null,_mpdd_volume:null})]},'Sg').candidates[0];
  assert.equal(missing.derivedConventionalBCCaAngstrom,null);
  assert.ok(missing.findings.includes('missing-atomic-volume'));
  assert.equal(missing.homologated,false);
});

test('volumes contraditorios nao geram parametro de rede',()=>{
  const c=auditMPDDResponse({data:[record('Sg',{_mpdd_volume:108})]},'Sg').candidates[0];
  assert.equal(c.derivedConventionalBCCaAngstrom,null);
  assert.ok(c.findings.includes('atomic-cell-volume-mismatch'));
});

test('volume da celula e numero de sitios podem fornecer volume atomico',()=>{
  const c=auditMPDDResponse({data:[record('Db',{_mpdd_atomicvolume:null})]},'Db').candidates[0];
  assert.equal(c.volumePerAtomAngstrom3,27);
  assert.equal(c.homologated,false);
});

test('nao usar dados de elementos mistos, outra fase, outros elementos e nao periodicos',()=>{
  const records=[record('Db'),record('Db',{elements:['Db','O']}),
    record('Db',{_mpdd_spacegroupn:194}),record('Db',{nperiodic_dimensions:0}),record('Sg')];
  const result=auditMPDDResponse({data:records},'Db');
  assert.equal(result.count,1);
  assert.equal(result.otherPhasesOrUnknown,1);
});

test('enviar apenas campos OPTIMADE publicados, sem metadado inventado',()=>{
  const url=new URL(makeQueryURL('https://optimade.mpdd.org','Sg'));
  assert.match(url.searchParams.get('filter'),/elements HAS ONLY "Sg"/);
  assert.ok(!url.searchParams.get('response_fields').includes('_mpdd_metadata'));
  assert.throws(()=>auditMPDDResponse({data:null},'Sg'));
});

test('paginacao so segue rota da mesma origem e protocolo',()=>{
  const current='https://optimade.mpdd.org/v1/structures?page_limit=100';
  assert.equal(safeNextPage(current,null),null);
  assert.equal(new URL(safeNextPage(current,'?page_offset=100')).searchParams.get('page_offset'),'100');
  assert.throws(()=>safeNextPage(current,'https://other.org/v1/structures'));
  assert.throws(()=>safeNextPage(current,'https://optimade.mpdd.org/admin'));
});

test('consulta percorre paginas de mesmo provedor sem assumir completude do primeiro lote',async()=>{
  let calls=0;
  const request=async url=>{
    calls++;
    const page=calls===1?{data:[record('Db')],links:{next:'?page_offset=100'}} :
      {data:[record('Db',{_mpdd_atomicvolume:32,_mpdd_volume:64})],links:{next:null}};
    assert.ok(url.includes('/v1/structures'));
    return {ok:true,json:async()=>page};
  };
  const out=await queryMPDD('https://optimade.mpdd.org','Db',request);
  assert.equal(calls,2);
  assert.equal(out.count,2);
  assert.equal(out.incompletePagination,false);
  assert.equal(out.homologated,false);
});

test('erro remoto e indeterminado, nao ausencia de fase',async()=>{
  await assert.rejects(queryMPDD('https://optimade.mpdd.org','Db',
    async()=>({ok:false,status:503})),/API HTTP 503/);
});
