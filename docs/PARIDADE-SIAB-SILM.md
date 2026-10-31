# Plano operacional de paridade — SIAB 1.0.0 × SILM

> Documento de referência e execução da branch `refactor/silm-copy-slim-20261030`. Esta matriz deixa de ser apenas descritiva: os itens abaixo são a lista operacional de comparação, implementação, teste e aceite. Atualizar os estados e o registro de execução após cada tela.

## 1. Objetivo, escopo e regras

**Referência:** `qui-x/acidobase`, branch `acidosebases1.0.0` (SIAB 1.0.0).

**Alvo:** `qui-x/ligacoesmetalicas`, programa principal SILM.

**Branch de trabalho:** `refactor/silm-copy-slim-20261030`.

O SIAB é referência de arquitetura de interface, navegação, densidade de informação, hierarquia, estados, acessibilidade e comportamento responsivo. Não é fonte de conteúdo científico para o SILM. Cada tela precisa ser adaptada à investigação de estruturas e propriedades metálicas.

Regras inegociáveis:

- Preservar identidade visual, linguagem e conteúdo científico próprios do SILM.
- Não copiar conceitos, fórmulas, instrumentos, substâncias ou leituras ácido-base.
- Preservar dados, unidades, fontes, condições de referência, proveniência e limitações.
- Não criar valores, propriedades, ferramentas ou resultados sem suporte científico validado.
- Não substituir estrutura sem suporte por CCC, CFC ou HC apenas para preencher visualização.
- Distinguir dado tabelado, representação didática, medição do modelo e cálculo teórico.
- Não confundir Histórico da investigação, Caderno, relatório, registro de atividade e Desfazer.
- Não introduzir pontos, níveis, ranking, metas percentuais ou progressão obrigatória. Missões e roteiros devem continuar repetíveis.
- Cada roteiro deve continuar associado a exatamente um módulo: Explorar **ou** Medir **ou** Calcular.
- Manter um metal por investigação; comparações devem preservar diferenças de condições e fontes.
- O Clube de Jazz permanece fora do escopo: não trabalhar em jukebox, áudio, Blender, Babylon.js, modelos, recursos, assets ou branches internos do clube. O símbolo do SILM pode permanecer no Início como marca estática, sem atalho para o Clube de Jazz.

## 2. Estados operacionais

Use os estados abaixo nas tarefas:

- `[ ] Pendente`: não comparado ou não executado.
- `[~] Em andamento`: primeira implementação existe, mas falta comparação, teste ou homologação.
- `[x] Verificado`: implementado, comparado e testado; evidência registrada.
- `[!]` Bloqueio: depende de decisão, fonte, dado validado ou correção externa.

Uma tarefa não pode ser marcada como concluída apenas por reduzir textos ou reproduzir cores. O aceite depende de estrutura, navegação, estados, comportamento, acessibilidade, responsividade e integridade científica.

### Ciclo obrigatório para cada tela

1. Examinar a tela SIAB na branch de referência e registrar componentes, ordem, grupos, ações e estados.
2. Examinar o equivalente SILM e classificar o que existe, o que é parcial e o que falta.
3. Anotar diferenças antes de editar.
4. Implementar na branch de trabalho, preservando `main`.
5. Comparar os dois programas no mesmo viewport.
6. Testar fluxos principais, estados vazios, erros, retorno e persistência.
7. Verificar teclado, leitor de tela, foco, toque e layout em tamanhos relevantes.
8. Registrar capturas e resultados de testes.
9. Só então avançar para a próxima tela da ordem principal.

## 3. Arquitetura: fonte correta para as mudanças

### Fonte de entrada e geração

A página principal `index.html` da raiz é gerada a partir de **`integracao/index.html`** pelo script `scripts/build-main-entry.cjs`. Portanto:

- Alterações permanentes de marcação devem ser feitas primeiro em `integracao/index.html`.
- A entrada da raiz deve ser regenerada no build e conferida depois.
- Uma mudança feita somente no `index.html` gerado pode desaparecer na compilação seguinte.
- Mudanças nos arquivos-fonte devem ser acompanhadas da regeneração do service worker quando aplicável.

### Mapa de responsabilidades atual

