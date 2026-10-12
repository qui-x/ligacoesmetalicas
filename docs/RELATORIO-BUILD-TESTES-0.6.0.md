# Relatório de build e testes — SILM 0.6.0

Gerado por `scripts/build-test-report.cjs` a partir das evidências desta versão.

## 1. Build e auditoria

- `npm run build`: validação do banco e do estado científico (bloqueantes), bundle, layout, service worker e cobertura.
- Auditoria (`npm run audit`): **20 aprovadas, 0 reprovadas**.

## 2. Banco científico (regressão 0.2.x)

Elementos: 118 · metais disponíveis: 43 · fontes: 77 · casos negativos recusados: 6 · busca: ok.

## 3. Estado científico

```json
{
  "schemaVersion": 5,
  "structureModelVersion": 2,
  "electronModelVersion": 1,
  "geometry": {
    "supported": {
      "BCC": 9,
      "FCC": 12,
      "HCP": 13
    },
    "unsupported": [
      "Mn:CRYSTAL_STRUCTURE_UNSUPPORTED",
      "Sn:CRYSTAL_STRUCTURE_UNSUPPORTED",
      "La:CRYSTAL_STRUCTURE_UNSUPPORTED",
      "Pr:CRYSTAL_STRUCTURE_UNSUPPORTED",
      "Nd:CRYSTAL_STRUCTURE_UNSUPPORTED",
      "Sm:CRYSTAL_STRUCTURE_UNSUPPORTED",
      "Bi:CRYSTAL_STRUCTURE_UNSUPPORTED",
      "Np:CRYSTAL_STRUCTURE_UNSUPPORTED",
      "Pu:CRYSTAL_STRUCTURE_UNSUPPORTED"
    ]
  },
  "invalidCases": 69,
  "migrations": [
    "4 → 5 (estrutura e representação preservadas)",
    "3 → 5 (montagem preservada)",
    "2 → 5",
    "1 → 5"
  ],
  "electrons": {
    "requiresUnits": 2,
    "visibilityIsRepresentation": true,
    "markersPersisted": false,
    "droppedBelowMinimum": true,
    "clearedWithStructure": true,
    "valenceConvention": "banco (QUALITATIVE)"
  },
  "organize": {
    "Cu": "FCC",
    "Fe": "BCC",
    "Mg": "HCP",
    "Mn": "CRYSTAL_STRUCTURE_UNSUPPORTED"
  },
  "authorshipPreserved": true,
  "representationIsNotScience": true,
  "returnToFree": true,
  "undoHistoryPersisted": false
}
```

## 4. Navegador — todas as suítes (0.4, 0.5, 0.6, CONSOLE)

Chromium (Playwright 1.62.1) · 2026-10-12 · **86 aprovados, 0 reprovados** · erros de console: **0**.

As suítes das séries anteriores rodam inteiras como regressão. Prefixo do item = série do prompt.

