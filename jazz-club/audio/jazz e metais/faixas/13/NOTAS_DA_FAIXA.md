# SILM — Faixa 13 — Entre Núcleos e Notas

**Estado:** composição original em maquete para avaliação; sem publicação no GitHub.
**Estética:** blues com instrumentação de jazz tradicional de Nova Orleans; solistas alternados e improvisação coletiva arranjada.
**Andamento:** 108 BPM | **Tonalidade:** Fá maior/blues | **Compasso:** 4/4 | **Duração:** 189.2s.

## Instrumentação
Trompete, clarinete, trombone, piano stride, banjo, tuba, percussão suave e sax tenor convidado.
Os timbres são digitalmente sintetizados a partir de SoundFont General MIDI; não é performance acústica ou gravação histórica.

## Forma e direção de palco
- Compassos 1–4: **Introdução: luz baixa e piano** — Pianista, banjo e tuba introduzem o blues; clarinete prepara a entrada da banda.
- Compassos 5–16: **Tema: unidade do conjunto** — Trompete apresenta melodia; clarinete tece uma resposta aguda.
- Compassos 17–28: **Resposta: vozes complementares** — Clarinete assume a liderança; trompete toca frases curtas e espaçadas.
- Compassos 29–40: **Blues do trombone** — Trombone canta a frase principal; banda sustenta acordes e deixa pausas.
- Compassos 41–52: **Conversa ao piano** — Piano improvisa e responde aos sopros; sax tenor entra discretamente.
- Compassos 53–64: **Improvisação coletiva** — Sopros entrelaçados com banjo, piano e tuba; aumenta a dinâmica.
- Compassos 65–76: **Retorno: entre núcleos e notas** — Tema do trompete regressa com respostas dos demais.
- Compassos 77–84: **Coda: equilíbrio do salão** — Banda reduz a intensidade e conclui em conjunto num acorde de F6.

## Associação científica e limites
As interações eletrônicas e iônicas, a energia do sistema e as condições do material importam para a coesão metálica e a estabilidade de suas estruturas.
O diálogo entre instrumentos é apenas uma metáfora para organização coletiva. Nenhum intervalo musical, nota, pausa, andamento ou dança é uma medição de energia, força ou estabilidade.
O SILM deve manter dados científicos e geometrias a partir de fontes homologadas, independentemente dos arquivos de áudio.

## Integração Babylon.js / Blender
- JSON com oito seções, 336 batidas e início/duração/intensidade de cada nota, por instrumento.
- Usar audio.currentTime como relógio ao pausar, retomar e avançar.
- Reprodução via jukebox somente após interação do usuário; permitir silenciar e ajustar volume.
- Animar a atuação da banda pelas notas, mas jamais derivar estrutura metálica real desses eventos musicais.

## Conteúdo do pacote
MP3, OGG, MIDI multitrilha, prévia de 40 s, JSON de sincronização, gerador Python, motor de síntese e verificação.
O WAV intermediário não é incluído no ZIP.
