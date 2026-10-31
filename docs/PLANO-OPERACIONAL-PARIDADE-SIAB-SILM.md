# Plano operacional de paridade — SIAB 1.0.0 × SILM

> Documento de execução. Cada item representa uma atividade verificável no código, na interface ou nos testes. A sequência respeita a ordem de navegação dos programas. Não avançar para a próxima tela até fechar os critérios da tela atual.

## 1. Referências, escopo e fotografia da auditoria

### Repositórios comparados

| Papel | Repositório | Referência auditada |
|---|---|---|
| Aplicativo de referência | `qui-x/acidobase` | branch `acidosebases1.0.0`, commit `73848f0655cd87a5f1a1ee7873dbe4060ff4af8b` |
| Aplicativo-alvo | `qui-x/ligacoesmetalicas` | branch `refactor/silm-copy-slim-20261030`, commit-base da auditoria `4b80c39a8ac7968d18cacc6508b58d24afa98f07` |

### Regra de paridade

O SIAB 1.0.0 é referência para:
- hierarquia visual, distribuição e densidade de informação;
- navegação principal, menu lateral, contexto da atividade e retorno;
- organização dos painéis, cartões, listas, detalhes, formulários e diálogos;
- comportamento de teclado, toque, foco, leitor de tela e telas menores;
- persistência, retomada, impressão, ajuda e instalação quando houver equivalência funcional.

O SIAB **não** é fonte de conteúdo químico para o SILM. Não copiar substâncias, experimentos ácido-base, leituras de pH, indicadores ou respostas do SIAB. Traduzir cada padrão para estruturas metálicas, cristalografia, elétrons deslocalizados, propriedades metálicas, medições e cálculos do SILM.

A paridade não exige igualdade artificial de quantidade ou de ciência. Quando não houver equivalente apropriado, registrar `N/A — diferença de domínio` com justificativa. Não inventar estruturas, dados, resultados ou comportamentos para preencher uma lacuna visual.

### Fotografia funcional observada no código

Estes números descrevem os registros consultados nesta auditoria, não metas de quantidade:

| Recurso | SIAB 1.0.0 | SILM na branch auditada | Implicação para a paridade |
|---|---|---|---|
| Telas principais | Início, Aprender, Missões, Roteiros Experimentais, Laboratório, Caderno e Manual | Início, Aprender, Missões, Roteiros Experimentais, Oficina dos Metais, Caderno e Manual previstos na navegação | Comparar na mesma ordem |
| Temas de Aprender | 14 temas registrados em `js/data/temas.js` | 4 temas configurados no bootstrap | Comparar cobertura pedagógica; não igualar contagem automaticamente |
| Missões | Catálogo distribuído por `js/data/missoes.js` e registros complementares em `js/data/temas.js` | 6 missões em `domain/silm/missions.js` | Conferir cobertura, progressão, evidências e conclusão |
| Roteiros | 10 percursos montados a partir das montagens com narrativa em `js/data/experimentos.js` | 5 roteiros em `domain/silm/routes.js` | Conferir cobertura e qualidade do percurso; não copiar experimentos |
| Montagens prontas | 11 registros em `js/data/montagens.js` | 3 presets em `domain/silm/bootstrap.js` | Comparar organização e variedade útil; não criar presets cientificamente inválidos |
| Manual | 13 categorias e 52 tópicos registrados | 3 categorias e 21 tópicos registrados | Lacuna de cobertura e aprofundamento do Manual do SILM |
| Caderno | Ativo: notas, práticas, filtros, CSV, impressão e exclusão | A integração está explicitamente desabilitada: `notebook: { enabled: false }` | Lacuna funcional prioritária quando chegarmos à tela Caderno |
| Relatórios | Relatório completo, para preencher à mão e atividade de análise; configuração de seções e dados | Relatório contextual com dados de sessão e campos textuais básicos | Paridade parcial; expandir após comparar o fluxo contextual |
| Área do Professor | Configuração detalhada, atividades recentes, copiar, editar, duplicar, excluir e guia do professor | Formulário básico, prévia, abrir como aluno e importar/exportar JSON | Paridade parcial; falta gestão de biblioteca e aprofundamento pedagógico |

## 2. Ordem obrigatória de execução

A ordem foi conferida nos menus principais do SIAB e do SILM:

| Ordem | Tela de referência | Tela do SILM | Estado da etapa |
|---:|---|---|---|
| 1 | Início | Início | Em revisão: primeira rodada aplicada, falta homologar |
| 2 | Aprender | Aprender / Temas | Não iniciado |
| 3 | Missões | Missões | Não iniciado |
| 4 | Roteiros Experimentais | Roteiros Experimentais | Não iniciado |
| 5 | Laboratório | Oficina dos Metais | Não iniciado; inclui as cinco subáreas abaixo |
| 5.1 | Bancada em Foco | Oficina → Foco | Não iniciado |
| 5.2 | Montagem / prateleira | Oficina → Montagem | Não iniciado |
| 5.3 | Ver / investigação | Oficina → Ver | Não iniciado |
| 5.4 | Dados | Oficina → Dados | Não iniciado |
| 5.5 | Visão geral | Oficina → Visão geral | Rodada preliminar aplicada; revisar e homologar nesta posição |
| 6 | Caderno | Caderno | Não iniciado; atualmente desabilitado no bootstrap |
| 7 | Manual | Manual | Não iniciado |

Depois das sete telas principais, percorrer os recursos secundários na ordem em que aparecem no menu do SIAB: **Montagens prontas → Tour da bancada → Área do Professor → apoio pedagógico e aula acessível → Preferências e Acessibilidade → Modo projetor → Aplicativo / instalação / Sobre**.

Relatórios são uma tela contextual, acessada pela atividade e por Dados. O fluxo deve ser verificado quando aparecer pela primeira vez em Missões/Roteiros e novamente na Oficina → Dados; a auditoria completa do documento de relatório ocorre antes da homologação transversal.

