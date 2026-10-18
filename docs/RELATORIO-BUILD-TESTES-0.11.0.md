# Relatório de build e testes — SILM 0.11.0

Gerado por `scripts/build-test-report.cjs` a partir das evidências desta versão.

## 1. Build e auditoria

- `npm run build`: validação do banco e do estado científico (bloqueantes), bundle, layout, service worker e cobertura.
- Auditoria (`npm run audit`): **36 aprovadas, 0 reprovadas**.

## 2. Banco científico (regressão 0.2.x)

Elementos: 118 · metais disponíveis: 43 · fontes: 78 · casos negativos recusados: 6 · busca: ok.

## 3. Estado científico

```json
{
  "schemaVersion": 8,
  "measurementTypes": [
    "distance",
    "angle",
    "latticeParameter",
    "coordination"
  ],
  "formulas": [
    "effective-atoms-bcc",
    "effective-atoms-fcc",
    "effective-atoms-hcp",
    "cell-volume-cubic",
    "cell-volume-hcp",
    "radius-from-a-bcc",
    "radius-from-a-fcc",
    "radius-from-ac-hcp",
    "a-from-radius-bcc",
    "a-from-radius-fcc",
    "packing-factor",
    "theoretical-density",
    "ca-ratio-hcp"
  ],
  "calculations": {
    "Cu": {
      "n": 4,
      "V": "47,24 Å³",
      "r": "1,278 Å",
      "FE": "0,7405",
      "rho": "8,935 g/cm³"
    },
    "Fe": {
      "n": 2,
      "V": "23,53 Å³",
      "r": "1,241 Å",
      "FE": "0,6802",
      "rho": "7,883 g/cm³"
    },
    "Mg": {
      "n": 6,
      "V": "139,4 Å³",
      "r": "1,598 Å",
      "FE": "0,7362",
      "rho": "1,737 g/cm³"
    }
  },
  "structureModelVersion": 2,
  "electronModelVersion": 1,
  "propertiesModelVersion": 1,
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
  "invalidCases": 101,
  "migrations": [
    "7 → 8 (cálculos vazios)",
    "6 → 8 (medições vazias)",
    "5 → 6 (elétrons e estrutura preservados)",
    "4 → 6 (estrutura e representação preservadas)",
    "3 → 6 (montagem preservada)",
    "2 → 6",
    "1 → 6"
  ],
  "properties": {
    "oneActive": true,
    "noResidualOnSwitch": true,
    "structureUnchanged": true,
    "restoreKeepsInvestigation": true,
    "eligibility": {
      "Cu": "todas qualitativas",
      "Mn": "só elétrica",
      "Hg": "REFERENCE_PHASE_UNSUPPORTED (sem fase sólida de referência)"
    },
    "tabulatedValues": "PROPERTY_DATA_MISSING (nenhum valor típico)"
  },
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

## 4. Navegador — todas as suítes (0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.9.1, 0.10, 0.10.1, 0.11, CONSOLE)

Chromium (Playwright 1.62.1) · 2026-10-18 · **225 aprovados, 0 reprovados** · erros de console: **0**. Após a execução completa, foram reexecutados depois de correção os itens com prefixo: 0.5-135, 0.6-126, 0.7-164, 0.8-13, 0.9-MOB, 0.4-140, 0.11-10, 0.11-22, 0.10-MOB (resultados mesclados).

As suítes das séries anteriores rodam inteiras como regressão. Prefixo do item = série do prompt.

| Item | Teste | Resultado | Duração |
|---|---|---|---|
| 0.4-122 | Migração schema 2 (0.3.0) → schema 3 | ✅ aprovado | 0.9 s |
| 0.4-123 | Iniciar montagem cria estrutura vazia | ✅ aprovado | 0.7 s |
| 0.4-124 | Adicionar 1, 2, 5 e 10 unidades | ✅ aprovado | 1.3 s |
| 0.4-125 | Movimentar unidade no desktop (arrasto por Pointer Events) | ✅ aprovado | 2.0 s |
| 0.4-126 | Mobile: selecionar e tocar no destino, sem arrasto | ✅ aprovado | 1.4 s |
| 0.4-127 | Teclado: selecionar e reposicionar com setas | ✅ aprovado | 1.3 s |
| 0.4-128 | Prevenção de sobreposição | ✅ aprovado | 2.4 s |
| 0.4-129 | Desfazer adição | ✅ aprovado | 1.9 s |
| 0.4-130 | Desfazer movimento | ✅ aprovado | 1.3 s |
| 0.4-131 | Limpar estrutura com 10 unidades mantém o metal | ✅ aprovado | 2.2 s |
| 0.4-132 | Cancelar limpeza preserva a estrutura | ✅ aprovado | 1.7 s |
| 0.4-133 | Reset remove a estrutura e preserva o metal | ✅ aprovado | 1.6 s |
| 0.4-134 | Encerrar remove estrutura e investigação | ✅ aprovado | 1.6 s |
| 0.4-135 | Reload restaura montagem idêntica | ✅ aprovado | 2.6 s |
| 0.4-135b | Retomada direta: recarregar não exibe "Retomar sessão?" nem muda a tela | ✅ aprovado | 3.0 s |
| 0.4-136 | Navegação Laboratório → Manual/Professor/Aprender → Laboratório | ✅ aprovado | 5.1 s |
| 0.4-137 | Troca de módulo preserva a montagem | ✅ aprovado | 2.4 s |
| 0.4-138 | Troca de metal com estrutura exige confirmação | ✅ aprovado | 1.6 s |
| 0.4-139 | Offline: construir e persistir sem internet | ✅ aprovado | 3.0 s |
| 0.4-140-320 | Mobile 320 px | ✅ aprovado | 1.1 s |
| 0.4-140-360 | Mobile 360 px | ✅ aprovado | 1.0 s |
| 0.4-140-390 | Mobile 390 px | ✅ aprovado | 1.1 s |
| 0.4-141 | Landscape mobile | ✅ aprovado | 1.0 s |
| 0.4-142 | Texto em 150% | ✅ aprovado | 1.1 s |
| 0.4-143 | Alto contraste: unidades e seleção distinguíveis | ✅ aprovado | 0.9 s |
| 0.4-144 | Movimento reduzido sem perda funcional | ✅ aprovado | 1.1 s |
| 0.4-147 | Regressão 0.2.x: Tabela, banco e Área do Professor | ✅ aprovado | 31.3 s |
| 0.4-148 | Regressão 0.3.x: estado corrompido e scientificState único | ✅ aprovado | 1.3 s |
| 0.4-A11Y | Acessibilidade automatizada (axe-core) da montagem | ✅ aprovado | 2.1 s |
| 0.5-121 | Migração da 0.4.x (schema 3) sem perda da montagem | ✅ aprovado | 1.2 s |
| 0.5-122 | Cu: montagem livre → Organizar estrutura → CFC do banco | ✅ aprovado | 1.2 s |
| 0.5-123 | Fe: estrutura definida pela referência registrada (não pelo símbolo) | ✅ aprovado | 1.1 s |
| 0.5-124 | Mg: HC quando corresponde ao registro homologado | ✅ aprovado | 1.2 s |
| 0.5-125 | Metal sem estrutura suportada (Mn): investigação e montagem seguem; motivo informado | ✅ aprovado | 1.1 s |
| 0.5-126 | Mostrar/ocultar célula repetidamente sem alterar o estado científico | ✅ aprovado | 1.4 s |
| 0.5-127 | Alternar célula ↔ rede sem erro; rede extensa eficiente | ✅ aprovado | 1.6 s |
| 0.5-128 | Vizinhança: selecionar unidade e destacar vizinhos (sem ligações) | ✅ aprovado | 4.2 s |
| 0.5-129 | Voltar à montagem livre: metal permanece e posições anteriores voltam | ✅ aprovado | 1.5 s |
| 0.5-130 | Retornar ao cristalino: estado volta corretamente | ✅ aprovado | 1.5 s |
| 0.5-131 | Reload restaura a estrutura cristalina e a representação | ✅ aprovado | 2.0 s |
| 0.5-132 | Limpar estrutura cristalina: structure = null, metal permanece | ✅ aprovado | 1.3 s |
| 0.5-133 | Troca de metal nunca reaproveita a estrutura anterior | ✅ aprovado | 1.4 s |
| 0.5-134 | Offline: organizar e restaurar a estrutura sem rede | ✅ aprovado | 3.3 s |
| 0.5-135-320 | Mobile/tablet 320 | ✅ aprovado | 2.0 s |
| 0.5-135-360 | Mobile/tablet 360 | ✅ aprovado | 2.0 s |
| 0.5-135-390 | Mobile/tablet 390 | ✅ aprovado | 2.1 s |
| 0.5-135-landscape | Mobile/tablet landscape | ✅ aprovado | 1.5 s |
| 0.5-135-tablet | Mobile/tablet tablet | ✅ aprovado | 2.0 s |
| 0.5-136 | Texto em 150% não cobre a rede | ✅ aprovado | 1.4 s |
| 0.5-137 | Alto contraste: célula, unidades e vizinhos distinguíveis | ✅ aprovado | 1.0 s |
| 0.5-138 | Movimento reduzido: organização instantânea e funcional | ✅ aprovado | 1.0 s |
| 0.5-PAR | Paridade SIAB: Montagem / Ver / Dados e Histórico | ✅ aprovado | 1.4 s |
| 0.5-KBD | Teclado na estrutura cristalina: percorrer, selecionar e soltar | ✅ aprovado | 1.0 s |
| 0.5-A11Y | Acessibilidade automatizada (axe-core) da estrutura cristalina | ✅ aprovado | 2.1 s |
| 0.6-109 | Migração da 0.5.x (schema 4) sem perda: estrutura, metal, investigação e representação | ✅ aprovado | 1.7 s |
| 0.6-110 | Estrutura existente → Mostrar elétrons → modelo ativo | ✅ aprovado | 1.2 s |
| 0.6-111 | Ocultar e mostrar repetidamente: modelo preservado, sem recriação inconsistente | ✅ aprovado | 1.8 s |
| 0.6-112 | Movimento: percorre a estrutura, sem órbita e sem direção predominante | ✅ aprovado | 5.2 s |
| 0.6-113 | Sem estrutura (ou com uma unidade): modelo eletrônico não pode ser ativado | ✅ aprovado | 1.2 s |
| 0.6-114 | Montagem livre: distribuição preliminar associada às unidades | ✅ aprovado | 1.1 s |
| 0.6-115 | CCC: distribuição coletiva sobre a estrutura | ✅ aprovado | 1.3 s |
| 0.6-116 | CFC: distribuição coletiva sobre a estrutura | ✅ aprovado | 1.3 s |
| 0.6-117 | HC: distribuição coletiva sobre a estrutura | ✅ aprovado | 1.3 s |
| 0.6-118 | Célula unitária: elétrons não ficam presos às bordas da célula | ✅ aprovado | 2.7 s |
| 0.6-119 | Rede extensa: a distribuição continua além da célula | ✅ aprovado | 1.5 s |
| 0.6-120 | Movimento reduzido: elétrons visíveis e estáticos, mesma informação | ✅ aprovado | 3.6 s |
| 0.6-121 | Reload: configuração eletrônica restaurada | ✅ aprovado | 2.9 s |
| 0.6-122 | Limpar estrutura: structure = null, electrons = null, metal permanece | ✅ aprovado | 1.4 s |
| 0.6-123 | Reset: sem partículas residuais | ✅ aprovado | 1.6 s |
| 0.6-124 | Troca de metal: o modelo eletrônico não migra para o novo metal | ✅ aprovado | 1.6 s |
| 0.6-125 | Aba oculta: animação pausada e retomada de forma limpa | ✅ aprovado | 2.5 s |
| 0.6-126-320 | Mobile/tablet 320 com elétrons | ✅ aprovado | 1.3 s |
| 0.6-126-360 | Mobile/tablet 360 com elétrons | ✅ aprovado | 1.2 s |
| 0.6-126-390 | Mobile/tablet 390 com elétrons | ✅ aprovado | 1.3 s |
| 0.6-126-landscape | Mobile/tablet landscape com elétrons | ✅ aprovado | 1.6 s |
| 0.6-126-tablet | Mobile/tablet tablet com elétrons | ✅ aprovado | 1.3 s |
| 0.6-127 | Desempenho: estrutura de 48 unidades com elétrons ativos | ✅ aprovado | 5.8 s |
| 0.6-128 | Alto contraste: marcadores perceptíveis | ✅ aprovado | 1.5 s |
| 0.6-129 | Visão de cores: informação identificável por forma, contorno e texto | ✅ aprovado | 1.8 s |
| 0.6-130 | Texto em 150%: controles de elétrons utilizáveis | ✅ aprovado | 1.4 s |
| 0.6-131 | Teclado: todos os controles de elétrons operáveis; marcadores fora da ordem de tabulação | ✅ aprovado | 1.2 s |
| 0.6-MOD | Módulos: Medir e Calcular mostram sem medir ou calcular elétrons; ativação só em Explorar | ✅ aprovado | 2.1 s |
| 0.6-TRANS | Transição átomo isolado → estrutura ao adicionar unidade | ✅ aprovado | 4.6 s |
| 0.6-VER | Ver → Observar: modelo eletrônico, origem conceitual, limites e Manual | ✅ aprovado | 2.1 s |
| 0.6-A11Y | Acessibilidade automatizada (axe-core) com elétrons visíveis | ✅ aprovado | 2.8 s |
| 0.7-MIG | Migração da 0.6.x (schema 5) sem perda: investigação, metal, estrutura, cristalografia e elétrons | ✅ aprovado | 2.0 s |
| 0.7-ELIG | Elegibilidade por propriedade e contexto: livre só elétrica; cristalina todas; uma por vez | ✅ aprovado | 1.6 s |
| 0.7-140 | Condutividade elétrica sem campo: movimento não direcionado | ✅ aprovado | 2.3 s |
| 0.7-141 | Aplicar campo: resposta coletiva direcional (não uniforme) | ✅ aprovado | 3.1 s |
| 0.7-142 | Remover campo: retorno ao comportamento não direcionado | ✅ aprovado | 3.5 s |
| 0.7-143 | Movimento reduzido: condutividade compreensível sem animação | ✅ aprovado | 1.4 s |
| 0.7-144 | Nenhuma experiência altera a cristalografia | ✅ aprovado | 3.2 s |
| 0.7-145 | Condutividade térmica: aquecer região e propagação qualitativa | ✅ aprovado | 5.0 s |
| 0.7-146 | Térmica: Restaurar volta ao estado-base | ✅ aprovado | 1.7 s |
| 0.7-147 | Térmica: repetição não gera fusão nem altera a estrutura | ✅ aprovado | 1.5 s |
| 0.7-148 | Maleabilidade: compressão e deslocamento coletivo das camadas | ✅ aprovado | 2.1 s |
| 0.7-149 | Maleabilidade: elétrons continuam associados à estrutura coletiva | ✅ aprovado | 2.1 s |
| 0.7-150 | Maleabilidade: Restaurar devolve a geometria original | ✅ aprovado | 2.2 s |
| 0.7-151 | Ductilidade: alongamento distinguível da maleabilidade | ✅ aprovado | 3.3 s |
| 0.7-152 | Ductilidade: Restaurar | ✅ aprovado | 2.0 s |
| 0.7-153 | Brilho metálico: incidir luz e resposta da superfície | ✅ aprovado | 1.5 s |
| 0.7-154 | Brilho com movimento reduzido: informação permanece | ✅ aprovado | 1.3 s |
| 0.7-155 | Metal sem propriedade homologada: indisponível com motivo (Mn) | ✅ aprovado | 1.0 s |
| 0.7-156 | Hg: sem deformação de sólido sem fase sólida de referência; continua classificado como metal | ✅ aprovado | 0.4 s |
| 0.7-157 | Troca de propriedade: nenhum estado residual | ✅ aprovado | 1.9 s |
| 0.7-158 | Troca de metal: nenhuma experiência antiga carregada | ✅ aprovado | 1.4 s |
| 0.7-159 | Limpar estrutura limpa as propriedades dependentes | ✅ aprovado | 1.6 s |
| 0.7-160 | Resetar investigação limpa as propriedades | ✅ aprovado | 1.6 s |
| 0.7-161 | Encerrar investigação: cleanup completo | ✅ aprovado | 1.7 s |
| 0.7-162 | Reload: experiência restaurada em estado consistente | ✅ aprovado | 3.0 s |
| 0.7-163 | Offline: experiências básicas funcionam sem rede | ✅ aprovado | 4.6 s |
| 0.7-164-320 | Mobile/tablet 320 com experiência ativa | ✅ aprovado | 1.4 s |
| 0.7-164-360 | Mobile/tablet 360 com experiência ativa | ✅ aprovado | 1.5 s |
| 0.7-164-390 | Mobile/tablet 390 com experiência ativa | ✅ aprovado | 1.6 s |
| 0.7-164-landscape | Mobile/tablet landscape com experiência ativa | ✅ aprovado | 1.7 s |
| 0.7-164-tablet | Mobile/tablet tablet com experiência ativa | ✅ aprovado | 1.5 s |
| 0.7-165 | Acessibilidade: teclado, foco, 150%, alto contraste e visão de cores | ✅ aprovado | 1.7 s |
| 0.7-166 | Desempenho: propriedade + estrutura + elétrons simultâneos | ✅ aprovado | 4.4 s |
| 0.7-MOD | Medir e Calcular: sem instrumentos; experiência operada em Explorar | ✅ aprovado | 1.8 s |
| 0.7-VER | Ver, Dados, relatório e Manual: interpretação curta, dados com natureza e limitações | ✅ aprovado | 2.4 s |
| 0.7-A11Y | Acessibilidade automatizada (axe-core) com experiência ativa | ✅ aprovado | 2.6 s |
| 0.8-01 | Cu: montagem → CFC → célula → rede → vizinhos → elétrons → condutividade → restaurar (fluxo integrado) | ✅ aprovado | 2.2 s |
| 0.8-02 | Fluxo não linear: elétrons e propriedade elétrica direto na montagem livre | ✅ aprovado | 0.9 s |
| 0.8-03 | Mg: HC conforme o banco e a condição | ✅ aprovado | 1.1 s |
| 0.8-04 | Fe: CCC conforme o banco e a condição | ✅ aprovado | 1.1 s |
| 0.8-05 | Metal com cristalografia indisponível: Explorar continua útil (montagem, elétrons, propriedade elétrica) | ✅ aprovado | 1.2 s |
| 0.8-06 | Propriedade indisponível: motivo visível, sem iniciar | ✅ aprovado | 0.9 s |
| 0.8-07 | Camadas: ativar e desativar sem duplicar estado (reusa célula, rede, vizinhos, elétrons e rótulos) | ✅ aprovado | 2.2 s |
| 0.8-08 | Comparação em todos os modos (derivada, somente leitura) | ✅ aprovado | 6.5 s |
| 0.8-08m | Comparação no celular: alternância A/B | ✅ aprovado | 1.4 s |
| 0.8-09 | Explorar → Medir → Calcular → Explorar preserva o estado científico | ✅ aprovado | 2.1 s |
| 0.8-10 | Ida e volta ao Manual e ao Professor preserva a investigação | ✅ aprovado | 2.5 s |
| 0.8-11 | Reload: foco, camadas e comparação restaurados; estado científico intacto | ✅ aprovado | 2.4 s |
| 0.8-11b | Representação de exploração corrompida não impede a investigação | ✅ aprovado | 1.0 s |
| 0.8-12 | Offline: Explorar integrado sem rede | ✅ aprovado | 3.1 s |
| 0.8-13-320 | Mobile/tablet 320: Ver com foco e camadas | ✅ aprovado | 1.3 s |
| 0.8-13-360 | Mobile/tablet 360: Ver com foco e camadas | ✅ aprovado | 1.3 s |
| 0.8-13-390 | Mobile/tablet 390: Ver com foco e camadas | ✅ aprovado | 1.4 s |
| 0.8-13-landscape | Mobile/tablet landscape: Ver com foco e camadas | ✅ aprovado | 1.5 s |
| 0.8-13-tablet | Mobile/tablet tablet: Ver com foco e camadas | ✅ aprovado | 1.3 s |
| 0.8-14 | Teclado: foco, camadas e comparação operáveis | ✅ aprovado | 1.2 s |
| 0.8-15 | Acessibilidade: região científica nomeada, estado das camadas, A/B semânticos; axe-core | ✅ aprovado | 3.2 s |
| 0.8-17 | Correção de origem 0.1.x: link direto para um tópico do Manual abre o tópico | ✅ aprovado | 1.5 s |
| 0.8-16 | Indicador de estado compacto e eventos sem registrar cada clique | ✅ aprovado | 1.7 s |
| 0.9-MIG | Migração da 0.8.x (schema 6) sem perda | ✅ aprovado | 1.7 s |
| 0.9-FREE | Montagem livre: sem escala física, sem medida absoluta | ✅ aprovado | 1.2 s |
| 0.9-DIST | CFC (Cu): distância entre vizinhos = medida do modelo, com cota (não ligação) | ✅ aprovado | 1.7 s |
| 0.9-ZOOM | Zoom e redimensionamento não alteram a dimensão científica | ✅ aprovado | 2.2 s |
| 0.9-CCC | CCC (Fe): vizinhos e parâmetro de rede conforme o banco | ✅ aprovado | 1.9 s |
| 0.9-HC | HC (Mg): parâmetros a e c como ação de medição; aresta inválida recusada | ✅ aprovado | 1.8 s |
| 0.9-ANGLE | Ângulo das coordenadas científicas, não da projeção | ✅ aprovado | 1.7 s |
| 0.9-COORD | Vizinhança: contagem visual = número de coordenação do modelo | ✅ aprovado | 3.1 s |
| 0.9-UNITS | Unidades Å, pm e nm: conversão exata; valor canônico em Å | ✅ aprovado | 1.7 s |
| 0.9-HIST | Painel Medições: rever, remover e limpar (sem limpar a estrutura) | ✅ aprovado | 2.4 s |
| 0.9-CONTEXT | Medição de estado anterior da estrutura é identificada, não alterada | ✅ aprovado | 2.3 s |
| 0.9-RELOAD | Reload: medições persistem; medição incompleta é cancelada | ✅ aprovado | 2.7 s |
| 0.9-MODULE | Troca de módulo preserva as medições; troca de metal não as herda | ✅ aprovado | 3.2 s |
| 0.9-DEFORM | Com deformação ativa, os instrumentos aguardam a estrutura de referência | ✅ aprovado | 1.8 s |
| 0.9-KBD | Fluxo completo sem mouse, com anúncios | ✅ aprovado | 1.6 s |
| 0.9-A11Y | Acessibilidade: marcadores com letra, resultado legível; axe-core | ✅ aprovado | 3.1 s |
| 0.9-VALID | Registro adulterado é recusado na restauração | ✅ aprovado | 2.5 s |
| 0.9-MOB-320 | Mobile/tablet 320: medir com toque e folha de instrumentos | ✅ aprovado | 5.6 s |
| 0.9-MOB-360 | Mobile/tablet 360: medir com toque e folha de instrumentos | ✅ aprovado | 5.7 s |
| 0.9-MOB-390 | Mobile/tablet 390: medir com toque e folha de instrumentos | ✅ aprovado | 5.6 s |
| 0.9-MOB-landscape | Mobile/tablet landscape: medir com toque e folha de instrumentos | ✅ aprovado | 1.9 s |
| 0.9-MOB-tablet | Mobile/tablet tablet: medir com toque e folha de instrumentos | ✅ aprovado | 1.6 s |
| 0.9-ID1 | Abertura oficial: monta antes do primeiro desenho, decorativa e sem artefatos | ✅ aprovado | 5.2 s |
| 0.9-ID2 | Abertura: pula com tecla (foco no conteúdo), botão e toque; termina sozinha | ✅ aprovado | 9.5 s |
| 0.9-ID3 | Abertura omitida com movimento reduzido ou preferência desligada | ✅ aprovado | 1.2 s |
| 0.9-ID4 | Marca: símbolo mestre no cabeçalho e no Sobre; ícone de aplicação no favicon e no PWA | ✅ aprovado | 1.0 s |
| 0.9-ID5 | Correção de origem: endereço inicial direto sem aviso "Tela não encontrada" | ✅ aprovado | 4.0 s |
| 0.9.1-01 | Tablet (768 px, fonte simplificada): cena prioritária, explicações recolhidas, sem linha de título repetida | ✅ aprovado | 2.2 s |
| 0.9.1-02 | Celular 360 px: notas pelo teclado; metadados em até duas linhas com texto integral no título | ✅ aprovado | 1.0 s |
| 0.9.1-05 | Celular 320/360 px: botões do cartão do elemento quebram só entre palavras | ✅ aprovado | 1.0 s |
| 0.9.1-03 | Esferas sempre redondas; símbolo sem quebra e oculto quando não cabe (fonte simplificada + espaçamento) | ✅ aprovado | 2.9 s |
| 0.9.1-04 | Desktop: notas abertas por padrão na coluna lateral; montagem livre também recolhe as instruções | ✅ aprovado | 1.9 s |
| 0.10-MIG | Migração da 0.9.x (schema 7) sem perda | ✅ aprovado | 1.6 s |
| 0.10-FREE | Sem estrutura cristalina não há cálculo absoluto; fora do módulo, convite a ativar Calcular | ✅ aprovado | 1.2 s |
| 0.10-CFC | CFC (Cu): n, V, r, FE e ρ calculados pelo catálogo, com decomposição e intermediários | ✅ aprovado | 2.2 s |
| 0.10-CCC | CCC (Fe): n = 2, r = √3·a/4 e FE = π√3/8 | ✅ aprovado | 1.9 s |
| 0.10-HC | HC (Mg): prisma hexagonal (n = 6), V = (3√3/2)a²c, c/a ≠ ideal e densidade com peso atômico em intervalo | ✅ aprovado | 1.9 s |
| 0.10-ORIGIN | Medida do modelo × referência: escolha explícita, nunca substituição silenciosa | ✅ aprovado | 2.2 s |
| 0.10-INPUT | Valor informado: número com vírgula aceito; inválido recusado com erro associado ao campo | ✅ aprovado | 2.0 s |
| 0.10-HIST | Dados → Cálculos: reabrir com fórmula, entradas e origens; remover e limpar (estrutura e medições intactas) | ✅ aprovado | 2.0 s |
| 0.10-RELOAD | Reload: cálculos persistem com proveniência; registro de estado anterior é identificado, não recalculado | ✅ aprovado | 3.1 s |
| 0.10-METAL | Troca de módulo preserva os cálculos; nova investigação (outro metal) não os herda | ✅ aprovado | 2.6 s |
| 0.10-KBD | Fluxo completo sem mouse, com anúncio do resultado | ✅ aprovado | 1.4 s |
| 0.10-A11Y | Acessibilidade: fórmulas com equivalente textual, campos rotulados; axe-core | ✅ aprovado | 2.3 s |
| 0.10-MOB-360 | Mobile 360: calcular na folha inferior com teclado numérico | ✅ aprovado | 5.3 s |
| 0.10-MOB-390 | Mobile 390: calcular na folha inferior com teclado numérico | ✅ aprovado | 5.4 s |
| 0.10-MOB-landscape | Mobile landscape: calcular na folha inferior com teclado numérico | ✅ aprovado | 1.6 s |
| 0.10.1-HOME | Página inicial editorial: "A Arquitetura dos Metais", lema, Laboratório em destaque e metas vivas | ✅ aprovado | 0.5 s |
| 0.10.1-START | Como deseja iniciar?: convite na primeira visita com cartões; um toque salva e leva ao destino | ✅ aprovado | 0.8 s |
| 0.10.1-MENU | Menu: Agora com metal e módulo; Montagens prontas; abertura em Acessibilidade, não em Recursos | ✅ aprovado | 0.9 s |
| 0.10.1-MONT | Montagem por grupos (Resumo, Metal, Estrutura, Propriedades, Módulo) e cartões de módulo numerados | ✅ aprovado | 0.6 s |
| 0.10.1-VER | Ver em famílias (Observar, Medir, Analisar) e Dados como ponto de partida, com "Dados do metal" | ✅ aprovado | 1.2 s |
| 0.10.1-PRESET | Montagens prontas: Cobre · CFC, Ferro · CCC e Magnésio · HC com a célula completa do banco | ✅ aprovado | 1.3 s |
| 0.10.1-APRENDER | Aprender em lista; Investigar no Laboratório seleciona o metal do tema (Estrutura → Fe) | ✅ aprovado | 0.5 s |
| 0.10.1-R06 | R06: a Tabela Periódica cabe na cena em várias telas; no celular, rola com dica | ✅ aprovado | 3.8 s |
| 0.10.1-TOUR | Tour do laboratório com nota de boas-vindas; cena diz MONTAGEM LIVRE / ESTRUTURA CRISTALINA | ✅ aprovado | 1.6 s |
| 0.10.1-SOM | Som e toque: linhas em Acessibilidade, desligadas por padrão; medição com a preferência ligada toca e vibra | ✅ aprovado | 2.8 s |
| 0.10.1-REV | Revisão: Dados do metal, tema que redesenha, montagem pronta com confirmação verdadeira e Calcular limpo; roteiro com os grupos do SILM e Agora com a atividade; missão por Concluir missão | ✅ aprovado | 6.7 s |
| 0.11-01 | Renderizador comum: mesma ordem central de camadas na montagem livre, no cristal e na comparação | ✅ aprovado | 1.6 s |
| 0.11-02 | Câmera padrão é a identidade; zoom, pan, enquadrar, centralizar, restaurar e projeção não tocam no estado científico | ✅ aprovado | 2.1 s |
| 0.11-03 | Invariância obrigatória: a mesma medição a 50 %, 100 % e 200 % de zoom (e em outra projeção) | ✅ aprovado | 3.1 s |
| 0.11-04 | Coordenadas: inversa exata e destino tocado com zoom e pan; resize não muda as posições | ✅ aprovado | 1.7 s |
| 0.11-05 | Gestos e teclado: arrastar o fundo desloca, Ctrl + roda aproxima no cursor, + − 0 F C e Shift + setas; câmera fora do Desfazer | ✅ aprovado | 2.2 s |
| 0.11-06 | Seleção sobrevive a zoom e pan; o anel de seleção fica na camada própria, sobre a unidade | ✅ aprovado | 2.4 s |
| 0.11-07 | Projeções: centros separados em todas as vistas; HC superior mostra o hexágono; Organizar e calor idênticos à 0.10.1 | ✅ aprovado | 13.5 s |
| 0.11-08 | Rede extensa em janela: no máximo 260 sítios desenhados, também afastando; nenhuma linha além das arestas da célula | ✅ aprovado | 2.4 s |
| 0.11-09 | Medir e Calcular: rótulos com tamanho de tela constante; Calcular não herda a medida em revisão | ✅ aprovado | 2.5 s |
| 0.11-10 | Celular: barra com alvos de 44 px dentro da tela; toque perto da unidade seleciona; pinça aproxima | ✅ aprovado | 4.2 s |
| 0.11-11 | Acessibilidade: descrição da cena atualizada no lugar, axe sem violações, redução de movimento e Leitura simples | ✅ aprovado | 3.0 s |
| 0.11-12 | Comparação com o mesmo renderizador: somente leitura, mesma projeção, planos do HC presentes | ✅ aprovado | 1.9 s |
| 0.11-13 | representationState versionado: volta ao recarregar; outra investigação começa do padrão | ✅ aprovado | 3.5 s |
| 0.11-14 | Limpeza: sem recursos acumulados ao trocar de módulo e de vista várias vezes | ✅ aprovado | 3.8 s |
| 0.11-15 | Foco fora da vista: o palco nunca rola; a câmera desloca até a unidade focada | ✅ aprovado | 2.4 s |
| 0.11-16 | Pinça que começa numa unidade não a move (o arrasto é desfeito sem escrita) | ✅ aprovado | 1.1 s |
| 0.11-17 | Arrastar a partir de uma unidade desloca a vista (cristal e montagem somente leitura) sem selecionar; Enter e clique seguem valendo | ✅ aprovado | 2.5 s |
| 0.11-18 | Elétrons estáticos na rede: aproximar e deslocar não refazem a distribuição | ✅ aprovado | 2.5 s |
| 0.11-19 | Calor em qualquer projeção: fontes marcadas (contorno tracejado) e faixa "calor" só junto delas | ✅ aprovado | 1.9 s |
| 0.11-20 | Montagem livre: toque no fundo perto da selecionada a move; clique perto seleciona uma vez; Enter depois de arrastar funciona | ✅ aprovado | 2.3 s |
| 0.11-21 | Organizar anima a partir das posições livres (sem salto inicial) | ✅ aprovado | 2.0 s |
| 0.11-22 | Vista e vizinhos fora do Histórico; câmera gravada ao recarregar logo; Vista no cabeçalho em 320 px; barra junto do palco no tablet | ✅ aprovado | 5.0 s |
| CONSOLE | Console sem erros críticos (todas as suítes) | ✅ aprovado | 0.0 s |

## 5. Capturas (`docs/evidence-0.11.0/capturas/`)

- `05-desktop-movimentacao-arrasto.png`
- `r01-cristal-controles.png`
- `r03-medida-zoom.png`
- `r07-hc-superior.png`
- `r08-rede-afastada.png`
- `r10-celular-pinca.png`
- `r12-comparacao.png`

## 6. Checklist da versão

# Checklist — SILM 0.11.0 (representação 2D científica)

| Item do prompt | Situação | Evidência |
|---|---|---|
| §2–4 Renderizador 2D comum para Explorar, Medir, Calcular e comparação | ✅ | `domain/silm/renderer-2d.js`; item 0.11-01, 0.11-12; auditoria "renderizador comum nas três cenas" |
| §3, §23 `scientificState ≠ representationState`; representationState versionado | ✅ | `domain/silm/representation.js`; itens 0.11-02, 0.11-13; auditoria |
| §5 Coordenadas científicas → cena → palco, com inversa para o toque | ✅ | item 0.11-04 (ida e volta < 10⁻¹², destino a 200 %) |
| §6 Zoom 50 %, 100 % e 200 % com medições idênticas (obrigatório) | ✅ | item 0.11-03 (2,556 Å em todos, também na projeção superior) |
| §7 Pan, zoom, enquadrar, centralizar e restaurar vista | ✅ | itens 0.11-02, 0.11-05 |
| §8 Resize e teclado virtual não movem a estrutura | ✅ | item 0.11-04 |
| §9 Centros com estilo consistente; tamanho visual ≠ raio real | ✅ | texto da cena; contrato |
| §10 Montagem livre: seleção, movimento, assistência e desfazer preservados; toque melhor | ✅ | suíte 0.4.x completa; itens 0.11-04, 0.11-10 |
| §11 CCC, CFC e HC; HC não parece cúbico deformado | ✅ | item 0.11-07 (camada B entre os centros da A na vista superior) |
| §12 Projeções frontal, superior, lateral e isométrica; medidas pela geometria | ✅ | itens 0.11-03, 0.11-07 |
| §13 Rede extensa em janela, sem rede infinita | ✅ | item 0.11-08 (≤ 260 sítios) |
| §14 Vizinhança por halo e contorno, sem barras M—M | ✅ | itens 0.5-128, 0.11-08 |
| §15 Elétrons com zoom, pan, recorte, movimento reduzido e desempenho | ✅ | suíte 0.6.x; item 0.7-149 (centros no mesmo espaço pela câmera) |
| §16 Propriedades sem motor paralelo; contratos da 0.7.x | ✅ | suíte 0.7.x; calor idêntico em todas as projeções (0.11-07) |
| §17 Medir: A/B/C, cota, arco e rótulos de instrumento | ✅ | suíte 0.9.x; item 0.11-09 |
| §18 Calcular: geometria na mesma cena (contato, arestas, a e c no HC) | ✅ | suíte 0.10.x; item 0.11-09 |
| §19 Camadas numa ordem central, sem z-index espalhado | ✅ | item 0.11-01; auditoria |
| §20 Toque central; seleção sobrevive a zoom e pan; área maior no toque; prioridade | ✅ | itens 0.11-06, 0.11-10 |
| §21 Rótulos sem excesso nem colisão; menos rótulos secundários quando não cabem | ✅ | item 0.11-09; `data-labels-fit` |
| §22 Comparação com o mesmo renderizador, sem duplicar o estado inteiro | ✅ | item 0.11-12; cópias só de metal, estrutura, elétrons e propriedades |
| §24 Desempenho e limpeza | ✅ | item 0.11-14; suíte 0.6.x (aba oculta, custo por quadro) |
| §25 Celular: toque seleciona, arrasto desloca, pinça aproxima | ✅ | item 0.11-10 (390 e 320 px) |
| §26 Acessibilidade: descrição da cena, foco, contraste, movimento reduzido, Leitura simples | ✅ | item 0.11-11 (axe sem violações) |
| §27 Regressões 0.2.x–0.10.x | ✅ | suítes s040 a s101 completas |
| §28 Documentação | ✅ | `docs/SILM-0.11.0.md`, `docs/RENDERER-2D.md`, `docs/CONTRATO-REPRESENTACAO-2D.md`; tópico do Manual "Mover a vista" |
| Nenhum dado científico alterado (schema 8); Organizar e calor idênticos à 0.10.1 | ✅ | item 0.11-07; validadores científicos |
| Núcleo = Base Estrutural 0.3.1, sem alteração local | ✅ | auditoria "Núcleo herdado preservado" |
| §29 Regra de parada: não iniciar a 0.12.0 | ✅ | nenhum renderizador 3D |
| Revisão adversarial da 0.11.0: 15 achados confirmados, todos corrigidos | ✅ | itens 0.11-15 a 0.11-22 (foco sem rolagem, pinça sobre unidade, deslocar a partir da unidade, elétrons estáveis na rede, fontes de calor em toda projeção, toque e clique perto, animação do Organizar, Histórico, gravação no `pagehide`, botão Vista em 320 px, barra no tablet, descrição da montagem livre); item 0.11-01 (zoom fora da região viva) |

## 7. Limites desta homologação

- Executado somente em **Chromium**; o ambiente não tem Firefox nem WebKit. Gecko e WebKit pertencem à homologação técnica.
- Mobile, toque, 150% de fonte, alto contraste e movimento reduzido foram **emulados**. Aparelhos físicos, leitor de tela real, projetor e impressão física requerem verificação manual.
- O offline foi testado com service worker real em `localhost`, desconectando o contexto do navegador.
