# SILM — Faixa 29: O Contratempo do Disprósio

**Status:** composição original em maquete para avaliação; sem publicação no GitHub.
**Estilo:** Charleston / New Orleans hot jazz, 142 BPM, Si bemol maior com contraste em Sol menor, 4/4.
**Duração renderizada:** 164.75 segundos. **Compassos:** 96.

## Estrutura musical e direção de cena
- Compassos 1–4: **Abertura — o salão aponta o norte** — Introdução Charleston por piano, tuba e chamados dos sopros.
- Compassos 5–20: **Tema A — direção preferida** — Tema sincopado do trompete, clarinete agudo e trombone em respostas.
- Compassos 21–36: **Tema B — outro ângulo** — Melodia passa ao clarinete; acordes mudam de cor sem mudar andamento.
- Compassos 37–48: **Eixo difícil — contrapontos resistentes** — Frases em registro menor, pausas dramáticas e acentos deslocados.
- Compassos 49–60: **Eixo fácil — retorno da fluidez** — Resolução harmônica, sopros se reagrupam e improvisam juntos.
- Compassos 61–76: **Diálogo de orientação** — Troca entre trombone, saxofone alto, clarinete e trompete.
- Compassos 77–88: **Charleston coletivo — magnetismo no salão** — Improvisação simultânea da seção de sopros e dança do conjunto.
- Compassos 89–96: **Coda — assinatura do disprósio** — Pausa antes do acorde final em Si bemol.

## Fundamentação e limites científicos
A anisotropia magnetocristalina expressa a dependência da energia do sistema magnético com a orientação da magnetização em relação às direções cristalográficas.
Disprósio metálico puro possui propriedades magnéticas dependentes da direção e da temperatura. A inclusão de Dy em ímãs Nd–Fe–B pode alterar a anisotropia e melhorar a coercividade, dependendo de composição, sítios ocupados e processamento.
Esses materiais não são intercambiáveis. As mudanças de direção dos personagens e a transformação musical em modo menor são metáforas artísticas, não simulações de campo magnético ou de energia de anisotropia.
Fontes: https://doi.org/10.1103/PhysRev.109.1544 ; https://doi.org/10.1038/s41598-021-85713-5 ; https://doi.org/10.1103/PhysRevMaterials.6.084410

## Aplicação no Babylon.js
Sincronizar pela posição do áudio (audio.currentTime), com retomada correta após pausa, busca ou repetição. Não iniciar som automaticamente.
Utilizar onsets individuais para animações dos instrumentos e beat map para passos de dança; respeitar movimento reduzido e controles acessíveis.
Maquete renderizada com SoundFont General MIDI. Os timbres não substituem uma interpretação gravada por instrumentistas humanos.

## Arquivos distribuídos
MP3, OGG, prévia, MIDI, cues JSON, código fonte Python, motor de síntese e relatório de verificação. O WAV fica fora do ZIP.
