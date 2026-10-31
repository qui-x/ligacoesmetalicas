# Evidências — Etapa 5.2, Oficina → Montagem (LAB-MOUNT)

**Referência:** SIAB 1.0.0 (`acidosebases1.0.0@73848f0`): doca Montagem da bancada, com as abas Resumo, Preparo, Objetos e Módulo (`js/ui/prateleira.js`, `js/ui/modulos.js`).
**Alvo:** SILM 0.15.5: doca `#si-dock-left`, com as abas Resumo, Preparo, Unidades e Módulo (`integracao/index.html`, `integracao/adapter.js`, `integracao/workspace-family.js`).

## Capturas

| Arquivo | O que mostra |
|---|---|
| `siab-preparo-1366x768.jpg` / `silm-preparo-1366x768.jpg` | Doca aberta na aba Preparo, sem investigação |
| `siab-preparo-390x844.jpg` / `silm-preparo-390x844.jpg` | A mesma doca no celular (folha inferior) |
| `siab-resumo-1366x768.jpg` / `silm-resumo-1366x768.jpg` | Aba Resumo com uma investigação em andamento (SIAB: tubo com água; SILM: cobre com 4 unidades) |

## Elementos comparados

| SIAB | SILM antes | SILM agora |
|---|---|---|
| Cabeçalho: ícone, título da aba, "?" e "Fechar" escrito | Título e "✕" | Título e "Fechar" escrito (com o nome acessível "Fechar Montagem"). O "?" de ajuda contextual entra na Etapa 10 |
| Abas Resumo · Preparo · Objetos · Módulo | Resumo · Preparo · Unidades · Módulo | Mantido. "Unidades" é o equivalente de domínio de "Objetos" |
| Preparo em grupos rotulados ("Frascos") | Uma lista de rótulo, seletor e botões; "Iniciar investigação" com o fundo cinza padrão do navegador (parecia desativado) | Dois grupos rotulados: "Metal da investigação" (seletor, "Tabela periódica" e "Iniciar investigação" como ação principal) e "Estrutura" (Adicionar, Organizar, Retornar à montagem livre) |
| Resumo em pares rótulo/valor (solução, conta-gotas, vidraria, volume, módulo) | Uma linha: "Cobre · 4 unidades · montagem livre" | A linha continua, seguida dos pares Metal, Estrutura (o nome completo, como "CFC (FCC) · cúbica de faces centradas"), Unidades, Módulo, Medições e Cálculos. Numa atividade, a primeira linha é "Missão" ou "Roteiro" |
| Módulo: lista dos três níveis, com o ativo marcado | Seletor "Módulo ativo" e os três módulos com o ativo marcado | Equivalente; sem mudança |

## Itens já cobertos por suítes existentes

| Item | Onde é testado |
|---|---|
| LAB-MOUNT-03: Tabela Periódica (seleção, elegibilidade, troca com confirmação) | `tests/table-mounting.cjs` (em `test:comparison`) |
| LAB-MOUNT-04: iniciar, adicionar, organizar, voltar à montagem livre, limpar | `tests/base-integration.cjs`; TEST-WORKSPACE |
| LAB-MOUNT-05: propriedades (iniciar, controlar, ler, restaurar) | `tests/base-integration.cjs` ("cinco propriedades") e TEST-MISSION (campo elétrico) |
| LAB-MOUNT-06: módulo e explicação curta | `tests/workspace-family.cjs` ("módulos em Montagem") |
| LAB-MOUNT-07: só os controles do contexto | TEST-MISSION e TEST-ROUTE (recursos liberados) |
| LAB-MOUNT-08: metal sem geometria validada | TEST-WORKSPACE (manganês: organizar bloqueado, motivo escrito, nunca cristalino) e `tests/crystal-coverage.cjs` |
| LAB-MOUNT-09: alvos, teclado, leitor de tela, retorno do foco | TEST-WORKSPACE (44 px, "Fechar" devolve o foco ao botão Montagem) e `tests/workspace-a11y.cjs` |

## Diferenças de domínio (N/A)

- **N/A — "Frascos" com tubo e conta-gotas.** No SILM, a preparação é a escolha do metal. A estrutura é montada com unidades.
- **Pendência da Etapa 10 — botão "?" de ajuda no cabeçalho da doca.** Ele entra junto com a ajuda contextual e o tour.

## Testes

TEST-WORKSPACE (`tests/parity/workspace.cjs`), parte 5.2, confere:

- "Fechar" e o nome acessível;
- as 4 abas;
- os 2 grupos rotulados;
- a ação principal sem o cinza do navegador;
- os controles com 44 px;
- o retorno do foco ao fechar;
- o Resumo em pares, depois de adicionar e depois de organizar (CFC);
- o manganês sem estrutura cristalina inventada.
