# Jazz e Metais — Sommerfeld · Revisão 13

**26/10/2026 · Ramificação:** `feature/baile-eletrons-jazz-1925` · **Situação:** GLB animável testado em ambiente local, Blender/Babylon ainda sem homologação real.

## Objetivo
A Revisão 12 melhorou a continuidade da boca, mas entregava três GLBs estáticos. A revisão 13 testa o passo decisivo **uma única malha facial com deformações armazenadas no próprio arquivo 3D**, preparando a mesma geometria para uma cena interativa sem imagens falsas.

## Resultados executados localmente
- Base: `sommerfeld-12-neutral.glb` com **malha facial `PortraitFaceIntegrated12` de 5.664 vértices** e crânio conectado à borda da boca.
- Um **GLB 2.0** gerado por Python puro inclui **10 morph targets reais**, codificados como `mesh.primitives[0].targets[].POSITION` (deslocamentos locais por vértice), com nomes em `mesh.extras.targetNames`: `Blink_L`, `Blink_R`, `Squint_L`, `Squint_R`, `BrowRaise`, `Smile`, `JawOpen`, `Pucker`, `Frown`, `Speech_A`.
- **Três animações glTF armazenadas no arquivo**: `SmileCycle`, `JawOpenCycle`, `BlinkCycle`, usando canais `target.path='weights'` e amostras com dez pesos por quadro. Arquivo resultante com aproximadamente **1,69 MB**.
- **Quatro testes locais passaram:** integridade da geometria, dez morfologias (incluindo variações não triviais), canais de animação com contagem de pesos correta e reprodutibilidade do arquivo.
- **16 quadros renderizados com VTK** aplicando as deformações de vértices do GLB; exportados como GIF de demonstração geométrica. **Não é vídeo capturado do Babylon.js**; movimento corporal, pele e roupa não são renderizados como animação física.
- Entrega local no pacote `Jazz-e-Metais-Sommerfeld-Refinamento-13.zip`: GLB animável, GIF, imagens, fontes, testes e cópia da base geométrica da revisão 12.

## Fluxo nativo GitHub Actions ajustado
A alteração `jazz-club/blender/glb_clips13.py` lê **o GLB realmente exportado pelo Blender**, exige `SOMMERFELD_FACE_QUAD_BASE` com **pelo menos dez targets**, verifica `Smile`, `JawOpen`, `Blink_L/R` e adiciona os mesmos três clipes nomeados. A workflow `.github/workflows/jazz-blender-audience.yml` passa a executar esse validador **após exportação Blender e antes do bundle Babylon**; também rejeita builds sem malha facial única ou sem clipes. `jazz-club/web/src/main.js` interrompe os clipes importados durante o uso dos controles de expressão, evitando duas fontes concorrentes da mesma animação.

**ATENÇÃO:** nenhuma execução GitHub Actions foi encontrada para o commit de atualização da workflow; a compilação nativa `.blend`, o glTF de saída *daquele* Blender, o ambiente WebGL, os movimentos faciais no Babylon.js e o desempenho mobile permanecem **não verificados**. A pipeline não deve ser descrita como aprovada.

## Limites artísticos visíveis
A animação matemática funciona, mas a aparência do sorriso e da boca aberta ainda é rígida. A superfície paramétrica, olhos/óculos, cabelo, mãos e roupa precisam de escultura e retopologia de deformação, além de materiais PBR reais e comparação com retratos de época. O GLB usa a aparência de estudo da Rev12, **não** um render cinematográfico. A expressão facial animada não deve ser confundida com semelhança histórica.

## Próximas verificações antes da Revisão 14
1. Conferir a execução do workflow GitHub Actions da branch, recuperar e inspecionar o artefato `.blend` e a exportação GLB.
2. Abrir o mesmo GLB no Babylon.js em navegador real; verificar se morph targets e três clipes são importados com nomes, pesos e sentidos corretos.
3. Validar controles interativos e `prefers-reduced-motion`; testar Blink, Smile e JawOpen em close e três quartos, observar interpenetrações.
4. Só após estabilizar essa cadeia, retomar escultura manual, materiais e rig da plateia. **Sommerfeld continua o único personagem ativo** até homologação.

**Referências:** CrossMind Studio (metodologia pública, sem reutilização de assets), Blender, Khronos glTF 2.0, retrato de Sommerfeld no acervo da Library of Congress (ca.1920–1925).

**Isolamento:** nenhuma alteração aplicada à `main` do SILM.
