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

Os únicos dados da lente são `active` e `positions` (frações normalizadas `[x,y]` para cada escala), no armazenamento local `silm:ui:lente-multiescala:v1`. Posição e ativação não entram no `scientific.state` nem no snapshot de `SILMIntegration`. A lente começa desativada se não houver preferência salva.

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

## Próximos marcos — ainda NÃO implementados

- Seleção espacial de regiões **de interesse** no Objeto, claramente distinta de uma amostra real validada.
- Seleção didática de grão a partir do ponto da lente, sem confundir mapa D0 com EBSD/TrueEBSD.
- Alinhamento da lente aos centros/células do renderizador com critérios de clique/raio, sem interpolar coordenadas cristalográficas a partir de pixels.
- Refinamento da hierarquia Foco/Visão geral e redução de menus à luz de testes com estudantes.
- Homologação de responsividade e integração à `main` **somente após revisão**.

O objetivo desta fase é exercitar a lente **sobre o motor real**, não declarar que a transposição científica completa está resolvida.