| Arquivo/área | Responsabilidade observada | Regra operacional |
|---|---|---|
| `integracao/index.html` | Fonte da entrada integrada; Home, navegação e marcação do workspace | Fonte primária da estrutura da página; regenerar `index.html` |
| `integracao/adapter.js` | Alternância de rotas, estado da cena, foco, armazenamento e integração do domínio | Verificar ciclo de vida e foco depois da troca de tela |
| `integracao/route-ui.js` | Catálogos/execução de Missões e Roteiros, sessão guiada, orientações, relatório | É o fluxo específico atual de atividades orientadas e relatório na entrada integrada |
| `integracao/unified-ui.js` | Conteúdo da Home, Temas, Caderno, Manual e Área do Professor | Conferir esta implementação ativa antes de alterar serviços genéricos de nome semelhante |
| `integracao/workspace-family.js` | Módulos, famílias de visualização, painéis e consultas de Dados | Preservar um estado científico único entre painéis |
| `integracao/structure-comparison.js` | Visão geral e comparação de estruturas recentes | Não inventar escala comum, ranking ou geometria não suportada |
| `integracao/workspace-family.css`, `integracao/integration.css`, `integracao/silm-theme.css` | Layout integrado, identidade e adaptação dos painéis | Evitar rolagens concorrentes, desalinhamento e alvos pequenos |
| `domain/silm/bootstrap.js` | Configuração do domínio, módulos, Montagem, Ver, Dados, presets, tour e relatórios | Manter textos, ações e disponibilidades compatíveis com os contratos científicos |
| `domain/silm/routes.js`, `missions.js`, `themes.js` | Catálogos e validação de roteiros, missões e temas | Adaptar apresentação sem enfraquecer regras de validação |
| `domain/silm/route-session.js` | Sessão guiada, tentativas, checkpoint, conclusão, retorno e campos do relatório | Preservar transições atômicas e restauração da investigação livre |
| `domain/silm/manual.js` | Tópicos, categorias, conteúdo, detalhes e referências do Manual | Completar arquitetura e conteúdo específico do SILM |
| `js/experience/*` | Serviços genéricos da Base SI: shell, tema, Caderno, relatório, professor, tour | Não assumir que o serviço genérico é a tela que o usuário vê; confirmar quem o chama |
| `integracao/upstream/*` | Base SI 0.9.17 incorporada | Preservar como referência/base; adaptar pela API pública, evitando edição local desnecessária |

### Duas verificações arquiteturais obrigatórias

1. **Caderno:** `notebook.enabled:false` no bootstrap genérico desativa o Caderno opcional da Base SI, mas não desativa a página principal do SILM. A entrada integrada atual implementa o Caderno em `integracao/unified-ui.js` e o aciona por `integracao/route-ui.js`. Auditar e corrigir o fluxo ativo; não criar um segundo Caderno concorrente.
2. **Área do Professor:** o renderer atual acionado em `integracao/unified-ui.js` mostra Tabela Periódica e fontes; existe também um serviço genérico em `js/experience/teacher.js` com formulário básico, rascunho, revisão, abertura como aluno e JSON. Antes de ampliar a tela, decidir/documentar um único fluxo oficial para a entrada integrada.

## 4. Ordem principal confirmada

A sequência dos menus principais de SIAB e SILM é:

| Ordem | SIAB | SILM | Estado inicial |
|---:|---|---|---|
| 1 | Início | Início | `[~]` primeira rodada aplicada; homologação pendente |
| 2 | Aprender / Temas | Aprender / Temas | `[ ]` |
| 3 | Missões | Missões | `[ ]` |
| 4 | Roteiros Experimentais | Roteiros Experimentais | `[ ]` |
| 5 | Laboratório | Oficina dos Metais | `[ ]` |
| 6 | Caderno | Caderno | `[ ]` |
| 7 | Manual | Manual | `[ ]` |

Depois das sete telas principais, comparar os recursos secundários na ordem visível dos menus: recursos de bancada/tour, Professor e apoio pedagógico, preferências/acessibilidade/projetor e recursos do aplicativo. Relatórios são fluxo contextual e serão tratados em uma etapa própria.

## 5. Checklist operacional por tela

### 1 — Início

**SIAB:** `index.html` (`data-tela="inicio"`), `js/telas/inicio.js`.

**SILM:** `integracao/index.html` (`data-view="inicio"`), `integracao/unified-ui.js` (`home()`), `integracao/upstream/home-fidelity.css`.

Elementos de referência: sobretítulo, título com destaque, lema, símbolo, seção “Escolha seu próximo passo”, frase de apoio, caminho principal destacado, caminhos secundários, metas dinâmicas e apoio no rodapé.

- [x] Remover o atalho do Clube de Jazz do hero e manter o símbolo institucional SILM estático.
- [x] Adaptar o lema para “Monte. Observe. Meça. Calcule.”.
- [x] Incluir “Da curiosidade à descoberta” como frase de apoio dos caminhos.
- [x] Destacar a Oficina dos Metais como caminho principal.
- [x] Corrigir singular/plural das contagens de temas, desafios e roteiros.
- [x] Preservar retomada da atividade e resumo da investigação em andamento.
- [x] Manter Manual, Área do Professor e Preferências no apoio do Início; o relatório continua acessível pelo contexto de Dados.
- [x] Replicar a marcação no template `integracao/index.html`, que é a fonte geradora.
- [ ] Executar build e confirmar a geração correta do `index.html` da raiz.
- [ ] Comparar a composição SIAB × SILM no mesmo viewport: proporção do símbolo, quebra do título, lema e espaço do hero.
- [ ] Conferir todos os destinos dos cartões e foco no título após entrada/retorno.
- [ ] Verificar atualização dos contadores após nova anotação, conclusão, remoção e retomada.
- [ ] Testar 320 px, 390 px, tablet, desktop e paisagem, sem rolagem horizontal.
- [ ] Guardar capturas e resultado de teste.

