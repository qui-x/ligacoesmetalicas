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
| Temas de Aprender | 14 temas registrados em `js/data/temas.js` | 7 temas em `domain/silm/themes.js` (correção de 31/10/2026: os 4 temas eram do bootstrap antigo) | Comparar cobertura pedagógica; não igualar contagem automaticamente |
| Missões | Catálogo distribuído por `js/data/missoes.js` e registros complementares em `js/data/temas.js` | 6 missões em `domain/silm/missions.js` | Conferir cobertura, progressão, evidências e conclusão |
| Roteiros | 10 percursos montados a partir das montagens com narrativa em `js/data/experimentos.js` | 5 roteiros em `domain/silm/routes.js` | Conferir cobertura e qualidade do percurso; não copiar experimentos |
| Montagens prontas | 11 registros em `js/data/montagens.js` | Nenhuma tela ativa na entrada atual: os 3 presets ficaram em `domain/silm/bootstrap.js`, que não é carregado; só a chave `mounting.presets` está reservada em `integracao/durable-storage.js` | Comparar organização e variedade útil; não criar presets cientificamente inválidos |
| Manual | 13 categorias e 52 tópicos registrados | 3 categorias e 21 tópicos registrados | Lacuna de cobertura e aprofundamento do Manual do SILM |
| Caderno | Ativo: notas, práticas, filtros, CSV, impressão e exclusão | Ativo em `integracao/unified-ui.js`: registros por tipo, filtros, backup e restauração, exclusão (correção de 31/10/2026: `notebook.enabled:false` era do bootstrap antigo) | Lacuna funcional prioritária quando chegarmos à tela Caderno |
| Relatórios | Relatório completo, para preencher à mão e atividade de análise; configuração de seções e dados | Relatório contextual com dados de sessão e campos textuais básicos | Paridade parcial; expandir após comparar o fluxo contextual |
| Área do Professor | Configuração detalhada, atividades recentes, copiar, editar, duplicar, excluir e guia do professor | Formulário básico, prévia, abrir como aluno e importar/exportar JSON | Paridade parcial; falta gestão de biblioteca e aprofundamento pedagógico |

### Mapa dos arquivos vivos (atualizado em 31/10/2026)

Desde a integração com a Base SI 0.9.17, a entrada carrega só a Base (travada por hash em `integracao/upstream/`) e o motor científico. Vários ponteiros deste plano foram escritos para a arquitetura anterior: `domain/silm/bootstrap.js`, `domain/silm/presentation.js` e `js/experience/*` não são carregados. Ao executar cada etapa, use estes arquivos e corrija o ponteiro da etapa:

| Tela | Arquivos vivos |
|---|---|
| Todas | `integracao/index.html` (fonte; o `index.html` da raiz é gerado por `scripts/build-main-entry.cjs`), `integracao/adapter.js` (rotas, foco, montagem do produto), `integracao/integration.css` e `integracao/silm-theme.css` (ajustes do SILM; `integracao/upstream/*.css` não se edita) |
| Início | `integracao/index.html` `data-view="inicio"`, `integracao/unified-ui.js` `home()` |
| Aprender | `integracao/unified-ui.js` `themes()`, `domain/silm/themes.js` |
| Missões e Roteiros | `integracao/route-ui.js` (`catalogue`, `guidance`, `guard`, `report`), `domain/silm/missions.js`, `domain/silm/routes.js`, `domain/silm/route-session.js` |
| Oficina | `integracao/workspace-family.js`, `integracao/scientific-tools.js`, `integracao/metallic-experience.js`, `integracao/structure-comparison.js`, `integracao/workspace-family.css`, vistas em `domain/silm/*-view.js` |
| Caderno, Manual, Professor | `integracao/unified-ui.js` (`notebook`, `manual`, `professor`), `domain/silm/manual.js` |
| Relatórios | `integracao/route-ui.js` `report()` (ações, "Preparar relatório", documento em 10 seções; configuração em `report.config:<relatório>`), `integracao/unified-ui.js` `freeReport()` e `recordReport()`, campos em `domain/silm/route-session.js` |
| Montagens prontas | Sem tela na entrada atual (lacuna da etapa 9) |
| Tour e ajuda | `integracao/adapter.js` `shell()` (tour, ajuda "?" das docas, aviso de primeira visita em `emptyState`), janelas `#silm-tour` e `#silm-help-dialog` |
| Menu, preferências, PWA | Gaveta, janelas Tela inicial e Sobre em `integracao/index.html`; `integracao/adapter.js` `shell()` (tela inicial, Sobre, "Agora", acessibilidade direta, abertura); `integracao/base-core.js` (gerado da Base: `setupMenuReview`); `integracao/pwa.js`; `sw.js` (gerado por `scripts/build-sw.cjs`) |

Evidências de cada etapa: `node scripts/parity-capture.cjs <ID> <rota-SIAB> <rota-SILM> --siab <pasta do SIAB>`. Testes de tela: `npm run test:parity` (`tests/parity-screens.cjs`, um módulo por etapa em `tests/parity/`).

## 2. Ordem obrigatória de execução

A ordem foi conferida nos menus principais do SIAB e do SILM:

| Ordem | Tela de referência | Tela do SILM | Estado da etapa |
|---:|---|---|---|
| 1 | Início | Início | Aceito em 31/10/2026 — registro na seção 8 |
| 2 | Aprender | Aprender / Temas | Aceito em 31/10/2026 — registro na seção 8 |
| 3 | Missões | Missões | Aceito em 31/10/2026 — registro na seção 8 |
| 4 | Roteiros Experimentais | Roteiros Experimentais | Aceito em 31/10/2026 — registro na seção 8 |
| 5 | Laboratório | Oficina dos Metais | Aceito em 31/10/2026 — as cinco subáreas abaixo |
| 5.1 | Bancada em Foco | Oficina → Foco | Aceito em 31/10/2026 — registro na seção 8 |
| 5.2 | Montagem / prateleira | Oficina → Montagem | Aceito em 31/10/2026 — registro na seção 8 |
| 5.3 | Ver / investigação | Oficina → Ver | Aceito em 31/10/2026 — registro na seção 8 |
| 5.4 | Dados | Oficina → Dados | Aceito em 31/10/2026 — registro na seção 8 |
| 5.5 | Visão geral | Oficina → Visão geral | Aceito em 31/10/2026 — registro na seção 8 |
| 6 | Caderno | Caderno | Aceito em 31/10/2026 — registro na seção 8 |
| 7 | Manual | Manual | Aceito em 31/10/2026 — registro na seção 8 |
| 8 | Relatório | Relatório | Aceito em 31/10/2026 — registro na seção 8 |
| 10 | Tour e ajuda contextual | Tour da oficina e ajuda dos painéis | Aceito em 31/10/2026 — registro na seção 8 |
| 12 | Menu, preferências, projetor e aplicativo | Menu, preferências, projetor e aplicativo | Aceito em 31/10/2026 — registro na seção 8 (MENU-05 entra com as Etapas 9 e 10) |

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

**SILM:** `integracao/index.html` seção `data-view="inicio"` (fonte do `index.html` gerado), `integracao/unified-ui.js` função `home()`, `integracao/integration.css` (bloco "Etapa 1, Início"), sobre `integracao/upstream/home-fidelity.css` e `integracao/upstream/home-context.css` (Base, travados).

**O que comparar:** sobretítulo, título com destaque, lema, símbolo institucional, frase da seção, cartão principal, cartões secundários, contagens vivas, atalhos de apoio, retomada e resumo da investigação.

### Tarefas

