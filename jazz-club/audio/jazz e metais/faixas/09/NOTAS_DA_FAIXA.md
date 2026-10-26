# SILM — Faixa 09: O Salão CFC

**Status:** maquete nova para avaliação, sem publicação no GitHub.
**Estilo:** New Orleans hot jazz / salão dançante da década de 1920.
**Andamento:** 136 BPM · 4/4 · Mi bemol maior · **Duração:** aprox. 171.9 s.

## Arranjo original
O tema desta faixa é independente das faixas anteriores. O caráter de salão se constrói pela
harmonização dos sopros em contrapontos, nas respostas curtas dos metais e na alternância do
baixo two-beat com condução caminhante; piano stride, banjo e bateria formam base rítmica.
A banda possui oito partes MIDI: trompete, clarinete, trombone, piano stride, banjo, tuba,
percussão e sax alto convidado. É uma maquete SoundFont, não gravação acústica.

## Seções musicais e cenas
- Compassos 1–4: **Abertura das portas** — Piano e banjo abrem o baile; tuba marca a caminhada e sopros surgem aos poucos.
- Compassos 5–20: **Tema do salão — trompete** — Trompete conduz um tema próprio de hot jazz, clarinete ornamente e trombone comenta abaixo.
- Compassos 21–36: **Varanda do clarinete** — Clarinete toma a frente com respostas curtas do trompete e reforços discretos do sax.
- Compassos 37–52: **Espelhos do salão — piano e trombone** — Piano stride mais solto com trombone cantabile, conversas de duas frases.
- Compassos 53–68: **CFC — seis chamadas e reunião** — Seis chamadas entre setores da banda, seguidas por sobreposição de linhas; a geometria real aparece somente no visualizador do SILM.
- Compassos 69–84: **Grande salão — shout chorus** — Sopros harmonizados e contrapontos simultâneos, com base rítmica em máxima presença.
- Compassos 85–92: **Últimas voltas — break** — Redução de dinâmica, pausas, solos curtos e preparação da coda.
- Compassos 93–96: **Saída dos dançarinos — coda** — Acorde final de toda a banda e resolução em Mi bemol.

## Contexto científico
A célula CFC convencional possui 8 vértices compartilhados e 6 centros de face compartilhados:
8×(1/8) + 6×(1/2) = 4 posições atômicas equivalentes por célula.
Na rede CFC ideal, cada átomo possui 12 vizinhos mais próximos. Nem todos os metais
assumem CFC sob quaisquer condições. A coreografia e os arranjos musicais são analogias,
não uma descrição literal da geometria ou da dinâmica eletrônica.

## Uso no SILM
O MIDI separa oito partes editáveis e contém marcadores de seções. O JSON inclui pulsos e
inícios de notas. Para Babylon.js usar o relógio de reprodução como verdade de sincronização
(inclusive ao pausar, retomar e buscar). Não disparar som automaticamente antes de interação.
O WAV é arquivo intermediário e não integra o pacote ZIP.
