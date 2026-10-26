# Jazz e Metais — Pipeline de personagens Blender + Babylon.js
**Referência didática: CrossMind Studio · revisão 26/10/2026**

> Complementa [a especificação da plateia](JAZZ-E-METAIS-PLATEIA-CIENTISTAS.md). Este documento registra técnicas e critérios de produção; **não afirma que o curso inteiro foi assistido, que o modelo final foi esculpido ou que um personagem já está homologado**. A fase de testes continua na branch `feature/baile-eletrons-jazz-1925`.

## 1. Fontes, acesso e permissões
- Canal oficial: https://www.youtube.com/@CrossMindStudio
- Curso do autor: https://www.crossmind.com/lets-learn-animated-character-creation-in-3d/
- Visão geral pública: https://www.youtube.com/watch?v=AZrOhXdOUCI
- Capítulo **02. Head Modeling for 3D Newbies**: https://www.youtube.com/watch?v=Rb56xjcYLvQ
- Edição comercial e divisão de capítulos: https://crossmindstudio.gumroad.com/l/animatedcharacter
- Complemento aberto para retopologia, envelhecimento e expressões: https://studio.blender.org/training/realistic-human-research/
- Exportação glTF/GLB e animações NLA: https://github.com/KhronosGroup/glTF-Blender-IO/blob/main/docs/blender_docs/scene_gltf2.rst
- Controle de Animation Groups em Babylon.js: https://doc.babylonjs.com/features/featuresDeepDive/animation/animatedCharacter

**Acesso:** a divulgação do curso informa que os 10 primeiros capítulos estão disponíveis gratuitamente no YouTube; a edição premium inclui mais detalhes de rigging, animação e arquivos editáveis. Seguiremos a **metodologia pública**, o manual Blender e os documentos abertos de glTF/Babylon, **sem incorporar modelos, texturas, presets, rigs ou arquivos comerciais do professor**. Referências e conceitos são pesquisados, mas o conteúdo final precisa ser uma obra original do SILM.

## 2. Avaliação da maquete atual
O script `jazz-club/blender/build_audience.py` já permite distribuir oito cientistas em cadeiras e exportar uma **maquete de volumetria**, mas a aparência ainda é composta de primitivas (esferas, blocos e cilindros). Essa maquete é útil para posição, câmera, proporções e baixo custo de renderização, **não** para fidelidade fisionômica nem apresentação final inspirada em *Liar's Bar*.

**Nova divisão de produção:**
- `blockout` — volumetria/câmera/oclusão gerada via Python;
- `hero` — escultura e retopologia de rosto e corpo com controle artístico;
- `rigged` — deformação de pele, expressão facial, mãos e roupa;
- `web` — versão GLB otimizada e testada com Babylon.js.
Um teste do script não equivale a um personagem refinado, assim como um still no Blender não garante expressividade no Babylon.

## 3. Aplicação por capítulo do CrossMind Studio
| Conteúdo do curso | Implementação verificável no SILM |
|---|---|
| Topologia | Edge loops ao redor dos olhos e boca, pescoço/ombros e articulações adequados para deformação |
| Cabeça | Crânio, nariz, queixo, sobrancelhas, cabelo/entradas e rugas conforme retratos **com licença verificada** |
| Tronco/membros | Anatomia proporcional, mãos reconhecíveis em plano médio, postura sentada natural |
| Jacket & Shoes / Clothes | Terno década de 1920, colete, gola, lapelas, gravata, tecido não atravessa braços/cadeira |
| UV / Shading | PBR roughness/normal/baked AO com tecidos foscos, pele sem aparência plástica e iluminação no palco |
| Rigging / Weights | Rig de deformação (deform bones) exportável, controles IK apenas como ferramenta Blender |
| Pose Library / Walk / Secondary Animation | Sequências de idle sentado, atenção ao palco, anotações e aplauso contido; transições suaves |
| Final render | Revisões em 3 câmeras e 3 iluminacões, seguidas da exportação GLB e teste **no navegador**, não apenas Eevee/Cycles |

O foco do canal é um **personagem estilizado animado**, o que favorece nossa linguagem; para retratos históricos refinados será necessário complementar com estudo de fisionomia, escultura, forma e envelhecimento (Blender Studio) e revisão humana.

