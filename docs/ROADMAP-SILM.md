# Roadmap oficial do SILM

> Reconstruído na 0.4.0 a partir do prompt mestre da 0.1.1 (seção "Roadmap oficial do SILM"). O arquivo original não constava do pacote 0.3.0 recebido. A divisão de responsabilidades é a do prompt; somente a coluna de situação foi atualizada.

## Situação

| Série | Responsabilidade | Situação |
|---|---|---|
| 0.1.x | Fundação do produto | concluída (0.1.1) |
| 0.2.x | Banco científico, fontes e seleção de metais | concluída (0.2.1) |
| 0.3.x | Estado científico e Laboratório Livre | concluída (0.3.0; homologação implícita no pedido da 0.4.x) |
| 0.4.x | Formação e montagem da estrutura metálica | concluída (0.4.0, homologada pelo autor) |
| 0.5.x | Estruturas cristalinas | 0.5.0 entregue |
| 0.6.x | Elétrons deslocalizados | 0.6.0 entregue |
| 0.7.x | Propriedades metálicas | 0.7.0 entregue |
| 0.8.x | Módulo Explorar | 0.8.0 entregue |
| 0.9.x | Módulo Medir | 0.9.0 e 0.9.1 (homologação) entregues |
| **0.10.x** | **Módulo Calcular** | **0.10.0 entregue; 0.10.1 (correção de origem: gramática da família, Base Estrutural 0.3.1)** |
| 0.11.x – 0.18.x, 1.0.0-rc.x, 1.0.0 | ver abaixo | planejadas |

---

# SILM 0.1.x
## FUNDAÇÃO DO PRODUTO

Rebase, identidade, integração com a Base, shell, navegação, módulos estruturais, marca, abertura, PWA, placeholders científicos e documentação arquitetural.

- 0.1.0 — protótipo inicial, congelado.
- 0.1.1 — rebase completo sobre a Base Estrutural 0.2.4.
- 0.1.x posteriores — somente correções da fundação, sem mecânica científica relevante.

# SILM 0.2.x
## BANCO CIENTÍFICO, FONTES E SELEÇÃO DE METAIS

Banco de metais, fontes, proveniência, Tabela Periódica, elementos habilitados/desabilitados, metal selecionado e identidade científica do elemento.

# SILM 0.3.x
## ESTADO CIENTÍFICO E LABORATÓRIO LIVRE

Estado científico central, início de investigação, metal ativo, nova investigação, limpeza, reset científico, preservação de estado e ligação com o Laboratório Livre.

# SILM 0.4.x
## FORMAÇÃO E MONTAGEM DA ESTRUTURA METÁLICA

Adicionar unidades metálicas, movimentação, posicionamento, montagem manual, organização assistida, formação coletiva, remoção/desfazer e comportamento estrutural inicial.

Regra: não representar a ligação metálica prioritariamente como pares `M—M`. O objeto central é uma estrutura extensa.

- 0.4.0 — montagem manual persistente e acessível, schema 3. Ver `SILM-0.4.0.md`.
- 0.5.0 — estruturas cristalinas CCC/CFC/HC, célula, rede, vizinhança; schema 4; paridade de workspace com o SIAB 1.0.0 (correção de origem 0.1.x). Ver `SILM-0.5.0.md`.
- 0.6.0 — modelo eletrônico qualitativo: elétrons de valência deslocalizados, movimento não direcional, mostrar/ocultar, movimento reduzido; schema 5. Ver `SILM-0.6.0.md`.
- 0.7.0 — propriedades metálicas qualitativas (condutividade elétrica e térmica, maleabilidade, ductilidade, brilho), elegibilidade por propriedade; schema 6. Ver `SILM-0.7.0.md`.
- 0.8.0 — módulo Explorar integrado: observação contextual, camadas, comparação qualitativa derivada; schema inalterado. Ver `SILM-0.8.0.md`.

