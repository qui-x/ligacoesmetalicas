import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {BUILTIN_TRACK_URL,BUILTIN_TRACK_BPM,loadBuiltinTrack,releaseBuiltinTrack} from '../src/builtin-track.js';
import {normalizeCueSheet} from '../src/dance-core.js';

// Verifies the published MP3, not a synthetic reconstruction or placeholders.
const mp3=new URL('../audio/jazz%20e%20metais/faixas/01/01_O_Baile_dos_Eletrons_v02.mp3',import.meta.url);
const cueFile=new URL('../audio/jazz%20e%20metais/faixas/01/01_O_Baile_dos_Eletrons_v02_cues.json',import.meta.url);
const expected='1a0bd1ebc54d635ce1568004d6f3510013fd1f046ae1e8c33c5fd6916f866919';

test('faixa original possui SHA256 e formato esperados',()=>{
  const data=readFileSync(mp3);
  assert.equal(data.length,3203700);
  assert.equal(createHash('sha256').update(data).digest('hex'),expected);
  assert.equal(data.subarray(0,3).toString('ascii'),'ID3');
  assert.equal(BUILTIN_TRACK_URL,mp3.href);
  assert.equal(BUILTIN_TRACK_BPM,132);
});

test('288 pulsos originais viram marcações válidas para a coreografia',async()=>{
  const original=globalThis.fetch;
  try{
    globalThis.fetch=async url=>{
      assert.equal(new URL(url).href,cueFile.href);
      return {ok:true,json:async()=>JSON.parse(readFileSync(cueFile,'utf8'))};
    };
    releaseBuiltinTrack();
    const track=await loadBuiltinTrack();
    assert.equal(track.objectUrl,mp3.href);
    assert.equal(track.cues.bpm,132);
    assert.equal(track.cues.events.length,288);
    assert.deepEqual(
      [...new Set(track.cues.events.map(c=>c.formation))],
      ['trio','linha','pares','roda','troca']
    );
    const parsed=normalizeCueSheet(track.cues);
    assert.equal(parsed.events.length,288);
    assert.equal(parsed.events[0].time,0);
    assert.equal(parsed.events[0].formation,'trio');
    assert.equal(parsed.events[16].formation,'linha');
    assert.equal(parsed.events[parsed.events.length-1].formation,'trio');
    assert(parsed.events.every(x=>Number.isFinite(x.time)&&x.energy>=0&&x.energy<=1));
  }finally{releaseBuiltinTrack();globalThis.fetch=original}
});
