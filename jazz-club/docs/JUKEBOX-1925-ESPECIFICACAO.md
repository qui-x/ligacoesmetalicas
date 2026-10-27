# Jazz e Metais — Jukebox 1925: especificação e contrato de implementação

**Projeto:** SILM · Clube Jazz e Metais  
**Ramo principal:** `main` · **Data:** 26/10/2026  
**Estado:** código de interface e interação publicado; exportação nativa Blender em CI **ainda sem execução bem-sucedida confirmada**. Não considerar modelo definitivo até a homologação do GLB.

## 1. Objetivo e linguagem histórica
Criar um **gabinete fonográfico cênico** de inspiração anos 1920, integrado à pista 3D, com estética art déco anterior às jukeboxes de néon típicas dos anos 1940. É uma **interpretação cenográfica**, não uma reconstituição certificada de um equipamento comercial de 1925.

A interface musical deve ter **um único catálogo e um único player** em dois modos equivalentes:
1. **Modelo 3D Blender/Babylon.js:** seleção por visor físico, botão anterior, próximo e reproduzir/pausar. Um clique inicial no gabinete enquadra o visor com a câmera; novo clique na superfície escolhe uma faixa. O botão de cena alterna entre foco do gabinete e enquadramento anterior.
2. **Painel lateral HTML acessível:** busca, filtro de coleção, lista com 30 discos, volume, player nativo, controle de reprodução, teclado e modo móvel. Serve também como alternativa quando WebGL estiver indisponível.

## 2. Modelo autoral Blender e nomes obrigatórios
**Fonte editável:** `jazz-club/blender/build_jukebox_1925.py`.  
**Saídas esperadas:** `jazz-club/assets/jukebox-1925.blend` e `jazz-club/assets/jukebox-1925.glb` via `.github/workflows/jazz-jukebox-blender.yml`.

| Mesh / peça | Comportamento em Babylon |
|---|---|
| `JB_CABINET_BODY_1925` | Clique aproxima a câmera, abrindo a inspeção cenográfica |
| `JB_SELECTION_WINDOW_1925` | Visor real com UV; **DynamicTexture** que exibe cinco músicas por página e permite clique nas linhas |
| `JB_PREV_1925` | Seleciona e reproduz o disco anterior |
| `JB_NEXT_1925` | Seleciona e reproduz o disco seguinte |
| `JB_PLAY_1925` | Reproduz/pausa o disco atual pelo player compartilhado |
| `JB_FRONT_INSET_1925`, `JB_SCREEN_BRASS_FRAME_1925`, demais partes | Geometria do móvel; clique não ativa áudio sem seleção |

**Materialidade:** mogno/noz escurecida, latão envelhecido, laca preta, pergaminho amarelado. A face texturizada do visor não é um overlay HTML; deve ser um mesh nativo Blender exportado no GLB. Babylon acrescenta a textura dinâmica e o hit-test via UV. A exportação converte Blender Z-up → glTF Y-up; o importador gira o modelo em Y (180°) para orientar a fachada para o público.

A cena mantém um **gabinete Babylon provisório**, com os mesmos nomes e interações, até o GLB real existir na pasta de recursos. **Não** rotular esse placeholder como modelo Blender final.

## 3. Visor e seleções

- Resolução da tela virtual: 1024 × 1024 para legibilidade dentro do visor físico.
- Cinco cartões por página, seis páginas para 30 composições.
- Cartão: **número, título, coleção e BPM**, com seleção realçada.
- Região inferior do visor: paginação anterior/próxima; clique muda a página, não a reprodução.
- Um clique no cartão seleciona o MP3 e, por iniciativa do usuário, inicia sua reprodução. Não reproduzir ao carregar a Home ou abrir o painel.
- Clique no corpo do gabinete: foco da câmera sem interromper música. Clique no botão físico tocar: alterna play/pause.
- O painel lateral mostra a lista completa, com busca por nome, propriedade e número, sem paginação. A seleção feita no visor reflete no painel e vice-versa.

## 4. Catálogo e sincronização

Catálogo único: `jazz-club/audio/jazz e metais/catalogo.json`.  
Biblioteca musical: `jazz-club/audio/jazz e metais/faixas/NN/`.

