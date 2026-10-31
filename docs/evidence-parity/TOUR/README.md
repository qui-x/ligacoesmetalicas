# Evidências — Etapa 10, Tour e ajuda contextual (TOUR)

**Referência:** SIAB 1.0.0 (`acidosebases1.0.0@73848f0`): `js/ui/tour.js`, aviso `#boas-vindas`, `SIAB.ajuda` (`js/telas/manual.js`), Menu → Recursos → Tour da bancada.
**Alvo:** SILM 0.15.5: `shell()` em `integracao/adapter.js` (tour, ajuda das docas, aviso de primeira visita), janelas `#silm-tour` e `#silm-help-dialog` (`integracao/index.html`), tópico "Tour da oficina e ajuda dos painéis" (`domain/silm/manual.js`).

## Capturas

- **Aviso de primeira visita** (`*-aviso-*`) e **primeiro passo do tour** (`*-tour-*`) nos 5 tamanhos.
- **Ajuda contextual** (`*-ajuda-1366x768`): no SIAB, a ajuda dos módulos; no SILM, o "?" da Montagem.

Zero rolagem lateral e zero erros de página (`capturas.json`).

## Elementos comparados

| SIAB | SILM antes | SILM agora |
|---|---|---|
| Aviso "Primeira vez no laboratório?" com "Fazer o tour", "Abrir o manual" e "Agora não". Some depois do tour, de "Agora não" ou de uma visita ao Manual | — | "Primeira vez na Oficina?" no estado vazio da Oficina, com os mesmos três botões e as mesmas regras. Não aparece durante uma atividade |
| Tour em coachmark: fundo escurecido, contorno do alvo, cartão com "PASSO n DE 5", pontos de progresso, "Pular tour", "Voltar", "Próximo"/"Concluir". Escape encerra; o foco volta | O Menu não tinha o tour. A Base tinha um tour genérico, com alvos que não existem no SILM | Tour da oficina em 5 passos, com o mesmo cartão e os mesmos controles: Prepare a oficina (Montagem → Preparo), Escolha um módulo (Montagem → Módulo), Monte a estrutura (Adicionar unidade, Organizar estrutura, Desfazer), Observe (cena) e Investigue e consulte os dados (Ver, Dados) |
| No computador, o tour abre o painel de cada passo; no celular, contorna o botão do painel | — | Igual: no computador abre Montagem e Ver; no celular (folhas inferiores), contorna os botões Montagem e Ver. Ao terminar, fecha os painéis que abriu |
| Tour só no laboratório livre | — | Só na oficina livre. Durante uma atividade aparece "O tour está disponível na oficina livre…" |
| Menu → Recursos → Tour da bancada; Manual → "Iniciar tour da bancada" | — | Menu → Recursos → "Tour da oficina"; Manual → "Iniciar tour da oficina" |
| Botões de ajuda nos painéis ("Ajuda: módulos" etc.) abrem uma janela com o tópico do Manual e o link para ele | Só um link "Ajuda sobre representação" no painel Ver | Botão "?" nas docas Montagem e Ver/Dados. A janela mostra o tópico do que o painel mostra naquele momento, com resumo, passos e "Abrir no Manual" |

## O defeito encontrado

Com um painel aberto, a tecla Escape fechava o painel, e não a janela por cima dele, porque a Base trata Escape primeiro. Agora as janelas do SILM (tour, ajuda, tela inicial e Sobre) recebem a tecla Escape antes.

## Itens do plano

- **TOUR-01:** abertura, passos, progresso, Pular, Voltar, Próximo/Concluir, Escape e retorno do foco.
- **TOUR-02:** cada passo contorna um controle real e visível. O teste confere o contorno e o cartão dentro da tela nos 5 tamanhos.
- **TOUR-03:** o aviso aparece na primeira visita e pode ser dispensado ("Agora não"); o tour não usa animação de movimento.
- **TOUR-04:** a ajuda de cada painel leva ao tópico certo:
  - Montagem: Preparo → "Selecionar um metal"; Unidades → montagem; Módulo → o módulo ativo; Resumo → "Conheça a Oficina"; Roteiro → atividades;
  - Ver: estrutura → vista; elétrons; propriedades; instrumentos → Medir; cálculos → Calcular;
  - Dados: "Conheça a Oficina".
- **TOUR-05:** o tour não roda durante uma atividade e não altera a investigação.
- **TOUR-06:** computador e celular, com painéis abertos e rolagem (TEST-TOUR nos 5 tamanhos).

## Diferenças de domínio (N/A)

- **Pendente da Etapa 9 — "Montagens prontas".** O aviso e o Menu → Recursos só vão citar as Montagens prontas quando elas existirem.

## Testes

`npm run test:parity` executa `tests/parity/tour.cjs` (TEST-TOUR). O teste confere:

- nos 5 tamanhos: o aviso e os 5 passos (contorno, cartão na tela, Voltar, Próximo/Concluir, pontos), o Escape, as docas fechadas e o foco;
- que o aviso não volta;
- as docas abertas pelo tour no computador e o "Pular tour";
- a entrada pelo Menu e pelo Manual;
- "Agora não" e a visita ao Manual;
- a ajuda "?" por aba e por visualização, com o link para o Manual;
- o bloqueio durante uma atividade.
