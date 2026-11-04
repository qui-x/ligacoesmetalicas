(function (root) {
  'use strict';

  const SILM = (root.SILM = root.SILM || {});
  const DB_VERSION = 1;
  const STORE_NAMES = Object.freeze([
    'definitions', 'runs', 'snapshots', 'fields', 'fieldBlocks',
    'meshes', 'checkpoints', 'auditEvents'
  ]);
  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const record = value => !!value && typeof value === 'object' && !Array.isArray(value);
  const fail = (reason, details = {}) => ({ ok: false, reason, ...details });
  const bytesOf = value => {
    if (value instanceof ArrayBuffer) return value.slice(0);
    if (ArrayBuffer.isView(value)) return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
    return null;
  };
  const definitionKey = (id, revision) => id + '@' + revision;
  const meshKey = (runId, mesh) => runId + '|' + mesh.meshId + '|' + mesh.geometryRevision;
  const request = req => new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IDB_REQUEST_FAILED'));
  });

  function createMultiphysicsIndexedDBStore(options = {}) {
    const databaseName = options.databaseName || 'silm-multiphysics';
    const onBlocked = options.onBlocked || (() => {});
    const onVersionChange = options.onVersionChange || (() => {});
    let databasePromise = null;
    let database = null;

    function open() {
      if (databasePromise) return databasePromise;
      databasePromise = new Promise((resolve, reject) => {
        if (!root.indexedDB) {
          databasePromise = null;
          reject(Object.assign(new Error('INDEXEDDB_UNAVAILABLE'), { code: 'INDEXEDDB_UNAVAILABLE' }));
          return;
        }
        let settled = false;
        const req = root.indexedDB.open(databaseName, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          const create = (name, keyPath, indexes = []) => {
            const store = db.objectStoreNames.contains(name)
              ? req.transaction.objectStore(name)
              : db.createObjectStore(name, { keyPath });
            for (const [indexName, path, config] of indexes) {
              if (!store.indexNames.contains(indexName)) store.createIndex(indexName, path, config || {});
            }
          };
          create('definitions', 'key', [['byExperiment', 'experimentId']]);
          create('runs', 'runId', [['byExperiment', 'experimentId']]);
          create('snapshots', 'snapshotId', [['byRun', 'runId'], ['byRunStep', ['runId', 'acceptedStep'], { unique: true }]]);
          create('fields', 'fieldId', [['byRun', 'runId'], ['bySnapshot', 'snapshotId']]);
          create('fieldBlocks', 'fieldId', [['byRun', 'runId'], ['bySnapshot', 'snapshotId']]);
          create('meshes', 'key', [['byRun', 'runId']]);
          create('checkpoints', 'runId');
          create('auditEvents', 'eventId', [['byRun', 'runId'], ['byRunSequence', ['runId', 'sequence'], { unique: true }]]);
        };
        req.onblocked = () => {
          try { onBlocked({ databaseName }); } catch { /* callbacks are isolated */ }
          if (!settled) {
            settled = true;
            databasePromise = null;
            reject(Object.assign(new Error('DATABASE_BLOCKED'), { code: 'DATABASE_BLOCKED' }));
          }
        };
        req.onerror = () => {
          if (settled) return;
          settled = true;
          databasePromise = null;
          reject(req.error || new Error('DATABASE_OPEN_FAILED'));
        };
        req.onsuccess = () => {
          const db = req.result;
          if (settled) { db.close(); return; }
          settled = true;
          database = db;
          db.onversionchange = event => {
            db.close();
            database = null;
            databasePromise = null;
            try { onVersionChange({ oldVersion: event.oldVersion, newVersion: event.newVersion }); } catch { /* isolated */ }
          };
          resolve(db);
        };
      });
      return databasePromise;
    }

    function transact(db, names, mode, work) {
      return new Promise((resolve, reject) => {
        let tx;
        let result;
        let abortReason = null;
        try { tx = db.transaction(names, mode); }
        catch (error) { reject(error); return; }
        const abort = reason => {
          abortReason = reason || 'TRANSACTION_ABORTED';
          try { tx.abort(); } catch { reject(Object.assign(new Error(abortReason), { code: abortReason })); }
        };
        tx.oncomplete = () => resolve(result);
        tx.onabort = () => reject(Object.assign(new Error(abortReason || tx.error?.message || 'TRANSACTION_ABORTED'), {
          code: abortReason || tx.error?.name || 'TRANSACTION_ABORTED'
        }));
        tx.onerror = () => { /* onabort owns the rejection */ };
        try { work(tx, { abort, setResult: value => { result = value; } }); }
        catch (error) { abort(error?.message || 'TRANSACTION_FAILED'); }
      });
    }

    function validateEvent(run, event) {
      return record(event) && event.runId === run.runId &&
        event.sequence === run.eventSequence + 1 && typeof event.eventId === 'string';
    }

    async function digestHex(buffer) {
      if (!root.crypto?.subtle) throw Object.assign(new Error('CRYPTO_UNAVAILABLE'), { code: 'CRYPTO_UNAVAILABLE' });
      const digest = await root.crypto.subtle.digest('SHA-256', buffer);
      return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
    }

    async function prepareBlocks(fields, fieldBlocks) {
      if (!Array.isArray(fields) || !fields.length || !Array.isArray(fieldBlocks) || fields.length !== fieldBlocks.length) {
        return fail('FIELD_BLOCK_SET_INCOMPLETE');
      }
      const metadataById = new Map(fields.map(field => [field.fieldId, field]));
      if (metadataById.size !== fields.length) return fail('DUPLICATE_FIELD_ID');
      const prepared = [];
      for (const block of fieldBlocks) {
        const metadata = metadataById.get(block?.fieldId);
        const data = bytesOf(block?.data);
        if (!metadata || !data) return fail('FIELD_BLOCK_INVALID', { fieldId: block?.fieldId });
        if (!/^[a-f0-9]{64}$/.test(metadata.checksum || '')) return fail('FIELD_CHECKSUM_INVALID', { fieldId: block.fieldId });
        const checksum = await digestHex(data);
        if (checksum !== metadata.checksum) return fail('FIELD_CHECKSUM_MISMATCH', { fieldId: block.fieldId });
        prepared.push({ fieldId: block.fieldId, data, checksum, byteLength: data.byteLength });
      }
      if (prepared.length !== fields.length) return fail('FIELD_BLOCK_SET_INCOMPLETE');
      return { ok: true, blocks: prepared };
    }

    async function createRun(input) {
      if (!record(input) || !record(input.experiment) || !record(input.manifest) ||
          !record(input.runtime) || !record(input.checkpoint) || !record(input.event)) return fail('RUN_RECORD_INVALID');
      if (input.runtime.status !== 'prepared' || input.runtime.acceptedStep !== 0 ||
          input.event.runId !== input.runId || input.event.sequence !== 1) return fail('INITIAL_RUN_STATE_INVALID');
      const db = await open();
      const key = definitionKey(input.experiment.id, input.experiment.revision);
      const definition = {
        key, experimentId: input.experiment.id, revision: input.experiment.revision,
        createdAt: input.experiment.createdAt, value: clone(input.experiment)
      };
      const run = {
        runId: input.runId, experimentId: input.experiment.id, definitionKey: key,
        definitionRevision: input.experiment.revision, manifest: clone(input.manifest),
        runtime: clone(input.runtime), storageRevision: 0, eventSequence: 1,
        createdAt: input.event.createdAt, updatedAt: input.event.createdAt
      };
      try {
        await transact(db, ['definitions', 'runs', 'checkpoints', 'auditEvents'], 'readwrite', (tx, control) => {
          tx.objectStore('definitions').add(definition);
          tx.objectStore('runs').add(run);
          tx.objectStore('checkpoints').add({ ...clone(input.checkpoint), runId: input.runId });
          tx.objectStore('auditEvents').add(clone(input.event));
          control.setResult({ ok: true, storageRevision: 0 });
        });
        return { ok: true, storageRevision: 0 };
      } catch (error) {
        return fail(error.code || error.name || 'STORAGE_FAILURE');
      }
    }

    async function readRun(runId) {
      const db = await open();
      return new Promise((resolve, reject) => {
        let tx;
        try { tx = db.transaction(STORE_NAMES, 'readonly'); }
        catch (error) { reject(error); return; }
        const result = {};
        const runReq = tx.objectStore('runs').get(runId);
        runReq.onsuccess = () => {
          result.run = runReq.result || null;
          if (!result.run) return;
          const definitionReq = tx.objectStore('definitions').get(result.run.definitionKey);
          const checkpointReq = tx.objectStore('checkpoints').get(runId);
          const snapshotsReq = tx.objectStore('snapshots').index('byRun').getAll(runId);
          const fieldsReq = tx.objectStore('fields').index('byRun').getAll(runId);
          const meshesReq = tx.objectStore('meshes').index('byRun').getAll(runId);
          const eventsReq = tx.objectStore('auditEvents').index('byRun').getAll(runId);
          const assign = (key, req) => { req.onsuccess = () => { result[key] = req.result; }; };
          assign('definition', definitionReq);
          assign('checkpoint', checkpointReq);
          assign('snapshots', snapshotsReq);
          assign('fields', fieldsReq);
          assign('meshes', meshesReq);
          assign('events', eventsReq);
        };
        tx.oncomplete = () => {
          if (!result.run) { resolve(null); return; }
          resolve({
            runId, experiment: clone(result.definition?.value), manifest: clone(result.run.manifest),
            runtime: clone(result.run.runtime), storageRevision: result.run.storageRevision,
            eventSequence: result.run.eventSequence, checkpoint: clone(result.checkpoint),
            snapshots: clone(result.snapshots || []), fields: clone(result.fields || []),
            meshes: clone(result.meshes || []), events: clone((result.events || []).sort((a, b) => a.sequence - b.sequence))
          });
        };
        tx.onerror = () => reject(tx.error || new Error('READ_RUN_FAILED'));
        tx.onabort = () => reject(tx.error || new Error('READ_RUN_ABORTED'));
      });
    }

    async function transition(input) {
      const db = await open();
      return new Promise(resolve => {
        let tx;
        let abortReason = null;
        try { tx = db.transaction(['runs', 'checkpoints', 'auditEvents'], 'readwrite'); }
        catch (error) { resolve(fail(error.code || 'STORAGE_FAILURE')); return; }
        const abort = reason => { abortReason = reason; try { tx.abort(); } catch { resolve(fail(reason)); } };
        tx.oncomplete = () => resolve({ ok: true, storageRevision: input.expectedStorageRevision + 1 });
        tx.onabort = () => resolve(fail(abortReason || tx.error?.name || 'STORAGE_FAILURE'));
        const req = tx.objectStore('runs').get(input.runId);
        req.onsuccess = () => {
          const current = req.result;
          if (!current) return abort('RUN_NOT_FOUND');
          if (current.storageRevision !== input.expectedStorageRevision) return abort('STORAGE_CONFLICT');
          if (!validateEvent(current, input.event)) return abort('AUDIT_SEQUENCE_CONFLICT');
          const oldRuntime = current.runtime;
          const nextRuntime = input.runtime;
          const allowed =
            (oldRuntime.status === 'prepared' && nextRuntime.status === 'running') ||
            (oldRuntime.status === 'running' && ['interrupted', 'rejected'].includes(nextRuntime.status)) ||
            (oldRuntime.status === 'interrupted' && nextRuntime.status === 'prepared');
          if (!allowed || nextRuntime.acceptedStep !== oldRuntime.acceptedStep ||
              (nextRuntime.lastAcceptedSnapshotId || null) !== (oldRuntime.lastAcceptedSnapshotId || null) ||
              nextRuntime.geometry.revision !== oldRuntime.geometry.revision) return abort('INVALID_RUNTIME_TRANSITION');
          const next = { ...current, runtime: clone(nextRuntime), storageRevision: current.storageRevision + 1, eventSequence: input.event.sequence, updatedAt: nextRuntime.updatedAt };
          tx.objectStore('runs').put(next);
          tx.objectStore('checkpoints').put({ ...clone(input.checkpoint), runId: input.runId });
          tx.objectStore('auditEvents').add(clone(input.event));
        };
        req.onerror = () => abort('RUN_READ_FAILED');
      });
    }

    async function commitStep(input) {
      const required = ['runId', 'runtime', 'checkpoint', 'snapshot', 'fields', 'fieldBlocks', 'event'];
      if (!record(input) || required.some(key => input[key] === undefined)) return fail('COMMIT_INPUT_INVALID');
      const prepared = await prepareBlocks(input.fields, input.fieldBlocks);
      if (!prepared.ok) return prepared;
      const ids = new Set(input.fields.map(field => field.fieldId));
      if (!Array.isArray(input.snapshot.fieldRefs) || input.snapshot.fieldRefs.length !== ids.size ||
          input.snapshot.fieldRefs.some(id => !ids.has(id)) || input.snapshot.runId !== input.runId ||
          input.snapshot.accepted !== true || input.snapshot.converged !== true) return fail('SNAPSHOT_FIELD_MISMATCH');
      const meshes = input.runtime.meshes || [];
      for (const field of input.fields) {
        const mesh = meshes.find(item => item.meshId === field.meshId && item.domain === field.domain &&
          item.geometryRevision === field.geometryRevision);
        if (!mesh) return fail('FIELD_MESH_MISMATCH', { fieldId: field.fieldId });
      }
      for (const field of input.fields) {
        if (!input.snapshot.fieldRefs.includes(field.fieldId) || field.runId && field.runId !== input.runId) return fail('FIELD_REFERENCE_INVALID');
      }
      const db = await open();
      return new Promise(resolve => {
        let tx;
        let abortReason = null;
        try {
          tx = db.transaction(['runs', 'snapshots', 'fields', 'fieldBlocks', 'meshes', 'checkpoints', 'auditEvents'], 'readwrite');
        } catch (error) { resolve(fail(error.code || 'STORAGE_FAILURE')); return; }
        const abort = reason => { abortReason = reason; try { tx.abort(); } catch { resolve(fail(reason)); } };
        tx.oncomplete = () => resolve({ ok: true, storageRevision: input.expectedStorageRevision + 1 });
        tx.onabort = () => resolve(fail(abortReason || tx.error?.name || 'STORAGE_FAILURE'));
        const req = tx.objectStore('runs').get(input.runId);
        req.onsuccess = () => {
          const current = req.result;
          if (!current) return abort('RUN_NOT_FOUND');
          if (current.storageRevision !== input.expectedStorageRevision) return abort('STORAGE_CONFLICT');
          if (current.runtime.acceptedStep !== input.expectedAcceptedStep ||
              (current.runtime.lastAcceptedSnapshotId || null) !== (input.expectedSnapshotId || null)) return abort('STALE_CANDIDATE');
          if (!validateEvent(current, input.event)) return abort('AUDIT_SEQUENCE_CONFLICT');
          if (input.runtime.acceptedStep !== current.runtime.acceptedStep + 1 ||
              input.runtime.lastAcceptedSnapshotId !== input.snapshot.snapshotId ||
              input.runtime.status !== 'running' && input.runtime.status !== 'converged' ||
              input.snapshot.definitionRevision !== current.definitionRevision ||
              input.checkpoint.acceptedStep !== input.runtime.acceptedStep) return abort('INVALID_COMMIT_CANDIDATE');

          const runStore = tx.objectStore('runs');
          runStore.put({
            ...current, runtime: clone(input.runtime), storageRevision: current.storageRevision + 1,
            eventSequence: input.event.sequence, updatedAt: input.runtime.updatedAt
          });
          const snapshotStore = tx.objectStore('snapshots');
          snapshotStore.add({ ...clone(input.snapshot), acceptedStep: input.runtime.acceptedStep });
          const fieldStore = tx.objectStore('fields');
          const blockStore = tx.objectStore('fieldBlocks');
          input.fields.forEach(field => fieldStore.add({
            ...clone(field), runId: input.runId, snapshotId: input.snapshot.snapshotId
          }));
          prepared.blocks.forEach(block => blockStore.add({
            ...block, runId: input.runId, snapshotId: input.snapshot.snapshotId
          }));
          const meshStore = tx.objectStore('meshes');
          (input.runtime.meshes || []).forEach(mesh => {
            const key = meshKey(input.runId, mesh);
            const getMesh = meshStore.get(key);
            getMesh.onsuccess = () => {
              if (!getMesh.result) meshStore.add({ ...clone(mesh), key, runId: input.runId });
            };
          });
          tx.objectStore('checkpoints').put({ ...clone(input.checkpoint), runId: input.runId });
          tx.objectStore('auditEvents').add(clone(input.event));
        };
        req.onerror = () => abort('RUN_READ_FAILED');
      });
    }

    async function getFieldBlock(runId, fieldId) {
      const db = await open();
      const tx = db.transaction(['fieldBlocks'], 'readonly');
      const value = await request(tx.objectStore('fieldBlocks').get(fieldId));
      await new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onabort = () => reject(tx.error); });
      return value?.runId === runId ? value : null;
    }

    async function getSnapshot(runId, snapshotId) {
      const db = await open();
      const tx = db.transaction(['snapshots'], 'readonly');
      const value = await request(tx.objectStore('snapshots').get(snapshotId));
      await new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onabort = () => reject(tx.error); });
      return value?.runId === runId ? value : null;
    }

    async function close() {
      if (database) database.close();
      database = null;
      databasePromise = null;
    }

    return Object.freeze({ open, createRun, readRun, transition, commitStep, getFieldBlock, getSnapshot, close, databaseName });
  }

  SILM.createMultiphysicsIndexedDBStore = createMultiphysicsIndexedDBStore;
})(globalThis);
