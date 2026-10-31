# Evidências — Etapa 2, Aprender / Temas (LEARN)

**Referência:** SIAB 1.0.0 (`acidosebases1.0.0@73848f0`), telas `data-tela="aprender"` e `data-tela="tema"` (`js/telas/aprender.js`).
**Alvo:** SILM 0.15.5, tela `data-view="aprender"` (`integracao/unified-ui.js` `themes()`, `domain/silm/themes.js`).

## Capturas

- **Lista:** esta pasta. Comando: `node scripts/parity-capture.cjs LEARN '#/aprender' '#/aprender' --siab <SIAB>`.
- **Tema:** `../LEARN-DETAIL/`. Comando: `node scripts/parity-capture.cjs LEARN-DETAIL '#/tema/acidos-bases' '#/aprender?tema=ligacao-metalica' --siab <SIAB>`.

Ambas cobrem os 5 tamanhos do plano. Em todos eles: zero rolagem lateral e zero erros de página (veja `capturas.json` nas duas pastas).

## Elementos comparados

| SIAB | SILM antes | SILM agora |
|---|---|---|
| Cabeçalho "Temas" + "Escolha um tema. Todos permanecem disponíveis para revisitar." | "Aprender — Temas", sem introdução | Igual ao SIAB |
| Lista de linhas: o cartão inteiro é o link; título, resumo curto e situação à direita ("Não revisado"/"Revisado") | Grade de 3 cartões com subtítulo, descrição e um botão "Explorar tema" separado; sem situação até concluir | Linhas como no SIAB; o resumo é subtítulo + descrição; a situação fica à direita (abaixo do título até 370 px) |
| Tema em coluna de leitura: "APRENDER · TEMA", título, conceito como linha de abertura, uma frase, ações | O tema aparecia dentro de um cartão, abaixo do título da lista; ações espalhadas | Coluna de leitura: sobretítulo, título, ideia principal como abertura, subtítulo + descrição, ações |
| Ações: "Investigar na bancada", "Missão relacionada", "Roteiro relacionado", "Marcar como revisado" | "Marcar como concluído", "Abrir laboratório" (só navegava), listas de missões e roteiros | "Investigar na oficina" (principal) e "Marcar como revisado". Logo abaixo, "Conteúdo relacionado" mostra **pelo nome** todas as missões e roteiros do tema, que no SILM são 1 ou 2 de cada tipo |
| O conceito é o único texto do tema | — | Extensão do SILM preservada: "Aprofunde" (Observe no SILM, Como interpretar, Limites do modelo), metais para observar e fontes |
| Foco no título ao abrir o tema | Sem foco dedicado | Foco no título e topo da página. Ao voltar ("Todos os temas" ou o Voltar do navegador), o foco volta para a linha do tema aberto |
| Marcar como revisado | "Concluído — desmarcar" | "Revisado · desmarcar" com `aria-pressed`. O foco fica no botão. Sem pontos nem porcentagem; pode ser desfeito e o tema continua disponível |

## LEARN-04 — Investigar na oficina

No SIAB, "Investigar na bancada" cria uma bancada nova e substitui a anterior. O plano pede que, no SILM, a investigação só comece com um gesto explícito do estudante. Por isso:

- o botão prepara o metal representativo do tema (o primeiro de "Metais para observar") na Montagem;
- depois abre a Oficina com a Montagem aberta e anuncia: "Cobre preparado na Montagem. Escolha Iniciar para começar a investigação.";
- se já existe uma investigação, ela não é substituída e nenhum diálogo aparece; só a escolha da Montagem muda;
- se o metal já é o da investigação atual, o botão apenas abre a Oficina.

## LEARN-05 — Cobertura do conteúdo (para validação do autor)

O SILM tem 7 temas:

1. Ligação Metálica
2. Estrutura dos Metais
3. Estruturas Cristalinas
4. Elétrons Deslocalizados
5. Propriedades Metálicas
6. Medindo Estruturas
7. Da Estrutura ao Cálculo

O plano citava 4, que eram do bootstrap antigo. Os 7 cobrem os três módulos (Explorar, Medir, Calcular) e todos os roteiros e missões.

Lacunas possíveis, **sem conteúdo criado nesta etapa** (o plano proíbe inventar dados ou resultados):

- tendências periódicas do caráter metálico;
- ligas metálicas e soluções sólidas;
- defeitos e discordâncias como base da maleabilidade (hoje a deformação é tratada qualitativamente no roteiro).

Cada uma precisaria de modelo, dados e fontes homologados antes de virar tema.

## Diferenças de domínio (N/A)

- **N/A — quantidade de temas.** O SIAB tem 14; o SILM tem 7. A paridade é de arquitetura, não de contagem.
- **N/A — botões "Missão relacionada" e "Roteiro relacionado" na fileira de ações.** Os temas do SIAB apontam para uma missão e um roteiro. Os do SILM apontam para até duas missões e dois roteiros. Por isso eles aparecem pelo nome, logo abaixo das ações.

## Testes

`npm run test:parity` executa `tests/parity/learn.cjs` (TEST-LEARN). O teste confere:

- lista e tema nos 5 tamanhos: textos, ordem do catálogo, situação à direita, alvos de 44 px, sem rolagem lateral;
- teclado: título → primeiro tema → Enter abre o tema com foco no título;
- conexões: só destinos que existem no catálogo, com os nomes certos;
- marcador revisado: foco preservado, sem pontos, persistência depois de recarregar, desmarcar;
- retorno com foco pelo link e pelo Voltar do navegador;
- tema inexistente;
- "Investigar na oficina" sem iniciar e sem substituir uma investigação.

`tests/learning-browser.cjs` foi ajustado para a nova lista e para "Revisado".
