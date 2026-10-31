# Evidências — Etapa 6, Caderno (NOTE)

**Referência:** SIAB 1.0.0 (`acidosebases1.0.0@73848f0`): `data-tela="caderno"` (`js/telas/caderno.js`).
**Alvo:** SILM 0.15.5: `data-view="caderno"` (`integracao/unified-ui.js` `notebook()`).

## Capturas

As capturas desta pasta foram feitas com `node scripts/parity-capture.cjs NOTE '#/caderno' '#/caderno' --siab <SIAB>`, nos 5 tamanhos, com zero rolagem lateral e zero erros de página.

## Elementos comparados

| SIAB | SILM antes | SILM agora |
|---|---|---|
| "CADERNO DE LABORATÓRIO", "Seu caderno", "Registros pessoais de investigações, hipóteses, descobertas e práticas." | Mesmo título e sobretítulo; introdução curta, seguida de um parágrafo longo sobre dados locais | Introdução "Registros pessoais de investigações, hipóteses, observações e conclusões."; a nota sobre dados locais foi para o grupo de backup |
| Ordem: ações → filtro → nova anotação → lista | Nova anotação → cinco ações em grade → filtro → lista | A ordem do SIAB; o backup JSON (extensão do SILM) vem num grupo próprio depois da lista |
| Ações "Baixar caderno (CSV)", "Imprimir", "Apagar caderno" (destaque de risco) | "Exportar backup JSON", "Baixar Caderno (CSV)", "Imprimir Caderno", "Importar backup JSON", "Apagar Caderno" em botões grandes | As três ações do SIAB, compactas, com "Apagar caderno" em destaque de risco; Exportar/Importar backup JSON no grupo "Backup" |
| Cabeçalho e conteúdo na mesma coluna | Cabeçalho centralizado, conteúdo alinhado à esquerda | Coluna única alinhada |
| Impressão sem controles | Controles saíam só quando a impressão começava pelo botão "Imprimir" | Também com Ctrl+P: no papel ficam só o cabeçalho e os registros |
| Filtro por tipo (Práticas, Experiências, Missões, Explorações, Anotações) | Anotações, Hipóteses, Conclusões, Missões e roteiros concluídos, Relatórios associados | Mantido; são os equivalentes de domínio |
| Registro: tipo · data, título, texto, "Apagar nota" com confirmação | Tipo · data, título, texto, "Apagar registro" com confirmação; registros de relatório levam a ele | Mantido |

## Itens do plano

- **NOTE-01 — modelo de registro.** Anotação, hipótese e conclusão, mais os registros automáticos de missão e roteiro concluídos (com a conclusão do estudante, Etapa 3) e de relatório (com a identificação, Etapa 4). Cada registro guarda o vínculo com a cena e a tentativa (`attemptId`).
- **NOTE-02 — rota habilitada.** O Caderno está ativo. O cartão do Início e "Abrir Caderno" em Dados levam a ele (TEST-HOME, TEST-WORKSPACE).
- **NOTE-03 — lista e filtros.** Lista cronológica com filtro por tipo (TEST-NOTEBOOK). Filtrar por metal ou atividade fica como possibilidade: os tipos já separam os registros de atividade dos pessoais.
- **NOTE-04 — criação.** Título obrigatório, tipo e texto, com retorno "Registro salvo no Caderno.". `N/A`: edição. O SIAB também só permite criar e apagar.
- **NOTE-05 — detalhe.** Registros de relatório abrem o relatório arquivado (`learning-browser`).
- **NOTE-06 — CSV.** Cabeçalho e registros, com BOM UTF-8 para planilhas (TEST-NOTEBOOK).
- **NOTE-07 — backup JSON.** Backup versionado; importação validada, com rollback e sem duplicatas (`notebook-backup`, `learning-browser`).
- **NOTE-08 — impressão.** Sem controles, também com Ctrl+P (TEST-NOTEBOOK).
- **NOTE-09 — exclusão.** Exclusão individual com confirmação (cancelar preserva) e limpeza total com confirmação, preservando os relatórios arquivados (TEST-NOTEBOOK, `learning-browser`).
- **NOTE-10 — registros automáticos.** Missão, roteiro e relatório registrados uma vez só por tentativa (`attemptId`; `learning-browser`).
- **NOTE-11 — testes.** Persistência, navegação, backup, importação inválida e recuperação: TEST-NOTEBOOK, `notebook-backup` e `learning-browser`.

## Testes

`npm run test:parity` executa `tests/parity/notebook.cjs` (TEST-NOTEBOOK). O teste confere:

- a ordem e o alinhamento nos 5 tamanhos;
- os rótulos e o destaque de risco;
- o grupo de backup;
- os alvos de 44 px;
- a criação de hipótese e de anotação;
- o filtro (Hipóteses: 1; Conclusões: vazio);
- a persistência depois de recarregar;
- o CSV com cabeçalho;
- a impressão sem controles;
- a exclusão com confirmação.
