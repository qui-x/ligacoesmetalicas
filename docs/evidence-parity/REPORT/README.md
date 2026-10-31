# Evidências — Etapa 8, Relatórios (REPORT)

**Referência:** SIAB 1.0.0 (`acidosebases1.0.0@73848f0`): `data-tela="relatorio"` (`js/telas/relatorios.js`).
**Alvo:** SILM 0.15.5: `data-view="relatorios"` (`integracao/route-ui.js` `report()`), com campos em `domain/silm/route-session.js` (atividades) e `integracao/unified-ui.js` (investigação livre e arquivo).

## Capturas

- **Relatório completo** nos 5 tamanhos (`siab-*` e `silm-*`): no SIAB, a bancada livre; no SILM, uma investigação livre com o cobre organizado em CFC.
- **"Para preencher à mão"** (`*-mao-*`) e **"Atividade de análise"** (`*-analise-*`), em página inteira, em 1366×768 e 390×844.

Zero rolagem lateral e zero erros de página (`capturas.json`).

## Elementos comparados

| SIAB | SILM antes | SILM agora |
|---|---|---|
| Ações no topo: "Atualizar dados da bancada", "Registrar no Caderno", "Imprimir / Salvar como PDF", "Imprimir para preencher à mão", "Voltar à bancada" (ou "Voltar ao Caderno"), "Encerrar atividade" | Três botões no fim da página: "Registrar no Caderno", "Imprimir / salvar em PDF", "Voltar" | Os mesmos seis, no topo: "Atualizar dados da investigação", "Registrar no Caderno", "Imprimir / salvar em PDF", "Imprimir para preencher à mão", "Voltar à oficina" ("Voltar ao Caderno" num relatório arquivado; "Voltar aos roteiros" ou "às missões" depois da atividade) e "Encerrar atividade", que aparece durante uma atividade |
| "Preparar relatório": modo, linhas por resposta, e na análise: dados incluídos, respostas em branco, proposta, questão e fonte dos dados | — | "Preparar relatório": modo (completo, para preencher à mão e, fora de uma atividade, atividade de análise · Professor), linhas por resposta (5 a 25) e, na análise: "Incluir dados", "Deixar em branco", "Proposta para a turma" e "Questão para investigar" |
| Folha com marca, sobretítulo do modo, título e módulo · versão | Título e frases soltas | Marca do SILM, sobretítulo do modo, "Relatório — …" e "… · Módulo … · SILM 0.15.5" |
| 1 Identificação; 2 Proposta; 3 Condições iniciais; 4 Dados experimentais; 5 Representações; 6 Condições finais; "As seções seguintes são autorais."; 7 Observações; 8 Análise / interpretação; 9 Resposta; 10 Conclusão; "Nota sobre o modelo" | Identificação, três campos (observações, interpretação, conclusão), "Registros científicos" em frases, "Fontes" | 1 Identificação; 2 Proposta da investigação; 3 Condições de referência; 4 Medições do modelo; 5 Cálculos do SILM; 6 Estado da investigação; "As seções seguintes são autorais."; 7 Observações; 8 Análise / interpretação; 9 Resposta à investigação; 10 Conclusão; Fontes; "Nota sobre o modelo" |
| Leituras simuladas e previsões do modelo identificadas separadamente | Origem só em parte dos itens | Cada linha tem a origem: "Dado tabelado" (metal e estrutura de referência), "Representação didática" (montagem), "Condição de referência", "Medida do modelo", "Calculado pelo SILM" (com a origem de cada entrada) |
| Para preencher à mão: identificação e respostas em linhas; dados permanecem | — | Igual: identificação em linhas, 5 respostas com o número de linhas escolhido, dados científicos na folha |
| Impressão sem controles | Sem os botões | Sem ações e sem "Preparar relatório"; a folha ocupa a página |

## Itens do plano

- **REPORT-01:** abertura pela atividade (Menu, painel), por Dados e pelo Caderno; o "Voltar" leva à origem certa (TEST-REPORT, TEST-SHELL, `learning-browser`).
- **REPORT-02:** relatório da atividade atual, da investigação livre ou arquivado. "Atualizar dados da investigação" traz o estado atual da Oficina.
- **REPORT-03:** as dez seções e mais "Fontes" e "Nota sobre o modelo". Foram acrescentados os campos "Análise" e "Resposta à investigação", como no SIAB. Relatórios antigos continuam válidos, com esses campos vazios.
- **REPORT-04:** origem em cada linha e nota "Dados do modelo SILM…" na proposta.
- **REPORT-05:** os três modos. A análise fica disponível só fora de uma atividade.
- **REPORT-06:** seções incluídas, respostas em branco, linhas e impressão, sem apagar nenhum registro. A configuração é salva por relatório.
- **REPORT-07:** textos salvos enquanto se escreve e preservados ao recarregar. O relatório arquivado fica só para leitura.
- **REPORT-08:** tabelas com rolagem própria e sem quebrar palavras, cálculos, impressão, folha à mão e atividade.
- **REPORT-09:** a nota sobre o modelo distingue medida do modelo e amostra real, e representação qualitativa e resultado experimental.

## Diferenças de domínio (N/A)

- **N/A — dados hipotéticos.** O SIAB deixa o professor colar leituras inventadas de pH e condutividade. O SILM não cria dados: a atividade de análise usa somente os dados da investigação, como o plano exige.
- **N/A — gráficos.** O SILM não produz gráficos de leituras; as medições e os cálculos aparecem em tabelas.
- **N/A — "Condições finais".** Uma estrutura do SILM não muda de estado durante a investigação; a seção 6 registra as observações feitas na Oficina.

## Testes

`npm run test:parity` executa `tests/parity/report.cjs` (TEST-REPORT). O teste confere:

- nos 5 tamanhos: as ações, os modos e as seções na ordem, os alvos de 44 px, a ausência de rolagem lateral e a impressão sem controles;
- a origem dos dados e a nota sobre o modelo;
- a edição e a persistência, incluindo os campos novos;
- "Atualizar dados" depois de organizar a estrutura;
- a folha à mão (linhas e quantidade de linhas);
- a análise (seção excluída, resposta preenchida, proposta e questão);
- "Imprimir para preencher à mão";
- o arquivo: só leitura, sem análise e com "Voltar ao Caderno";
- numa atividade: a medida do modelo, o cálculo do SILM, a ausência do modo de análise e "Encerrar atividade".
