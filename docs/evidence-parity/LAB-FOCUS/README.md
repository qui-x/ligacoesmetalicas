# Evidências — Etapa 5.1, Oficina → Foco (LAB-FOCUS)

**Referência:** SIAB 1.0.0 (`acidosebases1.0.0@73848f0`): `data-tela="bancada"` (`js/telas/laboratorio.js`, `js/telas/bancada.js`).
**Alvo:** SILM 0.15.5: `data-view="ambiente"` (`integracao/adapter.js` `renderScene()`/`emptyState()`, `domain/silm/assembly-view.js`).

## Capturas

As capturas desta pasta foram feitas com `node scripts/parity-capture.cjs LAB-FOCUS '#/laboratorio' '#/ambiente' --siab <SIAB>`. Elas mostram o estado vazio nos 5 tamanhos, com zero rolagem lateral e zero erros de página.

## Elementos comparados

| SIAB | SILM antes | SILM agora |
|---|---|---|
| "Bancada vazia": ilustração, título, "Abra **Montagem → Preparo**…", ações "Abrir Montagem", "+ Tubo com água" e "Montagens prontas" | Uma linha de texto no canto da cena | "Oficina vazia": ilustração de célula, "Abra **Montagem → Preparo**…" e ações "Abrir Montagem" (abre a doca na aba Preparo), "Começar com o cobre" (inicia com um clique, como o tubo com água) e "Tabela periódica" |
| Etiqueta "MÓDULO · EXPLORAR" logo após as abas | — | Etiqueta "Módulo · Explorar/Medir/Calcular" logo após as abas; numa atividade, "Missão · …" ou "Roteiro · …" (escondida até 640 px, onde a barra é compacta) |
| Desfazer junto dos controles; sem comandos repetidos | "Desfazer" no cabeçalho da cena **e** na barra; "Limpar estrutura" na barra **e** no menu Mais | Desfazer só na barra (`#scene-undo`); "Limpar estrutura" só no menu Mais (ação destrutiva, um passo a mais); cabeçalho da cena com "Adicionar unidade" e "Organizar estrutura" |
| Metal escolhido sem estrutura | Linha de texto | Cartão "Estrutura de <metal> vazia" com "Adicionar unidade" (no Explorar) ou "Abrir Montagem" no módulo (Medir/Calcular não editam a montagem) |

## Itens já cobertos por suítes existentes

| Item | Onde é testado |
|---|---|
| LAB-FOCUS-03: seleção, mover, posicionamento assistido | `tests/base-integration.cjs`, `tests/silm-mobile-mechanics.cjs` |
| LAB-FOCUS-03: adicionar e desfazer | TEST-WORKSPACE |
| LAB-FOCUS-05: câmera, projeção, zoom, enquadrar, centralizar, teclado e toque | `tests/silm-mobile-mechanics.cjs` (3 celulares), `tests/base-integration.cjs`, `tests/workspace-a11y.cjs` |
| LAB-FOCUS-07: estado da atividade e retorno | TEST-MISSION e TEST-ROUTE (painéis, etiqueta "Missão · …", "Retomar na oficina") |
| LAB-FOCUS-08: expansão, painéis sobrepostos e foco | `tests/workspace-family.cjs` ("expansão e cena estável em cinco tamanhos", "retorno/foco/teclado") |

## Diferenças de domínio (N/A)

- **Pendência da Etapa 10 — aviso "Primeira vez no laboratório?" com "Fazer o tour".** O SILM ainda não tem tour. O aviso entra quando o tour existir, para não oferecer uma ação sem destino.
- **N/A — "Montagens prontas" no estado vazio.** O SILM não tem montagens prontas na entrada atual (Etapa 9). "Tabela periódica" ocupa esse lugar, como catálogo de partida.

## Testes

`npm run test:parity` executa `tests/parity/workspace.cjs` (TEST-WORKSPACE, parte 5.1). O teste confere:

- o estado vazio nos 5 tamanhos: textos, ilustração, 3 ações com 44 px dentro da cena, etiqueta do módulo, sem rolagem lateral;
- "Abrir Montagem" abrindo a doca na aba Preparo;
- "Tabela periódica" abrindo e fechando sem iniciar investigação;
- "Começar com o cobre";
- adicionar e desfazer;
- a troca para Medir sem perder metal nem unidades, com a etiqueta atualizada e a montagem bloqueada para edição.