## 3. Como operar este plano

### Estados

- `[ ]` Não iniciado.
- `[~]` Implementado parcialmente ou alterado, mas ainda sem todos os testes/evidências.
- `[x]` Verificado funcional e visualmente, testes executados e etapa aceita.
- `[!]` Bloqueado por dependência ou decisão.
- `[N/A]` Não aplicável por diferença de domínio, com justificativa escrita.

Não marcar uma tela como concluída apenas porque o texto foi encurtado ou o HTML foi alterado. Para marcar `[x]`, preencher o registro de aceite no fim da etapa, citar commit, evidências e testes.

### Ciclo de trabalho de cada tela

1. Abrir a tela equivalente no SIAB 1.0.0 e no SILM na mesma largura e altura.
2. Registrar estrutura, componentes, ordem, hierarquia, estados vazios, estados preenchidos e ações.
3. Mapear cada componente SIAB para um componente SILM; justificar diferenças de domínio.
4. Implementar somente a tela corrente e as dependências estritamente necessárias.
5. Conferir o diff para garantir que não houve alteração científica involuntária nem mudança em outra tela fora de escopo.
6. Executar os testes ligados à tela e os testes gerais aplicáveis.
7. Capturar evidências equivalentes nos dois programas.
8. Atualizar este arquivo e só então iniciar a próxima tela.

### Critério comum de aceite

- [ ] Hierarquia visual equivalente: título, subtítulo, cartões, listas, painéis e área de ação.
- [ ] Densidade informacional adequada: sem parágrafos repetidos; instrução junto da ação; aprofundamento no local correto.
- [ ] Navegação equivalente: entrar, abrir detalhe, voltar, fechar, continuar e retomar.
- [ ] Todos os controles fazem o que anunciam; nenhum botão decorativo ou sem ação.
- [ ] Estados vazio, carregando, concluído, indisponível, erro e bloqueado tratados quando aplicáveis.
- [ ] Persistência e retorno preservam o estado científico e os registros.
- [ ] Teclado: Tab, Shift+Tab, Enter, Espaço, Escape e retorno do foco.
- [ ] Leitor de tela: nomes acessíveis, títulos semânticos, estado `aria-expanded`/`aria-pressed`, anúncios de mudanças.
- [ ] Alvos de toque preferencialmente com pelo menos 44 × 44 CSS px; não aceitar controles essenciais difíceis de acionar.
- [ ] Sem rolagem horizontal involuntária; uma rolagem principal por tela; painéis móveis não escondem ações essenciais.
- [ ] Testado em 1366×768, 1024×768, 390×844, 320×640 e 844×390 (paisagem), ajustando os cenários quando a tela exigir.
- [ ] Tema claro/escuro, alto contraste, aumento de texto e movimento reduzido continuam legíveis.
- [ ] Captura de tela e resultado de teste salvos em `docs/evidence-parity/<ID-da-tela>/`.

## 4. Plano por tela — tarefas executáveis

## ETAPA 1 — Início

**Referência SIAB:** `index.html` seção `data-tela="inicio"`, `js/telas/inicio.js`, `css/stylesiab.css`.

**SILM:** `index.html` seção `data-view="inicio"`, `integracao/unified-ui.js` função `home()`, `integracao/upstream/home-fidelity.css`, `integracao/upstream/home-context.css`.

**O que comparar:** sobretítulo, título com destaque, lema, símbolo institucional, frase da seção, cartão principal, cartões secundários, contagens vivas, atalhos de apoio, retomada e resumo da investigação.

### Tarefas

- [~] `HOME-01` — Reorganizar o hero para corresponder à hierarquia SIAB. Primeira rodada: símbolo institucional estático no hero e lema “Monte. Observe. Meça. Calcule.”; falta validação visual.
- [~] `HOME-02` — Reproduzir título da seção e frase curta “Da curiosidade à descoberta”; falta verificar proporção, espaçamento e quebra em mobile.
- [~] `HOME-03` — Manter um cartão em destaque para a Oficina dos Metais e cartões secundários para Aprender, Missões, Roteiros e Caderno; revisar distribuição e ordem nos breakpoints.
- [~] `HOME-04` — Corrigir contagens e concordância dos metadados dos cartões; a lógica dinâmica já foi ajustada em `integracao/unified-ui.js`.
- [ ] `HOME-05` — Comparar o comportamento dos metadados sem registros e com registros existentes. O cartão Caderno não pode prometer registros funcionais enquanto a tela estiver desabilitada.
- [ ] `HOME-06` — Comparar os atalhos de apoio no rodapé. Manter Manual, Professor e Preferências; não adicionar link de relatório sem equivalente no Início do SIAB.
- [ ] `HOME-07` — Validar os recursos SILM de retomada de atividade e resumo da investigação, preservando-os como extensão própria do domínio.
- [ ] `HOME-08` — Verificar destino do símbolo/identidade, navegação por teclado, foco inicial, leitores de tela e layout mobile.
- [ ] `HOME-09` — Criar teste de regressão de Início: renderização, links, contagens, retomada e ausência de overflow.

**Aceite da etapa:** o Início deve ter a mesma hierarquia e simplicidade do SIAB, mas apresentar a identidade e os caminhos do SILM. Retomada científica não pode ser removida para obter semelhança.

## ETAPA 2 — Aprender / Temas

**Referência SIAB:** `index.html` `data-tela="aprender"` e `data-tela="tema"`; `js/telas/aprender.js`; `js/data/temas.js`; categorias e artigos do Manual.

**SILM:** `index.html` `data-view="aprender"`; rota `tema` registrada em `js/experience/experience.js`; `js/experience/learning.js`; `domain/silm/themes.js`; itens configurados em `domain/silm/bootstrap.js`.