| Item | Teste | Resultado | Duração |
|---|---|---|---|
| 0.4-122 | Migração schema 2 (0.3.0) → schema 3 | ✅ aprovado | 1.2 s |
| 0.4-123 | Iniciar montagem cria estrutura vazia | ✅ aprovado | 0.8 s |
| 0.4-124 | Adicionar 1, 2, 5 e 10 unidades | ✅ aprovado | 1.6 s |
| 0.4-125 | Movimentar unidade no desktop (arrasto por Pointer Events) | ✅ aprovado | 2.2 s |
| 0.4-126 | Mobile: selecionar e tocar no destino, sem arrasto | ✅ aprovado | 1.1 s |
| 0.4-127 | Teclado: selecionar e reposicionar com setas | ✅ aprovado | 1.3 s |
| 0.4-128 | Prevenção de sobreposição | ✅ aprovado | 1.9 s |
| 0.4-129 | Desfazer adição | ✅ aprovado | 1.1 s |
| 0.4-130 | Desfazer movimento | ✅ aprovado | 1.3 s |
| 0.4-131 | Limpar estrutura com 10 unidades mantém o metal | ✅ aprovado | 1.6 s |
| 0.4-132 | Cancelar limpeza preserva a estrutura | ✅ aprovado | 1.3 s |
| 0.4-133 | Reset remove a estrutura e preserva o metal | ✅ aprovado | 1.3 s |
| 0.4-134 | Encerrar remove estrutura e investigação | ✅ aprovado | 1.2 s |
| 0.4-135 | Reload restaura montagem idêntica | ✅ aprovado | 1.9 s |
| 0.4-135b | Retomada direta: recarregar não exibe "Retomar sessão?" nem muda a tela | ✅ aprovado | 2.1 s |
| 0.4-136 | Navegação Laboratório → Manual/Professor/Aprender → Laboratório | ✅ aprovado | 3.3 s |
| 0.4-137 | Troca de módulo preserva a montagem | ✅ aprovado | 2.4 s |
| 0.4-138 | Troca de metal com estrutura exige confirmação | ✅ aprovado | 1.5 s |
| 0.4-139 | Offline: construir e persistir sem internet | ✅ aprovado | 3.3 s |
| 0.4-140-320 | Mobile 320 px | ✅ aprovado | 1.1 s |
| 0.4-140-360 | Mobile 360 px | ✅ aprovado | 1.2 s |
| 0.4-140-390 | Mobile 390 px | ✅ aprovado | 1.2 s |
| 0.4-141 | Landscape mobile | ✅ aprovado | 1.1 s |
| 0.4-142 | Texto em 150% | ✅ aprovado | 1.1 s |
| 0.4-143 | Alto contraste: unidades e seleção distinguíveis | ✅ aprovado | 1.1 s |
| 0.4-144 | Movimento reduzido sem perda funcional | ✅ aprovado | 1.3 s |
| 0.4-147 | Regressão 0.2.x: Tabela, banco e Área do Professor | ✅ aprovado | 31.6 s |
| 0.4-148 | Regressão 0.3.x: estado corrompido e scientificState único | ✅ aprovado | 1.4 s |
| 0.4-A11Y | Acessibilidade automatizada (axe-core) da montagem | ✅ aprovado | 2.4 s |
| 0.5-121 | Migração da 0.4.x (schema 3) sem perda da montagem | ✅ aprovado | 1.3 s |
| 0.5-122 | Cu: montagem livre → Organizar estrutura → CFC do banco | ✅ aprovado | 1.2 s |
| 0.5-123 | Fe: estrutura definida pela referência registrada (não pelo símbolo) | ✅ aprovado | 1.1 s |
| 0.5-124 | Mg: HC quando corresponde ao registro homologado | ✅ aprovado | 1.2 s |
| 0.5-125 | Metal sem estrutura suportada (Mn): investigação e montagem seguem; motivo informado | ✅ aprovado | 1.1 s |
| 0.5-126 | Mostrar/ocultar célula repetidamente sem alterar o estado científico | ✅ aprovado | 1.6 s |
| 0.5-127 | Alternar célula ↔ rede sem erro; rede extensa eficiente | ✅ aprovado | 1.9 s |
| 0.5-128 | Vizinhança: selecionar unidade e destacar vizinhos (sem ligações) | ✅ aprovado | 4.4 s |
| 0.5-129 | Voltar à montagem livre: metal permanece e posições anteriores voltam | ✅ aprovado | 1.4 s |
| 0.5-130 | Retornar ao cristalino: estado volta corretamente | ✅ aprovado | 1.8 s |
| 0.5-131 | Reload restaura a estrutura cristalina e a representação | ✅ aprovado | 2.3 s |
| 0.5-132 | Limpar estrutura cristalina: structure = null, metal permanece | ✅ aprovado | 1.5 s |
| 0.5-133 | Troca de metal nunca reaproveita a estrutura anterior | ✅ aprovado | 1.5 s |
| 0.5-134 | Offline: organizar e restaurar a estrutura sem rede | ✅ aprovado | 3.7 s |
| 0.5-135-320 | Mobile/tablet 320 | ✅ aprovado | 1.4 s |
| 0.5-135-360 | Mobile/tablet 360 | ✅ aprovado | 1.5 s |
| 0.5-135-390 | Mobile/tablet 390 | ✅ aprovado | 1.7 s |
| 0.5-135-landscape | Mobile/tablet landscape | ✅ aprovado | 1.4 s |
| 0.5-135-tablet | Mobile/tablet tablet | ✅ aprovado | 1.4 s |
| 0.5-136 | Texto em 150% não cobre a rede | ✅ aprovado | 1.5 s |
| 0.5-137 | Alto contraste: célula, unidades e vizinhos distinguíveis | ✅ aprovado | 1.2 s |
| 0.5-138 | Movimento reduzido: organização instantânea e funcional | ✅ aprovado | 1.2 s |
| 0.5-PAR | Paridade SIAB: Montagem / Ver / Dados e Histórico | ✅ aprovado | 1.5 s |
| 0.5-KBD | Teclado na estrutura cristalina: percorrer, selecionar e soltar | ✅ aprovado | 1.2 s |
| 0.5-A11Y | Acessibilidade automatizada (axe-core) da estrutura cristalina | ✅ aprovado | 2.7 s |
| 0.6-109 | Migração da 0.5.x (schema 4) sem perda: estrutura, metal, investigação e representação | ✅ aprovado | 1.9 s |
| 0.6-110 | Estrutura existente → Mostrar elétrons → modelo ativo | ✅ aprovado | 1.8 s |
| 0.6-111 | Ocultar e mostrar repetidamente: modelo preservado, sem recriação inconsistente | ✅ aprovado | 2.3 s |
| 0.6-112 | Movimento: percorre a estrutura, sem órbita e sem direção predominante | ✅ aprovado | 5.4 s |
| 0.6-113 | Sem estrutura (ou com uma unidade): modelo eletrônico não pode ser ativado | ✅ aprovado | 1.3 s |
| 0.6-114 | Montagem livre: distribuição preliminar associada às unidades | ✅ aprovado | 1.2 s |
| 0.6-115 | CCC: distribuição coletiva sobre a estrutura | ✅ aprovado | 2.0 s |
| 0.6-116 | CFC: distribuição coletiva sobre a estrutura | ✅ aprovado | 2.0 s |
| 0.6-117 | HC: distribuição coletiva sobre a estrutura | ✅ aprovado | 1.9 s |
| 0.6-118 | Célula unitária: elétrons não ficam presos às bordas da célula | ✅ aprovado | 2.8 s |
| 0.6-119 | Rede extensa: a distribuição continua além da célula | ✅ aprovado | 2.2 s |
| 0.6-120 | Movimento reduzido: elétrons visíveis e estáticos, mesma informação | ✅ aprovado | 4.3 s |
| 0.6-121 | Reload: configuração eletrônica restaurada | ✅ aprovado | 3.4 s |
| 0.6-122 | Limpar estrutura: structure = null, electrons = null, metal permanece | ✅ aprovado | 1.7 s |
| 0.6-123 | Reset: sem partículas residuais | ✅ aprovado | 1.7 s |
| 0.6-124 | Troca de metal: o modelo eletrônico não migra para o novo metal | ✅ aprovado | 1.7 s |
| 0.6-125 | Aba oculta: animação pausada e retomada de forma limpa | ✅ aprovado | 2.5 s |
| 0.6-126-320 | Mobile/tablet 320 com elétrons | ✅ aprovado | 1.6 s |
| 0.6-126-360 | Mobile/tablet 360 com elétrons | ✅ aprovado | 1.7 s |
| 0.6-126-390 | Mobile/tablet 390 com elétrons | ✅ aprovado | 1.9 s |
| 0.6-126-landscape | Mobile/tablet landscape com elétrons | ✅ aprovado | 2.0 s |
| 0.6-126-tablet | Mobile/tablet tablet com elétrons | ✅ aprovado | 1.9 s |
| 0.6-127 | Desempenho: estrutura de 48 unidades com elétrons ativos | ✅ aprovado | 6.0 s |
| 0.6-128 | Alto contraste: marcadores perceptíveis | ✅ aprovado | 2.1 s |
| 0.6-129 | Visão de cores: informação identificável por forma, contorno e texto | ✅ aprovado | 2.4 s |
| 0.6-130 | Texto em 150%: controles de elétrons utilizáveis | ✅ aprovado | 1.6 s |
| 0.6-131 | Teclado: todos os controles de elétrons operáveis; marcadores fora da ordem de tabulação | ✅ aprovado | 1.5 s |
| 0.6-MOD | Módulos: Medir e Calcular mostram sem medir ou calcular elétrons; ativação só em Explorar | ✅ aprovado | 2.1 s |
| 0.6-TRANS | Transição átomo isolado → estrutura ao adicionar unidade | ✅ aprovado | 4.9 s |
| 0.6-VER | Ver → Observar: modelo eletrônico, origem conceitual, limites e Manual | ✅ aprovado | 2.8 s |
| 0.6-A11Y | Acessibilidade automatizada (axe-core) com elétrons visíveis | ✅ aprovado | 2.9 s |
| CONSOLE | Console sem erros críticos (todas as suítes) | ✅ aprovado | 0.0 s |

