# SILM — Faixa 22: Vibrações da Rede

**Status:** maquete original para avaliação; não publicada no GitHub.
**Gênero:** hot jazz / jazz de Nova Orleans, com tema em Sol menor e andamento de 140 BPM (4/4).
**Duração renderizada:** 167.07s, incluindo a cauda de reverberação. **Compassos:** 96.
**Instrumentos:** trompete, clarinete, trombone, piano stride, banjo, tuba, percussão, sax tenor convidado.

## Estrutura musical
- Compassos 1–4: **Introdução — piano e vibração inicial** — Piano e tuba estabelecem a pulsação; clarinete sugere pequeno motivo repetido.
- Compassos 5–20: **Tema A — trompete em movimento** — Trompete apresenta o tema; clarinete ornamenta e trombone responde.
- Compassos 21–36: **Tema B — ondas de contraponto** — Clarinete assume a liderança; trombone sustenta contracantos graves.
- Compassos 37–52: **Ostinato — movimento coletivo** — Piano e tuba alternam pequenas células; metais entram em defasagem artística.
- Compassos 53–60: **Respiro — piano e percussão** — A banda diminui e piano conversa com percussão e trombone.
- Compassos 61–76: **Improvisação coletiva — conjunto completo** — Trompete, clarinete e trombone entrelaçam frases; sax tenor aparece pontualmente.
- Compassos 77–92: **Retorno — ecos do tema** — Tema principal retorna com variações e pausas complementares.
- Compassos 93–96: **Coda — acorde de encerramento** — Pausas preparatórias, resposta dos sopros e acorde final em Sol menor.

## Fenômeno científico
A rede metálica pode sofrer movimentos vibracionais coletivos em torno das posições de equilíbrio. Fônons são quanta dos modos normais de vibração da rede. A alternância e sobreposição instrumental é uma metáfora didática dessa coletividade.
O ritmo da música não estabelece frequências atômicas, dispersão dos fônons ou energia térmica: isso depende do material e do modelo físico.

## Integração com Babylon.js
O JSON traz marcações de seções, 384 pulsações e eventos separados por instrumento para sincronizar integrantes da banda e dançarinos. Usar audio.currentTime, não o relógio do renderizador, e ressincronizar após pausar/avançar.

## Limitações
Maquete sintetizada com SoundFont GM, não uma gravação de músicos reais. A escuta do usuário decidirá se o arranjo será aprovado.
