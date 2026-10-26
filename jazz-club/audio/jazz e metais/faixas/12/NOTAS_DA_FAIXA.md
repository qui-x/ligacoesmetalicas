# SILM — Faixa 12 — Valsa Romboédrica

**Status:** maquete para avaliação, não publicada no GitHub.
**Estilo:** valsa jazzística retrospectiva (3/4), arranjada com instrumentos e timbres inspirados no jazz tradicional de salão.
**Andamento:** 126 BPM | **Tonalidade:** Lá bemol maior | **Duração aproximada:** 168.2 s.

## Instrumentação
Trompete, clarinete, trombone, piano de salão (stride adaptado ao 3/4), banjo, tuba, percussão e violino convidado.
A faixa é uma maquete de SoundFont GM; não é gravação acústica.

## Seções
- Compassos 1–4: **Abertura: três passos no salão** — Tuba e piano estabelecem o 3/4; chamada do clarinete e convite do trompete.
- Compassos 5–20: **Tema A: valsa sincopada** — Trompete conduz; clarinete cria ornamentação ascendente e trombone responde.
- Compassos 21–36: **Tema B: salão em movimento** — Clarinete e violino alternam a liderança; metais em resposta.
- Compassos 37–52: **Interlúdio do pianista** — Piano ganha espaço em fraseado de salão; trombone em contracanto suave.
- Compassos 53–76: **Três camadas em diálogo** — Três frases sucessivas de 8 compassos dão destaque a trompete, clarinete e violino.
- Compassos 77–92: **Improvisação coletiva** — A banda inteira contrapõe frases; banjo e piano evitam dobramentos rígidos.
- Compassos 93–108: **Reprise da valsa** — Retorno do tema principal com dinâmica crescente e variação melódica.
- Compassos 109–116: **Coda: portas do salão** — Sopros respondem e sustentam uma cadência de encerramento.

## Ciência e contexto histórico
A rede romboédrica (R) integra a família hexagonal e relaciona-se ao sistema cristalino trigonal.
Na descrição primitiva romboédrica, a=b=c, alfa=beta=gama (não necessariamente 90 graus).
A International Union of Crystallography distingue sistema cristalino trigonal de sistema reticular romboédrico.
Fonte: https://journals.iucr.org/j/issues/2026/01/00/dv5029/index.html
O compasso 3/4 é analogia artística; NÃO expressa diretamente a simetria, ângulos ou quantidades cristalográficas.
A valsa-jazz não era uma forma comum na década de 1920. Esta é uma releitura deliberadamente estilizada, usando instrumentação de época.
Sobre jazz em 3/4: https://www.everythingjazz.com/story/in-3-the-best-jazz-waltzes/

## Uso no SILM
O JSON inclui seções, 348 batidas musicais, eventos de cada instrumento, três passagens de oito compassos e relógio de sincronização.
A fonte de tempo deve ser audio.currentTime, inclusive depois de pausar ou avançar a faixa.
A geometria científica não será produzida a partir das notas: deve usar os dados homologados do SILM.
A reprodução deve ser acionada explicitamente pelo usuário na jukebox.

## Arquivos
MP3, OGG, MIDI, prévia MP3, JSON de animação, gerador Python, mecanismo de síntese e verificação. WAV é intermediário e não entra no ZIP.