## 4. Personagem de calibração: Arnold Sommerfeld
**Objetivo:** uma versão hero original de Sommerfeld, ficticiamente presente na plateia de 1925. Seu trabalho quântico sobre metais é posterior ao cenário; cartão didático explicita esse anacronismo. Não criar fala ou reação atribuída como evidência histórica.

**Pacote mínimo de referências:**
- Fotos frontal/3-4/perfil, preferencialmente arquivos históricos da instituição responsável com licença documentada;
- Registro da fonte de cada imagem e direitos de uso, ou somente consulta como referência sem redistribuir a foto;
- Ficha técnica: `scientistId=sommerfeld`, altura proporcional, traços fisionômicos observados, período do figurino e variações artísticas declaradas.

**Entregáveis do personagem:**
1. concept sheet com turnaround frontal, lateral e 3/4 (aprovado);
2. `.blend` do modelo refinado organizado por `Head`, `Eyes`, `Hair`, `Torso`, `Garments`, `Hands`, `Props`, `Rig`;
3. malha de deformação retopologizada (loops perto de olhos/boca/ombros/cotovelos/punhos);
4. material de pele, cabelos e roupas (bake PBR real-time);
5. shape keys `Blink_L`, `Blink_R`, `Smile` e um leve `BrowRaise` (somente se passarem em GLB);
6. clipes de animação nomeados `idle_seated`, `look_stage`, `review_notes`, `applause_soft`, `greet`;
7. 3 níveis de detalhe testados ou seleção dinâmica de personagem hero/distant;
8. `sommerfeld.glb` com animações, proveniência e testes em Babylon.js.

**Critérios estéticos:** rosto reconhecível com referência visual; olhos, pálpebras e cabelo não parecem esferas genéricas; mãos não atravessam a mesa; materiais distinguem lã, pele e metal; iluminação âmbar preserva as feições. Nenhuma semelhança é homologada por procedimento automático.

## 5. Animação para a plateia
- Personagens destacados: `idle_seated` (respiração + piscada), `look_stage` (cabeça + olhar), `review_notes` (mãos + cartão), `applause_soft` (palmas lentas e discretas).
- Preservar as raízes `root` no chão; movimentos sentados não atravessam o assento; animar cabeça/ombros/mãos em rig em vez de deslocar o corpo inteiro.
- Variar o deslocamento temporal de cada personagem para evitar sincronização robótica; música modifica apenas tempo das reações **artísticas**, não o modelo eletrônico real.
- GlTF exporta transformações, skinning e shape keys — **simulação de tecido e shaders procedurais do Blender não são automaticamente reexecutados no Babylon**: precisam de bake ou aproximação web.
- `prefers-reduced-motion`: pose estática, painéis e legendas; não remover informações científicas.
- Não construir fala, citações ou atitudes alegadamente históricas que não estejam em fontes confiáveis.

## 6. Organização e garantia de qualidade
```text
jazz-club/
  blender/
    build_audience.py         # Maquete existente, mantida
    build_sommerfeld.py       # POC de volumes mais refinados (a desenvolver)
    hero/                     # .blend e cenas aprovadas, quando houver
  data/
    scientists.json           # Oito convidados e cartões
    character-quality.json    # Checkpoints artísticos/técnicos
  assets/
    portraits/                # Somente licenças verificadas
  web/
    characters/               # GLB otimizados (gerados, não editados à mão)
```
**Automation:** GitHub Actions pode rodar Blender em headless para gerar/validar GLB, checar arquivos e exportar preview; **a aprovação de rosto, vestuário, expressão e correspondência histórica é humana**. Reprovar clipping, topologia inadequada, deformações e licenças ausentes; não publicar GLB na `main` automaticamente.

### Critérios antes de integrar ao SILM
- [ ] Retratos e direitos de uso documentados.
- [ ] Malha própria, retopologia, UV e materiais PBR aprovados em 3 vistas.
- [ ] Pelo menos 3 gestos naturais testados, com clipes reconhecidos em Babylon.
- [ ] Metadados de nome/ano/referências corretos e leitura acessível.
- [ ] Sem alteração do `scientificState`, sem navegação quebrada ou áudio automático.
- [ ] Performance e compatibilidade real Chromium/Firefox/WebKit e mobile.
- [ ] Revisão artística concluída antes de substituir maquete por personagem final.

**Decisão operacional:** manter CrossMind Studio como referência didática principal de *workflow de personagem animado*, e documentação Blender/Babylon como especificação técnica de exportação. 
