# Jazz e Metais — Sommerfeld · Revisão 12
**Data:** 26 de outubro de 2026 · **Branch isolada:** `feature/baile-eletrons-jazz-1925`.

## Avanço: costurar a boca ao rosto
A revisão 11 mostrava uma malha de lábios independente sobreposta ao crânio. Na revisão 12, a fonte `jazz-club/blender/face_integration12.py` **remove 192 faces da malha facial** em uma região controlada, reaproveita **64 vértices do contorno craniano** e adiciona **três anéis internos com 64 vértices cada**. Esses anéis compartilham faces/arestas com o crânio, formando uma única malha facial conectada, com pequeno vão interno da boca (não mais um adorno sobreposto).

O resultado mantém **5.664 vértices, 5.376 faces quadrangulares e dez alvos geométricos** (sete anteriores + `Pucker`, `Frown` e `Speech_A`); os alvos `Smile` e `JawOpen` foram suavizados depois de conferir a deformação em imagens estáticas. Há 64 arestas internas abertas na região dos lábios. Por decisão geométrica, existe um disco escuro **separado e recuado**, que é apenas fundo visual da boca; não é cavidade anatômica completa.

## Implementação no Blender e visualizador
- `face_integration12.py` é a **fonte pura Python** reutilizada pelo gerador local de prévia e pelo Blender.
- `refine_sommerfeld_12.py` monta a cena Blender da revisão 09, conserva os anéis de olhos da revisão 10, substitui `SOMMERFELD_FACE_QUAD_BASE` por uma **única malha com boca costurada** e acrescenta dez shape keys a ela. Grava `.blend` e exporta GLB da mesma cena **somente quando executado com êxito no Blender**.
- `jazz-club/web/src/main.js` já oferece os controles `Smile` e `JawOpen` do ciclo anterior; na revisão 12 passam a agir sobre o mesmo objeto craniano, não sobre `MouthLoops11`.
- `.github/workflows/jazz-blender-audience.yml` foi atualizado para invocar a revisão 12 e rejeitar o nome legado `MouthLoops11` no GLB. Não publica na `main`.

## Resultados locais reais
- Três **GLBs estáticos** exportados e reimportados: `sommerfeld-12-neutral.glb`, `sommerfeld-12-smile.glb`, `sommerfeld-12-jawopen.glb`.
- Cada um possui a malha `PortraitFaceIntegrated12` e **não** contém a malha flutuante `MouthLoops11`.
- A validação geométrica retornou: **5.664 vértices, 5.376 quads, 64 arestas de abertura bucal, 256 arestas de contorno da malha craniana** (192 nas extremidades superior/inferior, mais 64 na boca), **10 morphs**; o vão vertical do lábio passou aproximadamente de **0,012 m para 0,0325 m** no alvo `JawOpen`.
- **Cinco testes locais passaram** (contagem e integridade, costura ao crânio, alvos compatíveis, abertura e reimportação dos três GLBs).
- Vistas geradas por VTK em software: três expressões e comparação das revisões 11/12.
- Pacote entregue na conversa: `Jazz-e-Metais-Sommerfeld-Refinamento-12.zip` com os três GLBs, imagens, gerador e testes.

## Limitações e riscos, sem homologação antecipada
- Blender não está disponível no ambiente local; **não foi executado o gerador nativo nem produzido um `.blend` real** nesta rodada.
- **Nenhum workflow concluído foi confirmado** para a alteração da CI (consulta do commit correspondente retornou zero execuções).
- As três prévias GLB são **poses estáticas**, sem shape keys armazenadas nelas. Não constituem captura do Babylon.js.
- A boca está **topologicamente conectada**, mas precisa de escultura e melhor retopologia final: expressão do sorriso ainda rígida, volume de bochecha e queixo simplificado, possibilidade de clipping do bigode, e cavidade interna ilustrativa.
- Os olhos da revisão 10 ainda são malhas próprias e não integram integralmente a topologia craniana.
- A fisionomia de Sommerfeld não está historicamente homologada; faltam rig completo de mãos/pele, materiais PBR finais, desempenho WebGL e teste mobile.
- Referência visual: Library of Congress, Bain News Service (c.1920–1925), https://www.loc.gov/item/2014715010/ .
- Metodologia: CrossMind Studio, https://www.youtube.com/@CrossMindStudio ; modelos são originais e não reproduzem assets do curso.

## Próxima prioridade
**Revisão 13 — testar a build real e a animação antes de esculpir mais.** Precisamos executar o workflow, recuperar artefato `.blend` e GLB, abrir a mesma malha em Blender e Babylon.js e verificar **em movimento** `Smile`, `JawOpen` e `Blink`, além de detectar colagem, faces invertidas e clipping. Depois avançar para anatomia, cabelo e materialidade que aproximem a direção de arte do padrão desejado.

Não iniciar os outros cientistas até homologar Sommerfeld como referência, conforme decisão anterior. A `main` do SILM permanece inalterada.