# SILM 0.5.x
## ESTRUTURAS CRISTALINAS

CCC, CFC, HC, célula unitária, rede extensa, coordenação, vizinhança e organização estrutural. CCC, CFC e HC não são módulos: são estados ou estruturas científicas investigáveis dentro de Explorar, Medir e Calcular.

# SILM 0.6.x
## ELÉTRONS DESLOCALIZADOS

Modelo eletrônico, elétrons de valência, transição átomo livre → estrutura, representação coletiva, mar de elétrons, movimento, mostrar/ocultar e reduced motion. Os pontos visuais não correspondem literalmente ao número real de elétrons; registrar como representação qualitativa.

# SILM 0.7.x
## PROPRIEDADES METÁLICAS

Condutividade elétrica, condutividade térmica, maleabilidade, ductilidade, brilho metálico e outras propriedades somente após validação. Princípio: estrutura → comportamento → propriedade.

# SILM 0.8.x
## MÓDULO EXPLORAR

Manipulação livre, observação, visualizações, estrutura, elétrons, camadas, comparação e investigação qualitativa. A mecânica estrutural do módulo vem da Base.

# SILM 0.9.x
## MÓDULO MEDIR

Ferramentas de medição, distância, dimensões, parâmetro de rede quando apropriado, ângulos relevantes, vizinhança e resultados de medida. Separar "medido na representação", "dado tabelado" e "calculado".

# SILM 0.10.x
## MÓDULO CALCULAR

Relações quantitativas, coordenação, átomos efetivos por célula, relações geométricas, fator de empacotamento, densidade teórica quando suportada e demais cálculos cientificamente aprovados.

# SILM 0.11.x
## REPRESENTAÇÃO 2D

Refinamento visual de centros metálicos, rede, elétrons, camadas, seleção, destaque, interação direta e estados científicos. O 2D permanece a representação principal de trabalho.

# SILM 0.12.x
## REPRESENTAÇÃO 3D

Rede tridimensional, CCC/CFC/HC, câmera, órbita, zoom, reset, célula e exploração interna da rede quando viável. 2D e 3D consomem o mesmo estado científico.

# SILM 0.13.x
## ROTEIROS EXPERIMENTAIS

Conteúdo científico dos roteiros, estados iniciais, procedimentos, restrições, objetivos e relação com módulos. Cada roteiro pertence a um único módulo.

# SILM 0.14.x
## MISSÕES E APRENDER/TEMAS

Missões científicas, problemas, objetivos, validação, Temas e relações entre conteúdo, roteiro e missão. Sem score, ranking, XP, estrelas, medalhas ou porcentagem gamificada; "Concluído" é permitido, e os itens continuam refazíveis.

# SILM 0.15.x
## MANUAL, PROFESSOR, RELATÓRIO E CONTEÚDO PEDAGÓGICO

Conteúdo definitivo do Manual, conteúdo conceitual e operacional, limitações do modelo, Área do Professor, recursos configuráveis, relatório científico e referências.

# SILM 0.16.x
## ACESSIBILIDADE E MOBILE DAS MECÂNICAS CIENTÍFICAS

Homologar as novas mecânicas na infraestrutura existente: estrutura, elétrons, medições, cálculos, 2D, 3D, Tabela Periódica e propriedades.

# SILM 0.17.x
## VALIDAÇÃO CIENTÍFICA

Revisão de conceitos, dados, fontes, fórmulas, propriedades, estruturas, modelos, linguagem e limitações.

# SILM 0.18.x
## HOMOLOGAÇÃO TÉCNICA

Chromium, Gecko, WebKit, desktop, tablet, mobile, PWA, offline, storage, impressão, console, performance, regressão e lifecycle.

# SILM 1.0.0-rc.x

Integração final, correções bloqueadoras, nenhuma nova funcionalidade relevante.

# SILM 1.0.0

Versão final homologada.