**Aceite:** hero equilibrado; marca sem link de Jazz; caminho principal evidente; cartões legíveis e sem descrições redundantes; contadores corretos; retomada funcional; links do rodapé operacionais; foco e responsividade aprovados.

### 2 — Aprender / Temas

**SIAB:** `js/telas/aprender.js`.

**SILM:** `integracao/unified-ui.js` (`themes()`), `domain/silm/themes.js`.

O SIAB usa lista compacta com título, resumo e estado de revisão; o detalhe enfatiza uma ação para investigar, conteúdos relacionados e marcador simples. O SILM já tem conceitos por blocos (ideia principal, observar no SILM, interpretação e limites), metais relacionados, fontes, missões e roteiros.

- [ ] Comparar a lista: hierarquia de título/resumo, estado e ação de abertura.
- [ ] Reduzir a altura da lista e evitar repetir todo o conteúdo científico em cada cartão.
- [ ] Alinhar o marcador ao conceito simples de revisão/conclusão; sem pontuação ou progressão obrigatória.
- [ ] Na página de detalhe, manter os blocos conceituais próprios do SILM e recolher explicações longas.
- [ ] Destacar “Investigar no Laboratório” como ação principal.
- [ ] Separar missões, roteiros, temas e metais relacionados, evitando links duplicados.
- [ ] Mostrar somente relações válidas e fontes associadas ao conteúdo.
- [ ] Garantir retorno à lista e restauração do tema selecionado.
- [ ] Testar marcador reversível, armazenamento, revisita e repetição.
- [ ] Validar teclado, leitor de tela, mobile e estado sem itens/resultados.
- [ ] Registrar capturas e testes.

**Aceite:** lista escaneável; detalhe com hierarquia; ação principal evidente; limites e fontes preservados; relações funcionais; estado simples e reversível.

### 3 — Missões

**SIAB:** `js/telas/missao.js`.

**SILM:** `integracao/route-ui.js` (`catalogue(true)`, `guidance()`, `complete()`), `domain/silm/missions.js`, `domain/silm/route-session.js`.

A referência organiza problema, objetivo/regras, etapas acionáveis, contexto/evidências recolhíveis, perguntas, conclusão, feedback e ações Concluir/Refazer/Relatório. O SILM já tem catálogo, seleção de metal, validação, sessão e critério; falta comparar a apresentação e a completude pedagógica.

- [ ] Comparar lista, título, resumo, status e abertura do detalhe.
- [ ] Organizar detalhe em problema, objetivo, condições/pré-requisitos, recursos permitidos e evidências.
- [ ] Separar a instrução principal de contexto/explicações complementares; usar detalhes recolhíveis.
- [ ] Exibir perguntas registradas para investigação, sem inventar conteúdo.
- [ ] Mostrar o que o estudante deve fazer na Oficina e quais ferramentas estão liberadas.
- [ ] Diferenciar critério científico de conclusão de simples clique.
- [ ] Apresentar estados ativa, concluída, interrompida e disponível para refazer.
- [ ] Manter Concluir e Encerrar como ações distintas.
- [ ] Preservar a investigação livre ao entrar e encerrar.
- [ ] Testar checkpoint, transição atômica, retomada e restauração.
- [ ] Vincular relatório à sessão e às evidências realmente produzidas.
- [ ] Registrar conclusão no Caderno sem confundir com Histórico da investigação.
- [ ] Testar missões de módulos distintos quando existirem exemplos válidos.
- [ ] Validar foco, feedback, teclado, toque e mobile.

**Aceite:** problema, objetivo, evidência e critério compreensíveis; conclusão verificável; repetição permitida; estado anterior recuperável.

### 4 — Roteiros Experimentais

**SIAB:** `js/telas/roteiros.js`.

**SILM:** `integracao/route-ui.js` (`catalogue(false)`, `enter()`, `guidance()`), `domain/silm/routes.js`, `domain/silm/route-session.js`.

O SIAB oferece lista e detalhe estruturado com identificação, módulo, problema/pergunta, objetivo, passos, recursos e preparação da bancada. O SILM já tem objetivos, pré-requisitos, ferramentas permitidas, metais elegíveis, fontes, orientação e critério.

