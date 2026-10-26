/* Reproduz diretamente o MP3 da coleção, sem fragmentos Base64. */
const collection = new URL('../audio/jazz%20e%20metais/', import.meta.url);
const audioUrl = new URL('faixas/01/01_O_Baile_dos_Eletrons_v02.mp3', collection);
const cueUrl = new URL('faixas/01/01_O_Baile_dos_Eletrons_v02_cues.json', collection);
export const BUILTIN_TRACK_NAME = 'O Baile dos Elétrons — reorquestração v0.2';
let cached = null;
function sectionCues(sheet) {
  if (!sheet || sheet.bpm !== 132 || !Array.isArray(sheet.sections) || !sheet.sections.length) {
    throw new Error('Marcadores da faixa 01 inválidos.');
  }
  const events = sheet.sections.map(section => ({
    time: Number(section.start_seconds),
    section: String(section.name || ''),
    energy: 0.55
  }));
  if (events.some((event, i) => !Number.isFinite(event.time) || event.time < 0 ||
      (i > 0 && event.time < events[i - 1].time))) {
    throw new Error('A ordem das seções musicais é inválida.');
  }
  return {title: sheet.title, bpm: sheet.bpm, beatOffset: 0, events};
}
export async function loadBuiltinTrack() {
  if (cached) return cached;
  const response = await fetch(cueUrl, {cache: 'default'});
  if (!response.ok) throw new Error('Falha ao carregar os marcadores: HTTP ' + response.status);
  const cues = sectionCues(await response.json());
  cached = {
    objectUrl: audioUrl.href,
    cues,
    title: BUILTIN_TRACK_NAME,
    duration: 133.46
  };
  return cached;
}
export function releaseBuiltinTrack() {
  // URL HTTP(S) normal: não há Blob para revogar.
  cached = null;
}
