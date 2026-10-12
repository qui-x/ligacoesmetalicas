# Relatório de build e testes — SILM 0.5.0

Gerado por `scripts/build-test-report.cjs` a partir das evidências desta versão.

## 1. Build e auditoria

- `npm run build`: validação do banco e do estado científico (bloqueantes), bundle, layout, service worker e cobertura.
- Auditoria (`npm run audit`): **18 aprovadas, 0 reprovadas**.

## 2. Banco científico (regressão 0.2.x)

Elementos: 118 · metais disponíveis: 43 · fontes: 77 · casos negativos recusados: 6 · busca: ok.

## 3. Estado científico

```json
{
  "schemaVersion": 4,
  "structureModelVersion": 2,
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
  "invalidCases": 51,
  "migrations": [
    "3 → 4 (montagem preservada)",
    "2 → 4",
    "1 → 4"
  ],
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

## 4. Navegador — todas as suítes (0.4, 0.5, CONSOLE)

Chromium (Playwright 1.62.1) · 2026-10-11 · **55 aprovados, 0 reprovados** · erros de console: **0**.

As suítes das séries anteriores rodam inteiras como regressão. Prefixo do item = série do prompt.

| Item | Teste | Resultado | Duração |
|---|---|---|---|
| 0.4-122 | Migração schema 2 (0.3.0) → schema 3 | ✅ aprovado | 1.2 s |
| 0.4-123 | Iniciar montagem cria estrutura vazia | ✅ aprovado | 0.8 s |
| 0.4-124 | Adicionar 1, 2, 5 e 10 unidades | ✅ aprovado | 1.5 s |
| 0.4-125 | Movimentar unidade no desktop (arrasto por Pointer Events) | ✅ aprovado | 1.9 s |
| 0.4-126 | Mobile: selecionar e tocar no destino, sem arrasto | ✅ aprovado | 1.0 s |
| 0.4-127 | Teclado: selecionar e reposicionar com setas | ✅ aprovado | 1.3 s |
| 0.4-128 | Prevenção de sobreposição | ✅ aprovado | 2.0 s |
| 0.4-129 | Desfazer adição | ✅ aprovado | 1.0 s |
| 0.4-130 | Desfazer movimento | ✅ aprovado | 1.2 s |
| 0.4-131 | Limpar estrutura com 10 unidades mantém o metal | ✅ aprovado | 1.6 s |
| 0.4-132 | Cancelar limpeza preserva a estrutura | ✅ aprovado | 1.4 s |
| 0.4-133 | Reset remove a estrutura e preserva o metal | ✅ aprovado | 1.3 s |
| 0.4-134 | Encerrar remove estrutura e investigação | ✅ aprovado | 1.3 s |
| 0.4-135 | Reload restaura montagem idêntica | ✅ aprovado | 1.9 s |
| 0.4-135b | Retomada direta: recarregar não exibe "Retomar sessão?" nem muda a tela | ✅ aprovado | 2.2 s |
| 0.4-136 | Navegação Laboratório → Manual/Professor/Aprender → Laboratório | ✅ aprovado | 3.3 s |
| 0.4-137 | Troca de módulo preserva a montagem | ✅ aprovado | 2.5 s |
| 0.4-138 | Troca de metal com estrutura exige confirmação | ✅ aprovado | 1.6 s |
| 0.4-139 | Offline: construir e persistir sem internet | ✅ aprovado | 3.4 s |
| 0.4-140-320 | Mobile 320 px | ✅ aprovado | 1.2 s |
| 0.4-140-360 | Mobile 360 px | ✅ aprovado | 1.1 s |
| 0.4-140-390 | Mobile 390 px | ✅ aprovado | 1.3 s |
| 0.4-141 | Landscape mobile | ✅ aprovado | 1.1 s |
| 0.4-142 | Texto em 150% | ✅ aprovado | 1.2 s |
| 0.4-143 | Alto contraste: unidades e seleção distinguíveis | ✅ aprovado | 1.1 s |
| 0.4-144 | Movimento reduzido sem perda funcional | ✅ aprovado | 1.2 s |
| 0.4-147 | Regressão 0.2.x: Tabela, banco e Área do Professor | ✅ aprovado | 31.8 s |
| 0.4-148 | Regressão 0.3.x: estado corrompido e scientificState único | ✅ aprovado | 1.8 s |
| 0.4-A11Y | Acessibilidade automatizada (axe-core) da montagem | ✅ aprovado | 2.6 s |
| 0.5-121 | Migração da 0.4.x (schema 3) sem perda da montagem | ✅ aprovado | 1.5 s |
| 0.5-122 | Cu: montagem livre → Organizar estrutura → CFC do banco | ✅ aprovado | 2.3 s |
| 0.5-123 | Fe: estrutura definida pela referência registrada (não pelo símbolo) | ✅ aprovado | 1.7 s |
| 0.5-124 | Mg: HC quando corresponde ao registro homologado | ✅ aprovado | 2.0 s |
| 0.5-125 | Metal sem estrutura suportada (Mn): investigação e montagem seguem; motivo informado | ✅ aprovado | 1.7 s |
| 0.5-126 | Mostrar/ocultar célula repetidamente sem alterar o estado científico | ✅ aprovado | 2.2 s |
| 0.5-127 | Alternar célula ↔ rede sem erro; rede extensa eficiente | ✅ aprovado | 2.4 s |
| 0.5-128 | Vizinhança: selecionar unidade e destacar vizinhos (sem ligações) | ✅ aprovado | 6.7 s |
| 0.5-129 | Voltar à montagem livre: metal permanece e posições anteriores voltam | ✅ aprovado | 1.6 s |
| 0.5-130 | Retornar ao cristalino: estado volta corretamente | ✅ aprovado | 1.7 s |
| 0.5-131 | Reload restaura a estrutura cristalina e a representação | ✅ aprovado | 2.6 s |
| 0.5-132 | Limpar estrutura cristalina: structure = null, metal permanece | ✅ aprovado | 1.4 s |
| 0.5-133 | Troca de metal nunca reaproveita a estrutura anterior | ✅ aprovado | 1.6 s |
| 0.5-134 | Offline: organizar e restaurar a estrutura sem rede | ✅ aprovado | 3.8 s |
| 0.5-135-320 | Mobile/tablet 320 | ✅ aprovado | 1.9 s |
| 0.5-135-360 | Mobile/tablet 360 | ✅ aprovado | 1.7 s |
| 0.5-135-390 | Mobile/tablet 390 | ✅ aprovado | 2.3 s |
| 0.5-135-landscape | Mobile/tablet landscape | ✅ aprovado | 2.0 s |
| 0.5-135-tablet | Mobile/tablet tablet | ✅ aprovado | 2.1 s |
| 0.5-136 | Texto em 150% não cobre a rede | ✅ aprovado | 2.1 s |
| 0.5-137 | Alto contraste: célula, unidades e vizinhos distinguíveis | ✅ aprovado | 1.7 s |
| 0.5-138 | Movimento reduzido: organização instantânea e funcional | ✅ aprovado | 1.1 s |
| 0.5-PAR | Paridade SIAB: Montagem / Ver / Dados e Histórico | ✅ aprovado | 3.2 s |
| 0.5-KBD | Teclado na estrutura cristalina: percorrer, selecionar e soltar | ✅ aprovado | 1.2 s |
| 0.5-A11Y | Acessibilidade automatizada (axe-core) da estrutura cristalina | ✅ aprovado | 2.6 s |
| CONSOLE | Console sem erros críticos (todas as suítes) | ✅ aprovado | 0.0 s |

## 5. Capturas (`docs/evidence-0.5.0/capturas/`)

- `01-cfc-modal-organizar.png`
- `02-cfc-celula.png`
- `03-ccc-celula.png`
- `04-hc-celula.png`
- `05-desktop-movimentacao-arrasto.png`
- `05-metal-sem-suporte.png`
- `06-cfc-celula-oculta.png`
- `07-cfc-rede-extensa.png`
- `08-cfc-vizinhos.png`
- `09-ccc-vizinhos.png`
- `10-hc-vizinhos.png`
- `11-hc-rede-apos-reload.png`
- `12-fonte-150.png`
- `13-alto-contraste.png`
- `14-montagem-resumo.png`
- `15-ver-observar.png`
- `16-dados-historico.png`
- `m-320-cfc.png`
- `m-360-cfc.png`
- `m-390-cfc.png`
- `m-390-ver-observar.png`
- `m-landscape-cfc.png`
- `m-tablet-cfc.png`

## 6. Checklist da versão

| Item (§161) | Situação | Evidência |
|---|---|---|
| schema atualizado; migração da 0.4.x | ✅ | validador (3 → 4), item 0.5-121 |
| modo livre preservado; montagem livre funcional | ✅ | suíte 0.4 inteira, itens 0.5-125 e 0.5-129 |
| modo cristalino; CCC, CFC e HC corretos | ✅ | validador (34 metais), itens 0.5-122 a 0.5-124 |
| célula unitária; rede extensa | ✅ | itens 0.5-126 e 0.5-127 |
| vizinhança; coordenação correta | ✅ | validador (distâncias e camadas), item 0.5-128 |
| nenhum bond M—M | ✅ | itens 0.5-122 e 0.5-128 (só arestas da célula), auditoria |
| dados vêm do banco; condição respeitada | ✅ | `crystal.js` (expansão de simetria), item 0.5-123 |
| metal não suportado sem estrutura falsa; elegibilidade separada | ✅ | validador (Mn), item 0.5-125, `COBERTURA-METAIS.md` |
| retorno livre ↔ cristalino | ✅ | itens 0.5-129 e 0.5-130 |
| persistência, reload e offline | ✅ | itens 0.5-131 e 0.5-134 |
| mobile, teclado e acessibilidade | ✅ | itens 0.5-135-*, 0.5-KBD e 0.5-A11Y |
| reduced motion | ✅ | item 0.5-138 |
| nenhum elétron, propriedade, medição ou cálculo | ✅ | validador (`electrons === null`, medidas e cálculos vazios), auditoria |
| build passa; console limpo | ✅ | seção 1; teste CONSOLE |

## 7. Limites desta homologação

- Executado somente em **Chromium**; o ambiente não tem Firefox nem WebKit. Gecko e WebKit pertencem à homologação técnica.
- Mobile, toque, 150% de fonte, alto contraste e movimento reduzido foram **emulados**. Aparelhos físicos, leitor de tela real, projetor e impressão física requerem verificação manual.
- O offline foi testado com service worker real em `localhost`, desconectando o contexto do navegador.