- [ ] Comparar lista de roteiros: título, resumo e módulo; retirar metadados redundantes.
- [ ] Estruturar detalhe em identificação, problema/pergunta, objetivo, pré-requisitos, procedimentos, recursos, evidências e critério.
- [ ] Definir necessidade dos campos Nome, Turma/Grupo, Data e Professor para relatório SILM.
- [ ] Exibir módulo único de cada roteiro; não permitir módulo secundário.
- [ ] Mostrar condições e limitações de referência antes de iniciar.
- [ ] Limitar seleção aos metais elegíveis para o roteiro e estrutura exigida.
- [ ] Exibir somente instrumentos e ferramentas efetivamente disponíveis.
- [ ] Manter fontes ligadas a dados e procedimentos.
- [ ] Destacar ação de preparar/iniciar a investigação.
- [ ] Diferenciar tentativa ativa, interrompida, concluída e refazer.
- [ ] Preservar investigação livre e restaurá-la ao encerrar.
- [ ] Testar retomada, relatório de roteiro concluído e retorno à lista.
- [ ] Validar um roteiro de cada módulo quando houver exemplos.
- [ ] Testar teclado, foco, retorno e mobile.

**Aceite:** roteiro autossuficiente e executável; módulo único; metal elegível; condições/fontes visíveis; estado e retorno confiáveis.

### 5 — Oficina dos Metais

**SIAB:** `js/telas/laboratorio.js`, `js/ui/workspace.js`, `prateleira.js`, `modulos.js`, `gaveta.js`, `css/workspace.css`.

**SILM:** `integracao/index.html`, `integracao/adapter.js`, `integracao/workspace-family.js`, `integracao/structure-comparison.js`, `integracao/workspace-family.css`, `domain/silm/bootstrap.js`.

A barra do workspace apresenta **Foco → Visão geral → Expandir**; os lançadores de painéis são **Montagem → Ver → Dados**. A comparação da Oficina será realizada nessa ordem: **Foco → Visão geral → Montagem → Ver → Dados**. A Visão geral já recebeu uma primeira rodada anterior e precisa de revisão formal quando chegarmos aqui.

#### 5.1 Foco

- [ ] Comparar escala e posicionamento da cena central.
- [ ] Testar estados vazios: sem metal, metal selecionado sem montagem, montagem livre, estrutura cristalina e módulo restrito.
- [ ] Conferir título/contexto, metal, símbolo e estado da investigação.
- [ ] Conferir ação principal, Adicionar unidade, Organizar estrutura, Desfazer e Limpar estrutura.
- [ ] Testar habilitação/desabilitação e mensagens de cada ação por estado.
- [ ] Remover texto repetido entre cena, dock e contexto.
- [ ] Verificar redimensionamento com painéis abertos, fechados e expandidos.
- [ ] Conferir expansão da estrutura e retorno à vista anterior, com foco restaurado.
- [ ] Confirmar que expansão só se habilita em estrutura cristalina organizada.
- [ ] Evitar rolagens internas concorrentes.
- [ ] Testar montagem, movimento, Desfazer, Limpar, salvar e restaurar.

#### 5.2 Visão geral

- [~] Primeira rodada aplicada em `integracao/structure-comparison.js` e `integracao/workspace-family.css`; ainda não homologada.
- [ ] Comparar a grade e título com a referência SIAB.
- [ ] Verificar agrupamento, ordem e quebra dos controles em telas estreitas.
- [ ] Garantir que cada estrutura preserve sua referência/condição; não alegar escala comum.
- [ ] Explicar limites sem repetir parágrafos longos em cada cartão.
- [ ] Distinguir dado tabelado, modelo didático, visualização e elegibilidade para medir/calcular.
- [ ] Manter fonte e limite específico por cartão em detalhes recolhidos.
- [ ] Testar grade vazia, número variável de cartões e limite de recentes.
- [ ] Conferir que intensidade/propriedade não induzem ranking de metais.
- [ ] Usar rolagem natural da página/workspace; não recriar contêiner interno de 70vh.
- [ ] Testar metais/estruturas sem suporte completo sem fabricar geometria ou instrumento.

#### 5.3 Montagem

- [ ] Comparar os grupos SIAB com Resumo, Metal/Preparo, Estrutura/Unidades, Propriedades, Módulo e Roteiro do SILM.
- [ ] Organizar seleção de metal, início de investigação, montagem livre e organização cristalográfica em grupos coerentes.
- [ ] Conferir resumo de metal, módulo, estado da estrutura, elegibilidade cristalográfica e experiência ativa.
- [ ] Evitar sequência extensa de botões soltos; agrupar ações por objetivo.
- [ ] Colocar ajuda junto ao grupo correspondente.
- [ ] Explicar origem, condições e unidades reaproveitadas/adicionadas ao organizar estrutura.
- [ ] Distinguir reorganização didática de cristalização real.
- [ ] Testar modo livre, cristalino, retorno à montagem livre, reset e encerramento.
- [ ] Garantir que trocar aba/grupo não apague a investigação.

#### 5.4 Ver

