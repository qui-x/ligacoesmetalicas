import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const ctx=vm.createContext({console,structuredClone});ctx.window=ctx;
for(const name of ['data/bundle','data-api','crystal','ready-assemblies','lattice-navigation']){
 vm.runInContext(readFileSync(new URL('../domain/silm/'+name+'.js',import.meta.url),'utf8'),ctx);
}
const S=ctx.SILM,refs=S.readyAssemblies.list();
test('há uma referência válida por tipo de estrutura elegível',()=>{
 const types=new Set(S.data.elements.filter(e=>e.silmEligibility.status==='available').map(e=>S.crystal.eligibility(e)).filter(e=>e.status==='available').map(e=>e.structureType));
 assert.equal(refs.length,types.size);
 for(const ref of refs){assert.ok(ref.available,ref.title);assert.ok(types.delete(ref.expectedType));assert.ok(ref.sourceTitle);}
 assert.equal(types.size,0);
});
for(const ref of refs)test(ref.title+' — distância, vizinho, retorno e limite do recorte',()=>{
 const g=S.crystal.geometry(ref.element),cursor=S.createLatticeCursor(g),initial=cursor.site;
 const neighbor=cursor.shell.list.findIndex(n=>cursor.has(n.key));
 assert.notEqual(neighbor,-1);
 const distance=cursor.shell.distances[neighbor];
 assert.ok(cursor.select(cursor.shell.list[neighbor].key));
 assert.ok(Math.abs(Math.hypot(...initial.cart.map((x,i)=>x-cursor.site.cart[i]))-distance)<1e-9);
 assert.ok(cursor.select(initial.key));
 assert.equal(cursor.select('fora-do-recorte'),false);
 assert.equal(cursor.site.key,initial.key);
});

for(const ref of refs)test(ref.title+' — célula, arestas e vizinhança percorrem a mesma rede',()=>{
 const g=S.crystal.geometry(ref.element),c=S.createLatticeCursor(g),origin=c.site;
 const close=(a,b)=>a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<1e-8));
 for(const axis of [0,1,2]){
  const next=c.translate(axis,1);assert.ok(next);assert.ok(c.select(next.key,c.anchor));
  const cellBefore=g.cell.map(s=>s.key);
  for(const site of g.cell){
   const moved=c.displaySite(site);
   assert.equal(moved.basis,site.basis);
   close(moved.cart,c.displayCart(site.cart));
   close(moved.cart,site.cart.map((x,i)=>x+g.vectors[axis][i]));
  }
  for(const edge of g.edges())for(const v of edge)close(c.displayCart(v),v.map((x,i)=>x+g.vectors[axis][i]));
  const near=g.neighbors(origin).list.map(s=>c.displaySite(s).key).sort();
  assert.deepEqual([...c.shell.list].map(s=>s.key).sort(),Array.from(near));
  const inside=g.cell.find(s=>s.basis!==origin.basis)||g.cell.at(-1),key=c.displaySite(inside).key;
  assert.ok(c.select(key,inside));assert.equal(c.displaySite(inside).key,key);
  assert.deepEqual([...c.offset],[0,1,2].map(i=>+(i===axis)));
  assert.deepEqual(g.cell.map(s=>s.key),cellBefore);
  assert.ok(c.select(origin.key,origin));assert.deepEqual([...c.offset],[0,0,0]);
 }
});
