import test from 'node:test';
import assert from 'node:assert/strict';
import {danceFrame,normalizeCueSheet,PERFORMERS,FORMATIONS,formationForPhrase} from '../src/dance-core.js';
const call=(seconds,extras={})=>danceFrame({seconds,bpm:120,intensity:.7,...extras});
test('3 performers and all 5 formations',()=>{
  assert.equal(PERFORMERS.length,3);
  const formations=['trio','pares','roda','linha','troca'];
  for(const form of formations){
    const frame=call(6,{formation:form});
    assert.equal(frame.formation,form);
    assert.equal(frame.cast.length,3);
    assert.equal(new Set(frame.cast.map(x=>x.id)).size,3);
    assert(frame.cast.every(x=>[x.x,x.z,x.heading,x.leftArm,x.rightArm,x.rise].every(Number.isFinite)));
  }
});
test('auto: change every 32 beats and smooth transitions',()=>{
  assert.equal(call(0).formation,'trio');
  assert.equal(call(15.9).formation,'trio');
  assert.equal(call(16).formation,'pares');
  assert.equal(call(32).formation,'roda');
  const left=call(15.98).cast[0],right=call(16.02).cast[0];
  assert(Math.abs(left.x-right.x)<.50);
  assert(Math.abs(left.z-right.z)<.50);
});
test('musical beat clock deterministic without browser',()=>{
  assert.equal(call(2).beat,4);
  assert.deepEqual(call(6),call(6));
  assert.equal(call(12,{formation:'pares',reduced:true}).cast[0].rise,0);
  const still=call(3,{reduced:true,formation:'linha'}).cast;
  assert(still.every(x=>x.leftArm===0&&x.rightArm===0&&x.leftFoot===0));
});
test('positions keep dancers apart (no overlapping roots at phrase samples)',()=>{
  for(const f of ['trio','pares','roda','linha','troca'])
    for(let seconds=0;seconds<20;seconds+=1){
      const c=call(seconds,{formation:f}).cast;
      for(let i=0;i<c.length;i++)for(let j=i+1;j<c.length;j++)
        assert(Math.hypot(c[i].x-c[j].x,c[i].z-c[j].z)>.60,
          'Collision between '+c[i].id+' and '+c[j].id);
    }
});
test('JSON music markers normalized, BPM and offset validated',()=>{
  const song=normalizeCueSheet({title:'Faixa 25',bpm:120,events:[
    {beat:8,section:'A',energy:.9},{time:1.5,section:'Intro',energy:.4}]});
  assert.equal(song.bpm,120);
  assert.equal(song.events[0].time,1.5);
  assert.equal(song.events[1].time,4);
  assert.throws(()=>normalizeCueSheet({bpm:0}),/BPM/);
  assert.throws(()=>normalizeCueSheet({bpm:300}),/BPM/);
});
