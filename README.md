# SILM 0.12.0 — A Arquitetura dos Metais

**Simulador Interativo de Ligações Metálicas.** Esta versão mantém o banco científico (0.2.x) e a investigação persistente de um metal (0.3.x), a montagem manual da estrutura metálica (0.4.x), as estruturas cristalinas (0.5.x), o modelo eletrônico com elétrons deslocalizados (0.6.x), as propriedades metálicas (0.7.x), o módulo **Explorar** (0.8.x), o módulo **Medir** (0.9.x) e acrescenta o módulo **Calcular**: em **Ver → Analisar → Calcular**, obtenha o número efetivo de átomos, o volume da célula, o raio a partir do parâmetro (e o inverso), o fator de empacotamento, a densidade teórica e, no HC, a razão c/a. Cada entrada mostra a origem (dado tabelado, medida do modelo, valor informado ou calculado pelo SILM) e os registros ficam em **Dados → Cálculos**. Monte com **+ Adicionar unidade** e use **Organizar estrutura**: o SILM reorganiza a montagem segundo a estrutura de referência do banco (CCC, CFC ou HC), com célula unitária, rede extensa e vizinhança. O Laboratório usa os painéis **Montagem, Ver e Dados**, da mesma família do SIAB.

Desde a 0.10.1, o SILM usa a gramática de interação da família de simuladores: a mesma forma de usar, com o núcleo da Base Estrutural 0.3.1 adotado sem alteração. Veja `docs/SILM-0.10.1.md`.

Na 0.11.0, a cena ganhou um renderizador 2D comum. Há controles da vista (aproximar, afastar, enquadrar, centralizar, restaurar), projeções Isométrica, Frontal, Superior e Lateral, e a garantia de que a vista nunca muda a ciência: as medidas são as mesmas com qualquer zoom. Veja `docs/SILM-0.11.0.md`.

Na 0.12.0, a estrutura cristalina também pode ser vista em 3D: a mesma estrutura, em ångström, girada por uma câmera de órbita, com perspectiva ou ortográfica e os planos XY, XZ e YZ. Medições e cálculos dão os mesmos valores no 2D e no 3D. Veja `docs/SILM-0.12.0.md`.

## Integração com a base atual

A entrada [SILM sobre a Base Demo SI 0.9.8](integracao/index.html) conecta a exploração científica e a representação 2D/3D à navegação e às docas da base atual. A sessão é separada da distribuição completa. Medir, Calcular, propriedades e relatórios continuam nesta distribuição principal enquanto a migração avança. Consulte [as instruções e os limites da integração](integracao/README.md).

## Usar

Sirva esta pasta por HTTP ou HTTPS (por exemplo, `python3 -m http.server 8080`) e abra `http://localhost:8080`. Abrir o `index.html` como arquivo não prepara o uso offline.

## Construir e testar

| Comando | O que faz |
|---|---|
| `npm install` | instala as ferramentas de teste (Playwright e axe-core) |
| `npm run build` | valida o banco e o estado científico (bloqueante) e gera bundle, layout e service worker |
| `npm run test:scientific` | regressão do banco (118 elementos, 43 metais) e validador do estado (schema 8) |
| `npm run test:browser` | todas as suítes de navegador (séries anteriores como regressão), com evidências em `docs/evidence-<versão>/` |
| `node scripts/build-test-report.cjs` | gera o relatório de testes da versão |
| `python3 -I scripts/finalize.py` | fecha a versão: relatório, auditoria, `SHA512SUMS.txt`, ZIP e SHA-512, com conferência |
| `npm run audit` | auditoria da distribuição e do núcleo herdado |

Sem o navegador do Playwright instalado, defina `SILM_CHROMIUM` com o caminho de um Chromium.

## Estrutura