### Tarefas

- [ ] `LEARN-01` — Comparar cabeçalho, introdução, lista de temas, cartões, ícones, estados e hierarquia da lista SIAB.
- [ ] `LEARN-02` — Verificar abertura de detalhe de tema, retorno à lista e preservação do tema selecionado.
- [ ] `LEARN-03` — Comparar campos do detalhe: título, conceito central, explicação, exemplos, fontes, conteúdo relacionado e ação principal.
- [ ] `LEARN-04` — Adaptar a ação “Investigar” para abrir o Laboratório com o metal representativo, sem iniciar investigação sem o gesto explícito do usuário.
- [ ] `LEARN-05` — Mapear os quatro temas atuais do SILM (ligação metálica, estrutura, elétrons e propriedades) para o escopo científico completo; identificar lacunas de conteúdo sem copiar os 14 temas ácido-base do SIAB.
- [ ] `LEARN-06` — Conferir marcadores de tema concluído e revisita. A conclusão não deve impedir repetição nem introduzir pontos, ranking ou porcentagem de progresso.
- [ ] `LEARN-07` — Comparar conteúdo relacionado: Manual, roteiros, missões e metais relevantes; retirar links vazios ou sem destino.
- [ ] `LEARN-08` — Conferir textos curtos na lista e aprofundamento dentro do tema, sem descrições duplicadas.
- [ ] `LEARN-09` — Adicionar testes de lista, detalhe, retorno, marcador e ação de investigação.

**Aceite da etapa:** lista e detalhe apresentam uma arquitetura equivalente à do SIAB, com explicação e conexões específicas de ligações metálicas.

## ETAPA 3 — Missões

**Referência SIAB:** `index.html` `data-tela="missoes"` e `data-tela="atividade"`; `js/telas/missao.js`; `js/data/missoes.js`; extensões em `js/data/temas.js`; `js/ui/activity-ui.js`.

**SILM:** `index.html` `data-view="missoes"`; `js/experience/experience.js` função `activityList('mission')`; `js/experience/activity.js`; `domain/silm/missions.js`; `domain/silm/route-session.js`.

### Tarefas

- [ ] `MISSION-01` — Comparar catálogo: título, resumo, estado concluído/não concluído, ordenação, cartão e abertura do detalhe.
- [ ] `MISSION-02` — Comparar detalhe: problema, objetivo, regras, requisitos, condições, evidências, perguntas e contexto recolhível.
- [ ] `MISSION-03` — Garantir exibição de objetivos acionáveis e atualização do estado de cada evidência.
- [ ] `MISSION-04` — Garantir campo de conclusão editável, salvamento da sessão e feedback de conclusão.
- [ ] `MISSION-05` — Comparar iniciar, continuar, concluir, refazer e retomar após recarregar.
- [ ] `MISSION-06` — Comparar atividade restrita: destinos bloqueados, recursos permitidos, ajuda, relatório e encerramento do contexto.
- [ ] `MISSION-07` — Conferir passagem das evidências e conclusão ao relatório e ao futuro Caderno.
- [ ] `MISSION-08` — Verificar cobertura de missões do SILM. O catálogo de seis missões é próprio do domínio; ampliar só com investigações científicas justificadas e critérios de conclusão verificáveis.
- [ ] `MISSION-09` — Testar casos de missão inválida, recurso indisponível, sessão concluída e sessão interrompida.
- [ ] `MISSION-10` — Registrar testes automatizados de catálogo, sessão, evidências, conclusão, repetição e restrição.

**Aceite da etapa:** uma missão deve oferecer problema, evidência, conclusão e ciclo de retomada tão claros quanto no SIAB, com critérios científicos e recursos exclusivos do SILM.

## ETAPA 4 — Roteiros Experimentais

**Referência SIAB:** `index.html` `data-tela="roteiros"` e `data-tela="roteiro"`; `js/telas/roteiros.js`; `js/data/experimentos.js`; `js/data/montagens.js`.

**SILM:** `index.html` `data-view="roteiros"`; `js/experience/experience.js` função `activityList('route')`; `js/experience/activity.js`; `domain/silm/routes.js`; `js/experience/route-session.js` / `integracao/route-ui.js`.

### Tarefas

- [ ] `ROUTE-01` — Comparar catálogo, resumo, módulo, estado e ação para abrir cada roteiro.
- [ ] `ROUTE-02` — Comparar detalhe: problema, pergunta central, objetivo, procedimento, requisitos, evidências, condições e fontes.
- [ ] `ROUTE-03` — Comparar identificação de aluno/turma/grupo/data quando aplicável e preservar a configuração durante a sessão.
- [ ] `ROUTE-04` — Verificar criação da investigação e estado inicial da estrutura, incluindo metal elegível e pré-requisitos.
- [ ] `ROUTE-05` — Garantir que cada roteiro do SILM use exatamente um módulo principal (Explorar, Medir ou Calcular), sem módulo secundário.
- [ ] `ROUTE-06` — Comparar navegação livre/restrita, ferramentas permitidas, conclusão, retorno e retomada.
- [ ] `ROUTE-07` — Conferir relatório gerado a partir da sessão e ligação com evidências, medições e cálculos.
- [ ] `ROUTE-08` — Auditar os cinco roteiros atuais do SILM quanto à cobertura dos três módulos, variedade de metais e elegibilidade cristalográfica.
- [ ] `ROUTE-09` — Comparar casos inválidos: metal sem suporte, requisito ausente, instrumento indisponível, estrutura incompatível e conclusão incompleta.
- [ ] `ROUTE-10` — Criar testes de catálogo, detalhe, configuração inicial, restrições e sessão.

**Aceite da etapa:** os roteiros têm navegação, identificação, preparação e detalhe comparáveis ao SIAB, mas descrevem procedimentos próprios de investigação de metais.

