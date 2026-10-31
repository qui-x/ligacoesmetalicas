# Evidências — Etapas 5.3 e 5.4, Oficina → Ver e Dados (LAB-VIEW, LAB-DATA)

**Referência:** SIAB 1.0.0 (`acidosebases1.0.0@73848f0`):

- painel aberto por Ver, intitulado "Investigar" (`js/ui/ver-investigacao.js`);
- painel "Dados da investigação".

**Alvo:** SILM 0.15.5: doca `#si-dock-right`, com o catálogo `#si-viewer-catalog` e as consultas `#silm-data-catalog` (`integracao/index.html`, `integracao/workspace-family.js`, `integracao/scientific-tools.js`).

## Capturas

- **Ver:** esta pasta, com o cobre organizado em CFC, em 1366×768 e 390×844.
- **Dados:** `../LAB-DATA/`, com um cálculo registrado. `silm-registros-*` mostra a página "Medições e cálculos".

## Elementos comparados — Ver (5.3)

| SIAB | SILM antes | SILM agora |
|---|---|---|
| Título do painel "Investigar" | "Ver", seguido de "Investigar a estrutura · Escolha uma visualização." | "Investigar", sem o título repetido; os títulos de detalhe continuam (por exemplo, "Elétrons deslocalizados") |
| Abas de família Observar · Medir · Analisar | Abas de família, conforme o módulo | Mantido: Explorar mostra Observar; Medir mostra Observar + Medir; Calcular mostra Observar + Analisar. O SILM libera só os recursos do módulo |
| Subabas e conteúdo do recurso | Lista de recursos → detalhe com "← Ver" | Mantido. Os nomes longos ("Estrutura e representação") cabem melhor em lista do que em pílulas |
| Leituras com unidade e procedência | Instrumento, unidade e pontos; no cálculo, cada entrada mostra a origem ("Dado tabelado", "Medida do modelo", "Valor informado pelo usuário") | Mantido e testado |

## Elementos comparados — Dados (5.4)

| SIAB | SILM antes | SILM agora |
|---|---|---|
| Título "Dados da investigação" | "Dados", repetido como "Dados da investigação" logo abaixo | "Dados da investigação" no cabeçalho, sem repetição |
| Histórico e Tabela | Dados do metal · Medições e cálculos · Arquivos da investigação | Mantido. Os registros dizem "Medida do modelo" e "Calculado pelo SILM" |
| Seção "Relatório": "Dados medidos e registro da investigação." + "Abrir relatório" em largura total | "Relatório desta investigação" e "Abrir Caderno" lado a lado, com o texto quebrando | Seção "Relatório" com a mesma frase, "Abrir relatório" e "Abrir Caderno" em largura total |

## Itens já cobertos por suítes existentes

| Item | Onde é testado |
|---|---|
| LAB-VIEW-05: propriedades e seus estados | `base-integration` ("cinco propriedades") e TEST-MISSION |
| LAB-VIEW-08: comparação de referências | `tests/structure-comparison.cjs` (Etapa 5.5) |
| LAB-VIEW-09: 2D/3D, projeções, volta ao 2D e invariância | `tests/electrons-3d.cjs` e `base-integration` |
| LAB-DATA-05: histórico e recuperação depois de recarregar | TEST-MISSION (sessão recarregada) e `base-integration` (reload) |
| LAB-DATA-06: exportar e abrir JSON, rejeição e rollback | `base-integration` (importação > 8 KB, rejeição inválida) e `tests/notebook-backup.cjs` |
| LAB-DATA-08: abas concorrentes e falha de persistência | `tests/notebook-backup.cjs` ("bloqueio de aba obsoleta") e `tests/durable-storage.cjs` |

## Diferenças de domínio (N/A)

- **N/A — as três famílias sempre visíveis.** No SILM, o módulo decide o que é liberado: Medir não edita a montagem, e Calcular usa só entradas rastreáveis.
- **N/A — "Gráfico" e "ΔpH/ΔV".** As análises do SILM são as fórmulas cristalográficas do catálogo central.
- **Pendência da Etapa 10 — botão "?" no cabeçalho das docas.**

## Testes

TEST-WORKSPACE (`tests/parity/workspace.cjs`), parte 5.3/5.4, confere:

- os títulos "Investigar" e "Dados da investigação";
- as famílias de cada módulo;
- que mostrar elétrons não altera o estado científico;
- a medida de a;
- as origens no cálculo;
- as três consultas e a contagem;
- a seção Relatório (44 px, largura total, destinos);
- os registros "Calculado pelo SILM" e "Parâmetro de rede";
- o retorno do foco ao voltar.