- [x] `HOME-01` — Hero na hierarquia do SIAB: sobretítulo com o nome completo ("SIMULADOR INTERATIVO DE LIGAÇÕES METÁLICAS"), título curto com destaque ("A arquitetura *dos metais*", frase do sobretítulo anterior), lema "Monte. Observe. Meça. Calcule." e símbolo estático. Recuo acima do hero igual ao do SIAB (34 px; 16 px até 900 px).
- [x] `HOME-02` — "Escolha seu próximo passo" e "Da curiosidade à descoberta" conferidos nos 5 tamanhos; no celular a frase quebra abaixo do título, como no SIAB.
- [x] `HOME-03` — Cartão em destaque da Oficina (etiqueta à direita, botão "Entrar na oficina →") e cartões secundários na ordem do SIAB, com ícones desenhados (os mesmos do menu lateral) e seta à direita; distribuição conferida nos 5 tamanhos.
- [x] `HOME-04` — Contagens dinâmicas com singular/plural; contagem em peso normal, como no SIAB; resumo da investigação no singular ("1 unidade salva").
- [x] `HOME-05` — Caderno vazio ("Pronto para seus registros"), com 1 ("1 registro salvo") e com 2 registros ("2 registros salvos"). O Caderno está ativo, então o cartão pode prometer registros.
- [x] `HOME-06` — Rodapé: Manual de uso, Área do Professor e Preferências, todos com destino conferido e alvo de 44 px; sem link de relatório. `N/A`: o botão "Configurações de inicialização" do SIAB fica no menu lateral do SILM (Etapa 12).
- [x] `HOME-07` — Retomada e resumo preservados e agora alcançáveis: durante uma atividade o Início passou a ser permitido (antes redirecionava para a atividade, e o cartão de retomada nunca aparecia). As telas fora do contexto continuam voltando à atividade, com aviso.
- [x] `HOME-08` — A marca leva sempre ao Início (durante a atividade levava à atividade, apesar do nome "SILM, início"); o símbolo do hero não tem link; foco como no SIAB (documento na abertura, título e topo da página na troca de tela); ordem do Tab conferida; botão Acessibilidade sem o fundo cinza do navegador.
- [x] `HOME-09` — `tests/parity/home.cjs` (TEST-HOME), executado por `npm run test:parity` e pelos dois fluxos de CI.

**Aceite da etapa:** o Início deve ter a mesma hierarquia e simplicidade do SIAB, mas apresentar a identidade e os caminhos do SILM. Retomada científica não pode ser removida para obter semelhança.

## ETAPA 2 — Aprender / Temas

**Referência SIAB:** `index.html` `data-tela="aprender"` e `data-tela="tema"`; `js/telas/aprender.js`; `js/data/temas.js`; categorias e artigos do Manual.

**SILM:** `integracao/index.html` `data-view="aprender"`; `integracao/unified-ui.js` função `themes()` (lista e tema na mesma rota, `#/aprender?tema=<id>`); `domain/silm/themes.js`; `integracao/integration.css` (bloco "Etapa 2, Aprender"). Os ponteiros antigos (`js/experience/*`, `bootstrap.js`) não são carregados.

### Tarefas

- [x] `LEARN-01` — Cabeçalho "Temas" + introdução do SIAB; lista de linhas (o cartão inteiro é o link; título, resumo curto e situação "Não revisado"/"Revisado" à direita) no lugar da grade com botão separado.
- [x] `LEARN-02` — Abrir o tema leva ao topo com foco no título; "Todos os temas" e o Voltar do navegador devolvem a lista com o foco na linha do tema aberto; tema inexistente volta à lista com aviso.
- [x] `LEARN-03` — Tema em coluna de leitura: "APRENDER · TEMA", título, ideia principal como abertura, subtítulo + descrição, ações; depois conteúdo relacionado, "Aprofunde" (três conceitos) e fontes.
- [x] `LEARN-04` — "Investigar na oficina" prepara o metal representativo na Montagem e abre a Oficina com a Montagem aberta; a investigação só começa com Iniciar e uma investigação em andamento nunca é substituída.
- [x] `LEARN-05` — Os temas são 7 (não 4) e cobrem os três módulos, todas as missões e todos os roteiros. Lacunas possíveis registradas para validação do autor em `docs/evidence-parity/LEARN/README.md` (tendências periódicas, ligas, defeitos), sem conteúdo inventado.
- [x] `LEARN-06` — "Marcar como revisado" / "Revisado · desmarcar" com `aria-pressed`, foco preservado, persistência e repetição livre; o teste confere a ausência de pontos, ranking e porcentagem.
- [x] `LEARN-07` — Conteúdo relacionado: todas as missões e roteiros do tema pelo nome, só com destinos do catálogo (testado); metais para observar; o Manual segue acessível pela navegação.
- [x] `LEARN-08` — Lista com resumo de uma ou duas linhas; aprofundamento só dentro do tema; a ideia principal saiu da lista de detalhes porque virou a abertura (sem texto repetido na tela).
- [x] `LEARN-09` — `tests/parity/learn.cjs` (TEST-LEARN) em `npm run test:parity`.

**Aceite da etapa:** lista e detalhe apresentam uma arquitetura equivalente à do SIAB, com explicação e conexões específicas de ligações metálicas.

## ETAPA 3 — Missões

**Referência SIAB:** `index.html` `data-tela="missoes"` e `data-tela="atividade"`; `js/telas/missao.js`; `js/data/missoes.js`; extensões em `js/data/temas.js`; `js/ui/activity-ui.js`.

**SILM:** `integracao/index.html` `data-view="missoes"`; `integracao/route-ui.js` funções `missionCatalogue()` (lista e especificação, `#/missoes?item=<id>`) e `missionPanel()` (painel na Oficina, aba Missão); `domain/silm/missions.js`; `domain/silm/route-session.js`. Os ponteiros antigos (`js/experience/*`) não são carregados.

### Tarefas

- [x] `MISSION-01` — Lista em linhas com título, resumo (subtítulo, módulo, conceito) e situação "Não realizado"/"Em andamento"/"Concluído" à direita; ordem do catálogo; o cartão inteiro abre a especificação.
- [x] `MISSION-02` — Especificação e painel com "MISSÃO · situação", título, "O problema", "Objetivo e regras" (módulo, recursos liberados, condições), dica recolhível, temas relacionados e fontes.
- [x] `MISSION-03` — "Evidência" no painel com o rótulo do que `route-session` confere e o estado "Pendente"/"Atendida" atualizado ao vivo.
- [x] `MISSION-04` — Campo "Conclusão" salvo na sessão a cada digitação, preservado entre redesenhos e depois de recarregar; retorno em `role="status"`.
- [x] `MISSION-05` — Iniciar, continuar, concluir, encerrar, refazer e retomar depois de recarregar ("Retomar na oficina") conferidos no teste.
- [x] `MISSION-06` — Contexto restrito: Início, Oficina, a própria missão, relatórios e Manual; as outras telas voltam para a missão com aviso; a aba do painel diz "Missão".
- [x] `MISSION-07` — O registro da missão concluída no Caderno inclui a conclusão do estudante.
- [x] `MISSION-08` — As 6 missões cobrem os três módulos e os critérios verificáveis existentes; nenhuma missão nova sem critério homologado.
- [x] `MISSION-09` — Missão inexistente volta à lista com aviso; sessão concluída bloqueia a conclusão e oferece Refazer; sessão interrompida é retomada.
- [x] `MISSION-10` — `tests/parity/mission.cjs` (TEST-MISSION) em `npm run test:parity`.

**Aceite da etapa:** uma missão deve oferecer problema, evidência, conclusão e ciclo de retomada tão claros quanto no SIAB, com critérios científicos e recursos exclusivos do SILM.

## ETAPA 4 — Roteiros Experimentais

**Referência SIAB:** `index.html` `data-tela="roteiros"` e `data-tela="roteiro"`; `js/telas/roteiros.js`; `js/data/experimentos.js`; `js/data/montagens.js`.

