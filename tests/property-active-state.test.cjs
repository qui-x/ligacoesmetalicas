'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const experienceSource = fs.readFileSync(
  path.join(__dirname, '..', 'integracao', 'metallic-experience.js'),
  'utf8'
);
const start = experienceSource.indexOf(' function propertyState(id){');
const end = experienceSource.indexOf('\n function toggleElectrons(){', start);
assert.ok(start >= 0 && end > start, 'o helper propertyState deve existir no motor de experiência');
const helperSource = experienceSource.slice(start, end);

const sandbox = {
  currentCoupling: () => null,
  model: { state: { properties: { active: null } } },
  drive: () => ({ reading: () => ({ deformField: false }) }),
  thermal: () => ({ reading: () => ({ on: false }) })
};
vm.runInNewContext(helperSource + '\nglobalThis.propertyState = propertyState;', sandbox);

function readState(id, primary, { deformField = false, heating = false } = {}) {
  sandbox.model.state = { properties: { active: primary } };
  sandbox.drive = () => ({ reading: () => ({ deformField }) });
  sandbox.thermal = () => ({ reading: () => ({ on: heating }) });
  return vm.runInContext('propertyState(' + JSON.stringify(id) + ')', sandbox);
}

test('E + T mantém os dois ícones ativos somente enquanto o calor complementar está ligado', () => {
  assert.deepEqual(
    { ...readState('electrical', 'electrical', { heating: true }) },
    { active: true, combined: false }
  );
  assert.deepEqual(
    { ...readState('thermal', 'electrical', { heating: true }) },
    { active: true, combined: true }
  );
  assert.deepEqual(
    { ...readState('thermal', 'electrical', { heating: false }) },
    { active: false, combined: false }
  );
});

test('E + maleabilidade reconhece o campo transitório como propriedade complementar', () => {
  assert.deepEqual(
    { ...readState('malleability', 'malleability', { deformField: true }) },
    { active: true, combined: false }
  );
  assert.deepEqual(
    { ...readState('electrical', 'malleability', { deformField: true }) },
    { active: true, combined: true }
  );
  assert.deepEqual(
    { ...readState('electrical', 'malleability', { deformField: false }) },
    { active: false, combined: false }
  );
});

test('E + ductilidade reconhece o mesmo controlador sem ativar propriedades alheias', () => {
  assert.deepEqual(
    { ...readState('electrical', 'ductility', { deformField: true }) },
    { active: true, combined: true }
  );
  assert.deepEqual(
    { ...readState('thermal', 'ductility', { deformField: true, heating: true }) },
    { active: false, combined: false }
  );
});

test('a interface aplica aria-pressed aos dois estados e distingue a propriedade complementar', () => {
  const workspace = fs.readFileSync(
    path.join(__dirname, '..', 'integracao', 'workspace-family.js'),
    'utf8'
  );
  const styles = fs.readFileSync(
    path.join(__dirname, '..', 'integracao', 'workspace-family.css'),
    'utf8'
  );
  assert.match(workspace, /button\.setAttribute\('aria-pressed',String\(chosen\|\|active\)\)/);
  assert.match(workspace, /button\.dataset\.combinedActive=String\(combined\)/);
  assert.match(styles, /\.silm-observer-action\[data-combined-active=true\]/);
});
