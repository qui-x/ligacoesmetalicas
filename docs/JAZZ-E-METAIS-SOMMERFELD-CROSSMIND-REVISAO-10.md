# Jazz e Metais — Sommerfeld — Revisão 10
## Aplicação da metodologia de personagens animados de CrossMind Studio
**Data: 26 de outubro de 2026 · Branch isolada `feature/baile-eletrons-jazz-1925`**

> Esta revisão representa um **marco técnico de topologia facial**. Não é um modelo homologado, nem uma alegação de ter assistido ao curso pago na íntegra, nem uma reprodução de assets ou personagens da CrossMind Studio. O objetivo de acabamento inspirado em *Liar's Bar* continua pendente.

## O que aprendemos a partir do currículo público
A estrutura de **Animated Character Creation in 3D** da CrossMind Studio organiza o processo em: topologia → cabeça → tronco/membros → figurinos e acessórios → UV cleanup → shading/materials → render still → armature/Rigify → painting de pesos → poses e movimentos secundários. Trata-se da apresentação oficial dos conteúdos e dos capítulos abertos, não de reprodução do curso pago.

A aplicação técnica necessária no **nosso** personagem é priorizar anéis de arestas onde haverá deformações, preservar a malha para UV, evitar acessórios que escondem problemas de forma e testar expressões em animação antes de declarar a aparência concluída. Complemento técnico: Blender Studio, *Stylized Character Workflow*, capítulo *Clean Retopology* (planejamento de retopologia facial, edge flow e articulações).

### Conteúdo de referência consultado
- Canal CrossMind Studio: https://www.youtube.com/@CrossMindStudio
- Curso original / capítulos: https://www.crossmind.com/lets-learn-animated-character-creation-in-3d/
- Descrição detalhada original: https://crossmindstudio.gumroad.com/l/animatedcharacter
- Blender Studio — Clean Retopology: https://studio.blender.org/training/stylized-character-workflow/
- API Blender glTF: https://github.com/KhronosGroup/glTF-Blender-IO

## Implementação real nesta revisão
**Novo módulo autoral `jazz-club/blender/facial_topology10.py`:**
- 4 loops concêntricos em malha de quadriláteros para cada olho: **192 vértices / 144 quads por olho**.
- O loop externo acompanha o contorno orbital e o interno marca o vão ocular, sem tentar esconder os olhos com cilindros flutuantes.
- Morph targets independentes `Blink_L`, `Blink_R`, `Squint_L`, `Squint_R` e `BrowRaise`.
- Valida automaticamente dois contornos (interno e externo), simetria bilateral, invariância topológica e fechamento dos olhos no target de piscada.
- Código puro Python, reusável em Blender e na geração de prévias, **sem arquivos extraídos do curso**.

**Novo `jazz-club/blender/refine_sommerfeld_10.py`:**
- Reutiliza uma única cena Blender da revisão 09, agora exposta por `assemble_scene(out)`; remove pálpebras primitivas anteriores.
- Cria `EyeSocketLoops10_L/R` sob `HEAD_ANCHOR`, com suavização de normais, UV inicial para os loops e shape keys correspondentes.
- Preserva a malha facial editável original e os controladores de cabeça/braço.
- Quando rodar no Blender, salvará `.blend` e `.glb` da **mesma cena**. Esses arquivos **não foram produzidos por Blender neste ambiente**.

**CI atualizada:** `.github/workflows/jazz-blender-audience.yml` invoca `refine_sommerfeld_10.py`, faz o `unittest discover` dos testes e exige os dois nós `EyeSocketLoops10_L/R` no JSON do GLB. Não publica automaticamente na `main`. **Nenhum workflow concluído foi confirmado na sessão.**

## Testes e prévia local
- **4 testes independentes passaram:** contagens/arestas, piscadas independentes, simetria, rejeição de parâmetros inválidos.
- Um GLB **estático** de prévia foi produzido a partir da revisão 09, substituindo os arcos superiores/inferiores por superfícies trianguladas da **mesma fórmula** dos loops; exportado e reimportado com sucesso.
- Esse GLB possui **233 geometrias e 59.142 triângulos**, abaixo da revisão 09 porque os arcos decorativos anteriores foram retirados.
- Comparação visual frontal produzida em software VTK. **Não é imagem Blender/Babylon** nem prova da suavidade da animação.
- **A prévia estática não contém os shape keys reais**; eles são criados pela versão `bpy` e continuam pendentes de teste de exportação/visualização.

## O que continua faltando para o padrão `Liar's Bar`
- A malha principal do rosto continua uma superfície paramétrica por anéis **sem retopologia manual integral dos loops da boca e olhos**. A nova pálpebra é uma malha separada; não se deve apresentar isso como retopologia final da face.
- Falta retopologia localizada também ao redor da boca e das junções das narinas; finalização de cabeça/orelha/cabelo em modelagem de jogo.
- Escultura de fisionomia comprovada por retratos históricos, materiais PBR UV refinados, rugosidade/normal, cabelo realista estilizado e peso de deformação de mãos/braços.
- É necessário confirmar Blender headless no GitHub Actions, renderizar o **GLB exportado** no Babylon, testar piscadas/foco/controles, custo GPU, clipping de pálpebra/globo ocular e mobile.
- A previsão de expansão para outros cientistas e 17 elementos fica condicionada à aprovação do personagem-padrão.

## Critério da revisão seguinte
Validar a nova região ocular animada **com o mesmo GLB no Blender e no Babylon.js**, corrigir profundidade e fechamento visual das pálpebras, depois iniciar retopologia orgânica ao redor da boca. Não voltar a ampliar ornamentos sem primeiro corrigir topologia e materiais.
