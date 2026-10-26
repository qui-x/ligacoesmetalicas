# Jazz e Metais — Sommerfeld, refinamento 03
**26 de outubro de 2026 · Estudo ainda em andamento · branch isolada**

## Decisão de escopo
Concentrar o trabalho em **um único cientista da plateia, Arnold Sommerfeld**, até haver aprovação de semelhança, animação, materiais, iluminação, qualidade no navegador e desempenho. **Não iniciar o planejamento de produção dos demais personagens antes da homologação do padrão.**

## Mudanças da rodada
- Face com menor excesso de volumes acessórios nos olhos, pálpebras, nariz e queixo.
- Cabelo com penteado orientado à superfície craniana e bigode com fios finos; ainda requer escultura artística e refinamento de fios.
- Traje com lapelas, botões, colete, colarinho, punhos e dobras indicativas; mãos mais delineadas.
- Ensaio local 3D exportado em **GLB estático**, com vistas frontal, 3/4, perfil e aproximação do rosto. O código de geração e o comparativo com a revisão 02 estão no pacote de ensaio enviado na conversa de aprovação.
- 4 testes geométricos do GLB passaram. Além deles, 5 testes matemáticos da malha facial haviam passado na revisão anterior.
- O script nativo de Blender `jazz-club/blender/build_sommerfeld.py` recebeu ajuste de proporções em olhos, nariz, orelhas, cabelo e bigode (commit `3676cea`), preservando a interface de 7 shape keys da malha facial.

## Duas linhas técnicas — ainda não integradas
**GLB da revisão 03:** maquete estática realizada por gerador Python offline para comparação visual. **Sem** rig ou animações e sem homologação no Babylon. O arquivo pode ser importado no Blender e convertido para `.blend` com a ferramenta acompanhante.

**Fonte Blender/Babylon na branch:** gerador `build_sommerfeld.py` e viewer `jazz-club/web/src/main.js`, com controladores e morphs experimentais. A topologia gerada no Blender e a geometria da prévia 03 **ainda não são um único asset homologado**; precisam ser reunidas e testadas no Blender real, depois no navegador.

## Registro de qualidade
| Requisito | Situação |
|---|---|
| Estudo anatômico em 3D, GLB reimportável | Concluído como protótipo |
| Aprovação fisionômica em relação a fotografias 1920–1925 | Pendente |
| Superfície contínua nariz/olhos/boca e retopologia facial de deformação | Pendente |
| Vestuário refinado, UV, normal maps e texturas real-time | Pendente |
| Rig de dedos, rosto, tronco e animações naturais da plateia | Pendente |
| `.blend` nativo da revisão 03 validado no Blender | Pendente |
| Babylon.js/GPU, compatibilidade mobile e performance | Pendente |
| Planejamento de todos os cientistas e protagonistas | Somente após aprovação do personagem-padrão |

## Critérios de aprovação futura
1. Três vistas históricas comparadas e interpretadas com fonte e licenças documentadas (sem reutilizar arte de terceiros).
2. Silhueta facial identificável, especialmente olhos, penteado, nariz, bigode e mandíbula, sem volumes artificiais.
3. Figurino 1925 convincente em close-up, sem cruzamento de roupa, mão, mesa/cadeira.
4. Rig, morphs e gestos de leitura/atenção/aplauso em cena 3D demonstrados.
5. GLB e `.blend` gerados e verificados em Blender; cena aberta no Babylon, com teclado e reduced-motion.
6. Aprovação explícita do padrão antes de duplicar componentes para os demais personagens.

Referência histórica: [Biblioteca do Congresso, A. Sommerfeld, c. 1920–1925](https://www.loc.gov/item/2014715010/), sem restrições conhecidas de publicação conforme o catálogo. A representação continua uma homenagem ficcional.
