import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

const source = await readFile(new URL('../domain/silm/multiphysics/orchestrator.js', import.meta.url), 'utf8');
function loadApi() {
  const sandbox = { AbortController, console, setTimeout, clearTimeout };
  vm.runInNewContext(source, sandbox, { filename: 'orchestrator.js' });
  return sandbox.SILM;
}

function fixture(overrides = {}) {
  return {
    schemaId: 'silm.multiphysics.experiment-definition',
    schemaVersion: '1.0.0',
    id: 'exp-a21-prototype-0001',
    revision: 1,
    createdAt: '2026-11-04T12:00:00.000Z',
    updatedAt: '2026-11-04T12:00:00.000Z',
    evidenceMode: 'parameterized',
    sample: { geometry: { geometryId: 'geo-prism-demo-0001', geometryRevision: 1, geometrySchemaVersion: '1.0.0' } },
    domains: { electrical: {}, thermal: {}, mechanical: {}, optical: {} },
    couplings: [],
    timeControl: { regime: 'transient', initialTimeS: 0, finalTimeS: 1, initialStepS: 0.5, minimumStepS: 0.01, maximumStepS: 0.5 },
    solver: { couplingStrategy: 'staggered', relativeTolerance: 1e-5 },
    datasetRefs: [],
    ...overrides
  };
}

function makeSolver(domain, { fail = false, waitForAbort = false } = {}) {
  return {
    version: 'mock-0.1.0',
    initialize: () => ({ count: 0 }),
    async solveStep(context) {
      if (waitForAbort) {
        await new Promise((resolve, reject) => {
          context.signal.addEventListener('abort', () => {
            const error = new Error('cancelled by test');
            error.name = 'AbortError';
            reject(error);
          }, { once: true });
        });
      }
      if (fail) return { ok: false, reason: 'MOCK_DOMAIN_FAILURE' };
      const fieldId = `field-${domain}-${context.stepAttemptId.slice(-12)}`;
      const data = Uint8Array.of(domain.length, context.previousState.count + 1);
      const digest = await webcrypto.subtle.digest('SHA-256', data);
      const checksum = [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
      return {
        ok: true,
        converged: true,
        state: { count: context.previousState.count + 1 },
        residual: 0,
        geometryRevision: context.geometry.revision,
        fields: [{
          fieldId, domain, name: `mock.${domain}.field`, meshId: `mesh-${domain}-prototype`,
          unit: '1', timeS: context.coordinate.timeS,
          geometryRevision: context.geometry.revision, storageRef: `mock/${fieldId}`,
          checksum, valueType: 'float64', shape: [1]
        }],
        fieldBlocks: [{ fieldId, data }],
        observables: [{ id: `obs-${domain}-mock`, domain, quantity: 'mock-state', value: context.previousState.count + 1, unit: '1', sourceFieldIds: [fieldId] }],
        balances: []
      };
    },
    restore: state => state
  };
}

function setup({ solverOptions = {}, gate, store } = {}) {
  const SILM = loadApi();
  const memory = store || SILM.multiphysicsOrchestratorPrototype.createMemoryTransactionalStore();
  let id = 0;
  const observedEvents = [];
  const orchestrator = SILM.createMultiphysicsOrchestrator({
    store: memory,
    solvers: {
      electrical: makeSolver('electrical'), thermal: makeSolver('thermal', solverOptions.thermal),
      mechanical: makeSolver('mechanical', solverOptions.mechanical), optical: makeSolver('optical', solverOptions.optical)
    },
    validateDefinition: async definition => ({ ok: !!definition.id && definition.schemaVersion === '1.0.0' }),
    resolveGeometry: async reference => ({ ok: true, geometryId: reference.geometryId, revision: reference.geometryRevision }),
    validateCandidate: gate || (async ({ candidate }) => ({
      ok: Object.values(candidate.domainResults).every(result => result.converged === true && Number.isFinite(result.residual)) &&
        candidate.fields.length === 4 && candidate.fields.every(field => field.geometryRevision === candidate.geometryRevision),
      reason: 'MOCK_GATE_FAILED'
    })),
    validateCheckpoint: async ({ checkpoint }) => ({ ok: !!checkpoint && Array.isArray(checkpoint.runtime.fields) }),
    resolveTolerances: async ({ definition }) => ({ ok: true, relativeTolerance: definition.solver.relativeTolerance }),
    idFactory: prefix => `${prefix}-${String(++id).padStart(14, '0')}`,
    clock: () => '2026-11-04T12:00:00.000Z',
    onEvent: item => observedEvents.push(item)
  });
  return { SILM, memory, orchestrator, observedEvents };
}

async function preparedRun(context) {
  const prepared = await context.orchestrator.prepare(fixture());
  assert.equal(prepared.ok, true);
  return prepared.runId;
}

test('prepare → start → dois passos: somente snapshots confirmados avançam o runtime', async () => {
  const ctx = setup();
  const runId = await preparedRun(ctx);
  assert.equal((await ctx.orchestrator.getRuntime(runId)).status, 'prepared');
  assert.equal((await ctx.orchestrator.start(runId)).ok, true);
  const first = await ctx.orchestrator.executeStep(runId);
  assert.equal(first.ok, true);
  assert.equal(first.runtime.acceptedStep, 1);
  assert.equal(first.runtime.status, 'running');
  const second = await ctx.orchestrator.executeStep(runId);
  assert.equal(second.ok, true);
  assert.equal(second.runtime.acceptedStep, 2);
  assert.equal(second.runtime.status, 'converged');
  const persisted = await ctx.memory.readRun(runId);
  assert.equal(persisted.snapshots.length, 2);
  assert.equal(persisted.runtime.lastAcceptedSnapshotId, second.snapshot.snapshotId);
  assert.equal(persisted.fields.length, 8);
});

test('falha em um dos quatro domínios rejeita o candidato inteiro e preserva o último estado aceito', async () => {
  const ctx = setup({ solverOptions: { thermal: { fail: true } } });
  const runId = await preparedRun(ctx);
  await ctx.orchestrator.start(runId);
  const result = await ctx.orchestrator.executeStep(runId);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'SOLVER_FAILED');
  const persisted = await ctx.memory.readRun(runId);
  assert.equal(persisted.runtime.status, 'rejected');
  assert.equal(persisted.runtime.acceptedStep, 0);
  assert.equal(persisted.snapshots.length, 0);
  assert.equal(persisted.fields.length, 0);
});