**SILM:** `integracao/index.html` `data-view="roteiros"`; `integracao/route-ui.js` funções `routeCatalogue()` (lista e roteiro com identificação, `#/roteiros?item=<id>`), `routePanel()` (painel na Oficina) e `report()`; `domain/silm/routes.js`; `domain/silm/route-session.js` (identificação no relatório da sessão). Os ponteiros antigos (`js/experience/*`) não são carregados.

### Tarefas

- [x] `ROUTE-01` — Lista em linhas com título, subtítulo e o módulo com seta à direita (mais a situação, quando houver); o cartão inteiro abre o roteiro.
- [x] `ROUTE-02` — Roteiro em coluna de leitura: "O problema", "Objetivo", "O que você vai fazer", "Na oficina", "O que observar", "Critério de conclusão", temas relacionados e fontes. `N/A`: "Pergunta central" já está no problema.
- [x] `ROUTE-03` — Identificação (Nome, Turma, Data, Professor, Grupo) antes de montar, guardada para a próxima montagem e copiada para o relatório da sessão; o relatório e o registro no Caderno mostram a identificação.
- [x] `ROUTE-04` — "Na oficina" descreve o estado inicial (montagem livre com N unidades ou estrutura de referência) e os metais elegíveis; o seletor só oferece metais elegíveis.
- [x] `ROUTE-05` — Cada roteiro tem exatamente um módulo (testado no catálogo inteiro; o validador recusa módulo secundário); o módulo fica fixado na sessão.
- [x] `ROUTE-06` — Restrição, recursos permitidos, conclusão, retorno e retomada depois de recarregar conferidos no teste; painel Roteiro com evidência ao vivo.
- [x] `ROUTE-07` — Relatório da sessão pelo botão "Relatório" do painel, com identificação, medições e cálculos com origem e campos de texto.
- [x] `ROUTE-08` — 5 roteiros: 3 Explorar, 1 Medir, 1 Calcular; 48 metais nos cristalinos e 57 no de elétrons (`docs/COBERTURA-ROTEIROS.md`).
- [x] `ROUTE-09` — Roteiro inexistente volta à lista; metais sem estrutura fora dos roteiros cristalinos; instrumentos fora do roteiro ocultos ou desativados; conclusão bloqueada até a evidência.
- [x] `ROUTE-10` — `tests/parity/route.cjs` (TEST-ROUTE) em `npm run test:parity`.

**Aceite da etapa:** os roteiros têm navegação, identificação, preparação e detalhe comparáveis ao SIAB, mas descrevem procedimentos próprios de investigação de metais.

## ETAPA 5 — Laboratório / Oficina dos Metais

A tela do Laboratório no SIAB é a referência para o workspace. No SILM, trabalhar nesta ordem interna: **Foco → Montagem → Ver → Dados → Visão geral**. Não começar pela Visão geral só porque recebeu uma alteração antecipada.

### 5.1 — Oficina: Foco

**Referência SIAB:** `data-tela="bancada"`, `js/telas/laboratorio.js`, `js/telas/bancada.js`, `js/ui/workspace.js`, `js/ui/trilho.js`.

**SILM:** `data-view="ambiente"`, `#workspace-focus`, `#silm-integration-scene`, `integracao/adapter.js` (`renderScene()`, `emptyState()`, etiqueta `#si-module-tag`), `domain/silm/assembly-view.js`, `domain/silm/crystal-view.js`.

- [x] `LAB-FOCUS-01` — Cena, barra e docas comparadas nos 5 tamanhos; etiqueta do módulo logo após as abas, como no SIAB.
- [x] `LAB-FOCUS-02` — Sem metal: cartão "Oficina vazia" com três ações funcionais; metal sem estrutura: cartão próprio; montagem vazia, livre e cristalina conferidas.
- [x] `LAB-FOCUS-03` — Adicionar e desfazer (TEST-WORKSPACE); seleção, mover e posicionamento assistido (`base-integration`, `silm-mobile-mechanics`).
- [x] `LAB-FOCUS-04` — Trocar para Medir preserva metal e unidades e bloqueia a edição da montagem (TEST-WORKSPACE).
- [x] `LAB-FOCUS-05` — Câmera, projeção, zoom, enquadrar, centralizar, teclado e toque cobertos por `silm-mobile-mechanics`, `base-integration` e `workspace-a11y`.
- [x] `LAB-FOCUS-06` — Sem comandos repetidos: Desfazer só na barra; "Limpar estrutura" só no menu Mais; o cabeçalho da cena fica com Adicionar e Organizar.
- [x] `LAB-FOCUS-07` — Estado da atividade na etiqueta ("Missão · …"/"Roteiro · …") e nos painéis das Etapas 3 e 4; ajuda em "Mais → Como usar".
- [x] `LAB-FOCUS-08` — Expansão, painel sobreposto e retorno do foco cobertos por `workspace-family` (cinco tamanhos).
- [x] `LAB-FOCUS-09` — `tests/parity/workspace.cjs` (TEST-WORKSPACE, parte 5.1) em `npm run test:parity`.

### 5.2 — Oficina: Montagem

**Referência SIAB:** painel de laboratório, prateleira, escolha de soluções/reagentes, módulos e atividade; `js/ui/prateleira.js`, `js/ui/modulos.js`, `js/ui/layout-bancada.js`.

**SILM:** dock `#si-dock-left` (`integracao/index.html`), `integracao/adapter.js` (resumo `#silm-summary-list`, ações), `integracao/workspace-family.js`, `domain/silm/periodic-table.js`, `domain/silm/assembly.js`. O ponteiro antigo `bootstrap.js` não é carregado.

- [x] `LAB-MOUNT-01` — Cabeçalho com "Fechar" escrito, abas Resumo/Preparo/Unidades/Módulo, grupos rotulados na aba Preparo e rolagem da doca conferidos.
- [x] `LAB-MOUNT-02` — Resumo em pares rótulo/valor (Metal, Estrutura com o nome completo, Unidades, Módulo, Medições, Cálculos; atividade quando houver).
- [x] `LAB-MOUNT-03` — Tabela Periódica: seleção, elegibilidade e troca com confirmação (`table-mounting`).
- [x] `LAB-MOUNT-04` — Iniciar (agora ação principal), adicionar, organizar, voltar à montagem livre e limpar (`base-integration`, TEST-WORKSPACE).
- [x] `LAB-MOUNT-05` — Propriedades: iniciar, controlar, ler, restaurar (`base-integration`, TEST-MISSION).
- [x] `LAB-MOUNT-06` — Módulo ativo e explicação curta na aba Módulo (`workspace-family`); etiqueta do módulo na barra (5.1).
- [x] `LAB-MOUNT-07` — Só os controles liberados pela atividade (TEST-MISSION, TEST-ROUTE).
- [x] `LAB-MOUNT-08` — Metal sem geometria validada: organizar bloqueado com o motivo escrito e nenhuma estrutura cristalina inventada (TEST-WORKSPACE com o manganês).
- [x] `LAB-MOUNT-09` — Controles com 44 px, "Fechar" devolve o foco ao botão Montagem, axe sem violações (`workspace-a11y`).

### 5.3 — Oficina: Ver

**Referência SIAB:** painel VER, trilho de investigação e visualizações; `js/ui/ver-investigacao.js`, `js/ui/grafico.js`, `js/ui/equacao.js`, `js/ui/render.js`.

**SILM:** dock `#si-dock-right`, `#si-viewer-catalog`, `integracao/workspace-family.js` (título "Investigar"), `integracao/scientific-tools.js`, `domain/silm/measure-view.js`, `domain/silm/property-view.js`, `domain/silm/calculations.js`. O ponteiro antigo `exploration.js` não é carregado.

