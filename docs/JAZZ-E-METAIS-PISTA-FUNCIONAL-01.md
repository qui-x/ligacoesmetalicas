# Jazz e Metais — pista de dança 3D funcional, primeiro elenco (2026-10-26)

## Mudança de prioridade
A pedido do autor, parar de usar a escultura final de Sommerfeld como bloqueio para a funcionalidade do clube. Priorizar animação, música, formações e controles. **Os personagens provisórios são placeholders, não rostos finalizados nem os 17 elementos completos**.

## Implementação versionada
- `jazz-club/web/dance.html`: cena Babylon.js em tela inteira com controles de palco, modo de movimento reduzido e entrada de faixa musical local (MP3/OGG/WAV), além de JSON opcional de marcadores.
- `jazz-club/web/src/dance.js`: palco Art Déco, luzes, três rigs procedurais de dançarinas Euria (Eu/CCC), Céria (Ce/CFC) e Gádia (Gd/HC), controladores independentes de braços, antebraços, pernas, cabeça, tronco, tornozelos por proxy e câmera orbital.
- `jazz-club/web/src/dance-core.js`: cálculos puros de BPM/tempo, 5 formações (trio, dueto com solista, roda, linha Charleston, troca) e estilos de passos como swing, Charleston, side-step e pivot. Transições graduais quando se muda a formação. Contrato imutável de entrada/saída, sem escrever em scientificState.
- `jazz-club/web/src/dance.css`: painel acessível e layout responsivo, com toque, teclado, pausa e opção de movimento reduzido.
- `jazz-club/web/vite.config.js`: build com duas entradas: estudo Sommerfeld e dança.
- `jazz-club/web/tests/dance-core.test.mjs`: casos de formação, BPM, ritmo, determinismo e risco de sobreposição de raízes.
- `jazz-club/web/tests/dance-browser.mjs`: Playwright para verificar carregamento Babylon, movimento do trio, formação, pausa, cues, viewport mobile e reduced-motion.
- `.github/workflows/jazz-dance-functional.yml`: pipeline de coreografia **independente do Blender**, com Node 22, testes puros, Vite build, Chromium e upload de artefato de teste. Não publica automaticamente na main.

## Audio / direitos
A cena pode carregar MP3/OGG/WAV que o usuário forneça, após clique explícito. O áudio não é enviado ao servidor. BPM pode ser definido manualmente ou por JSON; quando disponível, a análise de energia via Web Audio ajuda a variar amplitude da coreografia. A sincronização base é um relógio BPM musical aproximado, **não beat tracking profissional nem análise de swing real no espectrograma**. A sessão não contém acesso aos arquivos das composições mais recentes aprovadas em outra conversa, por isso não afirmar que já estejam incluídas na build Babylon.

## Prévia offline fornecida ao usuário
Uma maquete offline anterior do clube foi empacotada como `Jazz-e-Metais-Dancas-Funcionais-01.zip`: entrada por `index.html`, cena 3D WebGL2 e fallback 2D, três faixas **antigas de ensaio** para apresentação. ZIP foi validado integralmente e scripts `club.js`/`fallback-2d.js` passaram na verificação de sintaxe do Node. Essa maquete é **uma implementação distinta**, não a saída da pasta Babylon versionada nesta branch.

## Situação de validação
- Código versionado e artefato offline verificados; sem mudanças na `main`.
- Workflow Github Actions da dança preparado, mas **nenhuma execução com sucesso foi observada para o commit do workflow nesta sessão**.
- O Babylon.js não está aprovado em navegador GPU nesta sessão; não declarar testes Chromium/Firefox/WebKit aprovados.
- Os modelos são maquetes articuladas, ainda sem esqueleto completo, passos por cinemática inversa, colisão corporal rigorosa ou animação autoral validada.
- As associações CCC/CFC/HC servem como linguagem visual cênica e devem permanecer coerentes com as estruturas científicas homologadas do projeto; não atribuir trajetória de elétron física à dança.

## Próximos incrementos funcionais
- Validar Playwright de `dance.html` e corrigir eventuais falhas.
- Reconectar botão do símbolo da Home para abrir a cena completa, somente após QA da branch.
- Incluir marcadores exatos das faixas musicais aprovadas quando as mídias estiverem acessíveis; operar com faixas importadas até lá.
- Desenvolver transições coreográficas mais ricas: dueto/solista, entradas/saídas de foco, contato gestual sem interpenetrações, passos no tempo e giros suavizados.
- Adicionar as demais personagens apenas depois que coreografia e sincronização com música estiverem testadas.
