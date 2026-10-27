import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {catalogueEntries,cuesForTrack,num} from '../src/jukebox-core.js';

const dir=new URL('../audio/jazz%20e%20metais/',import.meta.url);
const source=JSON.parse(readFileSync(new URL('catalogo.json',dir),'utf8'));
const tracks=catalogueEntries(source);

test('catalogo oficial expõe exatamente 30 discos nomeados em sequencia',()=>{
 assert.equal(tracks.length,30);
 assert.deepEqual(tracks.map(t=>t.number),Array.from({length:30},(_,i)=>i+1));
 assert.equal(new Set(tracks.map(t=>t.title)).size,30);
 assert.equal(num(1),'01');assert.equal(num(30),'30');
 assert.equal(tracks[0].title,'O Baile dos Elétrons');
 assert.equal(tracks[0].bpm,132);
});
test('30 arquivos MP3 e 30 JSON musicais publicados (nao apenas metadados)',()=>{
 for(const t of tracks){
   assert(existsSync(new URL(t.mp3)),t.title+': MP3 ausente');
   assert(existsSync(new URL(t.cues)),t.title+': marcadores ausentes');
   const raw=JSON.parse(readFileSync(new URL(t.cues),'utf8'));
   const adapted=cuesForTrack(raw,t);
   assert.equal(adapted.bpm,t.bpm,t.title);
   assert(adapted.events.length>=1,t.title+': faltam batidas e secoes');
   assert(adapted.events.every(e=>Number.isFinite(e.time)&&e.time>=0));
 }
});
test('faixa 01 e MP3 original aprovado (SHA-256)',()=>{
 const bytes=readFileSync(new URL(tracks[0].mp3));
 assert.equal(bytes.length,3203700);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),
   '1a0bd1ebc54d635ce1568004d6f3510013fd1f046ae1e8c33c5fd6916f866919');
});
test('interpolacao musical utiliza os 288 pulsos e todas as 6 secoes',()=>{
 const original=JSON.parse(readFileSync(new URL(tracks[0].cues),'utf8'));
 const adapted=cuesForTrack(original,tracks[0]);
 assert.equal(original.sections.length,6);
 assert.equal(original.beats.length,288);
 assert.equal(adapted.events.length,288);
 assert.deepEqual([...new Set(adapted.events.map(e=>e.formation))],
   ['trio','linha','pares','roda','troca']);
 assert.equal(adapted.events[0].time,0);
});
test('rejeita caminhos do catalogo que escapem da biblioteca',()=>{
 assert.throws(()=>catalogueEntries({faixas:[{numero:1,titulo:'Teste',bpm:120,
   arquivos:{mp3:'../../password.mp3',sincronizacao:'faixas/01/ok.json'}}]}),
   /Metadados invalidos|Metadados inválidos/);
});