- [x] `LAB-VIEW-01` — Painel "Investigar" como no SIAB, abas de família, lista de recursos, detalhe com título próprio e "← Ver" de volta.
- [x] `LAB-VIEW-02` — Observar, Medir e Analisar separados; cada módulo acrescenta só a sua família (testado nos três módulos).
- [x] `LAB-VIEW-03` — Cada recurso tem uma frase curta de foco (estrutura, elétrons, propriedades, instrumentos, cálculos) ao lado da ação.
- [x] `LAB-VIEW-04` — Mostrar elétrons não altera metal, unidades, medições nem cálculos (TEST-WORKSPACE).
- [x] `LAB-VIEW-05` — Propriedades com estado qualitativo, tabelado ou indisponível e motivo (`base-integration`, TEST-MISSION).
- [x] `LAB-VIEW-06` — Instrumento, unidade e pontos; a leitura é anunciada como "Medida do modelo" e registrada em Dados.
- [x] `LAB-VIEW-07` — Cada entrada mostra a origem ("Dado tabelado", "Medida do modelo", "Valor informado"); o resultado diz "Calculado pelo SILM".
- [x] `LAB-VIEW-08` — Comparação de referências sem escala comum nem classificação (`structure-comparison`, Etapa 5.5).
- [x] `LAB-VIEW-09` — 2D/3D, projeções, volta ao 2D e invariância (`electrons-3d`, `base-integration`).
- [x] `LAB-VIEW-10` — Texto curto junto da ação; aprofundamento no Manual (link "Ajuda sobre representação").
- [x] `LAB-VIEW-11` — TEST-WORKSPACE parte 5.3: famílias, camadas, instrumento, cálculo e invariância.

### 5.4 — Oficina: Dados

**Referência SIAB:** dados medidos, registro da investigação, gráficos, tabelas e atalho para relatório; `js/ui/workspace.js`, `js/ui/ver-investigacao.js`, `js/telas/relatorios.js`.

**SILM:** `#silm-data-catalog` em `integracao/index.html`, `integracao/workspace-family.js` (título "Dados da investigação", páginas), `integracao/scientific-tools.js` (registros `#silm-history`), `domain/silm/data-api.js`, `integracao/durable-storage.js`. O ponteiro antigo `js/experience/history.js` não é carregado.

- [x] `LAB-DATA-01` — "Dados da investigação" como no SIAB, três consultas, detalhe e "← Dados" com retorno do foco.
- [x] `LAB-DATA-02` — Dados do metal com valores, unidades, condições, disponibilidade e fontes (`base-integration`).
- [x] `LAB-DATA-03` — Medições com instrumento, unidade, valor e procedência (TEST-WORKSPACE, `base-integration`).
- [x] `LAB-DATA-04` — Cálculos com fórmula, entradas, origem e "Calculado pelo SILM" (TEST-WORKSPACE, relatório da Etapa 4).
- [x] `LAB-DATA-05` — Histórico preservado depois de recarregar (`base-integration`, TEST-MISSION).
- [x] `LAB-DATA-06` — Exportar e abrir JSON, rejeição de arquivo inválido sem perder o estado (`base-integration`, `notebook-backup`).
- [x] `LAB-DATA-07` — Seção "Relatório" com "Abrir relatório" e "Abrir Caderno" (o Caderno está ativo); o relatório some durante uma atividade, que tem o seu.
- [x] `LAB-DATA-08` — Aba obsoleta bloqueada e falha de persistência tratada (`notebook-backup`, `durable-storage`).
- [x] `LAB-DATA-09` — TEST-WORKSPACE parte 5.4: consultas, contagem, registros rotulados, seção Relatório e retorno.

### 5.5 — Oficina: Visão geral

**Referência SIAB:** área `overview-view`, seleção de tubos, ordenação, hint, grade e ações de comparação.

**SILM:** `#workspace-overview`, `integracao/structure-comparison.js`, `integracao/workspace-family.css`.

**Estado atual:** homologada em 31/10/2026. A grade da Base (`si-overview-grid`, colunas de 160 px) espremia controles e cartões; o contêiner passou a ter uma coluna só.

- [x] `LAB-OVERVIEW-01` — Cabeçalho curto, sem introdução repetida (rodada do autor, conferida).
- [x] `LAB-OVERVIEW-02` — Controles resumidos em uma barra de largura total; fontes e limites recolhidos ("Fonte e limites", "Limites da comparação").
- [x] `LAB-OVERVIEW-03` — Sem rolagem interna concorrendo com a do workspace (conferido em 3 tamanhos).
- [x] `LAB-OVERVIEW-04` — Grade em coluna única no contêiner, cartões de no mínimo 300 px; 2 cartões (TEST-WORKSPACE) e 6 referências (`structure-comparison`).
- [x] `LAB-OVERVIEW-05` — Propriedade, intensidade e Restaurar (TEST-WORKSPACE); elétrons, movimento e movimento reduzido (`structure-comparison`).
- [x] `LAB-OVERVIEW-06` — Rótulo curto do metal e da estrutura, fonte por cartão e limites recolhidos; estado qualitativo ou motivo da indisponibilidade em cada cartão.
- [x] `LAB-OVERVIEW-07` — Referência inconsistente bloqueada, cinco geometrias e propriedades indisponíveis (`structure-comparison`).
- [x] `LAB-OVERVIEW-08` — 1366×768, 390×844 e 844×390 sem cartões cortados, controles cortados nem rolagem lateral (TEST-WORKSPACE).
- [x] `LAB-OVERVIEW-09` — `structure-comparison` e `electrons-3d` aprovados; evidência em `docs/evidence-parity/LAB-OVERVIEW/`.

**Aceite da Oficina:** Foco, Montagem, Ver, Dados e Visão geral foram comparados e testados na ordem. As mesmas entidades científicas são exibidas nos painéis; não criar uma segunda fonte de verdade visual.

## ETAPA 6 — Caderno

**Referência SIAB:** `index.html` `data-tela="caderno"`; `js/telas/caderno.js`; `SIAB.cadernoCSV`; impressão e detalhe de prática.

**SILM:** `integracao/index.html` seção `data-view="caderno"`; `integracao/unified-ui.js` função `notebook()` (registros, filtro, CSV, impressão, backup, exclusão) e `recordActivity`/`recordReport` (registros automáticos). Os ponteiros antigos (`js/experience/notebook.js`, `bootstrap.js` com `notebook.enabled:false`) não são carregados.

### Tarefas

- [x] `NOTE-01` — Anotação, hipótese e conclusão; registros automáticos de missão/roteiro (com a conclusão do estudante) e de relatório (com a identificação); vínculo com cena e tentativa (`attemptId`).
- [x] `NOTE-02` — Rota ativa; o cartão do Início e "Abrir Caderno" em Dados levam a ela (TEST-HOME, TEST-WORKSPACE).
- [x] `NOTE-03` — Lista cronológica com filtro por tipo (TEST-NOTEBOOK); os tipos já separam registros de atividade e pessoais.
- [x] `NOTE-04` — Criação com tipo, título obrigatório e texto, retorno de sucesso. `N/A`: edição (o SIAB também só cria e apaga).
- [x] `NOTE-05` — Registros de relatório abrem o relatório arquivado (`learning-browser`).
- [x] `NOTE-06` — CSV com cabeçalho e BOM UTF-8 (TEST-NOTEBOOK).
- [x] `NOTE-07` — Backup JSON versionado, importação validada, rollback e sem duplicatas (`notebook-backup`, `learning-browser`).
- [x] `NOTE-08` — Impressão só com cabeçalho e registros, também por Ctrl+P (TEST-NOTEBOOK).
- [x] `NOTE-09` — Exclusão individual e total com confirmação; relatórios arquivados preservados (TEST-NOTEBOOK, `learning-browser`).
- [x] `NOTE-10` — Missão, roteiro e relatório registrados uma vez por tentativa (`attemptId`, `learning-browser`).
- [x] `NOTE-11` — `tests/parity/notebook.cjs` (TEST-NOTEBOOK) mais `notebook-backup` e `learning-browser`.

