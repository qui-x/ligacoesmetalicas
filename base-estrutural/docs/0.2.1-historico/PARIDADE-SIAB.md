# Matriz de paridade operacional — SIAB / Base 0.2.1

A arquitetura executável é a Base 0.2.0. O SIAB anexado foi apenas referência comportamental. A conferência utilizou os arquivos abaixo; os testes da Base estão registrados em `evidence/TESTES-BASE-0.2.1.json`. Paridade significa contrato operacional reutilizável, não igualdade de catálogos, aparência de cada objeto ou funções científicas.

| Recurso | SIAB: referência examinada | Base 0.2.1 | Diferenças justificadas |
|---|---|---|---|
| Início | `index.html`, `js/telas/inicio.js`: caminhos e chamadas de entrada | Cards registrados com título, descrição, ícone, destino e disponibilidade | Contagem de temas/catálogos removida; os caminhos são escolhidos pelo domínio |
| Navegação e telas | `js/core/roteador.js`: hash, aliases, entrar/sair, foco, título e estado de navegação | Registro de telas, histórico, lifecycle por visita, retorno e foco | IDs adicionais são registráveis; `workspace` preservado como alias de `laboratorio` |
| Laboratório Livre | `js/telas/laboratorio.js` e workspace | Workspace existente, viewport, painéis, contexto, módulo e sessão | Nenhum estado de bancada importado; o domínio conserva seu renderer |
| Explorar / Medir / Calcular | `js/ui/modulos.js`: cartão recolhível, módulo ativo, selo e ação de ativação | Mesmo contrato: um cartão expandido e um módulo ativo; controles e enabled registráveis | Nomes e conteúdo pertencem à Demo/domínio, sem capacidades químicas fixas |
| Roteiros | `js/telas/roteiros.js`: lista, detalhe, objetivo, tarefas e início | Lista/detalhe, subtítulo, módulo, descrição, objetivo, procedimento, requisitos e confirmação | Estado inicial entregue à callback do domínio; um módulo principal obrigatório |
| Missões | `js/telas/missao.js`, `js/simulation/motor-missoes.js`: objetivo, evidências, conclusão, refazer | Estados ativa/concluída/interrompida/reiniciada, callback de validação e nova tentativa | Sem pontuação; a Demo valida apenas ação registrada e textos preenchidos |
| Contexto da atividade | `js/core/activity-context.js`: identidade, módulo, permissões e modo | Contexto neutro com type/id/title/module/restrictions/navigationMode/status | Grupos de recursos específicos substituídos por IDs registrados |
| Navegação restrita | `js/core/atividades.js:guardarRota`, `js/ui/activity-ui.js` | Guarda central, Manual, acessibilidade, Sobre e saída segura disponíveis | O relatório acessível durante restrição é o da sessão atual; não há bloqueio de ajuda |
| Banner e saída | `js/core/atividades.js:atualizarCabecalho/pedirEncerramento` | Tipo, título, estado/modo, detalhes e encerramento confirmado | A investigação livre anterior é restaurada por callback; não há Caderno específico |
| Sessão e retomada | `js/core/atividades.js:salvarSessao/restaurar/continuarSessao` | Metadados persistentes, oferta de retomada, separação do estado do domínio | Namespace da Base/domínio; nenhum snapshot de bancada do SIAB; histórico limitado a 30 metadados |
| Professor | `js/telas/professor.js`: configuração, permissões, resumo e abertura do aluno | Formulário, seleção de recursos, módulo, identificação, navegação, revisão e modo aluno | Transporte por JSON local; links compactados, catálogo e guias científicos não foram incorporados |
| Sobre | Área Sobre em `index.html` e ações do programa | Modal existente com identidade, versão, descrição, modelo, referências, licenças e Manual | Dados registrados; nenhuma referência científica automática |
| Referências | Referências/créditos do SIAB | Registro central por ID e tipo conceitual/dados/técnica | A Base organiza e apresenta; a verificação das fontes pertence ao domínio |
| Relatórios | `js/telas/relatorios.js`, `js/ui/impressao.js` | Identificação automática, contribuição do domínio, campos autorais, histórico e impressão | Shell sem cálculos/modelos científicos, exportações específicas ou Caderno; representações históricas requerem implementação do domínio |
| Manual | `js/telas/manual.js` como referência de acesso e retorno | Motor moderno da Base 0.2.0 preservado; abrir/voltar integrados ao roteador | Busca, tópicos, índice e impressão não foram reconstruídos |
| Modais e foco | Diálogos, confirmação e retorno do SIAB | Componente de modal da Base, trap, Escape e retorno | Retomada exige escolha explícita; fechar outras confirmações equivale a cancelar |
| Notificações | Feedback operacional do SIAB | Serviço existente com info/success/warning/error | Sem um segundo sistema e sem conteúdo de aula em toast |
| Mobile | `css/mobile-controls.css`, `css/mobile-study.css`, `js/ui/workspace.js` | Docas/sheets da Base, mesmos breakpoints; páginas e formulários responsivos | Nenhum aplicativo mobile paralelo; toque e orientação testados por emulação |
| Acessibilidade | `a11y.js`, preferências e feedback de foco | Motor da Base preservado; teclado, 150%, temas, espaçamento, movimento e cores | Correção da prioridade de cores forçadas; ausência de homologação com leitor de tela físico |
| PWA e cache | `manifest.webmanifest`, `sw.js` | Identidade Base 0.2.1, cache por escopo, atualização e retomada offline | Não depende de assets ou caches SIAB/SILM |

## Resultado

Os contratos reutilizáveis solicitados estão implementados e demonstrados sem ciência. Diferenças científicas e funcionalidades específicas de exportação foram mantidas fora da Base intencionalmente. WebKit/Safari/iOS e dispositivos físicos permanecem pendentes, conforme o relatório de testes. Esta matriz não declara equivalência visual pixel a pixel nem homologação científica.