## ETAPA 5 — Laboratório / Oficina dos Metais

A tela do Laboratório no SIAB é a referência para o workspace. No SILM, trabalhar nesta ordem interna: **Foco → Montagem → Ver → Dados → Visão geral**. Não começar pela Visão geral só porque recebeu uma alteração antecipada.

### 5.1 — Oficina: Foco

**Referência SIAB:** `data-tela="bancada"`, `js/telas/laboratorio.js`, `js/telas/bancada.js`, `js/ui/workspace.js`, `js/ui/trilho.js`.

**SILM:** `data-view="ambiente"`, `#workspace-focus`, `#silm-integration-scene`, `integracao/adapter.js`, `domain/silm/assembly-view.js`, `domain/silm/crystal-view.js`.

- [ ] `LAB-FOCUS-01` — Comparar tamanho e posição da cena, cabeçalho contextual, barra de ações e espaço para os painéis.
- [ ] `LAB-FOCUS-02` — Comparar estados sem metal, com metal, sem montagem, montagem livre e estrutura cristalina.
- [ ] `LAB-FOCUS-03` — Comparar seleção de unidade, adição, movimentação, posicionamento assistido, desfazer e limpar.
- [ ] `LAB-FOCUS-04` — Conferir que uma mudança de módulo não apaga a investigação e que Medir/Calcular não editam a montagem.
- [ ] `LAB-FOCUS-05` — Conferir câmera, projeção, zoom, enquadramento, centralização, seleção por teclado e toque.
- [ ] `LAB-FOCUS-06` — Comparar ações persistentes e menu “Mais”; retirar duplicações entre barra, painel e menu.
- [ ] `LAB-FOCUS-07` — Conferir estado da atividade/roteiro, ajuda e retorno ao contexto anterior.
- [ ] `LAB-FOCUS-08` — Verificar expansão em tela inteira, rolagem, painel sobreposto e restauração do foco.
- [ ] `LAB-FOCUS-09` — Criar teste visual e funcional do estado vazio, seleção, montagem, desfazer e retorno.

### 5.2 — Oficina: Montagem

**Referência SIAB:** painel de laboratório, prateleira, escolha de soluções/reagentes, módulos e atividade; `js/ui/prateleira.js`, `js/ui/modulos.js`, `js/ui/layout-bancada.js`.

**SILM:** dock `#si-dock-left`, `integracao/workspace-family.js`, `domain/silm/bootstrap.js`, `domain/silm/periodic-table.js`, `domain/silm/assembly.js`.

- [ ] `LAB-MOUNT-01` — Comparar navegação por grupos recolhíveis, cabeçalho do painel, abas, rolagem e botão fechar.
- [ ] `LAB-MOUNT-02` — Comparar o resumo da investigação e identidade do metal.
- [ ] `LAB-MOUNT-03` — Comparar seleção de metal/Tabela Periódica: busca, seleção, disponibilidade, fontes e confirmação de troca.
- [ ] `LAB-MOUNT-04` — Comparar estrutura/montagem: iniciar, adicionar unidades, organizar estrutura, retornar à montagem livre e limpar.
- [ ] `LAB-MOUNT-05` — Comparar propriedades: seleção da propriedade, ação de controle, leitura do resultado, restaurar e encerrar.
- [ ] `LAB-MOUNT-06` — Comparar escolha do módulo e explicação breve do módulo ativo.
- [ ] `LAB-MOUNT-07` — Comparar ligação de roteiro/atividade e mostrar apenas os controles permitidos pelo contexto.
- [ ] `LAB-MOUNT-08` — Manter indisponibilidade científica explícita para metais sem geometria validada; nunca substituir sua estrutura por CCC/CFC/HC.
- [ ] `LAB-MOUNT-09` — Conferir alvos de toque, teclado, leitor de tela, estados desabilitados e retorno de foco.

### 5.3 — Oficina: Ver

**Referência SIAB:** painel VER, trilho de investigação e visualizações; `js/ui/ver-investigacao.js`, `js/ui/grafico.js`, `js/ui/equacao.js`, `js/ui/render.js`.

**SILM:** dock `#si-dock-right`, `#si-viewer-catalog`, `integracao/workspace-family.js`, `domain/silm/exploration.js`, `domain/silm/measure-view.js`, `domain/silm/property-view.js`, `domain/silm/calculations.js`.

- [ ] `LAB-VIEW-01` — Comparar catálogo de famílias, subabas, botão voltar, detalhe e hierarquia do resultado.
- [ ] `LAB-VIEW-02` — Organizar o conteúdo em caminhos claros: Observar, Medir e Analisar; evitar misturar descrição, instrumento e resultado.
- [ ] `LAB-VIEW-03` — Conferir síntese contextual e foco da observação (estrutura, célula, rede, elétrons, propriedade).
- [ ] `LAB-VIEW-04` — Conferir camadas que podem ser mostradas/ocultadas sem alterar o estado científico.
- [ ] `LAB-VIEW-05` — Conferir propriedades metálicas e seus estados: qualitativa, dado tabelado ou indisponível, sempre com motivo.
- [ ] `LAB-VIEW-06` — Conferir instrumentos, unidades, seleção de pontos e leitura de medida; identificar explicitamente “medida do modelo”.
- [ ] `LAB-VIEW-07` — Conferir fórmulas, entradas, intermediários, origem de cada entrada e resultado de cálculo; identificar “calculado pelo SILM”.
- [ ] `LAB-VIEW-08` — Conferir comparação A/B e comparação de referências sem escala comum; não transformar intensidade didática em classificação de desempenho.
- [ ] `LAB-VIEW-09` — Conferir 2D/3D, projeções, câmera, fallback quando 3D falhar e invariância de medições/cálculos.
- [ ] `LAB-VIEW-10` — Conferir que o texto da ajuda esteja ao lado da ação e que o detalhe aprofundado permaneça no Manual.
- [ ] `LAB-VIEW-11` — Criar testes de alternância de famílias, camadas, instrumentos, cálculo e invariância de estado.