- [ ] Comparar famílias e ferramentas com a hierarquia SIAB.
- [ ] Manter estrutura e representações 2D/3D junto da cena e do mesmo estado científico.
- [ ] Organizar elétrons deslocalizados em seção própria, com visibilidade, movimento e redução de movimento claros.
- [ ] Organizar propriedades metálicas junto da mesma estrutura, respeitando habilitação por metal.
- [ ] Agrupar instrumentos e cálculos nas famílias correspondentes.
- [ ] Não apresentar controle indisponível como ação funcional; explicar motivo.
- [ ] Uma ação principal por grupo; detalhes secundários recolhidos.
- [ ] Diferenciar observação qualitativa, medição do modelo e cálculo teórico.
- [ ] Conferir pontos, unidades, resolução, fórmula, entradas e proveniência.
- [ ] Testar teclado, toque e movimento reduzido.

#### 5.5 Dados

- [ ] Comparar navegação catálogo → detalhe → voltar.
- [ ] Conferir Medições, Cálculos, Histórico, Dados do metal e Arquivos.
- [ ] Manter dado vinculado a metal, estrutura, condição, unidade e fonte.
- [ ] Distinguir Histórico, Caderno, relatório e Desfazer.
- [ ] Conferir parâmetros cristalográficos e proveniência campo a campo.
- [ ] Conferir lista de medições/cálculos, estados vazios e dados inválidos.
- [ ] Testar importação/exportação JSON, validação, tamanho de arquivo e preservação do estado anterior em erro.
- [ ] Manter atalhos para relatório e Caderno sem duplicar suas páginas.
- [ ] Verificar retorno ao Foco e foco do controle que abriu o detalhe.
- [ ] Testar arquivo antigo, arquivo inválido, conflito de armazenamento e recuperação.

**Aceite da Oficina:** painel central, visão geral e docks usam uma gramática coerente; sem rolagem/foco concorrentes; modelo único; ferramentas comunicam disponibilidade e limites; medidas/cálculos e referências permanecem científicos.

### 6 — Caderno

**SIAB:** `js/telas/caderno.js`.

**SILM:** `integracao/unified-ui.js` (anotações, filtros, `renderEntries()`, JSON, CSV, impressão), `integracao/route-ui.js` (registro de atividades e relatórios), journal store da Base.

A implementação usada pela entrada integrada é `unified-ui.js`. A opção de Caderno desligada no bootstrap genérico não desliga a tela principal do SILM.

- [ ] Comparar hierarquia da página, filtros, formulário e lista temporal.
- [ ] Conferir categorias úteis ao SILM: observação, hipótese, conclusão, atividade concluída e relatório registrado.
- [ ] Associar o registro ao metal e, quando existir, à investigação/estrutura.
- [ ] Testar filtros, estado vazio e preservação do filtro após salvar/remover.
- [ ] Conferir categoria, data/hora, título, conteúdo e ação relacionada.
- [ ] Fazer links de atividades concluídas abrirem missão/roteiro correto.
- [ ] Fazer links de relatório abrirem o arquivo correto como somente leitura.
- [ ] Testar remoção individual com confirmação.
- [ ] Testar exportação/importação JSON, incluindo relatórios arquivados.
- [ ] Testar exportação CSV e consistência das colunas.
- [ ] Testar impressão, quebras de página e tabelas largas.
- [ ] Testar limpeza total, confirmação e preservação de arquivos independentes.
- [ ] Testar armazenamento indisponível, backup inválido, conflito entre abas e recuperação.
- [ ] Não transformar Caderno em Histórico da Oficina.

**Aceite:** registrar, localizar, filtrar, exportar, imprimir e apagar; links relacionados corretos; importação inválida sem destruir dados.

### 7 — Manual

**SIAB:** `js/telas/manual.js` e registry do Manual.

**SILM:** `domain/silm/manual.js` e `integracao/unified-ui.js` (`manual()`).

O SIAB tem hero, busca, categorias, artigos, breadcrumbs, links relacionados, ações, diagramas, detalhes recolhíveis, fontes e impressão. O SILM tem registro de tópicos/categorias e uma apresentação atual mais simples de busca e blocos de detalhes.

- [ ] Inventariar categorias e tópicos existentes no Manual SILM.
- [ ] Identificar artigos essenciais para Início, Temas, Missões, Roteiros, Oficina, Caderno, Relatórios, Professor e acessibilidade.
- [ ] Criar início com título/hero curto, busca, categorias e atalhos usados com frequência.
- [ ] Organizar artigos com título, resumo, finalidade, passos, explicações, limites, referências e links relacionados.
- [ ] Criar navegação de retorno/breadcrumbs entre índice, categoria e tópico.
- [ ] Busca por título, resumo, palavra-chave e conteúdo; incluir estado sem resultado e limpeza.
- [ ] Recolher textos extensos em accordions acessíveis.
- [ ] Conferir links para ferramentas/rotas reais; nenhuma instrução pode apontar para controle inexistente.
- [ ] Usar diagramas próprios do domínio metálico, não ilustrações de recipientes ácido-base.
- [ ] Conferir fontes, licenças e proveniência.
- [ ] Testar impressão, teclado, foco e leitor de tela.
- [ ] Diferenciar dado tabelado, representação didática e limitação do modelo.

