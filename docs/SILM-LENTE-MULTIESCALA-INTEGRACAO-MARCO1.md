# SILM — Integração da lente multiescala ao motor científico (Marco 1)

**Branch:** `design/silm-oficina-lente-multiescala` · **Situação:** experimental, `main` inalterada.

## Direção da interface

A lente é um **instrumento visual opcional** e flutuante em uma oficina única, não uma janela modal, um segundo canvas nem uma nova camada de medições. A navegação existente **Foco/Visão geral** e **Objeto → Grãos → Rede → Centro** continua autorizando as ações científicas. Nenhuma barra lateral permanente adicional.

## Implantação técnica

| Escala | Visualizador original | Âncora de interface | Comportamento inicial |
| --- | --- | --- | --- |
| Objeto | `SILM.workshop.renderReference`, foto/representação do componente | `.silm-workshop-reference-art` | Lente móvel sobre a representação |
| Grãos | `SILM.microstructure.create`, SVG e seleção de grãos D0 | `.silm-workshop-micro-viewport` | Lente móvel; preserva contornos/seed/seleção |
| Rede | `SILM.createCrystalView`, renderizador e câmera reais | `.silm-assembly-stage` | Lente móvel sobre a rede sem interceptar arrastes externos |
| Centro | Mesmo renderizador cristalográfico e seleção de centro | `.silm-assembly-stage` | Lente interpretativa sobre o foco escolhido pelo motor |

**Arquivos criados:** `domain/silm/lens-controller.js`, `domain/silm/lens.css`. **Integração:** referências no `index.html` e cache versionado no `sw.js`. **Validação funcional:** `tests/run-lens-integration.mjs` e `.github/workflows/silm-lens-integration.yml`.

O controlador cria **um só elemento DOM** para a lente e muda apenas seu contêiner pai quando o visualizador ativo é alterado. A investigação, a escala e o objeto selecionado são determinados pelo SILM original; a lente identifica a escala pelo `data-workshop-scale` existente. Para aprofundar, o controle da lente **aciona o botão de escala original** em vez de chamar fórmulas ou reescrever o modelo.

A preferência persistida contém somente `active` e `positions` (frações normalizadas `[x,y]` para cada escala), no armazenamento local `silm:ui:lente-multiescala:v1`. A partir do Marco 2, marcações de regiões ilustrativas e grãos são guardadas **apenas em memória de UI**, vinculadas à referência do objeto; não são incorporadas ao `scientific.state`, ao snapshot de `SILMIntegration` nem exportadas como dados experimentais. A lente começa desativada se não houver preferência salva.

## Controles de uso

- Ativar/desativar a lente (alvo de 44 px) sem ocultar o desenho.
- Arrastar sobre a área visual com mouse ou toque; a lente captura eventos **somente dentro do próprio círculo**, deixando o resto da cena disponível para o motor.
- Usar setas do teclado sobre a lente para movê-la; `Shift` amplia o passo e `Home` centraliza.
- Centralizar em cada escala independentemente.
- Aprofundar enquanto há outra escala, passando pelo controle e validação já existentes.
- Alternar Foco/Visão geral: na Visão geral a lente não é exibida; ao voltar, reaparece na escala e posição preservadas.

## Salvaguardas científicas e de acessibilidade

1. A lente **não amplia fisicamente** o material nem reivindica magnificação microscópica, escala em µm ou resolução EBSD.
2. A mudança Objeto → Grãos é uma **transposição didática**, não uma correspondência espacial demonstrada entre uma fotografia da peça e um grão real.
3. O gerador de grãos, sua semente e seus polígonos não são recalculados ao manipular a lente.
4. Rede/Centro continuam usando as células, vizinhos, dados e regras dos motores científicos existentes.
5. Não criamos nem apagamos unidades atômicas, propriedades, medições ou registros quando o usuário arrasta/ativa a lente.
6. Modo alto contraste, cores forçadas, teclado, movimento reduzido e áreas de toque são cobertos pelo CSS e pela regressão.
7. A lente some quando não há visualizador ativo, quando o usuário está na Visão geral ou fora da oficina.
8. Não há scripts experimentais de microestrutura adicionados nesta etapa.