**Aceite da etapa:** nenhum link “Abrir Caderno” pode levar a uma tela vazia ou desabilitada; todo registro deve ser recuperável e exportável.

## ETAPA 7 — Manual

**Referência SIAB:** `data-tela="manual"`, `js/telas/manual.js`, `js/data/manual.js`, `docs/MANUAL.md`.

**SILM:** `integracao/index.html` `data-view="manual"`, `integracao/unified-ui.js` função `manual()` (início, tópico, busca, impressão), `domain/silm/manual.js` (tópicos, aliases), documentação científica em `docs/`. Os ponteiros antigos (`js/manual/*`) não são carregados.

### Tarefas de interface

- [x] `MANUAL-01` — Barra com busca, "Voltar à oficina" e impressão; apresentação "Encontre seu próximo passo."; "Quero saber"; quatro grupos de tópicos.
- [x] `MANUAL-02` — Busca com resultados, vazio com sugestão, "Limpar busca" e navegação direta ao tópico (`#/manual?busca=`).
- [x] `MANUAL-03` — Tópico com caminho, sobretítulo, título com foco, resumo, conteúdo, passo a passo, "Saiba mais" recolhível e "Veja também". `N/A`: ilustrações (sem conteúdo homologado).
- [x] `MANUAL-04` — Ações contextuais: "Começar a usar", atalhos e links para telas (Oficina); iniciar tour fica para a Etapa 10.
- [x] `MANUAL-05` — "Imprimir tópico" (sem a barra) e "Imprimir guia rápido" (todos os tópicos).
- [x] `MANUAL-06` — Links internos válidos (todos os cartões e "Veja também" testados), alias, endereço antigo `#/manual/<id>` e retorno.
- [x] `MANUAL-07` — Ajuda contextual: painel Ver → tópico da vista; "Mais → Como usar" na Oficina; o "?" nas docas fica para a Etapa 10.
- [x] `MANUAL-08` — Busca por teclado (Enter), foco no título, detalhes recolhíveis nativos, impressão; axe sem violações nas suítes gerais.

### Tarefas de conteúdo SILM

- [x] `MANUAL-CONTENT-01` — Primeiros passos e navegação: "Conheça a Oficina dos Metais", "Como navegar", "Pesquisar no Manual".
- [x] `MANUAL-CONTENT-02` — "Selecionar um metal" (118 elementos, disponibilidade, condições e fontes).
- [x] `MANUAL-CONTENT-03` — "Montar a estrutura metálica" e "Reorganizar e reiniciar".
- [x] `MANUAL-CONTENT-04` — "Estruturas cristalinas" e "Por que uma opção não aparece" (metais com referência sem visualização, sem substitutos).
- [x] `MANUAL-CONTENT-05` — "Elétrons deslocalizados" (qualitativo e limites).
- [x] `MANUAL-CONTENT-06` — "Propriedades metálicas" (qualitativa, tabelada, indisponível).
- [x] `MANUAL-CONTENT-07` — "Explorar", "Medir" e "Calcular" (instrumentos, fórmulas, unidades, origens, limites).
- [x] `MANUAL-CONTENT-08` — "Mover a vista" e "Ver a estrutura em 3D" (projeções, teclado, toque, volta ao 2D).
- [x] `MANUAL-CONTENT-09` — "Roteiros, missões e atividades restritas".
- [x] `MANUAL-CONTENT-10` — "Usar o Caderno" (novo) e "Registrar e imprimir".
- [~] `MANUAL-CONTENT-11` — Professor, acessibilidade e instalação offline cobertos; Tour e Montagens prontas entram com as Etapas 9 e 10; Projetor a revisar na Etapa 12.
- [x] `MANUAL-CONTENT-12` — Marcadores "Documentação provisória" removidos; relacionados validados pelo teste.

**Aceite da etapa:** Manual navegável e pesquisável, com cobertura suficiente para todas as funções liberadas no SILM; não precisa copiar o conteúdo ácido-base nem a mesma quantidade de tópicos.

## 5. Recursos secundários — executar após as sete telas principais

## ETAPA 8 — Relatórios (tela contextual)

**Referência SIAB:** `data-tela="relatorio"`, `js/telas/relatorios.js`, configurações de impressão e dados de bancada.

**SILM:** `data-view="relatorios"`, `js/experience/reports.js`, `domain/silm/bootstrap.js` função `report.collect()`.

- [x] `REPORT-01` — Comparar abertura a partir de atividade, oficina e Caderno; retornar à origem correta.
- [x] `REPORT-02` — Comparar seleção de sessão/relatório arquivado e atualização dos dados da investigação.
- [x] `REPORT-03` — Definir relatório completo com identificação, proposta/objetivo, condições, estrutura, medições, cálculos, fontes, observações, análise, resposta e conclusão.
- [x] `REPORT-04` — Identificar claramente dado tabelado, medida do modelo, cálculo do SILM e texto autoral do estudante.
- [x] `REPORT-05` — Implementar modos aplicáveis: completo, para preencher à mão e atividade de análise do Professor.
- [x] `REPORT-06` — Implementar seleção de seções incluídas, campos deixados em branco e opções de impressão sem apagar registros científicos.
- [x] `REPORT-07` — Garantir persistência por sessão, edição, relatório arquivado e restauração após recarregar.
- [x] `REPORT-08` — Testar tabelas longas, cálculos, fontes, impressão/PDF, preenchimento manual e acesso restrito.
- [x] `REPORT-09` — Testar que o relatório não confunda intensidade didática com resultado experimental nem medida do modelo com medida de amostra real.

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

- [x] `TOUR-01` — Comparar abertura, passos, progresso, pular, voltar, próximo, fechar e foco.
- [x] `TOUR-02` — Garantir que cada etapa aponte para um controle real e visível na versão atual.
- [x] `TOUR-03` — Comparar primeira visita, opção de não iniciar e redução de movimento.
- [x] `TOUR-04` — Ligar cada ajuda contextual ao tópico correto do Manual.
- [x] `TOUR-05` — Conferir que o tour não bloqueie controles, painéis nem atividade em curso.
- [x] `TOUR-06` — Testar em desktop e celular com rolagem e painel aberto.

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

- [x] `MENU-01` — Comparar cabeçalho, abertura/fechamento da gaveta, backdrop, largura, foco inicial e restauração do foco.
- [x] `MENU-02` — Conferir ordem principal: Início → Aprender → Missões → Roteiros → Oficina → Caderno → Manual.
- [x] `MENU-03` — Conferir área “Agora”, contexto atual, botão Continuar e estado de atividade em andamento.
- [x] `MENU-04` — Conferir ações da atividade: Sobre esta atividade, Ajuda, Relatório, Finalizar e Encerrar; respeitar navegação restrita.
- [~] `MENU-05` — Conferir ordem de recursos secundários: Montagens prontas, Tour, Professor, apoio pedagógico e preferências.
- [x] `MENU-06` — Exibir acesso explícito à Área do Professor no grupo Professor.
- [x] `MENU-07` — Conferir estado ativo da rota, navegação por teclado, Escape e fechamento após selecionar destino.

### Preferências e acessibilidade