**Aceite:** Manual como ferramenta de consulta navegável, com busca funcional, artigos hierarquizados, referências e links válidos.

## 6. Relatórios — fluxo contextual

Relatórios não são uma das sete entradas principais, mas são acessados da atividade e de Dados. Auditá-los como fluxo transversal depois de verificar as telas que os originam.

**SIAB:** `js/telas/relatorios.js`.

**SILM:** `integracao/route-ui.js` (`report()`), `domain/silm/route-session.js`, arquivamento em `integracao/unified-ui.js`.

A UI de relatório integrada apresenta Nome, Data, Observações, Interpretação e Conclusão, além de metal, estrutura, unidades, condições, evidências, medições, cálculos e fontes. Há também serviço genérico de relatórios na Base, então é necessário confirmar renderer oficial antes de modificar.

- [ ] Definir/documentar o renderer de relatório oficial da entrada integrada.
- [ ] Comparar campos de escrita, metadados, evidências, tabelas/gráficos, fontes e configuração.
- [ ] Decidir a adaptação de Análise e Resposta à investigação além de Observações, Interpretação e Conclusão.
- [ ] Distinguir relatório livre, roteiro, missão, atividade do professor e arquivo arquivado.
- [ ] Permitir edição enquanto sessão aberta; arquivos arquivados somente leitura.
- [ ] Atualizar captura dos dados antes de imprimir.
- [ ] Mostrar medidas do modelo e cálculos com unidade, resolução, fórmula, entradas e fonte.
- [ ] Não gerar tabelas/gráficos sem dados; apresentar estado vazio.
- [ ] Conferir impressão/PDF, quebras, cabeçalho e campos de escrita.
- [ ] Conferir registro do relatório no Caderno, sem duplicatas indevidas.
- [ ] Testar reabertura de arquivo, vínculos de sessão e preservação de relatórios anteriores.

**Aceite:** relatório rastreável à investigação; dados científicos completos e com proveniência; edição/arquivo com permissões claras; impressão legível.

## 7. Recursos secundários e Área do Professor

Executar depois das sete telas principais. Inventariar ordem real do menu antes de alterar. A referência SIAB apresenta Recursos (Montagens prontas e Tour), Professor (Área do Professor, Apoio pedagógico e Ideias para uma aula acessível), Preferências/Acessibilidade/Projetor e Aplicativo (Instalar/Sobre/Versão).

### 7.1 Montagens prontas

O bootstrap SILM configura presets para Cobre–CFC, Ferro–CCC e Magnésio–HC; o fluxo de entrada/menu ainda precisa ser homologado.

- [ ] Confirmar que a entrada aparece na seção Recursos e leva à tela correta.
- [ ] Comparar cartão: objetivo, recursos, condições, módulo e ação.
- [ ] Confirmar que nada é iniciado ao abrir a lista.
- [ ] Pedir confirmação antes de substituir investigação atual.
- [ ] Usar somente combinações cientificamente válidas.
- [ ] Testar cada preset, relatório e restauração da investigação anterior.

### 7.2 Tour da bancada

Há serviço de tour em `js/experience/tour.js` e passos configurados em `domain/silm/bootstrap.js`.

- [ ] Confirmar entrada visível no menu e opção de executar novamente.
- [ ] Conferir passos de seleção de metal, Montagem, Módulo, Ver e Dados.
- [ ] Verificar alvos/alternativas mobile.
- [ ] Testar próximo, voltar, pular, concluir e Escape.
- [ ] Confirmar abertura e restauração dos painéis e retorno do foco.
- [ ] Evitar reapresentar convite de primeira visita de forma indesejada.

### 7.3 Área do Professor

**SIAB:** `js/telas/professor.js` inclui atividades recentes e ações Abrir, Copiar link, Editar, Duplicar e Excluir, além de requisitos, guia pedagógico, preparação, modo aluno, importação/exportação e impressão.

**SILM observado:** a tela integrada atual mostra Tabela Periódica ampliada e fontes; `js/experience/teacher.js` oferece editor genérico básico com rascunho, revisão, abertura como aluno e JSON. A biblioteca de atividades recentes e o CRUD equivalente não estão comprovados.

