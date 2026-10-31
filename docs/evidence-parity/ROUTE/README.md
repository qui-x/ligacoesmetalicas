# Evidências — Etapa 4, Roteiros Experimentais (ROUTE)

**Referência:** SIAB 1.0.0 (`acidosebases1.0.0@73848f0`): lista `data-tela="roteiros"`, roteiro `data-tela="roteiro"` (`js/telas/roteiros.js`), montagem na bancada.
**Alvo:** SILM 0.15.5: `data-view="roteiros"` e o painel Roteiro na Oficina (`integracao/route-ui.js`: `routeCatalogue()` e `routePanel()`). Identificação na sessão: `domain/silm/route-session.js`.

## Capturas

- **Lista:** esta pasta. Comando: `node scripts/parity-capture.cjs ROUTE '#/roteiros' '#/roteiros' --siab <SIAB>`, nos 5 tamanhos.
- **Roteiro:** `../ROUTE-DETAIL/`, nos 5 tamanhos. Comparação: `#/roteiro/titulacao-forte` × `#/roteiros?item=ordem-metal`.
- **Depois de montar:** `../ROUTE-PANEL/`, em 1366×768 e 390×844. No SIAB aparece a bancada preparada (aba Preparo); no SILM, o painel Roteiro na Montagem.

Zero rolagem lateral e zero erros de página nas capturas automáticas.

## Elementos comparados

| SIAB | SILM antes | SILM agora |
|---|---|---|
| "Roteiros Experimentais" + "Escolha uma investigação e prepare a bancada." | Só o título | Título + "Escolha uma investigação e prepare a Oficina." |
| Linhas: título, subtítulo e, à direita, o módulo com uma seta | Grade de cartões com "Módulo: explorar" e "Ver especificações" | Linhas como no SIAB: o módulo e a seta à direita, mais "· Concluído"/"· Em andamento" quando houver |
| Roteiro: título, linha de abertura, módulo | Cartão com título, subtítulo, "Módulo: explorar" e descrição | Coluna de leitura: título, subtítulo como abertura, módulo |
| "O problema", "Pergunta central", "Objetivo", "O que você vai fazer", "Na bancada", "O que observar" | "Objetivos", "Condições e pré-requisitos", "Recursos virtuais", "Orientações" | "O problema", "Objetivo", "O que você vai fazer", "Na oficina" (estado inicial, módulo único, recursos, metais elegíveis), "O que observar", "Critério de conclusão" |
| Identificação: Nome, Turma, Data, Professor, Grupo, e "Montar na bancada" | Sem identificação antes de montar; só Nome e Data no relatório | Bloco "Identificação" com os 5 campos + metal + "Montar na oficina". Os campos são guardados para a próxima montagem e copiados para o relatório da sessão |
| Relatório com identificação | Nome e Data | Bloco "Identificação" com Nome, Turma, Data, Professor e Grupo. O registro no Caderno inclui a identificação |
| Depois de montar: bancada preparada | Painel com objetivo, orientações e critério | Painel "ROTEIRO · situação": objetivo, o que fazer, módulo e recursos, "O que observar" (recolhível), evidência "Pendente"/"Atendida" ao vivo, retorno em `role="status"`, Concluir / Relatório / Encerrar |

## Itens do plano

- **ROUTE-04 — estado inicial.** O roteiro diz em "Na oficina" se começa com montagem livre (e quantas unidades) ou com a estrutura cristalina de referência. Também diz quantos metais são elegíveis. O seletor só oferece metais elegíveis para aquele roteiro.
- **ROUTE-05 — módulo único.** Cada roteiro tem exatamente um módulo. O teste confere o catálogo inteiro, e o validador de `routes.js` recusa um módulo secundário. O módulo fica fixado durante a sessão.
- **ROUTE-06 — restrição.** Durante o roteiro, ficam disponíveis o Início, a Oficina, o próprio roteiro, os relatórios e o Manual. Os outros destinos voltam para o roteiro com aviso. Depois de recarregar, "Retomar na oficina" reabre a sessão.
- **ROUTE-07 — relatório.** O relatório da sessão abre pelo botão "Relatório" do painel (antes e depois de concluir). Ele mostra a identificação, os registros científicos (medições e cálculos com origem) e os campos de texto.
- **ROUTE-08 — cobertura.** São 5 roteiros:
  - 3 de Explorar: ordem, elétrons e deformação;
  - 1 de Medir: o parâmetro a;
  - 1 de Calcular: o volume da célula.
  
  Eles cobrem os três módulos. Os roteiros cristalinos usam os 48 metais com estrutura homologada; o de elétrons usa os 57 investigáveis. Os 9 metais só com o roteiro dos elétrons estão em `docs/COBERTURA-ROTEIROS.md`.
- **ROUTE-09 — casos inválidos.** Um roteiro inexistente volta à lista com aviso. Metais sem estrutura não aparecem no seletor dos roteiros cristalinos. Instrumentos fora do roteiro ficam ocultos ou desativados (`session.allows`). A conclusão fica bloqueada até a evidência ser atendida.

## Diferenças de domínio (N/A)

- **N/A — "Pergunta central".** O SIAB mostra uma pergunta separada nos roteiros de Explorar. No SILM, a pergunta já faz parte de "O problema" (por exemplo: "Uma imagem ampliada parece maior. A medida científica também muda?").
- **N/A — "Na bancada" (frascos e indicadores).** No SILM, essa seção vira "Na oficina", com o estado inicial da estrutura, o módulo, os recursos e os metais.
- **Extensão do SILM — painel Roteiro na Oficina.** O SIAB só prepara a bancada. O SILM mantém um guia com evidência ao vivo, porque o critério científico do roteiro é verificado pelo sistema.

## Testes

`npm run test:parity` executa `tests/parity/route.cjs` (TEST-ROUTE). O teste confere:

- lista e roteiro nos 5 tamanhos: módulo à direita, as 6 seções na ordem, identificação rotulada, alvos de 44 px, sem rolagem lateral;
- módulo único;
- foco no título;
- roteiro inexistente;
- identificação na sessão (com a data no formato do relatório) e no relatório;
- aba "Roteiro" e evidência mudando de "Pendente" para "Atendida";
- a restrição e a retomada;
- a conclusão;
- "Explorar · Concluído" na lista;
- a identificação guardada para a próxima montagem;
- o retorno com foco.