- [x] `A11Y-01` — Comparar modo escuro, alto contraste, tamanho de texto, espaçamento, redução de movimento e leitura simples.
- [x] `A11Y-02` — Verificar visão de cores e manter descrições textuais independentes de cor.
- [x] `A11Y-03` — Registrar recursos sem implementação como indisponíveis, não como controles falsos.
- [x] `A11Y-04` — Verificar persistência das preferências, restauração de padrões e estados em drawer/painéis.
- [x] `A11Y-05` — Comparar botão de acessibilidade no cabeçalho e abertura direta do grupo de controles.
- [x] `A11Y-06` — Executar axe e revisão manual de foco, nomes acessíveis, contraste e navegação sem mouse.

### Projetor, inicialização e aplicativo

- [x] `APP-01` — Comparar Modo projetor: ligar/desligar, persistência, efeito nos painéis e retorno ao layout normal.
- [x] `APP-02` — Comparar escolha de tela inicial, redefinir preferência e comportamento na primeira execução.
- [x] `APP-03` — Comparar instalação PWA, indicação de instalável, estado offline e recuperação de atualização.
- [x] `APP-04` — Comparar Sobre, versão, referências/créditos e atalhos para Manual.
- [x] `APP-05` — Conferir que a animação de abertura seja opcional, pule corretamente e respeite movimento reduzido.
- [x] `APP-06` — Conferir avisos de armazenamento, conflito entre abas, backup e recuperação.

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

- [x] `TEST-HOME` — teste do Início (hero, caminhos, contagem, retomada, links): `tests/parity/home.cjs`.
- [x] `TEST-LEARN` — lista/detalhe/retorno e conexão com investigação: `tests/parity/learn.cjs`.
- [x] `TEST-MISSION` — lista/detalhe/evidência/conclusão/refazer/restrições: `tests/parity/mission.cjs`.
- [x] `TEST-ROUTE` — lista/detalhe/identificação/módulo único/preparação/retomada: `tests/parity/route.cjs`.
- [x] `TEST-WORKSPACE` — Foco, painéis, estado vazio, seleção, teclado, toque e rolagem: `tests/parity/workspace.cjs` (5.1 a 5.5).
- [x] `TEST-NOTEBOOK` — criação, filtros, persistência, backup, importação inválida, CSV, impressão e exclusão: `tests/parity/notebook.cjs` (com `notebook-backup`).
- [x] `TEST-MANUAL` — busca, índice, artigo, links, ajuda contextual e impressão: `tests/parity/manual.cjs`.
- [x] `TEST-REPORT` — sessões, captura de dados, edição, impressão e acesso restrito: `tests/parity/report.cjs`.
- [ ] `TEST-TEACHER` — CRUD de biblioteca, prévia, permissões e import/export.
- [x] `TEST-SHELL` — navegação, drawer, foco, preferências, projetor e startup: `tests/parity/shell.cjs`.
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

### Registro — Etapa 1, Início

```text
ID da etapa: HOME (HOME-01 a HOME-09)
Tela SIAB: Início — index.html data-tela="inicio", js/telas/inicio.js (acidosebases1.0.0@73848f0)
Tela SILM: Início — integracao/index.html data-view="inicio", integracao/unified-ui.js home()
Commit: branch claude/optimistic-cerf-167d72, commit "Paridade SIAB — Etapa 1, Início" (PR da etapa)
Viewport(s): 1366×768, 1024×768, 390×844, 320×640, 844×390
Arquivos alterados: integracao/index.html (+ index.html gerado), integracao/integration.css, integracao/adapter.js,
  integracao/route-ui.js, integracao/unified-ui.js, tests/parity/home.cjs, tests/parity-screens.cjs,
  tests/routes-browser.cjs, scripts/parity-capture.cjs, package.json, dois fluxos de CI
Diferenças de domínio / N/A: contagens (7 temas, 6 missões, 5 roteiros × 14/19/35 do SIAB); botão
  "Configurações de inicialização" do rodapé do SIAB (no SILM a escolha fica no menu lateral, Etapa 12)
Testes executados: npm test; test:a11y (84 cenários, 0 violações); test:comparison; test:routes:browser
  (roteiros e workspace-family); test:backup; test:mobile-mechanics; test:parity (TEST-HOME);
  scripts/audit-silm.py (14/14) — todos aprovados no Chromium
Evidências: docs/evidence-parity/HOME/ (10 capturas, capturas.json, README com a comparação)
Pendências: cabeçalho 10 px mais alto, pílula de versão, barra inferior com caracteres e ícone de tubo de
  ensaio da Oficina no menu lateral (Etapa 12); Firefox, Safari e aparelhos físicos não testados
Estado: [x]
```

### Registro — Etapa 2, Aprender / Temas

```text
ID da etapa: LEARN (LEARN-01 a LEARN-09)
Tela SIAB: Temas e Tema — data-tela="aprender" e "tema", js/telas/aprender.js (acidosebases1.0.0@73848f0)
Tela SILM: Aprender — integracao/index.html data-view="aprender", integracao/unified-ui.js themes()
Commit: branch claude/optimistic-cerf-167d72, commit "Paridade SIAB — Etapa 2, Aprender" (PR da etapa)
Viewport(s): 1366×768, 1024×768, 390×844, 320×640, 844×390 (lista e tema)
Arquivos alterados: integracao/index.html (+ index.html gerado), integracao/unified-ui.js, integracao/integration.css,
  integracao/adapter.js (prepareMetal compartilhado; foco respeita o que a tela já focou), integracao/route-ui.js,
  tests/parity/learn.cjs, tests/parity-screens.cjs, tests/learning-browser.cjs
Diferenças de domínio / N/A: 7 temas × 14; missões e roteiros relacionados aparecem pelo nome abaixo das ações
  (até dois de cada tipo no SILM, um no SIAB); Investigar prepara em vez de substituir (plano: gesto explícito)
Testes executados: npm test; test:a11y; test:comparison; test:routes:browser (roteiros e workspace-family);
  test:backup; test:mobile-mechanics; test:parity (TEST-HOME e TEST-LEARN); scripts/audit-silm.py — Chromium
Evidências: docs/evidence-parity/LEARN/ (lista + README) e docs/evidence-parity/LEARN-DETAIL/ (tema)
Pendências: lacunas de conteúdo para validação do autor (README da etapa); Firefox, Safari e aparelhos físicos
Estado: [x]
```

### Registro — Etapa 3, Missões

```text
ID da etapa: MISSION (MISSION-01 a MISSION-10)
Tela SIAB: Missões e missão na bancada — data-tela="missoes", js/telas/missao.js (#painel-missao) (acidosebases1.0.0@73848f0)
Tela SILM: Missões — integracao/index.html data-view="missoes"; integracao/route-ui.js missionCatalogue() e missionPanel()
Commit: branch claude/optimistic-cerf-167d72, commit "Paridade SIAB — Etapa 3, Missões" (PR da etapa)
Viewport(s): lista e especificação nos 5 tamanhos; painel em 1366×768 e 390×844
Arquivos alterados: integracao/index.html (+ index.html gerado), integracao/route-ui.js, integracao/unified-ui.js
  (conclusão no Caderno), integracao/integration.css, tests/parity/mission.cjs, tests/parity-screens.cjs,
  tests/learning-browser.cjs
Diferenças de domínio / N/A: especificação antes de montar (escolha do metal e investigação livre guardada); conclusão
  escrita incentivada e registrada, sem bloquear o critério científico homologado; Refazer na especificação e
  relatório digital só nos roteiros
Testes executados: npm test; test:a11y; test:comparison; test:routes:browser (roteiros e workspace-family);
  test:backup; test:mobile-mechanics; test:parity (HOME, LEARN, MISSION); scripts/audit-silm.py — Chromium
Evidências: docs/evidence-parity/MISSION/ (lista + README), MISSION-DETAIL/ (especificação), MISSION-PANEL/ (painel)
Pendências: Firefox, Safari e aparelhos físicos
Estado: [x]
```

### Registro — Etapa 4, Roteiros Experimentais