- [ ] Definir um fluxo oficial da Área do Professor na entrada principal.
- [ ] Separar recurso de consulta (Tabela Periódica/fontes) da gestão pedagógica.
- [ ] Criar lista de atividades recentes com Abrir, Copiar link, Editar, Duplicar e Excluir.
- [ ] Permitir atividade baseada em missão, roteiro ou preset, sem alterar ciência de referência.
- [ ] Exibir módulo único, metais elegíveis, estrutura exigida e recursos permitidos.
- [ ] Definir o que o aluno pode modificar e o que fica restrito.
- [ ] Oferecer objetivo, evidências, critério e guia pedagógico.
- [ ] Permitir revisar antes de abrir como aluno.
- [ ] Criar link compartilhável com validação e versão.
- [ ] Testar exportação/importação JSON e arquivo inválido.
- [ ] Conferir módulo, metal e recursos ao abrir como aluno.
- [ ] Oferecer impressão do guia/atividade e fontes.
- [ ] Testar lista vazia, editar, cancelar, duplicar, excluir e persistir.

### 7.4 Apoio pedagógico e ideias de aula acessível

- [ ] Conferir destino de “Apoio pedagógico”.
- [ ] Conferir destino e conteúdo de “Ideias para uma aula acessível”.
- [ ] Separar recomendação pedagógica de funcionalidade que existe de fato.
- [ ] Incluir limitações do modelo e diferentes formas de participação.

### 7.5 Preferências e acessibilidade

- [ ] Tema claro/escuro e alto contraste.
- [ ] Tamanho do texto e espaçamento de letras.
- [ ] Redução de movimento/animações e leitura simples.
- [ ] Visão de cores, com rótulos e estados que não dependam só de cor.
- [ ] Persistência e restauração de padrões.
- [ ] Abertura direta do painel pelo botão do cabeçalho.
- [ ] Verificar labels, aria-expanded/controls, teclado e alvos de toque.

### 7.6 Projetor e recursos do aplicativo

- [ ] Modo projetor, persistência e retorno ao layout normal.
- [ ] Ajuda para apresentar à turma.
- [ ] Instalação PWA e mensagens quando indisponível.
- [ ] Estado offline/online, armazenamento e atualização de cache.
- [ ] Tela Sobre, versão, créditos e licenças.
- [ ] Escolha de tela inicial e configuração de inicialização.
- [ ] Remover controles sem ação e links quebrados.

## 8. Menu contextual da atividade

O drawer SIAB apresenta atividade em andamento, contexto “Agora”, navegação, recursos, Professor, preferências, acessibilidade/projetor e aplicativo. O SILM já tem sessão, menu e retorno, mas a equivalência deve ser testada na navegação real.

- [ ] Mostrar nome, tipo, módulo e estado atual.
- [ ] Separar Sobre, Ajuda, Relatório, Concluir/Finalizar e Encerrar.
- [ ] Diferenciar “Finalizar atividade” de “Encerrar atividade”.
- [ ] Mostrar Relatório apenas quando aplicável.
- [ ] Respeitar destinos e ferramentas permitidos em atividade restrita.
- [ ] Atualizar contexto “Agora” ao mudar tela/painel.
- [ ] Fechar ao escolher destino, por Escape, botão e clique fora.
- [ ] Devolver foco ao botão que abriu o menu.
- [ ] Preservar rolagem e foco ao recolher/expandir grupos.
- [ ] Testar sessão livre, missão, roteiro, sessão concluída e sem sessão.

## 9. Requisitos transversais

### Navegação e comportamento

- [ ] Header, marca, drawer, bottom nav e estado ativo levam às rotas esperadas.
- [ ] Foco vai ao título ao trocar tela sem pulo de rolagem.
- [ ] Ação destrutiva exige confirmação apropriada.
- [ ] Cada tela tem estados vazios, erro recuperável e retorno.
- [ ] Ajuda e links internos apontam para tópicos e rotas reais.
- [ ] Nenhum controle sem ação ou desabilitado sem explicação.

### Viewports mínimos de validação

| Cenário | Viewport |
|---|---:|
| Celular compacto | 320 × 640 |
| Celular comum | 390 × 844 |
| Celular paisagem | 844 × 390 |
| Tablet/desktop compacto | 1024 × 768 |
| Desktop | 1440 × 1000 |

- [ ] Sem rolagem horizontal da página.
- [ ] Sem conteúdo, controle, modal, tabela ou gráfico cortado.
- [ ] Alvos de toque preferencialmente ≥44 × 44 px; evitar alvos abaixo de 24 px.
- [ ] Estado ativo não indicado somente por cor.
- [ ] Tab/Shift+Tab, Enter, Espaço e Escape.
- [ ] Diálogo mantém foco e devolve foco ao fechar.
- [ ] Leitor de tela recebe nome, estado, descrição, tabela e mensagem de resultado.
- [ ] Respeitar `prefers-reduced-motion` e preferências do app.
- [ ] Paisagem não oculta controles essenciais.
- [ ] Painéis móveis funcionam como folhas com fechar/retorno e foco preservado.
- [ ] Contraste conforme o padrão de acessibilidade do projeto.

### Integridade científica e persistência