### 5.4 — Oficina: Dados

**Referência SIAB:** dados medidos, registro da investigação, gráficos, tabelas e atalho para relatório; `js/ui/workspace.js`, `js/ui/ver-investigacao.js`, `js/telas/relatorios.js`.

**SILM:** subpainel Dados em `index.html`, `integracao/workspace-family.js`, `integracao/scientific-tools.js`, `domain/silm/data-api.js`, `js/experience/history.js`, `integracao/durable-storage.js`.

- [ ] `LAB-DATA-01` — Comparar catálogo, retorno, detalhe e hierarquia de cada conjunto de dados.
- [ ] `LAB-DATA-02` — Conferir Dados do metal: valores, unidades, condições de referência, disponibilidade e fontes.
- [ ] `LAB-DATA-03` — Conferir lista de medições: instrumento, pontos, unidade, valor, remoção e limpeza.
- [ ] `LAB-DATA-04` — Conferir lista de cálculos: fórmula, entradas, origem, intermediários, resultado e dependências.
- [ ] `LAB-DATA-05` — Conferir Histórico cronológico, distinção entre ação científica e alteração apenas visual, e recuperação após recarregar.
- [ ] `LAB-DATA-06` — Conferir exportar/abrir investigação JSON, validação, avisos e preservação de estado anterior em importação inválida.
- [ ] `LAB-DATA-07` — Conferir atalho do Relatório e acesso ao Caderno sem oferecer destino funcional que esteja desabilitado.
- [ ] `LAB-DATA-08` — Conferir conflitos de armazenamento, abas concorrentes, falha de persistência e mensagem de recuperação.
- [ ] `LAB-DATA-09` — Criar testes de catálogo/detalhe, histórico, exportação, importação e rollback.

### 5.5 — Oficina: Visão geral

**Referência SIAB:** área `overview-view`, seleção de tubos, ordenação, hint, grade e ações de comparação.

**SILM:** `#workspace-overview`, `integracao/structure-comparison.js`, `integracao/workspace-family.css`.

**Estado atual:** primeira rodada preliminar já aplicada antes da definição da ordem. Não considerar homologada até esta subseção ser executada.

- [~] `LAB-OVERVIEW-01` — Encurtar cabeçalho e retirar introdução repetida.
- [~] `LAB-OVERVIEW-02` — Resumir controles e cartões, recolher fontes/limites e remover legenda longa repetida.
- [~] `LAB-OVERVIEW-03` — Remover rolagem interna que competia com a rolagem do workspace.
- [ ] `LAB-OVERVIEW-04` — Comparar estrutura da grade, quantidade de cartões, ordem, espaçamento, alinhamento e comportamento com 1, 2 e 6 metais.
- [ ] `LAB-OVERVIEW-05` — Comparar ações e estados: aplicar propriedade, intensidade, elétrons, movimento e restaurar.
- [ ] `LAB-OVERVIEW-06` — Garantir rótulo curto de metal/estrutura, fonte por cartão e aviso de limitação recolhido sem ocultar informação essencial.
- [ ] `LAB-OVERVIEW-07` — Testar referências sem geometria, modelos fora de CCC/CFC/HC e propriedades indisponíveis.
- [ ] `LAB-OVERVIEW-08` — Testar grade em desktop, tablet, celular e paisagem, sem cartões cortados nem segundo scroll.
- [ ] `LAB-OVERVIEW-09` — Rodar `tests/structure-comparison.cjs` e testes de camada eletrônica; criar evidência visual final.

**Aceite da Oficina:** Foco, Montagem, Ver, Dados e Visão geral foram comparados e testados na ordem. As mesmas entidades científicas são exibidas nos painéis; não criar uma segunda fonte de verdade visual.

## ETAPA 6 — Caderno

**Referência SIAB:** `index.html` `data-tela="caderno"`; `js/telas/caderno.js`; `SIAB.cadernoCSV`; impressão e detalhe de prática.

**SILM:** `index.html` seção `data-view="caderno"`; `js/experience/notebook.js`; `integracao/unified-ui.js`; `domain/silm/bootstrap.js` (`notebook.enabled:false`).

### Tarefas

- [ ] `NOTE-01` — Definir e implementar o modelo científico de registro: observação, hipótese, conclusão, medição, cálculo e vínculo à investigação/atividade.
- [ ] `NOTE-02` — Habilitar a rota somente quando o Caderno tiver integração funcional; remover o estado atual de indisponibilidade.
- [ ] `NOTE-03` — Implementar lista cronológica com filtros por tipo, data, metal, atividade e/ou sessão.
- [ ] `NOTE-04` — Implementar criação e edição de anotações, autosave, feedback e validação de conteúdo.
- [ ] `NOTE-05` — Implementar detalhe de prática/registro com dados, medições, cálculos e link para relatório.
- [ ] `NOTE-06` — Implementar CSV com cabeçalhos documentados e valores/unidades/origens preservados.
- [ ] `NOTE-07` — Implementar backup JSON versionado, exportação, importação validada, rollback e prevenção de duplicatas.
- [ ] `NOTE-08` — Implementar impressão e layout de papel sem controles da interface.
- [ ] `NOTE-09` — Implementar exclusão individual e limpeza total com confirmação, preservando relatórios arquivados conforme a regra definida.
- [ ] `NOTE-10` — Integrar registro automático de conclusão de missão/roteiro e registro de relatório, sem registrar uma mesma tentativa duas vezes.
- [ ] `NOTE-11` — Testar persistência, navegação, importação inválida, backup e recuperação.

