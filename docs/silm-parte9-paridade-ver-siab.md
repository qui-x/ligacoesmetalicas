# SILM — Parte 9: navegação de módulos dentro de Ver

## Referência estudada: SIAB publicado

Repositório `qui-x/acidobase`, branch `acidosebases1.0.0`.
Arquivos: `js/ui/ver-investigacao.js`, `js/ui/workspace.js`,
`css/workspace.css` e `index.html`.

**Atenção à distinção entre dois níveis da interface:**

1. No SIAB, `VER_SECTIONS` divide o painel **Investigar** em famílias
   **Observar, Medir e Analisar**. Cada família oferece opções específicas
   (por exemplo, Partículas → Espécies → Equações ou pH → Temperatura).
2. A família **não é o módulo científico**. A seleção de módulo da atividade
   fica no estado `SIAB.state.level` e limita permissões e ferramentas.
3. O painel recorda a última opção visitada por família, preserva o foco
   durante reconstruções e oferece setas/Home/End em barras de abas.
4. No mobile, o painel direito é apresentado em *bottom sheet*, com categorias
   separadas da área da bancada.

## Adaptação para SILM

A Oficina dos Metais tem três módulos científicos reais, definidos em
`SILMIntegration.snapshot().module.active`:

| Módulo | Segundo nível de Ver | Interação científica |
| --- | --- | --- |
| **Explorar** | Observar, Camadas, Comparar | Montagem, visualização dos centros/elétrons e respostas qualitativas |
| **Medir** | Instrumentos | Seleção de pontos e registro das medidas do modelo cristalográfico |
| **Calcular** | Cálculos | Fórmulas, origem dos parâmetros e rastreabilidade dos resultados |

A troca é realizada exclusivamente pelo **seletor científico existente**
`#silm-module` (invocado pelo mesmo evento `change`). O grupo
`#silm-module-shortcuts` foi reposicionado da barra principal para o início
de `[data-right-panel="ver"]`. Não há nova variável de módulo, cópia de
modelo ou cálculo paralelo.

O componente de visualizações da Base SI já filtra os visualizadores por
`BaseDemoSI.moduleAllows(capability)`. Por isso, **não é necessário**
duplicar/forçar a visibilidade das ferramentas: ao trocar de módulo, o
fluxo existente atualiza as famílias e as ações disponíveis.

### Contratos de integridade

- A barra principal preserva **Foco / Visão geral** e **Montagem / Ver / Dados**
  e não mostra mais o seletor científico.
- Na doca **Ver**, a ordem é **módulos → famílias → ferramentas → detalhe**.
- Roteiros e missões bloqueiam a seleção se `#silm-module.disabled` for
  verdadeiro; os três botões mostram o estado desabilitado e a explicação.
- O estado da investigação (metal, estrutura, elétrons, propriedades,
  medições, cálculos e contexto da Oficina) não muda ao visitar o menu.
  Alterar o módulo muda apenas o campo de módulo e o carimbo normal de edição.
- A visibilidade da doca **Dados** e sua navegação permanecem independentes.
- No mobile, os controles têm área mínima de 44 × 44 px, rótulos visíveis,
  teclado e foco preservado; o painel continua uma única *bottom sheet*.
- Para compatibilidade provisória, os detalhes históricos de módulo
  ainda podem ser consultados em **Montagem → Módulo**. Ambos os caminhos
  acionam o mesmo `#silm-module`; não existem dois estados científicos.
- O tour de primeira visita e os estados vazios apontam para **Ver**.

### Homologação

1. Abrir Oficina sem investigação e confirmar que não há atalhos de módulo
   na barra principal.
2. Abrir **Ver**; verificar que as três escolhas estão presentes, com
   ícone, texto e um único estado ativo.
3. Alternar Explorar → Medir → Calcular → Explorar e verificar a sincronização
   com `#silm-module`, a mudança das famílias de ferramentas e a ausência
   de mutação física dos registros.
4. Repetir em desktop, 390 px e 320 px, texto a 150%, claro/escuro,
   alto contraste e navegação pelo teclado.
5. Abrir/fechar Ver e Dados diversas vezes, testar o botão Voltar, o roteiro
   que fixa o módulo, e conferir que o foco retorna ao disparador.
6. Executar CI em Chromium, Firefox e WebKit, mais regressões da lente,
   Tabela, microestrutura e motor científico.

**Limite deste PR:** reorganização da navegação. Não adiciona instrumentos
nem fórmulas e não redefine a didática dos três módulos, que será aprofundada
em etapa própria.
