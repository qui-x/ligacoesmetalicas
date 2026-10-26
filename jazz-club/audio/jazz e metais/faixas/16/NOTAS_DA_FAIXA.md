# SILM — Faixa 16 — Elasticidade em Azul

**Estado:** maquete original para avaliação; ainda não publicada no GitHub.
**Estilo:** Slow blues / New Orleans jazz | **BPM:** 96 | **Tom:** Fá maior / blues | **Compasso:** 4/4 | **Duração renderizada:** 182.50s.

## Banda
Trompete, clarinete, trombone, piano stride, banjo, tuba, percussão e saxofone tenor convidado.
Timbres sintetizados usando SoundFont General MIDI, não músicos reais.

## Forma e cenas
- Compassos 1–4: **Introdução — primeira tensão** — Piano em primeiro plano; trombone apresenta frase curta; clarinete sustenta resposta.
- Compassos 5–16: **Tema — deformação reversível** — Trompete expõe a melodia; clarinete e trombone desenham o contracanto.
- Compassos 17–28: **Resposta — a rede reage** — Clarinete lidera com notas mais ligadas; trompete e trombone deixam espaços.
- Compassos 29–40: **Solo — tensão e resolução** — Trombone torna-se solista; piano responde com pequenos preenchimentos.
- Compassos 41–52: **Interlúdio — azul ao piano** — Piano stride assume improviso intimista, com saxofone tenor convidado.
- Compassos 53–64: **Improvisação coletiva — o limite elástico** — Trompete, clarinete e trombone entrelaçam vozes; cresce a dinâmica.
- Compassos 65–72: **Retorno — recuperação da forma** — O motivo de abertura volta em versão reduzida; acorde final sem transformação permanente.

## Ciência — recuperação elástica
A deformação elástica é reversível ao remover a carga, no regime elástico e respeitadas as condições de validade do modelo. Não equivale a ductilidade ou deformação plástica; há comportamentos não lineares ou viscoelásticos em diferentes condições.
O retorno do tema é um recurso artístico, não uma curva tensão–deformação nem cálculo do módulo de Young.

## Integração Babylon.js / Blender
- 288 batidas e eventos de cada instrumento com tempo absoluto.
- Use audio.currentTime como relógio, inclusive após pausa, busca e retomada.
- Jukebox respeita interação inicial e oferece controles acessíveis.

## Entrega
MP3, OGG, MIDI, prévia de 40 s, JSON, código-fonte e relatório. WAV intermediário fora do ZIP.
