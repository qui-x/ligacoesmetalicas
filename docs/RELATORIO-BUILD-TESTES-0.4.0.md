# Relatório de build e testes — SILM 0.4.0

Data: 2026-10-11 · Navegador: Chromium (Playwright 1.62.1) · Node 22 · Resultado: **30 aprovados, 0 reprovados**.

## 1. Build

`npm run build` concluído sem erros. Etapas: validação do banco (bloqueante) → validação do estado científico (bloqueante) → bundle científico → breakpoints → service worker (cache `0.4.0`, inclui os arquivos da montagem).

Auditoria (`npm run audit`): **17 verificações aprovadas, 0 reprovadas**. Ela confere versão única, núcleo herdado idêntico ao da 0.3.0 (exceto a integração declarada `js/experience/activity.js`), recursos, sintaxe, PWA, documentação, montagem carregada, ausência de linhas M—M, de elétrons e de estados paralelos, e o validador do schema 3. Resultado em `docs/evidence/AUDITORIA-SILM.json`.

## 2. Banco científico (regressão 0.2.x) — `tests/scientific-data.cjs`

| Verificação | Resultado |
|---|---|
| Elementos | 118 |
| Metais disponíveis (quantidade vigente) | 43 |
| Fontes | 77 |
| Casos negativos do validador recusados | 6 |
| Busca por nome, símbolo e Z | ok |

## 3. Estado científico — `scripts/validate-scientific-state.cjs`

| Verificação | Resultado |
|---|---|
| Schema | 3 (modelo da estrutura 1) |
| Migração | schema 2 (0.3.0) → schema 3 (0.4.0) |
| Unidades testadas | 1, 2, 5, 10, 48 |
| Estados inválidos recusados | 45 |
| Sobreposição impedida | sim |
| Desfazer | add, move |
| Limpar e reset preservam o metal | sim |
| Encerrar remove a investigação | sim |
| Histórico de desfazer persistido | não (decisão documentada) |

## 4. Navegador — `tests/silm040.cjs`

Os números seguem os itens de teste do prompt 0.4.x (§122–148). "135b" verifica a correção de origem 0.3.x (retomada direta); "A11Y" é a varredura axe-core (WCAG 2.0/2.1/2.2 A e AA) do workspace com a montagem.

| Item | Teste | Resultado | Duração |
|---|---|---|---|
| 122 | Migração schema 2 (0.3.0) → schema 3 | ✅ aprovado | 2.2 s |
| 123 | Iniciar montagem cria estrutura vazia | ✅ aprovado | 1.2 s |
| 124 | Adicionar 1, 2, 5 e 10 unidades | ✅ aprovado | 1.7 s |
| 125 | Movimentar unidade no desktop (arrasto por Pointer Events) | ✅ aprovado | 2.1 s |
| 126 | Mobile: selecionar e tocar no destino, sem arrasto | ✅ aprovado | 1.2 s |
| 127 | Teclado: selecionar e reposicionar com setas | ✅ aprovado | 1.0 s |
| 128 | Prevenção de sobreposição | ✅ aprovado | 2.0 s |
| 129 | Desfazer adição | ✅ aprovado | 0.8 s |
| 130 | Desfazer movimento | ✅ aprovado | 1.0 s |
| 131 | Limpar estrutura com 10 unidades mantém o metal | ✅ aprovado | 1.6 s |
| 132 | Cancelar limpeza preserva a estrutura | ✅ aprovado | 0.9 s |
| 133 | Reset remove a estrutura e preserva o metal | ✅ aprovado | 1.0 s |
| 134 | Encerrar remove estrutura e investigação | ✅ aprovado | 1.0 s |
| 135 | Reload restaura montagem idêntica | ✅ aprovado | 2.0 s |
| 135b | Retomada direta: recarregar não exibe "Retomar sessão?" nem muda a tela | ✅ aprovado | 1.6 s |
| 136 | Navegação Laboratório → Manual/Professor/Aprender → Laboratório | ✅ aprovado | 2.5 s |
| 137 | Troca de módulo preserva a montagem | ✅ aprovado | 2.4 s |
| 138 | Troca de metal com estrutura exige confirmação | ✅ aprovado | 1.2 s |
| 139 | Offline: construir e persistir sem internet | ✅ aprovado | 2.7 s |
| 140-320 | Mobile 320 px | ✅ aprovado | 1.2 s |
| 140-360 | Mobile 360 px | ✅ aprovado | 1.2 s |
| 140-390 | Mobile 390 px | ✅ aprovado | 1.6 s |
| 141 | Landscape mobile | ✅ aprovado | 1.2 s |
| 142 | Texto em 150% | ✅ aprovado | 1.4 s |
| 143 | Alto contraste: unidades e seleção distinguíveis | ✅ aprovado | 1.5 s |
| 144 | Movimento reduzido sem perda funcional | ✅ aprovado | 1.1 s |
| 147 | Regressão 0.2.x: Tabela, banco e Área do Professor | ✅ aprovado | 31.4 s |
| 148 | Regressão 0.3.x: estado corrompido e scientificState único | ✅ aprovado | 1.1 s |
| A11Y | Acessibilidade automatizada (axe-core) da montagem | ✅ aprovado | 2.3 s |
| 146 | Console sem erros críticos | ✅ aprovado | 0.0 s |

