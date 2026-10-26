# SILM — Faixa 30: A Grande Orquestra dos Metais

**Status:** composição original em maquete para avaliação; não publicada no GitHub.
**Estilo:** New Orleans hot jazz, finale de grande conjunto (doze partes), 148 BPM, Si bemol maior, compasso 4/4.
**Duração de áudio:** 203.58s. **Compassos:** 124.

## Estrutura musical e roteiro do clube
- Compassos 1–4: **Abertura — As luzes do clube** — A seção rítmica acende o salão; os sopros entram por chamada.
- Compassos 5–20: **Grande tema — A orquestra chega** — Tema inédito apresentado por trompete e respostas de clarinete/trombone.
- Compassos 21–36: **Memória I — O Baile dos Elétrons** — Motivo reconhecível da faixa 01, com acompanhamento novo.
- Compassos 37–52: **Memória II — A Dança das Redes** — Citação transportada da faixa 07, com organização de dança por formações.
- Compassos 53–68: **Os metais em movimento** — Jazz stomp com contratempos, deslocamentos e solo de trombone.
- Compassos 69–84: **O calor toma o salão** — Contraponto instrumental em duas camadas e mudança de dinâmica.
- Compassos 85–100: **As terras raras em cena** — Motivo da faixa 25, com destaque do violino e saxofones.
- Compassos 101–116: **Grande coro — toda a banda** — Tutti com doze partes, chamadas e improvisação coletiva.
- Compassos 117–124: **Coda — último acorde do clube** — Reprise do tema original, pausa coletiva e acorde final.

## Reprises temáticas do repertório
Inclui citações melódicas transpostas de faixas SILM anteriores: faixa 01 (deslocalização eletrônica), faixa 07 (redes metálicas) e faixa 25 (lantânio).
As notas e ritmos das passagens de quatro compassos estão preservados em temas_retomados.json. Os acompanhamentos são novos.

## Instrumentação
Trompete principal, segundo trompete, clarinete, trombone, saxofone alto, saxofone tenor, violino convidado, piano stride, banjo, tuba, contrabaixo acústico e percussão.
Tuba e contrabaixo alternam funções na maior parte da música; o último acorde traz ambos como efeito de finale.

## Associação científica
A suíte retoma cinco conjuntos de conceitos: (1) elétrons deslocalizados; (2) estruturas cristalinas; (3) deformação e propriedades mecânicas; (4) vibrações de rede e condutividade térmica; (5) propriedades de materiais com terras raras.
A música apenas interpreta artisticamente esses fenômenos. Não há codificação quantitativa de propriedades físicas em andamento, altura, harmonias ou coreografias.

## Aplicação na jukebox e no Babylon.js
Usar audio.currentTime como relógio do programa. As entradas individuais dos instrumentos e os tempos de seção constam do JSON e do MIDI com marcadores.
Permitir selecionar a faixa na jukebox; não reproduzir automaticamente. Suportar pause, resume, seek, loop, tecla Enter/Escape e prefers-reduced-motion.

## Limites da maquete
Áudio renderizado com SoundFont General MIDI. A execução é sintetizada e não representa uma banda humana gravada. A validação estética depende da avaliação de escuta.

## Arquivos fornecidos
MP3, OGG, MIDI multitrilha, prévia de 40 s, cues JSON, temas retomados, código-fonte da composição, motor de síntese, README e relatório de verificação. WAV não incluído no ZIP.
