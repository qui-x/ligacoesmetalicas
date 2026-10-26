# SILM — Faixa 28: Gadolínio e a Temperatura

**Status:** composição original em maquete para avaliação, sem publicação no GitHub.
**Estilo:** blues de salão / New Orleans jazz, 106 BPM, Mi bemol maior com inflexões de blues, 4/4.
**Duração renderizada:** 201.75 s. **Compassos:** 88.

## Organização musical e momentos da cena
- Compassos 1–4: **Prólogo — termômetro do salão** — Piano stride apresenta motivo; tuba e trombone entram discretamente.
- Compassos 5–20: **Tema A — ordem ferromagnética** — Motivo nítido no trompete; clarinete e trombone em improvisação coletiva.
- Compassos 21–32: **Resposta do salão — aquecimento gradual** — Clarinete toma o tema, contrapontos passam a se separar.
- Compassos 33–44: **Perto da temperatura de Curie** — Redução gradativa da densidade; frases progressivamente mais espaçadas.
- Compassos 45–52: **Além da transição — momentos independentes** — Sax tenor e piano em diálogo leve; base mais suave, sem suprimir momentos magnéticos.
- Compassos 53–68: **Retorno musical — resfriamento** — Tema é retomado aos poucos com regresso dos contracantos.
- Compassos 69–80: **Improvisação coletiva — o clube reunido** — Hot jazz completo em contraponto com sopros sobrepostos.
- Compassos 81–88: **Coda — assinatura do gadolínio** — Pequena pausa sincopada e cadência final em Mi bemol.

## Ciência: gadolínio e transição de Curie
O gadolínio metálico ordena-se ferromagneticamente abaixo de uma temperatura de Curie que costuma ser relatada em torno de 293–294 K. A transição é próxima da temperatura ambiente e depende de condições e pureza da amostra.
Acima dessa temperatura, o comportamento é paramagnético em campo nulo e os momentos locais persistem: não desaparecem os momentos eletrônicos.
A música expressa poeticamente a transição por mudanças de densidade do contraponto, não codifica valores numéricos de magnetização e nem temperatura por BPM.
Fontes: https://doi.org/10.1103/PhysRevB.57.3478 ; https://doi.org/10.1088/1361-6463/50/5/053002

## Implementação e acessibilidade
Oito partes MIDI com percussão no canal 10. O JSON contém 352 pulsações e eventos de início de notas para o Babylon.js.
No player, orientar animações por audio.currentTime. Recalcular após seek, pausar junto ao áudio e respeitar reduced motion. Não iniciar áudio automaticamente.
A maquete é reproduzida com SoundFont GM sintetizada, não representa uma gravação de músicos de estúdio.

## Arquivos incluídos
Áudio MP3 e OGG, prévia de 40 segundos, MIDI, cues JSON, gerador Python, motor de síntese e relatório técnico.
O WAV intermediário é mantido apenas na pasta de produção e não acompanha o pacote.
