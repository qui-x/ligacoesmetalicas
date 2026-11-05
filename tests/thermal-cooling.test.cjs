'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'domain', 'silm', 'thermal.js'), 'utf8');
const window = {SILM:{}};
vm.runInNewContext(source, {
  window,
  SILM: window.SILM,
  console,
  Float64Array,
  Map,
  Set,
  WeakMap,
  Math,
  Object,
  Array,
  Number,
  queueMicrotask
});
const thermal = window.SILM.thermal;

test('temperatura uniforme diminui quando não há fonte ativa', () => {
  const before = Float64Array.from([0.8, 0.8, 0.8]);
  const after = thermal.step(before, [[], [], []], new Set(), 1);
  for (const value of after) {
    assert.ok(value < 0.8, 'cada centro deve perder calor para o ambiente');
    assert.ok(value >= thermal.AMBIENT);
  }
});

test('calor se difunde entre vizinhos enquanto há perda para o ambiente', () => {
  const before = Float64Array.from([1, 0]);
  const after = thermal.step(before, [[1], [0]], new Set());
  assert.ok(after[0] < 1, 'o centro quente começa a esfriar');
  assert.ok(after[1] > 0, 'o vizinho recebe calor');
  assert.ok(after[0] + after[1] < before[0] + before[1], 'a troca com o ambiente reduz a energia normalizada total');
});

test('centro sob a fonte permanece em T=1 enquanto a fonte está ligada', () => {
  const before = Float64Array.from([0, 0]);
  const after = thermal.step(before, [[1], [0]], new Set([0]));
  assert.equal(after[0], 1);
});

test('temperatura retorna para próximo do ambiente após fonte desligada', () => {
  let values = Float64Array.from([1, 1, 1, 1]);
  const edges = [[1], [0, 2], [1, 3], [2]];
  const steps = Math.ceil(30 / thermal.DT);
  for (let i = 0; i < steps; i++) values = thermal.step(values, edges, new Set());
  assert.ok(thermal.maximum(values) < thermal.SETTLE, 'após 30 s didáticos, o grafo deve estar próximo da temperatura ambiente');
});
