# Evidências — Etapa 3, Missões (MISSION)

**Referência:** SIAB 1.0.0 (`acidosebases1.0.0@73848f0`): lista `data-tela="missoes"`, missão na bancada (`js/telas/missao.js`, painel `#painel-missao`).
**Alvo:** SILM 0.15.5: `data-view="missoes"` e o painel da missão na Oficina (`integracao/route-ui.js`: `missionCatalogue()` e `missionPanel()`).

## Capturas

- **Lista:** esta pasta. Comando: `node scripts/parity-capture.cjs MISSION '#/missoes' '#/missoes' --siab <SIAB>`, nos 5 tamanhos.
- **Especificação:** `../MISSION-DETAIL/`, nos 5 tamanhos. No SIAB, a missão abre direto na bancada; no SILM, abre a especificação antes de montar (veja N/A).
- **Painel da missão na Oficina:** `../MISSION-PANEL/`, em 1366×768 e 390×844. As capturas foram feitas com a Montagem aberta, na aba Missão, porque o painel exige interação.

As capturas automáticas registram zero rolagem lateral e zero erros de página (veja `capturas.json`).

## Elementos comparados

| SIAB | SILM antes | SILM agora |
|---|---|---|
| "Missões" + "Problemas abertos à investigação, com condições de sucesso." | "Missões", sem introdução | Cabeçalho com introdução ("…cada um com um critério científico de conclusão") |
| Linhas: título, resumo e situação "Não realizado"/"Concluído" à direita; o cartão inteiro é o link | Grade de cartões com "Ver especificações" | Linhas como no SIAB; o resumo traz subtítulo, módulo e conceito; a situação inclui "Em andamento" quando há uma tentativa guardada |
| Painel: "MISSÃO · Não realizado", título, "O problema", "Objetivo e regras" | Título, módulo, "Objetivo" e "Critério de conclusão" (a mesma frase duas vezes) | "MISSÃO · Em andamento/Concluído", título, "O problema", "Objetivo e regras" (módulo e recursos liberados) |
| Objetivos com o estado de cada evidência | Só o botão Concluir, que se habilitava | "Evidência" com um rótulo curto do que `route-session` confere e o estado "Pendente"/"Atendida", atualizado ao vivo |
| "Perguntas para investigar" (recolhível) | — | "Dica para investigar" (recolhível) |
| Campo "Conclusão" salvo na sessão, com retorno de conclusão | — | Campo "Conclusão" salvo na sessão a cada digitação (`session.edit('conclusion')`); o foco e o cursor são preservados nos redesenhos; ele fica bloqueado depois de concluir |
| Retorno em `role="status"` | Só um aviso flutuante | `#mission-feedback` em `role="status"`: falta evidência → critério atendido → concluído |
| Concluir, Refazer, Relatório | Concluir, Encerrar | Concluir (principal) e Encerrar. "Refazer missão" aparece na especificação depois de encerrar |
| Conclusão vai para o Caderno | O registro da missão não tinha a resposta do estudante | O registro no Caderno inclui "Conclusão do estudante: …" |
| A aba do painel diz "Missão" | A aba dizia "Roteiro" também durante uma missão | A aba diz "Missão" durante uma missão |

## Ciclo da missão (MISSION-05)

1. **Iniciar:** especificação → escolher o metal → "Iniciar missão" → confirmação. A investigação livre fica guardada e volta ao encerrar.
2. **Continuar:** o painel acompanha a evidência; a conclusão é salva a cada digitação.
3. **Recarregar:** abre a especificação com "MISSÃO · Em andamento" e "Retomar na oficina". A conclusão escrita volta ao campo.
4. **Concluir:** com o critério atendido. O registro vai para o Caderno com a conclusão do estudante.
5. **Encerrar:** a lista mostra "Concluído", e a especificação oferece "Refazer missão".
6. **Restrição (MISSION-06):** durante a missão, ficam disponíveis o Início, a Oficina, a própria missão, os relatórios e o Manual. As outras telas voltam para a missão com aviso.

## Diferenças de domínio (N/A)

- **N/A — abrir a missão direto na bancada.** O SILM pede a escolha do metal e guarda a investigação livre antes de montar. Por isso a especificação existe; ela segue a mesma estrutura do painel do SIAB (problema, objetivo e regras).
- **N/A — conclusão obrigatória.** No SIAB, a missão só conclui com texto escrito. No SILM, o critério científico de `route-session` continua sendo a condição. A conclusão é incentivada no painel e registrada no Caderno, mas não bloqueia, para não mudar os critérios homologados.
- **N/A — "Refazer" e "Relatório" no painel.** "Refazer" fica na especificação depois de encerrar. O relatório digital continua sendo dos roteiros (Etapa 4 e Etapa 8).
- **MISSION-08 — cobertura.** As 6 missões do SILM cobrem os três módulos e os critérios verificáveis existentes. Nenhuma missão nova foi criada sem critério científico homologado.

## Testes

`npm run test:parity` executa `tests/parity/mission.cjs` (TEST-MISSION). O teste confere:

- lista e especificação nos 5 tamanhos;
- foco no título;
- missão inexistente;
- a aba "Missão" e o estado do painel;
- a restrição;
- a conclusão guardada a cada digitação e retomada depois de recarregar (por "Retomar na oficina");
- a evidência mudando de "Pendente" para "Atendida" ao selecionar um centro e mostrar os vizinhos;
- o foco preservado no campo de conclusão;
- a conclusão e o retorno de "Concluído";
- o registro no Caderno com a conclusão do estudante;
- "Concluído" na lista, "Refazer missão" e o retorno com foco na linha.
