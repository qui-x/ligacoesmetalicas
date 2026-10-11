# SILM 0.5.0 — Estruturas Cristalinas e Rede Metálica

**Série:** 0.5.x · **Origem executável:** SILM 0.4.0 (SHA-512 `058bc8642b93b4b8169abb88dcec9fbe0376866931d05e262e6753d73b0a1f755b4cb9658388a9795165f635c4ae181b5c0c95e6ec87d583cd395446939aa8cd`, homologada pelo autor) · **Schema científico:** 4 · **Modelo da estrutura:** 2

## Critério de aceite

> O SILM consegue transformar a montagem metálica livre em uma representação cristalográfica coerente com os dados científicos do metal, incluindo CCC, CFC e HC, célula unitária, rede extensa e vizinhança, sem representar a ligação metálica como pares isolados e sem antecipar o modelo de elétrons deslocalizados.

## O que esta versão implementa

| Responsabilidade da série 0.5.x | Onde |
|---|---|
| Estrutura cristalina formal no scientificState | `structure.mode` e `structure.crystallography` (`state.js`, schema 4) |
| CCC/BCC, CFC/FCC e HC/HCP | `SILM.crystal.models` (`crystal.js`) |
| Célula unitária e rede extensa | `crystal-view.js`: vistas Célula e Rede, contorno tracejado, rede SVG esmaecida |
| Posições cristalográficas | sítios expandidos do banco (operações de simetria) e conferidos com o modelo |
| Vizinhança e coordenação | `geometry.neighbors()` em 3D a partir dos parâmetros tabelados; destaque sem ligações |
| Transformação da montagem livre | **Organizar estrutura**, com unidades reaproveitadas e célula completada (`crystallographic`) |
| Indicação da estrutura de referência | painéis Ver (Observar) e Dados (Tabela), com fonte e condição |
| Persistência, reload e offline | estado único no namespace SILM; representação persistida |
| Suporte aos metais homologados | 34 metais (9 CCC, 12 CFC, 13 HC) |
| Limitações explícitas | 9 metais indisponíveis com motivo estruturado; investigação e montagem livre preservadas |

## Decisões registradas

1. **Elegibilidade cristalográfica separada** da elegibilidade de investigação, calculada do banco a cada uso (`SILM.crystal.eligibility`).
2. **Dados do banco como fonte única:** tipo, grupo espacial, parâmetros e sítios. Os sítios assimétricos são expandidos pelas operações de simetria registradas, e qualquer divergência do modelo gera `DATA_CONFLICT`.
3. **HC com origem num átomo da camada A**, convenção de livros-texto equivalente aos sítios 2c do banco.
4. **Autoria preservada:** unidades do estudante mantêm ID e origem; as completadas são `crystallographic`. A montagem livre fica guardada para o retorno.
5. **Representação não é ciência:** vista, camadas e seleção ficam em `crystallography.representation` e não mudam `updatedAt`.
6. **Esferas reduzidas e ângulos de vista otimizados numericamente;** sem escala física absoluta, declarada na interface.
7. **No modo cristalino não se adicionam nem movem unidades.** O Desfazer é da montagem livre, e organizar zera seu histórico.
8. **Vizinhos fora da célula** aparecem como anéis tracejados (posição do sítio, sem unidade), e a cena se reenquadra para mostrar os 8 ou 12 vizinhos inteiros.

## Correção de origem 0.1.x — paridade de família com o SIAB 1.0.0

Pedido do autor: aproximar o SILM das mecânicas do SIAB 1.0.0 (`qui-x/acidobase`).

- **Workspace Montagem / Ver / Dados.** Montagem tem as abas Resumo, Metal, Estrutura e Módulo. Ver tem Observar. Dados tem Tabela, Histórico e Relatório. No núcleo, `js/workspace/workspace.js` e `js/core/domain.js` aceitam a propriedade opcional `sources` no painel direito, que dá a cada fonte seu próprio lançador (`#workspace-right-alt`). Domínios sem `sources` funcionam como antes.
- **Histórico da investigação:** sequência cronológica de ações em Dados → Histórico, limitada a 300 entradas e reiniciada a cada investigação. Não é Caderno nem relatório.

Itens de paridade ainda pendentes (veja `PARIDADE-SIAB-1.0.0.md`): diálogo Finalizar × Encerrar, links e edição de atividades no Professor, tour, Caderno e modos de relatório. Eles entram nas séries correspondentes (0.13 a 0.15).

## Limitações do modelo

- A representação cristalográfica é um modelo didático da organização periódica do sólido metálico.
- A célula unitária representa a unidade repetitiva da rede, não uma molécula metálica independente.
- Linhas de ligação localizadas não são utilizadas porque o modelo do SILM não representa a ligação metálica como pares isolados M—M.
- A visualização desta série não inclui ainda elétrons deslocalizados.
- Parâmetros cristalográficos dependem das condições de referência registradas no banco científico.

## Revisão

A revisão multiagente planejada (quatro lentes com verificação adversarial) não pôde rodar: os subagentes atingiram o limite de uso da sessão. A revisão foi feita diretamente contra o checklist §161 e com a suíte completa de navegador. A regressão da 0.4.x revelou um problema real no celular de 320 px: a barra quebrava em duas linhas com o novo botão Organizar. Ele foi corrigido. A inspeção das capturas revelou outro: com vizinhos visíveis, parte dos vizinhos fora da célula ficava fora da cena. O enquadramento passou a incluí-los, e o item 0.5-128 confere que todos ficam dentro da cena.

## Documentos

[`ESTRUTURAS-CRISTALINAS.md`](ESTRUTURAS-CRISTALINAS.md) · [`CONTRATO-CRISTALOGRAFICO.md`](CONTRATO-CRISTALOGRAFICO.md) · [`SCIENTIFIC-STATE.md`](SCIENTIFIC-STATE.md) · [`COBERTURA-METAIS.md`](COBERTURA-METAIS.md) · [`RELATORIO-BUILD-TESTES-0.5.0.md`](RELATORIO-BUILD-TESTES-0.5.0.md)