```text
ID da etapa: ROUTE (ROUTE-01 a ROUTE-10)
Tela SIAB: Roteiros e roteiro — data-tela="roteiros" e "roteiro", js/telas/roteiros.js (acidosebases1.0.0@73848f0)
Tela SILM: Roteiros — integracao/index.html data-view="roteiros"; integracao/route-ui.js routeCatalogue(), routePanel(), report()
Commit: branch claude/optimistic-cerf-167d72, commit "Paridade SIAB — Etapa 4, Roteiros" (PR da etapa)
Viewport(s): lista e roteiro nos 5 tamanhos; painel em 1366×768 e 390×844
Arquivos alterados: integracao/index.html (+ index.html gerado), integracao/route-ui.js (o catálogo antigo compartilhado
  saiu), integracao/unified-ui.js (identificação no relatório livre e no Caderno), domain/silm/route-session.js (campos
  de identificação; sessões antigas ganham campos vazios), integracao/integration.css, tests/parity/route.cjs,
  tests/parity-screens.cjs
Diferenças de domínio / N/A: "Pergunta central" dentro do problema; "Na bancada" vira "Na oficina"; painel Roteiro
  mantido como extensão (o SIAB só prepara a bancada)
Testes executados: npm test; test:a11y; test:comparison; test:routes:browser (roteiros e workspace-family);
  test:backup; test:mobile-mechanics; test:parity (HOME, LEARN, MISSION, ROUTE); scripts/audit-silm.py — Chromium
Evidências: docs/evidence-parity/ROUTE/ (lista + README), ROUTE-DETAIL/ (roteiro), ROUTE-PANEL/ (depois de montar)
Pendências: Firefox, Safari e aparelhos físicos
Estado: [x]
```

### Registro — Etapa 5.1, Oficina → Foco

```text
ID da etapa: LAB-FOCUS (LAB-FOCUS-01 a LAB-FOCUS-09)
Tela SIAB: Bancada — data-tela="bancada", js/telas/laboratorio.js e bancada.js (acidosebases1.0.0@73848f0)
Tela SILM: Oficina → Foco — data-view="ambiente", integracao/adapter.js renderScene()/emptyState()
Commit: branch claude/optimistic-cerf-167d72, commit "Paridade SIAB — Etapa 5.1, Oficina → Foco" (PR da etapa)
Viewport(s): 1366×768, 1024×768, 390×844, 320×640, 844×390
Arquivos alterados: integracao/adapter.js, integracao/index.html (+ index.html gerado), integracao/integration.css,
  domain/silm/assembly-view.js (sem Desfazer duplicado), tests/parity/workspace.cjs, tests/parity-screens.cjs
Diferenças de domínio / N/A: aviso de primeira visita com tour fica para a Etapa 10; "Tabela periódica" no lugar de
  "Montagens prontas" (Etapa 9)
Testes executados: npm test; test:a11y; test:comparison; test:routes:browser (roteiros e workspace-family);
  test:backup; test:mobile-mechanics; test:parity (HOME, LEARN, MISSION, ROUTE, WORKSPACE); audit-silm.py — Chromium
Evidências: docs/evidence-parity/LAB-FOCUS/
Pendências: aviso de primeira visita (Etapa 10); Firefox, Safari e aparelhos físicos
Estado: [x]
```

### Registro — Etapa 5.2, Oficina → Montagem

```text
ID da etapa: LAB-MOUNT (LAB-MOUNT-01 a LAB-MOUNT-09)
Tela SIAB: doca Montagem da bancada (Resumo, Preparo, Objetos, Módulo) (acidosebases1.0.0@73848f0)
Tela SILM: doca #si-dock-left (Resumo, Preparo, Unidades, Módulo)
Commit: branch claude/optimistic-cerf-167d72, commit "Paridade SIAB — Etapa 5.2, Oficina → Montagem" (PR da etapa)
Viewport(s): 1366×768 e 390×844 (doca), mais as suítes de 5 e 7 tamanhos
Arquivos alterados: integracao/index.html (+ index.html gerado), integracao/adapter.js, integracao/integration.css,
  tests/parity/workspace.cjs
Diferenças de domínio / N/A: "Frascos" viram a escolha do metal; "Objetos" viram "Unidades"; o "?" de ajuda no
  cabeçalho da doca fica para a Etapa 10
Testes executados: npm test; test:a11y; test:comparison; test:routes:browser (roteiros e workspace-family);
  test:backup; test:mobile-mechanics; test:parity; audit-silm.py — Chromium
Evidências: docs/evidence-parity/LAB-MOUNT/
Pendências: ajuda contextual "?" (Etapa 10); Firefox, Safari e aparelhos físicos
Estado: [x]
```

### Registro — Etapas 5.3 e 5.4, Oficina → Ver e Dados

```text
ID da etapa: LAB-VIEW (01 a 11) e LAB-DATA (01 a 09)
Tela SIAB: painel "Investigar" (Ver) e "Dados da investigação" da bancada (acidosebases1.0.0@73848f0)
Tela SILM: doca #si-dock-right — catálogo de visualizações e consultas de Dados
Commit: branch claude/optimistic-cerf-167d72, commit "Paridade SIAB — Etapas 5.3 e 5.4, Ver e Dados" (PR da etapa)
Viewport(s): 1366×768 e 390×844 (docas), mais as suítes de 5 e 7 tamanhos
Arquivos alterados: integracao/index.html (+ index.html gerado), integracao/workspace-family.js, integracao/integration.css,
  tests/parity/workspace.cjs
Diferenças de domínio / N/A: famílias liberadas por módulo; análises são as fórmulas cristalográficas; "?" nas docas
  fica para a Etapa 10
Testes executados: npm test; test:a11y; test:comparison; test:routes:browser (roteiros e workspace-family);
  test:backup; test:mobile-mechanics; test:parity; audit-silm.py — Chromium
Evidências: docs/evidence-parity/LAB-VIEW/ (README das duas subáreas) e docs/evidence-parity/LAB-DATA/
Pendências: ajuda contextual "?" (Etapa 10); Firefox, Safari e aparelhos físicos
Estado: [x]
```

### Registro — Etapa 5.5, Oficina → Visão geral (fecha a Etapa 5)

```text
ID da etapa: LAB-OVERVIEW (01 a 09)
Tela SIAB: overview-view ("Sua bancada") (acidosebases1.0.0@73848f0)
Tela SILM: #workspace-overview ("Estruturas recentes"), integracao/structure-comparison.js
Commit: branch claude/optimistic-cerf-167d72, commit "Paridade SIAB — Etapa 5.5, Visão geral" (PR da etapa)
Viewport(s): 1366×768, 390×844, 844×390
Arquivos alterados: integracao/integration.css (contêiner em coluna única, grade de cartões), tests/parity/workspace.cjs
Diferenças de domínio / N/A: sem selecionar/ordenar recipientes nem "Em foco" — estruturas independentes, sem escala
  comum (ordenar sugeriria classificação)
Testes executados: npm test; test:a11y; test:comparison; test:routes:browser (roteiros e workspace-family);
  test:backup; test:mobile-mechanics; test:parity; audit-silm.py — Chromium
Evidências: docs/evidence-parity/LAB-OVERVIEW/
Pendências: Firefox, Safari e aparelhos físicos
Estado: [x]
```

### Registro — Etapa 6, Caderno

