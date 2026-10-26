/* Integridade dos arquivos completos publicados na coleção Jazz e Metais.
 * Execução: node --test jazz-club/tests/audio-integrity.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join, dirname} from 'node:path';

const collection = join(dirname(fileURLToPath(import.meta.url)), '../audio/jazz e metais');
const catalog = JSON.parse(readFileSync(join(collection, 'catalogo.json'), 'utf8'));
const formats = [['mp3','mp3'],['ogg','ogg'],['midi','mid'],['sincronizacao','json']];

function checkFile(track, kind, shaKey) {
  const relativePath = track.arquivos?.[kind];
  assert.match(relativePath ?? '', /^faixas\/\d{2}\/[\w.-]+\.(?:mp3|ogg|mid|json)$/);
  const data = readFileSync(join(collection, relativePath));
  assert.ok(data.byteLength > 0, 'Arquivo vazio: ' + relativePath);
  assert.equal(createHash('sha256').update(data).digest('hex'), track.sha256?.[shaKey],
    'SHA-256 divergente: ' + relativePath);
  return data;
}

test('As 30 faixas contêm MP3, OGG, MIDI e marcadores íntegros', () => {
  assert.equal(catalog.faixas?.length, 30);
  for (const [index, track] of catalog.faixas.entries()) {
    assert.equal(track.numero, index + 1);
    const files = Object.fromEntries(formats.map(([kind, shaKey]) =>
      [kind, checkFile(track, kind, shaKey)]));
    assert.ok(files.mp3.subarray(0,3).toString() === 'ID3' || files.mp3[0] === 0xff,
      'MP3 inválido: ' + track.titulo);
    assert.equal(files.ogg.subarray(0,4).toString(), 'OggS');
    assert.equal(files.midi.subarray(0,4).toString(), 'MThd');
    const cues = JSON.parse(files.sincronizacao.toString('utf8'));
    assert.equal(cues.bpm, track.bpm, 'BPM divergente: ' + track.titulo);
    assert.ok(Array.isArray(cues.sections) && cues.sections.length, 'Seções ausentes: ' + track.titulo);
    let previous = -1;
    for (const section of cues.sections) {
      assert.ok(Number.isFinite(section.start_seconds) && section.start_seconds >= previous,
        'Seções desordenadas: ' + track.titulo);
      previous = section.start_seconds;
    }
  }
});
test('O Baile dos Elétrons v0.2 é o MP3 original', () => {
  const track = catalog.faixas[0];
  const mp3 = readFileSync(join(collection, track.arquivos.mp3));
  assert.equal(mp3.byteLength, 3203700);
  assert.equal(createHash('sha256').update(mp3).digest('hex'),
    '1a0bd1ebc54d635ce1568004d6f3510013fd1f046ae1e8c33c5fd6916f866919');
  const cues = JSON.parse(readFileSync(join(collection, track.arquivos.sincronizacao), 'utf8'));
  assert.equal(cues.bpm, 132);
  assert.equal(cues.sections.length, 6);
});
