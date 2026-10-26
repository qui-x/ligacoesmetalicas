# SILM — Faixa 27: Neodímio no Palco

**Status:** maquete original para avaliação, não publicada no GitHub.
**Estilo:** hot jazz de Nova Orleans com improvisação coletiva, 136 BPM, Si bemol maior, 4/4.
**Duração aproximada:** 171.91 s. **Compassos:** 96.

## Forma e direção de palco
- Compassos 1–4: **Abertura — luzes do palco** — Piano stride e tuba; chamada inicial de trombone.
- Compassos 5–20: **Tema A — o neodímio entra em cena** — Trompete conduz; clarinete e trombone em contraponto.
- Compassos 21–36: **Tema B — respostas da orquestra** — Clarinete toma o tema, com trompete e trombone dialogando.
- Compassos 37–48: **Chamadas cruzadas — interação dos metais** — Perguntas do trompete e respostas de clarinete, sax e trombone.
- Compassos 49–56: **Interlúdio — tensão e orientação** — Piano e tuba seguram a pulsação, com breaks sincopados.
- Compassos 57–72: **Conjunto em movimento — alinhamento artístico** — Entradas sobrepostas e harmonias em bloco, metáfora da orientação.
- Compassos 73–88: **Reprise — o tema permanece** — Motivo principal retorna com orquestra mais aberta, metáfora da remanência.
- Compassos 89–96: **Coda — assinatura do palco** — Break antes do acorde final de Si bemol.

## Associação científica
A referência é a fase tetragonal Nd2Fe14B de materiais magnéticos à base de neodímio, ferro e boro; não o Nd puro.
O ferro contribui fortemente para a magnetização, enquanto as contribuições do neodímio são importantes para a anisotropia magnetocristalina. O processamento e a microestrutura também afetam as propriedades do ímã.
Chamadas/respostas e entrada coletiva simbolizam, apenas artisticamente, orientação e magnetização; não representam valores ou escalas físicas reais.
Fontes: https://journals.iucr.org/m/issues/2025/06/00/fc5084/; https://www.nrel.gov/docs/fy24osti/88583.pdf

## Instrumentação, implementação e limites
Trompete, clarinete e trombone fazem contrapontos; saxofone alto é convidado. Piano stride, banjo, tuba e percussão sustentam o hot jazz.
MIDI: oito canais instrumentais, incluindo bateria no canal 10. JSON: 384 batidas mais todos os onsets.
Sincronização: referenciar audio.currentTime; pausas, busca e loop devem recomputar a cena; acessibilidade sem autoplay.
Os timbres são de uma SoundFont GM, não gravação real de músicos. Sem publicação no GitHub.

## Arquivos
MP3 completo, OGG, prévia MP3, MIDI, cues JSON, gerador Python, motor de áudio e relatório de verificação.
WAV incluído apenas no diretório de trabalho, não no ZIP.