| Caminho | Finalidade |
|---|---|
| `index.html`, `a11y.js`, `css/`, `js/` | núcleo herdado da Base Estrutural 0.2.4 |
| `domain/silm/` | domínio SILM: banco, estado, montagem, Tabela, Manual, identidade |
| `domain/silm/assembly.js` | contrato da cena e assistência de posicionamento |
| `domain/silm/assembly-view.js`, `assembly.css` | representação 2D da montagem |
| `domain/silm/crystal.js`, `crystal-view.js` | modelo cristalográfico e vista de célula/rede |
| `domain/silm/electron-view.js` | camada eletrônica qualitativa (canvas) e seus controles |
| `domain/silm/properties.js`, `property-view.js` | propriedades: elegibilidade, dados, experiências e controles |
| `domain/silm/exploration.js` | Explorar: foco, camadas, comparação derivada |
| `domain/silm/measurements.js`, `measure-view.js` | Medir: medidas do modelo, unidades, cota e marcadores |
| `domain/silm/calculations.js` | Calcular: constantes, catálogo de fórmulas, conversões e validação dos cálculos |
| `domain/silm/abertura/`, `abertura.js` | abertura oficial (pacote do autor) e adaptador da família |
| `domain/silm/state.js` | `scientificState` único (schema 8) |
| `scripts/` | validação, build e auditoria |
| `tests/` | testes do banco e do navegador |
| `docs/` | documentação, evidências e relatórios |

## Documentação

- [SILM 0.10.0](docs/SILM-0.10.0.md) · [Módulo Calcular](docs/MODULO-CALCULAR.md) · [Contrato dos cálculos](docs/CONTRATO-CALCULOS.md) · [Fórmulas cristalográficas](docs/FORMULAS-CRISTALOGRAFICAS.md) · [Constantes científicas](docs/CONSTANTES-CIENTIFICAS.md)
- [SILM 0.9.1](docs/SILM-0.9.1.md) (correção de homologação: cena prioritária no celular e no tablet)
- [SILM 0.9.0](docs/SILM-0.9.0.md) · [Módulo Medir](docs/MODULO-MEDIR.md) · [Contrato das medições](docs/CONTRATO-MEDICOES.md) · [Instrumentos e unidades](docs/INSTRUMENTOS-E-UNIDADES.md) · [Identidade visual](docs/IDENTIDADE-VISUAL.md)
- [SILM 0.8.0](docs/SILM-0.8.0.md) · [Módulo Explorar](docs/MODULO-EXPLORAR.md) · [Contrato da exploração](docs/CONTRATO-EXPLORACAO.md)
- [SILM 0.7.0](docs/SILM-0.7.0.md) · [Propriedades metálicas](docs/PROPRIEDADES-METALICAS.md) · [Contrato das propriedades](docs/CONTRATO-PROPRIEDADES.md) · [Fontes e proveniência](docs/FONTES-E-PROVENIENCIA.md)
- [SILM 0.6.0](docs/SILM-0.6.0.md) · [Modelo eletrônico](docs/MODELO-ELETRONICO.md) · [Limitações do modelo eletrônico](docs/LIMITACOES-MODELO-ELETRONICO.md)
- [SILM 0.5.0](docs/SILM-0.5.0.md) · [Estruturas cristalinas](docs/ESTRUTURAS-CRISTALINAS.md) · [Contrato cristalográfico](docs/CONTRATO-CRISTALOGRAFICO.md) · [Cobertura dos metais](docs/COBERTURA-METAIS.md)
- [SILM 0.4.0](docs/SILM-0.4.0.md) · [Montagem da estrutura metálica](docs/MONTAGEM-ESTRUTURA-METALICA.md) · [Estado científico (schema 7)](docs/SCIENTIFIC-STATE.md)
- [Investigação](docs/INVESTIGACAO.md) · [Arquitetura científica](docs/ARQUITETURA-CIENTIFICA.md) · [Roadmap](docs/ROADMAP-SILM.md) · [Contrato de versionamento](docs/CONTRATO-VERSIONAMENTO.md)
- [Paridade com o SIAB 1.0.0](docs/PARIDADE-SIAB-1.0.0.md) · [Relatório de build e testes](docs/RELATORIO-BUILD-TESTES-0.10.0.md) · [Registro de alterações](CHANGELOG.md)

Licença: GNU GPL v3 (`LICENSE`).
