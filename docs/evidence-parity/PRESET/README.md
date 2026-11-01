# Evidências — Etapa 9, Montagens prontas (PRESET)

**Referência:** SIAB 1.0.0 (`acidosebases1.0.0@73848f0`): tela `data-tela="montagens"` (`SIAB.telas.montagens` em `js/telas/roteiros.js`), dados em `js/data/montagens.js`, entradas pelo Menu → Recursos e pela bancada vazia.
**Alvo:** SILM 0.15.5: rota `#/montagens` (`integracao/index.html`), `readyAssemblies()` em `integracao/unified-ui.js`, catálogo `domain/silm/ready-assemblies.js`.

## Capturas

- `montagens-desktop.png` (1366×768) e `montagens-celular.png` (390×844): a lista de cartões.
- `aplicada-magnesio-hc.png`: a Oficina depois de "Montar na oficina" no magnésio (HC organizada, célula completa).

O teste `tests/parity/presets.cjs` confere os cinco tamanhos (1366×768, 1024×768, 390×844, 320×640, 844×390): zero rolagem lateral e zero erros de página.

## Elementos comparados

| SIAB | SILM antes | SILM agora |
|---|---|---|
| Tela "Montagens prontas" com cartões: título, objetivo, nível e recipientes, o que vai na bancada, instrumentos, visualização inicial, "Investigue" (passos), recursos recomendados e "Montar na bancada" | As três montagens existiam só na interface antiga (0.x); a Oficina integrada não tinha a tela | Tela "Montagens prontas" com cartões: título, objetivo, módulo, o que vai para a oficina (metal, estrutura e número de unidades da célula), condição de referência, fonte da estrutura, "Investigue", recursos recomendados e "Montar na oficina" |
| Entradas: Menu → Recursos, bancada vazia e painel do tubo | — | Menu → Recursos (antes do Tour), Oficina vazia e Montagem → Preparo |
| Montar substitui a bancada; em atividade restrita não monta | — | Montar usa a mesma confirmação de "Iniciar investigação" quando já existe uma investigação. Em atividade, a tela não abre, como as outras telas fora da atividade |
| Conteúdo químico do SIAB (titulações, indicadores) | — | **Não copiado.** As três montagens são as do SILM 0.x (cobre CFC, ferro CCC, magnésio HC). Metal, estrutura, condição e fonte vêm do banco ao mostrar e ao aplicar; se o metal ou a estrutura mudar, a montagem fica indisponível com o motivo |
