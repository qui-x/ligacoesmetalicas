/* Validate byte-exact audio reproduction from the GitHub Pages shards.
 * Run with: node --test jazz-club/tests/audio-integrity.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const folder=join(dirname(fileURLToPath(import.meta.url)),'../audio');
const prefix='01_o_baile_dos_eletrons_v02';
test('O Baile dos Elétrons v0.2 is byte-identical to the original MP3',()=>{
  const manifest=JSON.parse(readFileSync(join(folder,prefix+'.manifest.json'),'utf8'));
  const chunks=[];
  for(let i=0;i<manifest.parts;i++){
    const path=join(folder,prefix+'.part'+String(i).padStart(2,'0')+'.b64');
    const chunk=readFileSync(path,'utf8');
    assert.match(chunk,/^[A-Za-z0-9+/=]+$/);
    chunks.push(chunk);
  }
  const base64=chunks.join('');
  assert.equal(base64.length,4271600);
  const mp3=Buffer.from(base64,'base64');
  assert.equal(mp3.length,3203700);
  assert.equal(createHash('sha256').update(mp3).digest('hex'),
    '1a0bd1ebc54d635ce1568004d6f3510013fd1f046ae1e8c33c5fd6916f866919');
  assert.equal(mp3[0],0x49);assert.equal(mp3[1],0x44);assert.equal(mp3[2],0x33);
});
test('Track tempo and cue order are coherent',()=>{
  const cue=JSON.parse(readFileSync(join(folder,prefix+'.cues.json'),'utf8'));
  assert.equal(cue.bpm,132);
  assert.equal(cue.events.length,6);
  assert(cue.events.every(x=>Number.isFinite(x.time)&&x.time>=0));
  assert(cue.events.every((x,i)=>i===0||x.time>=cue.events[i-1].time));
});
