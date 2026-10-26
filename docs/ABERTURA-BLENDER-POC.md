# SILM — Estudo da abertura tridimensional (Blender + Babylon.js)
Data: 26/10/2026. Status: prova de conceito, **não homologada**.

## Fonte inalterável da identidade
A abertura deve **construir o símbolo oficial existente**, não inventar um cubo:
- `assets/silm-simbolo.svg`: projeção mestre 256×240 (8 vértices + centro interno);
- `domain/silm/abertura/silm-opening.js`: composição SVG, texto e reprodução anteriores;
- `domain/silm/abertura/silm-opening.css`: keyframes anteriores (6,1 segundos);
- `docs/IDENTIDADE-VISUAL.md`: contrato de fidelidade, acesso, preferências e correção de brilho térmico.
O SVG é uma marca institucional: não representa CC/CFC/HC nem órbitas reais.

## Escopo desta experiência
Esta ramificação acrescenta somente `opening-3d/` e seu GitHub Actions.
A `main`, a estrutura de armazenamento, os roteiros, a oficina, a abertura
legada e a ramificação do clube de jazz permanecem intocadas.

## Etapas simuladas
1. Convergência de oito nós dourados com volume;
2. Surgimento das 12 hastes com perspectiva e nó central;
3. Fita eletrônica azul curta e três partículas móveis;
4. Acentos térmicos discretos;
5. Maleabilidade (microdeformação horizontal) e ductilidade (alongamento vertical);
6. Retorno geométrico ao mestre;
7. Identidade tipográfica mantida no HTML, não como malha 3D.

A experiência usa 30 fps e 183 quadros para reproduzir 6,1 s.
Os materiais e a iluminação no Babylon diferem dos filtros SVG originais; 
a fidelidade visual fina ainda depende de revisão lado a lado.

## Fluxo de produção
```
opening-3d/blender/build_intro.py
    |
    v
GitHub Actions: Ubuntu + Blender (modo background)
    |-- silm-opening.blend (arquivo fonte editável)
    |-- silm-opening.glb (modelo glTF + keyframes)
    |
    v
Babylon.js + Vite -> HTML/JS local sem CDN
    |
    v
Artefato ZIP da execução do GitHub Actions
```
O Blender roda no CI, **não no navegador**. O navegador usa Babylon.js,
WebGL/WebGPU quando suportado, e o GLB exportado.
WebAssembly pode complementar a decodificação de malhas ou física, mas
não é pré-requisito para reproduzir animações GLB.

## Para testar
Acesse a ramificação `feature/abertura-3d-blender` em GitHub Actions:
workflow `SILM | Estudo da abertura Blender 3D`.
Quando a execução terminar com sucesso, baixe o artefato
`silm-abertura-blender-poc-<n>`. Sirva a pasta do visualizador
localmente com um servidor HTTP estático (não use `file://`).
Exemplo: `python -m http.server 8000`, no diretório do site.
Abra no navegador, veja o modelo em 3D e compare com o SVG mestre.

No Blender, abra o arquivo `.blend` entregue no mesmo artefato.
A extensão oficial do Blender é `.blend` (não `.blender`).

## Testes de aceite
- [ ] Build headless passou e gerou GLB e blend.
- [ ] GLB contém 8 vértices, 1 centro interno e 12 hastes.
- [ ] As animações existem no GLB e se reproduzem no Babylon.
- [ ] A projeção final coincide com o SVG oficial em câmera de identidade.
- [ ] Azul com trajetória curta, sem parecer órbita científica.
- [ ] Materiais dourados convincentes, sem quadrados pretos.
- [ ] Nenhum travamento em Chromium, Firefox, WebKit, mobile.
- [ ] Modo de movimento reduzido mostra o símbolo estático.
- [ ] Pular/reproduzir funciona por botão e teclado.
- [ ] UI responsiva e navegação corretas.
- [ ] Sem dependência CDN (assets do visualizador são empacotados).
- [ ] Integrar ao controlador `SimCore.opening` somente após aprovação.
- [ ] Sem modificação da `main` antes da homologação.

Referência externa didática: https://www.youtube.com/@CrossMindStudio/videos
Referência de exportação: https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html
Referência Babylon: https://doc.babylonjs.com/features/featuresDeepDive/animation/animatedCharacter

## Limites atuais
Esta etapa é um modelo procedural em **blockout refinado**, não uma animação
homologada nem uma captura renderizada testada. A execução em GitHub Actions
e a renderização real do navegador devem confirmar os resultados.