```text
ID da etapa: NOTE (NOTE-01 a NOTE-11)
Tela SIAB: Caderno — data-tela="caderno", js/telas/caderno.js (acidosebases1.0.0@73848f0)
Tela SILM: Caderno — integracao/index.html data-view="caderno", integracao/unified-ui.js notebook()
Commit: branch claude/optimistic-cerf-167d72, commit "Paridade SIAB — Etapa 6, Caderno" (PR da etapa)
Viewport(s): 1366×768, 1024×768, 390×844, 320×640, 844×390
Arquivos alterados: integracao/index.html (+ index.html gerado), integracao/unified-ui.js, integracao/integration.css,
  tests/parity/notebook.cjs, tests/parity-screens.cjs
Diferenças de domínio / N/A: tipos de filtro do domínio SILM; backup JSON como extensão; sem edição (como no SIAB)
Testes executados: npm test; test:a11y; test:comparison; test:routes:browser (roteiros e workspace-family);
  test:backup; test:mobile-mechanics; test:parity; audit-silm.py — Chromium
Evidências: docs/evidence-parity/NOTE/
Pendências: filtro por metal/atividade (possível extensão); Firefox, Safari e aparelhos físicos
Estado: [x]
```

### Registro — Etapa 7, Manual (fecha as sete telas principais)

```text
ID da etapa: MANUAL (01 a 08) e MANUAL-CONTENT (01 a 12)
Tela SIAB: Manual — data-tela="manual", js/telas/manual.js (acidosebases1.0.0@73848f0)
Tela SILM: Manual — integracao/index.html data-view="manual", integracao/unified-ui.js manual(), domain/silm/manual.js
Commit: branch claude/optimistic-cerf-167d72, commit "Paridade SIAB — Etapa 7, Manual" (PR da etapa)
Viewport(s): 1366×768, 1024×768, 390×844, 320×640, 844×390 (início); tópico e busca em 1366×768 e 390×844
Arquivos alterados: integracao/index.html (+ index.html gerado), integracao/unified-ui.js, integracao/integration.css,
  domain/silm/manual.js (2 tópicos novos, marcadores provisórios removidos, aliases), tests/parity/manual.cjs,
  tests/parity-screens.cjs, tests/learning-browser.cjs
Diferenças de domínio / N/A: 23 tópicos nos quatro grupos do SIAB (não 52); sem ilustrações; índice lateral substituído
  pelos grupos e pelo caminho; tour na Etapa 10
Testes executados: npm test; test:a11y; test:comparison; test:routes:browser (roteiros e workspace-family);
  test:backup; test:mobile-mechanics; test:parity; audit-silm.py — Chromium
Evidências: docs/evidence-parity/MANUAL/
Pendências: MANUAL-CONTENT-11 parcial (Tour, Montagens prontas, Projetor); Firefox, Safari e aparelhos físicos
Estado: [x]
```

### Registro — Etapa 8, Relatórios

```text
ID da etapa: REPORT (01 a 09)
Tela SIAB: Relatório — data-tela="relatorio", js/telas/relatorios.js (acidosebases1.0.0@73848f0)
Tela SILM: Relatório — integracao/index.html data-view="relatorios", integracao/route-ui.js report()
Commit: branch claude/optimistic-cerf-167d72, commit "Paridade SIAB — Etapa 8, Relatórios" (PR da etapa)
Viewport(s): 1366×768, 1024×768, 390×844, 320×640, 844×390 (completo); à mão e análise em 1366×768 e 390×844
Arquivos alterados: integracao/route-ui.js (report()), integracao/unified-ui.js (campos e resumo no Caderno),
  domain/silm/route-session.js (campos "analysis" e "answer"), integracao/integration.css, domain/silm/manual.js
  (tópico "Registrar e imprimir"), tests/parity/report.cjs, tests/parity-screens.cjs
Diferenças de domínio / N/A: sem dados hipotéticos (a análise usa os dados da investigação); sem gráficos de leituras;
  seção 6 como "Estado da investigação" (a estrutura não tem condições finais)
Testes executados: npm test; test:a11y; test:comparison; test:routes:browser (roteiros e workspace-family);
  test:backup; test:mobile-mechanics; test:parity; audit-silm.py — Chromium
Evidências: docs/evidence-parity/REPORT/
Pendências: guia do Professor imprimível (TEST-PRINT) na Etapa 11; Firefox, Safari e aparelhos físicos
Estado: [x]
```

### Registro — Etapa 10, Tour e ajuda contextual

```text
ID da etapa: TOUR (01 a 06)
Tela SIAB: tour da bancada (js/ui/tour.js), aviso #boas-vindas, ajuda contextual SIAB.ajuda (acidosebases1.0.0@73848f0)
Tela SILM: tour da oficina (#silm-tour), aviso de primeira visita no estado vazio, ajuda "?" das docas (#silm-help-dialog)
Commit: branch claude/optimistic-cerf-167d72, commit "Paridade SIAB — Etapa 10, Tour e ajuda contextual" (PR da etapa)
Viewport(s): 1366×768, 1024×768, 390×844, 320×640, 844×390
Arquivos alterados: integracao/index.html (+ index.html gerado), integracao/adapter.js, integracao/unified-ui.js,
  integracao/integration.css, domain/silm/manual.js (tópico "tour"), tests/parity/tour.cjs, tests/parity/shell.cjs,
  tests/parity-screens.cjs
Diferenças de domínio / N/A: Montagens prontas entram no aviso e em Recursos com a Etapa 9
Testes executados: npm test; test:a11y; test:comparison; test:routes:browser (roteiros e workspace-family);
  test:backup; test:mobile-mechanics; test:parity; audit-silm.py — Chromium
Evidências: docs/evidence-parity/TOUR/
Pendências: Firefox, Safari e aparelhos físicos
Estado: [x]
```

### Registro — Etapa 12, Menu, preferências, projetor e aplicativo

```text
ID da etapa: MENU (01 a 07), A11Y (01 a 06), APP (01 a 06)
Tela SIAB: #app-drawer (js/ui/gaveta.js), #startup-dialog (js/init/integracao.js), #about-dialog, js/init/pwa.js
  (acidosebases1.0.0@73848f0)
Tela SILM: #sidebar e janelas #silm-startup-dialog e #silm-about-dialog (integracao/index.html), shell() em
  integracao/adapter.js, integracao/pwa.js, setupMenuReview da Base SI 0.9.17
Commit: branch claude/optimistic-cerf-167d72, commit "Paridade SIAB — Etapa 12, Menu, preferências e aplicativo" (PR da etapa)
Viewport(s): 1366×768, 1024×768, 390×844, 320×640, 844×390 (Menu); acessibilidade, convite e Sobre em 1366×768 e 390×844
Arquivos alterados: integracao/index.html (+ index.html gerado), integracao/adapter.js, integracao/pwa.js,
  integracao/integration.css, domain/silm/manual.js (tópicos "professor" e "abertura" corrigidos),
  tests/parity/shell.cjs, tests/parity-screens.cjs
Diferenças de domínio / N/A: sem tópico único "Referências e créditos" (as fontes ficam por dado); duas opções de tela
  inicial, como no SIAB; projetor bloqueado durante qualquer atividade (o SIAB bloqueia só nas restritas, Etapa 11)
Testes executados: npm test; test:a11y; test:comparison; test:routes:browser (roteiros e workspace-family);
  test:backup; test:mobile-mechanics; test:parity; audit-silm.py — Chromium
Evidências: docs/evidence-parity/SHELL/
Pendências: MENU-05 ("Recursos": Montagens prontas e Tour) com as Etapas 9 e 10; botão "Recarregar" no aviso de nova
  versão; Firefox, Safari e aparelhos físicos
Estado: [x] (MENU-05 [~])
```

## 9. Restrições de escopo

- Este plano é do programa principal SILM.
- Clube de Jazz, jukebox, áudio, Blender, Babylon.js e seus recursos internos estão fora do escopo.
- O símbolo institucional do SILM pode aparecer no Início; isso não autoriza incluir atalho de navegação para o Clube de Jazz.
- Não fazer merge nem publicar a branch apenas porque a documentação está concluída. A integração depende de testes, validação visual e revisão do conjunto da PR.