**Aceite da etapa:** nenhum link “Abrir Caderno” pode levar a uma tela vazia ou desabilitada; todo registro deve ser recuperável e exportável.

## ETAPA 7 — Manual

**Referência SIAB:** `data-tela="manual"`, `js/telas/manual.js`, `js/data/manual.js`, `docs/MANUAL.md`.

**SILM:** `data-view="manual"`, `js/manual/manual.js`, `js/manual/registry.js`, `domain/silm/manual.js`, documentação científica em `docs/`.

### Tarefas de interface

- [ ] `MANUAL-01` — Replicar hero curto, busca, atalhos de consulta, grupos de categorias e índice.
- [ ] `MANUAL-02` — Implementar busca com resultados, vazio, limpeza e navegação direta para artigo.
- [ ] `MANUAL-03` — Implementar artigo com breadcrumb, título, resumo, finalidade, etapas, exemplos, detalhes recolhíveis, ilustrações, relacionados e fontes.
- [ ] `MANUAL-04` — Implementar comandos/ações contextuais quando fizerem sentido no SILM: abrir tela, abrir painel, iniciar tour ou selecionar ferramenta.
- [ ] `MANUAL-05` — Implementar impressão do tópico e do guia rápido.
- [ ] `MANUAL-06` — Verificar links internos e retorno à tela anterior.
- [ ] `MANUAL-07` — Adicionar ajuda contextual para os painéis da Oficina, atividades, relatórios e preferências.
- [ ] `MANUAL-08` — Conferir busca por teclado, leitor de tela, accordions e impressão.

### Tarefas de conteúdo SILM

- [ ] `MANUAL-CONTENT-01` — Completar Primeiros passos, Início e navegação.
- [ ] `MANUAL-CONTENT-02` — Documentar selecionar metal, 118 elementos, estados de disponibilidade, condições e fontes.
- [ ] `MANUAL-CONTENT-03` — Documentar montagem livre, organização, posição assistida, desfazer e persistência.
- [ ] `MANUAL-CONTENT-04` — Documentar estruturas cristalinas suportadas e metais com referência sem visualização; não apresentar substitutos artificiais.
- [ ] `MANUAL-CONTENT-05` — Documentar elétrons deslocalizados, natureza qualitativa e limites.
- [ ] `MANUAL-CONTENT-06` — Documentar as propriedades metálicas e as diferenças entre representação qualitativa, dado tabelado e indisponível.
- [ ] `MANUAL-CONTENT-07` — Documentar Explorar, Medir e Calcular: instrumentos, fórmulas, unidades, origens de entrada e limites.
- [ ] `MANUAL-CONTENT-08` — Documentar câmera 2D/3D, projeções, teclado, toque e fallback.
- [ ] `MANUAL-CONTENT-09` — Documentar Missões, Roteiros, restrições, conclusão, retomada e refazer.
- [ ] `MANUAL-CONTENT-10` — Documentar Caderno, Relatórios, importação/exportação e impressão após implementação.
- [ ] `MANUAL-CONTENT-11` — Documentar Professor, Montagens prontas, Tour, Acessibilidade, Projetor, PWA e solução de problemas.
- [ ] `MANUAL-CONTENT-12` — Revisar todos os exemplos e referências com fontes rastreáveis; remover marcadores de “documentação provisória”.

**Aceite da etapa:** Manual navegável e pesquisável, com cobertura suficiente para todas as funções liberadas no SILM; não precisa copiar o conteúdo ácido-base nem a mesma quantidade de tópicos.

## 5. Recursos secundários — executar após as sete telas principais

## ETAPA 8 — Relatórios (tela contextual)

**Referência SIAB:** `data-tela="relatorio"`, `js/telas/relatorios.js`, configurações de impressão e dados de bancada.

**SILM:** `data-view="relatorios"`, `js/experience/reports.js`, `domain/silm/bootstrap.js` função `report.collect()`.

- [ ] `REPORT-01` — Comparar abertura a partir de atividade, oficina e Caderno; retornar à origem correta.
- [ ] `REPORT-02` — Comparar seleção de sessão/relatório arquivado e atualização dos dados da investigação.
- [ ] `REPORT-03` — Definir relatório completo com identificação, proposta/objetivo, condições, estrutura, medições, cálculos, fontes, observações, análise, resposta e conclusão.
- [ ] `REPORT-04` — Identificar claramente dado tabelado, medida do modelo, cálculo do SILM e texto autoral do estudante.
- [ ] `REPORT-05` — Implementar modos aplicáveis: completo, para preencher à mão e atividade de análise do Professor.
- [ ] `REPORT-06` — Implementar seleção de seções incluídas, campos deixados em branco e opções de impressão sem apagar registros científicos.
- [ ] `REPORT-07` — Garantir persistência por sessão, edição, relatório arquivado e restauração após recarregar.
- [ ] `REPORT-08` — Testar tabelas longas, cálculos, fontes, impressão/PDF, preenchimento manual e acesso restrito.
- [ ] `REPORT-09` — Testar que o relatório não confunda intensidade didática com resultado experimental nem medida do modelo com medida de amostra real.

## ETAPA 9 — Montagens prontas

**Referência SIAB:** tela `data-tela="montagens"`, `js/data/montagens.js`, ação `data-montar`.

**SILM:** tela/rota `montagens`, configuração `presets` de `domain/silm/bootstrap.js`, `js/experience/experience.js` função `presetsScreen()`.

- [ ] `PRESET-01` — Comparar catálogo, cartão, título, objetivo, recursos, etapas e botão de aplicar.
- [ ] `PRESET-02` — Conferir os três presets atuais do SILM e sua cobertura de CCC, CFC e HC.
- [ ] `PRESET-03` — Garantir que a pré-configuração respeite elegibilidade, condições de referência e confirmação destrutiva.
- [ ] `PRESET-04` — Expandir apenas quando existir sequência didática válida, sem fabricar estrutura ou dado.
- [ ] `PRESET-05` — Conferir retorno ao laboratório e persistência da investigação preparada.

