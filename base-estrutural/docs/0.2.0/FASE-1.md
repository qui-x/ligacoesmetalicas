# Fase 1 — auditoria anterior à neutralização

Origem exclusiva: ZIP Base Estrutural 0.1.0, verificado pelo SHA-512 de consolidação. O rascunho anterior ao prompt completo foi separado, e uma cópia integral limpa foi extraída novamente. Não se atribui retroativamente aprovação aos rascunhos.

`INVENTARIO-ORIGEM.csv` abrange os 307 arquivos da baseline, incluindo documentação e evidência histórica. `MAPA-ORIGEM.json` registra, por arquivo de runtime, referências globais, scripts/imports, acessos literais a estado, eventos, IDs, seletores e funções nomeadas. É um índice estático: accesses computados e callbacks anônimos exigem a análise por responsabilidade abaixo; presença textual não demonstra código morto.

Classes: A estrutural; B estrutural acoplado; C domínio SIAB; D legado/morto comprovado; E incerto. Documentos e resultados antigos classificados como D/incerto na 0.1.0 passam a E nesta taxonomia. Nenhum arquivo é considerado morto somente por não possuir um import ES: o app utiliza scripts clássicos e um namespace compartilhado.

| Responsabilidade / funções | Classe | Estado, eventos e DOM | Decisão de migração |
|---|---|---|---|
| bootstrap app/integracao; iniciarInvestigacao, rotear | B | Bancadas, rotas, startup, pagehide, hashchange, header e telas | Parametrizar shell e recuperar somente preferências estruturais |
| estado.js; criarBancada, newTube, misturarTubos, registrar/desfazer | B/C | tubes, activeId, grupos, concentrações, volumes, indicador, level, undo | Excluir payload científico; estado estrutural separado |
| loja.avisar/alterar | B | ActivityContext.enforce, instrumentos, assinantes | Eventos simples sem enforcement científico |
| workspace; open/close/apply/geometry/refresh | B | left/right, presentation, foco, visualViewport, breakpoints, controls/ver-panel | Preservar comportamento de docas e geometria; parametrizar conteúdo e IDs |
| workspace; sync/summary/groupAllowed/editable/selected | B/C | state.verTab, famílias, medições, ActivityContext, montagem | Remover decisões científicas; domínio fornece relevância e apresentação |
| A11Y; lerMemoria/lerURL/higienizar/definir/aplicarNoHtml | A | tema, leitura, contrast, fontScale, spacing, motion, colorblind; DOM e URL | Manter um motor; migrar chave explicitamente |
| initPreferences e som.tocar | B/C | preferências gerais e sonificação dependente de pH | Remover sonificação; painel só estrutural |
| mobile-study e layoutBancada | B | grade, tubos, doses, altura da vidraria, observers | Conservar safe areas, sheets e viewport; remover dimensões de ciência |
| util notice/announce e modais | A/B | timers, foco, toast, live region, dialog e conteúdo | Extrair serviços com ownership por domínio |
| persistencia e armazenamento | A/B | JSON, memória/pendências; chaves científicas nos clientes | Namespace core e namespace independente por domínio |
| migrações/progresso/atividades | B/C | schemas científicos, tokens, missões, caderno, experimentos | Não importar estados; migração explícita só de A11Y e abertura de painéis |
| Manual registry normalize/search e UI render/index/accordion | B | current, registro, busca, rotas, ARIA, foco e impressão | Parametrizar registro e ações; manter busca e layout |
| Manual generated/diagram e dados | C | chem.solve, substâncias, indicadores, instrumentos | Remover geradores/conteúdo científico |
| PWA iniciar / SW install/activate/fetch | B | pedido de instalação, controlador, cache por escopo e versão | Identidade/cache/recursos neutros; testar atualização |
| viewport científico render/tubo/grafico/lupa | C | motor, partículas, recipientes e cálculos | Substituir renderer por host sem ciência, preservando área central |
| CSS controles, header, foco, dock, manual | A/B | seletores, atributos, breakpoints e tokens | Extrair regras estruturais; eliminar seletores científicos após testes |
| Dados, motores, roteiros, professor, relatórios e tela de bancada | C/B | ciência e fluxos pedagógicos específicos | Fora do runtime universal; origem permanece no ZIP congelado |
| Polyfill de dialog e licença | A | foco, backdrop, top layer alternativa | Manter integralmente |

## Inventário de estado por responsabilidade

Estrutural: tema, leitura, contraste, fontScale, spacing, motion, colorblind; disponibilidade de storage/memória/pendências; left/right, presentation, grupo/família/ferramenta (os identificadores científicos não migram); largura/altura/pixel ratio, breakpoint, scroll/visualViewport; origem de foco; modal aberto e ações; texto/timer de toast; rota e tópico/consulta/índice do Manual; instalação/controlador/cache PWA.

Científico: benches.lab/mission, activeBench, tubes, activeId, nextId/nextGroup, relatorioIds, showPH, indicatorOnly, level, destination, verTab, vidraria, capacidades, history; por recipiente solution, concentration, dilution, initialVolume, titrant, titrantConcentration, titrantDilution, dropVolume, indicator, additions, temperature, grupos e composição; leituras e metadados de instrumentos; missões/temas/caderno; permissões de atividades; relatórios e configurações de experimentos. Não migrar nenhuma dessas estruturas ao core.

Estados locais de cada arquivo e chaves persistentes literais estão indexados no JSON. A lista abaixo da responsabilidade não transforma todos os campos de objetos de domínio em contratos universais; a exclusão é por módulo de domínio e seus consumidores, não por substituição global de palavras.

## Gate

Checkpoint 1 exige hash integral da cópia antes das adições documentais, inicialização da aplicação herdada, resultado científico representativo e ausência de pageerror. Resultado e hash de checkpoint serão registrados em `CHECKPOINTS.json`; sem aprovação desse gate não se ativam arquivos neutros.
