# Build e testes — SILM 0.15.2

Data: 26/10/2026. Escopo: primeira rodada de paridade operacional das docas com a Base SI 0.9.17 e o SIAB 1.0.0.

## Ambiente e comandos

Node.js 24.22.1, Playwright 1.62.1 e Chromium headless 153.0.8010.0. O executável Chromium foi informado por `SILM_CHROMIUM`; os argumentos de execução habilitam a execução local e a renderização por SwiftShader. As verificações ocorreram por servidor HTTP em localhost, com service worker real nos testes offline.

| Verificação | Resultado |
| --- | --- |
| `npm run build` | Aprovado: banco, estado, bundle, layout, HTML integrado, verificação do snapshot, cache e cobertura |
| `npm test` | Aprovado: suites científicas, roteiros, temas/missões e regressão da interface integrada |
| `npm run test:a11y` | Aprovado: 18 cenários, zero violações automáticas nos escopos analisados |
| `git diff --check` e análise de sintaxe dos novos scripts | Aprovados |

## Fluxos verificados

- Banco de 118 elementos, 57 metais elegíveis, 90 fontes e rejeições de dados inválidos.
- Estado científico no schema 8, com 101 casos inválidos, migrações e cálculos de referência para Cu, Fe e Mg.
- Montagem, movimentação por teclado, Desfazer, organização, célula/rede, projeções, câmeras 2D/3D e elétrons.
- Seleção de módulo em Montagem, cartões e identificação do módulo ativo, preservação do foco em controles recriados.
- Famílias de Ver por capacidade do módulo, catálogo/detalhe, retorno ao item, setas, Escape e expansão/restauração do painel.
- Dados do metal/fontes, medições/cálculos, arquivos JSON, retorno de foco e navegação sem mudança científica.
- Cena estável, ausência de transbordamento horizontal e folhas móveis em 320×640, 390×844, 844×390, 1024×768 e 1440×1000; suíte anterior também verifica 768 px.
- Instrumentos, unidades, fórmulas, dados tabelados, medidas do modelo, entradas com vírgula decimal e rejeição de valores negativos nos modelos CFC, CCC e HC.
- Cinco propriedades qualitativas e preservação dos sítios científicos.
- Cinco roteiros e seis missões: módulos restritos, critérios de conclusão, retomada, restauração da investigação livre, registros e relatório.
- Sete temas, tabela periódica do Professor, Caderno com JSON/CSV e referência reabrível a relatório arquivado em somente leitura.
- Persistência após recarga, importação acima de 8 KB, rejeição de arquivo inválido e preservação de sessão anterior.
- Uso offline da entrada principal, dos catálogos e das atividades; impressão em modo de mídia emulado.
- Ausência de exceções capturadas nos fluxos e de recursos indisponíveis na verificação da entrada principal.

## Acessibilidade automática

`tests/workspace-a11y.cjs` executa axe-core nas docas Montagem/Módulo, Ver/Elétrons e Dados/Dados do metal, em 390 e 1440 px, nos temas claro, escuro e alto contraste. As regras analisadas pertencem às tags WCAG 2 A/AA e 2.1 A/AA. Resultado: **18 cenários, zero violações reportadas**.

Evidência: [WORKSPACE-A11Y.json](evidence-0.15.2/WORKSPACE-A11Y.json). Para regenerar: `SILM_A11Y_EVIDENCE=docs/evidence-0.15.2/WORKSPACE-A11Y.json npm run test:a11y`, informando o executável de navegador quando necessário.

## Limites

A evidência desta rodada é de Chromium, com viewport, teclado, temas e impressão emulados. Firefox, WebKit/Safari, leitores de tela reais, toque em aparelhos físicos, impressão física e instalação PWA real precisam de homologação própria. A verificação automática de acessibilidade cobre os componentes e os estados indicados; ela não certifica toda a aplicação.

A equivalência integral com a Base/SIAB continua aberta conforme o [mapa de paridade](PARIDADE-BASE-SI-0.15.2.md), em especial Professor, histórico cronológico, falhas de persistência, conflitos entre abas e distribuição standalone.