## ETAPA 10 — Tour e ajuda contextual

**Referência SIAB:** `js/ui/tour.js`, `js/telas/manual.js`, diálogos de ajuda, guia e primeiro uso.

**SILM:** `js/experience/tour.js`, `domain/silm/bootstrap.js` configuração `tour`, `js/experience/experience.js` `details()`, `about()`.

- [ ] `TOUR-01` — Comparar abertura, passos, progresso, pular, voltar, próximo, fechar e foco.
- [ ] `TOUR-02` — Garantir que cada etapa aponte para um controle real e visível na versão atual.
- [ ] `TOUR-03` — Comparar primeira visita, opção de não iniciar e redução de movimento.
- [ ] `TOUR-04` — Ligar cada ajuda contextual ao tópico correto do Manual.
- [ ] `TOUR-05` — Conferir que o tour não bloqueie controles, painéis nem atividade em curso.
- [ ] `TOUR-06` — Testar em desktop e celular com rolagem e painel aberto.

## ETAPA 11 — Área do Professor e apoio pedagógico

**Referência SIAB:** `data-tela="professor"`, `js/telas/professor.js`, `prof-guide-content`, catálogo de atividades e guia imprimível.

**SILM:** `data-view="professor"`, `js/experience/teacher.js`, `domain/silm/bootstrap.js` configuração `teacherResources`, `domain/silm/presentation.js`.

- [ ] `TEACHER-01` — Comparar criação guiada por etapas, identificação e seleção do tipo de atividade.
- [ ] `TEACHER-02` — Definir campos próprios do SILM: objetivo, instruções, módulo único, metal elegível/seleção pelo estudante, estrutura/requisitos, ferramentas e navegação.
- [ ] `TEACHER-03` — Comparar permissões de recursos e estados de controles disponíveis.
- [ ] `TEACHER-04` — Implementar prévia como aluno e conferência dos recursos permitidos.
- [ ] `TEACHER-05` — Implementar biblioteca de atividades criadas: abrir, copiar/exportar, editar, duplicar e excluir.
- [ ] `TEACHER-06` — Manter importação JSON com validação de schema, tamanho e conteúdo; não sobrescrever uma atividade válida quando o arquivo for inválido.
- [ ] `TEACHER-07` — Implementar persistência de várias atividades, não apenas um rascunho sobrescrito.
- [ ] `TEACHER-08` — Implementar guia do professor específico do SILM: objetivos, conceitos, preparação, interpretação, limitações, perguntas e fontes.
- [ ] `TEACHER-09` — Comparar impressão do guia e acesso ao modo projetor.
- [ ] `TEACHER-10` — Corrigir navegação: o item “Área do Professor” deve estar acessível no menu secundário como no SIAB, não apenas por atalho na página inicial.
- [ ] `TEACHER-11` — Testar atividades restritas, permissões, abertura como aluno, import/export e edição sem afetar links/sessões já criados.

## ETAPA 12 — Menu lateral, preferências, acessibilidade, projetor e aplicativo

**Referência SIAB:** `index.html` estrutura do `app-drawer`; `js/ui/gaveta.js`; acessibilidade, preferências, tour e aplicativo.

**SILM:** `index.html` `#sidebar`; `js/experience/shell.js`; `integracao/upstream/menu-fidelity.css`; `integracao/adapter.js`; `css/a11y.css`; `integracao/pwa.js`.

### Navegação e contexto

- [ ] `MENU-01` — Comparar cabeçalho, abertura/fechamento da gaveta, backdrop, largura, foco inicial e restauração do foco.
- [ ] `MENU-02` — Conferir ordem principal: Início → Aprender → Missões → Roteiros → Oficina → Caderno → Manual.
- [ ] `MENU-03` — Conferir área “Agora”, contexto atual, botão Continuar e estado de atividade em andamento.
- [ ] `MENU-04` — Conferir ações da atividade: Sobre esta atividade, Ajuda, Relatório, Finalizar e Encerrar; respeitar navegação restrita.
- [ ] `MENU-05` — Conferir ordem de recursos secundários: Montagens prontas, Tour, Professor, apoio pedagógico e preferências.
- [ ] `MENU-06` — Exibir acesso explícito à Área do Professor no grupo Professor.
- [ ] `MENU-07` — Conferir estado ativo da rota, navegação por teclado, Escape e fechamento após selecionar destino.

### Preferências e acessibilidade

- [ ] `A11Y-01` — Comparar modo escuro, alto contraste, tamanho de texto, espaçamento, redução de movimento e leitura simples.
- [ ] `A11Y-02` — Verificar visão de cores e manter descrições textuais independentes de cor.
- [ ] `A11Y-03` — Registrar recursos sem implementação como indisponíveis, não como controles falsos.
- [ ] `A11Y-04` — Verificar persistência das preferências, restauração de padrões e estados em drawer/painéis.
- [ ] `A11Y-05` — Comparar botão de acessibilidade no cabeçalho e abertura direta do grupo de controles.
- [ ] `A11Y-06` — Executar axe e revisão manual de foco, nomes acessíveis, contraste e navegação sem mouse.

### Projetor, inicialização e aplicativo

- [ ] `APP-01` — Comparar Modo projetor: ligar/desligar, persistência, efeito nos painéis e retorno ao layout normal.
- [ ] `APP-02` — Comparar escolha de tela inicial, redefinir preferência e comportamento na primeira execução.
- [ ] `APP-03` — Comparar instalação PWA, indicação de instalável, estado offline e recuperação de atualização.
- [ ] `APP-04` — Comparar Sobre, versão, referências/créditos e atalhos para Manual.
- [ ] `APP-05` — Conferir que a animação de abertura seja opcional, pule corretamente e respeite movimento reduzido.
- [ ] `APP-06` — Conferir avisos de armazenamento, conflito entre abas, backup e recuperação.

