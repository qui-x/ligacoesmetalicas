(function (root) {
  'use strict';

  const SILM = (root.SILM = root.SILM || {});
  const DOMAINS = Object.freeze(['electrical', 'thermal', 'mechanical', 'optical']);
  const clone = value => value === undefined ? undefined : (typeof root.structuredClone === 'function' ? root.structuredClone(value) : JSON.parse(JSON.stringify(value)));
  const freezeDeep = value => {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freezeDeep);
    return value;
  };
  const failure = (reason, details = {}) => ({ ok: false, reason, ...details });
  const isRecord = value => !!value && typeof value === 'object' && !Array.isArray(value);
  const finite = value => typeof value === 'number' && Number.isFinite(value);

  function createMemoryTransactionalStore() {
    // Adaptador exclusivamente de prova/teste. Não representa a persistência IndexedDB de produção.
    const runs = new Map();
    let failNextCommit = false;

    return Object.freeze({
      async createRun(record) {
        if (runs.has(record.runId)) return failure('RUN_ALREADY_EXISTS');
        const stored = clone({ ...record, storageRevision: 0, snapshots: [], fields: [], fieldBlocks: [], meshes: [], events: [] });
        if (record.event) stored.events.push(clone(record.event));
        runs.set(record.runId, stored);
        return { ok: true, storageRevision: 0 };
      },

      async readRun(runId) {
        const record = runs.get(runId);
        return record ? clone(record) : null;
      },

      async transition({ runId, expectedStorageRevision, runtime, checkpoint, event }) {
        const current = runs.get(runId);
        if (!current) return failure('RUN_NOT_FOUND');
        if (current.storageRevision !== expectedStorageRevision) return failure('STORAGE_CONFLICT');
        const next = clone(current);
        next.runtime = clone(runtime);
        next.checkpoint = clone(checkpoint);
        next.storageRevision += 1;
        if (event) next.events.push(clone(event));
        runs.set(runId, next);
        return { ok: true, storageRevision: next.storageRevision };
      },

      async commitStep({
        runId, expectedStorageRevision, expectedAcceptedStep, expectedSnapshotId,
        runtime, checkpoint, snapshot, fields, fieldBlocks, event
      }) {
        const current = runs.get(runId);
        if (!current) return failure('RUN_NOT_FOUND');
        if (current.storageRevision !== expectedStorageRevision) return failure('STORAGE_CONFLICT');
        if (current.runtime.acceptedStep !== expectedAcceptedStep ||
            (current.runtime.lastAcceptedSnapshotId || null) !== (expectedSnapshotId || null)) {
          return failure('STALE_CANDIDATE');
        }
        if (runtime.acceptedStep !== expectedAcceptedStep + 1 || snapshot.runId !== runId ||
            snapshot.accepted !== true || snapshot.converged !== true) {
          return failure('INVALID_COMMIT_CANDIDATE');
        }
        if (failNextCommit) {
          failNextCommit = false;
          return failure('STORAGE_FAILURE');
        }

        // Construir a próxima versão fora do Map e trocar a referência uma única vez: commit atômico no adaptador.
        const next = clone(current);
        next.runtime = clone(runtime);
        next.checkpoint = clone(checkpoint);
        next.snapshots.push(clone(snapshot));
        next.fields.push(...clone(fields || []));
        next.fieldBlocks.push(...clone(fieldBlocks || []));
        next.meshes = [...new Map([...(next.meshes || []), ...(clone(runtime.meshes || []))].map(mesh => [mesh.meshId + '|' + mesh.geometryRevision, mesh])).values()];
        next.storageRevision += 1;
        if (event) next.events.push(clone(event));
        runs.set(runId, next);
        return { ok: true, storageRevision: next.storageRevision };
      },

      failNextCommit() { failNextCommit = true; },
      async readSnapshot(runId, snapshotId) {
        const record = runs.get(runId);
        return clone(record?.snapshots.find(item => item.snapshotId === snapshotId) || null);
      }
    });
  }

  function initialCoordinate(experiment) {
    const control = experiment.timeControl || {};
    switch (control.regime) {
      case 'transient': return { kind: 'time', timeS: control.initialTimeS };
      case 'quasi-static': return { kind: 'load-increment', incrementIndex: 0, incrementCount: control.loadIncrements, loadFactor: 0 };
      case 'harmonic': return { kind: 'frequency', frequencyHz: control.frequencyHz };
      case 'multiscale': return { kind: 'multiscale-time', timeS: control.initialTimeS, scaleMapId: control.scaleMapId };
      default: return null;
    }
  }

  function coordinateAdvanced(previous, next, acceptedStep) {
    if (!isRecord(previous) || !isRecord(next) || previous.kind !== next.kind) return false;
    switch (next.kind) {
      case 'time': return finite(next.timeS) && next.timeS > previous.timeS;
      case 'multiscale-time':
        return next.scaleMapId === previous.scaleMapId && finite(next.timeS) && next.timeS > previous.timeS;
      case 'load-increment':
        return Number.isInteger(next.incrementIndex) && next.incrementIndex === previous.incrementIndex + 1 &&
          next.incrementCount === previous.incrementCount && finite(next.loadFactor) &&
          next.loadFactor > previous.loadFactor && next.loadFactor <= 1;
      case 'frequency':
        return finite(next.frequencyHz) && next.frequencyHz > 0 &&
          (acceptedStep === 0 ? next.frequencyHz === previous.frequencyHz : next.frequencyHz > previous.frequencyHz);
      default: return false;
    }
  }

  function isFinalCoordinate(experiment, coordinate) {
    const control = experiment.timeControl || {};
    if (coordinate.kind === 'time' || coordinate.kind === 'multiscale-time') return coordinate.timeS >= control.finalTimeS;
    if (coordinate.kind === 'load-increment') return coordinate.incrementIndex >= coordinate.incrementCount;
    return coordinate.kind === 'frequency';
  }

  function nextCoordinate(experiment, previous) {
    const control = experiment.timeControl || {};
    if (previous.kind === 'time') return { kind: 'time', timeS: Math.min(control.finalTimeS, previous.timeS + control.initialStepS) };
    if (previous.kind === 'multiscale-time') {
      const step = control.initialStepS || control.minimumStepS || 0;
      return { kind: 'multiscale-time', timeS: Math.min(control.finalTimeS, previous.timeS + step), scaleMapId: previous.scaleMapId };
    }
    if (previous.kind === 'load-increment') {
      const index = previous.incrementIndex + 1;
      return { kind: 'load-increment', incrementIndex: index, incrementCount: previous.incrementCount, loadFactor: index / previous.incrementCount };
    }
    return clone(previous);
  }

  SILM.multiphysicsOrchestratorPrototype = Object.freeze({
    version: '0.1.0-prototype',
    domains: DOMAINS,
    createMemoryTransactionalStore
  });

  SILM.createMultiphysicsOrchestrator = function createMultiphysicsOrchestrator(options = {}) {
    const {
      store,
      solvers = {},
      validateDefinition,
      resolveGeometry,
      validateCandidate,
      validateCheckpoint,
      resolveTolerances,
      executeTransfers,
      idFactory = prefix => prefix + '-' + (root.crypto?.randomUUID?.() || String(Date.now()) + Math.random().toString(36).slice(2)),
      clock = () => new Date().toISOString(),
      onEvent = () => {}
    } = options;

    if (!store || !['createRun', 'readRun', 'transition', 'commitStep'].every(key => typeof store[key] === 'function')) {
      throw new TypeError('A2.1 exige um adaptador transacional com createRun/readRun/transition/commitStep.');
    }
    if (typeof validateDefinition !== 'function' || typeof resolveGeometry !== 'function' ||
        typeof validateCandidate !== 'function' || typeof validateCheckpoint !== 'function' || typeof resolveTolerances !== 'function') {
      throw new TypeError('A2.1 exige validadores explícitos de definição, geometria, candidato, checkpoint e tolerâncias.');
    }

    const transferExecutor = typeof executeTransfers === 'function' ? executeTransfers : async () => ({ ok: true, fields: [], balances: [], reports: [] });
    const runs = new Map();
    const listeners = new Map();
    const createEvent = (runId, type, details = {}) => ({
      eventId: idFactory('event'), runId,
      sequence: (runs.get(runId)?.eventSequence || 0) + 1,
      type, createdAt: clock(), ...clone(details)
    });
    const dispatchEvent = item => {
      const run = runs.get(item.runId);
      if (run) run.eventSequence = item.sequence;
      try { onEvent(clone(item)); } catch { /* Observadores não podem interromper a execução. */ }
      for (const listener of listeners.get(item.runId) || []) {
        try { listener(clone(item)); } catch { /* Observadores são isolados. */ }
      }
    };
    const event = (runId, type, details = {}) => {
      const item = createEvent(runId, type, details);
      dispatchEvent(item);
      return item;
    };
    const publishRuntime = runId => {
      const run = runs.get(runId);
      for (const listener of listeners.get(runId) || []) {
        try { listener({ type: 'runtime-updated', runId, runtime: clone(run.runtime) }); } catch { /* Isolamento de observadores. */ }
      }
    };

    async function persistTransition(run, status, type, details = {}) {
      const runtime = { ...clone(run.runtime), status, updatedAt: clock() };
      const checkpoint = { ...clone(run.checkpoint), runtime: clone(runtime) };
      const auditEvent = createEvent(run.runId, type, details);
      const saved = await store.transition({
        runId: run.runId,
        expectedStorageRevision: run.storageRevision,
        runtime,
        checkpoint,
        event: auditEvent
      });
      if (!saved.ok) return saved;
      run.storageRevision = saved.storageRevision;
      run.runtime = runtime;
      run.checkpoint = checkpoint;
      dispatchEvent(auditEvent);
      publishRuntime(run.runId);
      return { ok: true };
    }

    async function prepare(experiment) {
      if (!isRecord(experiment)) return failure('INVALID_DEFINITION');
      const definition = freezeDeep(clone(experiment));
      const definitionCheck = await validateDefinition(definition);
      if (!definitionCheck?.ok) return failure('INVALID_DEFINITION', { issues: clone(definitionCheck?.issues || []) });

      const domainIds = Object.keys(definition.domains || {}).filter(domain => DOMAINS.includes(domain) && definition.domains[domain]);
      if (!domainIds.length) return failure('NO_ACTIVE_DOMAINS');
      const missingSolver = domainIds.find(domain => typeof solvers[domain]?.initialize !== 'function' || typeof solvers[domain]?.solveStep !== 'function');
      if (missingSolver) return failure('SOLVER_UNAVAILABLE', { domain: missingSolver });

      const geometryCheck = await resolveGeometry(definition.sample?.geometry);
      if (!geometryCheck?.ok || !geometryCheck.geometryId || !Number.isInteger(geometryCheck.revision)) {
        return failure('GEOMETRY_UNAVAILABLE', { issues: clone(geometryCheck?.issues || []) });
      }
      const coordinate = initialCoordinate(definition);
      if (!coordinate) return failure('UNSUPPORTED_COORDINATE_REGIME');
      if (definition.timeControl?.regime !== 'transient') return failure('UNSUPPORTED_PROTOTYPE_REGIME', { regime: definition.timeControl?.regime });
      if (geometryCheck.geometryId !== definition.sample?.geometry?.geometryId || geometryCheck.revision !== definition.sample?.geometry?.geometryRevision) return failure('GEOMETRY_REFERENCE_MISMATCH');
      if ((definition.couplings || []).length && typeof executeTransfers !== 'function') return failure('TRANSFER_ADAPTER_UNAVAILABLE');

      const solverVersions = Object.fromEntries(domainIds.map(domain => [domain, String(solvers[domain].version || 'unversioned-prototype')]));
      const toleranceCheck = await resolveTolerances({ definition, domains: domainIds, solverVersions });
      if (!toleranceCheck?.ok || !finite(toleranceCheck.relativeTolerance) || toleranceCheck.relativeTolerance <= 0) return failure('TOLERANCES_UNRESOLVED');

      const runId = idFactory('run');
      const context = { runId, definition, geometry: clone(geometryCheck), initialCoordinate: clone(coordinate) };
      const domainStates = {};
      for (const domain of domainIds) {
        const solver = solvers[domain];
        const check = typeof solver.validate === 'function' ? await solver.validate({ definition, geometry: context.geometry }) : { ok: true };
        if (!check?.ok) return failure('SOLVER_VALIDATION_FAILED', { domain, issues: clone(check?.issues || []) });
        domainStates[domain] = await solver.initialize(context);
        if (!isRecord(domainStates[domain])) return failure('SOLVER_INITIALIZATION_FAILED', { domain });
      }

      const manifest = freezeDeep({
        runId,
        experimentId: definition.id,
        definitionRevision: definition.revision,
        geometryId: geometryCheck.geometryId,
        referenceRevision: geometryCheck.revision,
        domains: domainIds,
        solverVersions, tolerances: { relativeTolerance: toleranceCheck.relativeTolerance, ...(finite(toleranceCheck.energyToleranceJ) && toleranceCheck.energyToleranceJ > 0 ? { energyToleranceJ: toleranceCheck.energyToleranceJ } : {}) },
        couplingStrategy: definition.solver?.couplingStrategy || 'staggered',
        preparedAt: clock()
      });
      const runtime = {
        schemaId: 'silm.multiphysics.runtime', schemaVersion: '1.0.0', runId,
        experimentId: definition.id, definitionRevision: definition.revision, status: 'prepared',
        acceptedStep: 0,
        geometry: { geometryId: geometryCheck.geometryId, revision: geometryCheck.revision, referenceRevision: geometryCheck.revision },
        meshes: [], fields: [], domainReports: [], updatedAt: clock(),
        acceptedCoordinate: clone(coordinate), referenceRevision: geometryCheck.revision
      };
      const checkpoint = {
        runId, acceptedStep: 0, acceptedCoordinate: clone(coordinate), domainStates: clone(domainStates),
        geometry: clone(runtime.geometry), solverVersions: clone(manifest.solverVersions), runtime: clone(runtime)
      };
      const initialEvent = { eventId: idFactory('event'), runId, sequence: 1, type: 'run-prepared', createdAt: clock() };
      const saved = await store.createRun({ runId, experiment: clone(definition), manifest: clone(manifest), runtime, checkpoint, event: initialEvent });
      if (!saved.ok) return failure(saved.reason || 'STORAGE_FAILURE');

      const run = {
        runId, definition, manifest, domainIds, geometry: clone(geometryCheck), runtime, checkpoint,
        storageRevision: saved.storageRevision, eventSequence: 1, solverStates: domainStates,
        status: 'prepared', busy: false, inFlight: null, abortController: null
      };
      runs.set(runId, run);
      return { ok: true, runId, runtime: clone(runtime), manifest: clone(manifest) };
    }

    async function start(runId) {
      const run = runs.get(runId);
      if (!run) return failure('RUN_NOT_FOUND');
      if (run.runtime.status !== 'prepared') return failure('INVALID_STATE', { status: run.runtime.status });
      const saved = await persistTransition(run, 'running', 'run-started');
      if (!saved.ok) return failure(saved.reason || 'STORAGE_FAILURE');
      return { ok: true, runtime: clone(run.runtime) };
    }

    async function rejectStep(run, reason, details = {}) {
      const persisted = await persistTransition(run, 'rejected', 'step-rejected', { reason, ...details });
      if (!persisted.ok) {
        run.status = 'rejected';
        return failure(persisted.reason || reason, { acceptedStep: run.runtime.acceptedStep, persisted: false });
      }
      return failure(reason, { acceptedStep: run.runtime.acceptedStep, persisted: true, ...details });
    }

    async function interruptStep(run, reason = 'CANCELLED') {
      const persisted = await persistTransition(run, 'interrupted', 'run-interrupted', { reason });
      if (!persisted.ok) return failure(persisted.reason || 'STORAGE_FAILURE', { acceptedStep: run.runtime.acceptedStep, persisted: false });
      return failure(reason, { acceptedStep: run.runtime.acceptedStep, persisted: true });
    }

    async function performStep(run, proposedCoordinate) {
      const signal = run.abortController.signal;
      const baseAcceptedStep = run.runtime.acceptedStep;
      const baseSnapshotId = run.runtime.lastAcceptedSnapshotId || null;
      if (!proposedCoordinate && run.definition.timeControl?.regime === 'multiscale') return failure('STEP_COORDINATE_REQUIRED');
      const coordinate = clone(proposedCoordinate || nextCoordinate(run.definition, run.runtime.acceptedCoordinate));
      const attemptId = idFactory('step');
      const assertActive = () => { if (signal.aborted) { const error = new Error('CANCELLED'); error.name = 'AbortError'; throw error; } };

      try {
        if (!coordinateAdvanced(run.runtime.acceptedCoordinate, coordinate, baseAcceptedStep)) throw new Error('INVALID_COORDINATE_ADVANCE');
        const domainResults = {};
        for (const domain of run.domainIds) {
          assertActive();
          const solver = solvers[domain];
          let result;
          try { result = await solver.solveStep({
            runId: run.runId, stepAttemptId: attemptId, domain, definition: run.definition,
            geometry: clone(run.geometry), previousState: clone(run.solverStates[domain]),
            acceptedRuntime: clone(run.runtime), coordinate: clone(coordinate), signal
          }); } catch (solverError) { if (signal.aborted) throw solverError; throw new Error('SOLVER_FAILED:' + domain + ':' + (solverError?.message || 'THROWN')); }
          assertActive();
          if (!result || result.ok !== true) throw new Error('SOLVER_FAILED:' + domain + ':' + (result?.reason || 'UNKNOWN'));
          if (result.converged !== true || !finite(result.residual) || !isRecord(result.state)) throw new Error('DOMAIN_REPORT_INVALID:' + domain);
          domainResults[domain] = result;
        }

        assertActive();
        const transferResult = await transferExecutor({
          runId: run.runId, stepAttemptId: attemptId, definition: run.definition,
          geometry: clone(run.geometry), coordinate: clone(coordinate), domainResults: clone(domainResults), signal
        });
        assertActive();
        if (!transferResult?.ok) throw new Error(transferResult?.reason || 'TRANSFER_FAILED');

        const fields = run.domainIds.flatMap(domain => clone(domainResults[domain].fields || []));
        fields.push(...clone(transferResult.fields || []));
        const fieldBlocks = run.domainIds.flatMap(domain => clone(domainResults[domain].fieldBlocks || []));
        fieldBlocks.push(...clone(transferResult.fieldBlocks || []));
        const geometryRevisions = [...new Set(run.domainIds.flatMap(domain => {
          const value = domainResults[domain].geometryRevision;
          return Number.isInteger(value) ? [value] : [];
        }))];
        if (geometryRevisions.length > 1) throw new Error('GEOMETRY_REVISION_MISMATCH');
        const geometryRevision = geometryRevisions[0] ?? run.runtime.geometry.revision;
        const candidate = {
          runId: run.runId, stepAttemptId: attemptId, baseAcceptedStep, baseSnapshotId,
          coordinate, domainResults: clone(domainResults), fields: clone(fields), fieldBlocks: clone(fieldBlocks),
          observables: run.domainIds.flatMap(domain => clone(domainResults[domain].observables || [])),
          balances: run.domainIds.flatMap(domain => clone(domainResults[domain].balances || [])).concat(clone(transferResult.balances || [])),
          transferReports: clone(transferResult.reports || []), geometryRevision,
          domainReports: run.domainIds.map(domain => ({
            domain, residual: domainResults[domain].residual,
            accepted: domainResults[domain].converged === true
          }))
        };
        const gate = await validateCandidate({ candidate: clone(candidate), definition: run.definition, manifest: run.manifest });
        assertActive();
        if (!gate?.ok) throw new Error(gate?.reason || 'CANDIDATE_REJECTED');
        if (!fields.length || fields.length !== fieldBlocks.length || fields.some(field => !field.fieldId || !run.domainIds.includes(field.domain) || !field.meshId || field.geometryRevision !== geometryRevision || !finite(field.timeS) || !field.unit || !field.storageRef || !/^[a-f0-9]{64}$/.test(field.checksum || ''))) {
          throw new Error('CANDIDATE_FIELDS_INVALID');
        }

        const final = isFinalCoordinate(run.definition, coordinate);
        const snapshotId = idFactory('result');
        const snapshot = {
          schemaId: 'silm.multiphysics.result', schemaVersion: '1.0.0', snapshotId,
          runId: run.runId, experimentId: run.definition.id, definitionRevision: run.definition.revision,
          accepted: true, converged: true, evidenceMode: run.definition.evidenceMode,
          observables: clone(candidate.observables), fieldRefs: fields.map(field => field.fieldId),
          balances: clone(candidate.balances),
          provenance: {
            solverVersions: clone(run.manifest.solverVersions),
            datasetVersions: (run.definition.datasetRefs || []).map(item => ({ datasetId: item.datasetId, version: item.datasetVersion, sourceId: item.sourceId })),
            lawVersions: [], mappingVersions: [],
            tolerances: clone(run.manifest.tolerances)
          },
          limitations: ['Protótipo A2.1: solvers simulados; não constitui resultado físico.'],
          warnings: [], createdAt: clock(), coordinate: clone(coordinate)
        };
        const nextRuntime = {
          ...clone(run.runtime), status: final ? 'converged' : 'running', acceptedStep: baseAcceptedStep + 1,
          geometry: { ...clone(run.runtime.geometry), revision: geometryRevision, parentRevision: run.runtime.geometry.revision },
          meshes: [...new Map(fields.map(field => [field.meshId, {
            meshId: field.meshId, domain: field.domain, geometryRevision, version: 'prototype-mesh-1'
          }])).values()],
          fields, domainReports: clone(candidate.domainReports), updatedAt: clock(),
          acceptedCoordinate: clone(coordinate), referenceRevision: run.runtime.geometry.referenceRevision,
          lastAcceptedSnapshotId: snapshotId
        };
        const nextStates = Object.fromEntries(run.domainIds.map(domain => [domain, clone(domainResults[domain].state)]));
        const checkpoint = {
          runId: run.runId, acceptedStep: nextRuntime.acceptedStep, acceptedCoordinate: clone(coordinate),
          domainStates: nextStates, geometry: clone(nextRuntime.geometry), solverVersions: clone(run.manifest.solverVersions),
          runtime: clone(nextRuntime)
        };
        assertActive();
        const auditEvent = createEvent(run.runId, 'step-committed', { stepAttemptId: attemptId, acceptedStep: nextRuntime.acceptedStep, snapshotId });
        const committed = await store.commitStep({
          runId: run.runId, expectedStorageRevision: run.storageRevision,
          expectedAcceptedStep: baseAcceptedStep, expectedSnapshotId: baseSnapshotId,
          runtime: nextRuntime, checkpoint, snapshot, fields, fieldBlocks, event: auditEvent
        });
        if (!committed.ok) throw new Error(committed.reason || 'STORAGE_FAILURE');

        // O commit venceu qualquer cancelamento concorrente; atualize primeiro a base aceita.
        run.storageRevision = committed.storageRevision;
        run.runtime = nextRuntime;
        run.checkpoint = checkpoint;
        run.solverStates = nextStates;
        run.geometry.revision = geometryRevision;
        dispatchEvent(auditEvent);
        publishRuntime(run.runId);
        if (signal.aborted) {
          const interrupted = await persistTransition(run, 'interrupted', 'run-interrupted', { reason: 'CANCELLED_AFTER_COMMIT' });
          return { ok: true, committed: true, interrupted: interrupted.ok, runtime: clone(run.runtime), snapshot: clone(snapshot) };
        }
        if (final) event(run.runId, 'run-converged', { snapshotId, acceptedStep: nextRuntime.acceptedStep });
        return { ok: true, runtime: clone(run.runtime), snapshot: clone(snapshot) };
      } catch (error) {
        if (signal.aborted || error?.name === 'AbortError') return interruptStep(run, 'CANCELLED');
        const message = String(error?.message || 'STEP_FAILED');
        const reason = message.startsWith('SOLVER_FAILED:') ? 'SOLVER_FAILED' : message;
        return rejectStep(run, reason, { stepAttemptId: attemptId, message });
      }
    }

    async function executeStep(runId, coordinate) {
      const run = runs.get(runId);
      if (!run) return failure('RUN_NOT_FOUND');
      if (run.runtime.status !== 'running') return failure('INVALID_STATE', { status: run.runtime.status });
      if (run.busy) return failure('RUN_BUSY');
      run.busy = true;
      run.abortController = new AbortController();
      run.inFlight = performStep(run, coordinate);
      try { return await run.inFlight; }
      finally { run.inFlight = null; run.busy = false; run.abortController = null; }
    }

    async function cancel(runId, reason = 'USER_CANCELLED') {
      const run = runs.get(runId);
      if (!run) return failure('RUN_NOT_FOUND');
      if (run.runtime.status !== 'running') return failure('INVALID_STATE', { status: run.runtime.status });
      if (run.abortController) {
        run.abortController.abort(reason);
        if (run.inFlight) await run.inFlight;
        const stored = await store.readRun(runId);
        return stored?.runtime?.status === 'interrupted'
          ? { ok: true, runtime: clone(stored.runtime) }
          : failure('CANCEL_NOT_CONFIRMED', { status: stored?.runtime?.status });
      }
      const saved = await persistTransition(run, 'interrupted', 'run-interrupted', { reason });
      return saved.ok ? { ok: true, runtime: clone(run.runtime) } : failure(saved.reason || 'STORAGE_FAILURE');
    }

    async function resume(runId) {
      const record = await store.readRun(runId);
      if (!record) return failure('RUN_NOT_FOUND');
      if (record.runtime.status !== 'interrupted') return failure('INVALID_STATE', { status: record.runtime.status });
      const check = await validateCheckpoint({ checkpoint: clone(record.checkpoint), manifest: clone(record.manifest), experiment: clone(record.experiment) });
      if (!check?.ok) return failure('CHECKPOINT_INVALID', { issues: clone(check?.issues || []) });
      const domainIds = record.manifest.domains;
      const currentVersions = Object.fromEntries(domainIds.map(domain => [domain, String(solvers[domain]?.version || 'unversioned-prototype')]));
      if (JSON.stringify(currentVersions) !== JSON.stringify(record.manifest.solverVersions)) return failure('SOLVER_VERSION_MISMATCH');
      const domainStates = {};
      for (const domain of domainIds) {
        if (!solvers[domain]) return failure('SOLVER_UNAVAILABLE', { domain });
        domainStates[domain] = typeof solvers[domain].restore === 'function'
          ? await solvers[domain].restore(clone(record.checkpoint.domainStates[domain]))
          : clone(record.checkpoint.domainStates[domain]);
      }
      const run = {
        runId, definition: freezeDeep(clone(record.experiment)), manifest: freezeDeep(clone(record.manifest)),
        domainIds, geometry: clone(record.checkpoint.geometry), runtime: clone(record.runtime),
        checkpoint: clone(record.checkpoint), storageRevision: record.storageRevision,
        eventSequence: record.events.length, solverStates: domainStates,
        status: 'interrupted', busy: false, inFlight: null, abortController: null
      };
      runs.set(runId, run);
      const saved = await persistTransition(run, 'prepared', 'run-resumed');
      if (!saved.ok) return failure(saved.reason || 'STORAGE_FAILURE');
      return { ok: true, runtime: clone(run.runtime) };
    }

    function getRuntime(runId) {
      const run = runs.get(runId);
      return run ? clone(run.runtime) : null;
    }

    function subscribe(runId, listener) {
      if (typeof listener !== 'function') throw new TypeError('listener precisa ser uma função.');
      const set = listeners.get(runId) || new Set();
      set.add(listener);
      listeners.set(runId, set);
      return () => { set.delete(listener); if (!set.size) listeners.delete(runId); };
    }

    return Object.freeze({ prepare, start, executeStep, cancel, resume, getRuntime, subscribe });
  };
})(globalThis);