Dados por disco:
- `numero`, `titulo`, `colecao`, `fenomeno`, `bpm`, `duracao_segundos`;
- `arquivos.mp3` e `arquivos.sincronizacao` (JSON, relativo ao catálogo).
- Manter os **30 áudios MP3 originais**, sem converter, regravar ou alterar versões.
- `jukebox-core.js`: valida paths do catálogo, transforma beats e seções originais em marcadores normalizados.
- `jukebox-library.js`: gerencia **um** `HTMLAudioElement`, lista, volume, busca, ordem das faixas e estado selecionado.
- `dance.js` / `dance-fallback.js`: leem `media.currentTime` para sincronizar a coreografia. O carregamento tardio de marcadores não pode zerar o tempo de reprodução já iniciado.
- A **faixa 01**, *O Baile dos Elétrons v0.2*, tem 132 BPM e 288 batidas no JSON original.
- Não guardar os 30 MP3 no cache inicial da PWA. Áudios devem carregar sob demanda, permitindo streaming por HTTP.

## 5. Acessibilidade / responsividade
- Todo comando físico deve ter equivalente no painel HTML com foco visível e nome acessível.
- Gaveta fechável por botão e tecla Escape, com retorno do foco à origem.
- Volume e player nativo acessíveis ao teclado; entrada pelo ícone de jukebox da lateral.
- Em telefones, a gaveta pode ocupar quase toda a largura, sem overflow horizontal da página.
- Respeitar `prefers-reduced-motion` nas animações do disco e dos dançarinos.
- Sem exigir WebGL para selecionar ou reproduzir música; fallback Canvas2D compartilha o player e a lista.
- Altas cores e boa legibilidade são importantes no cenário escuro.

## 6. Fases de validação e aceite

**Publicação do código:** disponível na `main`, sem tocar no estado científico do laboratório.

**Aprovável apenas após evidência real:**
1. Executar GitHub Actions de Blender; verificar logs, GLB 2.0 com meshes nomeados, `.blend` e `.glb`.
2. Confirmar que o modelo Blender substitui o placeholder sem erro, preservando a textura no visor e a posição correta da face frontal.
3. Abrir GitHub Pages e realizar seleção **na geometria**, clique por UV em todas as cinco linhas e paginação até 30.
4. Verificar botão físico anterior, próximo e tocar/pausar; testar troca rápida de disco enquanto cues carregam.
5. Conferir áudio MP3 real, BPM, pausa, avanço no áudio e sincronismo da dança, além de volume.
6. Navegador Chromium desktop/mobile, Firefox e WebKit/Safari; acessibilidade e modo reduzido.
7. Validar PWA e cache: nenhuma referência a manifesto legado de áudio e nenhum download antecipado das 30 gravações.

**Situação corrente:** na última consulta de GitHub Actions, não havia execução concluída visível para a versão do workflow; a consulta a `jazz-club/assets/jukebox-1925.glb` na `main` ainda retornou arquivo inexistente. Portanto, só se pode afirmar que o **código foi publicado**, não que o Blender já exportou e o Pages já exibiu o gabinete final.

## 7. Próximos incrementos (após homologação)
Melhorar o giro/elevação da câmera e a leitura do visor em dispositivos pequenos; adicionar transições de luz de acordo com seções musicais; modular figurino/público; continuar direção de arte sem bloquear funcionalidade. Mantém-se o princípio: dança é metáfora artística, **não simulação de movimento físico de elétrons**.

## Atualização — 27/10/2026: biblioteca integrada (sem importação)
- Os controles de envio de MP3/OGG/WAV e JSON foram retirados de `jazz-club/index.html` e dos controladores 3D/2D.
- Os 30 discos são obtidos exclusivamente do `catalogo.json`, com caminhos reais incluindo espaços e acentos.
- O player prioriza MP3, usando o OGG original da mesma composição como alternativa de formato quando necessário.
- A seleção carrega os marcadores sem impedir o início da reprodução por clique.
- O relógio da dança utiliza `audio.currentTime`; não se altera BPM manualmente ao escolher uma faixa.
- Testes de navegador agora exigem carregamento e avanço do relógio do áudio oficial e ausência de campos de importação.
