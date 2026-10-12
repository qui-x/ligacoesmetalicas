# Relatório de testes — Base Estrutural 0.2.3

**43 grupos aprovados**, em quatro suites completas sem TEST_FILTER: 16 shell/contratos, 10 operação 0.2.3, 16 regressão e 1 captura/controle ampliado. **32 análises axe, zero violações detectadas.** Build e auditoria de neutralidade aprovados. Candidata congelada para homologação; referência fornecida SIAB 1.0.0 conferida em 08/10/2026. Os testes abaixo conservam as datas e resultados reais da candidata, cujo runtime é byte a byte idêntico nesta revisão documental.

## Motores e execução

| Motor | Versão | Resultado |
|---|---|---|
| chromium | 153.0.8010.0 | Executado |
| firefox | — | Executável ausente |
| webkit | — | Executável ausente |

Node v24.19.0. Datas UTC das suites: {"shell": "2026-10-07T22:05:57.887Z", "operational": "2026-10-07T22:05:57.871Z", "regression": "2026-10-07T22:05:57.929Z", "visual": "2026-10-07T22:08:29.728Z"}. Firefox e WebKit foram tentados e não iniciaram por falta de executáveis; motivos completos nos JSON. Não se apresentam evidências históricas como testes desta rodada.

## Cobertura

- Header mobile: 320, 360 e 390 px, com fonte 100% e 150%, ícones/targets de pelo menos 44 px, marca sem overflow e foco visível.
- Desktop: 901, 1280, 1440 e 1920 px; tablet e paisagem: 600×800, 768×1024, 844×390 e 900×700. Matriz de dez telas com fonte 150%.
- Menu normal por mouse, touch, Enter/Espaço, Tab/Shift+Tab, Escape, backdrop, trap, retorno ao acionador e scroll interno. Navegar expandido inicialmente mobile, recolhido desktop e escolha mantida na sessão.
- Drawer de atividade: ausência de Agora, navegação geral, Professor, Aplicativo, startup e recursos não autorizados; ajuda/relatório/encerramento/acessibilidade disponíveis.
- Nav desktop e bottom ocultas, marca inerte e altura inferior zero na restrição; nav, marca e Menu restaurados após concluir/encerrar sem reload, inclusive no mobile.
- Ajuda contextual com instruções, objetivo, dicas, explicações e texto do tópico relacionado; Manual raiz bloqueado. Permissão explícita autoriza somente a rota/parâmetro declarados; relatório opcional ausente não gera botão. Professor conserva suas instruções.
- Acessibilidade drawer→modal→serviço→drawer e reload: tema, contraste, escala, spacing, movimento, leitura e visão de cores. Controle expandido a 150%/contraste em desktop e 320/360/390/844 px, sem overflow horizontal.
- Animação lateral medida em 250 ms; desativada tanto pelo estado motion como pelo sistema prefers-reduced-motion.
- Home com cinco caminhos principais incluindo Caderno; sem placeholder se não registrado. Manual/Professor como apoio, relatório fora dos principais, startup compartilhado e destino após reload. Labels Roteiros Experimentais nas superfícies relevantes.
- Dois ensaios de 20 ciclos montar/navegar/desmontar e um ensaio de 10 ciclos atividade livre→restrita→concluir→refazer→encerrar. Escopos/recursos/listeners observados estáveis e zero após unload.
- Módulos, Roteiros, Missões/validação, sessão/retomada, reset confirmado, Professor JSON/importação/permissões, Manual normal, Sobre/referências, Relatório/edição/impressão, PWA/update/cache/offline e storage bloqueado.

Nos **43 contextos monitorados**, os coletores de pageerror, erros de console e HTTP 4xx/5xx ficaram vazios. A suite operacional e de capturas também confere warnings; exclui somente o aviso exato “Service Worker registration blocked by Playwright”, gerado pelo harness quando o SW é bloqueado de propósito. O teste PWA usa outro contexto com SW permitido. Sem warnings críticos do aplicativo detectados.

## Grupos executados