## 5. Capturas (`docs/evidence-0.6.0/capturas/`)

- `05-desktop-movimentacao-arrasto.png`
- `e01-livre-eletrons-visiveis.png`
- `e02-eletrons-ocultos.png`
- `e03-ccc-eletrons.png`
- `e04-cfc-eletrons.png`
- `e05-hc-eletrons.png`
- `e06-rede-extensa-eletrons.png`
- `e07-movimento-reduzido.png`
- `e08-alto-contraste.png`
- `e09-visao-de-cores.png`
- `e10-ver-modelo-eletronico.png`
- `m-320-eletrons.png`
- `m-360-eletrons.png`
- `m-390-eletrons.png`
- `m-landscape-eletrons.png`
- `m-tablet-eletrons.png`

## 6. Checklist da versão

| Item (§156) | Situação | Evidência |
|---|---|---|
| schema atualizado | ✅ | `SILM.scientificSchemaVersion = 5`; validador |
| migração segura | ✅ | validador (4 → 5, 3 → 5, 2 → 5, 1 → 5), item 0.6-109 |
| electrons formal | ✅ | validador (contrato e 18 estados inválidos), item 0.6-110 |
| modelo coletivo | ✅ | itens 0.6-114 a 0.6-117 (cobertura dos centros, nenhum centro concentra a nuvem) |
| nenhuma ligação M—M | ✅ | itens 0.6-115 a 0.6-117 (só arestas da célula), auditoria |
| nenhuma dupla representação de elétrons | ✅ | transição átomo → estrutura (item 0.6-TRANS); unidades sem elétrons próprios |
| valenceModel respeitado | ✅ | `electrons.source` = fontes do banco; validador (Na, Al, Fe, Cu, Au), item 0.6-VER |
| pontos declarados qualitativos | ✅ | `representationType: 'qualitative'`, legenda, Ver, Manual, relatório |
| movimento não direcionado | ✅ | item 0.6-112 (deriva média < 0,25; vários centros visitados) |
| sem corrente elétrica; sem campo aplicado; sem temperatura dinâmica | ✅ | item 0.6-MOD, auditoria (camada eletrônica sem setas nem corrente) |
| mostrar/ocultar | ✅ | itens 0.6-110 e 0.6-111 |
| movimento ligado/desligado | ✅ | itens 0.6-111, 0.6-121 e 0.6-131 |
| reduced motion; representação estática equivalente | ✅ | item 0.6-120 (sistema e preferência interna) |
| montagem livre compatível | ✅ | itens 0.6-110, 0.6-114 e 0.6-TRANS |
| CCC, CFC e HC compatíveis | ✅ | itens 0.6-115, 0.6-116 e 0.6-117 |
| célula unitária compatível | ✅ | item 0.6-118 (marcadores além do contorno) |
| rede extensa compatível | ✅ | item 0.6-119 |
| persistência; reload | ✅ | itens 0.6-110 (storage) e 0.6-121 |
| mobile | ✅ | itens 0.6-126 (320, 360, 390, paisagem e tablet) |
| acessibilidade | ✅ | itens 0.6-128 a 0.6-131 e 0.6-A11Y (axe-core) |
| performance | ✅ | item 0.6-127 (48 unidades, custo por quadro e quadros por segundo) |
| documentação de limitações | ✅ | `LIMITACOES-MODELO-ELETRONICO.md`, Ver, Manual |
| build passa; console limpo | ✅ | `npm run build`; item CONSOLE |

## 7. Limites desta homologação

- Executado somente em **Chromium**; o ambiente não tem Firefox nem WebKit. Gecko e WebKit pertencem à homologação técnica.
- Mobile, toque, 150% de fonte, alto contraste e movimento reduzido foram **emulados**. Aparelhos físicos, leitor de tela real, projetor e impressão física requerem verificação manual.
- O offline foi testado com service worker real em `localhost`, desconectando o contexto do navegador.