Erros de console registrados em todos os testes: **0**. Resultados brutos: `docs/evidence-0.4.0/RESULTADOS-NAVEGADOR-0.4.0.json`.

## 5. Capturas (`docs/evidence-0.4.0/capturas/`)

- `01-desktop-investigacao-sem-estrutura.png`
- `02-desktop-estrutura-vazia.png`
- `03-desktop-montagem-varias-unidades.png`
- `04-desktop-unidade-selecionada.png`
- `05-desktop-movimentacao-arrasto.png`
- `06-desktop-prevencao-sobreposicao.png`
- `07-desktop-modal-limpar.png`
- `08-desktop-retomada-apos-reload.png`
- `09-desktop-paineis.png`
- `10-desktop-medir-somente-leitura.png`
- `11-desktop-alto-contraste.png`
- `12-desktop-tema-claro.png`
- `13-desktop-fonte-150.png`
- `m01-320-montagem.png`
- `m02-360-montagem.png`
- `m03-390-montagem.png`
- `m04-390-unidade-selecionada.png`
- `m05-390-sheet-elementos.png`
- `m06-landscape.png`

Correspondência com a entrega pedida: estrutura vazia (02), montagem com várias unidades (03), unidade selecionada (04, m04), movimentação (05), prevenção de sobreposição (06), modal de limpar (07), retomada após reload (08), painéis (09), Medir somente leitura (10), alto contraste (11), tema claro (12), fonte 150% (13), mobile 320/360/390 (m01–m03), sheet Elementos (m05) e landscape (m06).

## 6. Checklist final (§163)

| Item | Situação | Evidência |
|---|---|---|
| schema científico atualizado | ✅ | validador, item 122 |
| migração 2 → 3 | ✅ | validador, item 122 |
| structure formal | ✅ | item 123, `SCIENTIFIC-STATE.md` |
| montagem manual; adicionar unidades | ✅ | itens 123–124 |
| um único metal | ✅ | `STRUCTURE_MIXED_ELEMENTS`, item 138 |
| IDs estáveis | ✅ | itens 124, 129, 135 |
| movimentação desktop; alternativa sem drag | ✅ | itens 125–126 |
| mobile funcional; teclado funcional | ✅ | itens 126–127, 140, 141 |
| assistência; prevenção de sobreposição | ✅ | item 128, validador |
| nenhuma linha M—M; nenhuma rede CCC/CFC/HC; nenhum elétron | ✅ | item 124, auditoria |
| desfazer adição; desfazer movimento | ✅ | itens 129–130, 127 |
| limpar mantém metal; reset mantém metal; encerrar remove investigação | ✅ | itens 131–134 |
| reload restaura montagem; módulos preservam montagem | ✅ | itens 135–137 |
| offline funciona | ✅ | item 139 |
| acessibilidade funciona | ✅ | itens 127, 142–144, A11Y |
| banco científico, Tabela e Área do Professor válidos | ✅ | `tests/scientific-data.cjs`, item 147 |
| build passa; console limpo | ✅ | seção 1, item 146 |

## 7. Limites desta homologação

- Executado somente em **Chromium** (o ambiente não tinha Firefox nem WebKit). A homologação em Gecko e WebKit pertence à 0.18.x e deve ser repetida assim que houver navegadores disponíveis.
- Mobile, toque, 150% de fonte, alto contraste e movimento reduzido foram **emulados** (viewport, `hasTouch`, preferências da Base). Aparelhos físicos, leitor de tela real, projetor e impressão física requerem verificação manual.
- O offline foi testado com service worker real em `localhost`, desconectando o contexto do navegador.
