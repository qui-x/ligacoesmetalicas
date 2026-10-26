# SILM — Faixa 11 — O Dobrado dos Cristais

**Status:** maquete para avaliação; não publicada no GitHub.
**Estilo:** New Orleans two-step / ragtime de salão; aproximação ao jazz dos anos 1920.
**Andamento:** 120 BPM · 4/4 · Ré maior · duração aproximada 186.5 s.

## Arranjo original
Oito partes: trompete, clarinete, trombone, piano stride, banjo, tuba, percussão e
**violino convidado**. Esta faixa tem andamento mais relaxado que a faixa 10 e apresenta
uma forma A–B–A–C, com contrapontos coletivos, seções de piano/trombone e breve solo
de violino. A sonoridade é SoundFont GM sintetizado — não é gravação acústica.

## Seções
- Compassos 1–4: **Portas do salão e two-step** — Banjo e tuba estabelecem dois tempos; piano prepara a entrada dos sopros.
- Compassos 5–20: **Tema A: o trompete convida** — Tema original sincopado, clarinete acima e trombone em contraponto grave.
- Compassos 21–36: **Tema B: resposta do clarinete** — Clarinete lidera, trompete devolve frases curtas e violino aparece entre as pausas.
- Compassos 37–52: **Trio de salão** — Trombone e piano ganham espaço; arranjo desacelera em densidade sem mudar o BPM.
- Compassos 53–68: **Quatro movimentos A–B–A–C** — Quatro subfrases de 4 compassos, A–B–A–C: analogia musical ao empilhamento ABAC, sem coordenadas físicas.
- Compassos 69–84: **Grande dobrado coletivo** — Improvisação coletiva e harmonização das vozes; final da seção com acentos em conjunto.
- Compassos 85–88: **Dois passos de despedida** — Ruptura de dinâmica, chamadas instrumentais curtas e preparação da coda.
- Compassos 89–92: **Acorde final do salão** — Resposta da banda e acorde cadencial de encerramento.

## Base científica e cautelas
A estrutura hexagonal dupla compacta (DHCP) apresenta empilhamento ABAC de planos
compactos, enquanto a HC/HCP simples apresenta ABAB. Em modelos ideais, ambas
possuem número de coordenação 12. As letras A–B–A–C usadas para organizar as frases
**não** constituem uma descrição quantitativa dos átomos ou de suas energias.
Referência: https://lampz.tugraz.at/~hadley/ss1/crystalstructure/structures/hcp/dhcp.php

## Integração no Babylon.js
Consulte o arquivo de marcações JSON: seções, batidas, notas e mini-seções A–B–A–C.
Sincronize a animação com `audio.currentTime` e recalcule estado ao pausar ou buscar.
Sons só iniciam após ação explícita do usuário na jukebox. Não desenhe estruturas
cristalinas a partir do MIDI: a cena científica utiliza dados homologados do SILM.

## Arquivos
MP3 e OGG de escuta, prévia MP3, MIDI multitrilha, JSON de sincronização,
fonte geradora, módulo de síntese e verificação. WAV é intermediário e fica fora do ZIP.
