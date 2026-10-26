# Jazz e Metais — pista de dança (prévia funcional na main)

**Acesso:** a partir da Home do SILM, clique no símbolo dourado ao lado de “Ligações Metálicas. Uma investigação coletiva.”. A página abre `jazz-club/index.html`, em tela cheia do navegador. A página também pode ser acessada diretamente no GitHub Pages caso o repositório publique a branch `main` na raiz.

## Como testar
1. Na pista, escolha **Automática**, **Trio**, **Dueto + solista**, **Roda**, **Linha Charleston** ou **Troca de lugares**.
2. Ajuste **BPM** e **Intensidade** e use **Pausar dança**.
3. **Faixa incluída:** clique **Carregar “O Baile dos Elétrons” (v0.2)** e aguarde a mensagem **MP3 íntegro**. Em seguida, clique **Reproduzir faixa** ou use os controles nativos de áudio para ajustar volume, pausar ou avançar na música. É a reorquestração completa aprovada, com cerca de 2min13s e 132 BPM, dentro da temática *Mar de Elétrons*.
4. Para testar outras músicas, selecione um MP3/OGG/WAV em **Carregar outra faixa**. Nenhum arquivo importado pelo usuário é enviado ao servidor.
5. Opcionalmente, importe um JSON com marcadores e BPM, por exemplo: `{"title":"Ensaio","bpm":132,"beatOffset":0,"events":[{"time":0,"section":"intro","energy":0.3},{"time":14,"section":"refrão","energy":0.9}]}`.
6. Na falta de WebGL/Babylon, a aplicação oferece um modo visual simplificado **Canvas2D**, preservando formações, áudio e controles. A engine Babylon usa a versão hospedada em `https://cdn.babylonjs.com/babylon.js`, o que requer rede para primeira carga; o modo 2D é local.

## Escopo e advertências
- **Protótipo funcional** com três personagens provisórios: Euria (Eu/CCC), Céria (Ce/CFC), Gádia (Gd/HC).
- As estruturas no figurino são uma **metáfora pedagógica visual**; o movimento de dançarinos não representa movimento microscópico real de elétrons.
- Não usa os modelos artísticos incompletos da plateia, não altera o motor científico do SILM e não inclui 17 elementos concluídos.
- A base científica precisa de revisão individual quando os elementos e suas estruturas forem expandidos.
- A edição Babylon foi publicada como recurso estático na `main`. **Não foi possível verificar a abertura pública no GitHub Pages neste ambiente**, nem homologar GPU/WebGL e o teste automatizado Chromium; observar o resultado diretamente no navegador.
- Não é a build Vite de desenvolvimento da branch `feature/baile-eletrons-jazz-1925`; trata-se de um **adaptador para execução estática** usando scripts locais e runtime Babylon carregado online.

**Código:** `src/dance-core.js` (coreografia), `src/dance.js` (Babylon), `src/dance.css` (UI), `src/dance-fallback.js` (compatibilidade).

## Reprodução direta de “O Baile dos Elétrons”

- O MP3 aprovado v0.2 está publicado completo em `jazz-club/audio/jazz e metais/faixas/01/01_O_Baile_dos_Eletrons_v02.mp3`, com 3.203.700 bytes e SHA-256 `1a0bd1ebc54d635ce1568004d6f3510013fd1f046ae1e8c33c5fd6916f866919`.
- O carregador `src/builtin-track.js` usa o URL direto do MP3. Não há manifestos, fragmentos Base64 nem reconstrução do áudio.
- O JSON completo de sincronização fica na pasta da faixa 01. Suas seções são adaptadas ao formato aceito pelo motor de dança, sem alterar o conteúdo científico.
- A música é carregada sob demanda e precisa de interação do usuário para começar a tocar. Os 30 áudios não são adicionados ao pré-cache inicial da PWA.
- O GitHub Actions verifica os 120 arquivos da coleção por SHA-256 e decodifica o MP3 da primeira faixa com FFmpeg.
- Execute `node --test jazz-club/tests/audio-integrity.test.mjs` para repetir os testes. A reprodução no GitHub Pages ainda depende de conferir no navegador.