## Critérios de homologação do Marco 1

- O app inicia, encontra um metal real e mostra o controle da lente **desligado por padrão**.
- Ativar, arrastar, centralizar e navegar por teclado preservam **exatamente** o snapshot científico.
- Avançar pelas quatro escalas utiliza os botões originais; não destrói nem duplica as representações.
- Os gráficos de Grãos continuam idênticos antes/depois do deslocamento da lente.
- Ao ir para Visão geral e voltar para Foco, o DOM da lente é reinstalado e o estado anterior é conservado.
- Em 320 px, a lente permanece no quadro e os botões têm ≥44 px.
- Testes em Chromium, Firefox e WebKit, com capturas guardadas no GitHub Actions.

## Marco 2 — seleção didática pelo centro da lente (08/11/2026)

O Marco 2 acrescenta **uma única ação de marcar** (`⌖`) ao grupo compacto de controles, visível somente quando a lente está ativa em Objeto ou Grãos. `Enter` ou `Espaço` com foco na lente produz a mesma ação. **Mover sem confirmar não troca a seleção.** O resultado é exibido em uma frase breve, sem painel lateral ou modal.

### Objeto: região visual, não amostra

- O ponto de observação é o centro **visível** da lente.
- Quando houver imagem com `object-fit:contain`, a posição é verificada contra os limites reais do conteúdo desenhado; faixas vazias não contam como pontos da peça.
- A imagem é dividida **somente para localização didática**, em 3 × 3 regiões nomeadas: superior/central/inferior × esquerda/central/direita.
- A saída é `Região visual ... · imagem ilustrativa, sem amostra medida`, sem indicar metal, composição, dureza, microestrutura ou percentual de fase naquele ponto.
- A identificação da região usa frações entre zero e um **apenas na ilustração**; não é uma localização no espaço físico da amostra.

### Grãos: seleção do contorno que realmente está sob a lente

- A seleção usa os elementos `path.silm-micro-grain` **existentes**, sem gerar novos polígonos. Para cada contorno, transforma o centro de tela para o referencial do próprio SVG (`getScreenCTM().inverse()`) e verifica `isPointInFill`.
- Somente quando há um `path` contendo exatamente esse ponto, é acionado o manipulador `choose(i)` original do SILM por evento de clique no próprio path.
- O estado nativo `data-selected-grain` e o destaque acessível `aria-pressed` continuam sendo os responsáveis pela visualização. Não selecionamos o grão mais próximo se a lente está em uma região vazia.
- O texto diferencia `modelo D0 sem medição experimental` de `contorno importado não homologado`. A cor/posição do grão não determina composição química ou orientação cristalográfica.
- A verificação por matriz SVG preserva o comportamento sob **zoom de 125%**; não muda `viewBox`, semente, perfil ou contornos.

### Estado e limites

A seleção do Objeto e a seleção de Grãos são estados separados e efêmeros. Quando a referência de objeto muda, as duas marcações são descartadas. Se a microestrutura é regenerada ou importada de outra fonte, uma seleção anterior é considerada inválida se deixar de corresponder ao contorno ativo. Não há mapeamento causal/espacial comprovado **Objeto → Grãos**, apenas um encadeamento de investigação didática.

A regressão `tests/run-lens-integration.mjs` valida, nos três navegadores, uma região visual marcada, a ativação do grão real na tesselação, o resultado sem medição experimental, a estabilidade do `snapshot` do motor, o zoom SVG e a ausência de seleção automática durante o arraste. **O motor científico existente não foi alterado.**

## Próximos marcos — ainda NÃO implementados

- Alinhamento da lente aos centros/células do renderizador com critérios de clique/raio, sem interpolar coordenadas cristalográficas a partir de pixels.
- Refinamento da hierarquia Foco/Visão geral e redução de menus à luz de testes com estudantes.
- Mapeamento experimental imagem↔amostra↔EBSD — somente se fontes, corregistro e metadados reais forem homologados (não é pressuposto do SILM didático).
- Integração à `main` **somente após revisão visual**.

O objetivo atual é validar a lente **sobre o motor real**, não declarar que a transposição científica completa está resolvida.