test('cancelamento no domínio óptico descarta o candidato já calculado por E, T e M', async () => {
  const ctx = setup({ solverOptions: { optical: { waitForAbort: true } } });
  const runId = await preparedRun(ctx);
  await ctx.orchestrator.start(runId);
  const inFlight = ctx.orchestrator.executeStep(runId);
  await new Promise(resolve => setTimeout(resolve, 0));
  const cancelled = await ctx.orchestrator.cancel(runId, 'TEST_CANCEL');
  const outcome = await inFlight;
  assert.equal(cancelled.ok, true);
  assert.equal(outcome.ok, false);
  const persisted = await ctx.memory.readRun(runId);
  assert.equal(persisted.runtime.status, 'interrupted');
  assert.equal(persisted.runtime.acceptedStep, 0);
  assert.equal(persisted.snapshots.length, 0);
});

test('retomada revalida checkpoint e volta a prepared antes de iniciar outro passo', async () => {
  const ctx = setup();
  const runId = await preparedRun(ctx);
  await ctx.orchestrator.start(runId);
  assert.equal((await ctx.orchestrator.cancel(runId)).ok, true);
  const resumed = await ctx.orchestrator.resume(runId);
  assert.equal(resumed.ok, true);
  assert.equal(resumed.runtime.status, 'prepared');
  await ctx.orchestrator.start(runId);
  const step = await ctx.orchestrator.executeStep(runId);
  assert.equal(step.ok, true);
  assert.equal(step.runtime.acceptedStep, 1);
});


test('commit concluído antes do cancelamento permanece aceito e o run é interrompido depois', async () => {
  const SILM = loadApi();
  const memory = SILM.multiphysicsOrchestratorPrototype.createMemoryTransactionalStore();
  let signalEntered;
  let releaseCommit;
  const entered = new Promise(resolve => { signalEntered = resolve; });
  const release = new Promise(resolve => { releaseCommit = resolve; });
  const delayedStore = {
    createRun: payload => memory.createRun(payload),
    readRun: runId => memory.readRun(runId),
    transition: payload => memory.transition(payload),
    commitStep: async payload => {
      signalEntered();
      await release;
      return memory.commitStep(payload);
    }
  };
  const ctx = setup({ store: delayedStore });
  const runId = await preparedRun(ctx);
  await ctx.orchestrator.start(runId);
  const stepPromise = ctx.orchestrator.executeStep(runId);
  await entered;
  const cancelPromise = ctx.orchestrator.cancel(runId, 'CANCEL_DURING_COMMIT');
  releaseCommit();
  const [step, cancelled] = await Promise.all([stepPromise, cancelPromise]);
  assert.equal(step.ok, true);
  assert.equal(step.committed, true);
  assert.equal(step.interrupted, true);
  assert.equal(cancelled.ok, true);
  const persisted = await memory.readRun(runId);
  assert.equal(persisted.runtime.status, 'interrupted');
  assert.equal(persisted.runtime.acceptedStep, 1);
  assert.equal(persisted.snapshots.length, 1);
});

