# Jazz e Metais — Sommerfeld · Revisão 07

**Data:** 26/10/2026 · **Ramo:** `feature/baile-eletrons-jazz-1925` · **Status:** estudo não homologado. `main` não alterada.

## O que foi executado
1. **Nova geometria facial**: maçãs do rosto e cavidades orbitais com mudanças de relevo, mandíbula e nariz menos artificiais, assimetria facial discreta. O perfil editável preserva **5.472 vértices, 5.376 quads e 7 alvos matemáticos de expressão**.
2. **Cabelo**: aumentar o volume frontal e substituir distribuição radial rígida por 26 faixas curvas suaves; ainda requer escultura específica de linha capilar e mechas para retrato histórico realista.
3. **Tratamento de superfície**: variações tonais muito discretas em pele e tecidos na prévia GLB, mais amostragem de material em render de inspeção.
4. **Materiais originais**: gerador `materials07.py` em Python padrão exporta 4 texturas PNG de 256² pixels (pele, lã, cabelo, colete). São estudos de albedo, **não PBR final** e não geram normal/roughness mapas homologados.
5. **Blender e Babylon.js**: novo `refine_sommerfeld_07.py` cria a cena a partir da implementação Blender anterior, aplica texturas aos materiais, mantém nomes de nós e sete morph targets, grava `.blend` editável e exporta GLB da **mesma cena** quando executado em Blender. O workflow do GitHub Actions foi atualizado para chamar este script.
6. **Testes locais reais**: GLB estático de prévia exportado por Python puro/trimesh, reimportado com **227 submalhas e 56.222 triângulos**; **10 testes** de geometria passaram. As quatro texturas PNG foram geradas e abertas localmente. A prévia renderizada foi feita com VTK em software (não é screenshot Babylon/Blender).
7. **Testes do workflow**: inclui verificação unitária independente para reprodutibilidade de texturas e integridade PNG, mas **o GitHub Actions, a saída nativa Blender e o resultado Babylon.js não foram homologados neste turno**.

## Artefatos
O pacote `Jazz-e-Metais-Sommerfeld-Refinamento-07.zip` foi criado no ambiente de trabalho e inclui: GLB estático do estudo, os scripts Python que o geraram, arquivos de teste, quatro PNGs de material, vistas frontal, perfil, três-quartos, close de rosto, comparação 06/07 e relatório de propriedades. O `.blend` **não** está incluído, porque Blender não está instalado neste ambiente; o GitHub Actions pode gerá-lo, condicionado à execução bem-sucedida.

## Separação dos caminhos
- **Prévia visual local:** `build_sommerfeld_07.py` + `face_anatomy_07.py` → `sommerfeld-study-07.glb` estático → VTK. Os scripts desta prévia estão no pacote de download do usuário.
- **Fonte Blender versionada:** `refine_sommerfeld_07.py` + `refine_sommerfeld_06.py` + `build_sommerfeld.py` + `face_anatomy.py` + `materials07.py` → `.blend` + GLB. Exportação ainda a executar e comparar.
- **Visualizador de navegação:** `jazz-club/web/` (Babylon.js) acompanha o GLB gerado pelo workflow; nenhum teste de GPU/Chromium/Firefox/WebKit/telefones está aprovado por esta revisão.

**Importante:** os modelos da prévia estática e do Blender usam a mesma direção de forma/materiais, mas **não são malhas idênticas**. Não usar a imagem estática como prova da exportação animável.

## Avaliação qualitativa
A revisão 07 oferece evolução incremental da linha frontal do cabelo, relevo orbital e estudo tonal do tecido; ainda **não se aproxima de uma escultura cinematográfica pronta**. A falta de realismo está ligada a topologia facial simplificada, malha de cabelo ainda esquemática, óculos e olhos rígidos, mãos pouco naturais e ausência de roughness/normal maps PBR refinados. Esses pontos exigem escultura e retopologia artística no Blender em vez de simplesmente aumentar a quantidade de curvas.

## Critério para avançar
Continuar apenas Sommerfeld. Antes de desenhar outros cientistas/protagonistas, homologar fisionomia com retratos de época, pele/roupa/cabelo em três vistas, rig de mãos e expressão, ausência de clipping, build Blender comprovada e visualização Babylon.js em desktop/mobile. **Não abrir planejamento de escala dos demais personagens até o primeiro herói aprovado.**

Referências:
- Library of Congress, Bain News Service, retrato entre 1920 e 1925: https://www.loc.gov/item/2014715010/
- CrossMind Studio: https://www.youtube.com/@CrossMindStudio
- Blender glTF exporter: https://github.com/KhronosGroup/glTF-Blender-IO
