# SILM — Faixa 08: O Contratempo CCC

**Status:** primeira maquete para avaliação musical, sem publicação no GitHub.
**Estilo:** New Orleans hot jazz / jazz stomp sincopado, com improvisação coletiva.
**Andamento:** 124 BPM; **compasso:** 4/4; **tonalidade:** Si bemol maior; **duração:** aproximadamente 188.31 s.

## Direção musical
Esta é uma composição original (sem reutilização de temas das faixas 01–07),
com oito partes MIDI: trompete, clarinete, trombone, piano stride, banjo, tuba, percussão e saxofone alto convidado.
Tema principal articulado pelo trompete, segunda volta do clarinete, trio centrado em trombone/piano,
e episódio de contratempo com novas respostas antes da reunião final da banda.

## Seções e coreografia
- Compassos 1–4: **Convite sincopado** — A tuba, o banjo e o piano convidam a banda; sopros entram em pequenas respostas.
- Compassos 5–20: **Tema principal — trompete** — Trompete apresenta o motivo original; clarinete e trombone criam contracantos independentes.
- Compassos 21–36: **Segunda volta — clarinete** — Clarinete assume o tema; trompete responde com frases curtas e sax entra pontualmente.
- Compassos 37–52: **Trio — conversa de trombone e piano** — Retirada gradual dos sopros agudos, trombone protagonista e piano stride mais articulado.
- Compassos 53–68: **Episódio CCC — contratempo central** — Gestos do trombone no centro temporal dos chamados da banda; visualizar CCC no modelo científico separado.
- Compassos 69–84: **Shout chorus — conjunto reunido** — A frente de sopros toca respostas e harmonizações mais densas sem perder as vozes distintas.
- Compassos 85–92: **Break — passos suspensos** — O ritmo abre pausas coreografadas antes de uma última chamada coletiva.
- Compassos 93–96: **Coda — acorde de despedida** — Parada breve e resolução final coletiva da banda.

## Ciência e música
Estrutura cúbica de corpo centrado (CCC): átomos nos oito vértices compartilhados
e um átomo na posição central do corpo da célula convencional.
O número efetivo é 2 átomos por célula convencional e o número de coordenação é 8 no modelo ideal.
A alternância de vozes no centro da frase é uma **metáfora rítmica**, não um modelo
geométrico nem demonstração da coordenação cristalográfica.
A geometria verdadeira deve ser apresentada pelo motor científico do SILM.

## Arquivos
- MP3 e OGG estéreo; versão instrumental sintetizada (SoundFont GM, não gravação acústica profissional).
- MIDI editável com marcadores de seções; JSON de pulsação, seções e notas.
- Gerador Python reproduzível, motor de renderização e relatório técnico.
- O WAV de trabalho não integra o ZIP para reduzir o tamanho.

## Integração no Babylon.js
Usar o relógio do áudio como referência. Os eventos de nota ajudam a animar os instrumentos,
mas não descrevem movimento físico real da estrutura CCC. Reconciliar tempo ao pausar, retomar ou buscar.
