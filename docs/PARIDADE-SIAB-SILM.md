# Matriz de paridade de telas — SIAB 1.0.0 × SILM

## Referência e regra de adaptação

- Referência visual e de interação: repositório `qui-x/acidobase`, branch `acidosebases1.0.0`.
- Projeto-alvo: `qui-x/ligacoesmetalicas`, programa principal SILM.
- O SIAB é a referência de arquitetura de interface, navegação, organização, densidade de informação, acessibilidade e responsividade.
- Conteúdo, termos, instrumentos e comportamentos químicos do SIAB não são copiados. Cada tela é adaptada à investigação de estruturas e propriedades metálicas.
- Dados, modelos, limitações e cálculos científicos do SILM permanecem sob autoridade do domínio SILM. Não se substitui uma estrutura sem suporte por CCC, CFC ou HC.

## Critérios por tela

| Tela / área | Referência SIAB | Situação SILM observada | Direção de paridade | Estado |
|---|---|---|---|---|
| Início | Hero, caminhos principais, apoio e contadores | Estrutura semelhante; textos de entrada extensos já foram reduzidos | Manter hierarquia e navegação; evitar lemas e descrições repetidas | Em revisão |
| Oficina — Foco | Workspace central, painéis laterais, barra de contexto e ações | Há estrutura equivalente com foco, Montagem, Ver, Dados e barra de ações; implementação usa camada própria sobre Base SI 0.9.17 | Comparar densidade, estados, foco, ações, persistência e comportamento responsivo | Pendente |
| Oficina — Visão geral | Título curto, ações/hint, grade e rolagem do workspace | Primeira rodada aplicada: controles compactos, aviso breve, metadados dos cartões resumidos e fontes/limites recolhidos | Preservar uma única área de rolagem; adaptar a grade ao número de metais e ao tamanho da tela | Em revisão |
| Montagem | Prateleira, preparo, objetos e módulos em grupos recolhíveis | Dock Montagem com Resumo, Preparo, Unidades, Módulo e Roteiro | Reproduzir navegação contextual, estados recolhíveis e foco; manter controles científicos próprios do SILM | Pendente |
| Ver | Famílias de visualização e detalhe contextual | Famílias de estrutura, elétrons, propriedades, instrumentos e cálculos | Reduzir texto introdutório; uma ação por vez; detalhes junto da visualização correspondente | Pendente |
| Dados | Consultas organizadas em painel próprio e retorno ao catálogo | Dados do metal, medições/cálculos e arquivos | Replicar navegação catálogo → detalhe → voltar, mantendo proveniência científica | Pendente |
| Aprender / Temas | Lista compacta, detalhe, ação de investigar e relacionados | Padrão de lista/detalhe já existe; textos específicos e curtos foram introduzidos | Alinhar hierarquia, estado de revisão, ação principal e itens relacionados | Em revisão |
| Missões | Problema, objetivo/regras, evidências, perguntas e conclusão | Registro genérico de atividade e painel lateral; parte do conteúdo aparece em blocos | Adaptar a estrutura pedagógica do SIAB às evidências de estrutura e propriedade | Pendente |
| Roteiros | Catálogo, detalhe estruturado, identificação e início da bancada | Catálogo e execução existem; comparar completude e hierarquia do detalhe | Replicar etapas e campos úteis, com módulo único por roteiro | Pendente |
| Montagens prontas | Cartões, objetivo, recursos e ação de montar | Presets configurados para metais | Replicar organização e resumo, sem repetir o procedimento na própria lista | Pendente |
| Caderno | Filtros, anotações, registros de prática, CSV, impressão e exclusão | Wrapper genérico existe, mas `notebook.enabled` está desativado no bootstrap | Ativar e implementar Caderno científico do SILM, sem copiar substâncias/leituras ácido-base | Pendente — lacuna funcional |
| Relatórios | Campos múltiplos, dados instrumentais, tabelas/gráficos e configuração | Relatório básico com Observações, Análise e Conclusão e captura contextual | Comparar campos, seções, dados, impressão e persistência; adaptar a grandezas metálicas | Pendente — paridade parcial |
| Área do Professor | Preparação detalhada, requisitos, orientação e revisão pedagógica | Formulário básico para criar, importar/exportar e abrir atividade | Expandir fluxo e guia de referência do professor; preservar regras do domínio | Pendente — paridade parcial |
| Manual | Busca, hero, atalhos, categorias, artigos, etapas, detalhes e fontes | Manual operacional mínimo, com conteúdo em desenvolvimento | Replicar arquitetura de consulta e aprofundamento, reescrevendo todo o conteúdo para o SILM | Pendente — lacuna de conteúdo |
| Menu e acessibilidade | Gaveta contextual, atividade, preferências, projetor e tour | Drawer e controles base existentes | Comparar por função e por viewport; validar teclado, leitor de tela, toque e paisagem | Pendente |

## Primeira rodada — Visão geral

Alterações feitas na branch de trabalho:

- Reduz o cabeçalho para **Estruturas recentes**.
- Encurta os controles para **Propriedade**, **Intensidade**, **Restaurar**, **Elétrons** e **Movimento**.
- Mantém um aviso breve sobre referência individual e ausência de escala comum.
- Move as limitações gerais para uma seção recolhível.
- Identifica cada cartão pelo metal e pela estrutura; remove a legenda longa repetida em cada cartão.
- Mantém fonte e limites por cartão em detalhes recolhidos.
- Retira a rolagem interna limitada a 70vh: o workspace passa a controlar a rolagem da tela.

## Ordem de execução

1. Oficina — Visão geral e Foco.
2. Montagem, Ver e Dados.
3. Aprender, Missões, Roteiros e Montagens prontas.
4. Caderno e Relatórios.
5. Área do Professor e Manual.
6. Menu, acessibilidade, mobile e homologação transversal.

Cada etapa deve ser comparada com a mesma tela do SIAB antes de ser alterada, e verificada depois em desktop, tablet e celular. A tela só é considerada alinhada quando hierarquia, densidade, navegação, estados, teclado/toque e comportamento responsivo estiverem comparados — não apenas quando os textos forem parecidos.

## Fora do escopo desta rodada

Clube de Jazz, jukebox, áudio, Blender, Babylon.js, assets e branches de Jazz. Nenhuma dessas partes integra o critério de conclusão do núcleo SILM.
