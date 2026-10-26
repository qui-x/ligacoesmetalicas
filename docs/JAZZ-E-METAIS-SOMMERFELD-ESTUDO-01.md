# Jazz e Metais — Sommerfeld · marco técnico 01
**Data:** 26/10/2026
**Desenvolvimento:** branch `feature/baile-eletrons-jazz-1925`; sem alteração da `main`.

## O que está implementado em código
1. **Blender**: `jazz-club/blender/build_sommerfeld.py` gera uma **malha de base para esculpir**, com topologia quad, variações de relevo na face, cabelo, sobrancelhas, nariz, lábios/bigode, óculos, roupa de três peças, braços com hierarquia de controladores e shape keys `Blink_L`, `Blink_R`, `BrowRaise`, `Smile`. Esse modelo é **um blockout detalhado**, não a escultura fisionômica final ou um rig esquelético homologado.
2. **Babylon.js**: `jazz-club/web/` tem visualizador independente com câmera orbital, aproximação de rosto, iluminação teatral e modos `Respirar`, `Observar palco`, `Anotar` e `Aplaudir`. São animações procedurais do controlador de cabeça/braço; **não são motion capture nem animações humanas definitivas**.
3. **CI**: `.github/workflows/jazz-blender-audience.yml` instala Blender, executa geradores, confere cabeçalho/nós/morphs no GLB, faz bundle Vite/Babylon e publica um artefato de teste. **A aprovação do workflow e a renderização real não foram verificadas aqui.** Nenhuma publicação automática na `main`.
4. **Identidade**: `docs/JAZZ-E-METAIS-IDENTIDADE-MODELO-3D.md` agora define Blender+Babylon como pipeline. Removidos o workflow Unity desativado e os arquivos de projeto Unity experimentais da branch.

## Avaliação local do primeiro volume
Foi criado localmente um **GLB estático de prévia geométrica**, exportado via trimesh (não via Blender). Ele foi reimportado e validado (61 objetos de geometria; ~250 KB); também foram geradas duas vistas em software. Esse arquivo independente permite avaliar apenas volumes e não inclui shape keys, animações ou semelhança certificada com Sommerfeld.

## Limitações importantes
- Não há Blender instalado no ambiente de execução local; por isso, **não foi possível testar** a exportação de `bpy` nem obter a build real do GitHub Actions nesta etapa.
- Babylon.js não está instalado localmente e a execução WebGL não foi homologada neste ambiente; a compilação web deverá ser verificada pelos logs/artefatos do GitHub Actions.
- A face ainda precisa de **escultura artística, retrato comparativo, retopologia de deformação, olhos, cabelos, textura/UV, correção de clipping, mãos e terno** para se aproximar de um personagem de jogo da referência.
- Personagem histórico interpretado: nenhuma cena poderá fingir que houve reunião documentada com outros cientistas em 1925. Retrato-base documentado: https://www.loc.gov/item/2014715010/ .
- O roteiro do CrossMind Studio orienta o processo criativo, sem uso de arquivos proprietários do canal.
- Atualmente não há conexão do novo viewer com o snapshot científico do SILM ou com o ícone da Home. Essa integração permanece fora da `main`.

## Critérios da próxima evolução
- [ ] Corrigir problemas visuais identificados na prévia (volumes faciais, proporções olho/nariz, bigode, mãos, costeiras e mangas) com escultura humana.
- [ ] Executar e conferir o workflow `jazz-blender-audience.yml` até produzir `sommerfeld-study.glb` e `sommerfeld-study.blend`.
- [ ] Compilar Vite/Babylon e testar no navegador GPU real, conferindo nós, shape keys, câmera e 4 reações.
- [ ] Criar cabelo e roupas high-quality em Blender com mapas PBR bakeados.
- [ ] Homologar rosto em 3 vistas a partir de fontes históricas válidas; só então classificar como `hero`.
- [ ] Criar LODs mobile e testar custo de geometria, memória e FPS.
- [ ] Integrar ao espaço de plateia do clube completo, mantendo seleção opcional e ciência somente leitura.

## Referências
- Acervo fotográfico: https://www.loc.gov/item/2014715010/
- CrossMind Studio: https://www.youtube.com/@CrossMindStudio
- Khronos glTF Blender exporter: https://github.com/KhronosGroup/glTF-Blender-IO/blob/main/docs/blender_docs/scene_gltf2.rst
