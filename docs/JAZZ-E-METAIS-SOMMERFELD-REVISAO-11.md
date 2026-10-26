# Jazz e Metais — Sommerfeld — Revisão 11
## Retopologia local da boca e expressões no visualizador

**Data:** 26/10/2026 · **Branch:** `feature/baile-eletrons-jazz-1925`  
**Estado:** estudo original, personagem **não aprovado**.

### Objetivo
Depois da revisão 10 (anéis das pálpebras), aplicar a estratégia *topology first* do CrossMind Studio à boca de Sommerfeld. A nova malha precisa possuir fluxo de arestas para deformação, e não simplesmente linhas pintadas na face.

### Implementação
- `jazz-club/blender/facial_mouth11.py`: módulo Python puro, com **5 anéis de 64 vértices** (320 vértices, 256 quads), duas bordas abertas e cinco deformações matemáticas independentes: `Smile`, `JawOpen`, `Pucker`, `Frown`, `Speech_A`.
- `jazz-club/blender/refine_sommerfeld_11.py`: monta uma cena **Blender** a partir da revisão 09+10, preserva controlador de cabeça, anéis das pálpebras, malha principal e braços, adiciona a nova boca e abertura posterior escura como uma **maquete cênica**, e configura shape keys. Ao executar em Blender, gera `.blend` editável e `.glb` da mesma cena.
- `jazz-club/web/index.html` e `src/main.js`: menu de expressões neutra/sorriso/abrir a boca, com interpolação de `Smile` e `JawOpen` durante a animação e controle para `prefers-reduced-motion`.
- `jazz-club/tests/test_facial_mouth11.py`: testes de integridade de topologia, morfologias, abertura da mandíbula e rejeição de configurações inválidas.
- `.github/workflows/jazz-blender-audience.yml`: agora executa `refine_sommerfeld_11.py` e exige `MouthLoops11`, `MouthCavityStudy11` e os dois anéis da pálpebra na estrutura GLB.

### Testes efetuados nesta sessão
- **5 testes Python locais passaram** no mesmo módulo geométrico.
- **3 GLBs estáticos de prévia** exportados e reimportados com trimesh, nos estados neutro, sorriso e boca aberta. Cada GLB contém 234 geometrias, aproximadamente 59.654 triângulos.
- Composições de render por VTK em software, incluindo comparação Rev10/Rev11 e três poses.
- ZIP `Jazz-e-Metais-Sommerfeld-Refinamento-11.zip` criado e validado no ambiente; contém modelos, renders, fonte, testes e notas.

### Ressalvas técnicas e estéticas
- Blender **não foi executado localmente**; a instalação via repositório do sistema não funcionou por falta de resolução de DNS. Portanto, **não** foi criado nem homologado um `.blend` nesta sessão.
- As prévias GLB são **poses geométricas estáticas**, não contêm as shape keys da cena `bpy`; não substituir suas fotos por uma alegação de renderização Blender/Babylon.js.
- Execução real do GitHub Actions e qualidade da cena Babylon.js **não comprovadas**; a automação está versionada para ser testada.
- **A boca ainda é uma superfície separada** da face, sem costura topológica global: apresenta saliência artificial e precisa de escultura, retopologia integral ao redor dos músculos orbiculares, queixo, bochechas e mandíbula.
- Não há correspondência histórica homologada com Sommerfeld; o cabelo, olhos, bigode e roupa continuam caricaturais/estilizados.
- O objetivo de qualidade inspirada em *Liar's Bar* depende de modelagem manual, texturização PBR adequada, melhor fluxo de malha e animação com pesos, não apenas aumento de polígonos.
- A `main` do SILM **não foi alterada**.

### Critério da revisão 12
Integrar borda externa da boca **na malha craniana**, corrigir penetração em bochechas, nariz e bigode e conferir a mesma saída `.blend` → `.glb` → Babylon.js (incluindo Smile/JawOpen). Medir o resultado em câmera próxima e perfil. Só após Sommerfeld atingir o padrão aprovado será feito o plano do restante da plateia e dos 17 elementos.

### Referências
- CrossMind Studio, curso Animated Character Creation in 3D (metodologia pública): https://www.crossmind.com/lets-learn-animated-character-creation-in-3d/
- Biblioteca do Congresso — Sommerfeld c.1920–1925: https://www.loc.gov/item/2014715010/
- Exportador Blender glTF: https://github.com/KhronosGroup/glTF-Blender-IO
