# SILM 0.14.3 — Caderno integrado à investigação

## Objetivo

Retomar a dinâmica do Caderno do SIAB — um histórico de aprendizagem conectado à atividade, e não apenas uma caixa de anotações — mantendo os contratos da Base SI e o domínio científico do SILM.

## Fluxo do Caderno

- **Anotações pessoais:** título separado do texto, tipo (anotação, hipótese ou conclusão), data e metal associado quando existe investigação ativa.
- **Conclusões automáticas:** concluir uma missão ou roteiro cria uma única entrada de conclusão com o nome da atividade, módulo, metal, estrutura, quantidade de unidades, medidas e cálculos. O registro oferece acesso direto à atividade correspondente.
- **Relatórios relacionados:** o botão Registrar no Caderno cria uma referência de relatório. A aplicação salva um snapshot, então a referência abre o relatório que foi registrado, mesmo depois da investigação livre mudar.
- **Linha do tempo:** cartões exibem tipo, data, título, texto e metal; filtros separam tipos de anotação, atividades e relatórios. Os registros podem ser excluídos com confirmação.
- **Saída e restauração:** impressão, CSV e backup JSON continuam disponíveis; importação valida o arquivo e pede confirmação antes de substituir os registros locais.
- **Página inicial:** o card Caderno permanece clicável e sua metainformação reflete a contagem atualizada.

## Compatibilidade e escopo

O conteúdo das notas continua no armazenamento de Caderno da Base SI 0.9.17 (journal-document-v1); snapshots reabríveis de relatórios são armazenados separadamente para não alterar o contrato desse documento. Não houve alteração no snapshot integracao/upstream, nos cálculos, nos dados de referência ou no schema científico 8 do SILM. Os registros existentes continuam legíveis: entradas antigas sem título explícito são exibidas com a primeira linha como título.

## Homologação

Os testes de navegador foram ampliados para o título da anotação, a criação automática de uma conclusão, a referência de relatório e sua reabertura em modo somente leitura. A execução automatizada desta rodada não foi confirmada nesta etapa; consulte o relatório de build e testes (RELATORIO-BUILD-TESTES-0.14.3.md).
