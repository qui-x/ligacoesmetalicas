# SILM — Faixa 10: Charleston Hexagonal

**Status:** maquete para avaliação; ainda não publicada no GitHub.  
**Estilo:** Charleston de salão / New Orleans hot jazz.  
**Andamento:** 140 BPM · 4/4 · Sol maior · duração: aprox. 167.1 segundos.

## Arranjo
Peça original com oito partes: trompete, clarinete, trombone, piano stride, banjo, tuba,
percussão e saxofone alto convidado. Cada sopro possui contraponto próprio; piano e banjo
se complementam; tuba alterna two-beat e walking; os pequenos solos criam variação formal.
Timbres são sintetizados com SoundFont e **não** reproduzem gravação acústica histórica.

## Seções e roteiro cênico
- Compassos 1–4: **Batidas na porta do salão** — Tuba, piano e banjo dão início à dança; metais entram em respostas curtas.
- Compassos 5–20: **Charleston — tema dos sopros** — Trompete apresenta o tema original; clarinete ornamenta e trombone responde.
- Compassos 21–36: **O clarinete atravessa o salão** — Clarinete lidera, com respostas sincopadas do trompete e pequenos floreios.
- Compassos 37–52: **Sapatos, piano e trombone** — Piano stride assume frases ornamentadas; trombone conduz contrapontos suaves.
- Compassos 53–68: **Camadas A–B — dança hexagonal** — Frases alternadas A–B entre conjuntos instrumentais; síncopas 3+3+2 inspiram os passos, sem equivalência física.
- Compassos 69–84: **Toda a banda — coro final** — Improvisação coletiva e variações do tema com harmonias mais densas.
- Compassos 85–92: **Últimos passos da pista** — Pequenos breaks e respostas solistas antes da despedida.
- Compassos 93–96: **Fecho do Charleston** — Acentos finais, resolução da harmonia e acorde de encerramento em Sol maior.

## Contexto científico
A estrutura hexagonal compacta ideal possui camadas ABAB e coordenação 12. Sua razão
ideal c/a ≈ 1,633 e o fator ideal de empacotamento é aproximadamente 0,74. Os valores
reais dependem do material e das condições; por isso, os elementos não terão seus dados
inferidos do áudio. A síncope 3+3+2 é apenas uma imagem coreográfica.

## Uso no Babylon.js
O JSON contém pulsos, eventos de notas e marcas das seções. A sincronização deve usar o
tempo real do áudio (`audio.currentTime`), respeitando pausas, saltos e retomadas. Não
reproduzir som sem interação. O WAV foi mantido fora do ZIP por ser intermediário.