- [ ] Um metal por investigação; substituição preserva/descarta estado somente conforme confirmação explícita.
- [ ] Valores têm unidade, condição e fonte quando aplicável.
- [ ] Medidas são do modelo, nunca de pixels.
- [ ] Cálculos mostram fórmula, entradas, unidades e proveniência.
- [ ] Comparação não inventa escala nem ranking.
- [ ] Estruturas não homologadas permanecem sem ferramenta não suportada.
- [ ] Elétrons/propriedades qualitativas são identificados como representação didática.
- [ ] Relatório/Caderno não afirmam medição ou cálculo que não ocorreu.
- [ ] Testar salvar, recarregar, reabrir, importar, exportar e erro de armazenamento.
- [ ] Testar duas abas, conflito, rollback e recuperação.
- [ ] Importação inválida preserva dados existentes.
- [ ] Arquivo de atividade passa por validação antes de iniciar.

## 10. Plano de testes

Comandos existentes em `package.json`; executar com Node >=22.

| Prioridade | Comando | Cobertura |
|---|---|---|
| obrigatório | `npm run build` | dados/estado científicos, layout, integração, entrada raiz, service worker e cobertura |
| obrigatório | `npm test` | testes científicos, rotas/armazenamento, aprendizagem e integração |
| obrigatório | `npm run test:a11y` | auditoria de acessibilidade do workspace |
| obrigatório | `npm run test:backup` | backup/importação/exportação do Caderno |
| recomendado | `npm run test:comparison` | comparação de estruturas, elétrons 3D e montagem da tabela |
| recomendado | `npm run test:routes:browser` | navegação/rotas em navegador |

Homologação manual: Chromium, Firefox e WebKit/Safari quando disponíveis; desktop e mobile; teclado e leitor de tela; PWA instalada, offline, retorno online e atualização de cache.

Não marcar teste aprovado sem executar o comando. Registrar saída, versão e data em `docs/evidence/paridade-siab-silm/` ou diretório de evidências acordado. Capturas SIAB × SILM devem indicar a rota e usar o mesmo viewport.

## 11. Definição de concluído por tela

Marcar uma tela como `[x] Verificado` somente quando:

1. A referência SIAB foi aberta e examinada na branch indicada.
2. Diferenças SIAB/SILM foram registradas.
3. Implementação respeita contratos e ciência SILM.
4. Fluxo principal e estados alternativos foram exercitados.
5. Viewports definidos foram verificados.
6. Teclado, foco, labels e leitor de tela foram avaliados.
7. Testes aplicáveis passaram, ou exceções foram documentadas.
8. Evidências foram guardadas e matriz atualizada.
9. Não existe defeito aberto que comprometa o uso principal da tela.

## 12. Registro de execução

Atualizar depois de cada etapa; não registrar como aprovado sem evidência.

| Data | Etapa | Arquivos/entregas | Testes/evidências | Estado |
|---|---|---|---|---|
| 2026-10-30 | Início — primeira rodada | `integracao/index.html`, `index.html`, `integracao/unified-ui.js` | Código conferido; build e homologação visual pendentes | `[~]` |
| 2026-10-30 | Plano operacional | Este documento | Inventário técnico, sequência, tarefas e critérios registrados | `[~]` |
| — | Aprender / Temas | — | — | `[ ]` |
| — | Missões | — | — | `[ ]` |
| — | Roteiros Experimentais | — | — | `[ ]` |
| — | Oficina — Foco | — | — | `[ ]` |
| — | Oficina — Visão geral | — | — | `[ ]` |
| — | Oficina — Montagem | — | — | `[ ]` |
| — | Oficina — Ver | — | — | `[ ]` |
| — | Oficina — Dados | — | — | `[ ]` |
| — | Caderno | — | — | `[ ]` |
| — | Manual | — | — | `[ ]` |
| — | Relatórios | — | — | `[ ]` |
| — | Professor/recursos secundários | — | — | `[ ]` |
| — | Menu/acessibilidade/homologação transversal | — | — | `[ ]` |

## 13. Estado conhecido e próxima etapa

- A primeira rodada do Início foi aplicada, e a marcação foi replicada no template `integracao/index.html` e na saída da raiz. O próximo build deve confirmar a geração.
- A Visão geral da Oficina recebeu uma primeira rodada anterior, mas será revisada formalmente em sua posição na sequência.
- Os serviços genéricos da Base e os renderers específicos da entrada integrada não devem ser confundidos. Caderno, Relatórios e Professor exigem confirmação de renderer ativo antes de editar.
- Na última verificação, não havia status checks ou execuções de GitHub Actions vinculados ao commit mais recente.
- `npm run build`, `npm test` e a homologação visual ainda não foram executados nesta rodada. Código e documentação permanecem provisórios até validação.

**Próxima etapa operacional após homologar o Início: Aprender / Temas.** Não pular para Missões ou Oficina antes de concluir a tela imediatamente anterior.
