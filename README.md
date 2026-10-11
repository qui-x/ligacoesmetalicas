# SILM 0.4.0 — A Arquitetura dos Metais

**Simulador Interativo de Ligações Metálicas.** Esta versão mantém o banco científico (0.2.x) e a investigação persistente de um metal (0.3.x), e acrescenta a **montagem manual da estrutura metálica**. Com um metal ativo, use **Iniciar montagem** e **+ Adicionar unidade**. Depois selecione e mova as unidades por arrasto, por toque no destino ou pelas setas do teclado. A montagem é uma representação didática: ainda não é uma rede cristalina (série 0.5.x).

## Usar

Sirva esta pasta por HTTP ou HTTPS (por exemplo, `python3 -m http.server 8080`) e abra `http://localhost:8080`. Abrir o `index.html` como arquivo não prepara o uso offline.

## Construir e testar

| Comando | O que faz |
|---|---|
| `npm install` | instala as ferramentas de teste (Playwright e axe-core) |
| `npm run build` | valida o banco e o estado científico (bloqueante) e gera bundle, layout e service worker |
| `npm run test:scientific` | regressão do banco (118 elementos, 43 metais) e validador do estado (schema 3) |
| `npm run test:040` | suíte de navegador da 0.4.0, com capturas em `docs/evidence-0.4.0/` |
| `npm run audit` | auditoria da distribuição e do núcleo herdado |

Sem o navegador do Playwright instalado, defina `SILM_CHROMIUM` com o caminho de um Chromium.

## Estrutura

| Caminho | Finalidade |
|---|---|
| `index.html`, `a11y.js`, `css/`, `js/` | núcleo herdado da Base Estrutural 0.2.4 |
| `domain/silm/` | domínio SILM: banco, estado, montagem, Tabela, Manual, identidade |
| `domain/silm/assembly.js` | contrato da cena e assistência de posicionamento |
| `domain/silm/assembly-view.js`, `assembly.css` | representação 2D da montagem |
| `domain/silm/state.js` | `scientificState` único (schema 3) |
| `scripts/` | validação, build e auditoria |
| `tests/` | testes do banco e do navegador |
| `docs/` | documentação, evidências e relatórios |

## Documentação

- [SILM 0.4.0](docs/SILM-0.4.0.md) · [Montagem da estrutura metálica](docs/MONTAGEM-ESTRUTURA-METALICA.md) · [Estado científico (schema 3)](docs/SCIENTIFIC-STATE.md)
- [Investigação](docs/INVESTIGACAO.md) · [Arquitetura científica](docs/ARQUITETURA-CIENTIFICA.md) · [Roadmap](docs/ROADMAP-SILM.md) · [Contrato de versionamento](docs/CONTRATO-VERSIONAMENTO.md)
- [Paridade com o SIAB 1.0.0](docs/PARIDADE-SIAB-1.0.0.md) · [Relatório de build e testes](docs/RELATORIO-BUILD-TESTES-0.4.0.md) · [Registro de alterações](CHANGELOG.md)

A série 0.5.x (estruturas cristalinas) aguarda a homologação desta versão.

Licença: GNU GPL v3 (`LICENSE`).
