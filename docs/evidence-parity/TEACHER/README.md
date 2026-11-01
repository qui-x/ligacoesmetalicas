# Evidências — Etapa 11, Área do Professor e apoio pedagógico (TEACHER)

**Referência:** SIAB 1.0.0 (`acidosebases1.0.0@73848f0`): tela `data-tela="professor"` (`js/telas/professor.js`), link do aluno e tela `data-tela="atividade"` (`js/core/atividades.js`), Guia do Professor.
**Alvo:** SILM 0.15.5: rota `#/professor` e `#/atividade?c=…` (`integracao/index.html`), `integracao/teacher-ui.js`, catálogo e validação em `domain/silm/teacher-activities.js`, sobreposição do professor na sessão de atividades (`domain/silm/route-session.js`).

## Capturas

- `professor-desktop.png` e `professor-celular.png`: a Área do Professor depois de gerar uma atividade (formulário, resultado com link, biblioteca, material e Tabela Periódica).
- `guia-desktop.png`: o Guia do Professor da atividade.
- `aluno-desktop.png` e `aluno-celular.png`: a tela "Atividade" aberta pelo link, antes de começar.

`tests/parity/teacher.cjs` confere a Área do Professor nos cinco tamanhos (1366×768, 1024×768, 390×844, 320×640, 844×390): controles de 44 px, zero rolagem lateral e zero erros de página.

## Elementos comparados

| SIAB | SILM antes | SILM agora |
|---|---|---|
| "Preparar atividade" em três etapas: atividade e identificação, condições e recursos do aluno, gerar e conferir como aluno | Tabela Periódica com fontes (sem preparação de atividade) | As mesmas três etapas. Tipo (Roteiro Experimental, Missão, Montagem pronta), atividade do catálogo, título, turma, professor e data; metal (fixo ou escolhido pelo aluno entre os elegíveis), recursos liberados e navegação. A Tabela Periódica continua em "Consultar elementos e fontes" |
| "Recursos necessários" da atividade e permissões do aluno | — | "O que esta atividade usa": módulo fixo, metais elegíveis e recursos necessários ao critério, que ficam marcados e travados. O professor só restringe; o critério continua o do SILM |
| Link da atividade, Copiar link, Abrir como aluno, Ver orientações | — | Os mesmos, mais "Exportar atividade" (JSON). O link abre a tela "Atividade": título, objetivo, metal, recursos, navegação, identificação e "Começar atividade". Link alterado: mensagem clara, nada é iniciado |
| Atividade restrita: módulo, instrumentos e navegação | Só roteiros e missões do catálogo | A atividade do professor roda sobre a mesma sessão de roteiros e missões, com título próprio, metal e recursos restritos, navegação restrita ou livre e identificação já preenchida no relatório. Não se mistura com a tentativa livre do mesmo roteiro |
| Atividades criadas: Abrir, Copiar link, Editar, Duplicar, Excluir | — | Os mesmos, mais Exportar; "Importar atividades" é tudo ou nada (um arquivo inválido não altera a lista); várias atividades persistentes neste navegador |
| Guia do Professor (objetivo, conceitos, preparação, desenvolvimento, interpretação, erros comuns, discussão, BNCC) e impressão | — | Guia composto com os textos do próprio SILM: objetivo, problema, conceitos e "como interpretar" dos temas relacionados, preparação, desenvolvimento, critério, limites do modelo, fontes e observação. Imprime só o guia. **Sem BNCC nem "erros comuns"**: pedem conteúdo do autor |
| Modo projetor na Área do Professor | No Menu | Também na Área do Professor, espelhando a preferência do Menu |
