# Jazz e Metais — Sommerfeld · Refinamento 06

**Data:** 26/10/2026  
**Escopo:** um único personagem da plateia. **Situação:** estudo geométrico, sem homologação de fisionomia histórica ou de desempenho em navegador.

## Decisões desta revisão
A qualidade inspirada em *Liar's Bar* depende especialmente de silhuetas, volumes anatômicos, materiais, cabelos e expressividade; a simples adição de polígonos não é suficiente. Por isso, a revisão 06 troca alguns elementos decorativos cilíndricos por **malhas de superfície curvilínea/tapering**, preservando objeto editável.

- **Face:** cavidade orbital um pouco mais definida, arredondamento de maçãs do rosto, mandíbula ajustada e assimetria discreta; nariz integrado ao mesmo perfil facial de quadriláteros.
- **Olhos:** contornos superiores e inferiores com linhas curvas/superfícies estreitas; sobrancelhas com massa e fibras suaves.
- **Bigode:** duas superfícies cônicas afiladas e fios curtos, próximos ao lábio superior; evita duas peças ovais totalmente separadas.
- **Cabelo:** superfície capilar em anéis com linha frontal irregular, mechas de acabamento discretas e detalhes temporais. Ainda necessita escultura de mechas com topologia orgânica.
- **Paletó:** lapelas com superfícies em grade, arqueamento discreto e pregas leves, em vez de grandes triângulos sem volume.
- **Mãos:** mantém quatro dedos segmentados + polegar por mão do estudo 05, **sem rig humanoide completo**.

### Artefatos de avaliação local
O pacote disponibilizado no chat chama-se `Jazz-e-Metais-Sommerfeld-Refinamento-06.zip`, incluindo:
- `sommerfeld-study-06.glb` — **prévia estática** exportável, 220 submalhas e aproximadamente 55.900 triângulos;
- `sommerfeld-06-vistas.png`, `sommerfeld-06-rosto.png`, `sommerfeld-05-vs-06.png` — renders offline por VTK, não captura Babylon;
- `build_sommerfeld_06.py` e `face_anatomy_06.py` — gerador/curvas da prévia estática;
- `assemble_blender_06.py` — script para importar esse GLB em Blender e salvar `.blend`/GLB com malha facial e sete shape keys, **ainda não executado neste ambiente**;
- `test_sommerfeld_06.py` — dez testes de integridade que passaram localmente;
- `render_study_06.py` e `sommerfeld-06-manifest.json`.

**Atenção:** Blender não está instalado no ambiente local desta conversa. Portanto, nenhuma renderização `bpy`, arquivo nativo `.blend`, animação humana final ou interação WebGL/Babylon foi validada nesta rodada. A aprovação da qualidade histórica e estética depende de revisão humana.

### GitHub (trabalho isolado)
1. `jazz-club/blender/face_anatomy.py`: parâmetros faciais revistos na revisão 06 para servir aos modelos editáveis.
2. `jazz-club/blender/refine_sommerfeld_06.py`: gerador de estudo **diretamente em Blender/bpy**, com cabelo em superfície de malha, sobrancelhas, pálpebras, bigode e lapelas curvadas, salvando o projeto `.blend` e exportando GLB. É a implementação **experimental Blender**; não é binariamente idêntica à prévia `trimesh` anexada.
3. `.github/workflows/jazz-blender-audience.yml`: passou a executar o novo gerador Blender e entregar artefatos de teste; **execução e sucesso do workflow ainda não foram confirmados**.
4. `jazz-club/web/`: viewer Babylon.js da etapa anterior permanece à espera da exportação 06 validada.

**Não atualizar a `main`**, nem a aplicação científica, antes da avaliação visual e técnica do personagem e do suporte desktop/mobile/offline.

## Débitos de qualidade que impedem concluir Sommerfeld
1. Rosto ainda com aparência geométrica, sem escultura manual em correspondência com retratos históricos: o ideal exige maior atenção a testa, olhos, nariz, bigode, cabelo e queixo.
2. Óculos precisam ser confrontados com as fotos históricas e não usados como marca de identidade sem documentação.
3. Cabelo necessita camadas finas, materiais anisotrópicos aproximados e melhor integração ao couro cabeludo.
4. Faltam materiais PBR realmente texturizados (UV, normal/roughness/AO bakeados) no Blender; o preview local emprega cor sólida e luz de estúdio.
5. Mãos precisam ter uma deformação testada de contato e animações de expressão, observação, anotações e aplauso.
6. A malha da maquete e a saída do gerador bpy devem ser reconciliadas após inspeção da compilação; conferir diferenças de aparência, topologia, nome de nós e animações.
7. Falta confirmar browser Chromium, Firefox, Safari/WebKit, perfil econômico mobile e acessibilidade `prefers-reduced-motion`.

## Próxima revisão 07
Somente **Sommerfeld**: escultura/fisionomia histórica, mechas capilares mais críveis, materialidade de pele e lã, correção dos dedos e integração visual da mesma exportação `.blend` → GLB → Babylon.js. **Não iniciar outros cientistas** antes de homologação.

## Fontes
- Histórico de fisionomia: Library of Congress, A. Sommerfeld, c.1920–1925, https://www.loc.gov/item/2014715010/
- Blender, export glTF 2.0: https://docs.blender.org/manual/en/4.0/addons/import_export/scene_gltf2.html
- CrossMind Studio (referência didática, sem reutilização de arquivos): https://www.youtube.com/@CrossMindStudio
