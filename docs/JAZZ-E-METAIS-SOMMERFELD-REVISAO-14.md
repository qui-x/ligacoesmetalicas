# Jazz e Metais — Sommerfeld · Revisão 14 — QA de animações

**Data:** 26/10/2026  
**Ramificação:** `feature/baile-eletrons-jazz-1925`  
**Status:** validação local do GLB realizada; teste Babylon/Blender real aguardando execução; a `main` não foi modificada.

## Por que esta revisão é diferente
Até a Revisão 13, os testes confirmavam a estrutura de morph targets e animações no glTF, mas a cadeia `Blender → GLB → Babylon.js → navegador` ainda não tinha evidência efetiva. A Revisão 14 prioriza **prova de integração e diagnóstico**, não a adição de escultura decorativa.

### Implementado na branch

- `jazz-club/web/src/main.js`: acrescentado diagnóstico **somente leitura**, disponível exclusivamente em `?qa=1`. Registra `ready`, versão WebGL, quantidade de malhas, nomes e pesos de morph targets, clipes de animação importados e expressão ativa, sem permitir mutação do estado da aplicação pelo diagnóstico.
- `jazz-club/web/tests/smoke-browser.mjs`: smoke-test Playwright/Chromium executado após exportação e build no CI. Exige:
  - carregamento do GLB no Babylon.js e do cenário 3D;
  - presença de `Smile`, `JawOpen`, `Blink_L`, `Blink_R`;
  - importação dos clipes `SmileCycle`, `JawOpenCycle`, `BlinkCycle`;
  - alteração efetiva dos pesos de sorriso, abertura da boca e retorno ao neutro;
  - screenshots de desktop (sorriso, boca aberta) e mobile;
  - modo `prefers-reduced-motion=reduce` (sem movimento automático, mas permitindo a expressão solicitada);
  - ausência de erros JavaScript e overflow horizontal mobile.
- `jazz-club/web/package.json`: configurados comandos `preview`, `qa:browser` e Playwright no ambiente do visualizador.
- `.github/workflows/jazz-blender-audience.yml`: instala Chromium no GitHub Actions e exige `npm run qa:browser` antes de entregar o artefato Babylon; preserva screenshots quando possível e continua sem publicar automaticamente na `main`.
- `jazz-club/blender/glb_clips13.py`: removida a atribuição **presumida** de nomes aos morph targets. Uma exportação sem `mesh.extras.targetNames` agora **falha**, em vez de correr risco de atribuir animação a músculos/funções errados.
- `jazz-club/tests/test_glb_clips14.py`: fixture sintética para conferir rejeição de morphs sem nomes e garantir três clipes válidos sem duplicação na reexecução.

## Evidência realmente verificada neste ambiente

**Arquivo:** `sommerfeld-13-animado.glb` da etapa anterior, com malha `PortraitFaceIntegrated12`. Foi criado um **visualizador independente** HTML/CSS/JavaScript que lê exatamente esse GLB e renderiza a malha facial, permitindo interações neutro/sorriso/boca aberta/piscar.

- O Chromium bloqueou navegação para localhost e `file://` por política do ambiente; a página foi inspecionada com conteúdo inserido diretamente na instância de navegador e GLB fornecido por data URL.
- A GPU/WebGL2 do Chromium também estava indisponível. O visualizador mudou para **fallback Canvas2D** para continuar o teste visual, sem alegar que a renderização WebGL foi validada.
- **Diagnóstico retornado do navegador:** um GLB com 10 morph targets, 3 animações e 10.752 triângulos da malha facial (5.664 vértices).
- Capturas dos três estados neutro/sorriso/JawOpen ocorreram sem erros JavaScript. Na região facial, foram contabilizados cerca de 16.482 pixels alterados entre neutro e sorriso e 24.303 entre neutro e boca aberta, com limiar de diferença de cor de 4 níveis por canal. Isso comprova **mudança visual**, não correção de anatomia.
- Pacote entregue ao usuário: `Jazz-e-Metais-Sommerfeld-QA14.zip`, contendo HTML independente, GLB original, imagens, comparação e instruções para executar a visualização local.
- **O HTML de QA14 não é o Babylon.js**; é uma ferramenta auxiliar de verificação da geometria. O visualizador principal continua sendo `jazz-club/web`.

## Não homologado
1. Blender nativo não disponível nesta sessão: **não foi gerado nem validado um novo `.blend`**.
2. GitHub Actions: consulta para o commit do workflow retornou **nenhuma execução**; não existe aprovação de build nativa até surgir um log/artifact real.
3. O Babylon.js não foi executado localmente por falta das dependências npm (rede local indisponível) e acesso WebGL2. O teste Playwright está **implementado, mas não foi executado na pipeline**.
4. A aparência da malha facial continua simples, sem olhos/cabelos/acessórios no visualizador auxiliar; os GLBs de estudo completos ainda aguardam escultura, materiais PBR, mãos com rig e prova histórica de semelhança.
5. A animação no browser independente não inclui animação de corpo/figurino: apenas deformações do crânio.

## Critério de saída da Revisão 14
A cadeia só será considerada aprovada quando existirem **artefato `.blend`** de Blender executado, GLB derivado desse `.blend`, **log de CI de sucesso**, screenshots reais Babylon.js, correspondência correta de morph targets com seus nomes, ausência de erros e teste em mobile. Até lá, manter Sommerfeld como único personagem em finalização.

## Próxima prioridade técnica
Executar/inspecionar o workflow de browser na branch; corrigir qualquer falha identificada (incluindo nomes de morphs, materialidade ou controle da câmera). Só então retomar escultura da fisionomia, cabelos e movimentos das mãos antes de homologação do personagem-padrão.

**Metodologia:** CrossMind Studio (materiais públicos, sem reprodução de assets).  
**Fonte iconográfica:** Library of Congress, A. Sommerfeld, c.1920–1925.
