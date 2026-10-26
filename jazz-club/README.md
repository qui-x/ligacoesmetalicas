# Jazz e Metais — pista de dança (prévia funcional na main)

**Acesso:** a partir da Home do SILM, clique no símbolo dourado ao lado de “Ligações Metálicas. Uma investigação coletiva.”. A página abre `jazz-club/index.html`, em tela cheia do navegador. A página também pode ser acessada diretamente no GitHub Pages caso o repositório publique a branch `main` na raiz.

## Como testar
1. Na pista, escolha **Automática**, **Trio**, **Dueto + solista**, **Roda**, **Linha Charleston** ou **Troca de lugares**.
2. Ajuste **BPM** e **Intensidade** e use **Pausar dança**.
3. Para sincronizar com suas músicas, escolha um MP3/OGG/WAV em **Carregar faixa** e clique em **Reproduzir faixa**. Nenhum áudio é enviado ao servidor. Como as músicas mais recentes não estavam disponíveis no repositório, elas **não estão embutidas** nesta primeira publicação.
4. Opcionalmente, importe um JSON com marcadores e BPM, por exemplo: `{"title":"Ensaio","bpm":132,"beatOffset":0,"events":[{"time":0,"section":"intro","energy":0.3},{"time":14,"section":"refrão","energy":0.9}]}`.
5. Na falta de WebGL/Babylon, a aplicação oferece um modo visual simplificado **Canvas2D**, preservando formações, áudio e controles. A engine Babylon usa a versão hospedada em `https://cdn.babylonjs.com/babylon.js`, o que requer rede para primeira carga; o modo 2D é local.

## Escopo e advertências
- **Protótipo funcional** com três personagens provisórios: Euria (Eu/CCC), Céria (Ce/CFC), Gádia (Gd/HC).
- As estruturas no figurino são uma **metáfora pedagógica visual**; o movimento de dançarinos não representa movimento microscópico real de elétrons.
- Não usa os modelos artísticos incompletos da plateia, não altera o motor científico do SILM e não inclui 17 elementos concluídos.
- A base científica precisa de revisão individual quando os elementos e suas estruturas forem expandidos.
- A edição Babylon foi publicada como recurso estático na `main`. **Não foi possível verificar a abertura pública no GitHub Pages neste ambiente**, nem homologar GPU/WebGL e o teste automatizado Chromium; observar o resultado diretamente no navegador.
- Não é a build Vite de desenvolvimento da branch `feature/baile-eletrons-jazz-1925`; trata-se de um **adaptador para execução estática** usando scripts locais e runtime Babylon carregado online.

**Código:** `src/dance-core.js` (coreografia), `src/dance.js` (Babylon), `src/dance.css` (UI), `src/dance-fallback.js` (compatibilidade).
