# Paridade de família: SIAB 1.0.0 × SILM 0.4.0

**Referência:** `qui-x/acidobase`, SIAB 1.0.0 congelada (commit `f07047a`, 2026-10-04), lida somente para comparação, sem modificação. **Objeto:** SILM 0.4.0, sobre a Base Estrutural 0.2.4.

O SILM nasceu da Base Estrutural 0.2.4, extraída do SIAB numa fase anterior (SIAB(9)). Desde então o SIAB evoluiu até a 1.0.0 (RC.1 a RC.5), e várias mecânicas novas da família ainda não existem na Base. Este documento separa:

- **A.** o que já é igual;
- **B.** o que a 0.4.0 adotou do SIAB;
- **C.** o que falta, com a série do SILM em que deve entrar.

## A. Já é da mesma família

| Recurso | SIAB 1.0.0 | SILM 0.4.0 |
|---|---|---|
| Cabeçalho, menu hambúrguer, drawer, navegação desktop e inferior | ✓ | ✓ (Base) |
| Página inicial com caminhos principais e apoio | Aprender, Missões, Roteiros, Laboratório, Caderno | Laboratório, Aprender, Missões, Roteiros; Manual e Professor |
| Módulos Explorar / Medir / Calcular | ✓ | ✓ |
| Aprender/Temas com marcador "Concluído" sem pontuação | ✓ | ✓ |
| Missões e Roteiros; atividade restrita; concluir ≠ encerrar | ✓ | ✓ |
| Manual com busca, índice e impressão | ✓ | ✓ |
| Acessibilidade (tema, contraste, fonte, espaçamento, leitura, visão de cores, movimento) | ✓ | ✓ (mesmo `a11y.js`) |
| Modo Projetor, Configurações de inicialização, Sobre | ✓ | ✓ |
| Área do Professor: configurar, abrir como aluno, exportar | ✓ | ✓ (exporta JSON) |
| Relatório com impressão/PDF | ✓ | ✓ (modo único) |
| PWA, offline, aviso de atualização | ✓ | ✓ |
| Retomada direta da bancada livre | ✓ | ✓ (correção de origem 0.3.x na 0.4.0) |

## B. Adotado na 0.4.0 (mecânicas com equivalente direto)

O prompt mestre (§48) manda reutilizar o comportamento do SIAB quando ele existe. Na montagem metálica:

| SIAB (bancada) | SILM (montagem) |
|---|---|
| `↶ Desfazer`, nome "Desfazer última ação", dica "Desfazer: <ação>" ou "Nada para desfazer" | igual, na barra e no painel Elementos |
| Anúncio "Desfeito: <ação>." | "Desfeito: adição da unidade 4." |
| Mensagens "…Use Desfazer para voltar." | após mover ou ajustar uma unidade |
| Ação principal com "+" ("+ Tubo com água", "+ Novo tubo") | "+ Adicionar unidade" |
| Links "?" de ajuda junto aos controles | "?" ao lado do título, abre o Manual em Montagem |
| Rótulo "MÓDULO · EXPLORAR" na bancada | "MÓDULO · EXPLORAR" na área de montagem |
| Bancada vazia com título, orientação e ação primária | "Iniciar montagem" e área vazia com orientação |
| Agrupar repetições ("uma sequência de gotas vira uma única ação de desfazer") | repetições de seta do mesmo gesto viram uma única ação |
| Remoção de tubo com confirmação | Limpar estrutura com confirmação |

## C. Lacunas: mecânicas do SIAB 1.0.0 ausentes no SILM