test('falha de persistência não avança snapshot, campos nem coordenada aceita', async () => {
  const ctx = setup();
  const runId = await preparedRun(ctx);
  await ctx.orchestrator.start(runId);
  ctx.memory.failNextCommit();
  const result = await ctx.orchestrator.executeStep(runId);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'STORAGE_FAILURE');
  const persisted = await ctx.memory.readRun(runId);
  assert.equal(persisted.runtime.status, 'rejected');
  assert.equal(persisted.runtime.acceptedStep, 0);
  assert.equal(JSON.stringify(persisted.runtime.acceptedCoordinate), JSON.stringify({ kind: 'time', timeS: 0 }));
  assert.equal(persisted.snapshots.length, 0);
  assert.equal(persisted.fields.length, 0);
  assert.equal(ctx.observedEvents.some(item => item.type === 'step-committed'), false);
  assert.equal(ctx.observedEvents.some(item => item.type === 'step-rejected'), true);
});

test('gate de aceitação reprovado rejeita E e T conjuntamente', async () => {
  const ctx = setup({ gate: async () => ({ ok: false, reason: 'BALANCE_OUT_OF_TOLERANCE' }) });
  const runId = await preparedRun(ctx);
  await ctx.orchestrator.start(runId);
  const result = await ctx.orchestrator.executeStep(runId);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'BALANCE_OUT_OF_TOLERANCE');
  const persisted = await ctx.memory.readRun(runId);
  assert.equal(persisted.runtime.acceptedStep, 0);
  assert.equal(persisted.snapshots.length, 0);
});

test('controle otimista permite apenas um commit sobre a mesma revisão-base', async () => {
  const ctx = setup();
  const runId = await preparedRun(ctx);
  await ctx.orchestrator.start(runId);
  const current = await ctx.memory.readRun(runId);
  const runtime = {
    ...current.runtime, acceptedStep: 1, lastAcceptedSnapshotId: 'result-race-candidate-0001',
    acceptedCoordinate: { kind: 'time', timeS: 0.5 }
  };
  const snapshot = { snapshotId: 'result-race-candidate-0001', runId, accepted: true, converged: true };
  const payload = {
    runId, expectedStorageRevision: current.storageRevision, expectedAcceptedStep: 0,
    expectedSnapshotId: null, runtime, checkpoint: {}, snapshot, fields: [], event: { type: 'test-commit' }
  };
  const first = await ctx.memory.commitStep(payload);
  const second = await ctx.memory.commitStep(payload);
  assert.equal(first.ok, true);
  assert.equal(second.ok, false);
  assert.equal(second.reason, 'STORAGE_CONFLICT');
  const persisted = await ctx.memory.readRun(runId);
  assert.equal(persisted.runtime.acceptedStep, 1);
  assert.equal(persisted.snapshots.length, 1);
});


test('preparação bloqueia um grafo acoplado sem adaptador de transferência', async () => {
  const SILM = loadApi();
  const memory = SILM.multiphysicsOrchestratorPrototype.createMemoryTransactionalStore();
  let id = 0;
  const orchestrator = SILM.createMultiphysicsOrchestrator({
    store: memory,
    solvers: { electrical: makeSolver('electrical') },
    validateDefinition: async () => ({ ok: true }),
    resolveGeometry: async reference => ({ ok: true, geometryId: reference.geometryId, revision: reference.geometryRevision }),
    validateCandidate: async () => ({ ok: true }),
    validateCheckpoint: async () => ({ ok: true }),
    resolveTolerances: async () => ({ ok: true, relativeTolerance: 1e-5 }),
    idFactory: prefix => `${prefix}-${String(++id).padStart(14, '0')}`
  });
  const definition = fixture({ domains: { electrical: {} }, couplings: [{ id: 'coupling-001' }] });
  const result = await orchestrator.prepare(definition);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'TRANSFER_ADAPTER_UNAVAILABLE');
});

test('preparação não habilita silenciosamente regimes ainda não suportados pelo protótipo', async () => {
  const ctx = setup();
  const result = await ctx.orchestrator.prepare(fixture({ timeControl: { regime: 'harmonic', frequencyHz: 1e6 } }));
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'UNSUPPORTED_PROTOTYPE_REGIME');
});

test('coordenada de regime diferente é rejeitada sem mistura de relógios', async () => {
  const ctx = setup();
  const runId = await preparedRun(ctx);
  await ctx.orchestrator.start(runId);
  const result = await ctx.orchestrator.executeStep(runId, { kind: 'frequency', frequencyHz: 1e6 });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'INVALID_COORDINATE_ADVANCE');
  const persisted = await ctx.memory.readRun(runId);
  assert.equal(persisted.runtime.acceptedStep, 0);
  assert.equal(JSON.stringify(persisted.runtime.acceptedCoordinate), JSON.stringify({ kind: 'time', timeS: 0 }));
});