## 5. Requisitos científicos que acompanham todas as telas

- [ ] `SCI-01` — Preservar a distinção entre dado tabelado, medida do modelo, valor calculado pelo SILM e texto do usuário.
- [ ] `SCI-02` — Preservar fontes, condições de referência e proveniência nos pontos em que os dados são apresentados.
- [ ] `SCI-03` — Não substituir metais com estrutura de referência fora de CCC/CFC/HC por um desses modelos.
- [ ] `SCI-04` — Não apresentar representações qualitativas como dados quantitativos ou resultados experimentais.
- [ ] `SCI-05` — Manter o mesmo estado científico entre Montagem, Ver, Dados, atividade e relatório.
- [ ] `SCI-06` — Garantir que zoom, câmera, projeção, painéis e camadas não alterem medições ou cálculos.
- [ ] `SCI-07` — Conferir fórmulas, unidades, origens de entrada e limites em qualquer tela que mostre resultados.

## 6. Testes e evidências

### Comandos existentes no SILM

Executar ao concluir cada etapa, além dos testes específicos que forem criados:

- `npm run build`
- `npm test`
- `npm run test:a11y`
- `npm run test:comparison`
- `npm run test:routes:browser`
- `npm run test:backup`

O comando `npm test` já reúne os testes científicos, de rotas, aprendizagem e integração. Não substitui o teste de acessibilidade nem a inspeção visual.

### Testes de tela que ainda precisam ser criados ou ampliados

- [ ] `TEST-HOME` — teste do Início (hero, caminhos, contagem, retomada, links).
- [ ] `TEST-LEARN` — lista/detalhe/retorno e conexão com investigação.
- [ ] `TEST-MISSION` — lista/detalhe/evidência/conclusão/refazer/restrições.
- [ ] `TEST-ROUTE` — lista/detalhe/identificação/módulo único/preparação/retomada.
- [ ] `TEST-WORKSPACE` — Foco, painéis, estado vazio, seleção, teclado, toque e rolagem.
- [ ] `TEST-NOTEBOOK` — criação, filtros, persistência, backup, importação inválida, CSV, impressão e exclusão.
- [ ] `TEST-MANUAL` — busca, índice, artigo, links, ajuda contextual e impressão.
- [ ] `TEST-REPORT` — sessões, captura de dados, edição, impressão e acesso restrito.
- [ ] `TEST-TEACHER` — CRUD de biblioteca, prévia, permissões e import/export.
- [ ] `TEST-SHELL` — navegação, drawer, foco, preferências, projetor e startup.
- [ ] `TEST-PWA` — instalação, cache, atualização e uso offline sem falha de dados.
- [ ] `TEST-RESPONSIVE` — 320×640, 390×844, 844×390, tablet e desktop, sem overflow.
- [ ] `TEST-PRINT` — Caderno, Relatório, Manual e guia do Professor.

### Evidências por etapa

Cada diretório `docs/evidence-parity/<ID-da-tela>/` deve conter:
1. captura SIAB e SILM com viewport igual;
2. lista curta dos elementos comparados;
3. teste executado e saída/resumo;
4. commit que introduziu a mudança;
5. diferenças de domínio aceitas como `N/A`.

## 7. Situação da branch antes do início da execução ordenada

Há mudanças preliminares no branch que precisam ser revistas na etapa correspondente; nenhuma destas telas deve ser considerada homologada só porque o texto foi alterado:

| Arquivo no branch | Mudança preliminar | Quando revalidar |
|---|---|---|
| `index.html` | Início e cabeçalho da Visão geral; link de Jazz retirado do hero | Etapa 1 e etapa 5.5 |
| `integracao/unified-ui.js` | Contagens dinâmicas do Início | Etapa 1 |
| `domain/silm/bootstrap.js` | Resumos de módulos, temas e mensagens mais curtos | Etapas 2 e 5 |
| `js/experience/experience.js` | Introduções de Roteiros/Missões/Montagens reduzidas | Etapas 3, 4 e recursos secundários |
| `js/experience/learning.js` | Textos de entrada de Aprender reduzidos | Etapa 2 |
| `js/experience/modules.js` | Anúncio de ativação sem descrição repetida | Etapa 5 |
| `integracao/structure-comparison.js` | Cartões/controles da Visão geral simplificados | Etapa 5.5 |
| `integracao/workspace-family.css` | Grade, fluxo dos cartões e remoção de rolagem interna | Etapa 5.5 |
| `js/experience/reports.js` | Cabeçalho reduzido | Etapa 8 |
| `js/experience/teacher.js` | Cabeçalho reduzido | Etapa 11 |

As mudanças em telas fora da ordem definida são provisórias até que a etapa delas seja executada. Se a comparação justificar outra solução, revisar o commit em vez de preservar texto apenas por já estar no branch.

## 8. Registro de aceite por etapa

Duplicar este bloco ao finalizar cada tela:

```text
ID da etapa:
Tela SIAB:
Tela SILM:
Commit:
Viewport(s):
Arquivos alterados:
Diferenças de domínio / N/A:
Testes executados:
Evidências:
Pendências:
Estado: [ ] / [~] / [x] / [!] / [N/A]
```

## 9. Restrições de escopo

- Este plano é do programa principal SILM.
- Clube de Jazz, jukebox, áudio, Blender, Babylon.js e seus recursos internos estão fora do escopo.
- O símbolo institucional do SILM pode aparecer no Início; isso não autoriza incluir atalho de navegação para o Clube de Jazz.
- Não fazer merge nem publicar a branch apenas porque a documentação está concluída. A integração depende de testes, validação visual e revisão do conjunto da PR.