| # | Mecânica do SIAB 1.0.0 | Situação no SILM | Onde entra (proposta) |
|---|---|---|---|
| 1 | **Workspace Montagem / Ver / Dados**: três lançadores; Montagem com abas Resumo, Preparo, Objetos, Módulo e Missão; Ver com as famílias Observar, Medir e Analisar (setas entre abas); Dados com Tabela, Histórico e Relatório; apresentações compacta, padrão e larga; no celular, painéis inferiores com Voltar de nível | dois painéis: Elementos e Informações | **Correção de origem 0.1.x**, antes da 0.5.0: as séries 0.5 a 0.7 acrescentam vistas (célula/rede, elétrons, propriedades) que devem nascer dentro de Ver |
| 2 | **Histórico da sessão** (Dados → Histórico): sequência cronológica de ações, distinta do Caderno e do Desfazer | eventos existem, mas não há tela | correção de origem 0.3.x, junto com o item 1 |
| 3 | **Tabela de medições** compacta e completa | sem medidas | 0.9.x (Medir) |
| 4 | **Caderno de investigação**: notas, práticas encerradas, filtros, CSV, impressão | motor presente, desativado (decisão adiada pelo prompt 0.1.1, §21) | decisão do autor; a proposta é a 0.15.x |
| 5 | **Relatório em modos**: completo, para preencher à mão e atividade de análise; 5 a 60 linhas por campo; dados hipotéticos identificados; Atualizar dados da bancada | modo único | 0.15.x |
| 6 | **Finalizar × Encerrar atividade** com diálogo de três saídas (Continuar, Abrir relatório antes de sair, Encerrar) | concluir e encerrar existem, sem o diálogo de três saídas | correção de origem 0.1.x, junto com o item 1 |
| 7 | **Professor**: lista de atividades criadas com Editar, Duplicar e Excluir; Copiar link (o link carrega a configuração); "O que o aluno pode alterar na montagem"; respostas de referência; Guia do Professor para imprimir | gerar, abrir como aluno e baixar JSON | o mecanismo de link entra como correção de origem 0.1.x; o conteúdo, na 0.15.x |
| 8 | **Montagens prontas** (configurações para explorar) | — | após a 0.5.x (estruturas prontas de CCC, CFC e HC), em 0.8.x ou 0.13.x |
| 9 | **Tour da bancada** | a API `registerTour` existe, sem tour | tour do Laboratório: correção de origem 0.1.x ou 0.11.x |
| 10 | **Prateleira / Biblioteca de substâncias** | equivalente: Tabela Periódica (0.2.x). Uma prateleira de vários metais é proibida pela 0.4.x (§31) | já mapeado |
| 11 | **Visão geral, Comparar e Vincular** recipientes | 1 investigação = 1 metal; comparação só de dados tabelados | 0.8.x (Explorar: comparação) |
| 12 | **VLibras** (opcional, online) | — | 0.16.x |
| 13 | Clima Open-Meteo (temperatura ambiente) | não se aplica nesta etapa | avaliar na 0.7.x (condições) |
| 14 | **HTML standalone**, `FILES.txt`, `SHA256SUMS.txt`, `VALIDACAO.md`, `COMPATIBILIDADE.md`, `DEPENDENCIAS.md` | ZIP modular com `SHA512SUMS.txt` | 0.18.x e 1.0.0 |
| 15 | Validação em Chromium, Firefox e WebKit | Chromium (ambiente desta entrega) | 0.18.x; antes, sempre que houver navegadores disponíveis |

## Recomendação

A diferença mais visível entre os dois programas é o **workspace Montagem / Ver / Dados** (item 1), que muda como o aluno opera o Laboratório. Os itens 1, 2, 6, 7 (mecanismo de link) e 9 pertencem à **fundação** e não a uma série científica. Pelo contrato de versionamento, devem entrar como **correção de origem 0.1.x** numa build própria e homologada antes da 0.5.0. Assim, estruturas cristalinas, elétrons e propriedades já nascem dentro da gramática do SIAB 1.0.0.

Na 0.4.0 aplicou-se somente o que tem equivalente direto na montagem (seção B), para não invadir a fundação nem antecipar séries. A decisão sobre fazer essa correção de fundação (e em qual versão) é do autor do projeto.
