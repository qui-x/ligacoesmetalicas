# Relatório de build e testes — SILM 0.8.0

Gerado por `scripts/build-test-report.cjs` a partir das evidências desta versão.

## 1. Build e auditoria

- `npm run build`: validação do banco e do estado científico (bloqueantes), bundle, layout, service worker e cobertura.
- Auditoria (`npm run audit`): **23 aprovadas, 0 reprovadas**.

## 2. Banco científico (regressão 0.2.x)

Elementos: 118 · metais disponíveis: 43 · fontes: 77 · casos negativos recusados: 6 · busca: ok.

## 3. Estado científico

```json
{
  "schemaVersion": 6,
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
  "invalidCases": 84,
  "migrations": [
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

## 4. Navegador — todas as suítes (0.4, 0.5, 0.6, 0.7, 0.8, CONSOLE)

Chromium (Playwright 1.62.1) · 2026-10-12 · **145 aprovados, 0 reprovados** · erros de console: **0**. Após a execução completa, foram reexecutados depois de correção os itens com prefixo: 0.4-1, 0.6-VER, 0.7-VER, 0.8-10, 0.8-17, CONSOLE (resultados mesclados).

As suítes das séries anteriores rodam inteiras como regressão. Prefixo do item = série do prompt.

| Item | Teste | Resultado | Duração |
|---|---|---|---|
| 0.4-122 | Migração schema 2 (0.3.0) → schema 3 | ✅ aprovado | 1.2 s |
| 0.4-123 | Iniciar montagem cria estrutura vazia | ✅ aprovado | 0.9 s |
| 0.4-124 | Adicionar 1, 2, 5 e 10 unidades | ✅ aprovado | 1.5 s |
| 0.4-125 | Movimentar unidade no desktop (arrasto por Pointer Events) | ✅ aprovado | 2.2 s |
| 0.4-126 | Mobile: selecionar e tocar no destino, sem arrasto | ✅ aprovado | 1.0 s |
| 0.4-127 | Teclado: selecionar e reposicionar com setas | ✅ aprovado | 1.3 s |
| 0.4-128 | Prevenção de sobreposição | ✅ aprovado | 2.1 s |
| 0.4-129 | Desfazer adição | ✅ aprovado | 1.2 s |
| 0.4-130 | Desfazer movimento | ✅ aprovado | 1.4 s |
| 0.4-131 | Limpar estrutura com 10 unidades mantém o metal | ✅ aprovado | 1.7 s |
| 0.4-132 | Cancelar limpeza preserva a estrutura | ✅ aprovado | 1.3 s |
| 0.4-133 | Reset remove a estrutura e preserva o metal | ✅ aprovado | 1.3 s |
| 0.4-134 | Encerrar remove estrutura e investigação | ✅ aprovado | 1.3 s |
| 0.4-135 | Reload restaura montagem idêntica | ✅ aprovado | 2.1 s |
| 0.4-135b | Retomada direta: recarregar não exibe "Retomar sessão?" nem muda a tela | ✅ aprovado | 2.1 s |
| 0.4-136 | Navegação Laboratório → Manual/Professor/Aprender → Laboratório | ✅ aprovado | 3.7 s |
| 0.4-137 | Troca de módulo preserva a montagem | ✅ aprovado | 2.6 s |
| 0.4-138 | Troca de metal com estrutura exige confirmação | ✅ aprovado | 1.6 s |
| 0.4-139 | Offline: construir e persistir sem internet | ✅ aprovado | 3.5 s |
| 0.4-140-320 | Mobile 320 px | ✅ aprovado | 1.2 s |
| 0.4-140-360 | Mobile 360 px | ✅ aprovado | 1.1 s |
| 0.4-140-390 | Mobile 390 px | ✅ aprovado | 1.3 s |
| 0.4-141 | Landscape mobile | ✅ aprovado | 1.2 s |
| 0.4-142 | Texto em 150% | ✅ aprovado | 1.3 s |
| 0.4-143 | Alto contraste: unidades e seleção distinguíveis | ✅ aprovado | 1.3 s |
| 0.4-144 | Movimento reduzido sem perda funcional | ✅ aprovado | 1.4 s |
| 0.4-147 | Regressão 0.2.x: Tabela, banco e Área do Professor | ✅ aprovado | 31.8 s |
| 0.4-148 | Regressão 0.3.x: estado corrompido e scientificState único | ✅ aprovado | 1.7 s |
| 0.4-A11Y | Acessibilidade automatizada (axe-core) da montagem | ✅ aprovado | 2.4 s |
| 0.5-121 | Migração da 0.4.x (schema 3) sem perda da montagem | ✅ aprovado | 1.5 s |
| 0.5-122 | Cu: montagem livre → Organizar estrutura → CFC do banco | ✅ aprovado | 1.4 s |
| 0.5-123 | Fe: estrutura definida pela referência registrada (não pelo símbolo) | ✅ aprovado | 1.2 s |
| 0.5-124 | Mg: HC quando corresponde ao registro homologado | ✅ aprovado | 1.5 s |
| 0.5-125 | Metal sem estrutura suportada (Mn): investigação e montagem seguem; motivo informado | ✅ aprovado | 1.2 s |
| 0.5-126 | Mostrar/ocultar célula repetidamente sem alterar o estado científico | ✅ aprovado | 1.9 s |
| 0.5-127 | Alternar célula ↔ rede sem erro; rede extensa eficiente | ✅ aprovado | 1.9 s |
| 0.5-128 | Vizinhança: selecionar unidade e destacar vizinhos (sem ligações) | ✅ aprovado | 4.9 s |
| 0.5-129 | Voltar à montagem livre: metal permanece e posições anteriores voltam | ✅ aprovado | 1.5 s |
| 0.5-130 | Retornar ao cristalino: estado volta corretamente | ✅ aprovado | 1.7 s |
| 0.5-131 | Reload restaura a estrutura cristalina e a representação | ✅ aprovado | 2.3 s |
| 0.5-132 | Limpar estrutura cristalina: structure = null, metal permanece | ✅ aprovado | 1.5 s |
| 0.5-133 | Troca de metal nunca reaproveita a estrutura anterior | ✅ aprovado | 1.6 s |
| 0.5-134 | Offline: organizar e restaurar a estrutura sem rede | ✅ aprovado | 3.9 s |
| 0.5-135-320 | Mobile/tablet 320 | ✅ aprovado | 1.4 s |
| 0.5-135-360 | Mobile/tablet 360 | ✅ aprovado | 1.4 s |
| 0.5-135-390 | Mobile/tablet 390 | ✅ aprovado | 1.5 s |
| 0.5-135-landscape | Mobile/tablet landscape | ✅ aprovado | 1.9 s |
| 0.5-135-tablet | Mobile/tablet tablet | ✅ aprovado | 1.7 s |
| 0.5-136 | Texto em 150% não cobre a rede | ✅ aprovado | 1.7 s |
| 0.5-137 | Alto contraste: célula, unidades e vizinhos distinguíveis | ✅ aprovado | 1.2 s |
| 0.5-138 | Movimento reduzido: organização instantânea e funcional | ✅ aprovado | 1.1 s |
| 0.5-PAR | Paridade SIAB: Montagem / Ver / Dados e Histórico | ✅ aprovado | 1.6 s |
| 0.5-KBD | Teclado na estrutura cristalina: percorrer, selecionar e soltar | ✅ aprovado | 1.2 s |
| 0.5-A11Y | Acessibilidade automatizada (axe-core) da estrutura cristalina | ✅ aprovado | 2.8 s |
| 0.6-109 | Migração da 0.5.x (schema 4) sem perda: estrutura, metal, investigação e representação | ✅ aprovado | 2.0 s |
| 0.6-110 | Estrutura existente → Mostrar elétrons → modelo ativo | ✅ aprovado | 1.3 s |
| 0.6-111 | Ocultar e mostrar repetidamente: modelo preservado, sem recriação inconsistente | ✅ aprovado | 2.1 s |
| 0.6-112 | Movimento: percorre a estrutura, sem órbita e sem direção predominante | ✅ aprovado | 5.6 s |
| 0.6-113 | Sem estrutura (ou com uma unidade): modelo eletrônico não pode ser ativado | ✅ aprovado | 1.4 s |
| 0.6-114 | Montagem livre: distribuição preliminar associada às unidades | ✅ aprovado | 1.3 s |
| 0.6-115 | CCC: distribuição coletiva sobre a estrutura | ✅ aprovado | 1.6 s |
| 0.6-116 | CFC: distribuição coletiva sobre a estrutura | ✅ aprovado | 1.5 s |
| 0.6-117 | HC: distribuição coletiva sobre a estrutura | ✅ aprovado | 1.6 s |
| 0.6-118 | Célula unitária: elétrons não ficam presos às bordas da célula | ✅ aprovado | 3.0 s |
| 0.6-119 | Rede extensa: a distribuição continua além da célula | ✅ aprovado | 1.7 s |
| 0.6-120 | Movimento reduzido: elétrons visíveis e estáticos, mesma informação | ✅ aprovado | 3.9 s |
| 0.6-121 | Reload: configuração eletrônica restaurada | ✅ aprovado | 3.3 s |
| 0.6-122 | Limpar estrutura: structure = null, electrons = null, metal permanece | ✅ aprovado | 1.8 s |
| 0.6-123 | Reset: sem partículas residuais | ✅ aprovado | 1.7 s |
| 0.6-124 | Troca de metal: o modelo eletrônico não migra para o novo metal | ✅ aprovado | 1.8 s |
| 0.6-125 | Aba oculta: animação pausada e retomada de forma limpa | ✅ aprovado | 2.6 s |
| 0.6-126-320 | Mobile/tablet 320 com elétrons | ✅ aprovado | 1.4 s |
| 0.6-126-360 | Mobile/tablet 360 com elétrons | ✅ aprovado | 1.4 s |
| 0.6-126-390 | Mobile/tablet 390 com elétrons | ✅ aprovado | 1.4 s |
| 0.6-126-landscape | Mobile/tablet landscape com elétrons | ✅ aprovado | 1.7 s |
| 0.6-126-tablet | Mobile/tablet tablet com elétrons | ✅ aprovado | 1.3 s |
| 0.6-127 | Desempenho: estrutura de 48 unidades com elétrons ativos | ✅ aprovado | 6.3 s |
| 0.6-128 | Alto contraste: marcadores perceptíveis | ✅ aprovado | 1.6 s |
| 0.6-129 | Visão de cores: informação identificável por forma, contorno e texto | ✅ aprovado | 2.1 s |
| 0.6-130 | Texto em 150%: controles de elétrons utilizáveis | ✅ aprovado | 1.7 s |
| 0.6-131 | Teclado: todos os controles de elétrons operáveis; marcadores fora da ordem de tabulação | ✅ aprovado | 1.7 s |
| 0.6-MOD | Módulos: Medir e Calcular mostram sem medir ou calcular elétrons; ativação só em Explorar | ✅ aprovado | 2.5 s |
| 0.6-TRANS | Transição átomo isolado → estrutura ao adicionar unidade | ✅ aprovado | 5.3 s |
| 0.6-VER | Ver → Observar: modelo eletrônico, origem conceitual, limites e Manual | ✅ aprovado | 2.6 s |
| 0.6-A11Y | Acessibilidade automatizada (axe-core) com elétrons visíveis | ✅ aprovado | 3.1 s |
| 0.7-MIG | Migração da 0.6.x (schema 5) sem perda: investigação, metal, estrutura, cristalografia e elétrons | ✅ aprovado | 2.2 s |
| 0.7-ELIG | Elegibilidade por propriedade e contexto: livre só elétrica; cristalina todas; uma por vez | ✅ aprovado | 1.6 s |
| 0.7-140 | Condutividade elétrica sem campo: movimento não direcionado | ✅ aprovado | 2.7 s |
| 0.7-141 | Aplicar campo: resposta coletiva direcional (não uniforme) | ✅ aprovado | 3.4 s |
| 0.7-142 | Remover campo: retorno ao comportamento não direcionado | ✅ aprovado | 3.8 s |
| 0.7-143 | Movimento reduzido: condutividade compreensível sem animação | ✅ aprovado | 1.6 s |
| 0.7-144 | Nenhuma experiência altera a cristalografia | ✅ aprovado | 3.9 s |
| 0.7-145 | Condutividade térmica: aquecer região e propagação qualitativa | ✅ aprovado | 5.2 s |
| 0.7-146 | Térmica: Restaurar volta ao estado-base | ✅ aprovado | 1.9 s |
| 0.7-147 | Térmica: repetição não gera fusão nem altera a estrutura | ✅ aprovado | 1.7 s |
| 0.7-148 | Maleabilidade: compressão e deslocamento coletivo das camadas | ✅ aprovado | 2.3 s |
| 0.7-149 | Maleabilidade: elétrons continuam associados à estrutura coletiva | ✅ aprovado | 2.2 s |
| 0.7-150 | Maleabilidade: Restaurar devolve a geometria original | ✅ aprovado | 2.2 s |
| 0.7-151 | Ductilidade: alongamento distinguível da maleabilidade | ✅ aprovado | 3.6 s |
| 0.7-152 | Ductilidade: Restaurar | ✅ aprovado | 2.2 s |
| 0.7-153 | Brilho metálico: incidir luz e resposta da superfície | ✅ aprovado | 1.6 s |
| 0.7-154 | Brilho com movimento reduzido: informação permanece | ✅ aprovado | 1.4 s |
| 0.7-155 | Metal sem propriedade homologada: indisponível com motivo (Mn) | ✅ aprovado | 1.2 s |
| 0.7-156 | Hg: sem deformação de sólido sem fase sólida de referência; continua classificado como metal | ✅ aprovado | 0.6 s |
| 0.7-157 | Troca de propriedade: nenhum estado residual | ✅ aprovado | 2.1 s |
| 0.7-158 | Troca de metal: nenhuma experiência antiga carregada | ✅ aprovado | 1.7 s |
| 0.7-159 | Limpar estrutura limpa as propriedades dependentes | ✅ aprovado | 2.0 s |
| 0.7-160 | Resetar investigação limpa as propriedades | ✅ aprovado | 1.8 s |
| 0.7-161 | Encerrar investigação: cleanup completo | ✅ aprovado | 2.1 s |
| 0.7-162 | Reload: experiência restaurada em estado consistente | ✅ aprovado | 3.4 s |
| 0.7-163 | Offline: experiências básicas funcionam sem rede | ✅ aprovado | 5.0 s |
| 0.7-164-320 | Mobile/tablet 320 com experiência ativa | ✅ aprovado | 1.7 s |
| 0.7-164-360 | Mobile/tablet 360 com experiência ativa | ✅ aprovado | 1.6 s |
| 0.7-164-390 | Mobile/tablet 390 com experiência ativa | ✅ aprovado | 1.7 s |
| 0.7-164-landscape | Mobile/tablet landscape com experiência ativa | ✅ aprovado | 2.1 s |
| 0.7-164-tablet | Mobile/tablet tablet com experiência ativa | ✅ aprovado | 1.7 s |
| 0.7-165 | Acessibilidade: teclado, foco, 150%, alto contraste e visão de cores | ✅ aprovado | 1.8 s |
| 0.7-166 | Desempenho: propriedade + estrutura + elétrons simultâneos | ✅ aprovado | 4.4 s |
| 0.7-MOD | Medir e Calcular: sem instrumentos; experiência operada em Explorar | ✅ aprovado | 2.0 s |
| 0.7-VER | Ver, Dados, relatório e Manual: interpretação curta, dados com natureza e limitações | ✅ aprovado | 3.1 s |
| 0.7-A11Y | Acessibilidade automatizada (axe-core) com experiência ativa | ✅ aprovado | 3.0 s |
| 0.8-01 | Cu: montagem → CFC → célula → rede → vizinhos → elétrons → condutividade → restaurar (fluxo integrado) | ✅ aprovado | 3.3 s |
| 0.8-02 | Fluxo não linear: elétrons e propriedade elétrica direto na montagem livre | ✅ aprovado | 1.2 s |
| 0.8-03 | Mg: HC conforme o banco e a condição | ✅ aprovado | 1.3 s |
| 0.8-04 | Fe: CCC conforme o banco e a condição | ✅ aprovado | 1.3 s |
| 0.8-05 | Metal com cristalografia indisponível: Explorar continua útil (montagem, elétrons, propriedade elétrica) | ✅ aprovado | 1.7 s |
| 0.8-06 | Propriedade indisponível: motivo visível, sem iniciar | ✅ aprovado | 1.1 s |
| 0.8-07 | Camadas: ativar e desativar sem duplicar estado (reusa célula, rede, vizinhos, elétrons e rótulos) | ✅ aprovado | 3.2 s |
| 0.8-08 | Comparação em todos os modos (derivada, somente leitura) | ✅ aprovado | 7.8 s |
| 0.8-08m | Comparação no celular: alternância A/B | ✅ aprovado | 2.1 s |
| 0.8-09 | Explorar → Medir → Calcular → Explorar preserva o estado científico | ✅ aprovado | 2.6 s |
| 0.8-10 | Ida e volta ao Manual e ao Professor preserva a investigação | ✅ aprovado | 3.5 s |
| 0.8-11 | Reload: foco, camadas e comparação restaurados; estado científico intacto | ✅ aprovado | 2.9 s |
| 0.8-11b | Representação de exploração corrompida não impede a investigação | ✅ aprovado | 1.3 s |
| 0.8-12 | Offline: Explorar integrado sem rede | ✅ aprovado | 3.6 s |
| 0.8-13-320 | Mobile/tablet 320: Ver com foco e camadas | ✅ aprovado | 1.7 s |
| 0.8-13-360 | Mobile/tablet 360: Ver com foco e camadas | ✅ aprovado | 1.6 s |
| 0.8-13-390 | Mobile/tablet 390: Ver com foco e camadas | ✅ aprovado | 2.0 s |
| 0.8-13-landscape | Mobile/tablet landscape: Ver com foco e camadas | ✅ aprovado | 2.0 s |
| 0.8-13-tablet | Mobile/tablet tablet: Ver com foco e camadas | ✅ aprovado | 1.7 s |
| 0.8-14 | Teclado: foco, camadas e comparação operáveis | ✅ aprovado | 1.7 s |
| 0.8-15 | Acessibilidade: região científica nomeada, estado das camadas, A/B semânticos; axe-core | ✅ aprovado | 4.8 s |
| 0.8-16 | Indicador de estado compacto e eventos sem registrar cada clique | ✅ aprovado | 2.1 s |
| CONSOLE | Console sem erros críticos (todas as suítes) | ✅ aprovado | 0.0 s |
| 0.8-17 | Correção de origem 0.1.x: link direto para um tópico do Manual abre o tópico | ✅ aprovado | 1.8 s |

## 5. Capturas (`docs/evidence-0.8.0/capturas/`)

- `05-desktop-movimentacao-arrasto.png`
- `m-390-camadas.png`
- `m-390-comparar-ab.png`
- `x01-observar-propriedade.png`
- `x02-camadas.png`
- `x03-comparar-propriedade.png`
- `x04-comparar-livre-cristalina.png`
- `x05-alto-contraste.png`

## 6. Checklist da versão

| Teste obrigatório (§25) | Situação | Evidência |
|---|---|---|
| 1. Cu: montagem → CFC → célula → rede → vizinhos → elétrons → condutividade → restaurar | ✅ | item 0.8-01 |
| 2. Mg: HC | ✅ | item 0.8-03 |
| 3. Fe: estrutura conforme banco e condição | ✅ | item 0.8-04 |
| 4. metal com cristalografia indisponível | ✅ | item 0.8-05 (Mn) |
| 5. propriedade indisponível | ✅ | item 0.8-06 (Sn) |
| 6. ativação/desativação de camadas | ✅ | item 0.8-07 |
| 7. comparação em todos os modos suportados | ✅ | itens 0.8-08 e 0.8-08m |
| 8. Explorar → Medir → Calcular → Explorar preservando estado | ✅ | item 0.8-09 |
| 9. ida e volta ao Manual/Professor | ✅ | item 0.8-10 |
| 10. reload | ✅ | itens 0.8-11 e 0.8-11b |
| 11. offline | ✅ | item 0.8-12 |
| 12. mobile | ✅ | itens 0.8-13 (320, 360, 390, paisagem e tablet) e 0.8-08m |
| 13. teclado | ✅ | item 0.8-14 |
| 14. acessibilidade | ✅ | item 0.8-15 (axe-core na cena e na comparação) |
| 15. regressões 0.2.x a 0.7.x | ✅ | suítes s040 a s070 completas |
| 16. build PASS; 17. console sem erros críticos | ✅ | `npm run build`; item CONSOLE |
| sem estados paralelos; schema inalterado | ✅ | auditoria; item 0.8-11 (schema 6) |
| fluxo não linear | ✅ | item 0.8-02 |
| correção de origem: link direto para tópico do Manual | ✅ | item 0.8-17; integração declarada na auditoria |

## 7. Limites desta homologação

- Executado somente em **Chromium**; o ambiente não tem Firefox nem WebKit. Gecko e WebKit pertencem à homologação técnica.
- Mobile, toque, 150% de fonte, alto contraste e movimento reduzido foram **emulados**. Aparelhos físicos, leitor de tela real, projetor e impressão física requerem verificação manual.
- O offline foi testado com service worker real em `localhost`, desconectando o contexto do navegador.