| Suite | Grupo | Resultado |
|---|---|---|
| shell | chromium · shell desktop e hierarquia de início | PASS |
| shell | chromium · gaveta, foco, contexto e preferências estruturais | PASS |
| shell | chromium · Aprender, temas, relacionados e marcador simples | PASS |
| shell | chromium · atividade e shell restrito | PASS |
| shell | chromium · mobile bottom nav, safe area e drawer | PASS |
| shell | chromium · acessibilidade e ciclo de vida | PASS |
| shell | chromium · percurso completo por links, histórico e Tema como hub | PASS |
| shell | chromium · teclado, clique externo, scroll e gaveta a 150% | PASS |
| shell | chromium · startup removido, links diretos e Projetor no Professor | PASS |
| shell | chromium · API de recursos, visibilidade, tour e domínio destruído | PASS |
| shell | chromium · Caderno opcional, rota configurável e registro do domínio | PASS |
| shell | chromium · drawer da missão, estados bloqueados, ajuda, relatório e finalização | PASS |
| shell | chromium · matriz mobile de 320 a tablet, fonte 150% e sheets | PASS |
| shell | chromium · atividade mobile, banner, viewport e saída segura | PASS |
| shell | chromium · novas superfícies, contraste, spacing e movimento reduzido | PASS |
| shell | contrato · domínio legado sem experiência continua carregável | PASS |
| operational | 0.2.3 · header mobile normal e restrito, targets e foco a 150% | PASS |
| operational | 0.2.3 · disclosures por teclado, mouse, touch e estado na sessão | PASS |
| operational | 0.2.3 · acessibilidade bidirecional, storage, URL e workspace | PASS |
| operational | drawer-enter | PASS |
| operational | 0.2.3 · atividade livre conserva menu e navegação gerais | PASS |
| operational | 0.2.3 · Menu da atividade, ajuda contextual e recuperação de altura | PASS |
| operational | 0.2.3 · permissão explícita, relatório opcional e instruções do Professor | PASS |
| operational | 0.2.3 · Home canônica, Caderno opcional e mesma inicialização | PASS |
| operational | 0.2.3 · nomenclatura em Home, nav, drawer, área e Manual | PASS |
| operational | 0.2.3 · ciclos finalizar, refazer, encerrar e limpar controles | PASS |
| regression | chromium · 1–3 navegação, início, foco e histórico | PASS |
| regression | chromium · 4 módulos, seleção única e preservação do workspace | PASS |
| regression | chromium · 5 e 7 roteiro, cancelamento, módulo e retorno à investigação livre | PASS |
| regression | chromium · 6 e 8 missão, restrições, conclusão e nova tentativa | PASS |
| regression | chromium · 9 sessão, reload e restauração pelo domínio | PASS |
| regression | chromium · 10 Professor, serialização, importação e permissões | PASS |
| regression | chromium · 11 Sobre, referências, Manual e retorno de foco | PASS |
| regression | chromium · 12 relatório, edição, histórico e impressão equivalente | PASS |
| regression | chromium · acessibilidade, temas, fonte 150%, contraste e modais | PASS |
| regression | chromium · mobile portrait/landscape e todas as telas a 150% | PASS |
| regression | chromium · regressão de lifecycle, 20 ciclos e ausência de resíduos | PASS |
| regression | chromium · reset confirmado, preferências e unload com retomada pendente | PASS |
| regression | chromium · contratos de derivação, tela customizada e falhas recuperáveis | PASS |
| regression | PWA · atualização, isolamento de caches e retomada offline | PASS |
| regression | Armazenamento bloqueado e sessão em memória | PASS |
| regression | Cores forçadas e redução de movimento | PASS |
| visual | 0.2.3 · controles expandidos em desktop/mobile, fonte 150% e contraste | PASS |

## Regressões corrigidas nesta rodada

A navegação/ajuda restritas foram corrigidas conforme o prompt. Durante a validação, a auditoria identificou um header interno da gaveta que gerava landmark banner duplicado; o contêiner foi corrigido e a faixa externa recebeu região nomeada. O ensaio de unload identificou controles A11Y montados em uma gaveta fechada; a montagem foi limitada à gaveta aberta/abrindo, com cleanup no fechamento e troca de contexto. Ambas as correções passaram nas suites finais completas.

## Evidências e reprodução

Resultados: evidence/shell/TESTES-BASE-0.2.3.json, evidence/operational/OPERACAO-BASE-0.2.3.json, evidence/regression/REGRESSOES-BASE-0.2.3.json e evidence/visual/CAPTURAS-BASE-0.2.3.json. Listas de violações nos *-axe.json estão vazias. Capturas das mesmas execuções acompanham cada suite; capturas de gavetas/controles representam o viewport, e a Home desktop pode usar página completa.

Execute npm ci, instale navegadores Playwright, depois npm run build, npm test e npm run audit. O harness aceita executáveis locais; os testes produzem seus próprios servidores e relatam motores indisponíveis. Não considerar execução filtrada como homologação completa.

Auditoria: **51 arquivos de runtime**, **46 referências HTML locais**, **zero dependência científica**. Fontes, SILM e motores fora do escopo preservados por hashes/comparação de bytes em evidence/INTEGRIDADE-ORIGENS.json.

Limitações: LIMITACOES-CONHECIDAS.md. Sem aparelhos físicos, leitores de tela reais ou medição de heap. Conferência direta da referência fornecida documentada em CONFERENCIA-REFERENCIA-SIAB.md; não houve nova execução em navegador do SIAB. Parar na 0.2.3 e aguardar homologação.
